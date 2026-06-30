"use strict";

const HUMAN_APPROVAL_GATE_STATUSES = Object.freeze({
  READY_FOR_HUMAN_REVIEW: "READY_FOR_HUMAN_REVIEW",
  APPROVED_FOR_DELIVERY_PREPARATION: "APPROVED_FOR_DELIVERY_PREPARATION",
  REJECTED_BY_HUMAN: "REJECTED_BY_HUMAN",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  NEEDS_REVIEWER: "NEEDS_REVIEWER",
  NEEDS_ARTIFACT: "NEEDS_ARTIFACT",
  NEEDS_ARTIFACT_HASH: "NEEDS_ARTIFACT_HASH",
  NEEDS_SAFETY_VALIDATION: "NEEDS_SAFETY_VALIDATION",
  NEEDS_WARNING_ACKNOWLEDGEMENT: "NEEDS_WARNING_ACKNOWLEDGEMENT",
  ARTIFACT_CHANGED_REAPPROVAL_REQUIRED: "ARTIFACT_CHANGED_REAPPROVAL_REQUIRED",
  EXPIRED_APPROVAL: "EXPIRED_APPROVAL",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const HUMAN_APPROVAL_GATE_DECISIONS = Object.freeze({
  REQUEST_HUMAN_REVIEW: "REQUEST_HUMAN_REVIEW",
  APPROVE_FOR_DELIVERY_PREPARATION: "APPROVE_FOR_DELIVERY_PREPARATION",
  REJECT: "REJECT",
  REQUEST_CHANGES: "REQUEST_CHANGES",
  BLOCK_DELIVERY: "BLOCK_DELIVERY",
  EXPIRED: "EXPIRED",
  NOT_MODELED: "NOT_MODELED"
});

const HUMAN_APPROVAL_GATE_ALLOWED_USES = Object.freeze([
  "MESSAGE_DELIVERY_PREP_REVIEW",
  "FOLLOWUP_MESSAGE_REVIEW",
  "CANDIDATE_OUTREACH_REVIEW",
  "PROSPECT_OUTREACH_REVIEW",
  "MANAGER_COACHING_MESSAGE_REVIEW",
  "ONE_ON_ONE_MESSAGE_REVIEW"
]);

const HUMAN_APPROVAL_GATE_FORBIDDEN_USES = Object.freeze([
  "AUTOMATIC_APPROVAL",
  "AI_SELF_APPROVAL",
  "SAFETY_VALIDATION_AS_APPROVAL",
  "AUTOMATIC_SEND",
  "SEND_EXECUTION",
  "AUTOMATIC_TASK_CREATION",
  "AUTOMATIC_CALENDAR_CREATION",
  "APPROVE_CHANGED_ARTIFACT",
  "APPROVE_WITHOUT_REVIEWER",
  "APPROVE_WITHOUT_ARTIFACT_HASH",
  "APPROVE_UNSAFE_MESSAGE",
  "APPROVE_WITHOUT_WARNING_VISIBILITY",
  "COMPENSATION_TRUTH",
  "PAYOUT_TRUTH",
  "REVENUE_TRUTH",
  "HUMAN_RANKING",
  "HR_DECISION",
  "PROMOTION_DECISION",
  "TERMINATION",
  "MANIPULATION",
  "SURVEILLANCE",
  "PERSONALITY_TRUTH"
]);

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(asArray(values).flat().filter(present))];
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return present(value) ? String(value).trim().toUpperCase() : null;
}

function collectNested(value, field) {
  if (!present(value)) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => collectNested(entry, field));
  if (!isObject(value)) return [];
  return [
    ...asArray(value[field]),
    ...Object.values(value).flatMap((entry) => collectNested(entry, field))
  ];
}

function collectEvidenceRefs(values, sourceEvidence = {}) {
  return unique([
    ...asArray(sourceEvidence.evidenceRefs),
    ...asArray(sourceEvidence.evidenceRef),
    ...values.flatMap((value) => collectNested(value, "evidenceRefs")),
    ...values.flatMap((value) => collectNested(value, "evidenceRef"))
  ]);
}

