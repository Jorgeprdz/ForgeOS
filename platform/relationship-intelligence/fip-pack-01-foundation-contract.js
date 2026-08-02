const CONTRACT_TYPE = "FORGE_RELATIONSHIP_INTELLIGENCE_FOUNDATION";
const CONTRACT_VERSION = "FIP-PACK-01-001";

const HEALTH_STATES = Object.freeze([
  "HEALTHY", "ACTIVE", "WARM", "COOLING", "COLD", "DORMANT", "AT_RISK",
  "BLOCKED", "WAITING_ON_CLIENT", "WAITING_ON_ADVISOR", "UNKNOWN",
]);
const SIGNAL_STATES = Object.freeze(["OBSERVED", "INFERRED", "UNKNOWN", "INSUFFICIENT_EVIDENCE"]);
const COMMITMENT_STATES = Object.freeze(["OPEN", "DUE", "OVERDUE", "FULFILLED", "CANCELLED", "UNKNOWN"]);
const RELATIONSHIP_TYPES = Object.freeze([
  "PARTNER", "CHILD", "PARENT", "SIBLING", "BENEFICIARY", "DECISION_MAKER",
  "INFLUENCER", "REFERRER", "REFERRED", "BUSINESS_PARTNER", "PROFESSIONAL", "OTHER",
]);

const FORBIDDEN_KEYS = new Set([
  "humanWorth", "personalityTruth", "financialCapacityTruth", "insurabilityTruth",
  "automaticEligibility", "automaticProductDecision", "automaticMessage", "automaticTask",
  "automaticCalendar", "automaticPipelineAdvance", "rawProviderPayload", "medicalInformation",
]);

export class FipPack01ContractError extends TypeError {
  constructor(code, message, details = null) {
    super(message);
    this.name = "FipPack01ContractError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details = null) => { throw new FipPack01ContractError(code, message, details); };
const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};
const text = (value, code, label, maximum = 500) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > maximum) fail(code, `${label} no es válido.`);
  return normalized;
};
const optionalText = (value, maximum = 700) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).trim();
  if (!normalized || normalized.length > maximum) fail("FIP01_TEXT_INVALID", "El texto no es válido.");
  return normalized;
};
const instant = value => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) fail("FIP01_INSTANT_INVALID", "El instante no es válido.");
  return parsed.toISOString();
};

export function assertNoForbiddenFoundationKeys(value, path = "foundation") {
  if (Array.isArray(value)) return value.forEach((item, index) => assertNoForbiddenFoundationKeys(item, `${path}[${index}]`));
  if (!isObject(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) fail("FIP01_FORBIDDEN_FIELD", "El fundamento contiene un uso prohibido.", { path: `${path}.${key}` });
    assertNoForbiddenFoundationKeys(nested, `${path}.${key}`);
  }
}

const evidence = input => {
  if (!isObject(input)) fail("FIP01_EVIDENCE_INVALID", "La evidencia debe ser un objeto.");
  return freeze({
    reference: text(input.reference, "FIP01_EVIDENCE_REFERENCE_REQUIRED", "La referencia", 240),
    authority: text(input.authority, "FIP01_EVIDENCE_AUTHORITY_REQUIRED", "La autoridad", 180),
    observedAt: instant(input.observedAt),
    summary: optionalText(input.summary),
    freshness: ["CURRENT", "STALE", "UNKNOWN"].includes(input.freshness) ? input.freshness : "UNKNOWN",
  });
};

const normalizeCommitment = (input, personReference, now) => {
  if (!isObject(input)) fail("FIP01_COMMITMENT_INVALID", "El compromiso debe ser un objeto.");
  const dueAt = instant(input.dueAt);
  const fulfilledAt = instant(input.fulfilledAt);
  let state = COMMITMENT_STATES.includes(input.state) ? input.state : "UNKNOWN";
  if (state === "OPEN" && dueAt) state = new Date(dueAt) < new Date(now) ? "OVERDUE" : "DUE";
  if (fulfilledAt) state = "FULFILLED";
  return freeze({
    reference: text(input.reference, "FIP01_COMMITMENT_REFERENCE_REQUIRED", "El compromiso", 240),
    personReference,
    owner: ["ADVISOR", "CLIENT", "THIRD_PARTY", "UNKNOWN"].includes(input.owner) ? input.owner : "UNKNOWN",
    description: text(input.description, "FIP01_COMMITMENT_DESCRIPTION_REQUIRED", "La descripción", 500),
    dueAt,
    fulfilledAt,
    state,
    evidence: Array.isArray(input.evidence) ? input.evidence.map(evidence) : [],
  });
};

const normalizeSignal = (input, type) => {
  if (!isObject(input)) return freeze({ type, state: "UNKNOWN", label: null, confidence: 0, evidence: [], limitations: ["MISSING_SIGNAL"] });
  const state = SIGNAL_STATES.includes(input.state) ? input.state : "UNKNOWN";
  const confidence = Math.max(0, Math.min(1, Number(input.confidence) || 0));
  return freeze({
    type,
    state,
    label: optionalText(input.label, 240),
    confidence,
    evidence: Array.isArray(input.evidence) ? input.evidence.map(evidence) : [],
    limitations: Array.isArray(input.limitations) ? input.limitations.map(item => optionalText(item, 240)).filter(Boolean) : [],
  });
};

