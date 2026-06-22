import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
} from './advisor-economic-output.js';

import {
  assessPartnerProductivityBase,
} from './partner-productivity-base-contract.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from './partner-safe-calculation-result.js';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function calculatePartnerProductivityBaseCandidate({
  assessment = null,
  rulePack = null,
  advisorEconomicOutputs = [],
  qualifiedAdvisorEconomicStatuses = [],
  averageMonthlyInitialCommissions = null,
  advisorClass = null,
  lifecycleGate = null,
  baseAmount = null,
  commissionBasis = null,
} = {}) {
  const productivityAssessment = assessment || assessPartnerProductivityBase({
    rulePack,
    advisorEconomicOutputs,
    qualifiedAdvisorEconomicStatuses,
    averageMonthlyInitialCommissions,
    advisorClass,
    lifecycleGate,
  });

  const blockedReasons = [...productivityAssessment.blockedReasons];
  const missingInputs = [...productivityAssessment.missingInputs];
  const heldPrecontract = advisorEconomicOutputs.some((output) => output.heldPrecontractCommission === true);
  const activityOnly = advisorEconomicOutputs.some((output) => output.sourceType === 'activity' || output.rawActivityOnly === true);
  const candidateOutput = advisorEconomicOutputs.some((output) => output.economicStatus === ADVISOR_ECONOMIC_OUTPUT_STATUSES.CANDIDATE);

  if (heldPrecontract) blockedReasons.push('precontract_held_commission_not_payable');
  if (activityOnly && !blockedReasons.includes('raw_activity_cannot_feed_productivity_base')) {
    blockedReasons.push('raw_activity_cannot_feed_productivity_base');
  }
  if (candidateOutput && !blockedReasons.includes('candidate_output_not_allowed')) {
    blockedReasons.push('candidate_output_not_allowed');
  }

  const basis = baseAmount ?? commissionBasis;
  if (!hasNumber(basis)) {
    missingInputs.push('baseAmount');
    blockedReasons.push('missing_base_amount');
  }

  const percentage = productivityAssessment.percentageCandidate;
  const amount = hasNumber(basis) && hasNumber(percentage) ? Number(basis) * Number(percentage) : null;

  return createPartnerSafeCalculationResult({
    conceptKey: 'productivity-base',
    status: blockedReasons.length > 0 || missingInputs.length > 0
      ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_ECONOMIC_INPUT
      : PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE,
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: amount,
    candidatePercentage: percentage,
    inputBasis: hasNumber(basis) ? Number(basis) : null,
    blockedReasons,
    missingInputs,
    warnings: productivityAssessment.warnings,
    sourceNotes: productivityAssessment.sourceNotes,
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    evidenceRequirement: ['confirmed_advisor_economic_output', 'qualified_advisor_status', 'paid_applied_economic_evidence'],
    metadata: {
      assessment: productivityAssessment,
      tableVersion: productivityAssessment.tableVersion,
    },
  });
}
