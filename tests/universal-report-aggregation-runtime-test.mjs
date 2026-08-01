import test from "node:test";
import assert from "node:assert/strict";

import {
  UNIVERSAL_REPORT_EXECUTION_SCHEMA_VERSION,
  UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION,
  UNIVERSAL_REPORT_ROW_SCHEMA_VERSION,
} from "../advisor-os/reporting/domain/universal-report-model.mjs";

import {
  UNIVERSAL_REPORT_AGGREGATION_PLAN_SCHEMA_VERSION,
  UNIVERSAL_REPORT_AGGREGATION_RUNTIME_SCHEMA_VERSION,
  UNIVERSAL_REPORT_SLICE_DESCRIPTOR_SCHEMA_VERSION,
  UniversalReportAggregationError,
  createUniversalReportAggregationRuntime,
} from "../advisor-os/reporting/runtime/universal-report-aggregation-runtime.mjs";

import {
  createReportProviderPort,
} from "../advisor-os/reporting/application/report-provider-port.mjs";

import {
  createReportProviderRuntime,
} from "../advisor-os/reporting/runtime/report-provider-runtime.mjs";

import {
  createUniversalReportingKernel,
} from "../advisor-os/reporting/runtime/universal-reporting-kernel.mjs";

import {
  createUniversalPeriodResolver,
} from "../advisor-os/reporting/runtime/universal-period-resolver.mjs";

function baseProvider({
  maxSliceDays = 31,
  batchingMode =
    "CONTIGUOUS_DATE_RANGES",
  readSlice,
  dimensions = [
    {
      dimensionId:
        "activityType",
      valueKind:
        "STRING",
      nullable: false,
    },
    {
      dimensionId:
        "evaluationDate",
      valueKind:
        "DATE",
      nullable: false,
    },
  ],
  measures = [
    {
      measureId:
        "points",
      valueKind:
        "NUMBER",
      unit:
        "POINTS",
      aggregation:
        "SUM",
      nullable: false,
    },
    {
      measureId:
        "target",
      valueKind:
        "NUMBER",
      unit:
        "POINTS",
      aggregation:
        "SUM",
      nullable: false,
    },
  ],
} = {}) {
  return createReportProviderPort({
    descriptor: {
      providerId:
        "performance",
      providerVersion:
        "performance-report-provider.v1",
      domain:
        "PERFORMANCE",
      capabilities: [
        "POINTS",
        "TARGET",
      ],
    },
    dimensions,
    measures,
    maxSliceDays,
    batchingMode,
    readSlice:
      readSlice ??
      (async (query) => ({
        rows: [
          {
            dimensions:
              Object.fromEntries(
                query.dimensions.map(
                  (dimensionId) => [
                    dimensionId,
                    dimensionId ===
                      "evaluationDate"
                      ? query.period.to
                      : "POLICY_PAID",
                  ],
                ),
              ),
            measures:
              Object.fromEntries(
                query.measures.map(
                  (measureId) => [
                    measureId,
                    measureId ===
                      "points"
                      ? query.period.dayCount
                      : query.period.dayCount *
                        25,
                  ],
                ),
              ),
          },
        ],
        exclusions: [
          {
            code:
              "SUPPRESSED",
            count: 1,
          },
        ],
        provenance: [
          {
            sourceId:
              "performance-read-runtime",
            sourceVersion:
              "performance-read-runtime.v1",
            authority:
              "PERFORMANCE",
          },
        ],
      })),
  });
}

function baseDefinition({
  dimensions = [
    "activityType",
    "evaluationDate",
  ],
  measures = [
    "points",
    "target",
  ],
  defaultDimensions = [
    "activityType",
  ],
  defaultMeasures = [
    "points",
    "target",
  ],
} = {}) {
  return {
    definitionId:
      "performance-summary",
    definitionVersion:
      "performance-summary.v1",
    providerId:
      "performance",
    dimensions,
    measures,
    defaultDimensions,
    defaultMeasures,
  };
}

function providerRuntime({
  provider,
  definition,
} = {}) {
  return createReportProviderRuntime({
    providers: [
      provider ??
      baseProvider(),
    ],
    definitions: [
      definition ??
      baseDefinition(),
    ],
  });
}

