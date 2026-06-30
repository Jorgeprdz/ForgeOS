/**
 * Provider Webhook Boundary Contract
 *
 * External provider event candidate is not delivery truth.
 * Pure boundary: validates provider event candidate and prepares a read model candidate.
 * Never registers listeners, never calls provider APIs, never creates truth or side effects.
 */

const PROVIDER_WEBHOOK_STATUSES = Object.freeze({
  READY_FOR_WEBHOOK_REVIEW: 'READY_FOR_WEBHOOK_REVIEW',
  APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION: 'APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION',
  NEEDS_EXTERNAL_DISPATCH: 'NEEDS_EXTERNAL_DISPATCH',
  NEEDS_WEBHOOK_EVENT_CANDIDATE: 'NEEDS_WEBHOOK_EVENT_CANDIDATE',
  NEEDS_PROVIDER_MESSAGE_REF: 'NEEDS_PROVIDER_MESSAGE_REF',
  NEEDS_PROVIDER_EVENT_TYPE: 'NEEDS_PROVIDER_EVENT_TYPE',
  NEEDS_SIGNATURE_VERIFICATION: 'NEEDS_SIGNATURE_VERIFICATION',
  NEEDS_SCHEMA_VALIDATION: 'NEEDS_SCHEMA_VALIDATION',
  NEEDS_REPLAY_PROTECTION: 'NEEDS_REPLAY_PROTECTION',
  NEEDS_DEDUPE_REVIEW: 'NEEDS_DEDUPE_REVIEW',
  NEEDS_WEBHOOK_CAPABILITY: 'NEEDS_WEBHOOK_CAPABILITY',
  NEEDS_WEBHOOK_POLICY: 'NEEDS_WEBHOOK_POLICY',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  NEEDS_AUDIT_TRAIL: 'NEEDS_AUDIT_TRAIL',
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER',
  UNSUPPORTED_CHANNEL: 'UNSUPPORTED_CHANNEL',
  UNSUPPORTED_EVENT_TYPE: 'UNSUPPORTED_EVENT_TYPE',
  EXPIRED_WEBHOOK_WINDOW: 'EXPIRED_WEBHOOK_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const PROVIDER_WEBHOOK_DECISIONS = Object.freeze({
  REQUEST_WEBHOOK_REVIEW: 'REQUEST_WEBHOOK_REVIEW',
  APPROVE_WEBHOOK_READ_MODEL_PREPARATION: 'APPROVE_WEBHOOK_READ_MODEL_PREPARATION',
  BLOCK_WEBHOOK: 'BLOCK_WEBHOOK',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const PROVIDER_WEBHOOK_ALLOWED_USES = Object.freeze([
  'PROVIDER_WEBHOOK_REVIEW',
  'PROVIDER_WEBHOOK_READ_MODEL_PREP',
  'WHATSAPP_WEBHOOK_REVIEW',
  'SMS_WEBHOOK_REVIEW',
  'EMAIL_WEBHOOK_REVIEW',
  'DELIVERY_STATUS_REVIEW',
  'BOUNCE_STATUS_REVIEW',
]);

const PROVIDER_WEBHOOK_FORBIDDEN_USES = Object.freeze([
  'WEBHOOK_LISTENER_REGISTRATION',
  'WEBHOOK_SIDE_EFFECT',
  'EXTERNAL_API_CALL',
  'PROVIDER_API_CALL',
  'PROVIDER_DISPATCH',
  'EXTERNAL_DISPATCH',
  'EXECUTOR_INVOCATION',
  'CONNECTOR_INVOCATION',
  'SEND_MESSAGE',
  'DELIVERY_TRUTH_CREATION',
  'MESSAGE_TRUTH_CREATION',
  'CRM_MUTATION',
  'AUTOMATIC_FOLLOW_UP',
  'AUTOMATIC_RETRY',
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

const SUPPORTED_PROVIDERS = Object.freeze(['MOCK_PROVIDER', 'WHATSAPP_BUSINESS', 'TWILIO', 'SENDGRID', 'SMTP']);
const SUPPORTED_CHANNELS = Object.freeze(['WHATSAPP', 'SMS', 'EMAIL']);
const SUPPORTED_EVENT_TYPES = Object.freeze([
  'ACCEPTED_STATUS',
  'SENT_STATUS',
  'DELIVERED_STATUS',
  'FAILED_STATUS',
  'BOUNCE_STATUS',
  'READ_STATUS',
  'DELIVERY_STATUS',
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

function normalizeString(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : undefined;
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

function hasExternalDispatchSnapshot(snapshot) {
  return Boolean(snapshot && typeof snapshot === 'object' && snapshot.approvedForExternalDispatchPreparation === true);
}

function hasSignatureVerification(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.verified === false || snapshot.signatureValid === false) return false;
  return snapshot.verified === true || snapshot.signatureValid === true;
}

function hasSchemaValidation(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.valid === false || snapshot.schemaValid === false) return false;
  return snapshot.valid === true || snapshot.schemaValid === true;
}

function hasReplayProtection(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.replayDetected === true) return false;
  return snapshot.reviewed === true || snapshot.replayProtectionPassed === true;
}

function hasDedupeReview(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.duplicate === true || snapshot.duplicateDetected === true) return false;
  return snapshot.reviewed === true || snapshot.dedupeReviewed === true;
}

function hasWebhookCapability(snapshot, providerName, channel, eventType) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.available === false || snapshot.supported === false) return false;

  const providers = asArray(snapshot.supportedProviders || snapshot.providers).map(normalizeString).filter(Boolean);
  const channels = asArray(snapshot.supportedChannels || snapshot.channels).map(normalizeString).filter(Boolean);
  const eventTypes = asArray(snapshot.supportedEventTypes || snapshot.eventTypes).map(normalizeString).filter(Boolean);

  return (
    (providers.length === 0 || providers.includes(providerName)) &&
    (channels.length === 0 || channels.includes(channel)) &&
    (eventTypes.length === 0 || eventTypes.includes(eventType))
  );
}

function hasWebhookPolicy(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  if (snapshot.webhookSideEffectAllowed === true) return false;
  if (snapshot.externalApiCallAllowed === true) return false;
  if (snapshot.providerApiCallAllowed === true) return false;
  if (snapshot.createsDeliveryTruth === true) return false;
  if (snapshot.createsMessageTruth === true) return false;
  if (snapshot.crmMutationAllowed === true) return false;
  if (snapshot.automaticFollowUpAllowed === true) return false;
  if (snapshot.automaticRetryAllowed === true) return false;
  return true;
}

function hasAuditTrail(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.auditTrailId || snapshot.auditId) return true;
  return asArray(snapshot.entries || snapshot.events).length > 0;
}

