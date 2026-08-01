import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL(
    "../supabase/migrations/20260730000110_cartera001b_idempotency_conflict_hardening.sql",
    import.meta.url,
  ),
  "utf8",
);

function position(fragment) {
  const index = sql.indexOf(fragment);
  assert.notEqual(index, -1, `missing SQL fragment: ${fragment}`);
  return index;
}

test("review confirmation replay compares stable evidence and source semantics", () => {
  assert.match(sql, /existing_event\.source_record_reference <> p_source_record_reference/);
  assert.match(sql, /existing_event\.evidence_references <> p_source_evidence_references/);
  assert.match(sql, /freshness_metadata->>'status'/);
  assert.match(sql, /freshness_metadata->>'source'/);
  assert.match(sql, /raise exception 'CARTERA001B_EVENT_CONFLICT'/);
  assert.match(sql, /jsonb_agg\(e\.event_id order by e\.recorded_at, e\.event_id\)/);
});

test("lifecycle replay is checked before state transition validation", () => {
  const replayLookup = position("select * into existing_event\n  from public.quote_lifecycle_events");
  const replayReturn = position("'idempotentReplay', true");
  const stateValidation = position("if p_correction_of is not null then\n    if quote_row.lifecycle_state <> corrected_event.lifecycle_state");
  assert.ok(replayLookup < replayReturn);
  assert.ok(replayReturn < stateValidation);
});

test("lifecycle replay conflicts on changed evidence, source, or decision reason", () => {
  assert.match(sql, /existing_event\.source_record_reference <> p_source_record_reference/);
  assert.match(sql, /existing_event\.evidence_references <> p_evidence_references/);
  assert.match(sql, /existing_event\.payload->>'decisionReasonCode'/);
});

test("corrections preserve the corrected event previous state", () => {
  assert.match(sql, /previous_state := corrected_event\.previous_lifecycle_state/);
  assert.match(sql, /'CONFIRMED', p_correction_of, event_hash/);
});

test("hardening does not authorize application conversion", () => {
  assert.match(sql, /CARTERA001B_APPLICATION_AUTHORITY_REQUIRED/);
  assert.doesNotMatch(sql, /insert into public\.[a-z_]*applications/i);
});
