import {
  ACTIVITY_TYPES,
} from "../../activity/domain/activity-record.mjs";

export const PERFORMANCE_DAILY_READ_MODEL_SCHEMA_VERSION =
  "performance-daily-read-model.v1";

export const PERFORMANCE_PERIOD_READ_MODEL_SCHEMA_VERSION =
  "performance-period-read-model.v1";

const DAILY_SOURCE_SCHEMA =
  "performance-score-projection.v1";

const PERIOD_SOURCE_SCHEMA =
  "performance-period-result.v1";

const DAILY_STATUSES = new Set([
  "BELOW_TARGET",
  "TARGET_MET",
  "TARGET_EXCEEDED",
]);

const PERIOD_STATUSES = new Set([
  "PERIOD_BELOW_TARGET",
  "PERIOD_TARGET_MET",
  "PERIOD_TARGET_EXCEEDED",
]);

export class PerformanceReadModelError
  extends TypeError {
  constructor(message) {
    super(`PerformanceReadModel: ${message}`);
    this.name = "PerformanceReadModelError";
  }
}

function error(message) {
  throw new PerformanceReadModelError(message);
}

function plain(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    error(`${label} must be a plain object`);
  }
}

function string(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    error(`${label} must be a non-empty string`);
  }

  return value.trim();
}

function count(value, label) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    error(`${label} must be a non-negative integer`);
  }

  return value;
}

function positive(value, label) {
  const result = count(value, label);

  if (result < 1) {
    error(`${label} must be positive`);
  }

  return result;
}

function finite(value, label) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    error(`${label} must be finite`);
  }

  return value;
}

function round2(value) {
  return Number(value.toFixed(2));
}

function freeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    freeze(nested);
  }

  return Object.freeze(value);
}

function status(value, allowed, label) {
  if (!allowed.has(value)) {
    error(`${label} is not supported`);
  }

  return value;
}

function authority(value, label) {
  plain(value, label);

  if (
    value.performancePolicyAuthority !== true
  ) {
    error(`${label}.performancePolicyAuthority must be true`);
  }

  for (const key of [
    "rankingAuthority",
    "humanWorthAuthority",
    "enforcementAuthority",
  ]) {
    if (value[key] !== false) {
      error(`${label}.${key} must be false`);
    }
  }
}

function progress(totalPoints, targetPoints) {
  const uncapped =
    round2(
      (totalPoints / targetPoints) * 100,
    );

  return {
    percent: Math.min(100, uncapped),
    uncappedPercent: uncapped,
    ratio:
      Math.min(
        1,
        totalPoints / targetPoints,
      ),
  };
}

function normalizeBreakdown(
  breakdown,
  totalPoints,
  eligibleActivityCount,
  label,
) {
  if (
    !Array.isArray(breakdown) ||
    breakdown.length !== ACTIVITY_TYPES.length
  ) {
    error(`${label} must cover every canonical Activity type`);
  }

  const seen = new Set();

  const normalized =
    breakdown.map(
      (item, index) => {
        plain(item, `${label}[${index}]`);

        const activityType =
          string(
            item.activityType,
            `${label}[${index}].activityType`,
          );

        if (
          !ACTIVITY_TYPES.includes(activityType) ||
          seen.has(activityType)
        ) {
          error(`${label} contains invalid or duplicate activityType`);
        }

        seen.add(activityType);

        const activityCount =
          count(
            item.count,
            `${label}[${index}].count`,
          );
        const pointsPerActivity =
          count(
            item.pointsPerActivity,
            `${label}[${index}].pointsPerActivity`,
          );
        const awardedPoints =
          count(
            item.awardedPoints,
            `${label}[${index}].awardedPoints`,
          );

        if (
          awardedPoints !==
          activityCount * pointsPerActivity
        ) {
          error(`${label}[${index}] awardedPoints is inconsistent`);
        }

        if (
          item.counted !==
          (pointsPerActivity > 0)
        ) {
          error(`${label}[${index}] counted is inconsistent`);
        }

        return {
          activityType,
          count: activityCount,
          pointsPerActivity,
          awardedPoints,
          counted: pointsPerActivity > 0,
          shareOfPointsPercent:
            totalPoints === 0
              ? 0
              : round2(
                  (awardedPoints / totalPoints) * 100,
                ),
          order:
            ACTIVITY_TYPES.indexOf(activityType),
        };
      },
    );

  if (
    normalized.reduce(
      (sum, item) => sum + item.awardedPoints,
      0,
    ) !== totalPoints
  ) {
    error(`${label} total points are inconsistent`);
  }

  if (
    normalized.reduce(
      (sum, item) => sum + item.count,
      0,
    ) !== eligibleActivityCount
  ) {
    error(`${label} eligible count is inconsistent`);
  }

  return normalized
    .filter((item) => item.count > 0)
    .sort(
      (left, right) =>
        right.awardedPoints - left.awardedPoints ||
        right.count - left.count ||
        left.order - right.order,
    )
    .map(({ order, ...item }) => item);
}

