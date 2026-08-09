import { parseGMMQuote } from "../../../product-intelligence/evidence/gmm-quote-parser.js";

const ADAPTER_ID = "forge.quotes.gmm-product-decision-adapter.v1";
const CANONICAL_PARSER = "product-intelligence/evidence/gmm-quote-parser.js";

function hasValue(value) {
  return value !== null && value !== undefined && value !== "" && value !== "UNKNOWN";
}

function token(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function evidenceValue(value, { unit = null, currency = null } = {}) {
  return deepFreeze({
    value: hasValue(value) ? value : null,
    unit,
    currency,
    truth_status: hasValue(value) ? "source_provided" : "unknown",
  });
}

function rawValue(value) {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "value")) {
    return value.truth_status === "source_provided" ? value.value : null;
  }
  return hasValue(value) ? value : null;
}

function firstValue(...values) {
  for (const value of values) {
    const resolved = rawValue(value);
    if (hasValue(resolved)) return resolved;
  }
  return null;
}

function normalizedCurrency(value) {
  const resolved = firstValue(value);
  if (!hasValue(resolved) || token(resolved) === "pesos") return "MXN";
  return String(resolved).toUpperCase();
}

function money(value, currency = "MXN") {
  const numeric = Number(rawValue(value));
  if (!Number.isFinite(numeric)) return null;
  const resolvedCurrency = normalizedCurrency(currency);
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: resolvedCurrency,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${numeric.toLocaleString("es-MX")} ${resolvedCurrency}`;
  }
}

function percent(value) {
  const numeric = Number(rawValue(value));
  return Number.isFinite(numeric) ? `${numeric}%` : null;
}

function listValue(value) {
  if (!Array.isArray(value)) return firstValue(value);
  const visible = value
    .map((item) => typeof item === "string" ? item : item?.label || item?.name || item?.title)
    .filter(Boolean);
  return visible.length ? visible.join(", ") : null;
}

function missingFor(parsed) {
  const required = [
    ["deductible", parsed.deductible, "Falta deducible confirmado en la cotización GMM."],
    ["coinsurance", parsed.coinsurance?.percent, "Falta coaseguro confirmado en la cotización GMM."],
    ["plan", parsed.plan, "Falta plan o nivel hospitalario confirmado en la cotización GMM."],
    ["sumAssured", parsed.sumAssured, "Falta suma asegurada confirmada en la cotización GMM."],
    ["annualPremium", parsed.annualPremium, "Falta prima anual confirmada en la cotización GMM."],
  ];
  return required.filter(([, value]) => !hasValue(value)).map(([, , message]) => message);
}

export function isGmmQuoteText(text) {
  const source = String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  const identity = /\bALFA\s+MEDICAL(?:\s+FLEX|\s+INTERNACIONAL)?\b/.test(source);
  const markers = [
    /\bDEDUCIBLE\b/,
    /\bCOASEGURO\b/,
    /\bSUMA\s+ASEGURADA\b/,
    /\bTABULADOR\b/,
    /\bTERRITORIALIDAD\b/,
  ].filter((pattern) => pattern.test(source)).length;
  return identity && markers >= 2;
}

export function buildGmmProductIntelligence(parsed = {}) {
  const currency = normalizedCurrency(parsed.currency);
  const missingInformation = missingFor(parsed);
  return deepFreeze({
    schema: {
      id: "forge.product_intelligence.gmm.quote_evidence.v1",
      version: "1.0.0",
    },
    identity: {
      detected_product_name: hasValue(parsed.productName) ? parsed.productName : null,
      product_family: "GMM",
      plan: hasValue(parsed.plan) ? parsed.plan : null,
    },
    medical_plan: {
      deductible: evidenceValue(parsed.deductible, { currency }),
      coinsurance: evidenceValue(parsed.coinsurance?.percent, { unit: "%" }),
      coinsurance_cap: evidenceValue(parsed.coinsurance?.maxOutOfPocket, { currency }),
      hospital_level: evidenceValue(parsed.plan),
      hospital_network: evidenceValue(null),
      territory: evidenceValue(parsed.territoriality),
      tabulator: evidenceValue(parsed.tabulator),
      room_type: evidenceValue(null),
      insured_members: evidenceValue(null),
      maternity: evidenceValue(null),
      waiting_periods: evidenceValue(null),
      additional_benefits: evidenceValue(null),
    },
    protection_summary: {
      basic_sum_assured: evidenceValue(parsed.sumAssured, { currency }),
    },
    premium_structure: {
      basic_annual_premium: evidenceValue(parsed.annualPremium, { currency }),
      total_annual_premium: evidenceValue(parsed.annualPremium, { currency }),
    },
    provenance: {
      evidence_type: "QUOTE_PDF_TEXT",
      parser_ref: CANONICAL_PARSER,
      source_date: null,
    },
    missing_information: missingInformation,
    limitations: [
      "Sólo se proyectan campos respaldados por la cotización procesada.",
      "Las condiciones generales y la póliza emitida prevalecen sobre este resumen.",
    ],
  });
}

export function parseGmmQuoteTextToAcceptedQuotePacket(text, options = {}) {
  const parsed = parseGMMQuote({ text });
  if (parsed.productType !== "GMM" || !hasValue(parsed.productName)) {
    throw new TypeError("GMM source evidence could not be identified by the canonical parser.");
  }
  const productIntelligence = buildGmmProductIntelligence(parsed);
  const currency = normalizedCurrency(parsed.currency);
  const missingInformation = [...productIntelligence.missing_information];
  const nativeResult = deepFreeze({
    source: "browser_pdf_parser",
    extractionVersion: "PHASE006_GMM_CANONICAL_EVIDENCE_BRIDGE_V1",
    product: parsed.productName,
    productName: parsed.productName,
    family: "GMM",
    productFamily: "GMM",
    product_family: "GMM",
    plan: firstValue(parsed.plan),
    currency,
    deductible: firstValue(parsed.deductible),
    coinsurancePercent: firstValue(parsed.coinsurance?.percent),
    coinsurance: firstValue(parsed.coinsurance?.percent),
    coinsuranceCap: firstValue(parsed.coinsurance?.maxOutOfPocket),
    sumAssured: firstValue(parsed.sumAssured),
    sumInsured: firstValue(parsed.sumAssured),
    territory: firstValue(parsed.territoriality),
    territoriality: firstValue(parsed.territoriality),
    tabulator: firstValue(parsed.tabulator),
    annualPremium: firstValue(parsed.annualPremium),
    totalAnnualPremium: firstValue(parsed.annualPremium),
    premiumTable: {
      annual: firstValue(parsed.annualPremium),
      plannedAnnual: null,
    },
    productIntelligence,
    product_intelligence: productIntelligence,
    missing_information: missingInformation,
  });

  return deepFreeze({
    schemaVersion: "forge.accepted_quote_packet.v1",
    source: "browser_pdf_parser",
    extractionVersion: "PHASE006_GMM_CANONICAL_EVIDENCE_BRIDGE_V1",
    fileName: options.fileName || null,
    family: "GMM",
    productFamily: "GMM",
    product_family: "GMM",
    product: parsed.productName,
    productName: parsed.productName,
    productType: "GMM",
    product_type: "GMM",
    plan: firstValue(parsed.plan),
    currency,
    deductible: firstValue(parsed.deductible),
    coinsurancePercent: firstValue(parsed.coinsurance?.percent),
    coinsuranceCap: firstValue(parsed.coinsurance?.maxOutOfPocket),
    sumAssured: firstValue(parsed.sumAssured),
    sumInsured: firstValue(parsed.sumAssured),
    annualPremium: firstValue(parsed.annualPremium),
    totalAnnualPremium: firstValue(parsed.annualPremium),
    context: {
      family: "GMM",
      productFamily: "GMM",
      product_family: "GMM",
      product: parsed.productName,
    },
    nativeResult,
    productIntelligence,
    product_intelligence: productIntelligence,
    missing_information: missingInformation,
    recommendation: null,
    humanDecisionRequired: true,
    human_decision_required: true,
  });
}

export function isGmmAcceptedQuotePacket(packet, nativeResult = packet?.nativeResult || {}) {
  const candidates = [
    packet?.family,
    packet?.productFamily,
    packet?.product_family,
    packet?.productType,
    packet?.product,
    nativeResult?.family,
    nativeResult?.productFamily,
    nativeResult?.product_family,
    nativeResult?.product,
  ].map(token);
  return candidates.some((value) =>
    value === "gmm" || value.includes("gastos_medicos") || value.includes("alfa_medical"));
}

export function buildGmmAcceptedQuoteCalculation({ packet = {}, nativeResult = packet?.nativeResult || {} } = {}) {
  const productIntelligence = packet.productIntelligence
    || packet.product_intelligence
    || nativeResult.productIntelligence
    || nativeResult.product_intelligence
    || null;
  const currency = normalizedCurrency(firstValue(nativeResult.currency, packet.currency));
  return deepFreeze({
    adapterId: ADAPTER_ID,
    nativeResult,
    productFamily: "GMM",
    product: firstValue(nativeResult.product, packet.product),
    context: packet.context || {},
    productIntelligence,
    client: firstValue(nativeResult.prospect, nativeResult.insured, packet.insured, packet.name),
    currency,
    annualPremium: firstValue(nativeResult.annualPremium, nativeResult.totalAnnualPremium, packet.annualPremium),
    totalAnnualPremium: firstValue(nativeResult.totalAnnualPremium, nativeResult.annualPremium, packet.totalAnnualPremium, packet.annualPremium),
    paymentYears: null,
    paymentMode: firstValue(nativeResult.paymentMode, packet.paymentMode),
    coveragePeriod: firstValue(nativeResult.coveragePeriod, packet.coveragePeriod),
    plan: firstValue(nativeResult.plan, packet.plan),
    deductible: firstValue(nativeResult.deductible, packet.deductible),
    coinsurancePercent: firstValue(nativeResult.coinsurancePercent, nativeResult.coinsurance, packet.coinsurancePercent),
    coinsuranceCap: firstValue(nativeResult.coinsuranceCap, packet.coinsuranceCap),
    sumAssured: firstValue(nativeResult.sumAssured, nativeResult.sumInsured, packet.sumAssured, packet.sumInsured),
    territory: firstValue(nativeResult.territory, nativeResult.territoriality),
    tabulator: firstValue(nativeResult.tabulator),
    totalContributed: null,
    totalRecovery: null,
    totalContributedMXN: null,
    totalRecoveryMXN: null,
    projectedUdiAtRetirement: null,
    monthlyIncomeMXN: null,
    annualIncomeMXN: null,
    accumulatedIncome: [],
    udiProjection: null,
    udiRateMetadata: null,
    base: null,
    favorable: null,
    unfavorable: null,
    optionalCoverages: Array.isArray(nativeResult.optionalCoverages) ? nativeResult.optionalCoverages : [],
    retirementScenarioStatus: null,
    recommendation: null,
    humanDecisionRequired: true,
  });
}

export function isGmmProduct(input = {}) {
  return isGmmAcceptedQuotePacket(input, input?.nativeResult || {});
}

function metric({ id, label, value, evidence = "QUOTE_OR_PRODUCT_INTELLIGENCE" }) {
  if (!hasValue(value)) return null;
  return { id, label, value, evidence };
}

function section(key, title, items) {
  const visible = items.filter(Boolean);
  return visible.length ? { key, kind: key, title, items: visible } : null;
}

export function buildGmmDashboardModel(input = {}) {
  const native = input.nativeResult || {};
  const productIntelligence = input.productIntelligence || input.product_intelligence
    || native.productIntelligence || native.product_intelligence || {};
  const medical = productIntelligence.medical_plan || {};
  const protection = productIntelligence.protection_summary || {};
  const premium = productIntelligence.premium_structure || {};
  const currency = normalizedCurrency(firstValue(input.currency, native.currency, packetCurrency(productIntelligence)));

  const plan = firstValue(input.plan, native.plan, medical.hospital_level, productIntelligence.identity?.plan);
  const deductible = firstValue(input.deductible, native.deductible, medical.deductible);
  const coinsurance = firstValue(input.coinsurancePercent, native.coinsurancePercent, native.coinsurance, medical.coinsurance);
  const coinsuranceCap = firstValue(input.coinsuranceCap, native.coinsuranceCap, medical.coinsurance_cap);
  const sumAssured = firstValue(input.sumAssured, native.sumAssured, native.sumInsured, protection.basic_sum_assured);
  const annualPremium = firstValue(input.totalAnnualPremium, input.annualPremium, native.totalAnnualPremium, native.annualPremium, premium.total_annual_premium, premium.basic_annual_premium);
  const territory = firstValue(input.territory, native.territory, native.territoriality, medical.territory);
  const tabulator = firstValue(input.tabulator, native.tabulator, medical.tabulator);
  const hospitalNetwork = firstValue(native.hospitalNetwork, medical.hospital_network);
  const roomType = firstValue(native.roomType, medical.room_type);
  const insuredMembers = listValue(firstValue(native.insuredMembers, medical.insured_members));
  const maternity = listValue(firstValue(native.maternityCoverage, medical.maternity));
  const waitingPeriods = listValue(firstValue(native.waitingPeriods, medical.waiting_periods));
  const medicalBenefits = listValue(firstValue(native.medicalBenefits, native.additionalBenefits, medical.additional_benefits));
  const optionalCoverages = listValue(input.optionalCoverages || native.optionalCoverages);

  const missingInformation = [
    ...(productIntelligence.missing_information || []),
    ...(!hasValue(deductible) ? ["Falta deducible confirmado en la cotización GMM."] : []),
    ...(!hasValue(coinsurance) ? ["Falta coaseguro confirmado en la cotización GMM."] : []),
    ...(!hasValue(plan) ? ["Falta plan o nivel hospitalario confirmado en la cotización GMM."] : []),
    ...(!hasValue(sumAssured) ? ["Falta suma asegurada confirmada en la cotización GMM."] : []),
    ...(!hasValue(annualPremium) ? ["Falta prima anual confirmada en la cotización GMM."] : []),
  ];

  const hero = hasValue(plan)
    ? {
        label: "Plan médico",
        value: plan,
        secondaryLabel: hasValue(annualPremium) ? "Prima anual" : null,
        secondaryValue: hasValue(annualPremium) ? money(annualPremium, currency) : null,
        evidence: "GMM_QUOTE_EVIDENCE",
      }
    : hasValue(sumAssured)
      ? { label: "Suma asegurada", value: money(sumAssured, currency), evidence: "GMM_QUOTE_EVIDENCE" }
      : null;

  return deepFreeze({
    adapterId: ADAPTER_ID,
    productType: "gmm",
    hero,
    sections: [
      section("medical_plan", "Configuración del plan médico", [
        metric({ id: "hospital_level", label: "Plan / nivel hospitalario", value: plan }),
        metric({ id: "hospital_network", label: "Red hospitalaria", value: hospitalNetwork }),
        metric({ id: "territory", label: "Territorialidad", value: territory }),
        metric({ id: "tabulator", label: "Tabulador", value: tabulator }),
        metric({ id: "room_type", label: "Tipo de habitación", value: roomType }),
        metric({ id: "insured_members", label: "Asegurados incluidos", value: insuredMembers }),
      ]),
      section("cost_sharing", "Participación del asegurado", [
        metric({ id: "deductible", label: "Deducible", value: money(deductible, currency) }),
        metric({ id: "coinsurance", label: "Coaseguro", value: percent(coinsurance) }),
        metric({ id: "coinsurance_cap", label: "Tope de coaseguro", value: money(coinsuranceCap, currency) }),
      ]),
      section("medical_coverage", "Cobertura y beneficios", [
        metric({ id: "sum_assured", label: "Suma asegurada", value: money(sumAssured, currency) }),
        metric({ id: "optional_coverages", label: "Coberturas adicionales", value: optionalCoverages }),
        metric({ id: "maternity_coverage", label: "Maternidad", value: maternity }),
        metric({ id: "waiting_periods", label: "Periodos de espera", value: waitingPeriods }),
        metric({ id: "medical_benefits", label: "Beneficios médicos", value: medicalBenefits }),
      ]),
      section("premium", "Prima de la propuesta", [
        metric({ id: "annual_premium", label: "Prima anual", value: money(annualPremium, currency) }),
        metric({ id: "payment_mode", label: "Forma de pago", value: firstValue(input.paymentMode, native.paymentMode) }),
      ]),
    ].filter(Boolean),
    missingInformation: [...new Set(missingInformation.filter(Boolean))],
    humanDecisionRequired: true,
    recommendation: null,
    safety: {
      recalculationAllowed: false,
      forecastAllowed: false,
      compensationInfluenceAllowed: false,
      automaticActionAllowed: false,
      unknownIsZero: false,
    },
  });
}

function packetCurrency(productIntelligence) {
  const value = productIntelligence?.premium_structure?.total_annual_premium;
  return value && typeof value === "object" ? value.currency || null : null;
}

export const __gmmProductDecisionAdapterTest = Object.freeze({
  firstValue,
  missingFor,
  normalizedCurrency,
  token,
});
