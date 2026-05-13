import { DemoUser } from "@/lib/domain/types";

export function productCompanyFilter(user: DemoUser) {
  if (user.role === "SUPER_ADMIN") return {};
  return { companyId: user.companyId || "__no_company__" };
}

export function canAccessCompanyProduct(user: DemoUser, productCompanyId: string) {
  return user.role === "SUPER_ADMIN" || user.companyId === productCompanyId;
}
