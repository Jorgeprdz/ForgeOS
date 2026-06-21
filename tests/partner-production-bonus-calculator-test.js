import assert from 'node:assert/strict';

import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
  createAdvisorEconomicOutput,
} from '../compensation/partner-manager/advisor-economic-output.js';

import {
  calculatePartnerProductionBonusCandidate,
} from '../compensation/partner-manager/partner-production-bonus-calculator.js';

const economicOutput = createAdvisorEconomicOutput({
  advisorId: 'ADV_2',
  totalCommissions: 50000,
  economicStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
});

const nueva = calculatePartnerProductionBonusCandidate({
  nonQualifiedAdvisorEconomicOutput: economicOutput,
  organizationType: 'Nueva Organización',
  unitLIMRA: 0.78,
  unitIGC: 0.86,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.equal(nueva.candidatePercentage, 0.135);
assert.equal(nueva.candidateAmount, 13500);

const consolidados = calculatePartnerProductionBonusCandidate({
  nonQualifiedAdvisorEconomicOutput: economicOutput,
  organizationType: 'Consolidados',
  unitLIMRA: 0.78,
  unitIGC: 0.86,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.equal(consolidados.candidatePercentage, 0.07);

const missingLimra = calculatePartnerProductionBonusCandidate({
  nonQualifiedAdvisorEconomicOutput: economicOutput,
  organizationType: 'Consolidados',
  unitIGC: 0.86,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.ok(missingLimra.blockedReasons.includes('missing_or_below_unit_LIMRA'));

const missingIgc = calculatePartnerProductionBonusCandidate({
  nonQualifiedAdvisorEconomicOutput: economicOutput,
  organizationType: 'Consolidados',
  unitLIMRA: 0.78,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.ok(missingIgc.blockedReasons.includes('missing_or_below_unit_IGC'));

const activityOnly = calculatePartnerProductionBonusCandidate({
  nonQualifiedAdvisorEconomicOutput: createAdvisorEconomicOutput({ sourceType: 'activity', rawActivityOnly: true }),
  organizationType: 'Consolidados',
  unitLIMRA: 0.78,
  unitIGC: 0.86,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.ok(activityOnly.blockedReasons.includes('raw_activity_only'));

console.log('PASS partner-production-bonus-calculator-test');
