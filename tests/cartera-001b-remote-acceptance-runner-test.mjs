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

test("runner executes tests and dry-run before remote push", () => {
  const tests = index("node --test tests/cartera-001b-*.mjs");
  const dryRun = index("supabase db push --linked --dry-run");
  const push = index("supabase db push --linked || return 1");
  assert.ok(tests < dryRun);
  assert.ok(dryRun < push);
});

test("runner never resets or repairs remote migration history", () => {
  assert.doesNotMatch(script, /supabase db reset/);
  assert.doesNotMatch(script, /supabase migration repair/);
});

test("runner requires all three governed migrations", () => {
  for (const version of ["20260730000100", "20260730000110", "20260730000120"]) {
    assert.match(script, new RegExp(version));
  }
});

test("runner requires transactional acceptance PASS before final PASS", () => {
  const psql = index("psql \"$DB_URL\"");
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
