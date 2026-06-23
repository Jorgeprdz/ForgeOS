import assert from 'node:assert/strict';

import {
  GovernanceIdentityMissingError,
  createRulePackIdentitySnapshot,
  flattenRulePackIdentitySnapshot,
  stampRulePackIdentitySnapshot,
} from '../governance/rule-pack-identity-snapshot.js';

const draftIdentity = createRulePackIdentitySnapshot({
  metadata: {
    rulePackId: 'test-rule-pack',
    rulePackVersion: '2026.1.0',
    rulePackHash: 'draft:not-sealed',
    rulePackEffectiveDate: '2026-01-01',
    sourceEvidenceRefs: ['TEST_DOC'],
  },
  calculatedAt: '2026-06-22T23:00:00Z',
});

assert.equal(draftIdentity.rulePackId, 'test-rule-pack');
assert.equal(draftIdentity.rulePackVersion, '2026.1.0');
assert.equal(draftIdentity.rulePackHash, 'draft:not-sealed');
assert.equal(draftIdentity.governanceStatus, 'draft');
assert.equal(Object.isFrozen(draftIdentity), true);

const officialIdentity = createRulePackIdentitySnapshot({
  metadata: {
    rulePackId: 'official-rule-pack',
    rulePackVersion: '1.0.0',
    rulePackHash: 'sha256-abc123',
  },
  calculatedAt: null,
});

assert.equal(officialIdentity.governanceStatus, 'official');

const flattened = flattenRulePackIdentitySnapshot(draftIdentity);

assert.equal(flattened.rulePackIdentity.rulePackHash, 'draft:not-sealed');
assert.equal(flattened.rulePackHash, 'draft:not-sealed');

const stamped = stampRulePackIdentitySnapshot(
  {
    amount: 100,
    payoutTruth: true,
  },
  draftIdentity
);

assert.equal(stamped.amount, 100);
assert.equal(stamped.payoutTruth, false);
assert.equal(stamped.rulePackIdentity.rulePackHash, 'draft:not-sealed');

assert.throws(
  () => createRulePackIdentitySnapshot({
    metadata: {
      rulePackId: 'missing-version',
      rulePackHash: 'sha256-ok',
    },
  }),
  GovernanceIdentityMissingError
);

assert.throws(
  () => createRulePackIdentitySnapshot({
    metadata: {
      rulePackId: 'draft-not-allowed',
      rulePackVersion: '1',
      rulePackHash: 'draft:not-sealed',
    },
    allowDraft: false,
  }),
  GovernanceIdentityMissingError
);

console.log('PASS rule-pack-identity-snapshot-test');
