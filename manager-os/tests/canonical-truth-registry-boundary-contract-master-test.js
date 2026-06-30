const assert = require('assert');
const {
  buildCanonicalTruthRegistryBoundary,
  CANONICAL_TRUTH_REGISTRY_STATUSES,
  CANONICAL_TRUTH_REGISTRY_DECISIONS,
  CANONICAL_TRUTH_REGISTRY_ALLOWED_USES,
  CANONICAL_TRUTH_REGISTRY_FORBIDDEN_USES,
} = require('../canonical-truth-registry/canonical-truth-registry-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
    canonicalTruthRegistryRequestId: 'canonical-registry-1',
    truthPromotionRequestId: 'truth-promotion-1',
    auditPersistenceRequestId: 'audit-persistence-1',
    uiReadModelRequestId: 'ui-read-model-1',
    advisorId: 'advisor-1',
    managerId: 'manager-1',
    personId: 'maria-1',
    personType: 'prospect',
    truthPromotionSnapshot: {
      truthPromotionRequestId: 'truth-promotion-1',
      auditPersistenceRequestId: 'audit-persistence-1',
      uiReadModelRequestId: 'ui-read-model-1',
      eligibleForTruthPromotionReview: true,
      approvedForCanonicalTruthWrite: false,
      writesCanonicalTruth: false,
      createsBusinessTruth: false,
      createsMetricTruth: false,
      truthPromotionReviewCandidate: {
        candidateFactType: 'DELIVERY_STATUS',
        candidateFactValue: 'DELIVERED_STATUS',
        candidateFactOwner: 'DELIVERY_SYSTEM',
        candidateFactSource: 'PROVIDER_WEBHOOK_CANDIDATE',
        idempotencyKey: 'idempotency-1',
        writesCanonicalTruth: false,
        createsBusinessTruth: false,
        createsMetricTruth: false,
      },
      warnings: ['truth promotion candidate only'],
      limitations: ['not canonical truth'],
    },
    truthPromotionReviewCandidate: {
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactValue: 'DELIVERED_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
      candidateFactSource: 'PROVIDER_WEBHOOK_CANDIDATE',
      idempotencyKey: 'idempotency-1',
      writesCanonicalTruth: false,
      createsBusinessTruth: false,
      createsMetricTruth: false,
    },
    candidateFactType: 'DELIVERY_STATUS',
    candidateFactValue: 'DELIVERED_STATUS',
    candidateFactOwner: 'DELIVERY_SYSTEM',
    candidateFactSource: 'PROVIDER_WEBHOOK_CANDIDATE',
    candidateConfidence: 0.8,
    canonicalTruthPolicySnapshot: {
      reviewed: true,
      allowed: true,
      approvedForCanonicalTruthWrite: false,
      writesCanonicalTruth: false,
      createsBusinessTruth: false,
      createsMetricTruth: false,
    },
    canonicalKeyPolicySnapshot: {
      reviewed: true,
      allowed: true,
      duplicateCanonicalKey: false,
      approvedForCanonicalTruthWrite: false,
      writesCanonicalTruth: false,
    },
    canonicalOwnerPolicySnapshot: {
      reviewed: true,
      allowed: true,
      allowedOwners: ['DELIVERY_SYSTEM', 'MESSAGE_SYSTEM'],
    },
    immutabilityPolicySnapshot: {
      reviewed: true,
      allowed: true,
      immutableCandidate: true,
      mutableTruthAllowed: false,
      mutatesCanonicalTruth: false,
      mutatesCrm: false,
    },
    conflictReviewSnapshot: {
      reviewed: true,
      conflictDetected: false,
    },
    humanTruthReviewSnapshot: {
      reviewed: true,
      rejected: false,
    },
    sourceEvidence: [
      { id: 'ev1', sourceOwner: 'TruthPromotionBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'AuditPersistenceBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'AuditPersistenceBoundary' },
    ],
    sourceFreshness: {
      fresh: true,
      asOf: new Date().toISOString(),
    },
    auditTrail: {
      auditTrailId: 'audit-1',
      entries: ['truth-promotion-reviewed'],
    },
    idempotencyKey: 'idempotency-1',
    warnings: ['registry warning'],
    limitations: ['registry limitation'],
    requestedUse: 'CANONICAL_TRUTH_ENTRY_CANDIDATE_PREP',
    now: new Date().toISOString(),
    expiresAt: futureDate(),
    ...overrides,
  };
}

