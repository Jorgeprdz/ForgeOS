const CONTRACT_TYPE = "FIP_PACK_06_LEARNING_AND_BUSINESS_INTELLIGENCE";
const CONTRACT_VERSION = "FIP-300-320-001";

const OUTCOMES = Object.freeze([
  "ACCEPTED",
  "REJECTED",
  "EXECUTED",
  "CLIENT_RESPONDED",
  "APPOINTMENT_CREATED",
  "QUOTE_CREATED",
  "APPLICATION_CREATED",
  "POLICY_ISSUED",
  "NO_RESULT",
  "UNKNOWN",
]);

const SCENARIO_STATES = Object.freeze(["OBSERVED", "ESTIMATED", "POTENTIAL", "AT_RISK", "UNKNOWN"]);
const CONFIDENCE = Object.freeze(["INSUFFICIENT_EVIDENCE", "LOW", "MEDIUM", "HIGH"]);

const FORBIDDEN_KEYS = new Set([
  "guaranteedGrowth",
  "guaranteedRevenue",
  "officialRevenue",
  "commissionTruth",
  "payoutTruth",
  "humanWorth",
  "advisorRanking",
  "automaticExecution",
  "automaticMessage",
  "automaticTask",
  "automaticCalendar",
  "automaticPipelineAdvance",
]);

const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};

const text = (value, label, max = 500) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) throw new TypeError(`${label} inválido.`);
  return normalized;
};

const optionalText = (value, max = 500) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).trim();
  if (!normalized || normalized.length > max) throw new TypeError("Texto opcional inválido.");
  return normalized;
};

const nonNegative = value => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

function assertNoForbiddenKeys(value, path = "input") {
  if (Array.isArray(value)) return value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new TypeError(`Campo prohibido: ${path}.${key}`);
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function normalizeLearningEvent(event = {}) {
  assertNoForbiddenKeys(event, "learningEvent");
  const outcome = text(event.outcome || "UNKNOWN", "Resultado", 80).toUpperCase();
  if (!OUTCOMES.includes(outcome)) throw new TypeError("Resultado no permitido.");
  return freeze({
    recommendationReference: text(event.recommendationReference, "Referencia", 240),
    advisorReference: text(event.advisorReference, "Asesor", 240),
    personReference: optionalText(event.personReference, 240),
    outcome,
    observedAt: new Date(event.observedAt || Date.now()).toISOString(),
    evidenceReferences: freeze(Array.isArray(event.evidenceReferences) ? event.evidenceReferences.map(item => text(item, "Evidencia", 240)) : []),
    notes: optionalText(event.notes, 700),
    createsBusinessTruth: false,
  });
}

function normalizeMetric(metric = {}) {
  const confidence = text(metric.confidence || "INSUFFICIENT_EVIDENCE", "Confianza", 80).toUpperCase();
  if (!CONFIDENCE.includes(confidence)) throw new TypeError("Confianza inválida.");
  return freeze({
    key: text(metric.key, "Métrica", 120),
    observedValue: nonNegative(metric.observedValue),
    denominator: nonNegative(metric.denominator),
    sampleSize: Math.trunc(nonNegative(metric.sampleSize)),
    confidence,
    limitation: optionalText(metric.limitation, 500),
  });
}

export function createLearningLoopSnapshot(input = {}) {
  assertNoForbiddenKeys(input);
  const events = Array.isArray(input.events) ? input.events.map(normalizeLearningEvent) : [];
  const outcomeCounts = Object.fromEntries(OUTCOMES.map(outcome => [outcome, events.filter(event => event.outcome === outcome).length]));
  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    advisorReference: text(input.advisorReference, "Asesor", 240),
    period: text(input.period, "Periodo", 80),
    events,
    outcomeCounts: freeze(outcomeCounts),
    metrics: freeze(Array.isArray(input.metrics) ? input.metrics.map(normalizeMetric) : []),
    recommendationsMayImprove: true,
    causalProofCreated: false,
    automaticModelTraining: false,
    humanReviewRequired: true,
  });
}

export function createStrategyScenario(input = {}) {
  assertNoForbiddenKeys(input);
  const state = text(input.state || "UNKNOWN", "Estado", 80).toUpperCase();
  if (!SCENARIO_STATES.includes(state)) throw new TypeError("Estado de escenario inválido.");
  const confidence = text(input.confidence || "INSUFFICIENT_EVIDENCE", "Confianza", 80).toUpperCase();
  if (!CONFIDENCE.includes(confidence)) throw new TypeError("Confianza inválida.");
  return freeze({
    reference: text(input.reference, "Referencia", 240),
    title: text(input.title, "Título", 240),
    state,
    assumptions: freeze(Array.isArray(input.assumptions) ? input.assumptions.map(item => text(item, "Supuesto", 500)) : []),
    baseline: freeze(Array.isArray(input.baseline) ? input.baseline.map(normalizeMetric) : []),
    projected: freeze(Array.isArray(input.projected) ? input.projected.map(normalizeMetric) : []),
    expectedImpact: optionalText(input.expectedImpact, 700),
    risks: freeze(Array.isArray(input.risks) ? input.risks.map(item => text(item, "Riesgo", 500)) : []),
    confidence,
    limitations: freeze(Array.isArray(input.limitations) ? input.limitations.map(item => text(item, "Limitación", 500)) : []),
    guaranteed: false,
    executable: false,
    humanApprovalRequired: true,
  });
}

export function createBusinessIntelligenceSnapshot(input = {}) {
  assertNoForbiddenKeys(input);
  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    advisorReference: text(input.advisorReference, "Asesor", 240),
    period: text(input.period, "Periodo", 80),
    funnel: freeze(Array.isArray(input.funnel) ? input.funnel.map(normalizeMetric) : []),
    markets: freeze(Array.isArray(input.markets) ? input.markets.map(normalizeMetric) : []),
    channels: freeze(Array.isArray(input.channels) ? input.channels.map(normalizeMetric) : []),
    products: freeze(Array.isArray(input.products) ? input.products.map(normalizeMetric) : []),
    forecastAccuracy: freeze(Array.isArray(input.forecastAccuracy) ? input.forecastAccuracy.map(normalizeMetric) : []),
    recommendationUtility: freeze(Array.isArray(input.recommendationUtility) ? input.recommendationUtility.map(normalizeMetric) : []),
    sourceFreshness: freeze(input.sourceFreshness || {}),
    unknownRemainsUnknown: true,
    uiStateAsTruth: false,
    officialRevenueTruth: false,
    compensationTruth: false,
    payoutTruth: false,
    humanApprovalRequired: true,
  });
}

export { CONTRACT_TYPE, CONTRACT_VERSION, OUTCOMES, SCENARIO_STATES, CONFIDENCE, assertNoForbiddenKeys };
