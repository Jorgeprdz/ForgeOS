"use strict";

const {
  buildManagerReviewPlanBoundary
} = require("./manager-review-plan-boundary-contract");

const MANAGER_TEAM_REVIEW_PLAN_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_TEAM_REVIEW_PLAN_DECISIONS = Object.freeze({
  PRESENT_REVIEW_PLAN_CONTEXT: "PRESENT_REVIEW_PLAN_CONTEXT",
  REQUIRE_REVIEW: "REQUIRE_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const FALSE_FLAGS = Object.freeze({
  automaticDecisionAllowed: false,
  createsAutomatedTask: false,
  createsCalendarWrite: false,
  createsMessageSend: false,
  createsEmailSend: false,
  createsSlackSend: false,
  createsHumanRankingTruth: false,
  createsPerformanceLeaderboardTruth: false,
  createsPromotionDecisionTruth: false,
  createsPunishmentTruth: false,
  createsTerminationTruth: false,
  createsDisciplinaryActionTruth: false,
  createsHrDecisionTruth: false,
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
  createsUiRendering: false,
  createsAutomatedManagerMessage: false,
  createsAutomatedAdvisorMessage: false
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

function item(itemKey, title, context, warnings = []) {
  return {
    itemKey,
    title,
    contextOnly: true,
    itemStatus: context === undefined || context === null ? "UNKNOWN" : "READY_FOR_MANAGER_REVIEW",
    reviewContext: context === undefined ? null : context,
    evidenceToReview: context === undefined || context === null ? [] : [`Evidence for ${title}`],
    suggestedDiscussionSequence: context === undefined || context === null ? [] : [`Discuss ${title}`],
    warnings: uniq(warnings),
    reviewPlanItemCreatesAutomaticDecision: false,
    reviewPlanItemCreatesAutomatedTask: false,
    reviewPlanItemCreatesCalendarWrite: false,
    reviewPlanItemCreatesMessageSend: false,
    reviewPlanItemCreatesPunishmentTruth: false,
    reviewPlanItemCreatesPromotionTruth: false,
    reviewPlanItemCreatesTerminationTruth: false,
    reviewPlanItemCreatesRevenueTruth: false,
    reviewPlanItemCreatesPrecontractTruth: false,
    reviewPlanItemCreatesHiringTruth: false,
    reviewPlanItemCreatesLifecycleTruth: false,
    automaticDecisionAllowed: false
  };
}

function buildManagerTeamReviewPlanContext(input = {}) {
  const safeInput = clone(input) || {};
  const coaching = safeInput.teamCoachingContext || {};
  const metrics = safeInput.teamMetricsContext || {};
  const dashboard = safeInput.teamDashboardContext || {};
  const forecast = safeInput.teamForecastContext || {};
  const historical = safeInput.teamHistoricalContext || {};

  const boundary = buildManagerReviewPlanBoundary({
    requestedUse: safeInput.requestedUse || "REVIEW_PLAN_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    reviewPlanContext: { reviewPlanFamily: "TEAM_REVIEW_PLAN_CONTEXT" },
    coachingContext: coaching,
    dashboardContext: dashboard,
    metricsContext: metrics,
    forecastContext: forecast,
    historicalContext: historical,
    storageContext: safeInput.historicalStorageBoundaryContext,
    queryPlanContext: safeInput.historicalQueryPlanContext
  });

  const reviewPlanItems = {
    teamPatternReviewPlanItem: item(
      "TEAM_PATTERN_REVIEW_PLAN",
      "team pattern review plan",
      coaching.teamPatternConversationTopic || metrics.teamPatternContext || dashboard.teamPatternContext,
      ["Team pattern review plan is not ranking truth."]
    ),
    teamCapacityReviewPlanItem: item(
      "TEAM_CAPACITY_REVIEW_PLAN",
      "team capacity review plan",
      coaching.teamCapacitySupportTopic || metrics.teamCapacityContext || forecast.teamCapacityForecastContext,
      ["Team capacity review plan is not HR truth."]
    ),
    teamActivityRhythmReviewPlanItem: item(
      "TEAM_ACTIVITY_RHYTHM_REVIEW_PLAN",
      "team activity rhythm review plan",
      coaching.teamActivityRhythmTopic || metrics.teamActivityContext || historical.teamActivityTrendContext
    ),
    teamForecastReviewPlanItem: item(
      "TEAM_FORECAST_REVIEW_PLAN",
      "team forecast review plan",
      coaching.teamForecastReviewTopic || forecast.teamForecastContext || forecast.baselineScenario,
      ["Team forecast review plan is not promotion, punishment or termination truth."]
    ),
    teamEvidenceQualityReviewPlanItem: item(
      "TEAM_EVIDENCE_QUALITY_REVIEW_PLAN",
      "team evidence quality review plan",
      coaching.teamEvidenceQualityTopic || metrics.evidenceQualityContext || dashboard.evidenceQualityContext
    )
  };

  const blocked = boundary.blockedUses.length > 0;
  const needsReview = boundary.humanReviewRequired;

  return {
    teamReviewPlanStatus: blocked
      ? MANAGER_TEAM_REVIEW_PLAN_STATUSES.BLOCKED
      : needsReview
        ? MANAGER_TEAM_REVIEW_PLAN_STATUSES.NEEDS_HUMAN_REVIEW
        : MANAGER_TEAM_REVIEW_PLAN_STATUSES.READY_FOR_MANAGER_REVIEW,
    teamReviewPlanDecision: blocked
      ? MANAGER_TEAM_REVIEW_PLAN_DECISIONS.BLOCK_FORBIDDEN_USE
      : needsReview
        ? MANAGER_TEAM_REVIEW_PLAN_DECISIONS.REQUIRE_REVIEW
        : MANAGER_TEAM_REVIEW_PLAN_DECISIONS.PRESENT_REVIEW_PLAN_CONTEXT,
    contextOnly: true,
    reviewPlanItems,
    boundary,
    reviewAgenda: [
      "Team patterns",
      "Team capacity",
      "Team activity rhythm",
      "Team forecast",
      "Evidence quality"
    ],
    warnings: uniq([...boundary.warnings, "Team review plan is planning context only."]),
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
  buildManagerTeamReviewPlanContext,
  MANAGER_TEAM_REVIEW_PLAN_STATUSES,
  MANAGER_TEAM_REVIEW_PLAN_DECISIONS
};
