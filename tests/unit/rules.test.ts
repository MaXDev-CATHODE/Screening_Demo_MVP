import { describe, expect, it } from "vitest";
import { evaluateRule } from "@/lib/rules/evaluate";

describe("rule evaluation", () => {
  const rule = { productTypeEquals: "MIXTURE" as const, concentrationGreaterThan: 0.1 };

  it("matches mixture over threshold", () => {
    expect(evaluateRule({ productType: "MIXTURE", substances: [{ concentrationPercent: 0.11 }] }, rule)).toBe(true);
  });

  it("does not match exactly equal threshold", () => {
    expect(evaluateRule({ productType: "MIXTURE", substances: [{ concentrationPercent: 0.1 }] }, rule)).toBe(false);
  });

  it("does not match different product type", () => {
    expect(evaluateRule({ productType: "ARTICLE", substances: [{ concentrationPercent: 0.2 }] }, rule)).toBe(false);
  });
});