function assertNoWritesTruthOrActions(output) {
  assert.strictEqual(output.approvedForCanonicalTruthWrite, false);
  assert.strictEqual(output.writesCanonicalTruth, false);
  assert.strictEqual(output.persistsRecord, false);
  assert.strictEqual(output.writesFile, false);
  assert.strictEqual(output.writesDatabase, false);
  assert.strictEqual(output.createsBusinessTruth, false);
  assert.strictEqual(output.createsMetricTruth, false);
  assert.strictEqual(output.createsDeliveryTruth, false);
  assert.strictEqual(output.createsMessageTruth, false);
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
  assert.strictEqual(output.createsAdvisorLifecycleTruth, false);
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
  assert.strictEqual(output.mutatesCrm, false);
  assert.strictEqual(output.rendersUi, false);
  assert.strictEqual(output.providerApiCallAllowed, false);
  assert.strictEqual(output.externalApiCallAllowed, false);
  assert.strictEqual(output.executesAction, false);
  assert.strictEqual(output.sendsMessage, false);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(CANONICAL_TRUTH_REGISTRY_ALLOWED_USES.includes('CANONICAL_TRUTH_ENTRY_CANDIDATE_PREP'));
  assert.ok(CANONICAL_TRUTH_REGISTRY_FORBIDDEN_USES.includes('CANONICAL_TRUTH_WRITE'));
  assert.ok(CANONICAL_TRUTH_REGISTRY_STATUSES.APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE);
  assert.ok(CANONICAL_TRUTH_REGISTRY_DECISIONS.APPROVE_CANONICAL_TRUTH_ENTRY_CANDIDATE);
}]);

tests.push(['missing Truth Promotion snapshot blocks canonical entry candidate preparation', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ truthPromotionSnapshot: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_TRUTH_PROMOTION);
  assertNoWritesTruthOrActions(output);
}]);

tests.push(['missing truth promotion review candidate blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ truthPromotionReviewCandidate: null, truthPromotionSnapshot: { eligibleForTruthPromotionReview: true } }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_TRUTH_PROMOTION_REVIEW_CANDIDATE);
}]);

tests.push(['missing candidate fact type blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({
    candidateFactType: '',
    truthPromotionReviewCandidate: {
      candidateFactValue: 'DELIVERED_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
      idempotencyKey: 'idempotency-1',
    },
  }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANDIDATE_FACT_TYPE);
}]);

tests.push(['missing candidate fact value blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({
    candidateFactValue: '',
    truthPromotionReviewCandidate: {
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
      idempotencyKey: 'idempotency-1',
    },
  }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANDIDATE_FACT_VALUE);
}]);

tests.push(['missing candidate fact owner blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({
    candidateFactOwner: '',
    truthPromotionReviewCandidate: {
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactValue: 'DELIVERED_STATUS',
      idempotencyKey: 'idempotency-1',
    },
  }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANDIDATE_FACT_OWNER);
}]);

tests.push(['missing canonical truth policy blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ canonicalTruthPolicySnapshot: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANONICAL_TRUTH_POLICY);
}]);

tests.push(['missing canonical key policy blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ canonicalKeyPolicySnapshot: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANONICAL_KEY_POLICY);
}]);

tests.push(['missing canonical owner policy blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ canonicalOwnerPolicySnapshot: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANONICAL_OWNER_POLICY);
}]);

tests.push(['missing immutability policy blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ immutabilityPolicySnapshot: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_IMMUTABILITY_POLICY);
}]);

