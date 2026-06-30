"use strict";

const {
  buildManagerDashboardBoundary
} = require("./manager-dashboard-boundary-contract");

const MANAGER_TEAM_DASHBOARD_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_TEAM_DASHBOARD_DECISIONS = Object.freeze({
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
    dashboardCardCreatesRankingTruth: false,
    dashboardCardCreatesLeaderboardTruth: false,
    dashboardCardCreatesPromotionTruth: false,
    dashboardCardCreatesPunishmentTruth: false,
    dashboardCardCreatesTerminationTruth: false,
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

function calculateManagerTeamDashboardContext(input = {}) {
  const safeInput = clone(input) || {};
  const metrics = safeInput.teamMetricsContext || {};
  const historical = safeInput.teamHistoricalContext || {};
  const forecast = safeInput.teamForecastContext || {};

  const boundary = buildManagerDashboardBoundary({
    requestedUse: safeInput.requestedUse || "DASHBOARD_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    dashboardContext: { dashboardFamily: "TEAM_DASHBOARD_CONTEXT" },
    metricsContext: metrics,
    historicalContext: historical,
    forecastContext: forecast,
    storageContext: safeInput.historicalStorageBoundaryContext,
    queryPlanContext: safeInput.historicalQueryPlanContext
  });

  const cards = {
    teamPatternCard: card("TEAM_PATTERN_CONTEXT", "Team pattern context", metrics.teamPatternContext || historical.teamPatternTrendContext || forecast.teamPatternForecastContext, ["Team pattern is not ranking truth."]),
    teamCapacityCard: card("TEAM_CAPACITY_CONTEXT", "Team capacity context", metrics.teamCapacityContext || forecast.teamCapacityForecastContext, ["Capacity context is not HR truth."]),
    teamPipelineCard: card("TEAM_PIPELINE_CONTEXT", "Team pipeline context", metrics.teamPipelineContext || forecast.teamPipelineForecastContext),
    teamActivityTrendCard: card("TEAM_ACTIVITY_TREND_CONTEXT", "Team activity trend context", historical.teamActivityTrendContext || forecast.teamActivityForecastContext),
    teamEvidenceQualityCard: card("TEAM_EVIDENCE_QUALITY_CONTEXT", "Team evidence quality context", metrics.evidenceQualityContext || historical.evidenceQualityContext),
    teamForecastSummaryCard: card("TEAM_FORECAST_SCENARIOS", "Team forecast context", scenarioSummary(forecast))
  };

  const status = boundary.blockedUses.length
    ? MANAGER_TEAM_DASHBOARD_STATUSES.BLOCKED
    : boundary.humanReviewRequired
      ? MANAGER_TEAM_DASHBOARD_STATUSES.NEEDS_HUMAN_REVIEW
      : MANAGER_TEAM_DASHBOARD_STATUSES.READY_FOR_MANAGER_REVIEW;

  return {
    teamDashboardStatus: status,
    teamDashboardDecision: status === MANAGER_TEAM_DASHBOARD_STATUSES.BLOCKED
      ? MANAGER_TEAM_DASHBOARD_DECISIONS.BLOCK_FORBIDDEN_USE
      : status === MANAGER_TEAM_DASHBOARD_STATUSES.NEEDS_HUMAN_REVIEW
        ? MANAGER_TEAM_DASHBOARD_DECISIONS.REQUIRE_REVIEW
        : MANAGER_TEAM_DASHBOARD_DECISIONS.PRESENT_CONTEXT,
    contextOnly: true,
    cards,
    boundary,
    warnings: uniq([...boundary.warnings, "Team dashboard cards are review context only."]),
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
  calculateManagerTeamDashboardContext,
  MANAGER_TEAM_DASHBOARD_STATUSES,
  MANAGER_TEAM_DASHBOARD_DECISIONS
};
