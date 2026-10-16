import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeNeutralProvenance } from '../src/evidence/neutral-provenance.mjs';
const fixture = JSON.parse(readFileSync(new URL('./fixtures/work-evidence.json', import.meta.url)));
const copy = () => structuredClone(fixture);

test('verified neutral evidence preserves original dates and requires explicit policy', () => {
  const f = copy(); const before = structuredClone(f);
  const p = normalizeNeutralProvenance(f);
  assert.equal(p.status, 'VERIFIED');
  assert.deepEqual(p.sourceEvidence.evidenceRefs, ['ev-app-1', 'ev-int-1', 'ev-event-1']);
  assert.equal(p.evidence[0].captured_at, '2026-10-16T10:00:00.000Z');
  assert.deepEqual(f, before);
  assert.equal(normalizeNeutralProvenance({ ...f, asOf: undefined }).status, 'UNKNOWN');
  assert.equal(normalizeNeutralProvenance({ ...f, maxAgeMs: 0 }).status, 'UNKNOWN');
});
test('missing, stale and unverified evidence never becomes verified or invented', () => {
  const f = copy();
  assert.equal(normalizeNeutralProvenance({ ...f, evidence: [] }).status, 'NEEDS_EVIDENCE');
  assert.equal(normalizeNeutralProvenance({ ...f, asOf: '2026-10-19T12:00:00.000Z' }).status, 'STALE');
  f.evidence[0].verification.status = 'PENDING';
  assert.equal(normalizeNeutralProvenance(f).status, 'NEEDS_EVIDENCE');
  delete f.evidence[0].captured_at;
  assert.equal(normalizeNeutralProvenance(f).evidence[0].captured_at, null);
});
test('foreign workspace and sensitive provenance fields are rejected without leaking values', () => {
  const f = copy(); f.evidence[0].workspace_id = 'ws-foreign';
  assert.throws(() => normalizeNeutralProvenance(f), /WORKSPACE_MISMATCH/);
  const g = copy(); g.evidence[0].age = 'PRIVATE_SENTINEL';
  assert.throws(() => normalizeNeutralProvenance(g), e => !e.message.includes('PRIVATE_SENTINEL') && /UNSUPPORTED_EVIDENCE_FIELDS/.test(e.message));
  assert.throws(() => normalizeNeutralProvenance({ ...copy(), workspaceId: null }), /WORKSPACE_REQUIRED/);
});
test('future, impossible and unverified timestamps cannot establish fresh evidence', () => {
  for (const date of ['2026-10-17T10:00:00.000Z', '2026-02-30T10:00:00.000Z', 'invalid']) {
    const f = copy(); f.evidence[0].captured_at = date;
    assert.notEqual(normalizeNeutralProvenance(f).status, 'VERIFIED');
  }
  const f = copy(); delete f.evidence[0].verification.verified_by;
  assert.notEqual(normalizeNeutralProvenance(f).status, 'VERIFIED');
});
test('conflicting duplicate evidence IDs fail closed; unrelated subjects do not become evidence', () => {
  const f = copy(); f.evidence.push({ ...f.evidence[0], source_owner: 'CRM' });
  assert.throws(() => normalizeNeutralProvenance(f), /EVIDENCE_CONFLICT/);
  const p = normalizeNeutralProvenance({ ...copy(), subjectId: 'missing-subject' });
  assert.equal(p.status, 'NEEDS_EVIDENCE');
  assert.deepEqual(p.sourceEvidence.evidenceRefs, []);
});
