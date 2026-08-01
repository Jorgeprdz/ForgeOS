import test from "node:test";
import assert from "node:assert/strict";

import {
  FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION,
  FES_ACTIVITY_EVENT_READ_QUERY_SCHEMA_VERSION,
  FES_ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
  createFesActivityReportSourceAdapter,
} from "../advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.mjs";

function event(overrides = {}) {
  return {
    schema_version: "forge.activity_event.v1",
    event_id: overrides.event_id ?? "evt-1",
    event_type: overrides.event_type ?? "DUE_ACTION_COMPLETED",
    tenant_id: overrides.tenant_id ?? "org-1",
    actor: overrides.actor ?? { type: "ADVISOR", id: "advisor-1" },
    idempotency_key: overrides.idempotency_key ?? "idem-1",
    occurred_at: overrides.occurred_at ?? "2026-07-31T15:00:00.000Z",
    recorded_at: overrides.recorded_at ?? "2026-07-31T15:01:00.000Z",
    confirmation_state: overrides.confirmation_state ?? "CONFIRMED",
    correction_of: overrides.correction_of ?? null,
    payload: overrides.payload ?? {},
  };
}

function snapshot(events, overrides = {}) {
  return {
    schemaVersion: FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION,
    authority: overrides.authority ?? {
      organizationId: "org-1",
      advisorId: "advisor-1",
    },
    source: overrides.source ?? {
      sourceId: "fes-canonical-event-ledger",
      sourceVersion: "forge.activity_event.v1+FES-05B.1",
      authority: "FES_CANONICAL_ACTIVITY_EVENT",
    },
    events,
  };
}

function adapter(readEvents, options = {}) {
  return createFesActivityReportSourceAdapter({
    organizationId: "org-1",
    advisorId: "advisor-1",
    timeZone: "America/Mexico_City",
    readEvents,
    classifyAppointment: options.classifyAppointment,
  });
}

test("binds the event read query to one authority and snapshot", async () => {
  let captured;
  const value = adapter(async (query) => {
    captured = query;
    return snapshot([event()]);
  });

  const aggregation = await value.sourcePort.aggregatePeriod({
    evaluationDateFrom: "2026-07-31",
    evaluationDateTo: "2026-07-31",
    asOf: "2026-07-31T18:00:00.000Z",
  });

  assert.equal(captured.schemaVersion, FES_ACTIVITY_EVENT_READ_QUERY_SCHEMA_VERSION);
  assert.deepEqual(captured.authority, {
    organizationId: "org-1",
    advisorId: "advisor-1",
  });
  assert.equal(captured.includeCorrectionLineage, true);
  assert.equal(Object.isFrozen(captured), true);
  assert.equal(aggregation.schemaVersion, FES_ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION);
  assert.equal(aggregation.totalActivityCount, 1);
  assert.equal(aggregation.days[0].countsByType.FOLLOW_UP_COMPLETED, 1);
  assert.equal(aggregation.provenance.authority, "FES_CANONICAL_ACTIVITY_EVENT");
});

test("uses the bound timezone for evaluation dates", async () => {
  const value = adapter(async () => snapshot([
    event({
      occurred_at: "2026-07-31T05:30:00.000Z",
      recorded_at: "2026-07-31T05:31:00.000Z",
    }),
  ]));

  const aggregation = await value.sourcePort.aggregatePeriod({
    evaluationDateFrom: "2026-07-30",
    evaluationDateTo: "2026-07-30",
    asOf: "2026-07-31T06:00:00.000Z",
  });

  assert.equal(aggregation.days[0].evaluationDate, "2026-07-30");
  assert.equal(aggregation.period.timeZone, "America/Mexico_City");
});

test("aggregates extended contact and conversation facts without double counting", async () => {
  const value = adapter(async () => snapshot([
    event({
      event_id: "evt-message",
      event_type: "MESSAGE_SENT_CONFIRMED",
      idempotency_key: "message-1",
    }),
    event({
      event_id: "evt-call",
      event_type: "CALL_CONNECTED_CONFIRMED",
      idempotency_key: "call-1",
    }),
    event({
      event_id: "evt-call-replay",
      event_type: "CALL_CONNECTED_CONFIRMED",
      idempotency_key: "call-1",
      recorded_at: "2026-07-31T15:02:00.000Z",
    }),
  ]));

  const aggregation = await value.sourcePort.aggregatePeriod({
    evaluationDateFrom: "2026-07-31",
    evaluationDateTo: "2026-07-31",
    asOf: "2026-07-31T18:00:00.000Z",
  });

  assert.equal(aggregation.days[0].countsByType.CONTACT_ATTEMPTED, 2);
  assert.equal(aggregation.days[0].countsByType.CONVERSATION_COMPLETED, 1);
  assert.equal(aggregation.totalActivityCount, 3);
  assert.deepEqual(aggregation.exclusions, [
    { code: "IDEMPOTENT_REPLAY", count: 1 },
  ]);
});

