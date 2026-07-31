import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/20260731000215_cartera010b_general_policy_role_read_authority.sql",
    import.meta.url,
  ),
  "utf8",
);
const deployer = readFileSync(
  new URL(
    "../scripts/ci/cartera-010b-general-role-read-deploy.mjs",
    import.meta.url,
  ),
  "utf8",
);

test("general role authority keeps direct table reads revoked", () => {
  assert.match(
    migration,
    /create or replace function public\.forge_cartera010b_list_general_policy_roles/,
  );
  assert.match(migration, /security definer/);
  assert.match(migration, /actor_id := auth\.uid\(\)/);
  assert.match(migration, /r\.advisor_id = actor_id/);
  assert.match(migration, /r\.visibility_scope = 'POLICY_TEAM'/);
  assert.match(migration, /r\.role_type <> 'BENEFICIARY'/);
  assert.match(migration, /grant execute on function[\s\S]*to authenticated/);
  assert.doesNotMatch(migration, /grant select on (table )?public\.policy_roles/i);
});

test("general role authority exposes no evidence payload", () => {
  const returnBlock = migration.match(/returns table \(([\s\S]*?)\)\nlanguage/)?.[1] ?? "";
  assert.doesNotMatch(returnBlock, /evidence_references|archive_reason|archived_by/);
  assert.match(returnBlock, /policy_role_reference text/);
  assert.match(returnBlock, /participant_person_id uuid/);
  assert.match(returnBlock, /participant_account_id uuid/);
});

test("remote deployer records and verifies migration 00215", () => {
  assert.match(deployer, /20260731000215/);
  assert.match(deployer, /supabase_migrations\.schema_migrations/);
  assert.match(deployer, /REMOTE_CONTENT_MISMATCH/);
  assert.match(
    deployer,
    /CARTERA010B_GENERAL_POLICY_ROLE_READ_AUTHORITY=PASS/,
  );
  assert.doesNotMatch(deployer, /service_role|database password/i);
});
