import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  'supabase/migrations/20260810001200_cartera020b_targeted_interactive_claim_012.sql',
  'utf8',
);
const initial = fs.readFileSync(
  'docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js',
  'utf8',
);
const staged = fs.readFileSync(
  'docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js',
  'utf8',
);

test('RU09 source-owner: exact claim overload remains advisor/item scoped and queue claim is not substituted', () => {
  assert.match(
    migration,
    /forge_cartera020b_claim_evidence\(\s*p_worker_id text,\s*p_lease_seconds integer,\s*p_inbox_reference text\s*\)/,
  );
  assert.match(migration, /i\.advisor_id = actor_id\s+and i\.inbox_reference = p_inbox_reference/);
  assert.match(migration, /CLAIM_EVIDENCE_EXACT/);
  assert.match(migration, /'claimMode','EXACT_INBOX'/);
});

test('RU09 runtime: initial claim and every intermediate reclaim pass the exact admitted inboxReference', () => {
  assert.match(
    initial,
    /forge_cartera020b_claim_evidence'\s*,\s*\{p_worker_id:workerId,p_lease_seconds:300,p_inbox_reference:admitted\.inboxReference\}/,
  );
  assert.match(staged, /async function reclaimSameEvidence\(client, command\)/);
  assert.match(staged, /p_worker_id:\s*command\.workerId/);
  assert.match(staged, /p_lease_seconds:\s*LEASE_SECONDS/);
  assert.match(staged, /p_inbox_reference:\s*command\.inboxReference/);
  assert.doesNotMatch(
    staged,
    /client\.rpc\(CLAIM_RPC,\s*\{\s*p_worker_id:\s*command\.workerId,\s*p_lease_seconds:\s*LEASE_SECONDS\s*\}\s*\)/,
  );
});

test('RU09 state machine: exact reclaim still advances with the returned lease token and state version', () => {
  assert.match(staged, /claimed\?\.data\?\.status !== 'CLAIMED'/);
  assert.match(staged, /claimed\?\.data\?\.inboxReference !== command\.inboxReference/);
  assert.match(staged, /leaseToken:\s*claimed\.data\.leaseToken/);
  assert.match(staged, /stateVersion:\s*claimed\.data\.stateVersion/);
  assert.match(staged, /stageCommand\(command, stage, lease, flow\)/);
  assert.match(staged, /workerState:\s*evidenceStatus === 'confirmation_required' \? 'COMPLETED' : 'AVAILABLE'/);
});
