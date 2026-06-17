const assert = require('assert');
const TruthCandidateResolver = require('../../src/intelligence/truth-resolution/truth-candidate-resolver');

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

const resolver = new TruthCandidateResolver();

test('1. Human accepted + deterministic corroboration -> canonical', () => {
  const candidate = { data: { owner: 'advisor' }, corroboratedBy: 'deterministic_extractor' };
  const ledger = { data: { owner: 'advisor' } };
  const context = { isHumanAccepted: true };
  const result = resolver.resolve(candidate, ledger, context);
  assert.strictEqual(result.status, 'canonical');
  assert.strictEqual(result.canPromote, true);
});

test('2. Human accepted + ledger corroboration -> canonical', () => {
  const candidate = { data: { owner: 'advisor' }, corroboratedBy: 'ledger' };
  const ledger = { data: { owner: 'advisor' } };
  const context = { isHumanAccepted: true };
  const result = resolver.resolve(candidate, ledger, context);
  assert.strictEqual(result.status, 'canonical');
  assert.strictEqual(result.canPromote, true);
});

test('3. Human accepted + advisor explicit promotion -> canonical', () => {
  const candidate = { data: { owner: 'advisor' } };
  const ledger = { data: { owner: 'advisor' } };
  const context = { isHumanAccepted: true, isAdvisorExplicitPromotion: true };
  const result = resolver.resolve(candidate, ledger, context);
  assert.strictEqual(result.status, 'canonical');
  assert.strictEqual(result.canPromote, true);
});

test('4. Candidate conflict with ledger -> disputed', () => {
  const candidate = { data: { owner: 'advisor' } };
  const ledger = { data: { owner: 'prospect' } };
  const result = resolver.resolve(candidate, ledger);
  assert.strictEqual(result.status, 'disputed');
  assert.strictEqual(result.canPromote, false);
});

test('5. Candidate without human acceptance -> candidate', () => {
  const candidate = { data: { owner: 'advisor' }, corroboratedBy: 'deterministic_extractor' };
  const ledger = { data: { owner: 'advisor' } };
  const result = resolver.resolve(candidate, ledger, { isHumanAccepted: false });
  assert.strictEqual(result.status, 'candidate');
  assert.strictEqual(result.canPromote, false);
});

test('6. Rejected evidence -> rejected', () => {
  const candidate = { data: { owner: 'advisor' } };
  const context = { isRejected: true };
  const result = resolver.resolve(candidate, {}, context);
  assert.strictEqual(result.status, 'rejected');
  assert.strictEqual(result.canPromote, false);
});

test('7. Missing evidence -> candidate', () => {
  const candidate = { data: { owner: 'advisor' } };
  const result = resolver.resolve(candidate, {});
  assert.strictEqual(result.status, 'candidate');
  assert.strictEqual(result.canPromote, false);
});
