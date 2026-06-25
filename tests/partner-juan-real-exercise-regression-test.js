import assert from 'node:assert/strict';

import {
  calculatePartnerQuarterlyBonusCandidate,
} from '../compensation/partner-manager/partner-quarterly-bonus-calculator.js';

const fact = (month, amount, policies) => ({
  month,
  initialCommissions: {
    vidaIndividual: amount,
    gmmiIndividual: 0,
    otherRamos: 0,
  },
  paidPolicies: {
    vidaIndividual: policies,
    gmmiIndividual: 0,
  },
});

function assertMoney(actual, expected, message) {
  assert.ok(
    Math.abs(Number(actual) - Number(expected)) < 0.000001,
    `${message}: expected ${expected}, received ${actual}`,
  );
}

const result = calculatePartnerQuarterlyBonusCandidate({
  partner: {
    partnerId: 'Juan',
    partnerCareerMonth: 7,
    partnerConnectedYear: 2026,
    organizationType: 'nueva_organizacion',
    unitLIMRA: 80,
    unitIGC: 90,
    active: true,
  },
  period: {
    type: 'quarter',
    quarter: 'Q1',
    year: 2026,
    months: ['2026-01', '2026-02', '2026-03'],
  },
  requestedConcepts: ['production', 'productivityMultiplier'],
  evidence: {
    paidAppliedEconomicEvidence: true,
    partnerOwnershipSourceTruthRequired: true,
    trainingWinnerInQuarter: false,
  },
  advisors: [
    {
      name: 'roberto',
      advisorId: 'roberto',
      advisorMonth: 9,
      activeAtQuarterClose: true,
      paidAppliedPolicyEvidence: true,
      LIMRA: 80,
      IGC: 90,
      monthlyFacts: [
        fact('2026-01', 4500, 2),
        fact('2026-02', 7987, 3),
        fact('2026-03', 3678, 2),
        fact('2026-04', 9865, 3),
      ],
    },
    {
      name: 'pamela',
      advisorId: 'pamela',
      advisorMonth: 13,
      activeAtQuarterClose: true,
      paidAppliedPolicyEvidence: true,
      LIMRA: 80,
      IGC: 90,
      monthlyFacts: [
        fact('2026-01', 18000, 4),
        fact('2026-02', 3230, 2),
        fact('2026-03', 11788, 1),
        fact('2026-04', 6784, 3.5),
      ],
    },
    {
      name: 'rodrigo',
      advisorId: 'rodrigo',
      advisorMonth: 5,
      activeAtQuarterClose: true,
      paidAppliedPolicyEvidence: true,
      LIMRA: 80,
      IGC: 90,
      monthlyFacts: [
        fact('2026-01', 600, 1),
        fact('2026-02', 17898, 5),
        fact('2026-03', 4579, 4),
        fact('2026-04', 9874, 2),
      ],
    },
    {
      name: 'yesi',
      advisorId: 'yesi',
      advisorMonth: 3,
      activeAtQuarterClose: true,
      paidAppliedPolicyEvidence: true,
      LIMRA: 80,
      IGC: 90,
      monthlyFacts: [
        fact('2026-01', 5550, 2),
        fact('2026-02', 4578, 3),
        fact('2026-03', 1098, 0.5),
        fact('2026-04', 1123, 0.5),
      ],
    },
    {
      name: 'fer',
      advisorId: 'fer',
      advisorMonth: 2,
      activeAtQuarterClose: true,
      paidAppliedPolicyEvidence: true,
      LIMRA: 80,
      IGC: 90,
      relationshipAttributions: {
        connection: {
          status: 'confirmed',
          relationshipType: 'connection',
          advisorId: 'fer',
          connectionOwnerType: 'advisor',
          connectionOwnerId: 'pamela',
          rdaStatus: 'confirmed',
          rdaOwnerId: 'pamela',
          payoutTruth: false,
        },
        development: {
          status: 'confirmed',
          relationshipType: 'development',
          advisorId: 'fer',
          developmentOwnerType: 'partner',
          developmentOwnerId: 'Juan',
          developerShare: 0.5,
          payoutTruth: false,
        },
      },
      monthlyFacts: [
        fact('2026-01', 3678, 3),
        fact('2026-02', 3678, 1),
        fact('2026-03', 10873, 3),
        fact('2026-04', 9875, 2),
      ],
    },
  ],
});

