const assert = require('assert');
const {
  buildDeliveryAdapterBoundary,
  DELIVERY_ADAPTER_STATUSES,
  DELIVERY_ADAPTER_DECISIONS,
  DELIVERY_ADAPTER_ALLOWED_USES,
  DELIVERY_ADAPTER_FORBIDDEN_USES,
} = require('../delivery/delivery-adapter-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
    deliveryRequestId: 'delivery-1',
    approvalRequestId: 'approval-1',
    advisorId: 'advisor-1',
    managerId: 'manager-1',
    reviewerId: 'human-1',
    personId: 'maria-1',
    personType: 'prospect',
    channelCandidate: 'WHATSAPP',
    deliveryMode: 'MANUAL_LINK',
    approvedArtifactHash: 'hash-approved',
    currentArtifactHash: 'hash-approved',
    approvedText: 'Hola Maria, como vas con lo que platicamos?',
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
    sourceEvidence: [
      { id: 'ev1', sourceOwner: 'HumanApprovalGate' },
      { id: 'ev1', sourceOwner: 'HumanApprovalGate' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'MessageSafetyValidator' },
    ],
    requestedUse: 'WHATSAPP_LINK_PREP',
    now: new Date().toISOString(),
    ...overrides,
  };
}

function assertNoExecutionFlags(output) {
  assert.strictEqual(output.approvedForSendExecution, false);
  assert.strictEqual(output.automaticSendAllowed, false);
  assert.strictEqual(output.providerRuntimeCallAllowed, false);
  assert.strictEqual(output.sendsMessage, false);
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
  assert.strictEqual(output.sendExecutionGateRequired, true);
  assert.strictEqual(output.humanApprovalRequired, true);
  assert.strictEqual(output.auditRequired, true);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(DELIVERY_ADAPTER_ALLOWED_USES.includes('WHATSAPP_LINK_PREP'));
  assert.ok(DELIVERY_ADAPTER_FORBIDDEN_USES.includes('AUTOMATIC_SEND'));
  assert.ok(DELIVERY_ADAPTER_STATUSES.PREPARED_FOR_MANUAL_DELIVERY);
  assert.ok(DELIVERY_ADAPTER_DECISIONS.PREPARE_DELIVERY_CANDIDATE);
}]);

tests.push(['missing human approval blocks delivery preparation', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ humanApprovalSnapshot: null }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.NEEDS_HUMAN_APPROVAL);
  assert.strictEqual(output.approvedForDeliveryPreparation, false);
  assertNoExecutionFlags(output);
}]);

tests.push(['human approval not approved for delivery prep blocks', () => {
  const output = buildDeliveryAdapterBoundary(validInput({
    humanApprovalSnapshot: { approvedForDeliveryPreparation: false, approvedArtifactHash: 'hash-approved' },
  }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.NEEDS_HUMAN_APPROVAL);
  assertNoExecutionFlags(output);
}]);

tests.push(['missing approved artifact blocks', () => {
  const output = buildDeliveryAdapterBoundary(validInput({
    approvedText: '',
    humanApprovalSnapshot: { approvedForDeliveryPreparation: true, approvedArtifactHash: 'hash-approved', expiresAt: futureDate() },
  }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.NEEDS_APPROVED_ARTIFACT);
}]);

tests.push(['missing artifact hash blocks', () => {
  const output = buildDeliveryAdapterBoundary(validInput({
    approvedArtifactHash: '',
    currentArtifactHash: '',
    humanApprovalSnapshot: { approvedForDeliveryPreparation: true, approvedText: 'ok', expiresAt: futureDate() },
  }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.NEEDS_ARTIFACT_HASH);
}]);

tests.push(['changed artifact requires reapproval', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ currentArtifactHash: 'hash-changed' }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.ARTIFACT_CHANGED_REAPPROVAL_REQUIRED);
  assert.ok(output.blockedUses.includes('CHANGED_ARTIFACT_WITHOUT_REAPPROVAL'));
}]);

