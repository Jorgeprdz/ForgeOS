import assert from 'node:assert/strict';

import {
  assessPartnerConnectionBonus,
  assessPartnerDevelopmentBonus,
  assessPartnerPromotionBonus,
  assessPartnerTransitionBonus,
} from '../compensation/partner-manager/partner-partial-bonus-contracts.js';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const rulePack = loadPartner2026RulePack();
const connectionActivationAmount = rulePack.concepts['connection-bonus'].semanticAmounts.advisorOnboarding;
const developmentLastScale = rulePack.concepts['development-bonus'].policyScale.at(-1);
const promotionAmounts = rulePack.concepts['partner-promotion-bonus'].semanticAmounts;

const transition = assessPartnerTransitionBonus({
  directKeyAttribution: true,
});
assert.equal(transition.calculationAllowed, false);
assert.ok(transition.blockedReasons.includes('blocked_by_missing_commission_evidence'));
assert.equal(transition.amountCandidate, null);

const connection = assessPartnerConnectionBonus();
assert.equal(connection.calculationAllowed, false);
assert.equal(connection.metadata.activationSemanticAmount, connectionActivationAmount);
assert.ok(connection.blockedReasons.includes('blocked_by_missing_table'));
assert.equal(connection.payoutTruth, false);

const development = assessPartnerDevelopmentBonus();
assert.equal(development.readiness, 'ready_for_contract_with_caution');
assert.equal(development.calculationAllowed, false);
assert.equal(development.metadata.exampleOnly.monthlyAmount, developmentLastScale.amount);
assert.deepEqual(development.blockedReasons, []);

const promotion = assessPartnerPromotionBonus();
assert.equal(promotion.calculationAllowed, false);
assert.equal(promotion.metadata.totalSemanticAmount, promotionAmounts.total);
assert.equal(promotion.metadata.initialPayment, promotionAmounts.initial);
assert.equal(promotion.metadata.monthlyPayment, promotionAmounts.monthly);
assert.equal(promotion.metadata.monthlyPayments, promotionAmounts.monthlyPayments);
assert.ok(promotion.blockedReasons.includes('blocked_by_missing_table'));
assert.equal(promotion.amountCandidate, null);

console.log('PASS partner-partial-bonus-contracts-test');
