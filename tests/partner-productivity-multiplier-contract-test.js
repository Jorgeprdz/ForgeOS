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

assert.equal(assessPartnerProductivityMultiplier({ productivityBaseAssessment: base, qualifiedAdvisorCount: 3 }).percentageCandidate, 0.3);
assert.equal(assessPartnerProductivityMultiplier({ productivityBaseAssessment: base, qualifiedAdvisorCount: 5 }).percentageCandidate, 0.5);

const tenWithTa = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
});
assert.equal(tenWithTa.percentageCandidate, 1);
assert.equal(tenWithTa.payoutTruth, false);
assert.equal(tenWithTa.metadata.createsPartnerEconomicGain, false);
assert.equal(tenWithTa.metadata.releasesHeldCommission, false);
assert.ok(tenWithTa.sourceNotes.some((note) => note.includes('not confirmed payout')));

const below = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 2,
});
assert.equal(below.calculationAllowed, false);
assert.ok(below.blockedReasons.includes('below_minimum_qualified_advisors'));

const noTa = assessPartnerProductivityMultiplier({
  rulePack,
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 0,
  taCountingEventEvidence: true,
});
assert.equal(noTa.percentageCandidate, 1);
assert.equal(noTa.metadata.effectiveTotalCandidateRate, null);

const missingTaEvidence = assessPartnerProductivityMultiplier({
  rulePack,
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 1,
});
assert.equal(missingTaEvidence.calculationAllowed, true);
assert.equal(missingTaEvidence.percentageCandidate, 1);
assert.equal(missingTaEvidence.metadata.effectiveTotalCandidateRate, 0.8);
assert.ok(missingTaEvidence.warnings.some((warning) => warning.includes('80_percent')));

const missingBase = assessPartnerProductivityMultiplier({
  qualifiedAdvisorCount: 3,
});
assert.ok(missingBase.blockedReasons.includes('missing_base_result'));

const monthGateBlocked = assessPartnerProductivityMultiplier({
  rulePack,
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 3,
  supportRequirementGateResult: blockedSupportGate,
});
assert.equal(monthGateBlocked.calculationAllowed, true);
assert.equal(monthGateBlocked.percentageCandidate, 0.3);
assert.ok(monthGateBlocked.warnings.includes('support_requirement_gate_ignored_for_multiplier_without_explicit_official_config'));

const missingStrictGate = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 3,
  enforceSupportRequirementGate: true,
});
assert.equal(missingStrictGate.calculationAllowed, false);
assert.ok(missingStrictGate.blockedReasons.includes('blocked_by_missing_support_requirement_gate'));

console.log('PASS partner-productivity-multiplier-contract-test');
