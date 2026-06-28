import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  loadNewProfessional2026RulePack,
} from '../compensation/new-professional/new-professional-rule-pack-loader.js';

import {
  LIFE_INITIAL_BONUS_STATUS,
  calculateNewProfessionalLifeInitialBonusCandidate,
  evaluateLifeInitialPolicyGoals,
  resolveLifeInitialBonusRate,
  resolveLifeInitialMinimumLimra,
  resolveLifeInitialMonthlyAdvanceEffectiveGroup,
  resolveLifeInitialTargetPremiumGroup,
} from '../compensation/new-professional/new-professional-life-initial-bonus-engine.js';

const { rulePack } = loadNewProfessional2026RulePack();
const concept = rulePack.concepts['life-initial-bonus'];

function baseFacts(overrides = {}) {
  return {
    semesterNumber: 1,
    semesterMonth: 3,
    advisorContestMonth: 10,
    firstSemesterInNewProfessionalBook: true,
    paymentMode: 'semester_settlement',
    accumulatedTargetPremium: 1370000,
    accumulatedPaidInitialPremium: 100000,
    monthlyInitialLifePoliciesPaid: 1,
    accumulatedInitialLifePoliciesPaid: 8,
    annualInitialLifePoliciesPaid: null,
    limra: 90,
    previousSemesterGroup: null,
    priorPaidBonusesInSemester: 5000,
    ...overrides,
  };
}

function calculate(overrides = {}) {
  return calculateNewProfessionalLifeInitialBonusCandidate({
    rulePack,
    advisorFacts: baseFacts(overrides),
  });
}

function testResolvesExactGroupThreshold() {
  const result = resolveLifeInitialTargetPremiumGroup({
    concept,
    semesterMonth: 1,
    accumulatedTargetPremium: 455000,
  });

  assert.equal(result.group, 1);
  assert.equal(result.threshold, 455000);

  console.log('PASS resolves exact group threshold');
}

function testSelectsBetterGroupCorrectly() {
  const result = resolveLifeInitialTargetPremiumGroup({
    concept,
    semesterMonth: 4,
    accumulatedTargetPremium: 1825000,
  });

  assert.equal(result.group, 1);

  console.log('PASS selects better group correctly');
}

function testPremiumBelowAllGroupsReturnsIneligibleNoGroup() {
  const result = calculate({
    semesterMonth: 1,
    accumulatedTargetPremium: 49000,
    accumulatedInitialLifePoliciesPaid: 3,
  });

  assert.equal(result.status, LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_NO_GROUP);
  assert.equal(result.candidateAmount, null);

  console.log('PASS premium below all groups returns ineligible_no_group');
}

function testMonthThreeRequiresMonthlyAndSemesterPolicyGoals() {
  const policyGoals = evaluateLifeInitialPolicyGoals({
    concept,
    advisorFacts: baseFacts({
      semesterMonth: 3,
      monthlyInitialLifePoliciesPaid: 1,
      accumulatedInitialLifePoliciesPaid: 7.5,
    }),
  });

  assert.equal(policyGoals.monthlyGoalMet, true);
  assert.equal(policyGoals.semesterGoalMet, true);
  assert.equal(policyGoals.met, true);

  const failed = calculate({
    semesterMonth: 3,
    monthlyInitialLifePoliciesPaid: 0,
    accumulatedInitialLifePoliciesPaid: 7.5,
  });

  assert.equal(failed.status, LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_POLICY_GOALS_NOT_MET);

  console.log('PASS month 3 requires monthly and semester policy goals');
}

function testMonthSixDoesNotRequireMonthlyPolicyGoalButRequiresSemesterGoal() {
  const passing = calculate({
    semesterMonth: 6,
    accumulatedTargetPremium: 2735000,
    monthlyInitialLifePoliciesPaid: null,
    accumulatedInitialLifePoliciesPaid: 15,
  });

  assert.equal(passing.status, LIFE_INITIAL_BONUS_STATUS.CALCULATED_CANDIDATE);

  const failing = calculate({
    semesterMonth: 6,
    accumulatedTargetPremium: 2735000,
    monthlyInitialLifePoliciesPaid: null,
    accumulatedInitialLifePoliciesPaid: 14.5,
  });

  assert.equal(failing.status, LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_POLICY_GOALS_NOT_MET);

  console.log('PASS month 6 skips monthly goal but requires semester goal');
}

