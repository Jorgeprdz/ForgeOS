const { normalizeAdvisorForecastInput } = require("./advisor-forecast-normalizer");
const { calculateManagerAdvisorForecast } = require("./manager-advisor-forecast-engine");
const { buildAdvisorForecastExplanation } = require("./advisor-forecast-explanation-engine");

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function knownNumber(signal) { return signal && ["KNOWN", "ZERO", "STALE"].includes(signal.state) && typeof signal.value === "number" ? signal.value : null; }

function dayOfPeriod(generatedAt, period) {
  const parsed = new Date(generatedAt || "");
  if (Number.isNaN(parsed.getTime()) || !period?.yearMonth) return null;
  const [year, month] = period.yearMonth.split("-").map(Number);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() + 1 !== month) return null;
  return parsed.getUTCDate();
}

function daysInPeriod(period) {
  if (!period?.yearMonth) return null;
  const [year, month] = period.yearMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function calculatePaceProjection(input) {
  const production = knownNumber(input.production);
  const elapsedDay = dayOfPeriod(input.generatedAt, input.period);
  const totalDays = daysInPeriod(input.period);
  if (production === null || !elapsedDay || !totalDays) {
    return Object.freeze({ status: "INSUFFICIENT_DATA", currentProduction: production, dailyPace: null, projectedPeriodClose: null, createsRevenueTruth: false });
  }
  const dailyPace = production / Math.max(elapsedDay, 1);
  return Object.freeze({
    status: input.production.state === "STALE" ? "STALE" : "READY",
    currentProduction: production,
    elapsedDay,
    totalDays,
    dailyPace: Number(dailyPace.toFixed(4)),
    projectedPeriodClose: Number((dailyPace * totalDays).toFixed(1)),
    projectionUnit: input.production.unit,
    compatibility: "SMNYL_MONTHLY_PACE_SEMANTICS",
    createsRevenueTruth: false
  });
}

function metricsFromInput(input) {
  return {
    activitySignalCount: knownNumber(input.activity),
    followupSignalCount: knownNumber(input.followups),
    prospectingSignalCount: knownNumber(input.prospecting),
    referralSignalCount: knownNumber(input.referrals),
    appointmentContext: { count: knownNumber(input.appointments) },
    pipelineContext: { count: knownNumber(input.pipeline) },
    productionContext: { count: knownNumber(input.production) }
  };
}

function sourceEvidenceFromInput(input) {
  return {
    evidenceRefs: unique(asArray(input.evidence?.evidenceRefs)),
    sourceEvidenceIds: unique(asArray(input.evidence?.sourceEvidenceIds)),
    sourceOwners: unique(asArray(input.evidence?.sourceOwners)),
    freshness: { status: Object.values(input).some((entry) => entry?.state === "STALE") ? "STALE" : "FRESH" },
    generatedAt: input.generatedAt
  };
}

function confidenceOf(input, forecast) {
  const signals = [input.target, input.production, input.pipeline, input.activity, input.appointments, input.followups, input.prospecting, input.referrals, input.historicalContext];
  const missing = signals.filter((signal) => !signal || ["MISSING", "UNKNOWN"].includes(signal.state)).length;
  const stale = signals.filter((signal) => signal?.state === "STALE").length;
  const evidenceCount = unique(signals.flatMap((signal) => asArray(signal?.evidenceRefs))).length;
  if (forecast?.forecastStatus === "BLOCKED") return "INSUFFICIENT_DATA";
  if (missing >= 3 || evidenceCount === 0) return "INSUFFICIENT_DATA";
  if (missing > 0 || stale > 1) return "LOW";
  if (stale === 1 || evidenceCount < 5) return "MEDIUM";
  return "HIGH";
}

function healthOf(input, pace) {
  const target = knownNumber(input.target);
  const production = knownNumber(input.production);
  if (target === null || production === null) return "UNKNOWN";
  if (production >= target) return "ON_TRACK";
  if (pace.projectedPeriodClose === null) return "NEEDS_UPDATE";
  if (pace.projectedPeriodClose >= target) return "ON_TRACK";
  if (knownNumber(input.pipeline) === null || input.pipeline.state === "STALE") return "NEEDS_UPDATE";
  return pace.projectedPeriodClose >= target * 0.75 ? "AT_RISK" : "BEHIND";
}

function composeAdvisorForecastV1(sourceInput = {}) {
  const normalized = sourceInput.normalizationStatus === "READY_FOR_COMPOSER"
    ? clone(sourceInput)
    : normalizeAdvisorForecastInput(sourceInput);
  const input = normalized.input;
  const historicalValue = input.historicalContext && ["KNOWN", "STALE"].includes(input.historicalContext.state)
    ? input.historicalContext.value
    : null;
  const sourceEvidence = sourceEvidenceFromInput(input);
  const forecast = calculateManagerAdvisorForecast({
    advisorMetricsContext: { advisorMetrics: metricsFromInput(input), ...sourceEvidence },
    advisorHistoricalContext: historicalValue ? { advisorHistoricalAnalytics: historicalValue, ...sourceEvidence } : null,
    sourceEvidence,
    requestedUse: "FORECAST_CONTEXT",
    periodRange: { start: input.period.start, end: input.period.end },
    generatedAt: input.generatedAt,
    assumptions: [
      "Production means unique POLICY_SOLD_CONFIRMED events in the selected month.",
      "Pipeline is an unweighted active opportunity count in V1.",
      "Scenarios are protected context and not guaranteed outcomes."
    ],
    confidenceLimitations: [
      "Opportunity amount and probability weighting are not applied.",
      "Pace projection extrapolates confirmed production only."
    ]
  });
  const paceProjection = calculatePaceProjection(input);
  const confidence = confidenceOf(input, forecast);
  const healthStatus = healthOf(input, paceProjection);
  const explanation = buildAdvisorForecastExplanation({ input, paceProjection, forecastContext: forecast });

  return Object.freeze({
    composerStatus: forecast.forecastStatus === "BLOCKED" ? "BLOCKED" : confidence === "INSUFFICIENT_DATA" ? "PARTIAL" : "READY",
    advisorId: input.advisorId,
    period: clone(input.period),
    generatedAt: input.generatedAt,
    input: clone(input),
    paceProjection: clone(paceProjection),
    scenarioContext: clone(forecast.advisorForecastContext),
    forecastBoundary: clone(forecast.boundaryContext),
    forecastStatus: forecast.forecastStatus,
    confidence,
    healthStatus,
    explanation: clone(explanation),
    missingEvidence: unique([...asArray(forecast.missingEvidence), ...asArray(input.missingEvidence)]),
    unknownSignals: unique(asArray(forecast.unknownSignals)),
    staleSignals: unique(asArray(forecast.staleSignals)),
    warnings: unique([
      ...asArray(forecast.warnings),
      "Advisor Forecast V1 does not create revenue truth or opportunity-weighted production."
    ]),
    allowedUses: unique(asArray(forecast.allowedUses)),
    blockedUses: unique(asArray(forecast.blockedUses)),
    automaticDecisionAllowed: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false,
    uiMutationPerformed: false
  });
}

module.exports = { calculatePaceProjection, composeAdvisorForecastV1 };
