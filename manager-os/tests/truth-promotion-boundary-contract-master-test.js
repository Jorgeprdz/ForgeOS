const assert = require('assert');
const {
  buildTruthPromotionBoundary,
  TRUTH_PROMOTION_STATUSES,
  TRUTH_PROMOTION_DECISIONS,
  TRUTH_PROMOTION_ALLOWED_USES,
  TRUTH_PROMOTION_FORBIDDEN_USES,
} = require('../truth-promotion/truth-promotion-boundary-contract');

function futureDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function validInput(overrides = {}) {
  return {
    truthPromotionRequestId: 'truth-promotion-1',
    auditPersistenceRequestId: 'audit-persistence-1',
    uiReadModelRequestId: 'ui-read-model-1',
    advisorId: 'advisor-1',
    managerId: 'manager-1',
    personId: 'maria-1',
    personType: 'prospect',
    auditPersistenceSnapshot: {
      auditPersistenceRequestId: 'audit-persistence-1',
      uiReadModelRequestId: 'ui-read-model-1',
      approvedForPersistenceCandidatePreparation: true,
      approvedForPersistenceWrite: false,
      persistsRecord: false,
      writesFile: false,
      writesDatabase: false,
      createsBusinessTruth: false,
      createsDeliveryTruth: false,
      auditPersistenceRecordCandidate: {
        recordType: 'UI_READ_MODEL_AUDIT',
        idempotencyKey: 'idempotency-1',
        candidateFactType: 'DELIVERY_STATUS',
        candidateFactValue: 'DELIVERED_STATUS',
        candidateFactOwner: 'DELIVERY_SYSTEM',
        createsBusinessTruth: false,
      },
      warnings: ['audit persistence candidate only'],
      limitations: ['not business truth'],
    },
    auditPersistenceRecordCandidate: {
      recordType: 'UI_READ_MODEL_AUDIT',
      idempotencyKey: 'idempotency-1',
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactValue: 'DELIVERED_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
      createsBusinessTruth: false,
    },
    candidateFactType: 'DELIVERY_STATUS',
    candidateFactValue: 'DELIVERED_STATUS',
    candidateFactSource: 'PROVIDER_WEBHOOK_CANDIDATE',
    candidateFactOwner: 'DELIVERY_SYSTEM',
    candidateConfidence: 0.8,
    candidateLimitations: ['provider event only'],
    candidateWarnings: ['needs human truth review'],
    promotionPolicySnapshot: {
      reviewed: true,
      allowed: true,
      approvedForCanonicalTruthWrite: false,
      writesCanonicalTruth: false,
      createsBusinessTruth: false,
      createsMetricTruth: false,
    },
    metricOwnershipSnapshot: {
      reviewed: true,
      allowed: true,
      allowedOwners: ['DELIVERY_SYSTEM', 'MESSAGE_SYSTEM'],
    },
    truthOwnershipSnapshot: {
      reviewed: true,
      allowed: true,
      allowedOwners: ['DELIVERY_SYSTEM', 'MESSAGE_SYSTEM'],
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
      { id: 'ev1', sourceOwner: 'AuditPersistenceBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'UIReadModelBoundary' },
      { sourceEvidenceId: 'ev2', sourceOwner: 'UIReadModelBoundary' },
    ],
    sourceFreshness: {
      fresh: true,
      asOf: new Date().toISOString(),
    },
    auditTrail: {
      auditTrailId: 'audit-1',
      entries: ['audit-persistence-reviewed'],
    },
    idempotencyKey: 'idempotency-1',
    warnings: ['truth promotion warning'],
    limitations: ['truth promotion limitation'],
    requestedUse: 'TRUTH_PROMOTION_CANDIDATE_PREP',
    now: new Date().toISOString(),
    expiresAt: futureDate(),
    ...overrides,
  };
}

function assertNoTruthWritesOrActions(output) {
  assert.strictEqual(output.approvedForCanonicalTruthWrite, false);
  assert.strictEqual(output.writesCanonicalTruth, false);
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
  assert.strictEqual(output.persistsRecord, false);
  assert.strictEqual(output.providerApiCallAllowed, false);
  assert.strictEqual(output.externalApiCallAllowed, false);
  assert.strictEqual(output.executesAction, false);
  assert.strictEqual(output.sendsMessage, false);
}

const tests = [];

tests.push(['exports constants', () => {
  assert.ok(TRUTH_PROMOTION_ALLOWED_USES.includes('TRUTH_PROMOTION_CANDIDATE_PREP'));
  assert.ok(TRUTH_PROMOTION_FORBIDDEN_USES.includes('CANONICAL_TRUTH_WRITE'));
  assert.ok(TRUTH_PROMOTION_STATUSES.APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE);
  assert.ok(TRUTH_PROMOTION_DECISIONS.APPROVE_TRUTH_PROMOTION_REVIEW_CANDIDATE);
}]);

tests.push(['missing Audit Persistence snapshot blocks truth promotion review candidate preparation', () => {
  const output = buildTruthPromotionBoundary(validInput({ auditPersistenceSnapshot: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_AUDIT_PERSISTENCE);
  assertNoTruthWritesOrActions(output);
}]);

tests.push(['missing audit persistence record candidate blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ auditPersistenceRecordCandidate: null, auditPersistenceSnapshot: { approvedForPersistenceCandidatePreparation: true } }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_AUDIT_PERSISTENCE_RECORD_CANDIDATE);
}]);

tests.push(['missing candidate fact type blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({
    candidateFactType: '',
    auditPersistenceRecordCandidate: {
      idempotencyKey: 'idempotency-1',
      candidateFactValue: 'DELIVERED_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
    },
  }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_CANDIDATE_FACT_TYPE);
}]);

