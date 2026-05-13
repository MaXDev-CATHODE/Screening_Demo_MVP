import { prisma } from "@/lib/db/prisma";
import { ApiScreeningStatus, RuleConditions, toPrismaScreeningStatus } from "@/lib/domain/types";
import { validateRuleConditions } from "@/lib/validation/rule";
import { isMemoryMode, memoryReferenceLists } from "@/lib/demo-data/memory-store";

export type RuleInput = {
  referenceListId: string;
  name: string;
  active?: boolean;
  conditions: RuleConditions;
  outcomeStatus: ApiScreeningStatus;
};

export async function listRules(referenceListId?: string) {
  if (isMemoryMode()) {
    return memoryReferenceLists.flatMap((list) => list.rules).filter((rule) => !referenceListId || rule.referenceListId === referenceListId);
  }

  return prisma.screeningRule.findMany({
    where: referenceListId ? { referenceListId } : undefined,
    orderBy: { id: "asc" }
  });
}

export async function createRule(input: RuleInput) {
  const validation = validateRuleConditions(input.conditions);
  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }

  if (isMemoryMode()) {
    const list = memoryReferenceLists.find((entry) => entry.id === input.referenceListId);
    if (!list) throw new Error("Reference list not found.");
    const rule = {
      id: `mem-rule-${Date.now()}`,
      referenceListId: input.referenceListId,
      name: input.name.trim(),
      active: input.active ?? true,
      conditions: input.conditions,
      outcomeStatus: toPrismaScreeningStatus(input.outcomeStatus)
    };
    list.rules.unshift(rule);
    return rule;
  }

  return prisma.screeningRule.create({
    data: {
      referenceListId: input.referenceListId,
      name: input.name.trim(),
      active: input.active ?? true,
      conditions: input.conditions,
      outcomeStatus: toPrismaScreeningStatus(input.outcomeStatus)
    }
  });
}
