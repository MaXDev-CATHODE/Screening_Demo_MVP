"use client";

import { Building2, Database, GitBranch, ListChecks, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { DemoMetrics } from "@/lib/demo-metrics/demo-metrics-service";

export function DemoProofBar() {
  const [metrics, setMetrics] = useState<DemoMetrics | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/demo-metrics")
      .then(async (response) => {
        const data = response.ok ? await response.json() : null;
        if (!active) return;
        setMetrics(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const items = [
    { label: "Sample companies", value: String(metrics?.companies ?? "2"), icon: Building2 },
    { label: "Visible products", value: String(metrics?.products ?? "4"), icon: Database },
    { label: "Reference lists", value: String(metrics?.referenceLists ?? "2"), icon: ListChecks },
    { label: "Active rules", value: String(metrics?.rules ?? "1"), icon: GitBranch },
    { label: "Result types", value: String(metrics?.resultTypes ?? "3"), icon: ShieldCheck }
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
