import {
  getFixedSupportAmountBySemester,
} from './partner-2026-rule-pack-loader.js';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function evaluatePartnerSupportRequirementGate({
  rulePack = null,
  partnerCareerMonth = null,
  semesterIndex = null,
  accumulatedCommissions = null,
  accumulatedCommissionGoal = null,
  accumulatedCommissionGoalsEvidence = false,
  taCountingPrecontractCount = null,
  supportQualifiedPrecontractCount = null,
  taCountingAdvisorEventCount = null,
  TAWinnerCount = null,
  taCountingEventEvidence = false,
  supportTableEvidence = false,
  partnerLifecycleStatus = null,
} = {}) {
  const blockedReasons = [];
  const missingInputs = [];

  const supportAmount = getFixedSupportAmountBySemester(rulePack, { semesterIndex, partnerCareerMonth });
  if (!supportAmount.amount) {
    blockedReasons.push('invalid_semester_index');
    missingInputs.push('partnerCareerMonth');
  }

  if (!['active', 'connected_active', 'partner_active', 'manager_active'].includes(partnerLifecycleStatus)) {
    blockedReasons.push('blocked_by_partner_lifecycle');
    missingInputs.push('partnerLifecycleStatus');
  }

  if (!supportTableEvidence) {
    blockedReasons.push('blocked_by_missing_support_table');
    missingInputs.push('supportTableEvidence');
  }

  if (!hasNumber(accumulatedCommissionGoal)) {
    blockedReasons.push('blocked_by_missing_accumulated_commission_goal');
    missingInputs.push('accumulatedCommissionGoal');
  }

  if (!hasNumber(accumulatedCommissions) || accumulatedCommissionGoalsEvidence !== true) {
    blockedReasons.push('blocked_by_missing_accumulated_commission_evidence');
    if (!hasNumber(accumulatedCommissions)) missingInputs.push('accumulatedCommissions');
    if (accumulatedCommissionGoalsEvidence !== true) missingInputs.push('accumulatedCommissionGoalsEvidence');
  }

  if (hasNumber(accumulatedCommissions) && hasNumber(accumulatedCommissionGoal) && Number(accumulatedCommissions) < Number(accumulatedCommissionGoal)) {
    blockedReasons.push('blocked_by_insufficient_accumulated_commissions');
  }

  const normalizedTaCountingCount = [
    taCountingPrecontractCount,
    supportQualifiedPrecontractCount,
    taCountingAdvisorEventCount,
    TAWinnerCount,
  ].find(hasNumber);

  if (!hasNumber(normalizedTaCountingCount) || taCountingEventEvidence !== true) {
    blockedReasons.push('blocked_by_missing_TA_counting_event_evidence');
    if (!hasNumber(normalizedTaCountingCount)) missingInputs.push('taCountingPrecontractCount');
    if (taCountingEventEvidence !== true) missingInputs.push('taCountingEventEvidence');
  }

  const allowed = blockedReasons.length === 0;

  return {
    allowed,
    partnerCareerMonth: hasNumber(partnerCareerMonth) ? Number(partnerCareerMonth) : null,
    semesterIndex: supportAmount.semesterIndex,
    candidateSupportAmount: allowed ? supportAmount.amount : null,
    requiredAccumulatedCommissions: hasNumber(accumulatedCommissionGoal) ? Number(accumulatedCommissionGoal) : null,
    actualAccumulatedCommissions: hasNumber(accumulatedCommissions) ? Number(accumulatedCommissions) : null,
    blockedReasons,
    missingInputs: [...new Set(missingInputs)],
    warnings: ['Bono de Apoyo is separate from productivity multiplier.'],
    payoutTruth: false,
    createsPartnerEconomicGain: false,
    taCountingPrecontractCount: hasNumber(normalizedTaCountingCount) ? Number(normalizedTaCountingCount) : null,
    taCountingPrecontractCountsForSupportOnly: hasNumber(normalizedTaCountingCount),
  };
}
