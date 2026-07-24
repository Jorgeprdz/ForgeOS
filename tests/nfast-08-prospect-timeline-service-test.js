"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const TimelineService = require(
  "../advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js",
);

const NOW = "2026-07-24T12:00:00.000Z";

function timelineRow(extra = {}) {
  return {
    id: "event-1",
    prospect_id: "prospect-1",
    advisor_id: "advisor-1",
    event_type: "CONTACT_ATTEMPTED",
    event_source: "ADVISOR_DECLARATION",
    source_record_reference:
      "ADVISOR_UI:prospect-1:contact-1",
    occurred_at: NOW,
    recorded_at: NOW,
    payload: {
      channel: "CALL",
      outcome: "NO_RESPONSE",
    },
    evidence_references: [],
    contract_version: "NFAST-08.1",
    privacy_classification:
      "ADVISOR_PRIVATE_MINIMIZED",
    retention_policy:
      "NO_AUTOMATIC_DELETION_PENDING_POLICY",
    ...extra,
  };
}

function createMockClient() {
  const calls = [];
  const queryState = {};

  const query = {
    select(columns) {
      queryState.select = columns;
      return this;
    },
    eq(column, value) {
      queryState.eq = [column, value];
      return this;
    },
    order(column, options) {
      queryState.orders ||= [];
      queryState.orders.push([
        column,
        options,
      ]);
      return this;
    },
    lt(column, value) {
      queryState.lt = [column, value];
      return this;
    },
    async limit(value) {
      queryState.limit = value;
      return {
        data: [timelineRow()],
        error: null,
      };
    },
  };

  return {
    calls,
    queryState,
    auth: {
      async getUser() {
        return {
          data: {
            user: {
              id: "advisor-1",
            },
          },
          error: null,
        };
      },
    },
    from(table) {
      calls.push(["from", table]);
      return query;
    },
    async rpc(name, params) {
      calls.push(["rpc", name, params]);
      return {
        data: timelineRow({
          event_type: params.p_event_type,
          occurred_at:
            params.p_occurred_at,
          source_record_reference:
            params
              .p_source_record_reference,
          payload: params.p_payload,
          evidence_references:
            params
              .p_evidence_references,
        }),
        error: null,
      };
    },
  };
}

test(
  "NFAST-08 lists only the governed commercial Timeline view",
  async () => {
    const client = createMockClient();
    const service =
      TimelineService.create(client);

    const events =
      await service.listProspectTimeline(
        "prospect-1",
        {
          limit: 20,
          before:
            "2026-07-25T00:00:00.000Z",
        },
      );

    assert.equal(events.length, 1);
    assert.equal(
      events[0].eventType,
      "CONTACT_ATTEMPTED",
    );
    assert.deepEqual(
      client.calls[0],
      [
        "from",
        "prospect_commercial_timeline",
      ],
    );
    assert.deepEqual(
      client.queryState.eq,
      ["prospect_id", "prospect-1"],
    );
    assert.equal(
      client.queryState.limit,
      20,
    );
    assert.deepEqual(
      client.queryState.lt,
      [
        "occurred_at",
        "2026-07-25T00:00:00.000Z",
      ],
    );
  },
);

test(
  "NFAST-08 appends through the governed RPC without advisor injection",
  async () => {
    const client = createMockClient();
    const service =
      TimelineService.create(client);

    const event =
      await service
        .appendProspectTimelineEvent(
          "prospect-1",
          {
            eventType:
              "CONTACT_ATTEMPTED",
            occurredAt: NOW,
            sourceRecordReference:
              "ADVISOR_UI:prospect-1:contact-1",
            payload: {
              channel: "CALL",
              outcome: "NO_RESPONSE",
            },
            evidenceReferences: [],
            idempotencyKey:
              "contact:prospect-1:1",
          },
        );

    const rpcCall =
      client.calls.find(
        call => call[0] === "rpc",
      );

    assert.equal(
      rpcCall[1],
      "forge_nfast08_append_prospect_timeline_event",
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        rpcCall[2],
        "advisor_id",
      ),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        rpcCall[2],
        "p_advisor_id",
      ),
      false,
    );
    assert.equal(
      event.eventType,
      "CONTACT_ATTEMPTED",
    );
  },
);

test(
  "NFAST-08 service rejects raw content before any RPC",
  async () => {
    const client = createMockClient();
    const service =
      TimelineService.create(client);

    await assert.rejects(
      () =>
        service
          .appendProspectTimelineEvent(
            "prospect-1",
            {
              eventType:
                "CONTACT_ATTEMPTED",
              occurredAt: NOW,
              sourceRecordReference:
                "ADVISOR_UI:prospect-1",
              payload: {
                channel: "CALL",
                outcome: "CONTACTED",
                draftText:
                  "Texto que no debe persistirse",
              },
              evidenceReferences: [],
            },
          ),
      error =>
        error.code === "VALIDATION_ERROR" &&
        error.details.errors.includes(
          "PAYLOAD_KEY_NOT_ALLOWED:draftText",
        ),
    );

    assert.equal(
      client.calls.some(
        call => call[0] === "rpc",
      ),
      false,
    );
  },
);

test(
  "NFAST-08 service exposes no update or delete authority",
  () => {
    const client = createMockClient();
    const service =
      TimelineService.create(client);
    const diagnostics =
      service.diagnostics();

    assert.equal(
      service.updateTimelineEvent,
      undefined,
    );
    assert.equal(
      service.deleteTimelineEvent,
      undefined,
    );
    assert.equal(
      diagnostics.directInsertAllowed,
      false,
    );
    assert.equal(
      diagnostics.updateAllowed,
      false,
    );
    assert.equal(
      diagnostics.deleteAllowed,
      false,
    );
    assert.equal(
      diagnostics.draftPersistenceAllowed,
      false,
    );
  },
);
