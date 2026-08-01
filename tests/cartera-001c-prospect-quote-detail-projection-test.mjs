import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projection = require("../platform/event-evidence/prospect-quote-detail-projection.js");

const prospectReference = "11111111-1111-4111-8111-111111111111";

function row(overrides = {}) {
  return {
    quote_reference: "quote:22222222-2222-4222-8222-222222222222",
    quote_version_reference: "quote-version:33333333-3333-4333-8333-333333333333",
    prospect_id: prospectReference,
    product_reference: "product:orvi",
    lifecycle_state: "REVIEWED",
    event_id: "quote-event:44444444-4444-4444-8444-444444444444",
    event_type: "QUOTE_REVIEW_CONFIRMED",
    occurred_at: "2026-07-30T20:00:00.000Z",
    recorded_at: "2026-07-30T20:00:01.000Z",
    evidence_references: ["document:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
    freshness_metadata: { status: "reviewed_current_session", source: "test" },
    confirmation_state: "CONFIRMED",
    contract_version: "CARTERA-001B.1",
    ...overrides,
  };
}

test("empty history produces an immutable EMPTY projection", () => {
  const result = projection.createProspectQuoteDetailProjection({ prospectReference, rows: [] });
  assert.equal(result.state, "EMPTY");
  assert.equal(result.counters.quote_count, 0);
  assert.equal(result.counters.quote_event_count, 0);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.quotes));
});

test("events group by durable quote identity and latest lifecycle wins", () => {
  const result = projection.createProspectQuoteDetailProjection({
    prospectReference,
    rows: [
      row(),
      row({
        event_id: "quote-event:55555555-5555-4555-8555-555555555555",
        event_type: "QUOTE_PRESENTED",
        lifecycle_state: "PRESENTED",
        occurred_at: "2026-07-30T21:00:00.000Z",
        recorded_at: "2026-07-30T21:00:01.000Z",
      }),
      row({
        event_id: "quote-event:66666666-6666-4666-8666-666666666666",
        event_type: "QUOTE_PROSPECT_ACCEPTED",
        lifecycle_state: "PROSPECT_ACCEPTED",
        occurred_at: "2026-07-30T22:00:00.000Z",
        recorded_at: "2026-07-30T22:00:01.000Z",
      }),
    ],
  });
  assert.equal(result.state, "READY");
  assert.equal(result.quotes.length, 1);
  assert.equal(result.quotes[0].lifecycle_state, "PROSPECT_ACCEPTED");
  assert.equal(result.quotes[0].lifecycle_label, "Aceptada");
  assert.equal(result.quotes[0].event_count, 3);
  assert.equal(result.timeline[0].event_type, "QUOTE_PROSPECT_ACCEPTED");
  assert.equal(result.timeline[0].source_authority, "QUOTE_AUTHORITY");
});

test("multiple versions remain one quote and expose only references and counts", () => {
  const result = projection.createProspectQuoteDetailProjection({
    prospectReference,
    rows: [
      row(),
      row({
        quote_version_reference: "quote-version:77777777-7777-4777-8777-777777777777",
        event_id: "quote-event:88888888-8888-4888-8888-888888888888",
        event_type: "QUOTE_RECALCULATED",
        lifecycle_state: "REVIEWED",
        occurred_at: "2026-07-30T21:00:00.000Z",
        recorded_at: "2026-07-30T21:00:01.000Z",
      }),
    ],
  });
  assert.equal(result.quotes.length, 1);
  assert.equal(result.quotes[0].version_count, 2);
  assert.equal(result.quotes[0].version_references.length, 2);
  assert.doesNotMatch(JSON.stringify(result), /premium|prima|coverage|cobertura|sum_assured|deductible|coinsurance/i);
  assert.doesNotMatch(JSON.stringify(result), /aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/);
});

test("disputed evidence produces an explicit conflict instead of silent overwrite", () => {
  const result = projection.createProspectQuoteDetailProjection({
    prospectReference,
    rows: [row({ confirmation_state: "DISPUTED" })],
  });
  assert.equal(result.state, "CONFLICT_REVIEW_REQUIRED");
  assert.equal(result.counters.conflict_count, 1);
  assert.equal(result.quotes[0].truth_state, "CONFLICT_REVIEW_REQUIRED");
});

test("mixed Prospect identities are rejected", () => {
  assert.throws(
    () => projection.createProspectQuoteDetailProjection({
      prospectReference,
      rows: [row({ prospect_id: "99999999-9999-4999-8999-999999999999" })],
    }),
    error => error.code === "QUOTE_HISTORY_PROSPECT_SCOPE_MISMATCH",
  );
});

test("unknown fields are rejected to prevent Quote Truth leakage", () => {
  assert.throws(
    () => projection.createProspectQuoteDetailProjection({
      prospectReference,
      rows: [row({ premium: 12345 })],
    }),
    error => error.code === "QUOTE_HISTORY_FORBIDDEN_FIELDS"
      && error.details.unsupported_fields.includes("premium"),
  );
});

test("projection digest is deterministic across source ordering", () => {
  const first = row();
  const second = row({
    event_id: "quote-event:55555555-5555-4555-8555-555555555555",
    event_type: "QUOTE_PRESENTED",
    lifecycle_state: "PRESENTED",
    occurred_at: "2026-07-30T21:00:00.000Z",
    recorded_at: "2026-07-30T21:00:01.000Z",
  });
  const left = projection.createProspectQuoteDetailProjection({ prospectReference, rows: [first, second] });
  const right = projection.createProspectQuoteDetailProjection({ prospectReference, rows: [second, first] });
  assert.equal(left.projection_digest, right.projection_digest);
  assert.deepEqual(left, right);
});

test("generated projection envelope validates without private source rows", () => {
  const result = projection.createProspectQuoteDetailProjection({
    prospectReference,
    rows: [row()],
  });
  assert.deepEqual(projection.validateProspectQuoteDetailProjection(result), {
    valid: true,
    errors: [],
  });
});

test("tampered projection envelope fails counters and digest validation", () => {
  const result = projection.createProspectQuoteDetailProjection({
    prospectReference,
    rows: [row()],
  });
  const tampered = JSON.parse(JSON.stringify(result));
  tampered.counters.quote_count = 99;
  const validation = projection.validateProspectQuoteDetailProjection(tampered);
  assert.equal(validation.valid, false);
  assert.equal(validation.errors[0].code, "PROJECTION_COUNTER_MISMATCH");
});