test("suppresses corrected originals at the source boundary", async () => {
  const value = adapter(async () => snapshot([
    event({
      event_id: "evt-original",
      idempotency_key: "original",
    }),
    event({
      event_id: "evt-correction",
      idempotency_key: "correction",
      correction_of: "evt-original",
      recorded_at: "2026-07-31T15:02:00.000Z",
    }),
  ]));

  const aggregation = await value.sourcePort.aggregatePeriod({
    evaluationDateFrom: "2026-07-31",
    evaluationDateTo: "2026-07-31",
    asOf: "2026-07-31T18:00:00.000Z",
  });

  assert.equal(aggregation.totalActivityCount, 1);
  assert.deepEqual(aggregation.exclusions, [
    { code: "SUPERSEDED_BY_CORRECTION", count: 1 },
  ]);
});

test("keeps empty authority-backed periods empty rather than inventing zero rows", async () => {
  const value = adapter(async () => snapshot([
    event({
      event_type: "QUOTE_PREPARED",
    }),
  ]));

  const aggregation = await value.sourcePort.aggregatePeriod({
    evaluationDateFrom: "2026-07-31",
    evaluationDateTo: "2026-07-31",
    asOf: "2026-07-31T18:00:00.000Z",
  });

  assert.equal(aggregation.status, "EMPTY");
  assert.equal(aggregation.totalActivityCount, 0);
  assert.deepEqual(aggregation.days, []);
  assert.deepEqual(aggregation.exclusions, [
    { code: "EVENT_IS_TIMELINE_EVIDENCE_ONLY", count: 1 },
  ]);
});

test("excludes events recorded after the canonical asOf", async () => {
  const value = adapter(async () => snapshot([
    event({
      recorded_at: "2026-07-31T19:00:00.000Z",
    }),
  ]));

  const aggregation = await value.sourcePort.aggregatePeriod({
    evaluationDateFrom: "2026-07-31",
    evaluationDateTo: "2026-07-31",
    asOf: "2026-07-31T18:00:00.000Z",
  });

  assert.equal(aggregation.totalActivityCount, 0);
  assert.deepEqual(aggregation.exclusions, [
    { code: "RECORDED_AFTER_AS_OF", count: 1 },
  ]);
});

test("rejects snapshot and tenant authority drift", async () => {
  const snapshotDrift = adapter(async () => snapshot([], {
    authority: {
      organizationId: "org-2",
      advisorId: "advisor-1",
    },
  }));

  await assert.rejects(
    snapshotDrift.sourcePort.aggregatePeriod({
      evaluationDateFrom: "2026-07-31",
      evaluationDateTo: "2026-07-31",
      asOf: "2026-07-31T18:00:00.000Z",
    }),
    /authority snapshot drifted/u,
  );

  const tenantDrift = adapter(async () => snapshot([
    event({ tenant_id: "org-2" }),
  ]));

  await assert.rejects(
    tenantDrift.sourcePort.aggregatePeriod({
      evaluationDateFrom: "2026-07-31",
      evaluationDateTo: "2026-07-31",
      asOf: "2026-07-31T18:00:00.000Z",
    }),
    /crossed the bound tenant authority/u,
  );
});

test("does not claim event, scoring, write or persistence authority", () => {
  const value = adapter(async () => snapshot([]));
  assert.equal(value.boundary.canonicalEventReadAuthority, false);
  assert.equal(value.boundary.eventTruthAuthority, false);
  assert.equal(value.boundary.activityWriteAuthority, false);
  assert.equal(value.boundary.reportingAggregationAuthority, false);
  assert.equal(value.boundary.persistenceMutationAuthority, false);
  assert.equal(value.sourcePort.boundary.scoringAuthority, false);
});
