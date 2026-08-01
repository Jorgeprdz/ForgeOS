const assert = require("assert");
const {
  weightAdvisorOpportunities,
  ADVISOR_OPPORTUNITY_CLASSIFICATIONS
} = require("../forecast/advisor-opportunity-weighting-engine");
const {
  calculateAdvisorGoalGap,
  ADVISOR_GOAL_GAP_STATES
} = require("../forecast/advisor-goal-gap-engine");
const { composeAdvisorForecastV2 } = require("../forecast/advisor-forecast-composer-v2");
const { buildAdvisorForecastReadModelV2 } = require("../forecast/advisor-forecast-read-model-v2");

console.log("\nADVISOR FORECAST STAGES 9-10 TEST\n");

const ev = (owner, id) => ({ evidenceRefs: [`${id}-ref`], sourceEvidenceIds: [`${id}-source`], sourceOwners: [owner], freshness: { status: "FRESH" }, generatedAt: "2026-08-10T16:00:00.000Z" });

function opportunities() {
  return [
    {
      advisorId: "advisor-1",
      opportunityId: "O-APP",
      stage: "APPLICATION",
      amount: 50000,
      evidenceRef: "o-app",
      signals: [{ code: "EXPLICIT_BUYING_INTENT", evidenceRef: "intent", occurredAt: "2026-08-09T10:00:00.000Z" }]
    },
    {
      advisorId: "advisor-1",
      opportunityId: "O-QUOTE",
      stage: "QUOTE_PRESENTED",
      evidenceRef: "o-quote",
      signals: [{ code: "BUDGET_CONFIRMED", evidenceRef: "budget", occurredAt: "2026-08-08T10:00:00.000Z" }]
    },
    {
      advisorId: "advisor-1",
      opportunityId: "O-RISK",
      stage: "CONTACTED",
      evidenceRef: "o-risk",
      signals: [{ code: "FOLLOW_UP_OVERDUE", evidenceRef: "overdue", occurredAt: "2026-08-01T10:00:00.000Z" }]
    }
  ];
}

