import assert from 'node:assert/strict';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

import {
  evaluatePartnerSupportRequirementGate,
} from '../compensation/partner-manager/partner-support-requirement-gate.js';

const rulePack = loadPartner2026RulePack();

const allowed = evaluatePartnerSupportRequirementGate({
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
assert.equal(allowed.allowed, true);
assert.equal(allowed.semesterIndex, 5);
assert.equal(allowed.candidateSupportAmount, 21500);
assert.equal(allowed.payoutTruth, false);
assert.equal(allowed.createsPartnerEconomicGain, false);
assert.equal(allowed.taCountingPrecontractCountsForSupportOnly, true);

const unknownMonth = evaluatePartnerSupportRequirementGate({
  rulePack,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(unknownMonth.allowed, false);
assert.ok(unknownMonth.blockedReasons.includes('invalid_semester_index'));

const missingTable = evaluatePartnerSupportRequirementGate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.ok(missingTable.blockedReasons.includes('blocked_by_missing_support_table'));

const missingGoal = evaluatePartnerSupportRequirementGate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.ok(missingGoal.blockedReasons.includes('blocked_by_missing_accumulated_commission_goal'));

const missingEconomicEvidence = evaluatePartnerSupportRequirementGate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionGoal: 90000,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.ok(missingEconomicEvidence.blockedReasons.includes('blocked_by_missing_accumulated_commission_evidence'));

const missingTaEvidence = evaluatePartnerSupportRequirementGate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.ok(missingTaEvidence.blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence'));

console.log('PASS partner-support-requirement-gate-test');
