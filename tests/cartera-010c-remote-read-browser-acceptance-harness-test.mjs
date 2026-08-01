import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('remote acceptance uses real authenticated clients and the productive Cartera service', async () => {
  const source = await read('scripts/ci/cartera-010c-remote-read-acceptance.mjs');

  assert.match(source, /createClient.*@supabase\/supabase-js/s);
  assert.match(source, /createCanonicalPortfolioService/);
  assert.match(source, /ADVISOR_A_EMAIL/);
  assert.match(source, /ADVISOR_B_EMAIL/);
  assert.match(source, /loadPortfolio\(\)/);
  assert.match(source, /loadPolicyDetail\(fixture\.policyReference\)/);
  assert.match(source, /CARTERA010C_POLICY_NOT_FOUND/);
  assert.match(source, /CARTERA010C_AUTH_REQUIRED/);
});

test('remote fixture proves privacy and is forcibly removed with a residual-zero gate', async () => {
  const source = await read('scripts/ci/cartera-010c-remote-read-acceptance.mjs');

  assert.match(source, /role_type[\s\S]*'BENEFICIARY'/);
  assert.match(source, /'OWNING_ADVISOR_ONLY'/);
  assert.match(source, /DIRECT_POLICY_ROLES_READ=BLOCKED/);
  assert.match(source, /BENEFICIARY_GENERAL_PROJECTION=BLOCKED/);
  assert.match(source, /RAW_EVIDENCE_PROJECTION=BLOCKED/);
  assert.match(source, /set local session_replication_role = replica/);
  assert.match(source, /TEST_FIXTURES_CLEANED=YES/);
  assert.match(source, /RESIDUAL_FIXTURES=0/);
  assert.doesNotMatch(source, /create table|alter table|create or replace function/i);
});

test('browser fixture mounts the productive route and never emulates direct PolicyRole access', async () => {
  const fixture = await read('tests/e2e/fixtures/cartera-010c/app.mjs');
  const spec = await read('tests/e2e/cartera-010c-remote-browser.spec.mjs');
  const config = await read('playwright.cartera-010c.config.mjs');

  assert.match(fixture, /import \{ renderCartera, bindCarteraEvents \} from '\.\.\/\.\.\/\.\.\/\.\.\/cartera\.js'/);
  assert.match(fixture, /SupabaseRuntime\.init\(fakeClient\)/);
  assert.match(fixture, /DIRECT_POLICY_ROLES_READ_FORBIDDEN/);
  assert.match(fixture, /forge_cartera010b_list_general_policy_roles/);
  assert.match(spec, /Ver detalle canónico/);
  assert.match(spec, /Timeline canónico minimizado/);
  assert.match(spec, /data-policy-event-type/);
  assert.match(spec, /SENSITIVE_BENEFICIARY_BROWSER_FIXTURE/);
  assert.match(spec, /padding-bottom:calc/);
  assert.match(config, /desktop-chromium/);
  assert.match(config, /mobile-chromium/);
  assert.ok(config.includes('cartera-010c-remote-browser\\.spec\\.mjs'));
});

test('workflow is manual, bounded and uploads both remote and browser evidence', async () => {
  const workflow = await read('.github/workflows/cartera-010c-remote-read-browser-acceptance.yml');

  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s*push:/m);
  assert.doesNotMatch(workflow, /^\s*pull_request:/m);
  assert.match(workflow, /SOURCE_COMMIT: 8a9a927ff9d83f8d2343dc3dfe40b8a0c831e01b/);
  assert.match(workflow, /SUPABASE_ACCESS_TOKEN/);
  assert.match(workflow, /ADVISOR_A_EMAIL/);
  assert.match(workflow, /cartera-010c-remote-read-acceptance\.mjs/);
  assert.match(workflow, /playwright\.cartera-010c\.config\.mjs/);
  assert.match(workflow, /CARTERA_010C_REMOTE_READ_ACCEPTANCE=PASS/);
  assert.match(workflow, /CARTERA_010C_BROWSER_ACCEPTANCE=PASS/);
  assert.match(workflow, /actions\/upload-artifact/);
});