function resolvedRequest({
  kind =
    "CUSTOM_RANGE",
  parameters = {
    from:
      "2026-07-01",
    to:
      "2026-07-28",
  },
  dimensions = [
    "activityType",
  ],
  measures = [
    "points",
  ],
  asOf =
    "2026-07-28T18:00:00.000Z",
} = {}) {
  const kernel =
    createUniversalReportingKernel({
      authority: {
        organizationId:
          "organization-001",
        principalId:
          "advisor-001",
      },
      providers: [
        {
          providerId:
            "performance",
          providerVersion:
            "performance-report-provider.v1",
          domain:
            "PERFORMANCE",
          capabilities: [
            "POINTS",
          ],
        },
      ],
      clock: () =>
        asOf,
    });
  const request =
    kernel.createRequest({
      definitionId:
        "performance-summary",
      providerId:
        "performance",
      period: {
        kind,
        parameters,
      },
      timeZone:
        "America/Mexico_City",
      asOf,
      dimensions,
      measures,
      metadata: {},
    });

  return createUniversalPeriodResolver()
    .resolveRequest(
      request,
    );
}

function aggregationRuntime(
  options = {},
) {
  return createUniversalReportAggregationRuntime({
    providerRuntime:
      options.providerRuntime ??
      providerRuntime(options),
  });
}

function metricSystem({
  aggregation,
  valueKind =
    "NUMBER",
  nullable = false,
  readSlice,
  maxSliceDays = 31,
} = {}) {
  return {
    runtime:
      aggregationRuntime({
        provider:
          baseProvider({
            maxSliceDays,
            dimensions: [
              {
                dimensionId:
                  "group",
                valueKind:
                  "STRING",
                nullable: false,
              },
            ],
            measures: [
              {
                measureId:
                  "metric",
                valueKind,
                unit:
                  valueKind ===
                    "NUMBER"
                    ? "COUNT"
                    : "CUSTOM",
                aggregation,
                nullable,
              },
            ],
            readSlice,
          }),
        definition:
          baseDefinition({
            dimensions: [
              "group",
            ],
            measures: [
              "metric",
            ],
            defaultDimensions: [
              "group",
            ],
            defaultMeasures: [
              "metric",
            ],
          }),
      }),
    request:
      resolvedRequest({
        dimensions: [
          "group",
        ],
        measures: [
          "metric",
        ],
      }),
  };
}

function rawMetricRows(
  values,
  {
    group = "A",
    exclusions = [],
    provenance,
  } = {},
) {
  return {
    rows:
      values.map(
        (value) => ({
          dimensions: {
            group,
          },
          measures: {
            metric:
              value,
          },
        }),
      ),
    exclusions,
    provenance:
      provenance ?? [
        {
          sourceId:
            "metric-source",
          sourceVersion:
            "metric-source.v1",
          authority:
            "PERFORMANCE",
        },
      ],
  };
}

test(
  "exports aggregation and report model schemas",
  () => {
    assert.equal(
      UNIVERSAL_REPORT_AGGREGATION_RUNTIME_SCHEMA_VERSION,
      "universal-report-aggregation-runtime.v1",
    );
    assert.equal(
      UNIVERSAL_REPORT_AGGREGATION_PLAN_SCHEMA_VERSION,
      "universal-report-aggregation-plan.v1",
    );
    assert.equal(
      UNIVERSAL_REPORT_SLICE_DESCRIPTOR_SCHEMA_VERSION,
      "universal-report-slice-descriptor.v1",
    );
    assert.equal(
      UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION,
      "universal-report-model.v1",
    );
    assert.equal(
      UNIVERSAL_REPORT_ROW_SCHEMA_VERSION,
      "universal-report-row.v1",
    );
    assert.equal(
      UNIVERSAL_REPORT_EXECUTION_SCHEMA_VERSION,
      "universal-report-execution.v1",
    );
  },
);

test(
  "requires a plain runtime input",
  () => {
    assert.throws(
      () =>
        createUniversalReportAggregationRuntime(),
      UniversalReportAggregationError,
    );
  },
);

test(
  "rejects an invalid provider runtime",
  () => {
    assert.throws(
      () =>
        createUniversalReportAggregationRuntime({
          providerRuntime: {},
        }),
      /does not satisfy REP-03/u,
    );
  },
);

