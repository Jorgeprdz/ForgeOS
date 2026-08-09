import {
  createCrossDomainDecisionProjection,
} from "./forge-cross-domain-decision-projection.js";

const AUTHORITIES = Object.freeze({
  RELATIONSHIP: "FORGE_RELATIONSHIP_INTELLIGENCE_FOUNDATION",
  NASH: "FIP_NASH_NEXT_BEST_ACTION",
  OPPORTUNITY: "FIP_PACK_04_OPPORTUNITY_AND_OPERATION",
  MICK: "FORGE_MICK_EXECUTION_REVIEW",
  FORECAST: "MANAGER_OS_FORECAST",
  FORECAST_READ_MODEL: "ADVISOR_FORECAST_READ_MODEL_V3",
  REVENUE: "REVENUE_VALUE",
});

const safe = value => Array.isArray(value) ? value : [];
const sourceEvidence = (refs, authority) => safe(refs).filter(Boolean).map(reference => ({
  reference: String(reference),
  authority,
}));
const instantOrNull = value => value || null;
const sourceConfidence = (value, authority, sourceReference = null) => value === null || value === undefined || value === ""
  ? null
  : { value, authority, sourceReference };
const sourcePriority = (value, authority, sourceReference = null) => value === null || value === undefined || value === ""
  ? null
  : { value, authority, sourceReference };

function relationshipEvidence(items = []) {
  return safe(items).map(item => ({
    reference: String(item.reference),
    authority: String(item.authority || AUTHORITIES.RELATIONSHIP),
    observedAt: item.observedAt || null,
    freshness: item.freshness || null,
    summary: item.summary || null,
  }));
}

export function projectRelationshipCommitmentDecision({ foundation, commitment, advisorReference } = {}) {
  if (!foundation?.personReference || !commitment?.reference) throw new TypeError("Relationship foundation and commitment are required");
  const state = String(commitment.state || "UNKNOWN").toUpperCase();
  const isStale = safe(commitment.evidence).some(item => item?.freshness === "STALE");
  const actionType = state === "OVERDUE" ? "REVIEW_OVERDUE_COMMITMENT" : "REVIEW_COMMITMENT";
  return createCrossDomainDecisionProjection({
    decisionReference: `relationship:${commitment.reference}`,
    advisorReference: advisorReference || foundation.advisorReference,
    subject: { type: "PERSON", reference: foundation.personReference },
    domain: "RELATIONSHIP",
    family: "FOLLOW_UP",
    decisionType: state === "OVERDUE" ? "FOLLOW_UP_DUE" : "COMMITMENT_REVIEW",
    truthState: state,
    title: state === "OVERDUE" ? "Compromiso vencido" : "Compromiso por revisar",
    reason: commitment.description || "Existe un compromiso comercial registrado.",
    whyNow: commitment.dueAt ? `Compromiso con fecha ${commitment.dueAt}.` : null,
    confidence: null,
    evidence: relationshipEvidence(commitment.evidence),
    limitations: [],
    recommendedAction: {
      type: actionType,
      label: state === "OVERDUE" ? "Revisar y retomar compromiso" : "Revisar compromiso",
      owner: "PIPELINE",
      target: foundation.personReference,
      humanApprovalRequired: true,
    },
    provenance: {
      sourceAuthorities: [AUTHORITIES.RELATIONSHIP, ...(foundation.authorities?.timeline ? [foundation.authorities.timeline] : [])],
      sourceReferences: [commitment.reference],
      adapters: ["FCDP_RELATIONSHIP_ADAPTER"],
      evaluatedAt: foundation.generatedAt || null,
    },
    lifecycle: {
      state: isStale ? "STALE" : state === "FULFILLED" ? "RESOLVED" : "ACTIVE",
      effectiveAt: commitment.dueAt || null,
      evaluatedAt: foundation.generatedAt || null,
      sourceUpdatedAt: safe(commitment.evidence).find(item => item?.observedAt)?.observedAt || null,
    },
    feedback: {
      owner: "PIPELINE_TIMELINE",
      expectedEvents: ["ACTIVITY_RECORDED", "COMMITMENT_RESCHEDULED", "COMMITMENT_FULFILLED"],
    },
    composition: {
      key: `person:${foundation.personReference}:follow-up`,
      actionKey: `pipeline:${foundation.personReference}:follow-up`,
      mergeCompatible: true,
    },
    humanDecisionRequired: true,
  });
}

