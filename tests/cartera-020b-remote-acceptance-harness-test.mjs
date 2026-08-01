import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const harnessPath = 'scripts/ci/cartera-020b-github-actions-remote-acceptance.mjs';
const acceptancePath = 'scripts/ci/cartera-020b-remote-acceptance.sql';
const remoteWorkflowPath = '.github/workflows/cartera-020b-remote-acceptance.yml';
const staticWorkflowPath = '.github/workflows/cartera-020b-remote-gate.yml';

const harness = await read(harnessPath);
const acceptance = await read(acceptancePath);
const remoteWorkflow = await read(remoteWorkflowPath);

test('remote execution requires exact authorization, project, source and acceptance heads', () => {
  assert.match(harness, /YES:CARTERA_020B_REMOTE_MUTATION/);
  assert.match(harness, /95d03f220670239fc7c2af9ab5799bb21406cbd0/);
  assert.match(harness, /rmlxigxysujsuwzgoimv/);
  assert.match(harness, /EXPECTED_ACCEPTANCE_HEAD_MISSING/);
  assert.match(harness, /ACCEPTANCE_HEAD_MISMATCH/);
  assert.match(remoteWorkflow, /authorization:/);
  assert.match(remoteWorkflow, /expected_source_head:/);
  assert.match(remoteWorkflow, /expected_acceptance_head:/);
  assert.match(remoteWorkflow, /project_ref:/);
});

test('remote workflow is manual-only and cannot execute on push or pull request', () => {
  assert.match(remoteWorkflow, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(remoteWorkflow, /^  push:/m);
  assert.doesNotMatch(remoteWorkflow, /^  pull_request:/m);
  assert.match(remoteWorkflow, /ref: \$\{\{ inputs\.expected_acceptance_head \}\}/);
  assert.match(remoteWorkflow, /cancel-in-progress: false/);
});

test('deployment list is exact and includes packet replay hardening', () => {
  for (const version of [
    '20260731000220','20260731000221','20260731000222','20260731000223',
    '20260731000224','20260731000225','20260731000226','20260731000227',
  ]) assert.match(harness, new RegExp(version));
  assert.match(harness, /REMOTE_CONTENT_MISMATCH/);
  assert.match(harness, /supabase_migrations\.schema_migrations/);
  assert.match(harness, /stripOuterTransaction/);
});

test('transactional acceptance is rollback-clean and exercises all three RPCs', () => {
  assert.match(acceptance, /^begin;/);
  assert.match(acceptance, /rollback;\s*$/);
  assert.match(acceptance, /forge_cartera020b_admit_evidence/g);
  assert.match(acceptance, /forge_cartera020b_claim_evidence/g);
  assert.match(acceptance, /forge_cartera020b_record_processing_result/g);
  assert.match(acceptance, /CHANGED_INPUT_REPLAY/);
  assert.match(acceptance, /EXPIRED_LEASE_RECLAIMED/);
  assert.match(acceptance, /RETRY_WAIT/);
  assert.match(acceptance, /confirmation_required/);
  assert.match(acceptance, /CARTERA020B_PACKET_CHANGED_REPLAY/);
});

test('remote acceptance proves privacy and forbids canonical truth creation', () => {
  assert.match(acceptance, /CARTERA020B_CROSS_ADVISOR_SOURCE_READ/);
  assert.match(acceptance, /CARTERA020B_CROSS_ADVISOR_PACKET_READ/);
  assert.match(acceptance, /CARTERA020B_ANONYMOUS_READ_NOT_BLOCKED/);
  assert.match(acceptance, /CARTERA020B_DIRECT_WRITE_NOT_BLOCKED/);
  assert.match(acceptance, /CARTERA020B_POLICY_TRUTH_CREATED/);
  assert.match(acceptance, /CARTERA020B_PERSON_TRUTH_CREATED/);
  assert.match(acceptance, /CARTERA020B_POLICY_ROLE_TRUTH_CREATED/);
  const lower = acceptance.toLowerCase();
  assert.equal(lower.includes('insert into public.canonical_policies'), false);
  assert.equal(lower.includes('insert into public.commercial_people'), false);
  assert.equal(lower.includes('insert into public.policy_roles'), false);
});

test('parallel claim acceptance uses two real requests and mandatory cleanup', () => {
  assert.match(harness, /Promise\.all/);
  assert.match(harness, /PARALLEL_CLAIMS_DIVERGED/);
  assert.match(harness, /PARALLEL_REPLAY_COUNT_INVALID/);
  assert.match(harness, /finally \{/);
  assert.match(harness, /session_replication_role = replica/);
  assert.match(harness, /CARTERA020B_CONCURRENCY_CLEANUP/);
  assert.match(harness, /RESIDUAL_FIXTURES=0/);
});

test('artifact logging redacts access tokens and records failure evidence', () => {
  assert.match(harness, /\[REDACTED\]/);
  assert.match(harness, /report\.json/);
  assert.match(harness, /acceptance\.log/);
  assert.match(harness, /finally \{/g);
  assert.match(remoteWorkflow, /retention-days: 30/);
});

test('static PR workflow exists and never invokes the remote harness', async () => {
  const staticWorkflow = await read(staticWorkflowPath);
  assert.match(staticWorkflow, /^on:\n  pull_request:/m);
  assert.match(staticWorkflow, /SUPABASE_REMOTE_MUTATION=NONE/);
  assert.doesNotMatch(staticWorkflow, /node scripts\/ci\/cartera-020b-github-actions-remote-acceptance\.mjs/);
  assert.doesNotMatch(staticWorkflow, /SUPABASE_ACCESS_TOKEN/);
});
