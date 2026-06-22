import {
  validatePartner2026RulePack,
} from './partner-2026-rule-pack-validator.js';

import {
  DEFAULT_SMNYL_PARTNER_2026_RULE_PACK_PATH,
  loadDefaultSMNYLPartner2026RulePack,
  loadPartnerRulePack,
} from './rule-engine/partner-rule-pack-loader.js';

import {
  deriveSemesterIndexFromCareerMonth,
  getConcept,
  resolveBandRate,
  resolveExactOrAboveScale,
  resolveExactOrPlusScale,
  resolveSemesterAmount,
} from './rule-engine/partner-rule-resolver.js';

export const PARTNER_2026_RULE_PACK_PATH = new URL(
  './rule-data/smnyl_partner_compensation_2026_rules_canonical_draft.json',
  import.meta.url
);

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function normalizePartnerClass(partnerClass = null) {
  const value = String(partnerClass || '').trim().toLowerCase();
  if (value === 'cc') return 'CC';
  if (value === '1c') return '1C';
  if (value === '2c') return '2C';
  if (value === '3c') return '3C';
  if (value === 'consolidado' || value === 'consolidados') return 'consolidados';
  return null;
}

export function loadPartner2026RulePack({ filePath = PARTNER_2026_RULE_PACK_PATH } = {}) {
  const filePathHref = filePath?.href || String(filePath);
  const parsed = filePathHref === PARTNER_2026_RULE_PACK_PATH.href || filePathHref === DEFAULT_SMNYL_PARTNER_2026_RULE_PACK_PATH.href
    ? loadDefaultSMNYLPartner2026RulePack()
    : loadPartnerRulePack({ filePath });

  const validation = validatePartner2026RulePack(parsed);
  if (!validation.valid) {
    throw new Error(`partner_2026_rule_pack_invalid:${validation.errors.join(',')}`);
  }

  return {
    ...parsed,
    validationWarnings: validation.warnings,
  };
}

export function getPartner2026Concept(rulePack, conceptKey) {
  return getConcept(rulePack, conceptKey);
}

export function getProductivityBaseRate(rulePack, {
  averageMonthlyInitialCommissions = null,
  partnerClass = null,
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];
  const normalizedClass = normalizePartnerClass(partnerClass);
  if (!normalizedClass) {
    blockedReasons.push('blocked_by_missing_partner_class');
    missingInputs.push('partnerClass');
  }
  if (!hasNumber(averageMonthlyInitialCommissions)) {
    blockedReasons.push('blocked_by_missing_initial_commission_evidence');
    missingInputs.push('averageMonthlyInitialCommissions');
  }

  const resolved = resolveBandRate({
    bands: getConcept(rulePack, 'productivity-base')?.table?.bands || [],
    value: averageMonthlyInitialCommissions,
    classKey: normalizedClass,
  });
  blockedReasons.push(...resolved.blockedReasons);
  missingInputs.push(...resolved.missingInputs);

  return { rate: resolved.rate, band: resolved.band, partnerClass: normalizedClass, blockedReasons: [...new Set(blockedReasons)], missingInputs: [...new Set(missingInputs)] };
}

export function getProductivityMultiplierRate(rulePack, {
  qualifiedAdvisorCount = null,
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];
  if (!hasNumber(qualifiedAdvisorCount)) {
    blockedReasons.push('missing_qualified_advisor_status');
    missingInputs.push('qualifiedAdvisorCount');
  }

  const resolved = resolveExactOrAboveScale({
    scale: getConcept(rulePack, 'productivity-multiplier')?.table || [],
    value: qualifiedAdvisorCount,
    valueKey: 'qualifiedAdvisorCount',
    resultKey: 'multiplierRate',
  });
  blockedReasons.push(...resolved.blockedReasons.map((reason) => (
    reason === 'blocked_by_missing_scale_match' ? 'blocked_by_missing_multiplier_rate' : reason
  )));
  missingInputs.push(...resolved.missingInputs);

  return {
    multiplierRate: resolved.value,
    blockedReasons,
    missingInputs,
    warnings: [],
  };
}

export function getProductionBonusRate(rulePack, { organizationType = null } = {}) {
  const normalized = String(organizationType || '').trim().toLowerCase();
  const key = (normalized === 'nueva organizacion' || normalized === 'nueva organización' || normalized === 'new_organization')
    ? 'nueva_organizacion'
    : normalized;
  const rate = getConcept(rulePack, 'production-bonus')?.rates?.[key];
  return {
    organizationType: key || null,
    rate: hasNumber(rate) ? Number(rate) : null,
    blockedReasons: hasNumber(rate) ? [] : ['unknown_organization_type'],
  };
}

export function getActivityBonusRate(rulePack, { validLifeGmmPolicyCount = null } = {}) {
  const match = resolveExactOrPlusScale({
    scale: getConcept(rulePack, 'activity-bonus')?.policyScale || [],
    value: validLifeGmmPolicyCount,
    field: 'policies',
    resultKey: 'rate',
  });
  return {
    rate: match.value,
    frequency: getConcept(rulePack, 'activity-bonus')?.frequency || null,
    blockedReasons: match.blockedReasons,
  };
}

export function getConnectionBonusAmount(rulePack, {
  advisorMonth = null,
  validPolicyCount = null,
  onboardingEvidence = false,
} = {}) {
  const connection = getConcept(rulePack, 'connection-bonus');
  if (onboardingEvidence === true && !hasNumber(advisorMonth)) {
    return { amount: Number(connection?.semanticAmounts?.advisorOnboarding), blockedReasons: [] };
  }
  const match = resolveExactOrPlusScale({
    scale: connection?.monthlyPolicyScale || [],
    value: validPolicyCount,
    field: 'policies',
    resultKey: 'amount',
    extraMatch: (row) => Array.isArray(row.advisorMonths) && row.advisorMonths.includes(Number(advisorMonth)),
  });
  return { amount: match.value, blockedReasons: match.blockedReasons };
}

export function getDevelopmentBonusAmount(rulePack, {
  advisorMonth = null,
  validPolicyCount = null,
} = {}) {
  const development = getConcept(rulePack, 'development-bonus');
  const range = development?.advisorMonthRange;
  if (!hasNumber(advisorMonth) || Number(advisorMonth) < Number(range?.from) || Number(advisorMonth) > Number(range?.to)) {
    return { amount: null, blockedReasons: ['advisor_month_4_to_15_required'] };
  }
  const match = resolveExactOrPlusScale({
    scale: development?.policyScale || [],
    value: validPolicyCount,
    field: 'policies',
    resultKey: 'amount',
  });
  return { amount: match.value, blockedReasons: match.blockedReasons };
}

export function getFixedSupportAmountBySemester(rulePack, {
  semesterIndex = null,
  partnerCareerMonth = null,
} = {}) {
  const resolvedSemester = hasNumber(semesterIndex)
    ? Number(semesterIndex)
    : deriveSemesterIndexFromCareerMonth({ careerMonth: partnerCareerMonth });
  const resolved = resolveSemesterAmount({
    supportAmountsBySemester: getConcept(rulePack, 'fixed-support')?.supportAmountsBySemester || [],
    semesterIndex: resolvedSemester,
  });
  return {
    semesterIndex: resolvedSemester,
    amount: resolved.amount,
    blockedReasons: resolved.blockedReasons,
  };
}
