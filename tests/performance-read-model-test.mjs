import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_TYPES,
} from "../advisor-os/activity/domain/activity-record.mjs";

import {
  PERFORMANCE_DAILY_READ_MODEL_SCHEMA_VERSION,
  PERFORMANCE_PERIOD_READ_MODEL_SCHEMA_VERSION,
  PerformanceReadModelError,
  projectPerformanceDailyReadModel,
  projectPerformancePeriodReadModel,
} from "../advisor-os/performance/application/performance-read-model-projector.mjs";

import {
  PERFORMANCE_READ_RUNTIME_CAPABILITIES,
  PERFORMANCE_READ_RUNTIME_SCHEMA_VERSION,
  PerformanceReadRuntimeError,
  createPerformanceReadRuntime,
} from "../advisor-os/performance/runtime/performance-read-runtime.mjs";

function createBreakdown(values = {}) {
  return ACTIVITY_TYPES.map(
    (activityType) => {
      const value =
        values[activityType] ??
        {
          count: 0,
          pointsPerActivity: 0,
        };

      return {
        activityType,
        count: value.count,
        pointsPerActivity:
          value.pointsPerActivity,
        awardedPoints:
          value.count *
          value.pointsPerActivity,
        counted:
          value.pointsPerActivity > 0,
      };
    },
  );
}

