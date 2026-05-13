"use client";

import { Database, FileSpreadsheet, Upload } from "lucide-react";
import { useMemo, useState } from "react";

const sampleCsv = `Produkt;Typ;Składnik;CAS;EC;Stężenie
Imported Mixture Demo;MIXTURE;Bisphenol A;80-05-7;201-245-8;0.12
Limited Data Demo;ARTICLE;Bisfenol A;;;0.05
Invalid Concentration Demo;MIXTURE;Water;7732-18-5;231-791-2;abc`;

const productTypeLabels: Record<string, "SUBSTANCE" | "MIXTURE" | "ARTICLE"> = {
  SUBSTANCE: "SUBSTANCE",
  SUBSTANCJA: "SUBSTANCE",
  MIXTURE: "MIXTURE",
  MIESZANINA: "MIXTURE",
  ARTICLE: "ARTICLE",
  WYROB: "ARTICLE",
  WYRÓB: "ARTICLE"
};

type CsvRow = {
  productName: string;
  productType: "SUBSTANCE" | "MIXTURE" | "ARTICLE";
  substanceName: string;
  casNumber: string | null;
  ecNumber: string | null;
  concentrationPercent: string;
};

function splitCsvLine(line: string, separator: string) {
  return line.split(separator).map((value) => value.trim());
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const separator = lines[0].includes(";") ? ";" : ",";
  const headers = splitCsvLine(lines[0], separator).map((header) => header.toLowerCase());
  const indexOf = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const productIndex = indexOf("produkt", "product");
  const typeIndex = indexOf("typ", "type", "producttype");
  const substanceIndex = indexOf("składnik", "skladnik", "substance");
  const casIndex = indexOf("cas");
  const ecIndex = indexOf("ec");
  const concentrationIndex = indexOf("stężenie", "stezenie", "concentration");

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, separator);
    const rawType = (cells[typeIndex] || "MIXTURE").toUpperCase();
    return {
      productName: cells[productIndex] || "",
      productType: productTypeLabels[rawType] ?? "MIXTURE",
      substanceName: cells[substanceIndex] || "",
      casNumber: cells[casIndex] || null,
      ecNumber: cells[ecIndex] || null,
      concentrationPercent: cells[concentrationIndex] || ""
    };
  });
}

export function ProductForm({ onChanged }: { onChanged: () => void }) {
  const [message, setMessage] = useState("");
  const [csvText, setCsvText] = useState(sampleCsv);
  const previewRows = useMemo(() => parseCsv(csvText), [csvText]);

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

  async function importCsvDemo() {
    setMessage("");
    const products = previewRows.map((row) => ({
      name: row.productName,
      productType: row.productType,
      substances: [
        {
          name: row.substanceName,
          casNumber: row.casNumber,
          ecNumber: row.ecNumber,
          concentrationPercent: row.concentrationPercent
        }
      ]
    }));

    if (!products.length) {
      setMessage("CSV nie zawiera wierszy do importu.");
      return;
    }

    const response = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Import nie powiódł się.");
      return;
    }
    setMessage(`Import CSV: utworzono ${data.created}, limited ${data.limited}, invalid ${data.invalid}.`);
    onChanged();
  }

  async function loadCsvFile(file?: File) {
    if (!file) return;
    setCsvText(await file.text());
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
        </div>
      </form>

      <div className="csv-import">
        <div className="csv-import-head">
          <div>
            <span className="badge subtle">CSV import preview</span>
            <h3>Import zbioru danych</h3>
            <p className="muted">Demo pokazuje mapping kolumn przed zapisem produktów do przestrzeni firmy.</p>
          </div>
          <label className="button secondary file-button">
            <FileSpreadsheet aria-hidden="true" size={16} />
            Wczytaj CSV
            <input accept=".csv,text/csv" type="file" onChange={(event) => loadCsvFile(event.target.files?.[0])} />
          </label>
        </div>
        <div className="mapping-chips" aria-label="CSV column mapping">
          {["Produkt", "Typ", "Składnik", "CAS", "EC", "Stężenie"].map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <textarea className="textarea" value={csvText} onChange={(event) => setCsvText(event.target.value)} />
        <div className="table-wrap csv-preview">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Typ</th>
                <th>Składnik</th>
                <th>CAS</th>
                <th>EC</th>
                <th>Stężenie</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr key={`${row.productName}-${index}`}>
                  <td>{row.productName || "-"}</td>
                  <td>{row.productType}</td>
                  <td>{row.substanceName || "-"}</td>
                  <td>{row.casNumber ?? "-"}</td>
                  <td>{row.ecNumber ?? "-"}</td>
                  <td>{row.concentrationPercent || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="actions">
          <button className="button secondary" type="button" onClick={importCsvDemo}>
            <Upload aria-hidden="true" size={16} />
            Import CSV demo
          </button>
        </div>
      </div>

      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
