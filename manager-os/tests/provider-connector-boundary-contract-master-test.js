const assert = require('assert');
const {
  buildProviderConnectorBoundary,
  PROVIDER_CONNECTOR_STATUSES,
  PROVIDER_CONNECTOR_DECISIONS,
  PROVIDER_CONNECTOR_ALLOWED_USES,
  PROVIDER_CONNECTOR_FORBIDDEN_USES,
} = require('../provider-connector/provider-connector-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
    providerConnectorRequestId: 'provider-connector-1',
    providerRuntimeRequestId: 'provider-runtime-1',
    sendRequestId: 'send-1',
    deliveryRequestId: 'delivery-1',
    approvalRequestId: 'approval-1',
    advisorId: 'advisor-1',
    managerId: 'manager-1',
    senderId: 'advisor-1',
    senderRole: 'advisor',
    personId: 'maria-1',
    personType: 'prospect',
    providerName: 'MOCK_PROVIDER',
    providerConnectorName: 'MOCK_CONNECTOR',
    providerConnectorMode: 'CONNECTOR_PREP_ONLY',
    channel: 'WHATSAPP',
    idempotencyKey: 'idempotency-1',
    dryRun: false,
    providerRuntimeSnapshot: {
      providerRuntimeRequestId: 'provider-runtime-1',
      sendRequestId: 'send-1',
      approvedForProviderRuntimePreparation: true,
      approvedForProviderRuntimeExecution: false,
      providerRuntimeCallAllowed: false,
      providerDispatchAllowed: false,
      sendsMessage: false,
      providerName: 'MOCK_PROVIDER',
      channel: 'WHATSAPP',
      idempotencyKey: 'idempotency-1',
      expiresAt: futureDate(),
      providerPayloadCandidate: {
        providerName: 'MOCK_PROVIDER',
        channel: 'WHATSAPP',
        recipientDestination: '+525512345678',
        finalSendText: 'Hola Maria',
        idempotencyKey: 'idempotency-1',
        dispatchAllowed: false,
      },
      warnings: ['runtime prep only'],
    },
    providerPayloadCandidate: {
      providerName: 'MOCK_PROVIDER',
      channel: 'WHATSAPP',
      recipientDestination: '+525512345678',
      finalSendText: 'Hola Maria',
      idempotencyKey: 'idempotency-1',
      dispatchAllowed: false,
    },
    connectorCapabilitySnapshot: {
      available: true,
      supportedConnectors: ['MOCK_CONNECTOR', 'TWILIO_CONNECTOR'],
      supportedProviders: ['MOCK_PROVIDER', 'TWILIO'],
      supportedChannels: ['WHATSAPP', 'SMS', 'EMAIL'],
    },
    connectorPolicySnapshot: {
      reviewed: true,
      allowed: true,
      externalApiCallAllowed: false,
      providerDispatchAllowed: false,
    },
    credentialReviewSnapshot: {
      reviewed: true,
      credentialsAvailable: true,
      accessApproved: true,
      credentialMaterialExposed: false,
    },
    rateLimitSnapshot: {
      reviewed: true,
      allowed: true,
    },
    retryPolicySnapshot: {
      reviewed: true,
      allowed: true,
    },
    sourceEvidence: [
      { id: 'ev1', sourceOwner: 'ProviderRuntimeBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'SendExecutionGate' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'SendExecutionGate' },
    ],
    requestedUse: 'CONNECTOR_INVOCATION_PREP',
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertNoExecutionFlags(output) {
  assert.strictEqual(output.approvedForConnectorInvocation, false);
  assert.strictEqual(output.connectorInvocationAllowed, false);
  assert.strictEqual(output.externalApiCallAllowed, false);
  assert.strictEqual(output.providerDispatchAllowed, false);
  assert.strictEqual(output.sendsMessage, false);
  assert.strictEqual(output.credentialMaterialExposed, false);
  assert.strictEqual(output.retryAllowed, false);
  assert.strictEqual(output.queueExecutionAllowed, false);
  assert.strictEqual(output.scheduledExecutionAllowed, false);
  assert.strictEqual(output.webhookSideEffectAllowed, false);
  assert.strictEqual(output.automaticSendAllowed, false);
  assert.strictEqual(output.silentSendAllowed, false);
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
  assert.strictEqual(output.humanSendConfirmationRequired, true);
  assert.strictEqual(output.providerRuntimeBoundaryRequired, true);
  assert.strictEqual(output.connectorAuditRequired, true);
  assert.strictEqual(output.connectorExecutionGateRequired, true);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(PROVIDER_CONNECTOR_ALLOWED_USES.includes('CONNECTOR_INVOCATION_PREP'));
  assert.ok(PROVIDER_CONNECTOR_FORBIDDEN_USES.includes('EXTERNAL_API_CALL'));
  assert.ok(PROVIDER_CONNECTOR_STATUSES.APPROVED_FOR_CONNECTOR_PREPARATION);
  assert.ok(PROVIDER_CONNECTOR_DECISIONS.APPROVE_CONNECTOR_PREPARATION);
}]);

