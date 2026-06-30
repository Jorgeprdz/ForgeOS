const assert = require('assert');
const {
  buildConnectorExecutionGate,
  CONNECTOR_EXECUTION_GATE_STATUSES,
  CONNECTOR_EXECUTION_GATE_DECISIONS,
  CONNECTOR_EXECUTION_GATE_ALLOWED_USES,
  CONNECTOR_EXECUTION_GATE_FORBIDDEN_USES,
} = require('../connector-execution/connector-execution-gate-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
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
    channel: 'WHATSAPP',
    idempotencyKey: 'idempotency-1',
    dryRun: false,
    providerConnectorSnapshot: {
      providerConnectorRequestId: 'provider-connector-1',
      providerRuntimeRequestId: 'provider-runtime-1',
      sendRequestId: 'send-1',
      approvedForConnectorPreparation: true,
      approvedForConnectorInvocation: false,
      connectorInvocationAllowed: false,
      externalApiCallAllowed: false,
      providerDispatchAllowed: false,
      sendsMessage: false,
      providerName: 'MOCK_PROVIDER',
      providerConnectorName: 'MOCK_CONNECTOR',
      channel: 'WHATSAPP',
      idempotencyKey: 'idempotency-1',
      expiresAt: futureDate(),
      connectorInvocationCandidate: {
        connectorName: 'MOCK_CONNECTOR',
        providerName: 'MOCK_PROVIDER',
        channel: 'WHATSAPP',
        idempotencyKey: 'idempotency-1',
        invocationAllowed: false,
        externalApiCallAllowed: false,
        dispatchAllowed: false,
      },
      warnings: ['connector prep only'],
    },
    connectorInvocationCandidate: {
      connectorName: 'MOCK_CONNECTOR',
      providerName: 'MOCK_PROVIDER',
      channel: 'WHATSAPP',
      idempotencyKey: 'idempotency-1',
      invocationAllowed: false,
      externalApiCallAllowed: false,
      dispatchAllowed: false,
    },
    finalConnectorExecutionConfirmation: {
      confirmed: true,
      confirmedBy: 'advisor-1',
      confirmedAt: new Date().toISOString(),
    },
    connectorCapabilitySnapshot: {
      available: true,
      supportedExecutors: ['MOCK_EXECUTOR', 'TWILIO_EXECUTOR'],
      supportedConnectors: ['MOCK_CONNECTOR', 'TWILIO_CONNECTOR'],
      supportedProviders: ['MOCK_PROVIDER', 'TWILIO'],
      supportedChannels: ['WHATSAPP', 'SMS', 'EMAIL'],
    },
    connectorPolicySnapshot: {
      reviewed: true,
      allowed: true,
      executionAllowed: false,
      externalApiCallAllowed: false,
      connectorInvocationAllowed: false,
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
      entries: ['provider-connector-reviewed'],
    },
    sourceEvidence: [
      { id: 'ev1', sourceOwner: 'ProviderConnectorBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'ProviderRuntimeBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'ProviderRuntimeBoundary' },
    ],
    requestedUse: 'CONNECTOR_EXECUTION_HANDOFF_PREP',
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertNoExecutionFlags(output) {
  assert.strictEqual(output.approvedForConnectorExecution, false);
  assert.strictEqual(output.connectorExecutionAllowed, false);
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
  assert.strictEqual(output.connectorExecutionConfirmationRequired, true);
  assert.strictEqual(output.providerConnectorBoundaryRequired, true);
  assert.strictEqual(output.connectorExecutionAuditRequired, true);
  assert.strictEqual(output.connectorExecutorBoundaryRequired, true);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(CONNECTOR_EXECUTION_GATE_ALLOWED_USES.includes('CONNECTOR_EXECUTION_HANDOFF_PREP'));
  assert.ok(CONNECTOR_EXECUTION_GATE_FORBIDDEN_USES.includes('CONNECTOR_INVOCATION'));
  assert.ok(CONNECTOR_EXECUTION_GATE_STATUSES.APPROVED_FOR_CONNECTOR_EXECUTION_HANDOFF);
  assert.ok(CONNECTOR_EXECUTION_GATE_DECISIONS.APPROVE_CONNECTOR_EXECUTION_HANDOFF);
}]);

