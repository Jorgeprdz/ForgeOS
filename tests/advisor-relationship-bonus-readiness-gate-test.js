import assert from 'node:assert/strict';

import {
  ATTRIBUTION_EVIDENCE_STATUS,
  RELATIONSHIP_ATTRIBUTION_STATUS,
  RELATIONSHIP_TYPE,
  evaluateConnectionAttribution,
  evaluateDevelopmentAttribution,
} from '../compensation/advisor-development/advisor-relationship-attribution-evaluator.js';

import {
  RELATIONSHIP_BONUS_READINESS_STATUS,
  evaluateConnectionBonusReadiness,
  evaluateDevelopmentBonusReadiness,
} from '../compensation/advisor-development/advisor-relationship-bonus-readiness-gate.js';

function createRulePack(overrides = {}) {
  return {
    concepts: {
      'connection-bonus': {
        calculationStatus: 'blocked_until_relationship_attribution_evidence',
        requiredAttributionEvidence: [
          'connectorId',
          'connectedAdvisorId',
          'connectionDate',
          'onboardingEvidence',
          'connectorActiveAtMonthClose',
          'connectedAdvisorActiveAtMonthClose',
          'attributionEvidenceStatus',
        ],
      },
      'development-bonus': {
        calculationStatus: 'blocked_until_relationship_attribution_evidence',
        supportedDeveloperShares: [1, 0.5],
        requiredAttributionEvidence: [
          'developerId',
          'developedAdvisorId',
          'developmentStartDate',
          'developerEligibilityEvidence',
          'developerActiveAtMonthClose',
          'developedAdvisorActiveAtMonthClose',
          'developerShare',
          'attributionEvidenceStatus',
        ],
      },
    },
    ...overrides,
  };
}

function createCountingResult(includedCount = 3) {
  return {
    summary: {
      includedCount,
    },
  };
}

function createConnectionAttribution(overrides = {}) {
  return evaluateConnectionAttribution({
    connectorId: 'connector-001',
    connectedAdvisorId: 'connected-001',
    connectionDate: '2026-02-15',
    connectorActiveAtMonthClose: true,
    connectedAdvisorActiveAtMonthClose: true,
    onboardingEvidence: true,
    attributionEvidenceStatus: ATTRIBUTION_EVIDENCE_STATUS.CONFIRMED_BY_OFFICIAL_RECORD,
    ...overrides,
  });
}

function createDevelopmentAttribution(overrides = {}) {
  return evaluateDevelopmentAttribution({
    developerId: 'developer-001',
    developedAdvisorId: 'developed-001',
    developmentStartDate: '2026-02-15',
    developerEligibilityEvidence: true,
    developerActiveAtMonthClose: true,
    developedAdvisorActiveAtMonthClose: true,
    developerShare: 1,
    attributionEvidenceStatus: ATTRIBUTION_EVIDENCE_STATUS.CONFIRMED_BY_OFFICIAL_RECORD,
    ...overrides,
  });
}

function testConnectionMissingConceptReturnsNotModeled() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: {
      concepts: {},
    },
    relationshipAttributionResult: createConnectionAttribution(),
    countingAndWeightingResult: createCountingResult(3),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'missing_connection_bonus_concept');
  assert.equal(result.payoutTruth, false);

  console.log('PASS connection missing concept returns not_modeled');
}

function testConnectionMissingRelationshipReturnsBlocked() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    countingAndWeightingResult: createCountingResult(3),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED);
  assert.equal(result.reason, 'blocked_by_missing_connection_attribution_evidence');
  assert.equal(result.readiness.relationshipConfirmed, false);

  console.log('PASS connection missing relationship attribution returns blocked');
}

function testConnectionPendingRelationshipReturnsPending() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createConnectionAttribution({
      attributionEvidenceStatus: ATTRIBUTION_EVIDENCE_STATUS.PENDING_EVIDENCE,
    }),
    countingAndWeightingResult: createCountingResult(3),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.PENDING);
  assert.equal(result.reason, 'pending_connection_attribution_evidence');

  console.log('PASS connection pending relationship returns pending');
}

function testConnectionBlockedRelationshipReturnsBlocked() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createConnectionAttribution({
      connectedAdvisorActiveAtMonthClose: false,
    }),
    countingAndWeightingResult: createCountingResult(3),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED);
  assert.equal(result.reason, 'blocked_by_missing_connection_attribution_evidence');

  console.log('PASS connection blocked relationship returns blocked');
}

function testConnectionUnknownRelationshipReturnsUnknown() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createConnectionAttribution({
      connectionDate: 'not-a-date',
    }),
    countingAndWeightingResult: createCountingResult(3),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN);
  assert.equal(result.reason, 'unknown_connection_attribution_facts');

  console.log('PASS connection unknown relationship returns unknown');
}

function testConnectionConfirmedMissingCountingReturnsBlocked() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createConnectionAttribution(),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED);
  assert.equal(result.reason, 'blocked_by_missing_policy_count_result');

  console.log('PASS connection confirmed but missing counting result returns blocked');
}

function testConnectionIncludedCountNonNumericReturnsUnknown() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createConnectionAttribution(),
    countingAndWeightingResult: createCountingResult('3'),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN);
  assert.equal(result.reason, 'invalid_policy_count_result');

  console.log('PASS connection non numeric includedCount returns unknown');
}

