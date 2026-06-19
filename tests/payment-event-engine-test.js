import assert from 'node:assert/strict';

import {
  COMMISSION_TYPES,
  createConfirmedCommissionPayoutData,
} from '../policy-operations/evidence/commission-statement-evidence-packet.js';

import {
  PAYMENT_SOURCE_TYPES,
  createConfirmedPaymentOperationalData,
} from '../policy-operations/evidence/payment-evidence-packet.js';

import {
  createEarnedEstimatedCommissionEvent,
  createPaidConfirmedCommissionEvent,
  createPaymentEvent,
} from '../policy-operations/payment-event-engine.js';

import { ECONOMIC_EVENT_STATUSES } from '../revenue/economic-events/economic-event-status.js';

const missingAmount = createPaymentEvent(createConfirmedPaymentOperationalData({
  carrierId: 'SMNYL',
}));

assert.equal(missingAmount.error, true);
assert.equal(missingAmount.economicEventStatus.status, ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_PAYMENT);

const paymentEvent = createPaymentEvent(createConfirmedPaymentOperationalData({
  advisorId: 'ADV_1',
  carrierId: 'SMNYL',
  policyId: 'POLICY_1',
  policyNumber: 'POL-1',
  paymentAmount: 1000,
  currency: 'MXN',
  paymentDate: '2026-06-01',
  paymentFrequency: 'monthly',
  paymentSource: PAYMENT_SOURCE_TYPES.PAYMENT_PROOF,
  evidenceRefs: ['PAY_EVID_1'],
}));

assert.equal(paymentEvent.paymentAmount, 1000);
assert.equal(paymentEvent.economicEventStatus.status, ECONOMIC_EVENT_STATUSES.PAYMENT_CONFIRMED);
assert.equal(paymentEvent.economicEventStatus.countsAsPayoutTruth, false);

const earned = createEarnedEstimatedCommissionEvent({
  paymentEvent,
  estimatedCommissionAmount: 100,
});

assert.equal(earned.economicEventStatus.status, ECONOMIC_EVENT_STATUSES.EARNED_ESTIMATED);
assert.equal(earned.economicEventStatus.countsAsPayoutTruth, false);

const missingStatement = createPaidConfirmedCommissionEvent({
  payoutData: null,
});

assert.equal(missingStatement.error, true);

const payoutData = createConfirmedCommissionPayoutData({
  payoutEvidenceId: 'STMT_1',
  advisorId: 'ADV_1',
  carrierId: 'SMNYL',
  policyNumber: 'POL-1',
  paymentEventId: paymentEvent.paymentEventId,
  commissionAmount: 90,
  currency: 'MXN',
  payoutDate: '2026-06-15',
  commissionType: COMMISSION_TYPES.INITIAL,
  evidenceRefs: ['STMT_1'],
});

const paid = createPaidConfirmedCommissionEvent({
  payoutData,
  earnedEstimate: earned,
});

assert.equal(paid.economicEventStatus.status, ECONOMIC_EVENT_STATUSES.PAID_CONFIRMED);
assert.equal(paid.warnings.length, 1);

const reversal = createPaidConfirmedCommissionEvent({
  payoutData: createConfirmedCommissionPayoutData({
    payoutEvidenceId: 'STMT_2',
    carrierId: 'SMNYL',
    commissionAmount: -50,
    commissionType: COMMISSION_TYPES.REVERSAL,
  }),
});

assert.equal(reversal.economicEventStatus.status, ECONOMIC_EVENT_STATUSES.REVERSED);

console.log('PASS payment-event-engine-test');
