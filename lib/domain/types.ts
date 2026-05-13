export const userRoles = ["SUPER_ADMIN", "COMPANY_ADMIN", "STANDARD_USER"] as const;
export type UserRole = (typeof userRoles)[number];

export const productTypes = ["SUBSTANCE", "MIXTURE", "ARTICLE"] as const;
export type ProductType = (typeof productTypes)[number];

export const dataQualityStatuses = ["READY", "LIMITED", "INVALID"] as const;
export type DataQualityStatus = (typeof dataQualityStatuses)[number];

export const apiScreeningStatuses = ["match", "no match", "verification required"] as const;
export type ApiScreeningStatus = (typeof apiScreeningStatuses)[number];

export const prismaScreeningStatuses = ["MATCH", "NO_MATCH", "VERIFICATION_REQUIRED"] as const;
export type PrismaScreeningStatus = (typeof prismaScreeningStatuses)[number];

export const matchedFields = ["CAS", "EC", "NAME", "RULE", "NONE"] as const;
export type MatchedField = (typeof matchedFields)[number];

export type SubstanceInput = {
  name: string;
  casNumber?: string | null;
  ecNumber?: string | null;
  concentrationPercent: number | string;
};

export type ProductInput = {
  name: string;
  productType: ProductType;
  substances: SubstanceInput[];
};

export type RuleConditions = {
  productTypeEquals: ProductType;
  concentrationGreaterThan: number;
};

export type DemoUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  companyName?: string | null;
};

export function toApiScreeningStatus(status: PrismaScreeningStatus): ApiScreeningStatus {
  if (status === "MATCH") return "match";
  if (status === "NO_MATCH") return "no match";
  return "verification required";
}

export function toPrismaScreeningStatus(status: ApiScreeningStatus): PrismaScreeningStatus {
  if (status === "match") return "MATCH";
  if (status === "no match") return "NO_MATCH";
  return "VERIFICATION_REQUIRED";
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && userRoles.includes(value as UserRole);
}

export function isProductType(value: unknown): value is ProductType {
  return typeof value === "string" && productTypes.includes(value as ProductType);
}
