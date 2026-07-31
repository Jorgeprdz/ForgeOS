import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/20260731000213_cartera010b_identity_resolution_precedence_hardening.sql",
    import.meta.url,
  ),
  "utf8",
);
const deployer = readFileSync(
  new URL(
    "../scripts/ci/cartera-010b-precedence-hardening-deploy.mjs",
    import.meta.url,
  ),
  "utf8",
);

test("precedence hardening is additive and targets only the broken expression", () => {
  assert.match(migration, /^-- CARTERA 010B\.3C/m);
  assert.match(migration, /pg_get_functiondef/);
  assert.match(
    migration,
    /actor_id::text \|\| ''\|PERSON_REFERENCE\|'' \|\| \(new_person ->> ''personReference''\)/,
  );
  assert.match(migration, /CARTERA010B_IDENTITY_PRECEDENCE_TARGET_NOT_FOUND/);
  assert.doesNotMatch(migration, /alter table|create table|drop table/i);
});

test("remote deployer records and verifies migration 00213", () => {
  assert.match(deployer, /20260731000213/);
  assert.match(deployer, /supabase_migrations\.schema_migrations/);
  assert.match(deployer, /REMOTE_CONTENT_MISMATCH/);
  assert.match(deployer, /CARTERA010B_IDENTITY_PRECEDENCE_HARDENING=PASS/);
  assert.doesNotMatch(deployer, /service_role|database password/i);
});
