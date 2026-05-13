import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    authenticated: true,
    user: { id: "u1", displayName: "Admin", email: "a@example.test", role: "COMPANY_ADMIN", companyId: "c1" }
  }))
}));

vi.mock("@/lib/products/product-service", () => ({
  listProducts: vi.fn(async () => [{ id: "p1", name: "Demo", substances: [] }]),
  createProduct: vi.fn(async () => ({ id: "p2", name: "Created", substances: [] }))
}));

describe("products API", () => {
  it("lists products", async () => {
    const { GET } = await import("@/app/api/products/route");
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ items: [{ id: "p1" }] });
  });

  it("creates product", async () => {
    const { POST } = await import("@/app/api/products/route");
    const response = await POST(new Request("http://localhost/api/products", { method: "POST", body: JSON.stringify({}) }));
    expect(response.status).toBe(201);
  });
});