tests.push(['missing Provider Runtime snapshot blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ providerRuntimeSnapshot: null }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_PROVIDER_RUNTIME);
  assertNoExecutionFlags(output);
}]);

tests.push(['missing provider payload candidate blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ providerPayloadCandidate: null, providerRuntimeSnapshot: { approvedForProviderRuntimePreparation: true } }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_PROVIDER_PAYLOAD);
}]);

tests.push(['missing connector name blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ providerConnectorName: '' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_CONNECTOR_NAME);
}]);

tests.push(['missing connector capability blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ connectorCapabilitySnapshot: null }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_CONNECTOR_CAPABILITY);
}]);

tests.push(['missing connector policy blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ connectorPolicySnapshot: null }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_CONNECTOR_POLICY);
}]);

tests.push(['missing credential review blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ credentialReviewSnapshot: null }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_CREDENTIAL_REVIEW);
}]);

tests.push(['missing idempotency key blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ idempotencyKey: '', providerRuntimeSnapshot: { ...validInput().providerRuntimeSnapshot, idempotencyKey: '' }, providerPayloadCandidate: { ...validInput().providerPayloadCandidate, idempotencyKey: '' } }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_IDEMPOTENCY_KEY);
}]);

tests.push(['missing rate-limit review blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ rateLimitSnapshot: null }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_RATE_LIMIT_REVIEW);
}]);

tests.push(['retry without policy blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ retryRequested: true, retryPolicySnapshot: null }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.NEEDS_RETRY_POLICY);
}]);

tests.push(['unsupported connector blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ providerConnectorName: 'UNKNOWN_CONNECTOR' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.UNSUPPORTED_CONNECTOR);
  assert.strictEqual(output.decision, PROVIDER_CONNECTOR_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported provider blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ providerName: 'UNKNOWN_PROVIDER' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.UNSUPPORTED_PROVIDER);
  assert.strictEqual(output.decision, PROVIDER_CONNECTOR_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported channel blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ channel: 'TELEGRAM' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.UNSUPPORTED_CHANNEL);
  assert.strictEqual(output.decision, PROVIDER_CONNECTOR_DECISIONS.NOT_MODELED);
}]);

tests.push(['expired connector window blocks connector preparation', () => {
  const output = buildProviderConnectorBoundary(validInput({ expiresAt: pastDate() }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.EXPIRED_CONNECTOR_WINDOW);
  assert.strictEqual(output.decision, PROVIDER_CONNECTOR_DECISIONS.EXPIRED);
}]);

tests.push(['external API call remains false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.externalApiCallAllowed, false);
  assertNoExecutionFlags(output);
}]);

tests.push(['connector invocation remains false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.connectorInvocationAllowed, false);
  assert.strictEqual(output.approvedForConnectorInvocation, false);
}]);

