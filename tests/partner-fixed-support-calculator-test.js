import assert from 'node:assert/strict';

import {
  FIXED_SUPPORT_AMOUNTS_BY_SEMESTER,
} from '../compensation/partner-manager/partner-fixed-support-contract.js';

import {
  calculatePartnerFixedSupportCandidate,
} from '../compensation/partner-manager/partner-fixed-support-calculator.js';

for (const [semester, amount] of Object.entries(FIXED_SUPPORT_AMOUNTS_BY_SEMESTER)) {
  const result = calculatePartnerFixedSupportCandidate({
    semesterIndex: Number(semester),
    accumulatedCommissionGoalsEvidence: true,
    taCountingPrecontractCount: 1,
    taCountingEventEvidence: true,
    supportTableEvidence: true,
    partnerLifecycleStatus: 'active',
  });
  assert.equal(result.candidateAmount, amount);
  assert.equal(result.payoutTruth, false);
  assert.equal(result.metadata.taCountingPrecontractCountsForSupportOnly, true);
}

const missingGoals = calculatePartnerFixedSupportCandidate({
  semesterIndex: 1,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.ok(missingGoals.blockedReasons.includes('missing_accumulated_commission_evidence'));

const missingTa = calculatePartnerFixedSupportCandidate({
  semesterIndex: 1,
  accumulatedCommissionGoalsEvidence: true,
  supportTableEvidence: true,
});
assert.ok(missingTa.blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence'));

const missingTable = calculatePartnerFixedSupportCandidate({
  semesterIndex: 1,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: false,
});
assert.ok(missingTable.blockedReasons.includes('blocked_by_missing_table'));
assert.equal(missingTable.candidateAmount, null);

console.log('PASS partner-fixed-support-calculator-test');
