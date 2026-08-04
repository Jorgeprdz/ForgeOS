import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../supabase/migrations/20260730000130_cartera001b_pgcrypto_search_path_hardening.sql", import.meta.url),
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

test("hardening migration remains repository-owned without a deployment side channel", () => {
  assert.doesNotMatch(migration, /api\.supabase\.com|SUPABASE_ACCESS_TOKEN|SUPABASE_DB_PASSWORD/);
});
