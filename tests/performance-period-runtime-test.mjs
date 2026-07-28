import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_TYPES,
} from "../advisor-os/activity/domain/activity-record.mjs";

import {
  createPerformanceScoringPolicy,
} from "../advisor-os/performance/domain/performance-scoring-policy.mjs";

import {
  PERFORMANCE_PERIOD_RESULT_SCHEMA_VERSION,
  PERFORMANCE_PERIOD_RUNTIME_CAPABILITIES,
  PERFORMANCE_PERIOD_RUNTIME_MAX_DAYS,
  PERFORMANCE_PERIOD_RUNTIME_SCHEMA_VERSION,
  PerformancePeriodRuntimeError,
  createPerformancePeriodRuntime,
} from "../advisor-os/performance/runtime/performance-period-runtime.mjs";

function zeroByType() {
  return Object.fromEntries(
    ACTIVITY_TYPES.map(
      (type) => [type, 0],
    ),
  );
}

function aggregate({
  date,
  eligibleByType = {},
  futureRecordedExcludedCount = 0,
  suppressedEligibleCount = 0,
  asOf = "2026-07-28T17:00:00.000Z",
} = {}) {
  const eligible = {
    ...zeroByType(),
    ...eligibleByType,
  };

  return {
    schemaVersion:
      "activity-period-aggregation.v1",
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    period: {
      evaluationDateFrom: date,
      evaluationDateTo: date,
      asOf,
    },
    eligibleByType: eligible,
    eligibleActivityCount:
      Object.values(eligible).reduce(
        (sum, count) =>
          sum + count,
        0,
      ),
    futureRecordedExcludedCount,
    suppressedEligibleCount,
  };
}

function activityRuntime({
  byDate = {},
  calls = [],
  schemaVersion =
    "activity-read-runtime.v1",
  capabilities = [
    "ACTIVITY_FEED",
    "ACTIVITY_PERIOD_AGGREGATION",
  ],
  aggregatePeriod,
} = {}) {
  return {
    schemaVersion,
    authority: {
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
    },
    capabilities,
    async feed() {
      return null;
    },
    async aggregatePeriod(query) {
      calls.push({ ...query });

      if (aggregatePeriod) {
        return aggregatePeriod(query);
      }

      return aggregate({
        date:
          query.evaluationDateFrom,
        asOf: query.asOf,
        ...(
          byDate[
            query.evaluationDateFrom
          ] ??
          {}
        ),
      });
    },
  };
}

function runtime(options = {}) {
  return createPerformancePeriodRuntime({
    activityRuntime:
      options.activityRuntime ??
      activityRuntime(options),
    clock:
      options.clock ??
      (() =>
        "2026-07-28T17:00:00.000Z"),
    policy: options.policy,
    maxDays: options.maxDays,
  });
}

test(
  "exports runtime schemas and capabilities",
  () => {
    assert.equal(
      PERFORMANCE_PERIOD_RUNTIME_SCHEMA_VERSION,
      "performance-period-runtime.v1",
    );
    assert.equal(
      PERFORMANCE_PERIOD_RESULT_SCHEMA_VERSION,
      "performance-period-result.v1",
    );
    assert.deepEqual(
      PERFORMANCE_PERIOD_RUNTIME_CAPABILITIES,
      [
        "PERFORMANCE_DAILY_SCORE",
        "PERFORMANCE_PERIOD_SERIES",
      ],
    );
  },
);

