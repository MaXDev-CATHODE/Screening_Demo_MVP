"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoUser } from "@/lib/domain/types";

const baseLinks = [{ href: "/screening", label: "Screening" }];

export function RoleNavigation({ user }: { user: DemoUser | null }) {
  const pathname = usePathname();
  const links = [...baseLinks];

  if (user?.role === "COMPANY_ADMIN") {
    links.push({ href: "/products", label: "Dane produktowe" });
  }

  if (user?.role === "SUPER_ADMIN") {
    links.push({ href: "/reference-lists", label: "Listy i reguły" });
  }

  return (
    <nav className="nav">
      {links.map((link) => (
        <Link className={pathname === link.href ? "active" : ""} href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