tests.push(['missing candidate fact value blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({
    candidateFactValue: '',
    auditPersistenceRecordCandidate: {
      idempotencyKey: 'idempotency-1',
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
    },
  }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_CANDIDATE_FACT_VALUE);
}]);

tests.push(['missing candidate fact owner blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({
    candidateFactOwner: '',
    auditPersistenceRecordCandidate: {
      idempotencyKey: 'idempotency-1',
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactValue: 'DELIVERED_STATUS',
    },
  }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_CANDIDATE_FACT_OWNER);
}]);

tests.push(['missing promotion policy blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ promotionPolicySnapshot: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_PROMOTION_POLICY);
}]);

tests.push(['missing metric ownership review blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ metricOwnershipSnapshot: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_METRIC_OWNERSHIP_REVIEW);
}]);

tests.push(['missing truth ownership review blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ truthOwnershipSnapshot: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_TRUTH_OWNERSHIP_REVIEW);
}]);

tests.push(['missing conflict review blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ conflictReviewSnapshot: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_CONFLICT_REVIEW);
}]);

tests.push(['missing human truth review blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ humanTruthReviewSnapshot: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_HUMAN_TRUTH_REVIEW);
}]);

tests.push(['missing source evidence blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ sourceEvidence: [] }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_SOURCE_EVIDENCE);
}]);

tests.push(['missing source owner blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ sourceEvidence: [{ id: 'ev1' }] }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_SOURCE_OWNER);
}]);

tests.push(['missing source freshness blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ sourceFreshness: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_SOURCE_FRESHNESS);
}]);

tests.push(['stale source freshness blocks or requires review', () => {
  const output = buildTruthPromotionBoundary(validInput({ sourceFreshness: { stale: true } }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.STALE_SOURCE_FRESHNESS);
}]);

tests.push(['missing idempotency key blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({
    idempotencyKey: '',
    auditPersistenceRecordCandidate: {
      recordType: 'UI_READ_MODEL_AUDIT',
      candidateFactType: 'DELIVERY_STATUS',
      candidateFactValue: 'DELIVERED_STATUS',
      candidateFactOwner: 'DELIVERY_SYSTEM',
    },
  }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_IDEMPOTENCY_KEY);
}]);

tests.push(['missing audit trail blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ auditTrail: null }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.NEEDS_AUDIT_TRAIL);
}]);

tests.push(['unsupported fact type blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ candidateFactType: 'UNKNOWN_FACT_TYPE' }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.UNSUPPORTED_FACT_TYPE);
  assert.strictEqual(output.decision, TRUTH_PROMOTION_DECISIONS.NOT_MODELED);
}]);

tests.push(['unsupported owner blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({
    candidateFactOwner: 'UNKNOWN_OWNER',
    metricOwnershipSnapshot: { reviewed: true, allowed: true, allowedOwners: ['UNKNOWN_OWNER'] },
    truthOwnershipSnapshot: { reviewed: true, allowed: true, allowedOwners: ['UNKNOWN_OWNER'] },
  }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.UNSUPPORTED_OWNER);
  assert.strictEqual(output.decision, TRUTH_PROMOTION_DECISIONS.NOT_MODELED);
}]);

tests.push(['conflict detected blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ conflictReviewSnapshot: { reviewed: true, conflictDetected: true } }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.CONFLICT_DETECTED);
  assert.strictEqual(output.decision, TRUTH_PROMOTION_DECISIONS.BLOCK_TRUTH_PROMOTION);
}]);

tests.push(['expired truth promotion window blocks', () => {
  const output = buildTruthPromotionBoundary(validInput({ expiresAt: new Date(Date.now() - 1000).toISOString() }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.EXPIRED_TRUTH_PROMOTION_WINDOW);
  assert.strictEqual(output.decision, TRUTH_PROMOTION_DECISIONS.EXPIRED);
}]);

tests.push(['truth promotion review candidate can be prepared', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE);
  assert.strictEqual(output.eligibleForTruthPromotionReview, true);
  assert.ok(output.truthPromotionReviewCandidate);
}]);

tests.push(['canonical truth write remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.writesCanonicalTruth, false);
  assert.strictEqual(output.approvedForCanonicalTruthWrite, false);
  assert.strictEqual(output.truthPromotionReviewCandidate.writesCanonicalTruth, false);
}]);

tests.push(['business metric truth creation remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.createsBusinessTruth, false);
  assert.strictEqual(output.createsMetricTruth, false);
}]);

