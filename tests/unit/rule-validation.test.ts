import { describe, expect, it } from "vitest";
import { validateRuleConditions } from "@/lib/validation/rule";

describe("rule validation", () => {
  it("accepts the first-demo mixture concentration rule", () => {
    expect(validateRuleConditions({ productTypeEquals: "MIXTURE", concentrationGreaterThan: 0.1 }).ok).toBe(true);
  });

  it("rejects negative thresholds", () => {
    const result = validateRuleConditions({ productTypeEquals: "MIXTURE", concentrationGreaterThan: -1 });
    expect(result.ok).toBe(false);
  });
});
