import { expect, test } from "@playwright/test";

test("super admin lands on SaaS dashboard with demo proof panels", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /SuperAdministrator/ }).click();
  await page.waitForURL("**/dashboard");

  await expect(page.getByText("SaaS command center")).toBeVisible();
  await expect(page.getByText("Demo workflow")).toBeVisible();
  await expect(page.getByText("Architecture proof")).toBeVisible();
  await expect(page.getByText("Global reference data vs company workspace")).toBeVisible();
  await expect(page.getByText("Render Postgres")).toBeVisible();
  await expect(page.getByText("GitHub Actions")).toBeVisible();
});

test("mobile dashboard remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByRole("button", { name: /SuperAdministrator/ }).click();
  await page.waitForURL("**/dashboard");

  await expect(page.getByText("SaaS command center")).toBeVisible();
  await expect(page.getByText("Firmy", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Screening", exact: true })).toBeVisible();
});
