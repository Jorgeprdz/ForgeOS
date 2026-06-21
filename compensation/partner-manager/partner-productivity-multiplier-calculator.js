import {
  assessPartnerProductivityMultiplier,
} from './partner-productivity-multiplier-contract.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from './partner-safe-calculation-result.js';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function calculatePartnerProductivityMultiplierCandidate({
  assessment = null,
  productivityBaseCalculation = null,
  qualifiedAdvisorCount = null,
  taCountingPrecontractCount = null,
  taCountingEventEvidence = false,
  TAWinnerCount = null,
  periodType = null,
} = {}) {
  const multiplierAssessment = assessment || assessPartnerProductivityMultiplier({
    productivityBaseAssessment: productivityBaseCalculation,
    qualifiedAdvisorCount,
    taCountingPrecontractCount,
    taCountingEventEvidence,
    TAWinnerCount,
    periodType,
  });

  const blockedReasons = [...multiplierAssessment.blockedReasons];
  const missingInputs = [...multiplierAssessment.missingInputs];
  const baseAmount = productivityBaseCalculation?.candidateAmount;
  if (!hasNumber(baseAmount)) {
    blockedReasons.push('missing_base_candidate_amount');
    missingInputs.push('productivityBaseCalculation.candidateAmount');
  }

  const multiplier = multiplierAssessment.percentageCandidate;
  const additionalCandidateAmount = hasNumber(baseAmount) && hasNumber(multiplier)
    ? Number(baseAmount) * Number(multiplier)
    : null;
  const totalCandidateAmount = hasNumber(baseAmount) && hasNumber(additionalCandidateAmount)
    ? Number(baseAmount) + Number(additionalCandidateAmount)
    : null;

  return createPartnerSafeCalculationResult({
    conceptKey: 'productivity-multiplier',
    status: blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence')
      ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE
      : (
        blockedReasons.length > 0 || missingInputs.length > 0
          ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_ECONOMIC_INPUT
          : PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE
      ),
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: totalCandidateAmount,
    candidatePercentage: multiplier,
    inputBasis: hasNumber(baseAmount) ? Number(baseAmount) : null,
    blockedReasons,
    missingInputs,
    warnings: multiplierAssessment.warnings,
    sourceNotes: multiplierAssessment.sourceNotes,
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    evidenceRequirement: ['qualified_advisor_count', 'base_productivity_candidate', 'TA_counting_event_evidence_for_100_percent'],
    metadata: {
      multiplierPercentageCandidate: multiplier,
      baseCandidateAmount: hasNumber(baseAmount) ? Number(baseAmount) : null,
      additionalCandidateAmount,
      totalCandidateAmount,
      appliedTAConstraint: multiplierAssessment.metadata?.taCountingEventEvidence === true,
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
      assessment: multiplierAssessment,
    },
  });
}
