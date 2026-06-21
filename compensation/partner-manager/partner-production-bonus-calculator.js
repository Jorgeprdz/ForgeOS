import {
  assessPartnerProductionBonus,
} from './partner-production-bonus-contract.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from './partner-safe-calculation-result.js';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function calculatePartnerProductionBonusCandidate({
  assessment = null,
  nonQualifiedAdvisorEconomicOutput = null,
  organizationType = null,
  unitLIMRA = null,
  unitIGC = null,
  paidAppliedEconomicEvidence = false,
  validEconomicBaseAmount = null,
} = {}) {
  const productionAssessment = assessment || assessPartnerProductionBonus({
    nonQualifiedAdvisorEconomicOutput,
    organizationType,
    unitLIMRA,
    unitIGC,
    paidAppliedEconomicEvidence,
  });

  const blockedReasons = [...productionAssessment.blockedReasons];
  const missingInputs = [...productionAssessment.missingInputs];
  if (!hasNumber(validEconomicBaseAmount)) {
    blockedReasons.push('missing_valid_economic_base_amount');
    missingInputs.push('validEconomicBaseAmount');
  }

  const percentage = productionAssessment.percentageCandidate;
  const amount = hasNumber(validEconomicBaseAmount) && hasNumber(percentage)
    ? Number(validEconomicBaseAmount) * Number(percentage)
    : null;

  return createPartnerSafeCalculationResult({
    conceptKey: 'production-bonus',
    status: blockedReasons.length > 0 || missingInputs.length > 0
      ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_ECONOMIC_INPUT
      : PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE,
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: amount,
    candidatePercentage: percentage,
    inputBasis: hasNumber(validEconomicBaseAmount) ? Number(validEconomicBaseAmount) : null,
    blockedReasons,
    missingInputs,
    warnings: productionAssessment.warnings,
    sourceNotes: productionAssessment.sourceNotes,
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    evidenceRequirement: ['non_qualified_advisor_economic_output', 'unit_LIMRA', 'unit_IGC', 'paid_applied_economic_evidence'],
    metadata: { assessment: productionAssessment },
  });
}
