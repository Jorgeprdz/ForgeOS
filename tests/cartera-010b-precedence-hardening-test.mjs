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
const remoteClosure = readFileSync(
  new URL(
    "../docs/evidence/FORGE_CARTERA_010B_REMOTE_ACCEPTANCE_CLOSURE_001.md",
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

test("remote closure records migration 00213 and the retired deployment trigger", () => {
  assert.match(
    remoteClosure,
    /20260731000213_cartera010b_identity_resolution_precedence_hardening\.sql/,
  );
  assert.match(remoteClosure, /IDENTITY_PRECEDENCE_HARDENING=PASS/);
  assert.match(remoteClosure, /CARTERA_010B_REMOTE_ACCEPTANCE=PASS/);
  assert.match(remoteClosure, /REMOTE_WORKFLOW_AUTOMATIC_TRIGGER=RETIRED/);
  assert.match(remoteClosure, /ARTIFACT_ID=8796172953/);
});