tests.push(['provider dispatch remains false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.providerDispatchAllowed, false);
}]);

tests.push(['sends message remains false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.sendsMessage, false);
}]);

tests.push(['credential material exposure remains false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.credentialMaterialExposed, false);
}]);

tests.push(['queue execution remains false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.queueExecutionAllowed, false);
}]);

tests.push(['scheduled execution remains false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.scheduledExecutionAllowed, false);
}]);

tests.push(['webhook side effects remain false', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.webhookSideEffectAllowed, false);
}]);

tests.push(['dry-run can be modeled without dispatch', () => {
  const output = buildProviderConnectorBoundary(validInput({ dryRun: true, requestedUse: 'CONNECTOR_DRY_RUN_PREP' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.APPROVED_FOR_CONNECTOR_DRY_RUN_ONLY);
  assert.strictEqual(output.decision, PROVIDER_CONNECTOR_DECISIONS.APPROVE_CONNECTOR_DRY_RUN_ONLY);
  assert.strictEqual(output.connectorInvocationCandidate.dryRun, true);
  assert.strictEqual(output.connectorInvocationCandidate.invocationAllowed, false);
  assertNoExecutionFlags(output);
}]);

tests.push(['connector invocation candidate can be prepared without external call', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.APPROVED_FOR_CONNECTOR_PREPARATION);
  assert.strictEqual(output.approvedForConnectorPreparation, true);
  assert.ok(output.connectorInvocationCandidate);
  assert.strictEqual(output.connectorInvocationCandidate.externalApiCallAllowed, false);
  assert.strictEqual(output.connectorInvocationCandidate.dispatchAllowed, false);
}]);

tests.push(['automatic send is blocked', () => {
  const output = buildProviderConnectorBoundary(validInput({ requestedUse: 'AUTOMATIC_SEND' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AUTOMATIC_SEND'));
}]);

tests.push(['silent send is blocked', () => {
  const output = buildProviderConnectorBoundary(validInput({ requestedUse: 'SILENT_SEND' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('SILENT_SEND'));
}]);

tests.push(['AI self-send is blocked', () => {
  const output = buildProviderConnectorBoundary(validInput({ requestedUse: 'AI_SELF_SEND' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AI_SELF_SEND'));
}]);

tests.push(['boundary does not create tasks calendar or truth', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assertNoExecutionFlags(output);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildProviderConnectorBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['forbidden uses are blocked', () => {
  const output = buildProviderConnectorBoundary(validInput({ requestedUse: 'CREDENTIAL_MATERIAL_EXPOSURE' }));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('CREDENTIAL_MATERIAL_EXPOSURE'));
}]);

tests.push(['allowed uses are allowed', () => {
  const output = buildProviderConnectorBoundary(validInput({ requestedUse: 'SMS_CONNECTOR_REVIEW', channel: 'SMS', providerName: 'TWILIO', providerConnectorName: 'TWILIO_CONNECTOR', connectorCapabilitySnapshot: { available: true, supportedConnectors: ['TWILIO_CONNECTOR'], supportedProviders: ['TWILIO'], supportedChannels: ['SMS'] } }));
  assert.ok(output.allowedUses.includes('SMS_CONNECTOR_REVIEW'));
  assert.strictEqual(output.providerConnectorBoundaryStatus, PROVIDER_CONNECTOR_STATUSES.APPROVED_FOR_CONNECTOR_PREPARATION);
}]);

tests.push(['evidence/source/sourceOwners dedupe', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['ProviderRuntimeBoundary', 'SendExecutionGate'].sort());
}]);

tests.push(['audit is required', () => {
  const output = buildProviderConnectorBoundary(validInput());
  assert.strictEqual(output.connectorAuditRequired, true);
  assert.strictEqual(output.connectorExecutionGateRequired, true);
  assert.strictEqual(output.providerRuntimeBoundaryRequired, true);
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

console.log(`Provider Connector Boundary Contract PASS ${passed}/${tests.length}`);
