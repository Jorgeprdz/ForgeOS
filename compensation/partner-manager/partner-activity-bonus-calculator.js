import {
  assessPartnerActivityBonus,
} from './partner-activity-bonus-contract.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from './partner-safe-calculation-result.js';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function calculatePartnerActivityBonusCandidate({
  assessment = null,
  rulePack = null,
  qualifiedAdvisorStatus = null,
  advisorCareerMonth = null,
  validLifeGmmPolicyCount = null,
  paidAppliedPolicyEvidence = false,
  rawActivityOnly = false,
  economicBasisAmount = null,
  period = null,
} = {}) {
  const activityAssessment = assessment || assessPartnerActivityBonus({
    rulePack,
    qualifiedAdvisorStatus,
    advisorCareerMonth,
    validLifeGmmPolicyCount,
    paidAppliedPolicyEvidence,
    rawActivityOnly,
    period,
  });

  const blockedReasons = [...activityAssessment.blockedReasons];
  const missingInputs = [...activityAssessment.missingInputs];
  if (!hasNumber(economicBasisAmount)) {
    blockedReasons.push('missing_economic_basis_amount');
    missingInputs.push('economicBasisAmount');
  }

  const percentage = activityAssessment.percentageCandidate;
  const amount = hasNumber(economicBasisAmount) && hasNumber(percentage)
    ? Number(economicBasisAmount) * Number(percentage)
    : null;

  return createPartnerSafeCalculationResult({
    conceptKey: 'activity-bonus',
    status: blockedReasons.length > 0 || missingInputs.length > 0
      ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_ECONOMIC_INPUT
      : PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE,
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: amount,
    candidatePercentage: percentage,
    inputBasis: hasNumber(economicBasisAmount) ? Number(economicBasisAmount) : null,
    blockedReasons,
    missingInputs,
    warnings: activityAssessment.warnings,
    sourceNotes: activityAssessment.sourceNotes,
    confidence: blockedReasons.length > 0 ? 'blocked' : 'medium',
    evidenceRequirement: ['qualified_advisor_status', 'three_month_seniority', 'paid_applied_policy_evidence', 'economic_basis_amount_for_money_candidate'],
    metadata: { assessment: activityAssessment },
  });
}
