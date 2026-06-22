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
  rulePack = null,
  productivityBaseCalculation = null,
  productivityBaseCandidate = null,
  qualifiedAdvisorCount = null,
  partnerCareerMonth = null,
  minimumQualifiedAdvisorRequirement = null,
  multiplierMinimumRequirement = null,
  supportRequirementGateResult = null,
  enforceSupportRequirementGate = false,
  trainingWinnerInQuarter = null,
  signedPrecontractInQuarter = null,
  taCountingEventInQuarter = null,
  taCountingPrecontractCount = null,
  taCountingEventEvidence = false,
  TAWinnerCount = null,
  periodType = null,
} = {}) {
  const multiplierAssessment = assessment || assessPartnerProductivityMultiplier({
    rulePack,
    productivityBaseAssessment: productivityBaseCalculation || (hasNumber(productivityBaseCandidate)
      ? { calculationAllowed: true, candidateAmount: Number(productivityBaseCandidate) }
      : null),
    qualifiedAdvisorCount,
    partnerCareerMonth,
    minimumQualifiedAdvisorRequirement,
    multiplierMinimumRequirement,
    supportRequirementGateResult,
    enforceSupportRequirementGate,
    trainingWinnerInQuarter,
    signedPrecontractInQuarter,
    taCountingEventInQuarter,
    taCountingPrecontractCount,
    taCountingEventEvidence,
    TAWinnerCount,
    periodType,
  });

  const blockedReasons = [...multiplierAssessment.blockedReasons];
  const missingInputs = [...multiplierAssessment.missingInputs];
  const baseAmount = hasNumber(productivityBaseCalculation?.candidateAmount)
    ? productivityBaseCalculation.candidateAmount
    : productivityBaseCandidate;
  if (!hasNumber(baseAmount)) {
    blockedReasons.push('missing_base_candidate_amount');
    missingInputs.push('productivityBaseCalculation.candidateAmount');
  }

  const multiplier = hasNumber(multiplierAssessment.percentageCandidate)
    ? multiplierAssessment.percentageCandidate
    : multiplierAssessment.metadata?.multiplierRate;
  const multiplierAmountCandidate = hasNumber(baseAmount) && hasNumber(multiplier)
    ? Number(baseAmount) * Number(multiplier)
    : null;
  const calculatedProductivityBonusCandidate = hasNumber(baseAmount) && hasNumber(multiplierAmountCandidate)
    ? Number(baseAmount) + Number(multiplierAmountCandidate)
    : null;
  const payFactor = multiplierAssessment.metadata?.payFactor;
  const payableProductivityBonusCandidate = hasNumber(calculatedProductivityBonusCandidate) && hasNumber(payFactor)
    ? calculatedProductivityBonusCandidate * Number(payFactor)
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
    candidateAmount: payableProductivityBonusCandidate,
    candidatePercentage: multiplier,
    inputBasis: hasNumber(baseAmount) ? Number(baseAmount) : null,
    blockedReasons,
    missingInputs,
    warnings: multiplierAssessment.warnings,
    sourceNotes: multiplierAssessment.sourceNotes,
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    evidenceRequirement: ['qualified_advisor_count', 'base_productivity_candidate', 'training_winner_or_signed_precontract_evidence_for_pay_factor'],
    metadata: {
      multiplierPercentageCandidate: multiplier,
      multiplierRate: multiplier,
      baseCandidateAmount: hasNumber(baseAmount) ? Number(baseAmount) : null,
      baseProductivityCandidate: hasNumber(baseAmount) ? Number(baseAmount) : null,
      multiplierAmountCandidate,
      calculatedProductivityBonusCandidate,
      trainingWinnerInQuarter: multiplierAssessment.metadata?.trainingWinnerInQuarter ?? null,
      payFactor: hasNumber(payFactor) ? Number(payFactor) : null,
      payableProductivityBonusCandidate,
      qualifiedAdvisorCount: multiplierAssessment.metadata?.qualifiedAdvisorCount ?? null,
      minimumQualifiedAdvisorRequirement: multiplierAssessment.metadata?.minimumQualifiedAdvisorRequirement ?? null,
      appliedTrainingWinnerPayFactor: hasNumber(payFactor),
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
      supportRequirementGateResult,
      assessment: multiplierAssessment,
    },
  });
}
