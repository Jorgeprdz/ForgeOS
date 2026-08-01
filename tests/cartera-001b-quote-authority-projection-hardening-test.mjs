import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL(
    "../supabase/migrations/20260730000120_cartera001b_quote_authority_projection_hardening.sql",
    import.meta.url,
  ),
  "utf8",
);

test("quote projections preserve QUOTE_AUTHORITY in the NFAST-08 timeline", () => {
  assert.match(sql, /'QUOTE_AUTHORITY'/);
  assert.match(sql, /insert into public\.prospect_timeline_events/);
  assert.doesNotMatch(
    sql,
    /forge_nfast08_append_prospect_timeline_event\(/,
    "the generic advisor declaration RPC must not own Quote projections",
  );
});

test("the internal projection helper is not executable by app roles", () => {
  assert.match(
    sql,
    /revoke all on function public\.forge_cartera001b_append_quote_timeline_projection[\s\S]*from public, anon, authenticated;/,
  );
});

test("projection reuses NFAST payload and evidence validators", () => {
  assert.match(sql, /forge_nfast08_validate_timeline_payload/);
  assert.match(sql, /forge_nfast08_validate_evidence_references/);
});

test("projection replay rejects changed authority payloads", () => {
  assert.match(sql, /existing\.event_source <> 'QUOTE_AUTHORITY'/);
  assert.match(sql, /existing\.payload <> coalesce\(p_payload, '\{\}'::jsonb\)/);
  assert.match(sql, /CARTERA001B_TIMELINE_PROJECTION_CONFLICT/);
});

test("application conversion remains blocked", () => {
  assert.match(sql, /CARTERA001B_APPLICATION_AUTHORITY_REQUIRED/);
  assert.doesNotMatch(sql, /insert into public\.[a-z_]*applications/i);
});
