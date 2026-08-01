const assert = require("assert");
const {
  createAdvisorForecastSignal,
  buildAdvisorForecastInput
} = require("../forecast/advisor-forecast-input-contract");
const {
  composeAdvisorForecast,
  ADVISOR_FORECAST_STATUSES,
  ADVISOR_FORECAST_CONFIDENCE
} = require("../forecast/advisor-forecast-composer");
const {
  buildAdvisorForecastExplanation
} = require("../forecast/advisor-forecast-explanation-engine");
const {
  buildAdvisorForecastReadModel
} = require("../forecast/advisor-forecast-read-model");

console.log("\nADVISOR FORECAST STAGES 3-5 TEST\n");

function signal(value, sourceAuthority, unit = "count", state = null) {
  const resolved = state || (value === 0 ? "ZERO" : "KNOWN");
  return createAdvisorForecastSignal({
    state: resolved,
    value: ["MISSING", "UNKNOWN"].includes(resolved) ? null : value,
    unit,
    sourceAuthority,
    sourceOwner: sourceAuthority,
    evidenceRefs: [resolved === "ZERO" ? `${sourceAuthority}-zero-ref` : `${sourceAuthority}-ref`],
    sourceEvidenceIds: [`${sourceAuthority}-source`],
    freshness: { status: resolved === "STALE" ? "STALE" : "FRESH" }
  });
}
function missing(source) {
  return createAdvisorForecastSignal({
    state: "MISSING",
    sourceAuthority: source,
    uncertainty: ["missing"]
  });
}
function stubManagerForecast(input) {
  return {
    forecastStatus: "READY_FOR_MANAGER_REVIEW",
    advisorForecastContext: {
      conservativeScenario: {
        projectedContext: {
          pipelineForecastContext: input.advisorMetricsContext.advisorMetrics.pipelineContext?.count ?? "UNKNOWN"
        }
      },
      baselineScenario: {
        projectedContext: {
          productionContextForecast: input.advisorMetricsContext.advisorMetrics.productionContext?.count ?? "UNKNOWN"
        }
      },
      stretchScenario: { projectedContext: {} },
      referenceOnly: true,
      createsTruth: false
    },
    boundaryContext: { forecastBoundaryStatus: "READY_FOR_MANAGER_REVIEW" },
    evidenceRefs: input.sourceEvidence.evidenceRefs,
    sourceEvidenceIds: input.sourceEvidence.sourceEvidenceIds,
    sourceOwners: input.sourceEvidence.sourceOwners,
    assumptions: input.assumptions,
    confidenceLimitations: input.confidenceLimitations,
    warnings: [],
    automaticDecisionAllowed: false,
    createsRevenueTruth: false
  };
}
function input(overrides = {}) {
  const base = {
    advisorId: "advisor-1",
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
        activityTrendContext: {
          points: [{ value: 7 }, { value: 8 }]
        }
      },
      unit: "context",
      sourceAuthority: "MANAGER_ADVISOR_HISTORICAL_ANALYTICS",
      evidenceRefs: ["hist-ref"],
      sourceEvidenceIds: ["hist-source"]
    }),
    evidence: {
      evidenceRefs: ["root-ref"],
      sourceEvidenceIds: ["root-source"],
      sourceOwners: ["MANAGER_OS"]
    },
    freshness: { status: "FRESH" },
    generatedAt: "2026-08-10T18:00:00.000Z"
  };
  return buildAdvisorForecastInput({ ...base, ...overrides });
}
function compose(value = input()) {
  return composeAdvisorForecast(value, {
    managerForecastEngine: stubManagerForecast
  });
}

