"use strict";

const {
  buildManagerExternalContextBridgeBoundary,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES
} = require("./manager-external-context-bridge-boundary-contract");

const NASH_CONVERSATION_CONTEXT_BRIDGE_STATUSES = Object.freeze({
  READY: "READY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  BLOCKED: "BLOCKED"
});

const NASH_CONVERSATION_CONTEXT_BRIDGE_DECISIONS = Object.freeze({
  EXPORT_CONVERSATION_PREP_CONTEXT: "EXPORT_CONVERSATION_PREP_CONTEXT",
  REQUIRE_MANAGER_REVIEW: "REQUIRE_MANAGER_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const FALSE_FLAGS = Object.freeze({
  contextOnly: true,
  sanitizedOnly: true,
  importsOrExecutesNash: false,
  createsNextBestActionExecution: false,
  sendsAutomatedMessage: false,
  createsTask: false,
  createsCalendarEvent: false,
  createsManipulation: false,
  createsPressureLanguage: false,
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

function prepItem(key, title, context, questionAreas, warnings) {
  const hasContext = context !== undefined && context !== null;

  return {
    key,
    title,
    packetType: "CONVERSATION_PREP_ITEM",
    contextOnly: true,
    sanitizedOnly: true,
    context: hasContext ? clone(context) : { status: "UNKNOWN", reason: "MISSING_CONTEXT" },
    suggestedQuestionAreas: unique(questionAreas),
    warnings: unique(warnings),
    missingData: hasContext ? [] : [`MISSING_${key}`],
    unknownSignals: hasContext ? [] : [`UNKNOWN_${key}`],
    actionFlags: {
      sendsMessage: false,
      createsTask: false,
      createsCalendarEvent: false,
      executesNextBestAction: false,
      automaticDecisionAllowed: false
    }
  };
}

function buildManagerNashConversationContextBridge(input = {}) {
  const safeInput = clone(input) || {};
  const reviewPlan = safeInput.reviewPlanContext || {};
  const coaching = safeInput.coachingContext || {};
  const dashboard = safeInput.dashboardContext || {};
  const forecast = safeInput.forecastContext || {};
  const metrics = safeInput.metricsContext || {};

  const boundary = buildManagerExternalContextBridgeBoundary({
    ...safeInput,
    requestedUse: safeInput.requestedUse || "CONVERSATION_PREP_CONTEXT",
    externalContext: safeInput.conversationPrepContext || reviewPlan.executiveReviewPlanSummary || reviewPlan,
    reviewPlanContext: safeInput.reviewPlanContext,
    coachingContext: safeInput.coachingContext,
    dashboardContext: safeInput.dashboardContext,
    forecastContext: safeInput.forecastContext,
    metricsContext: safeInput.metricsContext
  });

  const blocked = boundary.status === MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.BLOCKED;

  const conversationPrepPacket = {
    consumer: "NASH",
    exportType: "CONVERSATION_PREP_CONTEXT",
    packetVersion: "1.0",
    contextOnly: true,
    sanitizedOnly: true,
    suggestedQuestionAreas: [
      prepItem(
        "EVIDENCE_TO_REVIEW",
        "Evidence to review before conversation",
        reviewPlan.evidenceToReview || reviewPlan.managerReviewAgenda || reviewPlan,
        ["Which evidence is confirmed?", "What is still missing?", "What should not be interpreted yet?"],
        ["Evidence review is not decision authority."]
      ),
      prepItem(
        "COACHING_CONVERSATION_TOPICS",
        "Coaching conversation topics",
        coaching.recommendedConversationTopics || coaching.executiveCoachingSummary || coaching,
        ["What support is needed?", "What question would help the advisor explain context?", "What should remain non-punitive?"],
        ["Coaching topic is not punishment truth."]
      ),
      prepItem(
        "FORECAST_AND_DASHBOARD_CONTEXT",
        "Forecast and dashboard context",
        forecast.executiveSummary || dashboard.executiveSummary || dashboard,
        ["Which scenario assumption matters?", "Which dashboard signal needs review?", "Which signal is stale or incomplete?"],
        ["Scenario context is not guarantee, ranking, revenue or promotion truth."]
      ),
      prepItem(
        "SAFE_LANGUAGE_GUARDRAILS",
        "Safe language guardrails",
        metrics,
        ["Use evidence-first language.", "Avoid pressure language.", "Ask before interpreting intent."],
        ["No manipulation, shame, threat, fear framing or invented intention."]
      )
    ],
    forbiddenOutputs: [
      "NO_AUTOMATED_MESSAGES",
      "NO_NEXT_BEST_ACTION_EXECUTION",
      "NO_PRESSURE_LANGUAGE",
      "NO_MANIPULATION",
      "NO_INVENTED_INTENT",
      "NO_DECISION_AUTHORITY"
    ],
    flags: { ...FALSE_FLAGS }
  };

  return {
    status: blocked
      ? NASH_CONVERSATION_CONTEXT_BRIDGE_STATUSES.BLOCKED
      : boundary.reviewRequired
        ? NASH_CONVERSATION_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED
        : NASH_CONVERSATION_CONTEXT_BRIDGE_STATUSES.READY,
    decision: blocked
      ? NASH_CONVERSATION_CONTEXT_BRIDGE_DECISIONS.BLOCK_FORBIDDEN_USE
      : boundary.reviewRequired
        ? NASH_CONVERSATION_CONTEXT_BRIDGE_DECISIONS.REQUIRE_MANAGER_REVIEW
        : NASH_CONVERSATION_CONTEXT_BRIDGE_DECISIONS.EXPORT_CONVERSATION_PREP_CONTEXT,
    boundary,
    conversationPrepPacket,
    evidenceRefs: boundary.evidenceRefs,
    sourceEvidenceIds: boundary.sourceEvidenceIds,
    sourceOwners: boundary.sourceOwners,
    freshness: boundary.freshness,
    warnings: unique(boundary.warnings.concat(conversationPrepPacket.suggestedQuestionAreas.flatMap((item) => item.warnings))),
    limitations: unique(boundary.limitations),
    missingData: unique(boundary.missingData.concat(conversationPrepPacket.suggestedQuestionAreas.flatMap((item) => item.missingData))),
    unknownSignals: unique(boundary.unknownSignals.concat(conversationPrepPacket.suggestedQuestionAreas.flatMap((item) => item.unknownSignals))),
    stalePeriods: boundary.stalePeriods,
    defaultZeroRisks: boundary.defaultZeroRisks,
    truthFlags: { ...FALSE_FLAGS, ...boundary.truthFlags },
    actionFlags: { ...boundary.actionFlags }
  };
}

module.exports = {
  buildManagerNashConversationContextBridge,
  NASH_CONVERSATION_CONTEXT_BRIDGE_STATUSES,
  NASH_CONVERSATION_CONTEXT_BRIDGE_DECISIONS
};
