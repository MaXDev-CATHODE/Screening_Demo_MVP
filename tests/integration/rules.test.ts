import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    authenticated: true,
    user: { id: "u1", displayName: "Super", email: "s@example.test", role: "SUPER_ADMIN", companyId: null }
  }))
}));

vi.mock("@/lib/rules/rule-service", () => ({
  listRules: vi.fn(async () => [{ id: "r1", name: "Rule" }]),
  createRule: vi.fn(async () => ({ id: "r2", name: "Created" }))
}));

describe("rules API", () => {
  it("lists rules", async () => {
    const { GET } = await import("@/app/api/rules/route");
    const response = await GET(new Request("http://localhost/api/rules?referenceListId=l1"));
    expect(response.status).toBe(200);
  });

  it("creates a rule", async () => {
    const { POST } = await import("@/app/api/rules/route");
    const response = await POST(new Request("http://localhost/api/rules", { method: "POST", body: JSON.stringify({}) }));
    expect(response.status).toBe(201);
  });
});
