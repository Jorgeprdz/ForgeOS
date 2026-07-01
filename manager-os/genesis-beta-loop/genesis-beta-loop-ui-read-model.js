"use strict";

/**
 * Genesis Beta Loop UI Read Model Prep.
 *
 * Converts Human Review Packet output into a stable, manager-facing
 * read-only card model for future UI rendering. This module does not render
 * UI, approve, send, unlock delivery, call provider runtime, or create truth.
 */

const {
  buildGenesisBetaLoopHumanReviewPacket,
} = require("./genesis-beta-loop-human-review-packet");

const READ_MODEL_STATUS = "READY_FOR_UI_READ_MODEL";
const READ_MODEL_DECISION = "PRESENT_REVIEW_PACKET_AS_READ_ONLY_UI_MODEL";

const FALSE_FLAGS = Object.freeze({
  approvalGranted: false,
  approvedForDeliveryPreparation: false,
  approvedForSendExecution: false,
  deliveryCandidateCreated: false,
  sendable: false,
  canApproveInThisModel: false,
  canSendInThisModel: false,
  canCreateTaskInThisModel: false,
  canCreateCalendarInThisModel: false,
  canCreateTruthInThisModel: false,
  sendsMessage: false,
  executesProviderRuntime: false,
  executesLlmRuntime: false,
  createsTask: false,
  createsCalendarEvent: false,
  createsCrmWrite: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsPayoutTruth: false,
  createsLifecycleTruth: false,
  createsHrTruth: false,
  createsRankingTruth: false,
  createsPunishmentTruth: false,
  createsPersonalityTruth: false,
});

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(asArray(values).flat().filter(present))];
}

function normalizeInputs(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input && input.packets)) return input.packets;
  if (Array.isArray(input && input.scenarios)) return input.scenarios;
  if (Array.isArray(input && input.items)) return input.items;
  return [input || {}];
}

function isPacket(input) {
  return Boolean(input && input.packetStatus && input.packetDecision);
}

function toPacket(input) {
  return isPacket(input) ? clone(input) : buildGenesisBetaLoopHumanReviewPacket(input);
}

function scenarioLabel(packet) {
  const scenarioId = packet.scenarioId || "UNKNOWN_SCENARIO";

  if (scenarioId.includes("JORGE_MARIA")) {
    return {
      title: "Jorge / Maria follow-up review",
      subtitle: "relationship follow-up context, not send approval",
    };
  }

  if (scenarioId.includes("ANDRES_JUAN")) {
    return {
      title: "Andres / Juan bonus proximity review",
      subtitle: "motivational context / candidate estimate, not payout truth",
    };
  }

  if (scenarioId.includes("LUPITA_MARIA")) {
    return {
      title: "Lupita / Maria car goal review",
      subtitle: "motivation context, not compensation truth",
    };
  }

  return {
    title: "Genesis Beta Loop review",
    subtitle: "review context, not approval or send execution",
  };
}

function badge(label, tone, extra = {}) {
  return {
    label,
    tone,
    ...extra,
  };
}

function evidenceSummary(packet) {
  return {
    evidenceRefs: unique(packet.evidenceRefs),
    sourceOwners: unique(packet.sourceOwners),
    freshness: packet.freshness || "UNKNOWN",
  };
}

function uncertaintySummary(packet) {
  const uncertainty = packet.uncertainty || {};
  return {
    freshness: uncertainty.freshness || packet.freshness || "UNKNOWN",
    blockedStages: unique(uncertainty.blockedStages),
    warnings: unique(uncertainty.warnings),
    stageSignals: unique(uncertainty.stageSignals),
  };
}

function missingContextSummary(packet) {
  return {
    missingContext: unique(packet.missingContext),
  };
}

function article0Reminder(packet) {
  const principle = packet.article0Principle || "Forge exists to strengthen human judgment, not replace it.";
  return `${principle} Final authority: HUMAN.`;
}

function cardFromPacket(packet, index) {
  const labels = scenarioLabel(packet);
  const cardId = `genesis-beta-loop-card-${packet.scenarioId || index + 1}`;

  return {
    cardId,
    scenarioId: packet.scenarioId || "UNKNOWN_SCENARIO",
    title: labels.title,
    subtitle: labels.subtitle,
    statusLabel: packet.packetStatus || "READY_FOR_HUMAN_REVIEW_PACKET",
    decisionLabel: packet.packetDecision || "PRESENT_TO_HUMAN_FOR_REVIEW_ONLY",
    safetyBadge: badge(packet.safetyStatus || "UNKNOWN", "safety_review_status"),
    draftQualityBadge: badge(packet.draftQualityStatus || "DRAFT_REVIEW_REQUIRED", "draft_quality_status"),
    approvalBadge: badge("NOT_APPROVED", "approval_locked", {
      approvalGranted: false,
      approvedForDeliveryPreparation: false,
    }),
    boundaryBadge: badge("REVIEW_ONLY_NOT_SENDABLE", "boundary_locked", {
      reviewOnly: true,
      sendable: false,
    }),
    evidenceSummary: evidenceSummary(packet),
    reasoningSummary: clone(packet.reasoningSummary) || {},
    uncertaintySummary: uncertaintySummary(packet),
    missingContextSummary: missingContextSummary(packet),
    candidateDraftPreview: packet.candidateDraftText || null,
    humanReviewQuestions: unique(packet.humanReviewQuestions),
    approvalPrerequisites: unique(packet.approvalPrerequisites),
    actionBoundary: {
      ...(clone(packet.actionBoundary) || {}),
      uiReadModelOnly: true,
      noUiRendering: true,
      noApprovalMutation: true,
      notDeliveryCandidate: true,
      notSendable: true,
      deliveryPreparationLocked: true,
    },
    blockedReason: unique(packet.blockedReason),
    article0Reminder: article0Reminder(packet),
    warnings: unique(packet.warnings),
    limitations: unique(packet.limitations),
    reviewOnly: true,
    ...FALSE_FLAGS,
  };
}

function buildGenesisBetaLoopUiReadModel(input = {}) {
  const before = JSON.stringify(input);
  const packets = normalizeInputs(input).map(toPacket);
  const cards = packets.map(cardFromPacket);

  const readModel = {
    readModelStatus: READ_MODEL_STATUS,
    readModelDecision: READ_MODEL_DECISION,
    article0Status: "ARTICLE_0_ACTIVE",
    article0Principle: "Forge exists to strengthen human judgment, not replace it.",
    article0Gate: "Does this strengthen human judgment, or does it create dependency?",
    finalAuthority: "HUMAN",
    forgeRole: "AUGMENTS_JUDGMENT",
    reviewOnly: true,
    humanDecisionCheckpointRequired: true,
    evidenceVisible: true,
    reasoningVisible: true,
    uncertaintyVisible: true,
    missingContextVisible: true,
    article0JudgmentQuestionsVisible: true,
    cards,
    ...FALSE_FLAGS,
  };

  if (JSON.stringify(input) !== before) {
    throw new Error("Genesis Beta Loop UI Read Model mutated input");
  }

  return readModel;
}

module.exports = {
  buildGenesisBetaLoopUiReadModel,
  GENESIS_BETA_LOOP_UI_READ_MODEL_STATUS: READ_MODEL_STATUS,
  GENESIS_BETA_LOOP_UI_READ_MODEL_DECISION: READ_MODEL_DECISION,
};
