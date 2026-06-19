import assert from 'node:assert/strict';

import {
  PAYMENT_EVIDENCE_STATES,
  PAYMENT_SOURCE_TYPES,
  createConfirmedPaymentOperationalData,
  createPaymentEvidencePacket,
  isConfirmedPaymentEvidencePacket,
} from '../policy-operations/evidence/payment-evidence-packet.js';

const packet = createPaymentEvidencePacket({
  documentRef: 'receipt.jpg',
  extractedFields: {
    paymentAmount: { value: 5000, confidence: 0.9 },
  },
});

assert.equal(isConfirmedPaymentEvidencePacket(packet), false);

const confirmed = createPaymentEvidencePacket({
  documentRef: 'manual',
  confirmationState: PAYMENT_EVIDENCE_STATES.CONFIRMED,
});

assert.equal(isConfirmedPaymentEvidencePacket(confirmed), true);

const payment = createConfirmedPaymentOperationalData({
  paymentEvidenceId: 'PAY_EVID_001',
  carrierId: 'SMNYL',
  paymentAmount: 1200,
  paymentSource: PAYMENT_SOURCE_TYPES.MANUAL_CAPTURE,
});

assert.equal(payment.paymentAmount, 1200);
assert.equal(payment.paymentSource, PAYMENT_SOURCE_TYPES.MANUAL_CAPTURE);

console.log('PASS payment-evidence-packet-test');
