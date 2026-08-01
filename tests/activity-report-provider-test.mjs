import test from "node:test";
import assert from "node:assert/strict";

import {
  FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION,
  createFesActivityReportSourceAdapter,
} from "../advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.mjs";

import {
  ACTIVITY_REPORT_DEFINITION_ID,
  ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
  createActivityReportProvider,
} from "../advisor-os/reporting/providers/activity-report-provider.mjs";

function event(overrides = {}) {
  return {
    schema_version: "forge.activity_event.v1",
    event_id: overrides.event_id ?? "evt-1",
    event_type: overrides.event_type ?? "DUE_ACTION_COMPLETED",
    tenant_id: "org-1",
    actor: { type: "ADVISOR", id: "advisor-1" },
    idempotency_key: overrides.idempotency_key ?? "idem-1",
    occurred_at: overrides.occurred_at ?? "2026-07-31T15:00:00.000Z",
    recorded_at: overrides.recorded_at ?? "2026-07-31T15:01:00.000Z",
    confirmation_state: overrides.confirmation_state ?? "CONFIRMED",
    correction_of: overrides.correction_of ?? null,
    payload: {},
  };
}

function snapshot(events) {
  return {
    schemaVersion: FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION,
    authority: {
      organizationId: "org-1",
      advisorId: "advisor-1",
    },
    source: {
      sourceId: "fes-canonical-event-ledger",
      sourceVersion: "forge.activity_event.v1+FES-05B.1",
      authority: "FES_CANONICAL_ACTIVITY_EVENT",
    },
    events,
  };
}

function provider(events) {
  const adapter = createFesActivityReportSourceAdapter({
    organizationId: "org-1",
    advisorId: "advisor-1",
    timeZone: "America/Mexico_City",
    readEvents: async () => snapshot(events),
    classifyAppointment: () => "INITIAL",
  });

  return createActivityReportProvider({
    sourcePort: adapter.sourcePort,
  });
}

function query(overrides = {}) {
  return {
    authority: {
      organizationId: "org-1",
      principalId: "advisor-1",
    },
    period: {
      from: "2026-07-30",
      to: "2026-07-31",
    },
    asOf: "2026-07-31T20:00:00.000Z",
    dimensions: [
      "evaluationDate",
      "activityType",
    ],
    measures: [
      "activityCount",
    ],
    ...overrides,
  };
}

test("exposes one governed Activity definition and provider contract", () => {
  const value = provider([]);

  assert.equal(value.schemaVersion, ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION);
  assert.equal(value.definition.definitionId, ACTIVITY_REPORT_DEFINITION_ID);
  assert.equal(value.definition.providerId, "activity");
  assert.deepEqual(value.definition.defaultDimensions, [
    "activityType",
    "evaluationDate",
  ]);
  assert.deepEqual(value.definition.defaultMeasures, ["activityCount"]);
  assert.equal(value.port.contract.slicePolicy.maxSliceDays, 31);
  assert.equal(value.port.contract.boundary.universalAggregationAuthority, false);
});

test("returns canonical daily Activity rows without zero fabrication", async () => {
  const value = provider([
    event({
      event_id: "evt-follow",
      idempotency_key: "follow",
      occurred_at: "2026-07-31T15:00:00.000Z",
    }),
    event({
      event_id: "evt-message",
      event_type: "MESSAGE_SENT_CONFIRMED",
      idempotency_key: "message",
      occurred_at: "2026-07-31T05:30:00.000Z",
      recorded_at: "2026-07-31T05:31:00.000Z",
    }),
  ]);

  const slice = await value.port.readSlice(query());

  assert.deepEqual(slice.rows, [
    {
      dimensions: {
        evaluationDate: "2026-07-30",
        activityType: "CONTACT_ATTEMPTED",
      },
      measures: { activityCount: 1 },
    },
    {
      dimensions: {
        evaluationDate: "2026-07-31",
        activityType: "FOLLOW_UP_COMPLETED",
      },
      measures: { activityCount: 1 },
    },
  ]);
  assert.equal(
    slice.rows.some((row) => row.measures.activityCount === 0),
    false,
  );
});

test("groups source facts according to requested dimensions", async () => {
  const value = provider([
    event({
      event_id: "evt-message-1",
      event_type: "MESSAGE_SENT_CONFIRMED",
      idempotency_key: "message-1",
      occurred_at: "2026-07-30T15:00:00.000Z",
      recorded_at: "2026-07-30T15:01:00.000Z",
    }),
    event({
      event_id: "evt-message-2",
      event_type: "MESSAGE_SENT_CONFIRMED",
      idempotency_key: "message-2",
    }),
    event({
      event_id: "evt-call",
      event_type: "CALL_CONNECTED_CONFIRMED",
      idempotency_key: "call-1",
    }),
  ]);

  const byType = await value.port.readSlice(query({
    dimensions: ["activityType"],
  }));

  assert.deepEqual(byType.rows, [
    {
      dimensions: { activityType: "CONTACT_ATTEMPTED" },
      measures: { activityCount: 3 },
    },
    {
      dimensions: { activityType: "CONVERSATION_COMPLETED" },
      measures: { activityCount: 1 },
    },
  ]);

  const total = await value.port.readSlice(query({ dimensions: [] }));
  assert.deepEqual(total.rows, [
    {
      dimensions: {},
      measures: { activityCount: 4 },
    },
  ]);
});

test("returns an empty slice when authority exists but no reportable facts exist", async () => {
  const value = provider([
    event({ event_type: "QUOTE_PREPARED" }),
  ]);

  const slice = await value.port.readSlice(query());
  assert.deepEqual(slice.rows, []);
  assert.deepEqual(slice.exclusions, [
    {
      code: "EVENT_IS_TIMELINE_EVIDENCE_ONLY",
      count: 1,
    },
  ]);
});

test("preserves source exclusions and canonical provenance", async () => {
  const value = provider([
    event({
      event_id: "evt-a",
      idempotency_key: "same",
    }),
    event({
      event_id: "evt-b",
      idempotency_key: "same",
      recorded_at: "2026-07-31T15:02:00.000Z",
    }),
  ]);

  const slice = await value.port.readSlice(query());
  assert.deepEqual(slice.exclusions, [
    { code: "IDEMPOTENT_REPLAY", count: 1 },
  ]);
  assert.deepEqual(slice.provenance, [
    {
      sourceId: "fes-canonical-event-ledger",
      sourceVersion: "forge.activity_event.v1+FES-05B.1",
      authority: "FES_CANONICAL_ACTIVITY_EVENT",
    },
  ]);
});

test("rejects universal queries outside the bound advisor authority", async () => {
  const value = provider([]);

  await assert.rejects(
    value.port.readSlice(query({
      authority: {
        organizationId: "org-1",
        principalId: "advisor-2",
      },
    })),
    /query authority does not match/u,
  );
});

test("does not claim event truth, scoring, write, UI or persistence authority", () => {
  const value = provider([]);
  assert.equal(value.boundary.canonicalEventTruthAuthority, false);
  assert.equal(value.boundary.activityWriteAuthority, false);
  assert.equal(value.boundary.scoringAuthority, false);
  assert.equal(value.boundary.uiAuthority, false);
  assert.equal(value.boundary.persistenceMutationAuthority, false);
});
