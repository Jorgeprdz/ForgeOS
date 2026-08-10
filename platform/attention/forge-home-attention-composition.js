import {
  composeDecisionProjectionSet,
} from "../decision-projection/forge-cross-domain-decision-projection.js";

export const HOME_ATTENTION_CONTRACT = "FORGE_HOME_ATTENTION_ORCHESTRATION";
export const HOME_ATTENTION_VERSION = "FHAO-007-001";

const HOME_STATES = Object.freeze([
  "LOADING",
  "READY",
  "EMPTY",
  "UNKNOWN",
  "PARTIAL",
  "STALE",
  "ERROR",
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function normalizeSourceState(value) {
  return String(value || "UNKNOWN").toUpperCase();
}

function deriveHomeState({ sourceState, items, omitted }) {
  const source = normalizeSourceState(sourceState);
  if (source === "LOADING") return "LOADING";
  if (source === "SESSION_REQUIRED") return "ERROR";
  if (items.some(item => item.state === "STALE")) return "STALE";
  if (items.length) {
    if (
      items.some(item => ["PARTIAL", "BLOCKED_BY_MISSING_EVIDENCE"].includes(String(item.truthState || "").toUpperCase()))
      || source === "PARTIAL"
      || source === "SOURCE_UNAVAILABLE"
      || source === "NOT_CONNECTED"
      || source === "BLOCKED_BY_MISSING_EVIDENCE"
      || omitted.length
    ) return "PARTIAL";
    return "READY";
  }
  if (source === "READY" || source === "EMPTY") return "EMPTY";
  if (source === "ERROR") return "ERROR";
  return "UNKNOWN";
}

function attentionItem(projection) {
  const sourceAuthorities = [...projection.provenance.sourceAuthorities];
  const action = projection.recommendedAction
    ? {
        type: projection.recommendedAction.type,
        label: projection.recommendedAction.label,
        deepLink: projection.recommendedAction.deepLink,
        humanApprovalRequired: projection.recommendedAction.humanApprovalRequired !== false,
        automaticExecutionAllowed: false,
      }
    : null;

  return deepFreeze({
    decisionReference: projection.decisionReference,
    decisionType: projection.decisionType,
    family: projection.family,
    title: projection.title,
    reason: projection.reason,
    subject: projection.subject,
    state: projection.lifecycle.state,
    whyNow: projection.whyNow,
    impact: projection.impact,
    truthState: projection.truthState,
    evidence: projection.evidence,
    confidence: projection.confidence,
    limitations: projection.limitations,
    recommendedHumanAction: action,
    actionOwner: projection.recommendedAction?.owner || null,
    actionTarget: projection.recommendedAction?.target || null,
    asOf: projection.provenance.evaluatedAt || projection.lifecycle.evaluatedAt || null,
    validUntil: projection.lifecycle.expiresAt || null,
    sourceDomain: projection.domain,
    sourceAuthority: sourceAuthorities[0] || null,
    sourceAuthorities,
    sourceReference: projection.provenance.sourceReferences[0] || null,
    provenance: projection.provenance,
    humanDecisionRequired: projection.humanDecisionRequired !== false,
  });
}

export function composeHomeAttention({
  advisorReference,
  projectionBundle,
  sourceState = null,
  asOf = null,
} = {}) {
  if (!advisorReference) throw new TypeError("HOME_007_ADVISOR_REFERENCE_REQUIRED");
  const projections = Array.isArray(projectionBundle?.projections)
    ? projectionBundle.projections
    : [];
  const omitted = Array.isArray(projectionBundle?.omitted)
    ? projectionBundle.omitted
    : [];
  const projectionSet = composeDecisionProjectionSet(projections);
  const items = projectionSet.items.map(attentionItem);
  const state = deriveHomeState({
    sourceState: sourceState || projectionBundle?.sourceState,
    items,
    omitted,
  });
  if (!HOME_STATES.includes(state)) throw new TypeError(`HOME_007_STATE_INVALID:${state}`);

  return deepFreeze({
    contractType: HOME_ATTENTION_CONTRACT,
    contractVersion: HOME_ATTENTION_VERSION,
    advisorReference,
    state,
    asOf: asOf || null,
    items,
    groups: projectionSet.groups,
    omitted,
    provenance: {
      decisionProjectionContract: projectionSet.contractVersion,
      sourceAdapter: projectionBundle?.adapter || null,
      sourceSelectionOwner: projectionBundle?.diagnostics?.sourceSelectionOwner || null,
      sourceOrder: projectionBundle?.sourceOrder || [],
    },
    boundaries: {
      readOnly: true,
      sourceOrderPreserved: true,
      rankingPerformed: false,
      scoreCalculated: false,
      winnerSelected: false,
      businessMeaningMerged: false,
      automaticConflictResolution: false,
      automaticCommercialAction: false,
      taskCreationAllowed: false,
      calendarCreationAllowed: false,
      identityConvergenceAllowed: false,
      pipelineAdvanceAllowed: false,
      domainWrites: 0,
    },
  });
}

export { HOME_STATES };
