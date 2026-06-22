import {
  assessPartnerFixedSupport,
} from './partner-fixed-support-contract.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from './partner-safe-calculation-result.js';

export function calculatePartnerFixedSupportCandidate({
  assessment = null,
  rulePack = null,
  semesterIndex = null,
  partnerCareerMonth = null,
  supportRequirementGateResult = null,
  strictSupportRequirementGate = false,
  accumulatedCommissions = null,
  accumulatedCommissionGoal = null,
  accumulatedCommissionGoalsEvidence = false,
  taCountingPrecontractCount = null,
  taCountingEventEvidence = false,
  supportTableEvidence = false,
  supportTableEvidenceRequired = true,
  partnerLifecycleStatus = null,
  rawActivityOnly = false,
} = {}) {
  const fixedSupportAssessment = assessment || assessPartnerFixedSupport({
    rulePack,
    semesterIndex,
    partnerCareerMonth,
    supportRequirementGateResult,
    strictSupportRequirementGate,
    accumulatedCommissions,
    accumulatedCommissionGoal,
    accumulatedCommissionGoalsEvidence,
    taCountingPrecontractCount,
    taCountingEventEvidence,
    supportTableEvidence,
    partnerLifecycleStatus,
    rawActivityOnly,
  });

  const blockedReasons = [...fixedSupportAssessment.blockedReasons];
  const missingInputs = [...fixedSupportAssessment.missingInputs];
  if (supportTableEvidenceRequired && supportTableEvidence !== true && !blockedReasons.includes('blocked_by_missing_table')) {
    blockedReasons.push('blocked_by_missing_table');
  }
  if (partnerLifecycleStatus && !['connected_active', 'active', 'partner_active', 'manager_active'].includes(partnerLifecycleStatus)) {
    blockedReasons.push('blocked_by_missing_lifecycle');
  }

  return createPartnerSafeCalculationResult({
    conceptKey: 'fixed-support',
    status: blockedReasons.includes('blocked_by_missing_TA_counting_event_evidence')
      ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE
      : (
        blockedReasons.includes('blocked_by_missing_table')
          ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_TABLE
          : (
            blockedReasons.length > 0 || missingInputs.length > 0
              ? PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_EVIDENCE
              : PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE
          )
      ),
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: fixedSupportAssessment.amountCandidate,
    inputBasis: `semester:${fixedSupportAssessment.metadata?.semesterIndex ?? semesterIndex}`,
    blockedReasons,
    missingInputs,
    warnings: fixedSupportAssessment.warnings,
    sourceNotes: fixedSupportAssessment.sourceNotes,
    confidence: blockedReasons.length > 0 ? 'blocked' : 'medium',
    evidenceRequirement: ['accumulated_commission_goals_evidence', 'TA_counting_event_evidence', 'support_table_evidence'],
    metadata: {
      assessment: fixedSupportAssessment,
      taCountingPrecontractCountsForSupportOnly: true,
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
      supportRequirementGateResult: fixedSupportAssessment.metadata?.supportRequirementGateResult || supportRequirementGateResult,
    },
  });
}
