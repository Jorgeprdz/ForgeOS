import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { extname, join, normalize } from "node:path";
import puppeteer from "puppeteer-core";
import { buildQuoteBenefitSummary } from "../quote-benefit-summary-engine.js";

const root = process.cwd();
const output = process.env.FORGE_UI_M05D_EVIDENCE_DIR;
const browserPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(output && browserPath);
mkdirSync(output, { recursive: true });

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  if (pathname.endsWith("/env.js")) {
    response.writeHead(200, { "Content-Type": "text/javascript" });
    response.end('window.__ENV__=Object.freeze({"SUPABASE_URL":"https://rmlxigxysujsuwzgoimv.supabase.co","SUPABASE_KEY":"public-test-value"});');
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
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive-material3/?nav=cotizaciones`;

const common = (product, blocks, intelligence = {}) => ({
  nativeResult: {
    prospect: "Mariana Torres", product, productFamily: product,
    sumInsured: 75000, premiumTable: { annual: 5000 },
    paymentTerm: "15 años", policyTerm: "30 años", currency: "UDI",
    benefitSummary: { blocks },
  },
  context: { productFamily: product },
  productIntelligence: {
    schema: { id: `forge.product_intelligence.${product.toLowerCase().replaceAll(" ", "_")}`, version: "2026" },
    identity: { detected_product_name: product, product_version: "2026" },
    ownership: { canonical_owner: "product-intelligence" },
    truth_status: "verified_with_missing_information",
    missing_information: ["Confirmar condiciones particulares con el documento fuente"],
    ...intelligence,
  },
});

const imagina = common("Imagina Ser 65", [
  { type: "contribution_summary", lines: [
    { id: "premium_paying_years", value: 15, unit: "years" },
    { id: "total_contributed_udi", label: "Total aportado", value: 50000, unit: "UDI" },
  ] },
  { type: "protection_summary", lines: [{ id: "sum_assured_udi", label: "Suma asegurada", value: 75000, unit: "UDI" }] },
  { type: "retirement_scenarios", scenarios: [{
    id: "base", label: "Base",
    singlePayment: { udi: 90000, mxn: 4000000, targetAge: 65 },
    monthlyIncome: { udi: 600, mxn: 27000, targetAge: 65 },
    annualIncome: { udi: 7200, mxn: 324000, targetAge: 65 },
    accumulatedIncome: [{ toAge: 75, udi: 120000, mxn: 5400000 }],
  }] },
]);

const vidaBlocks = buildQuoteBenefitSummary({
  productFamily: "Vida Mujer", product: "Vida Mujer",
  nativeResult: {
    product: "Vida Mujer", currency: "UDI", totalAnnualPremium: 3061.82,
    sumAssured: 50000, paymentYears: 20,
    coverages: [
      { name: "Vida Mujer (Vida Mujer)", sumAssured: 50000, annualPremium: 2926.93 },
      { name: "Beneficio de Asistencia Médica (BAM UI)", value: "Amparado", annualPremium: 0 },
      { name: "Protección por Cáncer Femenino (PCF A)", sumAssured: 50000, annualPremium: 67 },
    ],
    recommendedCoverages: [
      { name: "Protección para Complicaciones del Embarazo (PEP A)", sumAssured: 50000, annualPremium: 79.5 },
      { name: "Cuidados a Largo Plazo (CLP)", sumAssured: 100000, annualPremium: 350.7 },
    ],
    guaranteedValues: [
      {
        age: 33, annualPremiumAccumulatedWithAve: 7607, aveSurrenderValue: 4616,
        cashValue: 0, totalRecovery: 4616, basicSumAssured: 50000, recoveryPercentage: 60.69,
      },
      {
        age: 52, annualPremiumAccumulatedWithAve: 152136, aveSurrenderValue: 107486,
        cashValue: 40000, totalRecovery: 147486, basicSumAssured: 50000, recoveryPercentage: 96.94,
      },
    ],
  },
  udiProjection: { rows: Array.from({ length: 20 }, (_, index) => ({
    year: index + 1, policyYear: index + 1, projectedUdiValue: 8.82994 * Math.pow(1.04, index),
  })) },
  currencyMetadata: { currentUdiValue: 8.82994 },
});
const vida = common("Vida Mujer", vidaBlocks);
const segubeca = common("Segubeca", [
  { type: "participants", lines: [{ id: "child_or_education_beneficiary", label: "Menor asociado", value: "Sofía" }] },
  { type: "contribution_summary", lines: [{ id: "annual_premium", label: "Aportación anual", value: 2524, unit: "UDI" }] },
  { type: "education_goal", lines: [{ id: "target_amount", label: "Meta educativa", value: { udi: 30000, mxn: 264898 } }] },
  { type: "payout_options", lines: [{ id: "payout_mode", label: "Forma de entrega", value: "Pago único o mensualidades" }] },
  { type: "protection_summary", lines: [{ id: "death_benefit", label: "Protección", value: "Meta educativa protegida" }] },
]);
const orvi = common("ORVI", [], {
  identity: { detected_product_name: "ORVI", product_version: "R15" },
});
orvi.nativeResult.orviDashboardViewModel = {
  view_model_id: "orvi.dashboard.dynamic-protection-recovery-view-model.v1",
  canonical_owner: "product-intelligence", source_currency: "UDI",
  checkpoint_years: [10], navigation: [{ view_id: "protection", label: "Protección" }],
  views: {
    protection: { source_sum_assured: { value: "50,000 UDI" }, current_mxn_equivalence: { value: "$441,497 MXN" } },
    future_protection: { checkpoints: [] },
    guaranteed_recovery: { checkpoints: [{
      policy_year: 10,
      current: { cumulative_paid: { value: "12,000 UDI" }, total_recovery: { value: "8,000 UDI" } },
      future: { cumulative_paid: { value: "$147,458 MXN" }, total_recovery: { value: "$118,887 MXN" } },
    }] },
  },
  rate_context: { key: "UDI_MXN", value: 8.82994, source: "BANXICO_SIE_API", source_date: "2026-06-10" },
  disclosure_contract: { recommendation: null, human_decision_required: true, future_values_are_guaranteed: false },
};
orvi.orviDashboardViewModel = orvi.nativeResult.orviDashboardViewModel;

const jobs = [
  ["IMAGINA_SER_DESKTOP.png", 1440, 900, imagina, "imagina_ser"],
  ["IMAGINA_SER_MOBILE.png", 390, 844, imagina, "imagina_ser"],
  ["VIDA_MUJER_DESKTOP.png", 1440, 900, vida, "vida_mujer"],
  ["VIDA_MUJER_MOBILE.png", 390, 844, vida, "vida_mujer"],
  ["SEGUBECA_DESKTOP.png", 1440, 900, segubeca, "segubeca"],
  ["SEGUBECA_MOBILE.png", 390, 844, segubeca, "segubeca"],
  ["ORVI_DESKTOP.png", 1440, 900, orvi, "orvi"],
  ["ORVI_MOBILE.png", 390, 844, orvi, "orvi"],
  ["TABLET_REPRESENTATIVE_PRODUCT.png", 768, 1024, vida, "vida_mujer"],
  ["MOBILE_LANDSCAPE_REPRESENTATIVE_PRODUCT.png", 844, 390, segubeca, "segubeca"],
];

const browser = await puppeteer.launch({
  executablePath: browserPath, headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const report = [];
try {
  for (const [name, width, height, packet, type] of jobs) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: "networkidle0" });
    await page.waitForSelector('[data-runtime-mounted="true"]');
    if (type !== "orvi") {
      await page.evaluate((value) => {
        const input = document.querySelector("#fq-solution-online-pdf-105dr");
        const transfer = new DataTransfer();
        transfer.items.add(new File(
          [JSON.stringify(value)],
          "producto-real.json",
          { type: "application/json" },
        ));
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, packet);
    }
    if (type === "orvi") {
      await page.evaluate(async (value) => {
        const presenter = await import("./quote-product-intelligence-presenter.js?v=ui-m05d-002");
        const calculation = {
          ...value.nativeResult,
          ...value,
          orviDashboardViewModel: value.orviDashboardViewModel,
          productIntelligence: value.productIntelligence,
        };
        const snapshot = presenter.createQuoteResultSnapshot({ packet: value, calculation });
        presenter.renderQuoteResultSnapshot(snapshot, {
          host: document.querySelector("[data-quote-product-dashboard]"),
        });
        document.querySelector(".quotes-results").hidden = false;
      }, packet);
    }
    await page.waitForSelector(`[data-product-dashboard="${type}"]`);
    await page.$eval("[data-quote-product-dashboard]", (node) => node.scrollIntoView({ block: "start" }));
    const result = await page.evaluate(() => {
      const module = document.querySelector("[data-forge-quotes-module]");
      const nav = document.querySelector("[data-forge-nav-pill]");
      window.scrollTo(0, document.documentElement.scrollHeight);
      const last = [...module.querySelectorAll("button:not(:disabled)")].at(-1)
        || [...module.querySelectorAll("[data-product-section], [data-quote-truth-state], [data-quote-rate-metadata]")].at(-1);
      const navTop = nav.getBoundingClientRect().top;
      const lastBottom = last.getBoundingClientRect().bottom;
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        navCount: document.querySelectorAll("[data-forge-nav-pill]").length,
        alfredCount: document.querySelectorAll("[data-forge-command-orb]").length,
        reachedEnd: Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1,
        finalActionRecoverable: innerWidth >= 1200 ? lastBottom <= innerHeight : lastBottom <= navTop,
      };
    });
    assert.deepEqual(result, { overflow: false, navCount: 1, alfredCount: 1, reachedEnd: true, finalActionRecoverable: true });
    await page.$eval("[data-quote-product-dashboard]", (node) => node.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: join(output, name), fullPage: false });
    report.push({ name, width, height, product: type, ...result });
    await page.close();
  }
  writeFileSync(join(output, "UI-M05D-VISUAL-EVIDENCE.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`PASS UI-M05D visual evidence ${output}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
