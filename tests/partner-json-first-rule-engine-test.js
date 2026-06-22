import assert from 'node:assert/strict';

import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
  createAdvisorEconomicOutput,
} from '../compensation/partner-manager/advisor-economic-output.js';

import {
  QUALIFIED_ADVISOR_ECONOMIC_STATUSES,
} from '../compensation/partner-manager/qualified-advisor-economic-status.js';

import {
  loadDefaultSMNYLPartner2026RulePack,
} from '../compensation/partner-manager/rule-engine/partner-rule-pack-loader.js';

import {
  gatePartnerDevelopmentBonusCalculation,
} from '../compensation/partner-manager/partner-partial-bonus-calculation-gate.js';

import {
  calculatePartnerFixedSupportCandidate,
} from '../compensation/partner-manager/partner-fixed-support-calculator.js';

import {
  calculatePartnerProductivityBaseCandidate,
} from '../compensation/partner-manager/partner-productivity-base-calculator.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const rulePack = loadDefaultSMNYLPartner2026RulePack();

const mutatedProductivity = clone(rulePack);
const productivityConcept = mutatedProductivity.concepts['productivity-base'];
const firstBand = productivityConcept.table.bands[0];
const firstClass = Object.keys(firstBand.rates)[0];
firstBand.rates[firstClass] = 0.1234;

const productivityResult = calculatePartnerProductivityBaseCandidate({
  rulePack: mutatedProductivity,
  advisorEconomicOutputs: [createAdvisorEconomicOutput({
    advisorId: 'ADV_JSON',
    initialCommissions: firstBand.minAverageMonthlyInitialCommissions,
    economicStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
  })],
  qualifiedAdvisorEconomicStatuses: [{
    status: QUALIFIED_ADVISOR_ECONOMIC_STATUSES.QUALIFIED_CONFIRMED,
  }],
  averageMonthlyInitialCommissions: firstBand.minAverageMonthlyInitialCommissions,
  advisorClass: firstClass,
  lifecycleGate: { allowed: true },
  baseAmount: 100,
});
assert.equal(productivityResult.candidatePercentage, 0.1234);
assert.equal(productivityResult.candidateAmount, 12.34);
assert.equal(productivityResult.payoutTruth, false);

const mutatedDevelopment = clone(rulePack);
const developmentConcept = mutatedDevelopment.concepts['development-bonus'];
const developmentRow = developmentConcept.policyScale[developmentConcept.policyScale.length - 1];
developmentRow.amount = 17777;
const developmentResult = gatePartnerDevelopmentBonusCalculation({
  rulePack: mutatedDevelopment,
  advisorMonth: developmentConcept.advisorMonthRange.from,
  validPolicyCount: Number(String(developmentRow.policies).replace('+', '')),
  paidAppliedPolicyEvidence: true,
});
assert.equal(developmentResult.candidateAmount, 17777);
assert.equal(developmentResult.payoutTruth, false);

const mutatedFixedSupport = clone(rulePack);
const fixedSupportConcept = mutatedFixedSupport.concepts['fixed-support'];
const semesterFive = fixedSupportConcept.supportAmountsBySemester.find((row) => row.semester === 5);
semesterFive.amount = 22222;
const fixedSupportResult = calculatePartnerFixedSupportCandidate({
  rulePack: mutatedFixedSupport,
  partnerCareerMonth: 25,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(fixedSupportResult.candidateAmount, 22222);
assert.equal(fixedSupportResult.payoutTruth, false);

const brokenProductivity = clone(rulePack);
delete brokenProductivity.concepts['productivity-base'].table.bands[0].rates[firstClass];
const blockedProductivity = calculatePartnerProductivityBaseCandidate({
  rulePack: brokenProductivity,
  advisorEconomicOutputs: [createAdvisorEconomicOutput({
    advisorId: 'ADV_JSON',
    initialCommissions: firstBand.minAverageMonthlyInitialCommissions,
    economicStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
  })],
  qualifiedAdvisorEconomicStatuses: [{
    status: QUALIFIED_ADVISOR_ECONOMIC_STATUSES.QUALIFIED_CONFIRMED,
  }],
  averageMonthlyInitialCommissions: firstBand.minAverageMonthlyInitialCommissions,
  advisorClass: firstClass,
  lifecycleGate: { allowed: true },
  baseAmount: 100,
});
assert.equal(blockedProductivity.candidateAmount, null);
assert.ok(blockedProductivity.blockedReasons.includes('blocked_by_missing_productivity_rate_for_class'));

console.log('PASS partner-json-first-rule-engine-test');
