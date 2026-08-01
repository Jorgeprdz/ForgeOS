import test from "node:test";
import assert from "node:assert/strict";

import {
  REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION,
  REPORT_COMPARISON_KIND_ALIASES,
  REPORT_COMPARISON_KINDS,
  ReportComparisonDefinitionError,
  createReportComparisonDefinition,
} from "../advisor-os/reporting/domain/report-comparison-definition.mjs";

import {
  REPORT_BASELINE_REFERENCE_SCHEMA_VERSION,
  REPORT_COMPARISON_ENGINE_SCHEMA_VERSION,
  REPORT_COMPARISON_PLAN_SCHEMA_VERSION,
  REPORT_COMPARISON_RESULT_SCHEMA_VERSION,
  REPORT_MEASURE_COMPARISON_SCHEMA_VERSION,
  REPORT_ROW_COMPARISON_SCHEMA_VERSION,
  ReportComparisonEngineError,
  createReportComparisonEngine,
} from "../advisor-os/reporting/runtime/report-comparison-engine.mjs";

import {
  createUniversalPeriodResolver,
} from "../advisor-os/reporting/runtime/universal-period-resolver.mjs";

function definition(
  overrides = {},
) {
  return {
    comparisonId:
      "performance-yoy",
    comparisonVersion:
      "performance-yoy.v1",
    kind:
      "YEAR_OVER_YEAR",
    measures: [
      "points",
      "target",
    ],
    ...overrides,
  };
}

function measure(
  measureId,
  overrides = {},
) {
  return {
    schemaVersion:
      "report-measure-capability.v1",
    measureId,
    valueKind:
      "NUMBER",
    unit:
      "POINTS",
    aggregation:
      "SUM",
    nullable: false,
    ...overrides,
  };
}

function row(
  evaluationDate,
  points,
  target,
) {
  return {
    schemaVersion:
      "universal-report-row.v1",
    rowKey:
      `row-${evaluationDate}`,
    dimensions: {
      evaluationDate,
    },
    measures: {
      points,
      target,
    },
  };
}

