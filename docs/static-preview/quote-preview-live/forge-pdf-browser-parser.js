// FORGE:107Z15P2_R11E_SOLUCIONLINE_LAYOUT_AWARE_PDF_PARSER:START
import { parseSolucionlineRetirementQuote } from "./forge-solucionline-retirement-parser.js";
import { parseSolucionlineSegubecaQuote } from "./forge-segubeca-solucionline-parser.js";
import {
  assertValidOrviPdfParserEnvelope,
} from "./orvi-product-intelligence/quotes/orvi-pdf-parser-contract.js";
import {
  parseOrviSolucionlinePdfText,
} from "./orvi-product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js";
import {
  mapOrviPdfEnvelopeToProductIntelligence,
} from "./orvi-product-intelligence/quotes/orvi-pdf-to-product-intelligence.js";
import {
  validateOrviProductIntelligence,
} from "./orvi-product-intelligence/knowledge/orvi-product-intelligence.js";

const PDFJS_VENDOR_VERSION_107Z15P2_R11E = "4.10.38";
const PDFJS_LOCAL_MODULE_URL_107Z15P2_R11E = new URL(
  "./forge-pdfjs-4.10.38.js",
  import.meta.url,
).href;
const PDFJS_LOCAL_WORKER_URL_107Z15P2_R11E = new URL(
  "./forge-pdfjs-worker-4.10.38.js",
  import.meta.url,
).href;
let pdfjsPromise107z15p2R11E = null;
const PDF_COLUMN_GAP_THRESHOLD_107Z15P2_R15M2B = 8;

function normalizeText107z15p2R11E(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function compactText107z15p2R11E(value) {
  return normalizeText107z15p2R11E(value).replace(/\s+/g, " ").trim();
}

function lines107z15p2R11E(text) {
  return normalizeText107z15p2R11E(text)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function numberFromText107z15p2R11E(value) {
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
    const tail = raw.length - lastComma - 1;
    normalized = tail === 2 ? raw.replace(",", ".") : raw.replace(/,/g, "");
  } else {
    normalized = raw.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber107z15p2R11E(value) {
  const parsed = numberFromText107z15p2R11E(value);
  return parsed === null ? null : Math.round(parsed);
}

function parseAmounts107z15p2R11E(value) {
  const matches = String(value || "").match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/g) || [];
  return matches
    .map(numberFromText107z15p2R11E)
    .filter((item) => item !== null);
}

function getSolucionlineRows107z15p2R11E(text) {
  return lines107z15p2R11E(text).filter((line) => line.length > 1 && !/^[-.]+$/.test(line));
}

function pickFirstMatchingRow107z15p2R11E(rows, pattern) {
  return rows.find((row) => pattern.test(row)) || null;
}

function parseInsured107z15p2R11E(rows, text) {
  for (const row of rows) {
    const match = row.match(/^Titular\s+(.+?)\s+\d{2}\/\d{2}\/\d{4}\s+(\d{1,3})\s+(Femenino|Masculino)\s+(No|Si|Sí)$/i);
    if (match) {
      return {
        insured: match[1].trim(),
        age: numberFromText107z15p2R11E(match[2]),
        gender: match[3],
        smokingStatus: /^no$/i.test(match[4]) ? "No fumador" : match[4]
      };
    }
  }

  const source = compactText107z15p2R11E(text);
  const fallback = source.match(/Titular\s+(.+?)\s+\d{2}\/\d{2}\/\d{4}\s+(\d{1,3})\s+(Femenino|Masculino)\s+(No|Si|Sí)/i);
  if (fallback) {
    return {
      insured: fallback[1].trim(),
      age: numberFromText107z15p2R11E(fallback[2]),
      gender: fallback[3],
      smokingStatus: /^no$/i.test(fallback[4]) ? "No fumador" : fallback[4]
    };
  }

  return {
    insured: "Prospecto Vida Mujer",
    age: null,
    gender: undefined,
    smokingStatus: undefined
  };
}

function parseVidaMujerCoverage107z15p2R11E(rows) {
  const row = pickFirstMatchingRow107z15p2R11E(rows, /^Vida\s+Mujer\b/i);
  if (!row) return {};

  const match = row.match(/^Vida\s+Mujer(?:\s+\(Vida\s+Mujer\))?\s+(\d{1,2}\s*años)\s+([0-9]{1,3}(?:,[0-9]{3})+)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/i);
  if (match) {
    return {
      coveragePeriod: match[1].trim(),
      paymentYears: numberFromText107z15p2R11E(match[1]),
      sumAssured: numberFromText107z15p2R11E(match[2]),
      baseCoveragePremium: numberFromText107z15p2R11E(match[3])
    };
  }

  const nums = parseAmounts107z15p2R11E(row);
  const sumAssured = nums.find((value) => value >= 10000 && value <= 500000) ?? null;
  const premium = [...nums].reverse().find((value) => value >= 1000 && value <= 10000 && value !== sumAssured) ?? null;
  const years = nums.find((value) => value >= 5 && value <= 99) ?? 20;

  return {
    coveragePeriod: `${years} años`,
    paymentYears: years,
    sumAssured,
    baseCoveragePremium: premium
  };
}

function parseAnnualPremium107z15p2R11E(rows, text) {
  for (const row of rows) {
    const match = row.match(/^Prima\s+Total\s+Anual\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i);
    if (match) return numberFromText107z15p2R11E(match[1]);
  }

  const source = compactText107z15p2R11E(text);
  const match = source.match(/Prima\s+Total\s+Anual\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/i);
  return match ? numberFromText107z15p2R11E(match[1]) : null;
}

function parseAnnualPremiumWithRecommended107z15p2R11E(rows, text) {
  for (const row of rows) {
    const match = row.match(/^Prima\s+total\s+con\s+beneficios\s+recomendados\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})$/i);
    if (match) return numberFromText107z15p2R11E(match[1]);
  }

  const source = compactText107z15p2R11E(text);
  const match = source.match(/Prima\s+total\s+con\s+beneficios\s+recomendados\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/i);
  return match ? numberFromText107z15p2R11E(match[1]) : null;
}