tests.push(['missing conflict review blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ conflictReviewSnapshot: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CONFLICT_REVIEW);
}]);

tests.push(['missing human truth review blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ humanTruthReviewSnapshot: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_HUMAN_TRUTH_REVIEW);
}]);

tests.push(['missing source evidence blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ sourceEvidence: [] }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_SOURCE_EVIDENCE);
}]);

tests.push(['missing source owner blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ sourceEvidence: [{ id: 'ev1' }] }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_SOURCE_OWNER);
}]);

tests.push(['missing source freshness blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ sourceFreshness: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_SOURCE_FRESHNESS);
}]);

tests.push(['stale source freshness blocks or requires review', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ sourceFreshness: { stale: true } }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.STALE_SOURCE_FRESHNESS);
}]);

tests.push(['missing idempotency key blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({
    idempotencyKey: '',
    truthPromotionReviewCandidate: {
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactValue: 'DELIVERED_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
    },
  }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_IDEMPOTENCY_KEY);
}]);

tests.push(['missing audit trail blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ auditTrail: null }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_AUDIT_TRAIL);
}]);

tests.push(['unsupported fact type blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ candidateFactType: 'UNKNOWN_FACT_TYPE' }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.UNSUPPORTED_FACT_TYPE);
  assert.strictEqual(output.decision, CANONICAL_TRUTH_REGISTRY_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported owner blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({
    candidateFactOwner: 'UNKNOWN_OWNER',
    canonicalOwnerPolicySnapshot: { reviewed: true, allowed: true, allowedOwners: ['UNKNOWN_OWNER'] },
  }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.UNSUPPORTED_OWNER);
  assert.strictEqual(output.decision, CANONICAL_TRUTH_REGISTRY_DECISIONS.NOT_MODELED);
}]);

tests.push(['duplicate canonical key blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ canonicalKeyPolicySnapshot: { reviewed: true, allowed: true, duplicateCanonicalKey: true } }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.DUPLICATE_CANONICAL_KEY);
  assert.strictEqual(output.decision, CANONICAL_TRUTH_REGISTRY_DECISIONS.BLOCK_CANONICAL_TRUTH_REGISTRY);
}]);

tests.push(['conflict detected blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ conflictReviewSnapshot: { reviewed: true, conflictDetected: true } }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.CONFLICT_DETECTED);
  assert.strictEqual(output.decision, CANONICAL_TRUTH_REGISTRY_DECISIONS.BLOCK_CANONICAL_TRUTH_REGISTRY);
}]);

tests.push(['expired canonical truth window blocks', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ expiresAt: new Date(Date.now() - 1000).toISOString() }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.EXPIRED_CANONICAL_TRUTH_WINDOW);
  assert.strictEqual(output.decision, CANONICAL_TRUTH_REGISTRY_DECISIONS.EXPIRED);
}]);

tests.push(['canonical truth entry candidate can be prepared', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE);
  assert.strictEqual(output.eligibleForCanonicalTruthEntryPreparation, true);
  assert.ok(output.canonicalTruthEntryCandidate);
}]);

tests.push(['canonical truth write remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.writesCanonicalTruth, false);
  assert.strictEqual(output.approvedForCanonicalTruthWrite, false);
  assert.strictEqual(output.canonicalTruthEntryCandidate.writesCanonicalTruth, false);
}]);

tests.push(['persistence file database writes remain false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.persistsRecord, false);
  assert.strictEqual(output.writesFile, false);
  assert.strictEqual(output.writesDatabase, false);
}]);

tests.push(['business metric truth creation remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.createsBusinessTruth, false);
  assert.strictEqual(output.createsMetricTruth, false);
  assert.strictEqual(output.canonicalTruthEntryCandidate.createsMetricTruth, false);
}]);

tests.push(['delivery message truth creation remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.createsDeliveryTruth, false);
  assert.strictEqual(output.createsMessageTruth, false);
}]);

