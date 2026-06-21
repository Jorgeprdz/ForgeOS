export const BONUS_PAYOUT_TRUTH_STATES = Object.freeze({
  PAYMENT_NOT_AVAILABLE: 'payment_not_available',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PAYMENT_BLOCKED: 'payment_blocked',
  PAYMENT_UNKNOWN: 'payment_unknown',
});

export const BONUS_PAYMENT_EVIDENCE_TYPES = Object.freeze({
  PAYMENT_DEPOSIT: 'payment_deposit',
  ACCOUNT_STATEMENT: 'account_statement',
  COMMISSION_STATEMENT_BONUS_PAYMENT: 'commission_statement_bonus_payment',
});

export function createBonusPayoutTruthState({
  state = BONUS_PAYOUT_TRUTH_STATES.PAYMENT_UNKNOWN,
  amount = null,
  evidenceType = null,
  evidenceRefs = [],
  sourceState = null,
  sourceKind = null,
} = {}) {
  const evidenceValid = Object.values(BONUS_PAYMENT_EVIDENCE_TYPES).includes(evidenceType)
    && evidenceRefs.length > 0;

  if (state === BONUS_PAYOUT_TRUTH_STATES.PAYMENT_CONFIRMED && !evidenceValid) {
    return {
      state: BONUS_PAYOUT_TRUTH_STATES.PAYMENT_BLOCKED,
      amount: null,
      evidenceType,
      evidenceRefs,
      sourceState,
      sourceKind,
      reason: 'payment_confirmed_requires_payment_evidence',
      unknownIsZero: false,
      paidConfirmed: false,
    };
  }

  return {
    state,
    amount,
    evidenceType,
    evidenceRefs,
    sourceState,
    sourceKind,
    reason: 'payout_state_recorded',
    unknownIsZero: false,
    paidConfirmed: state === BONUS_PAYOUT_TRUTH_STATES.PAYMENT_CONFIRMED,
    carrierCalculatedIsPaymentConfirmed: false,
    calculatedBonusIsPaymentConfirmed: false,
  };
}