function report({
  reportId =
    "current-report",
  providerId =
    "performance",
  providerVersion =
    "performance-report-provider.v1",
  definitionId =
    "performance-summary",
  definitionVersion =
    "performance-summary.v1",
  from =
    "2026-01-01",
  to =
    "2026-07-28",
  dayCount = 209,
  rows = [
    row(
      "2026-07-28",
      10,
      25,
    ),
  ],
  totals = {
    points: 100,
    target: 200,
  },
  measures = [
    measure("points"),
    measure("target"),
  ],
  state =
    "READY",
} = {}) {
  return {
    schemaVersion:
      "universal-report-model.v1",
    sourceResolvedRequestKey:
      `resolved-${reportId}`,
    definition: {
      definitionId,
      definitionVersion,
    },
    provider: {
      providerId,
      providerVersion,
      domain:
        "PERFORMANCE",
    },
    authority: {
      organizationId:
        "organization-001",
      principalId:
        "advisor-001",
    },
    period: {
      schemaVersion:
        "resolved-report-period.v1",
      kind:
        "YEAR_TO_DATE",
      family:
        "TO_DATE",
      from,
      to,
      naturalTo:
        "2026-12-31",
      asOf:
        "2026-07-28T18:00:00.000Z",
      localAsOfDate:
        "2026-07-28",
      timeZone:
        "America/Mexico_City",
      dayCount,
      inclusive: true,
      isPartial: true,
      parameters: {},
      policy: {
        schemaVersion:
          "reporting-calendar-policy.v1",
      },
      periodKey:
        `period-${reportId}`,
      resolutionStatus:
        "RESOLVED",
    },
    timeZone:
      "America/Mexico_City",
    asOf:
      "2026-07-28T18:00:00.000Z",
    dimensions: [
      {
        schemaVersion:
          "report-dimension-capability.v1",
        dimensionId:
          "evaluationDate",
        valueKind:
          "DATE",
        nullable: false,
      },
    ],
    measures,
    rows,
    totals,
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
    execution: {
      schemaVersion:
        "universal-report-execution.v1",
      mode:
        "BATCHED",
      sliceCount: 7,
      maxSliceDays: 31,
      planKey:
        "plan-current",
      sliceKeys: [],
      descriptors: [],
    },
    reportId,
    state,
    comparison: null,
    boundary: {
      reportingAggregationAuthority:
        true,
      domainTruthAuthority:
        false,
      periodResolutionAuthority:
        false,
      comparisonAuthority:
        false,
      exportAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  };
}

function aggregationRuntime({
  baselineReport =
    report({
      reportId:
        "baseline-report",
      from:
        "2025-01-01",
      to:
        "2025-07-28",
      dayCount: 209,
      totals: {
        points: 80,
        target: 200,
      },
      rows: [
        row(
          "2026-07-28",
          8,
          25,
        ),
      ],
    }),
  failure,
  calls = [],
} = {}) {
  return {
    schemaVersion:
      "universal-report-aggregation-runtime.v1",
    async runReport(
      resolvedRequest,
    ) {
      calls.push(
        resolvedRequest,
      );

      if (failure) {
        throw failure;
      }

      return baselineReport;
    },
  };
}

function engine(
  options = {},
) {
  return createReportComparisonEngine({
    aggregationRuntime:
      options.aggregationRuntime ??
      aggregationRuntime(options),
    periodResolver:
      createUniversalPeriodResolver(),
  });
}

test(
  "exports comparison schemas, kinds and aliases",
  () => {
    assert.equal(
      REPORT_COMPARISON_DEFINITION_SCHEMA_VERSION,
      "report-comparison-definition.v1",
    );
    assert.equal(
      REPORT_COMPARISON_ENGINE_SCHEMA_VERSION,
      "report-comparison-engine.v1",
    );
    assert.equal(
      REPORT_COMPARISON_PLAN_SCHEMA_VERSION,
      "report-comparison-plan.v1",
    );
    assert.equal(
      REPORT_COMPARISON_RESULT_SCHEMA_VERSION,
      "report-comparison-result.v1",
    );
    assert.equal(
      REPORT_MEASURE_COMPARISON_SCHEMA_VERSION,
      "report-measure-comparison.v1",
    );
    assert.equal(
      REPORT_ROW_COMPARISON_SCHEMA_VERSION,
      "report-row-comparison.v1",
    );
    assert.equal(
      REPORT_BASELINE_REFERENCE_SCHEMA_VERSION,
      "report-baseline-reference.v1",
    );
    assert.equal(
      REPORT_COMPARISON_KIND_ALIASES
        .YEAR_OVER_YEAR,
      "PREVIOUS_YEAR_SAME_PERIOD",
    );
    assert.ok(
      REPORT_COMPARISON_KINDS.includes(
        "CUSTOM_BASELINE",
      ),
    );
  },
);

test(
  "requires a plain comparison definition",
  () => {
    assert.throws(
      () =>
        createReportComparisonDefinition(),
      ReportComparisonDefinitionError,
    );
  },
);

test(
  "requires at least one comparison measure",
  () => {
    assert.throws(
      () =>
        createReportComparisonDefinition(
          definition({
            measures: [],
          }),
        ),
      /non-empty array/u,
    );
  },
);

test(
  "normalizes YEAR_OVER_YEAR",
  () => {
    const value =
      createReportComparisonDefinition(
        definition(),
      );

    assert.equal(
      value.inputKind,
      "YEAR_OVER_YEAR",
    );
    assert.equal(
      value.kind,
      "PREVIOUS_YEAR_SAME_PERIOD",
    );
    assert.equal(
      value.baselineMode,
      "REPORT_EXECUTION",
    );
  },
);

test(
  "normalizes PERIOD_OVER_PERIOD",
  () => {
    const value =
      createReportComparisonDefinition(
        definition({
          kind:
            "PERIOD_OVER_PERIOD",
        }),
      );

    assert.equal(
      value.kind,
      "PREVIOUS_PERIOD",
    );
  },
);

test(
  "marks target and budget as static values",
  () => {
    assert.equal(
      createReportComparisonDefinition(
        definition({
          kind:
            "TARGET",
        }),
      ).baselineMode,
      "STATIC_VALUES",
    );
    assert.equal(
      createReportComparisonDefinition(
        definition({
          kind:
            "BUDGET",
        }),
      ).baselineMode,
      "STATIC_VALUES",
    );
  },
);

test(
  "marks custom baseline as an external report",
  () => {
    assert.equal(
      createReportComparisonDefinition(
        definition({
          kind:
            "CUSTOM_BASELINE",
        }),
      ).baselineMode,
      "EXTERNAL_REPORT",
    );
  },
);

test(
  "rejects unsupported comparison kinds",
  () => {
    assert.throws(
      () =>
        createReportComparisonDefinition(
          definition({
            kind:
              "RANKING",
          }),
        ),
      /not supported/u,
    );
  },
);

test(
  "requires REP-04 aggregation runtime",
  () => {
    assert.throws(
      () =>
        createReportComparisonEngine({
          aggregationRuntime: {},
          periodResolver:
            createUniversalPeriodResolver(),
        }),
      /REP-04/u,
    );
  },
);

test(
  "requires REP-02 period resolver",
  () => {
    assert.throws(
      () =>
        createReportComparisonEngine({
          aggregationRuntime:
            aggregationRuntime(),
          periodResolver: {},
        }),
      /REP-02/u,
    );
  },
);

test(
  "creates previous-year plan with shifted calendar dates",
  () => {
    const value =
      engine().createPlan({
        currentReport:
          report(),
        definition:
          definition(),
      });

    assert.equal(
      value.baseline.period.from,
      "2025-01-01",
    );
    assert.equal(
      value.baseline.period.to,
      "2025-07-28",
    );
    assert.equal(
      value.baseline.rule,
      "SAME_CALENDAR_DATES_PREVIOUS_YEAR",
    );
  },
);

test(
  "creates previous-period plan with the same day count",
  () => {
    const value =
      engine().createPlan({
        currentReport:
          report({
            from:
              "2026-07-01",
            to:
              "2026-07-28",
            dayCount: 28,
          }),
        definition:
          definition({
            kind:
              "PREVIOUS_PERIOD",
          }),
      });

    assert.equal(
      value.baseline.period.from,
      "2026-06-03",
    );
    assert.equal(
      value.baseline.period.to,
      "2026-06-30",
    );
    assert.equal(
      value.baseline.period.dayCount,
      28,
    );
  },
);

test(
  "clamps leap day in previous-year period",
  () => {
    const value =
      engine().createPlan({
        currentReport:
          report({
            from:
              "2024-02-29",
            to:
              "2024-03-01",
            dayCount: 2,
          }),
        definition:
          definition(),
      });

    assert.equal(
      value.baseline.period.from,
      "2023-02-28",
    );
    assert.equal(
      value.baseline.period.to,
      "2023-03-01",
    );
  },
);

test(
  "preserves current asOf for report baseline execution",
  () => {
    const value =
      engine().createPlan({
        currentReport:
          report(),
        definition:
          definition(),
      });

    assert.equal(
      value.baseline
        .resolvedRequest
        .asOf,
      "2026-07-28T18:00:00.000Z",
    );
  },
);

test(
  "rejects explicit baseline for a derived period comparison",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report(),
          definition:
            definition(),
          baseline: {
            values: {
              points: 80,
              target: 200,
            },
          },
        }),
      /does not accept/u,
    );
  },
);

