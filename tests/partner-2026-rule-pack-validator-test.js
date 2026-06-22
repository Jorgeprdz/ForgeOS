import assert from 'node:assert/strict';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

import {
  validatePartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-validator.js';

const rulePack = loadPartner2026RulePack();
const validation = validatePartner2026RulePack(rulePack);
assert.equal(validation.valid, true);
assert.ok(validation.warnings.includes('fixed_support_requires_supportTableEvidence'));

const missingConcepts = validatePartner2026RulePack({
  ...rulePack,
  concepts: undefined,
});
assert.equal(missingConcepts.valid, false);
assert.ok(missingConcepts.errors.includes('concepts_required'));

const notSourceTruth = validatePartner2026RulePack({
  ...rulePack,
  source: {
    ...rulePack.source,
    sourceTruth: false,
  },
});
assert.equal(notSourceTruth.valid, false);
assert.ok(notSourceTruth.errors.includes('sourceTruth_must_be_true'));

const missingPayoutTruthRule = validatePartner2026RulePack({
  ...rulePack,
  globalRules: {
    ...rulePack.globalRules,
    payoutTruthRule: undefined,
  },
});
assert.equal(missingPayoutTruthRule.valid, false);
assert.ok(missingPayoutTruthRule.errors.includes('payoutTruthRule_required'));

console.log('PASS partner-2026-rule-pack-validator-test');
