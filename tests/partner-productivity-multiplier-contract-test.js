import assert from 'node:assert/strict';

import {
  assessPartnerProductivityMultiplier,
} from '../compensation/partner-manager/partner-productivity-multiplier-contract.js';

const base = { calculationAllowed: true };

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
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 0,
  taCountingEventEvidence: true,
});
assert.equal(noTa.percentageCandidate, 0.8);
assert.ok(noTa.warnings.some((warning) => warning.includes('80_percent')));

const missingTaEvidence = assessPartnerProductivityMultiplier({
  productivityBaseAssessment: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 1,
});
assert.equal(missingTaEvidence.calculationAllowed, false);
assert.ok(missingTaEvidence.blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence'));

const missingBase = assessPartnerProductivityMultiplier({
  qualifiedAdvisorCount: 3,
});
assert.ok(missingBase.blockedReasons.includes('missing_base_result'));

console.log('PASS partner-productivity-multiplier-contract-test');