function parseGuaranteedRows107z15p2R11E(rows) {
  const guaranteed = [];

  for (const row of rows) {
    const match = row.match(/^([0-9]{1,3}\.[0-9]{2})\s*%\s+(\d{1,3})\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*|0)\s+([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{1,3}(?:,[0-9]{3})*)$/);
    if (!match) continue;

    guaranteed.push({
      recoveryPercentage: numberFromText107z15p2R11E(match[1]),
      age: numberFromText107z15p2R11E(match[2]),
      annualPremium: numberFromText107z15p2R11E(match[3]),
      annualPremiumAccumulatedWithAve: numberFromText107z15p2R11E(match[4]),
      primaAnualAcumuladaConAve: numberFromText107z15p2R11E(match[4]),
      aveSurrenderValue: numberFromText107z15p2R11E(match[5]),
      valorRescateAve: numberFromText107z15p2R11E(match[5]),
      cashValue: numberFromText107z15p2R11E(match[6]),
      valorEnEfectivo: numberFromText107z15p2R11E(match[6]),
      recoveryTotal: numberFromText107z15p2R11E(match[7]),
      recuperacionTotal: numberFromText107z15p2R11E(match[7]),
      sumAssured: numberFromText107z15p2R11E(match[8]),
      sumaAseguradaBasico: numberFromText107z15p2R11E(match[8])
    });
  }

  return guaranteed.sort((a, b) => (a.age || 0) - (b.age || 0));
}

function parseCoverageRow107z15p2R11E(row, code, label) {
  const nums = parseAmounts107z15p2R11E(row);
  const amount = nums.find((value) => value >= 10000 && value <= 500000) ?? null;
  const premium = [...nums].reverse().find((value) => value > 0 && value < 10000 && value !== amount && ![1, 5, 17, 20, 60].includes(value)) ?? null;
  return { code, label, sumAssured: amount, annualPremium: premium };
}

function parseBaseCoverages107z15p2R11E(rows, sumAssured) {
  const defs = [
    ["BAM", /BAM\s+UI/i, "BAM UI"],
    ["BAIT", /BAIT\s+60\s+P/i, "BAIT 60 P"],
    ["AV", /AV\s+UI/i, "AV UI"],
    ["BIT", /BIT\s+60\s+P/i, "BIT 60 P"],
    ["PCF", /PCF\s+A/i, "PCF A"]
  ];

  return defs.map(([code, rx, label]) => {
    const row = rows.find((item) => rx.test(item));
    if (!row) return null;
    const parsed = parseCoverageRow107z15p2R11E(row, code, label);
    if (code === "PCF" && !parsed.sumAssured) parsed.sumAssured = sumAssured;
    return parsed;
  }).filter(Boolean);
}

function parseRecommendedCoverages107z15p2R11E(rows) {
  const defs = [
    ["ADAPTA", /^ADAPTA\b/i, "ADAPTA"],
    ["BMA", /Beneficio\s+por\s+Muerte\s+Accidental|BMA/i, "BMA"],
    ["PEP", /Complicaciones\s+del\s+Embarazo|PEP\s+A/i, "PEP A"],
    ["CLP", /Cuidados\s+a\s+Largo\s+Plazo|CLP/i, "CLP"]
  ];

  return defs.map(([code, rx, label]) => {
    const row = rows.find((item) => rx.test(item));
    if (!row) return null;
    return parseCoverageRow107z15p2R11E(row, code, label);
  }).filter(Boolean);
}

