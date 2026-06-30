/**
 * External Dispatch Boundary Contract
 *
 * Executor command candidate is not external dispatch.
 * Pure boundary: prepares external dispatch request candidate.
 * Never dispatches, never calls external APIs, never sends, never creates truth.
 */

const EXTERNAL_DISPATCH_STATUSES = Object.freeze({
  READY_FOR_EXTERNAL_DISPATCH_REVIEW: 'READY_FOR_EXTERNAL_DISPATCH_REVIEW',
  APPROVED_FOR_EXTERNAL_DISPATCH_PREPARATION: 'APPROVED_FOR_EXTERNAL_DISPATCH_PREPARATION',
  APPROVED_FOR_EXTERNAL_DISPATCH_DRY_RUN_ONLY: 'APPROVED_FOR_EXTERNAL_DISPATCH_DRY_RUN_ONLY',
  NEEDS_CONNECTOR_EXECUTOR: 'NEEDS_CONNECTOR_EXECUTOR',
  NEEDS_EXECUTOR_COMMAND_CANDIDATE: 'NEEDS_EXECUTOR_COMMAND_CANDIDATE',
  NEEDS_EXTERNAL_DISPATCH_CONFIRMATION: 'NEEDS_EXTERNAL_DISPATCH_CONFIRMATION',
  NEEDS_DISPATCH_CAPABILITY: 'NEEDS_DISPATCH_CAPABILITY',
  NEEDS_DISPATCH_POLICY: 'NEEDS_DISPATCH_POLICY',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  NEEDS_AUDIT_TRAIL: 'NEEDS_AUDIT_TRAIL',
  NEEDS_CREDENTIAL_REVIEW: 'NEEDS_CREDENTIAL_REVIEW',
  NEEDS_RATE_LIMIT_REVIEW: 'NEEDS_RATE_LIMIT_REVIEW',
  NEEDS_RETRY_POLICY: 'NEEDS_RETRY_POLICY',
  UNSUPPORTED_DISPATCH_MODE: 'UNSUPPORTED_DISPATCH_MODE',
  UNSUPPORTED_EXECUTOR: 'UNSUPPORTED_EXECUTOR',
  UNSUPPORTED_CONNECTOR: 'UNSUPPORTED_CONNECTOR',
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER',
  UNSUPPORTED_CHANNEL: 'UNSUPPORTED_CHANNEL',
  EXPIRED_DISPATCH_WINDOW: 'EXPIRED_DISPATCH_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const EXTERNAL_DISPATCH_DECISIONS = Object.freeze({
  REQUEST_EXTERNAL_DISPATCH_REVIEW: 'REQUEST_EXTERNAL_DISPATCH_REVIEW',
  APPROVE_EXTERNAL_DISPATCH_PREPARATION: 'APPROVE_EXTERNAL_DISPATCH_PREPARATION',
  APPROVE_EXTERNAL_DISPATCH_DRY_RUN_ONLY: 'APPROVE_EXTERNAL_DISPATCH_DRY_RUN_ONLY',
  BLOCK_EXTERNAL_DISPATCH: 'BLOCK_EXTERNAL_DISPATCH',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const EXTERNAL_DISPATCH_ALLOWED_USES = Object.freeze([
  'EXTERNAL_DISPATCH_REVIEW',
  'EXTERNAL_DISPATCH_REQUEST_PREP',
  'EXTERNAL_DISPATCH_DRY_RUN_PREP',
  'WHATSAPP_DISPATCH_REVIEW',
  'SMS_DISPATCH_REVIEW',
  'EMAIL_DISPATCH_REVIEW',
]);

const EXTERNAL_DISPATCH_FORBIDDEN_USES = Object.freeze([
  'AUTOMATIC_SEND',
  'SILENT_SEND',
  'AI_SELF_SEND',
  'EXTERNAL_API_CALL',
  'EXTERNAL_DISPATCH',
  'EXECUTOR_INVOCATION',
  'CONNECTOR_INVOCATION',
  'CONNECTOR_EXECUTION',
  'PROVIDER_DISPATCH',
  'SEND_MESSAGE',
  'DISPATCH_WITHOUT_EXECUTOR_BOUNDARY',
  'DISPATCH_WITHOUT_HUMAN_CONFIRMATION',
  'DISPATCH_WITHOUT_IDEMPOTENCY',
  'DISPATCH_WITHOUT_AUDIT',
  'DISPATCH_WITHOUT_CREDENTIAL_REVIEW',
  'CREDENTIAL_MATERIAL_EXPOSURE',
  'WHATSAPP_API_SEND',
  'SMS_API_SEND',
  'EMAIL_API_SEND',
  'SCHEDULED_SEND',
  'QUEUE_EXECUTION',
  'RETRY_WITHOUT_POLICY',
  'WEBHOOK_SIDE_EFFECT',
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

const SUPPORTED_CHANNELS = Object.freeze(['WHATSAPP', 'SMS', 'EMAIL']);
const SUPPORTED_PROVIDERS = Object.freeze(['MOCK_PROVIDER', 'WHATSAPP_BUSINESS', 'TWILIO', 'SENDGRID', 'SMTP']);
const SUPPORTED_CONNECTORS = Object.freeze(['MOCK_CONNECTOR', 'WHATSAPP_BUSINESS_CONNECTOR', 'TWILIO_CONNECTOR', 'SENDGRID_CONNECTOR', 'SMTP_CONNECTOR']);
const SUPPORTED_EXECUTORS = Object.freeze(['MOCK_EXECUTOR', 'WHATSAPP_BUSINESS_EXECUTOR', 'TWILIO_EXECUTOR', 'SENDGRID_EXECUTOR', 'SMTP_EXECUTOR']);
const SUPPORTED_DISPATCH_MODES = Object.freeze(['MOCK_DISPATCH', 'WHATSAPP_DISPATCH', 'SMS_DISPATCH', 'EMAIL_DISPATCH', 'DRY_RUN_DISPATCH']);

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

function hasConnectorExecutorSnapshot(snapshot) {
  return Boolean(snapshot && typeof snapshot === 'object' && snapshot.approvedForExecutorCommandPreparation === true);
}

function hasFinalExternalDispatchConfirmation(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const confirmed = snapshot.confirmed === true || snapshot.finalExternalDispatchConfirmed === true;
  const actor = snapshot.confirmedBy || snapshot.senderId || snapshot.reviewerId;
  const at = snapshot.confirmedAt || snapshot.timestamp;
  return Boolean(confirmed && actor && at);
}

function hasDispatchCapability(snapshot, dispatchMode, executorName, connectorName, providerName, channel) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.available === false || snapshot.supported === false) return false;

  const modes = asArray(snapshot.supportedDispatchModes || snapshot.dispatchModes).map(normalizeString).filter(Boolean);
  const executors = asArray(snapshot.supportedExecutors || snapshot.executors).map(normalizeString).filter(Boolean);
  const connectors = asArray(snapshot.supportedConnectors || snapshot.connectors).map(normalizeString).filter(Boolean);
  const providers = asArray(snapshot.supportedProviders || snapshot.providers).map(normalizeString).filter(Boolean);
  const channels = asArray(snapshot.supportedChannels || snapshot.channels).map(normalizeString).filter(Boolean);

  return (
    (modes.length === 0 || modes.includes(dispatchMode)) &&
    (executors.length === 0 || executors.includes(executorName)) &&
    (connectors.length === 0 || connectors.includes(connectorName)) &&
    (providers.length === 0 || providers.includes(providerName)) &&
    (channels.length === 0 || channels.includes(channel))
  );
}

function hasDispatchPolicy(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  if (snapshot.externalApiCallAllowed === true) return false;
  if (snapshot.externalDispatchAllowed === true) return false;
  if (snapshot.executorInvocationAllowed === true) return false;
  if (snapshot.providerDispatchAllowed === true) return false;
  return true;
}

function hasCredentialReview(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.credentialReviewPassed !== true) return false;
  if (snapshot.credentialsAvailable === false) return false;
  if (snapshot.accessApproved === false) return false;
  if (snapshot.credentialMaterialExposed === true) return false;
  return true;
}

function hasRateLimitReview(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.rateLimitReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  return true;
}

function hasRetryPolicy(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.retryPolicyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  return true;
}

function hasAuditTrail(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.auditTrailId || snapshot.auditId) return true;
  return asArray(snapshot.entries || snapshot.events).length > 0;
}

