import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const continuity = require("../platform/event-evidence/cartera-vertical-continuity-contract.js");
const projector = require("../platform/event-evidence/prospect-quote-detail-projection.js");

const prospectReference = "11111111-1111-4111-8111-111111111111";
const quoteReference = "quote:22222222-2222-4222-8222-222222222222";
const quoteVersionReference = "quote-version:33333333-3333-4333-8333-333333333333";
const evidence = ["document:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"];

function historyRow({ eventId, eventType, lifecycleState, occurredAt }) {
  return {
    quote_reference: quoteReference,
    quote_version_reference: quoteVersionReference,
    prospect_id: prospectReference,
    product_reference: "product:orvi",
    lifecycle_state: lifecycleState,
    event_id: eventId,
    event_type: eventType,
    occurred_at: occurredAt,
    recorded_at: new Date(Date.parse(occurredAt) + 1000).toISOString(),
    evidence_references: evidence,
    freshness_metadata: { status: "reviewed_current_session", source: "cartera001d_test" },
    confirmation_state: "CONFIRMED",
    contract_version: "CARTERA-001B.1",
  };
}

function bundle() {
  const rows = [
    historyRow({
      eventId: "quote-event:44444444-4444-4444-8444-444444444444",
      eventType: "QUOTE_CREATED",
      lifecycleState: "DRAFT",
      occurredAt: "2026-07-30T20:00:00.000Z",
    }),
    historyRow({
      eventId: "quote-event:55555555-5555-4555-8555-555555555555",
      eventType: "QUOTE_REVIEW_CONFIRMED",
      lifecycleState: "REVIEWED",
      occurredAt: "2026-07-30T20:00:01.000Z",
    }),
    historyRow({
      eventId: "quote-event:66666666-6666-4666-8666-666666666666",
      eventType: "QUOTE_PRESENTED",
      lifecycleState: "PRESENTED",
      occurredAt: "2026-07-30T20:01:00.000Z",
    }),
    historyRow({
      eventId: "quote-event:77777777-7777-4777-8777-777777777777",
      eventType: "QUOTE_PROSPECT_ACCEPTED",
      lifecycleState: "PROSPECT_ACCEPTED",
      occurredAt: "2026-07-30T20:02:00.000Z",
    }),
  ];
  return {
    prospectReference,
    confirmationReceipt: {
      status: "PERSISTED",
      durable: true,
      quoteReference,
      quoteVersionReference,
      prospectReference,
      lifecycleState: "REVIEWED",
      eventIds: [rows[0].event_id, rows[1].event_id],
    },
    lifecycleReceipts: [
      {
        status: "PERSISTED",
        durable: true,
        eventId: rows[2].event_id,
        quoteReference,
        quoteVersionReference,
        prospectReference,
        lifecycleState: "PRESENTED",
      },
      {
        status: "PERSISTED",
        durable: true,
        eventId: rows[3].event_id,
        quoteReference,
        quoteVersionReference,
        prospectReference,
        lifecycleState: "PROSPECT_ACCEPTED",
      },
    ],
    quoteHistoryRows: rows,
    timelineRows: [
      {
        id: "88888888-8888-4888-8888-888888888888",
        prospect_id: prospectReference,
        event_source: "QUOTE_AUTHORITY",
        event_type: "PROPOSAL_PRESENTED",
        occurred_at: "2026-07-30T20:01:00.000Z",
        source_record_reference: rows[2].event_id,
        payload: { productReference: "product:orvi", quoteReference },
      },
      {
        id: "99999999-9999-4999-8999-999999999999",
        prospect_id: prospectReference,
        event_source: "QUOTE_AUTHORITY",
        event_type: "DECISION_RECORDED",
        occurred_at: "2026-07-30T20:02:00.000Z",
        source_record_reference: rows[3].event_id,
        payload: { decisionCode: "QUOTE_ACCEPTED", reasonCode: "CLIENT_CONFIRMED" },
      },
    ],
    projection: projector.createProspectQuoteDetailProjection({ prospectReference, rows }),
    renderedText: "Cotizaciones product:orvi Aceptada Actividad de cotización Prospecto aceptó la cotización",
  };
}

test("complete Quote to Prospect Detail chain validates as one vertical identity", () => {
  const result = continuity.validateCarteraVerticalContinuity(bundle());
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.summary.finalLifecycleState, "PROSPECT_ACCEPTED");
  assert.equal(result.summary.sourceAuthority, "QUOTE_AUTHORITY");
  assert.equal(result.summary.historyEventCount, 4);
  assert.equal(result.summary.timelineEventCount, 2);
  assert.equal(result.automaticExternalEffects, false);
  assert.equal(result.applicationCreationAllowed, false);
  assert.ok(Object.isFrozen(result));
});

test("cross-layer Quote Version mismatch is rejected", () => {
  const input = bundle();
  input.lifecycleReceipts[0].quoteVersionReference = "quote-version:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const result = continuity.validateCarteraVerticalContinuity(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(item => item.code === "LIFECYCLE_RECEIPT_VERSION_MISMATCH"));
});

test("financial Quote Truth in Prospect Timeline is rejected", () => {
  const input = bundle();
  input.timelineRows[0].payload.annualPremium = 50000;
  const result = continuity.validateCarteraVerticalContinuity(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(item => item.code === "TIMELINE_QUOTE_TRUTH_LEAK"));
});

test("unlinked lifecycle event cannot silently appear in Prospect Timeline", () => {
  const input = bundle();
  input.timelineRows[1].source_record_reference = "quote-event:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const result = continuity.validateCarteraVerticalContinuity(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(item => item.code === "TIMELINE_EVENT_LINK_MISSING"));
});

test("rendered raw evidence references are rejected", () => {
  const input = bundle();
  input.renderedText += ` ${evidence[0]}`;
  const result = continuity.validateCarteraVerticalContinuity(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(item => item.code === "RENDERED_RAW_EVIDENCE_LEAK"));
});
