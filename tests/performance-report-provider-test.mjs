import test from "node:test";
import assert from "node:assert/strict";

import {
  PERFORMANCE_REPORT_PROVIDER_SCHEMA_VERSION,
  PERFORMANCE_REPORT_DEFINITION_ID,
  PERFORMANCE_REPORT_DEFINITION_VERSION,
  PerformanceReportProviderError,
  createPerformanceReportProvider,
} from "../advisor-os/performance/reporting/performance-report-provider.mjs";

function periodModel({
  from = "2026-07-27",
  to = "2026-07-28",
  asOf = "2026-07-28T18:00:00.000Z",
  series = [
    {
      evaluationDate: "2026-07-27",
      totalPoints: 5,
      targetPoints: 25,
      remainingPoints: 20,
      targetStatus: "BELOW_TARGET",
      eligibleActivityCount: 1,
    },
    {
      evaluationDate: "2026-07-28",
      totalPoints: 10,
      targetPoints: 25,
      remainingPoints: 15,
      targetStatus: "BELOW_TARGET",
      eligibleActivityCount: 2,
    },
  ],
} = {}) {
  return {
    schemaVersion:
      "performance-period-read-model.v1",
    sourceSchemaVersion:
      "performance-period-result.v1",
    period: {
      evaluationDateFrom: from,
      evaluationDateTo: to,
      asOf,
      dayCount: series.length,
    },
    series,
    exclusions: {
      futureRecorded: 2,
      suppressed: 1,
      total: 3,
    },
  };
}

function runtime({
  model = periodModel(),
  schemaVersion =
    "performance-read-runtime.v1",
  calls = [],
} = {}) {
  return {
    schemaVersion,
    maxDays: 31,
    async readPeriod(query) {
      calls.push(query);
      return model;
    },
  };
}

function query(overrides = {}) {
  return {
    schemaVersion:
      "report-provider-slice-query.v1",
    queryKey: "query-001",
    provider: {
      providerId: "performance",
      providerVersion:
        "performance-report-provider.v1",
      domain: "PERFORMANCE",
    },
    authority: {
      organizationId: "organization-001",
      principalId: "advisor-001",
    },
    period: {
      from: "2026-07-27",
      to: "2026-07-28",
      dayCount: 2,
      inclusive: true,
    },
    timeZone: "America/Mexico_City",
    asOf: "2026-07-28T18:00:00.000Z",
    dimensions: [
      "evaluationDate",
      "targetStatus",
    ],
    measures: [
      "totalPoints",
      "targetPoints",
      "remainingPoints",
      "eligibleActivityCount",
    ],
    metadata: {},
    ...overrides,
  };
}

test("exports provider schemas", () => {
  assert.equal(
    PERFORMANCE_REPORT_PROVIDER_SCHEMA_VERSION,
    "performance-report-provider.v1",
  );
  assert.equal(
    PERFORMANCE_REPORT_DEFINITION_ID,
    "performance-summary",
  );
  assert.equal(
    PERFORMANCE_REPORT_DEFINITION_VERSION,
    "performance-summary.v1",
  );
});

test("requires a supported read runtime", () => {
  assert.throws(
    () => createPerformanceReportProvider({ readRuntime: {} }),
    PerformanceReportProviderError,
  );
});

test("accepts canonical Performance read runtime", () => {
  assert.equal(
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).schemaVersion,
    "performance-report-provider.v1",
  );
});

test("accepts Supabase Performance composition", () => {
  assert.equal(
    createPerformanceReportProvider({
      readRuntime: runtime({
        schemaVersion:
          "performance-supabase-read-composition.v1",
      }),
    }).port.contract.descriptor.providerId,
    "performance",
  );
});

test("uses runtime maxDays by default", () => {
  assert.equal(
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.contract.slicePolicy.maxSliceDays,
    31,
  );
});

test("supports explicit maxSliceDays", () => {
  assert.equal(
    createPerformanceReportProvider({
      readRuntime: runtime(),
      maxSliceDays: 14,
    }).port.contract.slicePolicy.maxSliceDays,
    14,
  );
});

test("rejects invalid maxSliceDays", () => {
  assert.throws(
    () =>
      createPerformanceReportProvider({
        readRuntime: runtime(),
        maxSliceDays: 0,
      }),
    /positive integer/u,
  );
});

test("declares contiguous date batching", () => {
  assert.equal(
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.contract.slicePolicy.batchingMode,
    "CONTIGUOUS_DATE_RANGES",
  );
});

test("declares Performance domain authority", () => {
  const value = createPerformanceReportProvider({
    readRuntime: runtime(),
  });
  assert.equal(value.port.contract.descriptor.domain, "PERFORMANCE");
  assert.equal(value.port.contract.boundary.domainTruthAuthority, true);
});

test("does not claim scoring authority", () => {
  assert.equal(
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).boundary.performanceScoringAuthority,
    false,
  );
});

test("does not claim universal aggregation", () => {
  assert.equal(
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).boundary.universalAggregationAuthority,
    false,
  );
});

