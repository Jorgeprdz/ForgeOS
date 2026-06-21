import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

export const PARTNER_PARTIAL_CONCEPT_KEYS = Object.freeze({
  TRANSITION_BONUS: 'transition-bonus',
  CONNECTION_BONUS: 'connection-bonus',
  DEVELOPMENT_BONUS: 'development-bonus',
  PARTNER_PROMOTION_BONUS: 'partner-promotion-bonus',
});

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function assessPartnerTransitionBonus({
  assignedPortfolioCommissions = null,
  directKeyAttribution = false,
  commissionEvidence = false,
} = {}) {
  const blockedReasons = [];
  if (!hasNumber(assignedPortfolioCommissions) || !commissionEvidence) {
    blockedReasons.push('blocked_by_missing_commission_evidence');
  }
  if (!directKeyAttribution) blockedReasons.push('missing_direct_key_evidence');

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PARTIAL_CONCEPT_KEYS.TRANSITION_BONUS,
    readiness: blockedReasons.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_COMMISSION_EVIDENCE
      : PARTNER_RULE_PACK_READINESS.PARTIALLY_MODELABLE,
    calculationAllowed: false,
    requiredInputs: ['assignedPortfolioCommissions', 'directKeyAttribution', 'commissionEvidence'],
    blockedReasons,
    sourceNotes: ['SMNYL Partner Compensation 2026 page 5.', 'Cartera asignada must produce commissions attributable to direct key.'],
    confidence: blockedReasons.length > 0 ? 'blocked' : 'medium',
    metadata: { assignedPortfolioCommissions, directKeyAttribution },
  });
}

export function assessPartnerConnectionBonus({
  hasCompletePolicyAmountTable = false,
} = {}) {
  const blockedReasons = hasCompletePolicyAmountTable ? [] : ['blocked_by_missing_table'];

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PARTIAL_CONCEPT_KEYS.CONNECTION_BONUS,
    readiness: PARTNER_RULE_PACK_READINESS.PARTIALLY_MODELABLE,
    calculationAllowed: false,
    requiredInputs: ['advisor_activation_event', 'complete_policy_amount_table'],
    blockedReasons,
    warnings: ['$7,500 activation amount is semantic only; month 2-3 table remains incomplete.'],
    sourceNotes: ['SMNYL Partner Compensation 2026 page 10.'],
    confidence: 'medium',
    amountCandidate: 7500,
    metadata: {
      activationSemanticAmount: 7500,
      monthTwoThreeRange: [5000, 20000],
    },
  });
}

export function assessPartnerDevelopmentBonus() {
  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PARTIAL_CONCEPT_KEYS.DEVELOPMENT_BONUS,
    readiness: PARTNER_RULE_PACK_READINESS.EXAMPLE_ONLY,
    calculationAllowed: false,
    requiredInputs: ['complete_policy_amount_table'],
    blockedReasons: ['blocked_by_missing_table', 'example_only_not_formula'],
    warnings: ['4+ policies = $15,000 is an example only and must not become a calculation table.'],
    sourceNotes: ['SMNYL Partner Compensation 2026 pages 10 and 17.'],
    confidence: 'low',
    metadata: {
      exampleOnly: {
        policyCountLabel: '4+',
        monthlyAmount: 15000,
      },
    },
  });
}

export function assessPartnerPromotionBonus({
  hasAltaPartnerTable = false,
  hasSupportMetricsDefinition = false,
} = {}) {
  const blockedReasons = [];
  if (!hasAltaPartnerTable) blockedReasons.push('blocked_by_missing_table');
  if (!hasSupportMetricsDefinition) blockedReasons.push('blocked_by_missing_support_metrics');

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PARTIAL_CONCEPT_KEYS.PARTNER_PROMOTION_BONUS,
    readiness: PARTNER_RULE_PACK_READINESS.PARTIALLY_MODELABLE,
    calculationAllowed: false,
    requiredInputs: ['partner_promotion_event', 'alta_partner_table', 'support_metrics_definition'],
    blockedReasons,
    warnings: ['Semantic payment schedule is preserved; full calculation remains blocked without Alta Partner table.'],
    sourceNotes: ['SMNYL Partner Compensation 2026 page 11.'],
    confidence: 'medium',
    amountCandidate: 300000,
    metadata: {
      totalSemanticAmount: 300000,
      initialPayment: 60000,
      monthlyPayment: 20000,
      monthlyPayments: 12,
    },
  });
}
