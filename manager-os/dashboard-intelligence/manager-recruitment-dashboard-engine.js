"use strict";

const {
  buildManagerDashboardBoundary
} = require("./manager-dashboard-boundary-contract");

const MANAGER_RECRUITMENT_DASHBOARD_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_RECRUITMENT_DASHBOARD_DECISIONS = Object.freeze({
  PRESENT_CONTEXT: "PRESENT_CONTEXT",
  REQUIRE_REVIEW: "REQUIRE_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const FALSE_FLAGS = Object.freeze({
  automaticDecisionAllowed: false,
  createsHumanRankingTruth: false,
  createsPerformanceLeaderboardTruth: false,
  createsPromotionDecisionTruth: false,
  createsPunishmentTruth: false,
  createsTerminationTruth: false,
  createsAdvisorLifecycleTruth: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsRevenue: false,
  createsCompensation: false,
  createsPayoutTruth: false,
  createsPrecontractTruth: false,
  createsHiringTruth: false,
  createsDatabaseWrite: false,
  createsFilesystemWrite: false,
  createsCacheWrite: false,
  createsMigrationWrite: false,
  createsSchemaWrite: false,
  createsUiRendering: false
});

function clone(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function arrayOf(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function uniq(values) {
  return [...new Set(arrayOf(values).filter(Boolean))];
}

function card(cardKey, title, context, warnings = []) {
  return {
    cardKey,
    title,
    contextOnly: true,
    cardStatus: context === undefined || context === null ? "UNKNOWN" : "READY_FOR_MANAGER_REVIEW",
    valueContext: context === undefined ? null : context,
    warnings: uniq(warnings),
    dashboardCardCreatesDecisionTruth: false,
    dashboardCardCreatesPunishmentTruth: false,
    dashboardCardCreatesPromotionTruth: false,
    dashboardCardCreatesRevenueTruth: false,
    dashboardCardCreatesPrecontractTruth: false,
    dashboardCardCreatesHiringTruth: false,
    automaticDecisionAllowed: false
  };
}

function scenarioSummary(forecastContext = {}) {
  return ["conservativeScenario", "baselineScenario", "stretchScenario"].map((key) => ({
    scenarioKey: key,
    contextOnly: true,
    projectedContext: forecastContext[key] ? clone(forecastContext[key].projectedContext || forecastContext[key]) : null,
    assumptions: arrayOf(forecastContext[key] && forecastContext[key].assumptions),
    confidenceLimitations: arrayOf(forecastContext[key] && forecastContext[key].confidenceLimitations),
    automaticDecisionAllowed: false,
    ...FALSE_FLAGS
  }));
}

function calculateManagerRecruitmentDashboardContext(input = {}) {
  const safeInput = clone(input) || {};
  const metrics = safeInput.recruitmentMetricsContext || {};
  const historical = safeInput.recruitmentHistoricalContext || {};
  const forecast = safeInput.recruitmentForecastContext || {};

  const boundary = buildManagerDashboardBoundary({
    requestedUse: safeInput.requestedUse || "DASHBOARD_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    dashboardContext: { dashboardFamily: "RECRUITMENT_DASHBOARD_CONTEXT" },
    metricsContext: metrics,
    historicalContext: historical,
    forecastContext: forecast,
    storageContext: safeInput.historicalStorageBoundaryContext,
    queryPlanContext: safeInput.historicalQueryPlanContext
  });

  const cards = {
    recruitmentFunnelCard: card("RECRUITMENT_FUNNEL", "Recruitment funnel context", metrics.funnelContext || historical.funnelTrendContext),
    candidatePipelineCard: card("CANDIDATE_PIPELINE", "Candidate pipeline context", metrics.candidatePipelineContext || forecast.pipelineForecastContext),
    interviewCompletionCard: card("INTERVIEW_COMPLETION", "Interview completion context", metrics.interviewCompletionContext || historical.interviewCompletionTrendContext),
    precontractReadinessReviewCard: card("PRECONTRACT_READINESS_REVIEW", "Precontract readiness review context", metrics.precontractReadinessContext || forecast.precontractReadinessForecastContext, ["Review context only; not precontract truth."]),
    recruitmentVelocityCard: card("RECRUITMENT_VELOCITY", "Recruitment velocity context", historical.velocityTrendContext || forecast.velocityForecastContext),
    candidateCohortCard: card("CANDIDATE_COHORT", "Candidate cohort context", historical.cohortContext || forecast.cohortForecastContext),
    conversionContextCard: card("CONVERSION_CONTEXT", "Conversion context", historical.conversionTrendContext || forecast.conversionForecastContext),
    withdrawalBlockedReentryCard: card("WITHDRAWN_BLOCKED_REENTRY", "Withdrawn blocked reactivated reentry context", historical.exceptionTrendContext || forecast.reactivationReentryForecastContext),
    forecastScenarioSummaryCard: card("RECRUITMENT_FORECAST_SCENARIOS", "Recruitment forecast scenario summary", scenarioSummary(forecast))
  };

  const status = boundary.blockedUses.length
    ? MANAGER_RECRUITMENT_DASHBOARD_STATUSES.BLOCKED
    : boundary.humanReviewRequired
      ? MANAGER_RECRUITMENT_DASHBOARD_STATUSES.NEEDS_HUMAN_REVIEW
      : MANAGER_RECRUITMENT_DASHBOARD_STATUSES.READY_FOR_MANAGER_REVIEW;

  return {
    recruitmentDashboardStatus: status,
    recruitmentDashboardDecision: status === MANAGER_RECRUITMENT_DASHBOARD_STATUSES.BLOCKED
      ? MANAGER_RECRUITMENT_DASHBOARD_DECISIONS.BLOCK_FORBIDDEN_USE
      : status === MANAGER_RECRUITMENT_DASHBOARD_STATUSES.NEEDS_HUMAN_REVIEW
        ? MANAGER_RECRUITMENT_DASHBOARD_DECISIONS.REQUIRE_REVIEW
        : MANAGER_RECRUITMENT_DASHBOARD_DECISIONS.PRESENT_CONTEXT,
    contextOnly: true,
    cards,
    boundary,
    warnings: uniq([...boundary.warnings, "Recruitment dashboard cards are review context only."]),
    assumptions: boundary.assumptions,
    confidenceLimitations: boundary.confidenceLimitations,
    evidenceRefs: boundary.evidenceRefs,
    sourceEvidenceIds: boundary.sourceEvidenceIds,
    sourceOwners: boundary.sourceOwners,
    freshness: boundary.freshness,
    ...FALSE_FLAGS
  };
}

module.exports = {
  calculateManagerRecruitmentDashboardContext,
  MANAGER_RECRUITMENT_DASHBOARD_STATUSES,
  MANAGER_RECRUITMENT_DASHBOARD_DECISIONS
};
