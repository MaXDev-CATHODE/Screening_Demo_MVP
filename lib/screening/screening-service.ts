import { prisma } from "@/lib/db/prisma";
import {
  DemoUser,
  MatchedField,
  ProductType,
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
  matchScore: number | null;
  reason: string;
  comment: string;
  createdAt: string;
  productName?: string;
  referenceListName?: string;
  referenceListVersion: string;
  screeningSnapshotLabel: string;
  matchedSubstance: {
    name: string;
    casNumber: string | null;
    ecNumber: string | null;
    concentrationPercent: number;
  } | null;
  matchedReferenceItem: {
    name: string | null;
    casNumber: string | null;
    ecNumber: string | null;
  } | null;
  matchedValue: string | null;
  ruleApplied: {
    id: string;
    name: string;
    productTypeEquals: string;
    concentrationGreaterThan: number;
    outcomeStatus: "match" | "no match" | "verification required";
  } | null;
  explanationRows: Array<{
    substanceName: string;
    casNumber: string | null;
    ecNumber: string | null;
    concentrationPercent: number;
    matchedField: MatchedField;
    matchScore: number | null;
    matchedValue: string | null;
    referenceItemName: string | null;
    rule: string;
    impact: string;
  }>;
};

type ScreeningSubstance = {
  name: string;
  casNumber: string | null;
  ecNumber: string | null;
  concentrationPercent: number;
};

type ScreeningReferenceItem = {
  name: string | null;
  casNumber: string | null;
  ecNumber: string | null;
};

type ScreeningRuleShape = {
  id: string;
  name: string;
  active: boolean;
  conditions: { productTypeEquals: ProductType; concentrationGreaterThan: number };
  outcomeStatus: PrismaScreeningStatus;
};

type ScreeningContext = {
  product: {
    name: string;
    productType: ProductType;
    substances: ScreeningSubstance[];
  };
  referenceList: {
    name: string;
    items: ScreeningReferenceItem[];
    rules: ScreeningRuleShape[];
  };
  matchedSubstance: ScreeningSubstance | null;
  matchedReferenceItem: ScreeningReferenceItem | null;
  matchedValue: string | null;
  matchScore: number | null;
  ruleApplied: ScreeningRuleShape | null;
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
}, context?: ScreeningContext): ApiScreeningResult {
  const referenceListVersion = getReferenceListVersion(context?.referenceList.name);
  return {
    ...result,
    status: toApiScreeningStatus(result.status),
    createdAt: result.createdAt.toISOString(),
    productName: context?.product.name,
    referenceListName: context?.referenceList.name,
    referenceListVersion,
    screeningSnapshotLabel: `${context?.referenceList.name ?? "Reference list"} ${referenceListVersion} @ ${result.createdAt.toISOString().slice(0, 10)}`,
    matchedSubstance: context?.matchedSubstance ?? null,
    matchedReferenceItem: context?.matchedReferenceItem ?? null,
    matchedValue: context?.matchedValue ?? null,
    matchScore: context?.matchScore ?? null,
    ruleApplied: context?.ruleApplied
      ? {
          id: context.ruleApplied.id,
          name: context.ruleApplied.name,
          productTypeEquals: context.ruleApplied.conditions.productTypeEquals,
          concentrationGreaterThan: context.ruleApplied.conditions.concentrationGreaterThan,
          outcomeStatus: toApiScreeningStatus(context.ruleApplied.outcomeStatus)
        }
      : null,
    explanationRows: context ? buildExplanationRows(context) : []
  };
}

function getReferenceListVersion(name?: string) {
  if (name?.toLowerCase().includes("svhc")) return "v2026.05";
  if (name?.toLowerCase().includes("internal")) return "v2026.05-internal";
  return "v2026.05-demo";
}

function toPercentScore(score: number) {
  return Math.round(score * 100);
}

function formatMatchValue(substance: ScreeningSubstance, matchedField: MatchedField) {
  if (matchedField === "CAS") return substance.casNumber;
  if (matchedField === "EC") return substance.ecNumber;
  if (matchedField === "NAME") return substance.name;
  return null;
}

