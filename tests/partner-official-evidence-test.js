import assert from 'node:assert/strict';

import {
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES,
  PARTNER_OFFICIAL_EVIDENCE_STATUSES,
} from '../compensation/partner-manager/partner-official-evidence-status.js';

import {
  createPartnerOfficialEvidence,
} from '../compensation/partner-manager/partner-official-evidence.js';

const official = createPartnerOfficialEvidence({
  sourceType: PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OFFICIAL_COMPENSATION_STATEMENT,
  evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED,
});
assert.equal(official.canAspireToPayoutTruth, true);
assert.equal(official.payoutTruth, false);

for (const sourceType of [
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OCR_EXTRACTION,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.PDF_EXTRACTION,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.AI_EXTRACTION,
]) {
  const aid = createPartnerOfficialEvidence({
    sourceType,
    evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.EXTRACTED,
  });
  assert.equal(aid.isExtractionAid, true);
  assert.equal(aid.canAspireToPayoutTruth, false);
  assert.equal(aid.payoutTruth, false);
}

const manual = createPartnerOfficialEvidence({
  sourceType: PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.MANUAL_ENTRY,
  evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.HUMAN_CONFIRMED,
});
assert.equal(manual.canAspireToPayoutTruth, false);
assert.ok(manual.warnings.includes('Manual entry is not payout truth.'));

const unknown = createPartnerOfficialEvidence();
assert.equal(unknown.canAspireToPayoutTruth, false);
assert.equal(unknown.unknownIsZero, false);

console.log('PASS partner-official-evidence-test');
