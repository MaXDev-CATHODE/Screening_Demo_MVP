"use client";

import { Database, Upload } from "lucide-react";
import { useState } from "react";

const sampleImport = [
  {
    name: "Imported Mixture Demo",
    productType: "MIXTURE",
    substances: [{ name: "Bisphenol A", casNumber: "80-05-7", ecNumber: "201-245-8", concentrationPercent: 0.12 }]
  },
  {
    name: "Limited Data Demo",
    productType: "ARTICLE",
    substances: [{ name: "Bisfenol A", concentrationPercent: 0.05 }]
  },
  {
    name: "Invalid Concentration Demo",
    productType: "MIXTURE",
    substances: [{ name: "Water", casNumber: "7732-18-5", ecNumber: "231-791-2", concentrationPercent: "abc" }]
  }
];

export function ProductForm({ onChanged }: { onChanged: () => void }) {
  const [message, setMessage] = useState("");

  async function createProduct(formData: FormData) {
    setMessage("");
    const payload = {
      name: String(formData.get("name") || ""),
      productType: String(formData.get("productType") || "MIXTURE"),
      substances: [
        {
          name: String(formData.get("substanceName") || ""),
          casNumber: String(formData.get("casNumber") || "") || null,
          ecNumber: String(formData.get("ecNumber") || "") || null,
          concentrationPercent: String(formData.get("concentrationPercent") || "")
        }
      ]
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Nie udało się dodać produktu.");
      return;
    }
    setMessage("Produkt dodany.");
    onChanged();
  }

  async function importDemo() {
    setMessage("");
    const response = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: sampleImport })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Import nie powiódł się.");
      return;
    }
    setMessage(`Import: utworzono ${data.created}, limited ${data.limited}, invalid ${data.invalid}.`);
    onChanged();
  }

  return (
    <div className="card">
      <span className="badge subtle">Manual data entry</span>
      <h2>Dodaj produkt</h2>
      <form action={createProduct}>
        <div className="grid two">
          <div className="form-row">
            <label>Nazwa produktu</label>
            <input className="input" name="name" defaultValue="Manual Demo Product" />
          </div>
          <div className="form-row">
            <label>Typ</label>
            <select className="select" name="productType" defaultValue="MIXTURE">
              <option value="SUBSTANCE">Substancja</option>
              <option value="MIXTURE">Mieszanina</option>
              <option value="ARTICLE">Wyrób</option>
            </select>
          </div>
          <div className="form-row">
            <label>Nazwa składnika</label>
            <input className="input" name="substanceName" defaultValue="Bisphenol A" />
          </div>
          <div className="form-row">
            <label>CAS</label>
            <input className="input" name="casNumber" defaultValue="80-05-7" />
          </div>
          <div className="form-row">
            <label>EC</label>
            <input className="input" name="ecNumber" defaultValue="201-245-8" />
          </div>
          <div className="form-row">
            <label>Stężenie %</label>
            <input className="input" name="concentrationPercent" defaultValue="0,2" />
          </div>
        </div>
        <div className="actions">
          <button className="button" type="submit">
            <Database aria-hidden="true" size={16} />
            Zapisz produkt
          </button>
          <button className="button secondary" type="button" onClick={importDemo}>
            <Upload aria-hidden="true" size={16} />
            Import demo JSON
          </button>
        </div>
      </form>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
