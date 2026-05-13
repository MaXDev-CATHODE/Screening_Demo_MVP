import { badRequest, ok } from "@/lib/api/responses";
import { isUserRole } from "@/lib/domain/types";
import { loginAsRole } from "@/lib/auth/demo-login-service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isUserRole(body?.role)) {
    return badRequest("Role is required.");
  }

  try {
    const user = await loginAsRole(body.role);
    return ok({ authenticated: true, user });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not start demo session.");
  }
}
