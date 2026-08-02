const CONTRACT_TYPE = "FORGE_FIP_PACK_07_PRODUCTIVE_EXPERIENCE";
const CONTRACT_VERSION = "FIP-330-350-001";

const SURFACES = Object.freeze([
  "HOME", "PERSON", "PIPELINE", "ACTIVITY", "REPORTS", "FORECAST", "NASH", "ALFRED",
]);
const FACT_KINDS = Object.freeze(["FACT", "ESTIMATE", "HYPOTHESIS", "RECOMMENDATION", "ACTION_REQUIRING_APPROVAL"]);
const SOURCE_STATUSES = Object.freeze(["AVAILABLE", "EMPTY", "DEGRADED", "UNAVAILABLE"]);
const VIEWPORTS = Object.freeze(["MOBILE", "TABLET", "DESKTOP"]);

const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};
const text = (value, label, max = 500) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) throw new TypeError(`${label} no es válido.`);
  return normalized;
};
const optionalText = (value, max = 500) => value === null || value === undefined || value === ""
  ? null
  : text(String(value), "El texto opcional", max);

function normalizeSource(input = {}) {
  const status = text(input.status || "UNAVAILABLE", "El estado de fuente", 40).toUpperCase();
  if (!SOURCE_STATUSES.includes(status)) throw new TypeError("El estado de fuente no está permitido.");
  return freeze({
    id: text(input.id, "La fuente", 120), status,
    freshness: optionalText(input.freshness, 80), reason: optionalText(input.reason, 240),
    evidenceCount: Math.max(0, Number(input.evidenceCount) || 0),
  });
}
function normalizeInsight(input = {}) {
  const kind = text(input.kind, "El tipo de insight", 80).toUpperCase();
  if (!FACT_KINDS.includes(kind)) throw new TypeError("El tipo de insight no está permitido.");
  return freeze({
    id: text(input.id, "El insight", 160), kind,
    title: text(input.title, "El título", 180), summary: text(input.summary, "El resumen", 900),
    confidence: optionalText(input.confidence, 40),
    evidence: Array.isArray(input.evidence) ? input.evidence.map(item => text(item, "La evidencia", 240)) : [],
    actionId: optionalText(input.actionId, 160),
    humanApprovalRequired: kind === "ACTION_REQUIRING_APPROVAL" || input.humanApprovalRequired === true,
  });
}
function normalizeWidget(input = {}) {
  const surface = text(input.surface, "La superficie", 80).toUpperCase();
  if (!SURFACES.includes(surface)) throw new TypeError("La superficie no está permitida.");
  return freeze({
    id: text(input.id, "El widget", 160), surface,
    title: text(input.title, "El título", 180), state: text(input.state || "READY", "El estado", 80).toUpperCase(),
    insightIds: Array.isArray(input.insightIds) ? input.insightIds.map(id => text(id, "El insight", 160)) : [],
    deepLink: optionalText(input.deepLink, 500), readOnly: true, localMutationControls: false,
  });
}

export function createAlfredProductiveExperience(input = {}) {
  const advisorReference = text(input.advisorReference, "El asesor", 240);
  const generatedAt = new Date(input.generatedAt || Date.now()).toISOString();
  const sources = Array.isArray(input.sources) ? input.sources.map(normalizeSource) : [];
  const insights = Array.isArray(input.insights) ? input.insights.map(normalizeInsight) : [];
  const widgets = Array.isArray(input.widgets) ? input.widgets.map(normalizeWidget) : [];
  const insightIds = new Set(insights.map(item => item.id));
  widgets.forEach(widget => widget.insightIds.forEach(id => {
    if (!insightIds.has(id)) throw new TypeError(`El widget ${widget.id} referencia un insight inexistente.`);
  }));
  return freeze({
    contractType: CONTRACT_TYPE, contractVersion: CONTRACT_VERSION, advisorReference, generatedAt,
    sources, insights, widgets,
    responsiveAcceptance: freeze(Object.fromEntries(VIEWPORTS.map(viewport => [viewport, freeze({ required: true, accepted: false })]))),
    orchestration: freeze({
      alfredRole: "ORCHESTRATOR", relationshipIntelligenceRole: "PERSON_CONTEXT",
      advisorIntelligenceRole: "ADVISOR_CONTEXT", mickRole: "EXECUTION_CONTEXT",
      nashRole: "COMMERCIAL_REASONING", opportunityRole: "OPERATION_CONTEXT",
      businessIntelligenceRole: "BUSINESS_CONTEXT",
    }),
    boundaries: freeze({
      factsSeparatedFromEstimates: true, estimatesSeparatedFromHypotheses: true,
      recommendationsSeparatedFromActions: true, unknownAsZero: false, uiStateAsTruth: false,
      automaticMessage: false, automaticTask: false, automaticCalendar: false,
      automaticPipelineAdvance: false, automaticOpportunity: false, automaticApplication: false,
      automaticPolicy: false, humanApprovalRequired: true, logoutScrubRequired: true,
      lateResultRejectionRequired: true, mobileSafeZoneRequired: true,
    }),
  });
}

export { CONTRACT_TYPE, CONTRACT_VERSION, SURFACES, FACT_KINDS, SOURCE_STATUSES, VIEWPORTS };
