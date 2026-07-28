import test from "node:test";
import assert from "node:assert/strict";
import { ACTIVITY_TYPES } from "../advisor-os/activity/domain/activity-record.mjs";
import {
  PERFORMANCE_ACTIVITY_POINT_VALUES,
  PERFORMANCE_DAILY_TARGET_POINTS,
  PERFORMANCE_SCORING_POLICY_ID,
  PERFORMANCE_SCORING_POLICY_SCHEMA_VERSION,
  PERFORMANCE_SCORING_POLICY_V1,
  PERFORMANCE_SCORING_SOURCE_BASIS,
  createPerformanceScoringPolicy,
} from "../advisor-os/performance/domain/performance-scoring-policy.mjs";
import {
  PERFORMANCE_SCORE_PROJECTION_SCHEMA_VERSION,
  projectPerformanceScore,
} from "../advisor-os/performance/application/performance-score-projector.mjs";

const zeroByType = () => Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, 0]));
function aggregation(overrides = {}) {
  const eligibleByType = { ...zeroByType(), ...(overrides.eligibleByType ?? {}) };
  return {
    schemaVersion: "activity-period-aggregation.v1",
    organizationId: "org-001",
    advisorId: "advisor-001",
    period: {
      evaluationDateFrom: "2026-07-27",
      evaluationDateTo: "2026-07-27",
      asOf: "2026-07-28T03:30:00.000Z",
      ...(overrides.period ?? {}),
    },
    eligibleByType,
    eligibleActivityCount: overrides.eligibleActivityCount ?? Object.values(eligibleByType).reduce((a, b) => a + b, 0),
    futureRecordedExcludedCount: overrides.futureRecordedExcludedCount ?? 0,
    suppressedEligibleCount: overrides.suppressedEligibleCount ?? 0,
  };
}

test("exports policy schema and identity", () => {
  assert.equal(PERFORMANCE_SCORING_POLICY_SCHEMA_VERSION, "performance-scoring-policy.v1");
  assert.equal(PERFORMANCE_SCORING_POLICY_ID, "smnyl-advisor-daily-25.v1");
});
test("ratifies 25 daily points", () => {
  assert.equal(PERFORMANCE_DAILY_TARGET_POINTS, 25);
  assert.equal(PERFORMANCE_SCORING_POLICY_V1.targetPoints, 25);
});
test("maps operational values", () => {
  assert.deepEqual(PERFORMANCE_ACTIVITY_POINT_VALUES, {
    REFERRAL_ACQUIRED: 3, CONTACT_ATTEMPTED: 1, CONVERSATION_COMPLETED: 0,
    INITIAL_APPOINTMENT_SCHEDULED: 3, INITIAL_APPOINTMENT_COMPLETED: 2,
    CLOSING_APPOINTMENT_SCHEDULED: 0, CLOSING_APPOINTMENT_COMPLETED: 3,
    APPLICATION_SUBMITTED: 5, POLICY_PAID: 10, FOLLOW_UP_COMPLETED: 0,
  });
});
test("covers every Activity type", () => {
  assert.deepEqual(Object.keys(PERFORMANCE_ACTIVITY_POINT_VALUES).sort(), [...ACTIVITY_TYPES].sort());
});
test("preserves source and excludes conflicting engines", () => {
  assert.equal(PERFORMANCE_SCORING_SOURCE_BASIS.sourcePath, "daily-points-engine.js");
  assert.equal(PERFORMANCE_SCORING_SOURCE_BASIS.excludedLegacyAuthorities.length, 2);
});
test("defers advisor referral", () => {
  assert.equal(PERFORMANCE_SCORING_SOURCE_BASIS.deferredLegacyRules[0].reason, "NO_CANONICAL_ACTIVITY_TYPE");
});
test("policy is deeply immutable", () => {
  assert.equal(Object.isFrozen(PERFORMANCE_SCORING_POLICY_V1), true);
  assert.equal(Object.isFrozen(PERFORMANCE_SCORING_POLICY_V1.pointValues), true);
});
test("rejects ranking authority", () => {
  assert.throws(() => createPerformanceScoringPolicy({ rankingAuthority: true }), /must be false/u);
});
test("rejects incomplete Activity coverage", () => {
  assert.throws(() => createPerformanceScoringPolicy({ pointValues: { REFERRAL_ACQUIRED: 3 } }), /cover every canonical/u);
});
test("projects exactly 25 points", () => {
  const value = projectPerformanceScore({ aggregation: aggregation({ eligibleByType: {
    REFERRAL_ACQUIRED: 1, CONTACT_ATTEMPTED: 2, INITIAL_APPOINTMENT_COMPLETED: 1,
    CLOSING_APPOINTMENT_COMPLETED: 1, APPLICATION_SUBMITTED: 1, POLICY_PAID: 1,
  } }) });
  assert.equal(value.totalPoints, 25);
  assert.equal(value.targetStatus, "TARGET_MET");
});
test("reports below target", () => {
  const value = projectPerformanceScore({ aggregation: aggregation({ eligibleByType: {
    CONTACT_ATTEMPTED: 4, INITIAL_APPOINTMENT_SCHEDULED: 1,
  } }) });
  assert.equal(value.totalPoints, 7);
  assert.equal(value.remainingPoints, 18);
});
test("allows exceeding target without cap", () => {
  const value = projectPerformanceScore({ aggregation: aggregation({ eligibleByType: { POLICY_PAID: 3 } }) });
  assert.equal(value.totalPoints, 30);
  assert.equal(value.targetStatus, "TARGET_EXCEEDED");
});
test("preserves zero-point activity", () => {
  const value = projectPerformanceScore({ aggregation: aggregation({ eligibleByType: {
    CONVERSATION_COMPLETED: 2, FOLLOW_UP_COMPLETED: 3,
  } }) });
  assert.equal(value.totalPoints, 0);
  assert.equal(value.eligibleActivityCount, 5);
});
test("rejects multi-day input", () => {
  assert.throws(() => projectPerformanceScore({ aggregation: aggregation({ period: { evaluationDateTo: "2026-07-28" } }) }), /single evaluation date/u);
});
test("rejects inconsistent counts", () => {
  assert.throws(() => projectPerformanceScore({ aggregation: aggregation({ eligibleByType: { POLICY_PAID: 1 }, eligibleActivityCount: 2 }) }), /does not match/u);
});
test("reports excluded activity", () => {
  const value = projectPerformanceScore({ aggregation: aggregation({ futureRecordedExcludedCount: 2, suppressedEligibleCount: 3 }) });
  assert.deepEqual(value.excludedActivityCount, { futureRecorded: 2, suppressed: 3 });
});
test("projection is deterministic immutable and non-punitive", () => {
  const input = aggregation({ eligibleByType: { APPLICATION_SUBMITTED: 1 } });
  const first = projectPerformanceScore({ aggregation: input });
  const second = projectPerformanceScore({ aggregation: input });
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(first.schemaVersion, PERFORMANCE_SCORE_PROJECTION_SCHEMA_VERSION);
  assert.deepEqual(first.authority, {
    activityScoringAuthority: false, performancePolicyAuthority: true,
    rankingAuthority: false, humanWorthAuthority: false, enforcementAuthority: false,
  });
  assert.doesNotMatch(JSON.stringify(first), /elite|legendario|bajo_ritmo|punishment|penalty/iu);
});
