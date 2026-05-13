import { ok } from "@/lib/api/responses";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  return ok(await getCurrentSession());
}
