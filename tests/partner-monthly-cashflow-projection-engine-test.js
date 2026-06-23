import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  createPartnerPaymentCadenceSchedule,
} from '../compensation/partner-manager/partner-payment-cadence-engine.js';

import {
  MissingGovernanceMetadataError,
  createPartnerMonthlyCashflowProjection,
} from '../compensation/partner-manager/partner-monthly-cashflow-projection-engine.js';

const rulePack = JSON.parse(readFileSync(
  new URL('../compensation/partner-manager/rule-packs/smnyl-partner-compensation-2026-payment-distribution.rule-pack.json', import.meta.url),
  'utf8'
));

const rulePackIdentity = {
  rulePackId: rulePack.metadata.rulePackId,
  rulePackVersion: rulePack.metadata.rulePackVersion,
  rulePackHash: rulePack.metadata.rulePackHash,
  rulePackEffectiveDate: rulePack.metadata.rulePackEffectiveDate,
};

const periodMonths = ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'];

assert.throws(
  () => createPartnerMonthlyCashflowProjection({
    periodMonths,
    cadenceSchedule: { projectedPayments: [] },
    rulePackIdentity: {
      rulePackId: 'x',
      rulePackVersion: '1',
    },
    canonicalFinancialCategories: ['production'],
  }),
  MissingGovernanceMetadataError
);

const blindCategoriesProjection = createPartnerMonthlyCashflowProjection({
  periodMonths: ['2026-01', '2026-02'],
  cadenceSchedule: {
    projectedPayments: [],
    blockedPayments: [],
    excludedConcepts: [],
    unmappedConcepts: [],
  },
  rulePackIdentity,
  canonicalFinancialCategories: ['bono_alfa', 'bono_omega'],
});

assert.deepEqual(Object.keys(blindCategoriesProjection.monthlyCashflow[0].categories), ['bono_alfa', 'bono_omega']);
assert.equal(blindCategoriesProjection.monthlyCashflow[0].categories.bono_alfa, null);
assert.equal(blindCategoriesProjection.monthlyCashflow[0].monthlyTotalCandidate, null);
assert.equal(blindCategoriesProjection.monthlyCashflow[0].status, 'empty_projection');

const nullSafeProjection = createPartnerMonthlyCashflowProjection({
  periodMonths: ['2026-01'],
  cadenceSchedule: {
    projectedPayments: [
      { paymentMonth: '2026-01', canonicalConceptKey: 'bono_alfa', amount: 1000, payoutTruth: true },
    ],
    blockedPayments: [],
    excludedConcepts: [],
    unmappedConcepts: [],
  },
  rulePackIdentity,
  canonicalFinancialCategories: ['bono_alfa', 'bono_beta', 'bono_gamma'],
});

assert.equal(nullSafeProjection.monthlyCashflow[0].categories.bono_alfa, 1000);
assert.equal(nullSafeProjection.monthlyCashflow[0].categories.bono_beta, null);
assert.equal(nullSafeProjection.monthlyCashflow[0].monthlyTotalCandidate, 1000);
assert.equal(nullSafeProjection.monthlyCashflow[0].status, 'partial_projection');
assert.equal(nullSafeProjection.monthlyCashflow[0].payoutTruth, false);
assert.equal(nullSafeProjection.payoutTruth, false);

const unmappedProjection = createPartnerMonthlyCashflowProjection({
  periodMonths: ['2026-01'],
  cadenceSchedule: {
    projectedPayments: [
      { paymentMonth: '2026-01', canonicalConceptKey: 'bono_marciano', amount: 777 },
    ],
    blockedPayments: [],
    excludedConcepts: [],
    unmappedConcepts: [],
  },
  rulePackIdentity,
  canonicalFinancialCategories: ['bono_alfa'],
});

assert.equal(unmappedProjection.monthlyCashflow[0].monthlyTotalCandidate, null);
assert.equal(unmappedProjection.monthlyCashflow[0].unmappedConcepts.length, 1);
assert.equal(unmappedProjection.rootUnmappedConcepts.length, 1);
assert.equal(unmappedProjection.status, 'partial_projection');

