import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  createPartnerPaymentCadenceSchedule,
} from '../compensation/partner-manager/partner-payment-cadence-engine.js';

import {
  FatalGovernanceError,
  validatePaymentDistributionRulePack,
} from '../compensation/partner-manager/partner-payment-distribution-rule-pack-validator.js';

const rulePack = JSON.parse(readFileSync(
  new URL('../compensation/partner-manager/rule-packs/smnyl-partner-compensation-2026-payment-distribution.rule-pack.json', import.meta.url),
  'utf8'
));

function identityFrom(activeRulePack) {
  return {
    rulePackId: activeRulePack.metadata.rulePackId,
    rulePackVersion: activeRulePack.metadata.rulePackVersion,
    rulePackHash: activeRulePack.metadata.rulePackHash,
    rulePackEffectiveDate: activeRulePack.metadata.rulePackEffectiveDate,
    sourceEvidenceRefs: activeRulePack.metadata.sourceEvidenceRefs,
    governanceStatus: activeRulePack.metadata.rulePackHash === 'draft:not-sealed' ? 'draft' : 'official',
    calculatedAt: null,
  };
}

const rulePackIdentity = identityFrom(rulePack);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const period = {
  id: '2026-Q3',
  startDate: '2026-07-01',
  endDate: '2026-09-30',
};

const validation = validatePaymentDistributionRulePack(rulePack);

assert.equal(validation.valid, true);

const schedule = createPartnerPaymentCadenceSchedule({
  period,
  rulePack,
  rulePackIdentity,
  concepts: {
    produccion: {
      conceptKey: 'bono_produccion',
      status: 'calculated_candidate',
      candidateAmount: 900,
    },
    productivityMultiplier: {
      status: 'calculated_candidate',
      candidateAmount: 1000,
    },
    activity: {
      conceptKey: 'activity-bonus',
      status: 'calculated_candidate',
      candidateAmount: 300,
    },
    development: {
      conceptKey: 'development-bonus',
      status: 'calculated_candidate',
      candidateAmount: 600,
    },
    connection: {
      conceptKey: 'connection-bonus',
      status: 'calculated_candidate',
      candidateAmount: 180,
    },
    fixedSupport: {
      conceptKey: 'fixed-support',
      status: 'calculated_candidate',
      candidateAmount: 900,
    },
    partnerSignup: {
      conceptKey: 'partner-signup-bonus',
      status: 'calculated_candidate',
      candidateAmount: 1200,
    },
    productivityBase: {
      conceptKey: 'productivity-base',
      status: 'calculated_candidate',
      candidateAmount: 999999,
    },
  },
  monthlyBreakdown: {
    development: [
      { month: '2026-07', amount: 100 },
      { month: '2026-08', amount: 200 },
      { month: '2026-09', amount: 300 },
    ],
    connection: [
      { month: '2026-07', amount: 60 },
      { month: '2026-08', amount: 60 },
      { month: '2026-09', amount: 60 },
    ],
    fixedSupport: [
      { month: '2026-07', amount: 300 },
      { month: '2026-08', amount: 300 },
      { month: '2026-09', amount: 300 },
    ],
    partnerSignup: [
      { month: '2026-07', amount: 400 },
      { month: '2026-08', amount: 400 },
      { month: '2026-09', amount: 400 },
    ],
  },
});

assert.equal(schedule.payoutTruth, false);
assert.equal(schedule.rulePackId, rulePack.metadata.rulePackId);
assert.equal(schedule.rulePackVersion, rulePack.metadata.rulePackVersion);
assert.equal(schedule.rulePackHash, rulePack.metadata.rulePackHash);
assert.equal(schedule.rulePackIdentity.rulePackHash, rulePack.metadata.rulePackHash);
assert.equal(schedule.projectedPayments.every((payment) => payment.rulePackIdentity.rulePackHash === rulePack.metadata.rulePackHash), true);
assert.equal(schedule.governanceStatus, 'draft');

const byConcept = (concept) => schedule.projectedPayments.filter((payment) => payment.canonicalConceptKey === concept);

assert.deepEqual(byConcept('production').map((payment) => payment.paymentMonth), ['2026-10', '2026-11', '2026-12']);
assert.deepEqual(byConcept('production').map((payment) => payment.amount), [300, 300, 300]);

assert.deepEqual(byConcept('productivity').map((payment) => payment.amount), [333.34, 333.33, 333.33]);
assert.equal(byConcept('activity')[0].paymentMonth, '2026-09');
assert.equal(byConcept('activity')[0].amount, 300);

assert.deepEqual(byConcept('development').map((payment) => payment.amount), [100, 200, 300]);
assert.deepEqual(byConcept('connection').map((payment) => payment.amount), [60, 60, 60]);
assert.deepEqual(byConcept('fixedSupport').map((payment) => payment.amount), [300, 300, 300]);
assert.deepEqual(byConcept('partnerSignup').map((payment) => payment.amount), [400, 400, 400]);

