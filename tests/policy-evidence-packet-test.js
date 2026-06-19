import assert from 'node:assert/strict';

import {
  EXTRACTED_POLICY_FIELD_STATES,
  POLICY_EVIDENCE_STATES,
  createExtractedPolicyField,
  createPolicyEvidencePacket,
  isConfirmedPolicyEvidencePacket,
} from '../policy-operations/evidence/policy-evidence-packet.js';

import { isRevenueEarnedStatus } from '../revenue/economic-events/economic-event-status.js';

const field = createExtractedPolicyField({
  fieldName: 'productName',
  value: 'Star Temporal',
  confidence: 0.7,
});

assert.equal(field.state, EXTRACTED_POLICY_FIELD_STATES.EXTRACTED);

const packet = createPolicyEvidencePacket({
  documentRef: 'policy.pdf',
  extractedFields: { productName: field },
});

assert.equal(packet.confirmationState, POLICY_EVIDENCE_STATES.PENDING_CONFIRMATION);
assert.equal(isConfirmedPolicyEvidencePacket(packet), false);
assert.equal(isRevenueEarnedStatus('potential'), false);

const confirmed = createPolicyEvidencePacket({
  documentRef: 'policy.pdf',
  confirmationState: POLICY_EVIDENCE_STATES.CONFIRMED,
});

assert.equal(isConfirmedPolicyEvidencePacket(confirmed), true);

console.log('PASS policy-evidence-packet-test');
