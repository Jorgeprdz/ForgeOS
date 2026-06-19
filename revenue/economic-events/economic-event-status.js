export const ECONOMIC_EVENT_STATUSES = Object.freeze({
  POTENTIAL: 'potential',
  PENDING_POLICY_CONFIRMATION: 'pending_policy_confirmation',
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  EARNED_ESTIMATED: 'earned_estimated',
  PAID_CONFIRMED: 'paid_confirmed',
  REVERSED: 'reversed',
  CANCELLED: 'cancelled',
  UNKNOWN: 'unknown',
  BLOCKED_BY_MISSING_POLICY: 'blocked_by_missing_policy',
  BLOCKED_BY_MISSING_PAYMENT: 'blocked_by_missing_payment',
  BLOCKED_BY_MISSING_STATEMENT: 'blocked_by_missing_statement',
  BLOCKED_BY_MISSING_CLASSIFICATION: 'blocked_by_missing_classification',
});

export const ECONOMIC_EVENT_TRUST_LEVELS = Object.freeze({
  EVIDENCE_ONLY: 'evidence_only',
  EXTRACTION_CANDIDATE: 'extraction_candidate',
  ADVISOR_CONFIRMED: 'advisor_confirmed',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  CARRIER_CONFIRMED: 'carrier_confirmed',
  MANUAL_CAPTURE: 'manual_capture',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
});

const KNOWN_STATUSES = Object.freeze(Object.values(ECONOMIC_EVENT_STATUSES));

export function createEconomicEventStatus({
  status = ECONOMIC_EVENT_STATUSES.UNKNOWN,
  trustLevel = ECONOMIC_EVENT_TRUST_LEVELS.UNKNOWN,
  sourceState = 'unknown',
  evidenceRefs = [],
  explanation = '',
  warnings = [],
} = {}) {
  const normalizedStatus = KNOWN_STATUSES.includes(status)
    ? status
    : ECONOMIC_EVENT_STATUSES.UNKNOWN;

  return {
    status: normalizedStatus,
    trustLevel,
    sourceState,
    evidenceRefs: Array.isArray(evidenceRefs) ? evidenceRefs : [],
    explanation,
    warnings: Array.isArray(warnings) ? warnings : [String(warnings)],
    countsAsEarnedRevenue: isRevenueEarnedStatus(normalizedStatus),
    countsAsPayoutTruth: isPayoutConfirmedStatus(normalizedStatus),
  };
}

export function isRevenueEarnedStatus(status) {
  return (
    status === ECONOMIC_EVENT_STATUSES.EARNED_ESTIMATED ||
    status === ECONOMIC_EVENT_STATUSES.PAID_CONFIRMED
  );
}

export function isPayoutConfirmedStatus(status) {
  return status === ECONOMIC_EVENT_STATUSES.PAID_CONFIRMED;
}

export function isPotentialOnlyStatus(status) {
  return (
    status === ECONOMIC_EVENT_STATUSES.POTENTIAL ||
    status === ECONOMIC_EVENT_STATUSES.PENDING_POLICY_CONFIRMATION ||
    status === ECONOMIC_EVENT_STATUSES.PENDING_PAYMENT
  );
}

export function isBlockedEconomicEventStatus(status) {
  return (
    status === ECONOMIC_EVENT_STATUSES.UNKNOWN ||
    status === ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_POLICY ||
    status === ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_PAYMENT ||
    status === ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_STATEMENT ||
    status === ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_CLASSIFICATION
  );
}
