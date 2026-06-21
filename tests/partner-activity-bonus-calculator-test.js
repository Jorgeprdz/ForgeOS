import assert from 'node:assert/strict';

import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
} from '../compensation/partner-manager/advisor-economic-output.js';

import {
  DEFAULT_PARTNER_2026_QUALIFIED_COMMISSION_THRESHOLD,
  evaluateQualifiedAdvisorEconomicStatus,
} from '../compensation/partner-manager/qualified-advisor-economic-status.js';

import {
  calculatePartnerActivityBonusCandidate,
} from '../compensation/partner-manager/partner-activity-bonus-calculator.js';

const qualifiedAdvisorStatus = evaluateQualifiedAdvisorEconomicStatus({
  advisorId: 'ADV_1',
  averageMonthlyInitialCommissions: 12000,
  threshold: DEFAULT_PARTNER_2026_QUALIFIED_COMMISSION_THRESHOLD,
  LIMRA: 0.8,
  IGC: 0.9,
  lifecycleStatus: 'connected_active',
  lifecycleGateAllowed: true,
  economicOutputStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
});

const expected = new Map([[2, 0.10], [3, 0.15], [4, 0.20], [5, 0.25], [6, 0.30], [7, 0.30]]);
for (const [count, percentage] of expected) {
  const result = calculatePartnerActivityBonusCandidate({
    qualifiedAdvisorStatus,
    advisorCareerMonth: 3,
    validLifeGmmPolicyCount: count,
    paidAppliedPolicyEvidence: true,
    economicBasisAmount: 100000,
  });
  assert.equal(result.candidatePercentage, percentage);
}

const unqualified = calculatePartnerActivityBonusCandidate({
  advisorCareerMonth: 3,
  validLifeGmmPolicyCount: 2,
  paidAppliedPolicyEvidence: true,
  economicBasisAmount: 100000,
});
assert.ok(unqualified.blockedReasons.includes('advisor_not_qualified'));

const tooNew = calculatePartnerActivityBonusCandidate({
  qualifiedAdvisorStatus,
  advisorCareerMonth: 2,
  validLifeGmmPolicyCount: 2,
  paidAppliedPolicyEvidence: true,
  economicBasisAmount: 100000,
});
assert.ok(tooNew.blockedReasons.includes('minimum_three_month_seniority_required'));

const missingPolicyEvidence = calculatePartnerActivityBonusCandidate({
  qualifiedAdvisorStatus,
  advisorCareerMonth: 3,
  validLifeGmmPolicyCount: 2,
  economicBasisAmount: 100000,
});
assert.ok(missingPolicyEvidence.blockedReasons.includes('missing_paid_applied_policy_evidence'));

console.log('PASS partner-activity-bonus-calculator-test');