function testConnectionIncludedCountZeroReturnsBlocked() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createConnectionAttribution(),
    countingAndWeightingResult: createCountingResult(0),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED);
  assert.equal(result.reason, 'blocked_by_zero_valid_policies');

  console.log('PASS connection zero valid policies returns blocked');
}

function testConnectionReadyWithIncludedCountThree() {
  const result = evaluateConnectionBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createConnectionAttribution(),
    countingAndWeightingResult: createCountingResult(3),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION);
  assert.equal(result.reason, null);
  assert.equal(result.relationshipType, RELATIONSHIP_TYPE.CONNECTION);
  assert.equal(result.readiness.readyForCandidateCalculation, true);
  assert.equal(result.readiness.validPolicyCount, 3);
  assert.equal(result.policyCount.includedCount, 3);
  assert.equal(result.payoutTruth, false);
  assert.deepEqual(result.evidenceRequirements, [
    'relationship_attribution_evidence',
    'valid_policy_count_evidence',
    'commission_statement_required',
  ]);

  console.log('PASS connection confirmed and includedCount 3 returns ready');
}

function testDevelopmentMissingConceptReturnsNotModeled() {
  const result = evaluateDevelopmentBonusReadiness({
    rulePack: {
      concepts: {},
    },
    relationshipAttributionResult: createDevelopmentAttribution({
      developerShare: 1,
    }),
    countingAndWeightingResult: createCountingResult(4),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'missing_development_bonus_concept');
  assert.equal(result.payoutTruth, false);

  console.log('PASS development missing concept returns not_modeled');
}

function testDevelopmentMissingDeveloperShareReturnsBlocked() {
  const result = evaluateDevelopmentBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: {
      status: RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED,
      reason: null,
      attribution: {
        developerId: 'developer-001',
        developedAdvisorId: 'developed-001',
      },
      share: null,
    },
    countingAndWeightingResult: createCountingResult(4),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED);
  assert.equal(result.reason, 'blocked_by_missing_developer_share');

  console.log('PASS development missing developerShare returns blocked');
}

function testDevelopmentDeveloperShareStringReturnsUnknown() {
  const result = evaluateDevelopmentBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: {
      status: RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED,
      reason: null,
      attribution: {
        developerId: 'developer-001',
        developedAdvisorId: 'developed-001',
      },
      share: {
        developerShare: '0.5',
      },
    },
    countingAndWeightingResult: createCountingResult(4),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN);
  assert.equal(result.reason, 'invalid_developer_share');

  console.log('PASS development string developerShare returns unknown');
}

function testDevelopmentUnsupportedDeveloperShareReturnsNotModeled() {
  const result = evaluateDevelopmentBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: {
      status: RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED,
      reason: null,
      attribution: {
        developerId: 'developer-001',
        developedAdvisorId: 'developed-001',
      },
      share: {
        developerShare: 0.333,
      },
    },
    countingAndWeightingResult: createCountingResult(4),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'unsupported_developer_share_in_rule_pack');

  console.log('PASS development unsupported developerShare returns not_modeled');
}

function testDevelopmentHalfShareReady() {
  const result = evaluateDevelopmentBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createDevelopmentAttribution({
      developerShare: 0.5,
    }),
    countingAndWeightingResult: createCountingResult(4),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION);
  assert.equal(result.relationshipType, RELATIONSHIP_TYPE.DEVELOPMENT);
  assert.equal(result.readiness.developerShare, 0.5);
  assert.equal(result.readiness.validPolicyCount, 4);
  assert.equal(result.payoutTruth, false);

  console.log('PASS development 50/50 share and includedCount 4 returns ready');
}

function testDevelopmentFullShareReady() {
  const result = evaluateDevelopmentBonusReadiness({
    rulePack: createRulePack(),
    relationshipAttributionResult: createDevelopmentAttribution({
      developerShare: 1,
    }),
    countingAndWeightingResult: createCountingResult(4),
  });

  assert.equal(result.status, RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION);
  assert.equal(result.relationshipType, RELATIONSHIP_TYPE.DEVELOPMENT);
  assert.equal(result.readiness.developerShare, 1);
  assert.equal(result.readiness.validPolicyCount, 4);
  assert.equal(result.payoutTruth, false);

  console.log('PASS development 100 percent share and includedCount 4 returns ready');
}

testConnectionMissingConceptReturnsNotModeled();
testConnectionMissingRelationshipReturnsBlocked();
testConnectionPendingRelationshipReturnsPending();
testConnectionBlockedRelationshipReturnsBlocked();
testConnectionUnknownRelationshipReturnsUnknown();
testConnectionConfirmedMissingCountingReturnsBlocked();
testConnectionIncludedCountNonNumericReturnsUnknown();
testConnectionIncludedCountZeroReturnsBlocked();
testConnectionReadyWithIncludedCountThree();
testDevelopmentMissingConceptReturnsNotModeled();
testDevelopmentMissingDeveloperShareReturnsBlocked();
testDevelopmentDeveloperShareStringReturnsUnknown();
testDevelopmentUnsupportedDeveloperShareReturnsNotModeled();
testDevelopmentHalfShareReady();
testDevelopmentFullShareReady();

console.log('PASS advisor-relationship-bonus-readiness-gate-test');
