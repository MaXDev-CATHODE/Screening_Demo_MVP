import { prisma } from "@/lib/db/prisma";
import {
  DemoUser,
  MatchedField,
  PrismaScreeningStatus,
  toApiScreeningStatus
} from "@/lib/domain/types";
import { canAccessCompanyProduct } from "@/lib/auth/company-scope";
import { matchSubstance } from "@/lib/matching/matcher";
import { evaluateRule } from "@/lib/rules/evaluate";
import { selectBusinessComment } from "@/lib/screening/comments";
import { isMemoryMode, memoryProducts, memoryReferenceLists, memoryResults } from "@/lib/demo-data/memory-store";

export type ApiScreeningResult = {
  id: string;
  productId: string;
  referenceListId: string;
  status: "match" | "no match" | "verification required";
  matchedField: MatchedField;
  reason: string;
  comment: string;
  createdAt: string;
};

function serializeResult(result: {
  id: string;
  productId: string;
  referenceListId: string;
  status: PrismaScreeningStatus;
  matchedField: MatchedField;
  reason: string;
  comment: string;
  createdAt: Date;
}): ApiScreeningResult {
  return {
    ...result,
    status: toApiScreeningStatus(result.status),
    createdAt: result.createdAt.toISOString()
  };
}

export async function runScreening(user: DemoUser, productId: string, referenceListId: string) {
  if (isMemoryMode()) {
    return runMemoryScreening(user, productId, referenceListId);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { substances: true }
  });
  if (!product || !canAccessCompanyProduct(user, product.companyId)) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const referenceList = await prisma.referenceList.findUnique({
    where: { id: referenceListId },
    include: {
      items: true,
      rules: { where: { active: true } },
      businessComments: true
    }
  });
  if (!referenceList || !referenceList.active) {
    throw new Error("REFERENCE_LIST_NOT_FOUND");
  }

  let status: PrismaScreeningStatus = "NO_MATCH";
  let matchedField: MatchedField = "NONE";
  let reason = "No matching CAS, EC or sufficiently similar name was found on the selected reference list.";

  for (const substance of product.substances) {
    const match = matchSubstance(substance, referenceList.items);
    if (match.item) {
      status = "MATCH";
      matchedField = match.matchedField;
      reason = `Matched ${substance.name} against ${match.item.name ?? "reference item"} by ${match.matchedField}.`;
      break;
    }
  }

  for (const rule of referenceList.rules) {
    const conditions = rule.conditions as { productTypeEquals: typeof product.productType; concentrationGreaterThan: number };
    if (evaluateRule(product, conditions)) {
      status = rule.outcomeStatus as PrismaScreeningStatus;
      matchedField = "RULE";
      reason = `Rule "${rule.name}" matched: product type ${conditions.productTypeEquals} and concentration greater than ${conditions.concentrationGreaterThan}%.`;
      break;
    }
  }

  const comment = selectBusinessComment(referenceList.businessComments, status);
  const result = await prisma.screeningResult.create({
    data: {
      productId,
      referenceListId,
      status,
      matchedField,
      reason,
      comment
    }
  });

  return serializeResult(result);
}

export async function getScreeningResult(user: DemoUser, id: string) {
  if (isMemoryMode()) {
    const result = memoryResults.find((entry) => entry.id === id);
    const product = result ? memoryProducts.find((entry) => entry.id === result.productId) : null;
    if (!result || !product || !canAccessCompanyProduct(user, product.companyId)) return null;
    return serializeResult(result);
  }

  const result = await prisma.screeningResult.findUnique({
    where: { id },
    include: { product: true }
  });

  if (!result || !canAccessCompanyProduct(user, result.product.companyId)) {
    return null;
  }

  return serializeResult(result);
}

async function runMemoryScreening(user: DemoUser, productId: string, referenceListId: string) {
  const product = memoryProducts.find((entry) => entry.id === productId);
  if (!product || !canAccessCompanyProduct(user, product.companyId)) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const referenceList = memoryReferenceLists.find((entry) => entry.id === referenceListId && entry.active);
  if (!referenceList) throw new Error("REFERENCE_LIST_NOT_FOUND");

  let status: PrismaScreeningStatus = "NO_MATCH";
  let matchedField: MatchedField = "NONE";
  let reason = "No matching CAS, EC or sufficiently similar name was found on the selected reference list.";

  for (const substance of product.substances) {
    const match = matchSubstance(substance, referenceList.items);
    if (match.item) {
      status = "MATCH";
      matchedField = match.matchedField;
      reason = `Matched ${substance.name} against ${match.item.name ?? "reference item"} by ${match.matchedField}.`;
      break;
    }
  }

  for (const rule of referenceList.rules.filter((entry) => entry.active)) {
    if (evaluateRule(product, rule.conditions)) {
      status = rule.outcomeStatus;
      matchedField = "RULE";
      reason = `Rule "${rule.name}" matched: product type ${rule.conditions.productTypeEquals} and concentration greater than ${rule.conditions.concentrationGreaterThan}%.`;
      break;
    }
  }

  const result = {
    id: `mem-result-${Date.now()}`,
    productId,
    referenceListId,
    status,
    matchedField,
    reason,
    comment: selectBusinessComment(referenceList.businessComments, status),
    createdAt: new Date()
  };
  memoryResults.unshift(result);
  return serializeResult(result);
}
