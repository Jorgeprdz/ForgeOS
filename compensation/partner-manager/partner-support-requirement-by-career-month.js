export const PARTNER_SUPPORT_REQUIREMENT_STATUSES = Object.freeze({
  REQUIREMENT_MET: 'requirement_met',
  REQUIREMENT_BLOCKED: 'requirement_blocked',
  REQUIREMENT_UNKNOWN: 'requirement_unknown',
  BLOCKED_BY_UNKNOWN_PARTNER_CAREER_MONTH: 'blocked_by_unknown_partner_career_month',
  BLOCKED_BY_MISSING_SUPPORT_TABLE: 'blocked_by_missing_support_table',
  BLOCKED_BY_MISSING_QUALIFIED_ADVISOR_REQUIREMENT: 'blocked_by_missing_qualified_advisor_requirement',
  BLOCKED_BY_INSUFFICIENT_QUALIFIED_ADVISORS_FOR_PARTNER_MONTH: 'blocked_by_insufficient_qualified_advisors_for_partner_month',
  BLOCKED_BY_MISSING_ACCUMULATED_COMMISSION_GOAL: 'blocked_by_missing_accumulated_commission_goal',
  BLOCKED_BY_MISSING_ACCUMULATED_COMMISSION_EVIDENCE: 'blocked_by_missing_accumulated_commission_evidence',
  BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE: 'blocked_by_missing_TA_counting_event_evidence',
  BLOCKED_BY_PARTNER_LIFECYCLE: 'blocked_by_partner_lifecycle',
  UNKNOWN: 'unknown',
});

const ACTIVE_PARTNER_STATUSES = new Set(['active', 'connected_active', 'partner_active', 'manager_active']);

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function careerBandForMonth(partnerCareerMonth) {
  if (!hasNumber(partnerCareerMonth)) return 'unknown';
  const month = Number(partnerCareerMonth);
  if (month <= 0) return 'unknown';
  if (month <= 6) return 'month_1_6';
  if (month <= 12) return 'month_7_12';
  if (month <= 24) return 'month_13_24';
  return 'month_25_plus';
}

function addUnique(target, value) {
  if (!target.includes(value)) target.push(value);
}

function primaryStatus(blockedReasons) {
  if (blockedReasons.length === 0) return PARTNER_SUPPORT_REQUIREMENT_STATUSES.REQUIREMENT_MET;
  return blockedReasons[0] || PARTNER_SUPPORT_REQUIREMENT_STATUSES.REQUIREMENT_BLOCKED;
}

