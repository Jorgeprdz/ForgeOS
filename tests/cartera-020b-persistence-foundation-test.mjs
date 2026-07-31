import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const paths = [
  'supabase/migrations/20260731000220_cartera020b_evidence_tables.sql',
  'supabase/migrations/20260731000221_cartera020b_worker_guards.sql',
  'supabase/migrations/20260731000222_cartera020b_rls_and_grants.sql',
];
const sql = async () => (await Promise.all(paths.map(read))).join('\n');

test('migrations create eight durable Evidence authorities', async () => {
  const source = await sql();
  for (const table of [
    'cartera020b_evidence_sources', 'cartera020b_evidence_inbox_items',
    'cartera020b_evidence_transitions', 'cartera020b_extraction_attempts',
    'cartera020b_extraction_candidates', 'cartera020b_policy_evidence_packets',
    'cartera020b_command_receipts', 'cartera020b_command_conflicts',
  ]) assert.match(source, new RegExp(`create table if not exists public\\.${table}`));
});

test('persistence stores digests and opaque references, never raw document content', async () => {
  const source = await sql();
  assert.match(source, /document_digest text not null/);
  assert.match(source, /storage_reference text not null/);
  assert.match(source, /text_digest text/);
  assert.match(source, /output_reference text/);
  assert.doesNotMatch(source, /raw_document|raw_text|document_bytes|bytea/i);
});

test('worker persistence includes leases, retries and optimistic versioning', async () => {
  const source = await sql();
  for (const marker of ['lease_owner', 'lease_token', 'lease_expires_at', 'retry_count', 'next_retry_at', 'state_version', 'RETRY_WAIT']) {
    assert.ok(source.toUpperCase().includes(marker.toUpperCase()), `missing ${marker}`);
  }
});

test('append-only and governed inbox mutation guards are installed', async () => {
  const source = await sql();
  assert.match(source, /CARTERA020B_APPEND_ONLY/);
  assert.match(source, /CARTERA020B_GOVERNED_COMMAND_REQUIRED/);
  assert.match(source, /CARTERA020B_DELETE_FORBIDDEN/);
  assert.match(source, /cartera020b_transition_allowed/);
});

test('RLS is owner scoped and direct mutations are revoked', async () => {
  const source = await sql();
  assert.match(source, /force row level security/g);
  assert.match(source, /using \(advisor_id = auth\.uid\(\)\)/g);
  assert.match(source, /revoke all on public\.cartera020b_/g);
  assert.match(source, /grant select on public\.cartera020b_/g);
});

test('repository foundation intentionally contains no SQL mutation RPC yet', async () => {
  const source = await sql();
  assert.doesNotMatch(source, /create or replace function public\.forge_cartera020b_/);
  for (const forbidden of [
    'insert into public.commercial_people', 'insert into public.canonical_policies',
    'insert into public.policy_roles', 'forge_cartera010b_confirm_policy_with_parties',
    'due_actions', 'message_send',
  ]) assert.equal(source.toLowerCase().includes(forbidden.toLowerCase()), false, `forbidden ${forbidden}`);
});

test('candidate and packet rows remain non-truth and pending confirmation', async () => {
  const source = await sql();
  assert.match(source, /creates_truth boolean not null default false check \(creates_truth = false\)/g);
  assert.match(source, /confirmation_state = 'PENDING_CONFIRMATION'/);
  assert.match(source, /identity_candidates jsonb/);
  assert.match(source, /policy_role_candidates jsonb/);
  assert.match(source, /existing_policy_candidates jsonb/);
});

test('command receipt and conflict authorities reserve exact replay handling', async () => {
  const source = await sql();
  assert.match(source, /cartera020b_command_receipts/);
  assert.match(source, /cartera020b_command_conflicts/);
  assert.match(source, /CHANGED_INPUT_REPLAY/);
  assert.match(source, /idempotency_key text not null/);
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
