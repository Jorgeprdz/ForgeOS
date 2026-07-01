"use strict";

/**
 * Genesis Beta Loop Human Review Packet.
 *
 * Builds a review-only artifact from Genesis Beta Loop real adapter output.
 * It does not approve, send, unlock delivery preparation, execute runtime,
 * write tasks/calendar/CRM, or create downstream truth.
 */

const crypto = require("crypto");

const {
  buildGenesisBetaLoopRealResponse,
} = require("./genesis-beta-loop-real-adapter-wiring");

const PACKET_STATUS = "READY_FOR_HUMAN_REVIEW_PACKET";
const PACKET_DECISION = "PRESENT_TO_HUMAN_FOR_REVIEW_ONLY";

const FALSE_FLAGS = Object.freeze({
  approvalGranted: false,
  approvedForDeliveryPreparation: false,
  approvedForSendExecution: false,
  deliveryCandidateCreated: false,
  sendable: false,
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

function normalizeInput(input = {}) {
  if (input.output && input.scenarioId) return clone(input);
  return buildGenesisBetaLoopRealResponse(input);
}

function reviewHash(scenarioId, candidateDraftText) {
  return crypto
    .createHash("sha256")
    .update(`${scenarioId || "UNKNOWN_SCENARIO"}::${candidateDraftText || ""}`)
    .digest("hex");
}

function collectMissingContext(out, stages) {
  const stageMissing = Object.entries(stages || {}).flatMap(([stageName, stageValue]) => {
    if (!stageValue) return [`${stageName}:missing_output`];
    return [
      ...asArray(stageValue.missingContext).map((value) => `${stageName}:${value}`),
      ...asArray(stageValue.missingSignals).map((value) => `${stageName}:${value}`),
      ...asArray(stageValue.unknownContext).map((value) => `${stageName}:${value}`),
      ...asArray(stageValue.unknownSignals).map((value) => `${stageName}:${value}`),
    ];
  });

  return unique([
    ...asArray(out.article0ReadModel && out.article0ReadModel.missingContext && out.article0ReadModel.missingContext.signals),
    ...asArray(out.blockedStages).map((stage) => `blocked:${stage}`),
    ...stageMissing,
  ]);
}

function reasoningSummary(stages) {
  const nba = (stages && stages.nashMickNba) || {};
  return {
    recommendedAction: nba.recommendedAction || null,
    targetPerson: nba.targetPerson || null,
    reasonWhy: nba.reasonWhy || null,
    whyNow: nba.whyNow || null,
    whyThisPerson: nba.whyThisPerson || null,
    whyThisAction: nba.whyThisAction || null,
    whyThisMessage: nba.whyThisMessage || null,
    conversationAngle: nba.conversationAngle || null,
    objectionSupport: nba.objectionSupport || null,
  };
}

function humanReviewQuestions(out) {
  return unique([
    "What evidence supports this follow-up?",
    "What context is missing?",
    "Could this message create pressure or dependency?",
    "Does this respect the person's agency?",
    "What must the human decide before approving?",
    "What should the advisor/manager learn from this case?",
    ...asArray(out.suggestedHumanReviewQuestions),
  ]);
}

function approvalPrerequisites() {
  return [
    "real_human_reviewer_required",
    "exact_artifact_review_required",
    "safety_status_must_be_safe_for_human_review",
    "warnings_and_limitations_must_be_visible",
    "explicit_human_approval_gate_required",
    "delivery_preparation_remains_locked_until_approval",
  ];
}

function buildGenesisBetaLoopHumanReviewPacket(input = {}) {
  const before = JSON.stringify(input);
  const response = normalizeInput(input);
  const out = response.output || {};
  const stages = out.stages || {};
  const safety = stages.safetyValidator || {};
  const draft = stages.draftIntake || {};
  const humanApproval = stages.humanApprovalGate || {};
  const candidateDraftText = draft.draftText || input.draftText || null;
  const scenarioId = response.scenarioId || input.scenarioId || "UNKNOWN_SCENARIO";
  const missingContext = collectMissingContext(out, stages);
  const uncertainty = {
    blockedStages: unique(out.blockedStages),
    warnings: unique(out.warnings),
    stageSignals: unique(out.article0ReadModel && out.article0ReadModel.uncertainty && out.article0ReadModel.uncertainty.stageSignals),
    freshness: out.freshness || "UNKNOWN",
  };

  const packet = {
    packetStatus: PACKET_STATUS,
    packetDecision: PACKET_DECISION,
    reviewOnly: true,
    article0Status: out.article0Status || "ARTICLE_0_ACTIVE",
    article0Principle: out.article0Principle || "Forge exists to strengthen human judgment, not replace it.",
    article0Gate: out.article0Gate || "Does this strengthen human judgment, or does it create dependency?",
    finalAuthority: out.finalAuthority || "HUMAN",
    forgeRole: out.forgeRole || "AUGMENTS_JUDGMENT",
    notFinalAuthority: true,
    doesNotReplaceHumanResponsibility: true,
    humanDecisionCheckpointRequired: true,
    humanApprovalRequired: true,
    ...FALSE_FLAGS,
    scenarioId,
    reviewArtifactHash: reviewHash(scenarioId, candidateDraftText),
    reviewArtifactHashOnly: true,
    candidateDraftText,
    draftQualityStatus: out.draftQualityStatus || "DRAFT_REVIEW_REQUIRED",
    draftQualityDecision: out.draftQualityDecision || "REVIEW_DRAFT_BEFORE_APPROVAL",
    safetyStatus: safety.safetyStatus || null,
    safetyDecision: safety.safetyDecision || null,
    detectedRisks: unique(safety.detectedRisks || safety.risks),
    requiredRevisions: unique(safety.requiredRevisions),
    evidenceRefs: unique(safety.evidenceRefs || out.evidenceRefs),
    sourceOwners: unique(safety.sourceOwners || out.sourceOwners),
    freshness: safety.freshness || out.freshness || "UNKNOWN",
    missingContext,
    uncertainty,
    reasoningSummary: reasoningSummary(stages),
    judgmentDevelopmentPrompt: unique(out.judgmentDevelopmentPrompt),
    humanReviewQuestions: humanReviewQuestions(out),
    approvalPrerequisites: approvalPrerequisites(),
    actionBoundary: {
      ...(out.actionBoundary || {}),
      reviewPacketOnly: true,
      notApproval: true,
      notDeliveryCandidate: true,
      notSendable: true,
      deliveryPreparationLocked: true,
    },
    blockedReason: unique([
      ...asArray(out.blockedStages),
      ...asArray(humanApproval.missingSignals),
    ]),
    warnings: unique([
      ...asArray(out.warnings),
      ...asArray(safety.warnings),
    ]),
    limitations: unique(safety.confidenceLimitations),
  };

  if (JSON.stringify(input) !== before) {
    throw new Error("Genesis Beta Loop Human Review Packet mutated input");
  }

  return packet;
}

module.exports = {
  buildGenesisBetaLoopHumanReviewPacket,
  GENESIS_BETA_LOOP_HUMAN_REVIEW_PACKET_STATUS: PACKET_STATUS,
  GENESIS_BETA_LOOP_HUMAN_REVIEW_PACKET_DECISION: PACKET_DECISION,
};