test(
  "creates a direct plan for a 28 day range",
  () => {
    const value =
      aggregationRuntime()
        .createPlan(
          resolvedRequest(),
        );

    assert.equal(
      value.executionMode,
      "DIRECT",
    );
    assert.equal(
      value.sliceCount,
      1,
    );
  },
);

test(
  "keeps exactly 31 days in one slice",
  () => {
    const value =
      aggregationRuntime()
        .createPlan(
          resolvedRequest({
            parameters: {
              from:
                "2026-06-28",
              to:
                "2026-07-28",
            },
          }),
        );

    assert.equal(
      value.sliceCount,
      1,
    );
    assert.equal(
      value.slices[0]
        .dayCount,
      31,
    );
  },
);

test(
  "splits 32 days into two slices",
  () => {
    const value =
      aggregationRuntime()
        .createPlan(
          resolvedRequest({
            parameters: {
              from:
                "2026-06-27",
              to:
                "2026-07-28",
            },
          }),
        );

    assert.equal(
      value.sliceCount,
      2,
    );
    assert.deepEqual(
      value.slices.map(
        (item) =>
          item.dayCount,
      ),
      [
        31,
        1,
      ],
    );
  },
);

test(
  "splits YTD into seven contiguous slices",
  () => {
    const value =
      aggregationRuntime()
        .createPlan(
          resolvedRequest({
            kind:
              "YTD",
            parameters: {},
          }),
        );

    assert.equal(
      value.sliceCount,
      7,
    );
    assert.equal(
      value.slices[0].from,
      "2026-01-01",
    );
    assert.equal(
      value.slices.at(-1).to,
      "2026-07-28",
    );
  },
);

test(
  "creates contiguous slice boundaries",
  () => {
    const value =
      aggregationRuntime()
        .createPlan(
          resolvedRequest({
            kind:
              "YTD",
            parameters: {},
          }),
        );

    for (
      let index = 1;
      index < value.slices.length;
      index += 1
    ) {
      const previous =
        new Date(
          `${value.slices[index - 1].to}T00:00:00.000Z`,
        );
      previous.setUTCDate(
        previous.getUTCDate() + 1,
      );

      assert.equal(
        value.slices[index].from,
        previous
          .toISOString()
          .slice(0, 10),
      );
    }
  },
);

test(
  "splits a two-year range without losing leap day",
  () => {
    const value =
      aggregationRuntime()
        .createPlan(
          resolvedRequest({
            parameters: {
              from:
                "2024-01-01",
              to:
                "2025-12-31",
            },
            asOf:
              "2026-01-02T18:00:00.000Z",
          }),
        );

    assert.equal(
      value.period.dayCount,
      731,
    );
    assert.equal(
      value.sliceCount,
      24,
    );
    assert.equal(
      value.slices.reduce(
        (sum, item) =>
          sum + item.dayCount,
        0,
      ),
      731,
    );
  },
);

test(
  "creates deterministic aggregation plans",
  () => {
    const system =
      aggregationRuntime();
    const request =
      resolvedRequest({
        kind:
          "YTD",
        parameters: {},
      });

    assert.equal(
      system.createPlan(request)
        .planKey,
      system.createPlan(request)
        .planKey,
    );
  },
);

test(
  "executes a direct report with one provider call",
  async () => {
    const calls = [];
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            readSlice:
              async (query) => {
                calls.push(query);
                return {
                  rows: [
                    {
                      dimensions: {
                        activityType:
                          "POLICY_PAID",
                      },
                      measures: {
                        points: 10,
                      },
                    },
                  ],
                  exclusions: [],
                  provenance: [
                    {
                      sourceId:
                        "performance",
                      sourceVersion:
                        "performance.v1",
                      authority:
                        "PERFORMANCE",
                    },
                  ],
                };
              },
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.equal(
      calls.length,
      1,
    );
    assert.equal(
      report.execution.mode,
      "DIRECT",
    );
  },
);

test(
  "executes YTD through seven provider calls",
  async () => {
    const calls = [];
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            readSlice:
              async (query) => {
                calls.push(query);
                return {
                  rows: [
                    {
                      dimensions: {
                        activityType:
                          "POLICY_PAID",
                      },
                      measures: {
                        points:
                          query.period.dayCount,
                      },
                    },
                  ],
                  exclusions: [],
                  provenance: [
                    {
                      sourceId:
                        "performance",
                      sourceVersion:
                        "performance.v1",
                      authority:
                        "PERFORMANCE",
                    },
                  ],
                };
              },
          }),
      }).runReport(
        resolvedRequest({
          kind:
            "YTD",
          parameters: {},
        }),
      );

    assert.equal(
      calls.length,
      7,
    );
    assert.equal(
      report.execution.mode,
      "BATCHED",
    );
    assert.equal(
      report.execution.sliceCount,
      7,
    );
  },
);

