import { describe, expect, it } from "vitest";
import { matchSubstance, nameSimilarity, normalizeName } from "@/lib/matching/matcher";

describe("matching helpers", () => {
  const items = [
    { name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8" },
    { name: "Formaldehyde", casNumber: "50-00-0", ecNumber: "200-001-8" }
  ];

  it("matches exact CAS first", () => {
    const result = matchSubstance({ name: "Other", casNumber: "80-05-7" }, items);
    expect(result.matchedField).toBe("CAS");
    expect(result.item?.name).toBe("Bisphenol A");
  });

  it("matches exact EC second", () => {
    const result = matchSubstance({ name: "Other", ecNumber: "200-001-8" }, items);
    expect(result.matchedField).toBe("EC");
    expect(result.item?.name).toBe("Formaldehyde");
  });

  it("falls back to fuzzy normalized name", () => {
    const result = matchSubstance({ name: "Bisfenol A" }, items, 0.7);
    expect(result.matchedField).toBe("NAME");
    expect(result.item?.name).toBe("Bisphenol A");
  });

  it("normalizes whitespace and punctuation", () => {
    expect(normalizeName("  Bisphenol---A  ")).toBe("bisphenol a");
    expect(nameSimilarity("Bisphenol A", "Bisphenol A")).toBe(1);
  });
});
