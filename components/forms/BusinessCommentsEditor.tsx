"use client";

import { MessageSquareText, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BusinessComment = {
  id: string;
  status: "MATCH" | "NO_MATCH" | "VERIFICATION_REQUIRED";
  text: string;
};

const statusLabels: Record<BusinessComment["status"], string> = {
  MATCH: "MATCH",
  NO_MATCH: "NO MATCH",
  VERIFICATION_REQUIRED: "VERIFICATION REQUIRED"
};

const defaultComments: Record<BusinessComment["status"], string> = {
  MATCH: "Demo: składnik został znaleziony na liście referencyjnej. Wynik wymaga potwierdzenia przez osobę odpowiedzialną.",
  NO_MATCH: "Demo: nie znaleziono zgodności z wybraną listą referencyjną dla przykładowych danych.",
  VERIFICATION_REQUIRED: "Demo: składnik spełnia warunek reguły i powinien zostać przekazany do weryfikacji merytorycznej."
};

const statuses = Object.keys(statusLabels) as Array<BusinessComment["status"]>;

export function BusinessCommentsEditor({
  referenceListId,
  comments,
  onChanged
}: {
  referenceListId: string;
  comments: BusinessComment[];
  onChanged: () => void;
}) {
  const initialValues = useMemo(() => {
    const values = { ...defaultComments };
    for (const comment of comments) values[comment.status] = comment.text;
    return values;
  }, [comments]);
  const [values, setValues] = useState(initialValues);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    setMessage("");
  }, [referenceListId]);

  async function save() {
    setMessage("");
    const response = await fetch("/api/business-comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceListId,
        comments: statuses.map((status) => ({ status, text: values[status] }))
      })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Nie udało się zapisać komentarzy.");
      return;
    }
    setMessage("Komentarze zapisane.");
    onChanged();
  }

  return (
    <div className="card comments-editor">
      <span className="badge subtle">Business comments</span>
      <h2>
        <MessageSquareText aria-hidden="true" size={20} />
        Gotowe komentarze
      </h2>
      <p className="muted">SuperAdministrator może ustawić tekst odpowiedzi zależny od wyniku screeningu dla tej listy.</p>
      {statuses.map((status) => (
        <div className="form-row" key={status}>
          <label>{statusLabels[status]}</label>
          <textarea
            className="textarea compact-textarea"
            value={values[status]}
            onChange={(event) => setValues((current) => ({ ...current, [status]: event.target.value }))}
          />
        </div>
      ))}
      <button className="button" type="button" onClick={save}>
        <Save aria-hidden="true" size={16} />
        Zapisz komentarze
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
