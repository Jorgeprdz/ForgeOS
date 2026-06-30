"use strict";

const {
  buildManagerExternalContextBridgeBoundary,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES
} = require("./manager-external-context-bridge-boundary-contract");

const ENGAGEMENT_CONTEXT_BRIDGE_STATUSES = Object.freeze({
  READY: "READY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  BLOCKED: "BLOCKED"
});

const ENGAGEMENT_CONTEXT_BRIDGE_DECISIONS = Object.freeze({
  EXPORT_PRIVATE_ENGAGEMENT_CONTEXT: "EXPORT_PRIVATE_ENGAGEMENT_CONTEXT",
  REQUIRE_MANAGER_REVIEW: "REQUIRE_MANAGER_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const FALSE_FLAGS = Object.freeze({
  contextOnly: true,
  sanitizedOnly: true,
  importsOrExecutesEngagementRuntime: false,
  createsGamificationRuntime: false,
  createsPublicLeaderboard: false,
  createsRankingTruth: false,
  createsPointsAsHumanWorth: false,
  createsPressureMechanic: false,
  createsAddictiveLoop: false,
  createsShameMechanic: false,
  createsTask: false,
  createsCalendarEvent: false,
  sendsAutomatedMessage: false,
  automaticDecisionAllowed: false,
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

function engagementItem(key, title, context, reflections, warnings) {
  const hasContext = context !== undefined && context !== null;

  return {
    key,
    title,
    packetType: "PRIVATE_ENGAGEMENT_ITEM",
    contextOnly: true,
    sanitizedOnly: true,
    privateOnly: true,
    context: hasContext ? clone(context) : { status: "UNKNOWN", reason: "MISSING_CONTEXT" },
    safeReflections: unique(reflections),
    warnings: unique(warnings),
    missingData: hasContext ? [] : [`MISSING_${key}`],
    unknownSignals: hasContext ? [] : [`UNKNOWN_${key}`],
    flags: { ...FALSE_FLAGS }
  };
}

function buildManagerEngagementContextBridge(input = {}) {
  const safeInput = clone(input) || {};
  const reviewPlan = safeInput.reviewPlanContext || {};
  const coaching = safeInput.coachingContext || {};
  const dashboard = safeInput.dashboardContext || {};
  const forecast = safeInput.forecastContext || {};
  const metrics = safeInput.metricsContext || {};

  const boundary = buildManagerExternalContextBridgeBoundary({
    ...safeInput,
    requestedUse: safeInput.requestedUse || "PRIVATE_ENGAGEMENT_CONTEXT",
    externalContext: safeInput.privateEngagementContext || coaching.executiveCoachingSummary || reviewPlan,
    reviewPlanContext: safeInput.reviewPlanContext,
    coachingContext: safeInput.coachingContext,
    dashboardContext: safeInput.dashboardContext,
    forecastContext: safeInput.forecastContext,
    metricsContext: safeInput.metricsContext
  });

  const blocked = boundary.status === MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.BLOCKED;

  const privateEngagementPacket = {
    consumer: "ENGAGEMENT_GAMIFICATION",
    exportType: "PRIVATE_ENGAGEMENT_CONTEXT",
    packetVersion: "1.0",
    contextOnly: true,
    sanitizedOnly: true,
    privateOnly: true,
    engagementAreas: [
      engagementItem(
        "PRIVATE_PROGRESS_REFLECTION",
        "Private progress reflection",
        reviewPlan.managerReviewAgenda || coaching.executiveCoachingSummary || dashboard.executiveSummary,
        ["Reflect progress privately.", "Celebrate evidence-backed consistency only.", "Avoid comparison to others."],
        ["Private progress reflection is not public ranking or human worth."]
      ),
      engagementItem(
        "SAFE_STREAK_CONTEXT",
        "Safe streak context",
        safeInput.streakContext || metrics.streakContext || dashboard.activityRhythmContext,
        ["Use streaks as private encouragement only.", "Reset without shame.", "Avoid pressure mechanics."],
        ["Streak context is not leaderboard, punishment or performance truth."]
      ),
      engagementItem(
        "MOTIVATION_WITHOUT_PRESSURE",
        "Motivation without pressure",
        forecast.scenarioSummary || coaching.supportNeedContext || reviewPlan.supportCoachingReviewPlan,
        ["Encourage the next review conversation.", "Keep economic or activity context non-coercive.", "Surface missing evidence kindly."],
        ["Motivation context must not manipulate, shame, threaten or pressure."]
      )
    ],
    forbiddenOutputs: [
      "NO_PUBLIC_LEADERBOARD",
      "NO_PUBLIC_SCORE",
      "NO_POINTS_AS_WORTH",
      "NO_PRESSURE_MECHANICS",
      "NO_ADDICTIVE_LOOP",
      "NO_RANKING_TRUTH",
      "NO_AUTOMATED_ACTION"
    ],
    flags: { ...FALSE_FLAGS }
  };

  return {
    status: blocked
      ? ENGAGEMENT_CONTEXT_BRIDGE_STATUSES.BLOCKED
      : boundary.reviewRequired
        ? ENGAGEMENT_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED
        : ENGAGEMENT_CONTEXT_BRIDGE_STATUSES.READY,
    decision: blocked
      ? ENGAGEMENT_CONTEXT_BRIDGE_DECISIONS.BLOCK_FORBIDDEN_USE
      : boundary.reviewRequired
        ? ENGAGEMENT_CONTEXT_BRIDGE_DECISIONS.REQUIRE_MANAGER_REVIEW
        : ENGAGEMENT_CONTEXT_BRIDGE_DECISIONS.EXPORT_PRIVATE_ENGAGEMENT_CONTEXT,
    boundary,
    privateEngagementPacket,
    evidenceRefs: boundary.evidenceRefs,
    sourceEvidenceIds: boundary.sourceEvidenceIds,
    sourceOwners: boundary.sourceOwners,
    freshness: boundary.freshness,
    warnings: unique(boundary.warnings.concat(privateEngagementPacket.engagementAreas.flatMap((item) => item.warnings))),
    limitations: unique(boundary.limitations),
    missingData: unique(boundary.missingData.concat(privateEngagementPacket.engagementAreas.flatMap((item) => item.missingData))),
    unknownSignals: unique(boundary.unknownSignals.concat(privateEngagementPacket.engagementAreas.flatMap((item) => item.unknownSignals))),
    stalePeriods: boundary.stalePeriods,
    defaultZeroRisks: boundary.defaultZeroRisks,
    truthFlags: { ...FALSE_FLAGS, ...boundary.truthFlags },
    actionFlags: { ...boundary.actionFlags }
  };
}

module.exports = {
  buildManagerEngagementContextBridge,
  ENGAGEMENT_CONTEXT_BRIDGE_STATUSES,
  ENGAGEMENT_CONTEXT_BRIDGE_DECISIONS
};