tests.push(['unsafe safety blocks delivery prep', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ safetyValidationSnapshot: { status: 'UNSAFE_BLOCKED', safe: false } }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('UNSAFE_MESSAGE_DELIVERY'));
}]);

tests.push(['expired approval blocks', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ expiresAt: pastDate() }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.EXPIRED_APPROVAL);
  assert.strictEqual(output.decision, DELIVERY_ADAPTER_DECISIONS.EXPIRED);
}]);

tests.push(['missing channel candidate blocks', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ channelCandidate: '' }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.NEEDS_CHANNEL_CANDIDATE);
}]);

tests.push(['unsupported channel blocks', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ channelCandidate: 'TELEGRAM' }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.UNSUPPORTED_CHANNEL);
  assert.strictEqual(output.decision, DELIVERY_ADAPTER_DECISIONS.NOT_MODELED);
}]);

tests.push(['valid whatsapp prep produces link and no send', () => {
  const output = buildDeliveryAdapterBoundary(validInput());
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.PREPARED_FOR_MANUAL_DELIVERY);
  assert.strictEqual(output.approvedForDeliveryPreparation, true);
  assert.ok(output.linkCandidate.startsWith('https://wa.me/?text='));
  assert.ok(output.manualHandoffInstruction.includes('Do not send'));
  assertNoExecutionFlags(output);
}]);

tests.push(['valid sms prep produces sms link and no send', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ channelCandidate: 'SMS', requestedUse: 'SMS_LINK_PREP' }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.PREPARED_FOR_MANUAL_DELIVERY);
  assert.ok(output.linkCandidate.startsWith('sms:?body='));
  assertNoExecutionFlags(output);
}]);

tests.push(['manual copy prep uses manual handoff', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ channelCandidate: 'MANUAL_COPY', requestedUse: 'MANUAL_COPY_PREP' }));
  assert.strictEqual(output.decision, DELIVERY_ADAPTER_DECISIONS.PREPARE_MANUAL_HANDOFF);
  assertNoExecutionFlags(output);
}]);

tests.push(['forbidden uses are blocked', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ requestedUse: 'AUTOMATIC_SEND' }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('AUTOMATIC_SEND'));
}]);

tests.push(['unknown requested use is not modeled', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ requestedUse: 'UNKNOWN_DELIVERY_USE' }));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.NOT_MODELED);
  assert.strictEqual(output.decision, DELIVERY_ADAPTER_DECISIONS.NOT_MODELED);
}]);

tests.push(['allowed uses are preserved', () => {
  const output = buildDeliveryAdapterBoundary(validInput({ requestedUse: 'EMAIL_CLIENT_PREP', channelCandidate: 'EMAIL' }));
  assert.ok(output.allowedUses.includes('EMAIL_CLIENT_PREP'));
  assert.strictEqual(output.deliveryAdapterStatus, DELIVERY_ADAPTER_STATUSES.PREPARED_FOR_MANUAL_DELIVERY);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildDeliveryAdapterBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['evidence/source/sourceOwners dedupe', () => {
  const output = buildDeliveryAdapterBoundary(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['HumanApprovalGate', 'MessageSafetyValidator'].sort());
}]);

tests.push(['all runtime/action/truth flags remain false', () => {
  const output = buildDeliveryAdapterBoundary(validInput());
  assertNoExecutionFlags(output);
}]);

tests.push(['delivery preparation is not send', () => {
  const output = buildDeliveryAdapterBoundary(validInput());
  assert.strictEqual(output.approvedForDeliveryPreparation, true);
  assert.strictEqual(output.sendsMessage, false);
  assert.strictEqual(output.approvedForSendExecution, false);
  assert.strictEqual(output.sendExecutionGateRequired, true);
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

console.log(`Delivery Adapter Boundary Contract PASS ${passed}/${tests.length}`);
