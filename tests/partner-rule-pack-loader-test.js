import assert from 'node:assert/strict';

import {
  loadDefaultSMNYLPartner2026RulePack,
  loadPartnerRulePack,
} from '../compensation/partner-manager/rule-engine/partner-rule-pack-loader.js';

const rulePack = loadDefaultSMNYLPartner2026RulePack();
assert.equal(rulePack.rulePackId, 'smnyl_partner_compensation_2026');
assert.equal(rulePack.source.sourceTruth, true);

assert.throws(
  () => loadPartnerRulePack({ filePath: new URL('./missing-rule-pack.json', import.meta.url) }),
  /partner_rule_pack_load_failed/
);

console.log('PASS partner-rule-pack-loader-test');
