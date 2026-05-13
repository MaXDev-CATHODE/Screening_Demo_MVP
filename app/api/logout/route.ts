import { noContent } from "@/lib/api/responses";
import { clearDemoSession } from "@/lib/auth/session";

export async function POST() {
  await clearDemoSession();
  return noContent();
}
