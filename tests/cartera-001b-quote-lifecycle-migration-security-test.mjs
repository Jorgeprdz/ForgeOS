import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL(
    "../supabase/migrations/20260730000100_cartera001b_quote_lifecycle_event_bridge.sql",
    import.meta.url,
  ),
  "utf8",
);

test("migration creates domain-specific Quote persistence, not a generic ledger", () => {
  assert.match(sql, /create table if not exists public\.quote_lifecycle_quotes/i);
  assert.match(sql, /create table if not exists public\.quote_lifecycle_versions/i);
  assert.match(sql, /create table if not exists public\.quote_lifecycle_events/i);
  assert.doesNotMatch(sql, /create table if not exists public\.generic_/i);
});

test("versions and events are append-only with forced RLS", () => {
  assert.match(sql, /forge_cartera001b_versions_append_only/i);
  assert.match(sql, /forge_cartera001b_events_append_only/i);
  assert.match(sql, /force row level security/i);
  assert.match(sql, /advisor_id = auth\.uid\(\)/i);
});

test("direct writes are revoked and RPC-only commands are granted", () => {
  assert.match(sql, /revoke all on public\.quote_lifecycle_quotes from anon, authenticated/i);
  assert.match(sql, /forge_cartera001b_confirm_reviewed_quote/i);
  assert.match(sql, /forge_cartera001b_append_quote_lifecycle_event/i);
  assert.match(sql, /grant execute[\s\S]*to authenticated/i);
});

test("snapshot material is binary-free and human reviewed", () => {
  assert.match(sql, /forge_cartera001b_json_has_forbidden_key/i);
  assert.match(sql, /reviewOnly/i);
  assert.match(sql, /finalAuthority/i);
  assert.match(sql, /HUMAN/i);
});

test("prospect ownership, idempotency, conflicts and corrections are governed", () => {
  assert.match(sql, /p\.advisor_id = actor_id/i);
  assert.match(sql, /CARTERA001B_EVENT_CONFLICT/i);
  assert.match(sql, /idempotency_key/i);
  assert.match(sql, /correction_of/i);
  assert.match(sql, /CARTERA001B_CORRECTION_TARGET_NOT_FOUND/i);
});

test("only commercial meaning projects into the existing NFAST timeline", () => {
  assert.match(sql, /forge_nfast08_append_prospect_timeline_event/i);
  assert.match(sql, /PROPOSAL_PRESENTED/i);
  assert.match(sql, /DECISION_RECORDED/i);
  assert.doesNotMatch(sql, /'premium'\s*,/i);
  assert.doesNotMatch(sql, /'sumAssured'\s*,/i);
});

test("application conversion stays blocked without authority", () => {
  assert.match(sql, /CARTERA001B_APPLICATION_AUTHORITY_REQUIRED/i);
});
