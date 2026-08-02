import { expect, test } from "@playwright/test";

const fixture = "/tests/e2e/fixtures/auth-session-controls/index.html";

test.beforeEach(async ({ page }) => {
  await page.goto(fixture, { waitUntil: "networkidle" });
  await expect(page.locator("[data-forge-auth-avatar]")).toBeVisible();
  await expect.poll(async () => page.evaluate(() =>
    window.ForgeAuthenticatedSessionControls?.diagnostics?.().authApiWrapped,
  )).toBe(true);
});

test("Google avatar opens the compact account menu on mobile", async ({ page }) => {
  await page.locator("[data-forge-auth-avatar]").tap();

  const menu = page.locator("[data-forge-session-menu]");
  await expect(menu).toBeVisible();
  await expect(menu).toContainText("Jorge Palacios");
  await expect(menu).toContainText("jorge@example.com");
  await expect(menu).toContainText("10 minutos");
  await expect(page.locator("[data-forge-auth-signout]")).toBeVisible();

  const legacyCalls = await page.evaluate(() =>
    window.__AUTH_SESSION_FIXTURE__.legacyPanelCalls,
  );
  expect(legacyCalls).toBe(0);
});

test("Cerrar sesión from the avatar menu invokes the canonical auth action once", async ({ page }) => {
  await page.locator("[data-forge-auth-avatar]").tap();
  await page.locator("[data-forge-auth-signout]").tap();

  await expect.poll(async () => page.evaluate(() =>
    window.__AUTH_SESSION_FIXTURE__.signOutCalls,
  )).toBe(1);
  await expect(page.locator("html")).toHaveAttribute("data-forge-auth-boundary", "anonymous");
  await expect(page.locator("[data-forge-session-menu]")).toBeHidden();
});

test("one-minute warning can extend the authenticated session", async ({ page }) => {
  const before = await page.evaluate(() => {
    const api = window.ForgeAuthenticatedSessionControls;
    const last = api.diagnostics().lastActivityAt;
    return {
      last,
      result: api.evaluateInactivity(last + api.idleTimeoutMs - api.warningLeadMs + 1),
    };
  });
  expect(before.result).toBe("WARNING");

  const warning = page.locator("[data-forge-session-warning]");
  await expect(warning).toBeVisible();
  await page.locator("[data-forge-session-continue]").tap();
  await expect(warning).toBeHidden();

  const after = await page.evaluate(() =>
    window.ForgeAuthenticatedSessionControls.diagnostics().lastActivityAt,
  );
  expect(after).toBeGreaterThan(before.last);
});

test("ten minutes without activity closes the session automatically", async ({ page }) => {
  const result = await page.evaluate(() => {
    const api = window.ForgeAuthenticatedSessionControls;
    const last = api.diagnostics().lastActivityAt;
    return api.evaluateInactivity(last + api.idleTimeoutMs + 1);
  });
  expect(result).toBe("SIGNING_OUT");

  await expect.poll(async () => page.evaluate(() =>
    window.__AUTH_SESSION_FIXTURE__.signOutCalls,
  )).toBe(1);
  await expect(page.locator("html")).toHaveAttribute("data-forge-auth-boundary", "anonymous");
});
