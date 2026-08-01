function present(value) { return value !== undefined && value !== null && value !== ""; }
function clone(value) { return present(value) ? JSON.parse(JSON.stringify(value)) : value; }
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}
function numberDisplay(value, suffix = "") {
  return typeof value === "number"
    ? `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(value)}${suffix}`
    : null;
}
function periodLabel(yearMonth) {
  if (!/^\d{4}-\d{2}$/.test(String(yearMonth || ""))) return null;
  const [year, month] = yearMonth.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
function widgetState(composer) {
  if (composer.forecastStatus === "INSUFFICIENT_DATA") return "MISSING_DATA";
  if (composer.forecastStatus === "NEEDS_UPDATE") return "STALE";
  if (composer.confidence === "LOW") return "LOW_CONFIDENCE";
  return "READY";
}
function metric(value, unit, state = null, label = null) {
  return {
    value: typeof value === "number" ? value : null,
    unit,
    state,
    label,
    display: numberDisplay(value, unit === "percent" ? "%" : "")
  };
}
function buildAdvisorForecastReadModel(composer, explanation) {
  if (!composer || composer.contractVersion !== "ADVISOR_FORECAST_COMPOSER_V1") {
    throw new TypeError("Advisor Forecast Composer V1 result is required");
  }
  if (!explanation || explanation.contractVersion !== "ADVISOR_FORECAST_EXPLANATION_V1") {
    throw new TypeError("Advisor Forecast Explanation V1 result is required");
  }
  if (composer.advisorId !== explanation.advisorId) {
    throw new Error("Advisor Forecast read model advisor mismatch");
  }
  const pipeline = composer.operationalContext.pipeline;
  const result = {
    contractVersion: "ADVISOR_FORECAST_READ_MODEL_V1",
    advisorId: composer.advisorId,
    state: widgetState(composer),
    period: clone(composer.period),
    periodLabel: periodLabel(composer.period.yearMonth),
    target: metric(
      composer.current.target,
      "policies",
      composer.signalQuality.byState.target,
      "monthly_target"
    ),
    currentProduction: metric(
      composer.current.production,
      "policies",
      composer.signalQuality.byState.production,
      "confirmed_production"
    ),
    currentProgress: metric(
      composer.current.currentProgressPercent,
      "percent",
      null,
      "current_progress"
    ),
    paceProjection: metric(
      composer.pace.baselineProjection,
      "policies",
      composer.pace.status,
      "pace_projection"
    ),
    scenarios: {
      conservative: metric(
        composer.pace.scenarios?.conservative,
        "policies",
        composer.pace.status,
        "conservative"
      ),
      baseline: metric(
        composer.pace.scenarios?.baseline,
        "policies",
        composer.pace.status,
        "baseline"
      ),
      stretch: metric(
        composer.pace.scenarios?.stretch,
        "policies",
        composer.pace.status,
        "stretch"
      )
    },
    projectedCoverage: metric(
      composer.projectedCoveragePercent,
      "percent",
      null,
      "projected_coverage"
    ),
    confidence: composer.confidence,
    healthStatus: composer.forecastStatus,
    primaryExplanation: explanation.primaryExplanation,
    supportingSignals: clone(explanation.supportingSignals),
    riskSignals: clone(explanation.riskSignals),
    activeOpportunityCount: metric(
      typeof pipeline?.value === "number" ? pipeline.value : null,
      "opportunities",
      pipeline?.state || null,
      "active_opportunities"
    ),
    staleSignalCount: composer.signalQuality.stale,
    missingDataCount: composer.signalQuality.missing + composer.signalQuality.unknown,
    availableActions: clone(explanation.recommendedAttention),
    evidenceRefs: clone(explanation.evidenceRefs),
    freshness: clone(composer.freshness),
    generatedAt: composer.generatedAt,
    renderHints: {
      primaryMetric: "paceProjection",
      secondaryMetric: "currentProduction",
      showScenarioRange: composer.pace.status === "READY",
      showConfidence: true,
      showRiskCount: explanation.riskSignals.length > 0
    },
    truthFlags: clone(composer.truthFlags),
    calculationPerformed: false,
    mutationPerformed: false
  };
  return deepFreeze(result);
}

module.exports = {
  buildAdvisorForecastReadModel
};