export function projectRelationshipHealthDecision({ foundation, advisorReference } = {}) {
  if (!foundation?.personReference) throw new TypeError("Relationship foundation is required");
  const state = String(foundation.health?.state || "UNKNOWN").toUpperCase();
  const evidence = relationshipEvidence(foundation.health?.evidence);
  const isStale = evidence.some(item => item.freshness === "STALE");
  return createCrossDomainDecisionProjection({
    decisionReference: `relationship-health:${foundation.personReference}:${state}`,
    advisorReference: advisorReference || foundation.advisorReference,
    subject: { type: "PERSON", reference: foundation.personReference },
    domain: "RELATIONSHIP",
    family: "RELATIONSHIP",
    decisionType: "RELATIONSHIP_HEALTH_REVIEW",
    truthState: state,
    title: "Estado de relación",
    reason: foundation.health?.reason || `Estado de relación: ${state}.`,
    confidence: sourceConfidence(foundation.health?.confidence, AUTHORITIES.RELATIONSHIP, foundation.personReference),
    evidence,
    limitations: state === "UNKNOWN" ? ["Relationship health is unknown."] : [],
    recommendedAction: {
      type: "REVIEW_RELATIONSHIP_CONTEXT",
      label: "Revisar contexto de relación",
      owner: "PERSON",
      target: foundation.personReference,
      humanApprovalRequired: true,
    },
    provenance: {
      sourceAuthorities: [AUTHORITIES.RELATIONSHIP],
      sourceReferences: [foundation.personReference],
      adapters: ["FCDP_RELATIONSHIP_ADAPTER"],
      evaluatedAt: foundation.generatedAt || null,
    },
    lifecycle: {
      state: isStale ? "STALE" : state === "UNKNOWN" ? "DERIVED" : "ACTIVE",
      evaluatedAt: foundation.generatedAt || null,
    },
    feedback: { owner: "RELATIONSHIP_TIMELINE", expectedEvents: ["INTERACTION_RECORDED", "RELATIONSHIP_EVIDENCE_UPDATED"] },
    composition: {
      key: `person:${foundation.personReference}:relationship-health`,
      actionKey: `person:${foundation.personReference}:review-relationship`,
      mergeCompatible: true,
    },
  });
}

