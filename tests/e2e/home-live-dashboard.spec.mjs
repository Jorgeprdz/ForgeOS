import { test, expect } from "@playwright/test";

const profiles = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 1100, height: 800 },
  { name: "desktop", width: 1600, height: 1000 },
];

for (const profile of profiles) {
  test(`${profile.name}: identity, real opportunities and hierarchy`, async ({ page }) => {
    const pageErrors = [];
    const failedRequests = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText || "failed"}`));

    await page.setViewportSize({ width: profile.width, height: profile.height });
    const startedAt = Date.now();
    await page.goto("/tests/e2e/fixtures/home-live-dashboard/index.html", {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });
    expect(Date.now() - startedAt).toBeLessThan(15_000);

    const home = page.locator("[data-forge-home-module]");
    await expect(home).toHaveAttribute("data-home-live-dashboard-state", "ready", { timeout: 10_000 });

    await expect(page.locator(".hero h1")).toHaveText("Buenos días, Alejandra");
    await expect(page.locator(".hero .subtitle")).toContainText("actividad, cartera y meta conectadas");
    await expect(page.locator(".safe-pill")).toContainText("Datos productivos");
    await expect(page.locator(".profile img")).toBeVisible();

    await expect(page.locator(".plan-card")).toBeHidden();
    await expect(page.locator(".next-card")).toBeHidden();
    await expect(page.getByText("Lariza", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Octavio", { exact: false })).toHaveCount(0);
    await expect(page.getByText("María", { exact: false })).toHaveCount(0);

    const opportunities = page.locator(".home-live-opportunity");
    await expect(opportunities).toHaveCount(3);
    await expect(opportunities.nth(0)).toContainText("Ana Torres");
    await expect(opportunities.nth(0)).toContainText("Seguimiento vencido");
    await expect(opportunities.nth(1)).toContainText("Carlos Ruiz");
    await expect(page.locator(".opportunities")).not.toContainText("%");
    await expect(page.locator(".score, .score-bar")).toHaveCount(0);

    const layout = await page.evaluate(() => {
      const summary = document.querySelector(".summary-section").getBoundingClientRect();
      const opportunities = document.querySelector(".opportunities").getBoundingClientRect();
      const home = document.querySelector("[data-forge-home-module]").getBoundingClientRect();
      return {
        summary,
        opportunities,
        home,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);

    if (profile.width >= 1200) {
      expect(Math.abs(layout.summary.y - layout.opportunities.y)).toBeLessThanOrEqual(3);
      expect(layout.summary.x).toBeLessThan(layout.opportunities.x);
      expect(layout.opportunities.right).toBeLessThanOrEqual(layout.home.right + 2);
    } else {
      expect(layout.opportunities.y).toBeGreaterThan(layout.summary.y);
      expect(Math.abs(layout.summary.x - layout.opportunities.x)).toBeLessThanOrEqual(3);
    }

    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
}
