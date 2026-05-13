import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    authenticated: true,
    user: { id: "u1", displayName: "Super", email: "s@example.test", role: "SUPER_ADMIN", companyId: null }
  }))
}));

vi.mock("@/lib/reference-lists/reference-list-service", () => ({
  listReferenceLists: vi.fn(async () => [{ id: "l1", name: "List" }]),
  createReferenceList: vi.fn(async () => ({ id: "l2", name: "Created" }))
}));

describe("reference lists API", () => {
  it("lists reference lists", async () => {
    const { GET } = await import("@/app/api/reference-lists/route");
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("creates a reference list", async () => {
    const { POST } = await import("@/app/api/reference-lists/route");
    const response = await POST(new Request("http://localhost/api/reference-lists", { method: "POST", body: JSON.stringify({ name: "List" }) }));
    expect(response.status).toBe(201);
  });
});
