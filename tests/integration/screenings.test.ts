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
    reason: "Rule matched.",
    comment: "Demo comment.",
    createdAt: new Date("2026-05-13T00:00:00.000Z").toISOString()
  })),
  getScreeningResult: vi.fn(async () => ({
    id: "r1",
    productId: "p1",
    referenceListId: "l1",
    status: "match",
    matchedField: "CAS",
    reason: "CAS matched.",
    comment: "Demo comment.",
    createdAt: new Date("2026-05-13T00:00:00.000Z").toISOString()
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
    await expect(response.json()).resolves.toMatchObject({ status: "verification required" });
  });

  it("gets a screening result", async () => {
    const { GET } = await import("@/app/api/screenings/[id]/route");
    const response = await GET(new Request("http://localhost/api/screenings/r1"), { params: Promise.resolve({ id: "r1" }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ matchedField: "CAS" });
  });
});
