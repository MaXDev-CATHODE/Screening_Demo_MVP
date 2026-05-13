import { badRequest, created, forbidden, ok, unauthorized } from "@/lib/api/responses";
import { getCurrentSession } from "@/lib/auth/session";
import { canManageProducts } from "@/lib/auth/guards";
import { createProduct, listProducts } from "@/lib/products/product-service";

export async function GET() {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  return ok({ items: await listProducts(session.user) });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  if (!canManageProducts(session.user.role)) return forbidden();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Product payload is required.");

  try {
    return created(await createProduct(session.user, body));
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not create product.");
  }
}
