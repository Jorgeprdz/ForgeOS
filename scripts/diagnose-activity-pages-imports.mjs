import { chromium } from "@playwright/test";

const baseUrl = String(process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/u, "");
const entryUrl = `${baseUrl}/static-preview/forge-aura/auth-v4.html?route=actividad&diagnostic=1`;
const candidates = [
  ["aura-router", "/static-preview/forge-aura/aura-router-v4.js"],
  ["aura-shell", "/static-preview/forge-aura/aura-shell.js"],
  ["aura-auth", "/static-preview/forge-aura/aura-auth-v4.js"],
  ["pipeline-core", "/static-preview/forge-aura/pipeline/pipeline-core.js"],
  ["pipeline-calendar", "/static-preview/forge-aura/pipeline/pipeline-calendar.js"],
  ["pipeline-adapter-pages", "/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v1.js"],
  ["pipeline-module", "/static-preview/forge-aura/pipeline/pipeline-module.js?v=pages-adapter-c5a90d95"],
  ["activity-tip-presenter", "/static-preview/forge-aura/activity/activity-tip-presenter.js"],
  ["activity-points-authority", "/platform/productivity/activity-points-authority-adapter.mjs"],
  ["report-source-adapter", "/advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.js"],
  ["reporting-runtime", "/advisor-os/reporting/runtime/activity-reporting-runtime.js"],
  ["reporting-bridge", "/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.js"],
  ["activity-runtime-adapter", "/static-preview/forge-aura/activity/activity-runtime-adapter.js?v=activity-pages-runtime-fix-003"],
  ["activity-module", "/static-preview/forge-aura/activity/activity-module.js?v=activity-pages-runtime-fix-003"],
  ["app-v4", "/static-preview/forge-aura/app-v4.js?v=activity-pages-runtime-fix-003"],
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const diagnostics = [];

page.on("console", (message) => {
  console.log(`BROWSER_CONSOLE_${message.type().toUpperCase()}=${message.text()}`);
});
page.on("pageerror", (error) => {
  console.log(`BROWSER_PAGE_ERROR=${error.name}:${error.message}`);
});
page.on("requestfailed", (request) => {
  if (request.url().startsWith(baseUrl)) {
    console.log(`BROWSER_REQUEST_FAILED=${request.url()}:${request.failure()?.errorText || "unknown"}`);
  }
});
page.on("response", (response) => {
  if (response.url().startsWith(baseUrl) && response.request().resourceType() === "script") {
    console.log(`BROWSER_SCRIPT_RESPONSE=${response.status()}:${response.headers()["content-type"] || "missing"}:${response.url()}`);
  }
});

const cdp = await context.newCDPSession(page);
await cdp.send("Log.enable");
await cdp.send("Network.enable");
cdp.on("Log.entryAdded", ({ entry }) => {
  console.log(`CDP_LOG=${entry.level}:${entry.source}:${entry.url || ""}:${entry.lineNumber ?? ""}:${entry.text}`);
});
cdp.on("Network.loadingFailed", (event) => {
  console.log(`CDP_LOADING_FAILED=${event.errorText}:${event.blockedReason || ""}:${event.corsErrorStatus?.corsError || ""}`);
});

await page.goto(entryUrl, { waitUntil: "networkidle", timeout: 60_000 });

for (const [name, path] of candidates) {
  const url = `${baseUrl}${path}`;
  const fetched = await page.evaluate(async (target) => {
    try {
      const response = await fetch(target, { cache: "no-store" });
      return {
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get("content-type") || "missing",
        length: (await response.text()).length,
      };
    } catch (error) {
      return { ok: false, error: `${error?.name || "Error"}:${error?.message || error}` };
    }
  }, url);
  console.log(`MODULE_FETCH_${name.toUpperCase().replaceAll("-", "_")}=${JSON.stringify(fetched)}`);

  const imported = await page.evaluate(async ({ target, name: moduleName }) => {
    try {
      const module = await import(`${target}${target.includes("?") ? "&" : "?"}module-diagnostic=${Date.now()}`);
      return { ok: true, exports: Object.keys(module).sort() };
    } catch (error) {
      return {
        ok: false,
        name: error?.name || "Error",
        message: error?.message || String(error),
        stack: error?.stack || "",
        moduleName,
      };
    }
  }, { target: url, name });
  console.log(`MODULE_IMPORT_${name.toUpperCase().replaceAll("-", "_")}=${JSON.stringify(imported)}`);
  diagnostics.push({ name, fetched, imported });
}

await browser.close();

const failures = diagnostics.filter((item) => !item.fetched.ok || !item.imported.ok);
console.log(`MODULE_DIAGNOSTIC_SUMMARY=${JSON.stringify(diagnostics)}`);
if (failures.length) {
  throw new Error(`ACTIVITY_MODULE_IMPORT_FAILURES=${failures.map((item) => item.name).join(",")}`);
}
console.log("ACTIVITY_MODULE_IMPORT_DIAGNOSTIC=PASS");
