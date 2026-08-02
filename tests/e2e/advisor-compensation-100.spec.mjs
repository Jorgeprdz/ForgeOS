import { expect, test } from "@playwright/test";

const fixture = "/tests/e2e/fixtures/advisor-compensation-100/index.html";
const lateAuthFixture = "/tests/e2e/fixtures/advisor-compensation-auth-retry/index.html";
const shell = (state) =>
  `[data-advisor-compensation-ui="070"][data-compensation-state="${state}"]`;

test("authenticated Commissions reads paid truth and six-month history", async ({ page }) => {
  await page.goto(`${fixture}?mode=ready`, { waitUntil: "networkidle" });
  await expect(page.locator(shell("READY"))).toBeVisible();
  await expect(page.locator('[data-compensation-card="paid"]')).toContainText("$9,000.00");
  await expect(page.locator('[data-compensation-card="earned"]')).toContainText("$11,000.00");
  await expect(page.locator("[data-compensation-history-period]")).toHaveCount(6);
  await expect(page.locator('[data-compensation-simulator-boundary="separate"]')).toContainText("SIMULATION ≠ TRUTH");
  await expect(page.locator('a[href="?nav=comisiones"]')).toBeVisible();
});

test("logout scrubs all private compensation figures", async ({ page }) => {
  await page.goto(`${fixture}?mode=ready`, { waitUntil: "networkidle" });
  await expect(page.locator(shell("READY"))).toBeVisible();
  await page.locator("[data-logout]").click();
  await expect(page.locator("[data-forge-compensation-module]")).toHaveAttribute("data-compensation-state", "SCRUBBED");
  await expect(page.locator("[data-compensation-card]")).toHaveCount(0);
  const diagnostics = await page.evaluate(() => globalThis.__COMP_100__.module.diagnostics());
  expect(diagnostics.privateDataPresent).toBeFalsy();
});

test("expired session renders a blocked state without stale figures", async ({ page }) => {
  await page.goto(`${fixture}?mode=ready`, { waitUntil: "networkidle" });
  await expect(page.locator(shell("READY"))).toBeVisible();
  await page.locator("[data-expire]").click();
  await expect(page.locator(shell("BLOCKED"))).toBeVisible();
  await expect(page.locator(shell("BLOCKED"))).toContainText("SESSION_REQUIRED");
  await expect(page.locator("[data-compensation-card]")).toHaveCount(0);
});

test("disconnected remote authority never becomes zero income", async ({ page }) => {
  await page.goto(`${fixture}?mode=disconnected`, { waitUntil: "networkidle" });
  await expect(page.locator(shell("DISCONNECTED"))).toBeVisible();
  await expect(page.locator("[data-compensation-card]")).toHaveCount(0);
  await expect(page.locator(shell("DISCONNECTED"))).not.toContainText("$0.00");
  const calls = await page.evaluate(() => globalThis.__COMP_100__.providerCalls);
  expect(calls).toBeGreaterThanOrEqual(1);
});

test("authenticated session survives a browser reload", async ({ page }) => {
  await page.goto(`${fixture}?mode=ready`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("comp100-session", "AUTHENTICATED"));
  await page.goto(`${fixture}?mode=reload`, { waitUntil: "networkidle" });
  await expect(page.locator(shell("READY"))).toBeVisible();
  await expect(page.locator('[data-compensation-card="paid"]')).toContainText("$9,000.00");
});

test("mobile tablet and desktop keep safe bottom space without overflow", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${fixture}?mode=ready`, { waitUntil: "networkidle" });
    await expect(page.locator(shell("READY"))).toBeVisible();
    const layout = await page.evaluate(() => {
      const shellNode = document.querySelector(".comp-shell");
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        paddingBottom: Number.parseFloat(getComputedStyle(shellNode).paddingBottom),
      };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.paddingBottom).toBeGreaterThanOrEqual(100);
  }
});

test("Android late auth runtime recovers without a permanent compensation block", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(lateAuthFixture, { waitUntil: "domcontentloaded" });

  await expect(page.locator("[data-forge-compensation-module]")).toHaveAttribute(
    "data-compensation-state",
    "BLOCKED",
  );
  await expect(page.locator(shell("BLOCKED"))).toContainText(
    "ADVISOR_COMPENSATION_AUTH_RUNTIME_UNAVAILABLE",
  );

  await expect(page.locator("html")).toHaveAttribute(
    "data-advisor-compensation-auth-recovery",
    "recovered",
    { timeout: 10_000 },
  );
  await expect(page.locator("[data-forge-compensation-module]")).toHaveAttribute(
    "data-compensation-state",
    "ERROR",
  );
  await expect(page.locator(shell("ERROR"))).toContainText(
    "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_NOT_MATERIALIZED",
  );
  await expect(page.locator(shell("ERROR"))).not.toContainText(
    "ADVISOR_COMPENSATION_AUTH_RUNTIME_UNAVAILABLE",
  );

  const overflow = await page.evaluate(() => (
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  ));
  expect(overflow).toBeLessThanOrEqual(1);
});
