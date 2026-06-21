import assert from 'node:assert/strict';

import {
  BONUS_RULE_PACK_STATUSES,
  bonusRulePackIsModeled,
  createBonusRulePackContract,
} from '../compensation/contracts/bonus-rule-pack-contract.js';

const withoutSource = createBonusRulePackContract({
  carrier: 'SMNYL',
  year: 2026,
  profileStage: 'development_month_1_12',
  bonusCode: 'training_allowance',
  ruleStatus: BONUS_RULE_PACK_STATUSES.MODELED,
});

assert.equal(withoutSource.ruleStatus, BONUS_RULE_PACK_STATUSES.NOT_MODELED);
assert.equal(withoutSource.unsupportedReason, 'missing_source_document');
assert.equal(bonusRulePackIsModeled(withoutSource), false);
assert.equal(withoutSource.inventsRates, false);

const sourceBacked = createBonusRulePackContract({
  carrier: 'SMNYL',
  year: 2026,
  profileStage: 'development_month_1_12',
  bonusCode: 'training_allowance',
  sourceDocument: 'CC 2026 Asesores en Desarrollo.pdf',
  ruleStatus: BONUS_RULE_PACK_STATUSES.MODELED,
  requiredEvidence: ['paid_applied_production', 'documented_rule'],
});

assert.equal(sourceBacked.sourceBacked, true);
assert.equal(bonusRulePackIsModeled(sourceBacked), true);

const legacyStub = createBonusRulePackContract({
  carrier: 'SMNYL',
  year: 2026,
  bonusCode: 'legacy_stub',
  sourceDocument: 'rule-packs/smnyl/smnyl-concursos-config.js',
  ruleStatus: BONUS_RULE_PACK_STATUSES.MODELED,
  usesLegacyStubAsTruth: true,
});

assert.equal(legacyStub.sourceBacked, false);
assert.equal(bonusRulePackIsModeled(legacyStub), false);

console.log('PASS bonus-rule-pack-contract-test');