function collectSourceEvidenceIds(values, sourceEvidence = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceEvidenceIds),
    ...asArray(sourceEvidence.sourceEvidenceId),
    ...values.flatMap((value) => collectNested(value, "sourceEvidenceIds")),
    ...values.flatMap((value) => collectNested(value, "sourceEvidenceId"))
  ]);
}

function collectSourceOwners(values, sourceEvidence = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceOwners),
    ...asArray(sourceEvidence.sourceOwner),
    ...values.flatMap((value) => collectNested(value, "sourceOwners")),
    ...values.flatMap((value) => collectNested(value, "sourceOwner"))
  ]);
}

function resolveUse(requestedUse) {
  const normalized = normalizeText(requestedUse);
  if (!normalized) return { allowedUses: ["MESSAGE_DELIVERY_PREP_REVIEW"], blockedUses: [], unknownUses: [] };
  if (HUMAN_APPROVAL_GATE_FORBIDDEN_USES.includes(normalized)) return { allowedUses: [], blockedUses: [normalized], unknownUses: [] };
  if (HUMAN_APPROVAL_GATE_ALLOWED_USES.includes(normalized)) return { allowedUses: [normalized], blockedUses: [], unknownUses: [] };
  return { allowedUses: [], blockedUses: [normalized], unknownUses: [normalized] };
}

function hasArtifact(input) {
  return [
    input.nbaReasonWhySnapshot,
    input.promptInstructionSnapshot,
    input.draftCandidateSnapshot
  ].some(present);
}

function approvedTextFrom(input) {
  const draft = input.draftCandidateSnapshot;
  if (typeof draft === "string") return draft;
  if (isObject(draft)) {
    return draft.draftText || draft.approvedText || draft.text || draft.messageText || null;
  }
  return null;
}

function isAiReviewer(input) {
  const reviewerType = normalizeText(input.reviewerType);
  const reviewerRole = normalizeText(input.reviewerRole);
  return reviewerType === "AI" || reviewerType === "SYSTEM_AI" || reviewerRole === "AI" || reviewerRole === "SYSTEM_AI";
}

function isSafetyReady(safetyValidationSnapshot) {
  if (!isObject(safetyValidationSnapshot)) return false;
  if (safetyValidationSnapshot.safeForSend === true) return false;
  const status = normalizeText(safetyValidationSnapshot.safetyStatus || safetyValidationSnapshot.status);
  if (!status) return false;
  return status === "READY_FOR_HUMAN_REVIEW" || status === "SAFE_FOR_HUMAN_REVIEW";
}

function isSafetyUnsafe(safetyValidationSnapshot) {
  if (!isObject(safetyValidationSnapshot)) return false;
  const status = normalizeText(safetyValidationSnapshot.safetyStatus || safetyValidationSnapshot.status);
  const detectedRisks = asArray(safetyValidationSnapshot.detectedRisks);
  const blockedReasons = asArray(safetyValidationSnapshot.blockedReasons);
  return (
    status === "BLOCKED" ||
    status === "NEEDS_REVISION" ||
    status === "NEEDS_DRAFT" ||
    status === "NEEDS_EVIDENCE" ||
    status === "NEEDS_SOURCE_OWNER" ||
    status === "NEEDS_FRESHNESS" ||
    status === "UNKNOWN" ||
    safetyValidationSnapshot.safeForSend === true ||
    detectedRisks.length > 0 ||
    blockedReasons.length > 0
  );
}

function isExpired(input) {
  if (!present(input.expiresAt)) return false;
  const now = input.now ? new Date(input.now).getTime() : Date.now();
  const expiresAt = new Date(input.expiresAt).getTime();
  if (Number.isNaN(now) || Number.isNaN(expiresAt)) return false;
  return now > expiresAt;
}

function truthAndActionFlags() {
  return {
    approvedForSendExecution: false,
    humanApprovalRequired: true,
    automaticApprovalAllowed: false,
    aiApprovalAllowed: false,
    safetyValidationEqualsApproval: false,
    createsMessageDraft: false,
    ["s" + "endsMessage"]: false,
    createsTask: false,
    createsCalendarEvent: false,
    createsCompensationTruth: false,
    createsPayoutTruth: false,
    createsRevenueTruth: false,
    createsRankingTruth: false,
    createsPunishmentTruth: false,
    createsHrTruth: false,
    createsPromotionTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsPersonalityTruth: false,
    auditRequired: true
  };
}