assert.equal(result.payoutTruth, false);

const normalizedByAdvisor = new Map(
  result.qualificationSummary.normalizedAdvisors.map((advisor) => [advisor.advisorId, advisor]),
);

assert.equal(normalizedByAdvisor.get('roberto').quarterInitialCommissions, 16165);
assert.equal(normalizedByAdvisor.get('pamela').quarterInitialCommissions, 33018);
assert.equal(normalizedByAdvisor.get('rodrigo').quarterInitialCommissions, 23077);
assert.equal(normalizedByAdvisor.get('yesi').quarterInitialCommissions, 11226);
assert.equal(normalizedByAdvisor.get('fer').quarterInitialCommissions, 18229);

for (const advisor of normalizedByAdvisor.values()) {
  assert.deepEqual(
    advisor.metadata.normalizedMonthlyFacts.map((monthlyFact) => monthlyFact.month),
    ['2026-01', '2026-02', '2026-03'],
  );
}

assert.equal(result.qualificationSummary.qualifiedAdvisorCount, 1);
const pamelaQualification = result.qualificationSummary.advisors.find((advisor) => advisor.advisorId === 'pamela');
assert.equal(pamelaQualification.qualified, true);

assert.equal(result.concepts.production.inputBasis, 68697);
assertMoney(result.concepts.production.candidateAmount, 9274.095, 'production candidate');

assert.equal(result.concepts.productivityBase.metadata.parts.length, 1);
assert.equal(result.concepts.productivityBase.metadata.parts[0].inputBasis, 33018);
assertMoney(result.concepts.productivityBase.candidateAmount, 9905.4, 'productivity base candidate');

assert.equal(result.concepts.productivityMultiplier.candidateAmount, null);
assert.notEqual(result.concepts.productivityMultiplier.candidateAmount, 0);
assert.ok(result.concepts.productivityMultiplier.blockedReasons.includes(
  'blocked_by_insufficient_qualified_advisors_for_partner_career_month',
));
assert.ok(result.warnings.includes('productivity_multiplier_blocked_using_productivity_base'));
assert.ok(result.requestedConceptsWarnings.includes('productivity_multiplier_blocked_using_productivity_base'));

assert.deepEqual(result.requestedConceptsApplied, ['production', 'productivityMultiplier']);
assertMoney(result.subtotalRequestedConceptsCandidate, 19179.495, 'requested subtotal');
assertMoney(result.requestedPaymentSchedule.totals.projectedAmount, 19179.5, 'requested payment schedule total');
assert.equal(result.requestedPaymentSchedule.payoutTruth, false);
assert.equal(
  result.requestedPaymentSchedule.projectedPayments.every((payment) => payment.payoutTruth === false),
  true,
);

const requestedPaymentsByMonth = new Map();
for (const payment of result.requestedPaymentSchedule.projectedPayments) {
  requestedPaymentsByMonth.set(
    payment.month,
    Number((requestedPaymentsByMonth.get(payment.month) || 0) + payment.amount),
  );
}

assertMoney(requestedPaymentsByMonth.get('2026-04'), 6393.17, 'April payout');
assertMoney(requestedPaymentsByMonth.get('2026-05'), 6393.17, 'May payout');
assertMoney(requestedPaymentsByMonth.get('2026-06'), 6393.16, 'June payout');

assert.equal(
  result.requestedPaymentSchedule.blockedPayments.length,
  0,
);

console.log('PASS partner Juan real exercise regression');
