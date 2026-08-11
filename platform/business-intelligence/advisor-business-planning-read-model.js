"use strict";

const CONSTRAINT_STATES = Object.freeze([
  "CONFIRMED_CONSTRAINT",
  "POSSIBLE_CONSTRAINT",
  "INSUFFICIENT_EVIDENCE",
  "BLOCKED_BY_MISSING_EVIDENCE",
  "NOT_APPLICABLE",
  "UNKNOWN",
]);

const REVIEW_STATES = Object.freeze([
  "INITIAL_REVIEW",
  "EVIDENCE_CHANGED",
  "NO_MATERIAL_CHANGE",
  "REVIEW_BLOCKED",
]);

function fail(code) {
  const error = new TypeError(code);
  error.code = code;
  throw error;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function text(value, code, max = 240) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) fail(code);
  return normalized;
}

function optionalText(value, max = 500) {
  if (!present(value)) return null;
  const normalized = String(value).trim();
  return normalized ? normalized.slice(0, max) : null;
}

function finite(value) {
  if (!present(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function unique(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map(value => optionalText(value, 240))
    .filter(Boolean))];
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
}

function fingerprint(value) {
  const source = JSON.stringify(stable(value));
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `BP017B-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function normalizePeriod(period) {
  if (!period || typeof period !== "object" || Array.isArray(period)) fail("BUSINESS_PLANNING_PERIOD_REQUIRED");
  const yearMonth = text(period.yearMonth, "BUSINESS_PLANNING_YEAR_MONTH_REQUIRED", 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) fail("BUSINESS_PLANNING_YEAR_MONTH_INVALID");
  return { yearMonth };
}

function normalizeForecast({ forecast, advisorId, period }) {
  if (!forecast || typeof forecast !== "object" || Array.isArray(forecast)) {
    return { state: "MISSING", goal: null, actual: null, gap: null, evidenceRefs: [], freshness: "UNKNOWN", limitations: ["advisor_forecast_missing"] };
  }
  if (forecast.schema !== "ADVISOR_FORECAST_COMPOSER_V2") fail("BUSINESS_PLANNING_FORECAST_SCHEMA_UNSUPPORTED");
  if (forecast.advisorId !== advisorId) fail("BUSINESS_PLANNING_CROSS_ADVISOR_FORECAST_BLOCKED");
  const forecastMonth = forecast.period?.yearMonth || forecast.period?.month || null;
  if (forecastMonth && forecastMonth !== period.yearMonth) fail("BUSINESS_PLANNING_FORECAST_PERIOD_MISMATCH");

  const goalGap = forecast.goalGap || {};
  const targetUnit = optionalText(forecast.baseForecast?.input?.target?.unit, 40)?.toUpperCase() || null;
  const productionUnit = optionalText(forecast.baseForecast?.input?.production?.unit, 40)?.toUpperCase() || null;
  const allowedPolicyUnits = new Set(["POLICIES", "POLICY", "POLICY_COUNT"]);
  if ((targetUnit && !allowedPolicyUnits.has(targetUnit)) ||
      (productionUnit && !allowedPolicyUnits.has(productionUnit))) {
    fail("BUSINESS_PLANNING_GOAL_ACTUAL_UNITS_NOT_COMPARABLE");
  }
  const goal = finite(goalGap.target);
  const actual = finite(goalGap.currentProduction);
  const gap = finite(goalGap.confirmedGap);
  const evidenceRefs = unique([
    ...(forecast.sourceEvidence?.evidenceRefs || []),
    ...(goalGap.evidenceRefs || []),
    ...(forecast.baseForecast?.input?.target?.evidenceRefs || []),
    ...(forecast.baseForecast?.input?.target?.sourceEvidenceIds || []),
    ...(forecast.baseForecast?.input?.production?.evidenceRefs || []),
    ...(forecast.baseForecast?.input?.production?.sourceEvidenceIds || []),
  ]);
  const freshness = optionalText(
    forecast.sourceEvidence?.freshness || forecast.freshness || forecast.generatedAt,
    80,
  ) || "UNKNOWN";
  const complete = goal !== null && actual !== null && gap !== null;
  if (complete && Math.max(0, goal - actual) !== gap) fail("BUSINESS_PLANNING_GAP_RECONCILIATION_FAILED");

  return {
    state: complete && evidenceRefs.length ? "KNOWN" : complete ? "INCOMPLETE" : "MISSING",
    goal: goal === null ? null : { value: goal, unit: "POLICY_COUNT", sourceAuthority: "ADVISOR_MONTHLY_POLICY_GOAL_SUPABASE_REPOSITORY" },
    actual: actual === null ? null : { value: actual, unit: "POLICY_COUNT", sourceAuthority: "POLICY_SOLD_CONFIRMED" },
    gap: gap === null ? null : { value: gap, unit: "POLICY_COUNT", sourceAuthority: "ADVISOR_FORECAST_STAGE_10" },
    evidenceRefs,
    freshness,
    limitations: unique(goalGap.confidenceLimitations || []),
  };
}

function normalizeFollowUpContext(context, advisorId, period) {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    return { state: "MISSING", items: [], evidenceRefs: [], freshness: "UNKNOWN", limitations: ["follow_up_context_missing"] };
  }
  if (context.advisorId !== advisorId) fail("BUSINESS_PLANNING_CROSS_ADVISOR_FOLLOW_UP_BLOCKED");
  if (context.period?.yearMonth && context.period.yearMonth !== period.yearMonth) {
    fail("BUSINESS_PLANNING_FOLLOW_UP_PERIOD_MISMATCH");
  }
  if (context.sourceAuthority !== "MI_DIA_FOLLOW_UP_READ_MODEL") {
    fail("BUSINESS_PLANNING_FOLLOW_UP_AUTHORITY_INVALID");
  }
  const items = (Array.isArray(context.items) ? context.items : []).map(item => {
    const bucket = optionalText(item.bucket, 40)?.toUpperCase();
    if (bucket !== "OVERDUE") fail("BUSINESS_PLANNING_NON_OVERDUE_ITEM_REJECTED");
    if (item.stale === true) fail("BUSINESS_PLANNING_STALE_FOLLOW_UP_ITEM_REJECTED");
    return {
      itemReference: text(item.itemKey, "BUSINESS_PLANNING_FOLLOW_UP_REFERENCE_REQUIRED"),
      prospectReference: text(item.prospectReference, "BUSINESS_PLANNING_PROSPECT_REFERENCE_REQUIRED"),
      personDisplayName: optionalText(item.approvedDisplayName, 160),
      actionType: optionalText(item.nextActionType, 80) || "FOLLOW_UP",
      dueAt: text(item.nextActionAt, "BUSINESS_PLANNING_FOLLOW_UP_DUE_AT_REQUIRED", 80),
      evidenceRefs: unique([item.itemKey, item.prospectReference, ...(item.evidenceRefs || [])]),
    };
  });
  return {
    state: context.stale === true ? "STALE" : "KNOWN",
    items,
    evidenceRefs: unique([context.fingerprint, ...(context.evidenceRefs || []), ...items.flatMap(item => item.evidenceRefs)]),
    freshness: optionalText(context.generatedAt, 80) || "UNKNOWN",
    limitations: unique(context.limitations || []),
  };
}

function actionCandidatesForFollowUps(items, constraintReference) {
  return items.map((item, index) => deepFreeze({
    candidateReference: `BP017B:${constraintReference}:${index + 1}`,
    actionType: "REVIEW_OVERDUE_FOLLOW_UP",
    intendedObjective: "Revisar un seguimiento vencido con evidencia vigente.",
    recommendedAction: `Revisar el seguimiento pendiente${item.personDisplayName ? ` con ${item.personDisplayName}` : ""}.`,
    targetPerson: { personReference: item.prospectReference, displayName: item.personDisplayName },
    reasonWhy: "Existe un próximo compromiso vencido en el read model gobernado de Mi Día.",
    whyNow: `El compromiso estaba previsto para ${item.dueAt}.`,
    constraintAddressed: constraintReference,
    evidenceRefs: item.evidenceRefs,
    sourceOwners: ["PIPELINE", "MI_DIA_FOLLOW_UP_READ_MODEL", "BUSINESS_PLANNING"],
    urgency: "EVIDENCE_BOUND_OVERDUE",
    effort: { state: "UNKNOWN", value: null, unit: null },
    tradeoffs: ["Revisar contexto y relación antes de decidir si conviene contactar."],
    uncertainty: ["El seguimiento vencido no prueba intención, disponibilidad ni resultado comercial."],
    sequence: ["REVIEW_EVIDENCE", "HUMAN_DECISION", "OPTIONAL_CONVERSATION_PREPARATION"],
    humanReviewRequired: true,
    automaticExecutionAllowed: false,
  }));
}

function reviewState(previousPlan, currentFingerprint, blocked) {
  if (blocked) return "REVIEW_BLOCKED";
  if (!previousPlan) return "INITIAL_REVIEW";
  return previousPlan.fingerprint === currentFingerprint ? "NO_MATERIAL_CHANGE" : "EVIDENCE_CHANGED";
}

function createAdvisorBusinessPlanningReadModel(input = {}) {
  const advisorId = text(input.advisorId, "BUSINESS_PLANNING_ADVISOR_REQUIRED");
  const period = normalizePeriod(input.period);
  const generatedAt = new Date(input.generatedAt || Date.now()).toISOString();
  const forecast = normalizeForecast({ forecast: input.forecast, advisorId, period });
  const followUps = normalizeFollowUpContext(input.followUpContext, advisorId, period);

  let constraintState = "UNKNOWN";
  let constraintCandidates = [];
  let actionPathCandidates = [];
  const limitations = unique([...forecast.limitations, ...followUps.limitations]);

  if (forecast.state === "MISSING") {
    constraintState = "BLOCKED_BY_MISSING_EVIDENCE";
    limitations.push("goal_or_confirmed_production_missing");
  } else if (forecast.state === "INCOMPLETE") {
    constraintState = "BLOCKED_BY_MISSING_EVIDENCE";
    limitations.push("goal_gap_evidence_references_missing");
  } else if (forecast.gap.value === 0) {
    constraintState = "NOT_APPLICABLE";
    limitations.push("confirmed_policy_goal_already_covered");
  } else if (followUps.state !== "KNOWN") {
    constraintState = followUps.state === "STALE" ? "BLOCKED_BY_MISSING_EVIDENCE" : "INSUFFICIENT_EVIDENCE";
    limitations.push(followUps.state === "STALE" ? "follow_up_context_stale" : "constraint_evidence_missing");
  } else if (followUps.items.length === 0) {
    constraintState = "INSUFFICIENT_EVIDENCE";
    limitations.push("no_supported_constraint_observed");
  } else {
    const reference = fingerprint({ advisorId, period, items: followUps.items.map(item => item.itemReference) });
    constraintState = "CONFIRMED_CONSTRAINT";
    constraintCandidates = [deepFreeze({
      constraintReference: reference,
      description: `${followUps.items.length} seguimiento${followUps.items.length === 1 ? "" : "s"} vencido${followUps.items.length === 1 ? "" : "s"} requiere${followUps.items.length === 1 ? "" : "n"} revisión humana.`,
      sourceAuthorities: ["PIPELINE", "MI_DIA_FOLLOW_UP_READ_MODEL"],
      supportingEvidence: followUps.evidenceRefs,
      period,
      freshness: followUps.freshness,
      confidence: "EVIDENCE_BOUND",
      limitations: [
        "La existencia de seguimientos vencidos no demuestra que sea la única causa de la brecha.",
        "No se infiere volumen requerido ni probabilidad de cierre.",
      ],
      competingExplanations: ["CONVERSION_NOT_ASSESSED", "PIPELINE_VOLUME_NOT_ASSESSED", "EXTERNAL_CONTEXT_UNKNOWN"],
    })];
    actionPathCandidates = actionCandidatesForFollowUps(followUps.items, reference);
  }

  const evidenceRefs = unique([...forecast.evidenceRefs, ...followUps.evidenceRefs]);
  const core = {
    schema: "ADVISOR_BUSINESS_PLANNING_READ_MODEL_017B",
    advisorId,
    period,
    goal: forecast.goal,
    currentActual: forecast.actual,
    gap: forecast.gap,
    evidenceRefs,
    freshness: { forecast: forecast.freshness, followUp: followUps.freshness },
    constraintState,
    constraintCandidates,
    limitations: unique(limitations),
    actionPathCandidates,
    generatedAt,
  };
  const currentFingerprint = fingerprint({ ...core, generatedAt: null });
  const result = {
    ...core,
    reviewState: reviewState(
      input.previousPlan,
      currentFingerprint,
      constraintState === "BLOCKED_BY_MISSING_EVIDENCE",
    ),
    fingerprint: currentFingerprint,
    requiredActivity: { state: "UNKNOWN", value: null, unit: null },
    humanReviewRequired: true,
    automaticExecutionAllowed: false,
    createsTask: false,
    createsCalendarEvent: false,
    mutatesPipeline: false,
    sendsMessage: false,
    createsSourceTruth: false,
    createsCausalClaim: false,
  };
  if (!CONSTRAINT_STATES.includes(result.constraintState)) fail("BUSINESS_PLANNING_CONSTRAINT_STATE_INVALID");
  if (!REVIEW_STATES.includes(result.reviewState)) fail("BUSINESS_PLANNING_REVIEW_STATE_INVALID");
  return deepFreeze(result);
}

module.exports = {
  CONSTRAINT_STATES,
  REVIEW_STATES,
  createAdvisorBusinessPlanningReadModel,
};
