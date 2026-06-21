import assert from 'node:assert/strict';

import {
  PARTNER_RULE_PACK_READINESS,
  isBlockedReadiness,
  isPartialReadiness,
  isReadyForContract,
  normalizeRulePackReadiness,
} from '../compensation/partner-manager/rule-pack-readiness.js';

assert.equal(normalizeRulePackReadiness('not_a_state'), PARTNER_RULE_PACK_READINESS.UNKNOWN);
assert.equal(isReadyForContract(PARTNER_RULE_PACK_READINESS.UNKNOWN), false);
assert.equal(isBlockedReadiness(PARTNER_RULE_PACK_READINESS.UNKNOWN), true);
assert.equal(isReadyForContract(PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT), true);
assert.equal(isPartialReadiness(PARTNER_RULE_PACK_READINESS.PARTIALLY_MODELABLE), true);

console.log('PASS partner-rule-pack-readiness-test');