test(
  "creates a target baseline plan",
  () => {
    const value =
      engine().createPlan({
        currentReport:
          report(),
        definition:
          definition({
            kind:
              "TARGET",
          }),
        baseline: {
          values: {
            points: 120,
            target: 200,
          },
        },
      });

    assert.equal(
      value.baseline.mode,
      "STATIC_VALUES",
    );
    assert.deepEqual(
      value.baseline.values,
      {
        points: 120,
        target: 200,
      },
    );
  },
);

test(
  "rejects missing static baseline measures",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "BUDGET",
            }),
          baseline: {
            values: {
              points: 120,
            },
          },
        }),
      /missing measure target/u,
    );
  },
);

test(
  "rejects unknown static baseline measures",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "TARGET",
            }),
          baseline: {
            values: {
              points: 120,
              target: 200,
              commission: 500,
            },
          },
        }),
      /unknown field commission/u,
    );
  },
);

test(
  "rejects non-numeric static baseline values",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "TARGET",
            }),
          baseline: {
            values: {
              points:
                "120",
              target: 200,
            },
          },
        }),
      /finite number/u,
    );
  },
);

test(
  "creates a custom baseline report plan",
  () => {
    const baselineReport =
      report({
        reportId:
          "custom-baseline",
      });
    const value =
      engine().createPlan({
        currentReport:
          report(),
        definition:
          definition({
            kind:
              "CUSTOM_BASELINE",
          }),
        baseline: {
          report:
            baselineReport,
        },
      });

    assert.equal(
      value.baseline.mode,
      "EXTERNAL_REPORT",
    );
    assert.equal(
      value.baseline.report.reportId,
      "custom-baseline",
    );
  },
);

