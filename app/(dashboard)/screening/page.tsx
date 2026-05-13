"use client";

import { BadgeCheck, CircleHelp, Play, SearchCheck, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ScreeningResultPanel } from "@/components/dashboard/ScreeningResultPanel";
import type { ApiScreeningResult } from "@/lib/screening/screening-service";

type Product = {
  id: string;
  name: string;
  productType: string;
  dataQualityStatus: string;
  substances: Array<{ name: string; casNumber: string | null; ecNumber: string | null; concentrationPercent: number }>;
};

type ReferenceList = {
  id: string;
  name: string;
  description?: string | null;
};

const scenarios = [
  {
    label: "Pokaż VERIFICATION REQUIRED",
    productName: "Epoxy Blend A",
    listName: "SVHC demo list",
    description: "Mieszanina z Bisphenol A powyżej progu 0,1%.",
    icon: CircleHelp
  },
  {
    label: "Pokaż MATCH",
    productName: "Label Resin Sample",
    listName: "SVHC demo list",
    description: "Trafienie po CAS/EC na liście referencyjnej.",
    icon: ShieldAlert
  },
  {
    label: "Pokaż NO MATCH",
    productName: "Clean Article 12",
    listName: "SVHC demo list",
    description: "Brak trafienia dla danych demonstracyjnych.",
    icon: BadgeCheck
  },
  {
    label: "Pokaż FUZZY MATCH",
    productName: "Fuzzy Name Demo",
    listName: "SVHC demo list",
    description: "Literówka i brak CAS/EC, ale nazwa nadal wskazuje trafienie.",
    icon: SearchCheck
  }
];

export default function ScreeningPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lists, setLists] = useState<ReferenceList[]>([]);
  const [productId, setProductId] = useState("");
  const [referenceListId, setReferenceListId] = useState("");
  const [result, setResult] = useState<ApiScreeningResult | null>(null);
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/products"), fetch("/api/reference-lists")])
      .then(async ([productsResponse, listsResponse]) => {
        const productsData = productsResponse.ok ? await productsResponse.json() : { items: [] };
        const listsData = listsResponse.ok ? await listsResponse.json() : { items: [] };
        setProducts(productsData.items);
        setLists(listsData.items);
        const preferredProduct =
          productsData.items.find((product: Product) => product.name === "Epoxy Blend A") ?? productsData.items[0];
        const preferredList =
          listsData.items.find((list: ReferenceList) => list.name === "SVHC demo list") ?? listsData.items[0];
        setProductId(preferredProduct?.id ?? "");
        setReferenceListId(preferredList?.id ?? "");
      })
      .catch(() => setMessage("Nie udało się pobrać danych demo."));
  }, []);

  async function runScreening(nextProductId = productId, nextReferenceListId = referenceListId) {
    setMessage("");
    setRunning(true);
    const response = await fetch("/api/screenings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: nextProductId, referenceListId: nextReferenceListId })
    });
    const data = await response.json().catch(() => null);
    setRunning(false);
    if (!response.ok) {
      setMessage(data?.message ?? "Nie udało się uruchomić screeningu.");
      return;
    }
    setResult(data);
  }

  async function runScenario(productName: string, listName: string) {
    const product = products.find((entry) => entry.name === productName);
    const list = lists.find((entry) => entry.name === listName);
    if (!product || !list) {
      setMessage("Brakuje danych demo dla tego scenariusza. Uruchom seed ponownie.");
      return;
    }
    setProductId(product.id);
    setReferenceListId(list.id);
    await runScreening(product.id, list.id);
  }

  const selectedProduct = products.find((product) => product.id === productId);
  const selectedList = lists.find((list) => list.id === referenceListId);
  const selectedSubstanceSummary = useMemo(
    () =>
      selectedProduct?.substances
        .map(
          (substance) =>
            `${substance.name}: CAS ${substance.casNumber ?? "-"}, EC ${substance.ecNumber ?? "-"}, ${substance.concentrationPercent}%`
        )
        .join(" · "),
    [selectedProduct]
  );

  return (
    <div className="screening-layout">
      <section className="scenario-strip" aria-label="Demo scenarios">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <button
              className="scenario-button"
              disabled={!products.length || !lists.length || running}
              key={scenario.label}
              onClick={() => runScenario(scenario.productName, scenario.listName)}
              type="button"
            >
              <Icon aria-hidden="true" size={20} />
              <span>
                <strong>{scenario.label}</strong>
                <small>{scenario.description}</small>
              </span>
            </button>
          );
        })}
      </section>

      <div className="grid two">
        <div className="card run-card">
          <span className="badge subtle">Company workspace data</span>
          <h2>Uruchom screening</h2>
          <p className="muted">
            Wybierz produkt i globalną listę. Demo sprawdzi CAS, EC, nazwę, typ produktu i stężenie.
          </p>
          <div className="form-row">
            <label htmlFor="product">Produkt</label>
            <select className="select" id="product" value={productId} onChange={(event) => setProductId(event.target.value)}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.productType})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="list">Lista referencyjna</label>
            <select
              className="select"
              id="list"
              value={referenceListId}
              onChange={(event) => setReferenceListId(event.target.value)}
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
          {selectedProduct ? (
            <div className="evidence-preview">
              <div>
                <p className="eyebrow">Co zostanie sprawdzone</p>
                <strong>{selectedProduct.name}</strong>
                <p>{selectedSubstanceSummary}</p>
              </div>
              <div>
                <p className="eyebrow">Względem listy</p>
                <strong>{selectedList?.name ?? "Lista referencyjna"}</strong>
                <p>{selectedList?.description ?? "Global reference data"}</p>
              </div>
            </div>
          ) : null}
          {message ? <p className="badge danger">{message}</p> : null}
          <button className="button" onClick={() => runScreening()} disabled={!productId || !referenceListId || running}>
            <Play aria-hidden="true" size={16} />
            {running ? "Screening..." : "Uruchom screening"}
          </button>
        </div>
        <ScreeningResultPanel result={result} />
      </div>
    </div>
  );
}
