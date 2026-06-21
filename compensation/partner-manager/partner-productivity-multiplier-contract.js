import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

export const PARTNER_PRODUCTIVITY_MULTIPLIER_CONCEPT_KEY = 'productivity-multiplier';
export const PARTNER_PRODUCTIVITY_MULTIPLIER_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_7_PRODUCTIVITY_MULTIPLIER';
export const TA_COUNTING_EVENT_NOTE = 'TAWinnerCount means TA-counting signed precontract/advisor event for Partner support qualification, not confirmed payout.';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function multiplierForQualifiedCount(count) {
  if (!hasNumber(count)) return null;
  if (Number(count) >= 10) return 1;
  if (Number(count) >= 5) return 0.5;
  if (Number(count) >= 3) return 0.3;
  return null;
}

export function assessPartnerProductivityMultiplier({
  productivityBaseAssessment = null,
  qualifiedAdvisorCount = null,
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

  if (!hasNumber(qualifiedAdvisorCount)) {
    missingInputs.push('qualifiedAdvisorCount');
    blockedReasons.push('missing_qualified_advisor_status');
  }

  const percentageCandidate = multiplierForQualifiedCount(qualifiedAdvisorCount);
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
  if (percentageCandidate === 1) {
    if (!hasNumber(normalizedTaCountingCount) || taCountingEventEvidence !== true) {
      blockedReasons.push('blocked_by_missing_TA_counting_event_evidence');
      missingInputs.push('taCountingEventEvidence');
    } else if (Number(normalizedTaCountingCount) < 1) {
      effectiveMultiplierCandidate = 0.8;
      warnings.push('100_percent_multiplier_requires_TA_counting_event; without support-qualified event only 80_percent_total_candidate applies.');
    }
  }

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PRODUCTIVITY_MULTIPLIER_CONCEPT_KEY,
    readiness: blockedReasons.length > 0 || missingInputs.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_TA_RESULT
      : PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationAllowed: true,
    requiredInputs: ['productivityBaseAssessment', 'qualifiedAdvisorCount', 'taCountingEventEvidence when 10+ qualified advisors'],
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
    },
  });
}