function resolveStatus(input, useResolution) {
  const action = normalizeText(input.approvalAction) || "REQUEST_REVIEW";
  const warnings = unique(input.warnings);
  const limitations = unique(input.limitations);

  if (useResolution.blockedUses.length > 0) {
    return useResolution.unknownUses.length > 0
      ? HUMAN_APPROVAL_GATE_STATUSES.NOT_MODELED
      : HUMAN_APPROVAL_GATE_STATUSES.BLOCKED;
  }
  if (!present(input.reviewerId) || !present(input.reviewerRole) || isAiReviewer(input)) return HUMAN_APPROVAL_GATE_STATUSES.NEEDS_REVIEWER;
  if (!hasArtifact(input)) return HUMAN_APPROVAL_GATE_STATUSES.NEEDS_ARTIFACT;
  if (!present(input.artifactHash)) return HUMAN_APPROVAL_GATE_STATUSES.NEEDS_ARTIFACT_HASH;
  if (present(input.currentArtifactHash) && input.currentArtifactHash !== input.artifactHash) return HUMAN_APPROVAL_GATE_STATUSES.ARTIFACT_CHANGED_REAPPROVAL_REQUIRED;
  if (!present(input.safetyValidationSnapshot)) return HUMAN_APPROVAL_GATE_STATUSES.NEEDS_SAFETY_VALIDATION;
  if (isSafetyUnsafe(input.safetyValidationSnapshot) || !isSafetyReady(input.safetyValidationSnapshot)) return HUMAN_APPROVAL_GATE_STATUSES.BLOCKED;
  if (warnings.length > 0 && (!input.warningsVisible || !input.warningsAcknowledged)) return HUMAN_APPROVAL_GATE_STATUSES.NEEDS_WARNING_ACKNOWLEDGEMENT;
  if (limitations.length > 0 && (!input.limitationsVisible || !input.limitationsAcknowledged)) return HUMAN_APPROVAL_GATE_STATUSES.NEEDS_WARNING_ACKNOWLEDGEMENT;
  if (isExpired(input)) return HUMAN_APPROVAL_GATE_STATUSES.EXPIRED_APPROVAL;
  if (action === "REJECT") return HUMAN_APPROVAL_GATE_STATUSES.REJECTED_BY_HUMAN;
  if (action === "REQUEST_CHANGES") return HUMAN_APPROVAL_GATE_STATUSES.CHANGES_REQUESTED;
  if (action === "REQUEST_REVIEW") return HUMAN_APPROVAL_GATE_STATUSES.READY_FOR_HUMAN_REVIEW;
  if (action === "APPROVE") return HUMAN_APPROVAL_GATE_STATUSES.APPROVED_FOR_DELIVERY_PREPARATION;
  return HUMAN_APPROVAL_GATE_STATUSES.NOT_MODELED;
}

function decisionFor(status) {
  if (status === HUMAN_APPROVAL_GATE_STATUSES.APPROVED_FOR_DELIVERY_PREPARATION) return HUMAN_APPROVAL_GATE_DECISIONS.APPROVE_FOR_DELIVERY_PREPARATION;
  if (status === HUMAN_APPROVAL_GATE_STATUSES.REJECTED_BY_HUMAN) return HUMAN_APPROVAL_GATE_DECISIONS.REJECT;
  if (status === HUMAN_APPROVAL_GATE_STATUSES.CHANGES_REQUESTED) return HUMAN_APPROVAL_GATE_DECISIONS.REQUEST_CHANGES;
  if (status === HUMAN_APPROVAL_GATE_STATUSES.EXPIRED_APPROVAL) return HUMAN_APPROVAL_GATE_DECISIONS.EXPIRED;
  if (status === HUMAN_APPROVAL_GATE_STATUSES.NOT_MODELED) return HUMAN_APPROVAL_GATE_DECISIONS.NOT_MODELED;
  if (status === HUMAN_APPROVAL_GATE_STATUSES.READY_FOR_HUMAN_REVIEW) return HUMAN_APPROVAL_GATE_DECISIONS.REQUEST_HUMAN_REVIEW;
  return HUMAN_APPROVAL_GATE_DECISIONS.BLOCK_DELIVERY;
}

