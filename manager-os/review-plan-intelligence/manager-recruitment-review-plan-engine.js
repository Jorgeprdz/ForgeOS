"use strict";

const {
  buildManagerReviewPlanBoundary
} = require("./manager-review-plan-boundary-contract");

const MANAGER_RECRUITMENT_REVIEW_PLAN_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_RECRUITMENT_REVIEW_PLAN_DECISIONS = Object.freeze({
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

function buildManagerRecruitmentReviewPlanContext(input = {}) {
  const safeInput = clone(input) || {};
  const coaching = safeInput.recruitmentCoachingContext || {};
  const metrics = safeInput.recruitmentMetricsContext || {};
  const dashboard = safeInput.recruitmentDashboardContext || {};
  const forecast = safeInput.recruitmentForecastContext || {};
  const historical = safeInput.recruitmentHistoricalContext || {};

  const boundary = buildManagerReviewPlanBoundary({
    requestedUse: safeInput.requestedUse || "REVIEW_PLAN_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    reviewPlanContext: { reviewPlanFamily: "RECRUITMENT_REVIEW_PLAN_CONTEXT" },
    coachingContext: coaching,
    dashboardContext: dashboard,
    metricsContext: metrics,
    forecastContext: forecast,
    historicalContext: historical,
    storageContext: safeInput.historicalStorageBoundaryContext,
    queryPlanContext: safeInput.historicalQueryPlanContext
  });

  const reviewPlanItems = {
    candidateFollowUpReviewPlanItem: item(
      "CANDIDATE_FOLLOW_UP_REVIEW_PLAN",
      "candidate follow-up review plan",
      coaching.candidateFollowUpConversationTopic || metrics.candidatePipelineContext || dashboard.candidatePipelineContext
    ),
    interviewNoShowReviewPlanItem: item(
      "INTERVIEW_NO_SHOW_REVIEW_PLAN",
      "interview no-show review plan",
      coaching.interviewNoShowReviewTopic || metrics.interviewNoShowContext || historical.interviewNoShowTrendContext
    ),
    stalledCandidateReviewPlanItem: item(
      "STALLED_CANDIDATE_REVIEW_PLAN",
      "stalled candidate review plan",
      coaching.stalledCandidateReviewTopic || metrics.stalledCandidateContext || forecast.stalledCandidateForecastContext
    ),
    precontractReadinessReviewPlanItem: item(
      "PRECONTRACT_READINESS_REVIEW_PLAN",
      "precontract readiness review plan",
      coaching.precontractReadinessConversationTopic || metrics.precontractReadinessContext || dashboard.precontractReadinessReviewContext,
      ["Precontract readiness review plan is not precontract truth."]
    ),
    withdrawnBlockedReentryReviewPlanItem: item(
      "WITHDRAWN_BLOCKED_REENTRY_REVIEW_PLAN",
      "withdrawn blocked reentry review plan",
      coaching.withdrawnBlockedReentryConversationTopic || metrics.withdrawnBlockedReentryContext || historical.exceptionTrendContext,
      ["Withdrawn/blocked/reentry review plan is not punishment or hiring truth."]
    ),
    referralAskReviewPlanItem: item(
      "REFERRAL_ASK_REVIEW_PLAN",
      "referral ask review plan",
      coaching.referralAskCoachingTopic || metrics.referralAskContext || dashboard.referralAskContext
    ),
    recruitmentPipelineReviewAgendaItem: item(
      "RECRUITMENT_PIPELINE_REVIEW_AGENDA",
      "recruitment pipeline review agenda",
      coaching.recruitmentPipelineNextConversationAreas || metrics.funnelContext || forecast.conversionForecastContext,
      ["Pipeline review agenda is not automatic hiring decision."]
    )
  };

  const blocked = boundary.blockedUses.length > 0;
  const needsReview = boundary.humanReviewRequired;

  return {
    recruitmentReviewPlanStatus: blocked
      ? MANAGER_RECRUITMENT_REVIEW_PLAN_STATUSES.BLOCKED
      : needsReview
        ? MANAGER_RECRUITMENT_REVIEW_PLAN_STATUSES.NEEDS_HUMAN_REVIEW
        : MANAGER_RECRUITMENT_REVIEW_PLAN_STATUSES.READY_FOR_MANAGER_REVIEW,
    recruitmentReviewPlanDecision: blocked
      ? MANAGER_RECRUITMENT_REVIEW_PLAN_DECISIONS.BLOCK_FORBIDDEN_USE
      : needsReview
        ? MANAGER_RECRUITMENT_REVIEW_PLAN_DECISIONS.REQUIRE_REVIEW
        : MANAGER_RECRUITMENT_REVIEW_PLAN_DECISIONS.PRESENT_REVIEW_PLAN_CONTEXT,
    contextOnly: true,
    reviewPlanItems,
    boundary,
    reviewAgenda: [
      "Candidate follow-up",
      "Interview execution",
      "Stalled candidates",
      "Precontract readiness",
      "Referral ask rhythm"
    ],
    warnings: uniq([...boundary.warnings, "Recruitment review plan is planning context only."]),
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
  buildManagerRecruitmentReviewPlanContext,
  MANAGER_RECRUITMENT_REVIEW_PLAN_STATUSES,
  MANAGER_RECRUITMENT_REVIEW_PLAN_DECISIONS
};
