import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const scopePath = 'docs/architecture/source-truth/FORGE_CARTERA_020A_POLICY_INTAKE_ADAPTER_SCOPE_001.md';

test('020A is pinned to the accepted Point 1 merge and exact authorized phase', async () => {
  const scope = await read(scopePath);

  assert.match(scope, /AUTHORIZED_PHASE=CARTERA_020A_POLICY_INTAKE_ADAPTER_SCOPE/);
  assert.match(scope, /SOURCE_COMMIT=e8eebac5c8215a25fc918e8d46c1a30034b0e3da/);
  assert.match(scope, /CARTERA_POINT_1_CONTROL_BASE=COMPLETE/);
  assert.match(scope, /SCHEMA_MUTATION=NO/);
  assert.match(scope, /SUPABASE_REMOTE_MUTATION=NO/);
  assert.match(scope, /RUNTIME_MUTATION=NO/);
});

test('020A reuses the canonical Evidence backbone instead of creating another intake framework', async () => {
  const scope = await read(scopePath);

  for (const path of [
    'policy-operations/evidence-inbox/evidence-source.js',
    'policy-operations/evidence-inbox/evidence-inbox-item.js',
    'policy-operations/evidence-inbox/evidence-processing-status.js',
    'policy-operations/evidence-inbox/evidence-extraction-candidate.js',
    'policy-operations/evidence-inbox/evidence-inbox-router-contract.js',
    'policy-operations/evidence-inbox/evidence-confirmation-task.js',
    'policy-operations/evidence/policy-evidence-packet.js',
    'policy-operations/policy-advisor-confirmation-gate.js',
  ]) {
    assert.ok(scope.includes(path), `missing reuse path ${path}`);
    await read(path);
  }

  assert.match(scope, /Cartera must not build a new generic intake framework/);
});

test('candidate and confirmation semantics remain non-truth before the governed Policy command', async () => {
  const scope = await read(scopePath);
  const status = await read('policy-operations/evidence-inbox/evidence-processing-status.js');
  const candidate = await read('policy-operations/evidence-inbox/evidence-extraction-candidate.js');
  const packet = await read('policy-operations/evidence/policy-evidence-packet.js');

  assert.match(scope, /No step before the governed confirmed Policy command creates Policy Truth/);
  assert.match(scope, /020B must not invoke the confirmed Policy command/);
  assert.match(status, /CONFIRMATION_REQUIRED/);
  assert.match(status, /CONFIRMED/);
  assert.match(candidate, /createsTruth:\s*false/);
  assert.match(packet, /PENDING_CONFIRMATION/);
});

test('provider envelope and classification ambiguity are explicit', async () => {
  const scope = await read(scopePath);

  for (const token of [
    'providerVersion',
    'sourceDigest',
    'REVIEW_REQUIRED',
    'competing candidates',
    'ambiguity state',
    'RECEIPT',
    'ENDORSEMENT',
    'UNKNOWN',
  ]) {
    assert.ok(scope.includes(token), `missing provider/classification token ${token}`);
  }

  assert.match(scope, /must not be coerced to `POLICY`/);
  assert.match(scope, /Filename alone cannot select carrier, product or parser/);
});

test('parser registry preserves unknowns and field provenance', async () => {
  const scope = await read(scopePath);

  for (const token of [
    'parserId',
    'parserVersion',
    'UNKNOWN_CARRIER',
    'UNKNOWN_PRODUCT',
    'raw value',
    'normalized candidate value',
    'page/source location',
    'confidence',
    'conflict state',
  ]) {
    assert.ok(scope.includes(token), `missing parser token ${token}`);
  }

  assert.match(scope, /Unknown values remain unknown/);
  assert.match(scope, /must not become empty strings, zero, active status or guessed currency/);
});

test('durable worker scope is resumable, idempotent and isolated per file', async () => {
  const scope = await read(scopePath);

  for (const token of [
    'lease/claim ownership',
    'retry count',
    'next retry time',
    'idempotent transition command',
    'safe resume after process restart',
    'batch continues after one item fails',
    'review remains one item at a time',
  ]) {
    assert.ok(scope.includes(token), `missing worker token ${token}`);
  }
});

test('020B path roots and remote boundary are bounded', async () => {
  const scope = await read(scopePath);

  assert.match(scope, /policy-operations\/evidence-inbox\/\*\*/);
  assert.match(scope, /policy-operations\/evidence\/\*\*/);
  assert.match(scope, /platform\/policy-intelligence\/intake\/\*\*/);
  assert.match(scope, /supabase\/migrations\/\*cartera020b\*\.sql/);
  assert.match(scope, /`cartera\.js`/);
  assert.match(scope, /CARTERA_020B_SUPABASE_REMOTE_MUTATION=NO/);
});

test('completed 010D scope workflow is manual-only and bounded housekeeping is explicit', async () => {
  const scope = await read(scopePath);
  const inherited = await read('.github/workflows/cartera-010d-scope-acceptance.yml');

  assert.match(scope, /INHERITED_010D_GATE_RETIREMENT=BOUNDED/);
  assert.match(inherited, /workflow_dispatch:/);
  assert.doesNotMatch(inherited, /^  push:/m);
  assert.doesNotMatch(inherited, /^  pull_request:/m);
});

test('020A locks negative gates and the exact next phase', async () => {
  const scope = await read(scopePath);

  for (const forbidden of [
    'create or merge a person automatically',
    'create a Policy automatically',
    'invoke the confirmed Policy command',
    'write PolicyRole rows',
    'promote parser output into Policy Truth',
    'default unknown facts',
    'execute remote Supabase mutation',
  ]) {
    assert.ok(scope.includes(forbidden), `missing negative gate ${forbidden}`);
  }

  assert.match(scope, /CARTERA_020A_COMPLETE=YES/);
  assert.match(scope, /NEXT=CARTERA_020B_PERSISTENT_EVIDENCE_WORKER_AND_PARSER_REGISTRY/);
});