function buildExplanationRows(context: ScreeningContext): ApiScreeningResult["explanationRows"] {
  return context.product.substances.map((substance) => {
    const match = matchSubstance(substance, context.referenceList.items);
    const ruleMatches =
      context.ruleApplied &&
      context.product.productType === context.ruleApplied.conditions.productTypeEquals &&
      substance.concentrationPercent > context.ruleApplied.conditions.concentrationGreaterThan;
    return {
      substanceName: substance.name,
      casNumber: substance.casNumber,
      ecNumber: substance.ecNumber,
      concentrationPercent: substance.concentrationPercent,
      matchedField: match.item ? match.matchedField : "NONE",
      matchScore: match.item ? toPercentScore(match.score) : null,
      matchedValue: match.item ? formatMatchValue(substance, match.matchedField) : null,
      referenceItemName: match.item?.name ?? null,
      rule: context.ruleApplied
        ? `${context.ruleApplied.name}: ${context.product.productType} > ${context.ruleApplied.conditions.concentrationGreaterThan}%`
        : "No active rule changed the result",
      impact: ruleMatches
        ? "Rule condition met"
        : match.item
          ? `Reference list match by ${match.matchedField}`
          : "No reference list match"
    };
  });
}

function decideScreening(product: ScreeningContext["product"], referenceList: ScreeningContext["referenceList"]) {
  let status: PrismaScreeningStatus = "NO_MATCH";
  let matchedField: MatchedField = "NONE";
  let reason = "No matching CAS, EC or sufficiently similar name was found on the selected reference list.";
  let matchedSubstance: ScreeningSubstance | null = null;
  let matchedReferenceItem: ScreeningReferenceItem | null = null;
  let matchedValue: string | null = null;
  let matchScore: number | null = null;
  let ruleApplied: ScreeningRuleShape | null = null;

  for (const substance of product.substances) {
    const match = matchSubstance(substance, referenceList.items);
    if (match.item) {
      status = "MATCH";
      matchedField = match.matchedField;
      matchedSubstance = substance;
      matchedReferenceItem = match.item;
      matchedValue = formatMatchValue(substance, match.matchedField);
      matchScore = toPercentScore(match.score);
      reason =
        match.matchedField === "NAME"
          ? `Potential fuzzy name match: ${substance.name} against ${match.item.name ?? "reference item"} with ${matchScore}% similarity.`
          : `Matched ${substance.name} against ${match.item.name ?? "reference item"} by ${match.matchedField}.`;
      break;
    }
  }

  for (const rule of referenceList.rules.filter((entry) => entry.active)) {
    const conditions = rule.conditions;
    if (evaluateRule(product, conditions)) {
      const thresholdSubstance =
        product.substances.find((substance) => substance.concentrationPercent > conditions.concentrationGreaterThan) ??
        matchedSubstance;
      status = rule.outcomeStatus;
      matchedField = "RULE";
      matchedSubstance = thresholdSubstance;
      matchedValue = `${product.productType}; ${thresholdSubstance?.concentrationPercent ?? "-"}% > ${conditions.concentrationGreaterThan}%`;
      ruleApplied = rule;
      reason = `Rule "${rule.name}" matched: product type ${conditions.productTypeEquals} and concentration greater than ${conditions.concentrationGreaterThan}%.`;
      break;
    }
  }

  return {
    status,
    matchedField,
    reason,
    context: {
      product,
      referenceList,
      matchedSubstance,
      matchedReferenceItem,
      matchedValue,
      matchScore,
      ruleApplied
    }
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

  const decision = decideScreening(
    {
      name: product.name,
      productType: product.productType,
      substances: product.substances
    },
    {
      name: referenceList.name,
      items: referenceList.items,
      rules: referenceList.rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        active: rule.active,
        conditions: rule.conditions as { productTypeEquals: ProductType; concentrationGreaterThan: number },
        outcomeStatus: rule.outcomeStatus as PrismaScreeningStatus
      }))
    }
  );

  const comment = selectBusinessComment(referenceList.businessComments, decision.status);
  const result = await prisma.screeningResult.create({
    data: {
      productId,
      referenceListId,
      status: decision.status,
      matchedField: decision.matchedField,
      reason: decision.reason,
      comment
    }
  });

  return serializeResult(result, decision.context);
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

  const decision = decideScreening(
    {
      name: product.name,
      productType: product.productType,
      substances: product.substances
    },
    {
      name: referenceList.name,
      items: referenceList.items,
      rules: referenceList.rules
    }
  );

  const result = {
    id: `mem-result-${Date.now()}`,
    productId,
    referenceListId,
    status: decision.status,
    matchedField: decision.matchedField,
    reason: decision.reason,
    comment: selectBusinessComment(referenceList.businessComments, decision.status),
    createdAt: new Date()
  };
  memoryResults.unshift(result);
  return serializeResult(result, decision.context);
}
