import { badRequest, created, unauthorized } from "@/lib/api/responses";
import { canRunScreening } from "@/lib/auth/guards";
import { getCurrentSession } from "@/lib/auth/session";
import { runScreening } from "@/lib/screening/screening-service";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session.authenticated || !canRunScreening(session.user.role)) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.productId || !body?.referenceListId) {
    return badRequest("Product and reference list are required.");
  }

  try {
    return created(await runScreening(session.user, body.productId, body.referenceListId));
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not run screening.");
  }
}
