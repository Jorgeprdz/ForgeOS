import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

import {
  getProductivityMultiplierRate,
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

export const PARTNER_PRODUCTIVITY_MULTIPLIER_CONCEPT_KEY = 'productivity-multiplier';
export const PARTNER_PRODUCTIVITY_MULTIPLIER_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_7_PRODUCTIVITY_MULTIPLIER';
export const TA_COUNTING_EVENT_NOTE = 'TAWinnerCount means TA-counting signed precontract/advisor event for Partner support qualification, not confirmed payout.';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function assessPartnerProductivityMultiplier({
  rulePack = null,
  productivityBaseAssessment = null,
  qualifiedAdvisorCount = null,
  supportRequirementGateResult = null,
  enforceSupportRequirementGate = false,
  taCountingPrecontractCount = null,
  supportQualifiedPrecontractCount = null,
  taCountingAdvisorEventCount = null,
  taCountingEventEvidence = false,
  TAWinnerCount = null,
  periodType = null,
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];
  const warnings = [];

  if (!productivityBaseAssessment || productivityBaseAssessment.calculationAllowed !== true) {
    blockedReasons.push('missing_base_result');
  }

  if (enforceSupportRequirementGate === true && supportRequirementGateResult?.allowed === false) {
    blockedReasons.push(...supportRequirementGateResult.blockedReasons);
    missingInputs.push(...supportRequirementGateResult.missingInputs);
  } else if (!supportRequirementGateResult && enforceSupportRequirementGate === true) {
    blockedReasons.push('blocked_by_missing_support_requirement_gate');
    missingInputs.push('supportRequirementGateResult');
  } else if (supportRequirementGateResult?.allowed === false) {
    warnings.push('support_requirement_gate_ignored_for_multiplier_without_explicit_official_config');
  }

  if (!hasNumber(qualifiedAdvisorCount)) {
    missingInputs.push('qualifiedAdvisorCount');
    blockedReasons.push('missing_qualified_advisor_status');
  }

  const activeRulePack = rulePack || loadPartner2026RulePack();
  const multiplierRateResult = getProductivityMultiplierRate(activeRulePack, {
    qualifiedAdvisorCount,
    taCountingEventEvidence,
  });
  const percentageCandidate = multiplierRateResult.multiplierRate;
  if (hasNumber(qualifiedAdvisorCount) && percentageCandidate === null) {
    blockedReasons.push('below_minimum_qualified_advisors');
  }

  const normalizedTaCountingCount = [
    taCountingPrecontractCount,
    supportQualifiedPrecontractCount,
    taCountingAdvisorEventCount,
    TAWinnerCount,
  ].find(hasNumber);

  let effectiveMultiplierCandidate = percentageCandidate;
  let effectiveTotalCandidateRate = multiplierRateResult?.effectiveTotalCandidateRate || null;
  warnings.push(...(multiplierRateResult.warnings || []));

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PRODUCTIVITY_MULTIPLIER_CONCEPT_KEY,
    readiness: blockedReasons.length > 0 || missingInputs.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_TA_RESULT
      : PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationAllowed: true,
    requiredInputs: ['productivityBaseAssessment', 'qualifiedAdvisorCount', 'supportRequirementGateResult', 'taCountingEventEvidence when 10+ qualified advisors'],
    missingInputs,
    blockedReasons,
    warnings,
    sourceNotes: [
      'SMNYL Partner Compensation 2026 page 7.',
      'Bono Base + (Bono Base x multiplier) = total candidate.',
      TA_COUNTING_EVENT_NOTE,
      'TA-counting event may support eligibility; it does not create economic gain or payout truth.',
    ],
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    tableVersion: PARTNER_PRODUCTIVITY_MULTIPLIER_TABLE_VERSION,
    percentageCandidate: effectiveMultiplierCandidate,
    metadata: {
      rawMultiplierCandidate: percentageCandidate,
      qualifiedAdvisorCount,
      taCountingPrecontractCount: normalizedTaCountingCount ?? null,
      taCountingEventEvidence,
      legacyTAWinnerCountAlias: TAWinnerCount,
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
      periodType,
      effectiveTotalCandidateRate,
      rulePackId: activeRulePack?.rulePackId || null,
      enforceSupportRequirementGate,
      supportRequirementGateResult,
    },
  });
}