export function evaluatePartnerSupportRequirementByCareerMonth({
  partnerCareerMonth = null,
  qualifiedAdvisorCount = null,
  requiredQualifiedAdvisorCount = null,
  accumulatedCommissions = null,
  accumulatedCommissionGoal = null,
  accumulatedCommissionEvidence = false,
  taCountingPrecontractCount = null,
  taCountingEventEvidence = false,
  taCountingEventRequired = true,
  supportTableEvidence = false,
  supportTableEvidenceRequired = true,
  partnerLifecycleStatus = null,
  sourceRuleConfidence = 'unknown',
  sourceNotes = [],
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];
  const warnings = [
    'Support requirements are configuration-driven until the official support table is modeled.',
    'TA-counting precontract/advisor event supports eligibility only; it is not payout truth.',
  ];

  if (!hasNumber(partnerCareerMonth) || Number(partnerCareerMonth) <= 0) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_UNKNOWN_PARTNER_CAREER_MONTH);
    addUnique(missingInputs, 'partnerCareerMonth');
  }

  if (partnerLifecycleStatus && !ACTIVE_PARTNER_STATUSES.has(partnerLifecycleStatus)) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_PARTNER_LIFECYCLE);
  }

  if (supportTableEvidenceRequired && supportTableEvidence !== true) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_SUPPORT_TABLE);
    addUnique(missingInputs, 'supportTableEvidence');
  }

  if (!hasNumber(requiredQualifiedAdvisorCount)) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_QUALIFIED_ADVISOR_REQUIREMENT);
    addUnique(missingInputs, 'requiredQualifiedAdvisorCount');
  }

  if (!hasNumber(qualifiedAdvisorCount)) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_INSUFFICIENT_QUALIFIED_ADVISORS_FOR_PARTNER_MONTH);
    addUnique(missingInputs, 'qualifiedAdvisorCount');
  } else if (hasNumber(requiredQualifiedAdvisorCount) && Number(qualifiedAdvisorCount) < Number(requiredQualifiedAdvisorCount)) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_INSUFFICIENT_QUALIFIED_ADVISORS_FOR_PARTNER_MONTH);
  }

  if (!hasNumber(accumulatedCommissionGoal)) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_ACCUMULATED_COMMISSION_GOAL);
    addUnique(missingInputs, 'accumulatedCommissionGoal');
  }

  if (accumulatedCommissionEvidence !== true || !hasNumber(accumulatedCommissions)) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_ACCUMULATED_COMMISSION_EVIDENCE);
    if (accumulatedCommissionEvidence !== true) addUnique(missingInputs, 'accumulatedCommissionEvidence');
    if (!hasNumber(accumulatedCommissions)) addUnique(missingInputs, 'accumulatedCommissions');
  }

  if (taCountingEventRequired && (!hasNumber(taCountingPrecontractCount) || taCountingEventEvidence !== true)) {
    addUnique(blockedReasons, PARTNER_SUPPORT_REQUIREMENT_STATUSES.BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE);
    if (!hasNumber(taCountingPrecontractCount)) addUnique(missingInputs, 'taCountingPrecontractCount');
    if (taCountingEventEvidence !== true) addUnique(missingInputs, 'taCountingEventEvidence');
  }

  const allowed = blockedReasons.length === 0;
  const status = primaryStatus(blockedReasons);

  return {
    partnerCareerMonth: hasNumber(partnerCareerMonth) ? Number(partnerCareerMonth) : null,
    careerBand: careerBandForMonth(partnerCareerMonth),
    requiredQualifiedAdvisorCount: hasNumber(requiredQualifiedAdvisorCount) ? Number(requiredQualifiedAdvisorCount) : null,
    actualQualifiedAdvisorCount: hasNumber(qualifiedAdvisorCount) ? Number(qualifiedAdvisorCount) : null,
    requiredAccumulatedCommissions: hasNumber(accumulatedCommissionGoal) ? Number(accumulatedCommissionGoal) : null,
    actualAccumulatedCommissions: hasNumber(accumulatedCommissions) ? Number(accumulatedCommissions) : null,
    supportRequirementStatus: allowed ? PARTNER_SUPPORT_REQUIREMENT_STATUSES.REQUIREMENT_MET : status,
    multiplierEligibilityStatus: allowed ? PARTNER_SUPPORT_REQUIREMENT_STATUSES.REQUIREMENT_MET : status,
    fixedSupportEligibilityStatus: allowed ? PARTNER_SUPPORT_REQUIREMENT_STATUSES.REQUIREMENT_MET : status,
    allowed,
    blockedReasons,
    missingInputs,
    warnings,
    confidence: allowed ? sourceRuleConfidence : 'blocked',
    sourceNotes: [
      ...sourceNotes,
      'Configuration-driven Partner support gate; no missing support table values are invented.',
    ],
    payoutTruth: false,
    createsPartnerEconomicGain: false,
    releasesHeldCommission: false,
    unknownIsZero: false,
    blockedIsZero: false,
    metadata: {
      supportTableEvidence,
      supportTableEvidenceRequired,
      taCountingEventRequired,
      taCountingPrecontractCountsForSupportOnly: hasNumber(taCountingPrecontractCount),
    },
  };
}