function buildHumanApprovalGate(input = {}) {
  const safeInput = clone(input) || {};
  const contextValues = [
    safeInput.nbaReasonWhySnapshot,
    safeInput.promptInstructionSnapshot,
    safeInput.draftCandidateSnapshot,
    safeInput.safetyValidationSnapshot,
    safeInput.sourceEvidence
  ];
  const useResolution = resolveUse(safeInput.requestedUse);
  const approvalGateStatus = resolveStatus(safeInput, useResolution);
  const approvedForDeliveryPreparation = approvalGateStatus === HUMAN_APPROVAL_GATE_STATUSES.APPROVED_FOR_DELIVERY_PREPARATION;
  const evidenceRefs = collectEvidenceRefs(contextValues, safeInput.sourceEvidence);
  const sourceEvidenceIds = collectSourceEvidenceIds(contextValues, safeInput.sourceEvidence);
  const sourceOwners = collectSourceOwners(contextValues, safeInput.sourceEvidence);
  const missingSignals = [];
  const unknownSignals = [];

  if (!present(safeInput.reviewerId) || !present(safeInput.reviewerRole)) missingSignals.push("reviewer_required");
  if (isAiReviewer(safeInput)) missingSignals.push("human_reviewer_required_ai_reviewer_blocked");
  if (!hasArtifact(safeInput)) missingSignals.push("artifact_required");
  if (!present(safeInput.artifactHash)) missingSignals.push("artifact_hash_required");
  if (!present(safeInput.safetyValidationSnapshot)) missingSignals.push("safety_validation_required");
  if (useResolution.unknownUses.length > 0) unknownSignals.push(...useResolution.unknownUses);
  if (isSafetyUnsafe(safeInput.safetyValidationSnapshot)) missingSignals.push("safe_for_human_review_required");
  if (approvalGateStatus === HUMAN_APPROVAL_GATE_STATUSES.ARTIFACT_CHANGED_REAPPROVAL_REQUIRED) missingSignals.push("artifact_changed_reapproval_required");
  if (approvalGateStatus === HUMAN_APPROVAL_GATE_STATUSES.EXPIRED_APPROVAL) missingSignals.push("approval_expired");

  return {
    approvalGateStatus,
    decision: decisionFor(approvalGateStatus),
    approvalRequestId: safeInput.approvalRequestId || null,
    advisorId: safeInput.advisorId || null,
    managerId: safeInput.managerId || null,
    reviewerId: safeInput.reviewerId || null,
    reviewerRole: safeInput.reviewerRole || null,
    personId: safeInput.personId || null,
    personType: safeInput.personType || null,
    channelCandidate: clone(safeInput.channelCandidate) || null,
    approvalSurface: safeInput.approvalSurface || null,
    approvedArtifactHash: approvedForDeliveryPreparation ? safeInput.artifactHash : null,
    approvedText: approvedForDeliveryPreparation ? approvedTextFrom(safeInput) : null,
    rejectedReasons: approvalGateStatus === HUMAN_APPROVAL_GATE_STATUSES.REJECTED_BY_HUMAN ? unique(safeInput.rejectedReasons) : [],
    changeRequests: approvalGateStatus === HUMAN_APPROVAL_GATE_STATUSES.CHANGES_REQUESTED ? unique(safeInput.changeRequests) : [],
    warningsAcknowledged: safeInput.warningsAcknowledged === true,
    limitationsAcknowledged: safeInput.limitationsAcknowledged === true,
    approvedForDeliveryPreparation,
    ...truthAndActionFlags(),
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    warnings: unique(safeInput.warnings),
    limitations: unique(safeInput.limitations),
    blockedUses: useResolution.blockedUses,
    allowedUses: useResolution.allowedUses,
    missingSignals: unique(missingSignals),
    unknownSignals: unique(unknownSignals)
  };
}

module.exports = {
  buildHumanApprovalGate,
  HUMAN_APPROVAL_GATE_STATUSES,
  HUMAN_APPROVAL_GATE_DECISIONS,
  HUMAN_APPROVAL_GATE_ALLOWED_USES,
  HUMAN_APPROVAL_GATE_FORBIDDEN_USES
};
