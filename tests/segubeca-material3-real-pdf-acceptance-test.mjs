import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream } from "node:fs";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(puppeteerPath, "FORGE_PUPPETEER_CORE_PATH is required");
assert.ok(chromiumPath, "FORGE_CHROMIUM_PATH is required");

const puppeteer = (await import(puppeteerPath)).default;
const root = resolve(process.cwd());
const temporaryDirectory = await mkdtemp(join(tmpdir(), "forge-segubeca-real-pdf-"));
const pdfPath = join(temporaryDirectory, "segubeca-material3-prueba.pdf");

const sourceLines = [
  "UDI SeguBeca 18",
  "Titular Menor Prueba No 25/06/2022 4 4 Masculino No",
  "Contratante Contratante Prueba No 29/09/1992 33 31 Masculino No",
  "SeguBeca 18 (SeguBeca 18) 14 años 30,000 2,284.33",
  "Protección por Fallecimiento e Invalidez del Contratante (PIM 18 CT UI) 14 años Amparado 73.06",
  "Prima Total Anual 2,524.19",
  "ADAPTA (ADAPTA) 5 REN 100,000 418.73",
  "Prima total con beneficios recomendados 3,080.09",
  "0.00 % 4 2,524 2,524 0 0 0 2,284",
  "84.89 % 17 2,524 35,339 0 30,000 30,000 30,000",
  "La tasa de interes para entrega mensual es estimada a 1.0% anual vigente al momento de la cotización.",
  "1 18 30,000 637 7,647 22,819 24,979",
  "2 19 22,612 637 15,294 15,288 19,353",
  "3 20 15,149 637 22,941 7,682 13,362",
  "4 21 7,612 637 30,588 - 6,702",
  "Todas las cantidades están expresadas en Unidades de Inversión (UDI).",
];

function escapePdfText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createSanitizedPdf(lines) {
  const content = [
    "BT",
    "/F1 9 Tf",
    "44 785 Td",
    ...lines.flatMap((line, index) => [
      `(${escapePdfText(line)}) Tj`,
      ...(index === lines.length - 1 ? [] : ["0 -22 Td"]),
    ]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
  ];

  const chunks = [Buffer.from("%PDF-1.4\n%âãÏÓ\n", "latin1")];
  const offsets = [0];
  let byteOffset = chunks[0].length;

  objects.forEach((object, index) => {
    offsets[index + 1] = byteOffset;
    const chunk = Buffer.from(`${index + 1} 0 obj\n${object}\nendobj\n`, "latin1");
    chunks.push(chunk);
    byteOffset += chunk.length;
  });

  const xrefOffset = byteOffset;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ].join("\n");
  chunks.push(Buffer.from(xref, "latin1"));
  return Buffer.concat(chunks);
}

