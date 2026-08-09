const CONTRACT_TYPE = "FORGE_CROSS_DOMAIN_DECISION_PROJECTION";
const CONTRACT_VERSION = "FCDP-004-001";

const DECISION_FAMILIES = Object.freeze([
  "COMMERCIAL_ATTENTION",
  "FOLLOW_UP",
  "RELATIONSHIP",
  "COACHING",
  "PRODUCTIVITY",
  "PLANNING",
  "FORECAST",
  "ECONOMIC",
  "SERVICING",
  "RISK",
]);

const LIFECYCLE_STATES = Object.freeze([
  "DERIVED",
  "ACTIVE",
  "STALE",
  "SUPERSEDED",
  "RESOLVED",
  "EXPIRED",
]);

const COMPOSITION_RELATIONSHIPS = Object.freeze([
  "AGREE",
  "COMPLEMENT",
  "CONFLICT",
  "STALE",
  "INSUFFICIENT_EVIDENCE",
  "UNKNOWN",
]);

const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};

const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const fail = (code, message, details = null) => {
  const error = new TypeError(message);
  error.name = "ForgeDecisionProjectionContractError";
  error.code = code;
  error.details = details;
  throw error;
};
const text = (value, code, max = 1000) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) fail(code, "Texto inválido.");
  return normalized;
};
const optionalText = (value, max = 1000) => value === null || value === undefined || value === ""
  ? null
  : text(String(value), "FCDP_TEXT_INVALID", max);
const instant = value => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) fail("FCDP_INSTANT_INVALID", "Instante inválido.");
  return date.toISOString();
};
const strings = (value, code, max = 300) => Array.isArray(value)
  ? [...new Set(value.map(item => text(String(item), code, max)))]
  : [];

function normalizeEvidence(input = {}) {
  if (!isObject(input)) fail("FCDP_EVIDENCE_INVALID", "La evidencia debe ser un objeto.");
  return freeze({
    reference: text(input.reference, "FCDP_EVIDENCE_REFERENCE_REQUIRED", 300),
    authority: text(input.authority, "FCDP_EVIDENCE_AUTHORITY_REQUIRED", 240),
    observedAt: instant(input.observedAt),
    freshness: optionalText(input.freshness, 80),
    summary: optionalText(input.summary, 700),
  });
}

function normalizeOwnedValue(input, field) {
  if (input === null || input === undefined) return null;
  if (!isObject(input)) fail(`FCDP_${field}_INVALID`, `${field} debe conservar autoridad explícita.`);
  const rawValue = input.value;
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    fail(`FCDP_${field}_VALUE_REQUIRED`, `${field} requiere un valor fuente.`);
  }
  return freeze({
    value: typeof rawValue === "number" ? rawValue : String(rawValue),
    authority: text(input.authority, `FCDP_${field}_AUTHORITY_REQUIRED`, 240),
    sourceReference: optionalText(input.sourceReference, 300),
  });
}

function normalizeAction(input) {
  if (input === null || input === undefined) return null;
  if (!isObject(input)) fail("FCDP_ACTION_INVALID", "La acción debe ser un objeto.");
  if (input.automaticExecutionAllowed === true) {
    fail("FCDP_AUTOMATIC_ACTION_FORBIDDEN", "La proyección no puede autorizar ejecución automática.");
  }
  return freeze({
    type: text(input.type, "FCDP_ACTION_TYPE_REQUIRED", 120),
    label: text(input.label, "FCDP_ACTION_LABEL_REQUIRED", 500),
    owner: text(input.owner, "FCDP_ACTION_OWNER_REQUIRED", 180),
    target: optionalText(input.target, 500),
    deepLink: optionalText(input.deepLink, 700),
    humanApprovalRequired: input.humanApprovalRequired !== false,
    automaticExecutionAllowed: false,
  });
}

function normalizeImpact(input) {
  if (input === null || input === undefined) return null;
  if (!isObject(input)) fail("FCDP_IMPACT_INVALID", "El impacto debe ser un objeto.");
  const value = input.value === undefined ? null : input.value;
  return freeze({
    value: value === null ? null : (typeof value === "number" ? value : String(value)),
    currency: optionalText(input.currency, 20),
    semantics: text(input.semantics, "FCDP_IMPACT_SEMANTICS_REQUIRED", 120),
    authority: text(input.authority, "FCDP_IMPACT_AUTHORITY_REQUIRED", 240),
    sourceReference: optionalText(input.sourceReference, 300),
  });
}

function normalizeLifecycle(input = {}) {
  if (!isObject(input)) fail("FCDP_LIFECYCLE_INVALID", "Lifecycle debe ser un objeto.");
  const state = text(input.state || "DERIVED", "FCDP_LIFECYCLE_STATE_REQUIRED", 80).toUpperCase();
  if (!LIFECYCLE_STATES.includes(state)) fail("FCDP_LIFECYCLE_STATE_INVALID", "Lifecycle no permitido.");
  return freeze({
    state,
    effectiveAt: instant(input.effectiveAt),
    evaluatedAt: instant(input.evaluatedAt),
    expiresAt: instant(input.expiresAt),
    sourceUpdatedAt: instant(input.sourceUpdatedAt),
  });
}

function normalizeFeedback(input = {}) {
  if (!isObject(input)) fail("FCDP_FEEDBACK_INVALID", "Feedback debe ser un objeto.");
  return freeze({
    owner: optionalText(input.owner, 180),
    expectedEvents: strings(input.expectedEvents, "FCDP_FEEDBACK_EVENT_INVALID", 180),
  });
}

