import { expect, test } from "@playwright/test";

test("super admin can run all client-ready demo scenarios", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /SuperAdministrator/ }).click();
  await page.waitForURL("**/screening");

  await expect(page.getByText("Result types")).toBeVisible();

  await page.getByRole("button", { name: /Pokaż VERIFICATION REQUIRED/ }).click();
  await expect(page.getByText("VERIFICATION REQUIRED", { exact: true })).toBeVisible();
  await expect(page.getByText("Rule condition met")).toBeVisible();
  await expect(page.getByText("Gotowy komentarz dla biznesu")).toBeVisible();

  await page.getByRole("button", { name: /Pokaż MATCH/ }).click();
  await expect(page.getByText("MATCH", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Formaldehyde", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Pokaż NO MATCH/ }).click();
  await expect(page.getByText("NO MATCH", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Water", exact: true })).toBeVisible();
});

test("mobile login and screening remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Product screening workflow/ })).toBeVisible();
  await page.getByRole("button", { name: /Użytkownik standardowy/ }).click();
  await page.waitForURL("**/screening");
  await expect(page.getByRole("button", { name: /Pokaż VERIFICATION REQUIRED/ })).toBeVisible();
});
