"use client";

import { Building2, Database, GitBranch, ListChecks, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Product = { id: string };
type ReferenceList = { id: string; rules?: Array<{ id: string }> };

export function DemoProofBar() {
  const [stats, setStats] = useState({ products: 0, lists: 0, rules: 0 });

  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/products"), fetch("/api/reference-lists")])
      .then(async ([productsResponse, listsResponse]) => {
        const productsData = productsResponse.ok ? await productsResponse.json() : { items: [] };
        const listsData = listsResponse.ok ? await listsResponse.json() : { items: [] };
        if (!active) return;
        const products = (productsData.items ?? []) as Product[];
        const lists = (listsData.items ?? []) as ReferenceList[];
        setStats({
          products: products.length,
          lists: lists.length,
          rules: lists.reduce((total, list) => total + (list.rules?.length ?? 0), 0)
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const items = [
    { label: "Sample companies", value: "2", icon: Building2 },
    { label: "Visible products", value: String(stats.products || "4"), icon: Database },
    { label: "Reference lists", value: String(stats.lists || "2"), icon: ListChecks },
    { label: "Active rules", value: String(stats.rules || "1"), icon: GitBranch },
    { label: "Result types", value: "3", icon: ShieldCheck }
  ];

  return (
    <section className="proof-bar" aria-label="Demo coverage">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="proof-item" key={item.label}>
            <Icon aria-hidden="true" size={18} />
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        );
      })}
    </section>
  );
}
