import assert from 'node:assert/strict';

import {
  adaptPartnerSpreadsheetMonthlyFact,
  adaptPartnerSpreadsheetMonthlyFacts,
} from '../compensation/partner-manager/partner-spreadsheet-monthly-fact-adapter.js';

const valid = adaptPartnerSpreadsheetMonthlyFact({
  month: '2026-01',
  amount: 4500,
  policies: 2,
});

assert.deepEqual(valid, {
  month: '2026-01',
  initialCommissions: {
    vidaIndividual: 4500,
    gmmiIndividual: 0,
    otherRamos: 0,
  },
  paidPolicies: {
    vidaIndividual: 2,
    gmmiIndividual: 0,
  },
});
assert.equal(Object.prototype.hasOwnProperty.call(valid, 'payoutTruth'), false);

const decimalPolicies = adaptPartnerSpreadsheetMonthlyFact({
  month: '2026-03',
  amount: 1098,
  policies: '0.5',
});
assert.equal(decimalPolicies.paidPolicies.vidaIndividual, 0.5);

const missingAmount = adaptPartnerSpreadsheetMonthlyFact({
  month: '2026-02',
  policies: 3,
});
assert.equal(missingAmount.initialCommissions.vidaIndividual, null);
assert.notEqual(missingAmount.initialCommissions.vidaIndividual, 0);

const missingPolicies = adaptPartnerSpreadsheetMonthlyFact({
  month: '2026-02',
  amount: 7987,
});
assert.equal(missingPolicies.paidPolicies.vidaIndividual, null);
assert.notEqual(missingPolicies.paidPolicies.vidaIndividual, 0);

const batch = adaptPartnerSpreadsheetMonthlyFacts([
  { month: '2026-01', amount: 4500, policies: 2 },
  { month: '2026-02', amount: 7987, policies: 3 },
]);
assert.deepEqual(batch, [
  {
    month: '2026-01',
    initialCommissions: {
      vidaIndividual: 4500,
      gmmiIndividual: 0,
      otherRamos: 0,
    },
    paidPolicies: {
      vidaIndividual: 2,
      gmmiIndividual: 0,
    },
  },
  {
    month: '2026-02',
    initialCommissions: {
      vidaIndividual: 7987,
      gmmiIndividual: 0,
      otherRamos: 0,
    },
    paidPolicies: {
      vidaIndividual: 3,
      gmmiIndividual: 0,
    },
  },
]);

console.log('PASS partner-spreadsheet-monthly-fact-adapter-test');
