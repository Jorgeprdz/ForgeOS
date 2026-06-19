import assert from 'node:assert/strict';

import {
  createExtractedPolicyField,
  createPolicyEvidencePacket,
} from '../policy-operations/evidence/policy-evidence-packet.js';

import { createPaymentEvidencePacket } from '../policy-operations/evidence/payment-evidence-packet.js';

import {
  createCommissionStatementEvidencePacket,
} from '../policy-operations/evidence/commission-statement-evidence-packet.js';

import {
  confirmCommissionStatementExtraction,
  confirmPaymentExtraction,
  confirmPolicyExtraction,
  rejectEvidenceExtraction,
  requiresAdvisorConfirmation,
} from '../policy-operations/policy-advisor-confirmation-gate.js';

const policyPacket = createPolicyEvidencePacket({
  evidenceId: 'POL_EVID_1',
  extractedFields: {
    carrierId: createExtractedPolicyField({ fieldName: 'carrierId', value: 'SMNYL', confidence: 0.95 }),
    productName: createExtractedPolicyField({ fieldName: 'productName', value: 'Star Temporal', confidence: 0.6 }),
    annualPremium: createExtractedPolicyField({ fieldName: 'annualPremium', value: 120000, confidence: 0.95 }),
    currency: createExtractedPolicyField({ fieldName: 'currency', value: 'MXN', confidence: 0.95 }),
    paymentFrequency: createExtractedPolicyField({ fieldName: 'paymentFrequency', value: 'monthly', confidence: 0.95 }),
  },
});

assert.equal(requiresAdvisorConfirmation({
  evidenceType: 'policy',
  extractedFields: policyPacket.extractedFields,
}), true);

const confirmedPolicy = confirmPolicyExtraction({
  packet: policyPacket,
  advisorId: 'ADV_1',
  edits: {
    productName: 'Star Temporal 20',
  },
});

assert.equal(confirmedPolicy.productName, 'Star Temporal 20');
assert.equal(confirmedPolicy.evidenceRefs[0], 'POL_EVID_1');

const rejected = rejectEvidenceExtraction({ packet: policyPacket });
assert.equal(rejected.canRouteToRevenue, false);

const rejectedConfirm = confirmPolicyExtraction({ packet: rejected });
assert.equal(rejectedConfirm.error, true);

const paymentPacket = createPaymentEvidencePacket({
  evidenceId: 'PAY_EVID_1',
  extractedFields: {
    paymentAmount: { value: 1000, confidence: 0.95 },
    paymentDate: { value: '2026-06-01', confidence: 0.95 },
    currency: { value: 'MXN', confidence: 0.95 },
    policyNumber: { value: 'POL-1', confidence: 0.95 },
    carrierId: { value: 'SMNYL', confidence: 0.95 },
  },
});

assert.equal(requiresAdvisorConfirmation({
  evidenceType: 'payment',
  extractedFields: paymentPacket.extractedFields,
}), false);

const confirmedPayment = confirmPaymentExtraction({
  packet: paymentPacket,
  advisorId: 'ADV_1',
});

assert.equal(confirmedPayment.paymentAmount, 1000);

const statementPacket = createCommissionStatementEvidencePacket({
  evidenceId: 'STMT_1',
  carrierId: 'SMNYL',
  extractedRows: [{
    commissionAmount: { value: 100, confidence: 0.9 },
    payoutDate: { value: '2026-06-15', confidence: 0.9 },
    policyNumber: { value: 'POL-1', confidence: 0.9 },
    carrierId: { value: 'SMNYL', confidence: 0.9 },
  }],
});

const confirmedStatement = confirmCommissionStatementExtraction({
  packet: statementPacket,
  advisorId: 'ADV_1',
});

assert.equal(confirmedStatement.commissionAmount, 100);
assert.equal(confirmedStatement.payoutEvidenceId, 'STMT_1');

console.log('PASS policy-advisor-confirmation-gate-test');
