const assert = require('assert');
const {
  buildProviderWebhookBoundary,
  PROVIDER_WEBHOOK_STATUSES,
  PROVIDER_WEBHOOK_DECISIONS,
  PROVIDER_WEBHOOK_ALLOWED_USES,
  PROVIDER_WEBHOOK_FORBIDDEN_USES,
} = require('../provider-webhook/provider-webhook-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
    providerWebhookBoundaryRequestId: 'provider-webhook-1',
    externalDispatchRequestId: 'external-dispatch-1',
    sendRequestId: 'send-1',
    providerName: 'MOCK_PROVIDER',
    providerConnectorName: 'MOCK_CONNECTOR',
    connectorExecutorName: 'MOCK_EXECUTOR',
    externalDispatchMode: 'MOCK_DISPATCH',
    channel: 'WHATSAPP',
    providerMessageRef: 'provider-message-1',
    providerEventType: 'DELIVERED_STATUS',
    idempotencyKey: 'idempotency-1',
    externalDispatchSnapshot: {
      externalDispatchRequestId: 'external-dispatch-1',
      sendRequestId: 'send-1',
      approvedForExternalDispatchPreparation: true,
      approvedForExternalDispatchExecution: false,
      externalDispatchAllowed: false,
      externalApiCallAllowed: false,
      providerDispatchAllowed: false,
      sendsMessage: false,
      providerName: 'MOCK_PROVIDER',
      providerConnectorName: 'MOCK_CONNECTOR',
      connectorExecutorName: 'MOCK_EXECUTOR',
      channel: 'WHATSAPP',
      externalDispatchMode: 'MOCK_DISPATCH',
      idempotencyKey: 'idempotency-1',
      expiresAt: futureDate(),
      warnings: ['dispatch prep only'],
    },
    webhookEventCandidate: {
      providerName: 'MOCK_PROVIDER',
      channel: 'WHATSAPP',
      providerMessageRef: 'provider-message-1',
      providerEventType: 'DELIVERED_STATUS',
      idempotencyKey: 'idempotency-1',
      rawStatus: 'delivered',
    },
    signatureVerificationSnapshot: {
      verified: true,
    },
    webhookSchemaValidationSnapshot: {
      valid: true,
    },
    replayProtectionSnapshot: {
      reviewed: true,
      replayDetected: false,
    },
    dedupeSnapshot: {
      reviewed: true,
      duplicate: false,
    },
    webhookCapabilitySnapshot: {
      available: true,
      supportedProviders: ['MOCK_PROVIDER', 'TWILIO'],
      supportedChannels: ['WHATSAPP', 'SMS', 'EMAIL'],
      supportedEventTypes: ['DELIVERED_STATUS', 'BOUNCE_STATUS', 'FAILED_STATUS'],
    },
    webhookPolicySnapshot: {
      reviewed: true,
      allowed: true,
      webhookSideEffectAllowed: false,
      externalApiCallAllowed: false,
      providerApiCallAllowed: false,
      createsDeliveryTruth: false,
      createsMessageTruth: false,
      crmMutationAllowed: false,
      automaticFollowUpAllowed: false,
      automaticRetryAllowed: false,
    },
    auditTrail: {
      auditTrailId: 'audit-1',
      entries: ['external-dispatch-reviewed'],
    },
    sourceEvidence: [
      { id: 'ev1', sourceOwner: 'ExternalDispatchBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'ConnectorExecutorBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'ConnectorExecutorBoundary' },
    ],
    requestedUse: 'PROVIDER_WEBHOOK_READ_MODEL_PREP',
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertNoTruthOrSideEffects(output) {
  assert.strictEqual(output.approvedForWebhookSideEffects, false);
  assert.strictEqual(output.webhookSideEffectAllowed, false);
  assert.strictEqual(output.externalApiCallAllowed, false);
  assert.strictEqual(output.providerApiCallAllowed, false);
  assert.strictEqual(output.createsDeliveryTruth, false);
  assert.strictEqual(output.createsMessageTruth, false);
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
  assert.strictEqual(output.automaticFollowUpAllowed, false);
  assert.strictEqual(output.automaticRetryAllowed, false);
  assert.strictEqual(output.crmMutationAllowed, false);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(PROVIDER_WEBHOOK_ALLOWED_USES.includes('PROVIDER_WEBHOOK_READ_MODEL_PREP'));
  assert.ok(PROVIDER_WEBHOOK_FORBIDDEN_USES.includes('DELIVERY_TRUTH_CREATION'));
  assert.ok(PROVIDER_WEBHOOK_STATUSES.APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION);
  assert.ok(PROVIDER_WEBHOOK_DECISIONS.APPROVE_WEBHOOK_READ_MODEL_PREPARATION);
}]);

tests.push(['missing External Dispatch snapshot blocks webhook read model preparation', () => {
  const output = buildProviderWebhookBoundary(validInput({ externalDispatchSnapshot: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_EXTERNAL_DISPATCH);
  assertNoTruthOrSideEffects(output);
}]);

tests.push(['missing webhook event candidate blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ webhookEventCandidate: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_WEBHOOK_EVENT_CANDIDATE);
}]);

tests.push(['missing provider message reference blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ providerMessageRef: '', webhookEventCandidate: { providerEventType: 'DELIVERED_STATUS' } }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_PROVIDER_MESSAGE_REF);
}]);

tests.push(['missing provider event type blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ providerEventType: '', webhookEventCandidate: { providerMessageRef: 'provider-message-1' } }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_PROVIDER_EVENT_TYPE);
}]);

