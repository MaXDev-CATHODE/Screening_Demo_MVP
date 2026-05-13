import { DemoSession } from "@/lib/auth/session";
import { UserRole } from "@/lib/domain/types";

export function requireAuthenticated(session: DemoSession) {
  if (!session.authenticated) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

export function requireRole(session: DemoSession, allowed: UserRole[]) {
  const user = requireAuthenticated(session);
  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function canManageProducts(role: UserRole) {
  return role === "COMPANY_ADMIN";
}

export function canManageReferenceLists(role: UserRole) {
  return role === "SUPER_ADMIN";
}

export function canRunScreening(role: UserRole) {
  return role === "STANDARD_USER" || role === "COMPANY_ADMIN" || role === "SUPER_ADMIN";
}
