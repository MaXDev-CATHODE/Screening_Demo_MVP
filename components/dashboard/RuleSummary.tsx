"use client";

type Rule = {
  id: string;
  name: string;
  active: boolean;
  conditions: {
    productTypeEquals: string;
    concentrationGreaterThan: number;
  };
  outcomeStatus: string;
};

export function RuleSummary({ rule }: { rule: Rule }) {
  return (
    <div className="card">
      <span className={`badge ${rule.active ? "success" : "warning"}`}>
        {rule.active ? "Aktywna" : "Nieaktywna"}
      </span>
      <h3>{rule.name}</h3>
      <p>
        Jeśli typ produktu to <strong>{rule.conditions.productTypeEquals}</strong> oraz stężenie
        jest większe niż <strong>{rule.conditions.concentrationGreaterThan}%</strong>, wynik to{" "}
        <strong>{rule.outcomeStatus}</strong>.
      </p>
    </div>
  );
}
