import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(
  new URL("../tools/termux/forge_cartera_001b_remote_acceptance.sh", import.meta.url),
  "utf8",
);

function index(fragment) {
  const value = script.indexOf(fragment);
  assert.notEqual(value, -1, `missing runner fragment: ${fragment}`);
  return value;
}

test("runner gates the exact implementation branch and hardening ancestor", () => {
  assert.match(script, /feature\/cartera-001b-remote-acceptance/);
  assert.match(script, /02ed3d50b54fe8c5758eb0ca30e620a7f78c6370/);
  assert.match(script, /git merge-base --is-ancestor/);
});

test("runner requires the recovered remote-only migration before acceptance", () => {
  assert.match(script, /RECOVERED_REMOTE_VERSION="20260726000200"/);
  assert.match(script, /FAIL_MISSING_RECOVERED_REMOTE_MIGRATION/);
  assert.match(script, /forge_recover_remote_migration_20260726000200\.sh/);
  assert.match(script, /REMOTE_HISTORY_RECONCILIATION=PASS/);
});

test("runner gates credentials, URL, history, and dry-run before remote push", () => {
  const tests = index("node --test tests/cartera-001b-*.mjs");
  const password = index("DATABASE_PASSWORD_GATE=PASS");
  const dbGate = index("DATABASE_URL_GATE=PASS");
  const history = index("REMOTE_HISTORY_RECONCILIATION=PASS");
  const dryRun = index("supabase db push --linked --dry-run");
  const push = index("supabase db push --linked || return 1");
  assert.ok(tests < password);
  assert.ok(password < dbGate);
  assert.ok(dbGate < history);
  assert.ok(history < dryRun);
  assert.ok(dryRun < push);
});

test("missing credentials or URL block before remote migration push", () => {
  const missingPassword = index("SUPABASE_DB_PASSWORD_REQUIRED=YES");
  const missingUrl = index("DATABASE_URL_REQUIRED=YES");
  const noMigrationMessage = index("No se aplicó ninguna migración remota.");
  const push = index("supabase db push --linked || return 1");
  assert.ok(missingPassword < push);
  assert.ok(missingUrl < push);
  assert.ok(noMigrationMessage < push);
});

test("runner passes the hidden password to CLI and psql without embedding it", () => {
  assert.match(script, /read -rsp 'Supabase DB password: '/);
  assert.match(script, /export SUPABASE_DB_PASSWORD/);
  assert.match(script, /PGPASSWORD="\$SUPABASE_DB_PASSWORD"/);
  assert.match(script, /DB_URL_WITHOUT_EMBEDDED_PASSWORD/);
});

test("runner never resets, pulls schema, or repairs remote migration history", () => {
  assert.doesNotMatch(script, /supabase db reset/);
  assert.doesNotMatch(script, /supabase db pull/);
  assert.doesNotMatch(script, /supabase migration repair/);
});

test("runner requires all governed migrations", () => {
  for (const version of [
    "20260726000200",
    "20260730000100",
    "20260730000110",
    "20260730000120",
  ]) {
    assert.match(script, new RegExp(version));
  }
});

test("runner requires transactional acceptance PASS before final PASS", () => {
  const psql = index('psql "$DB_URL_WITHOUT_EMBEDDED_PASSWORD"');
  const marker = index("PASS CARTERA001B_REMOTE_ACCEPTANCE");
  const finalPass = index("CARTERA_001B_REMOTE_ACCEPTANCE=PASS");
  assert.ok(psql < marker);
  assert.ok(marker < finalPass);
});

test("runner preserves autocopy evidence and avoids explicit exit", () => {
  assert.match(script, /termux-clipboard-set/);
  assert.match(script, /EVIDENCE_PATH=/);
  assert.doesNotMatch(script, /\bexit\b/);
});
