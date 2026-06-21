import assert from 'node:assert/strict';

import {
  BONUS_CARRIER_CALCULATED_STATES,
  createBonusCarrierCalculatedState,
} from '../compensation/contracts/bonus-carrier-calculated-state.js';

const carrierCalculated = createBonusCarrierCalculatedState({
  state: BONUS_CARRIER_CALCULATED_STATES.CARRIER_CALCULATED,
  amount: 1000,
  carrier: 'SMNYL',
  sourceDocument: 'SMNYL bonus calculated view',
});

assert.equal(carrierCalculated.confirmsCompanyCalculatedBonus, true);
assert.equal(carrierCalculated.paidConfirmed, false);
assert.equal(carrierCalculated.createsPayoutTruth, false);

const discrepancy = createBonusCarrierCalculatedState({
  state: BONUS_CARRIER_CALCULATED_STATES.CARRIER_DISCREPANCY,
  amount: 900,
  comparedForgeAmount: 1000,
  discrepancyReason: 'carrier_amount_differs',
});

assert.equal(discrepancy.preservesDiscrepancy, true);

console.log('PASS bonus-carrier-calculated-state-test');
