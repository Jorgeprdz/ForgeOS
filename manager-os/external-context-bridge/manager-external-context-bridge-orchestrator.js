"use strict";

const {
  buildManagerExternalContextBridgeBoundary,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES
} = require("./manager-external-context-bridge-boundary-contract");
const {
  buildManagerNashConversationContextBridge
} = require("./manager-nash-conversation-context-bridge");
const {
  buildManagerMickBehaviorContextBridge
} = require("./manager-mick-behavior-context-bridge");
const {
  buildManagerEngagementContextBridge
} = require("./manager-engagement-context-bridge");

const MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_STATUSES = Object.freeze({
  READY: "READY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  BLOCKED: "BLOCKED"
});

const MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_DECISIONS = Object.freeze({
  EXPORT_SANITIZED_CONTEXT_PACKETS: "EXPORT_SANITIZED_CONTEXT_PACKETS",
  REQUIRE_MANAGER_REVIEW: "REQUIRE_MANAGER_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const FALSE_FLAGS = Object.freeze({
  contextOnly: true,
  sanitizedOnly: true,
  executesExternalEngine: false,
  executesNash: false,
  executesMick: false,
  executesEngagementRuntime: false,
  createsNextBestActionExecution: false,
  createsTask: false,
  createsCalendarEvent: false,
  sendsAutomatedMessage: false,
  createsPublicLeaderboard: false,
  createsRankingTruth: false,
  createsPressureMechanic: false,
  createsAddictiveLoop: false,
  automaticDecisionAllowed: false,
  createsPromotionTruth: false,
  createsPunishmentTruth: false,
  createsTerminationTruth: false,
  createsDisciplinaryActionTruth: false,
  createsHRTruth: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsPayoutTruth: false,
  createsAdvisorLifecycleTruth: false,
  createsPrecontractTruth: false,
  createsHiringTruth: false,
  writesToDatabase: false,
  writesToFilesystem: false,
  writesToCache: false,
  writesMigration: false,
  writesSchema: false,
  rendersUI: false
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

function collectPacketContext(...packets) {
  return {
    evidenceRefs: unique(packets.flatMap((packet) => arrayOf(packet.evidenceRefs))),
    sourceEvidenceIds: unique(packets.flatMap((packet) => arrayOf(packet.sourceEvidenceIds))),
    sourceOwners: unique(packets.flatMap((packet) => arrayOf(packet.sourceOwners))),
    freshness: unique(packets.flatMap((packet) => arrayOf(packet.freshness))),
    warnings: unique(packets.flatMap((packet) => arrayOf(packet.warnings))),
    limitations: unique(packets.flatMap((packet) => arrayOf(packet.limitations))),
    missingData: unique(packets.flatMap((packet) => arrayOf(packet.missingData))),
    unknownSignals: unique(packets.flatMap((packet) => arrayOf(packet.unknownSignals))),
    stalePeriods: unique(packets.flatMap((packet) => arrayOf(packet.stalePeriods))),
    defaultZeroRisks: unique(packets.flatMap((packet) => arrayOf(packet.defaultZeroRisks)))
  };
}

function buildManagerExternalContextBridge(input = {}) {
  const safeInput = clone(input) || {};

  const boundary = buildManagerExternalContextBridgeBoundary({
    ...safeInput,
    requestedUse: safeInput.requestedUse || "SANITIZED_CONTEXT_EXPORT",
    externalContext: safeInput.externalContext || safeInput.reviewPlanContext,
    reviewPlanContext: safeInput.reviewPlanContext,
    coachingContext: safeInput.coachingContext,
    dashboardContext: safeInput.dashboardContext,
    forecastContext: safeInput.forecastContext,
    metricsContext: safeInput.metricsContext
  });

  const nashConversationContext = buildManagerNashConversationContextBridge({
    ...safeInput,
    requestedUse: "CONVERSATION_PREP_CONTEXT"
  });

  const mickBehaviorContext = buildManagerMickBehaviorContextBridge({
    ...safeInput,
    requestedUse: "BEHAVIOR_REVIEW_CONTEXT"
  });

  const engagementContext = buildManagerEngagementContextBridge({
    ...safeInput,
    requestedUse: "PRIVATE_ENGAGEMENT_CONTEXT"
  });

  const packetContext = collectPacketContext(
    boundary,
    nashConversationContext,
    mickBehaviorContext,
    engagementContext
  );

  const blocked =
    boundary.status === MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.BLOCKED ||
    nashConversationContext.status === "BLOCKED" ||
    mickBehaviorContext.status === "BLOCKED" ||
    engagementContext.status === "BLOCKED";

  const reviewRequired =
    boundary.reviewRequired ||
    nashConversationContext.status === "REVIEW_REQUIRED" ||
    mickBehaviorContext.status === "REVIEW_REQUIRED" ||
    engagementContext.status === "REVIEW_REQUIRED";

  const status = blocked
    ? MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_STATUSES.BLOCKED
    : reviewRequired
      ? MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_STATUSES.REVIEW_REQUIRED
      : MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_STATUSES.READY;

  const decision = blocked
    ? MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_DECISIONS.BLOCK_FORBIDDEN_USE
    : reviewRequired
      ? MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_DECISIONS.REQUIRE_MANAGER_REVIEW
      : MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_DECISIONS.EXPORT_SANITIZED_CONTEXT_PACKETS;

  return {
    status,
    decision,
    boundary,
    sanitizedPackets: {
      nashConversationContext: nashConversationContext.conversationPrepPacket,
      mickBehaviorContext: mickBehaviorContext.behaviorReviewPacket,
      engagementContext: engagementContext.privateEngagementPacket
    },
    packetStatuses: {
      nash: nashConversationContext.status,
      mick: mickBehaviorContext.status,
      engagement: engagementContext.status
    },
    executiveBridgeSummary: {
      summaryType: "SANITIZED_EXTERNAL_CONTEXT_EXPORT_SUMMARY",
      contextOnly: true,
      recommendedUse: "Manager may review sanitized packets before any external engine consumes them.",
      consumerBoundaries: [
        "Nash receives conversation-prep context only.",
        "Mick receives behavior-review context only.",
        "Engagement receives private motivation context only."
      ],
      forbiddenOutcomes: [
        "No direct external engine execution.",
        "No automated messages.",
        "No tasks or calendar writes.",
        "No public leaderboard or ranking truth.",
        "No HR, disciplinary, promotion, punishment, termination, revenue, compensation, payout, lifecycle, precontract, hiring or automatic decision truth."
      ],
      automaticDecisionAllowed: false
    },
    evidenceRefs: packetContext.evidenceRefs,
    sourceEvidenceIds: packetContext.sourceEvidenceIds,
    sourceOwners: packetContext.sourceOwners,
    freshness: packetContext.freshness,
    warnings: packetContext.warnings,
    limitations: packetContext.limitations,
    missingData: packetContext.missingData,
    unknownSignals: packetContext.unknownSignals,
    stalePeriods: packetContext.stalePeriods,
    defaultZeroRisks: packetContext.defaultZeroRisks,
    truthFlags: { ...FALSE_FLAGS },
    actionFlags: {
      createsTask: false,
      createsCalendarEvent: false,
      sendsMessage: false,
      sendsEmail: false,
      sendsSlackMessage: false,
      executesExternalEngine: false,
      executesNextBestAction: false,
      createsAutomatedAction: false
    }
  };
}

module.exports = {
  buildManagerExternalContextBridge,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_STATUSES,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_ORCHESTRATOR_DECISIONS
};
