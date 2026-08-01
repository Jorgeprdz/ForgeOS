import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gate = readFileSync(
  new URL('../.github/workflows/cartera-020c-remote-gate.yml', import.meta.url),
  'utf8'
);
const workflow = readFileSync(
  new URL('../.github/workflows/cartera-020c-remote-acceptance.yml', import.meta.url),
  'utf8'
);
const harness = readFileSync(
  new URL('../scripts/ci/cartera-020c-github-actions-remote-acceptance.mjs', import.meta.url),
  'utf8'
);
const acceptance = readFileSync(
  new URL('../scripts/ci/cartera-020c-remote-acceptance.sql', import.meta.url),
  'utf8'
);

const sourceCommit = '0daaccd556659b997f2086e12b09481281d1b019';
const projectRef = 'rmlxigxysujsuwzgoimv';

test('remote workflow is manual-only and requires exact authorization and heads', () => {
  assert.match(workflow, /^  workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^  (push|pull_request):/m);
  assert.match(workflow, /YES:CARTERA_020C_REMOTE_MUTATION/);
  assert.match(workflow, /expected_source_head:/);
  assert.match(workflow, /expected_acceptance_head:/);
  assert.match(workflow, /project_ref:/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, new RegExp(sourceCommit));
  assert.match(workflow, new RegExp(projectRef));
});

test('closed preparation gate is static, non-mutating and locks accepted closure', () => {
  assert.match(gate, /pull_request:/);
  assert.match(gate, /feature\/cartera-020c-identity-policy-confirmation-review/);
  assert.match(gate, /SUPABASE_REMOTE_MUTATION=NONE/);
  assert.match(gate, /REMOTE_EXECUTION_FROM_PR=IMPOSSIBLE/);
  assert.match(gate, /REMOTE_CLOSURE=LOCKED/);
  assert.match(gate, /CARTERA_020C_REMOTE_ACCEPTANCE=PASS/);
  assert.match(gate, /CARTERA_020C_COMPLETE=YES/);
  assert.doesNotMatch(gate, /AUTHORIZATION_DIGEST_HARDENING=REPOSITORY_READY/);
  assert.doesNotMatch(gate, /CARTERA_020C_REMOTE_ACCEPTANCE=PENDING/);
});

test('harness deploys exact 00230 through 00238 migration sequence', () => {
  for (let version = 230; version <= 238; version += 1) {
    assert.match(harness, new RegExp(`20260731000${version}`));
  }
  assert.match(harness, /MIGRATION_\$\{migration\.version\}_REMOTE_CONTENT_MISMATCH/);
  assert.match(harness, /supabase_migrations\.schema_migrations/);
  assert.match(harness, /stripOuterTransaction/);
});

test('transactional acceptance is rollback-only and covers critical boundaries', () => {
  assert.match(acceptance, /^begin;/m);
  assert.match(acceptance, /rollback;\s*$/);
  assert.match(acceptance, /CARTERA020C_FORGED_IDENTITY_AUTHORIZATION_ACCEPTED/);
  assert.match(acceptance, /CARTERA020C_FORGED_POLICY_AUTHORIZATION_ACCEPTED/);
  assert.match(acceptance, /CARTERA020C_CHANGED_INPUT_REPLAY_NOT_BLOCKED/);
  assert.match(acceptance, /CARTERA020C_EARLY_RETRY_ALLOWED/);
  assert.match(acceptance, /CARTERA020C_IDENTITY_READ_AFTER_WRITE_INVALID/);
  assert.match(acceptance, /CARTERA020C_POLICY_CONFIRMATION_INVALID/);
  assert.match(acceptance, /CARTERA020C_SANITIZED_STATUS_LEAK/);
  assert.match(acceptance, /CARTERA020C_DIRECT_ACCOUNT_WRITE_ALLOWED/);
});

test('parallel harness serializes same state version and cleans every fixture', () => {
  assert.match(harness, /Promise\.all/);
  assert.match(harness, /CARTERA020C_STALE_STATE_VERSION/);
  assert.match(harness, /PARALLEL_STATE_VERSION_SERIALIZATION=PASS/);
  assert.match(harness, /session_replication_role = replica/);
  assert.match(harness, /CONCURRENCY_FIXTURES_CLEANED=YES/);
  assert.match(harness, /RESIDUAL_FIXTURES=0/);
  assert.match(harness, /cartera020c_confirmation_reviews/);
  assert.match(harness, /commercial_people/);
  assert.match(harness, /canonical_policies/);
});

test('remote workflow requires all explicit evidence markers', () => {
  for (const marker of [
    'CARTERA_020C_REMOTE_DEPLOYMENT=PASS',
    'AUTHORIZATION_DIGEST_COMPATIBILITY=PASS',
    'CARTERA_020C_TRANSACTIONAL_ACCEPTANCE=PASS',
    'AUTHORIZATION_DIGEST_BINDING=PASS',
    'IDENTITY_ORDERED_EXECUTION=PASS',
    'IDENTITY_READ_AFTER_WRITE=PASS',
    'POLICY_READ_AFTER_WRITE=PASS',
    'CHANGED_INPUT_CONFLICT=PASS',
    'RETRY_GOVERNANCE=PASS',
    'PARALLEL_STATE_VERSION_SERIALIZATION=PASS',
    'RLS_CROSS_ADVISOR=PASS',
    'DIRECT_WRITES=BLOCKED',
    'SANITIZED_STATUS=PASS',
    'TEST_FIXTURES_ROLLED_BACK=YES',
    'CONCURRENCY_FIXTURES_CLEANED=YES',
    'RESIDUAL_FIXTURES=0',
    'CARTERA_020C_REMOTE_ACCEPTANCE=PASS',
  ]) {
    assert.match(workflow, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