function baseOutput(input, evidenceBundle) {
  return {
    externalDispatchBoundaryStatus: EXTERNAL_DISPATCH_STATUSES.UNKNOWN,
    decision: EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT,

    externalDispatchRequestId: input.externalDispatchRequestId || null,
    connectorExecutorRequestId: input.connectorExecutorRequestId || input.connectorExecutorSnapshot?.connectorExecutorRequestId || null,
    connectorExecutionGateRequestId: input.connectorExecutionGateRequestId || input.connectorExecutorSnapshot?.connectorExecutionGateRequestId || null,
    providerConnectorRequestId: input.providerConnectorRequestId || input.connectorExecutorSnapshot?.providerConnectorRequestId || null,
    providerRuntimeRequestId: input.providerRuntimeRequestId || input.connectorExecutorSnapshot?.providerRuntimeRequestId || null,
    sendRequestId: input.sendRequestId || input.connectorExecutorSnapshot?.sendRequestId || null,
    deliveryRequestId: input.deliveryRequestId || input.connectorExecutorSnapshot?.deliveryRequestId || null,
    approvalRequestId: input.approvalRequestId || input.connectorExecutorSnapshot?.approvalRequestId || null,
    advisorId: input.advisorId || null,
    managerId: input.managerId || null,
    senderId: input.senderId || input.connectorExecutorSnapshot?.senderId || null,
    senderRole: input.senderRole || input.connectorExecutorSnapshot?.senderRole || null,
    personId: input.personId || null,
    personType: input.personType || null,

    providerName: input.providerName || input.connectorExecutorSnapshot?.providerName || null,
    providerConnectorName: input.providerConnectorName || input.connectorExecutorSnapshot?.providerConnectorName || null,
    connectorExecutorName: input.connectorExecutorName || input.connectorExecutorSnapshot?.connectorExecutorName || null,
    externalDispatchMode: input.externalDispatchMode || null,
    channel: input.channel || input.connectorExecutorSnapshot?.channel || null,
    idempotencyKey: input.idempotencyKey || input.connectorExecutorSnapshot?.idempotencyKey || null,
    dryRun: input.dryRun === true,

    externalDispatchRequestCandidate: null,
    executorCommandCandidate: input.executorCommandCandidate || input.connectorExecutorSnapshot?.executorCommandCandidate || null,

    approvedForExternalDispatchPreparation: false,
    approvedForExternalDispatchExecution: false,
    externalDispatchAllowed: false,
    externalApiCallAllowed: false,
    executorInvocationAllowed: false,
    connectorInvocationAllowed: false,
    providerDispatchAllowed: false,
    sendsMessage: false,
    credentialMaterialExposed: false,
    retryAllowed: false,
    queueExecutionAllowed: false,
    scheduledExecutionAllowed: false,
    webhookSideEffectAllowed: false,
    automaticSendAllowed: false,
    silentSendAllowed: false,
    humanSendConfirmationRequired: true,
    externalDispatchConfirmationRequired: true,
    connectorExecutorBoundaryRequired: true,
    externalDispatchAuditRequired: true,
    providerWebhookBoundaryRequired: true,

    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.connectorExecutorSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.connectorExecutorSnapshot?.limitations))]),

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
  output.externalDispatchBoundaryStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildExternalDispatchBoundary(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);

  const requestedUse = normalizeUse(original.requestedUse);
  if (requestedUse && EXTERNAL_DISPATCH_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.BLOCKED, EXTERNAL_DISPATCH_DECISIONS.BLOCK_EXTERNAL_DISPATCH, null, requestedUse);
  }

  if (requestedUse && !EXTERNAL_DISPATCH_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.externalDispatchBoundaryStatus = EXTERNAL_DISPATCH_STATUSES.NOT_MODELED;
    output.decision = EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  const executorSnapshot = original.connectorExecutorSnapshot;
  if (!hasConnectorExecutorSnapshot(executorSnapshot)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_CONNECTOR_EXECUTOR, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'connectorExecutorSnapshot');
  }

  const commandCandidate = original.executorCommandCandidate || executorSnapshot.executorCommandCandidate;
  if (!commandCandidate || typeof commandCandidate !== 'object') {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_EXECUTOR_COMMAND_CANDIDATE, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'executorCommandCandidate');
  }

  if (!hasFinalExternalDispatchConfirmation(original.finalExternalDispatchConfirmation)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_EXTERNAL_DISPATCH_CONFIRMATION, EXTERNAL_DISPATCH_DECISIONS.REQUEST_EXTERNAL_DISPATCH_REVIEW, 'finalExternalDispatchConfirmation');
  }

  const dispatchMode = normalizeString(original.externalDispatchMode);
  if (!dispatchMode || !SUPPORTED_DISPATCH_MODES.includes(dispatchMode)) {
    output.externalDispatchMode = dispatchMode || null;
    output.externalDispatchBoundaryStatus = EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_DISPATCH_MODE;
    output.decision = EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_DISPATCH_MODE']);
    return output;
  }

  const executorName = normalizeString(original.connectorExecutorName || executorSnapshot.connectorExecutorName || commandCandidate.executorName);
  if (executorName && !SUPPORTED_EXECUTORS.includes(executorName)) {
    output.connectorExecutorName = executorName;
    output.externalDispatchBoundaryStatus = EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_EXECUTOR;
    output.decision = EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_EXECUTOR']);
    return output;
  }

  const connectorName = normalizeString(original.providerConnectorName || executorSnapshot.providerConnectorName || commandCandidate.connectorName);
  if (connectorName && !SUPPORTED_CONNECTORS.includes(connectorName)) {
    output.providerConnectorName = connectorName;
    output.externalDispatchBoundaryStatus = EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_CONNECTOR;
    output.decision = EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CONNECTOR']);
    return output;
  }

  const providerName = normalizeString(original.providerName || executorSnapshot.providerName || commandCandidate.providerName);
  if (providerName && !SUPPORTED_PROVIDERS.includes(providerName)) {
    output.providerName = providerName;
    output.externalDispatchBoundaryStatus = EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_PROVIDER;
    output.decision = EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_PROVIDER']);
    return output;
  }

  const channel = normalizeString(original.channel || executorSnapshot.channel || commandCandidate.channel);
  if (channel && !SUPPORTED_CHANNELS.includes(channel)) {
    output.channel = channel;
    output.externalDispatchBoundaryStatus = EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_CHANNEL;
    output.decision = EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CHANNEL']);
    return output;
  }

  const idempotencyKey = original.idempotencyKey || executorSnapshot.idempotencyKey || commandCandidate.idempotencyKey;
  if (!idempotencyKey) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_IDEMPOTENCY_KEY, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (!hasAuditTrail(original.auditTrail)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_AUDIT_TRAIL, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'auditTrail');
  }

  if (!hasDispatchCapability(original.dispatchCapabilitySnapshot, dispatchMode, executorName, connectorName, providerName, channel)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_DISPATCH_CAPABILITY, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'dispatchCapabilitySnapshot');
  }

  if (!hasDispatchPolicy(original.dispatchPolicySnapshot)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_DISPATCH_POLICY, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'dispatchPolicySnapshot');
  }

  if (!hasCredentialReview(original.credentialReviewSnapshot)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_CREDENTIAL_REVIEW, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'credentialReviewSnapshot');
  }

  if (!hasRateLimitReview(original.rateLimitSnapshot)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_RATE_LIMIT_REVIEW, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'rateLimitSnapshot');
  }

  if (original.retryRequested === true && !hasRetryPolicy(original.retryPolicySnapshot)) {
    return markBlocked(output, EXTERNAL_DISPATCH_STATUSES.NEEDS_RETRY_POLICY, EXTERNAL_DISPATCH_DECISIONS.NEEDS_MORE_CONTEXT, 'retryPolicySnapshot');
  }

  if (isExpired(original.expiresAt || original.dispatchWindowExpiresAt || executorSnapshot.expiresAt, original.now)) {
    output.externalDispatchBoundaryStatus = EXTERNAL_DISPATCH_STATUSES.EXPIRED_DISPATCH_WINDOW;
    output.decision = EXTERNAL_DISPATCH_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_DISPATCH_WINDOW']);
    return output;
  }

  output.providerName = providerName || null;
  output.providerConnectorName = connectorName || null;
  output.connectorExecutorName = executorName || null;
  output.externalDispatchMode = dispatchMode;
  output.channel = channel || null;
  output.idempotencyKey = idempotencyKey;
  output.executorCommandCandidate = commandCandidate;
  output.externalDispatchRequestCandidate = {
    dispatchMode,
    executorName: executorName || null,
    connectorName: connectorName || null,
    providerName: providerName || null,
    channel: channel || null,
    idempotencyKey,
    dryRun: original.dryRun === true,
    executorCommandCandidate: commandCandidate,
    externalDispatchAllowed: false,
    externalApiCallAllowed: false,
    providerDispatchAllowed: false,
    sendsMessage: false,
  };

  output.approvedForExternalDispatchPreparation = true;
  output.approvedForExternalDispatchExecution = false;
  output.externalDispatchAllowed = false;
  output.externalApiCallAllowed = false;
  output.executorInvocationAllowed = false;
  output.connectorInvocationAllowed = false;
  output.providerDispatchAllowed = false;
  output.sendsMessage = false;
  output.credentialMaterialExposed = false;

  output.externalDispatchBoundaryStatus = original.dryRun === true
    ? EXTERNAL_DISPATCH_STATUSES.APPROVED_FOR_EXTERNAL_DISPATCH_DRY_RUN_ONLY
    : EXTERNAL_DISPATCH_STATUSES.APPROVED_FOR_EXTERNAL_DISPATCH_PREPARATION;
  output.decision = original.dryRun === true
    ? EXTERNAL_DISPATCH_DECISIONS.APPROVE_EXTERNAL_DISPATCH_DRY_RUN_ONLY
    : EXTERNAL_DISPATCH_DECISIONS.APPROVE_EXTERNAL_DISPATCH_PREPARATION;

  return output;
}

module.exports = {
  buildExternalDispatchBoundary,
  EXTERNAL_DISPATCH_STATUSES,
  EXTERNAL_DISPATCH_DECISIONS,
  EXTERNAL_DISPATCH_ALLOWED_USES,
  EXTERNAL_DISPATCH_FORBIDDEN_USES,
};
