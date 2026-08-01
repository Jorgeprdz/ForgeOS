const assert = require("assert");
const {
  calculateAdvisorActivityRequirement,
  ADVISOR_ACTIVITY_REQUIREMENT_STATUSES
} = require("../forecast/advisor-activity-requirement-engine");
const { composeAdvisorForecastV3 } = require("../forecast/advisor-forecast-composer-v3");
const { buildAdvisorForecastReadModelV3 } = require("../forecast/advisor-forecast-read-model-v3");
const {
  createAdvisorForecastIssuedSnapshot,
  verifyAdvisorForecastIssuedSnapshot,
  reconcileAdvisorForecastActual,
  buildAdvisorForecastReconciliationReport,
  ADVISOR_FORECAST_RECONCILIATION_STATUSES
} = require("../forecast/advisor-forecast-reconciliation-engine");

console.log("\nADVISOR FORECAST STAGES 11-13 TEST\n");

function rate(value, id, overrides = {}) {
  return {
    value,
    numerator: Math.round(value * 40),
    denominator: 40,
    evidenceRefs: [`${id}-ref`],
    sourceEvidenceIds: [`${id}-source`],
    sourceOwners: ["MANAGER_OS"],
    freshness: { status: "FRESH" },
    ...overrides
  };
}

function conversions(overrides = {}) {
  return {
    contactToAppointment: rate(0.2, "contact-appointment"),
    appointmentToPresentation: rate(0.75, "appointment-presentation"),
    presentationToApplication: rate(0.5, "presentation-application"),
    applicationToPolicy: rate(0.5, "application-policy"),
    ...overrides
  };
}

function goalGap(overrides = {}) {
  return {
    remainingAfterWeightedPipeline: 2.3,
    needsActivityRequirementModel: true,
    ...overrides
  };
}

function evidence(owner, id) {
  return {
    evidenceRefs: [`${id}-ref`],
    sourceEvidenceIds: [`${id}-source`],
    sourceOwners: [owner],
    freshness: { status: "FRESH" },
    generatedAt: "2026-08-10T16:00:00.000Z"
  };
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
    opportunities: [
      {
        advisorId: "advisor-1",
        opportunityId: "O-1",
        stage: "APPLICATION",
        evidenceRef: "o1",
        signals: [{ code: "EXPLICIT_BUYING_INTENT", evidenceRef: "intent-ref" }]
      },
      {
        advisorId: "advisor-1",
        opportunityId: "O-2",
        stage: "QUOTE_PRESENTED",
        evidenceRef: "o2",
        signals: [{ code: "QUOTE_PRESENTED", evidenceRef: "quote-ref" }]
      }
    ],
    activityReportResult: { report: { totals: { activityCount: 8 }, evidenceRefs: ["activity-ref"] }, chartReady: {} },
    advisorMetricsContext: {
      advisorMetrics: {
        appointmentContext: { count: 3 },
        followupSignalCount: 5,
        prospectingSignalCount: 6,
        referralSignalCount: 2
      },
      evidenceRefs: ["metrics-ref"],
      sourceEvidenceIds: ["metrics-source"],
      sourceOwners: ["MANAGER_OS"],
      freshness: { status: "FRESH" }
    },
    advisorHistoricalContext: {
      advisorHistoricalAnalytics: { activityTrendContext: { points: [{ value: 7 }, { value: 8 }] } },
      evidenceRefs: ["historical-ref"],
      sourceEvidenceIds: ["historical-source"],
      sourceOwners: ["MANAGER_OS"],
      freshness: { status: "FRESH" }
    },
    advisorHistoricalConversions: conversions(),
    sourceEvidence: {
      goal: evidence("ADVISOR_MONTHLY_POLICY_GOAL", "goal"),
      production: evidence("PRODUCTION_EVENTS", "production"),
      pipeline: evidence("PIPELINE", "pipeline"),
      activity: evidence("FES", "activity"),
      metrics: evidence("MANAGER_OS", "metrics"),
      historical: evidence("MANAGER_OS", "historical")
    },
    ...overrides
  };
}

function readModelV3(overrides = {}) {
  return {
    schema: "ADVISOR_FORECAST_READ_MODEL_V3",
    advisorId: "advisor-1",
    period: { yearMonth: "2026-08", start: "2026-08-01", end: "2026-08-31", timeZone: "America/Mexico_City" },
    periodLabel: "2026-08",
    generatedAt: "2026-08-10T16:00:00.000Z",
    state: "READY",
    confidence: "HIGH",
    healthStatus: "AT_RISK",
    target: 10,
    currentProduction: 2,
    paceProjection: 6.2,
    goalGap: {
      state: "PIPELINE_INSUFFICIENT",
      weightedPipelineContribution: 1.67,
      remainingAfterWeightedPipeline: 6.33
    },
    activityRequirement: {
      status: "READY",
      contactsRequired: 80,
      appointmentsRequired: 16,
      presentationsRequired: 12,
      applicationsRequired: 6,
      policiesRequired: 3
    },
    evidenceRefs: ["forecast-ref"],
    ...overrides
  };
}

