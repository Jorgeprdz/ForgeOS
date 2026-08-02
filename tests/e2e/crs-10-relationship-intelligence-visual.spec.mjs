import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const viewports = [
  { name: "mobile", width: 390, height: 844, expectedColumns: 1, expectedBottomPadding: 132 },
  { name: "tablet", width: 834, height: 1112, expectedColumns: 1, expectedBottomPadding: 132 },
  { name: "desktop", width: 1440, height: 1000, expectedColumns: 2, expectedBottomPadding: 18 },
];

for (const viewport of viewports) {
  test(`${viewport.name} existing relationship intelligence acceptance`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/tests/e2e/fixtures/crs10-relationship-intelligence/index.html");

    await expect(page.locator("html")).toHaveAttribute("data-fixture-ready", "true");
    await expect(page.locator("[data-person-workspace-ready]")).toBeVisible();
    await expect(page.locator("[data-person-intelligence-host]")).toBeVisible();
    await expect(page.locator("[data-person-intelligence-domain]")).toHaveCount(6);
    await expect(page.locator('[data-person-intelligence-domain="PRODUCTIVITY_PROOF"]')).toContainText("Asesor");
    await expect(page.locator('[data-person-intelligence-domain="PRODUCTIVITY_PROOF"]')).toContainText("No atribuida a Alejandra Moleres");
    await expect(page.locator('[data-source-status="DEGRADED"]')).toHaveCount(1);
    await expect(page.locator('[data-source-status="UNAVAILABLE"]')).toHaveCount(1);
    await expect(page.locator("form, input, textarea, select, [type=submit]")).toHaveCount(0);
    await expect(page.getByText("Sin score oculto ni acción automática.")).toBeVisible();

    const metrics = await page.evaluate(() => {
      const workspace = document.querySelector(".person-workspace");
      const intelligence = document.querySelector(".person-intelligence-shell");
      const grid = document.querySelector(".person-intelligence-grid");
      const scrollingElement = document.scrollingElement;
      const workspaceRect = workspace.getBoundingClientRect();
      const intelligenceRect = intelligence.getBoundingClientRect();
      scrollingElement.scrollLeft = 1000;
      return {
        viewportWidth: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        pageScrollLeft: scrollingElement.scrollLeft,
        workspaceLeft: workspaceRect.left,
        workspaceRight: workspaceRect.right,
        intelligenceLeft: intelligenceRect.left,
        intelligenceRight: intelligenceRect.right,
        bottomPadding: Number.parseFloat(getComputedStyle(workspace).paddingBottom),
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length,
      };
    });

    expect(metrics.documentClientWidth).toBe(metrics.viewportWidth);
    expect(metrics.pageScrollLeft).toBe(0);
    expect(metrics.workspaceLeft).toBeGreaterThanOrEqual(-1);
    expect(metrics.workspaceRight).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.intelligenceLeft).toBeGreaterThanOrEqual(metrics.workspaceLeft - 1);
    expect(metrics.intelligenceRight).toBeLessThanOrEqual(metrics.workspaceRight + 1);
    expect(metrics.bottomPadding).toBeGreaterThanOrEqual(viewport.expectedBottomPadding);
    expect(metrics.columns).toBe(viewport.expectedColumns);

    await mkdir("artifacts/crs10-screenshots", { recursive: true });
    await page.screenshot({
      path: `artifacts/crs10-screenshots/crs10-relationship-intelligence-${viewport.name}.png`,
      fullPage: true,
    });
  });
}
