import { test, expect } from "@playwright/test";

const PUBLIC_URL =
  process.env.FORGE_PUBLIC_DEMO_URL ||
  "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?nav=inicio";

const PRIVATE_ROUTES = Object.freeze([
  ["inicio", "[data-forge-home-module]"],
  ["pipeline", "[data-forge-pipeline-module]"],
  ["quotes", "[data-forge-quotes-module]"],
  ["cartera", "[data-forge-cartera-module]"],
  ["actividad", "[data-forge-activity-module]"],
]);

test("public demo login reaches the productive read-only runtime", async ({ page }) => {
  test.setTimeout(150_000);

  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(PUBLIC_URL, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });

  await expect(page).toHaveURL(
    /\/ForgeOS\/static-preview\/forge-alive\/\?nav=inicio/,
    { timeout: 30_000 },
  );

  const loginView = page.locator("[data-forge-auth-login-view]");
  const demoButton = page.locator("[data-forge-demo-login]");
  const privateViewport = page.locator("[data-forge-module-viewport]");
  const shellControls = page.locator("[data-forge-shell-controls]");

  await expect(loginView).toBeVisible({ timeout: 30_000 });
  await expect(demoButton).toBeVisible({ timeout: 30_000 });
  await expect(demoButton).toHaveText(/Explorar ForgeOS con datos demo/i);
  await expect(page.locator("html")).toHaveAttribute(
    "data-forge-private-navigation",
    "blocked",
    { timeout: 30_000 },
  );
  await expect(privateViewport).toBeHidden({ timeout: 30_000 });
  await expect(shellControls).toBeHidden({ timeout: 30_000 });

  await demoButton.click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-forge-auth-boundary",
    "authenticated",
    { timeout: 75_000 },
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-forge-demo-session",
    "active",
    { timeout: 45_000 },
  );
  await expect(privateViewport).toBeVisible({ timeout: 45_000 });
  await expect(shellControls).toBeVisible({ timeout: 45_000 });

  const banner = page.locator("[data-forge-demo-banner]");
  await expect(banner).toBeVisible({ timeout: 45_000 });
  await expect(banner).toContainText(/Modo demostración/i);
  await expect(banner).toContainText(/Datos ficticios/i);
  await expect(banner).toContainText(/Solo lectura/i);

  const session = await page.evaluate(async () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
      if (
        typeof bootstrap?.getClient === "function" &&
        typeof bootstrap?.getUser === "function"
      ) {
        const userResult = await bootstrap.getUser();
        const client = await bootstrap.getClient();
        const { data, error } = await client.rpc("forge_demo_current_session");
        return {
          userId: userResult?.data?.user?.id || null,
          data,
          error: error
            ? { code: error.code || null, message: error.message || String(error) }
            : null,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return { userId: null, data: null, error: { message: "BOOTSTRAP_TIMEOUT" } };
  });

  expect(session.error).toBeNull();
  expect(session.userId).toBeTruthy();
  expect(session.data?.isDemo).toBe(true);
  expect(session.data?.readOnly).toBe(true);

  for (const [routeId, moduleSelector] of PRIVATE_ROUTES) {
    if (routeId !== "inicio") {
      const routeButton = page.locator(`[data-route-id="${routeId}"]`);
      await expect(routeButton).toBeVisible({ timeout: 30_000 });
      await routeButton.click();
    }
    await expect(page.locator(moduleSelector)).toBeVisible({ timeout: 30_000 });
    await expect(privateViewport).toHaveAttribute(
      "data-active-route",
      routeId,
    );
  }

  const beforeExternalGuard = page.url();
  await page.evaluate(() => {
    const anchor = document.createElement("a");
    anchor.href = "https://wa.me/5215555555555";
    anchor.dataset.forgeExternalAction = "true";
    anchor.textContent = "acceptance external action";
    document.body.append(anchor);
    anchor.click();
  });
  await expect(page.locator(".forge-demo-toast")).toContainText(/bloqueada/i, {
    timeout: 10_000,
  });
  expect(page.url()).toBe(beforeExternalGuard);

  expect(pageErrors).toEqual([]);

  console.log("POSTMERGE_PAGES_HTTP=PASS");
  console.log("PUBLIC_ANONYMOUS_FAIL_CLOSED=PASS");
  console.log("PUBLIC_DEMO_LOGIN=PASS");
  console.log("PUBLIC_DEMO_SESSION_CLASSIFICATION=PASS");
  console.log("PUBLIC_DEMO_READ_ONLY=PASS");
  console.log("PUBLIC_DEMO_PRIVATE_NAVIGATION=PASS");
  console.log("PUBLIC_DEMO_EXTERNAL_ACTION_GUARD=PASS");
});