await writeFile(pdfPath, createSanitizedPdf(sourceLines));

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
};

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
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mimeTypes[extname(file)] || "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolveServer) => server.listen(0, "127.0.0.1", resolveServer));
const { port } = server.address();
const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(
    `http://127.0.0.1:${port}/docs/static-preview/forge-alive-material3/?nav=cotizaciones`,
    { waitUntil: "networkidle0", timeout: 60000 },
  );

  await page.waitForSelector("#fq-solution-online-pdf-105dr", { timeout: 30000 });
  await page.evaluate(() => {
    globalThis.ForgeQuoteUdiRateCache = Object.freeze({
      cacheStatus: "CACHE_HIT",
      rates: Object.freeze({
        UDI_MXN: Object.freeze({
          value: 8.8,
          date: "2026-07-10",
          source: "BANXICO_SIE_API",
          seriesId: "SP68257",
          title: "UDI",
        }),
      }),
    });
  });

  const input = await page.$("#fq-solution-online-pdf-105dr");
  assert.ok(input, "The productive PDF input must be mounted");
  await input.uploadFile(pdfPath);

  await page.waitForFunction(
    () => document.documentElement.dataset.segubecaCalculationAuthority === "ready",
    { timeout: 60000 },
  );
  await page.waitForFunction(
    () => document.querySelector("[data-material3-quotes-projection]")
      ?.dataset?.productDashboard === "segubeca",
    { timeout: 30000 },
  );
  await page.waitForFunction(
    () => {
      const note = document.querySelector(
        "[data-material3-quotes-projection] [data-segubeca-authority-note]",
      );
      return Boolean(note && getComputedStyle(note).display !== "none");
    },
    { timeout: 30000 },
  );

  const preview = await page.evaluate(() => {
    const bridge = globalThis.ForgeAcceptedQuoteBridge;
    const candidate = bridge?.getCurrentQuoteCandidate?.();
    const calculation = bridge?.getCurrentQuotePreviewCalculation?.();
    const authorityResult = globalThis.ForgeSegubecaProductiveUiBinding?.getAuthorityResult?.();
    const projection = document.querySelector("[data-material3-quotes-projection]");
    const note = projection?.querySelector("[data-segubeca-authority-note]");
    const bodyText = document.body.innerText;
    return {
      candidate: {
        source: candidate?.source || null,
        fileName: candidate?.fileName || null,
        productFamily: candidate?.productFamily || null,
      },
      calculation: {
        authority: calculation?.calculationAuthority || null,
        authorityVersion: calculation?.calculationAuthorityVersion || null,
        totalContributed: calculation?.totalContributed ?? null,
        totalRecovery: calculation?.totalRecovery ?? null,
        paymentYears: calculation?.paymentYears ?? null,
        coveragePeriod: calculation?.coveragePeriod ?? null,
        projectionRate: calculation?.segubecaAuthority?.projection?.annualUdiGrowthRate ?? null,
        scheduleYears:
          calculation?.segubecaAuthority?.projection?.totalContributed
            ?.projectedContributionSchedule?.length ?? null,
        flatConversionAuthorized:
          calculation?.segubecaAuthority?.boundaries
            ?.flatTotalContributionConversionAuthorized ?? null,
        projectionGuaranteed:
          calculation?.segubecaAuthority?.boundaries?.projectionGuaranteed ?? null,
      },
      authorityResult: {
        sourceAccepted: authorityResult?.sourcePacketAccepted === true,
        productCalculationReimplemented:
          authorityResult?.productCalculationReimplemented ?? null,
      },
      projection: {
        dashboard: projection?.dataset?.productDashboard || null,
        authority: projection?.dataset?.segubecaCalculationAuthority || null,
        noteVisible: Boolean(note && getComputedStyle(note).display !== "none"),
        text: projection?.innerText || "",
      },
      acceptedBeforeClick:
        Boolean(bridge?.getAcceptedQuoteReviewSnapshot?.()),
      objectObject: bodyText.includes("[object Object]"),
      placeholders:
        bodyText.includes("Dependiente del plan") ||
        bodyText.includes("Se mostrarán según el plan detectado"),
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  assert.deepEqual(preview.candidate, {
    source: "browser_pdf_parser",
    fileName: "segubeca-material3-prueba.pdf",
    productFamily: "segubeca",
  });
  assert.deepEqual(preview.calculation, {
    authority: "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION",
    authorityVersion: "SEGUBECA-CALCULATION-AUTHORITY-001.1",
    totalContributed: 35339,
    totalRecovery: 30000,
    paymentYears: 14,
    coveragePeriod: "14 años",
    projectionRate: 0.045,
    scheduleYears: 14,
    flatConversionAuthorized: false,
    projectionGuaranteed: false,
  });
  assert.deepEqual(preview.authorityResult, {
    sourceAccepted: true,
    productCalculationReimplemented: false,
  });
  assert.equal(preview.projection.dashboard, "segubeca");
  assert.equal(preview.projection.authority, "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION");
  assert.equal(preview.projection.noteVisible, true);
  assert.match(preview.projection.text, /35,339 UDI/);
  assert.match(preview.projection.text, /4\.5% anual/);
  assert.match(preview.projection.text, /no son garantía/i);
  assert.equal(preview.acceptedBeforeClick, false);
  assert.equal(preview.objectObject, false);
  assert.equal(preview.placeholders, false);
  assert.equal(preview.horizontalOverflow, false);

  await page.waitForFunction(
    () => {
      const button = document.querySelector('[data-quote-next-action="confirm_quote"]');
      return Boolean(button && button.isConnected && !button.disabled);
    },
    { timeout: 30000 },
  );
  await page.evaluate(() => {
    const button = document.querySelector('[data-quote-next-action="confirm_quote"]');
    if (!button || !button.isConnected || button.disabled) {
      throw new Error("SEGUBECA_CONFIRM_BUTTON_REQUIRED");
    }
    button.click();
  });
  await page.waitForFunction(
    () => globalThis.ForgeAcceptedQuoteBridge
      ?.getAcceptedQuoteReviewSnapshot?.()
      ?.calculation?.calculationAuthority ===
        "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION",
    { timeout: 30000 },
  );

  const confirmation = await page.evaluate(() => {
    const snapshot = globalThis.ForgeAcceptedQuoteBridge
      ?.getAcceptedQuoteReviewSnapshot?.();
    const state = globalThis.ForgeSegubecaProductiveUiBinding?.getState?.();
    return {
      packetType: snapshot?.packetType || null,
      authority: snapshot?.calculation?.calculationAuthority || null,
      authorityVersion:
        snapshot?.calculation?.calculationAuthorityVersion || null,
      totalContributed: snapshot?.calculation?.totalContributed ?? null,
      humanConfirmationRequired:
        snapshot?.calculation?.segubecaAuthority?.boundaries
          ?.humanConfirmationRequired ?? null,
      quoteMutationAllowed: snapshot?.safety?.quoteMutationAllowed ?? null,
      crmMutationAllowed: snapshot?.safety?.crmMutationAllowed ?? null,
      bindingState: state?.state || null,
      rootAccepted:
        document.querySelector("[data-forge-quotes-module]")
          ?.dataset?.quoteAccepted || null,
    };
  });

  assert.deepEqual(confirmation, {
    packetType: "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT",
    authority: "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION",
    authorityVersion: "SEGUBECA-CALCULATION-AUTHORITY-001.1",
    totalContributed: 35339,
    humanConfirmationRequired: true,
    quoteMutationAllowed: false,
    crmMutationAllowed: false,
    bindingState: "ACCEPTED",
    rootAccepted: "true",
  });

  assert.deepEqual(pageErrors, []);
  console.log("PASS SeguBeca Material 3 productive real-PDF acceptance");
} finally {
  await browser.close();
  await new Promise((resolveServer) => server.close(resolveServer));
  await rm(temporaryDirectory, { recursive: true, force: true });
}