export function projectNashRecommendationDecision({ recommendation } = {}) {
  if (!recommendation?.personReference) throw new TypeError("Nash recommendation is required");
  const evidence = safe(recommendation.evidence).map(item => ({
    reference: String(item.reference),
    authority: String(item.authority || AUTHORITIES.NASH),
    observedAt: item.observedAt || null,
    summary: item.summary || null,
  }));
  return createCrossDomainDecisionProjection({
    decisionReference: `nash:${recommendation.personReference}:${recommendation.recommendedAction}`,
    advisorReference: recommendation.advisorReference,
    subject: { type: "PERSON", reference: recommendation.personReference },
    domain: "NASH",
    family: "COMMERCIAL_ATTENTION",
    decisionType: "NEXT_BEST_ACTION",
    truthState: "RECOMMENDATION",
    title: recommendation.recommendedAction,
    reason: `${recommendation.whyThisPerson} ${recommendation.whyThisAction}`,
    whyNow: recommendation.whyNow,
    confidence: sourceConfidence(recommendation.confidence, AUTHORITIES.NASH, recommendation.personReference),
    evidence,
    limitations: recommendation.limitations || [],
    recommendedAction: {
      type: "NASH_RECOMMENDED_ACTION",
      label: recommendation.recommendedAction,
      owner: "PIPELINE",
      target: recommendation.personReference,
      humanApprovalRequired: true,
    },
    impact: recommendation.expectedImpact ? {
      value: recommendation.expectedImpact,
      semantics: "DESCRIPTIVE_RECOMMENDATION_IMPACT",
      authority: AUTHORITIES.NASH,
      sourceReference: recommendation.personReference,
    } : null,
    provenance: {
      sourceAuthorities: [AUTHORITIES.NASH, ...new Set(evidence.map(item => item.authority))],
      sourceReferences: evidence.map(item => item.reference),
      adapters: ["FCDP_NASH_ADAPTER"],
    },
    lifecycle: { state: recommendation.confidence === "INSUFFICIENT_EVIDENCE" ? "DERIVED" : "ACTIVE" },
    feedback: { owner: "PIPELINE_TIMELINE", expectedEvents: ["ACTIVITY_RECORDED", "RECOMMENDATION_OUTCOME_RECORDED"] },
    composition: {
      key: `person:${recommendation.personReference}:follow-up`,
      actionKey: `pipeline:${recommendation.personReference}:follow-up`,
      mergeCompatible: true,
    },
    humanDecisionRequired: true,
  });
}

export function projectOpportunityPriorityDecision({ envelope, priority, action = null } = {}) {
  if (!envelope?.advisorReference || !priority?.reference) throw new TypeError("Opportunity envelope and priority are required");
  const evidence = sourceEvidence(priority.evidenceRefs, AUTHORITIES.OPPORTUNITY);
  return createCrossDomainDecisionProjection({
    decisionReference: `opportunity-priority:${priority.reference}`,
    advisorReference: envelope.advisorReference,
    subject: { type: "PERSON_OR_OPPORTUNITY", reference: priority.reference },
    domain: "OPPORTUNITY",
    family: "COMMERCIAL_ATTENTION",
    decisionType: "OPPORTUNITY_PRIORITY",
    truthState: "ACTION_REQUIRING_APPROVAL",
    title: priority.label,
    reason: priority.whyNow || "Pack04 priority candidate.",
    whyNow: priority.whyNow || null,
    priority: sourcePriority(priority.score, AUTHORITIES.OPPORTUNITY, priority.reference),
    confidence: priority.components?.evidenceConfidence !== undefined
      ? sourceConfidence(priority.components.evidenceConfidence, AUTHORITIES.OPPORTUNITY, priority.reference)
      : null,
    evidence,
    recommendedAction: action ? {
      type: action.type,
      label: action.label,
      owner: action.owner,
      target: action.target || priority.reference,
      deepLink: action.deepLink || null,
      humanApprovalRequired: true,
    } : null,
    provenance: {
      sourceAuthorities: [AUTHORITIES.OPPORTUNITY],
      sourceReferences: [priority.reference, ...priority.evidenceRefs || []],
      adapters: ["FCDP_OPPORTUNITY_ADAPTER"],
      evaluatedAt: envelope.asOf || null,
    },
    lifecycle: { state: "ACTIVE", evaluatedAt: instantOrNull(envelope.asOf) },
    feedback: { owner: "PIPELINE_TIMELINE", expectedEvents: ["PIPELINE_EVENT_RECORDED", "ACTIVITY_RECORDED"] },
    composition: {
      key: `person:${priority.reference}:commercial-attention`,
      actionKey: action?.actionKey || null,
      mergeCompatible: Boolean(action?.actionKey),
    },
  });
}

