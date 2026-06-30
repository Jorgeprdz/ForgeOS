"use strict";

const {
  buildManagerReviewPlanBoundary
} = require("./manager-review-plan-boundary-contract");

const {
  buildManagerRecruitmentReviewPlanContext
} = require("./manager-recruitment-review-plan-engine");

const {
  buildManagerAdvisorReviewPlanContext
} = require("./manager-advisor-review-plan-engine");

const {
  buildManagerTeamReviewPlanContext
} = require("./manager-team-review-plan-engine");

const MANAGER_REVIEW_PLAN_INTELLIGENCE_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_REVIEW_PLAN_INTELLIGENCE_DECISIONS = Object.freeze({
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

function buildManagerReviewPlanIntelligence(input = {}) {
  const safeInput = clone(input) || {};

  const boundary = buildManagerReviewPlanBoundary({
    requestedUse: safeInput.requestedUse || "REVIEW_PLAN_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    reviewPlanContext: { reviewPlanFamily: "MANAGER_REVIEW_PLAN_INTELLIGENCE" },
    coachingContext: safeInput.coachingIntelligenceContext,
    dashboardContext: safeInput.dashboardIntelligenceContext,
    metricsContext: safeInput.managerMetricsContext,
    historicalContext: safeInput.historicalAnalyticsContext,
    forecastContext: safeInput.forecastIntelligenceContext,
    storageContext: safeInput.historicalStorageBoundaryContext || safeInput.historicalRollupContext,
    queryPlanContext: safeInput.historicalQueryPlanContext
  });

  const recruitmentReviewPlan = buildManagerRecruitmentReviewPlanContext({
    requestedUse: safeInput.requestedUse || "REVIEW_PLAN_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    recruitmentCoachingContext: safeInput.recruitmentCoachingContext || (safeInput.coachingIntelligenceContext && safeInput.coachingIntelligenceContext.recruitmentCoaching),
    recruitmentMetricsContext: safeInput.recruitmentMetricsContext,
    recruitmentHistoricalContext: safeInput.recruitmentHistoricalContext,
    recruitmentForecastContext: safeInput.recruitmentForecastContext,
    recruitmentDashboardContext: safeInput.recruitmentDashboardContext || (safeInput.dashboardIntelligenceContext && safeInput.dashboardIntelligenceContext.recruitmentDashboard),
    historicalStorageBoundaryContext: safeInput.historicalStorageBoundaryContext,
    historicalQueryPlanContext: safeInput.historicalQueryPlanContext
  });

  const advisorReviewPlan = buildManagerAdvisorReviewPlanContext({
    requestedUse: safeInput.requestedUse || "REVIEW_PLAN_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    advisorCoachingContext: safeInput.advisorCoachingContext || (safeInput.coachingIntelligenceContext && safeInput.coachingIntelligenceContext.advisorCoaching),
    advisorMetricsContext: safeInput.advisorMetricsContext,
    advisorHistoricalContext: safeInput.advisorHistoricalContext,
    advisorForecastContext: safeInput.advisorForecastContext,
    advisorDashboardContext: safeInput.advisorDashboardContext || (safeInput.dashboardIntelligenceContext && safeInput.dashboardIntelligenceContext.advisorDashboard),
    historicalStorageBoundaryContext: safeInput.historicalStorageBoundaryContext,
    historicalQueryPlanContext: safeInput.historicalQueryPlanContext
  });

  const teamReviewPlan = buildManagerTeamReviewPlanContext({
    requestedUse: safeInput.requestedUse || "REVIEW_PLAN_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    teamCoachingContext: safeInput.teamCoachingContext || (safeInput.coachingIntelligenceContext && safeInput.coachingIntelligenceContext.teamCoaching),
    teamMetricsContext: safeInput.teamMetricsContext,
    teamHistoricalContext: safeInput.teamHistoricalContext,
    teamForecastContext: safeInput.teamForecastContext,
    teamDashboardContext: safeInput.teamDashboardContext || (safeInput.dashboardIntelligenceContext && safeInput.dashboardIntelligenceContext.teamDashboard),
    historicalStorageBoundaryContext: safeInput.historicalStorageBoundaryContext,
    historicalQueryPlanContext: safeInput.historicalQueryPlanContext
  });

  const warnings = uniq([
    ...boundary.warnings,
    ...recruitmentReviewPlan.warnings,
    ...advisorReviewPlan.warnings,
    ...teamReviewPlan.warnings
  ]);

  const assumptions = uniq([
    ...boundary.assumptions,
    ...recruitmentReviewPlan.assumptions,
    ...advisorReviewPlan.assumptions,
    ...teamReviewPlan.assumptions
  ]);

  const confidenceLimitations = uniq([
    ...boundary.confidenceLimitations,
    ...recruitmentReviewPlan.confidenceLimitations,
    ...advisorReviewPlan.confidenceLimitations,
    ...teamReviewPlan.confidenceLimitations
  ]);

  const blocked = boundary.blockedUses.length > 0;
  const needsReview =
    boundary.humanReviewRequired ||
    recruitmentReviewPlan.recruitmentReviewPlanStatus === "NEEDS_HUMAN_REVIEW" ||
    advisorReviewPlan.advisorReviewPlanStatus === "NEEDS_HUMAN_REVIEW" ||
    teamReviewPlan.teamReviewPlanStatus === "NEEDS_HUMAN_REVIEW";

  const reviewPlanIntelligenceStatus = blocked
    ? MANAGER_REVIEW_PLAN_INTELLIGENCE_STATUSES.BLOCKED
    : needsReview
      ? MANAGER_REVIEW_PLAN_INTELLIGENCE_STATUSES.NEEDS_HUMAN_REVIEW
      : MANAGER_REVIEW_PLAN_INTELLIGENCE_STATUSES.READY_FOR_MANAGER_REVIEW;

  return {
    reviewPlanIntelligenceStatus,
    reviewPlanIntelligenceDecision: blocked
      ? MANAGER_REVIEW_PLAN_INTELLIGENCE_DECISIONS.BLOCK_FORBIDDEN_USE
      : needsReview
        ? MANAGER_REVIEW_PLAN_INTELLIGENCE_DECISIONS.REQUIRE_REVIEW
        : MANAGER_REVIEW_PLAN_INTELLIGENCE_DECISIONS.PRESENT_REVIEW_PLAN_CONTEXT,
    contextOnly: true,
    boundary,
    recruitmentReviewPlan,
    advisorReviewPlan,
    teamReviewPlan,
    executiveReviewPlanSummary: {
      contextOnly: true,
      summaryType: "MANAGER_REVIEW_PLAN_SUMMARY",
      managerReviewAgenda: [
        "Review missing evidence first",
        "Review recruitment conversation plan",
        "Review advisor execution conversation plan",
        "Review team pattern plan",
        "Mark unresolved context as review-required"
      ],
      suggestedDiscussionSequence: [
        "Start with evidence freshness",
        "Discuss context, not judgment",
        "Separate support need from punishment",
        "Avoid interpreting missing data as zero"
      ],
      evidenceToReview: [
        "Source evidence",
        "Freshness",
        "Missing rollups",
        "Coaching context",
        "Dashboard and forecast context"
      ],
      createsTasks: false,
      createsCalendarEvents: false,
      sendsAutomatedMessages: false,
      recommendationsAreAutomaticDecisions: false,
      automaticDecisionAllowed: false,
      ...FALSE_FLAGS
    },
    warnings,
    assumptions,
    confidenceLimitations,
    evidenceRefs: uniq([
      ...boundary.evidenceRefs,
      ...recruitmentReviewPlan.evidenceRefs,
      ...advisorReviewPlan.evidenceRefs,
      ...teamReviewPlan.evidenceRefs
    ]),
    sourceEvidenceIds: uniq([
      ...boundary.sourceEvidenceIds,
      ...recruitmentReviewPlan.sourceEvidenceIds,
      ...advisorReviewPlan.sourceEvidenceIds,
      ...teamReviewPlan.sourceEvidenceIds
    ]),
    sourceOwners: uniq([
      ...boundary.sourceOwners,
      ...recruitmentReviewPlan.sourceOwners,
      ...advisorReviewPlan.sourceOwners,
      ...teamReviewPlan.sourceOwners
    ]),
    freshness: boundary.freshness,
    ...FALSE_FLAGS
  };
}

module.exports = {
  buildManagerReviewPlanIntelligence,
  MANAGER_REVIEW_PLAN_INTELLIGENCE_STATUSES,
  MANAGER_REVIEW_PLAN_INTELLIGENCE_DECISIONS
};
