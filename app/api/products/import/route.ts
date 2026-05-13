import { badRequest, forbidden, ok, unauthorized } from "@/lib/api/responses";
import { canManageProducts } from "@/lib/auth/guards";
import { getCurrentSession } from "@/lib/auth/session";
import { importProducts } from "@/lib/products/product-service";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  if (!canManageProducts(session.user.role)) return forbidden();

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.products)) {
    return badRequest("Products array is required.");
  }

  return ok(await importProducts(session.user, body.products));
}
