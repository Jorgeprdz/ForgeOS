import assert from 'node:assert/strict';

import {
  createPartnerPaymentCadenceSchedule,
  addMonthsToMonthKey,
} from '../compensation/partner-manager/partner-payment-cadence-engine.js';

assert.equal(addMonthsToMonthKey('2026-09', 1), '2026-10');
assert.equal(addMonthsToMonthKey('2026-12', 1), '2027-01');

const schedule = createPartnerPaymentCadenceSchedule({
  period: {
    id: '2026-Q3',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
  },
  concepts: {
    productivityBase: {
      conceptKey: 'productivity-base',
      status: 'calculated_candidate',
      candidateAmount: 999999,
    },
    production: {
      conceptKey: 'production-bonus',
      status: 'calculated_candidate',
      candidateAmount: 900,
    },
    productivityMultiplier: {
      conceptKey: 'productivity-multiplier',
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
      metadata: {
        parts: [
          { month: '2026-07', candidateAmount: 100 },
          { month: '2026-08', result: { candidateAmount: 200 } },
          { periodMonth: '2026-09', candidateAmount: 300 },
        ],
      },
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
  },
  monthlyBreakdown: {
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
  },
});

assert.equal(schedule.payoutTruth, false);
assert.equal(schedule.quarterEndMonth, '2026-09');

const projected = schedule.projectedPayments;
const byConcept = (canonical) => projected.filter((payment) => payment.canonicalConceptKey === canonical);

assert.deepEqual(byConcept('production').map((payment) => payment.paymentMonth), ['2026-10', '2026-11', '2026-12']);
assert.deepEqual(byConcept('production').map((payment) => payment.amount), [300, 300, 300]);

assert.deepEqual(byConcept('productivity').map((payment) => payment.paymentMonth), ['2026-10', '2026-11', '2026-12']);
assert.deepEqual(byConcept('productivity').map((payment) => payment.amount), [333.34, 333.33, 333.33]);

assert.deepEqual(byConcept('activity').map((payment) => payment.paymentMonth), ['2026-09']);
assert.deepEqual(byConcept('activity').map((payment) => payment.amount), [300]);

assert.deepEqual(byConcept('development').map((payment) => payment.paymentMonth), ['2026-07', '2026-08', '2026-09']);
assert.deepEqual(byConcept('development').map((payment) => payment.amount), [100, 200, 300]);

assert.deepEqual(byConcept('connection').map((payment) => payment.paymentMonth), ['2026-07', '2026-08', '2026-09']);
assert.deepEqual(byConcept('connection').map((payment) => payment.amount), [60, 60, 60]);

assert.deepEqual(byConcept('fixedSupport').map((payment) => payment.paymentMonth), ['2026-07', '2026-08', '2026-09']);
assert.deepEqual(byConcept('fixedSupport').map((payment) => payment.amount), [300, 300, 300]);

assert.equal(projected.some((payment) => payment.sourceConceptKey === 'productivity-base'), false);
assert.ok(schedule.excludedConcepts.some((concept) => (
  concept.sourceConceptKey === 'productivity-base'
  && concept.reason === 'concept_is_not_payable'
)));

assert.equal(schedule.blockedPayments.some((payment) => payment.sourceConceptKey === 'productivity-base'), false);
assert.equal(schedule.totals.projectedAmount, 3880);
assert.equal(schedule.totals.excludedConceptCount, 1);
assert.equal(projected.every((payment) => payment.payoutTruth === false), true);
assert.equal(projected.every((payment) => payment.status === 'projected_candidate'), true);

const missingMonthlyBreakdown = createPartnerPaymentCadenceSchedule({
  period: { endDate: '2026-09-30' },
  concepts: {
    development: {
      conceptKey: 'development-bonus',
      status: 'calculated_candidate',
      candidateAmount: 600,
    },
  },
});

assert.equal(missingMonthlyBreakdown.projectedPayments.length, 0);
assert.ok(missingMonthlyBreakdown.blockedPayments[0].blockedReasons.includes('missing_monthly_payment_breakdown'));
assert.equal(missingMonthlyBreakdown.totals.projectedAmount, 0);

const zeroFixedSupportWithoutBreakdown = createPartnerPaymentCadenceSchedule({
  period: { endDate: '2026-09-30' },
  concepts: {
    fixedSupport: {
      conceptKey: 'fixed-support',
      status: 'calculated_candidate',
      candidateAmount: 0,
    },
  },
});

assert.equal(zeroFixedSupportWithoutBreakdown.projectedPayments.length, 0);
assert.equal(zeroFixedSupportWithoutBreakdown.blockedPayments.length, 0);
assert.equal(zeroFixedSupportWithoutBreakdown.totals.projectedAmount, 0);

console.log('PASS partner-payment-cadence-engine-test');
