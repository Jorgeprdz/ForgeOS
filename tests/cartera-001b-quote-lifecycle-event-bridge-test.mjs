import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/event-evidence/quote-lifecycle-event-contract.js");
const bridge = require("../platform/event-evidence/quote-lifecycle-event-bridge.js");

const receipt = bridge.createQuoteIdentityReceipt({
  quoteReference: "quote:11111111-1111-4111-8111-111111111111",
  quoteVersionReference: "quote-version:22222222-2222-4222-8222-222222222222",
  prospectReference: "33333333-3333-4333-8333-333333333333",
  productReference: "product:orvi",
  lifecycleState: "PRESENTED",
  effectiveAt: "2026-07-30T23:00:00.000Z",
  sourceEvidenceReferences: ["document:abc123"],
  freshness: { status: "reviewed_current_session" },
  confirmationState: "CONFIRMED",
  snapshotDigest: "a".repeat(64),
  persistenceReceipt: "quote-persist:44444444-4444-4444-8444-444444444444",
  idempotencyKey: "cartera001b:receipt",
});

function event(eventType, lifecycleState = contract.EVENT_STATE_RULES[eventType]) {
  return bridge.createLifecycleEventFromReceipt({
    tenantId: "tenant-001",
    advisorId: "advisor-001",
    eventType,
    identityReceipt: { ...receipt, lifecycle_state: lifecycleState },
    sourceRecordReference: "quote-persist:record",
    occurredAt: "2026-07-30T23:00:00.000Z",
    recordedAt: "2026-07-30T23:00:01.000Z",
  });
}

test("review-confirmed does not project a prospect decision", () => {
  const reviewed = event("QUOTE_REVIEW_CONFIRMED", "REVIEWED");
  const projection = bridge.projectQuoteLifecycleToProspectTimeline(reviewed);
  assert.equal(projection.projected, false);
  assert.equal(projection.reason, "QUOTE_EVENT_HAS_NO_PROSPECT_TIMELINE_MEANING");
});

test("presented quote projects only minimized commercial meaning", () => {
  const presented = event("QUOTE_PRESENTED", "PRESENTED");
  const projection = bridge.projectQuoteLifecycleToProspectTimeline(presented);
  assert.equal(projection.projected, true);
  assert.equal(projection.eventInput.eventType, "PROPOSAL_PRESENTED");
  assert.deepEqual(projection.eventInput.payload, {
    productReference: "product:orvi",
    quoteReference: receipt.quote_reference,
  });
  assert.deepEqual(bridge.findNumericQuoteTruth(projection.eventInput.payload), []);
  assert.equal(projection.safety.numericQuoteTruthCopied, false);
});

test("prospect acceptance and rejection map to explicit decision codes", () => {
  const accepted = bridge.projectQuoteLifecycleToProspectTimeline(
    event("QUOTE_PROSPECT_ACCEPTED", "PROSPECT_ACCEPTED"),
  );
  const rejected = bridge.projectQuoteLifecycleToProspectTimeline(
    event("QUOTE_PROSPECT_REJECTED", "PROSPECT_REJECTED"),
  );
  assert.equal(accepted.eventInput.payload.decisionCode, "QUOTE_ACCEPTED");
  assert.equal(rejected.eventInput.payload.decisionCode, "QUOTE_REJECTED");
});

test("application conversion is blocked until its authority exists", () => {
  const blocked = bridge.blockApplicationConversionWithoutAuthority({
    applicationAuthorityProved: false,
  });
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.code, "APPLICATION_AUTHORITY_NOT_PROVED");
  assert.equal(blocked.automaticApplicationCreation, false);
});

test("runtime persists quote event before optional timeline projection", async () => {
  const calls = [];
  const runtime = bridge.createRuntime({
    async persistLifecycleEvent(value) {
      calls.push(["persist", value.event_id]);
      return { eventId: value.event_id };
    },
    async appendProspectTimelineEvent(prospectReference, input) {
      calls.push(["timeline", prospectReference, input.eventType]);
      return { id: "timeline-001" };
    },
  });

  const result = await runtime.publish(event("QUOTE_PRESENTED", "PRESENTED"));
  assert.deepEqual(calls.map(call => call[0]), ["persist", "timeline"]);
  assert.equal(result.timeline.id, "timeline-001");
  assert.equal(runtime.diagnostics().genericLedgerCreated, false);
});