function normalizeDay(source, label = "source") {
  plain(source, label);

  if (source.schemaVersion !== DAILY_SOURCE_SCHEMA) {
    error(`${label}.schemaVersion is not supported`);
  }

  plain(source.policy, `${label}.policy`);
  plain(source.period, `${label}.period`);
  plain(
    source.excludedActivityCount,
    `${label}.excludedActivityCount`,
  );
  authority(source.authority, `${label}.authority`);

  if (
    source.authority.activityScoringAuthority !== false
  ) {
    error(`${label}.authority.activityScoringAuthority must be false`);
  }

  const totalPoints =
    count(source.totalPoints, `${label}.totalPoints`);
  const targetPoints =
    positive(source.targetPoints, `${label}.targetPoints`);
  const remainingPoints =
    count(
      source.remainingPoints,
      `${label}.remainingPoints`,
    );
  const targetStatus =
    status(
      source.targetStatus,
      DAILY_STATUSES,
      `${label}.targetStatus`,
    );

  const expectedStatus =
    totalPoints > targetPoints
      ? "TARGET_EXCEEDED"
      : totalPoints === targetPoints
        ? "TARGET_MET"
        : "BELOW_TARGET";

  if (
    remainingPoints !==
      Math.max(0, targetPoints - totalPoints) ||
    targetStatus !== expectedStatus
  ) {
    error(`${label} headline is inconsistent`);
  }

  const eligibleActivityCount =
    count(
      source.eligibleActivityCount,
      `${label}.eligibleActivityCount`,
    );

  return {
    totalPoints,
    targetPoints,
    remainingPoints,
    targetStatus,
    eligibleActivityCount,
    items:
      normalizeBreakdown(
        source.breakdown,
        totalPoints,
        eligibleActivityCount,
        `${label}.breakdown`,
      ),
    organizationId:
      string(
        source.organizationId,
        `${label}.organizationId`,
      ),
    advisorId:
      string(
        source.advisorId,
        `${label}.advisorId`,
      ),
    evaluationDate:
      string(
        source.period.evaluationDate,
        `${label}.period.evaluationDate`,
      ),
    asOf:
      string(
        source.period.asOf,
        `${label}.period.asOf`,
      ),
    policyId:
      string(
        source.policy.policyId,
        `${label}.policy.policyId`,
      ),
    policySchemaVersion:
      string(
        source.policy.schemaVersion,
        `${label}.policy.schemaVersion`,
      ),
    periodKind:
      string(
        source.policy.periodKind,
        `${label}.policy.periodKind`,
      ),
    futureRecorded:
      count(
        source.excludedActivityCount.futureRecorded,
        `${label}.excludedActivityCount.futureRecorded`,
      ),
    suppressed:
      count(
        source.excludedActivityCount.suppressed,
        `${label}.excludedActivityCount.suppressed`,
      ),
  };
}