function testSecondSemesterRequiresAnnualPolicyGoal() {
  const failing = calculate({
    semesterNumber: 2,
    semesterMonth: 1,
    accumulatedTargetPremium: 455000,
    accumulatedInitialLifePoliciesPaid: 3,
    annualInitialLifePoliciesPaid: 17,
  });

  assert.equal(failing.status, LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_POLICY_GOALS_NOT_MET);

  const passing = calculate({
    semesterNumber: 2,
    semesterMonth: 1,
    accumulatedTargetPremium: 455000,
    accumulatedInitialLifePoliciesPaid: 3,
    annualInitialLifePoliciesPaid: 17.5,
  });

  assert.equal(passing.status, LIFE_INITIAL_BONUS_STATUS.CALCULATED_CANDIDATE);

  console.log('PASS second semester requires annual policy goal');
}

function testLimraMinimumsByTenure() {
  assert.equal(resolveLifeInitialMinimumLimra({ concept, advisorContestMonth: 24 }), 75.5);
  assert.equal(resolveLifeInitialMinimumLimra({ concept, advisorContestMonth: 25 }), 80.5);
  assert.equal(resolveLifeInitialMinimumLimra({ concept, advisorContestMonth: 37 }), 84.5);

  console.log('PASS LIMRA minimums resolve by tenure');
}

function testBelowLimraMinimumReturnsIneligible() {
  const result = calculate({
    advisorContestMonth: 25,
    limra: 80.4,
  });

  assert.equal(result.status, LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_LIMRA_GOAL_NOT_MET);
  assert.equal(result.candidateAmount, null);

  console.log('PASS below LIMRA minimum returns ineligible_limra_goal_not_met');
}

function testResolvesRateTiers() {
  assert.equal(resolveLifeInitialBonusRate({ concept, group: 1, limra: 75.5, minimumLimra: 75.5 }).rate, 0.098);
  assert.equal(resolveLifeInitialBonusRate({ concept, group: 1, limra: 87.5, minimumLimra: 75.5 }).rate, 0.195);
  assert.equal(resolveLifeInitialBonusRate({ concept, group: 1, limra: 89.5, minimumLimra: 75.5 }).rate, 0.33);
  assert.equal(resolveLifeInitialBonusRate({ concept, group: 1, limra: 91.5, minimumLimra: 75.5 }).rate, 0.36);
  assert.equal(resolveLifeInitialBonusRate({ concept, group: 1, limra: 95.5, minimumLimra: 75.5 }).rate, 0.45);

  console.log('PASS resolves rate tiers for minimumIndex, 87.5, 89.5, 91.5 and 95.5');
}

function testContestMonths13To36FloorAppliesWhenEligible() {
  const result = calculate({
    semesterMonth: 1,
    advisorContestMonth: 13,
    accumulatedTargetPremium: 50000,
    accumulatedInitialLifePoliciesPaid: 3,
    limra: 76,
    priorPaidBonusesInSemester: 0,
  });

  assert.equal(result.status, LIFE_INITIAL_BONUS_STATUS.CALCULATED_CANDIDATE);
  assert.equal(result.calculation.currentGroup, 16);
  assert.equal(result.calculation.realRate, 0.01);
  assert.equal(result.calculation.candidateRate, 0.098);
  assert.equal(result.explainability.contestMonth13To36FloorApplied, true);

  console.log('PASS contest months 13-36 floor applies max(realRate, 9.8%) when eligible');
}

function testMonthlyAdvanceGroupCapUsesPreviousSemesterGroup() {
  const effective = resolveLifeInitialMonthlyAdvanceEffectiveGroup({
    concept,
    currentGroup: 5,
    previousSemesterGroup: 10,
    firstSemesterInNewProfessionalBook: false,
    paymentMode: 'monthly_advance',
  });

  assert.equal(effective.effectiveGroup, 10);
  assert.equal(effective.capGroup, 10);
  assert.equal(effective.capApplied, true);

  console.log('PASS monthly advance group cap uses previous semester group');
}

function testMissingPreviousSemesterGroupCapsToGroup13() {
  const result = calculate({
    semesterMonth: 1,
    paymentMode: 'monthly_advance',
    firstSemesterInNewProfessionalBook: false,
    previousSemesterGroup: null,
    accumulatedTargetPremium: 455000,
    accumulatedInitialLifePoliciesPaid: 3,
    limra: 95.5,
    priorPaidBonusesInSemester: 0,
  });

  assert.equal(result.calculation.currentGroup, 1);
  assert.equal(result.calculation.effectiveGroup, 13);
  assert.equal(result.explainability.monthlyAdvanceGroupCap.capGroup, 13);

  console.log('PASS missing previousSemesterGroup in monthly_advance caps to group 13');
}

