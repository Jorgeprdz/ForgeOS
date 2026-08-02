import { expect, test } from "@playwright/test";

const fixture = "/tests/e2e/fixtures/public-auth-touch/index.html?nav=inicio";

test.beforeEach(async ({ page }) => {
  await page.goto(fixture, { waitUntil: "networkidle" });
  await expect(page.locator("[data-forge-auth-panel]:not([hidden])")).toBeVisible();
  await expect(page.locator("[data-forge-demo-login]")).toBeVisible();
  await expect(page.locator("[data-forge-auth-google]")).toBeVisible();
});

test("required gate removes fake close controls", async ({ page }) => {
  await expect(page.locator("[data-forge-auth-close]").first()).toBeHidden();
  await expect(page.locator("[data-forge-auth-panel]")).toHaveAttribute(
    "data-forge-required-gate",
    "true",
  );
});

test("Google activates from a mobile tap exactly once", async ({ page }) => {
  const button = page.locator("[data-forge-auth-google]");
  await button.tap();
  await expect(button).toHaveText("Abriendo Google…");

  const snapshot = await page.evaluate(() => ({
    fixture: window.__AUTH_TOUCH_FIXTURE__,
    gate: window.ForgePublicAuthTouchGate?.diagnostics?.(),
  }));
  expect(snapshot.fixture.googleCalls).toBe(1);
  expect(snapshot.fixture.googleOptions.redirectTo).toContain("nav=inicio");
  expect(snapshot.gate.lastAction).toBe("GOOGLE");
  expect(snapshot.gate.activationCount).toBe(1);
});

test("demo activates from a mobile tap and exposes a visible failure", async ({ page }) => {
  await page.route("**/functions/v1/forge-demo-login", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, code: "FIXTURE_UNAVAILABLE" }),
    });
  });

  await page.locator("[data-forge-demo-login]").tap();
  await expect(page.locator("[data-forge-auth-error]")).toContainText(
    "No pudimos abrir la demo",
  );

  const snapshot = await page.evaluate(() =>
    window.ForgePublicAuthTouchGate?.diagnostics?.(),
  );
  expect(snapshot.lastAction).toBe("DEMO");
  expect(snapshot.activationCount).toBe(1);
});
