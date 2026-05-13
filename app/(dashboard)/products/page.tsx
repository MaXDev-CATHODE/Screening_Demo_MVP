"use client";

import { useEffect, useState } from "react";
import { DataQualityBadge } from "@/components/dashboard/DataQualityBadge";
import { ProductForm } from "@/components/forms/ProductForm";

type Product = {
  id: string;
  name: string;
  productType: string;
  dataQualityStatus: "READY" | "LIMITED" | "INVALID";
  substances: Array<{ name: string; casNumber: string | null; ecNumber: string | null; concentrationPercent: number }>;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/products");
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message ?? "Brak dostępu albo brak danych.");
      return;
    }
    setProducts(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid">
      <div className="section-heading">
        <span className="badge subtle">Company workspace data</span>
        <p className="muted">Produkty są widoczne w przestrzeni firmy i później trafiają do screeningu.</p>
      </div>
      <ProductForm onChanged={load} />
      <div className="card">
        <h2>Produkty firmy</h2>
        {message ? <p className="badge danger">{message}</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Typ</th>
                <th>Jakość danych</th>
                <th>Składniki</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.productType}</td>
                  <td>
                    <DataQualityBadge status={product.dataQualityStatus} />
                  </td>
                  <td>
                    {product.substances.map((substance) => (
                      <div key={`${product.id}-${substance.name}`}>
                        {substance.name} / CAS {substance.casNumber ?? "-"} / EC {substance.ecNumber ?? "-"} /{" "}
                        {substance.concentrationPercent}%
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