tests.push(['missing Provider Connector snapshot blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ providerConnectorSnapshot: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_PROVIDER_CONNECTOR);
  assertNoExecutionFlags(output);
}]);

tests.push(['missing connector invocation candidate blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ connectorInvocationCandidate: null, providerConnectorSnapshot: { approvedForConnectorPreparation: true } }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_INVOCATION_CANDIDATE);
}]);

tests.push(['missing final connector execution confirmation blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ finalConnectorExecutionConfirmation: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_EXECUTION_CONFIRMATION);
  assert.strictEqual(output.decision, CONNECTOR_EXECUTION_GATE_DECISIONS.REQUEST_CONNECTOR_EXECUTION_REVIEW);
}]);

tests.push(['missing connector executor blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ connectorExecutorName: '' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_EXECUTOR);
}]);

tests.push(['missing idempotency key blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({
    idempotencyKey: '',
    providerConnectorSnapshot: { ...validInput().providerConnectorSnapshot, idempotencyKey: '' },
    connectorInvocationCandidate: { ...validInput().connectorInvocationCandidate, idempotencyKey: '' },
  }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_IDEMPOTENCY_KEY);
}]);

tests.push(['missing audit trail blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ auditTrail: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_AUDIT_TRAIL);
}]);

tests.push(['missing connector capability blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ connectorCapabilitySnapshot: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_CAPABILITY);
}]);

tests.push(['missing connector policy blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ connectorPolicySnapshot: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CONNECTOR_POLICY);
}]);

tests.push(['missing credential review blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ credentialReviewSnapshot: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_CREDENTIAL_REVIEW);
}]);

tests.push(['missing rate-limit review blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ rateLimitSnapshot: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_RATE_LIMIT_REVIEW);
}]);

tests.push(['retry without policy blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ retryRequested: true, retryPolicySnapshot: null }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.NEEDS_RETRY_POLICY);
}]);

tests.push(['unsupported connector executor blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ connectorExecutorName: 'UNKNOWN_EXECUTOR' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_CONNECTOR_EXECUTOR);
  assert.strictEqual(output.decision, CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported connector blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ providerConnectorName: 'UNKNOWN_CONNECTOR' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_CONNECTOR);
  assert.strictEqual(output.decision, CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported provider blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ providerName: 'UNKNOWN_PROVIDER' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_PROVIDER);
  assert.strictEqual(output.decision, CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported channel blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ channel: 'TELEGRAM' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.UNSUPPORTED_CHANNEL);
  assert.strictEqual(output.decision, CONNECTOR_EXECUTION_GATE_DECISIONS.NOT_MODELED);
}]);

tests.push(['expired execution window blocks connector execution handoff', () => {
  const output = buildConnectorExecutionGate(validInput({ expiresAt: pastDate() }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.EXPIRED_EXECUTION_WINDOW);
  assert.strictEqual(output.decision, CONNECTOR_EXECUTION_GATE_DECISIONS.EXPIRED);
}]);

tests.push(['external API call remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.externalApiCallAllowed, false);
  assertNoExecutionFlags(output);
}]);

tests.push(['connector invocation remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.connectorInvocationAllowed, false);
}]);

tests.push(['connector execution remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.connectorExecutionAllowed, false);
  assert.strictEqual(output.approvedForConnectorExecution, false);
}]);

tests.push(['provider dispatch remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.providerDispatchAllowed, false);
}]);

tests.push(['sends message remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.sendsMessage, false);
}]);

