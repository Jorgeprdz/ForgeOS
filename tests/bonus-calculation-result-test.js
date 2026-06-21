import assert from 'node:assert/strict';

import {
  BONUS_CALCULATION_STATES,
  createBonusCalculationResult,
} from '../compensation/contracts/bonus-calculation-result.js';

const calculated = createBonusCalculationResult({
  state: BONUS_CALCULATION_STATES.BONUS_EARNED_CALCULATED,
  amount: 1000,
  basisType: 'paid_applied_production',
  hasPaidAppliedProduction: true,
  hasDocumentedRule: true,
});
assert.equal(calculated.paidConfirmed, false);
assert.equal(calculated.createsPayoutTruth, false);

const activityBased = createBonusCalculationResult({
  state: BONUS_CALCULATION_STATES.BONUS_EARNED_CALCULATED,
  amount: 1000,
  basisType: 'activity',
  hasPaidAppliedProduction: true,
  hasDocumentedRule: true,
});
assert.equal(activityBased.state, BONUS_CALCULATION_STATES.BONUS_BLOCKED);
assert.ok(activityBased.reasons.includes('activity_cannot_create_bonus'));

const missingRule = createBonusCalculationResult({
  state: BONUS_CALCULATION_STATES.BONUS_EARNED_CALCULATED,
  basisType: 'paid_applied_production',
  hasPaidAppliedProduction: true,
  hasDocumentedRule: false,
});
assert.equal(missingRule.state, BONUS_CALCULATION_STATES.BONUS_BLOCKED);

const forecast = createBonusCalculationResult({
  state: BONUS_CALCULATION_STATES.BONUS_POTENTIAL,
  forecast: true,
});
assert.equal(forecast.state, BONUS_CALCULATION_STATES.BONUS_BLOCKED);
assert.equal(forecast.forecastCreatesPayoutTruth, false);

console.log('PASS bonus-calculation-result-test');
