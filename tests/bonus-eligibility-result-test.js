import assert from 'node:assert/strict';

import {
  BONUS_ELIGIBILITY_STATES,
  createBonusEligibilityResult,
} from '../compensation/contracts/bonus-eligibility-result.js';

const notModeled = createBonusEligibilityResult({
  state: BONUS_ELIGIBILITY_STATES.NOT_MODELED,
});
assert.equal(notModeled.notModeledIsZero, false);
assert.equal(notModeled.amount, null);

const unknown = createBonusEligibilityResult({
  state: BONUS_ELIGIBILITY_STATES.UNKNOWN,
});
assert.equal(unknown.unknownIsZero, false);
assert.equal(unknown.amount, null);

const blocked = createBonusEligibilityResult({
  state: BONUS_ELIGIBILITY_STATES.BLOCKED,
});
assert.equal(blocked.blockedIsZero, false);

const confirmedNotEligible = createBonusEligibilityResult({
  state: BONUS_ELIGIBILITY_STATES.NOT_ELIGIBLE,
  ruleModeled: true,
  evidenceConfirmed: true,
  amount: 99,
});
assert.equal(confirmedNotEligible.amount, 0);
assert.equal(confirmedNotEligible.canBeZero, true);

const unconfirmedNotEligible = createBonusEligibilityResult({
  state: BONUS_ELIGIBILITY_STATES.NOT_ELIGIBLE,
  ruleModeled: false,
  evidenceConfirmed: false,
});
assert.equal(unconfirmedNotEligible.amount, null);
assert.equal(unconfirmedNotEligible.canBeZero, false);

console.log('PASS bonus-eligibility-result-test');
