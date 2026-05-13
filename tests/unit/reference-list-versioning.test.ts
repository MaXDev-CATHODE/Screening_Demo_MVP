import { describe, expect, it } from "vitest";
import { getDemoReferenceListVersion, getDemoReferenceListVersionHistory } from "@/lib/reference-lists/versioning";

describe("reference list versioning presentation", () => {
  it("uses the current SVHC demo version in result snapshots and history", () => {
    expect(getDemoReferenceListVersion("SVHC demo list")).toBe("v2026.05");

    const history = getDemoReferenceListVersionHistory("SVHC demo list");
    expect(history[0]).toMatchObject({
      version: "v2026.05",
      status: "active",
      changedBy: "Marta Nowak"
    });
    expect(history[1]).toMatchObject({ version: "v2026.01", status: "archived" });
  });
});
