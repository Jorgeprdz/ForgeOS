'use strict';

const {
  ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS
} = require('../compensation/partner-manager/partner-annual-productivity-bonus-contract');

const {
  calculateAnnualProductivityBonusCandidate
} = require('../compensation/partner-manager/partner-annual-productivity-bonus-calculator');

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

function testCalculatesTenPercentOfYearlyProductivityBonusCandidates() {
  const result = calculateAnnualProductivityBonusCandidate(baseInput());

  assert(result.status === 'CANDIDATE_CALCULATED', 'Complete contract should calculate.');
  assert(result.calculationPerformed === true, 'Calculator should calculate.');
  assert(result.annualProductivityBonusBase === 52000, 'Base should sum Q1-Q4 productivity candidates.');
  assert(result.candidateAmount === 5200, 'Annual bonus should be 10% of yearly productivity candidates.');
  assert(result.bonusRate === 0.10, 'Bonus rate should be 10%.');
  assert(result.payoutTruth === false, 'Calculator must keep payoutTruth false.');
  assert(result.includedQuarterlyProductivityCandidates.length === 4, 'All four quarters should be included.');
  assert(result.decemberActiveTAWinnerThreshold === 8, 'Jan-Jun context threshold should be 8.');
}

function testJulDecThresholdCalculatesWithFourActiveDecemberWinners() {
  const result = calculateAnnualProductivityBonusCandidate(
    baseInput({
      connectionContext: ANNUAL_PRODUCTIVITY_CONNECTION_CONTEXTS.JUL_DEC_2026,
      decemberActiveTAWinnerCount: 4,
      quarterlyProductivityBonusCandidates: {
        Q1: productivityCandidate('Q1', 5000),
        Q2: productivityCandidate('Q2', 5000),
        Q3: productivityCandidate('Q3', 5000),
        Q4: productivityCandidate('Q4', 5000)
      }
    })
  );

  assert(result.status === 'CANDIDATE_CALCULATED', 'Jul-Dec context with threshold 4 should calculate.');
  assert(result.annualProductivityBonusBase === 20000, 'Base should sum 20000.');
  assert(result.candidateAmount === 2000, 'Annual bonus should be 2000.');
  assert(result.decemberActiveTAWinnerThreshold === 4, 'Jul-Dec threshold should be 4.');
}

function testBlocksMissingQuarterWithoutZeroing() {
  const result = calculateAnnualProductivityBonusCandidate(
    baseInput({
      quarterlyProductivityBonusCandidates: {
        Q1: productivityCandidate('Q1', 10000),
        Q2: productivityCandidate('Q2', 12000),
        Q3: productivityCandidate('Q3', 14000)
      }
    })
  );

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing Q4 should block.');
  assert(result.calculationPerformed === false, 'Blocked result must not calculate.');
  assert(result.candidateAmount === null, 'Missing Q4 must not become zero.');
  assert(result.annualProductivityBonusBase === null, 'Blocked base must be null.');
  assert(
    result.blockingReasons.includes('Q4_MISSING_PRODUCTIVITY_BONUS_CANDIDATE'),
    'Missing Q4 reason required.'
  );
}

function testBlocksMissingTAEvidenceEachQuarter() {
  const result = calculateAnnualProductivityBonusCandidate(
    baseInput({
      quarterlyTAWinnerEvidence: {
        Q1: confirmedEvidence(),
        Q2: confirmedEvidence(),
        Q3: confirmedEvidence()
      }
    })
  );

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing Q4 TA evidence should block.');
  assert(result.candidateAmount === null, 'Missing TA evidence must not become zero.');
  assert(
    result.blockingReasons.includes('Q4_TA_WINNER_EVIDENCE_NOT_CONFIRMED'),
    'Missing Q4 TA reason required.'
  );
}

function testBlocksDecemberThresholdWithoutZeroing() {
  const result = calculateAnnualProductivityBonusCandidate(
    baseInput({
      decemberActiveTAWinnerCount: 7
    })
  );

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Below December threshold should block.');
  assert(result.candidateAmount === null, 'Below threshold must not become zero.');
  assert(
    result.blockingReasons.includes('DECEMBER_ACTIVE_TA_WINNER_THRESHOLD_NOT_MET'),
    'Threshold reason required.'
  );
}

function testBlocksMissingDecemberEvidence() {
  const result = calculateAnnualProductivityBonusCandidate(
    baseInput({
      decemberActiveTAWinnerEvidence: false
    })
  );

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing December evidence should block.');
  assert(result.candidateAmount === null, 'Missing December evidence must not become zero.');
  assert(
    result.blockingReasons.includes('DECEMBER_ACTIVE_TA_WINNER_EVIDENCE_NOT_CONFIRMED'),
    'December evidence reason required.'
  );
}

function testBlocksPayoutTruthSourceAsQuarterlyProductivityCandidate() {
  const result = calculateAnnualProductivityBonusCandidate(
    baseInput({
      quarterlyProductivityBonusCandidates: {
        Q1: productivityCandidate('Q1', 10000, {
          status: 'PAID_CONFIRMED',
          calculationPerformed: false,
          payoutTruth: true
        }),
        Q2: productivityCandidate('Q2', 12000),
        Q3: productivityCandidate('Q3', 14000),
        Q4: productivityCandidate('Q4', 16000)
      }
    })
  );

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Payout-truth source should not satisfy candidate calculator.');
  assert(result.candidateAmount === null, 'Payout-truth source must not become zero.');
  assert(
    result.blockingReasons.includes('Q1_PRODUCTIVITY_BONUS_NOT_CANDIDATE_CALCULATED'),
    'Candidate-calculated reason required.'
  );
  assert(
    result.blockingReasons.includes('Q1_PRODUCTIVITY_BONUS_MUST_NOT_BE_PAYOUT_TRUTH'),
    'Payout truth boundary reason required.'
  );
}

function testBlocksInvalidConnectionContext() {
  const result = calculateAnnualProductivityBonusCandidate(
    baseInput({
      connectionContext: 'UNKNOWN_CONTEXT'
    })
  );

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Invalid connection context should block.');
  assert(result.candidateAmount === null, 'Invalid context must not become zero.');
  assert(
    result.blockingReasons.includes('MISSING_OR_INVALID_CONNECTION_CONTEXT'),
    'Invalid context reason required.'
  );
}

testCalculatesTenPercentOfYearlyProductivityBonusCandidates();
testJulDecThresholdCalculatesWithFourActiveDecemberWinners();
testBlocksMissingQuarterWithoutZeroing();
testBlocksMissingTAEvidenceEachQuarter();
testBlocksDecemberThresholdWithoutZeroing();
testBlocksMissingDecemberEvidence();
testBlocksPayoutTruthSourceAsQuarterlyProductivityCandidate();
testBlocksInvalidConnectionContext();

console.log('PASS partner-annual-productivity-bonus-calculator-test');
