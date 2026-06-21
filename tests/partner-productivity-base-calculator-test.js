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
  calculatePartnerProductivityBaseCandidate,
} from '../compensation/partner-manager/partner-productivity-base-calculator.js';

function output(amount = 12000, extra = {}) {
  return createAdvisorEconomicOutput({
    advisorId: 'ADV_1',
    initialCommissions: amount,
    renewalCommissions: 5000,
    economicStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
    ...extra,
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

const ccLow = calculatePartnerProductivityBaseCandidate({
  advisorEconomicOutputs: [output(12000)],
  qualifiedAdvisorEconomicStatuses: [qualified(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
  baseAmount: 100000,
});
assert.equal(ccLow.candidatePercentage, 0.25);
assert.equal(ccLow.candidateAmount, 25000);

const oneCMid = calculatePartnerProductivityBaseCandidate({
  advisorEconomicOutputs: [output(20000)],
  qualifiedAdvisorEconomicStatuses: [qualified(20000)],
  averageMonthlyInitialCommissions: 20000,
  advisorClass: '1C',
  lifecycleGate: { allowed: true },
  baseAmount: 100000,
});
assert.equal(oneCMid.candidatePercentage, 0.35);

const twoCHigh = calculatePartnerProductivityBaseCandidate({
  advisorEconomicOutputs: [output(31000)],
  qualifiedAdvisorEconomicStatuses: [qualified(31000)],
  averageMonthlyInitialCommissions: 31000,
  advisorClass: '2C',
  lifecycleGate: { allowed: true },
  baseAmount: 100000,
});
assert.equal(twoCHigh.candidatePercentage, 0.185);

const noBaseAmount = calculatePartnerProductivityBaseCandidate({
  advisorEconomicOutputs: [output(12000)],
  qualifiedAdvisorEconomicStatuses: [qualified(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
});
assert.equal(noBaseAmount.candidatePercentage, 0.25);
assert.equal(noBaseAmount.candidateAmount, null);
assert.ok(noBaseAmount.blockedReasons.includes('missing_base_amount'));

const missingQualified = calculatePartnerProductivityBaseCandidate({
  advisorEconomicOutputs: [output(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
  baseAmount: 100000,
});
assert.ok(missingQualified.blockedReasons.includes('missing_qualified_advisor_economic_status'));

const activityOnly = calculatePartnerProductivityBaseCandidate({
  advisorEconomicOutputs: [createAdvisorEconomicOutput({ sourceType: 'activity', rawActivityOnly: true })],
  qualifiedAdvisorEconomicStatuses: [qualified(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
  baseAmount: 100000,
});
assert.ok(activityOnly.blockedReasons.includes('raw_activity_cannot_feed_productivity_base'));

const held = calculatePartnerProductivityBaseCandidate({
  advisorEconomicOutputs: [output(12000, { heldPrecontractCommission: true })],
  qualifiedAdvisorEconomicStatuses: [qualified(12000)],
  averageMonthlyInitialCommissions: 12000,
  advisorClass: 'CC',
  lifecycleGate: { allowed: true },
  baseAmount: 100000,
});
assert.ok(held.blockedReasons.includes('precontract_held_commission_not_payable'));

console.log('PASS partner-productivity-base-calculator-test');
