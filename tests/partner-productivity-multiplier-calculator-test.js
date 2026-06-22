import assert from 'node:assert/strict';

import {
  calculatePartnerProductivityMultiplierCandidate,
} from '../compensation/partner-manager/partner-productivity-multiplier-calculator.js';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const base = {
  calculationAllowed: true,
  candidateAmount: 100000,
};
const rulePack = loadPartner2026RulePack();
const blockedSupportGate = {
  allowed: false,
  blockedReasons: ['blocked_by_insufficient_qualified_advisors_for_partner_month'],
  missingInputs: [],
};

assert.equal(calculatePartnerProductivityMultiplierCandidate({ productivityBaseCalculation: base, qualifiedAdvisorCount: 3, trainingWinnerInQuarter: true }).candidatePercentage, 0.3);
assert.equal(calculatePartnerProductivityMultiplierCandidate({ productivityBaseCalculation: base, qualifiedAdvisorCount: 4, trainingWinnerInQuarter: true }).candidatePercentage, 0.4);
assert.equal(calculatePartnerProductivityMultiplierCandidate({ productivityBaseCalculation: base, qualifiedAdvisorCount: 5, trainingWinnerInQuarter: true }).candidatePercentage, 0.5);

const ten = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 10,
  trainingWinnerInQuarter: true,
});
assert.equal(ten.candidatePercentage, 1);
assert.equal(ten.metadata.multiplierAmountCandidate, 100000);
assert.equal(ten.metadata.calculatedProductivityBonusCandidate, 200000);
assert.equal(ten.metadata.payFactor, 1);
assert.equal(ten.metadata.payableProductivityBonusCandidate, 200000);
assert.equal(ten.candidateAmount, 200000);
assert.equal(ten.payoutTruth, false);
assert.equal(ten.metadata.createsPartnerEconomicGain, false);
assert.equal(ten.metadata.releasesHeldCommission, false);

const below = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 2,
  trainingWinnerInQuarter: true,
});
assert.ok(below.blockedReasons.includes('blocked_by_missing_multiplier_rate'));
assert.equal(below.candidateAmount, null);

const missingMinimum = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 4,
  partnerCareerMonth: 7,
  trainingWinnerInQuarter: true,
});
assert.equal(missingMinimum.calculationAllowed, false);
assert.equal(missingMinimum.candidateAmount, null);
assert.ok(missingMinimum.blockedReasons.includes('blocked_by_missing_multiplier_minimum_requirement'));

const insufficientForMonth = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 4,
  partnerCareerMonth: 7,
  minimumQualifiedAdvisorRequirement: 5,
  trainingWinnerInQuarter: true,
});
assert.equal(insufficientForMonth.calculationAllowed, false);
assert.equal(insufficientForMonth.candidateAmount, null);
assert.ok(insufficientForMonth.blockedReasons.includes('blocked_by_insufficient_qualified_advisors_for_partner_career_month'));

const fourWithMinimumThree = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCandidate: 100000,
  qualifiedAdvisorCount: 4,
  partnerCareerMonth: 7,
  minimumQualifiedAdvisorRequirement: 3,
  trainingWinnerInQuarter: true,
});
assert.equal(fourWithMinimumThree.candidatePercentage, 0.4);
assert.equal(fourWithMinimumThree.candidateAmount, 140000);

const fiveWithMinimumFive = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 5,
  partnerCareerMonth: 7,
  multiplierMinimumRequirement: 5,
  trainingWinnerInQuarter: true,
});
assert.equal(fiveWithMinimumFive.candidatePercentage, 0.5);
assert.equal(fiveWithMinimumFive.candidateAmount, 150000);

const tenWithMinimumFive = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 10,
  partnerCareerMonth: 7,
  minimumQualifiedAdvisorRequirement: 5,
  trainingWinnerInQuarter: true,
});
assert.equal(tenWithMinimumFive.candidatePercentage, 1);
assert.equal(tenWithMinimumFive.candidateAmount, 200000);
assert.equal(tenWithMinimumFive.payoutTruth, false);

const nineWithTraining = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 9,
  minimumQualifiedAdvisorRequirement: 5,
  trainingWinnerInQuarter: true,
});
assert.equal(nineWithTraining.metadata.calculatedProductivityBonusCandidate, 190000);
assert.equal(nineWithTraining.metadata.payFactor, 1);
assert.equal(nineWithTraining.metadata.payableProductivityBonusCandidate, 190000);
assert.equal(nineWithTraining.candidateAmount, 190000);

const nineWithoutTraining = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 9,
  minimumQualifiedAdvisorRequirement: 5,
  trainingWinnerInQuarter: false,
});
assert.equal(nineWithoutTraining.metadata.calculatedProductivityBonusCandidate, 190000);
assert.equal(nineWithoutTraining.metadata.payFactor, 0.8);
assert.equal(nineWithoutTraining.metadata.payableProductivityBonusCandidate, 152000);
assert.equal(nineWithoutTraining.candidateAmount, 152000);
assert.ok(nineWithoutTraining.warnings.includes('reduced_by_missing_training_winner_in_quarter'));

const tenWithoutTraining = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 10,
  minimumQualifiedAdvisorRequirement: 5,
  trainingWinnerInQuarter: false,
});
assert.equal(tenWithoutTraining.metadata.calculatedProductivityBonusCandidate, 200000);
assert.equal(tenWithoutTraining.metadata.payFactor, 0.8);
assert.equal(tenWithoutTraining.metadata.payableProductivityBonusCandidate, 160000);
assert.equal(tenWithoutTraining.candidateAmount, 160000);

const eightWithoutTraining = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 8,
  minimumQualifiedAdvisorRequirement: 5,
  trainingWinnerInQuarter: false,
});
assert.equal(eightWithoutTraining.metadata.calculatedProductivityBonusCandidate, 180000);
assert.equal(eightWithoutTraining.metadata.payFactor, 0.8);
assert.equal(eightWithoutTraining.metadata.payableProductivityBonusCandidate, 144000);
assert.equal(eightWithoutTraining.candidateAmount, 144000);

const unknownTrainingWinner = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 9,
  minimumQualifiedAdvisorRequirement: 5,
});
assert.equal(unknownTrainingWinner.calculationAllowed, false);
assert.equal(unknownTrainingWinner.candidateAmount, null);
assert.equal(unknownTrainingWinner.metadata.calculatedProductivityBonusCandidate, 190000);
assert.equal(unknownTrainingWinner.metadata.payableProductivityBonusCandidate, null);
assert.ok(unknownTrainingWinner.blockedReasons.includes('blocked_by_missing_training_winner_evidence_policy'));

const monthGateBlocked = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 3,
  trainingWinnerInQuarter: true,
  supportRequirementGateResult: blockedSupportGate,
});
assert.equal(monthGateBlocked.calculationAllowed, true);
assert.equal(monthGateBlocked.candidateAmount, 130000);
assert.equal(monthGateBlocked.candidatePercentage, 0.3);
assert.ok(monthGateBlocked.warnings.includes('support_requirement_gate_ignored_for_multiplier_without_explicit_official_config'));

console.log('PASS partner-productivity-multiplier-calculator-test');