function testFirstSemesterUsesCurrentGroupWithoutCap() {
  const result = calculate({
    semesterMonth: 1,
    paymentMode: 'monthly_advance',
    firstSemesterInNewProfessionalBook: true,
    previousSemesterGroup: 13,
    accumulatedTargetPremium: 455000,
    accumulatedInitialLifePoliciesPaid: 3,
    limra: 95.5,
    priorPaidBonusesInSemester: 0,
  });

  assert.equal(result.calculation.currentGroup, 1);
  assert.equal(result.calculation.effectiveGroup, 1);
  assert.equal(result.explainability.monthlyAdvanceGroupCap.capApplied, false);

  console.log('PASS firstSemesterInNewProfessionalBook uses current group without cap');
}

function testCalculatesPremiumTimesRateMinusPriorPaid() {
  const result = calculate({
    accumulatedPaidInitialPremium: 100000,
    limra: 90,
    priorPaidBonusesInSemester: 5000,
  });

  assert.equal(result.status, LIFE_INITIAL_BONUS_STATUS.CALCULATED_CANDIDATE);
  assert.equal(result.calculation.candidateRate, 0.33);
  assert.equal(result.calculation.calculatedInitialBonusCandidate, 33000);
  assert.equal(result.calculation.payableCandidate, 28000);
  assert.equal(result.candidateAmount, 28000);

  console.log('PASS calculates accumulatedPaidInitialPremium * rate - priorPaidBonusesInSemester');
}

function testMissingInputsBlock() {
  const missingPrior = calculate({ priorPaidBonusesInSemester: null });
  const missingLimra = calculate({ limra: null });
  const missingPremium = calculate({ accumulatedPaidInitialPremium: null });
  const missingPolicies = calculate({ accumulatedInitialLifePoliciesPaid: null });

  assert.equal(missingPrior.status, LIFE_INITIAL_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert(missingPrior.missingInputs.includes('priorPaidBonusesInSemester'));
  assert.equal(missingLimra.status, LIFE_INITIAL_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert(missingLimra.missingInputs.includes('limra'));
  assert.equal(missingPremium.status, LIFE_INITIAL_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert(missingPremium.missingInputs.includes('accumulatedPaidInitialPremium'));
  assert.equal(missingPolicies.status, LIFE_INITIAL_BONUS_STATUS.BLOCKED_MISSING_INPUT);
  assert(missingPolicies.missingInputs.includes('accumulatedInitialLifePoliciesPaid'));

  console.log('PASS missing prior paid, LIMRA, premiums, and policies block');
}

function testPayoutTruthAlwaysFalse() {
  const results = [
    calculate(),
    calculate({ accumulatedTargetPremium: 1 }),
    calculate({ limra: null }),
  ];

  for (const result of results) {
    assert.equal(result.payoutTruth, false);
    assert.equal(result.payoutTruthRule, 'commission_statement_required');
    assert.deepEqual(result.evidenceRequirements, ['commission_statement_required']);
  }

  console.log('PASS payoutTruth is always false');
}

function testDoesNotImportPartnerOrAdvisorDevelopment() {
  const source = readFileSync(
    'compensation/new-professional/new-professional-life-initial-bonus-engine.js',
    'utf8',
  );

  assert.equal(source.includes('partner-manager'), false);
  assert.equal(source.includes('advisor-development'), false);

  console.log('PASS engine does not import Partner or Advisor Development');
}

testResolvesExactGroupThreshold();
testSelectsBetterGroupCorrectly();
testPremiumBelowAllGroupsReturnsIneligibleNoGroup();
testMonthThreeRequiresMonthlyAndSemesterPolicyGoals();
testMonthSixDoesNotRequireMonthlyPolicyGoalButRequiresSemesterGoal();
testSecondSemesterRequiresAnnualPolicyGoal();
testLimraMinimumsByTenure();
testBelowLimraMinimumReturnsIneligible();
testResolvesRateTiers();
testContestMonths13To36FloorAppliesWhenEligible();
testMonthlyAdvanceGroupCapUsesPreviousSemesterGroup();
testMissingPreviousSemesterGroupCapsToGroup13();
testFirstSemesterUsesCurrentGroupWithoutCap();
testCalculatesPremiumTimesRateMinusPriorPaid();
testMissingInputsBlock();
testPayoutTruthAlwaysFalse();
testDoesNotImportPartnerOrAdvisorDevelopment();

console.log('PASS new-professional-life-initial-bonus-engine-test');
