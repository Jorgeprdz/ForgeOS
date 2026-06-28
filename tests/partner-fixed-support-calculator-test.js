import assert from 'node:assert/strict';

import {
  FIXED_SUPPORT_AMOUNTS_BY_SEMESTER,
} from '../compensation/partner-manager/partner-fixed-support-contract.js';

import {
  calculatePartnerFixedSupportCandidate,
} from '../compensation/partner-manager/partner-fixed-support-calculator.js';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const rulePack = loadPartner2026RulePack();

const blockedSupportGate = {
  allowed: false,
  blockedReasons: ['blocked_by_insufficient_qualified_advisors_for_partner_month'],
  missingInputs: [],
};

for (const [semester, amount] of Object.entries(FIXED_SUPPORT_AMOUNTS_BY_SEMESTER)) {
  const result = calculatePartnerFixedSupportCandidate({
    semesterIndex: Number(semester),
    accumulatedCommissions: 100000,
    accumulatedCommissionGoal: 90000,
    accumulatedCommissionGoalsEvidence: true,
    taCountingPrecontractCount: 1,
    taCountingEventEvidence: true,
    supportTableEvidence: true,
    partnerLifecycleStatus: 'active',
  });
  assert.equal(result.candidateAmount, amount);
  assert.equal(result.payoutTruth, false);
  assert.equal(result.metadata.taCountingPrecontractCountsForSupportOnly, true);
}