const normalizeRelation = (input, personReference) => {
  if (!isObject(input)) fail("FIP01_RELATION_INVALID", "La relación debe ser un objeto.");
  const type = String(input.type || "OTHER").toUpperCase();
  if (!RELATIONSHIP_TYPES.includes(type)) fail("FIP01_RELATION_TYPE_INVALID", "El tipo de relación no está permitido.");
  const relatedPersonReference = text(input.relatedPersonReference, "FIP01_RELATED_PERSON_REQUIRED", "La persona relacionada", 240);
  if (relatedPersonReference === personReference) fail("FIP01_SELF_RELATION_FORBIDDEN", "Una persona no puede relacionarse consigo misma.");
  return freeze({
    reference: text(input.reference, "FIP01_RELATION_REFERENCE_REQUIRED", "La relación", 240),
    personReference,
    relatedPersonReference,
    type,
    label: optionalText(input.label, 240),
    state: SIGNAL_STATES.includes(input.state) ? input.state : "UNKNOWN",
    evidence: Array.isArray(input.evidence) ? input.evidence.map(evidence) : [],
  });
};

export function createFipPack01Foundation(input = {}) {
  if (!isObject(input)) fail("FIP01_INPUT_INVALID", "La entrada debe ser un objeto.");
  assertNoForbiddenFoundationKeys(input);
  const now = instant(input.generatedAt || new Date().toISOString());
  const advisorReference = text(input.advisorReference, "FIP01_ADVISOR_REQUIRED", "El asesor", 240);
  const personReference = text(input.personReference, "FIP01_PERSON_REQUIRED", "CommercialPerson", 240);
  const commitments = Array.isArray(input.commitments) ? input.commitments.map(item => normalizeCommitment(item, personReference, now)) : [];
  const relations = Array.isArray(input.relations) ? input.relations.map(item => normalizeRelation(item, personReference)) : [];
  const healthState = HEALTH_STATES.includes(input.healthState) ? input.healthState : "UNKNOWN";
  const scoreDimensions = isObject(input.scoreDimensions) ? input.scoreDimensions : {};
  const dimensions = Object.fromEntries(["RECENCY", "RESPONSIVENESS", "COMMITMENT", "PROGRESSION", "RELATIONSHIP_DEPTH", "DATA_CONFIDENCE"].map(key => {
    const value = scoreDimensions[key];
    return [key, normalizeSignal(value, key)];
  }));
  const weighted = Object.values(dimensions).filter(item => item.state !== "UNKNOWN" && item.state !== "INSUFFICIENT_EVIDENCE");
  const score = weighted.length ? Math.round(weighted.reduce((total, item) => total + item.confidence * 100, 0) / weighted.length) : null;
  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    advisorReference,
    personReference,
    generatedAt: now,
    authorities: freeze({
      person: "CARTERA_010B_COMMERCIAL_PERSON_AUTHORITY",
      relationship: "CRS_01_ADVISOR_COMMERCIAL_RELATIONSHIP",
      timeline: "CRS_08_UNIFIED_PERSON_TIMELINE",
      workspace: "CRS_09_PRODUCTIVE_PERSON_WORKSPACE",
      existingIntelligence: "CRS_10_EXISTING_RELATIONSHIP_INTELLIGENCE_COMPOSITION",
      acceptance: "CRS_11_END_TO_END_RELATIONSHIP_ACCEPTANCE",
    }),
    envelope: freeze({
      currentCommercialState: optionalText(input.currentCommercialState, 120),
      lastMeaningfulInteractionAt: instant(input.lastMeaningfulInteractionAt),
      sourceAvailability: isObject(input.sourceAvailability) ? freeze({ ...input.sourceAvailability }) : freeze({}),
      evidenceDigest: optionalText(input.evidenceDigest, 240),
    }),
    commitments,
    commitmentSummary: freeze({
      total: commitments.length,
      overdue: commitments.filter(item => item.state === "OVERDUE").length,
      due: commitments.filter(item => item.state === "DUE").length,
      fulfilled: commitments.filter(item => item.state === "FULFILLED").length,
      unknown: commitments.filter(item => item.state === "UNKNOWN").length,
    }),
    health: freeze({
      state: healthState,
      reason: optionalText(input.healthReason),
      confidence: Math.max(0, Math.min(1, Number(input.healthConfidence) || 0)),
      evidence: Array.isArray(input.healthEvidence) ? input.healthEvidence.map(evidence) : [],
    }),
    objections: Array.isArray(input.objections) ? input.objections.map(item => normalizeSignal(item, "OBJECTION")) : [],
    lossRisks: Array.isArray(input.lossRisks) ? input.lossRisks.map(item => normalizeSignal(item, "LOSS_RISK")) : [],
    score: freeze({ value: score, dimensions: freeze(dimensions), explainable: true, humanWorth: false }),
    relationshipMap: freeze({ relations, count: relations.length }),
    boundaries: freeze({
      readOnly: true,
      unknownAsZero: false,
      opaqueScore: false,
      automaticMessage: false,
      automaticTask: false,
      automaticCalendar: false,
      automaticPipelineAdvance: false,
      automaticOpportunity: false,
      automaticApplication: false,
      automaticPolicy: false,
      humanApprovalRequired: true,
    }),
  });
}

export { CONTRACT_TYPE, CONTRACT_VERSION, HEALTH_STATES, SIGNAL_STATES, COMMITMENT_STATES, RELATIONSHIP_TYPES };
