import { expect, test } from "@playwright/test";

test("standard user can run screening and see result", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Użytkownik standardowy/ }).click();
  await page.waitForURL("**/screening");
  await expect(page.getByRole("heading", { name: "Screening", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Uruchom screening" }).click();
  await expect(page.getByText("Gotowy komentarz")).toBeVisible();
});
