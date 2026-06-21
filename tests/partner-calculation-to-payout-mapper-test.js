import assert from 'node:assert/strict';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from '../compensation/partner-manager/partner-safe-calculation-result.js';

import {
  mapPartnerCalculationToPayoutState,
} from '../compensation/partner-manager/partner-calculation-to-payout-mapper.js';

import {
  PARTNER_PAYOUT_TRUTH_RESULT_STATUSES,
} from '../compensation/partner-manager/partner-payout-truth-result.js';

const candidate = mapPartnerCalculationToPayoutState(createPartnerSafeCalculationResult({
  conceptKey: 'productivity-base',
  status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE,
  calculationAllowed: true,
  calculatedCandidate: true,
  candidateAmount: 1000,
}));
assert.equal(candidate.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_CANDIDATE_ONLY);

const blocked = mapPartnerCalculationToPayoutState(createPartnerSafeCalculationResult({
  status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_BLOCKED,
  blockedReasons: ['missing_official_rule'],
}));
assert.equal(blocked.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED);

const example = mapPartnerCalculationToPayoutState(createPartnerSafeCalculationResult({
  status: PARTNER_SAFE_CALCULATION_STATUSES.EXAMPLE_ONLY,
}));
assert.equal(example.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_NOT_APPLICABLE);

const unknown = mapPartnerCalculationToPayoutState(createPartnerSafeCalculationResult({
  status: PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN,
}));
assert.equal(unknown.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN);

const notModeled = mapPartnerCalculationToPayoutState(createPartnerSafeCalculationResult({
  status: PARTNER_SAFE_CALCULATION_STATUSES.NOT_MODELED,
}));
assert.equal(notModeled.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN);
assert.equal(notModeled.candidateAmount, null);

const hidden = mapPartnerCalculationToPayoutState({
  conceptKey: 'fixed-support',
  status: 'hidden_by_scope',
});
assert.equal(hidden.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_HIDDEN_BY_SCOPE);
assert.equal(hidden.hiddenByScopeIsZero, false);

console.log('PASS partner-calculation-to-payout-mapper-test');
