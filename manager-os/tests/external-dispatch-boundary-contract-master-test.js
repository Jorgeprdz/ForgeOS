const assert = require('assert');
const {
  buildExternalDispatchBoundary,
  EXTERNAL_DISPATCH_STATUSES,
  EXTERNAL_DISPATCH_DECISIONS,
  EXTERNAL_DISPATCH_ALLOWED_USES,
  EXTERNAL_DISPATCH_FORBIDDEN_USES,
} = require('../external-dispatch/external-dispatch-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
    externalDispatchRequestId: 'external-dispatch-1',
    connectorExecutorRequestId: 'connector-executor-1',
    connectorExecutionGateRequestId: 'connector-execution-gate-1',
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
    connectorExecutorName: 'MOCK_EXECUTOR',
    externalDispatchMode: 'MOCK_DISPATCH',
    channel: 'WHATSAPP',
    idempotencyKey: 'idempotency-1',
    dryRun: false,
    connectorExecutorSnapshot: {
      connectorExecutorRequestId: 'connector-executor-1',
      connectorExecutionGateRequestId: 'connector-execution-gate-1',
      approvedForExecutorCommandPreparation: true,
      approvedForExecutorInvocation: false,
      executorInvocationAllowed: false,
      connectorInvocationAllowed: false,
      externalApiCallAllowed: false,
      providerDispatchAllowed: false,
      sendsMessage: false,
      providerName: 'MOCK_PROVIDER',
      providerConnectorName: 'MOCK_CONNECTOR',
      connectorExecutorName: 'MOCK_EXECUTOR',
      channel: 'WHATSAPP',
      idempotencyKey: 'idempotency-1',
      expiresAt: futureDate(),
      executorCommandCandidate: {
        executorName: 'MOCK_EXECUTOR',
        connectorName: 'MOCK_CONNECTOR',
        providerName: 'MOCK_PROVIDER',
        channel: 'WHATSAPP',
        idempotencyKey: 'idempotency-1',
        executorInvocationAllowed: false,
        externalApiCallAllowed: false,
        providerDispatchAllowed: false,
      },
      warnings: ['executor command prep only'],
    },
    executorCommandCandidate: {
      executorName: 'MOCK_EXECUTOR',
      connectorName: 'MOCK_CONNECTOR',
      providerName: 'MOCK_PROVIDER',
      channel: 'WHATSAPP',
      idempotencyKey: 'idempotency-1',
      executorInvocationAllowed: false,
      externalApiCallAllowed: false,
      providerDispatchAllowed: false,
    },
    finalExternalDispatchConfirmation: {
      confirmed: true,
      confirmedBy: 'advisor-1',
      confirmedAt: new Date().toISOString(),
    },
    dispatchCapabilitySnapshot: {
      available: true,
      supportedDispatchModes: ['MOCK_DISPATCH', 'SMS_DISPATCH'],
      supportedExecutors: ['MOCK_EXECUTOR', 'TWILIO_EXECUTOR'],
      supportedConnectors: ['MOCK_CONNECTOR', 'TWILIO_CONNECTOR'],
      supportedProviders: ['MOCK_PROVIDER', 'TWILIO'],
      supportedChannels: ['WHATSAPP', 'SMS', 'EMAIL'],
    },
    dispatchPolicySnapshot: {
      reviewed: true,
      allowed: true,
      externalApiCallAllowed: false,
      externalDispatchAllowed: false,
      executorInvocationAllowed: false,
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
    auditTrail: {
      auditTrailId: 'audit-1',
      entries: ['connector-executor-reviewed'],
    },
    sourceEvidence: [
      { id: 'ev1', sourceOwner: 'ConnectorExecutorBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'ConnectorExecutionGate' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'ConnectorExecutionGate' },
    ],
    requestedUse: 'EXTERNAL_DISPATCH_REQUEST_PREP',
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertNoExecutionFlags(output) {
  assert.strictEqual(output.approvedForExternalDispatchExecution, false);
  assert.strictEqual(output.externalDispatchAllowed, false);
  assert.strictEqual(output.externalApiCallAllowed, false);
  assert.strictEqual(output.executorInvocationAllowed, false);
  assert.strictEqual(output.connectorInvocationAllowed, false);
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
  assert.strictEqual(output.externalDispatchConfirmationRequired, true);
  assert.strictEqual(output.connectorExecutorBoundaryRequired, true);
  assert.strictEqual(output.externalDispatchAuditRequired, true);
  assert.strictEqual(output.providerWebhookBoundaryRequired, true);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(EXTERNAL_DISPATCH_ALLOWED_USES.includes('EXTERNAL_DISPATCH_REQUEST_PREP'));
  assert.ok(EXTERNAL_DISPATCH_FORBIDDEN_USES.includes('EXTERNAL_DISPATCH'));
  assert.ok(EXTERNAL_DISPATCH_STATUSES.APPROVED_FOR_EXTERNAL_DISPATCH_PREPARATION);
  assert.ok(EXTERNAL_DISPATCH_DECISIONS.APPROVE_EXTERNAL_DISPATCH_PREPARATION);
}]);

tests.push(['missing Connector Executor snapshot blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ connectorExecutorSnapshot: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_CONNECTOR_EXECUTOR);
  assertNoExecutionFlags(output);
}]);

