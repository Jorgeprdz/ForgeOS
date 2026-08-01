import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const required = [
  "FORGE_PUPPETEER_CORE_PATH",
  "FORGE_CHROMIUM_PATH",
  "FORGE_REP16F_PRODUCTION_URL",
  "FORGE_REP16F_EXPECTED_MAIN_SHA",
  "FORGE_REP16F_EVIDENCE_DIR",
];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);

const puppeteer = (await import(process.env.FORGE_PUPPETEER_CORE_PATH)).default;
const evidenceDir = process.env.FORGE_REP16F_EVIDENCE_DIR;
mkdirSync(evidenceDir, { recursive: true });

const origin = new URL(process.env.FORGE_REP16F_PRODUCTION_URL).origin;
const prefix = "/ForgeOS";
const expectedAssets = [
  `${prefix}/build-info.json`,
  `${prefix}/env.js`,
  `${prefix}/static-preview/forge-alive/index.html`,
  `${prefix}/static-preview/forge-alive/app.js`,
  `${prefix}/static-preview/forge-alive/activity-module.js`,
  `${prefix}/static-preview/forge-alive/activity-ledger-reporting-bridge.js`,
  `${prefix}/static-preview/forge-alive/activity-ledger-reporting-bridge.mjs`,
  `${prefix}/advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.js`,
  `${prefix}/advisor-os/reporting/runtime/activity-reporting-runtime.js`,
  `${prefix}/advisor-os/reporting/runtime/universal-reporting-kernel.js`,
  `${prefix}/platform/event-evidence/canonical-activity-event-contract.js`,
  `${prefix}/platform/event-evidence/activity-ledger-contract.js`,
  `${prefix}/platform/event-evidence/activity-ledger-local-store.js`,
  `${prefix}/platform/event-evidence/activity-ledger-sync-service.js`,
  `${prefix}/platform/event-evidence/activity-ledger-supabase-gateway.js`,
  `${prefix}/platform/event-evidence/activity-ledger-browser-runtime.js`,
];

const assetResults = [];
for (const pathname of expectedAssets) {
  const target = new URL(pathname, origin);
  target.searchParams.set("rep16f", `${Date.now()}-${assetResults.length}`);
  const response = await fetch(target, {
    redirect: "manual",
    headers: { "cache-control": "no-cache" },
  });
  assetResults.push({
    pathname,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get("content-type"),
    location: response.headers.get("location"),
  });
}

const browser = await puppeteer.launch({
  executablePath: process.env.FORGE_CHROMIUM_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });

const browserEvidence = {
  responses: [],
  failedRequests: [],
  pageErrors: [],
  consoleErrors: [],
  state: null,
};
page.on("response", (response) => {
  if (response.status() >= 400) {
    browserEvidence.responses.push({
      status: response.status(),
      url: response.url(),
      resourceType: response.request().resourceType(),
    });
  }
});
page.on("requestfailed", (request) => {
  browserEvidence.failedRequests.push({
    url: request.url(),
    resourceType: request.resourceType(),
    errorText: request.failure()?.errorText || "unknown",
  });
});
page.on("pageerror", (error) => {
  browserEvidence.pageErrors.push({ name: error.name, message: error.message });
});
page.on("console", (message) => {
  if (message.type() === "error") {
    browserEvidence.consoleErrors.push(message.text());
  }
});

const activityUrl = new URL(process.env.FORGE_REP16F_PRODUCTION_URL);
activityUrl.searchParams.set("nav", "actividad");
activityUrl.searchParams.set("v", process.env.FORGE_REP16F_EXPECTED_MAIN_SHA);
activityUrl.searchParams.set("rep16f", String(Date.now()));

try {
  await page.goto(activityUrl, { waitUntil: "networkidle2", timeout: 60_000 });
} catch (error) {
  browserEvidence.navigationError = error.message;
}

browserEvidence.state = await page.evaluate(() => ({
  href: location.href,
  title: document.title,
  htmlDataset: { ...document.documentElement.dataset },
  bodyDataset: { ...document.body.dataset },
  shellReady: document.documentElement.dataset.forgeShellReady || null,
  route: document.body.dataset.forgeRoute || null,
  activityRoutePresent: Boolean(document.querySelector('[data-route-id="actividad"]')),
  activityRouteVisible: Boolean(
    document.querySelector('[data-route-id="actividad"]')?.getClientRects().length,
  ),
  activitySurfacePresent: Boolean(document.querySelector("[data-activity-surface]")),
  productiveBootstrapPresent: Boolean(
    globalThis.ForgeProductiveProspectBootstrap067G17B?.getClient,
  ),
  authRuntime: document.documentElement.dataset.forgeAuthRuntime || null,
  ledgerRuntime: document.documentElement.dataset.activityLedgerRuntime || null,
  reportingRuntime: document.documentElement.dataset.activityReportingRuntime || null,
}));

await page.screenshot({
  path: join(evidenceDir, "public-activity-boot-diagnostic.png"),
  fullPage: true,
});
writeFileSync(
  join(evidenceDir, "public-activity-boot-diagnostic.html"),
  await page.content(),
);
await browser.close();

const evidence = {
  phase: "REP_16F_PUBLIC_ACTIVITY_ASSET_DIAGNOSTIC",
  expectedMainSha: process.env.FORGE_REP16F_EXPECTED_MAIN_SHA,
  assetResults,
  browser: browserEvidence,
};
writeFileSync(
  join(evidenceDir, "public-activity-asset-diagnostic.json"),
  `${JSON.stringify(evidence, null, 2)}\n`,
);

const missing = assetResults.filter((entry) => !entry.ok);
console.log(`REP_16F_PUBLIC_ASSET_CHECKS=${assetResults.length}`);
console.log(`REP_16F_PUBLIC_ASSET_FAILURES=${missing.length}`);
for (const entry of missing) {
  console.log(`REP_16F_PUBLIC_ASSET_MISSING=${entry.status}:${entry.pathname}`);
}
console.log(`REP_16F_PUBLIC_SHELL_READY=${browserEvidence.state.shellReady || "NO"}`);

assert.deepEqual(
  missing,
  [],
  `REP_16F_PUBLIC_ACTIVITY_ASSETS_MISSING=${missing.map((entry) => `${entry.status}:${entry.pathname}`).join(",")}`,
);
assert.equal(browserEvidence.state.shellReady, "true", "REP_16F_PUBLIC_SHELL_NOT_READY");
console.log("REP_16F_PUBLIC_ACTIVITY_ASSET_DIAGNOSTIC=PASS");