tests.push(['missing signature verification blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ signatureVerificationSnapshot: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_SIGNATURE_VERIFICATION);
}]);

tests.push(['missing schema validation blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ webhookSchemaValidationSnapshot: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_SCHEMA_VALIDATION);
}]);

tests.push(['missing replay protection blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ replayProtectionSnapshot: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_REPLAY_PROTECTION);
}]);

tests.push(['missing dedupe review blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ dedupeSnapshot: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_DEDUPE_REVIEW);
}]);

tests.push(['missing webhook capability blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ webhookCapabilitySnapshot: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_WEBHOOK_CAPABILITY);
}]);

tests.push(['missing webhook policy blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ webhookPolicySnapshot: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_WEBHOOK_POLICY);
}]);

tests.push(['missing idempotency key blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({
    idempotencyKey: '',
    externalDispatchSnapshot: { ...validInput().externalDispatchSnapshot, idempotencyKey: '' },
    webhookEventCandidate: { ...validInput().webhookEventCandidate, idempotencyKey: '' },
  }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_IDEMPOTENCY_KEY);
}]);

tests.push(['missing audit trail blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ auditTrail: null }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.NEEDS_AUDIT_TRAIL);
}]);

tests.push(['unsupported provider blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ providerName: 'UNKNOWN_PROVIDER' }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.UNSUPPORTED_PROVIDER);
  assert.strictEqual(output.decision, PROVIDER_WEBHOOK_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported channel blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ channel: 'TELEGRAM' }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.UNSUPPORTED_CHANNEL);
  assert.strictEqual(output.decision, PROVIDER_WEBHOOK_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported event type blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ providerEventType: 'OPENED_STATUS' }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.UNSUPPORTED_EVENT_TYPE);
  assert.strictEqual(output.decision, PROVIDER_WEBHOOK_DECISIONS.NOT_MODELED);
}]);

tests.push(['expired webhook window blocks', () => {
  const output = buildProviderWebhookBoundary(validInput({ expiresAt: pastDate() }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.EXPIRED_WEBHOOK_WINDOW);
  assert.strictEqual(output.decision, PROVIDER_WEBHOOK_DECISIONS.EXPIRED);
}]);

tests.push(['external API call remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.externalApiCallAllowed, false);
  assertNoTruthOrSideEffects(output);
}]);

tests.push(['provider API call remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.providerApiCallAllowed, false);
}]);

tests.push(['webhook side effects remain false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.webhookSideEffectAllowed, false);
}]);

tests.push(['delivery truth creation remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.createsDeliveryTruth, false);
  assert.strictEqual(output.providerEventReadModelCandidate.createsDeliveryTruth, false);
}]);

tests.push(['message truth creation remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.createsMessageTruth, false);
  assert.strictEqual(output.providerEventReadModelCandidate.createsMessageTruth, false);
}]);

tests.push(['CRM mutation remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.crmMutationAllowed, false);
}]);

tests.push(['automatic follow-up remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.automaticFollowUpAllowed, false);
}]);

tests.push(['automatic retry remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.automaticRetryAllowed, false);
}]);

tests.push(['task calendar creation remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
}]);

tests.push(['compensation revenue payout truth remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
}]);

tests.push(['ranking punishment HR personality truth remains false', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
}]);

tests.push(['provider event read model candidate can be prepared without truth', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION);
  assert.strictEqual(output.decision, PROVIDER_WEBHOOK_DECISIONS.APPROVE_WEBHOOK_READ_MODEL_PREPARATION);
  assert.strictEqual(output.approvedForWebhookIntakeReview, true);
  assert.ok(output.providerEventReadModelCandidate);
  assert.strictEqual(output.providerEventReadModelCandidate.webhookSideEffectAllowed, false);
}]);

tests.push(['forbidden uses are blocked', () => {
  const output = buildProviderWebhookBoundary(validInput({ requestedUse: 'DELIVERY_TRUTH_CREATION' }));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('DELIVERY_TRUTH_CREATION'));
}]);

tests.push(['allowed uses are allowed', () => {
  const output = buildProviderWebhookBoundary(validInput({
    requestedUse: 'SMS_WEBHOOK_REVIEW',
    providerName: 'TWILIO',
    channel: 'SMS',
    webhookEventCandidate: {
      providerName: 'TWILIO',
      channel: 'SMS',
      providerMessageRef: 'provider-message-1',
      providerEventType: 'DELIVERED_STATUS',
      idempotencyKey: 'idempotency-1',
    },
    webhookCapabilitySnapshot: {
      available: true,
      supportedProviders: ['TWILIO'],
      supportedChannels: ['SMS'],
      supportedEventTypes: ['DELIVERED_STATUS'],
    },
  }));
  assert.ok(output.allowedUses.includes('SMS_WEBHOOK_REVIEW'));
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildProviderWebhookBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['evidence source sourceOwners dedupe', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['ExternalDispatchBoundary', 'ConnectorExecutorBoundary'].sort());
}]);

tests.push(['audit is required', () => {
  const output = buildProviderWebhookBoundary(validInput());
  assert.strictEqual(output.providerWebhookBoundaryStatus, PROVIDER_WEBHOOK_STATUSES.APPROVED_FOR_WEBHOOK_READ_MODEL_PREPARATION);
  assert.ok(output.providerEventReadModelCandidate);
}]);

let passed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}

console.log(`Provider Webhook Boundary Contract PASS ${passed}/${tests.length}`);
