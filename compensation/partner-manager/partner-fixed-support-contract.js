import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

export const PARTNER_FIXED_SUPPORT_CONCEPT_KEY = 'fixed-support';
export const PARTNER_FIXED_SUPPORT_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_12_FIXED_SUPPORT';
export const FIXED_SUPPORT_TA_COUNTING_EVENT_NOTE = 'TA-counting precontract/advisor event may count for Partner support eligibility, but it is not a paid bonus and does not release Partner economic gain.';

export const FIXED_SUPPORT_AMOUNTS_BY_SEMESTER = Object.freeze({
  1: 65000,
  2: 54000,
  3: 43500,
  4: 32500,
  5: 21500,
  6: 11000,
});

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function assessPartnerFixedSupport({
  semesterIndex = null,
  accumulatedCommissionGoalsEvidence = false,
  taCountingPrecontractCount = null,
  supportQualifiedPrecontractCount = null,
  taCountingAdvisorEventCount = null,
  taCountingEventEvidence = false,
  TAWinnerCount = null,
  supportTableEvidence = false,
  partnerLifecycleStatus = null,
  rawActivityOnly = false,
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];
  const amountCandidate = hasNumber(semesterIndex)
    ? FIXED_SUPPORT_AMOUNTS_BY_SEMESTER[Number(semesterIndex)] || null
    : null;

  if (!amountCandidate) {
    missingInputs.push('semesterIndex');
    blockedReasons.push('invalid_semester_index');
  }

  const normalizedTaCountingCount = [
    taCountingPrecontractCount,
    supportQualifiedPrecontractCount,
    taCountingAdvisorEventCount,
    TAWinnerCount,
  ].find(hasNumber);

  if (!accumulatedCommissionGoalsEvidence) blockedReasons.push('missing_accumulated_commission_evidence');
  if (!hasNumber(normalizedTaCountingCount) || taCountingEventEvidence !== true) {
    blockedReasons.push('blocked_by_missing_TA_counting_event_evidence');
  }
  if (!supportTableEvidence) blockedReasons.push('blocked_by_missing_table');
  if (rawActivityOnly) blockedReasons.push('activity_only_cannot_satisfy_commission_goals');

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_FIXED_SUPPORT_CONCEPT_KEY,
    readiness: blockedReasons.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_TABLE
      : PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationAllowed: true,
    requiredInputs: ['semesterIndex', 'accumulatedCommissionGoalsEvidence', 'taCountingEventEvidence', 'supportTableEvidence'],
    missingInputs,
    blockedReasons,
    warnings: supportTableEvidence
      ? ['Fixed support amount is semantic candidate; payout truth requires official statement/payment evidence.', FIXED_SUPPORT_TA_COUNTING_EVENT_NOTE]
      : ['Support table is missing; full calculation remains blocked.', FIXED_SUPPORT_TA_COUNTING_EVENT_NOTE],
    sourceNotes: ['SMNYL Partner Compensation 2026 page 12.', FIXED_SUPPORT_TA_COUNTING_EVENT_NOTE],
    confidence: blockedReasons.length > 0 ? 'blocked' : 'medium',
    tableVersion: PARTNER_FIXED_SUPPORT_TABLE_VERSION,
    amountCandidate,
    metadata: {
      semesterIndex,
      taCountingPrecontractCount: normalizedTaCountingCount ?? null,
      taCountingEventEvidence,
      legacyTAWinnerCountAlias: TAWinnerCount,
      partnerLifecycleStatus,
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
    },
  });
}
