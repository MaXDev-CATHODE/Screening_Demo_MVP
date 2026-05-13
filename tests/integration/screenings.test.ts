import { beforeEach, describe, expect, it, vi } from "vitest";

const demoUser = {
  id: "u1",
  displayName: "Anna",
  email: "anna@example.test",
  role: "STANDARD_USER",
  companyId: "c1"
};

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({ authenticated: true, user: demoUser }))
}));

vi.mock("@/lib/screening/screening-service", () => ({
  runScreening: vi.fn(async () => ({
    id: "r1",
    productId: "p1",
    referenceListId: "l1",
    status: "verification required",
    matchedField: "RULE",
    matchScore: 100,
    reason: "Rule matched.",
    comment: "Demo comment.",
    createdAt: new Date("2026-05-13T00:00:00.000Z").toISOString(),
    referenceListVersion: "v2026.05",
    screeningSnapshotLabel: "SVHC demo list v2026.05 @ 2026-05-13",
    matchedSubstance: { name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8", concentrationPercent: 0.2 },
    matchedReferenceItem: { name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8" },
    matchedValue: "MIXTURE; 0.2% > 0.1%",
    ruleApplied: {
      id: "rule-1",
      name: "Mieszanina powyżej 0,1%",
      productTypeEquals: "MIXTURE",
      concentrationGreaterThan: 0.1,
      outcomeStatus: "verification required"
    },
    explanationRows: [
      {
        substanceName: "Bisphenol A",
        casNumber: "80-05-7",
        ecNumber: "201-245-8",
        concentrationPercent: 0.2,
        matchedField: "CAS",
        matchScore: 100,
        matchedValue: "80-05-7",
        referenceItemName: "Bisphenol A",
        rule: "Mieszanina powyżej 0,1%: MIXTURE > 0.1%",
        impact: "Rule condition met"
      }
    ]
  })),
  getScreeningResult: vi.fn(async () => ({
    id: "r1",
    productId: "p1",
    referenceListId: "l1",
    status: "match",
    matchedField: "CAS",
    matchScore: 100,
    reason: "CAS matched.",
    comment: "Demo comment.",
    createdAt: new Date("2026-05-13T00:00:00.000Z").toISOString(),
    referenceListVersion: "v2026.05",
    screeningSnapshotLabel: "SVHC demo list v2026.05 @ 2026-05-13",
    matchedSubstance: { name: "Formaldehyde", casNumber: "50-00-0", ecNumber: "200-001-8", concentrationPercent: 0.05 },
    matchedReferenceItem: { name: "Formaldehyde", casNumber: "50-00-0", ecNumber: "200-001-8" },
    matchedValue: "50-00-0",
    ruleApplied: null,
    explanationRows: []
  }))
}));

describe("screenings API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a screening result", async () => {
    const { POST } = await import("@/app/api/screenings/route");
    const response = await POST(
      new Request("http://localhost/api/screenings", {
        method: "POST",
        body: JSON.stringify({ productId: "p1", referenceListId: "l1" })
      })
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      status: "verification required",
      ruleApplied: { name: "Mieszanina powyżej 0,1%" },
      matchScore: 100,
      referenceListVersion: "v2026.05",
      explanationRows: [{ substanceName: "Bisphenol A", impact: "Rule condition met" }]
    });
  });

  it("gets a screening result", async () => {
    const { GET } = await import("@/app/api/screenings/[id]/route");
    const response = await GET(new Request("http://localhost/api/screenings/r1"), { params: Promise.resolve({ id: "r1" }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ matchedField: "CAS" });
  });
});
