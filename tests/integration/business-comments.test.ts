import { describe, expect, it, vi } from "vitest";

let role = "SUPER_ADMIN";

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    authenticated: true,
    user: { id: "u1", displayName: "Demo", email: "demo@example.test", role, companyId: null }
  }))
}));

vi.mock("@/lib/business-comments/business-comment-service", () => ({
  updateBusinessComments: vi.fn(async () => [{ id: "c1", status: "MATCH", text: "Updated comment" }])
}));

describe("business comments API", () => {
  it("updates comments for super admin", async () => {
    role = "SUPER_ADMIN";
    const { PATCH } = await import("@/app/api/business-comments/route");
    const response = await PATCH(
      new Request("http://localhost/api/business-comments", {
        method: "PATCH",
        body: JSON.stringify({ referenceListId: "l1", comments: [{ status: "MATCH", text: "Updated comment" }] })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ items: [{ status: "MATCH", text: "Updated comment" }] });
  });

  it("rejects non-super admin updates", async () => {
    role = "STANDARD_USER";
    const { PATCH } = await import("@/app/api/business-comments/route");
    const response = await PATCH(
      new Request("http://localhost/api/business-comments", {
        method: "PATCH",
        body: JSON.stringify({ referenceListId: "l1", comments: [{ status: "MATCH", text: "Updated comment" }] })
      })
    );

    expect(response.status).toBe(403);
  });
});
