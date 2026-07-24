"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const TimelineContract = require(
  "../advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-contract.js",
);

const NOW = "2026-07-24T12:00:00.000Z";

test(
  "NFAST-08 accepts a minimized structured advisor event",
  () => {
    const result =
      TimelineContract
        .validateProspectTimelineEventInput({
          eventType: "CONTACT_ATTEMPTED",
          occurredAt: NOW,
          sourceRecordReference:
            "ADVISOR_UI:prospect-1:contact-1",
          payload: {
            channel: "WHATSAPP",
            outcome: "NO_RESPONSE",
            direction: "OUTBOUND",
          },
          evidenceReferences: [
            "evidence:contact-attempt-1",
          ],
          idempotencyKey:
            "contact-attempt:prospect-1:1",
        });

    assert.equal(result.valid, true);
    assert.equal(
      result.contractVersion,
      "NFAST-08.1",
    );
    assert.equal(
      result.normalized.payload.outcome,
      "NO_RESPONSE",
    );
  },
);

test(
  "NFAST-08 rejects raw notes drafts prompts and routing data",
  () => {
    for (const prohibitedPayload of [
      {
        channel: "WHATSAPP",
        outcome: "CONTACTED",
        rawText: "mensaje completo",
      },
      {
        channel: "WHATSAPP",
        outcome: "CONTACTED",
        notes: "nota libre",
      },
      {
        channel: "WHATSAPP",
        outcome: "CONTACTED",
        phone: "+525500000001",
      },
      {
        channel: "WHATSAPP",
        outcome: "CONTACTED",
        conversationBrief: {
          status: "SUCCESS",
        },
      },
    ]) {
      const result =
        TimelineContract
          .validateProspectTimelineEventInput({
            eventType:
              "CONTACT_ATTEMPTED",
            occurredAt: NOW,
            sourceRecordReference:
              "ADVISOR_UI:prospect-1",
            payload: prohibitedPayload,
            evidenceReferences: [],
          });

      assert.equal(result.valid, false);
      assert(
        result.errors.some(error =>
          error.startsWith(
            "PAYLOAD_KEY_NOT_ALLOWED:",
          ),
        ),
      );
    }
  },
);

test(
  "NFAST-08 blocks system event forgery and advisor identity injection",
  () => {
    const systemEvent =
      TimelineContract
        .validateProspectTimelineEventInput({
          eventType: "STAGE_CHANGED",
          occurredAt: NOW,
          sourceRecordReference:
            "ADVISOR_UI:prospect-1",
          payload: {},
          evidenceReferences: [],
        });

    assert.equal(systemEvent.valid, false);
    assert(
      systemEvent.errors.includes(
        "SYSTEM_EVENT_NOT_ADVISOR_APPENDABLE",
      ),
    );

    const forgedOwner =
      TimelineContract
        .validateProspectTimelineEventInput({
          advisorId: "advisor-forged",
          eventType: "CONTACT_ATTEMPTED",
          occurredAt: NOW,
          sourceRecordReference:
            "ADVISOR_UI:prospect-1",
          payload: {
            channel: "CALL",
            outcome: "NO_RESPONSE",
          },
          evidenceReferences: [],
        });

    assert.equal(forgedOwner.valid, false);
    assert(
      forgedOwner.errors.includes(
        "TIMELINE_INPUT_KEY_NOT_ALLOWED:advisorId",
      ),
    );
  },
);

test(
  "NFAST-08 requires event-specific fields and flat scalar payloads",
  () => {
    const missing =
      TimelineContract
        .validateProspectTimelineEventInput({
          eventType:
            "APPOINTMENT_SCHEDULED",
          occurredAt: NOW,
          sourceRecordReference:
            "APPOINTMENT_UI:prospect-1",
          payload: {
            appointmentReference:
              "appointment:1",
          },
          evidenceReferences: [],
        });

    assert.equal(missing.valid, false);
    assert(
      missing.errors.includes(
        "PAYLOAD_KEY_REQUIRED:scheduledAt",
      ),
    );

    const nested =
      TimelineContract
        .validateProspectTimelineEventInput({
          eventType: "DECISION_RECORDED",
          occurredAt: NOW,
          sourceRecordReference:
            "ADVISOR_UI:prospect-1",
          payload: {
            decisionCode: {
              value: "POSTPONED",
            },
          },
          evidenceReferences: [],
        });

    assert.equal(nested.valid, false);
    assert(
      nested.errors.includes(
        "PAYLOAD_VALUE_NOT_SCALAR:decisionCode",
      ),
    );
  },
);

test(
  "NFAST-08 exposes separate technical and commercial event vocabularies",
  () => {
    assert.deepEqual(
      TimelineContract.SYSTEM_EVENT_TYPES,
      [
        "PROSPECT_CREATED",
        "STAGE_CHANGED",
        "PROSPECT_ARCHIVED",
      ],
    );

    assert(
      TimelineContract.ADVISOR_EVENT_TYPES
        .includes("OBJECTION_RECORDED"),
    );

    assert.equal(
      TimelineContract.ALL_EVENT_TYPES
        .includes("MESSAGE_DRAFTED"),
      false,
    );
  },
);
