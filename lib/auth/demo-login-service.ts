import { prisma } from "@/lib/db/prisma";
import { DemoUser, UserRole } from "@/lib/domain/types";
import { setDemoSession } from "@/lib/auth/session";
import { findMemoryUser, isMemoryMode } from "@/lib/demo-data/memory-store";

export async function loginAsRole(role: UserRole): Promise<DemoUser> {
  if (isMemoryMode()) {
    const user = findMemoryUser(role);
    if (!user) throw new Error(`No seeded demo user found for role ${role}.`);
    await setDemoSession(user.id);
    return user;
  }

  const user = await prisma.user.findFirst({
    where: { role },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      companyId: true,
      company: { select: { name: true } }
    }
  });

  if (!user) {
    throw new Error(`No seeded demo user found for role ${role}. Run npm run seed.`);
  }

  await setDemoSession(user.id);
  const { company, ...demoUser } = user;
  return { ...demoUser, companyName: company?.name ?? "Global workspace" };
}
