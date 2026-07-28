import {
  projectPerformanceScore,
} from "../application/performance-score-projector.mjs";

import {
  PERFORMANCE_SCORING_POLICY_V1,
  assertPerformanceScoringPolicy,
} from "../domain/performance-scoring-policy.mjs";

export const PERFORMANCE_PERIOD_RUNTIME_SCHEMA_VERSION =
  "performance-period-runtime.v1";

export const PERFORMANCE_PERIOD_RESULT_SCHEMA_VERSION =
  "performance-period-result.v1";

export const PERFORMANCE_PERIOD_RUNTIME_CAPABILITIES =
  Object.freeze([
    "PERFORMANCE_DAILY_SCORE",
    "PERFORMANCE_PERIOD_SERIES",
  ]);

export const PERFORMANCE_PERIOD_RUNTIME_MAX_DAYS = 31;

const ACTIVITY_RUNTIME_SCHEMA_VERSION =
  "activity-read-runtime.v1";

const REQUIRED_ACTIVITY_CAPABILITY =
  "ACTIVITY_PERIOD_AGGREGATION";

const RUNTIME_KEYS = new Set([
  "activityRuntime",
  "policy",
  "clock",
  "maxDays",
]);

const DAY_QUERY_KEYS = new Set([
  "evaluationDate",
  "asOf",
]);

const PERIOD_QUERY_KEYS = new Set([
  "evaluationDateFrom",
  "evaluationDateTo",
  "asOf",
]);

export class PerformancePeriodRuntimeError
  extends TypeError {
  constructor(message) {
    super(`PerformancePeriodRuntime: ${message}`);
    this.name = "PerformancePeriodRuntimeError";
  }
}

function runtimeError(message) {
  throw new PerformancePeriodRuntimeError(message);
}

function assertPlainObject(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    runtimeError(
      `${label} must be a plain object`,
    );
  }
}