tests.push(['missing executor command candidate blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ executorCommandCandidate: null, connectorExecutorSnapshot: { approvedForExecutorCommandPreparation: true } }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_EXECUTOR_COMMAND_CANDIDATE);
}]);

tests.push(['missing final external dispatch confirmation blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ finalExternalDispatchConfirmation: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_EXTERNAL_DISPATCH_CONFIRMATION);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.REQUEST_EXTERNAL_DISPATCH_REVIEW);
}]);

tests.push(['missing dispatch capability blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ dispatchCapabilitySnapshot: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_DISPATCH_CAPABILITY);
}]);

tests.push(['missing dispatch policy blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ dispatchPolicySnapshot: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_DISPATCH_POLICY);
}]);

tests.push(['missing idempotency key blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({
    idempotencyKey: '',
    connectorExecutorSnapshot: { ...validInput().connectorExecutorSnapshot, idempotencyKey: '' },
    executorCommandCandidate: { ...validInput().executorCommandCandidate, idempotencyKey: '' },
  }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_IDEMPOTENCY_KEY);
}]);

tests.push(['missing audit trail blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ auditTrail: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_AUDIT_TRAIL);
}]);

tests.push(['missing credential review blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ credentialReviewSnapshot: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_CREDENTIAL_REVIEW);
}]);

tests.push(['missing rate-limit review blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ rateLimitSnapshot: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_RATE_LIMIT_REVIEW);
}]);

tests.push(['retry without policy blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ retryRequested: true, retryPolicySnapshot: null }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.NEEDS_RETRY_POLICY);
}]);

tests.push(['unsupported dispatch mode blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ externalDispatchMode: 'UNKNOWN_DISPATCH' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_DISPATCH_MODE);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported executor blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ connectorExecutorName: 'UNKNOWN_EXECUTOR' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_EXECUTOR);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported connector blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ providerConnectorName: 'UNKNOWN_CONNECTOR' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_CONNECTOR);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported provider blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ providerName: 'UNKNOWN_PROVIDER' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_PROVIDER);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported channel blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ channel: 'TELEGRAM' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.UNSUPPORTED_CHANNEL);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.NOT_MODELED);
}]);

tests.push(['expired dispatch window blocks external dispatch preparation', () => {
  const output = buildExternalDispatchBoundary(validInput({ expiresAt: pastDate() }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.EXPIRED_DISPATCH_WINDOW);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.EXPIRED);
}]);

tests.push(['external API call remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.externalApiCallAllowed, false);
  assertNoExecutionFlags(output);
}]);

tests.push(['external dispatch execution remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.externalDispatchAllowed, false);
  assert.strictEqual(output.approvedForExternalDispatchExecution, false);
}]);

tests.push(['executor invocation remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.executorInvocationAllowed, false);
}]);

tests.push(['connector invocation remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.connectorInvocationAllowed, false);
}]);

tests.push(['provider dispatch remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.providerDispatchAllowed, false);
}]);

