import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const tablesPath = 'supabase/migrations/20260731000220_cartera020b_evidence_tables.sql';
const guardsPath = 'supabase/migrations/20260731000221_cartera020b_worker_guards.sql';
const rlsPath = 'supabase/migrations/20260731000222_cartera020b_rls_and_grants.sql';

const readFoundation = async () => [
  await read(tablesPath),
  await read(guardsPath),
  await read(rlsPath),
].join('\n');

test('migrations create eight durable Evidence authorities', async () => {
  const sql = await read(tablesPath);
  for (const table of [
    'cartera020b_evidence_sources',
    'cartera020b_evidence_inbox_items',
    'cartera020b_evidence_transitions',
    'cartera020b_extraction_attempts',
    'cartera020b_extraction_candidates',
    'cartera020b_policy_evidence_packets',
    'cartera020b_command_receipts',
    'cartera020b_command_conflicts',
  ]) assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
});

test('persistence stores digests and opaque references, never raw document content', async () => {
  const sql = await read(tablesPath);
  assert.match(sql, /document_digest text not null check \(document_digest ~ '\^\[a-f0-9\]\{64\}\$'\)/);
  assert.match(sql, /storage_reference text not null/);
  assert.match(sql, /text_digest text/);
  assert.match(sql, /output_reference text/);
  assert.doesNotMatch(sql, /raw_document|raw_text|document_bytes|bytea/i);
});

test('worker persistence includes leases, retries and optimistic versioning', async () => {
  const sql = await read(tablesPath);
  for (const marker of [
    'lease_owner', 'lease_token', 'lease_expires_at', 'retry_count',
    'next_retry_at', 'state_version', 'RETRY_WAIT',
  ]) assert.ok(sql.toUpperCase().includes(marker.toUpperCase()), `missing ${marker}`);
});

test('append-only and governed inbox mutation guards are installed', async () => {
  const sql = await read(guardsPath);
  assert.match(sql, /CARTERA020B_APPEND_ONLY/);
  assert.match(sql, /CARTERA020B_GOVERNED_COMMAND_REQUIRED/);
  assert.match(sql, /cartera020b_transition_allowed/);
  assert.match(sql, /before update or delete on public\.cartera020b_evidence_sources/);
  assert.match(sql, /before update or delete on public\.cartera020b_evidence_inbox_items/);
});

test('RLS is owner scoped and direct mutations are revoked', async () => {
  const sql = await read(rlsPath);
  assert.match(sql, /force row level security/g);
  assert.match(sql, /using \(advisor_id = auth\.uid\(\)\)/g);
  assert.match(sql, /revoke all on public\.cartera020b_/g);
  assert.match(sql, /grant select on public\.cartera020b_/g);
});

test('table, guard and RLS foundation does not itself expose mutation RPCs', async () => {
  const sql = await readFoundation();
  assert.doesNotMatch(sql, /create or replace function public\.forge_cartera020b_admit_evidence/);
  assert.doesNotMatch(sql, /create or replace function public\.forge_cartera020b_claim_evidence/);
  assert.doesNotMatch(sql, /create or replace function public\.forge_cartera020b_record_processing_result/);
});

test('candidate and packet rows remain non-truth and pending confirmation', async () => {
  const sql = await read(tablesPath);
  assert.match(sql, /creates_truth boolean not null default false check \(creates_truth = false\)/g);
  assert.match(sql, /confirmation_state = 'PENDING_CONFIRMATION'/);
  assert.match(sql, /identity_candidates jsonb/);
  assert.match(sql, /policy_role_candidates jsonb/);
  assert.match(sql, /existing_policy_candidates jsonb/);
});

test('command receipt and conflict authorities reserve exact replay handling', async () => {
  const sql = await read(tablesPath);
  assert.match(sql, /cartera020b_command_receipts/);
  assert.match(sql, /unique \(advisor_id, command_type, idempotency_key\)/);
  assert.match(sql, /cartera020b_command_conflicts/);
  assert.match(sql, /CHANGED_INPUT_REPLAY/);
});

test('JSON schemas are strict and preserve unknown values', async () => {
  const envelope = JSON.parse(await read('schemas/cartera-020b-extraction-envelope-v1.schema.json'));
  const field = JSON.parse(await read('schemas/cartera-020b-policy-field-candidate-v1.schema.json'));
  assert.equal(envelope.additionalProperties, false);
  assert.equal(envelope.properties.createsTruth.const, false);
  assert.equal(field.additionalProperties, false);
  assert.equal(field.properties.createsTruth.const, false);
  assert.ok(field.properties.state.enum.includes('UNKNOWN'));
});
