import assert from 'node:assert/strict';

import {
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES,
  PARTNER_OFFICIAL_EVIDENCE_STATUSES,
} from '../compensation/partner-manager/partner-official-evidence-status.js';

import {
  createPartnerOfficialEvidence,
} from '../compensation/partner-manager/partner-official-evidence.js';

import {
  PARTNER_STATEMENT_MATCH_STATUSES,
  createPartnerCompensationStatementMatch,
} from '../compensation/partner-manager/partner-compensation-statement-match.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
  createPartnerSafeCalculationResult,
} from '../compensation/partner-manager/partner-safe-calculation-result.js';

import {
  PARTNER_PAYOUT_TRUTH_RESULT_STATUSES,
} from '../compensation/partner-manager/partner-payout-truth-result.js';

import {
  evaluatePartnerPayoutTruthGate,
} from '../compensation/partner-manager/partner-payout-truth-gate.js';

function candidate(overrides = {}) {
  return createPartnerSafeCalculationResult({
    conceptKey: 'productivity-base',
    status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE,
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: 1000,
    confidence: 'medium',
    ...overrides,
  });
}

function officialEvidence(overrides = {}) {
  return createPartnerOfficialEvidence({
    sourceType: PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OFFICIAL_COMPENSATION_STATEMENT,
    evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED,
    evidenceId: 'evidence-1',
    statementId: 'statement-1',
    ...overrides,
  });
}

function statementMatch(overrides = {}) {
  return createPartnerCompensationStatementMatch({
    partnerId: 'partner-1',
    period: '2026-Q1',
    conceptKey: 'productivity-base',
    matchStatus: PARTNER_STATEMENT_MATCH_STATUSES.MATCHED,
    officialStatementId: 'statement-1',
    officialStatementLineId: 'line-1',
    officialAmount: 1000,
    officialCurrency: 'MXN',
    evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED,
    sourceType: PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OFFICIAL_COMPENSATION_STATEMENT,
    matchConfidence: 'high',
    ...overrides,
  });
}

const missingEvidence = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate(),
});
assert.equal(missingEvidence.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED);
assert.ok(missingEvidence.blockedReasons.includes('missing_official_statement'));

for (const sourceType of [
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OCR_EXTRACTION,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.PDF_EXTRACTION,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.AI_EXTRACTION,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.MANUAL_ENTRY,
]) {
  const result = evaluatePartnerPayoutTruthGate({
    safeCalculationResult: candidate(),
    officialEvidence: officialEvidence({
      sourceType,
      evidenceStatus: sourceType === PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.MANUAL_ENTRY
        ? PARTNER_OFFICIAL_EVIDENCE_STATUSES.HUMAN_CONFIRMED
        : PARTNER_OFFICIAL_EVIDENCE_STATUSES.EXTRACTED,
    }),
  });
  assert.equal(result.payoutTruth, false);
  assert.equal(result.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED);
}

const humanOnly = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate(),
  officialEvidence: officialEvidence({
    evidenceStatus: PARTNER_OFFICIAL_EVIDENCE_STATUSES.HUMAN_CONFIRMED,
  }),
});
assert.equal(humanOnly.payoutTruth, false);
assert.ok(humanOnly.blockedReasons.includes('official_confirmed_evidence_required'));

const paid = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate(),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch(),
});
assert.equal(paid.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAID_CONFIRMED);
assert.equal(paid.payoutTruth, true);

const amountMismatch = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate(),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch({
    matchStatus: PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_AMOUNT,
    officialAmount: 900,
    mismatchReasons: ['official_amount_differs_from_candidate'],
  }),
});
assert.equal(amountMismatch.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_MISMATCH);
assert.equal(amountMismatch.officialAmount, 900);
assert.equal(amountMismatch.candidateAmount, 1000);
assert.equal(amountMismatch.varianceAmount, -100);

for (const mismatchStatus of [
  PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_CONCEPT,
  PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_PERIOD,
  PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_PARTNER,
]) {
  const result = evaluatePartnerPayoutTruthGate({
    safeCalculationResult: candidate(),
    officialEvidence: officialEvidence(),
    statementMatch: statementMatch({ matchStatus: mismatchStatus }),
  });
  assert.equal(result.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_MISMATCH);
  assert.equal(result.payoutTruth, false);
}

const exampleOnly = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: createPartnerSafeCalculationResult({
    conceptKey: 'development-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.EXAMPLE_ONLY,
    metadata: { exampleOnly: true },
  }),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch(),
});
assert.equal(exampleOnly.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_NOT_APPLICABLE);

const semanticNoStatement = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: createPartnerSafeCalculationResult({
    conceptKey: 'connection-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_PARTIAL,
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: 7500,
  }),
  officialEvidence: null,
});
assert.equal(semanticNoStatement.payoutTruth, false);

const taCountingPrecontract = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate({
    conceptKey: 'productivity-multiplier',
    metadata: { taCountingPrecontractCount: 1 },
  }),
});
assert.equal(taCountingPrecontract.payoutTruth, false);

const heldPrecontract = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate(),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch(),
  lifecycleContext: { heldPrecontractCommission: true },
});
assert.equal(heldPrecontract.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED);

const hidden = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate(),
  scopeContext: { hiddenByScope: true },
});
assert.equal(hidden.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_HIDDEN_BY_SCOPE);
assert.equal(hidden.hiddenByScopeIsZero, false);

const unknown = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: createPartnerSafeCalculationResult({
    status: PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN,
  }),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch(),
});
assert.equal(unknown.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN);

const notModeled = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: createPartnerSafeCalculationResult({
    status: PARTNER_SAFE_CALCULATION_STATUSES.NOT_MODELED,
  }),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch(),
});
assert.equal(notModeled.payoutTruth, false);
assert.equal(notModeled.candidateAmount, null);

const explicitZero = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: candidate({ candidateAmount: 100 }),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch({
    officialAmount: 0,
    explicitZeroReason: 'official statement line says zero',
  }),
});
assert.equal(explicitZero.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAID_CONFIRMED);
assert.equal(explicitZero.officialAmount, 0);

for (const conceptKey of ['productivity-base', 'productivity-multiplier', 'fixed-support']) {
  const result = evaluatePartnerPayoutTruthGate({
    safeCalculationResult: candidate({ conceptKey }),
    officialEvidence: officialEvidence(),
  });
  assert.equal(result.payoutTruth, false);
  assert.ok(result.blockedReasons.includes('missing_official_statement_line'));
}

const connectionWithLine = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: createPartnerSafeCalculationResult({
    conceptKey: 'connection-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_PARTIAL,
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: 7500,
  }),
  officialEvidence: officialEvidence(),
  statementMatch: statementMatch({
    conceptKey: 'connection-bonus',
    officialAmount: 7500,
  }),
});
assert.equal(connectionWithLine.status, PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAID_CONFIRMED);
assert.equal(connectionWithLine.candidateAmountIsOfficialAmount, false);

const promotionNoLine = evaluatePartnerPayoutTruthGate({
  safeCalculationResult: createPartnerSafeCalculationResult({
    conceptKey: 'partner-promotion-bonus',
    status: PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_PARTIAL,
    calculationAllowed: true,
    calculatedCandidate: true,
    candidateAmount: 300000,
  }),
  officialEvidence: officialEvidence(),
});
assert.equal(promotionNoLine.payoutTruth, false);

assert.equal(paid.payoutTruth, paid.status === PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAID_CONFIRMED);
assert.equal(amountMismatch.payoutTruth, false);

console.log('PASS partner-payout-truth-gate-test');
