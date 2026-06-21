import assert from 'node:assert/strict';

import {
  BONUS_PAYMENT_EVIDENCE_TYPES,
  BONUS_PAYOUT_TRUTH_STATES,
  createBonusPayoutTruthState,
} from '../compensation/contracts/bonus-payout-truth-state.js';

const withoutEvidence = createBonusPayoutTruthState({
  state: BONUS_PAYOUT_TRUTH_STATES.PAYMENT_CONFIRMED,
  amount: 1000,
  sourceKind: 'carrier_calculated_bonus',
});

assert.equal(withoutEvidence.state, BONUS_PAYOUT_TRUTH_STATES.PAYMENT_BLOCKED);
assert.equal(withoutEvidence.paidConfirmed, false);
assert.equal(withoutEvidence.reason, 'payment_confirmed_requires_payment_evidence');

const confirmed = createBonusPayoutTruthState({
  state: BONUS_PAYOUT_TRUTH_STATES.PAYMENT_CONFIRMED,
  amount: 1000,
  evidenceType: BONUS_PAYMENT_EVIDENCE_TYPES.PAYMENT_DEPOSIT,
  evidenceRefs: ['deposit-1'],
});

assert.equal(confirmed.state, BONUS_PAYOUT_TRUTH_STATES.PAYMENT_CONFIRMED);
assert.equal(confirmed.paidConfirmed, true);

const unknown = createBonusPayoutTruthState({
  state: BONUS_PAYOUT_TRUTH_STATES.PAYMENT_UNKNOWN,
});

assert.equal(unknown.unknownIsZero, false);
assert.equal(unknown.carrierCalculatedIsPaymentConfirmed, false);
assert.equal(unknown.calculatedBonusIsPaymentConfirmed, false);

console.log('PASS bonus-payout-truth-state-test');
