"use strict";

const MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES = Object.freeze({
  READY: "READY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS = Object.freeze({
  ALLOW_SANITIZED_CONTEXT_EXPORT: "ALLOW_SANITIZED_CONTEXT_EXPORT",
  REQUIRE_MANAGER_REVIEW: "REQUIRE_MANAGER_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const ALLOWED_USES = Object.freeze([
  "SANITIZED_CONTEXT_EXPORT",
  "MANAGER_REVIEW",
  "CONVERSATION_PREP_CONTEXT",
  "BEHAVIOR_REVIEW_CONTEXT",
  "PRIVATE_ENGAGEMENT_CONTEXT",
  "COACHING_CONTEXT",
  "REVIEW_PLAN_CONTEXT",
  "DEVELOPMENT_CONTEXT",
  "EXECUTIVE_SUMMARY_CONTEXT"
]);

const FORBIDDEN_USES = Object.freeze([
  "NASH_NEXT_BEST_ACTION_EXECUTION",
  "MICK_DISCIPLINARY_TRUTH",
  "GAMIFICATION_LEADERBOARD",
  "PUBLIC_RANKING",
  "AUTOMATED_TASK_CREATION",
  "CALENDAR_WRITE",
  "MESSAGE_SEND",
  "EMAIL_SEND",
  "SLACK_SEND",
  "HUMAN_RANKING",
  "PERFORMANCE_LEADERBOARD",
  "PROMOTION_DECISION",
  "PUNISHMENT",
  "TERMINATION",
  "DISCIPLINARY_ACTION",
  "HR_DECISION",
  "COMPENSATION",
  "PAYOUT",
  "REVENUE_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "AUTOMATIC_DECISION",
  "PRECONTRACT_TRUTH",
  "HIRING_TRUTH",
  "DATABASE_WRITE",
  "FILESYSTEM_WRITE",
  "CACHE_WRITE",
  "MIGRATION_WRITE",
  "SCHEMA_WRITE",
  "UI_RENDERING"
]);

const FALSE_TRUTH_FLAGS = Object.freeze({
  sanitizedContextExportOnly: true,
  executesExternalEngine: false,
  executesNash: false,
  executesMick: false,
  executesEngagementRuntime: false,
  createsNashNextBestActionExecution: false,
  createsMickDisciplinaryTruth: false,
  createsGamificationLeaderboardTruth: false,
  createsPublicRankingTruth: false,
  createsAutomatedTaskCreation: false,
  createsCalendarWrite: false,
  createsMessageSend: false,
  createsEmailSend: false,
  createsSlackSend: false,
  createsAutomatedAction: false,
  automaticDecisionAllowed: false,
  createsRankingTruth: false,
  createsPerformanceLeaderboardTruth: false,
  createsPromotionTruth: false,
  createsPunishmentTruth: false,
  createsTerminationTruth: false,
  createsDisciplinaryActionTruth: false,
  createsHRTruth: false,
  createsAdvisorLifecycleTruth: false,
  createsPrecontractTruth: false,
  createsHiringTruth: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsRevenue: false,
  createsCompensation: false,
  createsPayoutTruth: false,
  writesToDatabase: false,
  writesToFilesystem: false,
  writesToCache: false,
  writesMigration: false,
  writesSchema: false,
  rendersUI: false
});

function arrayOf(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null);
  return [value];
}