tests.push(['sends message remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.sendsMessage, false);
}]);

tests.push(['credential material exposure remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.credentialMaterialExposed, false);
}]);

tests.push(['queue execution remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.queueExecutionAllowed, false);
}]);

tests.push(['scheduled execution remains false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.scheduledExecutionAllowed, false);
}]);

tests.push(['webhook side effects remain false', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.webhookSideEffectAllowed, false);
}]);

tests.push(['dry-run can be modeled without dispatch', () => {
  const output = buildExternalDispatchBoundary(validInput({ dryRun: true, requestedUse: 'EXTERNAL_DISPATCH_DRY_RUN_PREP' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.APPROVED_FOR_EXTERNAL_DISPATCH_DRY_RUN_ONLY);
  assert.strictEqual(output.decision, EXTERNAL_DISPATCH_DECISIONS.APPROVE_EXTERNAL_DISPATCH_DRY_RUN_ONLY);
  assert.strictEqual(output.externalDispatchRequestCandidate.dryRun, true);
  assertNoExecutionFlags(output);
}]);

tests.push(['external dispatch request candidate can be prepared without external call', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.APPROVED_FOR_EXTERNAL_DISPATCH_PREPARATION);
  assert.strictEqual(output.approvedForExternalDispatchPreparation, true);
  assert.ok(output.externalDispatchRequestCandidate);
  assert.strictEqual(output.externalDispatchRequestCandidate.externalApiCallAllowed, false);
  assert.strictEqual(output.externalDispatchRequestCandidate.providerDispatchAllowed, false);
}]);

tests.push(['automatic send is blocked', () => {
  const output = buildExternalDispatchBoundary(validInput({ requestedUse: 'AUTOMATIC_SEND' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AUTOMATIC_SEND'));
}]);

tests.push(['silent send is blocked', () => {
  const output = buildExternalDispatchBoundary(validInput({ requestedUse: 'SILENT_SEND' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('SILENT_SEND'));
}]);

tests.push(['AI self-send is blocked', () => {
  const output = buildExternalDispatchBoundary(validInput({ requestedUse: 'AI_SELF_SEND' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AI_SELF_SEND'));
}]);

tests.push(['boundary does not create tasks calendar or truth', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assertNoExecutionFlags(output);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildExternalDispatchBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['forbidden uses are blocked', () => {
  const output = buildExternalDispatchBoundary(validInput({ requestedUse: 'EXTERNAL_DISPATCH' }));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('EXTERNAL_DISPATCH'));
}]);

tests.push(['allowed uses are allowed', () => {
  const output = buildExternalDispatchBoundary(validInput({
    requestedUse: 'SMS_DISPATCH_REVIEW',
    channel: 'SMS',
    providerName: 'TWILIO',
    providerConnectorName: 'TWILIO_CONNECTOR',
    connectorExecutorName: 'TWILIO_EXECUTOR',
    externalDispatchMode: 'SMS_DISPATCH',
    dispatchCapabilitySnapshot: {
      available: true,
      supportedDispatchModes: ['SMS_DISPATCH'],
      supportedExecutors: ['TWILIO_EXECUTOR'],
      supportedConnectors: ['TWILIO_CONNECTOR'],
      supportedProviders: ['TWILIO'],
      supportedChannels: ['SMS'],
    },
  }));
  assert.ok(output.allowedUses.includes('SMS_DISPATCH_REVIEW'));
  assert.strictEqual(output.externalDispatchBoundaryStatus, EXTERNAL_DISPATCH_STATUSES.APPROVED_FOR_EXTERNAL_DISPATCH_PREPARATION);
}]);

tests.push(['evidence/source/sourceOwners dedupe', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['ConnectorExecutorBoundary', 'ConnectorExecutionGate'].sort());
}]);

tests.push(['audit is required', () => {
  const output = buildExternalDispatchBoundary(validInput());
  assert.strictEqual(output.externalDispatchAuditRequired, true);
  assert.strictEqual(output.providerWebhookBoundaryRequired, true);
  assert.strictEqual(output.connectorExecutorBoundaryRequired, true);
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

console.log(`External Dispatch Boundary Contract PASS ${passed}/${tests.length}`);
