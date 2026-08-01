const { composeAdvisorForecastV1 } = require("./advisor-forecast-composer");

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function knownValue(signal) { return signal && ["KNOWN", "ZERO", "STALE"].includes(signal.state) ? signal.value : null; }

function scenarioProjected(composed, scenarioName) {
  return composed?.scenarioContext?.[scenarioName]?.projectedContext || null;
}

function availableActions(composed) {
  const actions = [{ type: "NAVIGATE", label: "Abrir Forecast", destination: "ADVISOR_FORECAST_DETAIL" }];
  const pipeline = composed.input?.pipeline;
  if (typeof knownValue(pipeline) === "number" && knownValue(pipeline) > 0) {
    actions.push({ type: "NAVIGATE", label: "Ver oportunidades", destination: "PIPELINE_FORECAST_CONTEXT" });
  }
  if (composed.explanation?.missingInformation?.length || composed.explanation?.staleInformation?.length) {
    actions.push({ type: "REVIEW_SOURCE_CONTEXT", label: "Actualizar datos", destination: "FORECAST_SOURCE_REVIEW" });
  }
  return actions.slice(0, 3);
}

function buildAdvisorForecastReadModel(input = {}) {
  const composed = input.composerStatus ? clone(input) : composeAdvisorForecastV1(input);
  const target = knownValue(composed.input?.target);
  const production = knownValue(composed.input?.production);
  const pace = composed.paceProjection?.projectedPeriodClose ?? null;
  const coverage = typeof target === "number" && target > 0 && typeof production === "number"
    ? Math.round((production / target) * 100)
    : null;

  const readModel = {
    schema: "ADVISOR_FORECAST_READ_MODEL_V1",
    advisorId: composed.advisorId,
    period: clone(composed.period),
    periodLabel: composed.period?.yearMonth || null,
    generatedAt: composed.generatedAt,
    state: composed.composerStatus === "BLOCKED"
      ? "BLOCKED"
      : composed.confidence === "INSUFFICIENT_DATA"
        ? "MISSING_DATA"
        : composed.explanation?.explanationStatus === "STALE"
          ? "STALE"
          : composed.composerStatus === "PARTIAL"
            ? "PARTIAL"
            : "READY",
    target,
    targetUnit: composed.input?.target?.unit || null,
    currentProduction: production,
    productionUnit: composed.input?.production?.unit || null,
    paceProjection: pace,
    projectedCoverage: coverage,
    confidence: composed.confidence,
    healthStatus: composed.healthStatus,
    scenarios: {
      conservative: clone(scenarioProjected(composed, "conservativeScenario")),
      baseline: clone(scenarioProjected(composed, "baselineScenario")),
      stretch: clone(scenarioProjected(composed, "stretchScenario"))
    },
    primaryExplanation: composed.explanation?.primaryExplanation || null,
    supportingSignals: clone(asArray(composed.explanation?.supportingSignals)),
    riskSignals: clone(asArray(composed.explanation?.riskSignals)),
    missingInformation: clone(asArray(composed.explanation?.missingInformation)),
    staleInformation: clone(asArray(composed.explanation?.staleInformation)),
    activeOpportunityCount: knownValue(composed.input?.pipeline),
    staleSignalCount: Object.values(composed.input || {}).filter((entry) => entry?.state === "STALE").length,
    missingDataCount: Object.values(composed.input || {}).filter((entry) => ["MISSING", "UNKNOWN"].includes(entry?.state)).length,
    evidenceRefs: clone(asArray(composed.explanation?.evidenceRefs)),
    actions: availableActions(composed),
    warnings: clone(asArray(composed.warnings)),
    calculationPerformedByReadModel: false,
    automaticDecisionAllowed: false,
    createsRevenueTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false,
    uiMutationPerformed: false
  };

  return Object.freeze(readModel);
}

module.exports = { buildAdvisorForecastReadModel };