function buildVidaMujerAcceptedQuotePacketFromText107z15p2R11E(text, options = {}) {
  const rawText = normalizeText107z15p2R11E(text);
  const rows = getSolucionlineRows107z15p2R11E(rawText);
  const source = compactText107z15p2R11E(rawText);
  const product = /vida\s+mujer/i.test(source) ? "Vida Mujer" : null;
  const missingInformation = [];

  const person = parseInsured107z15p2R11E(rows, rawText);
  const base = parseVidaMujerCoverage107z15p2R11E(rows);
  const guaranteedRows = parseGuaranteedRows107z15p2R11E(rows);
  const firstGuaranteedRow = guaranteedRows[0] || null;
  const finalGuaranteedRow = guaranteedRows[guaranteedRows.length - 1] || null;

  const sumAssured = base.sumAssured ?? finalGuaranteedRow?.sumAssured ?? null;
  const annualPremiumFromTotal = parseAnnualPremium107z15p2R11E(rows, rawText);
  const annualPremium = roundNumber107z15p2R11E(annualPremiumFromTotal ?? finalGuaranteedRow?.annualPremium ?? null);
  const annualPremiumWithRecommended = roundNumber107z15p2R11E(parseAnnualPremiumWithRecommended107z15p2R11E(rows, rawText));
  const paymentYears = base.paymentYears ?? 20;
  const coveragePeriod = base.coveragePeriod ?? `${paymentYears} años`;

  const totalContributed = finalGuaranteedRow?.annualPremiumAccumulatedWithAve ?? null;
  const annualPremiumTotalWithAve = roundNumber107z15p2R11E(
    guaranteedRows.length > 1
      ? firstGuaranteedRow?.annualPremiumAccumulatedWithAve
      : (
          totalContributed && paymentYears
            ? totalContributed / paymentYears
            : null
        )
  );
  const annualAvePremium = annualPremiumTotalWithAve !== null && annualPremium !== null
    ? annualPremiumTotalWithAve - annualPremium
    : null;
  const plannedOrAvePremium = annualPremiumTotalWithAve;

  if (!product) missingInformation.push("No se detectó producto Vida Mujer en el PDF.");
  if (!sumAssured) missingInformation.push("Suma asegurada básica.");
  if (!annualPremium) missingInformation.push("Prima total anual.");
  if (!totalContributed) missingInformation.push("Prima anual acumulada con AVE.");

  const guaranteedFinalRow = finalGuaranteedRow ? {
    year: paymentYears,
    policyYear: paymentYears,
    age: finalGuaranteedRow.age,
    recoveryPercentage: finalGuaranteedRow.recoveryPercentage,
    porcentajeRecuperacion: finalGuaranteedRow.recoveryPercentage,
    annualPremium: finalGuaranteedRow.annualPremium,
    annualPremiumAccumulatedWithAve: finalGuaranteedRow.annualPremiumAccumulatedWithAve,
    primaAnualAcumuladaConAve: finalGuaranteedRow.annualPremiumAccumulatedWithAve,
    aveSurrenderValue: finalGuaranteedRow.aveSurrenderValue,
    valorRescateAve: finalGuaranteedRow.aveSurrenderValue,
    cashValue: finalGuaranteedRow.cashValue,
    valorEnEfectivo: finalGuaranteedRow.cashValue,
    recoveryTotal: finalGuaranteedRow.recoveryTotal,
    recuperacionTotal: finalGuaranteedRow.recoveryTotal,
    sumAssured: finalGuaranteedRow.sumAssured,
    sumaAseguradaBasico: finalGuaranteedRow.sumAssured
  } : null;

  const inputCurrencyMetadata =
    options.currencyMetadata && typeof options.currencyMetadata === "object"
      ? options.currencyMetadata
      : {};
  const currentUdiValue = numberFromText107z15p2R11E(
    options.currentUdiValue ??
    inputCurrencyMetadata.currentUdiValue ??
    inputCurrencyMetadata.udiValue ??
    inputCurrencyMetadata.value ??
    inputCurrencyMetadata.rate
  );
  const currencyMetadata = {
    ...inputCurrencyMetadata,
    currentUdiValue,
    source: inputCurrencyMetadata.source || (currentUdiValue ? "provided_verified_udi_metadata" : "not_available")
  };

  const nativeResult = {
    source: "browser_pdf_parser",
    extractionVersion: "107z15p2_R11E",
    product,
    productFamily: "life",
    currency: "UDI",
    prospect: person.insured,
    insured: person.insured,
    age: person.age,
    gender: person.gender,
    smokingStatus: person.smokingStatus,
    sumInsured: sumAssured,
    sumAssured,
    basicSumAssured: sumAssured,
    policyTerm: coveragePeriod,
    coveragePeriod,
    paymentYears,
    premiumTable: {
      annual: annualPremium,
      plannedAnnual: plannedOrAvePremium,
      annualAve: annualAvePremium,
      annualTotalWithAve: annualPremiumTotalWithAve,
      accumulatedWithAve: totalContributed,
      annualWithRecommended: annualPremiumWithRecommended
    },
    totalAnnualPremium: annualPremium,
    totalAnnualPremiumWithRecommended: annualPremiumWithRecommended,
    annualAvePremium,
    primaAveAnual: annualAvePremium,
    annualPremiumTotalWithAve,
    primaAnualTotalConAve: annualPremiumTotalWithAve,
    totalContributed,
    primaTotalAcumuladaConAve: totalContributed,
    aveSurrenderValue: guaranteedFinalRow?.aveSurrenderValue ?? null,
    valorRescateAve: guaranteedFinalRow?.aveSurrenderValue ?? null,
    cashValue: guaranteedFinalRow?.cashValue ?? null,
    valorEnEfectivo: guaranteedFinalRow?.cashValue ?? null,
    recoveryTotal: guaranteedFinalRow?.recoveryTotal ?? null,
    recuperacionTotal: guaranteedFinalRow?.recoveryTotal ?? null,
    recoveryPercentage: guaranteedFinalRow?.recoveryPercentage ?? null,
    porcentajeRecuperacion: guaranteedFinalRow?.recoveryPercentage ?? null,
    coverages: parseBaseCoverages107z15p2R11E(rows, sumAssured),
    recommendedCoverages: parseRecommendedCoverages107z15p2R11E(rows),
    guaranteedValues: guaranteedFinalRow ? [guaranteedFinalRow] : [],
    guaranteedValueRows: guaranteedFinalRow ? [guaranteedFinalRow] : [],
    currencyMetadata,
    missing_information: missingInformation,
    rawText,
    rows
  };

  return {
    schemaVersion: "forge.accepted_quote_packet.v1",
    source: "browser_pdf_parser",
    extractionVersion: "107z15p2_R11E",
    fileName: options.fileName || null,
    name: person.insured,
    family: "life",
    productFamily: "life",
    product_family: "life",
    product,
    insured: person.insured,
    age: person.age,
    currency: "UDI",
    sumAssured,
    sumInsured: sumAssured,
    annualPremium,
    annualPremiumWithRecommended,
    annualAvePremium,
    annualPremiumTotalWithAve,
    annualPremiumAccumulatedWithAve: totalContributed,
    plannedOrAvePremium,
    coveragePeriod,
    paymentYears,
    context: {
      name: person.insured,
      family: "life",
      productFamily: "life",
      product_family: "life",
      product,
      insured: person.insured
    },
    currencyMetadata,
    nativeResult,
    missing_information: missingInformation
  };
}

function withPdfTimeoutR16J1C1(promise, timeoutMs, label, onTimeout = null) {
  let timer = null;
  let timedOut = false;

  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        try {
          onTimeout?.();
        } catch {}
        reject(new Error(`${label} excedió ${timeoutMs} ms.`));
      }, timeoutMs);
    }),
  ]).finally(() => {
    if (timer !== null) clearTimeout(timer);
    if (!timedOut) return;
  });
}