tests.push(['credential material exposure remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.credentialMaterialExposed, false);
}]);

tests.push(['queue execution remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.queueExecutionAllowed, false);
}]);

tests.push(['scheduled execution remains false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.scheduledExecutionAllowed, false);
}]);

tests.push(['webhook side effects remain false', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.webhookSideEffectAllowed, false);
}]);

tests.push(['dry-run can be modeled without invocation', () => {
  const output = buildConnectorExecutionGate(validInput({ dryRun: true, requestedUse: 'CONNECTOR_EXECUTION_DRY_RUN_PREP' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.APPROVED_FOR_EXECUTION_DRY_RUN_ONLY);
  assert.strictEqual(output.decision, CONNECTOR_EXECUTION_GATE_DECISIONS.APPROVE_EXECUTION_DRY_RUN_ONLY);
  assert.strictEqual(output.approvedForConnectorExecutionHandoff, true);
  assertNoExecutionFlags(output);
}]);

tests.push(['connector execution handoff can be approved without external call', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.APPROVED_FOR_CONNECTOR_EXECUTION_HANDOFF);
  assert.strictEqual(output.approvedForConnectorExecutionHandoff, true);
  assert.strictEqual(output.externalApiCallAllowed, false);
  assert.strictEqual(output.connectorExecutionAllowed, false);
}]);

tests.push(['automatic send is blocked', () => {
  const output = buildConnectorExecutionGate(validInput({ requestedUse: 'AUTOMATIC_SEND' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AUTOMATIC_SEND'));
}]);

tests.push(['silent send is blocked', () => {
  const output = buildConnectorExecutionGate(validInput({ requestedUse: 'SILENT_SEND' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('SILENT_SEND'));
}]);

tests.push(['AI self-send is blocked', () => {
  const output = buildConnectorExecutionGate(validInput({ requestedUse: 'AI_SELF_SEND' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AI_SELF_SEND'));
}]);

tests.push(['boundary does not create tasks calendar or truth', () => {
  const output = buildConnectorExecutionGate(validInput());
  assertNoExecutionFlags(output);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildConnectorExecutionGate(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['forbidden uses are blocked', () => {
  const output = buildConnectorExecutionGate(validInput({ requestedUse: 'CONNECTOR_INVOCATION' }));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('CONNECTOR_INVOCATION'));
}]);

tests.push(['allowed uses are allowed', () => {
  const output = buildConnectorExecutionGate(validInput({
    requestedUse: 'SMS_CONNECTOR_EXECUTION_REVIEW',
    channel: 'SMS',
    providerName: 'TWILIO',
    providerConnectorName: 'TWILIO_CONNECTOR',
    connectorExecutorName: 'TWILIO_EXECUTOR',
    connectorCapabilitySnapshot: {
      available: true,
      supportedExecutors: ['TWILIO_EXECUTOR'],
      supportedConnectors: ['TWILIO_CONNECTOR'],
      supportedProviders: ['TWILIO'],
      supportedChannels: ['SMS'],
    },
  }));
  assert.ok(output.allowedUses.includes('SMS_CONNECTOR_EXECUTION_REVIEW'));
  assert.strictEqual(output.connectorExecutionGateStatus, CONNECTOR_EXECUTION_GATE_STATUSES.APPROVED_FOR_CONNECTOR_EXECUTION_HANDOFF);
}]);

tests.push(['evidence/source/sourceOwners dedupe', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['ProviderConnectorBoundary', 'ProviderRuntimeBoundary'].sort());
}]);

tests.push(['audit is required', () => {
  const output = buildConnectorExecutionGate(validInput());
  assert.strictEqual(output.connectorExecutionAuditRequired, true);
  assert.strictEqual(output.connectorExecutorBoundaryRequired, true);
  assert.strictEqual(output.providerConnectorBoundaryRequired, true);
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

console.log(`Connector Execution Gate Boundary Contract PASS ${passed}/${tests.length}`);
