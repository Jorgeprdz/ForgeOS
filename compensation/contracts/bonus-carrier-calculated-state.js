export const BONUS_CARRIER_CALCULATED_STATES = Object.freeze({
  CARRIER_CALCULATED: 'carrier_calculated',
  CARRIER_NOT_AVAILABLE: 'carrier_not_available',
  CARRIER_DISCREPANCY: 'carrier_discrepancy',
  CARRIER_UNKNOWN: 'carrier_unknown',
  CARRIER_BLOCKED: 'carrier_blocked',
});

export function createBonusCarrierCalculatedState({
  state = BONUS_CARRIER_CALCULATED_STATES.CARRIER_UNKNOWN,
  amount = null,
  carrier = null,
  sourceDocument = null,
  comparedForgeAmount = null,
  discrepancyReason = null,
} = {}) {
  return {
    state,
    amount,
    carrier,
    sourceDocument,
    comparedForgeAmount,
    discrepancyReason,
    confirmsCompanyCalculatedBonus: state === BONUS_CARRIER_CALCULATED_STATES.CARRIER_CALCULATED,
    paidConfirmed: false,
    createsPayoutTruth: false,
    preservesDiscrepancy: state === BONUS_CARRIER_CALCULATED_STATES.CARRIER_DISCREPANCY,
  };
}
