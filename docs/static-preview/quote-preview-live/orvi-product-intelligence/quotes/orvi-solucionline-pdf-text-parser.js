import {
  ORVI_PDF_PARSER_CONTRACT_ID,
  ORVI_PDF_PARSER_IMPLEMENTATION_REF,
  ORVI_PDF_TIMELINE_COLUMNS,
  assertValidOrviPdfParserEnvelope,
  createOrviPdfValue,
} from "./orvi-pdf-parser-contract.js";

export const ORVI_SOLUCIONLINE_PDF_TEXT_PARSER_ID = "orvi.solucionline.pdf.text-parser.v1";

function normalizeLine(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

function normalizeForMatch(value) {
  return normalizeLine(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function splitPages(text) {
  const raw = String(text ?? "").replace(/\r\n?/g, "\n");
  const pages = raw.split("\f");
  while (pages.length > 1 && !pages.at(-1).trim()) pages.pop();
  return pages.map((page, index) => ({
    number: index + 1,
    raw: page,
    lines: page.split("\n").map((line) => line.replace(/\u00a0/g, " ").trimEnd()).filter((line) => line.trim()),
  }));
}

function parseNumberToken(token) {
  const normalized = String(token ?? "").replace(/,/g, "").trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function numericOrZeroValue(token, unit, page, section, confidence = 1) {
  const displayed = normalizeLine(token);
  const value = parseNumberToken(displayed);
  if (value === null) {
    return createOrviPdfValue({
      state: "unreadable",
      value: null,
      unit,
      displayed_text: displayed || null,
      source_page: page,
      source_section: section,
      confidence: 0,
    });
  }
  return createOrviPdfValue({
    state: value === 0 ? "explicit_zero" : "numeric",
    value,
    unit,
    displayed_text: displayed,
    source_page: page,
    source_section: section,
    confidence,
  });
}

function statefulTextValue(token, unit, page, section) {
  const displayed = normalizeLine(token);
  const normalized = normalizeForMatch(displayed);
  if (!displayed) {
    return createOrviPdfValue({
      state: "missing",
      value: null,
      unit,
      displayed_text: null,
      source_page: page,
      source_section: section,
      confidence: 0,
    });
  }
  if (normalized === "SIN COSTO") {
    return createOrviPdfValue({
      state: "sin_costo",
      value: null,
      unit,
      displayed_text: displayed.toUpperCase(),
      source_page: page,
      source_section: section,
      confidence: 1,
    });
  }
  if (normalized === "AMPARADO") {
    return createOrviPdfValue({
      state: "amparado",
      value: null,
      unit,
      displayed_text: displayed.toUpperCase(),
      source_page: page,
      source_section: section,
      confidence: 1,
    });
  }
  if (["N/A", "NA", "NO APLICA"].includes(normalized)) {
    return createOrviPdfValue({
      state: "not_applicable",
      value: null,
      unit: null,
      displayed_text: null,
      source_page: page,
      source_section: section,
      confidence: 1,
    });
  }
  return numericOrZeroValue(displayed, unit, page, section);
}

function termValue(token, page, section) {
  const displayed = normalizeLine(token);
  const normalized = normalizeForMatch(displayed);
  if (["N/A", "NA", "NO APLICA"].includes(normalized)) {
    return createOrviPdfValue({
      state: "not_applicable",
      value: null,
      unit: null,
      displayed_text: null,
      source_page: page,
      source_section: section,
      confidence: 1,
    });
  }
  const match = displayed.match(/(\d+)\s*(?:a[nñ]os|years)/i);
  if (!match) {
    return createOrviPdfValue({
      state: "unreadable",
      value: null,
      unit: "years",
      displayed_text: displayed || null,
      source_page: page,
      source_section: section,
      confidence: 0,
    });
  }
  return createOrviPdfValue({
    state: "numeric",
    value: Number(match[1]),
    unit: "years",
    displayed_text: displayed,
    source_page: page,
    source_section: section,
    confidence: 1,
  });
}

function deriveCode(label, index, synthetic) {
  const normalized = normalizeForMatch(label);
  if (synthetic) {
    if (normalized === "ORVI SYNTHETIC BASIC PROTECTION") return "ORVI_BASE_SYNTH";
    if (normalized === "SYNTHETIC ASSISTANCE BENEFIT") return "ASSIST_SYNTH";
    if (normalized === "SYNTHETIC ACCIDENTAL PROTECTION") return "ACCIDENT_SYNTH";
    if (normalized === "SYNTHETIC OPTIONAL BENEFIT") return "OPTION_SYNTH";
  }
  if (normalized.startsWith("ORVI ")) return "ORVI_BASE";
  const acronym = label.match(/\(([A-Z0-9 /-]{2,})\)\s*$/i)?.[1];
  if (acronym) return normalizeForMatch(acronym).replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `COVERAGE_${index + 1}`;
}

function findPlanLabel(pages) {
  for (const page of pages) {
    for (const line of page.lines) {
      if (/^ORVI\s+SYNTHETIC\s+\d+\s+PAY\s+(?:UDI|USD)$/i.test(line)) return line;
      const real = line.match(/ORVI\s+\d{1,3}-\d{1,2}\s+PAGOS\s+(?:UDIS?|D[ÓO]LARES?|USD)/i);
      if (real) return normalizeLine(real[0]);
    }
  }
  return null;
}

function parseCurrency(planLabel, allText) {
  const normalized = normalizeForMatch(`${planLabel ?? ""} ${allText}`);
  if (/\bUSD\b|\bDOLARES?\b/.test(normalized)) return "USD";
  if (/\bUDI(?:S)?\b|UNIDADES DE INVERSION/.test(normalized)) return "UDI";
  return null;
}

function parsePaymentTerm(planLabel) {
  if (!planLabel) return null;
  const Spanish = planLabel.match(/-(\d+)\s+PAGOS/i);
  if (Spanish) return Number(Spanish[1]);
  const English = planLabel.match(/\b(\d+)\s+PAY\b/i);
  return English ? Number(English[1]) : null;
}

function parseInsured(pages, synthetic) {
  const pageOne = pages[0]?.raw ?? "";
  if (synthetic) {
    const match = pageOne.match(/AGE\s+(\d+)\s+GENDER\s+(FEMALE|MALE|OTHER|UNKNOWN)\s+SMOKER\s+(YES|NO|UNKNOWN)\s+PREFERRED\s+(YES|NO|UNKNOWN)/i);
    if (!match) return { age: null, gender: "unknown", smoker: null, preferred: null };
    return {
      age: Number(match[1]),
      gender: match[2].toLowerCase(),
      smoker: match[3].toUpperCase() === "UNKNOWN" ? null : match[3].toUpperCase() === "YES",
      preferred: match[4].toUpperCase() === "UNKNOWN" ? null : match[4].toUpperCase() === "YES",
    };
  }

  const titularLine = pages[0]?.lines.find((line) => /^Titular\b/i.test(normalizeLine(line)));
  const match = normalizeLine(titularLine).match(/\b(No|S[ií])\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{1,3})\s+(Masculino|Femenino|Male|Female|Otro|Other)\s+(No|S[ií])\s*$/i);
  if (!match) return { age: null, gender: "unknown", smoker: null, preferred: null };
  const genderMap = {
    MASCULINO: "male",
    MALE: "male",
    FEMENINO: "female",
    FEMALE: "female",
    OTRO: "other",
    OTHER: "other",
  };
  return {
    age: Number(match[3]),
    gender: genderMap[normalizeForMatch(match[4])] ?? "unknown",
    smoker: /^s/i.test(match[5]),
    preferred: /^s/i.test(match[1]),
  };
}

function extractCoverageLines(pageOne, synthetic) {
  const lines = pageOne.lines;
  const startIndex = lines.findIndex((line) => normalizeForMatch(line).startsWith("COVERAGES") || normalizeForMatch(line).startsWith("COBERTURAS"));
  if (startIndex < 0) return [];
  let endIndex = lines.findIndex((line, index) => index > startIndex && (
    normalizeForMatch(line).startsWith("RECOMMENDED BENEFITS")
    || normalizeForMatch(line).startsWith("ADEMAS TE")
    || normalizeForMatch(line) === "VALORES GARANTIZADOS"
  ));
  if (endIndex < 0) endIndex = lines.length;

  const rows = [];
  for (const line of lines.slice(startIndex + 1, endIndex)) {
    const normalized = normalizeForMatch(line);
    if (!line || normalized.startsWith("COVERAGE ") || normalized.includes("PLAZO DE") || normalized.includes("PRIMA TOTAL ANUAL")) continue;
    const columns = line.split(/\s{2,}/).map(normalizeLine).filter(Boolean);
    if (columns.length < 4) continue;
    const [label, term, sumAssured, annualPremium] = columns.slice(-4);
    if (!/(\d+\s*(?:a[nñ]os|years)|\d+\s*REN|N\/A)/i.test(term)) continue;
    rows.push({ label, term, sumAssured, annualPremium });
  }

  if (!synthetic && rows.length === 0) {
    const compact = pageOne.raw.replace(/\r/g, "");
    const regex = /^\s*(.+?)\s{2,}(\d+\s+(?:a[nñ]os|REN))\s{2,}([\d,]+|Amparado)\s{2,}([\d,.]+|SIN COSTO)\s*$/gim;
    for (const match of compact.matchAll(regex)) {
      rows.push({ label: normalizeLine(match[1]), term: match[2], sumAssured: match[3], annualPremium: match[4] });
    }
  }
  return rows;
}

function parseCoverages(pages, currency, synthetic) {
  return extractCoverageLines(pages[0], synthetic).map((row, index) => ({
    code: deriveCode(row.label, index, synthetic),
    label: row.label,
    coverage_term: termValue(row.term, 1, "coverages"),
    sum_assured: statefulTextValue(row.sumAssured, currency, 1, "coverages"),
    annual_premium: statefulTextValue(row.annualPremium, currency, 1, "coverages"),
  }));
}

function parseRecommendedBenefits(pages, currency, synthetic) {
  const lines = pages[0]?.lines ?? [];
  const startIndex = lines.findIndex((line) => {
    const normalized = normalizeForMatch(line);
    return normalized === "RECOMMENDED BENEFITS" || normalized === "ADQUIRIR";
  });
  if (startIndex < 0) return [];
  let endIndex = lines.findIndex((line, index) => index > startIndex && (
    normalizeForMatch(line) === "GUARANTEED VALUES"
    || normalizeForMatch(line) === "VALORES GARANTIZADOS"
  ));
  if (endIndex < 0) endIndex = lines.length;
  const rows = [];
  for (const line of lines.slice(startIndex + 1, endIndex)) {
    const normalized = normalizeForMatch(line);
    if (normalized.startsWith("DISPLAYED TOTAL") || normalized.startsWith("VISIBLE LINE ITEM") || normalized.startsWith("RECONCILIATION STATUS") || normalized.includes("PRIMA TOTAL CON BENEFICIOS") || normalized.includes("PLAZO DE")) continue;
    const columns = line.split(/\s{2,}/).map(normalizeLine).filter(Boolean);
    if (synthetic && columns.length >= 3) {
      rows.push({ label: columns.at(-3), sumAssured: columns.at(-2), annualPremium: columns.at(-1) });
    } else if (!synthetic && columns.length >= 4 && /\d+\s+REN/i.test(columns.at(-3))) {
      rows.push({ label: columns.at(-4), sumAssured: columns.at(-2), annualPremium: columns.at(-1) });
    }
  }
  return rows.map((row, index) => ({
    code: deriveCode(row.label, index, synthetic),
    label: row.label,
    sum_assured: statefulTextValue(row.sumAssured, currency, 1, "recommended_benefits"),
    annual_premium: statefulTextValue(row.annualPremium, currency, 1, "recommended_benefits"),
  }));
}

function findDisplayedNumber(allText, patterns) {
  for (const pattern of patterns) {
    const match = allText.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parsePremiumSummary(pages, currency, recommendedBenefits) {
  const allText = pages.map((page) => page.raw).join("\n");
  const baseToken = findDisplayedNumber(allText, [
    /BASE TOTAL ANNUAL PREMIUM\s+([\d,.]+)/i,
    /Prima Total Anual\s+([\d,.]+)/i,
  ]);
  const displayedToken = findDisplayedNumber(allText, [
    /DISPLAYED TOTAL WITH RECOMMENDED BENEFITS\s+([\d,.]+)/i,
    /Prima total con beneficios recomendados\s+([\d,.]+)/i,
  ]);
  let visibleToken = findDisplayedNumber(allText, [
    /VISIBLE LINE ITEM SUM FOR COMPARISON ONLY\s+([\d,.]+)/i,
  ]);
  if (!visibleToken) {
    const base = parseNumberToken(baseToken);
    const recommended = recommendedBenefits
      .map((item) => item.annual_premium?.value)
      .filter((value) => Number.isFinite(value))
      .reduce((sum, value) => sum + value, 0);
    if (Number.isFinite(base)) visibleToken = (base + recommended).toFixed(2);
  }
  const displayed = parseNumberToken(displayedToken);
  const visible = parseNumberToken(visibleToken);
  const status = Number.isFinite(displayed) && Number.isFinite(visible)
    ? (Math.abs(displayed - visible) <= 0.005
      ? "source_displayed_total_reconciles"
      : "source_displayed_total_unreconciled")
    : "not_evaluated";
  return {
    base_total_annual_premium: statefulTextValue(baseToken, currency, 1, "premium_summary"),
    displayed_total_with_recommended: statefulTextValue(displayedToken, currency, 1, "premium_summary"),
    visible_line_item_sum: createOrviPdfValue({
      ...statefulTextValue(visibleToken, currency, 1, "derived_comparison_only"),
      displayed_text: visibleToken,
    }),
    reconciliation: {
      status,
      source_total_preserved: true,
      recomputed_override_applied: false,
    },
  };
}

function parseTimeline(pages, currency) {
  const rows = [];
  const rowPattern = /^\s*(\d{2,3})\s+(\d{1,2})\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s*$/;
  for (const page of pages) {
    for (const rawLine of page.raw.split("\n")) {
      const match = rawLine.match(rowPattern);
      if (!match) continue;
      const [, age, year, annual, additional, surrender, cash, total] = match;
      rows.push({
        real_age: Number(age),
        policy_year: Number(year),
        annual_premium: numericOrZeroValue(annual, currency, page.number, "guaranteed_values"),
        additional_premium: numericOrZeroValue(additional, currency, page.number, "guaranteed_values"),
        guaranteed_surrender_value: numericOrZeroValue(surrender, currency, page.number, "guaranteed_values"),
        cash_value: numericOrZeroValue(cash, currency, page.number, "guaranteed_values"),
        total_recovery: numericOrZeroValue(total, currency, page.number, "guaranteed_values"),
      });
    }
  }
  return rows;
}

function parseGlossary(pages, synthetic) {
  const page = pages.at(-1)?.raw ?? "";
  if (synthetic) {
    const section = page.split(/\nGLOSSARY\n/i)[1]?.split(/\nNOTES\n/i)[0] ?? "";
    return section.split("\n").map(normalizeLine).filter(Boolean).flatMap((line) => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      return match ? [{ term: match[1], definition: match[2] }] : [];
    });
  }
  const terms = ["Prima Anual", "Prima AVE", "Recuperación Total", "Valor de Rescate AVE", "Valor en Efectivo"];
  return terms.filter((term) => normalizeForMatch(page).includes(normalizeForMatch(term))).map((term) => ({
    term,
    definition: "source_definition_present",
  }));
}

function parseNotes(pages, synthetic, currency) {
  const allText = pages.map((page) => page.raw).join("\n");
  if (synthetic) {
    const page = pages.at(-1)?.raw ?? "";
    const section = page.split(/\nNOTES\n/i)[1] ?? "";
    return section.split("\n").map(normalizeLine).filter(Boolean).filter((line) => !/^Synthetic fixture validity:/i.test(line));
  }
  const notes = [];
  if (/Todas las cantidades.*Unidades de Inversi[oó]n/i.test(allText) || currency === "UDI") {
    notes.push("All displayed amounts are denominated in UDI.");
  } else if (currency === "USD") {
    notes.push("All displayed amounts are denominated in USD.");
  }
  if (/no forma parte del contrato/i.test(allText)) {
    notes.push("This study is illustrative and is not an insurance contract.");
  }
  if (/vigencia de\s+\d+\s+d[ií]as/i.test(allText)) {
    notes.push("The quote has a limited validity period.");
  }
  return notes;
}

function parseQuoteValidityDays(allText) {
  const synthetic = allText.match(/Synthetic fixture validity:\s*(\d+)\s*days/i);
  if (synthetic) return Number(synthetic[1]);
  const real = allText.match(/vigencia de\s+(\d+)\s+d[ií]as/i);
  return real ? Number(real[1]) : null;
}

function parseSourceVersion(allText, synthetic) {
  if (synthetic) return "SYNTHETIC-V1";
  return allText.match(/Solucionline versi[oó]n\s+([0-9.]+)/i)?.[1] ?? null;
}

function collectMissing(envelope) {
  const missing = [];
  const required = [
    ["document.plan_label", envelope.document.plan_label],
    ["document.currency", envelope.document.currency],
    ["document.payment_term_years", envelope.document.payment_term_years],
    ["insured.age", envelope.insured.age],
    ["coverages", envelope.coverages.length],
    ["premium_summary.base_total_annual_premium", envelope.premium_summary.base_total_annual_premium.value],
    ["guaranteed_values.rows", envelope.guaranteed_values.rows.length],
  ];
  for (const [path, value] of required) {
    if (value === null || value === undefined || value === "" || value === 0) missing.push(path);
  }
  return missing;
}

export function parseOrviSolucionlinePdfText(text, options = {}) {
  if (typeof text !== "string" || !text.trim()) {
    throw new TypeError("ORVI PDF text must be a non-empty string");
  }
  const pages = splitPages(text);
  const allText = pages.map((page) => page.raw).join("\n");
  const synthetic = /SYNTHETIC ORVI SOLUCIONLINE STUDY/i.test(allText);
  const planLabel = findPlanLabel(pages);
  const currency = parseCurrency(planLabel, allText);
  const paymentTermYears = parsePaymentTerm(planLabel);
  const insured = parseInsured(pages, synthetic);
  const coverages = parseCoverages(pages, currency, synthetic);
  const recommendedBenefits = parseRecommendedBenefits(pages, currency, synthetic);
  const premiumSummary = parsePremiumSummary(pages, currency, recommendedBenefits);
  const timelineRows = parseTimeline(pages, currency);
  const baseCoverage = coverages.find((coverage) => coverage.code.startsWith("ORVI_BASE")) ?? coverages[0];

  const envelope = {
    contract_id: ORVI_PDF_PARSER_CONTRACT_ID,
    fixture_id: synthetic ? (options.fixture_id ?? "orvi-solucionline-synthetic-usd-10pay-v1") : null,
    synthetic_fixture: synthetic,
    product_type: "orvi",
    source_type: "solucionline_pdf",
    document: {
      plan_label: planLabel,
      currency,
      payment_term_years: paymentTermYears,
      coverage_duration_years: baseCoverage?.coverage_term?.state === "numeric"
        ? baseCoverage.coverage_term.value
        : null,
      page_count: pages.length,
      text_layer_status: "present",
      illustrative_not_contract: /not an insurance contract|no forma parte del contrato/i.test(allText),
      quote_validity_days: parseQuoteValidityDays(allText),
      source_version_label: parseSourceVersion(allText, synthetic),
    },
    insured,
    coverages,
    recommended_benefits: recommendedBenefits,
    premium_summary: premiumSummary,
    guaranteed_values: {
      columns: [...ORVI_PDF_TIMELINE_COLUMNS],
      rows: timelineRows,
    },
    glossary: parseGlossary(pages, synthetic),
    notes: parseNotes(pages, synthetic, currency),
    source_trace: [
      {
        field: "document.plan_label",
        source_page: 1,
        source_section: "header",
        status: synthetic ? "synthetic_confirmed" : "source_confirmed",
        confidence: planLabel ? 1 : 0,
      },
      {
        field: "guaranteed_values.rows",
        source_page: timelineRows[0]?.annual_premium?.source_page ?? 1,
        source_section: "guaranteed_values",
        status: synthetic ? "synthetic_confirmed" : "source_confirmed",
        confidence: timelineRows.length >= 3 ? 1 : 0,
      },
    ],
    privacy: {
      pii_redacted: true,
      real_source_values_copied: false,
      retained_identity_fields: [],
    },
    ownership: {
      canonical_owner: "product-intelligence",
      parser_ref: ORVI_PDF_PARSER_IMPLEMENTATION_REF,
      runtime_ref: null,
      renderer_ref: null,
    },
    recommendation: null,
    mxn_projection: null,
    missing_information: [],
  };
  envelope.missing_information = collectMissing(envelope);
  return assertValidOrviPdfParserEnvelope(envelope);
}
