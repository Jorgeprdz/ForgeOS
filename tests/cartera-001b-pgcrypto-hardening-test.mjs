import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../supabase/migrations/20260730000130_cartera001b_pgcrypto_search_path_hardening.sql", import.meta.url),
  "utf8",
);
const deployer = readFileSync(
  new URL("../scripts/ci/cartera-001b-pgcrypto-hardening-deploy.mjs", import.meta.url),
  "utf8",
);

test("hardening requires the trusted extensions digest authority", () => {
  assert.match(migration, /to_regprocedure\('extensions\.digest\(bytea,text\)'\)/);
  assert.match(migration, /CARTERA001B_PGCRYPTO_DIGEST_NOT_AVAILABLE/);
});

test("both Quote RPCs resolve pgcrypto through a bounded search path", () => {
  assert.match(migration, /forge_cartera001b_confirm_reviewed_quote/);
  assert.match(migration, /forge_cartera001b_append_quote_lifecycle_event/);
  assert.equal((migration.match(/set search_path = public, extensions, pg_temp;/g) ?? []).length, 2);
  assert.doesNotMatch(migration, /grant\s+.*digest/i);
});

test("deployer applies migration and history atomically through Management API", () => {
  assert.match(deployer, /20260730000130/);
  assert.match(deployer, /api\.supabase\.com\/v1\/projects/);
  assert.match(deployer, /begin;\\n\$\{body\}\\n\$\{history\}\\ncommit;/);
  assert.match(deployer, /PGCRYPTO_HARDENING_HISTORY_NOT_RECORDED/);
  assert.doesNotMatch(deployer, /SUPABASE_DB_PASSWORD|SUPABASE_DB_URL/);
});

test("remote verification checks both function configuration and digest", () => {
  assert.match(deployer, /search_path=public, extensions, pg_temp/);
  assert.match(deployer, /CARTERA001B_RPC_COUNT_MISMATCH/);
  assert.match(deployer, /CARTERA001B_PGCRYPTO_HARDENING=PASS/);
});
