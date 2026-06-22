import assert from 'node:assert/strict';

import {
  FIXED_SUPPORT_AMOUNTS_BY_SEMESTER,
  assessPartnerFixedSupport,
} from '../compensation/partner-manager/partner-fixed-support-contract.js';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const rulePack = loadPartner2026RulePack();

const blockedSupportGate = {
  allowed: false,
  blockedReasons: ['blocked_by_insufficient_qualified_advisors_for_partner_month'],
  missingInputs: [],
};

for (const [semester, amount] of Object.entries(FIXED_SUPPORT_AMOUNTS_BY_SEMESTER)) {
  const assessment = assessPartnerFixedSupport({
    semesterIndex: Number(semester),
    accumulatedCommissions: 100000,
    accumulatedCommissionGoal: 90000,
    accumulatedCommissionGoalsEvidence: true,
    taCountingPrecontractCount: 1,
    taCountingEventEvidence: true,
    supportTableEvidence: true,
    partnerLifecycleStatus: 'partner_active',
  });
  assert.equal(assessment.amountCandidate, amount);
  assert.equal(assessment.payoutTruth, false);
  assert.equal(assessment.metadata.createsPartnerEconomicGain, false);
  assert.equal(assessment.metadata.releasesHeldCommission, false);
}

const missingGoals = assessPartnerFixedSupport({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.ok(missingGoals.blockedReasons.includes('blocked_by_missing_accumulated_commission_evidence'));
assert.equal(missingGoals.amountCandidate, null);

const officialJsonMonth25 = assessPartnerFixedSupport({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(officialJsonMonth25.metadata.semesterIndex, 5);
assert.equal(officialJsonMonth25.amountCandidate, 21500);

const missingOfficialGoal = assessPartnerFixedSupport({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.ok(missingOfficialGoal.blockedReasons.includes('blocked_by_missing_accumulated_commission_goal'));

const missingTa = assessPartnerFixedSupport({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  supportTableEvidence: true,
  taCountingPrecontractCount: 1,
});
assert.ok(missingTa.blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence'));

const precontractCountsButNotPaidBonus = assessPartnerFixedSupport({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(precontractCountsButNotPaidBonus.payoutTruth, false);
assert.equal(precontractCountsButNotPaidBonus.metadata.taCountingPrecontractCount, 1);
assert.ok(precontractCountsButNotPaidBonus.warnings.some((warning) => warning.includes('not a paid bonus')));

const monthGateBlocked = assessPartnerFixedSupport({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  supportRequirementGateResult: blockedSupportGate,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.equal(monthGateBlocked.calculationAllowed, false);
assert.equal(monthGateBlocked.amountCandidate, null);
assert.ok(monthGateBlocked.blockedReasons.includes('blocked_by_insufficient_qualified_advisors_for_partner_month'));

console.log('PASS partner-fixed-support-contract-test');
