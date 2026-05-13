"use client";

import { useEffect, useState } from "react";
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

export default function ScreeningPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lists, setLists] = useState<ReferenceList[]>([]);
  const [productId, setProductId] = useState("");
  const [referenceListId, setReferenceListId] = useState("");
  const [result, setResult] = useState<ApiScreeningResult | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/products"), fetch("/api/reference-lists")])
      .then(async ([productsResponse, listsResponse]) => {
        const productsData = productsResponse.ok ? await productsResponse.json() : { items: [] };
        const listsData = listsResponse.ok ? await listsResponse.json() : { items: [] };
        setProducts(productsData.items);
        setLists(listsData.items);
        setProductId(productsData.items[0]?.id ?? "");
        setReferenceListId(listsData.items[0]?.id ?? "");
      })
      .catch(() => setMessage("Nie udało się pobrać danych demo."));
  }, []);

  async function run() {
    setMessage("");
    const response = await fetch("/api/screenings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, referenceListId })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Nie udało się uruchomić screeningu.");
      return;
    }
    setResult(data);
  }

  const selectedProduct = products.find((product) => product.id === productId);

  return (
    <div className="grid two">
      <div className="card">
        <h2>Uruchom screening</h2>
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
          <div className="card" style={{ marginBottom: 12 }}>
            <strong>{selectedProduct.name}</strong>
            <p className="muted">
              {selectedProduct.substances
                .map((substance) => `${substance.name} CAS ${substance.casNumber ?? "-"} EC ${substance.ecNumber ?? "-"} (${substance.concentrationPercent}%)`)
                .join(", ")}
            </p>
          </div>
        ) : null}
        {message ? <p className="badge danger">{message}</p> : null}
        <button className="button" onClick={run} disabled={!productId || !referenceListId}>
          Uruchom screening
        </button>
      </div>
      <ScreeningResultPanel result={result} />
    </div>
  );
}
