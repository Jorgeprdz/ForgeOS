import assert from 'node:assert/strict';

import {
  COMMISSION_STATEMENT_EVIDENCE_STATES,
  COMMISSION_TYPES,
  createCommissionStatementEvidencePacket,
  createConfirmedCommissionPayoutData,
  isConfirmedCommissionStatementEvidencePacket,
} from '../policy-operations/evidence/commission-statement-evidence-packet.js';

const packet = createCommissionStatementEvidencePacket({
  documentRef: 'statement.pdf',
  carrierId: 'SMNYL',
});

assert.equal(isConfirmedCommissionStatementEvidencePacket(packet), false);

const confirmedPacket = createCommissionStatementEvidencePacket({
  documentRef: 'statement.pdf',
  carrierId: 'SMNYL',
  confirmationState: COMMISSION_STATEMENT_EVIDENCE_STATES.CONFIRMED,
});

assert.equal(isConfirmedCommissionStatementEvidencePacket(confirmedPacket), true);

const payout = createConfirmedCommissionPayoutData({
  payoutEvidenceId: 'STMT_001',
  carrierId: 'SMNYL',
  policyNumber: 'POL-1',
  commissionAmount: 6000,
  commissionType: COMMISSION_TYPES.INITIAL,
});

assert.equal(payout.commissionAmount, 6000);
assert.equal(payout.commissionType, COMMISSION_TYPES.INITIAL);

console.log('PASS commission-statement-evidence-packet-test');
