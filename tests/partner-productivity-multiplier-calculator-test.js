import assert from 'node:assert/strict';

import {
  calculatePartnerProductivityMultiplierCandidate,
} from '../compensation/partner-manager/partner-productivity-multiplier-calculator.js';

const base = {
  calculationAllowed: true,
  candidateAmount: 100000,
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
  productivityBaseCalculation: base,
  qualifiedAdvisorCount: 10,
  taCountingPrecontractCount: 1,
});
assert.ok(missingTa.blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence'));

console.log('PASS partner-productivity-multiplier-calculator-test');
