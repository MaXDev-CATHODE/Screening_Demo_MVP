"use client";

import {
  Activity,
  Building2,
  Database,
  FileClock,
  GitBranch,
  GitPullRequest,
  Layers3,
  ListChecks,
  Network,
  PlayCircle,
  Route,
  ServerCog,
  ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import type { DemoMetrics } from "@/lib/demo-metrics/demo-metrics-service";

const workflowSteps = [
  { label: "Import danych", text: "CSV i mapowanie kolumn do modelu produktu.", icon: Database },
  { label: "Screening", text: "CAS, EC, nazwa, typ produktu i stężenie.", icon: PlayCircle },
  { label: "Wynik", text: "MATCH / NO MATCH / VERIFICATION REQUIRED.", icon: ShieldCheck },
  { label: "Snapshot decyzji", text: "Wersja listy, reguła i gotowy komentarz.", icon: FileClock }
];

const architectureItems = [
  { label: "Render Web Service", text: "Next.js full-stack app", icon: ServerCog },
  { label: "Render Postgres", text: "Firmy, produkty, listy, reguły, wyniki", icon: Database },
  { label: "OpenAPI contracts", text: "API gotowe do przejęcia przez inny zespół", icon: GitPullRequest },
  { label: "GitHub Actions", text: "Test, build, migrate, seed, deploy hook", icon: GitBranch }
];

function MetricCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Activity }) {
  return (
    <div className="metric-card">
      <Icon aria-hidden="true" size={19} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DemoMetrics | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/demo-metrics")
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!active) return;
        if (!response.ok) {
          setMessage(data?.message ?? "Nie udało się pobrać metryk demo.");
          return;
        }
        setMetrics(data);
      })
      .catch(() => setMessage("Nie udało się pobrać metryk demo."));

    return () => {
      active = false;
    };
  }, []);

  const statusSummary = metrics
    ? [
        { label: "MATCH", value: metrics.resultsByStatus.match, className: "info" },
        { label: "NO MATCH", value: metrics.resultsByStatus["no match"], className: "success" },
        { label: "VERIFICATION", value: metrics.resultsByStatus["verification required"], className: "warning" }
      ]
    : [];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="badge info">
            <Network aria-hidden="true" size={14} />
            SaaS command center
          </span>
          <h2>Jedno miejsce do pokazania multi-tenant workflow</h2>
          <p>
            Ten ekran odpowiada na pytania z transkrypcji: role, firmy, dane produktowe, globalne listy,
            screening, komentarze biznesowe i audytowalny snapshot wyniku.
          </p>
        </div>
        <div className="workspace-card">
          <span className="badge subtle">{metrics?.role ?? "Loading role"}</span>
          <strong>{metrics?.workspaceLabel ?? "Loading workspace"}</strong>
          <p>{metrics?.scopeLabel ?? "Loading scope"}</p>
        </div>
      </section>

      {message ? <p className="badge danger">{message}</p> : null}

      <section className="metric-grid" aria-label="Demo metrics">
        <MetricCard label="Firmy" value={metrics?.companies ?? "-"} icon={Building2} />
        <MetricCard label="Produkty" value={metrics?.products ?? "-"} icon={Database} />
        <MetricCard label="Listy" value={metrics?.referenceLists ?? "-"} icon={ListChecks} />
        <MetricCard label="Reguły" value={metrics?.rules ?? "-"} icon={GitBranch} />
        <MetricCard label="Screeningi" value={metrics?.screenings ?? "-"} icon={Activity} />
        <MetricCard label="Typy wyników" value={metrics?.resultTypes ?? "3"} icon={ShieldCheck} />
      </section>

      <section className="grid two">
        <div className="card">
          <div className="section-heading">
            <span className="badge subtle">
              <Route aria-hidden="true" size={14} />
              Demo workflow
            </span>
            <p className="muted">Ścieżka, którą można przejść na żywo podczas prezentacji.</p>
          </div>
          <div className="workflow-list">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div className="workflow-item" key={step.label}>
                  <span>{index + 1}</span>
                  <Icon aria-hidden="true" size={18} />
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <span className="badge subtle">
              <Layers3 aria-hidden="true" size={14} />
              Architecture proof
            </span>
            <p className="muted">Krótki dowód, że demo ma backend, kontrakty i ścieżkę deploymentu.</p>
          </div>
          <div className="architecture-list">
            {architectureItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="architecture-item" key={item.label}>
                  <Icon aria-hidden="true" size={18} />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h3>Global reference data vs company workspace</h3>
          <div className="scope-split">
            <div>
              <span className="badge subtle">Global reference data</span>
              <p>Listy, reguły i komentarze biznesowe utrzymywane przez SuperAdmina.</p>
            </div>
            <div>
              <span className="badge subtle">Company workspace data</span>
              <p>Produkty, składniki i screening ograniczone do przestrzeni firmy.</p>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Wyniki w tej przestrzeni</h3>
          <div className="status-stack">
            {statusSummary.map((item) => (
              <div className="status-row" key={item.label}>
                <span className={`badge ${item.className}`}>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
            {!metrics ? <p className="muted">Ładowanie metryk...</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
