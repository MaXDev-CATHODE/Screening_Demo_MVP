"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRole } from "@/lib/domain/types";

const roles: Array<{ role: UserRole; title: string; description: string }> = [
  {
    role: "SUPER_ADMIN",
    title: "SuperAdministrator",
    description: "Listy referencyjne, reguły i globalna konfiguracja demo."
  },
  {
    role: "COMPANY_ADMIN",
    title: "Administrator firmy",
    description: "Dane produktowe i importy w przestrzeni przykładowej firmy."
  },
  {
    role: "STANDARD_USER",
    title: "Użytkownik standardowy",
    description: "Uruchomienie screeningu i odczyt gotowego wyniku."
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
    router.push("/screening");
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="card">
          <p className="eyebrow">Screening Demo MVP</p>
          <h1>Wybierz rolę demo</h1>
          <p className="muted">
            Każda rola pokazuje inny zakres uprawnień w przyszłym SaaS-ie: globalne listy, dane firmy
            albo sam wynik screeningu.
          </p>
          {error ? <p className="badge danger">{error}</p> : null}
          <div className="role-grid" style={{ marginTop: 18 }}>
            {roles.map((item) => (
              <button className="role-card" key={item.role} onClick={() => login(item.role)}>
                <strong>{item.title}</strong>
                <p className="muted">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
