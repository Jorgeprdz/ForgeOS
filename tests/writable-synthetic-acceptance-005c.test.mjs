import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260809010000_governed_writable_synthetic_acceptance_005c.sql', import.meta.url), 'utf8');
const controlPlane = await readFile(new URL('../supabase/functions/forge-acceptance-admin/index.ts', import.meta.url), 'utf8');
const deployer = await readFile(new URL('../scripts/deploy-governed-writable-synthetic-acceptance-005c.mjs', import.meta.url), 'utf8');
const runner = await readFile(new URL('../scripts/forge-writable-synthetic-acceptance-005c.mjs', import.meta.url), 'utf8');
const sealedVerifier = await readFile(new URL('../scripts/verify-writable-synthetic-acceptance-005c-sealed.mjs', import.meta.url), 'utf8');
const finalizer = await readFile(new URL('../scripts/finalize-writable-synthetic-acceptance-005c.mjs', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../.github/workflows/writable-synthetic-acceptance-005c.yml', import.meta.url), 'utf8');
const dispatcher = await readFile(new URL('../.github/workflows/beta1-022a-writable-acceptance.yml', import.meta.url), 'utf8');
const authority = await readFile(new URL('../docs/architecture/source-truth/FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C.md', import.meta.url), 'utf8');
const evidence = await readFile(new URL('../docs/evidence/FORGE_WRITABLE_SYNTHETIC_ACCEPTANCE_005C_REMOTE_EVIDENCE.md', import.meta.url), 'utf8');

test('005C lifecycle migration is additive and makes acceptance expiry fail closed', () => {
  assert.match(migration, /add column if not exists is_acceptance boolean not null default false/i);
  assert.match(migration, /add column if not exists acceptance_purpose text/i);
  assert.match(migration, /add column if not exists expires_at timestamptz/i);
  assert.match(migration, /is_acceptance = true[\s\S]*is_public = false[\s\S]*AUTOMATED_ACCEPTANCE_ONLY/i);
  assert.match(migration, /expires_at\s*<=\s*now\(\)/i);
  assert.match(migration, /FORGE_DEMO_ACCOUNT_READ_ONLY/);
  assert.doesNotMatch(migration, /disable\s+row\s+level\s+security|drop\s+(table|schema)|truncate/i);
  assert.doesNotMatch(migration, /grant\s+.*\s+to\s+(anon|public)/i);
});

test('005C control plane is fixed-target lifecycle administration only', () => {
  assert.match(controlPlane, /ACCEPTANCE_A/);
  assert.match(controlPlane, /ACCEPTANCE_B/);
  assert.match(controlPlane, /forge\.acceptance\.a@forge\.invalid/);
  assert.match(controlPlane, /forge\.acceptance\.b@forge\.invalid/);
  assert.match(controlPlane, /PROVISION/);
  assert.match(controlPlane, /OPEN/);
  assert.match(controlPlane, /SEAL/);
  assert.match(controlPlane, /STATUS/);
  assert.match(controlPlane, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(controlPlane, /admin\.auth\.admin\.(createUser|updateUserById)/);
  assert.match(controlPlane, /\.from\("forge_demo_advisors"\)/);
  assert.match(controlPlane, /return `\$\{crypto\.randomUUID\(\)\}-Aa1!`;/);
  assert.doesNotMatch(controlPlane, /randomUUID\(\)\}-\$\{crypto\.randomUUID\(\)/);
  assert.doesNotMatch(controlPlane, /\.from\("(prospects|prospect_contact_methods|commercial_people|commercial_source_identity_links|canonical_policies|policy_roles|cartera010b_command_receipts)"\)/);
  assert.doesNotMatch(controlPlane, /payload\.(table|sql|rpc)|payload\[['"]?(table|sql|rpc)/i);
});

test('005C data plane has no privileged credential or management path', () => {
  for (const source of [runner, sealedVerifier]) {
    assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ACCESS_TOKEN|api\.supabase\.com\/v1\/projects|database\/query|auth\.admin/i);
  }
  assert.match(runner, /SUPABASE_ANON_KEY/);
  assert.match(runner, /signInWithPassword/);
  assert.match(runner, /\.from\('prospects'\)/);
  assert.match(runner, /const SYNTHETIC_PHONE_A = '\+000000000005';/);
  assert.equal((runner.match(/phone_normalized:\s*SYNTHETIC_PHONE_A/g) || []).length, 2);
  assert.match(runner, /AA04_CROSS_ADVISOR_READ_LEAK/);
  assert.match(runner, /AA04_CROSS_ADVISOR_WRITE_LEAK/);
  assert.match(runner, /AA06_DUPLICATE_ACTIVE_FIXTURE/);
  assert.match(runner, /FORGE_005C_ACCEPTANCE_CLEANUP/);
});

test('005C prospect fixture is deterministic only inside one run and never reopens archive history', () => {
  assert.match(runner, /const RUN_SCOPE = process\.env\.GITHUB_RUN_ID/);
  assert.match(runner, /\[RUN:\$\{RUN_SCOPE\}\]/);
  assert.match(runner, /\.eq\('initial_context', CONTEXT\)[\s\S]*?\.is\('archived_at', null\)/);
  assert.doesNotMatch(runner, /archived_at:\s*null/);
  assert.doesNotMatch(runner, /archived_by:\s*null/);
  assert.doesNotMatch(runner, /archive_reason:\s*null/);
});

test('005C migration deployer is control-plane DDL only', () => {
  assert.match(deployer, /SUPABASE_ACCESS_TOKEN/);
  assert.match(deployer, /database\/query/);
  assert.match(deployer, /const VERSION = '20260809010000'/);
  assert.match(deployer, /const NAME = 'governed_writable_synthetic_acceptance_005c'/);
  assert.match(deployer, /const FILE = `supabase\/migrations\/\$\{VERSION\}_\$\{NAME\}\.sql`/);
  assert.doesNotMatch(deployer, /from\(['"]prospects|insert\s+into\s+public\.(prospects|commercial_people|canonical_policies)/i);
});

test('005C workflow scopes privilege away from the authenticated data-plane step and always seals', () => {
  assert.match(workflow, /workflow_call:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /environment: 067g17a1-remote-acceptance/);
  assert.match(workflow, /SUPABASE_ACCESS_TOKEN: \$\{\{ secrets\.SUPABASE_ACCESS_TOKEN \}\}/);
  const dataStep = workflow.slice(workflow.indexOf('- name: Execute authenticated 005C data plane'), workflow.indexOf('- name: Seal dedicated acceptance identities'));
  assert.doesNotMatch(dataStep, /SUPABASE_ACCESS_TOKEN|admin-token|FORGE_ACCEPTANCE_ADMIN_TOKEN/);
  assert.match(dataStep, /FORGE_ACCEPTANCE_A_PASSWORD/);
  assert.match(dataStep, /forge-writable-synthetic-acceptance-005c\.mjs/);
  const sealStep = workflow.slice(workflow.indexOf('- name: Seal dedicated acceptance identities'), workflow.indexOf('- name: Verify one-run credentials invalid after seal'));
  assert.match(sealStep, /if: always\(\)/);
  assert.match(sealStep, /"action":"SEAL"/);
  assert.match(workflow, /verify-writable-synthetic-acceptance-005c-sealed\.mjs/);
  assert.match(workflow, /finalize-writable-synthetic-acceptance-005c\.mjs/);
});

test('005C temporary pre-merge dispatcher route is removed and legacy acceptance routes are preserved', () => {
  assert.doesNotMatch(dispatcher, /WRITABLE_SYNTHETIC_005C/);
  assert.doesNotMatch(dispatcher, /writable-synthetic-acceptance-005c\.yml/);
  assert.match(dispatcher, /CONTACT_BOOKS_001/);
  assert.match(dispatcher, /BETA1_022B/);
  assert.match(dispatcher, /contact-books-remote-acceptance:[\s\S]*uses: \.\/\.github\/workflows\/contact-books-001-remote-acceptance\.yml/);
  assert.match(dispatcher, /compensation-remote-acceptance:[\s\S]*uses: \.\/\.github\/workflows\/beta1-022b-compensation-remote-acceptance\.yml/);
});

test('005C committed remote evidence proves complete AA matrix and sealed security boundaries', () => {
  assert.match(evidence, /PHASE=FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C/);
  assert.match(evidence, /BASE_SHA=9289197780efd23d70be7528a1191e0509cdae40/);
  assert.match(evidence, /ACCEPTANCE_SHA=8dd479edb31dffcca618dba03f217534c8653b39/);
  assert.match(evidence, /WORKFLOW_RUN_ID=31337249510/);
  for (let index = 1; index <= 10; index += 1) {
    assert.match(evidence, new RegExp(`AA${String(index).padStart(2, '0')}=PASS`));
  }
  assert.match(evidence, /REAL_DATA_TOUCHED=NO/);
  assert.match(evidence, /PUBLIC_DEMO_MUTATED=NO/);
  assert.match(evidence, /SERVICE_ROLE_DOMAIN_WRITE=NO/);
  assert.match(evidence, /RLS_BYPASS=NO/);
  assert.match(evidence, /POST_RUN_SEALED=YES/);
  assert.match(evidence, /CREDENTIAL_REUSE_AFTER_SEAL=DENIED/);
});

test('005C final evidence requires the complete AA matrix and public demo preservation', () => {
  for (let index = 1; index <= 10; index += 1) {
    const marker = `aa${String(index).padStart(2, '0')}`;
    assert.match(finalizer, new RegExp(`${marker}: 'PASS'`));
  }
  assert.match(finalizer, /publicDemoReadOnlyPreserved: true/);
  assert.match(finalizer, /serviceRoleDomainWrite: false/);
  assert.match(finalizer, /rlsBypass: false/);
  assert.match(finalizer, /realDataTouched: false/);
});

test('005C source truth locks dedicated non-public identities and no product authority mutation', () => {
  assert.match(authority, /ARCHITECTURAL_DECISION=DEDICATED_NON_PUBLIC_SYNTHETIC_ACCEPTANCE_IDENTITIES/);
  assert.match(authority, /PUBLIC_DEMO_REUSED=NO/);
  assert.match(authority, /CONTROL_PLANE_PRIVILEGE != BUSINESS_DATA_AUTHORITY/);
  assert.match(authority, /SERVICE_ROLE_ALLOWED_FOR_DOMAIN_WRITES=NO/);
  assert.match(authority, /AUTO_MERGE=NO/);
  assert.match(authority, /AUTO_DEPLOY=NO/);
  assert.match(authority, /FINAL_ROBOCOP_005C=PASS/);
});