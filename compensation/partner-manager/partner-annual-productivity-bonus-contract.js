'use strict';

const ANNUAL_PRODUCTIVITY_QUARTERS = Object.freeze(['Q1', 'Q2', 'Q3', 'Q4']);

const ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS = Object.freeze({
  JAN_JUN_2026: 'JAN_JUN_2026',
  JUL_DEC_2026: 'JUL_DEC_2026'
});

const DECEMBER_ACTIVE_TA_WINNER_THRESHOLDS = Object.freeze({
  [ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS.JAN_JUN_2026]: 8,
  [ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS.JUL_DEC_2026]: 4
});

const ANNUAL_PRODUCTIVITY_BONUS_RATE = 0.10;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function evidenceIsConfirmed(evidence) {
  if (evidence === true) return true;
  if (!evidence || typeof evidence !== 'object') return false;

  if (
    evidence.confirmed === true ||
    evidence.passed === true ||
    evidence.verified === true
  ) {
    return true;
  }

  if (typeof evidence.status === 'string') {
    return ['confirmed', 'verified', 'present', 'passed', 'pass', 'ok'].includes(
      evidence.status.trim().toLowerCase()
    );
  }

  return false;
}

function getDecemberActiveTAWinnerThreshold(connectionContext) {
  return DECEMBER_ACTIVE_TA_WINNER_THRESHOLDS[connectionContext] || null;
}

function normalizeQuarterlyProductivityCandidates(input) {
  const source = input || {};

  if (Array.isArray(source)) {
    return Object.fromEntries(source.map((item) => [item.quarter, item]));
  }

  return source;
}

function validateQuarterlyProductivityCandidate(quarter, candidate) {
  const blockingReasons = [];

  if (!candidate || typeof candidate !== 'object') {
    return {
      isValid: false,
      quarter,
      status: 'BLOCKED_OR_UNKNOWN',
      blockingReasons: [`${quarter}_MISSING_PRODUCTIVITY_BONUS_CANDIDATE`],
      normalized: null
    };
  }

  const status = String(candidate.status || '').trim();

  if (
    status !== 'CANDIDATE_CALCULATED' &&
    candidate.calculationPerformed !== true
  ) {
    blockingReasons.push(`${quarter}_PRODUCTIVITY_BONUS_NOT_CANDIDATE_CALCULATED`);
  }

  if (!isPositiveNumber(candidate.candidateAmount)) {
    blockingReasons.push(`${quarter}_MISSING_OR_INVALID_PRODUCTIVITY_BONUS_CANDIDATE_AMOUNT`);
  }

  if (candidate.payoutTruth === true) {
    blockingReasons.push(`${quarter}_PRODUCTIVITY_BONUS_MUST_NOT_BE_PAYOUT_TRUTH`);
  }

  return {
    isValid: blockingReasons.length === 0,
    quarter,
    status: blockingReasons.length === 0 ? 'READY_FOR_CONTRACT' : 'BLOCKED_OR_UNKNOWN',
    blockingReasons,
    normalized: blockingReasons.length === 0
      ? {
          quarter,
          candidateAmount: candidate.candidateAmount,
          payoutTruth: false
        }
      : null
  };
}

function validateQuarterlyTAWinnerEvidence(quarter, evidence) {
  const isValid = evidenceIsConfirmed(evidence);

  return {
    isValid,
    quarter,
    status: isValid ? 'READY_FOR_CONTRACT' : 'BLOCKED_OR_UNKNOWN',
    blockingReasons: isValid ? [] : [`${quarter}_TA_WINNER_EVIDENCE_NOT_CONFIRMED`]
  };
}

