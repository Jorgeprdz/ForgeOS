import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(puppeteerPath, "FORGE_PUPPETEER_CORE_PATH is required");
assert.ok(chromiumPath, "FORGE_CHROMIUM_PATH is required");
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = normalize(join(root, relative));
  if (!candidate.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? join(candidate, "index.html") : candidate;
    const type = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json" }[extname(file)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": type });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote", "--single-process"]
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/docs/static-preview/forge-alive/nueva-cotizacion/`, { waitUntil: "networkidle0" });
  const result = await page.evaluate(async () => {
    const source = `UDI SeguBeca 18
Titular Menor Prueba No 25/06/2022 4 4 Masculino No
Contratante Contratante Prueba No 29/09/1992 33 31 Masculino No
SeguBeca 18 (SeguBeca 18) 14 años 30,000 2,284.33
Protección por Fallecimiento e Invalidez del Contratante (PIM 18 CT UI) 14 años Amparado 73.06
Prima Total Anual 2,524.19
ADAPTA (ADAPTA) 5 REN 100,000 418.73
Prima total con beneficios recomendados 3,080.09
0.00 % 4 2,524 2,524 0 0 0 2,284
84.89 % 17 2,524 35,339 0 30,000 30,000 30,000
La tasa de interes para entrega mensual es estimada a 1.0% anual vigente al momento de la cotización.
1 18 30,000 637 7,647 22,819 24,979
4 21 7,612 637 30,588 - 6,702
Todas las cantidades están expresadas en Unidades de Inversión (UDI).`;
    const packet = window.ForgePdfBrowserParser.parsePdfTextToAcceptedQuotePacket(source, { fileName: "segubeca-prueba.pdf" });
    const calculation = await window.ForgeAcceptedQuoteAdapter.calculateAcceptedQuote(packet);
    const input = document.querySelector("#fq-solution-online-pdf-105dr");
    const transfer = new DataTransfer();
    transfer.items.add(new File([JSON.stringify(packet)], "segubeca-prueba.accepted-quote.json", { type: "application/json" }));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 100));
    document.querySelector(".fq-send-pdf-105dr").click();
    await new Promise(resolve => setTimeout(resolve, 100));
    document.querySelector('[data-quote-preview-action="accept"]').click();
    await new Promise(resolve => setTimeout(resolve, 1200));
    const dashboard = document.querySelector('[data-forge-product-type="segubeca"]');
    const sections = [...(dashboard?.querySelectorAll("section") || [])];
    const text = document.body.innerText;
    return {
      calculation: {
        totalContributed: calculation.totalContributed,
        totalRecovery: calculation.totalRecovery,
        paymentMode: calculation.paymentMode,
        currency: calculation.currency,
        coveragePeriod: calculation.coveragePeriod
      },
      dashboardPresent: Boolean(dashboard),
      dashboardConnected: Boolean(dashboard?.isConnected),
      visibleSections: sections.filter(section => getComputedStyle(section).display !== "none").length,
      dashboardText: dashboard?.innerText || "",
      placeholders: text.includes("Dependiente del plan") || text.includes("Se mostrarán según el plan detectado"),
      objectObject: text.includes("[object Object]"),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      status: document.querySelector(".fq-file-status-105dr")?.textContent || ""
    };
  });

  assert.deepEqual(pageErrors, []);
  assert.equal(result.dashboardPresent, true);
  assert.equal(result.dashboardConnected, true);
  assert.ok(result.visibleSections >= 5);
  assert.equal(result.placeholders, false);
  assert.equal(result.objectObject, false);
  assert.equal(result.horizontalOverflow, false);
  assert.deepEqual(result.calculation, { totalContributed: 35339, totalRecovery: 30000, paymentMode: "Anual", currency: "UDI", coveragePeriod: "14 años" });
  assert.match(result.dashboardText, /35,339 UDI/);
  assert.match(result.dashboardText, /30,000 UDI/);
  assert.match(result.status, /Cotización calculada y guardada/);
  console.log("PASS SeguBeca accepted-render real browser integration R14H");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
