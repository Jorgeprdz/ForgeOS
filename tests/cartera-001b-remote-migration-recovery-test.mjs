import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(
  new URL(
    "../tools/archforge/forge_recover_remote_migration_20260726000200.sh",
    import.meta.url,
  ),
  "utf8",
);

test("recovery targets only the known remote-only migration", () => {
  assert.match(script, /EXPECTED_VERSION="20260726000200"/);
  assert.match(script, /RECOVERY_CHANGE_COUNT/);
  assert.match(script, /UNEXPECTED_FILE_SET/);
  assert.match(script, /EXPECTED_NEW_UNTRACKED_FILE/);
  assert.match(script, /UNEXPECTED_MIGRATION_PATH/);
});

test("recovery uses official migration fetch and never repairs history", () => {
  assert.match(script, /supabase migration fetch --linked --yes/);
  assert.doesNotMatch(script, /supabase migration repair/);
  assert.doesNotMatch(script, /supabase db pull/);
  assert.doesNotMatch(script, /supabase db reset/);
});

test("recovery requires a clean governed branch and database password", () => {
  assert.match(script, /feature\/cartera-001b-remote-acceptance/);
  assert.match(script, /WORKTREE_STATUS=DIRTY/);
  assert.match(script, /read -rsp 'Supabase DB password: '/);
  assert.match(script, /SUPABASE_DB_PASSWORD_REQUIRED=YES/);
});

test("recovery records provenance before committing the exact file", () => {
  assert.match(script, /sha256sum/);
  assert.match(script, /RECOVERED_SHA256=/);
  assert.match(script, /git diff --cached --check/);
  assert.match(script, /recover applied migration/);
  assert.match(script, /git push origin/);
});

test("recovery preserves evidence and avoids explicit exit", () => {
  assert.match(script, /EVIDENCE_PATH=/);
  assert.doesNotMatch(script, /\bexit\b/);
});
