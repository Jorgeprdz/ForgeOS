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

assert.equal(calculatePartnerProductivityMultiplierCandidate({ productivityBaseCalculation: base, qualifiedAdvisorCount: 3 }).candidatePercentage, 0.3);
assert.equal(calculatePartnerProductivityMultiplierCandidate({ productivityBaseCalculation: base, qualifiedAdvisorCount: 5 }).candidatePercentage, 0.5);

const ten = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
});
assert.equal(ten.candidatePercentage, 1);
assert.equal(ten.metadata.additionalCandidateAmount, 100000);
assert.equal(ten.candidateAmount, 200000);
assert.equal(ten.payoutTruth, false);
assert.equal(ten.metadata.createsPartnerEconomicGain, false);
assert.equal(ten.metadata.releasesHeldCommission, false);

const below = calculatePartnerProductivityMultiplierCandidate({
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 2,
});
assert.ok(below.blockedReasons.includes('below_minimum_qualified_advisors'));

const missingTa = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 1,
});
assert.equal(missingTa.calculationAllowed, true);
assert.equal(missingTa.candidateAmount, 160000);
assert.ok(missingTa.warnings.some((warning) => warning.includes('80_percent')));

const monthGateBlocked = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 3,
  supportRequirementGateResult: blockedSupportGate,
});
assert.equal(monthGateBlocked.calculationAllowed, true);
assert.equal(monthGateBlocked.candidateAmount, 130000);
assert.equal(monthGateBlocked.candidatePercentage, 0.3);
assert.ok(monthGateBlocked.warnings.includes('support_requirement_gate_ignored_for_multiplier_without_explicit_official_config'));

console.log('PASS partner-productivity-multiplier-calculator-test');
