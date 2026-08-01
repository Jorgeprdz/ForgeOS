import test from "node:test";
import assert from "node:assert/strict";

import {
  createFesActivityReportSourceAdapter,
  FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION,
} from "../advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.mjs";

import {
  createActivityReportingRuntime,
  ACTIVITY_REPORTING_RUNTIME_SCHEMA_VERSION,
} from "../advisor-os/reporting/runtime/activity-reporting-runtime.mjs";

import {
  ACTIVITY_CHART_READY_PROJECTION_SCHEMA_VERSION,
  ActivityChartReadyProjectionError,
  projectActivityReportToChartReady,
} from "../advisor-os/reporting/application/activity-chart-ready-projection.mjs";

function event({
  eventId,
  eventType,
  occurredAt,
  recordedAt = occurredAt,
  idempotencyKey = eventId,
  confirmationState = "CONFIRMED",
  correctionOf = null,
} = {}) {
  return {
    schema_version: "forge.activity_event.v1",
    event_id: eventId,
    event_type: eventType,
    tenant_id: "org-1",
    idempotency_key: idempotencyKey,
    occurred_at: occurredAt,
    recorded_at: recordedAt,
    confirmation_state: confirmationState,
    correction_of: correctionOf,
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
      sourceVersion: "FES-05B.1",
      authority: "FES_CANONICAL_ACTIVITY_EVENT",
    },
    events,
  };
}

function fixtureEvents() {
  return [
    event({
      eventId: "evt-follow-up",
      eventType: "DUE_ACTION_COMPLETED",
      occurredAt: "2026-07-10T16:00:00.000Z",
    }),
    event({
      eventId: "evt-message",
      eventType: "MESSAGE_SENT_CONFIRMED",
      occurredAt: "2026-07-10T17:00:00.000Z",
    }),
    event({
      eventId: "evt-call",
      eventType: "CALL_CONNECTED_CONFIRMED",
      occurredAt: "2026-07-11T02:30:00.000Z",
    }),
  ];
}

function runtime({ events = fixtureEvents(), onRead } = {}) {
  const adapter = createFesActivityReportSourceAdapter({
    organizationId: "org-1",
    advisorId: "advisor-1",
    timeZone: "America/Mexico_City",
    async readEvents(query) {
      onRead?.(query);
      return snapshot(events);
    },
  });

  return createActivityReportingRuntime({
    sourcePort: adapter.sourcePort,
    clock: () => new Date("2026-07-31T23:00:00.000Z"),
  });
}

function customRequest(overrides = {}) {
  return {
    period: {
      kind: "CUSTOM_RANGE",
      parameters: {
        from: "2026-07-10",
        to: "2026-07-11",
      },
    },
    timeZone: "America/Mexico_City",
    asOf: "2026-07-31T23:00:00.000Z",
    ...overrides,
  };
}

test("composes one governed Activity universal runtime", () => {
  const value = runtime();

  assert.equal(value.schemaVersion, ACTIVITY_REPORTING_RUNTIME_SCHEMA_VERSION);
  assert.equal(value.registry.providerId, "activity");
  assert.equal(value.registry.definitionId, "activity-by-date-and-type");
  assert.equal(value.authority.organizationId, "org-1");
  assert.equal(value.authority.principalId, "advisor-1");
  assert.equal(value.boundary.activityReadAuthority, true);
  assert.equal(value.boundary.activityWriteAuthority, false);
  assert.equal(value.boundary.aiDecisionAuthority, false);
  assert.equal(value.boundary.uiRenderingAuthority, false);
});

test("runs canonical events through the universal report model", async () => {
  const report = await runtime().runReport({
    ...customRequest(),
    dimensions: ["evaluationDate", "activityType"],
    measures: ["activityCount"],
  });

  assert.equal(report.state, "READY");
  assert.equal(report.provider.providerId, "activity");
  assert.equal(report.definition.definitionId, "activity-by-date-and-type");
  assert.equal(report.totals.activityCount, 4);
  assert.equal(report.rows.length, 3);
  assert.equal(report.boundary.reportingAggregationAuthority, true);
  assert.equal(report.boundary.domainTruthAuthority, false);
});

