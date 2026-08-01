const { composeAdvisorForecastV2 } = require("./advisor-forecast-composer-v2");
const { buildAdvisorForecastReadModel } = require("./advisor-forecast-read-model");

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }

function contributorView(entry) {
  return {
    opportunityId: entry.opportunityId,
    stage: entry.stage,
    classification: entry.classification,
    probability: entry.probability,
    expectedPolicyContribution: entry.expectedPolicyContribution,
    evidenceRefs: clone(asArray(entry.evidenceRefs)),
    signalTrace: clone(asArray(entry.signalTrace)),
    weightedAmount: null,
    amountWeightingApplied: false
  };
}

function actionsFor(composed) {
  const actions = [
    { type: "NAVIGATE", label: "Abrir Forecast", destination: "ADVISOR_FORECAST_DETAIL" }
  ];
  if ((composed.opportunityWeighting?.activeOpportunityCount || 0) > 0) {
    actions.push({ type: "NAVIGATE", label: "Ver oportunidades", destination: "PIPELINE_FORECAST_CONTEXT" });
  }
  if ((composed.opportunityWeighting?.atRiskCount || 0) > 0) {
    actions.push({ type: "NAVIGATE", label: "Revisar casos en riesgo", destination: "PIPELINE_AT_RISK" });
  } else if (composed.baseForecast?.explanation?.missingInformation?.length || composed.baseForecast?.explanation?.staleInformation?.length) {
    actions.push({ type: "REVIEW_SOURCE_CONTEXT", label: "Actualizar datos", destination: "FORECAST_SOURCE_REVIEW" });
  }
  return actions.slice(0, 3);
}

function buildAdvisorForecastReadModelV2(input = {}) {
  const composed = input.composerV2Status ? clone(input) : composeAdvisorForecastV2(input);
  const baseReadModel = buildAdvisorForecastReadModel(composed.baseForecast);
  const weighting = composed.opportunityWeighting || {};
  const gap = composed.goalGap || {};

  return Object.freeze({
    ...baseReadModel,
    schema: "ADVISOR_FORECAST_READ_MODEL_V2",
    state: composed.composerV2Status === "BLOCKED"
      ? "BLOCKED"
      : gap.gapStatus === "DATA_INSUFFICIENT"
        ? "MISSING_DATA"
        : weighting.weightingStatus === "PARTIAL" || weighting.weightingStatus === "MISSING_EVIDENCE"
          ? "PARTIAL"
          : baseReadModel.state,
    primaryExplanation: gap.primaryExplanation || baseReadModel.primaryExplanation,
    goalGap: {
      state: gap.gapStatus || null,
      confirmedGap: gap.confirmedGap ?? null,
      paceGap: gap.paceGap ?? null,
      weightedPipelineContribution: gap.weightedPipelineContribution ?? null,
      remainingAfterWeightedPipeline: gap.remainingAfterWeightedPipeline ?? null,
      currentCoverage: gap.currentCoverage ?? null,
      paceCoverage: gap.paceCoverage ?? null,
      weightedPipelineCoverage: gap.weightedPipelineCoverage ?? null,
      pipelineSufficiencyRatio: gap.pipelineSufficiencyRatio ?? null,
      needsActivityRequirementModel: gap.needsActivityRequirementModel === true
    },
    opportunityForecast: {
      status: weighting.weightingStatus || null,
      activeOpportunityCount: weighting.activeOpportunityCount ?? null,
      weightedPolicyContribution: weighting.weightedPolicyContribution ?? null,
      classificationCounts: clone(weighting.classificationCounts || null),
      atRiskCount: weighting.atRiskCount ?? null,
      unknownCount: weighting.unknownCount ?? null,
      topContributors: asArray(weighting.topContributors).map(contributorView)
    },
    activeOpportunityCount: weighting.activeOpportunityCount ?? baseReadModel.activeOpportunityCount,
    atRiskCount: weighting.atRiskCount ?? null,
    decisionSummary: clone(composed.decisionSummary || null),
    actions: actionsFor(composed),
    warnings: clone(asArray(composed.warnings)),
    amountWeightingApplied: false,
    calculationPerformedByReadModel: false,
    automaticDecisionAllowed: false,
    createsRevenueTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false,
    uiMutationPerformed: false
  });
}

module.exports = { buildAdvisorForecastReadModelV2 };
