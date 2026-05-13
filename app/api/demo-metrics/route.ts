import { ok, unauthorized } from "@/lib/api/responses";
import { getCurrentSession } from "@/lib/auth/session";
import { getDemoMetrics } from "@/lib/demo-metrics/demo-metrics-service";

export async function GET() {
  const session = await getCurrentSession();
  if (!session.authenticated) return unauthorized();

  return ok(await getDemoMetrics(session.user));
}
