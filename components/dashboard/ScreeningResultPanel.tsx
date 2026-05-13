"use client";

import type { ApiScreeningResult } from "@/lib/screening/screening-service";

export function ScreeningResultPanel({ result }: { result: ApiScreeningResult | null }) {
  if (!result) {
    return (
      <div className="card">
        <h2>Wynik screeningu</h2>
        <p className="muted">Wybierz produkt i listę referencyjną, żeby uruchomić screening.</p>
      </div>
    );
  }

  const badgeClass =
    result.status === "match" ? "info" : result.status === "no match" ? "success" : "warning";

  return (
    <div className="card">
      <span className={`badge ${badgeClass}`}>{result.status}</span>
      <p className="result-status">Wynik: {result.status}</p>
      <p>
        <strong>Dopasowanie:</strong> {result.matchedField}
      </p>
      <p>
        <strong>Powód:</strong> {result.reason}
      </p>
      <p>
        <strong>Gotowy komentarz:</strong> {result.comment}
      </p>
    </div>
  );
}
