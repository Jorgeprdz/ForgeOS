import assert from 'node:assert/strict';

import {
  ECONOMIC_EVENT_STATUSES,
  createEconomicEventStatus,
  isBlockedEconomicEventStatus,
  isPayoutConfirmedStatus,
  isPotentialOnlyStatus,
  isRevenueEarnedStatus,
} from '../revenue/economic-events/economic-event-status.js';

const potential = createEconomicEventStatus({
  status: ECONOMIC_EVENT_STATUSES.POTENTIAL,
});

assert.equal(isPotentialOnlyStatus(potential.status), true);
assert.equal(isRevenueEarnedStatus(potential.status), false);
assert.equal(potential.countsAsEarnedRevenue, false);

assert.equal(isRevenueEarnedStatus(ECONOMIC_EVENT_STATUSES.PENDING_PAYMENT), false);
assert.equal(isRevenueEarnedStatus(ECONOMIC_EVENT_STATUSES.EARNED_ESTIMATED), true);
assert.equal(isPayoutConfirmedStatus(ECONOMIC_EVENT_STATUSES.EARNED_ESTIMATED), false);
assert.equal(isPayoutConfirmedStatus(ECONOMIC_EVENT_STATUSES.PAID_CONFIRMED), true);
assert.equal(isBlockedEconomicEventStatus(ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_PAYMENT), true);

console.log('PASS economic-event-status-test');
