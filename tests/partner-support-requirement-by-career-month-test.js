import assert from 'node:assert/strict';

import {
  PARTNER_SUPPORT_REQUIREMENT_STATUSES,
  evaluatePartnerSupportRequirementByCareerMonth,
} from '../compensation/partner-manager/partner-support-requirement-by-career-month.js';

const unknownMonth = evaluatePartnerSupportRequirementByCareerMonth({
  requiredQualifiedAdvisorCount: 5,
  qualifiedAdvisorCount: 5,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 100000,
  accumulatedCommissionEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.equal(unknownMonth.allowed, false);
assert.ok(unknownMonth.blockedReasons.includes(PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_UNKNOWN_PARTNER_CAREER_MONTH));

const month25ThreeAdvisors = evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth: 25,
  requiredQualifiedAdvisorCount: 5,
  qualifiedAdvisorCount: 3,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 100000,
  accumulatedCommissionEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.equal(month25ThreeAdvisors.allowed, false);
assert.equal(month25ThreeAdvisors.careerBand, 'month_25_plus');
assert.ok(month25ThreeAdvisors.blockedReasons.includes(PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_INSUFFICIENT_QUALIFIED_ADVISORS_FOR_PARTNER_MONTH));

const month25FiveAdvisors = evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth: 25,
  requiredQualifiedAdvisorCount: 5,
  qualifiedAdvisorCount: 5,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 100000,
  accumulatedCommissionEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  sourceRuleConfidence: 'fixture',
});
assert.equal(month25FiveAdvisors.allowed, true);
assert.equal(month25FiveAdvisors.supportRequirementStatus, PARTNER_SUPPORT_REQUIREMENT_STATUSES.REQUIREMENT_MET);
assert.equal(month25FiveAdvisors.requiredQualifiedAdvisorCount, 5);
assert.equal(month25FiveAdvisors.actualQualifiedAdvisorCount, 5);

const missingGoal = evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth: 25,
  requiredQualifiedAdvisorCount: 5,
  qualifiedAdvisorCount: 5,
  accumulatedCommissions: 100000,
  accumulatedCommissionEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.ok(missingGoal.blockedReasons.includes(PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_ACCUMULATED_COMMISSION_GOAL));

const missingCommissionEvidence = evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth: 25,
  requiredQualifiedAdvisorCount: 5,
  qualifiedAdvisorCount: 5,
  accumulatedCommissionGoal: 100000,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.ok(missingCommissionEvidence.blockedReasons.includes(PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_ACCUMULATED_COMMISSION_EVIDENCE));

const missingTaEvidence = evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth: 25,
  requiredQualifiedAdvisorCount: 5,
  qualifiedAdvisorCount: 5,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 100000,
  accumulatedCommissionEvidence: true,
  taCountingPrecontractCount: 1,
  supportTableEvidence: true,
});
assert.ok(missingTaEvidence.blockedReasons.includes(PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE));

const missingTable = evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth: 25,
  requiredQualifiedAdvisorCount: 5,
  qualifiedAdvisorCount: 5,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 100000,
  accumulatedCommissionEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
});
assert.ok(missingTable.blockedReasons.includes(PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_SUPPORT_TABLE));

const configurationDriven = evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth: 25,
  requiredQualifiedAdvisorCount: 4,
  qualifiedAdvisorCount: 4,
  accumulatedCommissions: 150000,
  accumulatedCommissionGoal: 150000,
  accumulatedCommissionEvidence: true,
  taCountingPrecontractCount: 2,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  sourceNotes: ['fixture configuration, not official global truth'],
});
assert.equal(configurationDriven.allowed, true);
assert.ok(configurationDriven.sourceNotes.some((note) => note.includes('fixture configuration')));
assert.equal(configurationDriven.payoutTruth, false);
assert.equal(configurationDriven.createsPartnerEconomicGain, false);
assert.equal(configurationDriven.releasesHeldCommission, false);
assert.equal(configurationDriven.unknownIsZero, false);
assert.equal(configurationDriven.blockedIsZero, false);
assert.equal(configurationDriven.metadata.taCountingPrecontractCountsForSupportOnly, true);

console.log('PASS partner-support-requirement-by-career-month-test');
