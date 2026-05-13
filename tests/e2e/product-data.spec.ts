import { expect, test } from "@playwright/test";

test("company admin can add and import product data", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Administrator firmy/ }).click();
  await page.waitForURL("**/dashboard");
  await page.getByRole("link", { name: "Dane produktowe" }).click();
  await page.getByRole("button", { name: "Zapisz produkt" }).click();
  await expect(page.getByText("Produkt dodany.")).toBeVisible();
  await expect(page.getByText("CSV import workflow")).toBeVisible();
  await expect(page.getByText("Mapowanie kolumn", { exact: true })).toBeVisible();
  await expect(page.getByText("Product.name")).toBeVisible();
  await expect(page.getByText("Substance.concentrationPercent")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Limited Data Demo" })).toBeVisible();
  await page.getByRole("button", { name: "Import CSV demo" }).click();
  await expect(page.getByText(/Import CSV:/)).toBeVisible();
});