async function loadPdfJs107z15p2R11E() {
  if (!pdfjsPromise107z15p2R11E) {
    pdfjsPromise107z15p2R11E = (async () => {
      const candidates = [
        {
          source: "LOCAL_VENDOR",
          module: PDFJS_LOCAL_MODULE_URL_107Z15P2_R11E,
          worker: PDFJS_LOCAL_WORKER_URL_107Z15P2_R11E,
        },
      ];

      let lastError = null;
      for (const candidate of candidates) {
        try {
          const pdfjsLib = await withPdfTimeoutR16J1C1(
            import(candidate.module),
            12000,
            "La carga de PDF.js",
          );
          pdfjsLib.GlobalWorkerOptions.workerSrc = candidate.worker;
        globalThis.ForgePdfJsRuntimeR16J1C1 = Object.freeze({
          version: PDFJS_VENDOR_VERSION_107Z15P2_R11E,
          source: candidate.source,
          moduleUrl: candidate.module,
          workerUrl: candidate.worker,
          remoteRuntimeDependency: false,
        });
        globalThis.dispatchEvent(
          new CustomEvent("forge:pdfjs-runtime-ready", {
            detail: globalThis.ForgePdfJsRuntimeR16J1C1,
          }),
        );
        return pdfjsLib;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError || new Error("No se pudo cargar PDF.js.");
    })().catch((error) => {
      pdfjsPromise107z15p2R11E = null;
      throw error;
    });
  }

  return withPdfTimeoutR16J1C1(
    pdfjsPromise107z15p2R11E,
    15000,
    "La inicialización de PDF.js",
    () => {
      pdfjsPromise107z15p2R11E = null;
    },
  );
}

export function groupPdfItemsIntoRows107z15p2R11E(items) {
  const rows = [];

  for (const item of items) {
    const value = String(item.str || "").trim();
    if (!value) continue;
    const transform = item.transform || [];
    const x = Number(transform[4] || 0);
    const y = Number(transform[5] || 0);
    const width = Number(item.width || 0);

    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 3);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push({
      x,
      endX: x + (Number.isFinite(width) && width > 0 ? width : 0),
      value,
    });
  }

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) => {
      const sorted = row.items.sort((a, b) => a.x - b.x);
      let line = "";
      let priorEndX = null;

      for (const item of sorted) {
        const gap = priorEndX === null ? 0 : item.x - priorEndX;
        const separator =
          line && gap >= PDF_COLUMN_GAP_THRESHOLD_107Z15P2_R15M2B
            ? "  "
            : line
              ? " "
              : "";
        line += `${separator}${item.value}`;
        priorEndX = priorEndX === null
          ? item.endX
          : Math.max(priorEndX, item.endX);
      }

      return line.trim();
    })
    .filter(Boolean);
}

export async function extractTextFromPdfFile107z15p2R11E(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Archivo PDF inválido o no compatible con arrayBuffer().");
  }

  const pdfjsLib = await loadPdfJs107z15p2R11E();
  const arrayBuffer = await withPdfTimeoutR16J1C1(
    file.arrayBuffer(),
    12000,
    "La lectura del archivo PDF",
  );

  const documentTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    disableWorker: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    stopAtErrors: false,
  });

  const pdf = await withPdfTimeoutR16J1C1(
    documentTask.promise,
    30000,
    "La apertura del documento PDF",
    () => {
      void documentTask.destroy?.();
    },
  );

  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      let page = null;
      try {
        page = await withPdfTimeoutR16J1C1(
          pdf.getPage(pageNumber),
          12000,
          `La carga de la página ${pageNumber}`,
        );
        const textContent = await withPdfTimeoutR16J1C1(
          page.getTextContent(),
          12000,
          `La extracción de texto de la página ${pageNumber}`,
          () => {
            page?.cleanup?.();
          },
        );
        const rows = groupPdfItemsIntoRows107z15p2R11E(textContent.items);
        pages.push(rows.join("\n"));
      } finally {
        page?.cleanup?.();
      }
    }
  } finally {
    try {
      pdf.cleanup?.();
    } catch {}
    try {
      await documentTask.destroy?.();
    } catch {}
  }

  const result = pages.join("\n\n").trim();
  if (!result) throw new Error("El PDF no produjo texto utilizable.");
  return result;
}

function segubecaLineR14C(id, label, value, unit = undefined) {
  return { id, label, value, unit };
}

function segubecaAmountR14C(udi = null, mxn = null, usd = null) {
  return { udi, mxn, usd };
}

function segubecaCoverageFieldsR14C(item) {
  return [
    { label: "Plazo", value: item.coveragePeriod || "Con evidencia" },
    { label: "Suma asegurada", value: typeof item.sumAssured === "number" ? segubecaAmountR14C(item.sumAssured, null, null) : item.sumAssured },
    { label: "Prima", value: typeof item.annualPremium === "number" ? segubecaAmountR14C(item.annualPremium, null, null) : item.annualPremium }
  ].filter((field) => field.value !== null && field.value !== undefined && field.value !== "");
}

