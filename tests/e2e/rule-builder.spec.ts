import { expect, test } from "@playwright/test";

test("super admin can create a rule", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /SuperAdministrator/ }).click();
  await page.waitForURL("**/screening");
  await page.getByRole("link", { name: "Listy i reguły" }).click();
  await page.getByRole("button", { name: "Zapisz regułę" }).click();
  await expect(page.getByText("Reguła zapisana.")).toBeVisible();
});
