import {
  QUALIFIED_ADVISOR_ECONOMIC_STATUSES,
} from './qualified-advisor-economic-status.js';

import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

import {
  getActivityBonusRate,
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

export const PARTNER_ACTIVITY_BONUS_CONCEPT_KEY = 'activity-bonus';
export const PARTNER_ACTIVITY_BONUS_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_9_ACTIVITY_BONUS';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function assessPartnerActivityBonus({
  rulePack = null,
  qualifiedAdvisorStatus = null,
  advisorCareerMonth = null,
  validLifeGmmPolicyCount = null,
  paidAppliedPolicyEvidence = false,
  rawActivityOnly = false,
  period = null,
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];

  if (qualifiedAdvisorStatus?.status !== QUALIFIED_ADVISOR_ECONOMIC_STATUSES.QUALIFIED_CONFIRMED) {
    blockedReasons.push('advisor_not_qualified');
  }

  if (!hasNumber(advisorCareerMonth) || Number(advisorCareerMonth) < 3) {
    blockedReasons.push('minimum_three_month_seniority_required');
  }

  if (!hasNumber(validLifeGmmPolicyCount)) {
    missingInputs.push('validLifeGmmPolicyCount');
    blockedReasons.push('missing_valid_life_gmm_policy_count');
  }

  const activeRulePack = rulePack || loadPartner2026RulePack();
  const jsonRate = getActivityBonusRate(activeRulePack, { validLifeGmmPolicyCount });
  if (hasNumber(validLifeGmmPolicyCount)) blockedReasons.push(...jsonRate.blockedReasons);

  if (!paidAppliedPolicyEvidence) blockedReasons.push('missing_paid_applied_policy_evidence');
  if (rawActivityOnly) blockedReasons.push('raw_activity_logs_only');

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_ACTIVITY_BONUS_CONCEPT_KEY,
    readiness: blockedReasons.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_ECONOMIC_INPUT
      : PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationAllowed: true,
    requiredInputs: ['qualifiedAdvisorStatus', 'advisorCareerMonth', 'validLifeGmmPolicyCount', 'paidAppliedPolicyEvidence'],
    missingInputs,
    blockedReasons,
    warnings: ['Activity bonus remains evidence-gated; raw activity logs do not qualify.'],
    sourceNotes: ['SMNYL Partner Compensation 2026 page 9.'],
    confidence: blockedReasons.length > 0 ? 'blocked' : 'medium',
    tableVersion: PARTNER_ACTIVITY_BONUS_TABLE_VERSION,
    percentageCandidate: jsonRate.rate,
    metadata: {
      rulePackId: activeRulePack?.rulePackId || null,
      frequency: activeRulePack?.concepts?.['activity-bonus']?.frequency || null,
      period,
      validLifeGmmPolicyCount,
    },
  });
}
