"use client";

import { useState } from "react";

export function RuleBuilder({ referenceListId, onChanged }: { referenceListId: string; onChanged: () => void }) {
  const [message, setMessage] = useState("");

  async function saveRule(formData: FormData) {
    setMessage("");
    const payload = {
      referenceListId,
      name: String(formData.get("name") || "Mieszanina powyżej 0,1%"),
      active: true,
      conditions: {
        productTypeEquals: String(formData.get("productTypeEquals") || "MIXTURE"),
        concentrationGreaterThan: Number(String(formData.get("concentrationGreaterThan") || "0.1").replace(",", "."))
      },
      outcomeStatus: String(formData.get("outcomeStatus") || "verification required")
    };
    const response = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Nie udało się zapisać reguły.");
      return;
    }
    setMessage("Reguła zapisana.");
    onChanged();
  }

  return (
    <div className="card">
      <h2>Kreator reguły</h2>
      <form action={saveRule}>
        <div className="form-row">
          <label>Nazwa reguły</label>
          <input className="input" name="name" defaultValue="Mieszanina powyżej 0,1%" />
        </div>
        <div className="grid two">
          <div className="form-row">
            <label>Jeśli typ produktu</label>
            <select className="select" name="productTypeEquals" defaultValue="MIXTURE">
              <option value="SUBSTANCE">Substancja</option>
              <option value="MIXTURE">Mieszanina</option>
              <option value="ARTICLE">Wyrób</option>
            </select>
          </div>
          <div className="form-row">
            <label>Oraz stężenie większe niż</label>
            <input className="input" name="concentrationGreaterThan" defaultValue="0.1" />
          </div>
        </div>
        <div className="form-row">
          <label>Wtedy wynik</label>
          <select className="select" name="outcomeStatus" defaultValue="verification required">
            <option value="verification required">verification required</option>
            <option value="match">match</option>
            <option value="no match">no match</option>
          </select>
        </div>
        <button className="button" type="submit">
          Zapisz regułę
        </button>
      </form>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