test(
  "binds Activity authority and policy",
  () => {
    const value = runtime();

    assert.deepEqual(
      value.authority,
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
  "scores one day through Activity aggregation",
  async () => {
    const calls = [];
    const value = runtime({
      calls,
      byDate: {
        "2026-07-27": {
          eligibleByType: {
            POLICY_PAID: 1,
            APPLICATION_SUBMITTED: 1,
            REFERRAL_ACQUIRED: 2,
            CONTACT_ATTEMPTED: 4,
          },
        },
      },
    });

    const result = await value.scoreDay({
      evaluationDate:
        "2026-07-27",
    });

    assert.equal(result.totalPoints, 25);
    assert.equal(result.targetStatus, "TARGET_MET");
    assert.deepEqual(
      calls,
      [
        {
          evaluationDateFrom:
            "2026-07-27",
          evaluationDateTo:
            "2026-07-27",
          asOf:
            "2026-07-28T17:00:00.000Z",
        },
      ],
    );
  },
);

test(
  "honors an explicit asOf for one day",
  async () => {
    const calls = [];
    const value = runtime({ calls });

    await value.scoreDay({
      evaluationDate:
        "2026-07-27",
      asOf:
        "2026-07-28T18:30:00-06:00",
    });

    assert.equal(
      calls[0].asOf,
      "2026-07-29T00:30:00.000Z",
    );
  },
);

test(
  "enumerates every day in an inclusive period",
  async () => {
    const calls = [];
    const value = runtime({ calls });

    const result = await value.scorePeriod({
      evaluationDateFrom:
        "2026-07-25",
      evaluationDateTo:
        "2026-07-27",
    });

    assert.equal(result.period.dayCount, 3);
    assert.deepEqual(
      result.days.map(
        (day) =>
          day.period.evaluationDate,
      ),
      [
        "2026-07-25",
        "2026-07-26",
        "2026-07-27",
      ],
    );
    assert.equal(calls.length, 3);
  },
);

test(
  "uses one asOf snapshot for the complete period",
  async () => {
    const calls = [];
    let clockCalls = 0;
    const value = runtime({
      calls,
      clock: () => {
        clockCalls += 1;
        return "2026-07-28T17:45:00.000Z";
      },
    });

    await value.scorePeriod({
      evaluationDateFrom:
        "2026-07-25",
      evaluationDateTo:
        "2026-07-27",
    });

    assert.equal(clockCalls, 1);
    assert.deepEqual(
      new Set(
        calls.map((call) => call.asOf),
      ),
      new Set([
        "2026-07-28T17:45:00.000Z",
      ]),
    );
  },
);

test(
  "summarizes period points and daily statuses",
  async () => {
    const value = runtime({
      byDate: {
        "2026-07-25": {
          eligibleByType: {
            POLICY_PAID: 1,
          },
        },
        "2026-07-26": {
          eligibleByType: {
            POLICY_PAID: 3,
          },
        },
        "2026-07-27": {
          eligibleByType: {
            POLICY_PAID: 2,
            APPLICATION_SUBMITTED: 1,
          },
        },
      },
    });

    const result = await value.scorePeriod({
      evaluationDateFrom:
        "2026-07-25",
      evaluationDateTo:
        "2026-07-27",
    });

    assert.equal(result.totals.totalPoints, 65);
    assert.equal(result.totals.targetPoints, 75);
    assert.equal(result.totals.remainingPoints, 10);
    assert.equal(
      result.totals.targetStatus,
      "PERIOD_BELOW_TARGET",
    );
    assert.equal(result.totals.averagePointsPerDay, 21.67);
    assert.equal(result.totals.targetMetDays, 1);
    assert.equal(result.totals.targetExceededDays, 1);
    assert.equal(result.totals.belowTargetDays, 1);
  },
);

test(
  "keeps empty days in the period series",
  async () => {
    const result = await runtime().scorePeriod({
      evaluationDateFrom:
        "2026-07-27",
      evaluationDateTo:
        "2026-07-28",
    });

    assert.equal(result.days.length, 2);
    assert.deepEqual(
      result.days.map(
        (day) => day.totalPoints,
      ),
      [0, 0],
    );
  },
);

test(
  "accumulates eligible and excluded counts",
  async () => {
    const value = runtime({
      byDate: {
        "2026-07-27": {
          eligibleByType: {
            CONTACT_ATTEMPTED: 2,
          },
          futureRecordedExcludedCount: 1,
          suppressedEligibleCount: 3,
        },
        "2026-07-28": {
          eligibleByType: {
            REFERRAL_ACQUIRED: 1,
          },
          futureRecordedExcludedCount: 2,
          suppressedEligibleCount: 4,
        },
      },
    });

    const result = await value.scorePeriod({
      evaluationDateFrom:
        "2026-07-27",
      evaluationDateTo:
        "2026-07-28",
    });

    assert.equal(
      result.totals.eligibleActivityCount,
      3,
    );
    assert.equal(
      result.totals.futureRecordedExcludedCount,
      3,
    );
    assert.equal(
      result.totals.suppressedEligibleCount,
      7,
    );
  },
);

test(
  "honors a valid custom target policy",
  async () => {
    const policy =
      createPerformanceScoringPolicy({
        targetPoints: 20,
      });
    const value = runtime({
      policy,
      byDate: {
        "2026-07-27": {
          eligibleByType: {
            POLICY_PAID: 2,
          },
        },
      },
    });

    const result = await value.scoreDay({
      evaluationDate:
        "2026-07-27",
    });

    assert.equal(result.targetPoints, 20);
    assert.equal(result.targetStatus, "TARGET_MET");
  },
);

test(
  "rejects a reversed period",
  async () => {
    await assert.rejects(
      () =>
        runtime().scorePeriod({
          evaluationDateFrom:
            "2026-07-28",
          evaluationDateTo:
            "2026-07-27",
        }),
      /range is reversed/u,
    );
  },
);

test(
  "rejects a period above the 31 day ceiling",
  async () => {
    await assert.rejects(
      () =>
        runtime().scorePeriod({
          evaluationDateFrom:
            "2026-06-01",
          evaluationDateTo:
            "2026-07-02",
        }),
      /exceeds maxDays 31/u,
    );
  },
);

test(
  "supports a stricter configured period ceiling",
  async () => {
    await assert.rejects(
      () =>
        runtime({
          maxDays: 2,
        }).scorePeriod({
          evaluationDateFrom:
            "2026-07-26",
          evaluationDateTo:
            "2026-07-28",
        }),
      /exceeds maxDays 2/u,
    );
  },
);

test(
  "rejects an invalid calendar date",
  async () => {
    await assert.rejects(
      () =>
        runtime().scoreDay({
          evaluationDate:
            "2026-02-30",
        }),
      /real calendar date/u,
    );
  },
);

test(
  "rejects authority override fields",
  async () => {
    await assert.rejects(
      () =>
        runtime().scoreDay({
          evaluationDate:
            "2026-07-27",
          organizationId:
            "other-organization",
        }),
      /unknown field organizationId/u,
    );
  },
);

test(
  "rejects an unsupported Activity runtime schema",
  () => {
    assert.throws(
      () =>
        runtime({
          activityRuntime:
            activityRuntime({
              schemaVersion:
                "activity-read-runtime.v2",
            }),
        }),
      PerformancePeriodRuntimeError,
    );
  },
);

test(
  "rejects Activity runtime without aggregation capability",
  () => {
    assert.throws(
      () =>
        runtime({
          activityRuntime:
            activityRuntime({
              capabilities: [
                "ACTIVITY_FEED",
              ],
            }),
        }),
      /lacks ACTIVITY_PERIOD_AGGREGATION/u,
    );
  },
);

test(
  "propagates Activity aggregation failures",
  async () => {
    const activityFailure =
      new Error("repository unavailable");
    const value = runtime({
      activityRuntime:
        activityRuntime({
          aggregatePeriod: async () => {
            throw activityFailure;
          },
        }),
    });

    await assert.rejects(
      () =>
        value.scoreDay({
          evaluationDate:
            "2026-07-27",
        }),
      (error) =>
        error === activityFailure,
    );
  },
);

test(
  "runtime and period results are deeply immutable",
  async () => {
    const value = runtime();
    const result = await value.scorePeriod({
      evaluationDateFrom:
        "2026-07-27",
      evaluationDateTo:
        "2026-07-28",
    });

    assert.equal(Object.isFrozen(value), true);
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.days), true);
    assert.equal(Object.isFrozen(result.totals), true);
  },
);

