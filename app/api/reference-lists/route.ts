import { badRequest, created, forbidden, ok, unauthorized } from "@/lib/api/responses";
import { canManageReferenceLists } from "@/lib/auth/guards";
import { getCurrentSession } from "@/lib/auth/session";
import { createReferenceList, listReferenceLists } from "@/lib/reference-lists/reference-list-service";

export async function GET() {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  return ok({ items: await listReferenceLists() });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  if (!canManageReferenceLists(session.user.role)) return forbidden();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Reference list payload is required.");

  try {
    return created(await createReferenceList(body));
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not create reference list.");
  }
}
