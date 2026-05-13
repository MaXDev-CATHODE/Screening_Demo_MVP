import { expect, test } from "@playwright/test";

test("roles expose different navigation", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /SuperAdministrator/ }).click();
  await page.waitForURL("**/screening");
  await expect(page.getByRole("link", { name: "Listy i reguły" })).toBeVisible();

  await page.getByRole("button", { name: "Wyloguj" }).click();
  await page.getByRole("button", { name: /Użytkownik standardowy/ }).click();
  await page.waitForURL("**/screening");
  await expect(page.getByRole("link", { name: "Screening", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Listy i reguły" })).toHaveCount(0);
});
