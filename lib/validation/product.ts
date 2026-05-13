import { ProductInput, SubstanceInput, isProductType } from "@/lib/domain/types";

export type ProductValidationResult = {
  ok: boolean;
  status: "READY" | "LIMITED" | "INVALID";
  errors: string[];
};

export function parseConcentrationPercent(value: number | string): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  const normalized = value.trim().replace("%", "").replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeSubstanceInput(input: SubstanceInput) {
  return {
    name: input.name.trim(),
    casNumber: input.casNumber?.trim() || null,
    ecNumber: input.ecNumber?.trim() || null,
    concentrationPercent: parseConcentrationPercent(input.concentrationPercent)
  };
}

export function validateProductInput(input: ProductInput): ProductValidationResult {
  const errors: string[] = [];

  if (!input.name?.trim()) errors.push("Product name is required.");
  if (!isProductType(input.productType)) errors.push("Product type is invalid.");
  if (!Array.isArray(input.substances) || input.substances.length === 0) {
    errors.push("At least one substance is required.");
  }

  let limited = false;
  for (const substance of input.substances ?? []) {
    const normalized = normalizeSubstanceInput(substance);
    if (!normalized.name && !normalized.casNumber && !normalized.ecNumber) {
      errors.push("Each substance needs a name, CAS or EC value.");
    }
    if (normalized.concentrationPercent === null) {
      errors.push(`Concentration for ${normalized.name || "substance"} is invalid.`);
    }
    if (!normalized.casNumber || !normalized.ecNumber) {
      limited = true;
    }
  }

  if (errors.length > 0) {
    return { ok: false, status: "INVALID", errors };
  }

  return { ok: true, status: limited ? "LIMITED" : "READY", errors: [] };
}
