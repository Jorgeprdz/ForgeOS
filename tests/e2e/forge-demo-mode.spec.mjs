import { expect, test } from "@playwright/test";

const canonical = "/docs/static-preview/forge-alive-material3/";
const routes = ["inicio", "pipeline", "cotizaciones", "cartera", "actividad", "comisiones"];
const profiles = [
  { id: "mobile", viewport: { width: 390, height: 844 }, hasTouch: true },
  { id: "tablet", viewport: { width: 820, height: 1180 }, hasTouch: true },
  { id: "desktop", viewport: { width: 1440, height: 900 }, hasTouch: false },
];

async function demoEnv(page, values = {}) {
  await page.route("**/env.js", route => route.fulfill({
    contentType: "application/javascript",
    body: `globalThis.__ENV__=Object.freeze(${JSON.stringify({
      SUPABASE_URL: "",
      SUPABASE_KEY: "",
      DEMO_MODE: "false",
      FORGE_DEMO_MODE: "true",
      FORGE_DEMO_ALLOW_AUTH_BYPASS: "true",
      ...values,
    })});`,
  }));
}

test("local demo preserves canonical direct routes, history, refresh, and responsive shell", async ({ browser, baseURL }) => {
  for (const profile of profiles) {
    const context = await browser.newContext(profile);
    const page = await context.newPage();
    await demoEnv(page);
    for (const route of routes) {
      await page.goto(`${baseURL}${canonical}?nav=${route}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("data-forge-auth-boundary", "demo");
      await expect(page.getByText("Modo demo — datos no productivos", { exact: true })).toBeVisible();
      await expect(page.locator("[data-forge-module-viewport]")).toBeVisible();
      expect(page.url()).toContain("forge-alive-material3");
      expect(page.url()).not.toContain("mobile-daily");
      expect(page.url()).not.toContain("forge-alive-runtime");
    }
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-forge-auth-boundary", "demo");
    await page.goto(`${baseURL}${canonical}?nav=inicio`);
    await page.goto(`${baseURL}${canonical}?nav=cartera`);
    await page.goBack();
    expect(page.url()).toContain("nav=inicio");
    await page.goForward();
    expect(page.url()).toContain("nav=cartera");
    await context.close();
  }
});

test("disabled demo remains anonymous and local actor is never a Supabase session", async ({ page, baseURL }) => {
  await demoEnv(page, { FORGE_DEMO_MODE: "false", FORGE_DEMO_ALLOW_AUTH_BYPASS: "false" });
  await page.goto(`${baseURL}${canonical}?nav=cartera`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).not.toHaveAttribute("data-forge-auth-boundary", "demo");
  expect(await page.evaluate(() => globalThis.ForgeDemoMode?.actor)).toBeNull();
  expect(await page.evaluate(() => globalThis.ForgeDemoMode?.supabaseSession)).toBeNull();
});

test("demo blocks remote reads, real mutations, and browser-controlled activation", async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    localStorage.setItem("FORGE_DEMO_MODE", "true");
    sessionStorage.setItem("FORGE_DEMO_ALLOW_AUTH_BYPASS", "true");
    document.cookie = "FORGE_DEMO_MODE=true";
  });
  await demoEnv(page);
  await page.goto(`${baseURL}${canonical}?nav=inicio&demo=true&skipLogin=true`, { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(async () => {
    const actor = globalThis.ForgeDemoMode.actor;
    const errors = [];
    for (const action of [
      () => fetch("https://example.com/private"),
      () => fetch("/api/write", { method: "POST" }),
      () => globalThis.ForgeDemoMode.assertNoPrivateRead("acceptance"),
    ]) {
      try { await action(); } catch (error) { errors.push(error.message); }
    }
    return { actor, session: globalThis.ForgeDemoMode.supabaseSession, errors };
  });
  expect(result.actor).toEqual({ id: "forge-demo-user", displayName: "Usuario Demo", role: "advisor-demo", isDemo: true });
  expect(result.session).toBeNull();
  expect(result.errors.join(" ")).toContain("FORGE_DEMO_REMOTE_NETWORK_BLOCKED");
  expect(result.errors.join(" ")).toContain("FORGE_DEMO_REAL_MUTATION_BLOCKED");
  expect(result.errors.join(" ")).toContain("FORGE_DEMO_PRIVATE_READ_BLOCKED");
});

test("inconsistent local configuration rejects application bootstrap", async ({ page, baseURL }) => {
  await demoEnv(page, { FORGE_DEMO_ALLOW_AUTH_BYPASS: "false" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${baseURL}${canonical}`, { waitUntil: "domcontentloaded" });
  await expect.poll(() => errors.join(" ")).toContain("FORGE_DEMO_MODE_CONFIG_INCONSISTENT");
  await expect(page.locator("html")).not.toHaveAttribute("data-forge-auth-boundary", "demo");
});
