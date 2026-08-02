const CONTRACT_TYPE = "FORGE_ADVISOR_INTELLIGENCE_AND_MICK";
const CONTRACT_VERSION = "FIP-PACK-02-001";

const CONFIDENCE = new Set(["LOW", "MEDIUM", "HIGH", "INSUFFICIENT_EVIDENCE"]);
const PATTERN_STATES = new Set(["OBSERVED", "HYPOTHESIS", "UNKNOWN", "INSUFFICIENT_EVIDENCE"]);
const FORBIDDEN_KEYS = new Set([
  "personalityTruth", "humanWorth", "advisorRanking", "disciplineScore", "motivationScore",
  "coachabilityScore", "punishment", "hrDecision", "terminationDecision", "promotionDecision",
  "compensationDecision", "automaticMessage", "automaticTask", "automaticCalendar", "automaticPipelineAdvance"
]);

class FipPack02ContractError extends TypeError {
  constructor(code, message, details = null) {
    super(message);
    this.name = "FipPack02ContractError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details = null) => { throw new FipPack02ContractError(code, message, details); };
const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};
const text = (value, code, label, max = 300) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) fail(code, `${label} no es válido.`);
  return normalized;
};
const optionalText = (value, max = 500) => value === null || value === undefined || value === "" ? null : text(String(value), "FIP02_TEXT_INVALID", "El texto", max);
const numberOrNull = value => value === null || value === undefined || value === "" ? null : Number(value);

function assertNoForbiddenKeys(value, path = "advisorIntelligence") {
  if (Array.isArray(value)) return value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`));
  if (!isObject(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) fail("FIP02_FORBIDDEN_FIELD", "El contrato no admite vigilancia, ranking, castigo ni acción automática.", { path: `${path}.${key}` });
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function normalizeEvidence(input = {}) {
  if (!isObject(input)) fail("FIP02_EVIDENCE_INVALID", "La evidencia debe ser un objeto.");
  const sampleSize = Math.max(0, Number.isInteger(Number(input.sampleSize)) ? Number(input.sampleSize) : 0);
  const confidence = text(input.confidence || (sampleSize < 5 ? "INSUFFICIENT_EVIDENCE" : "LOW"), "FIP02_CONFIDENCE_INVALID", "La confianza", 40).toUpperCase();
  if (!CONFIDENCE.has(confidence)) fail("FIP02_CONFIDENCE_INVALID", "La confianza no está permitida.");
  return freeze({
    sampleSize,
    confidence,
    timeWindow: optionalText(input.timeWindow, 120),
    evidenceRefs: Array.isArray(input.evidenceRefs) ? input.evidenceRefs.map(ref => text(ref, "FIP02_EVIDENCE_REF_INVALID", "La referencia", 240)) : [],
    limitations: Array.isArray(input.limitations) ? input.limitations.map(item => text(item, "FIP02_LIMITATION_INVALID", "La limitación", 300)) : [],
  });
}

function normalizeSegment(input = {}, kind) {
  if (!isObject(input)) fail("FIP02_SEGMENT_INVALID", "El segmento debe ser un objeto.");
  const evidence = normalizeEvidence(input.evidence);
  return freeze({
    kind,
    key: text(input.key, "FIP02_SEGMENT_KEY_REQUIRED", "La clave", 160),
    label: text(input.label, "FIP02_SEGMENT_LABEL_REQUIRED", "La etiqueta", 240),
    observedCount: Math.max(0, Number(input.observedCount) || 0),
    conversionRate: numberOrNull(input.conversionRate),
    cycleDays: numberOrNull(input.cycleDays),
    premiumAverage: numberOrNull(input.premiumAverage),
    evidence,
    promotedToIdeal: evidence.sampleSize >= 10 && ["MEDIUM", "HIGH"].includes(evidence.confidence),
  });
}

function normalizePattern(input = {}) {
  if (!isObject(input)) fail("FIP02_PATTERN_INVALID", "El patrón debe ser un objeto.");
  const state = text(input.state || "HYPOTHESIS", "FIP02_PATTERN_STATE_INVALID", "El estado", 60).toUpperCase();
  if (!PATTERN_STATES.has(state)) fail("FIP02_PATTERN_STATE_INVALID", "El estado del patrón no está permitido.");
  const evidence = normalizeEvidence(input.evidence);
  return freeze({
    id: text(input.id, "FIP02_PATTERN_ID_REQUIRED", "El patrón", 180),
    state,
    observation: text(input.observation, "FIP02_PATTERN_OBSERVATION_REQUIRED", "La observación", 700),
    businessImpact: optionalText(input.businessImpact, 500),
    recommendedExperiment: optionalText(input.recommendedExperiment, 500),
    evidence,
    requiresHumanInterpretation: true,
  });
}

export function createAdvisorIntelligenceProfile(input = {}) {
  if (!isObject(input)) fail("FIP02_PROFILE_INVALID", "El perfil debe ser un objeto.");
  assertNoForbiddenKeys(input);
  const markets = Array.isArray(input.markets) ? input.markets.map(item => normalizeSegment(item, "MARKET")) : [];
  const clients = Array.isArray(input.clientSegments) ? input.clientSegments.map(item => normalizeSegment(item, "CLIENT_SEGMENT")) : [];
  const channels = Array.isArray(input.channels) ? input.channels.map(item => normalizeSegment(item, "CHANNEL")) : [];
  const products = Array.isArray(input.products) ? input.products.map(item => normalizeSegment(item, "PRODUCT")) : [];
  const salesPatterns = Array.isArray(input.salesPatterns) ? input.salesPatterns.map(normalizePattern) : [];
  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    advisorReference: text(input.advisorReference, "FIP02_ADVISOR_REQUIRED", "El asesor", 240),
    asOfDate: text(input.asOfDate, "FIP02_AS_OF_REQUIRED", "La fecha", 20),
    clientSegments: clients,
    markets,
    channels,
    products,
    salesPatterns,
    idealClientCandidates: clients.filter(item => item.promotedToIdeal),
    idealMarketCandidates: markets.filter(item => item.promotedToIdeal),
    strongestChannelCandidates: channels.filter(item => item.promotedToIdeal),
    strongestProductCandidates: products.filter(item => item.promotedToIdeal),
    boundaries: freeze({
      personalityTruth: false,
      humanWorth: false,
      advisorRanking: false,
      surveillance: false,
      punishment: false,
      hrDecision: false,
      automaticAction: false,
      humanInterpretationRequired: true,
    }),
  });
}

export function createMickExecutionReview(input = {}) {
  if (!isObject(input)) fail("FIP02_MICK_INVALID", "La revisión Mick debe ser un objeto.");
  assertNoForbiddenKeys(input);
  const patterns = Array.isArray(input.patterns) ? input.patterns.map(normalizePattern) : [];
  return freeze({
    contractType: "FORGE_MICK_EXECUTION_REVIEW",
    contractVersion: CONTRACT_VERSION,
    advisorReference: text(input.advisorReference, "FIP02_ADVISOR_REQUIRED", "El asesor", 240),
    period: text(input.period, "FIP02_PERIOD_REQUIRED", "El periodo", 80),
    activityObserved: Math.max(0, Number(input.activityObserved) || 0),
    outcomeObserved: Math.max(0, Number(input.outcomeObserved) || 0),
    patterns,
    frictionHypotheses: patterns.filter(item => item.state === "HYPOTHESIS"),
    coachingContextOnly: true,
    humanApprovalRequired: true,
    automaticEnforcementAllowed: false,
  });
}

export { CONTRACT_TYPE, CONTRACT_VERSION, FipPack02ContractError, assertNoForbiddenKeys };
