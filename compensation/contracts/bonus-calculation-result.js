export const BONUS_CALCULATION_STATES = Object.freeze({
  BONUS_NOT_MODELED: 'bonus_not_modeled',
  BONUS_BLOCKED: 'bonus_blocked',
  BONUS_POTENTIAL: 'bonus_potential',
  BONUS_ELIGIBLE_ESTIMATED: 'bonus_eligible_estimated',
  BONUS_EARNED_CALCULATED: 'bonus_earned_calculated',
  BONUS_DISCREPANCY: 'bonus_discrepancy',
  BONUS_UNKNOWN: 'bonus_unknown',
});

export function createBonusCalculationResult({
  state = BONUS_CALCULATION_STATES.BONUS_UNKNOWN,
  amount = null,
  basisType = null,
  hasPaidAppliedProduction = false,
  hasDocumentedRule = false,
  forecast = false,
  carrierCalculatedComparison = null,
  reasons = [],
} = {}) {
  const errors = [];

  if (basisType === 'activity') errors.push('activity_cannot_create_bonus');
  if (forecast) errors.push('forecast_cannot_create_bonus_payout');

  if (
    state === BONUS_CALCULATION_STATES.BONUS_EARNED_CALCULATED
    && (!hasPaidAppliedProduction || !hasDocumentedRule)
  ) {
    errors.push('paid_applied_production_and_documented_rule_required');
  }

  return {
    state: errors.length > 0 ? BONUS_CALCULATION_STATES.BONUS_BLOCKED : state,
    amount: errors.length > 0 ? null : amount,
    basisType,
    hasPaidAppliedProduction,
    hasDocumentedRule,
    forecast,
    carrierCalculatedComparison,
    reasons: [...reasons, ...errors],
    paidConfirmed: false,
    createsPayoutTruth: false,
    forecastCreatesPayoutTruth: false,
    carrierCalculatedEmbedded: carrierCalculatedComparison !== null,
  };
}
