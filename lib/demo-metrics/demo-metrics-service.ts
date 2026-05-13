import { productCompanyFilter } from "@/lib/auth/company-scope";
import { prisma } from "@/lib/db/prisma";
import { isMemoryMode, memoryProducts, memoryReferenceLists, memoryResults, memoryUsers } from "@/lib/demo-data/memory-store";
import { ApiScreeningStatus, DataQualityStatus, DemoUser, PrismaScreeningStatus, toApiScreeningStatus } from "@/lib/domain/types";

type StatusCounts = Record<ApiScreeningStatus, number>;
type QualityCounts = Record<DataQualityStatus, number>;

export type DemoMetrics = {
  role: DemoUser["role"];
  workspaceLabel: string;
  scopeLabel: string;
  companies: number;
  products: number;
  referenceLists: number;
  rules: number;
  screenings: number;
  resultTypes: number;
  resultsByStatus: StatusCounts;
  dataQuality: QualityCounts;
};

const emptyStatusCounts = (): StatusCounts => ({
  match: 0,
  "no match": 0,
  "verification required": 0
});

const emptyQualityCounts = (): QualityCounts => ({
  READY: 0,
  LIMITED: 0,
  INVALID: 0
});

function workspaceLabel(user: DemoUser) {
  return user.companyName ?? (user.role === "SUPER_ADMIN" ? "Global workspace" : "Company workspace");
}

function scopeLabel(user: DemoUser) {
  return user.role === "SUPER_ADMIN" ? "Global SaaS overview" : "Company workspace only";
}

function canSeeProduct(user: DemoUser, companyId: string) {
  return user.role === "SUPER_ADMIN" || user.companyId === companyId;
}

function countMemoryCompanies(user: DemoUser) {
  if (user.role !== "SUPER_ADMIN") return user.companyId ? 1 : 0;
  const companyIds = new Set(
    [...memoryUsers.map((entry) => entry.companyId), ...memoryProducts.map((entry) => entry.companyId)].filter(Boolean)
  );
  return Math.max(companyIds.size, 2);
}

export function getMemoryDemoMetrics(user: DemoUser): DemoMetrics {
  const products = memoryProducts.filter((product) => canSeeProduct(user, product.companyId));
  const visibleProductIds = new Set(products.map((product) => product.id));
  const results = memoryResults.filter((result) => visibleProductIds.has(result.productId));
  const resultsByStatus = emptyStatusCounts();
  const dataQuality = emptyQualityCounts();

  for (const result of results) {
    resultsByStatus[toApiScreeningStatus(result.status)] += 1;
  }

  for (const product of products) {
    dataQuality[product.dataQualityStatus] += 1;
  }

  return {
    role: user.role,
    workspaceLabel: workspaceLabel(user),
    scopeLabel: scopeLabel(user),
    companies: countMemoryCompanies(user),
    products: products.length,
    referenceLists: memoryReferenceLists.filter((list) => list.active).length,
    rules: memoryReferenceLists.reduce((total, list) => total + list.rules.filter((rule) => rule.active).length, 0),
    screenings: results.length,
    resultTypes: 3,
    resultsByStatus,
    dataQuality
  };
}

export async function getDemoMetrics(user: DemoUser): Promise<DemoMetrics> {
  if (isMemoryMode()) {
    return getMemoryDemoMetrics(user);
  }

  const productWhere = productCompanyFilter(user);
  const resultWhere =
    user.role === "SUPER_ADMIN" ? {} : { product: { companyId: user.companyId ?? "__no_company__" } };

  const [companies, products, referenceLists, rules, screenings, statusGroups, qualityGroups] = await Promise.all([
    user.role === "SUPER_ADMIN" ? prisma.company.count() : Promise.resolve(user.companyId ? 1 : 0),
    prisma.product.count({ where: productWhere }),
    prisma.referenceList.count({ where: { active: true } }),
    prisma.screeningRule.count({ where: { active: true } }),
    prisma.screeningResult.count({ where: resultWhere }),
    prisma.screeningResult.groupBy({
      by: ["status"],
      where: resultWhere,
      _count: { _all: true }
    }),
    prisma.product.groupBy({
      by: ["dataQualityStatus"],
      where: productWhere,
      _count: { _all: true }
    })
  ]);

  const resultsByStatus = emptyStatusCounts();
  const dataQuality = emptyQualityCounts();

  for (const group of statusGroups) {
    resultsByStatus[toApiScreeningStatus(group.status as PrismaScreeningStatus)] = group._count._all;
  }

  for (const group of qualityGroups) {
    dataQuality[group.dataQualityStatus as DataQualityStatus] = group._count._all;
  }

  return {
    role: user.role,
    workspaceLabel: workspaceLabel(user),
    scopeLabel: scopeLabel(user),
    companies,
    products,
    referenceLists,
    rules,
    screenings,
    resultTypes: 3,
    resultsByStatus,
    dataQuality
  };
}