const missingGoals = calculatePartnerFixedSupportCandidate({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(missingGoals.blockedReasons.includes('blocked_by_missing_accumulated_commission_evidence'), false);
assert.equal(missingGoals.candidateAmount, 65000);

const officialJsonMonth25 = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 3,
  supportTableEvidence: true,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(officialJsonMonth25.candidateAmount, 21500);
assert.equal(officialJsonMonth25.metadata.assessment.metadata.semesterIndex, 5);

const officialV1WithoutSupportTableEvidence = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionActualLifeIndividualAndGmmi: 65025,
  accumulatedCommissionGoalsEvidence: true,
  trainingWinnerActualCountLastSixMonths: 3,
  supportTableEvidence: false,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(officialV1WithoutSupportTableEvidence.candidateAmount, 18275);
assert.equal(officialV1WithoutSupportTableEvidence.blockedReasons.includes('blocked_by_missing_table'), false);
assert.equal(officialV1WithoutSupportTableEvidence.evidenceRequirement.includes('support_table_evidence'), false);

const officialV1MissingActualCommissions = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionGoalsEvidence: true,
  trainingWinnerActualCountLastSixMonths: 3,
  supportTableEvidence: false,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(officialV1MissingActualCommissions.blockedReasons.includes('blocked_by_missing_accumulated_commission_actual'), true);
assert.equal(officialV1MissingActualCommissions.blockedReasons.includes('blocked_by_missing_table'), false);
assert.equal(officialV1MissingActualCommissions.evidenceRequirement.includes('support_table_evidence'), false);

const missingTa = calculatePartnerFixedSupportCandidate({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  supportTableEvidence: true,
});
assert.ok(missingTa.blockedReasons.includes('blocked_by_missing_training_winner_count'));

const missingTable = calculatePartnerFixedSupportCandidate({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 0,
  supportTableEvidence: false,
  partnerLifecycleStatus: 'partner_active',
});
assert.equal(missingTable.blockedReasons.includes('blocked_by_missing_table'), false);
assert.equal(missingTable.candidateAmount, 65000);

const monthGateBlocked = calculatePartnerFixedSupportCandidate({
  semesterIndex: 1,
  accumulatedCommissions: 100000,
  accumulatedCommissionGoal: 90000,
  supportRequirementGateResult: blockedSupportGate,
  accumulatedCommissionGoalsEvidence: true,
  taCountingPrecontractCount: 1,
  taCountingEventEvidence: true,
  supportTableEvidence: true,
});
assert.equal(monthGateBlocked.calculationAllowed, false);
assert.equal(monthGateBlocked.candidateAmount, null);
assert.ok(monthGateBlocked.blockedReasons.includes('blocked_by_insufficient_qualified_advisors_for_partner_month'));

// PCV_2026_FIXED_SUPPORT_OFFICIAL_TABLES_CALCULATOR_TEST
{
  const pcv2026FixedSupportCalculator = await import(
    '../compensation/partner-manager/partner-fixed-support-calculator.js'
  );

  const fullSupport = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 1,
    initialCommissionsLifeAndIndividualGmm: 14500,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 0,
    payoutTruth: false,
  });

  assert.equal(fullSupport.status, 'CALCULATED_CANDIDATE');
  assert.equal(fullSupport.candidateAmount, 65000);
  assert.equal(fullSupport.totalCandidateAmount, 65000);
  assert.equal(fullSupport.payoutTruth, false);
  assert.equal(fullSupport.monthlySupportAmount, 65000);
  assert.equal(fullSupport.initialCommissionGoal, 14500);
  assert.equal(fullSupport.trainingAdvisorTarget, 0);
  assert.equal(fullSupport.minimumComplianceRatio, 0.8);
  assert.equal(fullSupport.proportionalSupportStartInclusive, 0.8);
  assert.equal(fullSupport.proportionalSupportEndExclusive, 1);
  assert.equal(fullSupport.fullSupportStartInclusive, 1);
  assert.deepEqual(fullSupport.blockingReasons, []);

  const proportionalSupport = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 1,
    initialCommissionsLifeAndIndividualGmm: 11600,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 0,
    payoutTruth: false,
  });

  assert.equal(proportionalSupport.status, 'CALCULATED_CANDIDATE');
  assert.equal(proportionalSupport.candidateAmount, 52000);
  assert.equal(proportionalSupport.payoutTruth, false);

  const blockedBelowMinimum = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 1,
    initialCommissionsLifeAndIndividualGmm: 11599,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 0,
    payoutTruth: false,
  });

  assert.equal(blockedBelowMinimum.status, 'BLOCKED_OR_UNKNOWN');
  assert.equal(blockedBelowMinimum.candidateAmount, null);
  assert.equal(
    blockedBelowMinimum.blockingReasons.includes('MINIMUM_80_PERCENT_COMPLIANCE_NOT_MET'),
    true
  );

  const monthSixTaTargetMet = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 6,
    initialCommissionsLifeAndIndividualGmm: 33000,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 3,
    payoutTruth: false,
  });

  assert.equal(monthSixTaTargetMet.status, 'CALCULATED_CANDIDATE');
  assert.equal(monthSixTaTargetMet.candidateAmount, 65000);
  assert.equal(monthSixTaTargetMet.trainingAdvisorTarget, 3);

  const monthSixTaTargetMissing = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 6,
    initialCommissionsLifeAndIndividualGmm: 33000,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 2,
    payoutTruth: false,
  });

  assert.equal(monthSixTaTargetMissing.status, 'BLOCKED_OR_UNKNOWN');
  assert.equal(monthSixTaTargetMissing.candidateAmount, null);
  assert.equal(
    monthSixTaTargetMissing.blockingReasons.includes('TRAINING_ADVISOR_WINNER_TARGET_NOT_MET'),
    true
  );

  const blockedWithoutFirstTwoEvidence = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 6,
    initialCommissionsLifeAndIndividualGmm: 33000,
    trainingAdvisorWinnersLastSixMonths: 3,
    payoutTruth: false,
  });

  assert.equal(blockedWithoutFirstTwoEvidence.status, 'BLOCKED_OR_UNKNOWN');
  assert.equal(blockedWithoutFirstTwoEvidence.candidateAmount, null);
  assert.equal(
    blockedWithoutFirstTwoEvidence.blockingReasons.includes(
      'TRAINING_ADVISOR_WINNERS_LAST_SIX_MONTHS_EVIDENCE_REQUIRED'
    ),
    true
  );

  const recoveryCandidate = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 7,
    initialCommissionsLifeAndIndividualGmm: 40000,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 3,
    recoveryPreviousMonthsRequested: 2,
    samePartnerYearRecoveryEvidence: true,
    payoutTruth: false,
  });

  assert.equal(recoveryCandidate.status, 'CALCULATED_CANDIDATE');
  assert.equal(recoveryCandidate.candidateAmount, 54000);
  assert.equal(recoveryCandidate.recoveryCandidateAmount, 108000);
  assert.equal(recoveryCandidate.totalCandidateAmount, 162000);
  assert.equal(recoveryCandidate.payoutTruth, false);

  const blockedRecoveryOverThree = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 7,
    initialCommissionsLifeAndIndividualGmm: 40000,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 3,
    recoveryPreviousMonthsRequested: 4,
    samePartnerYearRecoveryEvidence: true,
    payoutTruth: false,
  });

  assert.equal(blockedRecoveryOverThree.status, 'BLOCKED_OR_UNKNOWN');
  assert.equal(blockedRecoveryOverThree.candidateAmount, null);
  assert.equal(
    blockedRecoveryOverThree.blockingReasons.includes('RECOVERY_MAX_THREE_PREVIOUS_MONTHS_EXCEEDED'),
    true
  );

  const blockedPayoutTruth = pcv2026FixedSupportCalculator.calculatePcv2026FixedSupportCandidateAmount({
    careerMonth: 1,
    initialCommissionsLifeAndIndividualGmm: 14500,
    firstTwoHiresExclusionApplied: true,
    trainingAdvisorWinnersLastSixMonths: 0,
    payoutTruth: true,
  });

  assert.equal(blockedPayoutTruth.status, 'BLOCKED_OR_UNKNOWN');
  assert.equal(blockedPayoutTruth.candidateAmount, null);
  assert.equal(blockedPayoutTruth.payoutTruth, false);
  assert.equal(
    blockedPayoutTruth.blockingReasons.includes('PAYOUT_TRUTH_INPUT_NOT_ALLOWED_FOR_CANDIDATE_CONTRACT'),
    true
  );
}

console.log('PASS partner-fixed-support-calculator-test');
