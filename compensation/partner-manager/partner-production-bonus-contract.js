import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
} from './advisor-economic-output.js';

import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

export const PARTNER_PRODUCTION_BONUS_CONCEPT_KEY = 'production-bonus';
export const PARTNER_PRODUCTION_BONUS_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_8_PRODUCTION_BONUS';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function normalizeOrganizationType(value = null) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'nueva organizacion' || normalized === 'nueva organización' || normalized === 'new_organization') {
    return 'nueva_organizacion';
  }
  if (normalized === 'consolidado' || normalized === 'consolidados' || normalized === 'consolidated') {
    return 'consolidados';
  }
  return null;
}

function percentageForOrganization(type) {
  if (type === 'nueva_organizacion') return 0.135;
  if (type === 'consolidados') return 0.07;
  return null;
}

function economicOutputValid(output = {}) {
  return [
    ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
    ADVISOR_ECONOMIC_OUTPUT_STATUSES.CARRIER_CALCULATED,
    ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAYOUT_CONFIRMED,
  ].includes(output.economicStatus);
}

export function assessPartnerProductionBonus({
  nonQualifiedAdvisorEconomicOutput = null,
  organizationType = null,
  unitLIMRA = null,
  unitIGC = null,
  paidAppliedEconomicEvidence = false,
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];
  const warnings = [];
  const normalizedType = normalizeOrganizationType(organizationType);

  if (!nonQualifiedAdvisorEconomicOutput) {
    missingInputs.push('nonQualifiedAdvisorEconomicOutput');
    blockedReasons.push('missing_non_qualified_advisor_economic_output');
  } else {
    if (nonQualifiedAdvisorEconomicOutput.sourceType === 'activity' || nonQualifiedAdvisorEconomicOutput.rawActivityOnly === true) {
      blockedReasons.push('raw_activity_only');
    }
    if (!economicOutputValid(nonQualifiedAdvisorEconomicOutput)) {
      blockedReasons.push('missing_paid_applied_economic_evidence');
    }
  }

  if (!paidAppliedEconomicEvidence) blockedReasons.push('missing_paid_applied_evidence');
  if (!normalizedType) blockedReasons.push('unknown_organization_type');
  if (!hasNumber(unitLIMRA) || Number(unitLIMRA) < 0.78) blockedReasons.push('missing_or_below_unit_LIMRA');
  if (!hasNumber(unitIGC) || Number(unitIGC) < 0.86) blockedReasons.push('missing_or_below_unit_IGC');

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PRODUCTION_BONUS_CONCEPT_KEY,
    readiness: blockedReasons.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_INDEXES
      : PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationAllowed: true,
    requiredInputs: ['nonQualifiedAdvisorEconomicOutput', 'organizationType', 'unitLIMRA', 'unitIGC', 'paidAppliedEconomicEvidence'],
    missingInputs,
    blockedReasons,
    warnings,
    sourceNotes: ['SMNYL Partner Compensation 2026 page 8.', 'Applies to non-qualified advisors with valid economic output, not raw activity.'],
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    tableVersion: PARTNER_PRODUCTION_BONUS_TABLE_VERSION,
    percentageCandidate: percentageForOrganization(normalizedType),
    metadata: {
      organizationType: normalizedType,
      unitLIMRA,
      unitIGC,
    },
  });
}
