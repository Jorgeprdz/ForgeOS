import assert from 'node:assert/strict';

import {
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES,
  PARTNER_OFFICIAL_EVIDENCE_STATUSES,
} from '../compensation/partner-manager/partner-official-evidence-status.js';

import {
  PARTNER_STATEMENT_MATCH_STATUSES,
  createPartnerCompensationStatementMatch,
} from '../compensation/partner-manager/partner-compensation-statement-match.js';

const matched = createPartnerCompensationStatementMatch({
  matchStatus: PARTNER_STATEMENT_MATCH_STATUSES.MATCHED,
  officialStatementId: 'statement-1',
  officialStatementLineId: 'line-1',
  officialAmount: 1200,
  sourceType: PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OFFICIAL_COMPENSATION_STATEMENT,
  evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED,
});
assert.equal(matched.canSupportPayoutTruth, true);

const missingLine = createPartnerCompensationStatementMatch({
  matchStatus: PARTNER_STATEMENT_MATCH_STATUSES.MATCHED,
  officialStatementId: 'statement-1',
  officialAmount: 1200,
  evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED,
});
assert.equal(missingLine.matchStatus, PARTNER_STATEMENT_MATCH_STATUSES.MISSING_STATEMENT_LINE);
assert.equal(missingLine.canSupportPayoutTruth, false);

const highConfidenceOnly = createPartnerCompensationStatementMatch({
  matchStatus: PARTNER_STATEMENT_MATCH_STATUSES.MATCHED,
  officialStatementId: 'statement-1',
  officialStatementLineId: 'line-1',
  officialAmount: 1200,
  evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.HUMAN_CONFIRMED,
  matchConfidence: 'high',
});
assert.equal(highConfidenceOnly.highConfidenceIsPayoutTruth, false);
assert.equal(highConfidenceOnly.canSupportPayoutTruth, false);

const zeroWithoutReason = createPartnerCompensationStatementMatch({
  matchStatus: PARTNER_STATEMENT_MATCH_STATUSES.MATCHED,
  officialStatementId: 'statement-1',
  officialStatementLineId: 'line-1',
  officialAmount: 0,
  evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED,
});
assert.equal(zeroWithoutReason.canSupportPayoutTruth, false);

const zeroWithReason = createPartnerCompensationStatementMatch({
  matchStatus: PARTNER_STATEMENT_MATCH_STATUSES.MATCHED,
  officialStatementId: 'statement-1',
  officialStatementLineId: 'line-1',
  officialAmount: 0,
  evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED,
  explicitZeroReason: 'official statement line says zero',
});
assert.equal(zeroWithReason.canSupportPayoutTruth, true);

console.log('PASS partner-compensation-statement-match-test');
