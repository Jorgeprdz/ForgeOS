import assert from 'node:assert/strict';

import {
  PARTNER_PAYOUT_TRUTH_STATUSES,
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from '../compensation/partner-manager/partner-safe-calculation-result.js';

const unknown = createPartnerSafeCalculationResult({
  status: PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN,
});
assert.equal(unknown.candidateAmount, null);
assert.equal(unknown.unknownIsZero, false);

const calculated = createPartnerSafeCalculationResult({
  status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE,
  calculationAllowed: true,
  calculatedCandidate: true,
  candidateAmount: 100,
});
assert.equal(calculated.payoutTruth, false);
assert.equal(calculated.payoutTruthStatus, PARTNER_PAYOUT_TRUTH_STATUSES.NOT_PAYOUT_TRUTH);
assert.equal(calculated.candidateAmount, 100);

const blocked = createPartnerSafeCalculationResult({
  status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_BLOCKED,
  candidateAmount: 0,
  blockedReasons: ['blocked_test'],
});
assert.equal(blocked.candidateAmount, null);
assert.equal(blocked.blockedIsZero, false);

console.log('PASS partner-safe-calculation-result-test');
