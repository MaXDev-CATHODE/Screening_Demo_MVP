import { badRequest, forbidden, ok, unauthorized } from "@/lib/api/responses";
import { canManageReferenceLists } from "@/lib/auth/guards";
import { getCurrentSession } from "@/lib/auth/session";
import { updateBusinessComments } from "@/lib/business-comments/business-comment-service";

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  if (!canManageReferenceLists(session.user.role)) return forbidden();

  const body = await request.json().catch(() => null);
  if (!body?.referenceListId || !Array.isArray(body.comments)) {
    return badRequest("Reference list and comments are required.");
  }

  try {
    return ok({ items: await updateBusinessComments(body.referenceListId, body.comments) });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not update business comments.");
  }
}
