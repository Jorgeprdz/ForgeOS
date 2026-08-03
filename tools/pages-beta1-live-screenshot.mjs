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
  authenticationAuthority: null,
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
  if (response.status() >= 400 && ["script", "stylesheet"].includes(response.request().resourceType())) {
    report.failedResponses.push({
      status: response.status(),
      url: response.url(),
      resourceType: response.request().resourceType(),
    });
  }
});
page.on("requestfailed", request => {
  if (!["script", "stylesheet"].includes(request.resourceType())) return;
  report.failedRequests.push({
    url: request.url(),
    resourceType: request.resourceType(),
    failure: request.failure()?.errorText || "REQUEST_FAILED",
  });
});

async function openRoute(nav, fileName, key = nav) {
  const url = new URL(baseUrl);
  url.searchParams.set("nav", nav);
  url.searchParams.set("live_acceptance", Date.now().toString());
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outputDir}/${fileName}`, fullPage: true });
  const bodyText = (await page.locator("body").innerText()).slice(0, 12000);
  const loadedScripts = await page.locator("script[src]").evaluateAll(nodes => nodes.map(node => node.src));
  report.routes[key] = {
    requestedNav: nav,
    url: page.url(),
    status: response?.status() || null,
    title: await page.title(),
    bodyText,
    loadedScripts,
    navbarVisible: await page.locator("nav, [data-forge-nav], [data-material3-nav], [data-bottom-nav], .bottom-shell").first().isVisible().catch(() => false),
  };
}

async function inspectAuthPresentation() {
  report.authPresentation = await page.evaluate(() => {
    const panel = document.querySelector(".forge-auth-panel-067g17b1");
    const google = document.querySelector("[data-forge-auth-google]");
    const panelStyle = panel ? getComputedStyle(panel) : null;
    const buttonStyle = google ? getComputedStyle(google) : null;
    const stylesheets = [...document.styleSheets].map(sheet => sheet.href).filter(Boolean);
    const borderRadius = Number.parseFloat(panelStyle?.borderRadius || "0");
    const buttonRadius = Number.parseFloat(buttonStyle?.borderRadius || "0");
    const buttonHeight = Number.parseFloat(buttonStyle?.height || "0");
    const buttonBackground = buttonStyle?.backgroundColor || "";
    return {
      panelVisible: Boolean(panel && !panel.closest("[hidden]") && panel.getClientRects().length),
      borderRadius,
      buttonRadius,
      buttonHeight,
      buttonBackground,
      styled: borderRadius >= 12 && buttonRadius >= 8 && buttonHeight >= 38 && !["", "rgba(0, 0, 0, 0)", "transparent"].includes(buttonBackground),
      authStylesheetLoaded: stylesheets.some(href => href.includes("forge-alive-auth-entry-067g17b1.css")),
      recoveryStylesheetLoaded: stylesheets.some(href => href.includes("forge-ui-recovery.css")),
      recoveryStylesheetState: document.documentElement.dataset.forgeUiRecoveryStyles || null,
      authBoundary: document.documentElement.dataset.forgeAuthBoundary || null,
    };
  });
}

async function tryPasswordLogin() {
  if (!email || !password) return false;
  const emailInput = page.locator('input[type="email"], input[name="email"], [data-auth-email]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], [data-auth-password]').first();
  if (!await emailInput.isVisible().catch(() => false) || !await passwordInput.isVisible().catch(() => false)) return false;
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.locator('button[type="submit"], [data-auth-submit], button', { hasText: /iniciar sesión|entrar/i }).first().click();
  await page.waitForFunction(() => document.documentElement.dataset.forgeAuthBoundary === "authenticated", null, { timeout: 45000 });
  report.authenticationAuthority = "BETA_TEST_CREDENTIALS";
  return true;
}

async function tryDemoLogin() {
  const button = page.locator("[data-forge-demo-login]").first();
  if (!await button.isVisible().catch(() => false)) return false;
  const firstNavigation = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null);
  await button.click();
  await firstNavigation;
  await page.waitForURL(url => (
    url.hostname === "jorgeprdz.github.io"
    && url.pathname.endsWith("/ForgeOS/static-preview/forge-alive/")
  ), { timeout: 90000 });
  await page.waitForFunction(() => document.documentElement.dataset.forgeAuthBoundary === "authenticated", null, { timeout: 45000 });
  await page.waitForTimeout(5000);
  report.authenticationAuthority = "INTEGRATED_DEMO_SESSION";
  return true;
}

async function inspectProductiveHome() {
  report.productiveHome = await page.evaluate(() => {
    const root = document.querySelector("[data-forge-home-module]");
    const staticMocks = [...(root?.querySelectorAll("[data-home-static-mock-retired]") || [])];
    const heading = root?.querySelector(".hero h1")?.textContent?.trim() || "";
    const navbar = document.querySelector("nav, [data-forge-nav], [data-material3-nav], [data-bottom-nav], .bottom-shell");
    return {
      contract: root?.dataset.homeLiveDashboard || null,
      heading,
      navbarVisible: Boolean(navbar && navbar.getClientRects().length && getComputedStyle(navbar).visibility !== "hidden"),
      staticMockCount: staticMocks.length,
      staticMocksRetired: staticMocks.length >= 2 && staticMocks.every(node => node.hidden && node.getAttribute("aria-hidden") === "true"),
      productiveRootPresent: Boolean(root?.querySelector("[data-forge-productive-smart-widget-root]")),
      recoveryStylesheetState: document.documentElement.dataset.forgeUiRecoveryStyles || null,
      demoBannerVisible: Boolean(document.querySelector("[data-forge-demo-banner]")),
    };
  });
}

try {
  await openRoute("pipeline", "01-auth-gate.png", "anonymous");
  await inspectAuthPresentation();
  report.anonymousNavbarHidden = !report.routes.anonymous.navbarVisible;

  report.authenticated = await tryPasswordLogin().catch(() => false);
  if (!report.authenticated) report.authenticated = await tryDemoLogin().catch(error => {
    report.demoLoginError = error?.message || String(error);
    return false;
  });

  if (report.authenticated) {
    await page.screenshot({ path: `${outputDir}/02-home-authenticated.png`, fullPage: true });
    await inspectProductiveHome();

    await openRoute("pipeline", "03-pipeline-authenticated.png", "pipelineAuthenticated");
    report.pipelineBulkImportVisible = await page.locator("[data-pipeline-bulk-import]").isVisible().catch(() => false);

    await openRoute("cartera", "04-cartera-authenticated.png", "carteraAuthenticated");
    report.carteraPdfInputVisible = await page.locator("[data-cartera-pdf-input], input[type=file][accept*=pdf]").isVisible().catch(() => false);
    report.carteraDropzoneVisible = await page.locator("[data-cartera-pdf-dropzone]").isVisible().catch(() => false);

    await openRoute("pipeline", "05-pipeline-composer-surface.png", "composerAuthenticated");
    report.whatsappComposerTriggerCount = await page.locator("[data-prepare-productive-message]").count();
  } else {
    report.authenticatedCapture = "FAILED_NO_PRODUCTIVE_OR_DEMO_SESSION";
  }

  report.canonicalShell = {
    legacyMaterial3ShellDetected: Object.values(report.routes).some(route => /forge-alive-material3/.test(route?.url || "")),
    authenticatedNavbarVisible: report.productiveHome?.navbarVisible || report.routes.pipelineAuthenticated?.navbarVisible || false,
  };

  await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2));
  const summary = [
    "# ForgeOS Beta 1 — Canonical Pages live acceptance",
    "",
    `- Target: ${baseUrl}`,
    `- Browser: ${report.browserAuthority}`,
    `- Auth gate styled first paint: ${report.authPresentation?.styled ? "PASS" : "FAIL"}`,
    `- Auth stylesheet loaded: ${report.authPresentation?.authStylesheetLoaded ? "PASS" : "FAIL"}`,
    `- Anonymous navbar hidden: ${report.anonymousNavbarHidden ? "PASS" : "FAIL"}`,
    `- Authenticated/demo capture: ${report.authenticated ? `PASS (${report.authenticationAuthority})` : "FAIL"}`,
    `- Productive Home contract: ${report.productiveHome?.contract || "NOT_TESTED"}`,
    `- Static Home mock retired: ${report.productiveHome?.staticMocksRetired ?? "NOT_TESTED"}`,
    `- Authenticated navbar visible: ${report.canonicalShell.authenticatedNavbarVisible ? "PASS" : "FAIL"}`,
    `- Legacy material3 URL detected: ${report.canonicalShell.legacyMaterial3ShellDetected ? "YES" : "NO"}`,
    `- Pipeline bulk import visible: ${report.pipelineBulkImportVisible ?? "NOT_TESTED"}`,
    `- Cartera PDF input visible: ${report.carteraPdfInputVisible ?? "NOT_TESTED"}`,
    `- Cartera dropzone visible: ${report.carteraDropzoneVisible ?? "NOT_TESTED"}`,
    `- WhatsApp composer triggers: ${report.whatsappComposerTriggerCount ?? "NOT_TESTED"}`,
    `- Console errors: ${report.consoleErrors.length}`,
    `- Page errors: ${report.pageErrors.length}`,
    `- HTTP asset failures: ${report.failedResponses.length}`,
    `- Network asset failures: ${report.failedRequests.length}`,
    ...report.failedResponses.map(item => `  - ${item.status} ${item.resourceType}: ${item.url}`),
    ...report.failedRequests.map(item => `  - ${item.failure} ${item.resourceType}: ${item.url}`),
  ].join("\n");
  await writeFile(`${outputDir}/summary.md`, summary);
  console.log(summary);

  if (!report.authPresentation?.styled || !report.authPresentation?.authStylesheetLoaded) process.exitCode = 1;
  if (!report.anonymousNavbarHidden) process.exitCode = 1;
  if (!report.authenticated) process.exitCode = 1;
  if (!report.productiveHome?.contract || !report.productiveHome?.staticMocksRetired) process.exitCode = 1;
  if (!report.canonicalShell.authenticatedNavbarVisible || report.canonicalShell.legacyMaterial3ShellDetected) process.exitCode = 1;
  if (!report.pipelineBulkImportVisible || !report.carteraPdfInputVisible || !report.carteraDropzoneVisible) process.exitCode = 1;
  if (report.consoleErrors.length || report.pageErrors.length || report.failedResponses.length || report.failedRequests.length) process.exitCode = 1;
} finally {
  await browser.close();
}
