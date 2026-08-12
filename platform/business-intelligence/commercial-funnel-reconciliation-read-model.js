"use strict";

const STAGES = Object.freeze([
  "CONTACT",
  "CONVERSATION",
  "APPOINTMENT",
  "PRESENTATION",
  "APPLICATION",
  "CONFIRMED_POLICY",
]);

const EVENT_STAGE_RULES = Object.freeze({
  MESSAGE_SENT_CONFIRMED: Object.freeze({ stages: ["CONTACT"], authorities: ["EVENT_EVIDENCE_FES"] }),
  CALL_COMPLETED: Object.freeze({ stages: ["CONTACT", "CONVERSATION"], authorities: ["EVENT_EVIDENCE_FES"] }),
  CALL_CONNECTED_CONFIRMED: Object.freeze({ stages: ["CONTACT", "CONVERSATION"], authorities: ["EVENT_EVIDENCE_FES"] }),
  CONVERSATION_RECORDED: Object.freeze({ stages: ["CONVERSATION"], authorities: ["PROSPECT_TIMELINE"] }),
  APPOINTMENT_HELD: Object.freeze({ stages: ["APPOINTMENT"], authorities: ["EVENT_EVIDENCE_FES"] }),
  APPOINTMENT_COMPLETED: Object.freeze({ stages: ["APPOINTMENT"], authorities: ["PROSPECT_TIMELINE"] }),
  PRESENTATION_HELD_CONFIRMED: Object.freeze({ stages: ["PRESENTATION"], authorities: ["EVENT_EVIDENCE_FES"] }),
  PROPOSAL_PRESENTED: Object.freeze({ stages: ["PRESENTATION"], authorities: ["PROSPECT_TIMELINE"] }),
  APPLICATION_SUBMITTED: Object.freeze({ stages: ["APPLICATION"], authorities: ["POLICY_SALES_OPERATIONS"] }),
  POLICY_SOLD_CONFIRMED: Object.freeze({ stages: ["CONFIRMED_POLICY"], authorities: ["POLICY_SALES_OPERATIONS"] }),
});

const TRANSITIONS = Object.freeze([
  Object.freeze(["CONTACT", "CONVERSATION"]),
  Object.freeze(["CONVERSATION", "APPOINTMENT"]),
  Object.freeze(["APPOINTMENT", "PRESENTATION"]),
  Object.freeze(["PRESENTATION", "APPLICATION"]),
  Object.freeze(["APPLICATION", "CONFIRMED_POLICY"]),
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

function required(value, code, max = 240) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > max) fail(code);
  return normalized;
}