function baseOutput(input, evidenceBundle) {
  return {
    providerWebhookBoundaryStatus: PROVIDER_WEBHOOK_STATUSES.UNKNOWN,
    decision: PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT,

    providerWebhookBoundaryRequestId: input.providerWebhookBoundaryRequestId || null,
    externalDispatchRequestId: input.externalDispatchRequestId || input.externalDispatchSnapshot?.externalDispatchRequestId || null,
    sendRequestId: input.sendRequestId || input.externalDispatchSnapshot?.sendRequestId || null,
    providerName: input.providerName || input.externalDispatchSnapshot?.providerName || null,
    providerConnectorName: input.providerConnectorName || input.externalDispatchSnapshot?.providerConnectorName || null,
    connectorExecutorName: input.connectorExecutorName || input.externalDispatchSnapshot?.connectorExecutorName || null,
    externalDispatchMode: input.externalDispatchMode || input.externalDispatchSnapshot?.externalDispatchMode || null,
    channel: input.channel || input.externalDispatchSnapshot?.channel || null,
    providerMessageRef: input.providerMessageRef || input.webhookEventCandidate?.providerMessageRef || null,
    providerEventType: input.providerEventType || input.webhookEventCandidate?.providerEventType || input.webhookEventCandidate?.eventType || null,
    idempotencyKey: input.idempotencyKey || input.externalDispatchSnapshot?.idempotencyKey || null,

    webhookEventCandidate: input.webhookEventCandidate || null,
    providerEventReadModelCandidate: null,
    approvedForWebhookIntakeReview: false,
    approvedForWebhookSideEffects: false,
    webhookSideEffectAllowed: false,
    externalApiCallAllowed: false,
    providerApiCallAllowed: false,
    createsDeliveryTruth: false,
    createsMessageTruth: false,
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
    automaticFollowUpAllowed: false,
    automaticRetryAllowed: false,
    crmMutationAllowed: false,

    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.externalDispatchSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.externalDispatchSnapshot?.limitations))]),

    evidenceRefs: evidenceBundle.evidenceRefs,
    sourceEvidenceIds: evidenceBundle.sourceEvidenceIds,
    sourceOwners: evidenceBundle.sourceOwners,
  };
}

