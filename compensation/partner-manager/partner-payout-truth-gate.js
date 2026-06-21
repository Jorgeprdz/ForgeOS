import {
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES,
  PARTNER_OFFICIAL_EVIDENCE_STATUSES,
} from './partner-official-evidence-status.js';

import {
  PARTNER_STATEMENT_MATCH_STATUSES,
} from './partner-compensation-statement-match.js';

import {
  PARTNER_SAFE_CALCULATION_STATUSES,
} from './partner-safe-calculation-result.js';

import {
  PARTNER_PAYOUT_TRUTH_RESULT_STATUSES,
  createPartnerPayoutTruthResult,
} from './partner-payout-truth-result.js';

import {
  mapPartnerCalculationToPayoutState,
} from './partner-calculation-to-payout-mapper.js';

function isMismatch(matchStatus) {
  return [
    PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_AMOUNT,
    PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_CONCEPT,
    PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_PERIOD,
    PARTNER_STATEMENT_MATCH_STATUSES.MISMATCH_PARTNER,
  ].includes(matchStatus);
}

function extractionBlockReason(sourceType) {
  if (sourceType === PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OCR_EXTRACTION) return 'ocr_extraction_is_not_payout_truth';
  if (sourceType === PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.PDF_EXTRACTION) return 'pdf_extraction_is_not_payout_truth';
  if (sourceType === PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.AI_EXTRACTION) return 'ai_extraction_is_not_payout_truth';
  if (sourceType === PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.MANUAL_ENTRY) return 'manual_entry_is_not_payout_truth';
  return null;
}

function cannotPromoteCalculationToPayout(status) {
  return [
    PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_BLOCKED,
    PARTNER_SAFE_CALCULATION_STATUSES.NOT_MODELED,
    'not_modelled',
    PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_TABLE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_FORMULA,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_ECONOMIC_INPUT,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_EVIDENCE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_SCOPE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_LIFECYCLE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE,
  ].includes(status);
}

export function evaluatePartnerPayoutTruthGate({
  safeCalculationResult = null,
  officialEvidence = null,
  statementMatch = null,
  scopeContext = {},
  lifecycleContext = {},
} = {}) {
  if (scopeContext.hiddenByScope === true) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult?.conceptKey,
      partnerId: statementMatch?.partnerId,
      period: statementMatch?.period,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_HIDDEN_BY_SCOPE,
      blockedReasons: ['hidden_by_scope'],
      confidence: 'scope_denied',
    });
  }

  if (!safeCalculationResult) {
    return createPartnerPayoutTruthResult({
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN,
      blockedReasons: ['missing_safe_calculation_result'],
    });
  }

  if (
    safeCalculationResult.status === PARTNER_SAFE_CALCULATION_STATUSES.EXAMPLE_ONLY ||
    safeCalculationResult.metadata?.exampleOnly
  ) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_NOT_APPLICABLE,
      blockedReasons: ['example_only_is_never_payout_truth'],
      candidateAmount: safeCalculationResult.candidateAmount,
      confidence: 'blocked',
    });
  }

  if (cannotPromoteCalculationToPayout(safeCalculationResult.status)) {
    return mapPartnerCalculationToPayoutState(safeCalculationResult);
  }

  if (!officialEvidence || officialEvidence.evidenceStatus === PARTNER_OFFICIAL_EVIDENCE_STATUSES.MISSING) {
    return createPartnerPayoutTruthResult({
      ...mapPartnerCalculationToPayoutState(safeCalculationResult),
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED,
      blockedReasons: ['missing_official_statement'],
    });
  }

  const extractionReason = extractionBlockReason(officialEvidence.sourceType);
  if (extractionReason) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED,
      candidateAmount: safeCalculationResult.candidateAmount,
      evidenceSource: officialEvidence,
      blockedReasons: [extractionReason, 'needs_human_confirmation_and_official_statement'],
      warnings: officialEvidence.warnings,
      confidence: 'blocked',
    });
  }

  if (officialEvidence.evidenceStatus !== PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED,
      candidateAmount: safeCalculationResult.candidateAmount,
      evidenceSource: officialEvidence,
      blockedReasons: ['official_confirmed_evidence_required'],
      confidence: 'blocked',
    });
  }

  if (!statementMatch) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED,
      candidateAmount: safeCalculationResult.candidateAmount,
      evidenceSource: officialEvidence,
      blockedReasons: ['missing_official_statement_line'],
      confidence: 'blocked',
    });
  }

  if (isMismatch(statementMatch.matchStatus)) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      partnerId: statementMatch.partnerId,
      period: statementMatch.period,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_MISMATCH,
      officialAmount: statementMatch.officialAmount,
      officialCurrency: statementMatch.officialCurrency,
      candidateAmount: safeCalculationResult.candidateAmount,
      evidenceSource: officialEvidence,
      statementMatch,
      mismatchReasons: statementMatch.mismatchReasons.length ? statementMatch.mismatchReasons : [statementMatch.matchStatus],
      confidence: statementMatch.matchConfidence,
    });
  }

  if (statementMatch.matchStatus !== PARTNER_STATEMENT_MATCH_STATUSES.MATCHED || statementMatch.canSupportPayoutTruth !== true) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      partnerId: statementMatch.partnerId,
      period: statementMatch.period,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED,
      officialAmount: statementMatch.officialAmount,
      officialCurrency: statementMatch.officialCurrency,
      candidateAmount: safeCalculationResult.candidateAmount,
      evidenceSource: officialEvidence,
      statementMatch,
      blockedReasons: statementMatch.mismatchReasons.length ? statementMatch.mismatchReasons : ['matched_official_statement_line_required'],
      confidence: statementMatch.matchConfidence,
    });
  }

  if (lifecycleContext.heldPrecontractCommission === true && lifecycleContext.officialReleaseStatementConfirmed !== true) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      partnerId: statementMatch.partnerId,
      period: statementMatch.period,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED,
      officialAmount: statementMatch.officialAmount,
      officialCurrency: statementMatch.officialCurrency,
      candidateAmount: safeCalculationResult.candidateAmount,
      evidenceSource: officialEvidence,
      statementMatch,
      blockedReasons: ['precontract_held_commission_requires_official_release_statement'],
      confidence: 'blocked',
    });
  }

  return createPartnerPayoutTruthResult({
    conceptKey: safeCalculationResult.conceptKey,
    partnerId: statementMatch.partnerId,
    period: statementMatch.period,
    status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAID_CONFIRMED,
    officialAmount: statementMatch.officialAmount,
    officialCurrency: statementMatch.officialCurrency,
    candidateAmount: safeCalculationResult.candidateAmount,
    evidenceSource: officialEvidence,
    statementMatch,
    warnings: ['Candidate calculation remains separate from official amount.'],
    confidence: statementMatch.matchConfidence,
    sourceNotes: ['Official statement line confirms Partner payout truth.'],
  });
}
