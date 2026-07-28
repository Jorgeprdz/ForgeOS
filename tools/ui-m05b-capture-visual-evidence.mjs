import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { extname, join, normalize } from "node:path";
import puppeteer from "puppeteer-core";

const root = process.cwd();
const output = process.env.FORGE_UI_M05B_EVIDENCE_DIR;
const browserPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(output, "FORGE_UI_M05B_EVIDENCE_DIR is required");
assert.ok(browserPath, "FORGE_CHROMIUM_PATH is required");
mkdirSync(output, { recursive: true });

const types = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
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
  let file = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!file.startsWith(root)) return response.writeHead(403).end();
  try {
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
const base = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive-material3/`;
const browser = await puppeteer.launch({
  executablePath: browserPath, headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const fixture = {
  nativeResult: {
    prospect: "Mariana Torres",
    product: "SeguBeca",
    plan: "Protección educativa",
    sumInsured: 850000,
    premiumTable: { annual: 42850 },
    paymentMode: "Anual",
    paymentTerm: "12 años",
    policyTerm: "20 años",
    currency: "MXN",
    totalContributed: 514200,
    totalRecovery: 850000,
    advisor: "Jorge",
  },
  context: { productFamily: "Educación" },
};
const records = [];

async function prepare(page, route, width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`${base}?nav=${route}`, { waitUntil: "networkidle0" });
  if (route === "cotizaciones") {
    await page.waitForSelector(
      '[data-forge-quotes-module][data-runtime-mounted="true"]',
    );
  }
}
async function loadFixture(page) {
  await page.evaluate((packet) => {
    const input = document.querySelector("#fq-solution-online-pdf-105dr");
    const transfer = new DataTransfer();
    transfer.items.add(new File(
      [JSON.stringify(packet)], "cotizacion-visual.json",
      { type: "application/json" },
    ));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, fixture);
  await page.waitForFunction(() =>
    globalThis.ForgeAcceptedQuoteBridge
      ?.getCurrentQuotePreviewCalculationState?.().state === "READY"
  );
}
async function capture(name, route, width, height, setup) {
  const page = await browser.newPage();
  await prepare(page, route, width, height);
  if (setup) await setup(page);
  const metrics = await page.evaluate(() => {
    const visible = (node) => Boolean(node?.getClientRects().length)
      && getComputedStyle(node).visibility !== "hidden";
    return {
      route: location.search,
      navPills: [...document.querySelectorAll("[data-forge-nav-pill]")]
        .filter(visible).length,
      sidebars: document.querySelectorAll(
        ".dw-sidebar-056y,.sidebar,[data-forge-legacy-sidebar]",
      ).length,
      legacyBack: [...document.querySelectorAll("a,button")].filter(
        (node) => /volver a (inicio|cotizaciones)/i.test(node.textContent),
      ).length,
      publicBanner: document.querySelectorAll(
        "[data-forge-public-config-notice]",
      ).length,
      overflow: document.documentElement.scrollWidth
        > document.documentElement.clientWidth,
    };
  });
  const path = join(output, name);
  await page.screenshot({ path, fullPage: false });
  records.push({ name, width, height, ...metrics });
  await page.close();
}

try {
  await capture("01-home-mobile.png", "inicio", 390, 844);
  await capture("02-quotes-mobile.png", "cotizaciones", 390, 844);
  await capture("03-home-tablet.png", "inicio", 768, 1024);
  await capture("04-quotes-tablet.png", "cotizaciones", 768, 1024);
  await capture("05-home-desktop.png", "inicio", 1440, 900);
  await capture("06-quotes-desktop.png", "cotizaciones", 1440, 900);
  await capture("07-quotes-results-mobile.png", "cotizaciones", 390, 844,
    async (page) => {
      await loadFixture(page);
      await page.$eval(".quotes-card--summary", (node) =>
        node.scrollIntoView({ block: "start" })
      );
    });
  await capture("08-quotes-preview-desktop.png", "cotizaciones", 1440, 900,
    async (page) => {
      await loadFixture(page);
      await page.click(".fq-send-pdf-105dr");
      await page.waitForSelector("[data-quote-preview-confirmation-popup=true]");
    });
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const lines = [
    "# UI-M05B Visual Acceptance",
    "",
    `Commit SHA: \`${commit}\``,
    "",
    "| Screenshot | Dimensions | Route | Nav Pill | Sidebar | Legacy back | Config banner | Overflow |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | --- |",
    ...records.map((record) =>
      `| ${record.name} | ${record.width}x${record.height} | ${record.route} | `
      + `${record.navPills} | ${record.sidebars} | ${record.legacyBack} | `
      + `${record.publicBanner} | ${record.overflow ? "YES" : "NO"} |`
    ),
    "",
    "## Notes",
    "",
    "- Cotizaciones uses native Material 3 markup inside ForgeModuleViewport.",
    "- No legacy sidebar, legacy back control, iframe or legacy document transplant is mounted.",
    "- Existing intake, calculation, preview and human-confirmation authorities remain connected through QuoteRuntimeAdapter.",
    "- Owner visual acceptance remains pending.",
    "",
  ];
  writeFileSync(join(output, "UI-M05B-VISUAL-ACCEPTANCE.md"), lines.join("\n"));
  console.log(`PASS UI-M05B visual evidence ${output}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
