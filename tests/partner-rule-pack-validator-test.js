import assert from 'node:assert/strict';

import {
  loadDefaultSMNYLPartner2026RulePack,
} from '../compensation/partner-manager/rule-engine/partner-rule-pack-loader.js';

import {
  validatePartnerRulePack,
} from '../compensation/partner-manager/rule-engine/partner-rule-pack-validator.js';

const rulePack = loadDefaultSMNYLPartner2026RulePack();
assert.equal(validatePartnerRulePack(rulePack).valid, true);

const missingRulePackId = validatePartnerRulePack({ ...rulePack, rulePackId: undefined });
assert.equal(missingRulePackId.valid, false);
assert.ok(missingRulePackId.errors.includes('rulePackId_required'));

const missingPayoutTruth = validatePartnerRulePack({
  ...rulePack,
  globalRules: {
    ...rulePack.globalRules,
    payoutTruthRule: undefined,
  },
});
assert.equal(missingPayoutTruth.valid, false);
assert.ok(missingPayoutTruth.errors.includes('payoutTruthRule_required'));

console.log('PASS partner-rule-pack-validator-test');
