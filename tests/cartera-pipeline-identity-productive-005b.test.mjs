import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const runner = await readFile(new URL('../scripts/forge-cartera-pipeline-identity-productive-005b.mjs', import.meta.url), 'utf8');
const gate = await readFile(new URL('../.github/workflows/cartera-pipeline-identity-005b-gate.yml', import.meta.url), 'utf8');
const remote = await readFile(new URL('../.github/workflows/cartera-pipeline-identity-005b-remote.yml', import.meta.url), 'utf8');
const adapter = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js', import.meta.url), 'utf8');
const identitySql = await readFile(new URL('../supabase/migrations/20260731000211_cartera010b_identity_resolution_rpc.sql', import.meta.url), 'utf8');
const durableSql = await readFile(new URL('../supabase/migrations/20260809000200_cartera020c_durable_attach_pipeline_person.sql', import.meta.url), 'utf8');

test('005B remote acceptance remains manual-only and contains no administrative bypass', () => {
  assert.match(remote, /workflow_dispatch:/);
  assert.doesNotMatch(remote, /^\s{2}(push|pull_request):/m);
  assert.match(remote, /YES:CARTERA_PIPELINE_IDENTITY_005B_REMOTE_MUTATION/);
  assert.match(remote, /ADVISOR_A_EMAIL/);
  assert.match(remote, /ADVISOR_B_EMAIL/);
  assert.match(remote, /SUPABASE_ANON_KEY/);
  assert.doesNotMatch(remote, /SERVICE_ROLE|SUPABASE_ACCESS_TOKEN|database\/query/i);
});

test('005B preflight gate is non-mutating and checks the exact acceptance runner', () => {
  assert.match(gate, /pull_request:/);
  assert.match(gate, /node --check scripts\/forge-cartera-pipeline-identity-productive-005b\.mjs/);
  assert.match(gate, /node --test tests\/cartera-pipeline-identity-productive-005b\.test\.mjs/);
  assert.doesNotMatch(gate, /ADVISOR_A_PASSWORD|ADVISOR_B_PASSWORD|REMOTE_WRITE_CONFIRMATION|SUPABASE_ACCESS_TOKEN/);
});

test('005B runner uses real Aura v10 plus authenticated Advisor A/B sessions', () => {
  assert.match(runner, /cartera-adapter-pages-v10\.js/);
  assert.match(runner, /signInWithPassword/);
  assert.match(runner, /SUPABASE_ANON_KEY/);
  assert.match(runner, /ADVISOR_A_EMAIL/);
  assert.match(runner, /ADVISOR_B_EMAIL/);
  assert.match(runner, /createCarteraAdapter\(\{ client: advisorA/);
  assert.match(runner, /createCarteraAdapter\(\{ client: advisorB/);
  assert.doesNotMatch(runner, /SERVICE_ROLE|SUPABASE_ACCESS_TOKEN|database\/query/i);
});

test('005B proves read-before-write, cancel, explicit convergence, policy attach and replay idempotency', () => {
  assert.match(runner, /PA01_IDENTITY_MUTATED_ON_READ/);
  assert.match(runner, /PA02_CANCEL_CREATED_LINK/);
  assert.match(runner, /adapterA\.confirmPdfReview\(review, confirmationInput\)/);
  assert.match(runner, /PA03_ACTIVE_LINK_COUNT_MUST_BE_ONE/);
  assert.match(runner, /PA04_PERSON_POLICY_READ_AFTER_WRITE_MISSING/);
  assert.match(runner, /PA05_REPLAY_CREATED_DUPLICATE_TRUTH/);
  assert.match(runner, /FIRST_PRODUCTIVE_ACCEPTANCE/);
  assert.match(runner, /REPLAY_EXISTING_SYNTHETIC_FIXTURE/);
});

test('005B proves no automatic matching and cross-advisor denial with real owner-scoped authorities', () => {
  assert.match(runner, /SHARED_EMAIL/);
  assert.match(runner, /SHARED_PHONE/);
  assert.match(runner, /PA07_AMBIGUOUS_PROSPECT_AUTO_LINKED_BEFORE_SELECTION/);
  assert.match(runner, /CARTERA010B_PROSPECT_NOT_OWNED/);
  assert.match(runner, /CARTERA020C_DURABLE_IDENTITY_NOT_READY/);
  assert.match(identitySql, /CARTERA010B_PROSPECT_NOT_OWNED/);
  assert.match(durableSql, /actor_id uuid := auth\.uid\(\)/);
});

test('005B product runtime keeps selection as the trigger for Pipeline convergence', () => {
  assert.match(adapter, /pipelineProspectReference\(input\.existingPersonReference\)/);
  assert.match(adapter, /resolvePipelineProspect\(client, review, prospectReference\)/);
  assert.match(adapter, /forge_cartera010b_confirm_identity_resolution/);
  const directoryBlock = adapter.slice(adapter.indexOf('async function loadPipelinePeople'), adapter.indexOf('async function ownedProspect'));
  assert.doesNotMatch(directoryBlock, /client\.rpc\(IDENTITY_RPC/);
});
