// FORGE:107Z15P2_R11B2_BROWSER_PDF_PARSER:START
const PDFJS_CDN_VERSION_107Z15P2_R11B2 = "4.10.38";
const PDFJS_MODULE_URL_107Z15P2_R11B2 = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_CDN_VERSION_107Z15P2_R11B2}/build/pdf.mjs`;
const PDFJS_WORKER_URL_107Z15P2_R11B2 = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_CDN_VERSION_107Z15P2_R11B2}/build/pdf.worker.mjs`;

let pdfjsPromise107z15p2R11B2 = null;

function normalizeText107z15p2R11B2(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function compactText107z15p2R11B2(value) {
  return normalizeText107z15p2R11B2(value).replace(/\s+/g, " ").trim();
}

function numberFromText107z15p2R11B2(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value).replace(/[^\d,.\-]/g, "");
  if (!raw) return null;

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  let normalized = raw;

  if (lastComma > -1 && lastDot > -1) {
    normalized = lastComma > lastDot
      ? raw.replace(/\./g, "").replace(",", ".")
      : raw.replace(/,/g, "");
  } else if (lastComma > -1 && lastDot === -1) {
    const decimals = raw.length - lastComma - 1;
    normalized = decimals === 2 ? raw.replace(",", ".") : raw.replace(/,/g, "");
  } else {
    normalized = raw.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNumber107z15p2R11B2(...values) {
  for (const value of values) {
    const parsed = numberFromText107z15p2R11B2(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function roundNumber107z15p2R11B2(value) {
  const parsed = numberFromText107z15p2R11B2(value);
  return parsed === null ? null : Math.round(parsed);
}

function matchNumber107z15p2R11B2(text, patterns) {
  const source = compactText107z15p2R11B2(text);
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) {
      const value = numberFromText107z15p2R11B2(match[1] ?? match[0]);
      if (value !== null) return value;
    }
  }
  return null;
}

function matchText107z15p2R11B2(text, patterns) {
  const source = compactText107z15p2R11B2(text);
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/\s{2,}/g, " ");
  }
  return null;
}

function findCurrentUdiValue107z15p2R11B2() {
  const globalCandidates = [
    globalThis?.ForgeQuoteCalculators?.currentUdiValue,
    globalThis?.ForgeQuoteCalculators?.udiValue,
    globalThis?.ForgeQuoteCalculators?.state?.currentUdiValue,
    globalThis?.ForgeUdi?.currentUdiValue,
    globalThis?.FORGE_CURRENT_UDI_VALUE,
    globalThis?.FORGE_QUOTE_CURRENT_UDI_VALUE
  ];

  for (const candidate of globalCandidates) {
    const parsed = numberFromText107z15p2R11B2(candidate);
    if (parsed !== null) return parsed;
  }

  if (typeof localStorage !== "undefined") {
    for (const key of Object.keys(localStorage)) {
      if (!/udi/i.test(key)) continue;
      const parsed = numberFromText107z15p2R11B2(localStorage.getItem(key));
      if (parsed !== null && parsed > 1) return parsed;
    }
  }

  return null;
}

function parseCoveragePremium107z15p2R11B2(text, code) {
  const source = compactText107z15p2R11B2(text);
  const rx = new RegExp(String.raw`\b${code}\b[\s\S]{0,180}?([0-9][0-9,]*\.[0-9]{2})`, "i");
  const match = source.match(rx);
  return match ? numberFromText107z15p2R11B2(match[1]) : null;
}

function parseCoverageAmount107z15p2R11B2(text, code) {
  const source = compactText107z15p2R11B2(text);
  const rx = new RegExp(String.raw`\b${code}\b[\s\S]{0,180}?([0-9][0-9,]*)\s*(?:UDI|UDIS)?`, "i");
  const match = source.match(rx);
  return match ? numberFromText107z15p2R11B2(match[1]) : null;
}

function parseRecommendedCoverages107z15p2R11B2(text) {
  const definitions = [
    { code: "ADAPTA", label: "ADAPTA 5 REN" },
    { code: "BMA", label: "BMA" },
    { code: "PEP", label: "PEP A" },
    { code: "CLP", label: "CLP 1 REN" }
  ];

  return definitions
    .map((item) => {
      const annualPremium = parseCoveragePremium107z15p2R11B2(text, item.code);
      const sumAssured = parseCoverageAmount107z15p2R11B2(text, item.code);
      if (annualPremium === null && sumAssured === null) return null;
      return {
        code: item.code,
        label: item.label,
        sumAssured,
        annualPremium
      };
    })
    .filter(Boolean);
}

function parseBaseCoverages107z15p2R11B2(text, sumAssured) {
  const definitions = [
    { code: "BAM", label: "BAM UI 1 REN" },
    { code: "BAIT", label: "BAIT 60 P" },
    { code: "AV", label: "AV UI 1 REN" },
    { code: "BIT", label: "BIT 60 P" },
    { code: "PCF", label: "PCF A" }
  ];

  return definitions
    .map((item) => {
      const annualPremium = parseCoveragePremium107z15p2R11B2(text, item.code);
      const parsedSumAssured = parseCoverageAmount107z15p2R11B2(text, item.code);
      if (annualPremium === null && parsedSumAssured === null && item.code !== "PCF") return null;
      return {
        code: item.code,
        label: item.label,
        sumAssured: parsedSumAssured ?? (item.code === "PCF" ? sumAssured : null),
        annualPremium
      };
    })
    .filter(Boolean);
}

function buildVidaMujerAcceptedQuotePacketFromText107z15p2R11B2(text, options = {}) {
  const rawText = normalizeText107z15p2R11B2(text);
  const source = compactText107z15p2R11B2(rawText);

  const product = /vida\s+mujer/i.test(source) ? "Vida Mujer" : null;
  const missingInformation = [];

  if (!product) {
    missingInformation.push("No se detectó producto Vida Mujer en el PDF.");
  }

  const insured = matchText107z15p2R11B2(source, [
    /(?:Nombre|Titular|Asegurad[ao])\s*:?\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ.\s]{4,80}?)(?=\s+(?:Edad|Sexo|Fuma|Producto|Plan|RFC|Fecha)\b)/i
  ]) || "Prospecto Vida Mujer";

  const age = matchNumber107z15p2R11B2(source, [
    /(?:Edad|Edad real)\s*:?\s*(\d{1,3})/i
  ]);

  const sumAssured = matchNumber107z15p2R11B2(source, [
    /Vida\s+Mujer[\s\S]{0,180}?([0-9][0-9,]*)\s*UDI/i,
    /Suma\s+Asegurada\s+B[aá]sico[\s\S]{0,80}?([0-9][0-9,]*)/i,
    /B[aá]sico[\s\S]{0,80}?([0-9][0-9,]*)\s*UDI/i
  ]);

  const annualPremiumRaw = matchNumber107z15p2R11B2(source, [
    /Prima\s+Total\s+Anual(?!\s+con)[\s\S]{0,80}?([0-9][0-9,]*\.[0-9]{2})/i,
    /Prima\s+Anual\s+Total(?!\s+con)[\s\S]{0,80}?([0-9][0-9,]*\.[0-9]{2})/i
  ]);

  const annualPremiumWithRecommendedRaw = matchNumber107z15p2R11B2(source, [
    /Prima\s+Total\s+con\s+Recomendad[oa]s[\s\S]{0,100}?([0-9][0-9,]*\.[0-9]{2})/i,
    /Prima\s+Total\s+Anual\s+con\s+Recomendad[oa]s[\s\S]{0,100}?([0-9][0-9,]*\.[0-9]{2})/i
  ]);

  const paymentYears = matchNumber107z15p2R11B2(source, [
    /Plazo\s+de\s+pago[\s\S]{0,60}?(\d{1,2})\s*años/i,
    /Pago[\s\S]{0,40}?(\d{1,2})\s*años/i
  ]) ?? 20;

  const policyTerm = matchText107z15p2R11B2(source, [
    /(?:Vida\s+Mujer|Plan)[\s\S]{0,80}?(\d{1,2}\s*años)/i
  ]) || `${paymentYears} años`;

  const totalContributed = matchNumber107z15p2R11B2(source, [
    /Prima\s+Anual\s+Acumulada\s+con\s+AVE[\s\S]{0,80}?([0-9][0-9,]*)/i,
    /Acumulada\s+con\s+AVE[\s\S]{0,80}?([0-9][0-9,]*)/i
  ]);

  const aveSurrenderValue = matchNumber107z15p2R11B2(source, [
    /Valor\s+de\s+Rescate\s+AVE[\s\S]{0,80}?([0-9][0-9,]*)/i
  ]);

  const cashValue = matchNumber107z15p2R11B2(source, [
    /Valor\s+en\s+Efectivo[\s\S]{0,80}?([0-9][0-9,]*)/i
  ]);

  const recoveryTotal = matchNumber107z15p2R11B2(source, [
    /Recuperaci[oó]n\s+Total[\s\S]{0,80}?([0-9][0-9,]*)/i
  ]);

  const recoveryPercentage = matchNumber107z15p2R11B2(source, [
    /(?:Porcentaje|%)\s+Recuperaci[oó]n[\s\S]{0,80}?([0-9][0-9,]*(?:\.[0-9]+)?)/i,
    /Recuperaci[oó]n[\s\S]{0,40}?([0-9][0-9,]*(?:\.[0-9]+)?)\s*%/i
  ]);

  const recommendedCoverages = parseRecommendedCoverages107z15p2R11B2(source);
  const recommendedPremiumTotal = recommendedCoverages.reduce((sum, row) => sum + (numberFromText107z15p2R11B2(row.annualPremium) ?? 0), 0);

  const annualPremium = roundNumber107z15p2R11B2(annualPremiumRaw);
  const annualPremiumWithRecommended = roundNumber107z15p2R11B2(
    annualPremiumWithRecommendedRaw ?? (
      annualPremiumRaw !== null && recommendedPremiumTotal > 0
        ? annualPremiumRaw + recommendedPremiumTotal
        : null
    )
  );

  if (sumAssured === null) missingInformation.push("Suma asegurada básica.");
  if (annualPremium === null) missingInformation.push("Prima total anual.");
  if (totalContributed === null) missingInformation.push("Prima anual acumulada con AVE.");

  const currentUdiValue = numberFromText107z15p2R11B2(options.currentUdiValue) ?? findCurrentUdiValue107z15p2R11B2();
  const plannedOrAvePremium = totalContributed && paymentYears ? Math.round(totalContributed / paymentYears) : null;

  const guaranteedFinalRow = {
    year: paymentYears,
    policyYear: paymentYears,
    annualPremiumAccumulatedWithAve: totalContributed,
    primaAnualAcumuladaConAve: totalContributed,
    aveSurrenderValue,
    valorRescateAve: aveSurrenderValue,
    cashValue,
    valorEnEfectivo: cashValue,
    recoveryTotal,
    recuperacionTotal: recoveryTotal,
    recoveryPercentage,
    porcentajeRecuperacion: recoveryPercentage
  };

  const nativeResult = {
    source: "browser_pdf_parser",
    product,
    productFamily: "life",
    currency: "UDI",
    prospect: insured,
    insured,
    age,
    gender: /femenino|mujer/i.test(source) ? "Femenino" : undefined,
    smokingStatus: /no\s+fum/i.test(source) ? "No fumador" : undefined,
    sumInsured: sumAssured,
    sumAssured,
    basicSumAssured: sumAssured,
    policyTerm,
    coveragePeriod: policyTerm,
    paymentYears,
    premiumTable: {
      annual: annualPremium,
      plannedAnnual: plannedOrAvePremium,
      annualWithRecommended: annualPremiumWithRecommended
    },
    totalAnnualPremium: annualPremium,
    totalAnnualPremiumWithRecommended: annualPremiumWithRecommended,
    totalContributed,
    primaTotalAcumuladaConAve: totalContributed,
    coverages: parseBaseCoverages107z15p2R11B2(source, sumAssured),
    recommendedCoverages,
    guaranteedValues: [guaranteedFinalRow],
    guaranteedValueRows: [guaranteedFinalRow],
    missing_information: missingInformation,
    rawText
  };

  return {
    schemaVersion: "forge.accepted_quote_packet.v1",
    source: "browser_pdf_parser",
    fileName: options.fileName || null,
    name: insured,
    family: "life",
    productFamily: "life",
    product_family: "life",
    product,
    insured,
    age,
    currency: "UDI",
    sumAssured,
    sumInsured: sumAssured,
    annualPremium,
    annualPremiumWithRecommended,
    plannedOrAvePremium,
    coveragePeriod: policyTerm,
    paymentYears,
    context: {
      name: insured,
      family: "life",
      productFamily: "life",
      product_family: "life",
      product,
      insured
    },
    currencyMetadata: {
      currentUdiValue,
      source: currentUdiValue ? "browser_cache_or_global" : "not_available"
    },
    nativeResult,
    missing_information: missingInformation
  };
}