function source(overrides = {}) {
  return {
    advisorId: "advisor-1",
    now: "2026-08-10T16:00:00.000Z",
    period: { yearMonth: "2026-08" },
    goalSnapshot: { advisorId: "advisor-1", yearMonth: "2026-08", targetPolicyCount: 10, evidenceRef: "goal-ref" },
    policyFacts: [
      { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-1", yearMonth: "2026-08", evidenceRef: "p1" },
      { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-2", yearMonth: "2026-08", evidenceRef: "p2" }
    ],
    opportunities: opportunities(),
    activityReportResult: { report: { totals: { activityCount: 8 }, evidenceRefs: ["activity-ref"] }, chartReady: {} },
    advisorMetricsContext: {
      advisorMetrics: { appointmentContext: { count: 3 }, followupSignalCount: 5, prospectingSignalCount: 6, referralSignalCount: 2 },
      evidenceRefs: ["metrics-ref"], sourceEvidenceIds: ["metrics-source"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" }
    },
    advisorHistoricalContext: {
      advisorHistoricalAnalytics: { activityTrendContext: { points: [{ value: 7 }, { value: 8 }] } },
      evidenceRefs: ["historical-ref"], sourceEvidenceIds: ["historical-source"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" }
    },
    sourceEvidence: {
      goal: ev("ADVISOR_MONTHLY_POLICY_GOAL", "goal"),
      production: ev("PRODUCTION_EVENTS", "production"),
      pipeline: ev("PIPELINE", "pipeline"),
      activity: ev("FES", "activity"),
      metrics: ev("MANAGER_OS", "metrics"),
      historical: ev("MANAGER_OS", "historical")
    },
    ...overrides
  };
}

function signal(state, value) { return { state, value, unit: "policies" }; }

const tests = [
  ["weights evidence-backed opportunities", () => {
    const result = weightAdvisorOpportunities({ advisorId: "advisor-1", opportunities: opportunities(), sourceEvidence: ev("PIPELINE", "pipeline") });
    assert.equal(result.weightingStatus, "READY");
    assert.equal(result.activeOpportunityCount, 3);
    assert.equal(result.weightedPolicyContribution, 1.67);
  }],
  ["classifies committed probable and at risk", () => {
    const result = weightAdvisorOpportunities({ advisorId: "advisor-1", opportunities: opportunities(), sourceEvidence: ev("PIPELINE", "pipeline") });
    assert.equal(result.classificationCounts[ADVISOR_OPPORTUNITY_CLASSIFICATIONS.COMMITTED], 1);
    assert.equal(result.classificationCounts[ADVISOR_OPPORTUNITY_CLASSIFICATIONS.PROBABLE], 1);
    assert.equal(result.classificationCounts[ADVISOR_OPPORTUNITY_CLASSIFICATIONS.AT_RISK], 1);
  }],
  ["does not weight amount", () => {
    const result = weightAdvisorOpportunities({ advisorId: "advisor-1", opportunities: opportunities(), sourceEvidence: ev("PIPELINE", "pipeline") });
    assert.equal(result.amountWeightingApplied, false);
    assert.equal(result.topContributors[0].weightedAmount, null);
    assert.equal(result.createsRevenueTruth, false);
  }],
  ["unknown opportunity remains unknown without evidence", () => {
    const result = weightAdvisorOpportunities({ advisorId: "advisor-1", opportunities: [{ advisorId: "advisor-1", opportunityId: "O-X", stage: "PRESENTATION" }] });
    assert.equal(result.opportunities[0].classification, "UNKNOWN");
    assert.equal(result.opportunities[0].probability, null);
    assert.equal(result.weightingStatus, "MISSING_EVIDENCE");
  }],
  ["closed opportunities are excluded", () => {
    const result = weightAdvisorOpportunities({ advisorId: "advisor-1", opportunities: [{ advisorId: "advisor-1", opportunityId: "O-WON", status: "CLOSED_WON", evidenceRef: "won" }] });
    assert.equal(result.activeOpportunityCount, 0);
    assert.equal(result.opportunities[0].included, false);
  }],
  ["cross advisor opportunity is blocked", () => {
    assert.throws(() => weightAdvisorOpportunities({ advisorId: "advisor-1", opportunities: [{ advisorId: "advisor-2", opportunityId: "O-X" }] }), /cross-advisor/);
  }],
  ["weighting does not mutate sources", () => {
    const input = opportunities(); const before = JSON.parse(JSON.stringify(input));
    weightAdvisorOpportunities({ advisorId: "advisor-1", opportunities: input, sourceEvidence: ev("PIPELINE", "pipeline") });
    assert.deepEqual(input, before);
  }],
  ["goal covered state", () => {
    const result = calculateAdvisorGoalGap({ targetSignal: signal("KNOWN", 2), productionSignal: signal("KNOWN", 2) });
    assert.equal(result.gapStatus, ADVISOR_GOAL_GAP_STATES.GOAL_COVERED);
    assert.equal(result.confirmedGap, 0);
  }],
  ["pace sufficient state", () => {
    const result = calculateAdvisorGoalGap({ targetSignal: signal("KNOWN", 10), productionSignal: signal("KNOWN", 2), paceProjection: { projectedPeriodClose: 11 } });
    assert.equal(result.gapStatus, ADVISOR_GOAL_GAP_STATES.PACE_SUFFICIENT);
  }],
  ["pipeline sufficient state", () => {
    const result = calculateAdvisorGoalGap({
      targetSignal: signal("KNOWN", 3), productionSignal: signal("KNOWN", 2),
      paceProjection: { projectedPeriodClose: 2.5 },
      opportunityWeighting: { weightedPolicyContribution: 1.2 }
    });
    assert.equal(result.gapStatus, ADVISOR_GOAL_GAP_STATES.PIPELINE_SUFFICIENT);
    assert.equal(result.remainingAfterWeightedPipeline, 0);
  }],
  ["pipeline insufficient state", () => {
    const result = calculateAdvisorGoalGap({
      targetSignal: signal("KNOWN", 10), productionSignal: signal("KNOWN", 2),
      paceProjection: { projectedPeriodClose: 6.2 },
      opportunityWeighting: { weightedPolicyContribution: 1.67 },
      activitySignal: { state: "KNOWN", value: 8 }
    });
    assert.equal(result.gapStatus, ADVISOR_GOAL_GAP_STATES.PIPELINE_INSUFFICIENT);
    assert.equal(result.remainingAfterWeightedPipeline, 6.33);
  }],
  ["zero activity can surface activity insufficient", () => {
    const result = calculateAdvisorGoalGap({
      targetSignal: signal("KNOWN", 10), productionSignal: signal("KNOWN", 2),
      paceProjection: { projectedPeriodClose: 3 },
      opportunityWeighting: { weightedPolicyContribution: 1 },
      activitySignal: { state: "ZERO", value: 0 }
    });
    assert.equal(result.gapStatus, ADVISOR_GOAL_GAP_STATES.ACTIVITY_INSUFFICIENT);
  }],
  ["missing target remains insufficient", () => {
    const result = calculateAdvisorGoalGap({ productionSignal: signal("KNOWN", 2) });
    assert.equal(result.gapStatus, ADVISOR_GOAL_GAP_STATES.DATA_INSUFFICIENT);
    assert.ok(result.missingContext.includes("target"));
  }],
  ["composer v2 keeps pace and weighting separate", () => {
    const result = composeAdvisorForecastV2(source());
    assert.equal(result.schema, "ADVISOR_FORECAST_COMPOSER_V2");
    assert.equal(result.baseForecast.paceProjection.projectedPeriodClose, 6.2);
    assert.equal(result.opportunityWeighting.weightedPolicyContribution, 1.67);
    assert.equal(result.goalGap.pipelineExpectedClose, 3.67);
  }],
  ["composer v2 does not create money forecast", () => {
    const result = composeAdvisorForecastV2(source());
    assert.equal(result.opportunityWeighting.amountWeightingApplied, false);
    assert.equal(result.createsRevenueTruth, false);
    assert.equal(result.createsDatabaseWrite, false);
  }],
  ["read model v2 exposes goal gap and contributors", () => {
    const result = buildAdvisorForecastReadModelV2(source());
    assert.equal(result.schema, "ADVISOR_FORECAST_READ_MODEL_V2");
    assert.equal(result.goalGap.remainingAfterWeightedPipeline, 6.33);
    assert.equal(result.opportunityForecast.topContributors.length, 3);
    assert.equal(result.atRiskCount, 1);
  }],
  ["read model remains calculation free", () => {
    const result = buildAdvisorForecastReadModelV2(source());
    assert.equal(result.calculationPerformedByReadModel, false);
    assert.equal(result.automaticDecisionAllowed, false);
    assert.equal(result.sourceMutationPerformed, false);
  }],
  ["read model offers risk navigation", () => {
    const result = buildAdvisorForecastReadModelV2(source());
    assert.ok(result.actions.some((action) => action.destination === "PIPELINE_AT_RISK"));
    assert.ok(result.actions.length <= 3);
  }],
  ["composer v2 does not mutate full source", () => {
    const input = source(); const before = JSON.parse(JSON.stringify(input));
    composeAdvisorForecastV2(input); assert.deepEqual(input, before);
  }]
];

let failed = 0;
for (const [name, run] of tests) {
  try { run(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error); }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
