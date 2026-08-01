const assert = require("assert");
const { composeAdvisorForecastV1, calculatePaceProjection } = require("../forecast/advisor-forecast-composer");
const { buildAdvisorForecastExplanation } = require("../forecast/advisor-forecast-explanation-engine");
const { buildAdvisorForecastReadModel } = require("../forecast/advisor-forecast-read-model");

console.log("\nADVISOR FORECAST STAGES 3-5 TEST\n");

const ev = (owner, id) => ({ evidenceRefs: [`${id}-ref`], sourceEvidenceIds: [`${id}-source`], sourceOwners: [owner], freshness: { status: "FRESH" }, generatedAt: "2026-08-10T16:00:00.000Z" });
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
    opportunities: [
      { advisorId: "advisor-1", opportunityId: "O-1", evidenceRef: "o1" },
      { advisorId: "advisor-1", opportunityId: "O-2", evidenceRef: "o2" }
    ],
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
      goal: ev("ADVISOR_MONTHLY_POLICY_GOAL", "goal"), production: ev("PRODUCTION_EVENTS", "production"),
      pipeline: ev("PIPELINE", "pipeline"), activity: ev("FES", "activity"), metrics: ev("MANAGER_OS", "metrics"), historical: ev("MANAGER_OS", "historical")
    },
    ...overrides
  };
}

const tests = [
  ["pace projects confirmed production only", () => {
    const c = composeAdvisorForecastV1(source());
    assert.equal(c.paceProjection.currentProduction, 2);
    assert.equal(c.paceProjection.projectedPeriodClose, 6.2);
    assert.equal(c.paceProjection.createsRevenueTruth, false);
  }],
  ["composer exposes three protected scenarios", () => {
    const c = composeAdvisorForecastV1(source());
    assert.ok(c.scenarioContext.conservativeScenario);
    assert.ok(c.scenarioContext.baselineScenario);
    assert.ok(c.scenarioContext.stretchScenario);
  }],
  ["pipeline remains unweighted", () => {
    const c = composeAdvisorForecastV1(source());
    assert.equal(c.input.pipeline.details.probabilityWeightingApplied, false);
    assert.equal(c.input.pipeline.details.amountWeightingApplied, false);
  }],
  ["health reports behind when pace misses target", () => assert.equal(composeAdvisorForecastV1(source()).healthStatus, "BEHIND")],
  ["confidence becomes insufficient with missing core signals", () => {
    const c = composeAdvisorForecastV1(source({ opportunities: null, activityReportResult: null, advisorMetricsContext: null }));
    assert.equal(c.confidence, "INSUFFICIENT_DATA");
    assert.equal(c.composerStatus, "PARTIAL");
  }],
  ["explanation links target gap to evidence", () => {
    const c = composeAdvisorForecastV1(source());
    assert.match(c.explanation.primaryExplanation, /Faltan 8 pólizas/);
    assert.ok(c.explanation.evidenceRefs.length > 0);
    assert.equal(c.explanation.unsupportedClaimsCreated, false);
  }],
  ["missing information is explicit", () => {
    const c = composeAdvisorForecastV1(source({ opportunities: null }));
    assert.ok(c.explanation.missingInformation.some((entry) => entry.signal === "pipeline"));
  }],
  ["stale information is explicit", () => {
    const s = source(); s.sourceEvidence.activity.freshness = { status: "STALE" };
    const c = composeAdvisorForecastV1(s);
    assert.ok(c.explanation.staleInformation.some((entry) => entry.signal === "activity"));
  }],
  ["read model is calculation free", () => {
    const r = buildAdvisorForecastReadModel(source());
    assert.equal(r.schema, "ADVISOR_FORECAST_READ_MODEL_V1");
    assert.equal(r.calculationPerformedByReadModel, false);
    assert.equal(r.currentProduction, 2);
    assert.equal(r.target, 10);
    assert.equal(r.projectedCoverage, 20);
  }],
  ["read model offers bounded navigation", () => {
    const r = buildAdvisorForecastReadModel(source());
    assert.ok(r.actions.some((action) => action.destination === "PIPELINE_FORECAST_CONTEXT"));
    assert.ok(r.actions.length <= 3);
  }],
  ["read model preserves scenarios", () => {
    const r = buildAdvisorForecastReadModel(source());
    assert.equal(r.scenarios.baseline.pipelineForecastContext, 2);
    assert.equal(r.scenarios.baseline.productionContextForecast, 2);
  }],
  ["no writes or automatic decisions", () => {
    const c = composeAdvisorForecastV1(source());
    const r = buildAdvisorForecastReadModel(c);
    [c, r].forEach((value) => {
      assert.equal(value.automaticDecisionAllowed, false);
      assert.equal(value.createsRevenueTruth, false);
      assert.equal(value.createsDatabaseWrite, false);
      assert.equal(value.sourceMutationPerformed, false);
      assert.equal(value.uiMutationPerformed, false);
    });
  }],
  ["composer does not mutate sources", () => {
    const s = source(); const before = JSON.parse(JSON.stringify(s)); composeAdvisorForecastV1(s); assert.deepEqual(s, before);
  }],
  ["pace rejects missing period context", () => {
    const p = calculatePaceProjection({ production: { state: "KNOWN", value: 2 }, period: {}, generatedAt: null });
    assert.equal(p.status, "INSUFFICIENT_DATA");
  }],
  ["explanation engine accepts normalized input directly", () => {
    const c = composeAdvisorForecastV1(source());
    const e = buildAdvisorForecastExplanation({ input: c.input, paceProjection: c.paceProjection, forecastContext: c });
    assert.ok(e.primaryExplanation);
  }]
];

let failed = 0;
for (const [name, run] of tests) {
  try { run(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error); }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
