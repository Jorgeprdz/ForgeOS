import assert from 'node:assert/strict';

import {
  LIFECYCLE_REVENUE_BUCKETS,
  mapLifecycleToRevenue,
} from '../advisor-lifecycle/lifecycle-to-revenue-mapper.js';

import {
  PRECONTRACT_REVENUE_CLASSIFICATIONS,
} from '../advisor-lifecycle/precontract-revenue-classifier.js';

const originated = mapLifecycleToRevenue({
  classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.ORIGINATED_PRODUCTION,
  reason: 'precontract_sale_attributed_but_blocked_for_payout',
});
assert.equal(originated.revenueBucket, LIFECYCLE_REVENUE_BUCKETS.POTENTIAL);
assert.equal(originated.generated, false);
assert.equal(originated.excludedFromGeneratedTotals, true);

const held = mapLifecycleToRevenue({
  classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.HELD_COMMISSION,
  reason: 'blocked_by_pending_advisor_activation',
});
assert.equal(held.revenueBucket, LIFECYCLE_REVENUE_BUCKETS.BLOCKED);
assert.equal(held.payable, false);

const paid = mapLifecycleToRevenue({
  classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.PAYOUT_TRUTH,
  reason: 'official_evidence_confirms_payout_truth',
});
assert.equal(paid.revenueBucket, LIFECYCLE_REVENUE_BUCKETS.PAID_CONFIRMED);
assert.equal(paid.payoutTruth, true);

const forfeited = mapLifecycleToRevenue({
  classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.FORFEITED_COMMISSION,
  reason: 'forfeited_due_to_no_activation',
});
assert.equal(forfeited.revenueBucket, LIFECYCLE_REVENUE_BUCKETS.CANCELLED);
assert.equal(forfeited.generated, false);

console.log('PASS lifecycle-to-revenue-mapper-test');