function buildSegubecaBenefitSummaryR14C(parsed) {
  const base = parsed.baseCoverage || {};
  const finalGuaranteedRow = parsed.guaranteedRows?.[parsed.guaranteedRows.length - 1] || null;
  const firstAdministrationRow = parsed.administrationRows?.[0] || null;
  const finalAdministrationRow = parsed.administrationRows?.[parsed.administrationRows.length - 1] || null;

  const blocks = [
    {
      type: "summary_plan",
      lines: [
        segubecaLineR14C("product", "Producto", parsed.planVariant || parsed.productName),
        segubecaLineR14C("currency", "Moneda", parsed.currency),
        segubecaLineR14C("payment_term", "Plazo de aportación", base.coverageYears, "years"),
        segubecaLineR14C("child_age", "Edad del menor", parsed.participants?.child_age)
      ].filter((line) => line.value !== null && line.value !== undefined && line.value !== "")
    },
    {
      type: "participants",
      participant_modality: parsed.participants?.participant_modality || "unknown",
      participants: {
        primary_insured: parsed.participants?.primary_insured || null,
        joint_insured: parsed.participants?.joint_insured || null,
        child_or_education_beneficiary: parsed.participants?.child_or_education_beneficiary || null
      }
    },
    {
      type: "contribution_summary",
      lines: [
        segubecaLineR14C("annual_premium", "Prima total anual", parsed.totalAnnualPremium, "UDI"),
        segubecaLineR14C("annual_premium_with_recommended", "Prima con beneficios recomendados", parsed.totalWithRecommended, "UDI"),
        segubecaLineR14C("total_contributed", "Prima anual acumulada", finalGuaranteedRow?.accumulatedAnnualPremiumWithAve, "UDI")
      ].filter((line) => line.value !== null && line.value !== undefined && line.value !== "")
    },
    {
      type: "education_goal",
      lines: [
        segubecaLineR14C("target_amount", "Meta educativa", segubecaAmountR14C(base.sumAssured ?? finalGuaranteedRow?.basicSumAssured ?? null, null, null)),
        segubecaLineR14C("target_age", "Edad objetivo", firstAdministrationRow?.insuredAge ?? 18)
      ].filter((line) => line.value !== null && line.value !== undefined && line.value !== "")
    },
    {
      type: "payout_options",
      lines: [
        segubecaLineR14C("payout_mode", "Forma de entrega", firstAdministrationRow ? "Entrega mensual estimada" : null),
        segubecaLineR14C("monthly_payout", "Mensualidad educativa", firstAdministrationRow?.monthlyDelivery ?? null, "UDI"),
        segubecaLineR14C("payout_duration", "Duración de entrega", parsed.administrationYears ? parsed.administrationYears * 12 : null, "months"),
        segubecaLineR14C("accumulated_delivery", "Entrega acumulada", finalAdministrationRow?.accumulatedDelivery ?? null, "UDI")
      ].filter((line) => line.value !== null && line.value !== undefined && line.value !== "")
    },
    {
      type: "protection_summary",
      lines: [
        ...parsed.coverages.map((coverage) => segubecaLineR14C(
          coverage.name,
          coverage.name.replace(/\s+\([^)]+\)/g, ""),
          typeof coverage.sumAssured === "number" ? segubecaAmountR14C(coverage.sumAssured, null, null) : coverage.sumAssured || coverage.annualPremium
        )),
        segubecaLineR14C("death_benefit_during_administration", "Beneficio por fallecimiento en administración", firstAdministrationRow?.deathBenefit ?? null, "UDI")
      ].filter((line) => line.value !== null && line.value !== undefined && line.value !== "")
    },
    {
      type: "additional_coverages",
      benefits: parsed.recommendedCoverages.map((coverage) => ({
        name: coverage.name.replace(/\s+\([^)]+\)/g, ""),
        fields: segubecaCoverageFieldsR14C(coverage),
        value: coverage.annualPremium !== null && coverage.annualPremium !== undefined ? segubecaAmountR14C(coverage.annualPremium, null, null) : "Con evidencia"
      }))
    },
    {
      type: "secondary_details",
      lines: [
        segubecaLineR14C("interest_rate", "Tasa estimada administración", parsed.interestRate !== null ? `${parsed.interestRate}% anual` : null),
        segubecaLineR14C("final_cash_value", "Valor en efectivo final", finalAdministrationRow?.cashValue ?? null, "UDI"),
        segubecaLineR14C("final_recovery", "Recuperación total final", finalGuaranteedRow?.totalRecovery ?? null, "UDI")
      ].filter((line) => line.value !== null && line.value !== undefined && line.value !== "")
    },
    {
      type: "missing_information",
      missing: parsed.missing_information || []
    }
  ];

  return { blocks };
}

