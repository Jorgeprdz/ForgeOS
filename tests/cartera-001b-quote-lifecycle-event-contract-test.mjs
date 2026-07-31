import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/event-evidence/quote-lifecycle-event-contract.js");

const TENANT = "tenant-001";
const ADVISOR = "advisor-001";
const QUOTE = "quote:11111111-1111-4111-8111-111111111111";
const VERSION = "quote-version:22222222-2222-4222-8222-222222222222";
const PROSPECT = "33333333-3333-4333-8333-333333333333";
const PRODUCT = "product:orvi";

function input(eventType, overrides = {}) {
  const human = contract.HUMAN_CONFIRMED_EVENTS.includes(eventType);
  return {
    event_type: eventType,
    tenant_id: TENANT,
    actor: { type: human ? "ADVISOR" : "SYSTEM", id: ADVISOR },
    subject: { type: "QUOTE", id: QUOTE },
    source: {
      type: human ? "ADVISOR_CONFIRMED" : "SYSTEM_OBSERVED",
      reference: `source:${eventType.toLowerCase()}`,
      channel: "QUOTE",
    },
    evidence_strength: human ? "HUMAN_CONFIRMED" : "SYSTEM_OBSERVED",
    occurred_at: "2026-07-30T23:00:00.000Z",
    recorded_at: "2026-07-30T23:00:01.000Z",
    correlation_id: PROSPECT,
    causation_id: null,
    idempotency_key: `cartera001b:${eventType.toLowerCase()}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    payload: {
      quote_reference: QUOTE,
      quote_version_reference: VERSION,
      prospect_reference: PROSPECT,
      product_reference: PRODUCT,
      lifecycle_state: contract.EVENT_STATE_RULES[eventType],
      previous_lifecycle_state: null,
      application_reference:
        eventType === "QUOTE_CONVERTED_TO_APPLICATION"
          ? "application:44444444-4444-4444-8444-444444444444"
          : null,
      decision_reason_code: null,
    },
    provenance: {
      source_system: "quote-lifecycle-persistence",
      source_record_id: `persist:${eventType.toLowerCase()}`,
      captured_via: "FORGE_UI",
      evidence_references: ["document:abc123"],
      freshness_status: "reviewed_current_session",
      snapshot_digest: "a".repeat(64),
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: contract.DEFAULT_SAFETY_FLAGS,
    ...overrides,
  };
}

test("all quote lifecycle events validate with exact state semantics", () => {
  for (const eventType of contract.EVENT_TYPES) {
    const event = contract.createQuoteLifecycleEvent(input(eventType));
    assert.equal(event.event_type, eventType);
    assert.equal(event.subject.type, "QUOTE");
    assert.equal(event.payload.lifecycle_state, contract.EVENT_STATE_RULES[eventType]);
    assert.match(event.event_id, /^quote-event:/);
    assert.equal(Object.isFrozen(event), true);
  }
});

test("review confirmation is not prospect acceptance", () => {
  const reviewed = contract.createQuoteLifecycleEvent(input("QUOTE_REVIEW_CONFIRMED"));
  const accepted = contract.createQuoteLifecycleEvent(input("QUOTE_PROSPECT_ACCEPTED"));
  assert.equal(reviewed.payload.lifecycle_state, "REVIEWED");
  assert.equal(accepted.payload.lifecycle_state, "PROSPECT_ACCEPTED");
  assert.notEqual(reviewed.event_type, accepted.event_type);
});

test("human events cannot be emitted by automatic system observation", () => {
  assert.throws(
    () =>
      contract.createQuoteLifecycleEvent(
        input("QUOTE_PROSPECT_ACCEPTED", {
          actor: { type: "SYSTEM", id: ADVISOR },
          source: {
            type: "SYSTEM_OBSERVED",
            reference: "source:auto",
            channel: "QUOTE",
          },
          evidence_strength: "SYSTEM_OBSERVED",
        }),
      ),
    error => error.code === "HUMAN_CONFIRMATION_REQUIRED",
  );
});

test("numeric quote truth is rejected from lifecycle payload", () => {
  const bad = input("QUOTE_PRESENTED");
  bad.payload.premium = 120000;
  assert.throws(
    () => contract.createQuoteLifecycleEvent(bad),
    error => error.code === "PAYLOAD_KEYS_INVALID",
  );
});

test("application conversion requires a proven application reference", () => {
  const bad = input("QUOTE_CONVERTED_TO_APPLICATION");
  bad.payload.application_reference = null;
  assert.throws(
    () => contract.createQuoteLifecycleEvent(bad),
    error => error.code === "APPLICATION_AUTHORITY_REFERENCE_REQUIRED",
  );
});

test("event digest is deterministic and changed payload changes identity", () => {
  const left = contract.createQuoteLifecycleEvent(input("QUOTE_PRESENTED"));
  const right = contract.createQuoteLifecycleEvent(input("QUOTE_PRESENTED"));
  assert.equal(left.event_id, right.event_id);
  assert.equal(left.event_digest, right.event_digest);

  const changed = input("QUOTE_PRESENTED");
  changed.payload.decision_reason_code = "advisor_note";
  const changedEvent = contract.createQuoteLifecycleEvent(changed);
  assert.notEqual(left.event_digest, changedEvent.event_digest);
});

test("correction creates a new append-only event with lineage", () => {
  const original = contract.createQuoteLifecycleEvent(input("QUOTE_PRESENTED"));
  const correction = contract.createQuoteLifecycleCorrection(original, {
    actor: { type: "ADVISOR", id: ADVISOR },
    source: {
      type: "ADVISOR_CONFIRMED",
      reference: "source:correction",
      channel: "QUOTE",
    },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: "2026-07-30T23:05:00.000Z",
    recorded_at: "2026-07-30T23:05:01.000Z",
    idempotency_key: "cartera001b:quote-presented-correction",
    provenance: {
      source_system: "quote-lifecycle-persistence",
      source_record_id: "persist:correction",
      captured_via: "FORGE_UI",
      evidence_references: ["user-confirmation:correction"],
      freshness_status: "human_corrected",
      snapshot_digest: "b".repeat(64),
    },
    confirmation_state: "CONFIRMED",
  });
  assert.equal(correction.correction_of, original.event_id);
  assert.notEqual(correction.event_id, original.event_id);
});
