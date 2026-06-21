import assert from 'node:assert/strict';

import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
  createAdvisorEconomicOutput,
} from '../compensation/partner-manager/advisor-economic-output.js';

import {
  assessPartnerProductionBonus,
} from '../compensation/partner-manager/partner-production-bonus-contract.js';

const nonQualifiedOutput = createAdvisorEconomicOutput({
  advisorId: 'ADV_2',
  totalCommissions: 8000,
  economicStatus: ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
});

const nueva = assessPartnerProductionBonus({
  nonQualifiedAdvisorEconomicOutput: nonQualifiedOutput,
  organizationType: 'Nueva Organización',
  unitLIMRA: 0.78,
  unitIGC: 0.86,
  paidAppliedEconomicEvidence: true,
});
assert.equal(nueva.percentageCandidate, 0.135);
assert.equal(nueva.payoutTruth, false);

const consolidados = assessPartnerProductionBonus({
  nonQualifiedAdvisorEconomicOutput: nonQualifiedOutput,
  organizationType: 'Consolidados',
  unitLIMRA: 0.78,
  unitIGC: 0.86,
  paidAppliedEconomicEvidence: true,
});
assert.equal(consolidados.percentageCandidate, 0.07);

const activityOnly = assessPartnerProductionBonus({
  nonQualifiedAdvisorEconomicOutput: createAdvisorEconomicOutput({ sourceType: 'activity', rawActivityOnly: true }),
  organizationType: 'Consolidados',
  unitLIMRA: 0.78,
  unitIGC: 0.86,
  paidAppliedEconomicEvidence: true,
});
assert.ok(activityOnly.blockedReasons.includes('raw_activity_only'));

const missingIndexes = assessPartnerProductionBonus({
  nonQualifiedAdvisorEconomicOutput: nonQualifiedOutput,
  organizationType: 'Consolidados',
  paidAppliedEconomicEvidence: true,
});
assert.ok(missingIndexes.blockedReasons.includes('missing_or_below_unit_LIMRA'));
assert.ok(missingIndexes.blockedReasons.includes('missing_or_below_unit_IGC'));

console.log('PASS partner-production-bonus-contract-test');