export function parseSegubecaPdfTextToAcceptedQuotePacket(text, options = {}) {
  const parsed = options.parsedResult || parseSolucionlineSegubecaQuote({ text });
  const benefitSummary = buildSegubecaBenefitSummaryR14C(parsed);
  const primaryInsured = parsed.participants?.primary_insured || null;
  const child = parsed.participants?.child_or_education_beneficiary || null;
  const finalGuaranteedRow = parsed.guaranteedRows?.[parsed.guaranteedRows.length - 1] || null;
  const finalAdministrationRow = parsed.administrationRows?.[parsed.administrationRows.length - 1] || null;
  const totalRecovery = finalGuaranteedRow?.totalRecovery ?? finalAdministrationRow?.accumulatedDelivery ?? null;

  const nativeResult = {
    source: "browser_pdf_parser",
    extractionVersion: "R14C_segubeca_pdf_intake",
    product: parsed.productName,
    productName: parsed.planVariant || parsed.productName,
    productFamily: "segubeca",
    product_family: "segubeca",
    productType: "segubeca",
    product_type: "segubeca",
    currency: parsed.currency,
    prospect: primaryInsured,
    name: primaryInsured,
    primaryInsured,
    insured: primaryInsured,
    childOrEducationBeneficiary: child,
    participants: parsed.participants,
    baseCoverage: parsed.baseCoverage,
    coverages: parsed.coverages,
    recommendedCoverages: parsed.recommendedCoverages,
    guaranteedRows: parsed.guaranteedRows,
    administrationRows: parsed.administrationRows,
    monthlyDelivery: parsed.monthlyDelivery,
    accumulatedDelivery: parsed.accumulatedDelivery,
    totalAnnualPremium: parsed.totalAnnualPremium,
    annualPremium: parsed.totalAnnualPremium,
    annualPremiumWithRecommended: parsed.totalWithRecommended,
    plannedOrAvePremium: parsed.totalWithRecommended,
    premiumTable: {
      annual: parsed.totalAnnualPremium,
      plannedAnnual: parsed.totalWithRecommended,
      annualWithRecommended: parsed.totalWithRecommended
    },
    sumAssured: parsed.baseCoverage?.sumAssured ?? null,
    sumInsured: parsed.baseCoverage?.sumAssured ?? null,
    paymentYears: parsed.baseCoverage?.coverageYears ?? null,
    paymentTerm: parsed.baseCoverage?.coveragePeriod ?? null,
    policyTerm: parsed.baseCoverage?.coveragePeriod ?? null,
    coveragePeriod: parsed.baseCoverage?.coveragePeriod ?? null,
    totalContributed: finalGuaranteedRow?.accumulatedAnnualPremiumWithAve ?? null,
    totalRecovery,
    benefitSummary,
    evidence: parsed.evidence,
    missing_information: parsed.missing_information
  };

  return {
    schemaVersion: "forge.accepted_quote_packet.v1",
    source: "browser_pdf_parser",
    extractionVersion: "R14C_segubeca_pdf_intake",
    fileName: options.fileName || null,
    family: "segubeca",
    productFamily: "segubeca",
    product_family: "segubeca",
    product: parsed.productName,
    productName: parsed.planVariant || parsed.productName,
    productType: "segubeca",
    product_type: "segubeca",
    insured: primaryInsured,
    name: primaryInsured,
    childOrEducationBeneficiary: child,
    age: parsed.participants?.primary_age ?? null,
    childAge: parsed.participants?.child_age ?? null,
    currency: parsed.currency,
    sumAssured: parsed.baseCoverage?.sumAssured ?? null,
    annualPremium: parsed.totalAnnualPremium,
    annualPremiumWithRecommended: parsed.totalWithRecommended,
    plannedOrAvePremium: parsed.totalWithRecommended,
    totalRecovery,
    paymentYears: parsed.baseCoverage?.coverageYears ?? null,
    coveragePeriod: parsed.baseCoverage?.coveragePeriod ?? null,
    benefitSummary,
    context: {
      family: "segubeca",
      productFamily: "segubeca",
      product_family: "segubeca",
      product: parsed.productName,
      productType: "segubeca",
      product_type: "segubeca"
    },
    nativeResult
  };
}


export function parseVidaMujerPdfTextToAcceptedQuotePacket(text, options = {}) {
  return buildVidaMujerAcceptedQuotePacketFromText107z15p2R11E(text, options);
}

function imaginaSerMissingInformationR13E(parsed) {
  const evidence = parsed?.evidence || {};
  const labels = {
    productName: "No se identificó el producto Imagina Ser",
    currentAge: "Falta edad actual en la cotización Imagina Ser",
    currency: "Falta moneda en la cotización Imagina Ser",
    sumAssured: "Falta suma asegurada en la cotización Imagina Ser",
    premiumStructure: "Faltan datos de aportación en la cotización Imagina Ser",
    scenarios: "Faltan escenarios con evidencia en la cotización Imagina Ser"
  };
  return Object.entries(labels)
    .filter(([key]) => evidence[key] !== "SOURCE_TEXT")
    .map(([, label]) => label);
}

function scenarioForAcceptedPacketR13E(scenario) {
  if (!scenario || (scenario.lumpSum == null && scenario.monthlyIncome == null)) return null;
  return {
    singlePaymentUdi: scenario.lumpSum ?? null,
    monthlyIncomeUdi: scenario.monthlyIncome ?? null
  };
}