async function loadPdfJs107z15p2R11B2() {
  if (!pdfjsPromise107z15p2R11B2) {
    pdfjsPromise107z15p2R11B2 = import(PDFJS_MODULE_URL_107Z15P2_R11B2).then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL_107Z15P2_R11B2;
      return pdfjsLib;
    });
  }
  return pdfjsPromise107z15p2R11B2;
}

export async function extractTextFromPdfFile107z15p2R11B2(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Archivo PDF inválido o no compatible con arrayBuffer().");
  }

  const pdfjsLib = await loadPdfJs107z15p2R11B2();
  const arrayBuffer = await file.arrayBuffer();
  const documentTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await documentTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => item.str || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
  }

  return pages.join("\n\n");
}

export function parseVidaMujerPdfTextToAcceptedQuotePacket(text, options = {}) {
  return buildVidaMujerAcceptedQuotePacketFromText107z15p2R11B2(text, options);
}

export async function parsePdfFileToAcceptedQuotePacket(file, options = {}) {
  const text = await extractTextFromPdfFile107z15p2R11B2(file);
  return parseVidaMujerPdfTextToAcceptedQuotePacket(text, {
    ...options,
    fileName: options.fileName || file?.name || null
  });
}

function isPdfFile107z15p2R11B2(file) {
  return Boolean(file) && (
    file.type === "application/pdf" ||
    /\.pdf$/i.test(file.name || "")
  );
}

