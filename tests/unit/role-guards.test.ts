import { describe, expect, it } from "vitest";
import { canManageProducts, canManageReferenceLists, canRunScreening } from "@/lib/auth/guards";
import { canAccessCompanyProduct, productCompanyFilter } from "@/lib/auth/company-scope";

const companyUser = {
  id: "u1",
  displayName: "User",
  email: "u@example.test",
  role: "STANDARD_USER" as const,
  companyId: "c1"
};

describe("role guards", () => {
  it("limits product management to company admin", () => {
    expect(canManageProducts("COMPANY_ADMIN")).toBe(true);
    expect(canManageProducts("STANDARD_USER")).toBe(false);
  });

  it("limits reference list management to super admin", () => {
    expect(canManageReferenceLists("SUPER_ADMIN")).toBe(true);
    expect(canManageReferenceLists("COMPANY_ADMIN")).toBe(false);
  });

  it("allows all demo roles to run screening", () => {
    expect(canRunScreening("SUPER_ADMIN")).toBe(true);
    expect(canRunScreening("COMPANY_ADMIN")).toBe(true);
    expect(canRunScreening("STANDARD_USER")).toBe(true);
  });

  it("applies company product scope", () => {
    expect(productCompanyFilter(companyUser)).toEqual({ companyId: "c1" });
    expect(canAccessCompanyProduct(companyUser, "c1")).toBe(true);
    expect(canAccessCompanyProduct(companyUser, "c2")).toBe(false);
  });
});
