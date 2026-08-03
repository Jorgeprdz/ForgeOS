import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.FORGE_PAGES_URL || "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/";
const outputDir = process.env.FORGE_CARTERA_DIAGNOSTIC || "artifacts/pages-cartera-diagnostic";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const report = {
  target: baseUrl,
  capturedAt: new Date().toISOString(),
  console: [],
  pageErrors: [],
  failedResponses: [],
  failedRequests: [],
};

page.on("console", message => report.console.push({ type: message.type(), text: message.text() }));
page.on("pageerror", error => report.pageErrors.push(error.message));
page.on("response", response => {
  if (response.status() >= 400) report.failedResponses.push({ status: response.status(), url: response.url(), resourceType: response.request().resourceType() });
});
page.on("requestfailed", request => report.failedRequests.push({ url: request.url(), resourceType: request.resourceType(), failure: request.failure()?.errorText || "REQUEST_FAILED" }));

try {
  const url = new URL(baseUrl);
  url.searchParams.set("nav", "pipeline");
  url.searchParams.set("cartera_diagnostic", Date.now().toString());
  await page.goto(url.href, { waitUntil: "networkidle", timeout: 60000 });

  const demo = page.locator("[data-forge-demo-login]").first();
  await demo.waitFor({ state: "visible", timeout: 30000 });
  const navigation = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null);
  await demo.click();
  await navigation;
  await page.waitForURL(candidate => candidate.hostname === "jorgeprdz.github.io" && candidate.pathname.endsWith("/ForgeOS/static-preview/forge-alive/"), { timeout: 90000 });
  await page.waitForFunction(() => document.documentElement.dataset.forgeAuthBoundary === "authenticated", null, { timeout: 45000 });
  await page.waitForTimeout(4000);

  const carteraButton = page.locator('[data-route-id="cartera"]:visible').first();
  await carteraButton.waitFor({ state: "visible", timeout: 30000 });
  await carteraButton.click();
  await page.waitForFunction(() => document.querySelector("[data-forge-module-viewport]")?.dataset.activeRoute === "cartera", null, { timeout: 30000 });

  await page.waitForFunction(() => {
    const state = document.querySelector("[data-forge-cartera-module]")?.dataset.carteraMaterial3State;
    return ["ready", "error", "auth-required"].includes(state);
  }, null, { timeout: 70000 }).catch(() => null);
  await page.waitForTimeout(1500);

  Object.assign(report, await page.evaluate(() => {
    const root = document.querySelector("[data-forge-cartera-module]");
    const entry = root?.querySelector("[data-cartera-policy-entry]");
    return {
      url: location.href,
      authBoundary: document.documentElement.dataset.forgeAuthBoundary || null,
      demoSession: document.documentElement.dataset.forgeDemoSession || null,
      runtimeState: document.documentElement.dataset.carteraMaterial3Runtime || null,
      rootState: root?.dataset.carteraMaterial3State || null,
      rootText: root?.innerText?.slice(0, 6000) || null,
      rootHtml: root?.innerHTML?.slice(0, 12000) || null,
      policyEntryPresent: Boolean(entry),
      pdfButtonPresent: Boolean(entry?.querySelector("[data-select-policy-pdf]")),
      manualButtonPresent: Boolean(entry?.querySelector("[data-add-policy-manual]")),
      dropzonePresent: Boolean(entry?.querySelector("[data-cartera-policy-dropzone]")),
      loadedScripts: [...document.querySelectorAll("script[src]")].map(script => script.src),
    };
  }));

  await page.screenshot({ path: `${outputDir}/cartera-state.png`, fullPage: true });
  await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
