/**
 * Delivery Adapter Boundary Contract
 *
 * Delivery preparation is not send.
 * This pure boundary prepares a delivery candidate after explicit human approval.
 * It never sends, never calls providers, never creates tasks/calendar, and never creates truth.
 */

const DELIVERY_ADAPTER_STATUSES = Object.freeze({
  READY_FOR_DELIVERY_PREPARATION: 'READY_FOR_DELIVERY_PREPARATION',
  PREPARED_FOR_MANUAL_DELIVERY: 'PREPARED_FOR_MANUAL_DELIVERY',
  NEEDS_HUMAN_APPROVAL: 'NEEDS_HUMAN_APPROVAL',
  NEEDS_APPROVED_ARTIFACT: 'NEEDS_APPROVED_ARTIFACT',
  NEEDS_ARTIFACT_HASH: 'NEEDS_ARTIFACT_HASH',
  ARTIFACT_CHANGED_REAPPROVAL_REQUIRED: 'ARTIFACT_CHANGED_REAPPROVAL_REQUIRED',
  NEEDS_CHANNEL_CANDIDATE: 'NEEDS_CHANNEL_CANDIDATE',
  NEEDS_RECIPIENT_REVIEW: 'NEEDS_RECIPIENT_REVIEW',
  UNSUPPORTED_CHANNEL: 'UNSUPPORTED_CHANNEL',
  EXPIRED_APPROVAL: 'EXPIRED_APPROVAL',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const DELIVERY_ADAPTER_DECISIONS = Object.freeze({
  PREPARE_DELIVERY_CANDIDATE: 'PREPARE_DELIVERY_CANDIDATE',
  PREPARE_MANUAL_HANDOFF: 'PREPARE_MANUAL_HANDOFF',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  BLOCK_DELIVERY_PREP: 'BLOCK_DELIVERY_PREP',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const DELIVERY_ADAPTER_ALLOWED_USES = Object.freeze([
  'DELIVERY_PREP_ONLY',
  'WHATSAPP_LINK_PREP',
  'SMS_LINK_PREP',
  'EMAIL_CLIENT_PREP',
  'MANUAL_COPY_PREP',
  'MANAGER_REVIEW_HANDOFF',
  'CHANNEL_FORMATTING_PREP',
]);

const DELIVERY_ADAPTER_FORBIDDEN_USES = Object.freeze([
  'AUTOMATIC_SEND',
  'SEND_EXECUTION',
  'SILENT_DELIVERY',
  'CHANNEL_PROVIDER_API_CALL',
  'WHATSAPP_API_SEND',
  'SMS_API_SEND',
  'EMAIL_API_SEND',
  'AUTOMATIC_TASK_CREATION',
  'AUTOMATIC_CALENDAR_CREATION',
  'BYPASS_HUMAN_APPROVAL',
  'UNAPPROVED_ARTIFACT',
  'CHANGED_ARTIFACT_WITHOUT_REAPPROVAL',
  'UNSAFE_MESSAGE_DELIVERY',
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

function buildLinkCandidate(channel, text) {
  const encoded = encodeURIComponent(text || '');
  if (channel === 'WHATSAPP') return `https://wa.me/?text=${encoded}`;
  if (channel === 'SMS') return `sms:?body=${encoded}`;
  if (channel === 'EMAIL') return `mailto:?body=${encoded}`;
  return null;
}

function baseOutput(input, evidenceBundle) {
  return {
    deliveryAdapterStatus: DELIVERY_ADAPTER_STATUSES.UNKNOWN,
    decision: DELIVERY_ADAPTER_DECISIONS.NEEDS_MORE_CONTEXT,

    deliveryRequestId: input.deliveryRequestId || null,
    approvalRequestId: input.approvalRequestId || input.humanApprovalSnapshot?.approvalRequestId || null,
    advisorId: input.advisorId || null,
    managerId: input.managerId || null,
    reviewerId: input.reviewerId || input.humanApprovalSnapshot?.reviewerId || null,
    personId: input.personId || null,
    personType: input.personType || null,

    channelCandidate: input.channelCandidate || null,
    deliveryMode: input.deliveryMode || null,
    preparedText: null,
    manualHandoffInstruction: null,
    linkCandidate: null,
    recipientReviewRequired: true,
    channelDestinationCandidate: input.channelDestinationCandidate || null,

    approvedArtifactHash: input.approvedArtifactHash || input.humanApprovalSnapshot?.approvedArtifactHash || null,
    currentArtifactHash: input.currentArtifactHash || null,

    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.humanApprovalSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.humanApprovalSnapshot?.limitations))]),
    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],

    approvedForDeliveryPreparation: false,
    approvedForSendExecution: false,
    humanApprovalRequired: true,
    sendExecutionGateRequired: true,
    automaticSendAllowed: false,
    providerRuntimeCallAllowed: false,

    createsMessageDraft: false,
    sendsMessage: false,
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
    auditRequired: true,

    evidenceRefs: evidenceBundle.evidenceRefs,
    sourceEvidenceIds: evidenceBundle.sourceEvidenceIds,
    sourceOwners: evidenceBundle.sourceOwners,
  };
}

function markBlocked(output, status, decision, signal, blockedUse) {
  output.deliveryAdapterStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildDeliveryAdapterBoundary(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);
  const requestedUse = normalizeUse(original.requestedUse);

  if (requestedUse && DELIVERY_ADAPTER_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, DELIVERY_ADAPTER_STATUSES.BLOCKED, DELIVERY_ADAPTER_DECISIONS.BLOCK_DELIVERY_PREP, null, requestedUse);
  }

  if (requestedUse && !DELIVERY_ADAPTER_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.deliveryAdapterStatus = DELIVERY_ADAPTER_STATUSES.NOT_MODELED;
    output.decision = DELIVERY_ADAPTER_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  const approval = original.humanApprovalSnapshot;
  if (!approval || approval.approvedForDeliveryPreparation !== true) {
    return markBlocked(output, DELIVERY_ADAPTER_STATUSES.NEEDS_HUMAN_APPROVAL, DELIVERY_ADAPTER_DECISIONS.NEEDS_MORE_CONTEXT, 'humanApprovalSnapshot');
  }

  const approvedText = original.approvedText || approval.approvedText;
  if (!approvedText) {
    return markBlocked(output, DELIVERY_ADAPTER_STATUSES.NEEDS_APPROVED_ARTIFACT, DELIVERY_ADAPTER_DECISIONS.NEEDS_MORE_CONTEXT, 'approvedText');
  }

  const approvedArtifactHash = original.approvedArtifactHash || approval.approvedArtifactHash || original.artifactHash;
  if (!approvedArtifactHash) {
    return markBlocked(output, DELIVERY_ADAPTER_STATUSES.NEEDS_ARTIFACT_HASH, DELIVERY_ADAPTER_DECISIONS.NEEDS_MORE_CONTEXT, 'approvedArtifactHash');
  }

  output.approvedArtifactHash = approvedArtifactHash;

  const currentArtifactHash = original.currentArtifactHash || approvedArtifactHash;
  output.currentArtifactHash = currentArtifactHash;

  if (currentArtifactHash !== approvedArtifactHash) {
    return markBlocked(
      output,
      DELIVERY_ADAPTER_STATUSES.ARTIFACT_CHANGED_REAPPROVAL_REQUIRED,
      DELIVERY_ADAPTER_DECISIONS.BLOCK_DELIVERY_PREP,
      'artifactHashMismatch',
      'CHANGED_ARTIFACT_WITHOUT_REAPPROVAL'
    );
  }

  const safety = original.safetyValidationSnapshot || approval.safetyValidationSnapshot;
  if (isSafetyUnsafe(safety)) {
    return markBlocked(output, DELIVERY_ADAPTER_STATUSES.BLOCKED, DELIVERY_ADAPTER_DECISIONS.BLOCK_DELIVERY_PREP, 'unsafeSafetyValidation', 'UNSAFE_MESSAGE_DELIVERY');
  }

  if (isExpired(original.expiresAt || approval.expiresAt, original.now)) {
    output.deliveryAdapterStatus = DELIVERY_ADAPTER_STATUSES.EXPIRED_APPROVAL;
    output.decision = DELIVERY_ADAPTER_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_APPROVAL']);
    return output;
  }

  const channel = normalizeChannel(original.channelCandidate);
  if (!channel) {
    return markBlocked(output, DELIVERY_ADAPTER_STATUSES.NEEDS_CHANNEL_CANDIDATE, DELIVERY_ADAPTER_DECISIONS.NEEDS_MORE_CONTEXT, 'channelCandidate');
  }

  if (!SUPPORTED_CHANNELS.includes(channel)) {
    output.channelCandidate = channel;
    output.deliveryAdapterStatus = DELIVERY_ADAPTER_STATUSES.UNSUPPORTED_CHANNEL;
    output.decision = DELIVERY_ADAPTER_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CHANNEL']);
    return output;
  }

  output.channelCandidate = channel;
  output.preparedText = approvedText;
  output.linkCandidate = buildLinkCandidate(channel, approvedText);
  output.manualHandoffInstruction = `Prepare ${channel} delivery candidate for human-controlled handoff. Do not send.`;
  output.approvedForDeliveryPreparation = true;
  output.approvedForSendExecution = false;
  output.deliveryAdapterStatus = DELIVERY_ADAPTER_STATUSES.PREPARED_FOR_MANUAL_DELIVERY;
  output.decision = channel === 'MANUAL' || channel === 'MANUAL_COPY' || channel === 'MANAGER_REVIEW'
    ? DELIVERY_ADAPTER_DECISIONS.PREPARE_MANUAL_HANDOFF
    : DELIVERY_ADAPTER_DECISIONS.PREPARE_DELIVERY_CANDIDATE;

  return output;
}

module.exports = {
  buildDeliveryAdapterBoundary,
  DELIVERY_ADAPTER_STATUSES,
  DELIVERY_ADAPTER_DECISIONS,
  DELIVERY_ADAPTER_ALLOWED_USES,
  DELIVERY_ADAPTER_FORBIDDEN_USES,
};
