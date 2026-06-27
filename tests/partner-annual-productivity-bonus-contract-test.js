'use strict';

const {
  ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS,
  ANNUAL_PRODUCTIVITY_BONUS_RATE,
  getDecemberActiveTAWinnerThreshold,
  validateAnnualProductivityBonusContract,
  validateQuarterlyProductivityCandidate,
  validateQuarterlyTAWinnerEvidence
} = require('../compensation/partner-manager/partner-annual-productivity-bonus-contract');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function productivityCandidate(quarter, amount = 10000, overrides = {}) {
  return {
    quarter,
    status: 'CANDIDATE_CALCULATED',
    calculationPerformed: true,
    candidateAmount: amount,
    payoutTruth: false,
    ...overrides
  };
}

function confirmedEvidence(overrides = {}) {
  return {
    status: 'confirmed',
    ...overrides
  };
}

function baseInput(overrides = {}) {
  return {
    partnerId: 'partner-001',
    year: 2026,
    connectionContext: ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS.JAN_JUN_2026,
    quarterlyProductivityBonusCandidates: {
      Q1: productivityCandidate('Q1', 10000),
      Q2: productivityCandidate('Q2', 12000),
      Q3: productivityCandidate('Q3', 14000),
      Q4: productivityCandidate('Q4', 16000)
    },
    quarterlyTAWinnerEvidence: {
      Q1: confirmedEvidence(),
      Q2: confirmedEvidence(),
      Q3: confirmedEvidence(),
      Q4: confirmedEvidence()
    },
    decemberActiveTAWinnerCount: 8,
    decemberActiveTAWinnerEvidence: confirmedEvidence(),
    ...overrides
  };
}

function testReadyContractWithoutCalculation() {
  const result = validateAnnualProductivityBonusContract(baseInput());

  assert(result.status === 'READY_FOR_CANDIDATE_CALCULATOR', 'Complete evidence should be ready.');
  assert(result.readyForCandidateCalculator === true, 'Contract should be ready.');
  assert(result.calculationPerformed === false, 'Contract must not calculate.');
  assert(result.candidateAmount === null, 'Contract must not emit candidateAmount.');
  assert(result.payoutTruth === false, 'Contract must keep payoutTruth false.');
  assert(result.bonusRate === ANNUAL_PRODUCTIVITY_BONUS_RATE, 'Bonus rate should be 10%.');
  assert(result.decemberActiveTAWinnerThreshold === 8, 'Jan-Jun threshold should be 8.');
}

function testJulDecThresholdIsFour() {
  const result = validateAnnualProductivityBonusContract(
    baseInput({
      connectionContext: ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS.JUL_DEC_2026,
      decemberActiveTAWinnerCount: 4
    })
  );

  assert(result.readyForCandidateCalculator === true, 'Jul-Dec context with 4 should be ready.');
  assert(result.decemberActiveTAWinnerThreshold === 4, 'Jul-Dec threshold should be 4.');
  assert(
    getDecemberActiveTAWinnerThreshold(ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS.JUL_DEC_2026) === 4,
    'Threshold helper should return 4.'
  );
}

function testMissingQuarterlyProductivityCandidateBlocksWithoutZero() {
  const input = baseInput({
    quarterlyProductivityBonusCandidates: {
      Q1: productivityCandidate('Q1', 10000),
      Q2: productivityCandidate('Q2', 12000),
      Q3: productivityCandidate('Q3', 14000)
    }
  });

  const result = validateAnnualProductivityBonusContract(input);

  assert(result.readyForCandidateCalculator === false, 'Missing Q4 should block.');
  assert(result.candidateAmount === null, 'Missing Q4 must not become zero.');
  assert(
    result.blockingReasons.includes('Q4_MISSING_PRODUCTIVITY_BONUS_CANDIDATE'),
    'Missing Q4 reason required.'
  );
}

function testProductivityCandidateMustBeCandidateCalculatedNotPayoutTruth() {
  const candidate = validateQuarterlyProductivityCandidate(
    'Q1',
    productivityCandidate('Q1', 10000, {
      status: 'PAID_CONFIRMED',
      calculationPerformed: false,
      payoutTruth: true
    })
  );

  assert(candidate.isValid === false, 'Payout truth source should not satisfy candidate contract.');
  assert(
    candidate.blockingReasons.includes('Q1_PRODUCTIVITY_BONUS_NOT_CANDIDATE_CALCULATED'),
    'Candidate calculated reason required.'
  );
  assert(
    candidate.blockingReasons.includes('Q1_PRODUCTIVITY_BONUS_MUST_NOT_BE_PAYOUT_TRUTH'),
    'Payout truth boundary reason required.'
  );
}

function testQuarterlyTAWinnerEvidenceRequiredEachQuarter() {
  const result = validateAnnualProductivityBonusContract(
    baseInput({
      quarterlyTAWinnerEvidence: {
        Q1: confirmedEvidence(),
        Q2: confirmedEvidence(),
        Q3: confirmedEvidence()
      }
    })
  );

  assert(result.readyForCandidateCalculator === false, 'Missing Q4 TA evidence must block.');
  assert(result.candidateAmount === null, 'Missing Q4 TA evidence must not become zero.');
  assert(
    result.blockingReasons.includes('Q4_TA_WINNER_EVIDENCE_NOT_CONFIRMED'),
    'Missing Q4 TA reason required.'
  );

  const singleEvidence = validateQuarterlyTAWinnerEvidence('Q2', false);
  assert(singleEvidence.isValid === false, 'False evidence should not pass.');
}

function testDecemberActiveThresholdBlocksWithoutZero() {
  const result = validateAnnualProductivityBonusContract(
    baseInput({
      decemberActiveTAWinnerCount: 7
    })
  );

  assert(result.readyForCandidateCalculator === false, 'Below threshold must block.');
  assert(result.candidateAmount === null, 'Below threshold must not become zero.');
  assert(
    result.blockingReasons.includes('DECEMBER_ACTIVE_TA_WINNER_THRESHOLD_NOT_MET'),
    'Threshold reason required.'
  );
}

function testDecemberEvidenceRequired() {
  const result = validateAnnualProductivityBonusContract(
    baseInput({
      decemberActiveTAWinnerEvidence: false
    })
  );

  assert(result.readyForCandidateCalculator === false, 'Missing December evidence must block.');
  assert(result.candidateAmount === null, 'Missing December evidence must not become zero.');
  assert(
    result.blockingReasons.includes('DECEMBER_ACTIVE_TA_WINNER_EVIDENCE_NOT_CONFIRMED'),
    'December evidence reason required.'
  );
}

function testInvalidConnectionContextBlocks() {
  const result = validateAnnualProductivityBonusContract(
    baseInput({
      connectionContext: 'UNKNOWN_CONTEXT'
    })
  );

  assert(result.readyForCandidateCalculator === false, 'Invalid connection context must block.');
  assert(result.candidateAmount === null, 'Invalid context must not become zero.');
  assert(
    result.blockingReasons.includes('MISSING_OR_INVALID_CONNECTION_CONTEXT'),
    'Invalid context reason required.'
  );
}

testReadyContractWithoutCalculation();
testJulDecThresholdIsFour();
testMissingQuarterlyProductivityCandidateBlocksWithoutZero();
testProductivityCandidateMustBeCandidateCalculatedNotPayoutTruth();
testQuarterlyTAWinnerEvidenceRequiredEachQuarter();
testDecemberActiveThresholdBlocksWithoutZero();
testDecemberEvidenceRequired();
testInvalidConnectionContextBlocks();

console.log('PASS partner-annual-productivity-bonus-contract-test');
