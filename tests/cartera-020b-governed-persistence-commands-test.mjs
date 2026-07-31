import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const tablesPath = 'supabase/migrations/20260731000220_cartera020b_evidence_tables.sql';
const helpersPath = 'supabase/migrations/20260731000223_cartera020b_command_helpers.sql';
const admissionPath = 'supabase/migrations/20260731000224_cartera020b_admission_and_claim_rpcs.sql';
const resultPath = 'supabase/migrations/20260731000225_cartera020b_processing_result_rpc.sql';

const allCommands = async () => [
  await read(helpersPath), await read(admissionPath), await read(resultPath),
].join('\n');

test('inbox persistence uses the real metadata column and has no metada typo', async () => {
  const sql = await read(tablesPath);
  assert.match(sql, /metadata jsonb not null default '\{\}'::jsonb check \(jsonb_typeof\(metadata\) = 'object'\)/);
  assert.doesNotMatch(sql, /\bmetada\b/);
});

test('server command digest ignores untrusted commandDigest and strict key validation exists', async () => {
  const sql = await read(helpersPath);
  assert.match(sql, /\(p_command - 'commandDigest'\)::text/);
  assert.match(sql, /forge_cartera020b_jsonb_keys_allowed/);
  assert.match(sql, /jsonb_object_keys/);
  assert.match(sql, /forge_cartera020b_has_forbidden_payload_keys/);
  assert.match(sql, /raw_document/);
  assert.match(sql, /document_bytes/);
  assert.match(sql, /access_token/);
});

test('changed-input replay is a durable conflict while identical replay returns the receipt', async () => {
  const sql = await read(helpersPath);
  assert.match(sql, /receipt\.command_digest = p_command_digest/);
  assert.match(sql, /receipt\.response_payload \|\| jsonb_build_object\('replayed', true\)/);
  assert.match(sql, /insert into public\.cartera020b_command_conflicts/);
  assert.match(sql, /CHANGED_INPUT_REPLAY/);
  assert.match(sql, /on conflict \(advisor_id, conflict_reference\) do nothing/);
});

test('admission RPC is authenticated, owner matched, bounded and advisory locked', async () => {
  const sql = await read(admissionPath);
  assert.match(sql, /create or replace function public\.forge_cartera020b_admit_evidence\(p_command jsonb\)/);
  assert.match(sql, /actor_id uuid := auth\.uid\(\)/);
  assert.match(sql, /CARTERA020B_ADMISSION_OWNER_MISMATCH/);
  assert.match(sql, /CARTERA020B_ADMISSION_COMMAND_TOO_LARGE/);
  assert.match(sql, /pg_advisory_xact_lock/g);
  assert.match(sql, /FORGE_EVIDENCE_ADMISSION_COMMAND/);
  assert.match(sql, /CARTERA-020B\.1/);
});

test('admission creates source, inbox, transition and receipt but no Policy truth', async () => {
  const sql = await read(admissionPath);
  assert.match(sql, /insert into public\.cartera020b_evidence_sources/);
  assert.match(sql, /insert into public\.cartera020b_evidence_inbox_items/);
  assert.match(sql, /insert into public\.cartera020b_evidence_transitions/);
  assert.match(sql, /forge_cartera020b_persist_receipt/);
  assert.match(sql, /'createsPolicy',false/);
  assert.match(sql, /'rawBytesPersisted',false/);
  assert.match(sql, /ALREADY_ADMITTED/);
});

test('claim RPC uses SKIP LOCKED, replays an active worker lease and recovers expired leases', async () => {
  const sql = await read(admissionPath);
  assert.match(sql, /forge_cartera020b_claim_evidence/);
  assert.match(sql, /for update skip locked/g);
  assert.match(sql, /i\.lease_owner = p_worker_id/);
  assert.match(sql, /i\.lease_expires_at > claimed_at/);
  assert.match(sql, /i\.lease_expires_at <= claimed_at/);
  assert.match(sql, /EXPIRED_LEASE_RECLAIMED/);
  assert.match(sql, /NO_AVAILABLE_ITEM/);
});

test('claim mutation is governed, increments version and appends a transition', async () => {
  const sql = await read(admissionPath);
  assert.match(sql, /set_config\('forge\.cartera020b_command', 'on', true\)/);
  assert.match(sql, /state_version = i\.state_version \+ 1/);
  assert.match(sql, /transition\/claim\//);
  assert.match(sql, /leaseSeconds/);
  assert.match(sql, /grant execute on function public\.forge_cartera020b_claim_evidence/);
});

test('processing result validates auth, lease, optimistic version and allowed status transition', async () => {
  const sql = await read(resultPath);
  assert.match(sql, /forge_cartera020b_record_processing_result/);
  assert.match(sql, /CARTERA020B_RESULT_OWNER_MISMATCH/);
  assert.match(sql, /CARTERA020B_VERSION_CONFLICT/);
  assert.match(sql, /CARTERA020B_CLAIM_MISMATCH/);
  assert.match(sql, /CARTERA020B_LEASE_EXPIRED/);
  assert.match(sql, /forge_cartera020b_transition_allowed/);
  assert.match(sql, /CARTERA020B_STATUS_TRANSITION_INVALID/);
});

test('processing replay is checked before item mutation', async () => {
  const sql = await read(resultPath);
  const replayIndex = sql.indexOf('forge_cartera020b_existing_receipt_response');
  const lockIndex = sql.indexOf('for update;');
  assert.ok(replayIndex > -1 && lockIndex > replayIndex);
  assert.match(sql, /RECORD_PROCESSING_RESULT/);
  assert.match(sql, /pg_advisory_xact_lock/);
});

test('attempt, candidate and packet persistence remain non-truth and source bound', async () => {
  const sql = await read(resultPath);
  assert.match(sql, /attempt ->> 'sourceDigest' <> source_digest/);
  assert.match(sql, /insert into public\.cartera020b_extraction_attempts/);
  assert.match(sql, /insert into public\.cartera020b_extraction_candidates/);
  assert.match(sql, /insert into public\.cartera020b_policy_evidence_packets/);
  assert.match(sql, /'PENDING_CONFIRMATION', false/);
  assert.match(sql, /creates_truth/);
  assert.match(sql, /identityCandidates/);
  assert.match(sql, /policyRoleCandidates/);
  assert.match(sql, /existingPolicyCandidates/);
});

test('retry scheduling increments retry count and always clears the lease', async () => {
  const sql = await read(resultPath);
  assert.match(sql, /target_worker_state = 'RETRY_WAIT'/g);
  assert.match(sql, /i\.retry_count \+ 1/);
  assert.match(sql, /power\(2, item\.retry_count\)/);
  assert.match(sql, /lease_owner = null, lease_token = null, lease_expires_at = null/);
  assert.match(sql, /RETRY_SCHEDULED/);
});

test('governed SQL commands never write Person, Policy, PolicyRole or external effects', async () => {
  const sql = (await allCommands()).toLowerCase();
  for (const forbidden of [
    'insert into public.commercial_people',
    'insert into public.canonical_policies',
    'insert into public.policy_roles',
    'forge_cartera010b_confirm_policy_with_parties',
    'insert into public.prospects',
    'calendar',
    'message_send',
    'due_actions',
  ]) assert.equal(sql.includes(forbidden), false, `forbidden command effect: ${forbidden}`);
  assert.match(sql, /grant execute on function public\.forge_cartera020b_admit_evidence/);
  assert.match(sql, /grant execute on function public\.forge_cartera020b_record_processing_result/);
});