test(
  "rejects custom baseline provider drift",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "CUSTOM_BASELINE",
          }),
          baseline: {
            report:
              report({
                providerId:
                  "commissions",
              }),
          },
        }),
      /provider does not match/u,
    );
  },
);

test(
  "rejects custom baseline definition drift",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "CUSTOM_BASELINE",
          }),
          baseline: {
            report:
              report({
                definitionId:
                  "another-report",
              }),
          },
        }),
      /definition does not match/u,
    );
  },
);

test(
  "rejects comparison measures absent from current report",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report(),
          definition:
            definition({
              measures: [
                "commission",
              ],
            }),
        }),
      /not present/u,
    );
  },
);

test(
  "rejects non-numeric report measures",
  () => {
    assert.throws(
      () =>
        engine().createPlan({
          currentReport:
            report({
              measures: [
                measure(
                  "points",
                  {
                    valueKind:
                      "STRING",
                  },
                ),
                measure(
                  "target",
                ),
              ],
          }),
          definition:
            definition(),
        }),
      /must be numeric/u,
    );
  },
);

test(
  "executes previous-year baseline through aggregation runtime",
  async () => {
    const calls = [];
    await engine({
      calls,
    }).runComparison({
      currentReport:
        report(),
      definition:
        definition(),
    });

    assert.equal(
      calls.length,
      1,
    );
    assert.equal(
      calls[0].period.from,
      "2025-01-01",
    );
  },
);

test(
  "compares report totals",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition(),
        });

    assert.equal(
      value.totals.points.current,
      100,
    );
    assert.equal(
      value.totals.points.baseline,
      80,
    );
    assert.equal(
      value.totals.points.delta,
      20,
    );
    assert.equal(
      value.totals.points.deltaPercent,
      25,
    );
    assert.equal(
      value.totals.points.ratio,
      1.25,
    );
    assert.equal(
      value.totals.points.direction,
      "UP",
    );
  },
);

test(
  "reports unchanged totals",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "TARGET",
            }),
          baseline: {
            values: {
              points: 100,
              target: 200,
            },
          },
        });

    assert.equal(
      value.totals.points.direction,
      "UNCHANGED",
    );
    assert.equal(
      value.totals.points.delta,
      0,
    );
  },
);

test(
  "reports downward movement",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "BUDGET",
            }),
          baseline: {
            values: {
              points: 120,
              target: 200,
            },
          },
        });

    assert.equal(
      value.totals.points.direction,
      "DOWN",
    );
    assert.equal(
      value.totals.points.delta,
      -20,
    );
  },
);

test(
  "uses null percent and ratio for a zero baseline",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "TARGET",
            }),
          baseline: {
            values: {
              points: 0,
              target: 0,
            },
          },
        });

    assert.equal(
      value.totals.points.status,
      "ZERO_BASELINE",
    );
    assert.equal(
      value.totals.points.deltaPercent,
      null,
    );
    assert.equal(
      value.totals.points.ratio,
      null,
    );
  },
);

