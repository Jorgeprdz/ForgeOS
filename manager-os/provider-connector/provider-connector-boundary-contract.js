/**
 * Provider Connector Boundary Contract
 *
 * Provider runtime preparation is not connector execution.
 * This pure boundary validates connector readiness and prepares a connector invocation candidate.
 * It never calls external APIs, never invokes connectors, never dispatches, never sends,
 * never exposes credential material, never creates tasks/calendar, and never creates truth.
 */

const PROVIDER_CONNECTOR_STATUSES = Object.freeze({
  READY_FOR_CONNECTOR_REVIEW: 'READY_FOR_CONNECTOR_REVIEW',
  APPROVED_FOR_CONNECTOR_PREPARATION: 'APPROVED_FOR_CONNECTOR_PREPARATION',
  APPROVED_FOR_CONNECTOR_DRY_RUN_ONLY: 'APPROVED_FOR_CONNECTOR_DRY_RUN_ONLY',
  NEEDS_PROVIDER_RUNTIME: 'NEEDS_PROVIDER_RUNTIME',
  NEEDS_PROVIDER_PAYLOAD: 'NEEDS_PROVIDER_PAYLOAD',
  NEEDS_CONNECTOR_NAME: 'NEEDS_CONNECTOR_NAME',
  NEEDS_CONNECTOR_CAPABILITY: 'NEEDS_CONNECTOR_CAPABILITY',
  NEEDS_CONNECTOR_POLICY: 'NEEDS_CONNECTOR_POLICY',
  NEEDS_CREDENTIAL_REVIEW: 'NEEDS_CREDENTIAL_REVIEW',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  NEEDS_RATE_LIMIT_REVIEW: 'NEEDS_RATE_LIMIT_REVIEW',
  NEEDS_RETRY_POLICY: 'NEEDS_RETRY_POLICY',
  UNSUPPORTED_CONNECTOR: 'UNSUPPORTED_CONNECTOR',
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER',
  UNSUPPORTED_CHANNEL: 'UNSUPPORTED_CHANNEL',
  EXPIRED_CONNECTOR_WINDOW: 'EXPIRED_CONNECTOR_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const PROVIDER_CONNECTOR_DECISIONS = Object.freeze({
  REQUEST_CONNECTOR_REVIEW: 'REQUEST_CONNECTOR_REVIEW',
  APPROVE_CONNECTOR_PREPARATION: 'APPROVE_CONNECTOR_PREPARATION',
  APPROVE_CONNECTOR_DRY_RUN_ONLY: 'APPROVE_CONNECTOR_DRY_RUN_ONLY',
  BLOCK_CONNECTOR: 'BLOCK_CONNECTOR',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const PROVIDER_CONNECTOR_ALLOWED_USES = Object.freeze([
  'CONNECTOR_REVIEW',
  'CONNECTOR_PAYLOAD_VALIDATION',
  'CONNECTOR_INVOCATION_PREP',
  'CONNECTOR_DRY_RUN_PREP',
  'WHATSAPP_CONNECTOR_REVIEW',
  'SMS_CONNECTOR_REVIEW',
  'EMAIL_CONNECTOR_REVIEW',
]);

const PROVIDER_CONNECTOR_FORBIDDEN_USES = Object.freeze([
  'AUTOMATIC_SEND',
  'SILENT_SEND',
  'AI_SELF_SEND',
  'EXTERNAL_API_CALL',
  'PROVIDER_DISPATCH',
  'CONNECTOR_INVOCATION_WITHOUT_RUNTIME_GATE',
  'CONNECTOR_INVOCATION_WITHOUT_IDEMPOTENCY',
  'CONNECTOR_INVOCATION_WITHOUT_AUDIT',
  'CONNECTOR_INVOCATION_WITHOUT_CREDENTIAL_REVIEW',
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

function hasRuntimeSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  return snapshot.approvedForProviderRuntimePreparation === true;
}

function hasConnectorCapability(snapshot, connectorName, providerName, channel) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.available === false || snapshot.supported === false) return false;

  const connectors = asArray(snapshot.supportedConnectors || snapshot.connectors).map(normalizeString).filter(Boolean);
  const providers = asArray(snapshot.supportedProviders || snapshot.providers).map(normalizeString).filter(Boolean);
  const channels = asArray(snapshot.supportedChannels || snapshot.channels).map(normalizeString).filter(Boolean);

  const connectorOk = connectors.length === 0 || connectors.includes(connectorName);
  const providerOk = providers.length === 0 || providers.includes(providerName);
  const channelOk = channels.length === 0 || channels.includes(channel);

  return connectorOk && providerOk && channelOk;
}

function hasConnectorPolicy(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false || snapshot.connectorAllowed === false) return false;
  if (snapshot.externalApiCallAllowed === true) return false;
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

function baseOutput(input, evidenceBundle) {
  return {
    providerConnectorBoundaryStatus: PROVIDER_CONNECTOR_STATUSES.UNKNOWN,
    decision: PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT,

    providerConnectorRequestId: input.providerConnectorRequestId || null,
    providerRuntimeRequestId: input.providerRuntimeRequestId || input.providerRuntimeSnapshot?.providerRuntimeRequestId || null,
    sendRequestId: input.sendRequestId || input.providerRuntimeSnapshot?.sendRequestId || null,
    deliveryRequestId: input.deliveryRequestId || input.providerRuntimeSnapshot?.deliveryRequestId || null,
    approvalRequestId: input.approvalRequestId || input.providerRuntimeSnapshot?.approvalRequestId || null,
    advisorId: input.advisorId || null,
    managerId: input.managerId || null,
    senderId: input.senderId || input.providerRuntimeSnapshot?.senderId || null,
    senderRole: input.senderRole || input.providerRuntimeSnapshot?.senderRole || null,
    personId: input.personId || null,
    personType: input.personType || null,

    providerName: input.providerName || input.providerRuntimeSnapshot?.providerName || null,
    providerConnectorName: input.providerConnectorName || null,
    providerConnectorMode: input.providerConnectorMode || null,
    channel: input.channel || input.providerRuntimeSnapshot?.channel || null,
    idempotencyKey: input.idempotencyKey || input.providerRuntimeSnapshot?.idempotencyKey || null,
    dryRun: input.dryRun === true,

    connectorInvocationCandidate: null,
    providerPayloadCandidate: input.providerPayloadCandidate || input.providerRuntimeSnapshot?.providerPayloadCandidate || null,

    approvedForConnectorPreparation: false,
    approvedForConnectorInvocation: false,
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
    providerRuntimeBoundaryRequired: true,
    connectorAuditRequired: true,
    connectorExecutionGateRequired: true,

    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.providerRuntimeSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.providerRuntimeSnapshot?.limitations))]),

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
  output.providerConnectorBoundaryStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildProviderConnectorBoundary(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);

  const requestedUse = normalizeUse(original.requestedUse);
  if (requestedUse && PROVIDER_CONNECTOR_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.BLOCKED, PROVIDER_CONNECTOR_DECISIONS.BLOCK_CONNECTOR, null, requestedUse);
  }

  if (requestedUse && !PROVIDER_CONNECTOR_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.providerConnectorBoundaryStatus = PROVIDER_CONNECTOR_STATUSES.NOT_MODELED;
    output.decision = PROVIDER_CONNECTOR_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  const runtime = original.providerRuntimeSnapshot;
  if (!hasRuntimeSnapshot(runtime)) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_PROVIDER_RUNTIME, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'providerRuntimeSnapshot');
  }

  const providerPayloadCandidate = original.providerPayloadCandidate || runtime.providerPayloadCandidate;
  if (!providerPayloadCandidate || typeof providerPayloadCandidate !== 'object') {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_PROVIDER_PAYLOAD, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'providerPayloadCandidate');
  }

  const connectorName = normalizeString(original.providerConnectorName);
  if (!connectorName) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_CONNECTOR_NAME, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'providerConnectorName');
  }

  if (!SUPPORTED_CONNECTORS.includes(connectorName)) {
    output.providerConnectorName = connectorName;
    output.providerConnectorBoundaryStatus = PROVIDER_CONNECTOR_STATUSES.UNSUPPORTED_CONNECTOR;
    output.decision = PROVIDER_CONNECTOR_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CONNECTOR']);
    return output;
  }

  const providerName = normalizeString(original.providerName || runtime.providerName || providerPayloadCandidate.providerName);
  if (providerName && !SUPPORTED_PROVIDERS.includes(providerName)) {
    output.providerName = providerName;
    output.providerConnectorBoundaryStatus = PROVIDER_CONNECTOR_STATUSES.UNSUPPORTED_PROVIDER;
    output.decision = PROVIDER_CONNECTOR_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_PROVIDER']);
    return output;
  }

  const channel = normalizeString(original.channel || runtime.channel || providerPayloadCandidate.channel);
  if (channel && !SUPPORTED_CHANNELS.includes(channel)) {
    output.channel = channel;
    output.providerConnectorBoundaryStatus = PROVIDER_CONNECTOR_STATUSES.UNSUPPORTED_CHANNEL;
    output.decision = PROVIDER_CONNECTOR_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_CHANNEL']);
    return output;
  }

  const idempotencyKey = original.idempotencyKey || runtime.idempotencyKey || providerPayloadCandidate.idempotencyKey;
  if (!idempotencyKey) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_IDEMPOTENCY_KEY, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (!hasConnectorCapability(original.connectorCapabilitySnapshot, connectorName, providerName, channel)) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_CONNECTOR_CAPABILITY, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'connectorCapabilitySnapshot');
  }

  if (!hasConnectorPolicy(original.connectorPolicySnapshot)) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_CONNECTOR_POLICY, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'connectorPolicySnapshot');
  }

  if (!hasCredentialReview(original.credentialReviewSnapshot)) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_CREDENTIAL_REVIEW, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'credentialReviewSnapshot');
  }

  if (!hasRateLimitReview(original.rateLimitSnapshot)) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_RATE_LIMIT_REVIEW, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'rateLimitSnapshot');
  }

  if (original.retryRequested === true && !hasRetryPolicy(original.retryPolicySnapshot)) {
    return markBlocked(output, PROVIDER_CONNECTOR_STATUSES.NEEDS_RETRY_POLICY, PROVIDER_CONNECTOR_DECISIONS.NEEDS_MORE_CONTEXT, 'retryPolicySnapshot');
  }

  if (isExpired(original.expiresAt || original.connectorWindowExpiresAt || runtime.expiresAt, original.now)) {
    output.providerConnectorBoundaryStatus = PROVIDER_CONNECTOR_STATUSES.EXPIRED_CONNECTOR_WINDOW;
    output.decision = PROVIDER_CONNECTOR_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_CONNECTOR_WINDOW']);
    return output;
  }

  output.providerName = providerName || null;
  output.providerConnectorName = connectorName;
  output.providerConnectorMode = original.providerConnectorMode || 'CONNECTOR_PREP_ONLY';
  output.channel = channel || null;
  output.idempotencyKey = idempotencyKey;
  output.providerPayloadCandidate = providerPayloadCandidate;
  output.connectorInvocationCandidate = {
    connectorName,
    providerName: providerName || null,
    channel: channel || null,
    idempotencyKey,
    dryRun: original.dryRun === true,
    providerPayloadCandidate,
    invocationAllowed: false,
    externalApiCallAllowed: false,
    dispatchAllowed: false,
  };

  output.approvedForConnectorPreparation = true;
  output.approvedForConnectorInvocation = false;
  output.connectorInvocationAllowed = false;
  output.externalApiCallAllowed = false;
  output.providerDispatchAllowed = false;
  output.sendsMessage = false;
  output.credentialMaterialExposed = false;

  output.providerConnectorBoundaryStatus = original.dryRun === true
    ? PROVIDER_CONNECTOR_STATUSES.APPROVED_FOR_CONNECTOR_DRY_RUN_ONLY
    : PROVIDER_CONNECTOR_STATUSES.APPROVED_FOR_CONNECTOR_PREPARATION;
  output.decision = original.dryRun === true
    ? PROVIDER_CONNECTOR_DECISIONS.APPROVE_CONNECTOR_DRY_RUN_ONLY
    : PROVIDER_CONNECTOR_DECISIONS.APPROVE_CONNECTOR_PREPARATION;

  return output;
}

module.exports = {
  buildProviderConnectorBoundary,
  PROVIDER_CONNECTOR_STATUSES,
  PROVIDER_CONNECTOR_DECISIONS,
  PROVIDER_CONNECTOR_ALLOWED_USES,
  PROVIDER_CONNECTOR_FORBIDDEN_USES,
};