export function projectMickPatternDecision({ mickReview, pattern } = {}) {
  if (!mickReview?.advisorReference || !pattern?.id) throw new TypeError("Mick review and pattern are required");
  return createCrossDomainDecisionProjection({
    decisionReference: `mick:${mickReview.advisorReference}:${pattern.id}`,
    advisorReference: mickReview.advisorReference,
    subject: { type: "ADVISOR", reference: mickReview.advisorReference },
    domain: "ADVISOR_INTELLIGENCE",
    family: "COACHING",
    decisionType: "MICK_EXECUTION_PATTERN",
    truthState: pattern.state || "UNKNOWN",
    title: `Patrón de ejecución: ${pattern.id}`,
    reason: pattern.observation,
    confidence: sourceConfidence(pattern.evidence?.confidence, AUTHORITIES.MICK, pattern.id),
    evidence: sourceEvidence(pattern.evidence?.evidenceRefs, AUTHORITIES.MICK),
    limitations: pattern.evidence?.limitations || [],
    recommendedAction: pattern.recommendedExperiment ? {
      type: "CHOOSE_EXECUTION_EXPERIMENT",
      label: pattern.recommendedExperiment,
      owner: "COACH",
      target: mickReview.advisorReference,
      humanApprovalRequired: true,
    } : null,
    impact: pattern.businessImpact ? {
      value: pattern.businessImpact,
      semantics: "DESCRIPTIVE_COACHING_IMPACT",
      authority: AUTHORITIES.MICK,
      sourceReference: pattern.id,
    } : null,
    provenance: {
      sourceAuthorities: [AUTHORITIES.MICK],
      sourceReferences: [pattern.id, ...pattern.evidence?.evidenceRefs || []],
      adapters: ["FCDP_MICK_ADAPTER"],
    },
    lifecycle: { state: pattern.state === "INSUFFICIENT_EVIDENCE" ? "DERIVED" : "ACTIVE" },
    feedback: { owner: "ACTIVITY_COACH", expectedEvents: ["ACTIVITY_PATTERN_CHANGED", "COACH_REVIEW_RECORDED"] },
    composition: {
      key: `advisor:${mickReview.advisorReference}:coaching:${pattern.id}`,
      actionKey: pattern.recommendedExperiment ? `coach:${pattern.id}:experiment` : null,
      mergeCompatible: false,
    },
  });
}