export function parseImaginaSerPdfTextToAcceptedQuotePacket(text, options = {}) {
  const parsed = options.parsedResult || parseSolucionlineRetirementQuote({ text });
  const evidence = parsed.evidence || {};
  const hasProductEvidence = evidence.productName === "SOURCE_TEXT";
  const hasPremiumEvidence = evidence.premiumStructure === "SOURCE_TEXT";
  const hasScenarioEvidence = evidence.scenarios === "SOURCE_TEXT";
  const premiumPayingYears = Number(parsed.premiumStructure?.premiumPayingYears) > 0
    ? Number(parsed.premiumStructure.premiumPayingYears)
    : null;
  const totalAnnualPremium = hasPremiumEvidence && Number.isFinite(Number(parsed.premiumStructure?.totalAnnualPremium))
    ? Number(parsed.premiumStructure.totalAnnualPremium)
    : null;
  const product = hasProductEvidence ? "Imagina Ser" : null;
  const productFamily = hasProductEvidence ? "imagina_ser" : null;
  const scenarios = hasScenarioEvidence ? parsed.scenarios : {};
  const missingInformation = imaginaSerMissingInformationR13E(parsed);

  const nativeResult = {
    source: "browser_pdf_parser",
    extractionVersion: "R13E_imagina_ser_intake",
    product,
    productName: hasProductEvidence ? parsed.productName : null,
    productFamily,
    product_family: productFamily,
    currency: evidence.currency === "SOURCE_TEXT" ? parsed.currency : null,
    currentAge: evidence.currentAge === "SOURCE_TEXT" ? parsed.currentAge : null,
    retirementAge: hasProductEvidence ? parsed.retirementAge : null,
    coverageYears: evidence.currentAge === "SOURCE_TEXT" && hasProductEvidence ? parsed.coverageYears : null,
    sumAssured: evidence.sumAssured === "SOURCE_TEXT" ? parsed.sumAssured : null,
    sumInsured: evidence.sumAssured === "SOURCE_TEXT" ? parsed.sumAssured : null,
    premiumStructure: {
      basicAnnualPremium: hasPremiumEvidence ? parsed.premiumStructure?.basicAnnualPremium : null,
      plannedAnnualContribution: hasPremiumEvidence ? parsed.premiumStructure?.plannedAnnualContribution : null,
      plannedContributionType: hasPremiumEvidence ? parsed.premiumStructure?.plannedContributionType : null,
      totalAnnualPremium,
      premiumPayingYears,
      paidUntilAge: evidence.currentAge === "SOURCE_TEXT" && premiumPayingYears !== null
        ? parsed.premiumStructure?.paidUntilAge
        : null
    },
    premiumTable: {
      annual: totalAnnualPremium,
      plannedAnnual: hasPremiumEvidence ? parsed.premiumStructure?.plannedAnnualContribution : null
    },
    totalAnnualPremium,
    paymentTerm: premiumPayingYears !== null ? `${premiumPayingYears} años` : null,
    policyTerm: evidence.currentAge === "SOURCE_TEXT" && hasProductEvidence && Number(parsed.coverageYears) > 0
      ? `${parsed.coverageYears} años`
      : null,
    scenarios,
    retirementScenarioBase: hasScenarioEvidence ? scenarioForAcceptedPacketR13E(scenarios.base) : null,
    retirementScenarioFavorable: hasScenarioEvidence ? scenarioForAcceptedPacketR13E(scenarios.favorable) : null,
    retirementScenarioUnfavorable: hasScenarioEvidence ? scenarioForAcceptedPacketR13E(scenarios.unfavorable) : null,
    retirementInterestRate: parsed.interestRate ?? null,
    evidence,
    missing_information: missingInformation
  };

  return {
    schemaVersion: "forge.accepted_quote_packet.v1",
    source: "browser_pdf_parser",
    extractionVersion: "R13E_imagina_ser_intake",
    fileName: options.fileName || null,
    family: productFamily,
    productFamily,
    product_family: productFamily,
    product,
    age: nativeResult.currentAge,
    currency: nativeResult.currency,
    sumAssured: nativeResult.sumAssured,
    sumInsured: nativeResult.sumInsured,
    annualPremium: totalAnnualPremium,
    coveragePeriod: nativeResult.policyTerm,
    paymentYears: premiumPayingYears,
    context: {
      family: productFamily,
      productFamily,
      product_family: productFamily,
      product
    },
    nativeResult,
    missing_information: missingInformation
  };
}

