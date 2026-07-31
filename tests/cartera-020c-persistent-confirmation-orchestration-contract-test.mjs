import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tables = readFileSync(
  new URL('../supabase/migrations/20260731000230_cartera020c_confirmation_orchestration_tables.sql', import.meta.url),
  'utf8'
);
const guards = readFileSync(
  new URL('../supabase/migrations/20260731000231_cartera020c_confirmation_orchestration_guards_rls.sql', import.meta.url),
  'utf8'
);
const rpcs = readFileSync(
  new URL('../supabase/migrations/20260731000232_cartera020c_confirmation_orchestration_rpcs.sql', import.meta.url),
  'utf8'
);
const service = readFileSync(
  new URL('../advisor-os/cartera/persistent-confirmation-orchestration-service.js', import.meta.url),
  'utf8'
);
const combined = `${tables}\n${guards}\n${rpcs}`;

function matches(source, pattern) {
  assert.match(source, pattern);
}

function rejects(source, pattern) {
  assert.doesNotMatch(source, pattern);
}

test('persistent review, ordered commands, attempts, transitions and conflicts are durable authorities', () => {
  for (const table of [
    'cartera020c_confirmation_reviews',
    'cartera020c_confirmation_commands',
    'cartera020c_confirmation_attempts',
    'cartera020c_confirmation_transitions',
    'cartera020c_confirmation_conflicts',
  ]) {
    matches(tables, new RegExp(`create table if not exists public\\.${table}`));
  }
});

test('review lifecycle locks identity, policy, retry and terminal states', () => {
  for (const state of [
    'IDENTITY_READY', 'IDENTITY_EXECUTING', 'IDENTITY_CONFIRMED',
    'POLICY_READY', 'POLICY_EXECUTING', 'RETRY_WAIT',
    'BLOCKED', 'REJECTED', 'CONFIRMED',
  ]) {
    matches(tables, new RegExp(`'${state}'`));
  }
  matches(guards, /cartera020c_review_transition_allowed/);
  matches(guards, /cartera020c_command_transition_allowed/);
});

test('attempts, transitions and conflicts remain append-only', () => {
  for (const trigger of [
    'cartera020c_attempts_append_only',
    'cartera020c_transitions_append_only',
    'cartera020c_conflicts_append_only',
  ]) {
    matches(guards, new RegExp(trigger));
  }
  matches(guards, /CARTERA020C_APPEND_ONLY/);
});

test('owner-private orchestration tables force RLS without direct authenticated grants', () => {
  for (const table of [
    'cartera020c_confirmation_reviews',
    'cartera020c_confirmation_commands',
    'cartera020c_confirmation_attempts',
    'cartera020c_confirmation_transitions',
    'cartera020c_confirmation_conflicts',
  ]) {
    matches(guards, new RegExp(`alter table public\\.${table} force row level security`));
    matches(guards, new RegExp(`revoke all on public\\.${table} from public, anon, authenticated`));
    rejects(guards, new RegExp(`grant select on public\\.${table}`));
  }
});

test('public orchestration surface is exactly prepare, attach, execute, status and retry', () => {
  for (const fn of [
    'forge_cartera020c_prepare_identity_orchestration',
    'forge_cartera020c_attach_policy_confirmation',
    'forge_cartera020c_execute_next_confirmation_step',
    'forge_cartera020c_get_confirmation_status',
    'forge_cartera020c_retry_confirmation',
  ]) {
    matches(rpcs, new RegExp(`create or replace function public\\.${fn}`));
    matches(rpcs, new RegExp(`grant execute on function public\\.${fn}`));
  }
});

