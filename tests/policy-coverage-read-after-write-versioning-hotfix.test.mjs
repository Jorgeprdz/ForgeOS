import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const hotfix = readFileSync(new URL(
  '../supabase/migrations/20260808000110_policy_coverage_read_after_write_versioning_hotfix.sql',
  import.meta.url
), 'utf8');
const original = readFileSync(new URL(
  '../supabase/migrations/20260808000100_policy_coverage_canonical_extension.sql',
  import.meta.url
), 'utf8');
const fixture = JSON.parse(readFileSync(new URL(
  './fixtures/policy-coverage-multi-benefit.synthetic.json', import.meta.url
), 'utf8'));

const ACTOR = 'advisor-a';
const POLICY = 'policy-1';
const POLICY_VERSION = 'policy-version-1';
const EVIDENCE_VERSION = 'evidence-version-1';

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function item(reference, version, overrides = {}) {
  return {
    policyCoverageReference: reference,
    currentVersion: version,
    marker: `${reference}-v${version}`,
    ...overrides,
  };
}

function row(commandItem, overrides = {}) {
  return {
    advisorId: ACTOR,
    policyId: POLICY,
    coverageReference: commandItem.policyCoverageReference,
    versionNumber: commandItem.currentVersion,
    policyVersionId: POLICY_VERSION,
    evidenceVersionId: EVIDENCE_VERSION,
    factsDigest: digest(commandItem),
    ...overrides,
  };
}

function verifiedCount(commandItems, rows, context = {}) {
  const actorId = context.actorId ?? ACTOR;
  const policyId = context.policyId ?? POLICY;
  const policyVersionId = context.policyVersionId ?? POLICY_VERSION;
  const evidenceVersionId = context.evidenceVersionId ?? EVIDENCE_VERSION;

  return commandItems.filter(commandItem => rows.filter(candidate => (
    candidate.advisorId === actorId
    && candidate.policyId === policyId
    && candidate.coverageReference === commandItem.policyCoverageReference
    && candidate.versionNumber === commandItem.currentVersion
    && candidate.policyVersionId === policyVersionId
    && candidate.evidenceVersionId === evidenceVersionId
    && candidate.factsDigest === digest(commandItem)
  )).length === 1).length;
}

function verify(commandItems, rows, context) {
  const count = verifiedCount(commandItems, rows, context);
  if (count !== commandItems.length) {
    const error = new Error('POLICY_COVERAGE_READ_AFTER_WRITE_FAILED');
    error.code = 'POLICY_COVERAGE_READ_AFTER_WRITE_FAILED';
    throw error;
  }
  return count;
}

function fails(commandItems, rows, context) {
  assert.throws(
    () => verify(commandItems, rows, context),
    error => error.code === 'POLICY_COVERAGE_READ_AFTER_WRITE_FAILED'
  );
}

