import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('remote acceptance uses real authenticated clients and productive 010D services', async () => {
  const source = await read('scripts/ci/cartera-010d-remote-directory-acceptance.mjs');

  assert.match(source, /createClient.*@supabase\/supabase-js/s);
  assert.match(source, /createCanonicalDirectoryService/);
  assert.match(source, /createCanonicalPortfolioService/);
  assert.match(source, /ADVISOR_A_EMAIL/);
  assert.match(source, /ADVISOR_B_EMAIL/);
  assert.match(source, /loadDirectory\(\)/);
  assert.match(source, /loadPolicyDetail\(fixture\.policyReference\)/);
  assert.match(source, /RLS_CROSS_ADVISOR_DIRECTORY=PASS/);
  assert.match(source, /ANONYMOUS_DIRECTORY_READ=BLOCKED/);
});

test('remote fixture proves private contact search and forced residual-zero cleanup', async () => {
  const source = await read('scripts/ci/cartera-010d-remote-directory-acceptance.mjs');

  assert.match(source, /commercial_account_memberships/);
  assert.match(source, /HOUSEHOLD_MEMBER/);
  assert.match(source, /PHONE_SEARCH_PRIVATE=PASS/);
  assert.match(source, /EMAIL_SEARCH_PRIVATE=PASS/);
  assert.match(source, /RESTRICTED_ENTITY_DIRECTORY=BLOCKED/);
  assert.match(source, /BENEFICIARY_GENERAL_DIRECTORY=BLOCKED/);
  assert.match(source, /DIRECT_POLICY_ROLES_READ=BLOCKED/);
  assert.match(source, /set local session_replication_role = replica/);
  assert.match(source, /TEST_FIXTURES_CLEANED=YES/);
  assert.match(source, /RESIDUAL_FIXTURES=0/);
  assert.doesNotMatch(source, /create table|alter table|create or replace function/i);
});

test('browser fixture mounts the productive route and covers directory privacy', async () => {
  const fixture = await read('tests/e2e/fixtures/cartera-010d/app.mjs');
  const spec = await read('tests/e2e/cartera-010d-remote-browser.spec.mjs');
  const config = await read('playwright.cartera-010d.config.mjs');

  assert.match(fixture, /import \{ renderCartera, bindCarteraEvents \} from '\.\.\/\.\.\/\.\.\/\.\.\/cartera\.js'/);
  assert.match(fixture, /commercial_account_memberships/);
  assert.match(fixture, /PRIVATE_PHONE/);
  assert.match(fixture, /PRIVATE_EMAIL/);
  assert.match(fixture, /SENSITIVE_DIRECTORY_BROWSER_FIXTURE/);
  assert.match(fixture, /DIRECT_POLICY_ROLES_READ_FORBIDDEN/);
  assert.match(fixture, /forge_cartera010b_list_general_policy_roles/);
  assert.match(spec, /COMMERCIAL_PERSON/);
  assert.match(spec, /COMMERCIAL_ACCOUNT/);
  assert.match(spec, /POLICY/);
  assert.match(spec, /Teléfono verificado/);
  assert.match(spec, /Email verificado/);
  assert.match(spec, /HOUSEHOLD_MEMBER/);
  assert.match(spec, /Timeline canónico minimizado/);
  assert.match(config, /desktop-chromium/);
  assert.match(config, /mobile-chromium/);
  assert.ok(config.includes('cartera-010d-remote-browser\\.spec\\.mjs'));
});

test('accepted remote workflow is bounded, manual-only and uploads all evidence', async () => {
  const workflow = await read(
    '.github/workflows/cartera-010d-remote-directory-browser-acceptance.yml'
  );

  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^  push:/m);
  assert.doesNotMatch(workflow, /^  pull_request:/m);
  assert.match(workflow, /SOURCE_COMMIT: 86250c1429510a9914b9538791d168b5802e1f07/);
  assert.match(workflow, /SUPABASE_ACCESS_TOKEN/);
  assert.match(workflow, /ADVISOR_A_EMAIL/);
  assert.match(workflow, /cartera-010d-remote-directory-acceptance\.mjs/);
  assert.match(workflow, /playwright\.cartera-010d\.config\.mjs/);
  assert.match(workflow, /CARTERA_010D_REMOTE_DIRECTORY_ACCEPTANCE=PASS/);
  assert.match(workflow, /CARTERA_010D_BROWSER_ACCEPTANCE=PASS/);
  assert.match(workflow, /actions\/upload-artifact/);
});