function markBlocked(output, status, decision, signal, blockedUse) {
  output.providerWebhookBoundaryStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildProviderWebhookBoundary(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);

  const requestedUse = normalizeUse(original.requestedUse);
  if (requestedUse && PROVIDER_WEBHOOK_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.BLOCKED, PROVIDER_WEBHOOK_DECISIONS.BLOCK_WEBHOOK, null, requestedUse);
  }

  if (requestedUse && !PROVIDER_WEBHOOK_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.providerWebhookBoundaryStatus = PROVIDER_WEBHOOK_STATUSES.NOT_MODELED;
    output.decision = PROVIDER_WEBHOOK_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  const externalDispatchSnapshot = original.externalDispatchSnapshot;
  if (!hasExternalDispatchSnapshot(externalDispatchSnapshot)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_EXTERNAL_DISPATCH, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'externalDispatchSnapshot');
  }

  const eventCandidate = original.webhookEventCandidate;
  if (!eventCandidate || typeof eventCandidate !== 'object') {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_WEBHOOK_EVENT_CANDIDATE, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'webhookEventCandidate');
  }

  const providerMessageRef = original.providerMessageRef || eventCandidate.providerMessageRef || eventCandidate.messageRef;
  if (!providerMessageRef) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_PROVIDER_MESSAGE_REF, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'providerMessageRef');
  }

  const providerEventType = normalizeString(original.providerEventType || eventCandidate.providerEventType || eventCandidate.eventType);
  if (!providerEventType) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_PROVIDER_EVENT_TYPE, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'providerEventType');
  }

  if (!hasSignatureVerification(original.signatureVerificationSnapshot)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_SIGNATURE_VERIFICATION, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'signatureVerificationSnapshot');
  }

  if (!hasSchemaValidation(original.webhookSchemaValidationSnapshot)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_SCHEMA_VALIDATION, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'webhookSchemaValidationSnapshot');
  }

  if (!hasReplayProtection(original.replayProtectionSnapshot)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_REPLAY_PROTECTION, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'replayProtectionSnapshot');
  }

  if (!hasDedupeReview(original.dedupeSnapshot)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_DEDUPE_REVIEW, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'dedupeSnapshot');
  }

  const providerName = normalizeString(original.providerName || externalDispatchSnapshot.providerName || eventCandidate.providerName);
  if (providerName && !SUPPORTED_PROVIDERS.includes(providerName)) {
    output.providerName = providerName;
    output.providerWebhookBoundaryStatus = PROVIDER_WEBHOOK_STATUSES.UNSUPPORTED_PROVIDER;
    output.decision = PROVIDER_WEBHOOK_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_PROVIDER']);
    return output;
  }

  const channel = normalizeString(original.channel || externalDispatchSnapshot.channel || eventCandidate.channel);
  if (channel && !SUPPORTED_CHANNELS.includes(channel)) {
    output.channel = channel;
    output.providerWebhookBoundaryStatus = PROVIDER_WEBHOOK_STATUSES.UNSUPPORTED_CHANNEL;
    output.decision = PROVIDER_WEBHOOK_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CHANNEL']);
    return output;
  }

  if (!SUPPORTED_EVENT_TYPES.includes(providerEventType)) {
    output.providerEventType = providerEventType;
    output.providerWebhookBoundaryStatus = PROVIDER_WEBHOOK_STATUSES.UNSUPPORTED_EVENT_TYPE;
    output.decision = PROVIDER_WEBHOOK_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_EVENT_TYPE']);
    return output;
  }

  if (!hasWebhookCapability(original.webhookCapabilitySnapshot, providerName, channel, providerEventType)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_WEBHOOK_CAPABILITY, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'webhookCapabilitySnapshot');
  }

  if (!hasWebhookPolicy(original.webhookPolicySnapshot)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_WEBHOOK_POLICY, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'webhookPolicySnapshot');
  }

  const idempotencyKey = original.idempotencyKey || externalDispatchSnapshot.idempotencyKey || eventCandidate.idempotencyKey;
  if (!idempotencyKey) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_IDEMPOTENCY_KEY, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (!hasAuditTrail(original.auditTrail)) {
    return markBlocked(output, PROVIDER_WEBHOOK_STATUSES.NEEDS_AUDIT_TRAIL, PROVIDER_WEBHOOK_DECISIONS.NEEDS_MORE_CONTEXT, 'auditTrail');
  }

  if (isExpired(original.expiresAt || original.webhookWindowExpiresAt || externalDispatchSnapshot.expiresAt, original.now)) {
    output.providerWebhookBoundaryStatus = PROVIDER_WEBHOOK_STATUSES.EXPIRED_WEBHOOK_WINDOW;
    output.decision = PROVIDER_WEBHOOK_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_WEBHOOK_WINDOW']);
    return output;
  }

  output.providerName = providerName || null;
  output.channel = channel || null;
  output.providerMessageRef = providerMessageRef;
  output.providerEventType = providerEventType;
  output.idempotencyKey = idempotencyKey;
  output.webhookEventCandidate = eventCandidate;
  output.providerEventReadModelCandidate = {
    providerName: providerName || null,
    channel: channel || null,
    providerMessageRef,
    providerEventType,
    idempotencyKey,
    webhookEventCandidate: eventCandidate,
    createsDeliveryTruth: false,
    createsMessageTruth: false,
    webhookSideEffectAllowed: false,
    externalApiCallAllowed: false,
    providerApiCallAllowed: false,
  };

  output.approvedForWebhookIntakeReview = true;
  output.providerWebhookBoundaryStatus = PROVIDER_WEBHOOK_STATUSES.APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION;
  output.decision = PROVIDER_WEBHOOK_DECISIONS.APPROVE_WEBHOOK_READ_MODEL_PREPARATION;

  return output;
}

module.exports = {
  buildProviderWebhookBoundary,
  PROVIDER_WEBHOOK_STATUSES,
  PROVIDER_WEBHOOK_DECISIONS,
  PROVIDER_WEBHOOK_ALLOWED_USES,
  PROVIDER_WEBHOOK_FORBIDDEN_USES,
};
