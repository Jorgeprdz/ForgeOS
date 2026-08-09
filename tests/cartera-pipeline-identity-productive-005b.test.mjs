import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const runner = await readFile(new URL('../scripts/forge-cartera-pipeline-identity-productive-005b.mjs', import.meta.url), 'utf8');
const fixturePrep = await readFile(new URL('../scripts/prepare-cartera-pipeline-identity-005b-r1-fixtures.mjs', import.meta.url), 'utf8');
const finalizer = await readFile(new URL('../scripts/finalize-cartera-pipeline-identity-005b-r1.mjs', import.meta.url), 'utf8');
const remoteWorkflow = await readFile(new URL('../.github/workflows/cartera-pipeline-identity-005b-r1.yml', import.meta.url), 'utf8');
const gate = await readFile(new URL('../.github/workflows/cartera-pipeline-identity-005b-gate.yml', import.meta.url), 'utf8');
const dispatcher = await readFile(new URL('../.github/workflows/beta1-022a-writable-acceptance.yml', import.meta.url), 'utf8');
const blockedEvidence = await readFile(new URL('../docs/evidence/FORGE_CARTERA_PIPELINE_IDENTITY_005B_BLOCKED.md', import.meta.url), 'utf8');
const authority005c = await readFile(new URL('../docs/architecture/source-truth/FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C.md', import.meta.url), 'utf8');
const evidence005c = await readFile(new URL('../docs/evidence/FORGE_WRITABLE_SYNTHETIC_ACCEPTANCE_005C_REMOTE_EVIDENCE.md', import.meta.url), 'utf8');
const adapter = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js', import.meta.url), 'utf8');
const identitySql = await readFile(new URL('../supabase/migrations/20260731000211_cartera010b_identity_resolution_rpc.sql', import.meta.url), 'utf8');
const durableSql = await readFile(new URL('../supabase/migrations/20260809000200_cartera020c_durable_attach_pipeline_person.sql', import.meta.url), 'utf8');

test('005B-R1 precondition is the merged productive 005C authority', () => {
  assert.match(authority005c, /ARCHITECTURAL_DECISION=DEDICATED_NON_PUBLIC_SYNTHETIC_ACCEPTANCE_IDENTITIES/);
  assert.match(authority005c, /SERVICE_ROLE_ALLOWED_FOR_DOMAIN_WRITES=NO/);
  assert.match(evidence005c, /AA01=PASS/);
  assert.match(evidence005c, /AA10=PASS/);
  assert.match(evidence005c, /POST_RUN_SEALED=YES/);
  assert.match(evidence005c, /REAL_DATA_TOUCHED=NO/);
});

test('005B blocked attempt remains immutable historical evidence, not the R1 authority', () => {
  assert.match(blockedEvidence, /WORKFLOW_RUN=31332993641/);
  assert.match(blockedEvidence, /ERROR=FORGE_DEMO_ACCOUNT_READ_ONLY/);
  assert.match(blockedEvidence, /FAILURE_CLASS=AUTHORITY_GAP/);
  assert.match(blockedEvidence, /DOMAIN_MUTATION=ZERO/);
  assert.match(blockedEvidence, /PRODUCT_DEFECT=NO/);
});

test('005B-R1 fixture preflight uses only dedicated 05C identities, productive RLS and owner-scoped retry reset', () => {
  assert.match(fixturePrep, /forge\.acceptance\.a@forge\.invalid/);
  assert.match(fixturePrep, /forge\.acceptance\.b@forge\.invalid/);
  assert.match(fixturePrep, /forge_demo_current_session/);
  assert.match(fixturePrep, /isAcceptance/);
  assert.match(fixturePrep, /AUTOMATED_ACCEPTANCE_ONLY/);
  assert.match(fixturePrep, /PRIMARY_SYNTHETIC_PHONE = '\+000000000057'/);
  assert.match(fixturePrep, /AMBIG_SYNTHETIC_PHONE = '\+000000000058'/);
  assert.match(fixturePrep, /phone_normalized:\s*syntheticPhone/);
  assert.match(fixturePrep, /createFreshFixture\(clientA, a\.id, PRIMARY_CONTEXT, PRIMARY_SYNTHETIC_PHONE\)/);
  assert.match(fixturePrep, /createFreshFixture\(clientA, a\.id, AMBIG_CONTEXT, AMBIG_SYNTHETIC_PHONE\)/);
  assert.match(fixturePrep, /FORGE_005B_R1_RETRY_RESET/);
  assert.match(fixturePrep, /archived_by:\s*advisorId/);
  assert.match(fixturePrep, /005B_R1_PRIOR_FIXTURE_RESET=OWNER_SCOPED/);
  assert.match(fixturePrep, /\.from\('prospects'\)\.insert/);
  assert.doesNotMatch(fixturePrep, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ACCESS_TOKEN|database\/query|auth\.admin/i);
});

