import { describe, expect, it } from "vitest";
import { parseConcentrationPercent, validateProductInput } from "@/lib/validation/product";

describe("product validation", () => {
  it("parses comma and percent concentration formats", () => {
    expect(parseConcentrationPercent("0,2%")).toBe(0.2);
    expect(parseConcentrationPercent("1.5")).toBe(1.5);
  });

  it("marks product as ready when identifiers and concentration are valid", () => {
    const result = validateProductInput({
      name: "Ready product",
      productType: "MIXTURE",
      substances: [{ name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8", concentrationPercent: 0.2 }]
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe("READY");
  });

  it("marks product as limited when CAS or EC is missing", () => {
    const result = validateProductInput({
      name: "Limited product",
      productType: "ARTICLE",
      substances: [{ name: "Bisfenol A", concentrationPercent: 0.05 }]
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe("LIMITED");
  });

  it("marks invalid concentration as invalid", () => {
    const result = validateProductInput({
      name: "Invalid product",
      productType: "MIXTURE",
      substances: [{ name: "Water", concentrationPercent: "abc" }]
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe("INVALID");
  });
});
