import { afterEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/lib/domain/types";

let role: UserRole = "SUPER_ADMIN";
let companyId: string | null = null;
let companyName: string | null = "Global workspace";

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    authenticated: true,
    user: {
      id: `user-${role}`,
      displayName: "Demo User",
      email: "demo@example.test",
      role,
      companyId,
      companyName
    }
  }))
}));

describe("demo metrics API", () => {
  afterEach(() => {
    delete process.env.DEMO_DATA_MODE;
    role = "SUPER_ADMIN";
    companyId = null;
    companyName = "Global workspace";
  });

  it.each([
    ["SUPER_ADMIN", null, "Global SaaS overview"],
    ["COMPANY_ADMIN", "mem-acme", "Company workspace only"],
    ["STANDARD_USER", "mem-acme", "Company workspace only"]
  ] as const)("returns metrics for %s", async (nextRole, nextCompanyId, expectedScope) => {
    process.env.DEMO_DATA_MODE = "memory";
    role = nextRole;
    companyId = nextCompanyId;
    companyName = nextCompanyId ? "Acme Chemicals" : "Global workspace";

    const { GET } = await import("@/app/api/demo-metrics/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      role: nextRole,
      scopeLabel: expectedScope,
      resultTypes: 3,
      resultsByStatus: {
        match: expect.any(Number),
        "no match": expect.any(Number),
        "verification required": expect.any(Number)
      }
    });
  });
});
