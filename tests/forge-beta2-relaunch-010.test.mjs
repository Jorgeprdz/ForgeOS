import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');

const files = {
  constitutional: 'docs/evidence/FORGE_BETA2_RELAUNCH_010_CONSTITUTIONAL_GATE.md',
  adr: 'docs/evidence/FORGE_BETA2_RELAUNCH_010_ADR_GATE.md',
  phase009: 'docs/evidence/FORGE_FULL_COMMERCIAL_LOOP_ACCEPTANCE_009_POST_MERGE_SEAL.md',
  discovery: 'docs/architecture/source-truth/FORGE_BETA2_RELAUNCH_010_RELEASE_DISCOVERY.md',
  gaps: 'docs/evidence/FORGE_BETA2_RELAUNCH_010_GAP_MATRIX.md',
  feedback: 'docs/evidence/FORGE_BETA2_BEHAVIORAL_VALIDATION_PROTOCOL_010.md',
  acceptance: 'docs/evidence/FORGE_BETA2_RELAUNCH_010_ACCEPTANCE.md',
  evidence: 'docs/evidence/FORGE_BETA2_RELAUNCH_010_EVIDENCE.md',
  closure: 'docs/evidence/FORGE_BETA2_RELAUNCH_010_CLOSURE.md',
};

test('Phase010 evidence pack exists and gates are explicit', () => {
  for (const path of Object.values(files)) assert.equal(existsSync(path), true, path);
  assert.match(read(files.constitutional), /CONSTITUTIONAL_GATE_010=PASS/);
  assert.match(read(files.constitutional), /PRODUCTIVE_CODE_MUTATION_BEFORE_GATE=0/);
  assert.match(read(files.adr), /ADR_GATE_010=PASS/);
  assert.match(read(files.adr), /ADR_CONFLICTS_UNRESOLVED=0/);
  assert.match(read(files.phase009), /PHASE_009_POST_MERGE_REGRESSION=PASS/);
  assert.match(read(files.discovery), /REUSE_BEFORE_CREATE_GATE_010=PASS/);
  assert.match(read(files.discovery), /RELEASE_BOUNDARY_DISCOVERED=YES/);
  assert.match(read(files.feedback), /BETA_FEEDBACK_PROTOCOL=READY/);
});

test('Phase010 preserves constitutional commercial and economic distinctions', () => {
  const acceptance = read(files.acceptance);
  for (const marker of [
    'PROSPECT_NOT_COMMERCIAL_PERSON=PASS',
    'QUOTE_NOT_POLICY=PASS',
    'POLICY_NOT_PAYMENT=PASS',
    'PREMIUM_PAID_NOT_COMMISSION_PAID=PASS',
    'UNKNOWN_NOT_ZERO=PASS',
    'SCENARIO_EXPECTED_GENERATED_EARNED_PAID_DISTINCT=PASS',
    'AUTO_IDENTITY_MERGE=0',
    'AUTONOMOUS_COMMERCIAL_EXECUTION=0',
  ]) assert.match(acceptance, new RegExp(marker));
});

test('Phase010 release discovery reuses the governed Pages boundary', () => {
  const pages = read('.github/workflows/pages.yml');
  const discovery = read(files.discovery);
  assert.match(pages, /workflow_dispatch:/);
  assert.match(pages, /expected_sha:/);
  assert.match(pages, /DEPLOY_FORGE_PAGES/);
  assert.doesNotMatch(pages, /\npush:\s*\n\s*branches:\s*\[?main/);
  assert.match(discovery, /WHAT_WORKFLOW_DEPLOYS_IT=\.github\/workflows\/pages\.yml/);
  assert.match(discovery, /WHAT_SHA_IS_DEPLOYED=4d824d67f6b4c30aba0f5b887e77b5f1d6289ac8/);
  assert.match(discovery, /OBSERVABILITY_IMPLEMENTATION=DEFERRED/);
});

test('Phase010 does not authorize a fourth rebuild or hidden mutation', () => {
  const joined = Object.values(files).map(read).join('\n');
  for (const marker of [
    'NEW_ENGINE_CREATED=0',
    'NEW_GLOBAL_SCORE_CREATED=0',
    'NEW_GLOBAL_PRIORITY_FORMULA_CREATED=0',
    'DATABASE_MUTATION=0',
    'SCHEMA_MUTATION=0',
    'RLS_MUTATION=0',
  ]) assert.match(joined, new RegExp(marker));
  assert.doesNotMatch(joined, /FOURTH_REBUILD_AUTHORIZED=YES/);
});

test('accepted predecessor executable contracts remain present', () => {
  for (const path of [
    'tests/forge-full-commercial-loop-acceptance-009.test.mjs',
    'playwright.forge009.config.mjs',
    'tests/authenticated-session-controls-test.mjs',
    'tests/crs-11-end-to-end-acceptance-contract-test.mjs',
    'tests/forge-aura-direct-route.test.mjs',
    'tests/forge-aura-pages-import-graph.test.mjs',
    'tests/rep-16f-pages-runtime-generator-test.mjs',
    'tests/income-aura-ux-reconciliation.test.mjs',
  ]) assert.equal(existsSync(path), true, path);
});