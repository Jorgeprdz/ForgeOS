import assert from 'node:assert/strict';

import {
  RELATIONSHIP_BONUS_READINESS_STATUS,
} from '../compensation/advisor-development/advisor-relationship-bonus-readiness-gate.js';

import {
  CONNECTION_BONUS_STATUS,
  CONNECTION_BONUS_TYPE,
  calculateConnectionBonusCandidate,
} from '../compensation/advisor-development/advisor-development-connection-bonus-engine.js';

function createConnectionBonusConcept(overrides = {}) {
  return {
    displayName: 'Bono de Conexión',
    calculationStatus: 'blocked_until_relationship_attribution_evidence',
    calculationFrequency: 'monthly',
    payoutTruth: false,
    payoutTruthRule: 'commission_statement_required',
    attributionModel: 'advisor_connection_attribution',
    policyCountSource: 'advisor-development-counting-weighting-engine.summary.includedCount',
    readinessGate: 'advisor-relationship-bonus-readiness-gate',
    altaBonus: {
      amount: 7500,
      trigger: 'connected_advisor_onboarded',
      advisorMonth: 1,
      requiresReadiness: true,
    },
    monthlyBonus: {
      advisorMonths: [2, 3],
      tiers: [
        {
          minimumPolicies: 3,
          amount: 5000,
        },
        {
          minimumPolicies: 4,
          amount: 9000,
        },
        {
          minimumPolicies: 5,
          amount: 15000,
        },
        {
          minimumPolicies: 6,
          amount: 20000,
          appliesToCountAndAbove: true,
        },
      ],
    },
    ...overrides,
  };
}

function createRulePack(concept = createConnectionBonusConcept()) {
  return {
    concepts: {
      'connection-bonus': concept,
    },
  };
}

function createReadyReadiness(validPolicyCount = 3) {
  return {
    status: RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION,
    reason: null,
    readiness: {
      relationshipConfirmed: true,
      validPolicyCountAvailable: true,
      validPolicyCount,
      shareAvailable: false,
      developerShare: null,
      readyForCandidateCalculation: true,
    },
    payoutTruth: false,
    warnings: [
      {
        code: 'test_readiness_warning',
      },
    ],
  };
}

function createReadinessStatus(status) {
  return {
    status,
    reason: `${status}_reason`,
    readiness: {
      relationshipConfirmed: false,
      validPolicyCountAvailable: false,
      validPolicyCount: null,
      readyForCandidateCalculation: false,
    },
    payoutTruth: false,
    warnings: [],
  };
}

function calculate(overrides = {}) {
  return calculateConnectionBonusCandidate({
    rulePack: createRulePack(),
    connectionBonusReadinessResult: createReadyReadiness(3),
    advisorFacts: {
      advisorMonth: 1,
    },
    ...overrides,
  });
}

