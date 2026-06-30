"use strict";

const {
  buildManagerDashboardBoundary
} = require("./manager-dashboard-boundary-contract");

const {
  calculateManagerRecruitmentDashboardContext
} = require("./manager-recruitment-dashboard-engine");

const {
  calculateManagerAdvisorDashboardContext
} = require("./manager-advisor-dashboard-engine");

const {
  calculateManagerTeamDashboardContext
} = require("./manager-team-dashboard-engine");

const MANAGER_DASHBOARD_INTELLIGENCE_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_DASHBOARD_INTELLIGENCE_DECISIONS = Object.freeze({
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

function buildManagerDashboardIntelligence(input = {}) {
  const safeInput = clone(input) || {};

  const boundary = buildManagerDashboardBoundary({
    requestedUse: safeInput.requestedUse || "DASHBOARD_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    dashboardContext: { dashboardFamily: "MANAGER_DASHBOARD_INTELLIGENCE" },
    metricsContext: safeInput.managerMetricsContext,
    historicalContext: safeInput.historicalAnalyticsContext,
    storageContext: safeInput.historicalStorageBoundaryContext || safeInput.historicalRollupContext,
    queryPlanContext: safeInput.historicalQueryPlanContext,
    forecastContext: safeInput.forecastIntelligenceContext
  });

  const recruitmentDashboard = calculateManagerRecruitmentDashboardContext({
    requestedUse: safeInput.requestedUse || "DASHBOARD_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    recruitmentMetricsContext: safeInput.recruitmentMetricsContext,
    recruitmentHistoricalContext: safeInput.recruitmentHistoricalContext,
    recruitmentForecastContext: safeInput.recruitmentForecastContext,
    historicalStorageBoundaryContext: safeInput.historicalStorageBoundaryContext,
    historicalQueryPlanContext: safeInput.historicalQueryPlanContext
  });

  const advisorDashboard = calculateManagerAdvisorDashboardContext({
    requestedUse: safeInput.requestedUse || "DASHBOARD_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    advisorMetricsContext: safeInput.advisorMetricsContext,
    advisorHistoricalContext: safeInput.advisorHistoricalContext,
    advisorForecastContext: safeInput.advisorForecastContext,
    historicalStorageBoundaryContext: safeInput.historicalStorageBoundaryContext,
    historicalQueryPlanContext: safeInput.historicalQueryPlanContext
  });

  const teamDashboard = calculateManagerTeamDashboardContext({
    requestedUse: safeInput.requestedUse || "DASHBOARD_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    teamMetricsContext: safeInput.teamMetricsContext,
    teamHistoricalContext: safeInput.teamHistoricalContext,
    teamForecastContext: safeInput.teamForecastContext,
    historicalStorageBoundaryContext: safeInput.historicalStorageBoundaryContext,
    historicalQueryPlanContext: safeInput.historicalQueryPlanContext
  });

  const warnings = uniq([
    ...boundary.warnings,
    ...recruitmentDashboard.warnings,
    ...advisorDashboard.warnings,
    ...teamDashboard.warnings
  ]);

  const assumptions = uniq([
    ...boundary.assumptions,
    ...recruitmentDashboard.assumptions,
    ...advisorDashboard.assumptions,
    ...teamDashboard.assumptions
  ]);

  const confidenceLimitations = uniq([
    ...boundary.confidenceLimitations,
    ...recruitmentDashboard.confidenceLimitations,
    ...advisorDashboard.confidenceLimitations,
    ...teamDashboard.confidenceLimitations
  ]);

  const blocked = boundary.blockedUses.length > 0;
  const needsReview =
    boundary.humanReviewRequired ||
    recruitmentDashboard.recruitmentDashboardStatus === "NEEDS_HUMAN_REVIEW" ||
    advisorDashboard.advisorDashboardStatus === "NEEDS_HUMAN_REVIEW" ||
    teamDashboard.teamDashboardStatus === "NEEDS_HUMAN_REVIEW";

  const dashboardIntelligenceStatus = blocked
    ? MANAGER_DASHBOARD_INTELLIGENCE_STATUSES.BLOCKED
    : needsReview
      ? MANAGER_DASHBOARD_INTELLIGENCE_STATUSES.NEEDS_HUMAN_REVIEW
      : MANAGER_DASHBOARD_INTELLIGENCE_STATUSES.READY_FOR_MANAGER_REVIEW;

  return {
    dashboardIntelligenceStatus,
    dashboardIntelligenceDecision: blocked
      ? MANAGER_DASHBOARD_INTELLIGENCE_DECISIONS.BLOCK_FORBIDDEN_USE
      : needsReview
        ? MANAGER_DASHBOARD_INTELLIGENCE_DECISIONS.REQUIRE_REVIEW
        : MANAGER_DASHBOARD_INTELLIGENCE_DECISIONS.PRESENT_CONTEXT,
    contextOnly: true,
    boundary,
    recruitmentDashboard,
    advisorDashboard,
    teamDashboard,
    executiveSummaryContext: {
      contextOnly: true,
      summaryType: "MANAGER_REVIEW_SUMMARY",
      reviewAreas: [
        "Recruitment context review",
        "Advisor context review",
        "Team context review",
        "Forecast context review",
        "Evidence quality review"
      ],
      recommendedReviewAreasAreAutomaticDecisions: false,
      automaticDecisionAllowed: false,
      ...FALSE_FLAGS
    },
    warnings,
    assumptions,
    confidenceLimitations,
    evidenceRefs: uniq([
      ...boundary.evidenceRefs,
      ...recruitmentDashboard.evidenceRefs,
      ...advisorDashboard.evidenceRefs,
      ...teamDashboard.evidenceRefs
    ]),
    sourceEvidenceIds: uniq([
      ...boundary.sourceEvidenceIds,
      ...recruitmentDashboard.sourceEvidenceIds,
      ...advisorDashboard.sourceEvidenceIds,
      ...teamDashboard.sourceEvidenceIds
    ]),
    sourceOwners: uniq([
      ...boundary.sourceOwners,
      ...recruitmentDashboard.sourceOwners,
      ...advisorDashboard.sourceOwners,
      ...teamDashboard.sourceOwners
    ]),
    freshness: boundary.freshness,
    ...FALSE_FLAGS
  };
}

module.exports = {
  buildManagerDashboardIntelligence,
  MANAGER_DASHBOARD_INTELLIGENCE_STATUSES,
  MANAGER_DASHBOARD_INTELLIGENCE_DECISIONS
};