assert.equal(schedule.excludedConcepts.length, 1);
assert.equal(schedule.excludedConcepts[0].canonicalConceptKey, 'productivityBase');
assert.equal(schedule.excludedConcepts[0].reason, 'concept_is_not_payable');
assert.equal(schedule.blockedPayments.some((payment) => payment.sourceConceptKey === 'productivityBase'), false);

assert.equal(schedule.totals.projectedAmount, 5080);

const fakeRulePack = clone(rulePack);

fakeRulePack.conceptsDictionary.winterBonus = {
  aliases: ['bono_prueba_invernal', 'winter-bonus-test'],
  payable: true,
  canonicalFinancialCategory: 'winterBonus',
  label: 'Winter Test Bonus',
};

fakeRulePack.paymentDistributionPolicies.winterBonus = {
  ruleId: 'payment-distribution.winterBonus.deferred_equal_parts.test',
  payable: true,
  distributionType: 'deferred_equal_parts',
  parts: 2,
  startAnchor: 'month_after_quarter_close',
  sourceEvidenceRef: 'TEST_ONLY',
};

const fakeSchedule = createPartnerPaymentCadenceSchedule({
  period: {
    id: '2026-Q4',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
  },
  rulePack: fakeRulePack,
  rulePackIdentity: identityFrom(fakeRulePack),
  concepts: {
    bono_prueba_invernal: {
      status: 'calculated_candidate',
      candidateAmount: 500,
    },
  },
});

assert.deepEqual(fakeSchedule.projectedPayments.map((payment) => payment.canonicalConceptKey), ['winterBonus', 'winterBonus']);
assert.deepEqual(fakeSchedule.projectedPayments.map((payment) => payment.paymentMonth), ['2027-01', '2027-02']);
assert.deepEqual(fakeSchedule.projectedPayments.map((payment) => payment.amount), [250, 250]);

const unmappedSchedule = createPartnerPaymentCadenceSchedule({
  period,
  rulePack,
  rulePackIdentity,
  concepts: {
    alienBonus: {
      status: 'calculated_candidate',
      candidateAmount: 12345,
    },
  },
});

assert.equal(unmappedSchedule.projectedPayments.length, 0);
assert.equal(unmappedSchedule.unmappedConcepts.length, 1);
assert.equal(unmappedSchedule.unmappedConcepts[0].status, 'unmapped_concept_missing_cadence_rule');
assert.equal(unmappedSchedule.totals.projectedAmount, null);

const blockedInputSchedule = createPartnerPaymentCadenceSchedule({
  period,
  rulePack,
  rulePackIdentity,
  concepts: {
    produccion: {
      status: 'blocked_by_missing_economic_input',
      candidateAmount: null,
      blockedReasons: ['missing_economic_basis'],
    },
  },
});

assert.equal(blockedInputSchedule.projectedPayments.length, 3);
assert.deepEqual(blockedInputSchedule.projectedPayments.map((payment) => payment.amount), [null, null, null]);
assert.equal(blockedInputSchedule.projectedPayments.every((payment) => payment.blockedReasons.includes('missing_economic_basis')), true);
assert.equal(blockedInputSchedule.projectedPayments.every((payment) => payment.payoutTruth === false), true);

const missingMonthlyBreakdownSchedule = createPartnerPaymentCadenceSchedule({
  period,
  rulePack,
  rulePackIdentity,
  concepts: {
    development: {
      status: 'calculated_candidate',
      candidateAmount: 1000,
    },
  },
});

assert.equal(missingMonthlyBreakdownSchedule.projectedPayments.length, 0);
assert.equal(missingMonthlyBreakdownSchedule.blockedPayments.length, 1);
assert.ok(missingMonthlyBreakdownSchedule.blockedPayments[0].blockedReasons.includes('missing_monthly_payment_breakdown'));

const invalidRulePack = clone(rulePack);
invalidRulePack.paymentDistributionPolicies.production.parts = 'tres';

assert.throws(
  () => createPartnerPaymentCadenceSchedule({
    period,
    rulePack: invalidRulePack,
    rulePackIdentity: identityFrom(invalidRulePack),
    concepts: {
      production: {
        status: 'calculated_candidate',
        candidateAmount: 900,
      },
    },
  }),
  FatalGovernanceError
);

const unsafeRulePack = clone(rulePack);
unsafeRulePack.paymentDistributionPolicies.production.formula = 'return amount * 3';

assert.throws(
  () => createPartnerPaymentCadenceSchedule({
    period,
    rulePack: unsafeRulePack,
    rulePackIdentity: identityFrom(unsafeRulePack),
    concepts: {
      production: {
        status: 'calculated_candidate',
        candidateAmount: 900,
      },
    },
  }),
  FatalGovernanceError
);

assert.throws(
  () => createPartnerPaymentCadenceSchedule({
    period,
    concepts: {
      production: {
        status: 'calculated_candidate',
        candidateAmount: 900,
      },
    },
  }),
  FatalGovernanceError
);

console.log('PASS partner-payment-cadence-engine-test');
