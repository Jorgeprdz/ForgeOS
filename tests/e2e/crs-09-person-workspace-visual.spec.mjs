import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const viewports = [
  { name: "mobile", width: 390, height: 844, expectedBottomPadding: 132 },
  { name: "tablet", width: 834, height: 1112, expectedBottomPadding: 132 },
  { name: "desktop", width: 1440, height: 1000, expectedBottomPadding: 18 },
];

for (const viewport of viewports) {
  test(`${viewport.name} productive person workspace acceptance`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(
      "/tests/e2e/fixtures/crs09-person-workspace/index.html?nav=persona&person=PERSON%3AALEJANDRA&from=cartera",
    );

    await expect(page.locator("html")).toHaveAttribute("data-fixture-ready", "true");
    const workspace = page.locator("[data-person-workspace-ready]");
    await expect(workspace).toBeVisible();
    await expect(workspace).toHaveAttribute("data-person-reference", "PERSON:ALEJANDRA");
    await expect(page.locator("[data-person-workspace-section]")).toHaveCount(8);
    await expect(page.locator('[data-person-workspace-section="TIMELINE"]')).toBeVisible();
    await expect(page.locator('[data-source-status="DEGRADED"]')).toHaveCount(1);
    await expect(page.locator("form, input, textarea, select, [type=submit]")).toHaveCount(0);

    await page.locator(".person-workspace-health summary").click();
    const metrics = await page.evaluate(() => {
      const workspaceNode = document.querySelector(".person-workspace");
      const sectionNav = document.querySelector(".person-workspace-section-nav");
      return {
        bodyWidth: document.body.scrollWidth,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        bottomPadding: Number.parseFloat(getComputedStyle(workspaceNode).paddingBottom),
        navScrollWidth: sectionNav.scrollWidth,
        navClientWidth: sectionNav.clientWidth,
      };
    });
    expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.bottomPadding).toBeGreaterThanOrEqual(viewport.expectedBottomPadding);
    expect(metrics.navScrollWidth).toBeGreaterThanOrEqual(metrics.navClientWidth);

    await mkdir("artifacts/crs09-screenshots", { recursive: true });
    await page.screenshot({
      path: `artifacts/crs09-screenshots/crs09-person-workspace-${viewport.name}.png`,
      fullPage: true,
    });
  });
}
