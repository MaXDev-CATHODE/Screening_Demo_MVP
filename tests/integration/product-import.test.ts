import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    authenticated: true,
    user: { id: "u1", displayName: "Admin", email: "a@example.test", role: "COMPANY_ADMIN", companyId: "c1" }
  }))
}));

vi.mock("@/lib/products/product-service", () => ({
  importProducts: vi.fn(async () => ({ created: 2, limited: 1, invalid: 1 }))
}));

describe("product import API", () => {
  it("imports products", async () => {
    const { POST } = await import("@/app/api/products/import/route");
    const response = await POST(
      new Request("http://localhost/api/products/import", {
        method: "POST",
        body: JSON.stringify({ products: [{ name: "Demo" }] })
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ created: 2, limited: 1, invalid: 1 });
  });
});