test('DEFECT_REPRODUCED old verifier counts historical versions for the same reference', () => {
  assert.match(original, /select count\(\*\)::integer into persisted_count[\s\S]*from public\.policy_coverage_versions cv[\s\S]*policy_coverage_reference in \(/i);
  assert.doesNotMatch(original, /cv\.version_number\s*=\s*\(.*currentVersion/s);
  assert.doesNotMatch(original, /cv\.facts_digest\s*=\s*public\.forge_cartera010b_command_digest/s);
});

test('FORWARD_MIGRATION repairs only the known function verification fragment', () => {
  assert.match(hotfix, /pg_get_functiondef\([\s\S]*forge_policy_intelligence_confirm_policy_coverages\(jsonb\)/);
  assert.match(hotfix, /occurrence_count <> 1/);
  assert.match(hotfix, /POLICY_COVERAGE_RAW_HOTFIX_BASE_MISMATCH/);
  assert.doesNotMatch(hotfix, /\bcreate\s+table\b|\balter\s+table\b|\bdrop\s+table\b|\btruncate\b|\bdelete\s+from\b/i);
  assert.doesNotMatch(hotfix, /\bgrant\s+|\brevoke\s+/i);
});

test('READ_AFTER_WRITE exact verifier binds reference version PolicyVersion EvidenceVersion and facts digest', () => {
  for (const marker of [
    "c.policy_coverage_reference = command_item.value ->> 'policyCoverageReference'",
    "cv.version_number = (command_item.value ->> 'currentVersion')::integer",
    'cv.policy_version_id = persisted_policy_version.id',
    'cv.evidence_version_id = persisted_evidence.id',
    'cv.facts_digest = public.forge_cartera010b_command_digest(command_item.value)',
    'where 1 = (',
  ]) assert.ok(hotfix.includes(marker), `missing exact verifier marker: ${marker}`);
});

test('WEAKER_FIXES remain forbidden', () => {
  assert.doesNotMatch(hotfix, /count\s*\(\s*distinct\s+policy_coverage_id/i);
  assert.doesNotMatch(hotfix, />=\s*jsonb_array_length\s*\(\s*coverage_items/i);
  assert.doesNotMatch(hotfix, /delete\s+from\s+public\.policy_coverage_versions/i);
  assert.doesNotMatch(hotfix, /exception[\s\S]*POLICY_COVERAGE_READ_AFTER_WRITE_FAILED[\s\S]*return[\s\S]*CONFIRMED/i);
});

test('CASE A new Coverage v1 -> coverageCount=1', () => {
  const x1 = item('X', 1);
  assert.equal(verify([x1], [row(x1)]), 1);
});

test('CASE B two new Coverages v1 -> coverageCount=2', () => {
  const x1 = item('X', 1); const y1 = item('Y', 1);
  assert.equal(verify([x1, y1], [row(x1), row(y1)]), 2);
});

test('CASE C three new Coverages v1 -> coverageCount=3', () => {
  const x1 = item('X', 1); const y1 = item('Y', 1); const z1 = item('Z', 1);
  assert.equal(verify([x1, y1, z1], [row(x1), row(y1), row(z1)]), 3);
});

test('CASE D v1 then v2 preserves history while second command verifies exactly one item', () => {
  const x1 = item('X', 1); const x2 = item('X', 2, { previous: 'X-v1' });
  const history = [row(x1), row(x2)];
  assert.equal(verify([x2], history), 1);
  assert.equal(history.length, 2);
  assert.deepEqual(history.map(x => x.versionNumber), [1, 2]);
});

test('CASE E v1 -> v2 -> v3 preserves every historical version and each command count stays 1', () => {
  const x1 = item('X', 1); const x2 = item('X', 2); const x3 = item('X', 3);
  const history = [row(x1), row(x2), row(x3)];
  assert.equal(verify([x1], history), 1);
  assert.equal(verify([x2], history), 1);
  assert.equal(verify([x3], history), 1);
  assert.deepEqual(history.map(x => x.versionNumber), [1, 2, 3]);
});

test('CASE F two versioned Coverages do not confuse four historical rows with two command items', () => {
  const x1 = item('X', 1); const y1 = item('Y', 1);
  const x2 = item('X', 2); const y2 = item('Y', 2);
  const history = [row(x1), row(y1), row(x2), row(y2)];
  assert.equal(verify([x2, y2], history), 2);
  assert.equal(history.length, 4);
});

test('CASE G mandatory mixed command X v3 + Y new v1 + Z v2 -> coverageCount=3', () => {
  const x1 = item('X', 1); const x2 = item('X', 2); const x3 = item('X', 3);
  const y1 = item('Y', 1);
  const z1 = item('Z', 1); const z2 = item('Z', 2);
  const history = [row(x1), row(x2), row(y1), row(z1), row(x3), row(z2)];
  assert.equal(verify([x3, y1, z2], history), 3);
});

test('NEGATIVE requested v2 fails when only v1 exists, even with duplicate irrelevant history', () => {
  const x1 = item('X', 1); const x2 = item('X', 2);
  fails([x2], [row(x1), { ...row(x1), factsDigest: 'irrelevant-duplicate-history' }]);
});

test('NEGATIVE wrong version number fails', () => {
  const x2 = item('X', 2);
  fails([x2], [row(x2, { versionNumber: 1 })]);
});

test('NEGATIVE wrong Coverage reference fails', () => {
  const x2 = item('X', 2);
  fails([x2], [row(x2, { coverageReference: 'OTHER' })]);
});

test('NEGATIVE wrong PolicyVersion binding fails', () => {
  const x2 = item('X', 2);
  fails([x2], [row(x2, { policyVersionId: 'policy-version-other' })]);
});

test('NEGATIVE wrong EvidenceVersion binding fails', () => {
  const x2 = item('X', 2);
  fails([x2], [row(x2, { evidenceVersionId: 'evidence-version-other' })]);
});

test('NEGATIVE wrong facts_digest fails', () => {
  const x2 = item('X', 2);
  fails([x2], [row(x2, { factsDigest: '0'.repeat(64) })]);
});

test('NEGATIVE one missing item in an N-item command fails closed', () => {
  const x2 = item('X', 2); const y2 = item('Y', 2);
  fails([x2, y2], [row(x2)]);
});

test('UNKNOWN semantics remain null and are outside the hotfix surface', () => {
  const unknown = fixture.coverages[2];
  assert.equal(unknown.sumInsured, null);
  assert.equal(unknown.premiumAmount, null);
  assert.equal(unknown.currency, null);
  assert.equal(unknown.coverageState, null);
  assert.doesNotMatch(hotfix, /sum_insured\s*=|premium_amount\s*=|coverage_state\s*=/i);
});

test('IDEMPOTENCY and ATOMIC WRAPPER authorities remain inherited and untouched', () => {
  assert.match(original, /forge_cartera010b_existing_receipt_response/);
  assert.match(original, /forge_cartera010b_persist_receipt/);
  assert.match(original, /forge_cartera010b_confirm_identity_policy_and_coverages/);
  assert.doesNotMatch(hotfix, /forge_cartera010b_confirm_identity_policy_and_coverages\s*\(/i);
});

test('RLS DIRECT_WRITE and tenant security remain inherited with no grant expansion', () => {
  assert.match(original, /alter table public\.policy_coverages enable row level security/i);
  assert.match(original, /alter table public\.policy_coverage_versions enable row level security/i);
  assert.match(original, /revoke all on table public\.policy_coverages from public, anon, authenticated/i);
  assert.match(original, /using \(advisor_id = auth\.uid\(\)\)/i);
  assert.doesNotMatch(hotfix, /grant\s+(insert|update|delete|all)/i);
});