function testMissingRulePackReturnsNotModeled() {
  const result = calculateConnectionBonusCandidate({
    connectionBonusReadinessResult: createReadyReadiness(3),
    advisorFacts: {
      advisorMonth: 1,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'missing_rule_pack');
  assert.equal(result.calculation.payableCandidate, null);

  console.log('PASS missing rulePack returns not_modeled');
}

function testMissingConnectionBonusConceptReturnsNotModeled() {
  const result = calculateConnectionBonusCandidate({
    rulePack: {
      concepts: {},
    },
    connectionBonusReadinessResult: createReadyReadiness(3),
    advisorFacts: {
      advisorMonth: 1,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'missing_connection_bonus_concept');

  console.log('PASS missing connection-bonus concept returns not_modeled');
}

function testMissingReadinessReturnsBlocked() {
  const result = calculateConnectionBonusCandidate({
    rulePack: createRulePack(),
    advisorFacts: {
      advisorMonth: 1,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.BLOCKED);
  assert.equal(result.reason, 'blocked_by_missing_connection_bonus_readiness');

  console.log('PASS missing readiness result returns blocked');
}

function testReadinessPendingReturnsPending() {
  const result = calculate({
    connectionBonusReadinessResult: createReadinessStatus(RELATIONSHIP_BONUS_READINESS_STATUS.PENDING),
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.PENDING);
  assert.equal(result.reason, 'pending_connection_bonus_readiness');

  console.log('PASS readiness pending returns pending');
}

function testReadinessBlockedReturnsBlocked() {
  const result = calculate({
    connectionBonusReadinessResult: createReadinessStatus(RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED),
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.BLOCKED);
  assert.equal(result.reason, 'blocked_by_connection_bonus_readiness');

  console.log('PASS readiness blocked returns blocked');
}

function testReadinessUnknownReturnsUnknown() {
  const result = calculate({
    connectionBonusReadinessResult: createReadinessStatus(RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN),
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.UNKNOWN);
  assert.equal(result.reason, 'unknown_connection_bonus_readiness');

  console.log('PASS readiness unknown returns unknown');
}

function testReadinessNotModeledReturnsNotModeled() {
  const result = calculate({
    connectionBonusReadinessResult: createReadinessStatus(RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED),
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'connection_bonus_readiness_not_modeled');

  console.log('PASS readiness not_modeled returns not_modeled');
}

function testReadyMissingAdvisorMonthReturnsBlocked() {
  const result = calculate({
    advisorFacts: {},
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.BLOCKED);
  assert.equal(result.reason, 'missing_advisorMonth');

  console.log('PASS ready but missing advisorMonth returns blocked');
}

function testReadyAdvisorMonthStringReturnsUnknown() {
  const result = calculate({
    advisorFacts: {
      advisorMonth: '1',
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.UNKNOWN);
  assert.equal(result.reason, 'invalid_advisorMonth');

  console.log('PASS ready but advisorMonth string returns unknown');
}

function testReadyAdvisorMonthOneReturnsAltaCandidate() {
  const result = calculate({
    advisorFacts: {
      advisorMonth: 1,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.ELIGIBLE);
  assert.equal(result.reason, null);
  assert.equal(result.bonusType, CONNECTION_BONUS_TYPE.ALTA);
  assert.equal(result.advisorMonth, 1);
  assert.equal(result.calculation.validPolicyCount, null);
  assert.equal(result.calculation.tierMatched, null);
  assert.equal(result.calculation.payableCandidate, 7500);
  assert.equal(result.payoutTruth, false);

  console.log('PASS ready advisorMonth 1 returns eligible alta candidate 7500');
}

function testReadyMonthTwoCountThreeReturnsFiveThousand() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness(3),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.ELIGIBLE);
  assert.equal(result.bonusType, CONNECTION_BONUS_TYPE.MONTHLY);
  assert.equal(result.calculation.validPolicyCount, 3);
  assert.equal(result.calculation.tierMatched.minimumPolicies, 3);
  assert.equal(result.calculation.payableCandidate, 5000);

  console.log('PASS month 2 count 3 returns 5000');
}

function testReadyMonthTwoCountFourReturnsNineThousand() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness(4),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.ELIGIBLE);
  assert.equal(result.calculation.tierMatched.minimumPolicies, 4);
  assert.equal(result.calculation.payableCandidate, 9000);

  console.log('PASS month 2 count 4 returns 9000');
}

function testReadyMonthTwoCountFiveReturnsFifteenThousand() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness(5),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.ELIGIBLE);
  assert.equal(result.calculation.tierMatched.minimumPolicies, 5);
  assert.equal(result.calculation.payableCandidate, 15000);

  console.log('PASS month 2 count 5 returns 15000');
}

function testReadyMonthTwoCountSixReturnsTwentyThousand() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness(6),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.ELIGIBLE);
  assert.equal(result.calculation.tierMatched.minimumPolicies, 6);
  assert.equal(result.calculation.tierMatched.appliesToCountAndAbove, true);
  assert.equal(result.calculation.payableCandidate, 20000);

  console.log('PASS month 2 count 6 returns 20000');
}

function testReadyMonthTwoCountSevenReturnsTwentyThousand() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness(7),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.ELIGIBLE);
  assert.equal(result.calculation.tierMatched.minimumPolicies, 6);
  assert.equal(result.calculation.payableCandidate, 20000);

  console.log('PASS month 2 count 7 returns 20000');
}

function testReadyMonthThreeCountThreeReturnsFiveThousand() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness(3),
    advisorFacts: {
      advisorMonth: 3,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.ELIGIBLE);
  assert.equal(result.bonusType, CONNECTION_BONUS_TYPE.MONTHLY);
  assert.equal(result.calculation.payableCandidate, 5000);

  console.log('PASS month 3 count 3 returns 5000');
}

function testReadyMonthTwoCountTwoReturnsIneligibleNullCandidate() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness(2),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.INELIGIBLE);
  assert.equal(result.reason, 'connection_bonus_policy_threshold_not_met');
  assert.equal(result.bonusType, CONNECTION_BONUS_TYPE.MONTHLY);
  assert.equal(result.calculation.validPolicyCount, 2);
  assert.equal(result.calculation.tierMatched, null);
  assert.equal(result.calculation.payableCandidate, null);

  console.log('PASS month 2 count 2 returns ineligible with null candidate');
}

function testReadyMonthFourReturnsNotModeled() {
  const result = calculate({
    advisorFacts: {
      advisorMonth: 4,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'advisor_month_not_modeled_for_connection_bonus');

  console.log('PASS advisorMonth 4 returns not_modeled');
}

function testValidPolicyCountStringReturnsUnknown() {
  const result = calculate({
    connectionBonusReadinessResult: createReadyReadiness('3'),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.UNKNOWN);
  assert.equal(result.reason, 'invalid_validPolicyCount');

  console.log('PASS validPolicyCount string returns unknown');
}

function testMalformedTierTableReturnsNotModeled() {
  const concept = createConnectionBonusConcept({
    monthlyBonus: {
      advisorMonths: [2, 3],
      tiers: [
        {
          minimumPolicies: 3,
          amount: '5000',
        },
      ],
    },
  });

  const result = calculate({
    rulePack: createRulePack(concept),
    connectionBonusReadinessResult: createReadyReadiness(3),
    advisorFacts: {
      advisorMonth: 2,
    },
  });

  assert.equal(result.status, CONNECTION_BONUS_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'malformed_connection_bonus_tier_table');

  console.log('PASS malformed tier table returns not_modeled');
}

function testAlwaysPayoutTruthFalse() {
  const results = [
    calculate({
      advisorFacts: {
        advisorMonth: 1,
      },
    }),
    calculate({
      connectionBonusReadinessResult: createReadyReadiness(2),
      advisorFacts: {
        advisorMonth: 2,
      },
    }),
    calculate({
      connectionBonusReadinessResult: createReadinessStatus(RELATIONSHIP_BONUS_READINESS_STATUS.PENDING),
    }),
  ];

  for (const result of results) {
    assert.equal(result.payoutTruth, false);
    assert.equal(result.payoutTruthRule, 'commission_statement_required');
    assert.deepEqual(result.evidenceRequirements, ['commission_statement_required']);
  }

  console.log('PASS connection bonus engine always returns payoutTruth false');
}

testMissingRulePackReturnsNotModeled();
testMissingConnectionBonusConceptReturnsNotModeled();
testMissingReadinessReturnsBlocked();
testReadinessPendingReturnsPending();
testReadinessBlockedReturnsBlocked();
testReadinessUnknownReturnsUnknown();
testReadinessNotModeledReturnsNotModeled();
testReadyMissingAdvisorMonthReturnsBlocked();
testReadyAdvisorMonthStringReturnsUnknown();
testReadyAdvisorMonthOneReturnsAltaCandidate();
testReadyMonthTwoCountThreeReturnsFiveThousand();
testReadyMonthTwoCountFourReturnsNineThousand();
testReadyMonthTwoCountFiveReturnsFifteenThousand();
testReadyMonthTwoCountSixReturnsTwentyThousand();
testReadyMonthTwoCountSevenReturnsTwentyThousand();
testReadyMonthThreeCountThreeReturnsFiveThousand();
testReadyMonthTwoCountTwoReturnsIneligibleNullCandidate();
testReadyMonthFourReturnsNotModeled();
testValidPolicyCountStringReturnsUnknown();
testMalformedTierTableReturnsNotModeled();
testAlwaysPayoutTruthFalse();

console.log('PASS advisor-development-connection-bonus-engine-test');
