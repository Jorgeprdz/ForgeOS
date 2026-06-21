import assert from 'node:assert/strict';

import {
  PRECONTRACT_ECONOMIC_STATUSES,
  isPayablePrecontractStatus,
  isPrecontractEconomicStatus,
  normalizePrecontractEconomicStatus,
  requiresActivationBeforePayout,
} from '../advisor-lifecycle/precontract-economic-status.js';

assert.equal(isPrecontractEconomicStatus(PRECONTRACT_ECONOMIC_STATUSES.ACTIVITY_LOGGED), true);
assert.equal(requiresActivationBeforePayout(PRECONTRACT_ECONOMIC_STATUSES.ACTIVITY_LOGGED), true);
assert.equal(isPayablePrecontractStatus(PRECONTRACT_ECONOMIC_STATUSES.COMMISSION_ON_HOLD), false);
assert.equal(isPayablePrecontractStatus(PRECONTRACT_ECONOMIC_STATUSES.COMMISSION_RELEASED), true);
assert.equal(normalizePrecontractEconomicStatus('nope'), PRECONTRACT_ECONOMIC_STATUSES.UNKNOWN);

console.log('PASS precontract-economic-status-test');
