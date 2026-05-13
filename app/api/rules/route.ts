import { badRequest, created, forbidden, ok, unauthorized } from "@/lib/api/responses";
import { canManageReferenceLists } from "@/lib/auth/guards";
import { getCurrentSession } from "@/lib/auth/session";
import { createRule, listRules } from "@/lib/rules/rule-service";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  const url = new URL(request.url);
  return ok({ items: await listRules(url.searchParams.get("referenceListId") || undefined) });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();
  if (!canManageReferenceLists(session.user.role)) return forbidden();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Rule payload is required.");

  try {
    return created(await createRule(body));
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not create rule.");
  }
}
