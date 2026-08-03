import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.FORGE_PAGES_URL || "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/";
const outputDir = process.env.FORGE_PAGES_EVIDENCE || "artifacts/pages-beta1-live";
const email = process.env.FORGE_BETA_TEST_EMAIL || "";
const password = process.env.FORGE_BETA_TEST_PASSWORD || "";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const report = {
  target: baseUrl,
  capturedAt: new Date().toISOString(),
  authenticated: false,
  routes: {},
  consoleErrors: [],
  pageErrors: [],
};

page.on("console", message => {
  if (message.type() === "error") report.consoleErrors.push(message.text());
});
page.on("pageerror", error => report.pageErrors.push(error.message));

async function openRoute(nav, fileName) {
  const url = new URL(baseUrl);
  url.searchParams.set("nav", nav);
  url.searchParams.set("live_acceptance", Date.now().toString());
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outputDir}/${fileName}`, fullPage: true });
  report.routes[nav] = {
    url: page.url(),
    status: response?.status() || null,
    title: await page.title(),
    bodyText: (await page.locator("body").innerText()).slice(0, 12000),
  };
}

async function tryLogin() {
  if (!email || !password) return false;

  const productiveLogin = await page.evaluate(async ({ email, password }) => {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (!bootstrap?.getClient) return { available: false };
    const client = await bootstrap.getClient();
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { available: true, error: error?.message || null };
  }, { email, password }).catch(() => ({ available: false }));

  if (productiveLogin.available) {
    if (productiveLogin.error) return false;
    await page.reload({ waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2500);
    return page.evaluate(() =>
      document.documentElement.dataset.forgeAuthBoundary === "authenticated"
    );
  }

  const openAuth = page.locator("[data-forge-auth-open], [data-open-auth], button", { hasText: /iniciar sesión|entrar/i }).first();
  if (await openAuth.isVisible().catch(() => false)) await openAuth.click();

  const emailInput = page.locator('input[type="email"], input[name="email"], [data-auth-email]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], [data-auth-password]').first();
  if (!await emailInput.isVisible().catch(() => false) || !await passwordInput.isVisible().catch(() => false)) return false;

  await emailInput.fill(email);
  await passwordInput.fill(password);
  const submit = page.locator('button[type="submit"], [data-auth-submit], button', { hasText: /iniciar sesión|entrar/i }).first();
  await submit.click();
  await page.waitForTimeout(5000);
  return !await passwordInput.isVisible().catch(() => false);
}

try {
  await openRoute("pipeline", "01-pipeline-public.png");
  report.unauthenticatedProtectedNavigationRejected = await page.evaluate(() => {
    const application = document.querySelector("[data-forge-application]");
    const panel = document.querySelector("[data-forge-auth-panel]");
    return document.documentElement.dataset.forgeAuthBoundary !== "authenticated"
      && Boolean(panel && !panel.hidden)
      && Boolean(application && application.getClientRects().length === 0);
  });
  report.authenticated = await tryLogin();

  if (report.authenticated) {
    await openRoute("pipeline", "02-pipeline-authenticated.png");
    report.pipelineBulkImportVisible = await page.locator("[data-open-pipeline-bulk-import], [data-pipeline-bulk-import]").first().isVisible().catch(() => false);

    await openRoute("cartera", "03-cartera-authenticated.png");
    report.carteraPdfInputVisible = await page.locator("[data-cartera-policy-file], [data-cartera-pdf-input], input[type=file][accept*=pdf]").first().isVisible().catch(() => false);
    report.carteraDropzoneVisible = await page.locator("[data-cartera-policy-dropzone], [data-cartera-pdf-dropzone]").first().isVisible().catch(() => false);

    await openRoute("pipeline", "04-pipeline-composer-surface.png");
    report.whatsappComposerTriggerCount = await page.locator("[data-prepare-productive-message]").count();
  } else {
    report.authenticatedCapture = email && password
      ? "FAIL_INVALID_CREDENTIALS_OR_AUTH_RUNTIME"
      : "BLOCKED_MISSING_CREDENTIALS";
  }

  const assetChecks = {};
  for (const [name, relative] of Object.entries({
    bulkImport: "pipeline-bulk-import-mount.js",
    carteraIntake: "cartera-document-intake.js",
    whatsappAi: "whatsapp-ai-composer.js",
  })) {
    const assetUrl = new URL(relative, baseUrl).href;
    const response = await context.request.get(assetUrl);
    assetChecks[name] = { url: assetUrl, status: response.status(), ok: response.ok() };
  }
  report.assetChecks = assetChecks;

  await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2));
  const summary = [
    "# ForgeOS Beta 1 — Pages live acceptance",
    "",
    `- Target: ${baseUrl}`,
    `- Authenticated capture: ${report.authenticated ? "PASS" : report.authenticatedCapture}`,
    `- Unauthenticated protected navigation rejected: ${report.unauthenticatedProtectedNavigationRejected ? "PASS" : "FAIL"}`,
    `- Pipeline bulk import visible: ${report.pipelineBulkImportVisible ?? "NOT_TESTED"}`,
    `- Cartera PDF input visible: ${report.carteraPdfInputVisible ?? "NOT_TESTED"}`,
    `- Cartera dropzone visible: ${report.carteraDropzoneVisible ?? "NOT_TESTED"}`,
    `- WhatsApp composer triggers: ${report.whatsappComposerTriggerCount ?? "NOT_TESTED"}`,
    `- Public assets: ${Object.values(assetChecks).every(item => item.ok) ? "PASS" : "FAIL"}`,
    `- Console errors: ${report.consoleErrors.length}`,
    `- Page errors: ${report.pageErrors.length}`,
  ].join("\n");
  await writeFile(`${outputDir}/summary.md`, summary);
  console.log(summary);

  if (!Object.values(assetChecks).every(item => item.ok)) process.exitCode = 1;
  if (!report.unauthenticatedProtectedNavigationRejected) process.exitCode = 1;
  if (!report.authenticated) process.exitCode = 1;
  if (report.authenticated && (!report.pipelineBulkImportVisible || !report.carteraPdfInputVisible || !report.carteraDropzoneVisible)) process.exitCode = 1;
} finally {
  await browser.close();
}