test(
  "period result preserves non-punitive authority boundaries",
  async () => {
    const result = await runtime().scorePeriod({
      evaluationDateFrom:
        "2026-07-27",
      evaluationDateTo:
        "2026-07-27",
    });

    assert.deepEqual(
      result.authorityBoundary,
      {
        activityEligibilityAuthority: true,
        performancePolicyAuthority: true,
        rankingAuthority: false,
        humanWorthAuthority: false,
        enforcementAuthority: false,
      },
    );
    assert.doesNotMatch(
      JSON.stringify(result),
      /elite|legendario|bajo_ritmo|punishment|penalty/iu,
    );
  },
);

test(
  "period result is deterministic",
  async () => {
    const value = runtime({
      byDate: {
        "2026-07-27": {
          eligibleByType: {
            APPLICATION_SUBMITTED: 2,
          },
        },
      },
    });
    const query = {
      evaluationDateFrom:
        "2026-07-27",
      evaluationDateTo:
        "2026-07-27",
      asOf:
        "2026-07-28T17:00:00.000Z",
    };

    assert.deepEqual(
      await value.scorePeriod(query),
      await value.scorePeriod(query),
    );
  },
);

test(
  "publishes the default 31 day limit",
  () => {
    assert.equal(
      PERFORMANCE_PERIOD_RUNTIME_MAX_DAYS,
      31,
    );
  },
);
