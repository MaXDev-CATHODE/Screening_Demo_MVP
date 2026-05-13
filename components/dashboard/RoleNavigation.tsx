"use client";

import { Database, LayoutDashboard, ListChecks, SearchCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoUser } from "@/lib/domain/types";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/screening", label: "Screening", icon: SearchCheck }
];

export function RoleNavigation({ user }: { user: DemoUser | null }) {
  const pathname = usePathname();
  const links = [...baseLinks];

  if (user?.role === "COMPANY_ADMIN") {
    links.push({ href: "/products", label: "Dane produktowe", icon: Database });
  }

  if (user?.role === "SUPER_ADMIN") {
    links.push({ href: "/reference-lists", label: "Listy i reguły", icon: ListChecks });
  }

  return (
    <nav className="nav">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link className={pathname === link.href ? "active" : ""} href={link.href} key={link.href}>
            <Icon aria-hidden="true" size={18} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
