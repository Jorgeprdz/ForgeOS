import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../scripts/ci/crs-08-remote-read-model-inventory.mjs", import.meta.url), "utf8");

test("pins canonical Supabase project", () => {
  assert.match(script, /rmlxigxysujsuwzgoimv/);
});

test("uses Management API query endpoint", () => {
  assert.match(script, /api\.supabase\.com\/v1\/projects\/\$\{PROJECT_REF\}\/database\/query/);
});

test("enforces read-only SQL", () => {
  assert.match(script, /CRS08_REMOTE_QUERY_MUST_BE_READ_ONLY/);
  assert.match(script, /CRS08_REMOTE_QUERY_MUTATION_FORBIDDEN/);
});

test("inventories Cartera 040B and all five source domains", () => {
  assert.match(script, /forge_cartera040_list_relationship_brief\(jsonb\)/);
  assert.match(script, /CRS_08_CARTERA_040B_HISTORY_FOUNDATION=PASS/);
  for (const marker of ["prospects", "activity_event_ledger", "quote_lifecycle_events", "application_events", "canonical_policies"]) {
    assert.match(script, new RegExp(marker));
  }
});

test("requires Activity RPC boundary", () => {
  assert.match(script, /forge_fes02_pull_activity_events\(text,integer\)/);
  assert.match(script, /activity_direct_read_blocked/);
});

test("preserves PolicyRole minimum privilege", () => {
  assert.match(script, /policy_roles_direct_read_blocked/);
});

test("forbids a second Timeline store", () => {
  assert.match(script, /no_second_timeline_store/);
  assert.match(script, /CRS_08_SECOND_TIMELINE_STORE=NO/);
});

test("declares zero remote mutation", () => {
  assert.match(script, /CRS_08_REMOTE_MUTATION=NO/);
  assert.doesNotMatch(script, /readFileSync\([^)]*migration/i);
});
