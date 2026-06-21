import {
  QUALIFIED_ADVISOR_ECONOMIC_STATUSES,
} from './qualified-advisor-economic-status.js';

import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

export const PARTNER_ACTIVITY_BONUS_CONCEPT_KEY = 'activity-bonus';
export const PARTNER_ACTIVITY_BONUS_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_9_ACTIVITY_BONUS';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function percentageForPolicyCount(count) {
  if (!hasNumber(count)) return null;
  if (Number(count) >= 6) return 0.30;
  if (Number(count) === 5) return 0.25;
  if (Number(count) === 4) return 0.20;
  if (Number(count) === 3) return 0.15;
  if (Number(count) === 2) return 0.10;
  return null;
}

export function assessPartnerActivityBonus({
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

  const percentageCandidate = percentageForPolicyCount(validLifeGmmPolicyCount);
  if (hasNumber(validLifeGmmPolicyCount) && percentageCandidate === null) {
    blockedReasons.push('below_minimum_policy_count');
  }

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
    percentageCandidate,
    metadata: {
      period,
      validLifeGmmPolicyCount,
    },
  });
}
