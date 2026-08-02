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
const remoteClosure = readFileSync(
  new URL(
    "../docs/evidence/FORGE_CARTERA_010B_REMOTE_ACCEPTANCE_CLOSURE_001.md",
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

test("remote closure records migration 00214 and the retired deployment trigger", () => {
  assert.match(
    remoteClosure,
    /20260731000214_cartera010b_conflict_insert_ambiguity_hardening\.sql/,
  );
  assert.match(remoteClosure, /CONFLICT_INSERT_AMBIGUITY_HARDENING=PASS/);
  assert.match(remoteClosure, /CARTERA_010B_REMOTE_ACCEPTANCE=PASS/);
  assert.match(remoteClosure, /REMOTE_WORKFLOW_AUTOMATIC_TRIGGER=RETIRED/);
  assert.match(remoteClosure, /ARTIFACT_ID=8796172953/);
});