function validInstant(value, code) {
  const normalized = required(value, code, 80);
  if (Number.isNaN(Date.parse(normalized))) fail(code);
  return new Date(normalized).toISOString();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizePeriod(period) {
  if (!period || typeof period !== "object" || Array.isArray(period)) fail("COMMERCIAL_FUNNEL_PERIOD_REQUIRED");
  const from = validInstant(period.from, "COMMERCIAL_FUNNEL_PERIOD_FROM_INVALID");
  const to = validInstant(period.to, "COMMERCIAL_FUNNEL_PERIOD_TO_INVALID");
  if (Date.parse(to) <= Date.parse(from)) fail("COMMERCIAL_FUNNEL_PERIOD_ORDER_INVALID");
  return { from, to };
}

function normalizeCoverage(input = {}) {
  return Object.fromEntries(STAGES.map(stage => {
    const value = String(input[stage] || "UNKNOWN").toUpperCase();
    if (!["COMPLETE", "PARTIAL", "UNKNOWN", "NOT_CONNECTED"].includes(value)) {
      fail("COMMERCIAL_FUNNEL_COVERAGE_STATE_INVALID");
    }
    return [stage, value];
  }));
}

function normalizeFact(raw, advisorId, period) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("COMMERCIAL_FUNNEL_FACT_INVALID");
  if (raw.advisorId !== advisorId) fail("COMMERCIAL_FUNNEL_CROSS_ADVISOR_FACT_BLOCKED");
  const eventType = required(raw.eventType, "COMMERCIAL_FUNNEL_EVENT_TYPE_REQUIRED", 100).toUpperCase();
  const rule = EVENT_STAGE_RULES[eventType];
  if (!rule) fail("COMMERCIAL_FUNNEL_EVENT_TYPE_UNSUPPORTED");
  const sourceAuthority = required(raw.sourceAuthority, "COMMERCIAL_FUNNEL_SOURCE_AUTHORITY_REQUIRED", 120).toUpperCase();
  if (!rule.authorities.includes(sourceAuthority)) fail("COMMERCIAL_FUNNEL_SOURCE_AUTHORITY_MISMATCH");
  const occurredAt = validInstant(raw.occurredAt, "COMMERCIAL_FUNNEL_OCCURRED_AT_INVALID");
  if (occurredAt < period.from || occurredAt >= period.to) fail("COMMERCIAL_FUNNEL_FACT_OUTSIDE_PERIOD");
  const confirmationState = required(raw.confirmationState, "COMMERCIAL_FUNNEL_CONFIRMATION_REQUIRED", 40).toUpperCase();
  if (confirmationState !== "CONFIRMED") fail("COMMERCIAL_FUNNEL_UNCONFIRMED_FACT_REJECTED");
  const evidenceRefs = unique((Array.isArray(raw.evidenceRefs) ? raw.evidenceRefs : [])
    .map(value => required(value, "COMMERCIAL_FUNNEL_EVIDENCE_REFERENCE_INVALID")));
  if (!evidenceRefs.length) fail("COMMERCIAL_FUNNEL_EVIDENCE_REQUIRED");
  const normalized = {
    factReference: required(raw.factReference, "COMMERCIAL_FUNNEL_FACT_REFERENCE_REQUIRED"),
    eventType,
    advisorId,
    commercialPersonReference: required(raw.commercialPersonReference, "COMMERCIAL_FUNNEL_PERSON_REFERENCE_REQUIRED"),
    identityAuthority: required(raw.identityAuthority, "COMMERCIAL_FUNNEL_IDENTITY_AUTHORITY_REQUIRED", 120).toUpperCase(),
    sourceAuthority,
    occurredAt,
    evidenceRefs,
  };
  return rule.stages.map(stage => ({ ...normalized, stage }));
}

function stageMetric(stage, facts, coverage) {
  const stageFacts = facts.filter(fact => fact.stage === stage);
  const people = unique(stageFacts.map(fact => fact.commercialPersonReference));
  const state = coverage === "COMPLETE"
    ? people.length === 0 ? "ZERO" : "KNOWN"
    : coverage === "PARTIAL" ? "INCOMPLETE" : coverage;
  return deepFreeze({
    stage,
    state,
    value: ["KNOWN", "ZERO", "INCOMPLETE"].includes(state) ? people.length : null,
    unit: "DISTINCT_COMMERCIAL_PERSON_COUNT",
    coverage,
    evidenceRefs: unique(stageFacts.flatMap(fact => fact.evidenceRefs)),
    sourceAuthorities: unique(stageFacts.map(fact => fact.sourceAuthority)),
  });
}

function transitionMetric(upstream, downstream, stages, facts) {
  const downstreamStage = stages[downstream];
  const upstreamStage = stages[upstream];
  const compatibleCoverage = downstreamStage.coverage === "COMPLETE" && upstreamStage.coverage === "COMPLETE";
  const identityAuthorities = unique(facts
    .filter(fact => fact.stage === upstream || fact.stage === downstream)
    .map(fact => fact.identityAuthority));
  const compatibleIdentity = identityAuthorities.length <= 1;
  const stageTimes = stage => facts
    .filter(fact => fact.stage === stage)
    .reduce((byPerson, fact) => {
      const current = byPerson.get(fact.commercialPersonReference);
      if (!current || fact.occurredAt < current) byPerson.set(fact.commercialPersonReference, fact.occurredAt);
      return byPerson;
    }, new Map());
  const upstreamTimes = stageTimes(upstream);
  const downstreamTimes = stageTimes(downstream);
  const matchedPeople = [...downstreamTimes].filter(([person, occurredAt]) => {
    const upstreamAt = upstreamTimes.get(person);
    return upstreamAt && occurredAt >= upstreamAt;
  });
  if (!compatibleCoverage || !compatibleIdentity) {
    return deepFreeze({
      transition: `${upstream}_TO_${downstream}`,
      state: compatibleIdentity ? "INCOMPLETE" : "NOT_COMPARABLE",
      numerator: null,
      denominator: upstreamStage.value,
      value: null,
      unit: "RATIO",
      limitation: compatibleIdentity
        ? "La cobertura de una o ambas etapas no es completa."
        : "Las etapas no comparten una autoridad de identidad compatible.",
    });
  }
  if (upstreamStage.value === 0) {
    return deepFreeze({
      transition: `${upstream}_TO_${downstream}`,
      state: "UNKNOWN",
      numerator: matchedPeople.length,
      denominator: 0,
      value: null,
      unit: "RATIO",
      limitation: "No existe denominador observado para este periodo.",
    });
  }
  return deepFreeze({
    transition: `${upstream}_TO_${downstream}`,
    state: "KNOWN",
    numerator: matchedPeople.length,
    denominator: upstreamStage.value,
    value: matchedPeople.length / upstreamStage.value,
    unit: "RATIO",
    limitation: "Asociación descriptiva de etapa; no demuestra causalidad ni calidad comercial.",
  });
}

