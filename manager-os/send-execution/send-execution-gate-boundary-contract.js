/**
 * Send Execution Gate Boundary Contract
 *
 * Delivery preparation is not send.
 * This pure boundary verifies final human send confirmation and may approve provider handoff.
 * It never sends, never calls providers, never creates tasks/calendar, and never creates truth.
 */

const SEND_EXECUTION_GATE_STATUSES = Object.freeze({
  READY_FOR_FINAL_SEND_REVIEW: 'READY_FOR_FINAL_SEND_REVIEW',
  APPROVED_FOR_PROVIDER_HANDOFF: 'APPROVED_FOR_PROVIDER_HANDOFF',
  NEEDS_DELIVERY_CANDIDATE: 'NEEDS_DELIVERY_CANDIDATE',
  NEEDS_HUMAN_APPROVAL: 'NEEDS_HUMAN_APPROVAL',
  NEEDS_FINAL_SEND_CONFIRMATION: 'NEEDS_FINAL_SEND_CONFIRMATION',
  NEEDS_RECIPIENT_DESTINATION: 'NEEDS_RECIPIENT_DESTINATION',
  NEEDS_CHANNEL: 'NEEDS_CHANNEL',
  NEEDS_ARTIFACT_HASH: 'NEEDS_ARTIFACT_HASH',
  ARTIFACT_CHANGED_REAPPROVAL_REQUIRED: 'ARTIFACT_CHANGED_REAPPROVAL_REQUIRED',
  NEEDS_SAFETY_VALIDATION: 'NEEDS_SAFETY_VALIDATION',
  UNSAFE_MESSAGE_BLOCKED: 'UNSAFE_MESSAGE_BLOCKED',
  UNSUPPORTED_CHANNEL: 'UNSUPPORTED_CHANNEL',
  EXPIRED_SEND_WINDOW: 'EXPIRED_SEND_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const SEND_EXECUTION_GATE_DECISIONS = Object.freeze({
  REQUEST_FINAL_SEND_REVIEW: 'REQUEST_FINAL_SEND_REVIEW',
  APPROVE_PROVIDER_HANDOFF: 'APPROVE_PROVIDER_HANDOFF',
  BLOCK_SEND: 'BLOCK_SEND',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const SEND_EXECUTION_GATE_ALLOWED_USES = Object.freeze([
  'FINAL_SEND_REVIEW',
  'PROVIDER_HANDOFF_PREP',
  'MANUAL_SEND_CONFIRMATION',
  'WHATSAPP_SEND_REVIEW',
  'SMS_SEND_REVIEW',
  'EMAIL_SEND_REVIEW',
]);

const SEND_EXECUTION_GATE_FORBIDDEN_USES = Object.freeze([
  'AUTOMATIC_SEND',
  'SILENT_SEND',
  'AI_SELF_SEND',
  'SEND_WITHOUT_HUMAN_CONFIRMATION',
  'SEND_WITHOUT_DELIVERY_CANDIDATE',
  'SEND_WITHOUT_HUMAN_APPROVAL',
  'SEND_CHANGED_ARTIFACT_WITHOUT_REAPPROVAL',
  'SEND_UNSAFE_MESSAGE',
  'PROVIDER_RUNTIME_CALL_WITHOUT_GATE',
  'SCHEDULED_SEND',
  'AUTOMATIC_TASK_CREATION',
  'AUTOMATIC_CALENDAR_CREATION',
  'COMPENSATION_TRUTH',
  'PAYOUT_TRUTH',
  'REVENUE_TRUTH',
  'HUMAN_RANKING',
  'HR_DECISION',
  'PROMOTION_DECISION',
  'TERMINATION',
  'MANIPULATION',
  'SURVEILLANCE',
  'PERSONALITY_TRUTH',
]);

const SUPPORTED_CHANNELS = Object.freeze([
  'WHATSAPP',
  'SMS',
  'EMAIL',
  'MANUAL',
  'MANUAL_COPY',
  'MANAGER_REVIEW',
]);

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function unique(values) {
  return [...new Set(asArray(values).filter((value) => value !== undefined && value !== null && value !== ''))];
}

function normalizeUse(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : undefined;
}

function normalizeChannel(value) {
  if (!value) return undefined;
  if (typeof value === 'string') return value.trim().toUpperCase();
  if (typeof value === 'object') {
    return String(value.channel || value.type || value.name || '').trim().toUpperCase() || undefined;
  }
  return undefined;
}

function collectEvidence(sourceEvidence) {
  const evidence = asArray(sourceEvidence);
  const evidenceRefs = [];
  const sourceEvidenceIds = [];
  const sourceOwners = [];

  for (const item of evidence) {
    if (!item || typeof item !== 'object') continue;
    evidenceRefs.push(item.evidenceRef, item.ref, item.id, item.sourceEvidenceId, item.evidenceId);
    sourceEvidenceIds.push(item.sourceEvidenceId, item.evidenceId, item.id);
    sourceOwners.push(item.sourceOwner, item.owner);
  }

  return {
    evidenceRefs: unique(evidenceRefs),
    sourceEvidenceIds: unique(sourceEvidenceIds),
    sourceOwners: unique(sourceOwners),
  };
}

function isExpired(expiresAt, nowValue) {
  if (!expiresAt) return false;
  const now = nowValue ? new Date(nowValue) : new Date();
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() <= now.getTime();
}

function isSafetyUnsafe(snapshot) {
  if (!snapshot) return false;
  if (snapshot.safe === false || snapshot.isSafe === false || snapshot.approved === false) return true;

  const status = String(snapshot.status || snapshot.safetyStatus || snapshot.validationStatus || '').toUpperCase();
  const decision = String(snapshot.decision || snapshot.safetyDecision || '').toUpperCase();

  return (
    status.includes('UNSAFE') ||
    status.includes('BLOCK') ||
    status.includes('REJECT') ||
    decision.includes('BLOCK') ||
    decision.includes('REJECT')
  );
}

function hasDeliveryCandidate(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  return Boolean(
    snapshot.approvedForDeliveryPreparation === true &&
    (snapshot.preparedText || snapshot.linkCandidate || snapshot.manualHandoffInstruction)
  );
}

function isFinalSendConfirmed(input) {
  if (input.finalSendConfirmed === true) return true;

  const confirmation = input.sendConfirmation;
  if (!confirmation || typeof confirmation !== 'object') return false;

  const confirmed = confirmation.confirmed === true || confirmation.finalSendConfirmed === true;
  const actor = confirmation.confirmedBy || confirmation.senderId || confirmation.reviewerId;
  const at = confirmation.confirmedAt || confirmation.timestamp;

  return Boolean(confirmed && actor && at);
}

function baseOutput(input, evidenceBundle) {
  return {
    sendExecutionGateStatus: SEND_EXECUTION_GATE_STATUSES.UNKNOWN,
    decision: SEND_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT,

    sendRequestId: input.sendRequestId || null,
    deliveryRequestId: input.deliveryRequestId || input.deliveryCandidateSnapshot?.deliveryRequestId || null,
    approvalRequestId: input.approvalRequestId || input.humanApprovalSnapshot?.approvalRequestId || null,
    advisorId: input.advisorId || null,
    managerId: input.managerId || null,
    senderId: input.senderId || input.sendConfirmation?.confirmedBy || null,
    senderRole: input.senderRole || null,
    personId: input.personId || null,
    personType: input.personType || null,
    channel: input.channel || input.deliveryCandidateSnapshot?.channelCandidate || null,

    finalSendText: input.finalSendText || null,
    recipientDestination: input.recipientDestination || null,
    providerCandidate: input.providerCandidate || null,

    approvedArtifactHash: input.approvedArtifactHash || input.humanApprovalSnapshot?.approvedArtifactHash || input.deliveryCandidateSnapshot?.approvedArtifactHash || null,
    currentArtifactHash: input.currentArtifactHash || null,

    approvedForProviderHandoff: false,
    approvedForSendExecution: false,
    providerRuntimeCallAllowed: false,
    sendsMessage: false,
    automaticSendAllowed: false,
    silentSendAllowed: false,
    scheduledSendAllowed: false,
    humanSendConfirmationRequired: true,
    sendAuditRequired: true,
    providerRuntimeBoundaryRequired: true,

    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.deliveryCandidateSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.deliveryCandidateSnapshot?.limitations))]),

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

    evidenceRefs: evidenceBundle.evidenceRefs,
    sourceEvidenceIds: evidenceBundle.sourceEvidenceIds,
    sourceOwners: evidenceBundle.sourceOwners,
  };
}

