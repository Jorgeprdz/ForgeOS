import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260809000200_cartera020c_durable_attach_pipeline_person.sql', import.meta.url), 'utf8');
const adapterEntry = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js', import.meta.url), 'utf8');
const adapter = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10-base-015.js', import.meta.url), 'utf8');
const adapterV11 = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js', import.meta.url), 'utf8');
const moduleEntry = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-module-v5.js', import.meta.url), 'utf8');
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

test('durable 015 base never name-matches Pipeline automatically and uses governed Identity Resolution only after explicit selection', () => {
  assert.match(adapter, /PIPELINE_PREFIX = 'pipeline-prospect:'/);
  assert.match(adapter, /Pipeline · requiere vinculación explícita/);
  assert.match(adapter, /forge_cartera010b_confirm_identity_resolution/);
  assert.match(adapter, /sourceIdentityType: 'PROSPECT'/);
  assert.match(adapter, /outcome: durablePerson \? 'LINK_CONFIRMED' : 'CREATE_CONFIRMED'/);
  assert.match(adapter, /existingPersonReference: personReference/);
  assert.doesNotMatch(adapter, /includes\(normalizedName|normalizedName\([^)]*\)\s*===\s*normalizedName/);
});

test('durable 015 base resumes an already IDENTITY_CONFIRMED review and routes attach through durable server boundary', () => {
  assert.match(adapter, /\['IDENTITY_CONFIRMED','POLICY_READY','POLICY_EXECUTING','CONFIRMED'\]/);
  assert.match(adapter, /return statusResult/);
  assert.match(adapter, /ATTACH_DURABLE_RPC/);
  assert.match(adapter, /target\.rpc\(ATTACH_DURABLE_RPC/);
});

test('published v10/v5 import-map targets advance through 016 descendants while preserving 015 byte-for-byte bases', () => {
  assert.match(index, /cartera-adapter-pages-v10\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(index, /cartera-module-v5\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(index, /aura-bootstrap-v4-r1\.js\?v=cartera-020c-policy-attach-pipeline-person-015-auth-premium-entry-001/);
  assert.match(adapterEntry, /cartera-adapter-pages-v11\.js\?v=cartera-person-workspace-directory-projection-016/);
  assert.match(moduleEntry, /cartera-module-v6\.js\?v=cartera-person-workspace-directory-projection-016/);
  assert.match(adapterV11, /cartera-adapter-pages-v10-base-015\.js\?base=cartera-person-workspace-directory-projection-016/);
  assert.match(adapter, /cartera-adapter-pages-v9\.js\?base=cartera-020c-policy-attach-pipeline-person-015/);
});
