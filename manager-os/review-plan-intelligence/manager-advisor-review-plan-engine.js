"use strict";

const {
  buildManagerReviewPlanBoundary
} = require("./manager-review-plan-boundary-contract");

const MANAGER_ADVISOR_REVIEW_PLAN_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_ADVISOR_REVIEW_PLAN_DECISIONS = Object.freeze({
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

function buildManagerAdvisorReviewPlanContext(input = {}) {
  const safeInput = clone(input) || {};
  const coaching = safeInput.advisorCoachingContext || {};
  const metrics = safeInput.advisorMetricsContext || {};
  const dashboard = safeInput.advisorDashboardContext || {};
  const forecast = safeInput.advisorForecastContext || {};
  const historical = safeInput.advisorHistoricalContext || {};

  const boundary = buildManagerReviewPlanBoundary({
    requestedUse: safeInput.requestedUse || "REVIEW_PLAN_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    reviewPlanContext: { reviewPlanFamily: "ADVISOR_REVIEW_PLAN_CONTEXT" },
    coachingContext: coaching,
    dashboardContext: dashboard,
    metricsContext: metrics,
    forecastContext: forecast,
    historicalContext: historical,
    storageContext: safeInput.historicalStorageBoundaryContext,
    queryPlanContext: safeInput.historicalQueryPlanContext
  });

  const reviewPlanItems = {
    followUpConsistencyReviewPlanItem: item(
      "FOLLOW_UP_CONSISTENCY_REVIEW_PLAN",
      "follow-up consistency review plan",
      coaching.followUpConsistencyConversationTopic || metrics.followupContext || dashboard.followupProspectingReferralContext
    ),
    prospectingReferralReviewPlanItem: item(
      "PROSPECTING_REFERRAL_REVIEW_PLAN",
      "prospecting/referral review plan",
      coaching.prospectingReferralConversationTopic || metrics.prospectingReferralContext || forecast.prospectingReferralForecastContext
    ),
    appointmentRhythmReviewPlanItem: item(
      "APPOINTMENT_RHYTHM_REVIEW_PLAN",
      "appointment rhythm review plan",
      coaching.appointmentRhythmReviewTopic || metrics.appointmentContext || dashboard.appointmentContext
    ),
    pipelineReviewPlanItem: item(
      "PIPELINE_REVIEW_PLAN",
      "pipeline review plan",
      coaching.pipelineReviewTopic || metrics.pipelineContext || forecast.pipelineForecastContext
    ),
    productionReviewPlanItem: item(
      "PRODUCTION_REVIEW_PLAN",
      "production review plan",
      coaching.productionCoachingTopic || metrics.productionContext || dashboard.productionContext,
      ["Production review plan is not revenue truth."]
    ),
    qualificationReviewPlanItem: item(
      "QUALIFICATION_REVIEW_PLAN",
      "qualification review plan",
      coaching.qualificationCoachingTopic || metrics.qualificationContext || forecast.qualificationForecastContext,
      ["Qualification review plan is not promotion or lifecycle truth."]
    ),
    supportCoachingReviewPlanItem: item(
      "SUPPORT_COACHING_REVIEW_PLAN",
      "support/coaching review plan",
      coaching.supportCoachingNeedTopic || metrics.supportCoachingContext || dashboard.supportCoachingContext,
      ["Support/coaching review plan is not punishment truth."]
    ),
    activityGapReviewPlanItem: item(
      "ACTIVITY_GAP_REVIEW_PLAN",
      "activity gap review plan",
      coaching.activityGapConversationTopic || metrics.activityContext || historical.activityTrendContext,
      ["Activity gap review plan is not termination truth."]
    )
  };

  const blocked = boundary.blockedUses.length > 0;
  const needsReview = boundary.humanReviewRequired;

  return {
    advisorReviewPlanStatus: blocked
      ? MANAGER_ADVISOR_REVIEW_PLAN_STATUSES.BLOCKED
      : needsReview
        ? MANAGER_ADVISOR_REVIEW_PLAN_STATUSES.NEEDS_HUMAN_REVIEW
        : MANAGER_ADVISOR_REVIEW_PLAN_STATUSES.READY_FOR_MANAGER_REVIEW,
    advisorReviewPlanDecision: blocked
      ? MANAGER_ADVISOR_REVIEW_PLAN_DECISIONS.BLOCK_FORBIDDEN_USE
      : needsReview
        ? MANAGER_ADVISOR_REVIEW_PLAN_DECISIONS.REQUIRE_REVIEW
        : MANAGER_ADVISOR_REVIEW_PLAN_DECISIONS.PRESENT_REVIEW_PLAN_CONTEXT,
    contextOnly: true,
    reviewPlanItems,
    boundary,
    reviewAgenda: [
      "Follow-up consistency",
      "Prospecting/referrals",
      "Appointments",
      "Pipeline",
      "Production context",
      "Qualification context",
      "Support need"
    ],
    warnings: uniq([...boundary.warnings, "Advisor review plan is planning context only."]),
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
  buildManagerAdvisorReviewPlanContext,
  MANAGER_ADVISOR_REVIEW_PLAN_STATUSES,
  MANAGER_ADVISOR_REVIEW_PLAN_DECISIONS
};
