import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const browserPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(browserPath, "FORGE_CHROMIUM_PATH is required");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url, "http://127.0.0.1").pathname,
  );
  if (pathname.endsWith("/env.js")) {
    response.writeHead(200, { "Content-Type": "text/javascript" });
    response.end(
      'window.__ENV__=Object.freeze({"SUPABASE_URL":"https://rmlxigxysujsuwzgoimv.supabase.co","SUPABASE_KEY":"public-test-value"});',
    );
    return;
  }
  const candidate = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try {
    let file = candidate;
    if (!extname(file)) file = join(file, "index.html");
    const content = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive-material3/`;
const browser = await puppeteer.launch({
  executablePath: browserPath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

try {
  const page = await browser.newPage();
  const errors = [];
  let legacyDocumentFetches = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("nueva-cotizacion/index.html")) {
      legacyDocumentFetches += 1;
    }
  });
  for (const [width, height] of [
    [320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900], [844, 390],
  ]) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(`${url}?nav=cotizaciones`, { waitUntil: "networkidle0" });
    await page.waitForSelector('[data-forge-quotes-module][data-runtime-mounted="true"]');
    const state = await page.evaluate(() => {
      const visible = (node) =>
        Boolean(node?.getClientRects().length)
        && getComputedStyle(node).visibility !== "hidden";
      return {
        route: document.body.dataset.forgeRoute,
        homeHidden: document.querySelector("[data-forge-home-module]").hidden,
        homeVisible: visible(document.querySelector("[data-forge-home-module]")),
        navs: [...document.querySelectorAll("[data-forge-nav-pill]")]
          .filter(visible).length,
        orbs: [...document.querySelectorAll("[data-forge-command-orb]")]
          .filter(visible).length,
        sheets: document.querySelectorAll("[data-forge-alfred-sheet]").length,
        active: document.querySelector("[data-forge-nav-pill] [aria-current=page]")
          ?.dataset.routeId,
        legacyVisible: [...document.querySelectorAll(
          ".bottom-nav,.forge-mobile-nav-r16c5j,.fq-top-105dr",
        )].some(visible),
        legacySidebarDom: document.querySelectorAll(
          ".dw-sidebar-056y,.sidebar,[data-forge-legacy-sidebar]",
        ).length,
        legacyBack: [...document.querySelectorAll("a,button")].filter(
          (node) => /volver a (inicio|cotizaciones)/i.test(node.textContent),
        ).length,
        legacyLabels: ["Clientes", "Pólizas", "Reportes"].filter((label) =>
          [...document.querySelectorAll("nav a,nav button")].some(
            (node) => node.textContent.trim() === label,
          )
        ).length,
        publicConfigValid: globalThis.__FORGE_PUBLIC_CONFIG_STATE__?.valid,
        publicBanner: document.querySelectorAll(
          "[data-forge-public-config-notice]",
        ).length,
        overflow: document.documentElement.scrollWidth
          > document.documentElement.clientWidth,
      };
    });
    assert.deepEqual(state, {
      route: "quotes",
      homeHidden: true,
      homeVisible: false,
      navs: 1,
      orbs: 1,
      sheets: 1,
      active: "quotes",
      legacyVisible: false,
      legacySidebarDom: 0,
      legacyBack: 0,
      legacyLabels: 0,
      publicConfigValid: true,
      publicBanner: 0,
      overflow: false,
    });
  }
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${url}?nav=cotizaciones`, { waitUntil: "networkidle0" });
  await page.waitForSelector('[data-forge-quotes-module][data-runtime-mounted="true"]');
  await page.waitForFunction(() =>
    Boolean(globalThis.ForgeQuoteIntakeState && globalThis.ForgeQuoteCalculators)
  );
  await page.evaluate(() => {
    const packet = {
      nativeResult: {
        prospect: "Fixture pública",
        product: "Imagina Ser 65",
        productFamily: "Imagina Ser",
        sumInsured: "75,000 UDI",
        premiumTable: { annual: 10 },
        paymentTerm: "1 año",
        policyTerm: "1 año",
        currency: "UDI",
        benefitSummary: {
          blocks: [
            {
              type: "contribution_summary",
              lines: [
                { id: "premium_paying_years", value: 15, unit: "years" },
                { id: "total_contributed_udi", label: "Total aportado", value: 50000, unit: "UDI" },
              ],
            },
            {
              type: "protection_summary",
              lines: [{ id: "sum_assured_udi", label: "Suma asegurada", value: 75000, unit: "UDI" }],
            },
            {
              type: "retirement_scenarios",
              scenarios: [{
                id: "base",
                label: "Base",
                singlePayment: { udi: 90000, mxn: 4000000, targetAge: 65 },
                monthlyIncome: { udi: 600, mxn: 27000, targetAge: 65 },
                accumulatedIncome: [{ toAge: 75, udi: 120000, mxn: 5400000 }],
              }],
            },
          ],
        },
      },
      context: { productFamily: "Imagina Ser" },
      productIntelligence: {
        schema: { id: "forge.product_intelligence.imagina_ser", version: "R13" },
        identity: { detected_product_name: "Imagina Ser 65", product_version: "2026" },
        ownership: { canonical_owner: "product-intelligence" },
        truth_status: "verified",
      },
    };
    const input = document.querySelector("#fq-solution-online-pdf-105dr");
    const transfer = new DataTransfer();
    transfer.items.add(new File(
      [JSON.stringify(packet)],
      "fixture-publica.json",
      { type: "application/json" },
    ));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(() =>
    globalThis.ForgeQuoteIntakeState.getState() === "READY"
  );
  await page.waitForSelector('[data-quote-product-dashboard][data-product-dashboard="imagina_ser"]');
  const richResult = await page.evaluate(() => ({
    dashboard: document.querySelector("[data-quote-product-dashboard]")?.dataset.productDashboard,
    sections: [...document.querySelectorAll("[data-product-section]")]
      .map((node) => node.dataset.productSection),
    owner: document.querySelector("[data-quote-truth-state]")?.textContent,
    scenarioLabels: [...document.querySelectorAll(".quotes-intelligence-scenario dt")]
      .map((node) => node.textContent),
  }));
  assert.equal(richResult.dashboard, "imagina_ser");
  assert.ok(richResult.sections.includes("contribution"));
  assert.ok(richResult.sections.includes("construction"));
  assert.match(richResult.owner, /product-intelligence/);
  assert.ok(richResult.scenarioLabels.includes("Pago único"));
  assert.ok(richResult.scenarioLabels.includes("Ingreso mensual"));
  assert.ok(richResult.scenarioLabels.some((label) => label.includes("edad 75")));
  for (const [width, height] of [
    [320, 568], [360, 800], [375, 667], [390, 844], [430, 932],
    [768, 1024], [1024, 768], [1440, 900], [844, 390],
  ]) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    const resultLayout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth
        > document.documentElement.clientWidth,
      dashboardVisible: Boolean(
        document.querySelector("[data-quote-product-dashboard]")?.getClientRects().length,
      ),
      visibleSections: [...document.querySelectorAll("[data-product-section]")]
        .filter((node) => node.getClientRects().length).length,
      unlabeledControls: [...document.querySelectorAll("button,input,textarea")]
        .filter((node) => !node.disabled && !node.hidden)
        .filter((node) => !node.getAttribute("aria-label")
          && !node.closest("label")
          && !node.labels?.length
          && !node.textContent.trim()).length,
    }));
    assert.equal(resultLayout.overflow, false, `${width}x${height} overflow`);
    assert.equal(resultLayout.dashboardVisible, true);
    assert.ok(resultLayout.visibleSections >= 2);
    assert.equal(resultLayout.unlabeledControls, 0);
  }
  assert.equal(
    await page.$eval(".fq-send-pdf-105dr", (button) => button.disabled),
    false,
  );
  await page.type("#fq-client-105dr", " conserva");
  const beforeAlfred = await page.$eval("#fq-client-105dr", (input) => input.value);
  await page.click("[data-forge-command-orb]");
  await page.waitForSelector(".alfred-sheet.open");
  await page.click("[data-close-alfred]");
  assert.equal(
    await page.$eval("#fq-client-105dr", (input) => input.value),
    beforeAlfred,
  );
  await page.goto(`${url}?nav=inicio`, { waitUntil: "networkidle0" });
  await page.click('[data-route-id="quotes"]');
  await page.waitForFunction(() => document.body.dataset.forgeRoute === "quotes");
  await page.goBack();
  await page.waitForFunction(() => document.body.dataset.forgeRoute === "inicio");
  await page.goForward();
  await page.waitForFunction(() => document.body.dataset.forgeRoute === "quotes");
  assert.deepEqual(errors, []);
  assert.equal(legacyDocumentFetches, 0);
  console.log("PASS UI-M05 Chromium quotes shell integration");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