test(
  "uses one asOf across all YTD slices",
  async () => {
    const snapshots = [];
    await aggregationRuntime({
      provider:
        baseProvider({
          readSlice:
            async (query) => {
              snapshots.push(
                query.asOf,
              );
              return {
                rows: [],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              };
            },
        }),
    }).runReport(
      resolvedRequest({
        kind:
          "YTD",
        parameters: {},
      }),
    );

    assert.deepEqual(
      [...new Set(snapshots)],
      [
        "2026-07-28T18:00:00.000Z",
      ],
    );
  },
);

test(
  "aggregates SUM rows by dimensions",
  async () => {
    let call = 0;
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            maxSliceDays: 14,
            readSlice:
              async () => {
                call += 1;
                return {
                  rows: [
                    {
                      dimensions: {
                        activityType:
                          "POLICY_PAID",
                      },
                      measures: {
                        points:
                          call,
                      },
                    },
                  ],
                  exclusions: [],
                  provenance: [
                    {
                      sourceId:
                        "performance",
                      sourceVersion:
                        "performance.v1",
                      authority:
                        "PERFORMANCE",
                    },
                  ],
                };
              },
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.equal(
      report.rows.length,
      1,
    );
    assert.equal(
      report.rows[0]
        .measures
        .points,
      3,
    );
  },
);

