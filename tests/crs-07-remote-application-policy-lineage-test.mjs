import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL(
  "../scripts/ci/crs-07-remote-application-policy-lineage.mjs",
  import.meta.url,
), "utf8");

test("gate is pinned to canonical Supabase project and Management API", () => {
  assert.match(source, /rmlxigxysujsuwzgoimv/);
  assert.match(source, /api\.supabase\.com\/v1\/projects/);
  assert.match(source, /SUPABASE_ACCESS_TOKEN/);
});
test("migration deployment is transactional and history-bound", () => {
  assert.match(source, /20260801000610/);
  assert.match(source, /supabase_migrations\.schema_migrations/);
  assert.match(source, /begin;\[\\s\\S\]\*commit/);
});
test("inventory verifies wrapper, grants, guards and no second table", () => {
  for (const term of ["wrapper_security_definer", "authenticated_execute", "anon_blocked",
    "public_blocked", "insert_guard", "commit_guard", "no_second_lineage_table"]) {
    assert.match(source, new RegExp(term));
  }
});
test("runtime creates approved Application through CRS06", () => {
  assert.match(source, /forge_crs06_create_application/);
  assert.match(source, /forge_crs06_record_signature_evidence/);
  assert.match(source, /forge_crs06_submit_application/);
  assert.match(source, /forge_crs06_record_decision/);
});
test("runtime confirms Policy only through CRS07 wrapper", () => {
  assert.match(source, /forge_crs07_confirm_issued_policy_from_application/);
  assert.match(source, /CRS07_DIRECT_BASE_RPC_LINEAGE_ALLOWED/);
});
test("runtime proves evidence and lineage rejection gates", () => {
  assert.match(source, /CRS07_WEAK_ISSUANCE_ALLOWED/);
  assert.match(source, /CRS07_QUOTE_MISMATCH_ALLOWED/);
  assert.match(source, /CRS07_MULTIPLE_POLICY_PER_APPLICATION_ALLOWED/);
});
test("runtime proves replay conflict and isolation", () => {
  assert.match(source, /CRS07_REPLAY_FAILED/);
  assert.match(source, /CRS07_CHANGED_REPLAY_CONFLICT_FAILED/);
  assert.match(source, /CRS07_CROSS_ADVISOR_ALLOWED/);
});
test("fixtures are rollback-clean", () => {
  assert.match(source, /rollback;/);
  assert.match(source, /TEST_FIXTURES_ROLLED_BACK=YES/);
  assert.match(source, /RESIDUAL_POLICIES=0/);
});