test('005B-R1 runner preserves the exact PA-01 through PA-07 contract', () => {
  assert.match(runner, /PA01_IDENTITY_MUTATED_ON_READ/);
  assert.match(runner, /PA02_CANCEL_CREATED_LINK/);
  assert.match(runner, /adapterA\.confirmPdfReview\(review, confirmationInput\)/);
  assert.match(runner, /PA03_ACTIVE_LINK_COUNT_MUST_BE_ONE/);
  assert.match(runner, /PA04_PERSON_POLICY_READ_AFTER_WRITE_MISSING/);
  assert.match(runner, /PA05_REPLAY_CREATED_DUPLICATE_TRUTH/);
  assert.match(runner, /PA06_CROSS_ADVISOR_DIRECTORY_LEAK/);
  assert.match(runner, /PA06_CROSS_ADVISOR_IDENTITY_MUTATION_MUST_FAIL/);
  assert.match(runner, /PA06_CROSS_ADVISOR_POLICY_ATTACH_MUST_FAIL/);
  assert.match(runner, /PA07_AMBIGUOUS_PROSPECT_AUTO_LINKED_BEFORE_SELECTION/);
  assert.match(runner, /PA07_SAME_NAME_EMAIL_PHONE_AUTO_LINK/);
  assert.match(runner, /SHARED_EMAIL/);
  assert.match(runner, /SHARED_PHONE/);
  assert.match(runner, /TEMPORARY_AMBIGUITY_FIXTURES_ARCHIVED/);
  assert.doesNotMatch(runner, /SERVICE_ROLE|SUPABASE_ACCESS_TOKEN|database\/query|auth\.admin/i);
});