test("creates chart-ready series with point-to-row traceability", async () => {
  const result = await runtime().runChartReady(customRequest());
  const surface = result.chartReady;
  const reportRowKeys = new Set(result.report.rows.map((row) => row.rowKey));

  assert.equal(surface.schemaVersion, "chart-ready-reporting-surface.v1");
  assert.equal(surface.temporalGrain, "DAY");
  assert.equal(surface.recommendedVisualization, "STACKED_BAR");
  assert.deepEqual(surface.compatibleVisualizations, [
    "BAR",
    "LINE",
    "STACKED_BAR",
    "TABLE",
  ]);
  assert.equal(surface.missingDataState, "AVAILABLE");
  assert.equal(surface.series.length, 3);

  for (const series of surface.series) {
    for (const point of series.points) {
      assert.equal(point.drilldown.reportId, result.report.reportId);
      assert.equal(point.drilldown.measureId, "activityCount");
      assert.equal(point.drilldown.dimensionId, "evaluationDate");
      assert.ok(point.rowKeys.every((rowKey) => reportRowKeys.has(rowKey)));
      assert.deepEqual(point.drilldown.rowKeys, point.rowKeys);
    }
  }

  const contactSeries = surface.series.find(
    (series) => series.seriesId === "activity-series:CONTACT_ATTEMPTED",
  );
  assert.deepEqual(
    contactSeries.points.map((point) => [point.x, point.value]),
    [
      ["2026-07-10", 2],
    ],
  );
});

test("marks current to-date reports as partial", async () => {
  const result = await runtime().runChartReady({
    period: {
      kind: "MONTH_TO_DATE",
      parameters: {
        referenceDate: "2026-07-15",
      },
    },
    timeZone: "America/Mexico_City",
    asOf: "2026-07-15T23:00:00.000Z",
  });

  assert.equal(result.report.period.isPartial, true);
  assert.equal(result.chartReady.partialPeriodState, "PARTIAL_CURRENT_PERIOD");
});

test("keeps an empty authority-backed report empty without zero points", async () => {
  const result = await runtime({ events: [] }).runChartReady(customRequest());

  assert.equal(result.report.state, "EMPTY");
  assert.equal(result.report.rows.length, 0);
  assert.equal(result.report.totals.activityCount, null);
  assert.equal(result.chartReady.missingDataState, "NO_MATCHING_FACTS");
  assert.equal(result.chartReady.series.length, 0);
});

test("uses the universal batching runtime for ranges longer than 31 days", async () => {
  const reads = [];
  const value = runtime({
    onRead: (query) => reads.push(query),
  });

  const report = await value.runReport({
    period: {
      kind: "CUSTOM_RANGE",
      parameters: {
        from: "2026-06-30",
        to: "2026-07-31",
      },
    },
    timeZone: "America/Mexico_City",
    asOf: "2026-07-31T23:00:00.000Z",
    dimensions: ["evaluationDate", "activityType"],
    measures: ["activityCount"],
  });

  assert.equal(report.execution.mode, "BATCHED");
  assert.equal(report.execution.sliceCount, 2);
  assert.equal(reads.length, 2);
  assert.equal(reads[0].asOf, reads[1].asOf);
});

test("creates deterministic report and surface identities", async () => {
  const value = runtime();
  const first = await value.runChartReady(customRequest());
  const second = await value.runChartReady(customRequest());

  assert.equal(first.report.reportId, second.report.reportId);
  assert.equal(first.chartReady.surfaceId, second.chartReady.surfaceId);
});

test("rejects chart projection from a report without full chart dimensions", async () => {
  const report = await runtime().runReport({
    ...customRequest(),
    dimensions: ["activityType"],
    measures: ["activityCount"],
  });

  assert.throws(
    () => projectActivityReportToChartReady(report),
    ActivityChartReadyProjectionError,
  );
});

test("locks runtime and projection boundaries", async () => {
  const value = runtime();
  const result = await value.runChartReady(customRequest());

  assert.equal(result.boundary.reportCalculatedByUniversalRuntime, true);
  assert.equal(result.boundary.chartCalculatedMeasures, false);
  assert.equal(result.boundary.uiRenderingAuthority, false);
  assert.equal(result.boundary.aiDecisionAuthority, false);
  assert.equal(result.chartReady.boundary.reportCalculationAuthority, false);
  assert.equal(result.chartReady.boundary.visualizationCompatibilityAuthority, true);
  assert.equal(result.chartReady.boundary.presentationStylingAuthority, false);
  assert.equal(result.chartReady.boundary.aiDecisionAuthority, false);
  assert.equal(
    ACTIVITY_CHART_READY_PROJECTION_SCHEMA_VERSION,
    "activity-chart-ready-projection.v1",
  );
});
