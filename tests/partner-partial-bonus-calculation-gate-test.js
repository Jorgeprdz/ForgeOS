import assert from 'node:assert/strict';

import {
  gatePartnerConnectionBonusCalculation,
  gatePartnerDevelopmentBonusCalculation,
  gatePartnerPromotionBonusCalculation,
  gatePartnerTransitionBonusCalculation,
} from '../compensation/partner-manager/partner-partial-bonus-calculation-gate.js';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const rulePack = loadPartner2026RulePack();

const transition = gatePartnerTransitionBonusCalculation({
  directKeyAttribution: true,
});
assert.ok(transition.blockedReasons.includes('blocked_by_missing_commission_evidence'));
assert.equal(transition.candidateAmount, null);

const connection = gatePartnerConnectionBonusCalculation({
  onboardingEvidence: true,
});
assert.equal(connection.calculationAllowed, false);
assert.equal(connection.metadata.semanticCandidateAmount, 7500);
assert.ok(connection.blockedReasons.includes('blocked_by_missing_table'));

const connectionFromJson = gatePartnerConnectionBonusCalculation({
  rulePack,
  advisorMonth: 2,
  validPolicyCount: 5,
  paidAppliedPolicyEvidence: true,
});
assert.equal(connectionFromJson.calculationAllowed, true);
assert.equal(connectionFromJson.candidateAmount, 15000);
assert.equal(connectionFromJson.payoutTruth, false);

const development = gatePartnerDevelopmentBonusCalculation();
assert.equal(development.status, 'example_only');
assert.equal(development.calculationAllowed, false);
assert.equal(development.metadata.exampleOnly.monthlyAmount, 15000);

const developmentFromJson = gatePartnerDevelopmentBonusCalculation({
  rulePack,
  advisorMonth: 7,
  validPolicyCount: 5,
  paidAppliedPolicyEvidence: true,
});
assert.equal(developmentFromJson.calculationAllowed, true);
assert.equal(developmentFromJson.candidateAmount, 15000);
assert.equal(developmentFromJson.payoutTruth, false);

const promotion = gatePartnerPromotionBonusCalculation();
assert.equal(promotion.calculationAllowed, false);
assert.equal(promotion.metadata.semanticAmounts.total, 300000);
assert.equal(promotion.metadata.semanticAmounts.initial, 60000);
assert.equal(promotion.metadata.semanticAmounts.monthly, 20000);
assert.ok(promotion.blockedReasons.includes('blocked_by_missing_table'));

console.log('PASS partner-partial-bonus-calculation-gate-test');
