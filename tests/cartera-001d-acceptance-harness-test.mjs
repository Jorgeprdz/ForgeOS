import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const sql = read("scripts/ci/cartera-001d-remote-vertical-acceptance.sql");
const runner = read("scripts/ci/cartera-001d-github-actions-vertical-acceptance.mjs");
const workflow = read(".github/workflows/cartera-001d-vertical-acceptance.yml");
const browser = read("tests/e2e/cartera-001d-vertical-continuity.spec.mjs");
const gate = read("docs/architecture/source-truth/FORGE_CARTERA_001D_VERTICAL_ACCEPTANCE_STAGE_GATE_001.md");

test("001D remote harness is transactional, vertical and rollback-only", () => {
  assert.match(sql, /^begin;\s*$/im);
  assert.match(sql, /rollback;\s*$/i);
  assert.doesNotMatch(sql, /\bcommit\s*;/i);
  assert.match(sql, /forge_cartera001b_confirm_reviewed_quote/);
  assert.match(sql, /forge_cartera001b_append_quote_lifecycle_event/);
  assert.match(sql, /quote_lifecycle_history/);
  assert.match(sql, /prospect_timeline_events/);
  assert.match(sql, /QUOTE_AUTHORITY/);
  assert.match(sql, /QUOTE_CREATED/);
  assert.match(sql, /QUOTE_REVIEW_CONFIRMED/);
  assert.match(sql, /QUOTE_PRESENTED/);
  assert.match(sql, /QUOTE_PROSPECT_ACCEPTED/);
  assert.match(sql, /CARTERA001D_CROSS_TENANT_HISTORY_LEAK/);
  assert.match(sql, /CARTERA001D_CROSS_TENANT_TIMELINE_LEAK/);
  assert.match(sql, /FINAL_LIFECYCLE_STATE=PROSPECT_ACCEPTED/);
  assert.doesNotMatch(sql, /\b(create|alter|drop)\s+(table|view|function|policy|trigger|extension)\b/i);
});

test("GitHub runner uses the management query API without deployment or migration mutation", () => {
  assert.match(runner, /api\.supabase\.com\/v1\/projects\/\$\{PROJECT_REF\}\/database\/query/);
  assert.match(runner, /SUPABASE_ACCESS_TOKEN_MISSING/);
  assert.match(runner, /assertTransactionalHarness/);
  assert.match(runner, /CARTERA001D_SCHEMA_MUTATION_FORBIDDEN/);
  assert.match(runner, /CARTERA001D_REQUIRED_MIGRATIONS_MISSING/);
  assert.match(runner, /RESIDUAL_AUTH_FIXTURES=0/);
  assert.match(runner, /RESIDUAL_PROSPECT_FIXTURES=0/);
  assert.match(runner, /TEST_FIXTURES_ROLLED_BACK=YES/);
  assert.doesNotMatch(runner, /supabase\s+db\s+push|applyMigration|schema_migrations\s*\([^)]*\)\s*values/i);
});

test("workflow requires contract, Chromium and remote acceptance", () => {
  assert.match(workflow, /name: CARTERA 001D Vertical Acceptance/);
  assert.match(workflow, /contract:/);
  assert.match(workflow, /browser-acceptance:/);
  assert.match(workflow, /remote-acceptance:/);
  assert.match(workflow, /playwright\.cartera001d\.config\.mjs/);
  assert.match(workflow, /SUPABASE_ACCESS_TOKEN: \$\{\{ secrets\.SUPABASE_ACCESS_TOKEN \}\}/);
  assert.match(workflow, /test -z "\$\(git diff --name-only 96e24bf403e5d59805249de260581b763a3c7bc6\.\.\.HEAD -- supabase\/migrations\)"/);
  assert.match(workflow, /CARTERA_001D_REMOTE_VERTICAL_ACCEPTANCE=PASS/);
  assert.doesNotMatch(workflow, /contents: write/);
});

test("browser acceptance traverses production bridge, history service, projector and Prospect Detail", () => {
  assert.match(browser, /forge-quote-lifecycle-browser-bridge-cartera001b\.js/);
  assert.match(browser, /quote-lifecycle-supabase-service\.js/);
  assert.match(browser, /prospect-quote-detail-projection\.js/);
  assert.match(browser, /prospect-quote-detail-projection-ui\.js/);
  assert.match(browser, /cartera-vertical-continuity-contract\.js/);
  assert.match(browser, /captureReviewedQuoteLifecycle/);
  assert.match(browser, /appendQuoteLifecycleEvent/);
  assert.match(browser, /data-cartera001c-quote-detail/);
  assert.match(browser, /PROSPECT_ACCEPTED/);
  assert.match(browser, /BLOCKED_IDENTITY_REQUIRED/);
  assert.match(browser, /rpcCalls\)\.toBe\(0\)/);
});

test("stage gate preserves acceptance-only scope", () => {
  assert.match(gate, /PRODUCT_RUNTIME_MUTATION=NO/);
  assert.match(gate, /SCHEMA_MUTATION=NO/);
  assert.match(gate, /REMOTE_FIXTURE_MUTATION=TRANSACTIONAL_ROLLBACK_ONLY/);
  assert.match(gate, /MERGE_PERFORMED=NO/);
});
