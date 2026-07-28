import test from "node:test";
import assert from "node:assert/strict";

import {
  PERFORMANCE_DAILY_SURFACE_SCHEMA_VERSION,
  PERFORMANCE_PERIOD_SURFACE_SCHEMA_VERSION,
  PERFORMANCE_DASHBOARD_SURFACE_SCHEMA_VERSION,
  PERFORMANCE_SURFACE_ADAPTER_CAPABILITIES,
  PERFORMANCE_SURFACE_ADAPTER_SCHEMA_VERSION,
  PerformanceSurfaceAdapterError,
  createPerformanceSurfaceAdapter,
} from "../advisor-os/performance/application/performance-surface-adapter.mjs";

function dailyModel({
  identity = {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
  },
  policy = {
    schemaVersion:
      "performance-scoring-policy.v1",
    policyId:
      "smnyl-advisor-daily-25.v1",
    periodKind:
      "DAILY",
  },
  evaluationDate =
    "2026-07-28",
  asOf =
    "2026-07-28T18:00:00.000Z",
  totalPoints = 10,
  targetPoints = 25,
  targetStatus =
    "BELOW_TARGET",
  items = [
    {
      activityType:
        "POLICY_PAID",
      count: 1,
      pointsPerActivity: 10,
      awardedPoints: 10,
      counted: true,
      shareOfPointsPercent: 100,
    },
  ],
  empty = false,
  eligibleActivityCount = 1,
  countedActivityCount = 1,
  zeroPointActivityCount = 0,
  exclusions = {
    futureRecorded: 0,
    suppressed: 0,
    total: 0,
  },
} = {}) {
  return {
    schemaVersion:
      "performance-daily-read-model.v1",
    sourceSchemaVersion:
      "performance-score-projection.v1",
    policy,
    identity,
    period: {
      evaluationDate,
      asOf,
    },
    headline: {
      totalPoints,
      targetPoints,
      remainingPoints:
        Math.max(
          0,
          targetPoints - totalPoints,
        ),
      excessPoints:
        Math.max(
          0,
          totalPoints - targetPoints,
        ),
      progressPercent:
        Math.min(
          100,
          Number(
            (
              totalPoints /
              targetPoints *
              100
            ).toFixed(2),
          ),
        ),
      uncappedProgressPercent:
        Number(
          (
            totalPoints /
            targetPoints *
            100
          ).toFixed(2),
        ),
      progressRatio:
        Math.min(
          1,
          totalPoints /
            targetPoints,
        ),
      targetStatus,
    },
    activity: {
      empty,
      eligibleActivityCount,
      countedActivityCount,
      zeroPointActivityCount,
      items,
    },
    exclusions,
    authority: {
      activityEligibilityAuthority: true,
      activityScoringAuthority: false,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  };
}

function periodModel({
  identity = {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
  },
  policy = {
    schemaVersion:
      "performance-scoring-policy.v1",
    policyId:
      "smnyl-advisor-daily-25.v1",
    dailyTargetPoints: 25,
  },
  evaluationDateFrom =
    "2026-07-27",
  evaluationDateTo =
    "2026-07-28",
  asOf =
    "2026-07-28T18:00:00.000Z",
  totalPoints = 15,
  targetPoints = 50,
  empty = false,
  items = [
    {
      activityType:
        "POLICY_PAID",
      count: 1,
      pointsPerActivity: 10,
      awardedPoints: 10,
      counted: true,
      shareOfPointsPercent:
        66.67,
    },
    {
      activityType:
        "APPLICATION_SUBMITTED",
      count: 1,
      pointsPerActivity: 5,
      awardedPoints: 5,
      counted: true,
      shareOfPointsPercent:
        33.33,
    },
  ],
  exclusions = {
    futureRecorded: 0,
    suppressed: 0,
    total: 0,
  },
} = {}) {
  return {
    schemaVersion:
      "performance-period-read-model.v1",
    sourceSchemaVersion:
      "performance-period-result.v1",
    policy,
    identity,
    period: {
      evaluationDateFrom,
      evaluationDateTo,
      asOf,
      dayCount: 2,
    },
    headline: {
      totalPoints,
      targetPoints,
      remainingPoints:
        Math.max(
          0,
          targetPoints - totalPoints,
        ),
      excessPoints:
        Math.max(
          0,
          totalPoints - targetPoints,
        ),
      progressPercent:
        Math.min(
          100,
          Number(
            (
              totalPoints /
              targetPoints *
              100
            ).toFixed(2),
          ),
        ),
      uncappedProgressPercent:
        Number(
          (
            totalPoints /
            targetPoints *
            100
          ).toFixed(2),
        ),
      progressRatio:
        Math.min(
          1,
          totalPoints /
            targetPoints,
        ),
      targetStatus:
        "PERIOD_BELOW_TARGET",
      averagePointsPerDay:
        totalPoints / 2,
    },
    dayStatus: {
      targetMetDays: 0,
      targetExceededDays: 0,
      belowTargetDays: 2,
      successfulDays: 0,
    },
    series: [
      {
        evaluationDate:
          "2026-07-27",
        totalPoints: 5,
        targetPoints: 25,
        remainingPoints: 20,
        progressPercent: 20,
        targetStatus:
          "BELOW_TARGET",
        eligibleActivityCount: 1,
      },
      {
        evaluationDate:
          "2026-07-28",
        totalPoints: 10,
        targetPoints: 25,
        remainingPoints: 15,
        progressPercent: 40,
        targetStatus:
          "BELOW_TARGET",
        eligibleActivityCount: 1,
      },
    ],
    activity: {
      empty,
      eligibleActivityCount: 2,
      items,
    },
    exclusions,
    authority: {
      activityEligibilityAuthority: true,
      activityScoringAuthority: false,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  };
}

function readRuntime({
  schemaVersion =
    "performance-read-runtime.v1",
  daily =
    dailyModel(),
  period =
    periodModel(),
  capabilities = [
    "PERFORMANCE_DAILY_READ_MODEL",
    "PERFORMANCE_PERIOD_READ_MODEL",
  ],
  calls = [],
  readDay,
  readPeriod,
} = {}) {
  return {
    schemaVersion,
    authority: {
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
    },
    policy: {
      schemaVersion:
        "performance-scoring-policy.v1",
      policyId:
        "smnyl-advisor-daily-25.v1",
      dailyTargetPoints: 25,
    },
    maxDays: 31,
    capabilities,
    async readDay(query) {
      calls.push({
        operation: "readDay",
        query: {
          ...query,
        },
      });

      if (readDay) {
        return readDay(query);
      }

      return daily;
    },
    async readPeriod(query) {
      calls.push({
        operation: "readPeriod",
        query: {
          ...query,
        },
      });

      if (readPeriod) {
        return readPeriod(query);
      }

      return period;
    },
  };
}

function adapter(options = {}) {
  return createPerformanceSurfaceAdapter({
    readRuntime:
      options.runtime ??
      readRuntime(options),
  });
}

test(
  "exports surface schemas and capabilities",
  () => {
    assert.equal(
      PERFORMANCE_SURFACE_ADAPTER_SCHEMA_VERSION,
      "performance-surface-adapter.v1",
    );
    assert.equal(
      PERFORMANCE_DAILY_SURFACE_SCHEMA_VERSION,
      "performance-daily-surface.v1",
    );
    assert.equal(
      PERFORMANCE_PERIOD_SURFACE_SCHEMA_VERSION,
      "performance-period-surface.v1",
    );
    assert.equal(
      PERFORMANCE_DASHBOARD_SURFACE_SCHEMA_VERSION,
      "performance-dashboard-surface.v1",
    );
    assert.deepEqual(
      PERFORMANCE_SURFACE_ADAPTER_CAPABILITIES,
      [
        "PERFORMANCE_DAILY_SURFACE",
        "PERFORMANCE_PERIOD_SURFACE",
        "PERFORMANCE_DASHBOARD_SURFACE",
      ],
    );
  },
);

test(
  "requires a plain adapter input",
  () => {
    assert.throws(
      () =>
        createPerformanceSurfaceAdapter(),
      PerformanceSurfaceAdapterError,
    );
  },
);

test(
  "rejects unsupported runtime schemas",
  () => {
    assert.throws(
      () =>
        adapter({
          runtime:
            readRuntime({
              schemaVersion:
                "legacy-runtime.v1",
            }),
        }),
      /schemaVersion is not supported/u,
    );
  },
);

test(
  "accepts the Supabase composition schema",
  () => {
    const value =
      adapter({
        runtime:
          readRuntime({
            schemaVersion:
              "performance-supabase-read-composition.v1",
          }),
      });

    assert.equal(
      value.sourceRuntimeSchemaVersion,
      "performance-supabase-read-composition.v1",
    );
  },
);

test(
  "rejects runtimes without read capabilities",
  () => {
    assert.throws(
      () =>
        adapter({
          runtime:
            readRuntime({
              capabilities: [],
            }),
        }),
      /lacks read model capabilities/u,
    );
  },
);

test(
  "binds identity and policy once",
  () => {
    const value = adapter();

    assert.deepEqual(
      value.identity,
      {
        organizationId:
          "organization-001",
        advisorId:
          "advisor-001",
      },
    );
    assert.equal(
      value.policy.policyId,
      "smnyl-advisor-daily-25.v1",
    );
  },
);

test(
  "loads an empty daily surface",
  async () => {
    const value =
      await adapter({
        daily:
          dailyModel({
            totalPoints: 0,
            items: [],
            empty: true,
            eligibleActivityCount: 0,
            countedActivityCount: 0,
          }),
      }).loadDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.equal(
      value.state,
      "EMPTY",
    );
    assert.equal(
      value.activity.rows.length,
      0,
    );
  },
);

test(
  "loads a ready daily surface",
  async () => {
    const value =
      await adapter().loadDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.equal(
      value.schemaVersion,
      "performance-daily-surface.v1",
    );
    assert.equal(
      value.state,
      "READY",
    );
    assert.equal(
      value.headline.totalPoints,
      10,
    );
    assert.deepEqual(
      value.activity.rows[0],
      {
        key:
          "POLICY_PAID",
        activityType:
          "POLICY_PAID",
        count: 1,
        pointsPerActivity: 10,
        awardedPoints: 10,
        shareOfPointsPercent: 100,
        counted: true,
      },
    );
  },
);

test(
  "creates a deterministic daily request key",
  async () => {
    const value = adapter();
    const first =
      await value.loadDay({
        evaluationDate:
          "2026-07-28",
      });
    const second =
      await value.loadDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.equal(
      first.request.key,
      second.request.key,
    );
  },
);

test(
  "loads period chart series",
  async () => {
    const value =
      await adapter().loadPeriod({
        evaluationDateFrom:
          "2026-07-27",
        evaluationDateTo:
          "2026-07-28",
      });

    assert.equal(
      value.schemaVersion,
      "performance-period-surface.v1",
    );
    assert.deepEqual(
      value.series.map(
        (item) =>
          item.key,
      ),
      [
        "2026-07-27",
        "2026-07-28",
      ],
    );
  },
);

test(
  "loads period activity rows",
  async () => {
    const value =
      await adapter().loadPeriod({
        evaluationDateFrom:
          "2026-07-27",
        evaluationDateTo:
          "2026-07-28",
      });

    assert.deepEqual(
      value.activity.rows.map(
        (item) =>
          item.activityType,
      ),
      [
        "POLICY_PAID",
        "APPLICATION_SUBMITTED",
      ],
    );
  },
);

test(
  "loads dashboard with one explicit snapshot",
  async () => {
    const calls = [];
    const value =
      await adapter({
        calls,
      }).loadDashboard({
        evaluationDate:
          "2026-07-28",
        evaluationDateFrom:
          "2026-07-27",
        evaluationDateTo:
          "2026-07-28",
        asOf:
          "2026-07-28T12:30:00-06:00",
      });

    assert.equal(
      value.request.asOf,
      "2026-07-28T18:30:00.000Z",
    );
    assert.deepEqual(
      calls.map(
        (call) =>
          call.query.asOf,
      ),
      [
        "2026-07-28T18:30:00.000Z",
        "2026-07-28T18:30:00.000Z",
      ],
    );
  },
);

test(
  "dashboard exposes semantic presentation boundary",
  async () => {
    const value =
      await adapter().loadDashboard({
        evaluationDate:
          "2026-07-28",
        evaluationDateFrom:
          "2026-07-27",
        evaluationDateTo:
          "2026-07-28",
        asOf:
          "2026-07-28T18:00:00.000Z",
      });

    assert.deepEqual(
      value.presentationBoundary,
      {
        labelsOwnedByUi: true,
        colorsOwnedByUi: true,
        iconsOwnedByUi: true,
        componentsOwnedByUi: true,
        navigationOwnedByUi: true,
      },
    );
  },
);

test(
  "dashboard rejects identity drift",
  async () => {
    await assert.rejects(
      () =>
        adapter({
          period:
            periodModel({
              identity: {
                organizationId:
                  "organization-002",
                advisorId:
                  "advisor-001",
              },
            }),
        }).loadDashboard({
          evaluationDate:
            "2026-07-28",
          evaluationDateFrom:
            "2026-07-27",
          evaluationDateTo:
            "2026-07-28",
          asOf:
            "2026-07-28T18:00:00.000Z",
        }),
      /different identity/u,
    );
  },
);

test(
  "dashboard rejects policy drift",
  async () => {
    await assert.rejects(
      () =>
        adapter({
          period:
            periodModel({
              policy: {
                schemaVersion:
                  "performance-scoring-policy.v1",
                policyId:
                  "different-policy.v1",
                dailyTargetPoints: 25,
              },
            }),
        }).loadDashboard({
          evaluationDate:
            "2026-07-28",
          evaluationDateFrom:
            "2026-07-27",
          evaluationDateTo:
            "2026-07-28",
          asOf:
            "2026-07-28T18:00:00.000Z",
        }),
      /different policy/u,
    );
  },
);

test(
  "dashboard requires explicit asOf",
  async () => {
    await assert.rejects(
      () =>
        adapter().loadDashboard({
          evaluationDate:
            "2026-07-28",
          evaluationDateFrom:
            "2026-07-27",
          evaluationDateTo:
            "2026-07-28",
        }),
      /asOf must be a non-empty string/u,
    );
  },
);

test(
  "rejects presentation-owned source keys",
  async () => {
    await assert.rejects(
      () =>
        adapter({
          daily: {
            ...dailyModel(),
            title:
              "Performance",
          },
        }).loadDay({
          evaluationDate:
            "2026-07-28",
        }),
      /presentation-owned/u,
    );
  },
);

test(
  "preserves exclusions",
  async () => {
    const value =
      await adapter({
        daily:
          dailyModel({
            exclusions: {
              futureRecorded: 2,
              suppressed: 3,
              total: 5,
            },
          }),
      }).loadDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.deepEqual(
      value.exclusions,
      {
        futureRecorded: 2,
        suppressed: 3,
        total: 5,
      },
    );
  },
);

test(
  "surface payloads are deeply immutable",
  async () => {
    const value =
      await adapter().loadDashboard({
        evaluationDate:
          "2026-07-28",
        evaluationDateFrom:
          "2026-07-27",
        evaluationDateTo:
          "2026-07-28",
        asOf:
          "2026-07-28T18:00:00.000Z",
      });

    assert.equal(
      Object.isFrozen(value),
      true,
    );
    assert.equal(
      Object.isFrozen(value.day),
      true,
    );
    assert.equal(
      Object.isFrozen(
        value.period.series,
      ),
      true,
    );
  },
);

test(
  "propagates runtime read failures",
  async () => {
    const failure =
      new Error("offline");

    await assert.rejects(
      () =>
        adapter({
          readDay: async () => {
            throw failure;
          },
        }).loadDay({
          evaluationDate:
            "2026-07-28",
        }),
      failure,
    );
  },
);