function assertExactKeys(
  value,
  allowed,
  label,
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      runtimeError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function requiredString(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    runtimeError(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function calendarDate(value, label) {
  const input = requiredString(
    value,
    label,
  );

  if (!/^\d{4}-\d{2}-\d{2}$/u.test(input)) {
    runtimeError(
      `${label} must use YYYY-MM-DD`,
    );
  }

  const [year, month, day] =
    input.split("-").map(Number);
  const candidate = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    runtimeError(
      `${label} must be a real calendar date`,
    );
  }

  return input;
}

function canonicalInstant(value, label) {
  const parsed = new Date(
    requiredString(value, label),
  );

  if (Number.isNaN(parsed.getTime())) {
    runtimeError(
      `${label} must be an ISO instant`,
    );
  }

  return parsed.toISOString();
}

function normalizeClock(value) {
  if (value === undefined) {
    return () => new Date().toISOString();
  }

  if (typeof value !== "function") {
    runtimeError("clock must be a function");
  }

  return value;
}

function normalizeMaxDays(value) {
  const maxDays =
    value ??
    PERFORMANCE_PERIOD_RUNTIME_MAX_DAYS;

  if (
    !Number.isSafeInteger(maxDays) ||
    maxDays < 1 ||
    maxDays >
      PERFORMANCE_PERIOD_RUNTIME_MAX_DAYS
  ) {
    runtimeError(
      `maxDays must be between 1 and ${PERFORMANCE_PERIOD_RUNTIME_MAX_DAYS}`,
    );
  }

  return maxDays;
}

function normalizeActivityRuntime(value) {
  assertPlainObject(
    value,
    "activityRuntime",
  );

  if (
    value.schemaVersion !==
    ACTIVITY_RUNTIME_SCHEMA_VERSION
  ) {
    runtimeError(
      "activityRuntime schemaVersion is not supported",
    );
  }

  assertPlainObject(
    value.authority,
    "activityRuntime.authority",
  );

  const organizationId =
    requiredString(
      value.authority.organizationId,
      "activityRuntime.authority.organizationId",
    );
  const advisorId =
    requiredString(
      value.authority.advisorId,
      "activityRuntime.authority.advisorId",
    );

  if (
    !Array.isArray(value.capabilities) ||
    !value.capabilities.includes(
      REQUIRED_ACTIVITY_CAPABILITY,
    )
  ) {
    runtimeError(
      "activityRuntime lacks ACTIVITY_PERIOD_AGGREGATION",
    );
  }

  if (
    typeof value.aggregatePeriod !==
    "function"
  ) {
    runtimeError(
      "activityRuntime.aggregatePeriod must be a function",
    );
  }

  return {
    runtime: value,
    authority: {
      organizationId,
      advisorId,
    },
  };
}

function resolveAsOf(value, clock) {
  return canonicalInstant(
    value ?? clock(),
    "asOf",
  );
}

function enumerateDates(
  evaluationDateFrom,
  evaluationDateTo,
  maxDays,
) {
  if (
    evaluationDateFrom >
    evaluationDateTo
  ) {
    runtimeError(
      "evaluation date range is reversed",
    );
  }

  const dates = [];
  const cursor = new Date(
    `${evaluationDateFrom}T00:00:00.000Z`,
  );
  const end = new Date(
    `${evaluationDateTo}T00:00:00.000Z`,
  );

  while (cursor <= end) {
    dates.push(
      cursor.toISOString().slice(0, 10),
    );

    if (dates.length > maxDays) {
      runtimeError(
        `period exceeds maxDays ${maxDays}`,
      );
    }

    cursor.setUTCDate(
      cursor.getUTCDate() + 1,
    );
  }

  return dates;
}

function deepFreeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

function periodStatus(points, target) {
  if (points > target) {
    return "PERIOD_TARGET_EXCEEDED";
  }

  if (points === target) {
    return "PERIOD_TARGET_MET";
  }

  return "PERIOD_BELOW_TARGET";
}

function summarizePeriod({
  days,
  authority,
  policy,
  evaluationDateFrom,
  evaluationDateTo,
  asOf,
}) {
  const totalPoints = days.reduce(
    (sum, day) =>
      sum + day.totalPoints,
    0,
  );
  const targetPoints =
    policy.targetPoints * days.length;
  const targetMetDays = days.filter(
    (day) =>
      day.targetStatus ===
      "TARGET_MET",
  ).length;
  const targetExceededDays = days.filter(
    (day) =>
      day.targetStatus ===
      "TARGET_EXCEEDED",
  ).length;
  const belowTargetDays = days.filter(
    (day) =>
      day.targetStatus ===
      "BELOW_TARGET",
  ).length;

  const eligibleActivityCount =
    days.reduce(
      (sum, day) =>
        sum +
        day.eligibleActivityCount,
      0,
    );
  const futureRecordedExcludedCount =
    days.reduce(
      (sum, day) =>
        sum +
        day.excludedActivityCount
          .futureRecorded,
      0,
    );
  const suppressedEligibleCount =
    days.reduce(
      (sum, day) =>
        sum +
        day.excludedActivityCount
          .suppressed,
      0,
    );

  return deepFreeze({
    schemaVersion:
      PERFORMANCE_PERIOD_RESULT_SCHEMA_VERSION,
    runtimeSchemaVersion:
      PERFORMANCE_PERIOD_RUNTIME_SCHEMA_VERSION,
    policy: {
      schemaVersion:
        policy.schemaVersion,
      policyId:
        policy.policyId,
      dailyTargetPoints:
        policy.targetPoints,
    },
    authority,
    period: {
      evaluationDateFrom,
      evaluationDateTo,
      asOf,
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
        periodStatus(
          totalPoints,
          targetPoints,
        ),
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
      eligibleActivityCount,
      futureRecordedExcludedCount,
      suppressedEligibleCount,
    },
    authorityBoundary: {
      activityEligibilityAuthority: true,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  });
}

export function createPerformancePeriodRuntime(
  input,
) {
  assertPlainObject(input, "input");
  assertExactKeys(
    input,
    RUNTIME_KEYS,
    "input",
  );

  const {
    runtime: activityRuntime,
    authority,
  } = normalizeActivityRuntime(
    input.activityRuntime,
  );
  const policy =
    assertPerformanceScoringPolicy(
      input.policy ??
        PERFORMANCE_SCORING_POLICY_V1,
    );
  const clock = normalizeClock(input.clock);
  const maxDays = normalizeMaxDays(
    input.maxDays,
  );

  async function scoreDate(
    evaluationDate,
    asOf,
  ) {
    const aggregation =
      await activityRuntime.aggregatePeriod({
        evaluationDateFrom:
          evaluationDate,
        evaluationDateTo:
          evaluationDate,
        asOf,
      });

    return projectPerformanceScore({
      aggregation,
      policy,
    });
  }

  return deepFreeze({
    schemaVersion:
      PERFORMANCE_PERIOD_RUNTIME_SCHEMA_VERSION,
    authority,
    policy: {
      schemaVersion:
        policy.schemaVersion,
      policyId:
        policy.policyId,
      dailyTargetPoints:
        policy.targetPoints,
    },
    maxDays,
    capabilities:
      PERFORMANCE_PERIOD_RUNTIME_CAPABILITIES,

    async scoreDay(query) {
      assertPlainObject(
        query,
        "scoreDay query",
      );
      assertExactKeys(
        query,
        DAY_QUERY_KEYS,
        "scoreDay query",
      );

      const evaluationDate =
        calendarDate(
          query.evaluationDate,
          "evaluationDate",
        );
      const asOf = resolveAsOf(
        query.asOf,
        clock,
      );

      return scoreDate(
        evaluationDate,
        asOf,
      );
    },

    async scorePeriod(query) {
      assertPlainObject(
        query,
        "scorePeriod query",
      );
      assertExactKeys(
        query,
        PERIOD_QUERY_KEYS,
        "scorePeriod query",
      );

      const evaluationDateFrom =
        calendarDate(
          query.evaluationDateFrom,
          "evaluationDateFrom",
        );
      const evaluationDateTo =
        calendarDate(
          query.evaluationDateTo,
          "evaluationDateTo",
        );
      const asOf = resolveAsOf(
        query.asOf,
        clock,
      );
      const dates = enumerateDates(
        evaluationDateFrom,
        evaluationDateTo,
        maxDays,
      );
      const days = [];

      for (const date of dates) {
        days.push(
          await scoreDate(date, asOf),
        );
      }

      return summarizePeriod({
        days,
        authority,
        policy,
        evaluationDateFrom,
        evaluationDateTo,
        asOf,
      });
    },
  });
}