function unique(values) {
  return [...new Set(arrayOf(values).flat().filter((item) => item !== undefined && item !== null && item !== ""))];
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function isStaleFreshness(value) {
  if (!value) return false;
  if (typeof value === "string") return value.toUpperCase().includes("STALE");
  if (typeof value === "object") {
    return String(value.status || value.state || value.freshness || "").toUpperCase().includes("STALE");
  }
  return false;
}

function collectFromContext(target, input) {
  if (!input || typeof input !== "object") return;

  target.evidenceRefs.push(...arrayOf(input.evidenceRefs));
  target.evidenceRefs.push(...arrayOf(input.evidenceRef));
  target.sourceEvidenceIds.push(...arrayOf(input.sourceEvidenceIds));
  target.sourceEvidenceIds.push(...arrayOf(input.sourceEvidenceId));
  target.sourceOwners.push(...arrayOf(input.sourceOwners));
  target.sourceOwners.push(...arrayOf(input.sourceOwner));
  target.freshness.push(...arrayOf(input.freshness));
  target.warnings.push(...arrayOf(input.warnings));
  target.limitations.push(...arrayOf(input.limitations));
  target.missingData.push(...arrayOf(input.missingData));
  target.unknownSignals.push(...arrayOf(input.unknownSignals));
  target.stalePeriods.push(...arrayOf(input.stalePeriods));
  target.defaultZeroRisks.push(...arrayOf(input.defaultZeroRisks));
  target.blockedPeriods.push(...arrayOf(input.blockedPeriods));
}

function buildManagerExternalContextBridgeBoundary(input = {}) {
  const safeInput = clone(input) || {};
  const requestedUse = safeInput.requestedUse || "SANITIZED_CONTEXT_EXPORT";

  const collected = {
    evidenceRefs: [],
    sourceEvidenceIds: [],
    sourceOwners: [],
    freshness: [],
    warnings: [],
    limitations: [],
    missingData: [],
    unknownSignals: [],
    stalePeriods: [],
    defaultZeroRisks: [],
    blockedPeriods: []
  };

  collectFromContext(collected, safeInput);
  collectFromContext(collected, safeInput.externalContext);
  collectFromContext(collected, safeInput.reviewPlanContext);
  collectFromContext(collected, safeInput.coachingContext);
  collectFromContext(collected, safeInput.dashboardContext);
  collectFromContext(collected, safeInput.forecastContext);
  collectFromContext(collected, safeInput.metricsContext);
  collectFromContext(collected, safeInput.historicalContext);

  if (!safeInput.externalContext) {
    collected.unknownSignals.push("MISSING_EXTERNAL_CONTEXT");
    collected.missingData.push("MISSING_EXTERNAL_CONTEXT");
  }

  if (!safeInput.reviewPlanContext) {
    collected.unknownSignals.push("MISSING_REVIEW_PLAN_CONTEXT");
    collected.missingData.push("MISSING_REVIEW_PLAN_CONTEXT");
  }

  if (!safeInput.coachingContext) {
    collected.unknownSignals.push("MISSING_COACHING_CONTEXT");
    collected.missingData.push("MISSING_COACHING_CONTEXT");
  }

  if (!safeInput.dashboardContext) {
    collected.unknownSignals.push("MISSING_DASHBOARD_CONTEXT");
    collected.missingData.push("MISSING_DASHBOARD_CONTEXT");
  }

  if (!safeInput.forecastContext) {
    collected.unknownSignals.push("MISSING_FORECAST_CONTEXT");
    collected.missingData.push("MISSING_FORECAST_CONTEXT");
  }

  if (!safeInput.metricsContext) {
    collected.unknownSignals.push("MISSING_METRICS_CONTEXT");
    collected.missingData.push("MISSING_METRICS_CONTEXT");
  }

  if (safeInput.rollups === undefined || safeInput.rollups === null) {
    collected.unknownSignals.push("MISSING_ROLLUPS");
    collected.missingData.push("MISSING_ROLLUPS");
  }

  const explicitZeroValues = arrayOf(safeInput.explicitZeroValues).concat(arrayOf(safeInput.zeroValueSignals));
  if (explicitZeroValues.length > 0) {
    collected.defaultZeroRisks.push("EXPLICIT_ZERO_VALUE_REQUIRES_CONTEXT");
    collected.warnings.push("Explicit zero values are context only and must not become poor performance, ranking, punishment or termination truth.");
  }

  const evidenceRefs = unique(collected.evidenceRefs);
  const sourceEvidenceIds = unique(collected.sourceEvidenceIds);
  const sourceOwners = unique(collected.sourceOwners);
  const freshness = unique(collected.freshness);
  const warnings = unique(collected.warnings);
  const limitations = unique(collected.limitations);
  const missingData = unique(collected.missingData);
  const unknownSignals = unique(collected.unknownSignals);
  const defaultZeroRisks = unique(collected.defaultZeroRisks);
  const blockedPeriods = unique(collected.blockedPeriods);
  const stalePeriods = unique(
    collected.stalePeriods.concat(freshness.filter((item) => isStaleFreshness(item)))
  );

  const missingEvidence = evidenceRefs.length === 0 && sourceEvidenceIds.length === 0;
  const missingSourceOwner = sourceOwners.length === 0;
  const missingFreshness = freshness.length === 0;

  if (missingEvidence) missingData.push("MISSING_EVIDENCE");
  if (missingSourceOwner) missingData.push("MISSING_SOURCE_OWNER");
  if (missingFreshness) missingData.push("MISSING_FRESHNESS");
  if (stalePeriods.length > 0) warnings.push("Stale freshness requires manager review before external context export.");
  if (blockedPeriods.length > 0) warnings.push("Blocked periods remain review-required and must not collapse to zero.");

  const forbiddenUse = FORBIDDEN_USES.includes(requestedUse);
  const allowedUse = ALLOWED_USES.includes(requestedUse);

  let status = MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.READY;
  let decision = MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS.ALLOW_SANITIZED_CONTEXT_EXPORT;
  const blockedReasons = [];

  if (forbiddenUse) {
    status = MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.BLOCKED;
    decision = MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS.BLOCK_FORBIDDEN_USE;
    blockedReasons.push(`FORBIDDEN_USE:${requestedUse}`);
  } else if (!allowedUse) {
    status = MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED;
    decision = MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS.REQUIRE_MANAGER_REVIEW;
    unknownSignals.push(`UNKNOWN_REQUESTED_USE:${requestedUse}`);
  } else if (
    missingData.length > 0 ||
    unknownSignals.length > 0 ||
    stalePeriods.length > 0 ||
    blockedPeriods.length > 0
  ) {
    status = MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED;
    decision = MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS.REQUIRE_MANAGER_REVIEW;
  }

  return {
    status,
    decision,
    requestedUse,
    allowedUses: [...ALLOWED_USES],
    forbiddenUses: [...FORBIDDEN_USES],
    allowedUse,
    forbiddenUse,
    blockedReasons: unique(blockedReasons),
    reviewRequired: status !== MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.READY,
    sanitizedContextExportOnly: true,
    externalConsumers: Object.freeze({
      nash: "CONVERSATION_PREP_CONTEXT_ONLY",
      mick: "BEHAVIOR_REVIEW_CONTEXT_ONLY",
      engagement: "PRIVATE_ENGAGEMENT_CONTEXT_ONLY"
    }),
    evidenceRefs: unique(evidenceRefs),
    sourceEvidenceIds: unique(sourceEvidenceIds),
    sourceOwners: unique(sourceOwners),
    freshness: unique(freshness),
    warnings: unique(warnings),
    limitations: unique(limitations),
    missingData: unique(missingData),
    unknownSignals: unique(unknownSignals),
    stalePeriods: unique(stalePeriods),
    defaultZeroRisks: unique(defaultZeroRisks),
    blockedPeriods: unique(blockedPeriods),
    truthFlags: { ...FALSE_TRUTH_FLAGS },
    actionFlags: {
      createsTask: false,
      createsCalendarEvent: false,
      sendsMessage: false,
      sendsEmail: false,
      sendsSlackMessage: false,
      executesExternalEngine: false,
      executesNextBestAction: false,
      createsAutomatedAction: false
    },
    notes: [
      "External Context Bridge exports sanitized context packets only.",
      "Nash may receive conversation-prep context only.",
      "Mick may receive behavior-review context only.",
      "Engagement/Gamification may receive private motivation context only.",
      "No public leaderboard, pressure mechanics, manipulation, writes, actions or official truth are created."
    ]
  };
}

module.exports = {
  buildManagerExternalContextBridgeBoundary,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS,
  ALLOWED_USES,
  FORBIDDEN_USES,
  FALSE_TRUTH_FLAGS
};
