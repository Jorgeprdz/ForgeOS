import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260809000200_cartera020c_durable_attach_pipeline_person.sql', import.meta.url), 'utf8');
const adapter = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../docs/static-preview/forge-aura/index.html', import.meta.url), 'utf8');

test('020C durable attach rebuilds identity from succeeded durable receipts and server-binds authorization digest', () => {
  assert.match(migration, /forge_cartera020c_attach_policy_confirmation_durable/);
  assert.match(migration, /c\.stage = 'IDENTITY_RESOLUTION'/);
  assert.match(migration, /c\.status = 'SUCCEEDED'/);
  assert.match(migration, /forge_cartera020c_json_digest\(durable_batch\).*review\.identity_batch_digest/s);
  assert.match(migration, /forge_cartera020c_authorization_digest\(durable_composition\)/);
  assert.match(migration, /forge_cartera010b_command_digest\(policy_command\)/);
  assert.match(migration, /CARTERA020C_DURABLE_POLICY_PARTICIPANT_MISMATCH/);
  assert.match(migration, /return public\.forge_cartera020c_attach_policy_confirmation\(bound_request\)/);
  assert.doesNotMatch(migration, /update\s+public\.commercial_people/i);
  assert.doesNotMatch(migration, /insert\s+into\s+public\.canonical_policies/i);
});

test('020C canonical identity wrapper preserves explicit authorization while eliminating browser JSON digest drift', () => {
  assert.match(migration, /forge_cartera020c_prepare_identity_orchestration_canonical/);
  assert.match(migration, /confirmation' <> 'CONFIRM_IDENTITY_RESOLUTION'/);
  assert.match(migration, /forge_cartera020c_authorization_digest\(batch\)/);
  assert.match(migration, /forge_cartera020c_prepare_identity_orchestration\(bound_request\)/);
});

test('v10 never name-matches Pipeline automatically and uses governed Identity Resolution only after explicit selection', () => {
  assert.match(adapter, /PIPELINE_PREFIX = 'pipeline-prospect:'/);
  assert.match(adapter, /Pipeline · requiere vinculación explícita/);
  assert.match(adapter, /forge_cartera010b_confirm_identity_resolution/);
  assert.match(adapter, /sourceIdentityType: 'PROSPECT'/);
  assert.match(adapter, /outcome: durablePerson \? 'LINK_CONFIRMED' : 'CREATE_CONFIRMED'/);
  assert.match(adapter, /existingPersonReference: personReference/);
  assert.doesNotMatch(adapter, /includes\(normalizedName|normalizedName\([^)]*\)\s*===\s*normalizedName/);
});

test('v10 resumes an already IDENTITY_CONFIRMED review instead of replaying identity and routes attach through durable server boundary', () => {
  assert.match(adapter, /\['IDENTITY_CONFIRMED','POLICY_READY','POLICY_EXECUTING','CONFIRMED'\]/);
  assert.match(adapter, /return statusResult/);
  assert.match(adapter, /ATTACH_DURABLE_RPC/);
  assert.match(adapter, /target\.rpc\(ATTACH_DURABLE_RPC/);
});

test('Aura productive import map routes old Cartera v9 dependency to v10 with a new cache boundary', () => {
  assert.match(index, /cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh/);
  assert.match(index, /cartera-adapter-pages-v10\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(index, /cartera-module-v5\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(index, /aura-bootstrap-v4-r1\.js\?v=cartera-020c-policy-attach-pipeline-person-015-auth-premium-entry-001/);
});
