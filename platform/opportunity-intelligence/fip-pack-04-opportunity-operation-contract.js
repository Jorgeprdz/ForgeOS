const CONTRACT_TYPE = "FIP_PACK_04_OPPORTUNITY_AND_OPERATION";
const CONTRACT_VERSION = "FIP-150-210-001";

const OPPORTUNITY_STATES = Object.freeze([
  "OBSERVED_NEED",
  "PROBABLE_NEED",
  "COMMERCIAL_HYPOTHESIS",
  "INSUFFICIENT_EVIDENCE",
]);
const FORECAST_STATES = Object.freeze(["OBSERVED", "ESTIMATED", "POTENTIAL", "AT_RISK", "UNKNOWN"]);
const CONFIDENCE_LEVELS = Object.freeze(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]);

const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};
const text = (value, label, maximum = 500) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > maximum) throw new TypeError(`${label} no es válido.`);
  return normalized;
};
const optionalText = (value, maximum = 500) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).trim();
  if (!normalized || normalized.length > maximum) throw new TypeError("El texto opcional no es válido.");
  return normalized;
};
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, finite(value)));

function normalizeOpportunity(input = {}) {
  const state = text(input.state || "INSUFFICIENT_EVIDENCE", "El estado", 80).toUpperCase();
  if (!OPPORTUNITY_STATES.includes(state)) throw new TypeError("El estado de oportunidad no está permitido.");
  return freeze({
    reference: text(input.reference, "La referencia", 240),
    type: text(input.type, "El tipo", 120),
    state,
    summary: optionalText(input.summary, 700),
    evidenceRefs: freeze(Array.isArray(input.evidenceRefs) ? [...new Set(input.evidenceRefs.map(String))] : []),
    confidence: CONFIDENCE_LEVELS.includes(String(input.confidence || "UNKNOWN").toUpperCase())
      ? String(input.confidence || "UNKNOWN").toUpperCase()
      : "UNKNOWN",
    requiresDiscovery: input.requiresDiscovery !== false,
    productRecommendationAllowed: false,
    automaticOpportunityCreation: false,
  });
}

function normalizeReview(input = {}) {
  return freeze({
    reference: text(input.reference, "La referencia", 240),
    trigger: text(input.trigger, "El detonador", 160),
    dueDate: optionalText(input.dueDate, 40),
    evidenceRefs: freeze(Array.isArray(input.evidenceRefs) ? [...new Set(input.evidenceRefs.map(String))] : []),
    status: text(input.status || "PROPOSED", "El estado", 80).toUpperCase(),
    automaticScheduling: false,
  });
}

function normalizeReferral(input = {}) {
  return freeze({
    reference: text(input.reference, "La referencia", 240),
    moment: text(input.moment, "El momento", 160),
    reason: text(input.reason, "La razón", 500),
    evidenceRefs: freeze(Array.isArray(input.evidenceRefs) ? [...new Set(input.evidenceRefs.map(String))] : []),
    conversationOnly: true,
    automaticContact: false,
  });
}

function normalizePriority(input = {}) {
  const components = freeze({
    urgency: clamp(input.components?.urgency, 0, 100),
    impact: clamp(input.components?.impact, 0, 100),
    risk: clamp(input.components?.risk, 0, 100),
    commitment: clamp(input.components?.commitment, 0, 100),
    advisorFit: clamp(input.components?.advisorFit, 0, 100),
    evidenceConfidence: clamp(input.components?.evidenceConfidence, 0, 100),
    effortPenalty: clamp(input.components?.effortPenalty, 0, 100),
  });
  const score = Math.round(
    components.urgency * 0.2 +
    components.impact * 0.2 +
    components.risk * 0.15 +
    components.commitment * 0.15 +
    components.advisorFit * 0.1 +
    components.evidenceConfidence * 0.15 -
    components.effortPenalty * 0.05
  );
  return freeze({
    reference: text(input.reference, "La referencia", 240),
    label: text(input.label, "La etiqueta", 240),
    score: clamp(score, 0, 100),
    components,
    whyNow: optionalText(input.whyNow, 700),
    evidenceRefs: freeze(Array.isArray(input.evidenceRefs) ? [...new Set(input.evidenceRefs.map(String))] : []),
    advisoryOnly: true,
  });
}

