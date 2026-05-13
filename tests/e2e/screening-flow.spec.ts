import { expect, test } from "@playwright/test";

test("super admin can run all client-ready demo scenarios", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /SuperAdministrator/ }).click();
  await page.waitForURL("**/dashboard");
  await page.getByRole("link", { name: "Screening", exact: true }).click();

  await expect(page.getByText("Result types")).toBeVisible();

  await page.getByRole("button", { name: /Pokaż VERIFICATION REQUIRED/ }).click();
  await expect(page.getByText("VERIFICATION REQUIRED", { exact: true })).toBeVisible();
  await expect(page.getByText("Rule condition met")).toBeVisible();
  await expect(page.getByText("Gotowy komentarz dla biznesu")).toBeVisible();
  await expect(page.getByText("Verification workflow")).toBeVisible();
  await page.getByRole("button", { name: "Oznacz do przeglądu" }).click();
  await expect(page.getByText("Oznaczono do przeglądu")).toBeVisible();

  await page.getByRole("button", { name: /Pokaż MATCH/ }).click();
  await expect(page.getByText("MATCH", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Formaldehyde", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Pokaż NO MATCH/ }).click();
  await expect(page.getByText("NO MATCH", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Water", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /FUZZY MATCH/ }).click();
  await expect(page.getByText("MATCH", { exact: true })).toBeVisible();
  await expect(page.getByText(/Potential fuzzy name match/)).toBeVisible();
  await expect(page.getByRole("cell", { name: /NAME\s+Bisphenol A/ })).toBeVisible();
  await expect(page.getByText("Snapshot decyzji")).toBeVisible();
  await expect(page.getByText("v2026.05").first()).toBeVisible();
});

test("mobile login and screening remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Product screening workflow/ })).toBeVisible();
  await page.getByRole("button", { name: /Użytkownik standardowy/ }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByText("SaaS command center")).toBeVisible();
  await page.getByRole("link", { name: "Screening", exact: true }).click();
  await page.waitForURL("**/screening");
  await expect(page.getByRole("button", { name: /Pokaż VERIFICATION REQUIRED/ })).toBeVisible();
});