const tests = [
  ["calculates reverse funnel requirements", () => {
    const result = calculateAdvisorActivityRequirement({
      goalGap: goalGap(),
      period: { yearMonth: "2026-08", end: "2026-08-31" },
      generatedAt: "2026-08-10T16:00:00.000Z",
      advisorHistoricalConversions: conversions()
    });
    assert.equal(result.requirementStatus, ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.READY);
    assert.deepEqual(
      [result.policiesRequired, result.applicationsRequired, result.presentationsRequired, result.appointmentsRequired, result.contactsRequired],
      [3, 6, 12, 16, 80]
    );
    assert.equal(result.confidence, "HIGH");
  }],
  ["prefers fresh advisor historical rates", () => {
    const result = calculateAdvisorActivityRequirement({
      goalGap: goalGap(),
      advisorHistoricalConversions: conversions(),
      governedBenchmarkConversions: conversions({ contactToAppointment: rate(0.5, "benchmark") })
    });
    assert.equal(result.selectedRates.contactToAppointment.authority, "ADVISOR_HISTORICAL_CONVERSION");
  }],
  ["uses recent fresh rate before stale historical rate", () => {
    const historical = conversions({ contactToAppointment: rate(0.2, "stale", { freshness: { status: "STALE" } }) });
    const recent = conversions({ contactToAppointment: rate(0.25, "recent") });
    const result = calculateAdvisorActivityRequirement({
      goalGap: goalGap(),
      advisorHistoricalConversions: historical,
      advisorRecentConversions: recent
    });
    assert.equal(result.selectedRates.contactToAppointment.authority, "ADVISOR_RECENT_CONVERSION");
    assert.equal(result.selectedRates.contactToAppointment.value, 0.25);
  }],
  ["uses governed benchmark only as fallback", () => {
    const missingHistorical = conversions({ contactToAppointment: { value: null } });
    const benchmark = conversions({ contactToAppointment: rate(0.1, "benchmark") });
    const result = calculateAdvisorActivityRequirement({
      goalGap: goalGap(),
      advisorHistoricalConversions: missingHistorical,
      governedBenchmarkConversions: benchmark
    });
    assert.equal(result.selectedRates.contactToAppointment.authority, "GOVERNED_CONVERSION_BENCHMARK");
    assert.equal(result.confidence, "LOW");
  }],
  ["missing conversion never becomes invented precision", () => {
    const incomplete = conversions();
    delete incomplete.applicationToPolicy;
    const result = calculateAdvisorActivityRequirement({ goalGap: goalGap(), advisorHistoricalConversions: incomplete });
    assert.equal(result.requirementStatus, ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.INSUFFICIENT_DATA);
    assert.ok(result.missingRates.includes("applicationToPolicy"));
    assert.equal(result.contactsRequired, null);
  }],
  ["covered goal needs no conversion model", () => {
    const result = calculateAdvisorActivityRequirement({ goalGap: goalGap({ remainingAfterWeightedPipeline: 0 }) });
    assert.equal(result.requirementStatus, ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.GOAL_COVERED);
    assert.equal(result.contactsRequired, 0);
  }],
  ["safety ceiling blocks extreme requirements", () => {
    const tiny = conversions({ contactToAppointment: rate(0.0001, "tiny") });
    const result = calculateAdvisorActivityRequirement({
      goalGap: goalGap({ remainingAfterWeightedPipeline: 20 }),
      advisorHistoricalConversions: tiny,
      maximumRequiredContacts: 1000
    });
    assert.equal(result.requirementStatus, ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.BLOCKED);
  }],
  ["activity engine does not mutate conversion inputs", () => {
    const context = conversions();
    const before = JSON.parse(JSON.stringify(context));
    calculateAdvisorActivityRequirement({ goalGap: goalGap(), advisorHistoricalConversions: context });
    assert.deepEqual(context, before);
  }],
  ["composer v3 exposes human-confirmed handoff availability", () => {
    const result = composeAdvisorForecastV3(source());
    assert.equal(result.schema, "ADVISOR_FORECAST_COMPOSER_V3");
    assert.equal(result.activityHandoffAvailability.requiresHumanConfirmation, true);
    assert.equal(result.automaticTaskCreationAllowed, false);
  }],
  ["read model v3 exposes bounded activity plan action", () => {
    const result = buildAdvisorForecastReadModelV3(source());
    assert.equal(result.schema, "ADVISOR_FORECAST_READ_MODEL_V3");
    assert.ok(result.actions.some((action) => action.destination === "ACTIVITY_FORECAST_PLAN"));
    assert.equal(result.activityHandoff.automaticSubmissionAllowed, false);
    assert.equal(result.calculationPerformedByReadModel, false);
  }],
  ["issued snapshot is immutable and verifiable", () => {
    const snapshot = createAdvisorForecastIssuedSnapshot({ readModel: readModelV3() });
    assert.equal(verifyAdvisorForecastIssuedSnapshot(snapshot), true);
    assert.equal(snapshot.immutable, true);
    const mutated = { ...snapshot, paceProjection: 99 };
    assert.equal(verifyAdvisorForecastIssuedSnapshot(mutated), false);
  }],
  ["reconciles pace and weighted pipeline separately", () => {
    const snapshot = createAdvisorForecastIssuedSnapshot({ readModel: readModelV3() });
    const result = reconcileAdvisorForecastActual({
      issuedSnapshot: snapshot,
      reconciledAt: "2026-09-02T12:00:00.000Z",
      policyFacts: [
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P1", yearMonth: "2026-08", evidenceRef: "p1" },
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P2", yearMonth: "2026-08", evidenceRef: "p2" },
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P3", yearMonth: "2026-08", evidenceRef: "p3" },
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P4", yearMonth: "2026-08", evidenceRef: "p4" },
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P5", yearMonth: "2026-08", evidenceRef: "p5" },
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P5", yearMonth: "2026-08", evidenceRef: "p5-duplicate" }
      ]
    });
    assert.equal(result.reconciliationStatus, ADVISOR_FORECAST_RECONCILIATION_STATUSES.READY);
    assert.equal(result.finalActualProduction, 5);
    assert.equal(result.paceAbsoluteError, 1.2);
    assert.equal(result.paceBias, "OPTIMISTIC");
    assert.equal(result.weightedPipelineBias, "CONSERVATIVE");
    assert.equal(result.forecastSnapshotPreserved, true);
  }],
  ["open period does not finalize accuracy", () => {
    const snapshot = createAdvisorForecastIssuedSnapshot({ readModel: readModelV3() });
    const result = reconcileAdvisorForecastActual({ issuedSnapshot: snapshot, policyFacts: [], reconciledAt: "2026-08-20T12:00:00.000Z" });
    assert.equal(result.reconciliationStatus, ADVISOR_FORECAST_RECONCILIATION_STATUSES.OPEN_PERIOD);
    assert.equal(result.finalActualProduction, null);
  }],
  ["zero actual requires direct evidence", () => {
    const snapshot = createAdvisorForecastIssuedSnapshot({ readModel: readModelV3() });
    const missing = reconcileAdvisorForecastActual({
      issuedSnapshot: snapshot,
      policyFacts: [],
      reconciledAt: "2026-09-02T12:00:00.000Z"
    });
    assert.equal(missing.reconciliationStatus, ADVISOR_FORECAST_RECONCILIATION_STATUSES.INSUFFICIENT_DATA);
    const evidenced = reconcileAdvisorForecastActual({
      issuedSnapshot: snapshot,
      policyFacts: [],
      actualEvidence: { evidenceRef: "zero-confirmed-ref", sourceOwner: "PRODUCTION_EVENTS" },
      reconciledAt: "2026-09-02T12:00:00.000Z"
    });
    assert.equal(evidenced.reconciliationStatus, ADVISOR_FORECAST_RECONCILIATION_STATUSES.READY);
    assert.equal(evidenced.finalActualProduction, 0);
  }],
  ["cross-advisor actual data is blocked", () => {
    const snapshot = createAdvisorForecastIssuedSnapshot({ readModel: readModelV3() });
    const result = reconcileAdvisorForecastActual({
      issuedSnapshot: snapshot,
      reconciledAt: "2026-09-02T12:00:00.000Z",
      policyFacts: [{ advisorId: "advisor-2", eventType: "POLICY_SOLD_CONFIRMED", policyId: "PX", yearMonth: "2026-08", evidenceRef: "px" }]
    });
    assert.equal(result.reconciliationStatus, ADVISOR_FORECAST_RECONCILIATION_STATUSES.BLOCKED);
  }],
  ["reports aggregate immutable reconciliations without owning truth", () => {
    const snapshot = createAdvisorForecastIssuedSnapshot({ readModel: readModelV3() });
    const first = reconcileAdvisorForecastActual({
      issuedSnapshot: snapshot,
      reconciledAt: "2026-09-02T12:00:00.000Z",
      policyFacts: [{ advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P1", yearMonth: "2026-08", evidenceRef: "p1" }]
    });
    const second = { ...first, paceAbsoluteError: 2, weightedPipelineAbsoluteError: 1, paceBias: "CONSERVATIVE" };
    const report = buildAdvisorForecastReconciliationReport({ reconciliations: [first, second] });
    assert.equal(report.reportStatus, "READY");
    assert.equal(report.periodCount, 2);
    assert.equal(report.reportOwnsForecastTruth, false);
    assert.equal(report.monetaryAccuracyCalculated, false);
  }],
  ["all write and automatic decision flags remain false", () => {
    const requirement = calculateAdvisorActivityRequirement({ goalGap: goalGap(), advisorHistoricalConversions: conversions() });
    const snapshot = createAdvisorForecastIssuedSnapshot({ readModel: readModelV3() });
    [requirement, snapshot].forEach((value) => {
      assert.equal(value.automaticDecisionAllowed, false);
      assert.equal(value.createsDatabaseWrite, false);
      assert.equal(value.createsRevenueTruth, false);
    });
  }]
];

let failed = 0;
for (const [name, run] of tests) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