function normalizeComposition(input = {}) {
  if (!isObject(input)) fail("FCDP_COMPOSITION_INVALID", "Composition debe ser un objeto.");
  return freeze({
    key: optionalText(input.key, 500),
    actionKey: optionalText(input.actionKey, 500),
    mergeCompatible: input.mergeCompatible === true,
  });
}

export function createCrossDomainDecisionProjection(input = {}) {
  if (!isObject(input)) fail("FCDP_INPUT_INVALID", "La proyección debe ser un objeto.");
  const family = text(input.family, "FCDP_FAMILY_REQUIRED", 80).toUpperCase();
  if (!DECISION_FAMILIES.includes(family)) fail("FCDP_FAMILY_INVALID", "Familia de decisión no permitida.");
  const evidence = Array.isArray(input.evidence) ? input.evidence.map(normalizeEvidence) : [];
  const sourceAuthorities = strings(input.provenance?.sourceAuthorities, "FCDP_SOURCE_AUTHORITY_INVALID", 240);
  if (!sourceAuthorities.length) fail("FCDP_PROVENANCE_REQUIRED", "La proyección requiere sourceAuthorities.");

  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    decisionReference: text(input.decisionReference, "FCDP_DECISION_REFERENCE_REQUIRED", 300),
    advisorReference: text(input.advisorReference, "FCDP_ADVISOR_REFERENCE_REQUIRED", 300),
    subject: freeze({
      type: text(input.subject?.type, "FCDP_SUBJECT_TYPE_REQUIRED", 100),
      reference: text(input.subject?.reference, "FCDP_SUBJECT_REFERENCE_REQUIRED", 300),
    }),
    domain: text(input.domain, "FCDP_DOMAIN_REQUIRED", 120),
    family,
    decisionType: text(input.decisionType, "FCDP_DECISION_TYPE_REQUIRED", 160),
    truthState: text(input.truthState, "FCDP_TRUTH_STATE_REQUIRED", 160),
    title: text(input.title, "FCDP_TITLE_REQUIRED", 300),
    reason: text(input.reason, "FCDP_REASON_REQUIRED", 1200),
    whyNow: optionalText(input.whyNow, 1200),
    priority: normalizeOwnedValue(input.priority, "PRIORITY"),
    urgency: normalizeOwnedValue(input.urgency, "URGENCY"),
    confidence: normalizeOwnedValue(input.confidence, "CONFIDENCE"),
    evidence: freeze(evidence),
    limitations: freeze(strings(input.limitations, "FCDP_LIMITATION_INVALID", 700)),
    recommendedAction: normalizeAction(input.recommendedAction),
    impact: normalizeImpact(input.impact),
    provenance: freeze({
      sourceAuthorities,
      sourceReferences: strings(input.provenance?.sourceReferences, "FCDP_SOURCE_REFERENCE_INVALID", 300),
      adapters: strings(input.provenance?.adapters, "FCDP_ADAPTER_INVALID", 240),
      evaluatedAt: instant(input.provenance?.evaluatedAt),
    }),
    lifecycle: normalizeLifecycle(input.lifecycle),
    feedback: normalizeFeedback(input.feedback),
    composition: normalizeComposition(input.composition),
    humanDecisionRequired: input.humanDecisionRequired !== false,
    boundaries: freeze({
      readOnly: true,
      createsTruth: false,
      createsScore: false,
      calculatesPriority: false,
      calculatesConfidence: false,
      calculatesImpact: false,
      automaticExecutionAllowed: false,
      persistenceAllowed: false,
    }),
  });
}

function relationshipForGroup(group) {
  if (group.some(item => item.lifecycle.state === "STALE")) return "STALE";
  if (group.some(item => String(item.truthState).toUpperCase() === "INSUFFICIENT_EVIDENCE")) return "INSUFFICIENT_EVIDENCE";
  const actionKeys = new Set(group.map(item => item.composition.actionKey).filter(Boolean));
  const families = new Set(group.map(item => item.family));
  if (actionKeys.size > 1) return "CONFLICT";
  if (families.size > 1) return "COMPLEMENT";
  if (group.every(item => item.composition.mergeCompatible === true) && actionKeys.size <= 1) return "AGREE";
  return "UNKNOWN";
}

export function composeDecisionProjectionSet(projections = []) {
  const items = projections.map(item => {
    if (!item || item.contractType !== CONTRACT_TYPE || item.contractVersion !== CONTRACT_VERSION) {
      fail("FCDP_COMPOSITION_ITEM_INVALID", "Sólo se pueden componer proyecciones FCDP válidas.");
    }
    return item;
  });
  const byKey = new Map();
  items.forEach(item => {
    const key = item.composition.key;
    if (!key) return;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(item);
  });
  const groups = [...byKey.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => freeze({
      key,
      relationship: relationshipForGroup(group),
      decisionReferences: group.map(item => item.decisionReference),
      sourceAuthorities: [...new Set(group.flatMap(item => item.provenance.sourceAuthorities))],
      winnerDecisionReference: null,
      automaticResolutionAllowed: false,
    }));
  return freeze({
    contractType: "FORGE_CROSS_DOMAIN_DECISION_PROJECTION_SET",
    contractVersion: CONTRACT_VERSION,
    items: freeze([...items]),
    groups: freeze(groups),
    boundaries: freeze({
      rankingPerformed: false,
      scoreCalculated: false,
      winnerSelected: false,
      businessMeaningMerged: false,
      automaticConflictResolution: false,
    }),
  });
}

export {
  CONTRACT_TYPE,
  CONTRACT_VERSION,
  DECISION_FAMILIES,
  LIFECYCLE_STATES,
  COMPOSITION_RELATIONSHIPS,
};
