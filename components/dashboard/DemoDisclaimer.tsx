import { AlertTriangle } from "lucide-react";

export function DemoDisclaimer() {
  return (
    <div className="disclaimer">
      <AlertTriangle aria-hidden="true" size={18} />
      <strong>Illustrative demo output.</strong>
      <span>
        Wyniki są syntetyczne i pokazują kierunek aplikacji. Finalna interpretacja regulacyjna wymaga
        zwalidowanych list źródłowych i oceny domenowej.
      </span>
    </div>
  );
}
