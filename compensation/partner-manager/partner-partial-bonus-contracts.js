import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

import {
  getConnectionBonusAmount,
  getDevelopmentBonusAmount,
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

export const PARTNER_PARTIAL_CONCEPT_KEYS = Object.freeze({
  TRANSITION_BONUS: 'transition-bonus',
  CONNECTION_BONUS: 'connection-bonus',
  DEVELOPMENT_BONUS: 'development-bonus',
  PARTNER_PROMOTION_BONUS: 'partner-promotion-bonus',
});

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

const DEFAULT_PARTNER_2026_RULE_PACK = loadPartner2026RulePack();

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
  rulePack = null,
  hasCompletePolicyAmountTable = false,
} = {}) {
  const activeRulePack = rulePack || DEFAULT_PARTNER_2026_RULE_PACK;
  const activationAmount = getConnectionBonusAmount(activeRulePack, { onboardingEvidence: true }).amount;
  const blockedReasons = hasCompletePolicyAmountTable ? [] : ['blocked_by_missing_table'];

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PARTIAL_CONCEPT_KEYS.CONNECTION_BONUS,
    readiness: PARTNER_RULE_PACK_READINESS.PARTIALLY_MODELABLE,
    calculationAllowed: false,
    requiredInputs: ['advisor_activation_event', 'complete_policy_amount_table'],
    blockedReasons,
    warnings: ['Connection bonus amounts are rule-pack candidates, not payout truth.'],
    sourceNotes: ['SMNYL Partner Compensation 2026 page 10.'],
    confidence: 'medium',
    amountCandidate: activationAmount,
    metadata: {
      rulePackId: activeRulePack?.rulePackId || null,
      activationSemanticAmount: activationAmount,
      monthTwoThreeScale: activeRulePack?.concepts?.['connection-bonus']?.monthlyPolicyScale || null,
    },
  });
}

export function assessPartnerDevelopmentBonus({
  rulePack = null,
} = {}) {
  const activeRulePack = rulePack || DEFAULT_PARTNER_2026_RULE_PACK;
  const developmentScale = activeRulePack?.concepts?.['development-bonus']?.policyScale || [];
  const exampleRow = developmentScale[developmentScale.length - 1] || null;
  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PARTIAL_CONCEPT_KEYS.DEVELOPMENT_BONUS,
    readiness: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationAllowed: false,
    requiredInputs: ['complete_policy_amount_table'],
    blockedReasons: [],
    warnings: ['Development policy scale is modeled from official rule JSON; payout truth still requires official statement.'],
    sourceNotes: ['SMNYL Partner Compensation 2026 pages 10 and 17.'],
    confidence: 'medium',
    metadata: {
      rulePackId: activeRulePack?.rulePackId || null,
      policyScale: developmentScale,
      modeledAmountExample: getDevelopmentBonusAmount(activeRulePack, { advisorMonth: activeRulePack?.concepts?.['development-bonus']?.advisorMonthRange?.from, validPolicyCount: exampleRow?.policies }).amount,
      exampleOnly: {
        policyCountLabel: exampleRow?.policies || null,
        monthlyAmount: exampleRow?.amount || null,
      },
    },
  });
}

export function assessPartnerPromotionBonus({
  rulePack = null,
  hasAltaPartnerTable = false,
  hasSupportMetricsDefinition = false,
} = {}) {
  const activeRulePack = rulePack || DEFAULT_PARTNER_2026_RULE_PACK;
  const semanticAmounts = activeRulePack?.concepts?.['partner-promotion-bonus']?.semanticAmounts || {};
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
    amountCandidate: semanticAmounts.total || null,
    metadata: {
      totalSemanticAmount: semanticAmounts.total || null,
      initialPayment: semanticAmounts.initial || null,
      monthlyPayment: semanticAmounts.monthly || null,
      monthlyPayments: semanticAmounts.monthlyPayments || null,
    },
  });
}