test('service invokes only the bounded 020C orchestration RPC surface', () => {
  for (const fn of [
    'forge_cartera020c_prepare_identity_orchestration',
    'forge_cartera020c_attach_policy_confirmation',
    'forge_cartera020c_execute_next_confirmation_step',
    'forge_cartera020c_get_confirmation_status',
    'forge_cartera020c_retry_confirmation',
  ]) matches(service, new RegExp(`'${fn}'`));
  rejects(service, /forge_cartera010b_/);
  rejects(service, /\.from\s*\(/);
  rejects(service, /\.(insert|update|delete)\s*\(/);
});

test('identity and Policy require separate explicit authorizations', () => {
  matches(service, /CONFIRM_IDENTITY_RESOLUTION/);
  matches(service, /CONFIRM_POLICY_PERSISTENCE/);
  matches(rpcs, /CONFIRM_IDENTITY_RESOLUTION/);
  matches(rpcs, /CONFIRM_POLICY_PERSISTENCE/);
  matches(rpcs, /IDENTITY_EXECUTION_AUTHORIZED/);
  matches(rpcs, /POLICY_EXECUTION_AUTHORIZED/);
});

test('executor invokes accepted 010B authorities and no canonical direct writes', () => {
  matches(rpcs, /forge_cartera010b_confirm_identity_resolution\(command\.command_payload\)/);
  matches(rpcs, /forge_cartera010b_confirm_policy_with_parties\(command\.command_payload\)/);
  rejects(rpcs, /insert into public\.(commercial_people|commercial_accounts|canonical_policies|policy_versions|policy_evidence_versions|policy_roles)/i);
  rejects(rpcs, /update public\.(commercial_people|commercial_accounts|canonical_policies|policy_versions|policy_evidence_versions|policy_roles)/i);
  rejects(rpcs, /delete from public\.(commercial_people|commercial_accounts|canonical_policies|policy_versions|policy_evidence_versions|policy_roles)/i);
});

test('Account creation and direct Account mutation remain unauthorized', () => {
  matches(service, /CARTERA020C_ACCOUNT_CREATION_NOT_AUTHORIZED/);
  matches(rpcs, /CARTERA020C_EXISTING_ACCOUNT_NOT_CONFIRMED/);
  rejects(combined, /insert into public\.commercial_accounts/i);
  rejects(combined, /update public\.commercial_accounts/i);
  rejects(combined, /delete from public\.commercial_accounts/i);
  rejects(rpcs, /newAccount/);
});

test('identity-before-policy ordering is enforced durably', () => {
  matches(rpcs, /IDENTITY_BEFORE_POLICY_ORDER_VIOLATION/);
  matches(rpcs, /POLICY_BEFORE_IDENTITY_FORBIDDEN/);
  matches(rpcs, /IDENTITY_VERIFICATION_NOT_DURABLE/);
  matches(rpcs, /\["IDENTITY_RESOLUTION","CONFIRMED_POLICY"\]/);
  matches(rpcs, /identity_success_count <> review\.identity_command_count/);
});

test('identity read-after-write verifies receipt, Person, decision and active source link', () => {
  matches(rpcs, /from public\.cartera010b_command_receipts/);
  matches(rpcs, /from public\.commercial_people/);
  matches(rpcs, /from public\.commercial_source_identity_links/);
  matches(rpcs, /from public\.identity_resolution_decisions/);
  matches(rpcs, /CARTERA020C_IDENTITY_READ_AFTER_WRITE_VERIFIED/);
  matches(rpcs, /IDENTITY_READ_AFTER_WRITE_MISMATCH/);
});

test('Policy read-after-write verifies canonical version, evidence and exact role count', () => {
  matches(rpcs, /from public\.canonical_policies/);
  matches(rpcs, /from public\.policy_versions/);
  matches(rpcs, /from public\.policy_evidence_versions/);
  matches(rpcs, /from public\.policy_roles/);
  matches(rpcs, /persisted_role_count <> expected_role_count/);
  matches(rpcs, /CARTERA020C_POLICY_READ_AFTER_WRITE_VERIFIED/);
  matches(rpcs, /POLICY_READ_AFTER_WRITE_MISMATCH/);
});

test('bounded retry uses durable RETRY_WAIT and optimistic state versions', () => {
  matches(rpcs, /p_expected_state_version/);
  matches(rpcs, /CARTERA020C_STALE_STATE_VERSION/);
  matches(rpcs, /command\.attempt_count >= 5/);
  matches(rpcs, /forge_cartera020c_schedule_retry/);
  matches(rpcs, /CARTERA020C_RETRY_NOT_DUE/);
  matches(service, /expectedStateVersion/);
});

test('status is sanitized and never projects command or beneficiary payloads', () => {
  matches(rpcs, /commandPayloadProjected', false/);
  matches(rpcs, /hasRestrictedPolicyData/);
  rejects(rpcs, /'commandPayload'\s*,\s*command\.command_payload/);
  rejects(rpcs, /'roles'\s*,\s*command\.command_payload/);
  rejects(rpcs, /'beneficiary(Value|Name|Reference)'/i);
});

test('020B packet remains immutable while governed Inbox exits confirmation_required', () => {
  matches(guards, /confirmation_required' and p_to in \('confirmed', 'rejected', 'blocked', 'archived'\)/);
  matches(rpcs, /update public\.cartera020b_evidence_inbox_items/);
  matches(rpcs, /insert into public\.cartera020b_evidence_transitions/);
  rejects(rpcs, /update public\.cartera020b_policy_evidence_packets/);
  rejects(rpcs, /delete from public\.cartera020b_policy_evidence_packets/);
});
