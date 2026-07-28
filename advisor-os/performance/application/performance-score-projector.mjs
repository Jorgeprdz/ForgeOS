import { ACTIVITY_TYPES } from "../../activity/domain/activity-record.mjs";
import {
  PERFORMANCE_SCORING_POLICY_V1,
  assertPerformanceScoringPolicy,
} from "../domain/performance-scoring-policy.mjs";

export const PERFORMANCE_SCORE_PROJECTION_SCHEMA_VERSION =
  "performance-score-projection.v1";

function error(message) {
  throw new TypeError(`PerformanceScoreProjection: ${message}`);
}
function plain(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype) {
    error(`${label} must be a plain object`);
  }
}
function string(value, label) {
  if (typeof value !== "string" || value.trim() === "") error(`${label} must be a non-empty string`);
  return value.trim();
}
function count(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) error(`${label} must be a non-negative integer`);
  return value;
}
function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}
function normalizeEligible(value) {
  plain(value, "aggregation.eligibleByType");
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...ACTIVITY_TYPES].sort())) {
    error("eligibleByType must cover every canonical Activity type exactly");
  }
  return Object.fromEntries(ACTIVITY_TYPES.map((type) => [
    type, count(value[type], `aggregation.eligibleByType.${type}`),
  ]));
}
function status(points, target) {
  if (points > target) return "TARGET_EXCEEDED";
  if (points === target) return "TARGET_MET";
  return "BELOW_TARGET";
}

export function projectPerformanceScore({ aggregation, policy = PERFORMANCE_SCORING_POLICY_V1 }) {
  plain(aggregation, "aggregation");
  if (aggregation.schemaVersion !== "activity-period-aggregation.v1") {
    error("aggregation schemaVersion is not supported");
  }
  plain(aggregation.period, "aggregation.period");
  const from = string(aggregation.period.evaluationDateFrom, "aggregation.period.evaluationDateFrom");
  const to = string(aggregation.period.evaluationDateTo, "aggregation.period.evaluationDateTo");
  if (from !== to) error("v1 requires a single evaluation date");

  const normalizedPolicy = assertPerformanceScoringPolicy(policy);
  const eligibleByType = normalizeEligible(aggregation.eligibleByType);
  const eligibleActivityCount = count(aggregation.eligibleActivityCount, "aggregation.eligibleActivityCount");
  const computedCount = Object.values(eligibleByType).reduce((sum, value) => sum + value, 0);
  if (computedCount !== eligibleActivityCount) error("eligibleActivityCount does not match eligibleByType");

  const breakdown = ACTIVITY_TYPES.map((activityType) => {
    const activityCount = eligibleByType[activityType];
    const pointsPerActivity = normalizedPolicy.pointValues[activityType];
    return {
      activityType,
      count: activityCount,
      pointsPerActivity,
      awardedPoints: activityCount * pointsPerActivity,
      counted: pointsPerActivity > 0,
    };
  });
  const totalPoints = breakdown.reduce((sum, item) => sum + item.awardedPoints, 0);

  return deepFreeze({
    schemaVersion: PERFORMANCE_SCORE_PROJECTION_SCHEMA_VERSION,
    policy: {
      schemaVersion: normalizedPolicy.schemaVersion,
      policyId: normalizedPolicy.policyId,
      periodKind: normalizedPolicy.periodKind,
    },
    organizationId: string(aggregation.organizationId, "aggregation.organizationId"),
    advisorId: string(aggregation.advisorId, "aggregation.advisorId"),
    period: {
      evaluationDate: from,
      asOf: string(aggregation.period.asOf, "aggregation.period.asOf"),
    },
    totalPoints,
    targetPoints: normalizedPolicy.targetPoints,
    remainingPoints: Math.max(0, normalizedPolicy.targetPoints - totalPoints),
    targetStatus: status(totalPoints, normalizedPolicy.targetPoints),
    eligibleActivityCount,
    excludedActivityCount: {
      futureRecorded: count(aggregation.futureRecordedExcludedCount ?? 0, "aggregation.futureRecordedExcludedCount"),
      suppressed: count(aggregation.suppressedEligibleCount ?? 0, "aggregation.suppressedEligibleCount"),
    },
    breakdown,
    authority: {
      activityScoringAuthority: false,
      performancePolicyAuthority: true,
      rankingAuthority: false,
      humanWorthAuthority: false,
      enforcementAuthority: false,
    },
  });
}