function createCommercialFunnelReconciliationReadModel(input = {}) {
  const advisorId = required(input.advisorId, "COMMERCIAL_FUNNEL_ADVISOR_REQUIRED");
  const period = normalizePeriod(input.period);
  const coverage = normalizeCoverage(input.coverageByStage);
  const rawFacts = Array.isArray(input.facts) ? input.facts : [];
  const rawReferences = rawFacts.map(fact => fact?.factReference).filter(Boolean);
  if (new Set(rawReferences).size !== rawReferences.length) fail("COMMERCIAL_FUNNEL_FACT_REFERENCE_DUPLICATED");
  const facts = rawFacts.flatMap(fact => normalizeFact(fact, advisorId, period));

  const stages = Object.fromEntries(STAGES.map(stage => [stage, stageMetric(stage, facts, coverage[stage])]));
  const transitions = TRANSITIONS.map(([upstream, downstream]) => transitionMetric(upstream, downstream, stages, facts));
  const incompleteStages = STAGES.filter(stage => coverage[stage] !== "COMPLETE");

  return deepFreeze({
    schema: "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B",
    advisorId,
    period,
    generatedAt: validInstant(input.generatedAt || new Date().toISOString(), "COMMERCIAL_FUNNEL_GENERATED_AT_INVALID"),
    stages,
    transitions,
    facts,
    incompleteStages,
    baselineState: incompleteStages.length ? "PARTIAL" : "READY",
    outputPerHour: { state: "NOT_MEASURABLE", value: null, unit: null },
    globalProductivityScoreCreated: false,
    sourceTruthCreated: false,
    persistencePerformed: false,
    causalAttributionCreated: false,
    humanJudgmentRequired: true,
  });
}

function compareCommercialFunnelPeriods({ baseline, current } = {}) {
  if (baseline?.schema !== "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B"
    || current?.schema !== "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B") {
    fail("COMMERCIAL_FUNNEL_COMPARISON_MODELS_REQUIRED");
  }
  if (baseline.advisorId !== current.advisorId) fail("COMMERCIAL_FUNNEL_COMPARISON_ADVISOR_MISMATCH");
  const transitions = Object.fromEntries(current.transitions.map(metric => {
    const previous = baseline.transitions.find(item => item.transition === metric.transition);
    const comparable = previous?.state === "KNOWN" && metric.state === "KNOWN";
    return [metric.transition, deepFreeze({
      state: comparable ? "KNOWN" : "NOT_COMPARABLE",
      baseline: comparable ? previous.value : null,
      current: comparable ? metric.value : null,
      change: comparable ? metric.value - previous.value : null,
      unit: "RATIO_POINT_CHANGE",
      causalClaim: false,
    })];
  }));
  return deepFreeze({
    schema: "COMMERCIAL_FUNNEL_PERIOD_COMPARISON_017B",
    advisorId: current.advisorId,
    baselinePeriod: baseline.period,
    currentPeriod: current.period,
    transitions,
    causalAttributionCreated: false,
    forgeUpliftClaimCreated: false,
    humanReviewRequired: true,
  });
}

module.exports = {
  STAGES,
  EVENT_STAGE_RULES,
  TRANSITIONS,
  createCommercialFunnelReconciliationReadModel,
  compareCommercialFunnelPeriods,
};
