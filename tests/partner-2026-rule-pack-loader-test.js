import assert from 'node:assert/strict';

import {
  getActivityBonusRate,
  getConnectionBonusAmount,
  getDevelopmentBonusAmount,
  getFixedSupportAmountBySemester,
  getPartner2026Concept,
  getProductionBonusRate,
  getProductivityBaseRate,
  getProductivityMultiplierRate,
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const rulePack = loadPartner2026RulePack();

assert.equal(rulePack.rulePackId, 'smnyl_partner_compensation_2026');
assert.equal(rulePack.source.sourceTruth, true);
assert.equal(rulePack.source.sourceType, 'official_compensation_booklet');

assert.equal(getPartner2026Concept(rulePack, 'activity-bonus').frequency, 'monthly');

const baseRate = getProductivityBaseRate(rulePack, {
  averageMonthlyInitialCommissions: 10000,
  partnerClass: 'CC',
});
assert.equal(baseRate.rate, 0.25);

const missingClass = getProductivityBaseRate(rulePack, {
  averageMonthlyInitialCommissions: 10000,
});
assert.ok(missingClass.blockedReasons.includes('blocked_by_missing_partner_class'));

assert.equal(getProductivityMultiplierRate(rulePack, { qualifiedAdvisorCount: 3 }).multiplierRate, 0.3);
assert.equal(getProductivityMultiplierRate(rulePack, { qualifiedAdvisorCount: 5 }).multiplierRate, 0.5);
assert.equal(getProductivityMultiplierRate(rulePack, { qualifiedAdvisorCount: 10, taCountingEventEvidence: true }).multiplierRate, 1);

const multiplierWithoutTa = getProductivityMultiplierRate(rulePack, { qualifiedAdvisorCount: 10 });
assert.equal(multiplierWithoutTa.multiplierRate, 1);
assert.equal(multiplierWithoutTa.effectiveTotalCandidateRate, 0.8);
assert.ok(multiplierWithoutTa.warnings.includes('100_percent_multiplier_without_TA_counting_event_uses_80_percent_total_candidate_rule'));

assert.equal(getProductionBonusRate(rulePack, { organizationType: 'nueva organizacion' }).rate, 0.135);
assert.equal(getProductionBonusRate(rulePack, { organizationType: 'consolidados' }).rate, 0.07);
assert.equal(getActivityBonusRate(rulePack, { validLifeGmmPolicyCount: 5 }).rate, 0.25);
assert.equal(getFixedSupportAmountBySemester(rulePack, { partnerCareerMonth: 25 }).semesterIndex, 5);
assert.equal(getFixedSupportAmountBySemester(rulePack, { partnerCareerMonth: 25 }).amount, 21500);
assert.equal(getConnectionBonusAmount(rulePack, { advisorMonth: 2, validPolicyCount: 5 }).amount, 15000);
assert.equal(getDevelopmentBonusAmount(rulePack, { advisorMonth: 7, validPolicyCount: 5 }).amount, 15000);

console.log('PASS partner-2026-rule-pack-loader-test');
