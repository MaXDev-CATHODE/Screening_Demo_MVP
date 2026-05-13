import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { DemoUser } from "@/lib/domain/types";
import { findMemoryUser, isMemoryMode } from "@/lib/demo-data/memory-store";

const cookieName = "screening_demo_user";

export type DemoSession =
  | {
      authenticated: false;
      user?: undefined;
    }
  | {
      authenticated: true;
      user: DemoUser;
    };

export async function getCurrentSession(): Promise<DemoSession> {
  const store = await cookies();
  const userId = store.get(cookieName)?.value;
  if (!userId) return { authenticated: false };

  if (isMemoryMode()) {
    const user = findMemoryUser(userId);
    return user ? { authenticated: true, user } : { authenticated: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      companyId: true
    }
  });

  if (!user) return { authenticated: false };
  return { authenticated: true, user };
}

export async function setDemoSession(userId: string) {
  const store = await cookies();
  store.set(cookieName, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearDemoSession() {
  const store = await cookies();
  store.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
