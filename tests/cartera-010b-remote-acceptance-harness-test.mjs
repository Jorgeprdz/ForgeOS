import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runner = readFileSync(
  new URL(
    "../scripts/ci/cartera-010b-github-actions-remote-acceptance.mjs",
    import.meta.url,
  ),
  "utf8",
);
const acceptance = [1, 2, 3, 4]
  .map((part) =>
    readFileSync(
      new URL(
        `../scripts/ci/cartera-010b-remote-acceptance-0${part}.sql`,
        import.meta.url,
      ),
      "utf8",
    ),
  )
  .join("\n");

function requireMarkers(text, markers) {
  for (const marker of markers) {
    assert.match(
      text,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `Missing marker: ${marker}`,
    );
  }
}

test("remote runner deploys only the four foundational 010B migrations", () => {
  requireMarkers(runner, [
    'version: "20260731000200"',
    'version: "20260731000210"',
    'version: "20260731000211"',
    'version: "20260731000212"',
    "SUPABASE_ACCESS_TOKEN_MISSING",
    "MIGRATION_${migration.version}_REMOTE_CONTENT_MISMATCH",
    "CARTERA_010B_REMOTE_ACCEPTANCE=PASS",
    "TEST_FIXTURES_ROLLED_BACK=YES",
    "RESIDUAL_FIXTURES=0",
  ]);
  assert.doesNotMatch(runner, /service_role/i);
  assert.doesNotMatch(runner, /database password/i);
});

test("acceptance is transactional and always rolls fixtures back", () => {
  assert.match(acceptance, /^begin;/);
  assert.match(acceptance, /rollback;\s*$/);
  requireMarkers(acceptance, [
    "insert into auth.users",
    "forge_cartera010b_confirm_identity_resolution",
    "forge_cartera010b_confirm_policy_with_parties",
    "CARTERA010B_IDENTITY_REPLAY_INVALID",
    "CARTERA010B_IDENTITY_CORRECTION_INVALID",
    "CARTERA010B_POLICY_V1_INVALID",
    "CARTERA010B_POLICY_V2_INVALID",
    "CARTERA010B_POLICY_NUMBER_COLLISION_NOT_RECORDED",
    "CARTERA010B_CROSS_ADVISOR_PERSON_LEAK",
    "CARTERA010B_CROSS_ADVISOR_POLICY_LEAK",
    "CARTERA010B_RESTRICTED_ROLE_LEAK",
    "CARTERA010B_ANON_IDENTITY_EXECUTION_UNEXPECTED",
    "CARTERA010B_ANON_POLICY_EXECUTION_UNEXPECTED",
  ]);
});

test("acceptance proves server-owned digest and changed replay conflict", () => {
  requireMarkers(acceptance, [
    "'commandDigest',repeat('f',64)",
    "jsonb_set(identity_command_a, '{commandDigest}'",
    "jsonb_set(identity_command_a, '{reasonCode}'",
    "CHANGED_INPUT_REPLAY",
    "jsonb_set(policy_command_v1, '{commandDigest}'",
    "jsonb_set(policy_command_v1, '{policy,status,value}'",
  ]);
});

test("acceptance covers multi-party roles and restricted beneficiary visibility", () => {
  requireMarkers(acceptance, [
    "'roleType','POLICY_OWNER'",
    "'roleType','INSURED'",
    "'roleType','PAYOR'",
    "'roleType','BENEFICIARY'",
    "'visibilityScope','RESTRICTED_ROLE_VIEW'",
    "forge_cartera010b_list_general_policy_roles",
    "CARTERA010B_RESTRICTED_ROLE_TABLE_READ_UNEXPECTED",
  ]);
});

test("acceptance covers append-only temporal supersession", () => {
  requireMarkers(acceptance, [
    "CARTERA010B_IDENTITY_PRIOR_LINK_NOT_CLOSED",
    "CARTERA010B_POLICY_ROLE_SUPERSESSION_INVALID",
    "CARTERA010B_POLICY_VERSION_MUTATION_UNEXPECTED",
    "CARTERA010B_POLICY_ROLE_DELETE_UNEXPECTED",
  ]);
});
