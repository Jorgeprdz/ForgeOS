const assert = require('assert');
const {
  buildSendExecutionGate,
  SEND_EXECUTION_GATE_STATUSES,
  SEND_EXECUTION_GATE_DECISIONS,
  SEND_EXECUTION_GATE_ALLOWED_USES,
  SEND_EXECUTION_GATE_FORBIDDEN_USES,
} = require('../send-execution/send-execution-gate-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
    sendRequestId: 'send-1',
    deliveryRequestId: 'delivery-1',
    approvalRequestId: 'approval-1',
    advisorId: 'advisor-1',
    managerId: 'manager-1',
    senderId: 'advisor-1',
    senderRole: 'advisor',
    personId: 'maria-1',
    personType: 'prospect',
    channel: 'WHATSAPP',
    deliveryCandidateSnapshot: {
      deliveryRequestId: 'delivery-1',
      approvedForDeliveryPreparation: true,
      channelCandidate: 'WHATSAPP',
      preparedText: 'Hola Maria, como vas con lo que platicamos?',
      linkCandidate: 'https://wa.me/?text=Hola%20Maria',
      approvedArtifactHash: 'hash-approved',
      currentArtifactHash: 'hash-approved',
      warnings: ['manual handoff only'],
    },
    humanApprovalSnapshot: {
      approvalRequestId: 'approval-1',
      reviewerId: 'human-1',
      approvedForDeliveryPreparation: true,
      approvedArtifactHash: 'hash-approved',
      approvedText: 'Hola Maria, como vas con lo que platicamos?',
      expiresAt: futureDate(),
    },
    safetyValidationSnapshot: {
      status: 'SAFE_FOR_HUMAN_REVIEW',
      safe: true,
    },
    approvedArtifactHash: 'hash-approved',
    currentArtifactHash: 'hash-approved',
    finalSendText: 'Hola Maria, como vas con lo que platicamos?',
    recipientDestination: '+525512345678',
    sendConfirmation: {
      confirmed: true,
      confirmedBy: 'advisor-1',
      confirmedAt: new Date().toISOString(),
    },
    sourceEvidence: [
      { id: 'ev1', sourceOwner: 'DeliveryAdapter' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'HumanApprovalGate' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'HumanApprovalGate' },
    ],
    requestedUse: 'WHATSAPP_SEND_REVIEW',
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertNoExecutionFlags(output) {
  assert.strictEqual(output.approvedForSendExecution, false);
  assert.strictEqual(output.providerRuntimeCallAllowed, false);
  assert.strictEqual(output.sendsMessage, false);
  assert.strictEqual(output.automaticSendAllowed, false);
  assert.strictEqual(output.silentSendAllowed, false);
  assert.strictEqual(output.scheduledSendAllowed, false);
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
  assert.strictEqual(output.providerRuntimeBoundaryRequired, true);
  assert.strictEqual(output.humanSendConfirmationRequired, true);
  assert.strictEqual(output.sendAuditRequired, true);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(SEND_EXECUTION_GATE_ALLOWED_USES.includes('WHATSAPP_SEND_REVIEW'));
  assert.ok(SEND_EXECUTION_GATE_FORBIDDEN_USES.includes('AUTOMATIC_SEND'));
  assert.ok(SEND_EXECUTION_GATE_STATUSES.APPROVED_FOR_PROVIDER_HANDOFF);
  assert.ok(SEND_EXECUTION_GATE_DECISIONS.APPROVE_PROVIDER_HANDOFF);
}]);