function normalizeOrviDetectionTextR15M2A(value) {
  return compactText107z15p2R11E(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function isOrviSolucionlinePdfText(text) {
  const source = normalizeOrviDetectionTextR15M2A(text);
  if (!source) return false;

  const hasSpecificIdentity =
    /\bORVI\s+(?:SYNTHETIC\s+\d+\s+PAY|\d{1,3}(?:-\d{1,2})?)\b/.test(source) ||
    /\bORDINARIO\s+DE\s+VIDA\b/.test(source);
  const hasGuaranteedTable =
    /\bVALORES?\s+GARANTIZADOS?\b/.test(source) ||
    /\bGUARANTEED\s+VALUES?\b/.test(source);
  const structuralMarkers = [
    /\b(?:SUMA\s+ASEGURADA|SUM\s+ASSURED)\b/,
    /\b(?:VALOR\s+DE\s+RESCATE|SURRENDER\s+VALUE)\b/,
    /\b(?:VALOR\s+EN\s+EFECTIVO|CASH\s+VALUE)\b/,
    /\b(?:RECUPERACION\s+TOTAL|TOTAL\s+RECOVERY)\b/,
  ].filter((pattern) => pattern.test(source)).length;

  return hasSpecificIdentity && hasGuaranteedTable && structuralMarkers >= 2;
}

function explicitOrviMoneyValueR15M2A(money) {
  if (money?.truth_status !== "source_provided") return null;
  const value = Number(money.value);
  return Number.isFinite(value) ? value : null;
}

export function parseOrviPdfTextToAcceptedQuotePacket(text, options = {}) {
  const envelope = parseOrviSolucionlinePdfText(text, options.parserOptions || {});
  assertValidOrviPdfParserEnvelope(envelope);

  const productIntelligence = mapOrviPdfEnvelopeToProductIntelligence(envelope);
  const validation = validateOrviProductIntelligence(productIntelligence);
  if (!validation.valid) {
    throw new TypeError(`Invalid ORVI Product Intelligence: ${validation.errors.join(",")}`);
  }

  const product = productIntelligence.identity.detected_product_name;
  const currency = productIntelligence.identity.currency;
  const paymentYears = productIntelligence.premium_structure.payment_term_years;
  const sumAssured = explicitOrviMoneyValueR15M2A(
    productIntelligence.protection_summary.basic_sum_assured,
  );
  const annualPremium = explicitOrviMoneyValueR15M2A(
    productIntelligence.premium_structure.basic_annual_premium,
  );
  const totalAnnualPremium = explicitOrviMoneyValueR15M2A(
    productIntelligence.premium_structure.total_annual_premium,
  );
  const missingInformation = [...productIntelligence.missing_information];
  const paymentTerm = Number.isInteger(paymentYears) && paymentYears > 0
    ? `${paymentYears} años`
    : null;

  const nativeResult = {
    source: "browser_pdf_parser",
    extractionVersion: "R15M2B_orvi_real_pdf_layout_aware",
    family: "ORVI",
    productFamily: "orvi",
    product_family: "orvi",
    product,
    productName: product,
    currency,
    sumAssured,
    sumInsured: sumAssured,
    paymentYears,
    paymentTerm,
    premiumTable: {
      annual: annualPremium,
      plannedAnnual: totalAnnualPremium,
    },
    missing_information: missingInformation,
    recommendation: null,
    humanDecisionRequired: true,
    human_decision_required: true,
    productIntelligence,
    product_intelligence: productIntelligence,
  };

  return {
    schemaVersion: "forge.accepted_quote_packet.v1",
    source: "browser_pdf_parser",
    extractionVersion: "R15M2B_orvi_real_pdf_layout_aware",
    fileName: options.fileName || null,
    family: "ORVI",
    productFamily: "orvi",
    product_family: "orvi",
    product,
    productName: product,
    currency,
    sumAssured,
    sumInsured: sumAssured,
    paymentYears,
    paymentTerm,
    annualPremium,
    totalAnnualPremium,
    context: {
      family: "ORVI",
      productFamily: "orvi",
      product_family: "orvi",
      product,
    },
    nativeResult,
    productIntelligence,
    product_intelligence: productIntelligence,
    missing_information: missingInformation,
    recommendation: null,
    humanDecisionRequired: true,
    human_decision_required: true,
  };
}

export function parsePdfTextToAcceptedQuotePacket(text, options = {}) {
  const source = compactText107z15p2R11E(text);
  if (isOrviSolucionlinePdfText(source)) {
    return parseOrviPdfTextToAcceptedQuotePacket(text, options);
  }
  if (/segu\s*beca|segubeca/i.test(source)) {
    return parseSegubecaPdfTextToAcceptedQuotePacket(text, { ...options, route: "R14C_segubeca_route" });
  }
  if (/imagina\s+ser|imagina\s*ser/i.test(source)) {
    return parseImaginaSerPdfTextToAcceptedQuotePacket(text, options);
  }
  return parseVidaMujerPdfTextToAcceptedQuotePacket(text, options);
}

export async function parsePdfFileToAcceptedQuotePacket(file, options = {}) {
  const {
    extractTextFromPdfFile = extractTextFromPdfFile107z15p2R11E,
    ...packetOptions
  } = options;
  const text = await extractTextFromPdfFile(file);
  return parsePdfTextToAcceptedQuotePacket(text, {
    ...packetOptions,
    fileName: packetOptions.fileName || file?.name || null
  });
}

async function enrichPacketWithUdiRuntime107z15p2R11F2(packet) {
  const runtime = globalThis.ForgeUdiMxnRuntime;
  if (!runtime || typeof runtime.enrichAcceptedQuotePacket !== "function") return packet;

  try {
    return await runtime.enrichAcceptedQuotePacket(packet);
  } catch (error) {
    return packet;
  }
}

function isPdfFile107z15p2R11E(file) {
  return Boolean(file) && (
    file.type === "application/pdf" ||
    /\.pdf$/i.test(file.name || "")
  );
}

function ensurePdfStatusBox107z15p2R11E(input) {
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

function setPdfStatus107z15p2R11E(input, message, tone = "info") {
  const box = ensurePdfStatusBox107z15p2R11E(input);
  if (!box) return;
  box.textContent = message;
  box.dataset.tone = tone;
  box.style.color = tone === "error" ? "#b91c1c" : tone === "success" ? "#047857" : "#2563eb";
}

async function convertPdfInputToJsonChange107z15p2R11E(input, file) {
  setPdfStatus107z15p2R11E(
    input,
    "PDF recibido. Extrayendo renglones del estudio…",
    "info",
  );

  try {
    const packet = await withPdfTimeoutR16J1C1(
      parsePdfFileToAcceptedQuotePacket(file, {
        fileName: file.name,
      }),
      60000,
      "El procesamiento completo del PDF",
    );

    setPdfStatus107z15p2R11E(
      input,
      "PDF extraído localmente. Listo para continuar.",
      "success",
    );

    globalThis.dispatchEvent?.(
      new CustomEvent("forge:accepted-quote-packet-ready", {
        detail: Object.freeze({
          version: "R16J1C1_INCREMENTAL_01",
          packet,
          source: "SOLUCIONLINE_REAL_PDF",
          automaticCalculationRequested: false,
          automaticAcceptance: false,
          fileName: file.name || null,
        }),
      }),
    );

    return packet;
  } catch (error) {
    setPdfStatus107z15p2R11E(
      input,
      `No pude procesar el PDF: ${error?.message || error}`,
      "error",
    );

    globalThis.dispatchEvent?.(
      new CustomEvent("forge:accepted-quote-packet-error", {
        detail: Object.freeze({
          version: "R16J1C1_INCREMENTAL_01",
          message: error?.message || String(error),
        }),
      }),
    );

    throw error;
  }
}

function installPdfInputInterceptor107z15p2R11E() {
  if (typeof document === "undefined") return;
  if (globalThis.__FORGE_107Z15P2_R11E_PDF_INTERCEPTOR__) return;
  globalThis.__FORGE_107Z15P2_R11E_PDF_INTERCEPTOR__ = true;

  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.type !== "file") return;
    const file = input.files?.[0];
    if (!isPdfFile107z15p2R11E(file)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    convertPdfInputToJsonChange107z15p2R11E(input, file).catch((error) => {
      console.error("[FORGE R11E] PDF browser parser failed", error);
      setPdfStatus107z15p2R11E(
        input,
        `No pude extraer la cotización del PDF: ${error?.message || error}`,
        "error"
      );
    });
  }, true);
}

globalThis.ForgePdfBrowserParser = {
  parsePdfFileToAcceptedQuotePacket,
  parsePdfTextToAcceptedQuotePacket,
  parseOrviPdfTextToAcceptedQuotePacket,
  isOrviSolucionlinePdfText,
  parseImaginaSerPdfTextToAcceptedQuotePacket,
  parseVidaMujerPdfTextToAcceptedQuotePacket,
  extractTextFromPdfFile107z15p2R11E,
  groupPdfItemsIntoRows107z15p2R11E
};

installPdfInputInterceptor107z15p2R11E();
// FORGE:107Z15P2_R11E_SOLUCIONLINE_LAYOUT_AWARE_PDF_PARSER:END
