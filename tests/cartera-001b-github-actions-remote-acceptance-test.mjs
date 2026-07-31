import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../scripts/ci/cartera-001b-github-actions-remote-acceptance.mjs", import.meta.url),
  "utf8",
);

function position(fragment) {
  const value = source.indexOf(fragment);
  assert.notEqual(value, -1, `missing fragment: ${fragment}`);
  return value;
}

test("GitHub acceptance uses the existing Supabase Management API authority", () => {
  assert.match(source, /api\.supabase\.com\/v1\/projects\/\$\{PROJECT_REF\}\/database\/query/);
  assert.match(source, /SUPABASE_ACCESS_TOKEN_MISSING/);
  assert.doesNotMatch(source, /SUPABASE_DB_PASSWORD/);
  assert.doesNotMatch(source, /SUPABASE_DB_URL/);
});

test("remote-only migration is recovered from exact stored statements", () => {
  assert.match(source, /REMOTE_ONLY_VERSION = "20260726000200"/);
  assert.match(source, /select version, name, statements/);
  assert.match(source, /REMOTE_MIGRATION_CONTENT_MISMATCH/);
  assert.match(source, /REMOTE_MIGRATION_SHA256/);
  assert.doesNotMatch(source, /migration repair|db pull|db reset/i);
});

test("each Cartera migration and its history row share one transaction", () => {
  for (const version of ["20260730000100", "20260730000110", "20260730000120"]) {
    assert.match(source, new RegExp(version));
  }
  const begin = position("const transaction = `begin;");
  const migrationBody = position("${body}");
  const history = position("${historyInsert");
  const commit = position("\\ncommit;`");
  assert.ok(begin < migrationBody);
  assert.ok(migrationBody < history);
  assert.ok(history < commit);
});

test("transactional acceptance proves rollback before emitting PASS", () => {
  assert.match(source, /ACCEPTANCE_TRANSACTION_ROLLBACK_MISSING/);
  const acceptanceQuery = position("PASS CARTERA001B_REMOTE_ACCEPTANCE'::text as acceptance");
  const finalPass = position("CARTERA_001B_REMOTE_ACCEPTANCE=PASS");
  assert.ok(acceptanceQuery < finalPass);
  assert.match(source, /TEST_FIXTURES_ROLLED_BACK=YES/);
  assert.match(source, /APPLICATION_EFFECTS=BLOCKED/);
});

test("evidence is always written and secrets are redacted", () => {
  assert.match(source, /report\.json/);
  assert.match(source, /acceptance\.log/);
  assert.match(source, /\[REDACTED\]/);
  assert.match(source, /finally/);
});
