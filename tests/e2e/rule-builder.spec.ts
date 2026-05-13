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
  await expect(page.getByText("Gotowe komentarze")).toBeVisible();
  await page
    .locator(".comments-editor textarea")
    .first()
    .fill("Demo: komentarz MATCH zaktualizowany podczas prezentacji.");
  await page.getByRole("button", { name: "Zapisz komentarze" }).click();
  await expect(page.getByText("Komentarze zapisane.")).toBeVisible();
});
