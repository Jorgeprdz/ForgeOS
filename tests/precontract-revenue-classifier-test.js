import assert from 'node:assert/strict';

import {
  PRECONTRACT_REVENUE_CLASSIFICATIONS,
  classifyPrecontractRevenue,
} from '../advisor-lifecycle/precontract-revenue-classifier.js';

import {
  ADVISOR_LIFECYCLE_STATUSES,
} from '../advisor-lifecycle/advisor-lifecycle-status.js';

const sale = classifyPrecontractRevenue({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT,
  policySubmitted: true,
});
assert.equal(sale.classification, PRECONTRACT_REVENUE_CLASSIFICATIONS.ORIGINATED_PRODUCTION);
assert.equal(sale.generated, false);
assert.equal(sale.payoutTruth, false);

const held = classifyPrecontractRevenue({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT,
  paymentApplied: true,
});
assert.equal(held.classification, PRECONTRACT_REVENUE_CLASSIFICATIONS.HELD_COMMISSION);
assert.equal(held.reason, 'blocked_by_pending_advisor_activation');
assert.equal(held.payable, false);

const estimate = classifyPrecontractRevenue({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT,
  commissionEstimated: true,
});
assert.equal(estimate.classification, PRECONTRACT_REVENUE_CLASSIFICATIONS.ESTIMATED_COMMISSION);
assert.equal(estimate.payoutTruth, false);

const releasedMissingPayout = classifyPrecontractRevenue({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  activationConfirmed: true,
  releaseConfirmed: true,
});
assert.equal(releasedMissingPayout.classification, PRECONTRACT_REVENUE_CLASSIFICATIONS.RELEASED_COMMISSION);
assert.equal(releasedMissingPayout.payoutTruth, false);

const paid = classifyPrecontractRevenue({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  activationConfirmed: true,
  releaseConfirmed: true,
  commissionStatementConfirmed: true,
  paymentEvidenceConfirmed: true,
});
assert.equal(paid.classification, PRECONTRACT_REVENUE_CLASSIFICATIONS.PAYOUT_TRUTH);
assert.equal(paid.payoutTruth, true);

const forfeited = classifyPrecontractRevenue({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT,
  forfeitureConfirmed: true,
});
assert.equal(forfeited.classification, PRECONTRACT_REVENUE_CLASSIFICATIONS.FORFEITED_COMMISSION);
assert.equal(forfeited.generated, false);

const unknown = classifyPrecontractRevenue({ lifecycleStatus: '???' });
assert.equal(unknown.reason, 'blocked_by_unknown_lifecycle_status');

console.log('PASS precontract-revenue-classifier-test');
