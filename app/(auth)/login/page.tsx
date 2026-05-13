"use client";

import { ArrowRight, Building2, ClipboardCheck, Database, ListChecks, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRole } from "@/lib/domain/types";

const steps = [
  { title: "Dane produktu", description: "CAS, EC, nazwa, typ produktu i stężenie.", icon: Database },
  { title: "Lista i reguła", description: "Globalna lista oraz warunek zależny od progu.", icon: ListChecks },
  { title: "Wynik", description: "Status, uzasadnienie i gotowy komentarz.", icon: ClipboardCheck }
];

const roles: Array<{ role: UserRole; title: string; description: string; label: string; icon: typeof ShieldCheck }> = [
  {
    role: "SUPER_ADMIN",
    title: "SuperAdministrator",
    label: "Global reference data",
    description: "Najlepszy scenariusz na pokaz: listy referencyjne, reguły i screening.",
    icon: ShieldCheck
  },
  {
    role: "COMPANY_ADMIN",
    title: "Administrator firmy",
    label: "Company workspace data",
    description: "Dane produktowe, jakość danych i ręczne dodanie próbki.",
    icon: Building2
  },
  {
    role: "STANDARD_USER",
    title: "Użytkownik standardowy",
    label: "Screening workflow",
    description: "Najkrótsza ścieżka: wybór produktu, screening i wynik.",
    icon: ClipboardCheck
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function login(role: UserRole) {
    setError("");
    const response = await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: "Login failed." }));
      setError(data.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-panel intro-shell">
        <div className="intro-copy">
          <span className="badge info">Interactive SaaS demo</span>
          <h1>Product screening workflow for reference-list decisions</h1>
          <p>
            Demo pokazuje, jak z danych produktu, globalnej listy i prostej reguły powstaje wynik z
            uzasadnieniem gotowym do rozmowy biznesowej.
          </p>
        </div>

        <div className="demo-flow" aria-label="Demo workflow">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="flow-step" key={step.title}>
                <Icon aria-hidden="true" size={22} />
                <span>{index + 1}</span>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </div>
            );
          })}
        </div>

        <div className="role-section">
          <div>
            <p className="eyebrow">Wybierz scenariusz roli</p>
            <h2>Najlepiej zacząć od SuperAdministratora</h2>
          </div>
          {error ? <p className="badge danger">{error}</p> : null}
          <div className="role-grid">
            {roles.map((item) => {
              const Icon = item.icon;
              return (
                <button className="role-card" key={item.role} onClick={() => login(item.role)}>
                  <span className="role-icon">
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <span className="badge subtle">{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <span className="role-action">
                    Uruchom demo <ArrowRight aria-hidden="true" size={16} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
