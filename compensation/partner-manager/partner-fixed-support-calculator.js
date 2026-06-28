import * as pcv2026ApoyosOfficialContractTables005bc3 from './partner-fixed-support-contract.js';

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
  accumulatedCommissionActualLifeIndividualAndGmmi = null,
  trainingWinnerActualCountLastSixMonths = null,
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
    accumulatedCommissions: accumulatedCommissions ?? accumulatedCommissionActualLifeIndividualAndGmmi,
    accumulatedCommissionGoal,
    accumulatedCommissionGoalsEvidence,
    taCountingPrecontractCount: taCountingPrecontractCount ?? trainingWinnerActualCountLastSixMonths,
    taCountingEventEvidence,
    supportTableEvidence,
    partnerLifecycleStatus,
    rawActivityOnly,
  });

  const blockedReasons = [...fixedSupportAssessment.blockedReasons];
  const missingInputs = [...fixedSupportAssessment.missingInputs];
  const supportConcept = (rulePack || fixedSupportAssessment.metadata?.assessment?.rulePack)?.concepts?.['fixed-support'] || {};
  const officialSupportTablesPresent = Boolean(
    supportConcept.supportAmountsBySemester &&
    supportConcept.accumulatedCommissionGoals &&
    supportConcept.trainingWinnersRequirement &&
    supportConcept.commissionAchievementPaymentRule
  ) || fixedSupportAssessment.metadata?.baseSupportAmount;
  if (supportTableEvidenceRequired && supportTableEvidence !== true && !officialSupportTablesPresent && !blockedReasons.includes('blocked_by_missing_table')) {
    blockedReasons.push('blocked_by_missing_table');
  }
  if (partnerLifecycleStatus && !['connected_active', 'active', 'partner_active', 'manager_active'].includes(partnerLifecycleStatus) && !blockedReasons.includes('blocked_by_partner_inactive')) {
    blockedReasons.push('blocked_by_partner_inactive');
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
    evidenceRequirement: officialSupportTablesPresent
      ? ['accumulated_commission_actual_life_individual_and_gmmi', 'training_winner_actual_count_last_six_months', 'partner_active_status', 'official_statement_or_account_evidence_for_paid_confirmed_only']
      : ['accumulated_commission_goals_evidence', 'TA_counting_event_evidence', 'support_table_evidence'],
    metadata: {
      assessment: fixedSupportAssessment,
      taCountingPrecontractCountsForSupportOnly: true,
      createsPartnerEconomicGain: false,
      releasesHeldCommission: false,
      supportRequirementGateResult: fixedSupportAssessment.metadata?.supportRequirementGateResult || supportRequirementGateResult,
    },
  });
}

// PCV_2026_FIXED_SUPPORT_OFFICIAL_TABLES_CALCULATOR_LOCK
function normalizePcv2026FixedSupportNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function roundPcv2026FixedSupportMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function resolvePcv2026FixedSupportTaWinnersAfterFirstTwoHires(input = {}) {
  if (input.trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion !== undefined) {
    return normalizePcv2026FixedSupportNumber(
      input.trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion
    );
  }

  if (
    input.firstTwoHiresExclusionApplied === true &&
    input.trainingAdvisorWinnersLastSixMonths !== undefined
  ) {
    return normalizePcv2026FixedSupportNumber(input.trainingAdvisorWinnersLastSixMonths);
  }

  if (
    input.firstTwoHiresExclusionEvidence === true &&
    input.trainingAdvisorWinnersLastSixMonths !== undefined
  ) {
    return normalizePcv2026FixedSupportNumber(input.trainingAdvisorWinnersLastSixMonths);
  }

  return null;
}

