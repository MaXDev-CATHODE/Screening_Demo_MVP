"use client";

import { GitCompare, History, LockKeyhole } from "lucide-react";
import { getDemoReferenceListVersionHistory } from "@/lib/reference-lists/versioning";

export function ReferenceListVersionHistory({ listName }: { listName: string }) {
  const entries = getDemoReferenceListVersionHistory(listName);

  return (
    <div className="card version-history">
      <div className="section-heading">
        <span className="badge subtle">
          <History aria-hidden="true" size={14} />
          Historia listy
        </span>
        <p className="muted">Demo pokazuje, że wynik może być zamrożony względem konkretnej wersji listy.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Wersja</th>
              <th>Status</th>
              <th>Data</th>
              <th>Autor</th>
              <th>Zmiana</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.version}>
                <td>
                  <strong>{entry.version}</strong>
                </td>
                <td>
                  <span className={`badge ${entry.status === "active" ? "success" : "subtle"}`}>{entry.status}</span>
                </td>
                <td>{entry.changedAt}</td>
                <td>{entry.changedBy}</td>
                <td>{entry.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="version-actions">
        <button className="button secondary" disabled type="button">
          <GitCompare aria-hidden="true" size={16} />
          Diff preview
        </button>
        <span className="muted">
          <LockKeyhole aria-hidden="true" size={14} />
          Archived versions are read-only in this MVP demo.
        </span>
      </div>
    </div>
  );
}
