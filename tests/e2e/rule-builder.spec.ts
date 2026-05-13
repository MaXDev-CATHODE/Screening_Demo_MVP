import { expect, test } from "@playwright/test";

test("super admin can preview and create a rule", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /SuperAdministrator/ }).click();
  await page.waitForURL("**/screening");
  await page.getByRole("link", { name: /Listy i regu/ }).click();

  await expect(page.getByText("Global reference data").first()).toBeVisible();
  await expect(page.locator(".rule-preview")).toContainText("Mieszanina");
  await page.getByRole("button", { name: /Zapisz regu/ }).click();
  await expect(page.getByText("Reguła zapisana.")).toBeVisible();
});
