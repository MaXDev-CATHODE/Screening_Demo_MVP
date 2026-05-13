"use client";

import { CheckCircle2, Clipboard, Copy, FileClock, HelpCircle, SearchCheck, ShieldAlert } from "lucide-react";
import { useState } from "react";
import type { ApiScreeningResult } from "@/lib/screening/screening-service";

const statusConfig = {
  match: {
    label: "MATCH",
    className: "status-match",
    badge: "info",
    icon: ShieldAlert,
    description: "Produkt ma trafienie na wybranej liście referencyjnej."
  },
  "no match": {
    label: "NO MATCH",
    className: "status-clear",
    badge: "success",
    icon: CheckCircle2,
    description: "Dla danych demonstracyjnych nie znaleziono trafienia."
  },
  "verification required": {
    label: "VERIFICATION REQUIRED",
    className: "status-review",
    badge: "warning",
    icon: HelpCircle,
    description: "Reguła lub dane wskazują potrzebę oceny merytorycznej."
  }
} as const;

export function ScreeningResultPanel({ result }: { result: ApiScreeningResult | null }) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="card result-empty">
        <SearchCheck aria-hidden="true" size={34} />
        <h2>Wynik screeningu</h2>
        <p className="muted">Wybierz scenariusz demo albo produkt i listę referencyjną, żeby pokazać wynik.</p>
      </div>
    );
  }

  const config = statusConfig[result.status];
  const Icon = config.icon;

  async function copyComment() {
    if (!result) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.comment);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = result.comment;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch {
      // The demo should still acknowledge the business action when browser clipboard permission is blocked.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={`card result-card ${config.className}`}>
      <div className="result-hero">
        <span className={`result-icon badge ${config.badge}`}>
          <Icon aria-hidden="true" size={24} />
        </span>
        <div>
          <span className={`badge ${config.badge}`}>{config.label}</span>
          <p className="result-status">{config.description}</p>
          <p className="muted">
            {result.productName ?? "Produkt demo"} vs {result.referenceListName ?? "lista referencyjna"}
          </p>
          {result.matchScore !== null ? <span className="score-pill">Match score: {result.matchScore}%</span> : null}
        </div>
      </div>

      <div className="result-section">
        <h3>Dlaczego taki wynik?</h3>
        <p>{result.reason}</p>
        {result.ruleApplied ? (
          <p className="rule-chip">
            Reguła: {result.ruleApplied.name} · {result.ruleApplied.productTypeEquals} &gt;{" "}
            {result.ruleApplied.concentrationGreaterThan}%
          </p>
        ) : null}
      </div>

      <div className="table-wrap evidence-table">
        <table>
          <thead>
            <tr>
              <th>Składnik</th>
              <th>CAS</th>
              <th>EC</th>
              <th>Stężenie</th>
              <th>Dopasowanie</th>
              <th>Score</th>
              <th>Reguła / wpływ</th>
            </tr>
          </thead>
          <tbody>
            {result.explanationRows.map((row) => (
              <tr key={`${row.substanceName}-${row.casNumber ?? row.ecNumber ?? row.concentrationPercent}`}>
                <td>{row.substanceName}</td>
                <td>{row.casNumber ?? "-"}</td>
                <td>{row.ecNumber ?? "-"}</td>
                <td>{row.concentrationPercent}%</td>
                <td>
                  <strong>{row.matchedField}</strong>
                  <br />
                  <span className="muted">{row.referenceItemName ?? row.matchedValue ?? "No list item"}</span>
                </td>
                <td>{row.matchScore !== null ? `${row.matchScore}%` : "-"}</td>
                <td>
                  {row.rule}
                  <br />
                  <span className="muted">{row.impact}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="comment-box">
        <div>
          <p className="eyebrow">Gotowy komentarz dla biznesu</p>
          <p>{result.comment}</p>
        </div>
        <button className="button secondary" onClick={copyComment} type="button">
          {copied ? <CheckCircle2 aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
          {copied ? "Skopiowano" : "Kopiuj"}
        </button>
      </div>

      <div className="snapshot-box">
        <div>
          <p className="eyebrow">Snapshot decyzji</p>
          <strong>{result.screeningSnapshotLabel}</strong>
        </div>
        <dl>
          <div>
            <dt>Screening ID</dt>
            <dd>{result.id}</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{new Date(result.createdAt).toLocaleString("pl-PL")}</dd>
          </div>
          <div>
            <dt>Wersja listy</dt>
            <dd>{result.referenceListVersion}</dd>
          </div>
          <div>
            <dt>Reguła</dt>
            <dd>{result.ruleApplied?.name ?? "Brak aktywnej reguły zmieniającej wynik"}</dd>
          </div>
        </dl>
        <p>
          <FileClock aria-hidden="true" size={15} />
          Wynik jest zamrożony względem tej wersji listy demo.
        </p>
      </div>

      <p className="result-footnote">
        <Clipboard aria-hidden="true" size={15} />
        Wynik pokazuje logikę MVP. Nie zastępuje finalnej opinii prawnej, chemicznej ani regulacyjnej.
      </p>
    </div>
  );
}
