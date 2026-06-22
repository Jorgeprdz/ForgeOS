import assert from 'node:assert/strict';

import {
  assessPartnerProductivityMultiplier,
} from '../compensation/partner-manager/partner-productivity-multiplier-contract.js';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const base = { calculationAllowed: true };
const rulePack = loadPartner2026RulePack();
const blockedSupportGate = {
  allowed: false,
  blockedReasons: ['blocked_by_insufficient_qualified_advisors_for_partner_month'],
  missingInputs: [],
};

assert.equal(assessPartnerProductivityMultiplier({ productivityBaseAssessment: base, qualifiedAdvisorCount: 3, trainingWinnerInQuarter: true }).percentageCandidate, 0.3);
assert.equal(assessPartnerProductivityMultiplier({ productivityBaseAssessment: base, qualifiedAdvisorCount: 4, trainingWinnerInQuarter: true }).percentageCandidate, 0.4);
assert.equal(assessPartnerProductivityMultiplier({ productivityBaseAssessment: base, qualifiedAdvisorCount: 5, trainingWinnerInQuarter: true }).percentageCandidate, 0.5);

const tenWithTa = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 1,
  trainingWinnerInQuarter: true,
});
assert.equal(tenWithTa.percentageCandidate, 1);
assert.equal(tenWithTa.payoutTruth, false);
assert.equal(tenWithTa.metadata.createsPartnerEconomicGain, false);
assert.equal(tenWithTa.metadata.releasesHeldCommission, false);
assert.ok(tenWithTa.sourceNotes.some((note) => note.includes('not confirmed payout')));

const below = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 2,
  trainingWinnerInQuarter: true,
});
assert.equal(below.calculationAllowed, false);
assert.ok(below.blockedReasons.includes('blocked_by_missing_multiplier_rate'));

const missingMinimum = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 4,
  partnerCareerMonth: 7,
  trainingWinnerInQuarter: true,
});
assert.equal(missingMinimum.calculationAllowed, false);
assert.ok(missingMinimum.blockedReasons.includes('blocked_by_missing_multiplier_minimum_requirement'));
assert.equal(missingMinimum.percentageCandidate, null);

const insufficientForMonth = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 4,
  partnerCareerMonth: 7,
  minimumQualifiedAdvisorRequirement: 5,
  trainingWinnerInQuarter: true,
});
assert.equal(insufficientForMonth.calculationAllowed, false);
assert.ok(insufficientForMonth.blockedReasons.includes('blocked_by_insufficient_qualified_advisors_for_partner_career_month'));

const fourWithMinimumThree = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 4,
  partnerCareerMonth: 7,
  minimumQualifiedAdvisorRequirement: 3,
  trainingWinnerInQuarter: true,
});
assert.equal(fourWithMinimumThree.calculationAllowed, true);
assert.equal(fourWithMinimumThree.percentageCandidate, 0.4);

const withTrainingWinner = assessPartnerProductivityMultiplier({
  rulePack,
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 10,
  trainingWinnerInQuarter: true,
});
assert.equal(withTrainingWinner.percentageCandidate, 1);
assert.equal(withTrainingWinner.metadata.payFactor, 1);

const withoutTrainingWinner = assessPartnerProductivityMultiplier({
  rulePack,
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 9,
  trainingWinnerInQuarter: false,
});
assert.equal(withoutTrainingWinner.calculationAllowed, true);
assert.equal(withoutTrainingWinner.percentageCandidate, 0.9);
assert.equal(withoutTrainingWinner.metadata.payFactor, 0.8);
assert.ok(withoutTrainingWinner.warnings.includes('reduced_by_missing_training_winner_in_quarter'));

const unknownTrainingWinner = assessPartnerProductivityMultiplier({
  rulePack,
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 9,
});
assert.equal(unknownTrainingWinner.calculationAllowed, false);
assert.ok(unknownTrainingWinner.blockedReasons.includes('blocked_by_missing_training_winner_evidence_policy'));

const missingBase = assessPartnerProductivityMultiplier({
  qualifiedAdvisorCount: 3,
  trainingWinnerInQuarter: true,
});
assert.ok(missingBase.blockedReasons.includes('missing_base_result'));

const monthGateBlocked = assessPartnerProductivityMultiplier({
  rulePack,
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 3,
  trainingWinnerInQuarter: true,
  supportRequirementGateResult: blockedSupportGate,
});
assert.equal(monthGateBlocked.calculationAllowed, true);
assert.equal(monthGateBlocked.percentageCandidate, 0.3);
assert.ok(monthGateBlocked.warnings.includes('support_requirement_gate_ignored_for_multiplier_without_explicit_official_config'));

const missingStrictGate = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 3,
  trainingWinnerInQuarter: true,
  enforceSupportRequirementGate: true,
});
assert.equal(missingStrictGate.calculationAllowed, false);
assert.ok(missingStrictGate.blockedReasons.includes('blocked_by_missing_support_requirement_gate'));

console.log('PASS partner-productivity-multiplier-contract-test');