function normalizeForecast(input = {}) {
  const state = text(input.state || "UNKNOWN", "El estado", 80).toUpperCase();
  if (!FORECAST_STATES.includes(state)) throw new TypeError("El estado de forecast no está permitido.");
  return freeze({
    outcome: text(input.outcome, "El resultado", 180),
    state,
    probability: state === "UNKNOWN" ? null : clamp(input.probability, 0, 1),
    timingRange: optionalText(input.timingRange, 120),
    confidence: CONFIDENCE_LEVELS.includes(String(input.confidence || "UNKNOWN").toUpperCase())
      ? String(input.confidence || "UNKNOWN").toUpperCase()
      : "UNKNOWN",
    evidenceRefs: freeze(Array.isArray(input.evidenceRefs) ? [...new Set(input.evidenceRefs.map(String))] : []),
    limitations: freeze(Array.isArray(input.limitations) ? input.limitations.map(String) : []),
    guaranteed: false,
    revenueTruth: false,
    compensationTruth: false,
  });
}

function normalizeScenario(input = {}) {
  return freeze({
    id: text(input.id, "El escenario", 120),
    action: text(input.action, "La acción", 240),
    assumptions: freeze(Array.isArray(input.assumptions) ? input.assumptions.map(String) : []),
    estimatedImpact: optionalText(input.estimatedImpact, 300),
    risks: freeze(Array.isArray(input.risks) ? input.risks.map(String) : []),
    confidence: CONFIDENCE_LEVELS.includes(String(input.confidence || "UNKNOWN").toUpperCase())
      ? String(input.confidence || "UNKNOWN").toUpperCase()
      : "UNKNOWN",
    executionAllowed: false,
  });
}

export function createOpportunityOperationEnvelope(input = {}) {
  const attentionBudget = freeze({
    availableMinutes: Math.max(0, Math.round(finite(input.attentionBudget?.availableMinutes, 0))),
    maxActions: Math.max(0, Math.round(finite(input.attentionBudget?.maxActions, 0))),
    declaredEnergy: optionalText(input.attentionBudget?.declaredEnergy, 80),
    constraints: freeze(Array.isArray(input.attentionBudget?.constraints) ? input.attentionBudget.constraints.map(String) : []),
  });
  const priorities = (Array.isArray(input.priorities) ? input.priorities : [])
    .map(normalizePriority)
    .sort((a, b) => b.score - a.score)
    .slice(0, attentionBudget.maxActions || 5);
  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    advisorReference: text(input.advisorReference, "El asesor", 240),
    asOf: text(input.asOf, "La fecha", 40),
    opportunities: freeze((Array.isArray(input.opportunities) ? input.opportunities : []).map(normalizeOpportunity)),
    annualReviews: freeze((Array.isArray(input.annualReviews) ? input.annualReviews : []).map(normalizeReview)),
    referralMoments: freeze((Array.isArray(input.referralMoments) ? input.referralMoments : []).map(normalizeReferral)),
    attentionBudget,
    priorities: freeze(priorities),
    forecast: freeze((Array.isArray(input.forecast) ? input.forecast : []).map(normalizeForecast)),
    scenarios: freeze((Array.isArray(input.scenarios) ? input.scenarios : []).map(normalizeScenario)),
    boundaries: freeze({
      observedNeedIsNotProductRecommendation: true,
      forecastIsNotGuarantee: true,
      scenarioIsNotExecution: true,
      automaticOpportunityCreation: false,
      automaticMessage: false,
      automaticTask: false,
      automaticCalendar: false,
      automaticPipelineAdvance: false,
      automaticApplication: false,
      automaticPolicy: false,
      humanApprovalRequired: true,
    }),
  });
}

export { CONTRACT_TYPE, CONTRACT_VERSION, OPPORTUNITY_STATES, FORECAST_STATES, CONFIDENCE_LEVELS };
