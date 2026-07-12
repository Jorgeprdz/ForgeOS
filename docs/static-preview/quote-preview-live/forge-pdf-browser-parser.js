// FORGE:107Z15P2_R11E_SOLUCIONLINE_LAYOUT_AWARE_PDF_PARSER:START
import { parseSolucionlineRetirementQuote } from "./forge-solucionline-retirement-parser.js";
import { parseSolucionlineSegubecaQuote } from "./forge-segubeca-solucionline-parser.js";

const PDFJS_CDN_VERSION_107Z15P2_R11E = "4.10.38";
const PDFJS_MODULE_URL_107Z15P2_R11E = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_CDN_VERSION_107Z15P2_R11E}/build/pdf.mjs`;
const PDFJS_WORKER_URL_107Z15P2_R11E = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_CDN_VERSION_107Z15P2_R11E}/build/pdf.worker.mjs`;

let pdfjsPromise107z15p2R11E = null;

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

async function loadPdfJs107z15p2R11E() {
  if (!pdfjsPromise107z15p2R11E) {
    pdfjsPromise107z15p2R11E = import(PDFJS_MODULE_URL_107Z15P2_R11E).then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL_107Z15P2_R11E;
      return pdfjsLib;
    });
  }
  return pdfjsPromise107z15p2R11E;
}

function groupPdfItemsIntoRows107z15p2R11E(items) {
  const rows = [];

  for (const item of items) {
    const value = String(item.str || "").trim();
    if (!value) continue;
    const transform = item.transform || [];
    const x = Number(transform[4] || 0);
    const y = Number(transform[5] || 0);

    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 3);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push({ x, value });
  }

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) => row.items.sort((a, b) => a.x - b.x).map((item) => item.value).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export async function extractTextFromPdfFile107z15p2R11E(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Archivo PDF inválido o no compatible con arrayBuffer().");
  }

  const pdfjsLib = await loadPdfJs107z15p2R11E();
  const arrayBuffer = await file.arrayBuffer();
  const documentTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await documentTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const rows = groupPdfItemsIntoRows107z15p2R11E(textContent.items);
    pages.push(rows.join("\n"));
  }

  return pages.join("\n\n");
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
  const primaryInsured = parsed.participants?.primary_insured || "Contratante SeguBeca";
  const child = parsed.participants?.child_or_education_beneficiary || "Menor SeguBeca";

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
    annualPremiumWithRecommended: parsed.totalWithRecommended,
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

export function parsePdfTextToAcceptedQuotePacket(text, options = {}) {
  const source = compactText107z15p2R11E(text);
  if (/segu\s*beca|segubeca/i.test(source)) {
    return parseSegubecaPdfTextToAcceptedQuotePacket(text, { ...options, route: "R14C_segubeca_route" });
  }
  if (/imagina\s+ser|imagina\s*ser/i.test(source)) {
    return parseImaginaSerPdfTextToAcceptedQuotePacket(text, options);
  }
  return parseVidaMujerPdfTextToAcceptedQuotePacket(text, options);
}

export async function parsePdfFileToAcceptedQuotePacket(file, options = {}) {
  const text = await extractTextFromPdfFile107z15p2R11E(file);
  return parsePdfTextToAcceptedQuotePacket(text, {
    ...options,
    fileName: options.fileName || file?.name || null
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
  setPdfStatus107z15p2R11E(input, "PDF recibido. Extrayendo renglones del estudio…", "info");

  const packet = await enrichPacketWithUdiRuntime107z15p2R11F2(
    await parsePdfFileToAcceptedQuotePacket(file, { fileName: file.name })
  );

  if (packet?.missing_information?.length) {
    setPdfStatus107z15p2R11E(
      input,
      `PDF convertido con datos faltantes: ${packet.missing_information.join(", ")}.`,
      "error"
    );
  } else {
    setPdfStatus107z15p2R11E(input, "PDF convertido a cotización aceptada. Abriendo modal…", "success");
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
  parseImaginaSerPdfTextToAcceptedQuotePacket,
  parseVidaMujerPdfTextToAcceptedQuotePacket,
  extractTextFromPdfFile107z15p2R11E
};

installPdfInputInterceptor107z15p2R11E();
// FORGE:107Z15P2_R11E_SOLUCIONLINE_LAYOUT_AWARE_PDF_PARSER:END
