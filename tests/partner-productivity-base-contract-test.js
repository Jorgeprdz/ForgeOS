import assert from 'node:assert/strict';

import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
  createAdvisorEconomicOutput,
} from '../compensation/partner-manager/advisor-economic-output.js';

import {
  DEFAULT_PARTNER_2026_QUALIFIED_COMMISSION_THRESHOLD,
  evaluateQualifiedAdvisorEconomicStatus,
} from '../compensation/partner-manager/qualified-advisor-economic-status.js';

import {
  assessPartnerProductivityBase,
} from '../compensation/partner-manager/partner-productivity-base-contract.js';

function output(amount = 12000) {
  return createAdvisorEconomicOutput({
    advisorId: 'ADV_1',
    initialCommissions: amount,
    renewalCommissions: 5000,
    economicStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
  });
}

function qualified(amount = 12000) {
  return evaluateQualifiedAdvisorEconomicStatus({
    advisorId: 'ADV_1',
    averageMonthlyInitialCommissions: amount,
    threshold: DEFAULT_PARTNER_2026_QUALIFIED_COMMISSION_THRESHOLD,
    LIMRA: 0.8,
    IGC: 0.9,
    lifecycleStatus: 'connected_active',
    lifecycleGateAllowed: true,
    economicOutputStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
  });
}

const ccLow = assessPartnerProductivityBase({
  advisorEconomicOutputs: [output(12000)],
  qualifiedAdvisorEconomicStatuses: [qualified(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
});
assert.equal(ccLow.percentageCandidate, 0.25);
assert.equal(ccLow.payoutTruth, false);

const oneCMid = assessPartnerProductivityBase({
  advisorEconomicOutputs: [output(20000)],
  qualifiedAdvisorEconomicStatuses: [qualified(20000)],
  averageMonthlyInitialCommissions: 20000,
  advisorClass: '1C',
  lifecycleGate: { allowed: true },
});
assert.equal(oneCMid.percentageCandidate, 0.35);

const twoCHigh = assessPartnerProductivityBase({
  advisorEconomicOutputs: [output(31000)],
  qualifiedAdvisorEconomicStatuses: [qualified(31000)],
  averageMonthlyInitialCommissions: 31000,
  advisorClass: '2C',
  lifecycleGate: { allowed: true },
});
assert.equal(twoCHigh.percentageCandidate, 0.185);

const missingQualified = assessPartnerProductivityBase({
  advisorEconomicOutputs: [output(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
});
assert.equal(missingQualified.calculationAllowed, false);
assert.ok(missingQualified.blockedReasons.includes('missing_qualified_advisor_economic_status'));
assert.equal(missingQualified.percentageCandidate, null);

const activityOnly = assessPartnerProductivityBase({
  advisorEconomicOutputs: [createAdvisorEconomicOutput({ sourceType: 'activity', rawActivityOnly: true })],
  qualifiedAdvisorEconomicStatuses: [qualified(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
});
assert.ok(activityOnly.blockedReasons.includes('raw_activity_cannot_feed_productivity_base'));

const unknownClass = assessPartnerProductivityBase({
  advisorEconomicOutputs: [output(12000)],
  qualifiedAdvisorEconomicStatuses: [qualified(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'mystery',
  lifecycleGate: { allowed: true },
});
assert.ok(unknownClass.blockedReasons.includes('unknown_advisor_class'));

console.log('PASS partner-productivity-base-contract-test');
