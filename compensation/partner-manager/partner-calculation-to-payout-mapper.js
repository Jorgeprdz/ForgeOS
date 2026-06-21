import {
  PARTNER_SAFE_CALCULATION_STATUSES,
} from './partner-safe-calculation-result.js';

import {
  PARTNER_PAYOUT_TRUTH_RESULT_STATUSES,
  createPartnerPayoutTruthResult,
} from './partner-payout-truth-result.js';

export function mapPartnerCalculationToPayoutState(safeCalculationResult = {}) {
  const status = safeCalculationResult.status;

  if (safeCalculationResult.hiddenByScope === true || status === 'hidden_by_scope') {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_HIDDEN_BY_SCOPE,
      candidateAmount: safeCalculationResult.candidateAmount,
      blockedReasons: ['hidden_by_scope'],
      confidence: 'scope_denied',
    });
  }

  if (status === PARTNER_SAFE_CALCULATION_STATUSES.CALCULATED_CANDIDATE) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_CANDIDATE_ONLY,
      candidateAmount: safeCalculationResult.candidateAmount,
      blockedReasons: ['official_statement_required_for_payout_truth'],
      confidence: safeCalculationResult.confidence,
    });
  }

  if (status === PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_PARTIAL) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_CANDIDATE_ONLY,
      candidateAmount: safeCalculationResult.candidateAmount,
      blockedReasons: ['partial_calculation_requires_official_statement'],
      confidence: safeCalculationResult.confidence,
    });
  }

  if (status === PARTNER_SAFE_CALCULATION_STATUSES.EXAMPLE_ONLY) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_NOT_APPLICABLE,
      candidateAmount: null,
      blockedReasons: ['example_only_is_not_payout_truth'],
      confidence: 'blocked',
    });
  }

  if (status === PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN) {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN,
      blockedReasons: ['unknown_calculation_state'],
      confidence: 'unknown',
    });
  }

  if (status === PARTNER_SAFE_CALCULATION_STATUSES.NOT_MODELED || status === 'not_modelled') {
    return createPartnerPayoutTruthResult({
      conceptKey: safeCalculationResult.conceptKey,
      status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN,
      blockedReasons: ['not_modeled_is_not_zero_or_paid_confirmed'],
      confidence: 'not_modelled',
    });
  }

  return createPartnerPayoutTruthResult({
    conceptKey: safeCalculationResult.conceptKey,
    status: PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_BLOCKED,
    candidateAmount: safeCalculationResult.candidateAmount,
    blockedReasons: safeCalculationResult.blockedReasons?.length
      ? safeCalculationResult.blockedReasons
      : ['calculation_blocked'],
    confidence: safeCalculationResult.confidence || 'blocked',
  });
}