const tests = [
  ["Stage 3 linear pace projects confirmed policy count", () => {
    const result = compose();
    assert.equal(result.pace.elapsedDays, 10);
    assert.equal(result.pace.totalDays, 31);
    assert.equal(result.pace.baselineProjection, 6.2);
  }],
  ["Stage 3 scenarios use 0.8 1.0 1.2", () => {
    assert.deepEqual(compose().pace.scenarios, {
      conservative: 5,
      baseline: 6.2,
      stretch: 7.4
    });
  }],
  ["Stage 3 composes protected Manager forecast", () => {
    const result = compose();
    assert.equal(
      result.protectedForecastContext.baselineScenario.projectedContext.productionContextForecast,
      2
    );
    assert.equal(result.managerForecastStatus, "READY_FOR_MANAGER_REVIEW");
  }],
  ["Stage 3 does not create revenue or writes", () => {
    Object.values(compose().truthFlags).forEach((value) => assert.equal(value, false));
  }],
  ["Stage 3 below 80 percent is behind", () => {
    assert.equal(compose().forecastStatus, ADVISOR_FORECAST_STATUSES.BEHIND);
  }],
  ["Stage 3 on track when pace reaches target", () => {
    const value = input({
      production: signal(4, "PRODUCTION_EVENTS", "policies")
    });
    assert.equal(compose(value).forecastStatus, ADVISOR_FORECAST_STATUSES.ON_TRACK);
  }],
  ["Stage 3 at risk between 80 and 100 percent", () => {
    const value = input({
      production: signal(3, "PRODUCTION_EVENTS", "policies")
    });
    assert.equal(compose(value).forecastStatus, ADVISOR_FORECAST_STATUSES.AT_RISK);
  }],
  ["Stage 3 stale critical signal needs update", () => {
    const value = input({
      production: signal(2, "PRODUCTION_EVENTS", "policies", "STALE")
    });
    const result = compose(value);
    assert.equal(result.forecastStatus, ADVISOR_FORECAST_STATUSES.NEEDS_UPDATE);
    assert.equal(result.confidence, ADVISOR_FORECAST_CONFIDENCE.LOW);
  }],
  ["Stage 3 missing target is insufficient", () => {
    const result = compose(input({
      target: missing("ADVISOR_MONTHLY_POLICY_GOAL")
    }));
    assert.equal(result.forecastStatus, ADVISOR_FORECAST_STATUSES.INSUFFICIENT_DATA);
    assert.equal(result.confidence, ADVISOR_FORECAST_CONFIDENCE.INSUFFICIENT_DATA);
  }],
  ["Stage 3 does not mutate input", () => {
    const value = input();
    const original = JSON.parse(JSON.stringify(value));
    compose(value);
    assert.deepEqual(value, original);
  }],
  ["Stage 4 explains pace with evidence", () => {
    const result = buildAdvisorForecastExplanation(compose());
    assert.ok(result.primaryExplanation.includes("por debajo"));
    assert.ok(result.supportingSignals.some((entry) => entry.code === "CONFIRMED_POLICY_PACE"));
    assert.ok(result.evidenceRefs.includes("root-ref"));
  }],
  ["Stage 4 names unweighted pipeline honestly", () => {
    const result = buildAdvisorForecastExplanation(compose());
    const pipeline = result.supportingSignals.find((entry) => entry.code === "ACTIVE_PIPELINE_CONTEXT");
    assert.ok(pipeline.message.includes("no se ponderan por monto ni probabilidad"));
  }],
  ["Stage 4 missing signals become update attention", () => {
    const value = input({
      activity: missing("FES"),
      referrals: missing("ADVISOR_MANAGER_SNAPSHOT")
    });
    const result = buildAdvisorForecastExplanation(compose(value));
    assert.ok(result.missingInformation.includes("activity"));
    assert.ok(result.recommendedAttention.some((entry) => entry.actionId === "UPDATE_FORECAST_SOURCES"));
  }],
  ["Stage 4 stale signals are explicit", () => {
    const value = input({
      activity: signal(8, "FES", "events", "STALE")
    });
    const result = buildAdvisorForecastExplanation(compose(value));
    assert.ok(result.staleInformation.includes("activity"));
    assert.ok(result.riskSignals.some((entry) => entry.code === "STALE_SIGNALS"));
  }],
  ["Stage 4 never authorizes automatic action", () => {
    assert.equal(buildAdvisorForecastExplanation(compose()).automaticActionAllowed, false);
  }],
  ["Stage 4 recommendations are bounded to three", () => {
    assert.ok(buildAdvisorForecastExplanation(compose()).recommendedAttention.length <= 3);
  }],
  ["Stage 5 maps values without new business calculation", () => {
    const composer = compose();
    const explanation = buildAdvisorForecastExplanation(composer);
    const readModel = buildAdvisorForecastReadModel(composer, explanation);
    assert.equal(readModel.paceProjection.value, composer.pace.baselineProjection);
    assert.equal(readModel.projectedCoverage.value, composer.projectedCoveragePercent);
    assert.equal(readModel.calculationPerformed, false);
  }],
  ["Stage 5 ready read model", () => {
    const composer = compose();
    assert.equal(
      buildAdvisorForecastReadModel(composer, buildAdvisorForecastExplanation(composer)).state,
      "READY"
    );
  }],
  ["Stage 5 stale read model", () => {
    const composer = compose(input({
      production: signal(2, "PRODUCTION_EVENTS", "policies", "STALE")
    }));
    assert.equal(
      buildAdvisorForecastReadModel(composer, buildAdvisorForecastExplanation(composer)).state,
      "STALE"
    );
  }],
  ["Stage 5 missing data read model", () => {
    const composer = compose(input({
      target: missing("ADVISOR_MONTHLY_POLICY_GOAL")
    }));
    assert.equal(
      buildAdvisorForecastReadModel(composer, buildAdvisorForecastExplanation(composer)).state,
      "MISSING_DATA"
    );
  }],
  ["Stage 5 preserves action intents without navigation implementation", () => {
    const composer = compose();
    const readModel = buildAdvisorForecastReadModel(
      composer,
      buildAdvisorForecastExplanation(composer)
    );
    assert.ok(readModel.availableActions.every((action) => action.requiresHumanAction === true));
    assert.ok(readModel.availableActions.every((action) => !Object.prototype.hasOwnProperty.call(action, "href")));
  }],
  ["Stage 5 advisor mismatch blocked", () => {
    const composer = compose();
    const explanation = {
      ...buildAdvisorForecastExplanation(composer),
      advisorId: "advisor-2"
    };
    assert.throws(
      () => buildAdvisorForecastReadModel(composer, explanation),
      /mismatch/
    );
  }],
  ["Stage 5 output immutable", () => {
    const composer = compose();
    const readModel = buildAdvisorForecastReadModel(
      composer,
      buildAdvisorForecastExplanation(composer)
    );
    assert.ok(Object.isFrozen(readModel));
    assert.ok(Object.isFrozen(readModel.scenarios));
  }],
  ["No opportunity weighting introduced", () => {
    const composer = compose();
    assert.ok(
      !composer.operationalContext.pipeline.details ||
      composer.operationalContext.pipeline.details.probabilityWeightingApplied !== true
    );
    assert.ok(composer.warnings.some((warning) => warning.includes("does not weight opportunities")));
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
