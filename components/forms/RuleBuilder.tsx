"use client";

import { GitBranch, Save } from "lucide-react";
import { useState } from "react";

const productTypeLabels: Record<string, string> = {
  SUBSTANCE: "Substancja",
  MIXTURE: "Mieszanina",
  ARTICLE: "Wyrób"
};

const outcomeLabels: Record<string, string> = {
  "verification required": "Verification required",
  match: "Match",
  "no match": "No match"
};

export function RuleBuilder({ referenceListId, onChanged }: { referenceListId: string; onChanged: () => void }) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Mieszanina powyżej 0,1%");
  const [productType, setProductType] = useState("MIXTURE");
  const [threshold, setThreshold] = useState("0.1");
  const [outcome, setOutcome] = useState("verification required");

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
    <div className="card rule-builder">
      <span className="badge subtle">Global reference data</span>
      <h2>Kreator reguły</h2>
      <p className="muted">Reguła pokazuje, że każda lista może mieć własną logikę decyzji.</p>
      <form action={saveRule}>
        <div className="form-row">
          <label>Nazwa reguły</label>
          <input className="input" name="name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="grid two compact-grid">
          <div className="form-row">
            <label>Jeśli typ produktu</label>
            <select
              className="select"
              name="productTypeEquals"
              value={productType}
              onChange={(event) => setProductType(event.target.value)}
            >
              <option value="SUBSTANCE">Substancja</option>
              <option value="MIXTURE">Mieszanina</option>
              <option value="ARTICLE">Wyrób</option>
            </select>
          </div>
          <div className="form-row">
            <label>Oraz stężenie większe niż</label>
            <input
              className="input"
              name="concentrationGreaterThan"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <label>Wtedy wynik</label>
          <select className="select" name="outcomeStatus" value={outcome} onChange={(event) => setOutcome(event.target.value)}>
            <option value="verification required">verification required</option>
            <option value="match">match</option>
            <option value="no match">no match</option>
          </select>
        </div>
        <div className="rule-preview">
          <GitBranch aria-hidden="true" size={18} />
          <span>
            Jeśli produkt = <strong>{productTypeLabels[productType]}</strong> i stężenie &gt;{" "}
            <strong>{threshold.replace(".", ",")}%</strong>, wynik = <strong>{outcomeLabels[outcome]}</strong>.
          </span>
        </div>
        <button className="button" type="submit">
          <Save aria-hidden="true" size={16} />
          Zapisz regułę
        </button>
      </form>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
