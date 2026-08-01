import test from 'node:test';
import assert from 'node:assert/strict';

import { PAYMENT_EVIDENCE_STATES } from '../policy-operations/evidence/payment-evidence-packet.js';
import {
  CARTERA_030B_PAYMENT_MATCH_OUTCOMES,
  reconcileConfirmedPaymentEvent,
} from '../policy-operations/payments/cartera-030b-payment-obligation-reconciliation.js';

const obligation = {
  obligationReference: 'PAYMENT_OBLIGATION:001',
  advisorId: 'advisor-030b',
  policyReference: 'POLICY:030B',
  policyVersionReference: 'POLICY_VERSION:030B:1',
  expectedDate: '2026-08-15',
  expectedAmount: 1000,
  currency: 'MXN',
  status: 'SCHEDULED',
  actualAmount: null,
  matchedPaymentEventReferences: [],
  stateVersion: 1,
};

const payment = {
  paymentEventId: 'PAYMENT_EVENT:001',
  advisorId: 'advisor-030b',
  policyReference: 'POLICY:030B',
  paymentAmount: 1000,
  currency: 'MXN',
  paymentDate: '2026-08-15',
  confirmationState: PAYMENT_EVIDENCE_STATES.CONFIRMED,
  evidenceRefs: ['EVIDENCE:PAYMENT:001'],
};

test('unconfirmed evidence cannot satisfy an obligation', () => {
  const result = reconcileConfirmedPaymentEvent({
    obligations: [obligation],
    paymentEvent: { ...payment, confirmationState: PAYMENT_EVIDENCE_STATES.PENDING_CONFIRMATION },
  });
  assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.NO_MATCH);
  assert.equal(result.reason, 'PAYMENT_EVENT_NOT_CONFIRMED');
});

test('exact confirmed payment fully satisfies one exact obligation', () => {
  const result = reconcileConfirmedPaymentEvent({ obligations: [obligation], paymentEvent: payment });
  assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.MATCHED);
  assert.equal(result.transition.toStatus, 'CONFIRMED');
  assert.equal(result.transition.actualAmount, 1000);
});

test('confirmed amount below known expected amount produces PARTIAL', () => {
  const result = reconcileConfirmedPaymentEvent({
    obligations: [obligation],
    paymentEvent: { ...payment, paymentAmount: 400 },
  });
  assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.PARTIAL_MATCH);
  assert.equal(result.transition.toStatus, 'PARTIAL');
});

test('confirmed amount above a single known obligation remains conflict', () => {
  const result = reconcileConfirmedPaymentEvent({
    obligations: [obligation],
    paymentEvent: { ...payment, paymentAmount: 1400 },
  });
  assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.CONFLICT);
  assert.equal(result.reason, 'PAYMENT_AMOUNT_EXCEEDS_SINGLE_OBLIGATION');
});

test('multiple exact candidates remain ambiguous without allocation authority', () => {
  const result = reconcileConfirmedPaymentEvent({
    obligations: [
      obligation,
      { ...obligation, obligationReference: 'PAYMENT_OBLIGATION:002' },
    ],
    paymentEvent: payment,
  });
  assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.AMBIGUOUS);
  assert.equal(result.transition, null);
});

test('currency mismatch remains conflict', () => {
  const result = reconcileConfirmedPaymentEvent({
    obligations: [obligation],
    paymentEvent: { ...payment, currency: 'USD' },
  });
  assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.CONFLICT);
  assert.equal(result.reason, 'CURRENCY_MISMATCH');
});

test('same PaymentEvent replay is idempotent', () => {
  const result = reconcileConfirmedPaymentEvent({
    obligations: [{
      ...obligation,
      matchedPaymentEventReferences: ['PAYMENT_EVENT:001'],
    }],
    paymentEvent: payment,
  });
  assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.IDEMPOTENT_REPLAY);
  assert.equal(result.transition, null);
});

test('cross-advisor or different-policy payment cannot match', () => {
  for (const changed of [
    { advisorId: 'advisor-other' },
    { policyReference: 'POLICY:OTHER' },
  ]) {
    const result = reconcileConfirmedPaymentEvent({
      obligations: [obligation],
      paymentEvent: { ...payment, ...changed },
    });
    assert.equal(result.outcome, CARTERA_030B_PAYMENT_MATCH_OUTCOMES.NO_MATCH);
  }
});
