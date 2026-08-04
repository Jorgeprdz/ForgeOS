import { test, expect } from "@playwright/test";

const profiles = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 1100, height: 800 },
  { name: "tablet-desktop-mode", width: 1536, height: 864 },
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
    await expect(home).toHaveAttribute("data-home-tablet-layout-palette", "FORGE_HOME_TABLET_LAYOUT_PALETTE_V1");

    await expect(page.locator(".hero h1")).toHaveText("Buenos días, Alejandra");
    await expect(page.locator(".hero .subtitle")).toContainText("actividad, cartera y meta conectadas");
    await expect(page.locator(".safe-pill")).toContainText("Datos productivos");
    await expect(page.locator(".profile img")).toBeVisible();

    await expect(page.locator(".plan-card")).toBeHidden();
    await expect(page.locator(".next-card")).toBeHidden();
    await expect(page.getByText("Lariza", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Octavio", { exact: false })).toHaveCount(0);
    await expect(page.getByText("María", { exact: false })).toHaveCount(0);

    const opportunitySurface = page.locator(".opportunities[data-home-live-opportunities]");
    await expect(opportunitySurface).toBeVisible();
    await expect(opportunitySurface).not.toHaveAttribute("hidden", "");
    await expect(opportunitySurface).not.toHaveAttribute("aria-hidden", "true");

    const opportunities = page.locator(".home-live-opportunity");
    await expect(opportunities).toHaveCount(3);
    await expect(opportunities.nth(0)).toContainText("Ana Torres");
    await expect(opportunities.nth(0)).toContainText("Seguimiento vencido");
    await expect(opportunities.nth(1)).toContainText("Carlos Ruiz");
    await expect(page.locator(".opportunities")).not.toContainText("%");
    await expect(page.locator(".score, .score-bar")).toHaveCount(0);

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const value = document.querySelector(selector)?.getBoundingClientRect();
        return value ? {
          x: value.x,
          y: value.y,
          width: value.width,
          height: value.height,
          right: value.right,
          bottom: value.bottom,
        } : null;
      };
      return {
        summary: rect(".summary-section"),
        opportunities: rect(".opportunities"),
        app: rect(".app"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);

    if (profile.width >= 1200) {
      expect(Math.abs(layout.summary.y - layout.opportunities.y)).toBeLessThanOrEqual(3);
      expect(layout.summary.x).toBeLessThan(layout.opportunities.x);
      expect(layout.opportunities.right).toBeLessThanOrEqual(layout.app.right + 2);
    } else {
      expect(layout.opportunities.y).toBeGreaterThan(layout.summary.y);
      expect(Math.abs(layout.summary.x - layout.opportunities.x)).toBeLessThanOrEqual(3);
    }

    if (profile.name === "tablet-desktop-mode") {
      const tablet = await page.evaluate(() => {
        const cards = document.querySelector(".productive-smart-widget-cards");
        const widgets = [...document.querySelectorAll(".productive-smart-widget-cards > .productive-smart-widget")];
        const recovery = [...document.querySelectorAll(".home-recovery-access button")];
        const bounds = (node) => {
          const value = node.getBoundingClientRect();
          return { x: value.x, y: value.y, width: value.width, right: value.right };
        };
        const style = (node) => getComputedStyle(node);
        return {
          gridColumns: style(cards).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
          cards: bounds(cards),
          widgets: widgets.map(bounds),
          widgetOverflow: widgets.map((node) => node.scrollWidth - node.clientWidth),
          recovery: recovery.map(bounds),
          widgetBackground: style(widgets[0]).backgroundImage,
          recoveryBackground: style(recovery[0]).backgroundImage,
          widgetBorder: style(widgets[0]).borderColor,
          recoveryBorder: style(recovery[0]).borderColor,
          metricFontSize: Number.parseFloat(style(widgets[1].querySelector(".productive-smart-widget-metric")).fontSize),
        };
      });

      expect(tablet.gridColumns).toBe(2);
      expect(Math.abs(tablet.widgets[0].width - tablet.cards.width)).toBeLessThanOrEqual(2);
      expect(tablet.widgets[1].width).toBeGreaterThan(300);
      expect(Math.abs(tablet.widgets[1].width - tablet.widgets[2].width)).toBeLessThanOrEqual(2);
      expect(Math.abs(tablet.widgets[1].y - tablet.widgets[2].y)).toBeLessThanOrEqual(2);
      expect(tablet.widgetOverflow.every((value) => value <= 1)).toBe(true);
      expect(tablet.recovery[0].width).toBeGreaterThan(tablet.recovery[1].width * 1.8);
      expect(Math.abs(tablet.recovery[1].width - tablet.recovery[2].width)).toBeLessThanOrEqual(2);
      expect(tablet.widgetBackground).toBe(tablet.recoveryBackground);
      expect(tablet.widgetBorder).toBe(tablet.recoveryBorder);
      expect(tablet.metricFontSize).toBeLessThanOrEqual(44.1);
    }

    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
}
