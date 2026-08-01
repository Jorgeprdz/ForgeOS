const { composeAdvisorForecastV1 } = require("./advisor-forecast-composer");
const { weightAdvisorOpportunities } = require("./advisor-opportunity-weighting-engine");
const { calculateAdvisorGoalGap } = require("./advisor-goal-gap-engine");

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }

function decisionSummary(goalGap, weighting) {
  if (!goalGap) return null;
  return {
    state: goalGap.gapStatus,
    headline: goalGap.primaryExplanation,
    confirmedGap: goalGap.confirmedGap,
    remainingAfterWeightedPipeline: goalGap.remainingAfterWeightedPipeline,
    topContributorIds: asArray(weighting?.topContributors).map((entry) => entry.opportunityId).filter(Boolean),
    humanReviewRequired: true
  };
}

function composeAdvisorForecastV2(sourceInput = {}) {
  const before = JSON.stringify(sourceInput);
  const baseForecast = sourceInput.baseForecast?.composerStatus
    ? clone(sourceInput.baseForecast)
    : composeAdvisorForecastV1(sourceInput);
  const rawOpportunities = Array.isArray(sourceInput.opportunities)
    ? clone(sourceInput.opportunities)
    : null;
  const pipelineEvidence = sourceInput.sourceEvidence?.pipeline || {};

  const opportunityWeighting = weightAdvisorOpportunities({
    advisorId: baseForecast.advisorId,
    opportunities: rawOpportunities,
    sourceEvidence: pipelineEvidence,
    generatedAt: baseForecast.generatedAt
  });

  const goalGap = calculateAdvisorGoalGap({
    targetSignal: baseForecast.input?.target,
    productionSignal: baseForecast.input?.production,
    paceProjection: baseForecast.paceProjection,
    opportunityWeighting,
    activitySignal: baseForecast.input?.activity,
    generatedAt: baseForecast.generatedAt
  });

  const composerV2Status = baseForecast.composerStatus === "BLOCKED"
    ? "BLOCKED"
    : goalGap.gapStatus === "DATA_INSUFFICIENT"
      ? "PARTIAL"
      : opportunityWeighting.weightingStatus === "MISSING_DATA"
        ? "PARTIAL"
        : "READY";

  const warnings = unique([
    ...asArray(baseForecast.warnings),
    ...asArray(opportunityWeighting.warnings),
    "Advisor Forecast V2 weights expected policy contribution only; it does not create revenue truth.",
    "Pace and weighted Pipeline remain separate decision contexts and are not summed into a guaranteed close."
  ]);

  const output = Object.freeze({
    schema: "ADVISOR_FORECAST_COMPOSER_V2",
    composerV2Status,
    advisorId: baseForecast.advisorId,
    period: clone(baseForecast.period),
    generatedAt: baseForecast.generatedAt,
    baseForecast,
    opportunityWeighting,
    goalGap,
    decisionSummary: decisionSummary(goalGap, opportunityWeighting),
    confidence: baseForecast.confidence,
    healthStatus: baseForecast.healthStatus,
    warnings,
    assumptions: unique([
      ...asArray(goalGap.assumptions),
      "Opportunity probabilities are evidence-backed context, not automatic decisions."
    ]),
    confidenceLimitations: unique([
      ...asArray(goalGap.confidenceLimitations),
      "No monetary weighting is authorized in this stage."
    ]),
    automaticDecisionAllowed: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false,
    uiMutationPerformed: false
  });

  if (JSON.stringify(sourceInput) !== before) throw new Error("Advisor Forecast V2 composer mutated source input");
  return output;
}

module.exports = { composeAdvisorForecastV2 };
