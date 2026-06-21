import assert from 'node:assert/strict';

import {
  PARTNER_PAYOUT_TRUTH_RESULT_STATUSES,
  createPartnerPayoutTruthResult,
} from '../compensation/partner-manager/partner-payout-truth-result.js';

const paid = createPartnerPayoutTruthResult({
  status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAID_CONFIRMED,
  officialAmount: 1100,
  candidateAmount: 1000,
});
assert.equal(paid.payoutTruth, true);
assert.equal(paid.officialAmount, 1100);
assert.equal(paid.candidateAmount, 1000);
assert.equal(paid.varianceAmount, 100);
assert.equal(paid.candidateAmountIsOfficialAmount, false);

const mismatch = createPartnerPayoutTruthResult({
  status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_MISMATCH,
  officialAmount: 900,
  candidateAmount: 1000,
});
assert.equal(mismatch.payoutTruth, false);
assert.equal(mismatch.officialAmount, 900);
assert.equal(mismatch.varianceAmount, -100);

const hidden = createPartnerPayoutTruthResult({
  status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_HIDDEN_BY_SCOPE,
});
assert.equal(hidden.hiddenByScopeIsZero, false);
assert.equal(hidden.payoutTruth, false);

const unknown = createPartnerPayoutTruthResult({
  status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN,
});
assert.equal(unknown.unknownIsZero, false);

console.log('PASS partner-payout-truth-result-test');
