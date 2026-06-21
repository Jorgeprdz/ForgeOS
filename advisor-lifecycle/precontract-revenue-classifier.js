import {
  ADVISOR_LIFECYCLE_STATUSES,
  isPrecontractStatus,
  normalizeLifecycleStatus,
} from './advisor-lifecycle-status.js';

export const PRECONTRACT_REVENUE_CLASSIFICATIONS = Object.freeze({
  ORIGINATED_PRODUCTION: 'originated_production',
  ESTIMATED_COMMISSION: 'estimated_commission',
  HELD_COMMISSION: 'held_commission',
  RELEASED_COMMISSION: 'released_commission',
  FORFEITED_COMMISSION: 'forfeited_commission',
  PAYOUT_TRUTH: 'payout_truth',
  BLOCKED: 'blocked',
});

function result({
  classification,
  reason,
  confidence = 'medium',
  requiredEvidence = [],
  payable = false,
  generated = false,
  payoutTruth = false,
  warnings = [],
} = {}) {
  return {
    classification,
    reason,
    confidence,
    requiredEvidence: Array.isArray(requiredEvidence) ? [...requiredEvidence] : [],
    payable,
    generated,
    payoutTruth,
    warnings: Array.isArray(warnings) ? [...warnings] : [],
    unknownIsZero: false,
    blockedIsZero: false,
  };
}

export function classifyPrecontractRevenue({
  lifecycleStatus = ADVISOR_LIFECYCLE_STATUSES.UNKNOWN,
  policySubmitted = false,
  policyIssued = false,
  paymentApplied = false,
  commissionEstimated = false,
  commissionStatementConfirmed = false,
  paymentEvidenceConfirmed = false,
  activationConfirmed = false,
  releaseConfirmed = false,
  forfeitureConfirmed = false,
} = {}) {
  const status = normalizeLifecycleStatus(lifecycleStatus);

  if (status === ADVISOR_LIFECYCLE_STATUSES.UNKNOWN) {
    return result({
      classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.BLOCKED,
      reason: 'blocked_by_unknown_lifecycle_status',
      confidence: 'blocked',
      requiredEvidence: ['lifecycle_status'],
    });
  }

  if (forfeitureConfirmed) {
    return result({
      classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.FORFEITED_COMMISSION,
      reason: 'forfeited_due_to_no_activation',
      confidence: 'confirmed',
      warnings: ['Forfeited commission must be separated and never silently netted as zero.'],
    });
  }

  if (commissionStatementConfirmed && paymentEvidenceConfirmed && activationConfirmed && releaseConfirmed) {
    return result({
      classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.PAYOUT_TRUTH,
      reason: 'official_evidence_confirms_payout_truth',
      confidence: 'official',
      payable: true,
      generated: true,
      payoutTruth: true,
    });
  }

  if (releaseConfirmed && activationConfirmed) {
    return result({
      classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.RELEASED_COMMISSION,
      reason: 'released_after_activation_requires_payout_evidence',
      confidence: 'confirmed',
      payable: true,
      generated: false,
      payoutTruth: false,
      requiredEvidence: ['commission_statement', 'payment_evidence'],
    });
  }

  if (paymentApplied && !activationConfirmed) {
    return result({
      classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.HELD_COMMISSION,
      reason: 'blocked_by_pending_advisor_activation',
      confidence: 'payment_confirmed',
      requiredEvidence: ['activation_confirmation', 'release_evidence'],
      warnings: ['Held commission is not paid commission.'],
    });
  }

  if (commissionEstimated && !activationConfirmed) {
    return result({
      classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.ESTIMATED_COMMISSION,
      reason: 'commission_estimated_before_activation',
      confidence: 'estimated',
      requiredEvidence: ['activation_confirmation', 'commission_statement'],
    });
  }

  if (isPrecontractStatus(status) && (policySubmitted || policyIssued)) {
    return result({
      classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.ORIGINATED_PRODUCTION,
      reason: 'precontract_sale_attributed_but_blocked_for_payout',
      confidence: 'evidence_only',
      requiredEvidence: ['activation_confirmation'],
    });
  }

  return result({
    classification: PRECONTRACT_REVENUE_CLASSIFICATIONS.BLOCKED,
    reason: 'blocked_by_missing_precontract_economic_evidence',
    confidence: 'blocked',
    requiredEvidence: ['policy_or_payment_evidence'],
  });
}