const blockedProjection = createPartnerMonthlyCashflowProjection({
  periodMonths: ['2026-01'],
  cadenceSchedule: {
    projectedPayments: [],
    blockedPayments: [
      {
        paymentMonth: '2026-01',
        canonicalConceptKey: 'bono_alfa',
        sourceConceptKey: 'bono_alfa',
        blockedReasons: ['blocked_by_test'],
      },
    ],
    excludedConcepts: [
      {
        sourceConceptKey: 'productivity-base',
        reason: 'concept_is_not_payable',
      },
    ],
    unmappedConcepts: [],
  },
  rulePackIdentity,
  canonicalFinancialCategories: ['bono_alfa'],
});

assert.equal(blockedProjection.monthlyCashflow[0].monthlyTotalCandidate, null);
assert.equal(blockedProjection.monthlyCashflow[0].blockedPayments.length, 1);
assert.equal(blockedProjection.rootBlockedPayments.length, 1);
assert.equal(blockedProjection.rootExcludedConcepts.length, 1);
assert.equal(blockedProjection.status, 'partial_projection');

const cadence = createPartnerPaymentCadenceSchedule({
  period: {
    id: '2026-Q4',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
  },
  rulePack,
  concepts: {
    produccion: {
      conceptKey: 'bono_produccion',
      status: 'calculated_candidate',
      candidateAmount: 11340,
    },
    activity: {
      conceptKey: 'activity-bonus',
      status: 'calculated_candidate',
      candidateAmount: 55050,
    },
    development: {
      conceptKey: 'development-bonus',
      status: 'calculated_candidate',
      candidateAmount: 66000,
    },
    productivityBase: {
      conceptKey: 'productivity-base',
      status: 'calculated_candidate',
      candidateAmount: 105420,
    },
  },
  monthlyBreakdown: {
    development: [
      { month: '2026-10', amount: 18000 },
      { month: '2026-11', amount: 22000 },
      { month: '2026-12', amount: 26000 },
    ],
  },
});

const projection = createPartnerMonthlyCashflowProjection({
  periodMonths,
  cadenceSchedule: cadence,
  canonicalFinancialCategories: rulePack.canonicalFinancialCategories,
});

const byMonth = new Map(projection.monthlyCashflow.map((month) => [month.paymentMonth, month]));

assert.equal(projection.rulePackId, rulePack.metadata.rulePackId);
assert.equal(projection.rulePackVersion, rulePack.metadata.rulePackVersion);
assert.equal(projection.rulePackHash, rulePack.metadata.rulePackHash);

assert.equal(byMonth.get('2026-10').categories.development, 18000);
assert.equal(byMonth.get('2026-10').monthlyTotalCandidate, 18000);

assert.equal(byMonth.get('2026-11').categories.development, 22000);
assert.equal(byMonth.get('2026-11').monthlyTotalCandidate, 22000);

assert.equal(byMonth.get('2026-12').categories.activity, 55050);
assert.equal(byMonth.get('2026-12').categories.development, 26000);
assert.equal(byMonth.get('2026-12').monthlyTotalCandidate, 81050);

assert.equal(byMonth.get('2027-01').categories.production, 3780);
assert.equal(byMonth.get('2027-01').monthlyTotalCandidate, 3780);

assert.equal(byMonth.get('2027-02').categories.production, 3780);
assert.equal(byMonth.get('2027-03').categories.production, 3780);

assert.equal(projection.totalProjectedCandidate, 132390);
assert.equal(projection.rootExcludedConcepts.length, 1);
assert.equal(projection.rootExcludedConcepts[0].canonicalConceptKey, 'productivityBase');
assert.equal(projection.monthlyCashflow.every((month) => month.payoutTruth === false), true);

const emptyProjection = createPartnerMonthlyCashflowProjection({
  periodMonths: ['2026-01'],
  cadenceSchedule: {
    projectedPayments: [],
    blockedPayments: [],
    excludedConcepts: [],
    unmappedConcepts: [],
    rulePackId: rulePackIdentity.rulePackId,
    rulePackVersion: rulePackIdentity.rulePackVersion,
    rulePackHash: rulePackIdentity.rulePackHash,
  },
  canonicalFinancialCategories: ['bono_alfa'],
});

assert.equal(emptyProjection.status, 'empty_projection');
assert.equal(emptyProjection.totalProjectedCandidate, null);
assert.equal(emptyProjection.monthlyCashflow[0].monthlyTotalCandidate, null);
assert.equal(emptyProjection.monthlyCashflow[0].categories.bono_alfa, null);

console.log('PASS partner-monthly-cashflow-projection-engine-test');