export function projectPerformanceDailyReadModel(source) {
  const value = normalizeDay(source);
  const progressValue =
    progress(value.totalPoints, value.targetPoints);

  return freeze({
    schemaVersion:
      PERFORMANCE_DAILY_READ_MODEL_SCHEMA_VERSION,
    sourceSchemaVersion: DAILY_SOURCE_SCHEMA,
    policy: {
      schemaVersion: value.policySchemaVersion,
      policyId: value.policyId,
      periodKind: value.periodKind,
    },
    identity: {
      organizationId: value.organizationId,
      advisorId: value.advisorId,
    },
    period: {
      evaluationDate: value.evaluationDate,
      asOf: value.asOf,
    },
    headline: {
      totalPoints: value.totalPoints,
      targetPoints: value.targetPoints,
      remainingPoints: value.remainingPoints,
      excessPoints:
        Math.max(
          0,
          value.totalPoints - value.targetPoints,
        ),
      progressPercent: progressValue.percent,
      uncappedProgressPercent:
        progressValue.uncappedPercent,
      progressRatio: progressValue.ratio,
      targetStatus: value.targetStatus,
    },
    activity: {
      empty: value.eligibleActivityCount === 0,
      eligibleActivityCount:
        value.eligibleActivityCount,
      countedActivityCount:
        value.items.reduce(
          (sum, item) =>
            sum + (item.counted ? item.count : 0),
          0,
        ),
      zeroPointActivityCount:
        value.items.reduce(
          (sum, item) =>
            sum + (item.counted ? 0 : item.count),
          0,
        ),
      items: value.items,
    },
    exclusions: {
      futureRecorded: value.futureRecorded,
      suppressed: value.suppressed,
      total:
        value.futureRecorded + value.suppressed,
    },
    authority: {
      activityEligibilityAuthority: true,
      activityScoringAuthority: false,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  });
}

function aggregateActivity(days, totalPoints) {
  const aggregate =
    new Map(
      ACTIVITY_TYPES.map(
        (type) => [
          type,
          {
            activityType: type,
            count: 0,
            pointsPerActivity: null,
            awardedPoints: 0,
          },
        ],
      ),
    );

  for (const day of days) {
    for (const item of day.activity.items) {
      const current =
        aggregate.get(item.activityType);

      if (
        current.pointsPerActivity !== null &&
        current.pointsPerActivity !==
          item.pointsPerActivity
      ) {
        error(
          `point value changed inside period for ${item.activityType}`,
        );
      }

      current.pointsPerActivity =
        item.pointsPerActivity;
      current.count += item.count;
      current.awardedPoints += item.awardedPoints;
    }
  }

  return [...aggregate.values()]
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      pointsPerActivity:
        item.pointsPerActivity ?? 0,
      counted:
        (item.pointsPerActivity ?? 0) > 0,
      shareOfPointsPercent:
        totalPoints === 0
          ? 0
          : round2(
              (item.awardedPoints / totalPoints) *
                100,
            ),
      order:
        ACTIVITY_TYPES.indexOf(item.activityType),
    }))
    .sort(
      (left, right) =>
        right.awardedPoints - left.awardedPoints ||
        right.count - left.count ||
        left.order - right.order,
    )
    .map(({ order, ...item }) => item);
}

