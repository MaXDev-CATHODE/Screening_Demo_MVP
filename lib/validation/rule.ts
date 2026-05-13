import { RuleConditions, isProductType } from "@/lib/domain/types";

export type RuleValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateRuleConditions(conditions: RuleConditions): RuleValidationResult {
  const errors: string[] = [];

  if (!isProductType(conditions.productTypeEquals)) {
    errors.push("Rule product type is invalid.");
  }

  if (
    typeof conditions.concentrationGreaterThan !== "number" ||
    !Number.isFinite(conditions.concentrationGreaterThan) ||
    conditions.concentrationGreaterThan < 0
  ) {
    errors.push("Rule concentration threshold must be a non-negative number.");
  }

  return { ok: errors.length === 0, errors };
}
