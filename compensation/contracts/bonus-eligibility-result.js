export const BONUS_ELIGIBILITY_STATES = Object.freeze({
  ELIGIBLE_ESTIMATED: 'eligible_estimated',
  ELIGIBLE_CALCULATED: 'eligible_calculated',
  NOT_ELIGIBLE: 'not_eligible',
  NOT_MODELED: 'not_modeled',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
});

export function createBonusEligibilityResult({
  state = BONUS_ELIGIBILITY_STATES.UNKNOWN,
  amount = null,
  ruleModeled = false,
  evidenceConfirmed = false,
  reasons = [],
} = {}) {
  const canBeZero =
    state === BONUS_ELIGIBILITY_STATES.NOT_ELIGIBLE
    && ruleModeled === true
    && evidenceConfirmed === true;

  return {
    state,
    amount: canBeZero ? 0 : amount,
    ruleModeled,
    evidenceConfirmed,
    reasons,
    canBeZero,
    unknownIsZero: false,
    notModeledIsZero: false,
    blockedIsZero: false,
  };
}
