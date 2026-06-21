import {
  assessPartnerConnectionBonus,
  assessPartnerDevelopmentBonus,
  assessPartnerPromotionBonus,
  assessPartnerTransitionBonus,
} from './partner-partial-bonus-contracts.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from './partner-safe-calculation-result.js';

export function gatePartnerTransitionBonusCalculation({
  assignedPortfolioCommissions = null,
  directKeyAttribution = false,
  commissionEvidence = false,
} = {}) {
  const assessment = assessPartnerTransitionBonus({
    assignedPortfolioCommissions,
    directKeyAttribution,
    commissionEvidence,
  });

  return createPartnerSafeCalculationResult({
    conceptKey: 'transition-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_COMMISSION_EVIDENCE,
    calculationAllowed: false,
    blockedReasons: assessment.blockedReasons.length > 0
      ? assessment.blockedReasons
      : ['partial_readiness_no_full_calculation'],
    sourceNotes: assessment.sourceNotes,
    confidence: assessment.confidence,
    evidenceRequirement: ['assigned_portfolio_commissions', 'direct_key_attribution', 'commission_evidence'],
    metadata: { assessment },
  });
}

export function gatePartnerConnectionBonusCalculation({
  onboardingEvidence = false,
  hasCompletePolicyAmountTable = false,
} = {}) {
  const assessment = assessPartnerConnectionBonus({ hasCompletePolicyAmountTable });
  const blockedReasons = ['partial_readiness_no_full_calculation'];
  if (!onboardingEvidence) blockedReasons.push('missing_onboarding_evidence');
  if (!hasCompletePolicyAmountTable) blockedReasons.push('blocked_by_missing_table');

  return createPartnerSafeCalculationResult({
    conceptKey: 'connection-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_PARTIAL,
    calculationAllowed: false,
    candidateAmount: null,
    blockedReasons,
    warnings: assessment.warnings,
    sourceNotes: assessment.sourceNotes,
    confidence: assessment.confidence,
    evidenceRequirement: ['onboarding_evidence', 'complete_policy_amount_table'],
    metadata: {
      semanticCandidateAmount: onboardingEvidence ? 7500 : null,
      assessment,
    },
  });
}

export function gatePartnerDevelopmentBonusCalculation() {
  const assessment = assessPartnerDevelopmentBonus();
  return createPartnerSafeCalculationResult({
    conceptKey: 'development-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.EXAMPLE_ONLY,
    calculationAllowed: false,
    blockedReasons: ['example_only_not_formula', 'blocked_by_missing_table'],
    warnings: assessment.warnings,
    sourceNotes: assessment.sourceNotes,
    confidence: assessment.confidence,
    evidenceRequirement: ['complete_policy_amount_table'],
    metadata: {
      exampleOnly: assessment.metadata.exampleOnly,
      assessment,
    },
  });
}

export function gatePartnerPromotionBonusCalculation({
  hasAltaPartnerTable = false,
  hasSupportMetricsDefinition = false,
} = {}) {
  const assessment = assessPartnerPromotionBonus({
    hasAltaPartnerTable,
    hasSupportMetricsDefinition,
  });
  return createPartnerSafeCalculationResult({
    conceptKey: 'partner-promotion-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_PARTIAL,
    calculationAllowed: false,
    blockedReasons: assessment.blockedReasons.length > 0
      ? assessment.blockedReasons
      : ['partial_readiness_no_full_calculation'],
    warnings: assessment.warnings,
    sourceNotes: assessment.sourceNotes,
    confidence: assessment.confidence,
    evidenceRequirement: ['alta_partner_table', 'support_metrics_definition'],
    metadata: {
      semanticAmounts: {
        total: 300000,
        initial: 60000,
        monthly: 20000,
        payments: 12,
      },
      assessment,
    },
  });
}