test('005B-R1 product runtime keeps human selection as Pipeline convergence trigger', () => {
  assert.match(adapter, /pipelineProspectReference\(input\.existingPersonReference\)/);
  assert.match(adapter, /resolvePipelineProspect\(client, review, prospectReference\)/);
  assert.match(adapter, /forge_cartera010b_confirm_identity_resolution/);
  const directoryBlock = adapter.slice(adapter.indexOf('async function loadPipelinePeople'), adapter.indexOf('async function ownedProspect'));
  assert.doesNotMatch(directoryBlock, /client\.rpc\(IDENTITY_RPC/);
  assert.match(identitySql, /CARTERA010B_PROSPECT_NOT_OWNED/);
  assert.match(durableSql, /actor_id uuid := auth\.uid\(\)/);
});

test('005B-R1 person workspace projects policies through canonical participant_person_id', () => {
  assert.match(adapter, /GENERAL_ROLE_RPC = 'forge_cartera010b_list_general_policy_roles'/);
  assert.match(adapter, /loadPersonPoliciesByCanonicalParticipantId/);
  const helperBlock = adapter.slice(
    adapter.indexOf('async function loadPersonPoliciesByCanonicalParticipantId'),
    adapter.indexOf('async function loadPipelinePeople'),
  );
  assert.match(helperBlock, /\.select\('id,person_reference,archived_at'\)/);
  assert.match(helperBlock, /participant_person_id/);
  assert.match(helperBlock, /String\(role\?\.participant_person_id \|\| ''\) === personId/);
  assert.doesNotMatch(helperBlock, /participant_person_reference/);
  const workspaceBlock = adapter.slice(
    adapter.indexOf('async loadPersonWorkspace\(reference\)'),
    adapter.indexOf('async confirmPdfReview'),
  );
  assert.match(workspaceBlock, /loadPersonPoliciesByCanonicalParticipantId\(client, reference\)/);
});

test('005B-R1 remote workflow confines privilege to 05C control plane and always seals', () => {
  assert.match(remoteWorkflow, /workflow_call:/);
  assert.doesNotMatch(remoteWorkflow, /workflow_dispatch:/);
  assert.match(remoteWorkflow, /environment: 067g17a1-remote-acceptance/);
  assert.match(remoteWorkflow, /SUPABASE_ACCESS_TOKEN: \$\{\{ secrets\.SUPABASE_ACCESS_TOKEN \}\}/);
  assert.match(remoteWorkflow, /forge-acceptance-admin/);
  assert.match(remoteWorkflow, /"action":"PROVISION"/);
  const dataStep = remoteWorkflow.slice(remoteWorkflow.indexOf('- name: Execute authenticated 005B-R1 productive data plane'), remoteWorkflow.indexOf('- name: Seal dedicated acceptance identities'));
  assert.doesNotMatch(dataStep, /SUPABASE_ACCESS_TOKEN|SUPABASE_SERVICE_ROLE_KEY|admin-token/);
  assert.match(dataStep, /FORGE_ACCEPTANCE_A_PASSWORD/);
  assert.match(dataStep, /FORGE_ACCEPTANCE_B_PASSWORD/);
  assert.match(dataStep, /prepare-cartera-pipeline-identity-005b-r1-fixtures\.mjs/);
  assert.match(dataStep, /forge-cartera-pipeline-identity-productive-005b\.mjs/);
  const sealStep = remoteWorkflow.slice(remoteWorkflow.indexOf('- name: Seal dedicated acceptance identities'), remoteWorkflow.indexOf('- name: Verify one-run credentials invalid after seal'));
  assert.match(sealStep, /if: always\(\)/);
  assert.match(sealStep, /"action":"SEAL"/);
  assert.match(remoteWorkflow, /verify-writable-synthetic-acceptance-005c-sealed\.mjs/);
  assert.match(remoteWorkflow, /finalize-cartera-pipeline-identity-005b-r1\.mjs/);
});

test('005B-R1 temporary dispatcher is exact branch, actor and SHA gated', () => {
  assert.match(dispatcher, /CARTERA_PIPELINE_IDENTITY_005B_R1/);
  assert.match(dispatcher, /github\.ref_name == 'accept\/cartera-pipeline-identity-productive-005b'/);
  assert.match(dispatcher, /github\.actor == 'Jorgeprdz'/);
  assert.match(dispatcher, /inputs\.validated_sha == github\.sha/);
  assert.match(dispatcher, /uses: \.\/\.github\/workflows\/cartera-pipeline-identity-005b-r1\.yml/);
});

test('005B-R1 finalizer requires all productive acceptance boundaries', () => {
  assert.match(finalizer, /for \(let index = 1; index <= 7; index \+= 1\)/);
  assert.match(finalizer, /rlsIsolation: true/);
  assert.match(finalizer, /readAfterWrite: true/);
  assert.match(finalizer, /identityBoundary: true/);
  assert.match(finalizer, /policyTruthBoundary: true/);
  assert.match(finalizer, /ownerScopedCleanup: true/);
  assert.match(finalizer, /postRunSealed: true/);
  assert.match(finalizer, /serviceRoleDomainWrite: false/);
  assert.match(finalizer, /realDataTouched: false/);
});

test('005B-R1 gate remains acceptance-only and preserves REP-17', () => {
  assert.match(gate, /pull_request:/);
  assert.match(gate, /005B_R1_PRECONDITION=PASS/);
  assert.match(gate, /ROBOCOP_UNLOCK_005B_R1=GRANTED/);
  assert.match(gate, /rep-17-unified-runtime-regression-test\.mjs/);
  assert.match(gate, /docs\/static-preview\/forge-aura\/cartera\/cartera-adapter-pages-v10\.js/);
  assert.doesNotMatch(gate, /pages\.yml|DEPLOY_FORGE_PAGES/);
});
