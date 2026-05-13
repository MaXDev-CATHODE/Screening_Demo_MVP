"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { DemoUser } from "@/lib/domain/types";
import { DemoDisclaimer } from "@/components/dashboard/DemoDisclaimer";
import { DemoProofBar } from "@/components/dashboard/DemoProofBar";
import { RoleNavigation } from "@/components/dashboard/RoleNavigation";

type Session =
  | { authenticated: false; user?: undefined }
  | { authenticated: true; user: DemoUser };

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/session")
      .then((response) => response.json())
      .then((data: Session) => {
        if (!active) return;
        setSession(data);
        if (!data.authenticated && pathname !== "/login") {
          router.replace("/login");
        }
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  const title = useMemo(() => {
    if (pathname.includes("products")) return "Dane produktowe";
    if (pathname.includes("reference-lists")) return "Listy referencyjne";
    if (pathname.includes("unauthorized")) return "Brak dostępu";
    return "Screening";
  }, [pathname]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  const workspace = session?.authenticated ? (session.user.companyName ?? "Global workspace") : "Loading workspace";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/screening">
          Screening Demo
        </Link>
        <RoleNavigation user={session?.authenticated ? session.user : null} />
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP demo</p>
            <h1>{title}</h1>
          </div>
          <div className="session-box">
            {session?.authenticated ? (
              <>
                <div>
                  <span>{session.user.displayName}</span>
                  <small>{workspace}</small>
                </div>
                <span className="badge subtle">{session.user.role}</span>
                <button className="button secondary" onClick={logout}>
                  Wyloguj
                </button>
              </>
            ) : (
              <span className="muted">Ładowanie sesji...</span>
            )}
          </div>
        </header>
        <DemoDisclaimer />
        <DemoProofBar />
        <section className="content">{children}</section>
      </main>
    </div>
  );
}