tests.push(['missing delivery candidate blocks send review', () => {
  const output = buildSendExecutionGate(validInput({ deliveryCandidateSnapshot: null }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NEEDS_DELIVERY_CANDIDATE);
  assert.ok(output.blockedUses.includes('SEND_WITHOUT_DELIVERY_CANDIDATE'));
  assertNoExecutionFlags(output);
}]);

tests.push(['missing human approval blocks send review', () => {
  const output = buildSendExecutionGate(validInput({ humanApprovalSnapshot: null }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NEEDS_HUMAN_APPROVAL);
  assert.ok(output.blockedUses.includes('SEND_WITHOUT_HUMAN_APPROVAL'));
  assertNoExecutionFlags(output);
}]);

tests.push(['missing final send confirmation blocks', () => {
  const output = buildSendExecutionGate(validInput({ sendConfirmation: null, finalSendConfirmed: false }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NEEDS_FINAL_SEND_CONFIRMATION);
  assert.strictEqual(output.decision, SEND_EXECUTION_GATE_DECISIONS.REQUEST_FINAL_SEND_REVIEW);
  assert.ok(output.blockedUses.includes('SEND_WITHOUT_HUMAN_CONFIRMATION'));
}]);

tests.push(['missing recipient destination blocks', () => {
  const output = buildSendExecutionGate(validInput({ recipientDestination: '' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NEEDS_RECIPIENT_DESTINATION);
}]);

tests.push(['missing channel blocks', () => {
  const output = buildSendExecutionGate(validInput({ channel: '', deliveryCandidateSnapshot: { ...validInput().deliveryCandidateSnapshot, channelCandidate: '' } }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NEEDS_CHANNEL);
}]);

tests.push(['missing artifact hash blocks', () => {
  const output = buildSendExecutionGate(validInput({
    approvedArtifactHash: '',
    currentArtifactHash: '',
    deliveryCandidateSnapshot: { approvedForDeliveryPreparation: true, preparedText: 'ok', channelCandidate: 'WHATSAPP' },
    humanApprovalSnapshot: { approvedForDeliveryPreparation: true, expiresAt: futureDate() },
  }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NEEDS_ARTIFACT_HASH);
}]);

tests.push(['changed artifact requires reapproval', () => {
  const output = buildSendExecutionGate(validInput({ currentArtifactHash: 'hash-changed' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.ARTIFACT_CHANGED_REAPPROVAL_REQUIRED);
  assert.ok(output.blockedUses.includes('SEND_CHANGED_ARTIFACT_WITHOUT_REAPPROVAL'));
}]);

tests.push(['missing safety validation blocks', () => {
  const output = buildSendExecutionGate(validInput({ safetyValidationSnapshot: null }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NEEDS_SAFETY_VALIDATION);
}]);

tests.push(['unsafe safety blocks send', () => {
  const output = buildSendExecutionGate(validInput({ safetyValidationSnapshot: { status: 'UNSAFE_BLOCKED', safe: false } }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.UNSAFE_MESSAGE_BLOCKED);
  assert.ok(output.blockedUses.includes('SEND_UNSAFE_MESSAGE'));
}]);

tests.push(['unsupported channel blocks', () => {
  const output = buildSendExecutionGate(validInput({ channel: 'TELEGRAM' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.UNSUPPORTED_CHANNEL);
  assert.strictEqual(output.decision, SEND_EXECUTION_GATE_DECISIONS.NOT_MODELED);
}]);

tests.push(['expired send window blocks', () => {
  const output = buildSendExecutionGate(validInput({ expiresAt: pastDate() }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.EXPIRED_SEND_WINDOW);
  assert.strictEqual(output.decision, SEND_EXECUTION_GATE_DECISIONS.EXPIRED);
}]);

tests.push(['automatic send is blocked', () => {
  const output = buildSendExecutionGate(validInput({ requestedUse: 'AUTOMATIC_SEND' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AUTOMATIC_SEND'));
}]);

tests.push(['silent send is blocked', () => {
  const output = buildSendExecutionGate(validInput({ requestedUse: 'SILENT_SEND' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('SILENT_SEND'));
}]);

tests.push(['AI self-send is blocked', () => {
  const output = buildSendExecutionGate(validInput({ requestedUse: 'AI_SELF_SEND' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AI_SELF_SEND'));
}]);

tests.push(['scheduled send is blocked', () => {
  const output = buildSendExecutionGate(validInput({ requestedUse: 'SCHEDULED_SEND' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('SCHEDULED_SEND'));
}]);

tests.push(['unknown requested use is not modeled', () => {
  const output = buildSendExecutionGate(validInput({ requestedUse: 'UNKNOWN_SEND_USE' }));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.NOT_MODELED);
  assert.strictEqual(output.decision, SEND_EXECUTION_GATE_DECISIONS.NOT_MODELED);
}]);

tests.push(['allowed use is preserved', () => {
  const output = buildSendExecutionGate(validInput({ requestedUse: 'EMAIL_SEND_REVIEW', channel: 'EMAIL', recipientDestination: 'maria@example.com' }));
  assert.ok(output.allowedUses.includes('EMAIL_SEND_REVIEW'));
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.APPROVED_FOR_PROVIDER_HANDOFF);
}]);

tests.push(['valid final send review approves provider handoff but does not send', () => {
  const output = buildSendExecutionGate(validInput());
  assert.strictEqual(output.sendExecutionGateStatus, SEND_EXECUTION_GATE_STATUSES.APPROVED_FOR_PROVIDER_HANDOFF);
  assert.strictEqual(output.decision, SEND_EXECUTION_GATE_DECISIONS.APPROVE_PROVIDER_HANDOFF);
  assert.strictEqual(output.approvedForProviderHandoff, true);
  assert.ok(output.providerCandidate);
  assertNoExecutionFlags(output);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildSendExecutionGate(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['evidence/source/sourceOwners dedupe', () => {
  const output = buildSendExecutionGate(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['DeliveryAdapter', 'HumanApprovalGate'].sort());
}]);

tests.push(['send gate never creates task calendar or truth', () => {
  const output = buildSendExecutionGate(validInput());
  assertNoExecutionFlags(output);
}]);

tests.push(['delivery preparation is not send', () => {
  const output = buildSendExecutionGate(validInput());
  assert.strictEqual(output.approvedForProviderHandoff, true);
  assert.strictEqual(output.sendsMessage, false);
  assert.strictEqual(output.providerRuntimeCallAllowed, false);
  assert.strictEqual(output.approvedForSendExecution, false);
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

console.log(`Send Execution Gate Boundary Contract PASS ${passed}/${tests.length}`);
