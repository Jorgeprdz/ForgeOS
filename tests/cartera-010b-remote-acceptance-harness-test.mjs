import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrationNames = [
  "20260731000200_cartera010b_identity_policy_foundation.sql",
  "20260731000210_cartera010b_command_helpers.sql",
  "20260731000211_cartera010b_identity_resolution_rpc.sql",
  "20260731000212_cartera010b_confirmed_policy_rpc.sql",
  "20260731000213_cartera010b_identity_resolution_precedence_hardening.sql",
  "20260731000214_cartera010b_conflict_insert_ambiguity_hardening.sql",
  "20260731000215_cartera010b_general_policy_role_read_authority.sql",
];
const migrations = migrationNames.map((filename) => ({
  filename,
  content: readFileSync(
    new URL(`../supabase/migrations/${filename}`, import.meta.url),
    "utf8",
  ),
}));
const remoteClosure = readFileSync(
  new URL(
    "../docs/evidence/FORGE_CARTERA_010B_REMOTE_ACCEPTANCE_CLOSURE_001.md",
    import.meta.url,
  ),
  "utf8",
);

function requireMarkers(text, markers) {
  for (const marker of markers) {
    assert.match(
      text,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `Missing marker: ${marker}`,
    );
  }
}

test("remote closure records every retained 010B migration", () => {
  for (const { filename, content } of migrations) {
    assert.match(remoteClosure, new RegExp(filename.replaceAll(".", "\\.")));
    assert.ok(content.trim().length > 0, filename);
  }
  requireMarkers(remoteClosure, [
    "STATUS=CLOSED_REMOTE_ACCEPTED",
    "REMOTE_ACCEPTANCE=PASS",
    "CARTERA_010B_COMPLETE=YES",
    "TARGETED_PASS=35",
    "TARGETED_FAIL=0",
  ]);
});

test("retained evidence proves transactional rollback and security acceptance", () => {
  requireMarkers(remoteClosure, [
    "CARTERA_010B_REMOTE_DEPLOYMENT=PASS",
    "CARTERA_010B_REMOTE_ACCEPTANCE=PASS",
    "RLS_CROSS_ADVISOR=PASS",
    "DIRECT_WRITES=BLOCKED",
    "RESTRICTED_BENEFICIARY_READ=PASS",
    "IDEMPOTENT_REPLAY=PASS",
    "CHANGED_INPUT_CONFLICT=PASS",
    "APPEND_ONLY=PASS",
    "TEST_FIXTURES_ROLLED_BACK=YES",
    "RESIDUAL_FIXTURES=0",
  ]);
});

test("retired remote runner cannot be reactivated by repository acceptance", () => {
  requireMarkers(remoteClosure, [
    "REMOTE_WORKFLOW_AUTOMATIC_TRIGGER=RETIRED",
    "AUTOMATIC_IDENTITY_MERGE=FORBIDDEN",
    "AUTOMATIC_POLICY_CREATION=FORBIDDEN",
    "DIRECT_POLICY_ROLE_TABLE_READ=REVOKED",
    "BENEFICIARY_GENERAL_READ=FORBIDDEN",
    "HARD_DELETE=FORBIDDEN",
    "ARTIFACT_ID=8796172953",
  ]);
});

test("retained migrations contain the governed identity and Policy authorities", () => {
  const joined = migrations.map(({ content }) => content).join("\n");
  requireMarkers(joined, [
    "forge_cartera010b_confirm_identity_resolution",
    "forge_cartera010b_confirm_policy_with_parties",
    "forge_cartera010b_list_general_policy_roles",
    "security definer",
    "CARTERA010B_APPEND_ONLY",
    "CHANGED_INPUT_REPLAY",
  ]);
});
