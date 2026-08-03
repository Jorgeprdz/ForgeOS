import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.FORGE_PAGES_URL || "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/";
const outputDir = process.env.FORGE_PAGES_EVIDENCE || "artifacts/pages-beta1-live";
const email = process.env.FORGE_BETA_TEST_EMAIL || "";
const password = process.env.FORGE_BETA_TEST_PASSWORD || "";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const report = {
  target: baseUrl,
  capturedAt: new Date().toISOString(),
  browserAuthority: "RUNNER_PREINSTALLED_GOOGLE_CHROME",
  authenticated: false,
  routes: {},
  consoleErrors: [],
  pageErrors: [],
  failedResponses: [],
  failedRequests: [],
};

page.on("console", message => {
  if (message.type() === "error") report.consoleErrors.push(message.text());
});
page.on("pageerror", error => report.pageErrors.push(error.message));
page.on("response", response => {
  if (response.status() >= 400) {
    report.failedResponses.push({
      status: response.status(),
      url: response.url(),
      resourceType: response.request().resourceType(),
    });
  }
});
page.on("requestfailed", request => {
  report.failedRequests.push({
    url: request.url(),
    resourceType: request.resourceType(),
    failure: request.failure()?.errorText || "REQUEST_FAILED",
  });
});

async function openRoute(nav, fileName) {
  const url = new URL(baseUrl);
  url.searchParams.set("nav", nav);
  url.searchParams.set("live_acceptance", Date.now().toString());
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outputDir}/${fileName}`, fullPage: true });
  const bodyText = (await page.locator("body").innerText()).slice(0, 12000);
  const loadedScripts = await page.locator("script[src]").evaluateAll(nodes => nodes.map(node => node.src));
  report.routes[nav] = {
    url: page.url(),
    status: response?.status() || null,
    title: await page.title(),
    bodyText,
    loadedScripts,
    navbarVisible: await page.locator("nav, [data-forge-nav], [data-material3-nav], [data-bottom-nav]").first().isVisible().catch(() => false),
  };
}

async function tryLogin() {
  if (!email || !password) return false;
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
  report.authenticated = await tryLogin();

  if (report.authenticated) {
    await openRoute("pipeline", "02-pipeline-authenticated.png");
    report.pipelineBulkImportVisible = await page.locator("[data-pipeline-bulk-import]").isVisible().catch(() => false);

    await openRoute("cartera", "03-cartera-authenticated.png");
    report.carteraPdfInputVisible = await page.locator("[data-cartera-pdf-input], input[type=file][accept*=pdf]").isVisible().catch(() => false);
    report.carteraDropzoneVisible = await page.locator("[data-cartera-pdf-dropzone]").isVisible().catch(() => false);

    await openRoute("pipeline", "04-pipeline-composer-surface.png");
    report.whatsappComposerTriggerCount = await page.locator("[data-prepare-productive-message]").count();
  } else {
    report.authenticatedCapture = "SKIPPED_MISSING_OR_INVALID_CREDENTIALS";
  }

  report.canonicalShell = {
    pipelineNavbarVisible: report.routes.pipeline?.navbarVisible || false,
    legacyMaterial3ShellDetected: /forge-alive-material3/.test(report.routes.pipeline?.url || ""),
  };

  await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2));
  const summary = [
    "# ForgeOS Beta 1 — Canonical Pages live acceptance",
    "",
    `- Target: ${baseUrl}`,
    `- Browser: ${report.browserAuthority}`,
    `- Canonical navbar visible: ${report.canonicalShell.pipelineNavbarVisible ? "PASS" : "FAIL"}`,
    `- Legacy material3 shell detected: ${report.canonicalShell.legacyMaterial3ShellDetected ? "YES" : "NO"}`,
    `- Authenticated capture: ${report.authenticated ? "PASS" : "SKIPPED"}`,
    `- Pipeline bulk import visible: ${report.pipelineBulkImportVisible ?? "NOT_TESTED"}`,
    `- Cartera PDF input visible: ${report.carteraPdfInputVisible ?? "NOT_TESTED"}`,
    `- Cartera dropzone visible: ${report.carteraDropzoneVisible ?? "NOT_TESTED"}`,
    `- WhatsApp composer triggers: ${report.whatsappComposerTriggerCount ?? "NOT_TESTED"}`,
    `- Console errors: ${report.consoleErrors.length}`,
    `- Page errors: ${report.pageErrors.length}`,
    `- HTTP failures: ${report.failedResponses.length}`,
    `- Network failures: ${report.failedRequests.length}`,
    ...report.failedResponses.map(item => `  - ${item.status} ${item.resourceType}: ${item.url}`),
    ...report.failedRequests.map(item => `  - ${item.failure} ${item.resourceType}: ${item.url}`),
  ].join("\n");
  await writeFile(`${outputDir}/summary.md`, summary);
  console.log(summary);

  if (!report.canonicalShell.pipelineNavbarVisible) process.exitCode = 1;
  if (report.canonicalShell.legacyMaterial3ShellDetected) process.exitCode = 1;
  if (report.authenticated && (!report.pipelineBulkImportVisible || !report.carteraPdfInputVisible || !report.carteraDropzoneVisible)) process.exitCode = 1;
} finally {
  await browser.close();
}
