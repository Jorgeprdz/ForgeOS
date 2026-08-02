import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const viewports = [
  { name: "mobile", width: 390, height: 844, expectedJourneyColumns: 1, expectedBottomPadding: 132 },
  { name: "tablet", width: 834, height: 1112, expectedJourneyColumns: 2, expectedBottomPadding: 18 },
  { name: "desktop", width: 1440, height: 1000, expectedJourneyColumns: 5, expectedBottomPadding: 18 },
];

for (const viewport of viewports) {
  test(`${viewport.name} CRS 11 end-to-end relationship acceptance`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/tests/e2e/fixtures/crs11-end-to-end-relationship/index.html");

    await expect(page.locator("html")).toHaveAttribute("data-fixture-ready", "true");
    await expect(page.locator("[data-crs11-ready]")).toBeVisible();
    await expect(page.locator("[data-journey-grid] [data-domain]")).toHaveCount(5);
    await expect(page.locator("[data-movement-chip]")).toContainText("2");
    await expect(page.locator("[data-quote-chip]")).toContainText("2");
    await expect(page.locator("[data-policy-chip]")).toContainText("2");
    await expect(page.locator("[data-timeline] .event")).toHaveCount(5);
    await expect(page.locator("[data-promotion-state]")).toContainText("PASS");
    await expect(page.locator("[data-automation-boundary]")).toContainText("sin contacto");
    await expect(page.locator("form, input, textarea, select, button, [type=submit]")).toHaveCount(0);

    const metrics = await page.evaluate(() => {
      const main = document.querySelector("main");
      const journey = document.querySelector("[data-journey-grid]");
      const scrollingElement = document.scrollingElement;
      const rect = main.getBoundingClientRect();
      scrollingElement.scrollLeft = 1000;
      return {
        viewportWidth: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        pageScrollLeft: scrollingElement.scrollLeft,
        mainLeft: rect.left,
        mainRight: rect.right,
        bottomPadding: Number.parseFloat(getComputedStyle(main).paddingBottom),
        journeyColumns: getComputedStyle(journey).gridTemplateColumns.split(" ").filter(Boolean).length,
      };
    });

    expect(metrics.documentClientWidth).toBe(metrics.viewportWidth);
    expect(metrics.pageScrollLeft).toBe(0);
    expect(metrics.mainLeft).toBeGreaterThanOrEqual(-1);
    expect(metrics.mainRight).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.bottomPadding).toBeGreaterThanOrEqual(viewport.expectedBottomPadding);
    expect(metrics.journeyColumns).toBe(viewport.expectedJourneyColumns);

    await mkdir("artifacts/crs11-screenshots", { recursive: true });
    await page.screenshot({
      path: `artifacts/crs11-screenshots/crs11-end-to-end-${viewport.name}.png`,
      fullPage: true,
    });
  });
}
