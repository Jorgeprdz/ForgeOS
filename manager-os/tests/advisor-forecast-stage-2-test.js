const assert = require("assert");
const { normalizeAdvisorForecastInput } = require("../forecast/advisor-forecast-normalizer");

console.log("\nADVISOR FORECAST STAGE 2 TEST\n");

const ev = (owner, id) => ({ evidenceRefs: [`${id}-ref`], sourceEvidenceIds: [`${id}-source`], sourceOwners: [owner], freshness: { status: "FRESH" }, generatedAt: "2026-08-01T16:00:00.000Z" });
function sources(overrides = {}) {
  return {
    advisorId: "advisor-1",
    now: "2026-08-01T16:00:00.000Z",
    period: { yearMonth: "2026-08" },
    goalSnapshot: { advisorId: "advisor-1", yearMonth: "2026-08", targetPolicyCount: 10, evidenceRef: "goal-ref" },
    policyFacts: [
      { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-1", yearMonth: "2026-08", evidenceRef: "p1" },
      { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-1", yearMonth: "2026-08", evidenceRef: "p1-dup" },
      { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-2", yearMonth: "2026-08", evidenceRef: "p2" },
      { advisorId: "advisor-1", eventType: "QUOTE_PRESENTED", policyId: "Q-1", yearMonth: "2026-08", evidenceRef: "q1" }
    ],
    opportunities: [
      { advisorId: "advisor-1", opportunityId: "O-1", evidenceRef: "o1" },
      { advisorId: "advisor-1", opportunityId: "O-2", evidenceRef: "o2" },
      { advisorId: "advisor-1", opportunityId: "O-3", archived: true, evidenceRef: "o3" }
    ],
    activityReportResult: { report: { totals: { activityCount: 8 }, evidenceRefs: ["activity-ref"] }, chartReady: {} },
    advisorMetricsContext: {
      advisorMetrics: { appointmentContext: { count: 3 }, followupSignalCount: 5, prospectingSignalCount: 6, referralSignalCount: 2 },
      evidenceRefs: ["metrics-ref"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" }
    },
    advisorHistoricalContext: {
      advisorHistoricalAnalytics: { activityTrendContext: { points: [{ value: 7 }, { value: 8 }] } },
      evidenceRefs: ["historical-ref"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" }
    },
    sourceEvidence: {
      goal: ev("ADVISOR_MONTHLY_POLICY_GOAL", "goal"), production: ev("PRODUCTION_EVENTS", "production"),
      pipeline: ev("PIPELINE", "pipeline"), activity: ev("FES", "activity"), metrics: ev("MANAGER_OS", "metrics"), historical: ev("MANAGER_OS", "historical")
    },
    ...overrides
  };
}

const tests = [
  ["target normalized", () => assert.equal(normalizeAdvisorForecastInput(sources()).input.target.value, 10)],
  ["unique confirmed production only", () => {
    const r = normalizeAdvisorForecastInput(sources());
    assert.equal(r.input.production.value, 2);
    assert.deepEqual(r.input.production.details.policyIds.sort(), ["P-1", "P-2"]);
    assert.equal(r.normalization.revenueTruthCreated, false);
  }],
  ["quote excluded", () => assert.equal(normalizeAdvisorForecastInput(sources()).input.production.value, 2)],
  ["active pipeline unweighted", () => {
    const r = normalizeAdvisorForecastInput(sources());
    assert.equal(r.input.pipeline.value, 2);
    assert.equal(r.input.pipeline.details.probabilityWeightingApplied, false);
    assert.equal(r.input.pipeline.details.amountWeightingApplied, false);
  }],
  ["activity and metrics normalized", () => {
    const x = normalizeAdvisorForecastInput(sources()).input;
    assert.deepEqual([x.activity.value, x.appointments.value, x.followups.value, x.prospecting.value, x.referrals.value], [8, 3, 5, 6, 2]);
  }],
  ["missing remains missing", () => {
    const x = normalizeAdvisorForecastInput(sources({ opportunities: null, activityReportResult: null })).input;
    assert.deepEqual([x.pipeline.state, x.activity.state], ["MISSING", "MISSING"]);
  }],
  ["zero without evidence unknown", () => {
    const s = sources({ opportunities: [] }); s.sourceEvidence.pipeline = {};
    assert.equal(normalizeAdvisorForecastInput(s).input.pipeline.state, "UNKNOWN");
  }],
  ["zero with evidence explicit", () => assert.equal(normalizeAdvisorForecastInput(sources({ opportunities: [] })).input.pipeline.state, "ZERO")],
  ["stale propagated", () => {
    const s = sources(); s.sourceEvidence.activity.freshness = { status: "STALE" };
    const x = normalizeAdvisorForecastInput(s).input.activity;
    assert.deepEqual([x.state, x.value], ["STALE", 8]);
  }],
  ["cross-advisor production blocked", () => {
    const s = sources(); s.policyFacts.push({ advisorId: "advisor-2", eventType: "POLICY_SOLD_CONFIRMED", policyId: "PX", yearMonth: "2026-08" });
    assert.throws(() => normalizeAdvisorForecastInput(s), /cross-advisor/);
  }],
  ["cross-advisor pipeline blocked", () => {
    const s = sources(); s.opportunities.push({ advisorId: "advisor-2", opportunityId: "OX" });
    assert.throws(() => normalizeAdvisorForecastInput(s), /cross-advisor/);
  }],
  ["sources not mutated", () => {
    const s = sources(); const original = JSON.parse(JSON.stringify(s)); normalizeAdvisorForecastInput(s); assert.deepEqual(s, original);
  }],
  ["Mexico City period", () => {
    const p = normalizeAdvisorForecastInput(sources()).input.period;
    assert.deepEqual([p.timeZone, p.start, p.end], ["America/Mexico_City", "2026-08-01", "2026-08-31"]);
  }]
];

let failed = 0;
for (const [name, run] of tests) {
  try { run(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error); }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