function ensurePdfStatusBox107z15p2R11B2(input) {
  if (!input || typeof document === "undefined") return null;
  const existing = input.closest("label, section, div")?.querySelector?.("[data-forge-pdf-status='true']");
  if (existing) return existing;

  const box = document.createElement("div");
  box.setAttribute("data-forge-pdf-status", "true");
  box.style.marginTop = "10px";
  box.style.fontSize = "0.86rem";
  box.style.lineHeight = "1.35";
  box.style.color = "#2563eb";
  box.textContent = "";
  input.insertAdjacentElement("afterend", box);
  return box;
}

function setPdfStatus107z15p2R11B2(input, message, tone = "info") {
  const box = ensurePdfStatusBox107z15p2R11B2(input);
  if (!box) return;
  box.textContent = message;
  box.dataset.tone = tone;
  box.style.color = tone === "error" ? "#b91c1c" : tone === "success" ? "#047857" : "#2563eb";
}

async function convertPdfInputToJsonChange107z15p2R11B2(input, file) {
  setPdfStatus107z15p2R11B2(input, "PDF recibido. Extrayendo campos en el navegador…", "info");

  const packet = await parsePdfFileToAcceptedQuotePacket(file, { fileName: file.name });

  if (packet?.missing_information?.length) {
    setPdfStatus107z15p2R11B2(
      input,
      `PDF convertido con datos faltantes: ${packet.missing_information.join(", ")}.`,
      "error"
    );
  } else {
    setPdfStatus107z15p2R11B2(input, "PDF convertido a cotización aceptada. Abriendo modal…", "success");
  }

  if (typeof File === "undefined" || typeof DataTransfer === "undefined") {
    globalThis.dispatchEvent?.(new CustomEvent("forge:accepted-quote-packet-ready", { detail: { packet } }));
    return;
  }

  const jsonFileName = `${(file.name || "cotizacion").replace(/\.pdf$/i, "")}.accepted-quote.json`;
  const jsonFile = new File(
    [JSON.stringify(packet, null, 2)],
    jsonFileName,
    { type: "application/json" }
  );

  const transfer = new DataTransfer();
  transfer.items.add(jsonFile);
  input.files = transfer.files;

  const event = new Event("change", { bubbles: true });
  input.dispatchEvent(event);
}

function installPdfInputInterceptor107z15p2R11B2() {
  if (typeof document === "undefined") return;
  if (globalThis.__FORGE_107Z15P2_R11B2_PDF_INTERCEPTOR__) return;
  globalThis.__FORGE_107Z15P2_R11B2_PDF_INTERCEPTOR__ = true;

  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.type !== "file") return;
    const file = input.files?.[0];
    if (!isPdfFile107z15p2R11B2(file)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    convertPdfInputToJsonChange107z15p2R11B2(input, file).catch((error) => {
      console.error("[FORGE R11B2] PDF browser parser failed", error);
      setPdfStatus107z15p2R11B2(
        input,
        `No pude extraer la cotización del PDF: ${error?.message || error}`,
        "error"
      );
    });
  }, true);
}

globalThis.ForgePdfBrowserParser = {
  parsePdfFileToAcceptedQuotePacket,
  parseVidaMujerPdfTextToAcceptedQuotePacket,
  extractTextFromPdfFile107z15p2R11B2
};

installPdfInputInterceptor107z15p2R11B2();
// FORGE:107Z15P2_R11B2_BROWSER_PDF_PARSER:END
