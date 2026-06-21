import assert from 'node:assert/strict';

import {
  assessPartnerConnectionBonus,
  assessPartnerDevelopmentBonus,
  assessPartnerPromotionBonus,
  assessPartnerTransitionBonus,
} from '../compensation/partner-manager/partner-partial-bonus-contracts.js';

const transition = assessPartnerTransitionBonus({
  directKeyAttribution: true,
});
assert.equal(transition.calculationAllowed, false);
assert.ok(transition.blockedReasons.includes('blocked_by_missing_commission_evidence'));
assert.equal(transition.amountCandidate, null);

const connection = assessPartnerConnectionBonus();
assert.equal(connection.calculationAllowed, false);
assert.equal(connection.metadata.activationSemanticAmount, 7500);
assert.ok(connection.blockedReasons.includes('blocked_by_missing_table'));
assert.equal(connection.payoutTruth, false);

const development = assessPartnerDevelopmentBonus();
assert.equal(development.readiness, 'example_only');
assert.equal(development.calculationAllowed, false);
assert.equal(development.metadata.exampleOnly.monthlyAmount, 15000);
assert.ok(development.blockedReasons.includes('example_only_not_formula'));

const promotion = assessPartnerPromotionBonus();
assert.equal(promotion.calculationAllowed, false);
assert.equal(promotion.metadata.totalSemanticAmount, 300000);
assert.equal(promotion.metadata.initialPayment, 60000);
assert.equal(promotion.metadata.monthlyPayment, 20000);
assert.equal(promotion.metadata.monthlyPayments, 12);
assert.ok(promotion.blockedReasons.includes('blocked_by_missing_table'));
assert.equal(promotion.amountCandidate, null);

console.log('PASS partner-partial-bonus-contracts-test');