tests.push(['compensation revenue payout truth remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
}]);

tests.push(['ranking punishment HR personality truth remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
}]);

tests.push(['advisor lifecycle truth remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.createsAdvisorLifecycleTruth, false);
}]);

tests.push(['task calendar creation remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
}]);

tests.push(['CRM mutation remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.mutatesCrm, false);
}]);

tests.push(['UI rendering remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.rendersUi, false);
}]);

tests.push(['provider external API calls remain false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.providerApiCallAllowed, false);
  assert.strictEqual(output.externalApiCallAllowed, false);
}]);

tests.push(['send action execution remains false', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.strictEqual(output.sendsMessage, false);
  assert.strictEqual(output.executesAction, false);
}]);

tests.push(['forbidden uses are blocked', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ requestedUse: 'CANONICAL_TRUTH_WRITE' }));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('CANONICAL_TRUTH_WRITE'));
}]);

tests.push(['allowed uses are allowed', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput({ requestedUse: 'DELIVERY_CANONICAL_TRUTH_ENTRY_PREP' }));
  assert.ok(output.allowedUses.includes('DELIVERY_CANONICAL_TRUTH_ENTRY_PREP'));
  assert.strictEqual(output.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildCanonicalTruthRegistryBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['evidence source sourceOwners dedupe', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['TruthPromotionBoundary', 'AuditPersistenceBoundary'].sort());
}]);

tests.push(['warnings and limitations remain visible', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.ok(output.warnings.includes('registry warning'));
  assert.ok(output.warnings.includes('truth promotion candidate only'));
  assert.ok(output.limitations.includes('registry limitation'));
  assert.ok(output.limitations.includes('not canonical truth'));
}]);

tests.push(['explicit zero false values are preserved as review context not missing', () => {
  const zeroOutput = buildCanonicalTruthRegistryBoundary(validInput({
    candidateFactType: 'ACTIVITY_EVENT',
    candidateFactValue: 0,
    candidateFactOwner: 'ACTIVITY_SYSTEM',
    canonicalOwnerPolicySnapshot: { reviewed: true, allowed: true, allowedOwners: ['ACTIVITY_SYSTEM'] },
  }));
  assert.strictEqual(zeroOutput.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE);
  assert.strictEqual(zeroOutput.canonicalTruthEntryCandidate.candidateFactValue, 0);

  const falseOutput = buildCanonicalTruthRegistryBoundary(validInput({
    candidateFactType: 'MESSAGE_STATUS',
    candidateFactValue: false,
    candidateFactOwner: 'MESSAGE_SYSTEM',
    canonicalOwnerPolicySnapshot: { reviewed: true, allowed: true, allowedOwners: ['MESSAGE_SYSTEM'] },
  }));
  assert.strictEqual(falseOutput.canonicalTruthRegistryStatus, CANONICAL_TRUTH_REGISTRY_STATUSES.APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE);
  assert.strictEqual(falseOutput.canonicalTruthEntryCandidate.candidateFactValue, false);
}]);

tests.push(['canonical entry candidate includes immutable source trace', () => {
  const output = buildCanonicalTruthRegistryBoundary(validInput());
  assert.ok(output.canonicalTruthEntryCandidate.immutableSourceTrace);
  assert.deepStrictEqual(output.canonicalTruthEntryCandidate.immutableSourceTrace.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.canonicalTruthEntryCandidate.immutableSourceTrace.sourceOwners.sort(), ['TruthPromotionBoundary', 'AuditPersistenceBoundary'].sort());
  assert.strictEqual(output.metricEconomicTruthRemainsSeparate, true);
  assert.strictEqual(output.canonicalTruthEntryCandidate.metricEconomicTruthRemainsSeparate, true);
  assertNoWritesTruthOrActions(output);
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

console.log(`Canonical Truth Registry Boundary Contract PASS ${passed}/${tests.length}`);