export function projectAdvisorForecastDecision({ readModel } = {}) {
  if (!readModel?.advisorId || !["ADVISOR_FORECAST_READ_MODEL_V2", "ADVISOR_FORECAST_READ_MODEL_V3"].includes(readModel.schema)) {
    throw new TypeError("Advisor Forecast Read Model V2/V3 is required");
  }
  const periodReference = readModel.period?.yearMonth || readModel.period?.label || "unknown";
  const primaryAction = safe(readModel.actions)[0] || null;
  const sourceAuthorities = [
    AUTHORITIES.FORECAST,
    readModel.schema,
    "SMNYL_PACE_FORECAST_ENGINE",
    "MANAGER_ADVISOR_FORECAST_ENGINE",
    "PRODUCTION_EVENTS",
    "PIPELINE",
    "FES",
  ];
  return createCrossDomainDecisionProjection({
    decisionReference: `advisor-forecast:${readModel.advisorId}:${periodReference}`,
    advisorReference: readModel.advisorId,
    subject: { type: "ADVISOR", reference: readModel.advisorId },
    domain: "FORECAST",
    family: "FORECAST",
    decisionType: "ADVISOR_MONTHLY_FORECAST",
    truthState: readModel.state || "UNKNOWN",
    title: "Forecast mensual",
    reason: readModel.primaryExplanation || readModel.decisionSummary?.summary || "Forecast de planeación bajo supuestos y evidencia vigente.",
    confidence: sourceConfidence(readModel.confidence || "UNKNOWN", AUTHORITIES.FORECAST_READ_MODEL, readModel.schema),
    evidence: sourceEvidence(readModel.evidenceRefs, AUTHORITIES.FORECAST),
    limitations: [
      ...(readModel.warnings || []),
      ...(readModel.missingInformation || []).map(item => typeof item === "string" ? item : item.signal || "missing_information"),
      ...(readModel.staleInformation || []).map(item => typeof item === "string" ? item : item.signal || "stale_information"),
    ],
    recommendedAction: primaryAction ? {
      type: primaryAction.type || "NAVIGATE",
      label: primaryAction.label || "Abrir Forecast",
      owner: primaryAction.destination?.includes("ACTIVITY") ? "ACTIVITY" : primaryAction.destination?.includes("PIPELINE") ? "PIPELINE" : "FORECAST",
      target: primaryAction.destination || "ADVISOR_FORECAST_DETAIL",
      humanApprovalRequired: true,
    } : null,
    impact: {
      value: readModel.paceProjection ?? null,
      semantics: "PROJECTED",
      authority: "SMNYL_PACE_FORECAST_ENGINE",
      sourceReference: periodReference,
    },
    provenance: {
      sourceAuthorities,
      sourceReferences: [periodReference, ...readModel.evidenceRefs || []],
      adapters: ["FCDP_ADVISOR_FORECAST_V3_ADAPTER"],
      evaluatedAt: readModel.generatedAt || null,
    },
    lifecycle: {
      state: readModel.state === "STALE" ? "STALE" : readModel.state === "BLOCKED" ? "DERIVED" : "ACTIVE",
      evaluatedAt: readModel.generatedAt || null,
      sourceUpdatedAt: readModel.generatedAt || null,
    },
    feedback: { owner: "FORECAST_RECONCILIATION", expectedEvents: ["OBSERVED_OUTCOME", "POLICY_SOLD_CONFIRMED"] },
    composition: {
      key: `advisor:${readModel.advisorId}:forecast:${periodReference}`,
      actionKey: primaryAction?.destination ? `forecast:${primaryAction.destination}` : null,
      mergeCompatible: false,
    },
  });
}

export function projectRevenueDecision({ advisorReference, subjectReference, revenueValue, decisionReference = null } = {}) {
  if (!advisorReference || !subjectReference || !revenueValue?.bucket) throw new TypeError("Revenue value projection input is required");
  return createCrossDomainDecisionProjection({
    decisionReference: decisionReference || `revenue:${subjectReference}:${revenueValue.bucket}`,
    advisorReference,
    subject: { type: "ECONOMIC_CONTEXT", reference: subjectReference },
    domain: "REVENUE",
    family: "ECONOMIC",
    decisionType: "REVENUE_TRUTH_STATE",
    truthState: revenueValue.bucket,
    title: "Estado económico",
    reason: revenueValue.reason || `Revenue bucket: ${revenueValue.bucket}.`,
    confidence: sourceConfidence(revenueValue.confidence, AUTHORITIES.REVENUE, subjectReference),
    evidence: sourceEvidence(revenueValue.evidenceRefs, AUTHORITIES.REVENUE),
    limitations: revenueValue.warnings || [],
    impact: {
      value: revenueValue.amount ?? null,
      currency: revenueValue.currency || null,
      semantics: revenueValue.bucket,
      authority: AUTHORITIES.REVENUE,
      sourceReference: subjectReference,
    },
    provenance: {
      sourceAuthorities: [AUTHORITIES.REVENUE],
      sourceReferences: [subjectReference, ...revenueValue.evidenceRefs || []],
      adapters: ["FCDP_REVENUE_ADAPTER"],
    },
    lifecycle: { state: ["reversed", "cancelled"].includes(revenueValue.bucket) ? "RESOLVED" : "ACTIVE" },
    feedback: { owner: "ECONOMIC_EVIDENCE", expectedEvents: ["ECONOMIC_EVENT_UPDATED", "COMMISSION_STATEMENT_CONFIRMED"] },
    composition: {
      key: `economic:${subjectReference}`,
      actionKey: null,
      mergeCompatible: false,
    },
  });
}

export { AUTHORITIES };