function markBlocked(output, status, decision, signal, blockedUse) {
  output.sendExecutionGateStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildSendExecutionGate(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);

  const requestedUse = normalizeUse(original.requestedUse);
  if (requestedUse && SEND_EXECUTION_GATE_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.BLOCKED, SEND_EXECUTION_GATE_DECISIONS.BLOCK_SEND, null, requestedUse);
  }

  if (requestedUse && !SEND_EXECUTION_GATE_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.sendExecutionGateStatus = SEND_EXECUTION_GATE_STATUSES.NOT_MODELED;
    output.decision = SEND_EXECUTION_GATE_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  if (!hasDeliveryCandidate(original.deliveryCandidateSnapshot)) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.NEEDS_DELIVERY_CANDIDATE, SEND_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'deliveryCandidateSnapshot', 'SEND_WITHOUT_DELIVERY_CANDIDATE');
  }

  const approval = original.humanApprovalSnapshot;
  if (!approval || approval.approvedForDeliveryPreparation !== true) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.NEEDS_HUMAN_APPROVAL, SEND_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'humanApprovalSnapshot', 'SEND_WITHOUT_HUMAN_APPROVAL');
  }

  if (!isFinalSendConfirmed(original)) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.NEEDS_FINAL_SEND_CONFIRMATION, SEND_EXECUTION_GATE_DECISIONS.REQUEST_FINAL_SEND_REVIEW, 'sendConfirmation', 'SEND_WITHOUT_HUMAN_CONFIRMATION');
  }

  const channel = normalizeChannel(original.channel || original.deliveryCandidateSnapshot?.channelCandidate);
  if (!channel) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.NEEDS_CHANNEL, SEND_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'channel');
  }

  if (!SUPPORTED_CHANNELS.includes(channel)) {
    output.channel = channel;
    output.sendExecutionGateStatus = SEND_EXECUTION_GATE_STATUSES.UNSUPPORTED_CHANNEL;
    output.decision = SEND_EXECUTION_GATE_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CHANNEL']);
    return output;
  }

  if (!original.recipientDestination) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.NEEDS_RECIPIENT_DESTINATION, SEND_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'recipientDestination');
  }

  const approvedArtifactHash = original.approvedArtifactHash || approval.approvedArtifactHash || original.deliveryCandidateSnapshot?.approvedArtifactHash;
  if (!approvedArtifactHash) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.NEEDS_ARTIFACT_HASH, SEND_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'approvedArtifactHash');
  }

  output.approvedArtifactHash = approvedArtifactHash;

  const currentArtifactHash = original.currentArtifactHash || original.deliveryCandidateSnapshot?.currentArtifactHash || approvedArtifactHash;
  output.currentArtifactHash = currentArtifactHash;

  if (currentArtifactHash !== approvedArtifactHash) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.ARTIFACT_CHANGED_REAPPROVAL_REQUIRED, SEND_EXECUTION_GATE_DECISIONS.BLOCK_SEND, 'artifactHashMismatch', 'SEND_CHANGED_ARTIFACT_WITHOUT_REAPPROVAL');
  }

  const safety = original.safetyValidationSnapshot || approval.safetyValidationSnapshot || original.deliveryCandidateSnapshot?.safetyValidationSnapshot;
  if (!safety) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.NEEDS_SAFETY_VALIDATION, SEND_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'safetyValidationSnapshot');
  }

  if (isSafetyUnsafe(safety)) {
    return markBlocked(output, SEND_EXECUTION_GATE_STATUSES.UNSAFE_MESSAGE_BLOCKED, SEND_EXECUTION_GATE_DECISIONS.BLOCK_SEND, 'unsafeSafetyValidation', 'SEND_UNSAFE_MESSAGE');
  }

  if (isExpired(original.expiresAt || original.sendWindowExpiresAt || approval.expiresAt, original.now)) {
    output.sendExecutionGateStatus = SEND_EXECUTION_GATE_STATUSES.EXPIRED_SEND_WINDOW;
    output.decision = SEND_EXECUTION_GATE_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_SEND_WINDOW']);
    return output;
  }

  output.channel = channel;
  output.finalSendText = original.finalSendText || original.deliveryCandidateSnapshot.preparedText;
  output.providerCandidate = original.providerCandidate || {
    channel,
    recipientDestination: original.recipientDestination,
    finalSendText: output.finalSendText,
    deliveryRequestId: output.deliveryRequestId,
  };
  output.recipientDestination = original.recipientDestination;
  output.approvedForProviderHandoff = true;
  output.approvedForSendExecution = false;
  output.providerRuntimeCallAllowed = false;
  output.sendsMessage = false;
  output.sendExecutionGateStatus = SEND_EXECUTION_GATE_STATUSES.APPROVED_FOR_PROVIDER_HANDOFF;
  output.decision = SEND_EXECUTION_GATE_DECISIONS.APPROVE_PROVIDER_HANDOFF;

  return output;
}

module.exports = {
  buildSendExecutionGate,
  SEND_EXECUTION_GATE_STATUSES,
  SEND_EXECUTION_GATE_DECISIONS,
  SEND_EXECUTION_GATE_ALLOWED_USES,
  SEND_EXECUTION_GATE_FORBIDDEN_USES,
};
