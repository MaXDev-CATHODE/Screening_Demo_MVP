import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/demo-login-service", () => ({
  loginAsRole: vi.fn(async () => ({
    id: "u1",
    displayName: "Super",
    email: "s@example.test",
    role: "SUPER_ADMIN",
    companyId: null
  }))
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    authenticated: true,
    user: { id: "u1", displayName: "Super", email: "s@example.test", role: "SUPER_ADMIN", companyId: null }
  })),
  clearDemoSession: vi.fn(async () => undefined)
}));

describe("auth API", () => {
  it("starts demo login", async () => {
    const { POST } = await import("@/app/api/auth/demo-login/route");
    const response = await POST(new Request("http://localhost/api/auth/demo-login", { method: "POST", body: JSON.stringify({ role: "SUPER_ADMIN" }) }));
    expect(response.status).toBe(200);
  });

  it("returns current session", async () => {
    const { GET } = await import("@/app/api/session/route");
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("logs out", async () => {
    const { POST } = await import("@/app/api/logout/route");
    const response = await POST();
    expect(response.status).toBe(204);
  });
});
