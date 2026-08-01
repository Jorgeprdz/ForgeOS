const assert = require("assert");
const {
  createAdvisorForecastSignal,
  buildAdvisorForecastInput
} = require("../forecast/advisor-forecast-input-contract");
const {
  composeAdvisorForecast
} = require("../forecast/advisor-forecast-composer");
const {
  buildAdvisorForecastExplanation
} = require("../forecast/advisor-forecast-explanation-engine");
const {
  buildAdvisorForecastReadModel
} = require("../forecast/advisor-forecast-read-model");

console.log("\nADVISOR FORECAST STAGE 3 REAL ENGINE INTEGRATION TEST\n");

function signal(value, sourceAuthority, unit) {
  return createAdvisorForecastSignal({
    state: "KNOWN",
    value,
    unit,
    sourceAuthority,
    sourceOwner: sourceAuthority,
    evidenceRefs: [`${sourceAuthority}-ref`],
    sourceEvidenceIds: [`${sourceAuthority}-source`],
    freshness: { status: "FRESH" }
  });
}

const input = buildAdvisorForecastInput({
  advisorId: "advisor-integration-1",
  period: {
    yearMonth: "2026-08",
    start: "2026-08-01",
    end: "2026-08-31",
    timeZone: "America/Mexico_City"
  },
  target: signal(10, "ADVISOR_MONTHLY_POLICY_GOAL", "policies"),
  production: signal(2, "PRODUCTION_EVENTS", "policies"),
  pipeline: signal(5, "PIPELINE", "opportunities"),
  activity: signal(8, "FES", "events"),
  appointments: signal(3, "ADVISOR_MANAGER_SNAPSHOT", "appointments"),
  followups: signal(5, "ADVISOR_MANAGER_SNAPSHOT", "signals"),
  prospecting: signal(6, "ADVISOR_MANAGER_SNAPSHOT", "signals"),
  referrals: signal(2, "ADVISOR_MANAGER_SNAPSHOT", "signals"),
  historicalContext: createAdvisorForecastSignal({
    state: "KNOWN",
    value: {
      activityTrendContext: { points: [{ value: 7 }, { value: 8 }] },
      pipelineTrendContext: { points: [{ value: 4 }, { value: 5 }] },
      productionContextTrend: { points: [{ value: 1 }, { value: 2 }] }
    },
    unit: "context",
    sourceAuthority: "MANAGER_ADVISOR_HISTORICAL_ANALYTICS",
    sourceOwner: "MANAGER_OS",
    evidenceRefs: ["historical-ref"],
    sourceEvidenceIds: ["historical-source"],
    freshness: { status: "FRESH" }
  }),
  evidence: {
    evidenceRefs: ["integration-root-ref"],
    sourceEvidenceIds: ["integration-root-source"],
    sourceOwners: ["MANAGER_OS"]
  },
  freshness: { status: "FRESH" },
  generatedAt: "2026-08-10T18:00:00.000Z"
});

const composer = composeAdvisorForecast(input);
const explanation = buildAdvisorForecastExplanation(composer);
const readModel = buildAdvisorForecastReadModel(composer, explanation);

assert.equal(composer.contractVersion, "ADVISOR_FORECAST_COMPOSER_V1");
assert.ok(composer.protectedForecastContext.baselineScenario);
assert.ok(composer.forecastBoundary);
assert.notEqual(composer.managerForecastStatus, "BLOCKED");
assert.equal(composer.truthFlags.createsRevenueTruth, false);
assert.equal(explanation.automaticActionAllowed, false);
assert.equal(readModel.contractVersion, "ADVISOR_FORECAST_READ_MODEL_V1");
assert.equal(readModel.calculationPerformed, false);

console.log("PASS real Manager Advisor Forecast engine composed");
console.log("PASS explanation and read model generated");