test(
  "calculates universal totals from all raw rows",
  async () => {
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {
                      activityType:
                        "POLICY_PAID",
                    },
                    measures: {
                      points: 10,
                    },
                  },
                  {
                    dimensions: {
                      activityType:
                        "APPLICATION_SUBMITTED",
                    },
                    measures: {
                      points: 5,
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.equal(
      report.totals.points,
      15,
    );
  },
);

test(
  "aggregates all values into one row when dimensions are empty",
  async () => {
    const report =
      await aggregationRuntime({
        definition:
          baseDefinition({
            defaultDimensions: [],
          }),
        provider:
          baseProvider({
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {},
                    measures: {
                      points: 10,
                    },
                  },
                  {
                    dimensions: {},
                    measures: {
                      points: 5,
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          }),
      }).runReport(
        resolvedRequest({
          dimensions: [],
        }),
      );

    assert.equal(
      report.rows.length,
      1,
    );
    assert.equal(
      report.rows[0]
        .measures
        .points,
      15,
    );
  },
);

test(
  "aggregates AVERAGE measures",
  async () => {
    const system =
      metricSystem({
        aggregation:
          "AVERAGE",
        readSlice:
          async () =>
            rawMetricRows([
              10,
              20,
              30,
            ]),
      });
    const report =
      await system.runtime
        .runReport(
          system.request,
        );

    assert.equal(
      report.rows[0]
        .measures.metric,
      20,
    );
    assert.equal(
      report.totals.metric,
      20,
    );
  },
);

test(
  "aggregates MIN measures",
  async () => {
    const system =
      metricSystem({
        aggregation: "MIN",
        readSlice:
          async () =>
            rawMetricRows([
              8,
              3,
              11,
            ]),
      });
    const report =
      await system.runtime
        .runReport(
          system.request,
        );

    assert.equal(
      report.totals.metric,
      3,
    );
  },
);

test(
  "aggregates MAX measures",
  async () => {
    const system =
      metricSystem({
        aggregation: "MAX",
        readSlice:
          async () =>
            rawMetricRows([
              8,
              3,
              11,
            ]),
      });
    const report =
      await system.runtime
        .runReport(
          system.request,
        );

    assert.equal(
      report.totals.metric,
      11,
    );
  },
);

test(
  "aggregates FIRST measures in deterministic read order",
  async () => {
    const system =
      metricSystem({
        aggregation:
          "FIRST",
        readSlice:
          async () =>
            rawMetricRows([
              8,
              3,
              11,
            ]),
      });
    const report =
      await system.runtime
        .runReport(
          system.request,
        );

    assert.equal(
      report.totals.metric,
      8,
    );
  },
);

test(
  "aggregates LAST measures in deterministic read order",
  async () => {
    const system =
      metricSystem({
        aggregation:
          "LAST",
        readSlice:
          async () =>
            rawMetricRows([
              8,
              3,
              11,
            ]),
      });
    const report =
      await system.runtime
        .runReport(
          system.request,
        );

    assert.equal(
      report.totals.metric,
      11,
    );
  },
);

test(
  "accepts equal NONE values",
  async () => {
    const system =
      metricSystem({
        aggregation: "NONE",
        readSlice:
          async () =>
            rawMetricRows([
              25,
              25,
            ]),
      });
    const report =
      await system.runtime
        .runReport(
          system.request,
        );

    assert.equal(
      report.totals.metric,
      25,
    );
  },
);

test(
  "rejects conflicting NONE values",
  async () => {
    const system =
      metricSystem({
        aggregation: "NONE",
        readSlice:
          async () =>
            rawMetricRows([
              25,
              30,
            ]),
      });

    await assert.rejects(
      () =>
        system.runtime
          .runReport(
            system.request,
          ),
      /conflicting NONE values/u,
    );
  },
);

test(
  "ignores nullable values during AVERAGE",
  async () => {
    const system =
      metricSystem({
        aggregation:
          "AVERAGE",
        nullable: true,
        readSlice:
          async () =>
            rawMetricRows([
              10,
              null,
              20,
            ]),
      });
    const report =
      await system.runtime
        .runReport(
          system.request,
        );

    assert.equal(
      report.totals.metric,
      15,
    );
  },
);

test(
  "returns EMPTY for no provider rows",
  async () => {
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            readSlice:
              async () => ({
                rows: [],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.equal(
      report.state,
      "EMPTY",
    );
    assert.equal(
      report.totals.points,
      null,
    );
  },
);

test(
  "returns READY when aggregated rows exist",
  async () => {
    const report =
      await aggregationRuntime()
        .runReport(
          resolvedRequest(),
        );

    assert.equal(
      report.state,
      "READY",
    );
  },
);

test(
  "consolidates exclusions across slices",
  async () => {
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            maxSliceDays: 14,
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.deepEqual(
      report.exclusions,
      [
        {
          code:
            "SUPPRESSED",
          count: 2,
        },
      ],
    );
  },
);

test(
  "sorts consolidated exclusions by code",
  async () => {
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            readSlice:
              async () => ({
                rows: [],
                exclusions: [
                  {
                    code: "ZETA",
                    count: 1,
                  },
                  {
                    code: "ALPHA",
                    count: 2,
                  },
                ],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.deepEqual(
      report.exclusions.map(
        (item) =>
          item.code,
      ),
      [
        "ALPHA",
        "ZETA",
      ],
    );
  },
);

test(
  "deduplicates equal provenance across slices",
  async () => {
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            maxSliceDays: 14,
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.equal(
      report.provenance.length,
      1,
    );
  },
);

test(
  "preserves distinct provenance",
  async () => {
    const report =
      await aggregationRuntime({
        provider:
          baseProvider({
            readSlice:
              async () => ({
                rows: [],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "source-b",
                    sourceVersion:
                      "source.v1",
                    authority:
                      "PERFORMANCE",
                  },
                  {
                    sourceId:
                      "source-a",
                    sourceVersion:
                      "source.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          }),
      }).runReport(
        resolvedRequest(),
      );

    assert.deepEqual(
      report.provenance.map(
        (item) =>
          item.sourceId,
      ),
      [
        "source-a",
        "source-b",
      ],
    );
  },
);

test(
  "creates deterministic report ids",
  async () => {
    const system =
      aggregationRuntime();
    const request =
      resolvedRequest();
    const first =
      await system.runReport(
        request,
      );
    const second =
      await system.runReport(
        request,
      );

    assert.equal(
      first.reportId,
      second.reportId,
    );
  },
);

test(
  "changes report id when provider facts change",
  async () => {
    let points = 1;
    const system =
      aggregationRuntime({
        provider:
          baseProvider({
            readSlice:
              async () => ({
                rows: [
                  {
                    dimensions: {
                      activityType:
                        "POLICY_PAID",
                    },
                    measures: {
                      points:
                        points++,
                    },
                  },
                ],
                exclusions: [],
                provenance: [
                  {
                    sourceId:
                      "performance",
                    sourceVersion:
                      "performance.v1",
                    authority:
                      "PERFORMANCE",
                  },
                ],
              }),
          }),
      });
    const request =
      resolvedRequest();
    const first =
      await system.runReport(
        request,
      );
    const second =
      await system.runReport(
        request,
      );

    assert.notEqual(
      first.reportId,
      second.reportId,
    );
  },
);

test(
  "includes provider capabilities in universal model",
  async () => {
    const report =
      await aggregationRuntime()
        .runReport(
          resolvedRequest(),
        );

    assert.equal(
      report.measures[0]
        .aggregation,
      "SUM",
    );
    assert.equal(
      report.dimensions[0]
        .dimensionId,
      "activityType",
    );
  },
);

test(
  "records direct execution metadata",
  async () => {
    const report =
      await aggregationRuntime()
        .runReport(
          resolvedRequest(),
        );

    assert.equal(
      report.execution
        .schemaVersion,
      "universal-report-execution.v1",
    );
    assert.equal(
      report.execution.sliceCount,
      1,
    );
    assert.equal(
      report.execution.sliceKeys.length,
      1,
    );
  },
);

test(
  "records batched execution descriptors",
  async () => {
    const report =
      await aggregationRuntime()
        .runReport(
          resolvedRequest({
            kind:
              "YTD",
            parameters: {},
          }),
        );

    assert.equal(
      report.execution.mode,
      "BATCHED",
    );
    assert.equal(
      report.execution.descriptors.length,
      7,
    );
  },
);

test(
  "propagates provider failures",
  async () => {
    const failure =
      new Error("offline");

    await assert.rejects(
      () =>
        aggregationRuntime({
          provider:
            baseProvider({
              readSlice:
                async () => {
                  throw failure;
                },
            }),
        }).runReport(
          resolvedRequest(),
        ),
      failure,
    );
  },
);

test(
  "rejects a provider slice with a mismatched period",
  async () => {
    const base =
      providerRuntime();
    const tampered = {
      schemaVersion:
        base.schemaVersion,
      createPlan:
        base.createPlan.bind(base),
      getProvider:
        base.getProvider.bind(base),
      getDefinition:
        base.getDefinition.bind(base),
      async readSlice(request) {
        const slice =
          await base.readSlice(
            request,
          );

        return {
          ...slice,
          period: {
            ...slice.period,
            to:
              "2026-07-27",
          },
        };
      },
    };

    await assert.rejects(
      () =>
        aggregationRuntime({
          providerRuntime:
            tampered,
        }).runReport(
          resolvedRequest(),
        ),
      /period does not match/u,
    );
  },
);

test(
  "rejects numeric aggregation over string values",
  async () => {
    const system =
      metricSystem({
        aggregation: "SUM",
        valueKind:
          "STRING",
        readSlice:
          async () =>
            rawMetricRows([
              "ten",
            ]),
      });

    await assert.rejects(
      () =>
        system.runtime
          .runReport(
            system.request,
          ),
      /requires numeric values/u,
    );
  },
);

test(
  "returns deeply immutable reports",
  async () => {
    const report =
      await aggregationRuntime()
        .runReport(
          resolvedRequest(),
        );

    assert.equal(
      Object.isFrozen(report),
      true,
    );
    assert.equal(
      Object.isFrozen(
        report.rows,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        report.execution,
      ),
      true,
    );
  },
);

test(
  "does not mutate the resolved request",
  async () => {
    const request =
      resolvedRequest({
        kind:
          "YTD",
        parameters: {},
      });
    const before =
      JSON.stringify(request);

    await aggregationRuntime()
      .runReport(request);

    assert.equal(
      JSON.stringify(request),
      before,
    );
  },
);

test(
  "owns aggregation but not comparisons, exports or UI",
  () => {
    const value =
      aggregationRuntime();

    assert.equal(
      value.boundary
        .reportingAggregationAuthority,
      true,
    );
    assert.equal(
      value.boundary
        .comparisonAuthority,
      false,
    );

    for (const name of [
      "compare",
      "export",
      "render",
      "persist",
      "resolvePeriod",
    ]) {
      assert.equal(
        name in value,
        false,
      );
    }
  },
);
