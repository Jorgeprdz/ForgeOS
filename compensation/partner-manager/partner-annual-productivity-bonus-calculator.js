'use strict';

const {
  ANNUAL_PRODUCTIVITY_BONUS_RATE,
  validateAnnualProductivityBonusContract
} = require('./partner-annual-productivity-bonus-contract');

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getEligibleQuarterlyProductivityCandidates(contractReadiness) {
  return contractReadiness.productivityCandidateAssessments
    .filter((assessment) => assessment.isValid)
    .map((assessment) => assessment.normalized)
    .filter(Boolean);
}

function calculateAnnualProductivityBonusCandidate(input = {}) {
  const contractReadiness = validateAnnualProductivityBonusContract(input);

  if (!contractReadiness.readyForCandidateCalculator) {
    return {
      concept: 'productivity-annual-additional-bonus',
      status: 'BLOCKED_OR_UNKNOWN',
      candidateAmount: null,
      payoutTruth: false,
      calculationPerformed: false,
      annualProductivityBonusBase: null,
      bonusRate: ANNUAL_PRODUCTIVITY_BONUS_RATE,
      includedQuarterlyProductivityCandidates: [],
      decemberActiveTAWinnerThreshold: contractReadiness.decemberActiveTAWinnerThreshold,
      blockingReasons: contractReadiness.blockingReasons,
      contractReadiness
    };
  }

  const includedQuarterlyProductivityCandidates = getEligibleQuarterlyProductivityCandidates(
    contractReadiness
  );

  const annualProductivityBonusBase = includedQuarterlyProductivityCandidates.reduce(
    (total, candidate) => total + candidate.candidateAmount,
    0
  );

  const candidateAmount = roundCurrency(
    annualProductivityBonusBase * ANNUAL_PRODUCTIVITY_BONUS_RATE
  );

  return {
    concept: 'productivity-annual-additional-bonus',
    status: 'CANDIDATE_CALCULATED',
    candidateAmount,
    payoutTruth: false,
    calculationPerformed: true,
    annualProductivityBonusBase,
    bonusRate: ANNUAL_PRODUCTIVITY_BONUS_RATE,
    includedQuarterlyProductivityCandidates,
    decemberActiveTAWinnerThreshold: contractReadiness.decemberActiveTAWinnerThreshold,
    blockingReasons: [],
    contractReadiness
  };
}

module.exports = {
  calculateAnnualProductivityBonusCandidate
};