tests.push(['delivery message truth creation remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.createsDeliveryTruth, false);
  assert.strictEqual(output.createsMessageTruth, false);
}]);

tests.push(['compensation revenue payout truth remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.createsCompensationTruth, false);
  assert.strictEqual(output.createsRevenueTruth, false);
  assert.strictEqual(output.createsPayoutTruth, false);
}]);

tests.push(['ranking punishment HR personality truth remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.createsRankingTruth, false);
  assert.strictEqual(output.createsPunishmentTruth, false);
  assert.strictEqual(output.createsHrTruth, false);
  assert.strictEqual(output.createsPersonalityTruth, false);
}]);

tests.push(['advisor lifecycle truth remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.createsAdvisorLifecycleTruth, false);
}]);

tests.push(['task calendar creation remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.createsTask, false);
  assert.strictEqual(output.createsCalendarEvent, false);
}]);

tests.push(['CRM mutation remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.mutatesCrm, false);
}]);

tests.push(['persistence write remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.persistsRecord, false);
}]);

tests.push(['UI rendering remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.rendersUi, false);
}]);

tests.push(['provider external API calls remain false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.providerApiCallAllowed, false);
  assert.strictEqual(output.externalApiCallAllowed, false);
}]);

tests.push(['send action execution remains false', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.sendsMessage, false);
  assert.strictEqual(output.executesAction, false);
}]);

tests.push(['forbidden uses are blocked', () => {
  const output = buildTruthPromotionBoundary(validInput({ requestedUse: 'CANONICAL_TRUTH_WRITE' }));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.BLOCKED);
  assert.ok(output.blockedUses.includes('CANONICAL_TRUTH_WRITE'));
}]);

tests.push(['allowed uses are allowed', () => {
  const output = buildTruthPromotionBoundary(validInput({ requestedUse: 'DELIVERY_TRUTH_REVIEW_PREP' }));
  assert.ok(output.allowedUses.includes('DELIVERY_TRUTH_REVIEW_PREP'));
  assert.strictEqual(output.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE);
}]);

tests.push(['inputs are not mutated', () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildTruthPromotionBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
}]);

tests.push(['evidence source sourceOwners dedupe', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.deepStrictEqual(output.evidenceRefs.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceEvidenceIds.sort(), ['ev1', 'ev2'].sort());
  assert.deepStrictEqual(output.sourceOwners.sort(), ['AuditPersistenceBoundary', 'UIReadModelBoundary'].sort());
}]);

tests.push(['warnings and limitations remain visible', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.ok(output.warnings.includes('truth promotion warning'));
  assert.ok(output.warnings.includes('audit persistence candidate only'));
  assert.ok(output.limitations.includes('truth promotion limitation'));
  assert.ok(output.limitations.includes('not business truth'));
  assert.ok(output.truthPromotionReviewCandidate.candidateWarnings.includes('needs human truth review'));
  assert.ok(output.truthPromotionReviewCandidate.candidateLimitations.includes('provider event only'));
}]);

tests.push(['Canonical Truth Registry remains separate', () => {
  const output = buildTruthPromotionBoundary(validInput());
  assert.strictEqual(output.canonicalTruthRegistryRemainsSeparate, true);
  assert.strictEqual(output.canonicalTruthRegistryWriteAllowed, false);
  assert.strictEqual(output.truthPromotionReviewCandidate.canonicalTruthRegistryRemainsSeparate, true);
}]);

tests.push(['explicit zero false values are preserved as review context not missing', () => {
  const zeroOutput = buildTruthPromotionBoundary(validInput({
    candidateFactType: 'ACTIVITY_EVENT',
    candidateFactValue: 0,
    candidateFactOwner: 'ACTIVITY_SYSTEM',
    metricOwnershipSnapshot: { reviewed: true, allowed: true, allowedOwners: ['ACTIVITY_SYSTEM'] },
    truthOwnershipSnapshot: { reviewed: true, allowed: true, allowedOwners: ['ACTIVITY_SYSTEM'] },
  }));
  assert.strictEqual(zeroOutput.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE);
  assert.strictEqual(zeroOutput.truthPromotionReviewCandidate.candidateFactValue, 0);

  const falseOutput = buildTruthPromotionBoundary(validInput({
    candidateFactType: 'MESSAGE_STATUS',
    candidateFactValue: false,
    candidateFactOwner: 'MESSAGE_SYSTEM',
    metricOwnershipSnapshot: { reviewed: true, allowed: true, allowedOwners: ['MESSAGE_SYSTEM'] },
    truthOwnershipSnapshot: { reviewed: true, allowed: true, allowedOwners: ['MESSAGE_SYSTEM'] },
  }));
  assert.strictEqual(falseOutput.truthPromotionStatus, TRUTH_PROMOTION_STATUSES.APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE);
  assert.strictEqual(falseOutput.truthPromotionReviewCandidate.candidateFactValue, false);
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

console.log(`Truth Promotion Boundary Contract PASS ${passed}/${tests.length}`);
