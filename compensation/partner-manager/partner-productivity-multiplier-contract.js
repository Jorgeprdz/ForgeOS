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
export const TRAINING_WINNER_EVENT_NOTE = 'Training winner/precontract evidence determines the productivity bonus pay factor candidate; it is not confirmed payout.';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function assessPartnerProductivityMultiplier({
  rulePack = null,
  productivityBaseAssessment = null,
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
  const minimumConfig = activeRulePack?.concepts?.[PARTNER_PRODUCTIVITY_MULTIPLIER_CONCEPT_KEY]?.minimumQualifiedAdvisorsByPartnerCareerMonth;
  const explicitMinimumRequirement = [minimumQualifiedAdvisorRequirement, multiplierMinimumRequirement].find(hasNumber);
  let resolvedMinimumRequirement = hasNumber(explicitMinimumRequirement)
    ? Number(explicitMinimumRequirement)
    : null;

  if (!hasNumber(resolvedMinimumRequirement) && hasNumber(partnerCareerMonth)) {
    const configuredRule = (minimumConfig?.rules || []).find((rule) => (
      hasNumber(rule.fromPartnerCareerMonth) &&
      hasNumber(rule.toPartnerCareerMonth) &&
      Number(partnerCareerMonth) >= Number(rule.fromPartnerCareerMonth) &&
      Number(partnerCareerMonth) <= Number(rule.toPartnerCareerMonth)
    )) || null;
    if (hasNumber(configuredRule?.minimumQualifiedAdvisorRequirement)) {
      resolvedMinimumRequirement = Number(configuredRule.minimumQualifiedAdvisorRequirement);
    }
  }

  if (hasNumber(resolvedMinimumRequirement) && Array.isArray(minimumConfig?.allowedMinimums) && !minimumConfig.allowedMinimums.map(Number).includes(Number(resolvedMinimumRequirement))) {
    blockedReasons.push('blocked_by_missing_multiplier_minimum_requirement');
    missingInputs.push('minimumQualifiedAdvisorRequirement');
  } else if (!hasNumber(resolvedMinimumRequirement) && hasNumber(partnerCareerMonth)) {
    blockedReasons.push('blocked_by_missing_multiplier_minimum_requirement');
    missingInputs.push('minimumQualifiedAdvisorRequirement');
  } else if (
    hasNumber(resolvedMinimumRequirement) &&
    hasNumber(qualifiedAdvisorCount) &&
    Number(qualifiedAdvisorCount) < Number(resolvedMinimumRequirement)
  ) {
    blockedReasons.push('blocked_by_insufficient_qualified_advisors_for_partner_career_month');
  }

  const multiplierRateResult = getProductivityMultiplierRate(activeRulePack, {
    qualifiedAdvisorCount,
  });
  const percentageCandidate = multiplierRateResult.multiplierRate;
  if (hasNumber(qualifiedAdvisorCount) && percentageCandidate === null) {
    blockedReasons.push('blocked_by_missing_multiplier_rate');
  }

  const normalizedTaCountingCount = [
    taCountingPrecontractCount,
    supportQualifiedPrecontractCount,
    taCountingAdvisorEventCount,
    TAWinnerCount,
  ].find(hasNumber);
  const resolvedTrainingWinnerInQuarter = [
    trainingWinnerInQuarter,
    signedPrecontractInQuarter,
    taCountingEventInQuarter,
    taCountingEventEvidence === true ? true : null,
    hasNumber(normalizedTaCountingCount) ? Number(normalizedTaCountingCount) > 0 : null,
  ].find((value) => value === true || value === false);
  const payFactorRule = activeRulePack?.concepts?.[PARTNER_PRODUCTIVITY_MULTIPLIER_CONCEPT_KEY]?.trainingWinnerPayFactor;
  const payFactor = resolvedTrainingWinnerInQuarter === true
    ? payFactorRule?.withTrainingWinnerInQuarter?.payFactor
    : (
      resolvedTrainingWinnerInQuarter === false
        ? payFactorRule?.withoutTrainingWinnerInQuarter?.payFactor
        : null
    );
  let payFactorBlocked = false;
  if (resolvedTrainingWinnerInQuarter === false) {
    warnings.push(payFactorRule?.withoutTrainingWinnerInQuarter?.reason || 'reduced_by_missing_training_winner_in_quarter');
  } else if (resolvedTrainingWinnerInQuarter === null || resolvedTrainingWinnerInQuarter === undefined) {
    blockedReasons.push('blocked_by_missing_training_winner_evidence_policy');
    missingInputs.push('trainingWinnerInQuarter');
    payFactorBlocked = true;
  }

  let effectiveMultiplierCandidate = percentageCandidate;
  warnings.push(...(multiplierRateResult.warnings || []));

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PRODUCTIVITY_MULTIPLIER_CONCEPT_KEY,
    readiness: blockedReasons.length > 0 || missingInputs.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_TA_RESULT
      : PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationAllowed: true,
    requiredInputs: ['productivityBaseAssessment', 'qualifiedAdvisorCount', 'partnerCareerMonth or multiplierMinimumRequirement config', 'trainingWinnerInQuarter or signedPrecontractInQuarter for pay factor'],
    missingInputs,
    blockedReasons,
    warnings,
    sourceNotes: [
      'SMNYL Partner Compensation 2026 page 7.',
      'Bono Base + (Bono Base x multiplier) = total candidate.',
      TRAINING_WINNER_EVENT_NOTE,
      'Training/precontract evidence may reduce the candidate pay factor; it does not create payout truth.',
    ],
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    tableVersion: PARTNER_PRODUCTIVITY_MULTIPLIER_TABLE_VERSION,
    percentageCandidate: effectiveMultiplierCandidate,
    metadata: {
      rawMultiplierCandidate: percentageCandidate,
      multiplierRate: percentageCandidate,
      qualifiedAdvisorCount,
      partnerCareerMonth: hasNumber(partnerCareerMonth) ? Number(partnerCareerMonth) : null,
      minimumQualifiedAdvisorRequirement: resolvedMinimumRequirement,
      taCountingPrecontractCount: normalizedTaCountingCount ?? null,
      trainingWinnerInQuarter: resolvedTrainingWinnerInQuarter ?? null,
      taCountingEventEvidence,
      legacyTAWinnerCountAlias: TAWinnerCount,
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
      periodType,
      payFactor: hasNumber(payFactor) ? Number(payFactor) : null,
      payFactorBlocked,
      rulePackId: activeRulePack?.rulePackId || null,
      enforceSupportRequirementGate,
      supportRequirementGateResult,
    },
  });
}
