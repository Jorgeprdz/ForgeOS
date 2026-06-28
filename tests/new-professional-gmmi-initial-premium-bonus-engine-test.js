import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  loadNewProfessional2026RulePack,
} from '../compensation/new-professional/new-professional-rule-pack-loader.js';

import {
  GMMI_INITIAL_PREMIUM_BONUS_STATUS,
  calculateNewProfessionalGmmiInitialPremiumBonusCandidate,
  resolveGmmiInitialPremiumBonusGroup,
  resolveGmmiInitialPremiumGoalForQuarterMonth,
} from '../compensation/new-professional/new-professional-gmmi-initial-premium-bonus-engine.js';

const { rulePack } = loadNewProfessional2026RulePack();
const concept = rulePack.concepts['gmmi-initial-premium-bonus'];

function baseFacts(overrides = {}) {
  return {
    quarterNumber: 1,
    quarterMonth: 1,
    paymentMode: 'quarter_settlement',
    accumulatedEligiblePaidGmmiInitialNetPremium: 315000,
    accumulatedGmmiInitialPoliciesPaid: 8,
    priorPaidBonusesInQuarter: 10000,
    age60PlusPremiumExcluded: true,
    firstReceiptPaidPolicyBasis: true,
    productionResetScope: 'current_quarter',
    ...overrides,
  };
}

function calculate(overrides = {}) {
  return calculateNewProfessionalGmmiInitialPremiumBonusCandidate({
    rulePack,
    advisorFacts: baseFacts(overrides),
  });
}

function testResolvesExactGroupThreshold() {
  const result = resolveGmmiInitialPremiumBonusGroup({
    concept,
    quarterMonth: 1,
    accumulatedEligiblePaidGmmiInitialNetPremium: 315000,
    accumulatedGmmiInitialPoliciesPaid: 8,
  });

  assert.equal(result.group, 1);
  assert.equal(result.premiumGoal, 315000);
  assert.equal(result.policyGoal, 8);

  console.log('PASS resolves exact group threshold where premium and policies both meet');
}

function testSelectsBetterGroupCorrectly() {
  const result = resolveGmmiInitialPremiumBonusGroup({
    concept,
    quarterMonth: 2,
    accumulatedEligiblePaidGmmiInitialNetPremium: 640000,
    accumulatedGmmiInitialPoliciesPaid: 8,
  });

  assert.equal(result.group, 1);
  assert.equal(result.bonusRate, 0.16);

  console.log('PASS selects better group correctly');
}

function testPremiumMeetsButPoliciesFail() {
  const result = calculate({
    accumulatedEligiblePaidGmmiInitialNetPremium: 315000,
    accumulatedGmmiInitialPoliciesPaid: 1,
  });

  assert.equal(result.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.INELIGIBLE_GMMI_INITIAL_GOALS_NOT_MET);
  assert.equal(result.reason, 'policy_goal_not_met');
  assert.equal(result.candidateAmount, null);

  console.log('PASS premium meets but policies fail returns ineligible_gmmi_initial_goals_not_met');
}

function testPoliciesMeetButPremiumFails() {
  const result = calculate({
    accumulatedEligiblePaidGmmiInitialNetPremium: 64000,
    accumulatedGmmiInitialPoliciesPaid: 8,
  });

  assert.equal(result.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.INELIGIBLE_GMMI_INITIAL_GOALS_NOT_MET);
  assert.equal(result.reason, 'premium_goal_not_met');
  assert.equal(result.candidateAmount, null);

  console.log('PASS policies meet but premium fails returns ineligible_gmmi_initial_goals_not_met');
}

function testPremiumBelowAllGroupsReturnsIneligible() {
  const result = calculate({
    accumulatedEligiblePaidGmmiInitialNetPremium: 64000,
    accumulatedGmmiInitialPoliciesPaid: 1,
  });

  assert.equal(result.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.INELIGIBLE_GMMI_INITIAL_GOALS_NOT_MET);
  assert.equal(result.reason, 'premium_and_policy_goals_not_met');

  console.log('PASS premium below all groups returns ineligible_gmmi_initial_goals_not_met');
}

function testQuarterMonthPremiumGoalResolution() {
  const row = concept.gmmiInitialPremiumQuarterlyBonusTable.groups['1'];

  assert.equal(resolveGmmiInitialPremiumGoalForQuarterMonth({ row, quarterMonth: 1 }), 315000);
  assert.equal(resolveGmmiInitialPremiumGoalForQuarterMonth({ row, quarterMonth: 2 }), 640000);
  assert.equal(resolveGmmiInitialPremiumGoalForQuarterMonth({ row, quarterMonth: 3 }), 790000);

  console.log('PASS month 1, 2 and 3 premium goals resolve correctly');
}

function testUsesGroupOneRate() {
  const result = calculate();

  assert.equal(result.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.CALCULATED_CANDIDATE);
  assert.equal(result.calculation.group, 1);
  assert.equal(result.calculation.candidateRate, 0.16);

  console.log('PASS uses group 1 rate 16%');
}

function testUsesGroupSevenRate() {
  const result = calculate({
    accumulatedEligiblePaidGmmiInitialNetPremium: 65000,
    accumulatedGmmiInitialPoliciesPaid: 2,
    priorPaidBonusesInQuarter: 0,
  });

  assert.equal(result.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.CALCULATED_CANDIDATE);
  assert.equal(result.calculation.group, 7);
  assert.equal(result.calculation.candidateRate, 0.07);

  console.log('PASS uses group 7 rate 7%');
}