test("publishes canonical dimensions", () => {
  assert.deepEqual(
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).definition.dimensions,
    ["evaluationDate", "targetStatus"],
  );
});

test("publishes canonical measures", () => {
  assert.deepEqual(
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).definition.measures,
    [
      "totalPoints",
      "targetPoints",
      "remainingPoints",
      "eligibleActivityCount",
    ],
  );
});

test("uses SUM semantics for additive measures", () => {
  const capabilities =
    createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.contract.measures;

  assert.equal(
    capabilities.every(
      (measure) => measure.aggregation === "SUM",
    ),
    true,
  );
});

test("executes one Performance period read", async () => {
  const calls = [];
  await createPerformanceReportProvider({
    readRuntime: runtime({ calls }),
  }).port.readSlice(query());

  assert.equal(calls.length, 1);
});

test("forwards exact period boundaries", async () => {
  const calls = [];
  await createPerformanceReportProvider({
    readRuntime: runtime({ calls }),
  }).port.readSlice(query());

  assert.deepEqual(calls[0], {
    evaluationDateFrom: "2026-07-27",
    evaluationDateTo: "2026-07-28",
    asOf: "2026-07-28T18:00:00.000Z",
  });
});

test("maps one row per Performance day", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(query());

  assert.equal(value.rows.length, 2);
});

test("maps dimensions without presentation data", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(query());

  assert.deepEqual(value.rows[0].dimensions, {
    evaluationDate: "2026-07-27",
    targetStatus: "BELOW_TARGET",
  });
});

test("maps measures without recalculation", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(query());

  assert.deepEqual(value.rows[1].measures, {
    totalPoints: 10,
    targetPoints: 25,
    remainingPoints: 15,
    eligibleActivityCount: 2,
  });
});

test("respects selected dimensions", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(
      query({
        dimensions: ["evaluationDate"],
      }),
    );

  assert.deepEqual(value.rows[0].dimensions, {
    evaluationDate: "2026-07-27",
  });
});

test("respects selected measures", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(
      query({
        measures: ["totalPoints"],
      }),
    );

  assert.deepEqual(value.rows[0].measures, {
    totalPoints: 5,
  });
});

test("maps future-recorded exclusions", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(query());

  assert.deepEqual(value.exclusions[0], {
    code: "FUTURE_RECORDED",
    count: 2,
  });
});

test("maps suppressed exclusions", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(query());

  assert.deepEqual(value.exclusions[1], {
    code: "SUPPRESSED",
    count: 1,
  });
});

test("preserves Performance provenance", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime(),
    }).port.readSlice(query());

  assert.equal(
    value.provenance[0].authority,
    "PERFORMANCE_SCORING_POLICY",
  );
});

test("rejects unsupported period models", async () => {
  await assert.rejects(
    () =>
      createPerformanceReportProvider({
        readRuntime: runtime({
          model: {
            schemaVersion: "legacy.v1",
          },
        }),
      }).port.readSlice(query()),
    /unsupported period model/u,
  );
});

test("rejects coverage drift", async () => {
  await assert.rejects(
    () =>
      createPerformanceReportProvider({
        readRuntime: runtime({
          model: periodModel({
            from: "2026-07-26",
          }),
        }),
      }).port.readSlice(query()),
    /coverage/u,
  );
});

test("rejects asOf drift", async () => {
  await assert.rejects(
    () =>
      createPerformanceReportProvider({
        readRuntime: runtime({
          model: periodModel({
            asOf:
              "2026-07-28T19:00:00.000Z",
          }),
        }),
      }).port.readSlice(query()),
    /asOf/u,
  );
});

test("supports empty Performance periods", async () => {
  const value =
    await createPerformanceReportProvider({
      readRuntime: runtime({
        model: periodModel({
          series: [],
        }),
      }),
    }).port.readSlice(query());

  assert.deepEqual(value.rows, []);
});

test("definition selects the Performance provider", () => {
  const value = createPerformanceReportProvider({
    readRuntime: runtime(),
  });

  assert.equal(value.definition.providerId, "performance");
});

test("defaults to evaluationDate grouping", () => {
  const value = createPerformanceReportProvider({
    readRuntime: runtime(),
  });

  assert.deepEqual(
    value.definition.defaultDimensions,
    ["evaluationDate"],
  );
});

test("provider and definition are deeply immutable", () => {
  const value = createPerformanceReportProvider({
    readRuntime: runtime(),
  });

  assert.equal(Object.isFrozen(value), true);
  assert.equal(Object.isFrozen(value.definition), true);
  assert.equal(Object.isFrozen(value.port), true);
});

test("exposes no export, UI or persistence mutation methods", () => {
  const value = createPerformanceReportProvider({
    readRuntime: runtime(),
  });

  for (const name of [
    "export",
    "render",
    "persist",
    "append",
    "score",
    "rank",
  ]) {
    assert.equal(name in value, false);
  }
});