function validateDecemberActiveTAWinnerEvidence(input) {
  const payload = input || {};
  const blockingReasons = [];
  const threshold = getDecemberActiveTAWinnerThreshold(payload.connectionContext);

  if (!threshold) {
    blockingReasons.push('MISSING_OR_INVALID_CONNECTION_CONTEXT');
  }

  if (!isNonNegativeInteger(payload.decemberActiveTAWinnerCount)) {
    blockingReasons.push('MISSING_DECEMBER_ACTIVE_TA_WINNER_COUNT');
  } else if (threshold && payload.decemberActiveTAWinnerCount < threshold) {
    blockingReasons.push('DECEMBER_ACTIVE_TA_WINNER_THRESHOLD_NOT_MET');
  }

  if (!evidenceIsConfirmed(payload.decemberActiveTAWinnerEvidence)) {
    blockingReasons.push('DECEMBER_ACTIVE_TA_WINNER_EVIDENCE_NOT_CONFIRMED');
  }

  return {
    isValid: blockingReasons.length === 0,
    status: blockingReasons.length === 0 ? 'READY_FOR_CONTRACT' : 'BLOCKED_OR_UNKNOWN',
    blockingReasons,
    threshold,
    normalized: blockingReasons.length === 0
      ? {
          connectionContext: payload.connectionContext,
          decemberActiveTAWinnerCount: payload.decemberActiveTAWinnerCount,
          decemberActiveTAWinnerThreshold: threshold
        }
      : null
  };
}

function validateAnnualProductivityBonusContract(input = {}) {
  const blockingReasons = [];

  if (!isNonEmptyString(input.partnerId)) {
    blockingReasons.push('MISSING_PARTNER_ID');
  }

  if (!Number.isInteger(input.year)) {
    blockingReasons.push('MISSING_YEAR');
  }

  if (!Object.values(ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS).includes(input.connectionContext)) {
    blockingReasons.push('MISSING_OR_INVALID_CONNECTION_CONTEXT');
  }

  const productivityCandidateMap = normalizeQuarterlyProductivityCandidates(
    input.quarterlyProductivityBonusCandidates
  );

  const productivityCandidateAssessments = ANNUAL_PRODUCTIVITY_QUARTERS.map((quarter) =>
    validateQuarterlyProductivityCandidate(quarter, productivityCandidateMap[quarter])
  );

  const taWinnerEvidence = input.quarterlyTAWinnerEvidence || {};

  const taWinnerEvidenceAssessments = ANNUAL_PRODUCTIVITY_QUARTERS.map((quarter) =>
    validateQuarterlyTAWinnerEvidence(quarter, taWinnerEvidence[quarter])
  );

  const decemberAssessment = validateDecemberActiveTAWinnerEvidence(input);

  for (const assessment of productivityCandidateAssessments) {
    blockingReasons.push(...assessment.blockingReasons);
  }

  for (const assessment of taWinnerEvidenceAssessments) {
    blockingReasons.push(...assessment.blockingReasons);
  }

  blockingReasons.push(...decemberAssessment.blockingReasons);

  const readyForCandidateCalculator = blockingReasons.length === 0;

  return {
    concept: 'productivity-annual-additional-bonus',
    status: readyForCandidateCalculator ? 'READY_FOR_CANDIDATE_CALCULATOR' : 'BLOCKED_OR_UNKNOWN',
    readyForCandidateCalculator,
    calculationPerformed: false,
    candidateAmount: null,
    payoutTruth: false,
    bonusRate: ANNUAL_PRODUCTIVITY_BONUS_RATE,
    requiredQuarters: ANNUAL_PRODUCTIVITY_QUARTERS,
    connectionContext: input.connectionContext || null,
    decemberActiveTAWinnerThreshold: getDecemberActiveTAWinnerThreshold(input.connectionContext),
    blockingReasons,
    productivityCandidateAssessments,
    taWinnerEvidenceAssessments,
    decemberAssessment
  };
}

module.exports = {
  ANNUAL_PRODUCTIVITY_QUARTERS,
  ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS,
  DECEMBER_ACTIVE_TA_WINNER_THRESHOLDS,
  ANNUAL_PRODUCTIVITY_BONUS_RATE,
  evidenceIsConfirmed,
  getDecemberActiveTAWinnerThreshold,
  validateQuarterlyProductivityCandidate,
  validateQuarterlyTAWinnerEvidence,
  validateDecemberActiveTAWinnerEvidence,
  validateAnnualProductivityBonusContract
};
