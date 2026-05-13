import { afterEach, describe, expect, it } from "vitest";
import { memoryUsers } from "@/lib/demo-data/memory-store";
import { runScreening } from "@/lib/screening/screening-service";

describe("screening presentation details", () => {
  afterEach(() => {
    delete process.env.DEMO_DATA_MODE;
  });

  it("returns rule evidence for the verification demo scenario", async () => {
    process.env.DEMO_DATA_MODE = "memory";
    const result = await runScreening(memoryUsers[0], "mem-product-verification", "mem-svhc");

    expect(result.status).toBe("verification required");
    expect(result.ruleApplied?.name).toBe("Mieszanina powyżej 0,1%");
    expect(result.matchedSubstance?.name).toBe("Bisphenol A");
    expect(result.explanationRows[0]).toMatchObject({
      substanceName: "Bisphenol A",
      matchedField: "CAS",
      impact: "Rule condition met"
    });
  });

  it("returns evidence rows for the no-match demo scenario", async () => {
    process.env.DEMO_DATA_MODE = "memory";
    const result = await runScreening(memoryUsers[0], "mem-product-no-match", "mem-svhc");

    expect(result.status).toBe("no match");
    expect(result.ruleApplied).toBeNull();
    expect(result.explanationRows[0]).toMatchObject({
      substanceName: "Water",
      matchedField: "NONE",
      impact: "No reference list match"
    });
  });
});
