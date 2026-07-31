import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/20260731000214_cartera010b_conflict_insert_ambiguity_hardening.sql",
    import.meta.url,
  ),
  "utf8",
);
const deployer = readFileSync(
  new URL(
    "../scripts/ci/cartera-010b-conflict-ambiguity-hardening-deploy.mjs",
    import.meta.url,
  ),
  "utf8",
);

test("conflict ambiguity hardening targets both helper functions", () => {
  assert.match(migration, /forge_cartera010b_existing_receipt_response/);
  assert.match(migration, /forge_cartera010b_record_command_conflict/);
  assert.match(
    migration,
    /on conflict on constraint policy_conflicts_advisor_id_conflict_reference_key do nothing/,
  );
  assert.match(migration, /CARTERA010B_CONFLICT_AMBIGUITY_TARGET_NOT_FOUND/);
  assert.doesNotMatch(migration, /alter table|create table|drop table/i);
});

test("remote deployer records and verifies migration 00214", () => {
  assert.match(deployer, /20260731000214/);
  assert.match(deployer, /supabase_migrations\.schema_migrations/);
  assert.match(deployer, /REMOTE_CONTENT_MISMATCH/);
  assert.match(
    deployer,
    /CARTERA010B_CONFLICT_INSERT_AMBIGUITY_HARDENING=PASS/,
  );
  assert.doesNotMatch(deployer, /service_role|database password/i);
});
