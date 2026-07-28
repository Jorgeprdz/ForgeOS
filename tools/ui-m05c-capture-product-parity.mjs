import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { extname, join, normalize } from "node:path";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const output = process.env.FORGE_UI_M05C_EVIDENCE_DIR;
const browserPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(output, "FORGE_UI_M05C_EVIDENCE_DIR is required");
assert.ok(browserPath, "FORGE_CHROMIUM_PATH is required");
mkdirSync(output, { recursive: true });

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  if (pathname.endsWith("/env.js")) {
    response.writeHead(200, { "Content-Type": "text/javascript" });
    response.end(
      'window.__ENV__=Object.freeze({"SUPABASE_URL":"https://rmlxigxysujsuwzgoimv.supabase.co","SUPABASE_KEY":"public-test-value"});',
    );
    return;
  }
  let file = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!file.startsWith(root)) return response.writeHead(403).end();
  try {
    if (!extname(file)) file = join(file, "index.html");
    const content = await readFile(file);
    response.writeHead(200, { "Content-Type": {
      ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
    }[extname(file)] || "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

const fixture = {
  nativeResult: {
    prospect: "Mariana Torres",
    product: "Imagina Ser 65",
    productFamily: "Imagina Ser",
    sumInsured: 75000,
    premiumTable: { annual: 5000 },
    paymentTerm: "15 años",
    policyTerm: "30 años",
    currency: "UDI",
    benefitSummary: { blocks: [
      { type: "contribution_summary", lines: [
        { id: "premium_paying_years", value: 15, unit: "years" },
        { id: "total_contributed_udi", label: "Total aportado", value: 50000, unit: "UDI" },
      ] },
      { type: "protection_summary", lines: [
        { id: "sum_assured_udi", label: "Suma asegurada", value: 75000, unit: "UDI" },
      ] },
      { type: "retirement_scenarios", scenarios: [{
        id: "base", label: "Base",
        singlePayment: { udi: 90000, mxn: 4000000, targetAge: 65 },
        monthlyIncome: { udi: 600, mxn: 27000, targetAge: 65 },
        annualIncome: { udi: 7200, mxn: 324000, targetAge: 65 },
        accumulatedIncome: [{ toAge: 75, udi: 120000, mxn: 5400000 }],
      }] },
      { type: "missing_information", missing: ["Falta escenario desfavorable"] },
    ] },
  },
  context: { productFamily: "Imagina Ser" },
  productIntelligence: {
    schema: { id: "forge.product_intelligence.imagina_ser", version: "R13" },
    identity: { detected_product_name: "Imagina Ser 65", product_version: "2026" },
    ownership: { canonical_owner: "product-intelligence" },
    truth_status: "verified_with_missing_information",
    missing_information: ["Confirmar escenario desfavorable"],
  },
};

const base = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive-material3/?nav=cotizaciones`;
const browser = await puppeteer.launch({
  executablePath: browserPath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
try {
  for (const [name, width, height] of [
    ["quotes-product-parity-mobile.png", 390, 844],
    ["quotes-product-parity-tablet.png", 768, 1024],
    ["quotes-product-parity-desktop.png", 1440, 900],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: "networkidle0" });
    await page.waitForSelector('[data-runtime-mounted="true"]');
    await page.evaluate((packet) => {
      const input = document.querySelector("#fq-solution-online-pdf-105dr");
      const transfer = new DataTransfer();
      transfer.items.add(new File([JSON.stringify(packet)], "imagina-ser.json", { type: "application/json" }));
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, fixture);
    await page.waitForSelector('[data-product-dashboard="imagina_ser"]');
    await page.$eval("[data-quote-product-dashboard]", (node) =>
      node.scrollIntoView({ block: "start" }));
    assert.equal(await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    await page.screenshot({ path: join(output, name), fullPage: false });
    await page.close();
  }
  console.log(`PASS UI-M05C visual evidence ${output}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
