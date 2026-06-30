"use strict";

const {
  buildManagerExternalContextBridgeBoundary,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES
} = require("./manager-external-context-bridge-boundary-contract");

const MICK_BEHAVIOR_CONTEXT_BRIDGE_STATUSES = Object.freeze({
  READY: "READY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  BLOCKED: "BLOCKED"
});

const MICK_BEHAVIOR_CONTEXT_BRIDGE_DECISIONS = Object.freeze({
  EXPORT_BEHAVIOR_REVIEW_CONTEXT: "EXPORT_BEHAVIOR_REVIEW_CONTEXT",
  REQUIRE_MANAGER_REVIEW: "REQUIRE_MANAGER_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const FALSE_FLAGS = Object.freeze({
  contextOnly: true,
  sanitizedOnly: true,
  importsOrExecutesMick: false,
  createsDisciplineTruth: false,
  createsPersonalityJudgment: false,
  createsSurveillanceTruth: false,
  ownsTasks: false,
  createsTask: false,
  createsCalendarEvent: false,
  sendsAutomatedMessage: false,
  automaticDecisionAllowed: false,
  createsRankingTruth: false,
  createsPromotionTruth: false,
  createsPunishmentTruth: false,
  createsTerminationTruth: false,
  createsHRTruth: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsPayoutTruth: false,
  createsAdvisorLifecycleTruth: false
});

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function arrayOf(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function unique(values) {
  return [...new Set(arrayOf(values).flat().filter((item) => item !== undefined && item !== null && item !== ""))];
}

function behaviorItem(key, title, context, reviewQuestions, warnings) {
  const hasContext = context !== undefined && context !== null;

  return {
    key,
    title,
    packetType: "BEHAVIOR_REVIEW_ITEM",
    contextOnly: true,
    sanitizedOnly: true,
    context: hasContext ? clone(context) : { status: "UNKNOWN", reason: "MISSING_CONTEXT" },
    reviewQuestions: unique(reviewQuestions),
    warnings: unique(warnings),
    missingData: hasContext ? [] : [`MISSING_${key}`],
    unknownSignals: hasContext ? [] : [`UNKNOWN_${key}`],
    flags: { ...FALSE_FLAGS }
  };
}

function buildManagerMickBehaviorContextBridge(input = {}) {
  const safeInput = clone(input) || {};
  const reviewPlan = safeInput.reviewPlanContext || {};
  const coaching = safeInput.coachingContext || {};
  const dashboard = safeInput.dashboardContext || {};
  const forecast = safeInput.forecastContext || {};
  const metrics = safeInput.metricsContext || {};

  const boundary = buildManagerExternalContextBridgeBoundary({
    ...safeInput,
    requestedUse: safeInput.requestedUse || "BEHAVIOR_REVIEW_CONTEXT",
    externalContext: safeInput.behaviorReviewContext || coaching.executiveCoachingSummary || reviewPlan,
    reviewPlanContext: safeInput.reviewPlanContext,
    coachingContext: safeInput.coachingContext,
    dashboardContext: safeInput.dashboardContext,
    forecastContext: safeInput.forecastContext,
    metricsContext: safeInput.metricsContext
  });

  const blocked = boundary.status === MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.BLOCKED;

  const behaviorReviewPacket = {
    consumer: "MICK",
    exportType: "BEHAVIOR_REVIEW_CONTEXT",
    packetVersion: "1.0",
    contextOnly: true,
    sanitizedOnly: true,
    behaviorReviewAreas: [
      behaviorItem(
        "HABIT_CONSISTENCY_CONTEXT",
        "Habit consistency context",
        coaching.habitConsistencyContext || metrics.followupConsistencyContext || dashboard.advisorActivityCard,
        ["Which routine appears inconsistent?", "What evidence supports the pattern?", "What context is missing?"],
        ["Habit context is not human worth, diagnosis, surveillance or discipline truth."]
      ),
      behaviorItem(
        "ACTIVITY_RHYTHM_CONTEXT",
        "Activity rhythm context",
        dashboard.activityRhythmContext || metrics.activityRhythmContext || reviewPlan.activityRhythmReviewPlan,
        ["What rhythm is visible?", "Is the period complete?", "Are there blocked or stale periods?"],
        ["Activity rhythm context is not termination truth."]
      ),
      behaviorItem(
        "FOLLOW_UP_EXECUTION_CONTEXT",
        "Follow-up execution context",
        reviewPlan.followupConsistencyReviewPlan || coaching.followupConsistencyCoaching || metrics.followupContext,
        ["Which follow-up behavior should be reviewed?", "What is evidence-based?", "What cannot be inferred?"],
        ["Follow-up execution context does not create punishment truth."]
      ),
      behaviorItem(
        "SUPPORT_NEED_CONTEXT",
        "Support need context",
        coaching.supportNeedContext || reviewPlan.supportCoachingReviewPlan || forecast.supportCoachingForecastContext,
        ["What support may help?", "What manager conversation is safer?", "What should not be treated as discipline?"],
        ["Support need context is not HR or disciplinary truth."]
      )
    ],
    forbiddenOutputs: [
      "NO_DISCIPLINARY_TRUTH",
      "NO_PERSONALITY_JUDGMENT",
      "NO_SURVEILLANCE_TRUTH",
      "NO_TASK_OWNERSHIP",
      "NO_HR_TRUTH",
      "NO_AUTOMATED_ACTION"
    ],
    flags: { ...FALSE_FLAGS }
  };

  return {
    status: blocked
      ? MICK_BEHAVIOR_CONTEXT_BRIDGE_STATUSES.BLOCKED
      : boundary.reviewRequired
        ? MICK_BEHAVIOR_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED
        : MICK_BEHAVIOR_CONTEXT_BRIDGE_STATUSES.READY,
    decision: blocked
      ? MICK_BEHAVIOR_CONTEXT_BRIDGE_DECISIONS.BLOCK_FORBIDDEN_USE
      : boundary.reviewRequired
        ? MICK_BEHAVIOR_CONTEXT_BRIDGE_DECISIONS.REQUIRE_MANAGER_REVIEW
        : MICK_BEHAVIOR_CONTEXT_BRIDGE_DECISIONS.EXPORT_BEHAVIOR_REVIEW_CONTEXT,
    boundary,
    behaviorReviewPacket,
    evidenceRefs: boundary.evidenceRefs,
    sourceEvidenceIds: boundary.sourceEvidenceIds,
    sourceOwners: boundary.sourceOwners,
    freshness: boundary.freshness,
    warnings: unique(boundary.warnings.concat(behaviorReviewPacket.behaviorReviewAreas.flatMap((item) => item.warnings))),
    limitations: unique(boundary.limitations),
    missingData: unique(boundary.missingData.concat(behaviorReviewPacket.behaviorReviewAreas.flatMap((item) => item.missingData))),
    unknownSignals: unique(boundary.unknownSignals.concat(behaviorReviewPacket.behaviorReviewAreas.flatMap((item) => item.unknownSignals))),
    stalePeriods: boundary.stalePeriods,
    defaultZeroRisks: boundary.defaultZeroRisks,
    truthFlags: { ...FALSE_FLAGS, ...boundary.truthFlags },
    actionFlags: { ...boundary.actionFlags }
  };
}

module.exports = {
  buildManagerMickBehaviorContextBridge,
  MICK_BEHAVIOR_CONTEXT_BRIDGE_STATUSES,
  MICK_BEHAVIOR_CONTEXT_BRIDGE_DECISIONS
};
