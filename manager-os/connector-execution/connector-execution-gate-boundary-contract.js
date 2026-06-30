/**
 * Connector Execution Gate Boundary Contract
 *
 * Connector invocation candidate is not connector execution.
 * This pure boundary validates final execution handoff readiness.
 * It never invokes connectors, never calls external APIs, never dispatches, never sends,
 * never exposes credential material, never creates tasks/calendar, and never creates truth.
 */

const CONNECTOR_EXECUTION_GATE_STATUSES = Object.freeze({
  READY_FOR_CONNECTOR_EXECUTION_REVIEW: 'READY_FOR_CONNECTOR_EXECUTION_REVIEW',
  APPROVED_FOR_CONNECTOR_EXECUTION_HANDOFF: 'APPROVED_FOR_CONNECTOR_EXECUTION_HANDOFF',
  APPROVED_FOR_EXECUTION_DRY_RUN_ONLY: 'APPROVED_FOR_EXECUTION_DRY_RUN_ONLY',
  NEEDS_PROVIDER_CONNECTOR: 'NEEDS_PROVIDER_CONNECTOR',
  NEEDS_CONNECTOR_INVOCATION_CANDIDATE: 'NEEDS_CONNECTOR_INVOCATION_CANDIDATE',
  NEEDS_CONNECTOR_EXECUTION_CONFIRMATION: 'NEEDS_CONNECTOR_EXECUTION_CONFIRMATION',
  NEEDS_CONNECTOR_EXECUTOR: 'NEEDS_CONNECTOR_EXECUTOR',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  NEEDS_AUDIT_TRAIL: 'NEEDS_AUDIT_TRAIL',
  NEEDS_CONNECTOR_CAPABILITY: 'NEEDS_CONNECTOR_CAPABILITY',
  NEEDS_CONNECTOR_POLICY: 'NEEDS_CONNECTOR_POLICY',
  NEEDS_CREDENTIAL_REVIEW: 'NEEDS_CREDENTIAL_REVIEW',
  NEEDS_RATE_LIMIT_REVIEW: 'NEEDS_RATE_LIMIT_REVIEW',
  NEEDS_RETRY_POLICY: 'NEEDS_RETRY_POLICY',
  UNSUPPORTED_CONNECTOR_EXECUTOR: 'UNSUPPORTED_CONNECTOR_EXECUTOR',
  UNSUPPORTED_CONNECTOR: 'UNSUPPORTED_CONNECTOR',
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER',
  UNSUPPORTED_CHANNEL: 'UNSUPPORTED_CHANNEL',
  EXPIRED_EXECUTION_WINDOW: 'EXPIRED_EXECUTION_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const CONNECTOR_EXECUTION_GATE_DECISIONS = Object.freeze({
  REQUEST_CONNECTOR_EXECUTION_REVIEW: 'REQUEST_CONNECTOR_EXECUTION_REVIEW',
  APPROVE_CONNECTOR_EXECUTION_HANDOFF: 'APPROVE_CONNECTOR_EXECUTION_HANDOFF',
  APPROVE_EXECUTION_DRY_RUN_ONLY: 'APPROVE_EXECUTION_DRY_RUN_ONLY',
  BLOCK_CONNECTOR_EXECUTION: 'BLOCK_CONNECTOR_EXECUTION',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const CONNECTOR_EXECUTION_GATE_ALLOWED_USES = Object.freeze([
  'CONNECTOR_EXECUTION_REVIEW',
  'CONNECTOR_EXECUTION_HANDOFF_PREP',
  'CONNECTOR_EXECUTION_DRY_RUN_PREP',
  'WHATSAPP_CONNECTOR_EXECUTION_REVIEW',
  'SMS_CONNECTOR_EXECUTION_REVIEW',
  'EMAIL_CONNECTOR_EXECUTION_REVIEW',
]);

const CONNECTOR_EXECUTION_GATE_FORBIDDEN_USES = Object.freeze([
  'AUTOMATIC_SEND',
  'SILENT_SEND',
  'AI_SELF_SEND',
  'EXTERNAL_API_CALL',
  'CONNECTOR_INVOCATION',
  'CONNECTOR_EXECUTION',
  'PROVIDER_DISPATCH',
  'SEND_MESSAGE',
  'CONNECTOR_EXECUTION_WITHOUT_CONNECTOR_GATE',
  'CONNECTOR_EXECUTION_WITHOUT_HUMAN_CONFIRMATION',
  'CONNECTOR_EXECUTION_WITHOUT_IDEMPOTENCY',
  'CONNECTOR_EXECUTION_WITHOUT_AUDIT',
  'CONNECTOR_EXECUTION_WITHOUT_CREDENTIAL_REVIEW',
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

function hasProviderConnectorSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  return snapshot.approvedForConnectorPreparation === true;
}

function hasFinalConnectorExecutionConfirmation(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const confirmed = snapshot.confirmed === true || snapshot.finalConnectorExecutionConfirmed === true;
  const actor = snapshot.confirmedBy || snapshot.senderId || snapshot.reviewerId;
  const at = snapshot.confirmedAt || snapshot.timestamp;
  return Boolean(confirmed && actor && at);
}

function hasConnectorCapability(snapshot, executorName, connectorName, providerName, channel) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.available === false || snapshot.supported === false) return false;

  const executors = asArray(snapshot.supportedExecutors || snapshot.executors).map(normalizeString).filter(Boolean);
  const connectors = asArray(snapshot.supportedConnectors || snapshot.connectors).map(normalizeString).filter(Boolean);
  const providers = asArray(snapshot.supportedProviders || snapshot.providers).map(normalizeString).filter(Boolean);
  const channels = asArray(snapshot.supportedChannels || snapshot.channels).map(normalizeString).filter(Boolean);

  const executorOk = executors.length === 0 || executors.includes(executorName);
  const connectorOk = connectors.length === 0 || connectors.includes(connectorName);
  const providerOk = providers.length === 0 || providers.includes(providerName);
  const channelOk = channels.length === 0 || channels.includes(channel);

  return executorOk && connectorOk && providerOk && channelOk;
}

function hasConnectorPolicy(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  if (snapshot.externalApiCallAllowed === true) return false;
  if (snapshot.connectorInvocationAllowed === true) return false;
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
    connectorExecutionGateStatus: CONNECTOR_EXECUTION_GATE_STATUSES.UNKNOWN,
    decision: CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT,

    connectorExecutionGateRequestId: input.connectorExecutionGateRequestId || null,
    providerConnectorRequestId: input.providerConnectorRequestId || input.providerConnectorSnapshot?.providerConnectorRequestId || null,
    providerRuntimeRequestId: input.providerRuntimeRequestId || input.providerConnectorSnapshot?.providerRuntimeRequestId || null,
    sendRequestId: input.sendRequestId || input.providerConnectorSnapshot?.sendRequestId || null,
    deliveryRequestId: input.deliveryRequestId || input.providerConnectorSnapshot?.deliveryRequestId || null,
    approvalRequestId: input.approvalRequestId || input.providerConnectorSnapshot?.approvalRequestId || null,
    advisorId: input.advisorId || null,
    managerId: input.managerId || null,
    senderId: input.senderId || input.providerConnectorSnapshot?.senderId || null,
    senderRole: input.senderRole || input.providerConnectorSnapshot?.senderRole || null,
    personId: input.personId || null,
    personType: input.personType || null,

    providerName: input.providerName || input.providerConnectorSnapshot?.providerName || null,
    providerConnectorName: input.providerConnectorName || input.providerConnectorSnapshot?.providerConnectorName || null,
    connectorExecutorName: input.connectorExecutorName || null,
    channel: input.channel || input.providerConnectorSnapshot?.channel || null,
    idempotencyKey: input.idempotencyKey || input.providerConnectorSnapshot?.idempotencyKey || null,
    dryRun: input.dryRun === true,

    connectorInvocationCandidate: input.connectorInvocationCandidate || input.providerConnectorSnapshot?.connectorInvocationCandidate || null,
    approvedForConnectorExecutionHandoff: false,
    approvedForConnectorExecution: false,
    connectorExecutionAllowed: false,
    connectorInvocationAllowed: false,
    externalApiCallAllowed: false,
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
    connectorExecutionConfirmationRequired: true,
    providerConnectorBoundaryRequired: true,
    connectorExecutionAuditRequired: true,
    connectorExecutorBoundaryRequired: true,

    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.providerConnectorSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.providerConnectorSnapshot?.limitations))]),

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
  output.connectorExecutionGateStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildConnectorExecutionGate(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);

  const requestedUse = normalizeUse(original.requestedUse);
  if (requestedUse && CONNECTOR_EXECUTION_GATE_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.BLOCKED, CONNECTOR_EXECUTION_GATE_DECISIONS.BLOCK_CONNECTOR_EXECUTION, null, requestedUse);
  }

  if (requestedUse && !CONNECTOR_EXECUTION_GATE_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.connectorExecutionGateStatus = CONNECTOR_EXECUTION_GATE_STATUSES.NOT_MODELED;
    output.decision = CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  const connectorSnapshot = original.providerConnectorSnapshot;
  if (!hasProviderConnectorSnapshot(connectorSnapshot)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_PROVIDER_CONNECTOR, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'providerConnectorSnapshot');
  }

  const invocationCandidate = original.connectorInvocationCandidate || connectorSnapshot.connectorInvocationCandidate;
  if (!invocationCandidate || typeof invocationCandidate !== 'object') {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_INVOCATION_CANDIDATE, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'connectorInvocationCandidate');
  }

  if (!hasFinalConnectorExecutionConfirmation(original.finalConnectorExecutionConfirmation)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_EXECUTION_CONFIRMATION, CONNECTOR_EXECUTION_GATE_DECISIONS.REQUEST_CONNECTOR_EXECUTION_REVIEW, 'finalConnectorExecutionConfirmation');
  }

  const executorName = normalizeString(original.connectorExecutorName);
  if (!executorName) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_EXECUTOR, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'connectorExecutorName');
  }

  if (!SUPPORTED_EXECUTORS.includes(executorName)) {
    output.connectorExecutorName = executorName;
    output.connectorExecutionGateStatus = CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_CONNECTOR_EXECUTOR;
    output.decision = CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CONNECTOR_EXECUTOR']);
    return output;
  }

  const connectorName = normalizeString(original.providerConnectorName || connectorSnapshot.providerConnectorName || invocationCandidate.connectorName);
  if (connectorName && !SUPPORTED_CONNECTORS.includes(connectorName)) {
    output.providerConnectorName = connectorName;
    output.connectorExecutionGateStatus = CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_CONNECTOR;
    output.decision = CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CONNECTOR']);
    return output;
  }

  const providerName = normalizeString(original.providerName || connectorSnapshot.providerName || invocationCandidate.providerName);
  if (providerName && !SUPPORTED_PROVIDERS.includes(providerName)) {
    output.providerName = providerName;
    output.connectorExecutionGateStatus = CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_PROVIDER;
    output.decision = CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_PROVIDER']);
    return output;
  }

  const channel = normalizeString(original.channel || connectorSnapshot.channel || invocationCandidate.channel);
  if (channel && !SUPPORTED_CHANNELS.includes(channel)) {
    output.channel = channel;
    output.connectorExecutionGateStatus = CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_CHANNEL;
    output.decision = CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CHANNEL']);
    return output;
  }

  const idempotencyKey = original.idempotencyKey || connectorSnapshot.idempotencyKey || invocationCandidate.idempotencyKey;
  if (!idempotencyKey) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_IDEMPOTENCY_KEY, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (!hasAuditTrail(original.auditTrail)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_AUDIT_TRAIL, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'auditTrail');
  }

  if (!hasConnectorCapability(original.connectorCapabilitySnapshot, executorName, connectorName, providerName, channel)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_CAPABILITY, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'connectorCapabilitySnapshot');
  }

  if (!hasConnectorPolicy(original.connectorPolicySnapshot)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_POLICY, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'connectorPolicySnapshot');
  }

  if (!hasCredentialReview(original.credentialReviewSnapshot)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CREDENTIAL_REVIEW, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'credentialReviewSnapshot');
  }

  if (!hasRateLimitReview(original.rateLimitSnapshot)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_RATE_LIMIT_REVIEW, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'rateLimitSnapshot');
  }

  if (original.retryRequested === true && !hasRetryPolicy(original.retryPolicySnapshot)) {
    return markBlocked(output, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_RETRY_POLICY, CONNECTOR_EXECUTION_GATE_DECISIONS.NEEDS_MORE_CONTEXT, 'retryPolicySnapshot');
  }

  if (isExpired(original.expiresAt || original.executionWindowExpiresAt || connectorSnapshot.expiresAt, original.now)) {
    output.connectorExecutionGateStatus = CONNECTOR_EXECUTION_GATE_STATUSES.EXPIRED_EXECUTION_WINDOW;
    output.decision = CONNECTOR_EXECUTION_GATE_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_EXECUTION_WINDOW']);
    return output;
  }

  output.providerName = providerName || null;
  output.providerConnectorName = connectorName || null;
  output.connectorExecutorName = executorName;
  output.channel = channel || null;
  output.idempotencyKey = idempotencyKey;
  output.connectorInvocationCandidate = invocationCandidate;
  output.approvedForConnectorExecutionHandoff = true;
  output.approvedForConnectorExecution = false;
  output.connectorExecutionAllowed = false;
  output.connectorInvocationAllowed = false;
  output.externalApiCallAllowed = false;
  output.providerDispatchAllowed = false;
  output.sendsMessage = false;
  output.credentialMaterialExposed = false;

  output.connectorExecutionGateStatus = original.dryRun === true
    ? CONNECTOR_EXECUTION_GATE_STATUSES.APPROVED_FOR_EXECUTION_DRY_RUN_ONLY
    : CONNECTOR_EXECUTION_GATE_STATUSES.APPROVED_FOR_CONNECTOR_EXECUTION_HANDOFF;
  output.decision = original.dryRun === true
    ? CONNECTOR_EXECUTION_GATE_DECISIONS.APPROVE_EXECUTION_DRY_RUN_ONLY
    : CONNECTOR_EXECUTION_GATE_DECISIONS.APPROVE_CONNECTOR_EXECUTION_HANDOFF;

  return output;
}

module.exports = {
  buildConnectorExecutionGate,
  CONNECTOR_EXECUTION_GATE_STATUSES,
  CONNECTOR_EXECUTION_GATE_DECISIONS,
  CONNECTOR_EXECUTION_GATE_ALLOWED_USES,
  CONNECTOR_EXECUTION_GATE_FORBIDDEN_USES,
};
