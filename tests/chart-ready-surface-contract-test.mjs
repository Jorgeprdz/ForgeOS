import test from "node:test";
import assert from "node:assert/strict";

import {
  CHART_READY_REPORTING_CAPABILITIES,
  CHART_READY_SURFACE_SCHEMA_VERSION,
} from "../advisor-os/reporting/domain/chart-ready-reporting-contract.mjs";
import {
  ChartReadySurfaceContractError,
  createChartReadyReportingSurface,
} from "../advisor-os/reporting/application/chart-ready-surface-contract.mjs";

const report = Object.freeze({
  schemaVersion: "universal-report-model.v1",
  reportId: "universal-report:abc",
  dimensions: [{ dimensionId: "evaluationDate" }],
  measures: [{ measureId: "points" }],
  rows: [
    {
      rowKey: "universal-report-row:1",
      dimensions: { evaluationDate: "2026-07-01" },
      measures: { points: 10 },
    },
  ],
});

function input(overrides = {}) {
  return {
    report,
    temporalGrain: "DAY",
    compatibleVisualizations: ["LINE", "BAR", "TABLE"],
    recommendedVisualization: "LINE",
    missingDataState: "AVAILABLE",
    partialPeriodState: "COMPLETE",
    series: [
      {
        seriesId: "points.daily",
        seriesKind: "TIME_SERIES",
        measureId: "points",
        dimensionId: "evaluationDate",
        unit: "POINTS",
        points: [
          {
            pointId: "points.daily:2026-07-01",
            x: "2026-07-01",
            value: 10,
            rowKeys: ["universal-report-row:1"],
            provenance: [{ sourceId: "activity-ledger", evidenceCount: 1 }],
            drilldown: {
              reportId: "universal-report:abc",
              rowKeys: ["universal-report-row:1"],
              measureId: "points",
              dimensionId: "evaluationDate",
              period: { from: "2026-07-01", to: "2026-07-01" },
            },
          },
        ],
      },
    ],
    ...overrides,
  };
}

test("creates an immutable chart-ready surface", () => {
  const value = createChartReadyReportingSurface(input());
  assert.equal(value.schemaVersion, CHART_READY_SURFACE_SCHEMA_VERSION);
  assert.equal(value.recommendedVisualization, "LINE");
  assert.deepEqual(value.capabilities, CHART_READY_REPORTING_CAPABILITIES);
  assert.equal(value.series[0].points[0].drilldown.reportId, report.reportId);
  assert.equal(Object.isFrozen(value), true);
  assert.equal(Object.isFrozen(value.series[0].points[0]), true);
});

test("creates deterministic surface identity", () => {
  const first = createChartReadyReportingSurface(input());
  const second = createChartReadyReportingSurface(input());
  assert.equal(first.surfaceId, second.surfaceId);
});

test("rejects an incompatible recommendation", () => {
  assert.throws(
    () => createChartReadyReportingSurface(input({ recommendedVisualization: "FUNNEL" })),
    /must be compatible/u,
  );
});

test("rejects rows outside the source report", () => {
  const value = input();
  value.series[0].points[0].rowKeys = ["universal-report-row:missing"];
  assert.throws(() => createChartReadyReportingSurface(value), ChartReadySurfaceContractError);
});

test("rejects presentation ownership", () => {
  const value = input();
  value.series[0].points[0].provenance = [{ color: "red" }];
  assert.throws(() => createChartReadyReportingSurface(value), /prohibited boundary/u);
});

test("distinguishes no facts from unavailable authority", () => {
  const empty = createChartReadyReportingSurface(input({ series: [], missingDataState: "NO_MATCHING_FACTS" }));
  const unavailable = createChartReadyReportingSurface(input({ series: [], missingDataState: "AUTHORITY_UNAVAILABLE" }));
  assert.notEqual(empty.surfaceId, unavailable.surfaceId);
});

test("locks Forge and AI boundaries", () => {
  const value = createChartReadyReportingSurface(input());
  assert.equal(value.boundary.visualizationCompatibilityAuthority, true);
  assert.equal(value.boundary.reportCalculationAuthority, false);
  assert.equal(value.boundary.uiRenderingAuthority, false);
  assert.equal(value.boundary.aiDecisionAuthority, false);
});
