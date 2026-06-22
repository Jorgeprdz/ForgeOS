import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

import {
  getFixedSupportAmountBySemester,
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

import {
  evaluatePartnerSupportRequirementGate,
} from './partner-support-requirement-gate.js';

export const PARTNER_FIXED_SUPPORT_CONCEPT_KEY = 'fixed-support';
export const PARTNER_FIXED_SUPPORT_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_12_FIXED_SUPPORT';
export const FIXED_SUPPORT_TA_COUNTING_EVENT_NOTE = 'TA-counting precontract/advisor event may count for Partner support eligibility, but it is not a paid bonus and does not release Partner economic gain.';

const DEFAULT_PARTNER_2026_RULE_PACK = loadPartner2026RulePack();

export const FIXED_SUPPORT_AMOUNTS_BY_SEMESTER = Object.freeze(Object.fromEntries(
  (DEFAULT_PARTNER_2026_RULE_PACK.concepts?.['fixed-support']?.supportAmountsBySemester || [])
    .map((row) => [row.semester, row.amount])
));

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function assessPartnerFixedSupport({
  rulePack = null,
  semesterIndex = null,
  partnerCareerMonth = null,
  supportRequirementGateResult = null,
  strictSupportRequirementGate = false,
  accumulatedCommissions = null,
  accumulatedCommissionGoal = null,
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
  const activeRulePack = rulePack || DEFAULT_PARTNER_2026_RULE_PACK;
  const jsonAmount = getFixedSupportAmountBySemester(activeRulePack, { semesterIndex, partnerCareerMonth });
  const resolvedSemesterIndex = jsonAmount?.semesterIndex ?? semesterIndex;
  const resolvedSupportRequirementGate = supportRequirementGateResult || evaluatePartnerSupportRequirementGate({
    rulePack: activeRulePack,
    partnerCareerMonth,
    semesterIndex: resolvedSemesterIndex,
    accumulatedCommissions,
    accumulatedCommissionGoal,
    accumulatedCommissionGoalsEvidence,
    taCountingPrecontractCount,
    supportQualifiedPrecontractCount,
    taCountingAdvisorEventCount,
    taCountingEventEvidence,
    TAWinnerCount,
    supportTableEvidence,
    partnerLifecycleStatus,
  });
  const amountCandidate = jsonAmount.amount;

  if (!amountCandidate) {
    missingInputs.push('semesterIndex');
    blockedReasons.push('invalid_semester_index');
  }

  if (resolvedSupportRequirementGate?.allowed === false) {
    blockedReasons.push(...resolvedSupportRequirementGate.blockedReasons);
    missingInputs.push(...resolvedSupportRequirementGate.missingInputs);
  } else if (!resolvedSupportRequirementGate && strictSupportRequirementGate) {
    blockedReasons.push('blocked_by_missing_support_requirement_gate');
    missingInputs.push('supportRequirementGateResult');
  }

  const normalizedTaCountingCount = [
    taCountingPrecontractCount,
    supportQualifiedPrecontractCount,
    taCountingAdvisorEventCount,
    TAWinnerCount,
  ].find(hasNumber);

  if (!accumulatedCommissionGoalsEvidence) blockedReasons.push('blocked_by_missing_accumulated_commission_evidence');
  if (!hasNumber(accumulatedCommissionGoal)) blockedReasons.push('blocked_by_missing_accumulated_commission_goal');
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
    requiredInputs: ['semesterIndex', 'supportRequirementGateResult', 'accumulatedCommissionGoalsEvidence', 'taCountingEventEvidence', 'supportTableEvidence'],
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
      semesterIndex: resolvedSemesterIndex,
      partnerCareerMonth,
      rulePackId: activeRulePack?.rulePackId || null,
      taCountingPrecontractCount: normalizedTaCountingCount ?? null,
      taCountingEventEvidence,
      legacyTAWinnerCountAlias: TAWinnerCount,
      partnerLifecycleStatus,
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
      supportRequirementGateResult: resolvedSupportRequirementGate,
    },
  });
}
