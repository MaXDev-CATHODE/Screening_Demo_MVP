import { ProductType, RuleConditions } from "@/lib/domain/types";

export type RuleProduct = {
  productType: ProductType;
  substances: Array<{ concentrationPercent: number }>;
};

export function evaluateRule(product: RuleProduct, conditions: RuleConditions) {
  const productTypeMatches = product.productType === conditions.productTypeEquals;
  const concentrationMatches = product.substances.some(
    (substance) => substance.concentrationPercent > conditions.concentrationGreaterThan
  );

  return productTypeMatches && concentrationMatches;
}
