"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { RuleSummary } from "@/components/dashboard/RuleSummary";
import { RuleBuilder } from "@/components/forms/RuleBuilder";

type ReferenceList = {
  id: string;
  name: string;
  description: string | null;
  items: Array<{ id: string; name: string | null; casNumber: string | null; ecNumber: string | null }>;
  rules: Array<{
    id: string;
    name: string;
    active: boolean;
    conditions: { productTypeEquals: string; concentrationGreaterThan: number };
    outcomeStatus: string;
  }>;
};

export default function ReferenceListsPage() {
  const [lists, setLists] = useState<ReferenceList[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/reference-lists");
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Nie udało się pobrać list.");
      return;
    }
    setLists(data.items);
    setSelectedId((current) => current || data.items.find((list: ReferenceList) => list.name === "SVHC demo list")?.id || data.items[0]?.id || "");
  }

  async function createList() {
    setMessage("");
    const response = await fetch("/api/reference-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Client demo watch list",
        description: "Lista utworzona podczas demo.",
        active: true,
        items: [{ name: "Toluene", casNumber: "108-88-3", ecNumber: "203-625-9" }]
      })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Nie udało się utworzyć listy.");
      return;
    }
    setMessage("Lista utworzona.");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  const selected = lists.find((list) => list.id === selectedId);

  return (
    <div className="grid two">
      <div className="card">
        <span className="badge subtle">Global reference data</span>
        <h2>Listy referencyjne</h2>
        <p className="muted">
          Te dane są globalne dla SaaS-a. Produkty firmy są sprawdzane względem wybranej listy i jej reguł.
        </p>
        <button className="button secondary" onClick={createList}>
          <Plus aria-hidden="true" size={16} />
          Dodaj przykładową listę
        </button>
        {message ? <p className="muted">{message}</p> : null}
        <div className="form-row" style={{ marginTop: 12 }}>
          <label>Aktywna lista</label>
          <select className="select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
        {selected ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>CAS</th>
                  <th>EC</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name ?? "-"}</td>
                    <td>{item.casNumber ?? "-"}</td>
                    <td>{item.ecNumber ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      <div className="grid">
        {selected ? <RuleBuilder referenceListId={selected.id} onChanged={load} /> : null}
        {selected?.rules.map((rule) => <RuleSummary key={rule.id} rule={rule} />)}
      </div>
    </div>
  );
}
