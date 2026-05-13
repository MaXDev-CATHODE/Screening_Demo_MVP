import { notFound, ok, unauthorized } from "@/lib/api/responses";
import { getCurrentSession } from "@/lib/auth/session";
import { getScreeningResult } from "@/lib/screening/screening-service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();

  const { id } = await context.params;
  const result = await getScreeningResult(session.user, id);
  return result ? ok(result) : notFound("Screening result not found.");
}
