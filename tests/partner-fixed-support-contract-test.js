import assert from 'node:assert/strict';

import {
  FIXED_SUPPORT_AMOUNTS_BY_SEMESTER,
  assessPartnerFixedSupport,
} from '../compensation/partner-manager/partner-fixed-support-contract.js';

for (const [semester, amount] of Object.entries(FIXED_SUPPORT_AMOUNTS_BY_SEMESTER)) {
  const assessment = assessPartnerFixedSupport({
    semesterIndex: Number(semester),
    accumulatedCommissionGoalsEvidence: true,
    taCountingPrecontractCount: 1,
    taCountingEventEvidence: true,
    supportTableEvidence: true,
  });
  assert.equal(assessment.amountCandidate, amount);
  assert.equal(assessment.payoutTruth, false);
  assert.equal(assessment.metadata.createsPartnerEconomicGain, false);
  assert.equal(assessment.metadata.releasesHeldCommission, false);
}

const missingGoals = assessPartnerFixedSupport({
  semesterIndex: 1,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.ok(missingGoals.blockedReasons.includes('missing_accumulated_commission_evidence'));
assert.equal(missingGoals.amountCandidate, null);

const missingTa = assessPartnerFixedSupport({
  semesterIndex: 1,
  accumulatedCommissionGoalsEvidence: true,
  supportTableEvidence: true,
  taCountingPrecontractCount: 1,
});
assert.ok(missingTa.blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence'));

const precontractCountsButNotPaidBonus = assessPartnerFixedSupport({
  semesterIndex: 1,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.equal(precontractCountsButNotPaidBonus.payoutTruth, false);
assert.equal(precontractCountsButNotPaidBonus.metadata.taCountingPrecontractCount, 1);
assert.ok(precontractCountsButNotPaidBonus.warnings.some((warning) => warning.includes('not a paid bonus')));

console.log('PASS partner-fixed-support-contract-test');
