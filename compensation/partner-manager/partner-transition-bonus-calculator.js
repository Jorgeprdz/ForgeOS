'use strict';

const {
  assessTransitionContractReadiness
} = require('./partner-transition-bonus-contract');

function sumByCommissionType(ledgerAssessments, commissionType) {
  return ledgerAssessments
    .filter((assessment) => assessment.isValid)
    .map((assessment) => assessment.normalized)
    .filter((line) => line && line.commissionType === commissionType)
    .reduce((total, line) => total + line.commissionAmount, 0);
}

function getIncludedLedgerLines(ledgerAssessments) {
  return ledgerAssessments
    .filter((assessment) => assessment.isValid)
    .map((assessment) => assessment.normalized)
    .filter(Boolean)
    .map((line) => ({
      ledgerLineId: line.ledgerLineId,
      commissionType: line.commissionType,
      commissionAmount: line.commissionAmount,
      directKey: line.directKey,
      assignedPortfolioId: line.assignedPortfolioId,
      premiumPaymentDate: line.premiumPaymentDate,
      commissionPaidDate: line.commissionPaidDate
    }));
}

function calculatePartnerTransitionBonusCandidate(input = {}) {
  const contractReadiness = assessTransitionContractReadiness(input);

  if (!contractReadiness.readyForCandidateCalculator) {
    return {
      concept: 'transition-bonus',
      status: 'BLOCKED_OR_UNKNOWN',
      candidateAmount: null,
      payoutTruth: false,
      calculationPerformed: false,
      eligibleInitialCommissions: null,
      eligibleRenewalCommissions: null,
      includedLedgerLines: [],
      blockingReasons: contractReadiness.blockingReasons,
      contractReadiness
    };
  }

  const eligibleInitialCommissions = sumByCommissionType(
    contractReadiness.ledgerAssessments,
    'initial'
  );

  const eligibleRenewalCommissions = sumByCommissionType(
    contractReadiness.ledgerAssessments,
    'renewal'
  );

  const candidateAmount = eligibleInitialCommissions + eligibleRenewalCommissions;

  return {
    concept: 'transition-bonus',
    status: 'CANDIDATE_CALCULATED',
    candidateAmount,
    payoutTruth: false,
    calculationPerformed: true,
    eligibleInitialCommissions,
    eligibleRenewalCommissions,
    includedLedgerLines: getIncludedLedgerLines(contractReadiness.ledgerAssessments),
    blockingReasons: [],
    contractReadiness
  };
}

module.exports = {
  calculatePartnerTransitionBonusCandidate
};