function testCalculatesPremiumTimesRateMinusPriorPaid() {
  const result = calculate({
    accumulatedEligiblePaidGmmiInitialNetPremium: 315000,
    priorPaidBonusesInQuarter: 10000,
  });

  assert.equal(result.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.CALCULATED_CANDIDATE);
  assert.equal(result.calculation.calculatedGmmiInitialBonusCandidate, 50400);
  assert.equal(result.calculation.payableCandidate, 40400);
  assert.equal(result.candidateAmount, 40400);

  console.log('PASS calculates accumulated premium * rate - prior paid');
}

function testMissingInputsBlock() {
  const missingPriorPaid = calculate({ priorPaidBonusesInQuarter: null });
  const missingPremium = calculate({ accumulatedEligiblePaidGmmiInitialNetPremium: null });
  const missingPolicies = calculate({ accumulatedGmmiInitialPoliciesPaid: null });

  assert.equal(missingPriorPaid.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(missingPriorPaid.reason, 'prior_paid_bonuses_in_quarter_missing');
  assert.equal(missingPremium.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(missingPremium.reason, 'accumulated_eligible_paid_gmmi_initial_net_premium_missing');
  assert.equal(missingPolicies.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(missingPolicies.reason, 'accumulated_gmmi_initial_policies_paid_missing');

  console.log('PASS missing prior paid, premium, and policies block');
}

function testEvidenceAndBasisGuardrailsBlock() {
  const ageExclusion = calculate({ age60PlusPremiumExcluded: false });
  const firstReceipt = calculate({ firstReceiptPaidPolicyBasis: false });
  const resetScope = calculate({ productionResetScope: 'annual' });

  assert.equal(ageExclusion.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(ageExclusion.reason, 'age_60_plus_exclusion_not_confirmed');
  assert.equal(firstReceipt.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(firstReceipt.reason, 'first_receipt_paid_policy_basis_not_confirmed');
  assert.equal(resetScope.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(resetScope.reason, 'production_reset_scope_invalid');

  console.log('PASS age 60 exclusion, first receipt basis, and reset scope guardrails block');
}

function testInvalidQuarterAndPaymentModeBlock() {
  const invalidQuarterMonth = calculate({ quarterMonth: 4 });
  const invalidQuarterNumber = calculate({ quarterNumber: 5 });
  const invalidPaymentMode = calculate({ paymentMode: 'annual_settlement' });

  assert.equal(invalidQuarterMonth.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(invalidQuarterMonth.reason, 'invalid_quarter_month');
  assert.equal(invalidQuarterNumber.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(invalidQuarterNumber.reason, 'invalid_quarter_number');
  assert.equal(invalidPaymentMode.status, GMMI_INITIAL_PREMIUM_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert.equal(invalidPaymentMode.reason, 'invalid_payment_mode');

  console.log('PASS invalid quarterMonth, quarterNumber, and paymentMode block');
}

function testPayoutTruthAlwaysFalse() {
  const results = [
    calculate(),
    calculate({ accumulatedEligiblePaidGmmiInitialNetPremium: 1 }),
    calculate({ priorPaidBonusesInQuarter: null }),
  ];

  for (const result of results) {
    assert.equal(result.payoutTruth, false);
    assert.equal(result.payoutTruthRule, 'commission_statement_required');
    assert.deepEqual(result.evidenceRequirements, ['commission_statement_required']);
    assert.equal(result.explainability.payoutTruth, false);
  }

  console.log('PASS payoutTruth always false');
}

function testEngineDoesNotImportOtherCompensationDomains() {
  const source = readFileSync(
    'compensation/new-professional/new-professional-gmmi-initial-premium-bonus-engine.js',
    'utf8',
  );

  assert.equal(source.includes('partner-manager'), false);
  assert.equal(source.includes('advisor-development'), false);

  console.log('PASS engine does not import Partner or Advisor Development');
}

function testEngineDoesNotImplementOtherGmmiConcepts() {
  const source = readFileSync(
    'compensation/new-professional/new-professional-gmmi-initial-premium-bonus-engine.js',
    'utf8',
  );

  assert.equal(source.includes('growth-annual'), false);
  assert.equal(source.includes('renewal-premium'), false);
  assert.equal(source.includes('loss-ratio'), false);
  assert.equal(source.includes('siniestralidad'), false);

  console.log('PASS engine does not implement GMMI annual growth, renewal, or siniestralidad');
}

function testPackageJsonIsNotChanged() {
  const packageJson = readFileSync('package.json', 'utf8');

  assert.equal(packageJson.includes('new-professional-gmmi-initial-premium-bonus-engine'), false);

  console.log('PASS package.json is not changed');
}

testResolvesExactGroupThreshold();
testSelectsBetterGroupCorrectly();
testPremiumMeetsButPoliciesFail();
testPoliciesMeetButPremiumFails();
testPremiumBelowAllGroupsReturnsIneligible();
testQuarterMonthPremiumGoalResolution();
testUsesGroupOneRate();
testUsesGroupSevenRate();
testCalculatesPremiumTimesRateMinusPriorPaid();
testMissingInputsBlock();
testEvidenceAndBasisGuardrailsBlock();
testInvalidQuarterAndPaymentModeBlock();
testPayoutTruthAlwaysFalse();
testEngineDoesNotImportOtherCompensationDomains();
testEngineDoesNotImplementOtherGmmiConcepts();
testPackageJsonIsNotChanged();

console.log('PASS new-professional-gmmi-initial-premium-bonus-engine-test');