test(
  "compares rows by dimensions rather than row keys",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report({
              rows: [
                {
                  ...row(
                    "2026-07-28",
                    10,
                    25,
                  ),
                  rowKey:
                    "current-row-key",
                },
              ],
          }),
          definition:
            definition(),
        });

    assert.equal(
      value.rows.length,
      1,
    );
    assert.equal(
      value.rows[0]
        .measures
        .points
        .delta,
      2,
    );
  },
);

test(
  "includes rows present only in current report",
  async () => {
    const value =
      await engine({
        baselineReport:
          report({
            reportId:
              "baseline",
            rows: [],
            totals: {
              points: 0,
              target: 0,
            },
          }),
      }).runComparison({
        currentReport:
          report(),
        definition:
          definition(),
      });

    assert.equal(
      value.rows.length,
      1,
    );
    assert.equal(
      value.rows[0]
        .measures
        .points
        .status,
      "UNAVAILABLE",
    );
  },
);

test(
  "static target comparison contains no row comparisons",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "TARGET",
            }),
          baseline: {
            values: {
              points: 120,
              target: 200,
            },
          },
        });

    assert.deepEqual(
      value.rows,
      [],
    );
  },
);

test(
  "does not infer favorability",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition(),
        });

    assert.equal(
      value.favorability,
      null,
    );
    assert.equal(
      value.boundary
        .rankingAuthority,
      false,
    );
    assert.equal(
      value.boundary
        .humanWorthAuthority,
      false,
    );
  },
);

test(
  "preserves baseline report reference",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition(),
        });

    assert.equal(
      value.baseline.reportId,
      "baseline-report",
    );
    assert.equal(
      value.provenance
        .baselineReportId,
      "baseline-report",
    );
  },
);

test(
  "preserves static baseline values",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report(),
          definition:
            definition({
              kind:
                "TARGET",
            }),
          baseline: {
            values: {
              points: 120,
              target: 200,
            },
          },
        });

    assert.deepEqual(
      value.baseline.values,
      {
        points: 120,
        target: 200,
      },
    );
  },
);

test(
  "creates deterministic plan and result ids",
  async () => {
    const system =
      engine();
    const input = {
      currentReport:
        report(),
      definition:
        definition(),
    };
    const firstPlan =
      system.createPlan(input);
    const secondPlan =
      system.createPlan(input);
    const first =
      await system
        .runComparison(input);
    const second =
      await system
        .runComparison(input);

    assert.equal(
      firstPlan.planKey,
      secondPlan.planKey,
    );
    assert.equal(
      first.comparisonResultId,
      second.comparisonResultId,
    );
  },
);

test(
  "propagates aggregation failures",
  async () => {
    const failure =
      new Error("offline");

    await assert.rejects(
      () =>
        engine({
          failure,
        }).runComparison({
          currentReport:
            report(),
          definition:
            definition(),
        }),
      failure,
    );
  },
);

test(
  "returns deeply immutable plans and results",
  async () => {
    const system =
      engine();
    const input = {
      currentReport:
        report(),
      definition:
        definition(),
    };
    const plan =
      system.createPlan(input);
    const result =
      await system
        .runComparison(input);

    assert.equal(
      Object.isFrozen(plan),
      true,
    );
    assert.equal(
      Object.isFrozen(
        plan.baseline,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(result),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.totals,
      ),
      true,
    );
  },
);

test(
  "marks empty current reports without inventing meaning",
  async () => {
    const value =
      await engine()
        .runComparison({
          currentReport:
            report({
              state:
                "EMPTY",
              rows: [],
              totals: {
                points: 0,
                target: 0,
              },
          }),
          definition:
            definition({
              kind:
                "TARGET",
            }),
          baseline: {
            values: {
              points: 0,
              target: 0,
            },
          },
        });

    assert.equal(
      value.state,
      "EMPTY_CURRENT",
    );
  },
);

test(
  "exposes comparison only, not aggregation, export or UI",
  () => {
    const value =
      engine();

    assert.equal(
      value.boundary
        .comparisonAuthority,
      true,
    );

    for (const name of [
      "aggregate",
      "runReport",
      "export",
      "render",
      "persist",
      "rank",
      "scoreHuman",
    ]) {
      assert.equal(
        name in value,
        false,
      );
    }
  },
);