function daily({
  date = "2026-07-28",
  totalPoints = 25,
  targetPoints = 25,
  targetStatus = "TARGET_MET",
  values = {
    POLICY_PAID: {
      count: 2,
      pointsPerActivity: 10,
    },
    APPLICATION_SUBMITTED: {
      count: 1,
      pointsPerActivity: 5,
    },
  },
  futureRecorded = 0,
  suppressed = 0,
} = {}) {
  const breakdown =
    createBreakdown(values);

  return {
    schemaVersion:
      "performance-score-projection.v1",
    policy: {
      schemaVersion:
        "performance-scoring-policy.v1",
      policyId:
        "smnyl-advisor-daily-25.v1",
      periodKind: "DAILY",
    },
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    period: {
      evaluationDate: date,
      asOf:
        "2026-07-28T18:00:00.000Z",
    },
    totalPoints,
    targetPoints,
    remainingPoints:
      Math.max(
        0,
        targetPoints - totalPoints,
      ),
    targetStatus,
    eligibleActivityCount:
      breakdown.reduce(
        (sum, item) =>
          sum + item.count,
        0,
      ),
    excludedActivityCount: {
      futureRecorded,
      suppressed,
    },
    breakdown,
    authority: {
      activityScoringAuthority: false,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  };
}

function period({
  days = [
    daily({
      date: "2026-07-27",
      totalPoints: 10,
      targetStatus:
        "BELOW_TARGET",
      values: {
        POLICY_PAID: {
          count: 1,
          pointsPerActivity: 10,
        },
      },
      futureRecorded: 1,
    }),
    daily({
      date: "2026-07-28",
      totalPoints: 40,
      targetStatus:
        "TARGET_EXCEEDED",
      values: {
        POLICY_PAID: {
          count: 4,
          pointsPerActivity: 10,
        },
      },
      suppressed: 2,
    }),
  ],
} = {}) {
  const totalPoints =
    days.reduce(
      (sum, day) =>
        sum + day.totalPoints,
      0,
    );
  const targetPoints =
    days.reduce(
      (sum, day) =>
        sum + day.targetPoints,
      0,
    );
  const targetMetDays =
    days.filter(
      (day) =>
        day.targetStatus ===
        "TARGET_MET",
    ).length;
  const targetExceededDays =
    days.filter(
      (day) =>
        day.targetStatus ===
        "TARGET_EXCEEDED",
    ).length;
  const belowTargetDays =
    days.filter(
      (day) =>
        day.targetStatus ===
        "BELOW_TARGET",
    ).length;

  return {
    schemaVersion:
      "performance-period-result.v1",
    runtimeSchemaVersion:
      "performance-period-runtime.v1",
    policy: {
      schemaVersion:
        "performance-scoring-policy.v1",
      policyId:
        "smnyl-advisor-daily-25.v1",
      dailyTargetPoints: 25,
    },
    authority: {
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
    },
    period: {
      evaluationDateFrom:
        days[0].period.evaluationDate,
      evaluationDateTo:
        days.at(-1).period.evaluationDate,
      asOf:
        "2026-07-28T18:00:00.000Z",
      dayCount: days.length,
    },
    days,
    totals: {
      totalPoints,
      targetPoints,
      remainingPoints:
        Math.max(
          0,
          targetPoints - totalPoints,
        ),
      targetStatus:
        totalPoints > targetPoints
          ? "PERIOD_TARGET_EXCEEDED"
          : totalPoints === targetPoints
            ? "PERIOD_TARGET_MET"
            : "PERIOD_BELOW_TARGET",
      averagePointsPerDay:
        Number(
          (
            totalPoints /
            days.length
          ).toFixed(2),
        ),
      targetMetDays,
      targetExceededDays,
      belowTargetDays,
      eligibleActivityCount:
        days.reduce(
          (sum, day) =>
            sum +
            day.eligibleActivityCount,
          0,
        ),
      futureRecordedExcludedCount:
        days.reduce(
          (sum, day) =>
            sum +
            day
              .excludedActivityCount
              .futureRecorded,
          0,
        ),
      suppressedEligibleCount:
        days.reduce(
          (sum, day) =>
            sum +
            day
              .excludedActivityCount
              .suppressed,
          0,
        ),
    },
    authorityBoundary: {
      activityEligibilityAuthority: true,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  };
}

function sourceRuntime({
  calls = [],
  dailyResult = daily(),
  periodResult = period(),
  schemaVersion =
    "performance-period-runtime.v1",
  capabilities = [
    "PERFORMANCE_DAILY_SCORE",
    "PERFORMANCE_PERIOD_SERIES",
  ],
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
    async scoreDay(query) {
      calls.push({
        operation: "day",
        query,
      });
      return dailyResult;
    },
    async scorePeriod(query) {
      calls.push({
        operation: "period",
        query,
      });
      return periodResult;
    },
  };
}

test(
  "exports read model schemas",
  () => {
    assert.equal(
      PERFORMANCE_DAILY_READ_MODEL_SCHEMA_VERSION,
      "performance-daily-read-model.v1",
    );
    assert.equal(
      PERFORMANCE_PERIOD_READ_MODEL_SCHEMA_VERSION,
      "performance-period-read-model.v1",
    );
  },
);

test(
  "exports read runtime schema and capabilities",
  () => {
    assert.equal(
      PERFORMANCE_READ_RUNTIME_SCHEMA_VERSION,
      "performance-read-runtime.v1",
    );
    assert.deepEqual(
      PERFORMANCE_READ_RUNTIME_CAPABILITIES,
      [
        "PERFORMANCE_DAILY_READ_MODEL",
        "PERFORMANCE_PERIOD_READ_MODEL",
      ],
    );
  },
);

test(
  "runtime binds authority and policy",
  () => {
    const value =
      createPerformanceReadRuntime({
        performanceRuntime:
          sourceRuntime(),
      });

    assert.equal(
      value.authority.advisorId,
      "advisor-001",
    );
    assert.equal(
      value.policy.policyId,
      "smnyl-advisor-daily-25.v1",
    );
    assert.equal(value.maxDays, 31);
  },
);

test(
  "runtime rejects unsupported source schema",
  () => {
    assert.throws(
      () =>
        createPerformanceReadRuntime({
          performanceRuntime:
            sourceRuntime({
              schemaVersion:
                "performance-period-runtime.v0",
            }),
        }),
      PerformanceReadRuntimeError,
    );
  },
);

test(
  "runtime rejects missing source capabilities",
  () => {
    assert.throws(
      () =>
        createPerformanceReadRuntime({
          performanceRuntime:
            sourceRuntime({
              capabilities: [
                "PERFORMANCE_DAILY_SCORE",
              ],
            }),
        }),
      /lacks PERFORMANCE_PERIOD_SERIES/u,
    );
  },
);

test(
  "readDay delegates the query unchanged",
  async () => {
    const calls = [];
    const runtime =
      createPerformanceReadRuntime({
        performanceRuntime:
          sourceRuntime({ calls }),
      });
    const query = {
      evaluationDate:
        "2026-07-28",
    };

    await runtime.readDay(query);

    assert.deepEqual(
      calls,
      [
        {
          operation: "day",
          query,
        },
      ],
    );
  },
);

test(
  "readPeriod delegates the query unchanged",
  async () => {
    const calls = [];
    const runtime =
      createPerformanceReadRuntime({
        performanceRuntime:
          sourceRuntime({ calls }),
      });
    const query = {
      evaluationDateFrom:
        "2026-07-27",
      evaluationDateTo:
        "2026-07-28",
    };

    await runtime.readPeriod(query);

    assert.deepEqual(
      calls,
      [
        {
          operation: "period",
          query,
        },
      ],
    );
  },
);

test(
  "daily model exposes target headline",
  () => {
    const value =
      projectPerformanceDailyReadModel(
        daily(),
      );

    assert.deepEqual(
      value.headline,
      {
        totalPoints: 25,
        targetPoints: 25,
        remainingPoints: 0,
        excessPoints: 0,
        progressPercent: 100,
        uncappedProgressPercent: 100,
        progressRatio: 1,
        targetStatus: "TARGET_MET",
      },
    );
  },
);

test(
  "daily model caps progress above target",
  () => {
    const value =
      projectPerformanceDailyReadModel(
        daily({
          totalPoints: 40,
          targetStatus:
            "TARGET_EXCEEDED",
          values: {
            POLICY_PAID: {
              count: 4,
              pointsPerActivity: 10,
            },
          },
        }),
      );

    assert.equal(
      value.headline.progressPercent,
      100,
    );
    assert.equal(
      value.headline
        .uncappedProgressPercent,
      160,
    );
    assert.equal(
      value.headline.excessPoints,
      15,
    );
  },
);

test(
  "daily model sorts active activity by point contribution",
  () => {
    const value =
      projectPerformanceDailyReadModel(
        daily({
          totalPoints: 19,
          targetStatus:
            "BELOW_TARGET",
          values: {
            REFERRAL_ACQUIRED: {
              count: 3,
              pointsPerActivity: 3,
            },
            APPLICATION_SUBMITTED: {
              count: 1,
              pointsPerActivity: 5,
            },
            CONTACT_ATTEMPTED: {
              count: 5,
              pointsPerActivity: 1,
            },
          },
        }),
      );

    assert.deepEqual(
      value.activity.items.map(
        (item) =>
          item.activityType,
      ),
      [
        "REFERRAL_ACQUIRED",
        "CONTACT_ATTEMPTED",
        "APPLICATION_SUBMITTED",
      ],
    );
  },
);

test(
  "daily model preserves zero-point activity",
  () => {
    const value =
      projectPerformanceDailyReadModel(
        daily({
          totalPoints: 0,
          targetStatus:
            "BELOW_TARGET",
          values: {
            FOLLOW_UP_COMPLETED: {
              count: 3,
              pointsPerActivity: 0,
            },
          },
        }),
      );

    assert.equal(
      value.activity
        .zeroPointActivityCount,
      3,
    );
    assert.equal(
      value.activity.items[0]
        .counted,
      false,
    );
  },
);

test(
  "daily model exposes exclusions",
  () => {
    const value =
      projectPerformanceDailyReadModel(
        daily({
          futureRecorded: 2,
          suppressed: 3,
        }),
      );

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
  "daily model is immutable and non-judgmental",
  () => {
    const value =
      projectPerformanceDailyReadModel(
        daily(),
      );

    assert.equal(
      Object.isFrozen(value),
      true,
    );
    assert.deepEqual(
      value.authority,
      {
        activityEligibilityAuthority: true,
        activityScoringAuthority: false,
        performancePolicyAuthority: true,
        rankingAuthority: false,
        humanWorthAuthority: false,
        enforcementAuthority: false,
      },
    );
  },
);

test(
  "daily model rejects inconsistent breakdown",
  () => {
    const source = daily();

    source.breakdown[0]
      .awardedPoints = 99;

    assert.throws(
      () =>
        projectPerformanceDailyReadModel(
          source,
        ),
      PerformanceReadModelError,
    );
  },
);

test(
  "period model exposes summary and series",
  () => {
    const value =
      projectPerformancePeriodReadModel(
        period(),
      );

    assert.equal(
      value.headline.totalPoints,
      50,
    );
    assert.equal(
      value.headline.targetStatus,
      "PERIOD_TARGET_MET",
    );
    assert.deepEqual(
      value.series.map(
        (day) =>
          day.totalPoints,
      ),
      [10, 40],
    );
  },
);

test(
  "period model aggregates activity and exclusions",
  () => {
    const value =
      projectPerformancePeriodReadModel(
        period(),
      );

    assert.deepEqual(
      value.activity.items[0],
      {
        activityType:
          "POLICY_PAID",
        count: 5,
        pointsPerActivity: 10,
        awardedPoints: 50,
        counted: true,
        shareOfPointsPercent: 100,
      },
    );
    assert.deepEqual(
      value.exclusions,
      {
        futureRecorded: 1,
        suppressed: 2,
        total: 3,
      },
    );
  },
);

test(
  "period model is immutable and reports successful days",
  () => {
    const value =
      projectPerformancePeriodReadModel(
        period(),
      );

    assert.equal(
      Object.isFrozen(value),
      true,
    );
    assert.equal(
      value.dayStatus.successfulDays,
      1,
    );
  },
);

test(
  "period model rejects inconsistent totals",
  () => {
    const source = period();

    source.totals.totalPoints = 49;

    assert.throws(
      () =>
        projectPerformancePeriodReadModel(
          source,
        ),
      /period totals are inconsistent/u,
    );
  },
);