export function calculatePcv2026FixedSupportCandidateAmount(input = {}) {
  const contractReadiness =
    pcv2026ApoyosOfficialContractTables005bc3.validatePcv2026FixedSupportOfficialContract({
      careerMonth: input.careerMonth,
      payoutTruth: input.payoutTruth,
    });

  const blockingReasons = [...contractReadiness.blockingReasons];

  const initialCommissions = normalizePcv2026FixedSupportNumber(
    input.initialCommissionsLifeAndIndividualGmm ??
      input.initialCommissionAmount ??
      input.initialCommissions ??
      input.monthlyInitialCommissions
  );

  if (initialCommissions === null) {
    blockingReasons.push('INITIAL_COMMISSIONS_EVIDENCE_REQUIRED');
  }

  const trainingAdvisorWinnersLastSixMonths =
    resolvePcv2026FixedSupportTaWinnersAfterFirstTwoHires(input);

  if (
    contractReadiness.trainingAdvisorTarget !== null &&
    contractReadiness.trainingAdvisorTarget > 0 &&
    trainingAdvisorWinnersLastSixMonths === null
  ) {
    blockingReasons.push('TRAINING_ADVISOR_WINNERS_LAST_SIX_MONTHS_EVIDENCE_REQUIRED');
  }

  if (
    contractReadiness.trainingAdvisorTarget !== null &&
    contractReadiness.trainingAdvisorTarget > 0 &&
    trainingAdvisorWinnersLastSixMonths !== null &&
    trainingAdvisorWinnersLastSixMonths < contractReadiness.trainingAdvisorTarget
  ) {
    blockingReasons.push('TRAINING_ADVISOR_WINNER_TARGET_NOT_MET');
  }

  const recoveryPreviousMonthsRequested = normalizePcv2026FixedSupportNumber(
    input.recoveryPreviousMonthsRequested ?? 0
  );

  if (recoveryPreviousMonthsRequested === null || recoveryPreviousMonthsRequested < 0) {
    blockingReasons.push('RECOVERY_PREVIOUS_MONTHS_INVALID');
  }

  if (recoveryPreviousMonthsRequested !== null && recoveryPreviousMonthsRequested > 3) {
    blockingReasons.push('RECOVERY_MAX_THREE_PREVIOUS_MONTHS_EXCEEDED');
  }

  if (
    recoveryPreviousMonthsRequested !== null &&
    recoveryPreviousMonthsRequested > 0 &&
    input.samePartnerYearRecoveryEvidence !== true
  ) {
    blockingReasons.push('SAME_PARTNER_YEAR_RECOVERY_EVIDENCE_REQUIRED');
  }

  const officialTables =
    pcv2026ApoyosOfficialContractTables005bc3.getPcv2026FixedSupportOfficialTables();
  const complianceRules = officialTables.complianceRules;
  const minimumComplianceRatio = complianceRules.minimumComplianceRatio;
  const proportionalSupportStartInclusive = complianceRules.proportionalSupportStartInclusive;
  const proportionalSupportEndExclusive = complianceRules.proportionalSupportEndExclusive;
  const fullSupportStartInclusive = complianceRules.fullSupportStartInclusive;

  const commissionComplianceRatio =
    initialCommissions !== null && contractReadiness.initialCommissionGoal
      ? initialCommissions / contractReadiness.initialCommissionGoal
      : null;

  if (commissionComplianceRatio !== null && commissionComplianceRatio < minimumComplianceRatio) {
    blockingReasons.push('MINIMUM_80_PERCENT_COMPLIANCE_NOT_MET');
  }

  if (blockingReasons.length > 0) {
    return {
      concept: 'fixed-support',
      status: 'BLOCKED_OR_UNKNOWN',
      candidateAmount: null,
      payoutTruth: false,
      calculationMode: 'candidate_with_caution',
      careerMonth: contractReadiness.careerMonth,
      semester: contractReadiness.semester,
      monthlySupportAmount: contractReadiness.monthlySupportAmount,
      initialCommissionGoal: contractReadiness.initialCommissionGoal,
      initialCommissions,
      commissionComplianceRatio,
      minimumComplianceRatio,
      proportionalSupportStartInclusive,
      proportionalSupportEndExclusive,
      fullSupportStartInclusive,
      trainingAdvisorTarget: contractReadiness.trainingAdvisorTarget,
      trainingAdvisorWinnersLastSixMonths,
      recoveryPreviousMonthsRequested,
      recoveryCandidateAmount: null,
      blockingReasons,
    };
  }

  const monthlySupportAmount = contractReadiness.monthlySupportAmount;
  const candidateAmount =
    commissionComplianceRatio >= fullSupportStartInclusive
      ? monthlySupportAmount
      : commissionComplianceRatio >= proportionalSupportStartInclusive &&
          commissionComplianceRatio < proportionalSupportEndExclusive
        ? roundPcv2026FixedSupportMoney(monthlySupportAmount * commissionComplianceRatio)
        : null;

  const recoveryCandidateAmount =
    recoveryPreviousMonthsRequested > 0
      ? roundPcv2026FixedSupportMoney(candidateAmount * recoveryPreviousMonthsRequested)
      : 0;

  return {
    concept: 'fixed-support',
    status: 'CALCULATED_CANDIDATE',
    candidateAmount,
    payoutTruth: false,
    calculationMode: 'candidate_with_caution',
    careerMonth: contractReadiness.careerMonth,
    semester: contractReadiness.semester,
    monthlySupportAmount,
    initialCommissionGoal: contractReadiness.initialCommissionGoal,
    initialCommissions,
    commissionComplianceRatio,
    minimumComplianceRatio,
    proportionalSupportStartInclusive,
    proportionalSupportEndExclusive,
    fullSupportStartInclusive,
    trainingAdvisorTarget: contractReadiness.trainingAdvisorTarget,
    trainingAdvisorWinnersLastSixMonths,
    recoveryPreviousMonthsRequested,
    recoveryCandidateAmount,
    totalCandidateAmount: roundPcv2026FixedSupportMoney(candidateAmount + recoveryCandidateAmount),
    blockingReasons: [],
  };
}
