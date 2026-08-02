import { expect, test } from "@playwright/test";

const fixture = "/tests/e2e/fixtures/advisor-compensation-070/index.html";
const shell = (state) =>
  `[data-advisor-compensation-ui="070"][data-compensation-state="${state}"]`;

test("mobile, tablet and desktop preserve truth cards and safe bottom space", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${fixture}?mode=ready`, { waitUntil: "networkidle" });
    await expect(page.locator(shell("READY"))).toBeVisible();
    await expect(page.locator('[data-compensation-card="paid"]')).toBeVisible();
    await expect(page.locator('[data-compensation-card="earned"]')).toBeVisible();
    await expect(page.locator('[data-compensation-card="potential"]')).toBeVisible();
    await expect(page.locator('[data-compensation-simulator-boundary="separate"]')).toBeVisible();

    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      paddingBottom: parseFloat(getComputedStyle(document.querySelector(".comp-shell")).paddingBottom),
    }));
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.paddingBottom).toBeGreaterThanOrEqual(100);
  }
});

test("honest states render without old figures", async ({ page }) => {
  for (const mode of ["empty", "blocked", "error", "disconnected"]) {
    const state = mode.toUpperCase();
    await page.goto(`${fixture}?mode=${mode}`, { waitUntil: "networkidle" });
    await expect(page.locator(shell(state))).toBeVisible();
    await expect(page.locator("[data-compensation-card]")).toHaveCount(0);
  }
});

test("partial and stale states remain visibly labeled", async ({ page }) => {
  await page.goto(`${fixture}?mode=partial`, { waitUntil: "networkidle" });
  await expect(page.locator(shell("PARTIAL"))).toBeVisible();
  await expect(page.getByText(/vista es parcial/i)).toBeVisible();
  await expect(page.locator('[data-compensation-card="paid"]')).toContainText("No disponible");
  await expect(page.locator(".comp-hero")).toContainText("Devengado");

  await page.goto(`${fixture}?mode=stale`, { waitUntil: "networkidle" });
  await expect(page.locator(shell("STALE"))).toBeVisible();
  await expect(page.getByText(/información desactualizada/i)).toBeVisible();
});

test("detail and six-month history expose evidence without mixing simulation", async ({ page }) => {
  await page.goto(`${fixture}?mode=ready`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-compensation-history-period]")).toHaveCount(6);
  await page.locator("[data-compensation-aggregate]").first().click();
  await expect(page.getByText("Calculation digest")).toBeVisible();
  await expect(page.getByText("Rule Pack digest")).toBeVisible();
  await expect(page.locator('[data-compensation-simulator-boundary="separate"]')).toContainText(
    "SIMULATION ≠ TRUTH",
  );
});

test("late result is rejected and route cleanup scrubs compensation state", async ({ page }) => {
  await page.goto(`${fixture}?mode=race`, { waitUntil: "domcontentloaded" });
  await page.locator('[data-comp-period-offset="-1"]').click();
  await expect(page.locator(shell("READY"))).toBeVisible();
  await page.waitForTimeout(320);

  const state = await page.evaluate(() => ({
    product: window.__COMP_070__.state(),
    events: window.__COMP_070__.events,
  }));
  expect(state.product.periodKey).not.toBe(new Date().toISOString().slice(0, 7));
  expect(state.events.some((item) => item.type === "late")).toBeTruthy();

  await page.evaluate(() => window.__COMP_070__.cleanup());
  const scrubbed = await page.evaluate(() => ({
    product: window.__COMP_070__.state(),
    rootChildren: document.getElementById("fin-root").childElementCount,
  }));
  expect(scrubbed.product).toBeNull();
  expect(scrubbed.rootChildren).toBe(0);
});