export function projectPerformancePeriodReadModel(source) {
  plain(source, "source");

  if (source.schemaVersion !== PERIOD_SOURCE_SCHEMA) {
    error("source.schemaVersion is not supported");
  }

  plain(source.policy, "source.policy");
  plain(source.authority, "source.authority");
  plain(source.period, "source.period");
  plain(source.totals, "source.totals");
  authority(
    source.authorityBoundary,
    "source.authorityBoundary",
  );

  if (
    source.authorityBoundary
      .activityEligibilityAuthority !== true
  ) {
    error(
      "source.authorityBoundary.activityEligibilityAuthority must be true",
    );
  }

  if (!Array.isArray(source.days)) {
    error("source.days must be an array");
  }

  const dayCount =
    positive(
      source.period.dayCount,
      "source.period.dayCount",
    );

  if (source.days.length !== dayCount) {
    error("source.days does not match dayCount");
  }

  const days =
    source.days.map(
      (day) =>
        projectPerformanceDailyReadModel(day),
    );

  const totalPoints =
    count(
      source.totals.totalPoints,
      "source.totals.totalPoints",
    );
  const targetPoints =
    positive(
      source.totals.targetPoints,
      "source.totals.targetPoints",
    );
  const remainingPoints =
    count(
      source.totals.remainingPoints,
      "source.totals.remainingPoints",
    );

  if (
    days.reduce(
      (sum, day) =>
        sum + day.headline.totalPoints,
      0,
    ) !== totalPoints ||
    days.reduce(
      (sum, day) =>
        sum + day.headline.targetPoints,
      0,
    ) !== targetPoints ||
    remainingPoints !==
      Math.max(0, targetPoints - totalPoints)
  ) {
    error("source period totals are inconsistent");
  }

  const targetStatus =
    status(
      source.totals.targetStatus,
      PERIOD_STATUSES,
      "source.totals.targetStatus",
    );

  const expectedStatus =
    totalPoints > targetPoints
      ? "PERIOD_TARGET_EXCEEDED"
      : totalPoints === targetPoints
        ? "PERIOD_TARGET_MET"
        : "PERIOD_BELOW_TARGET";

  if (targetStatus !== expectedStatus) {
    error("source.totals.targetStatus is inconsistent");
  }

  const averagePointsPerDay =
    finite(
      source.totals.averagePointsPerDay,
      "source.totals.averagePointsPerDay",
    );

  if (
    averagePointsPerDay !==
    round2(totalPoints / dayCount)
  ) {
    error(
      "source.totals.averagePointsPerDay is inconsistent",
    );
  }

  const targetMetDays =
    count(
      source.totals.targetMetDays,
      "source.totals.targetMetDays",
    );
  const targetExceededDays =
    count(
      source.totals.targetExceededDays,
      "source.totals.targetExceededDays",
    );
  const belowTargetDays =
    count(
      source.totals.belowTargetDays,
      "source.totals.belowTargetDays",
    );

  if (
    targetMetDays +
      targetExceededDays +
      belowTargetDays !==
    dayCount
  ) {
    error("source daily status counts are inconsistent");
  }

  const eligibleActivityCount =
    count(
      source.totals.eligibleActivityCount,
      "source.totals.eligibleActivityCount",
    );
  const futureRecorded =
    count(
      source.totals.futureRecordedExcludedCount,
      "source.totals.futureRecordedExcludedCount",
    );
  const suppressed =
    count(
      source.totals.suppressedEligibleCount,
      "source.totals.suppressedEligibleCount",
    );

  if (
    days.reduce(
      (sum, day) =>
        sum + day.activity.eligibleActivityCount,
      0,
    ) !== eligibleActivityCount ||
    days.reduce(
      (sum, day) =>
        sum + day.exclusions.futureRecorded,
      0,
    ) !== futureRecorded ||
    days.reduce(
      (sum, day) =>
        sum + day.exclusions.suppressed,
      0,
    ) !== suppressed
  ) {
    error("source period activity counts are inconsistent");
  }

  const progressValue =
    progress(totalPoints, targetPoints);

  return freeze({
    schemaVersion:
      PERFORMANCE_PERIOD_READ_MODEL_SCHEMA_VERSION,
    sourceSchemaVersion: PERIOD_SOURCE_SCHEMA,
    policy: {
      schemaVersion:
        string(
          source.policy.schemaVersion,
          "source.policy.schemaVersion",
        ),
      policyId:
        string(
          source.policy.policyId,
          "source.policy.policyId",
        ),
      dailyTargetPoints:
        positive(
          source.policy.dailyTargetPoints,
          "source.policy.dailyTargetPoints",
        ),
    },
    identity: {
      organizationId:
        string(
          source.authority.organizationId,
          "source.authority.organizationId",
        ),
      advisorId:
        string(
          source.authority.advisorId,
          "source.authority.advisorId",
        ),
    },
    period: {
      evaluationDateFrom:
        string(
          source.period.evaluationDateFrom,
          "source.period.evaluationDateFrom",
        ),
      evaluationDateTo:
        string(
          source.period.evaluationDateTo,
          "source.period.evaluationDateTo",
        ),
      asOf:
        string(
          source.period.asOf,
          "source.period.asOf",
        ),
      dayCount,
    },
    headline: {
      totalPoints,
      targetPoints,
      remainingPoints,
      excessPoints:
        Math.max(0, totalPoints - targetPoints),
      progressPercent: progressValue.percent,
      uncappedProgressPercent:
        progressValue.uncappedPercent,
      progressRatio: progressValue.ratio,
      targetStatus,
      averagePointsPerDay,
    },
    dayStatus: {
      targetMetDays,
      targetExceededDays,
      belowTargetDays,
      successfulDays:
        targetMetDays + targetExceededDays,
    },
    series:
      days.map(
        (day) => ({
          evaluationDate:
            day.period.evaluationDate,
          totalPoints:
            day.headline.totalPoints,
          targetPoints:
            day.headline.targetPoints,
          remainingPoints:
            day.headline.remainingPoints,
          progressPercent:
            day.headline.progressPercent,
          targetStatus:
            day.headline.targetStatus,
          eligibleActivityCount:
            day.activity.eligibleActivityCount,
        }),
      ),
    activity: {
      empty: eligibleActivityCount === 0,
      eligibleActivityCount,
      items:
        aggregateActivity(days, totalPoints),
    },
    exclusions: {
      futureRecorded,
      suppressed,
      total: futureRecorded + suppressed,
    },
    authority: {
      activityEligibilityAuthority: true,
      activityScoringAuthority: false,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  });
}
