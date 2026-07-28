import { ACTIVITY_TYPES } from "../../activity/domain/activity-record.mjs";

export const PERFORMANCE_SCORING_POLICY_SCHEMA_VERSION =
  "performance-scoring-policy.v1";
export const PERFORMANCE_SCORING_POLICY_ID =
  "smnyl-advisor-daily-25.v1";
export const PERFORMANCE_DAILY_TARGET_POINTS = 25;

export const PERFORMANCE_ACTIVITY_POINT_VALUES = Object.freeze({
  REFERRAL_ACQUIRED: 3,
  CONTACT_ATTEMPTED: 1,
  CONVERSATION_COMPLETED: 0,
  INITIAL_APPOINTMENT_SCHEDULED: 3,
  INITIAL_APPOINTMENT_COMPLETED: 2,
  CLOSING_APPOINTMENT_SCHEDULED: 0,
  CLOSING_APPOINTMENT_COMPLETED: 3,
  APPLICATION_SUBMITTED: 5,
  POLICY_PAID: 10,
  FOLLOW_UP_COMPLETED: 0,
});

export const PERFORMANCE_SCORING_SOURCE_BASIS = Object.freeze({
  kind: "RATIFIED_LEGACY_OPERATIONAL_RULE",
  sourcePath: "daily-points-engine.js",
  sourceRuleSet: "25-point daily productivity",
  excludedLegacyAuthorities: Object.freeze([
    "advisor-os/advisor-score-engine.js",
    "advisor-os/advisor-performance-engine.js",
  ]),
  deferredLegacyRules: Object.freeze([
    Object.freeze({
      legacyName: "referido_asesor",
      legacyPoints: 10,
      reason: "NO_CANONICAL_ACTIVITY_TYPE",
    }),
  ]),
});

const ALLOWED_KEYS = new Set([
  "schemaVersion", "policyId", "periodKind", "targetPoints",
  "pointValues", "eligibilitySource", "pointCap",
  "rankingAuthority", "humanWorthAuthority", "enforcementAuthority",
  "sourceBasis",
]);

function error(message) {
  throw new TypeError(`PerformanceScoringPolicy: ${message}`);
}
function plain(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype) {
    error(`${label} must be a plain object`);
  }
}
function exact(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) error(`${label} contains unknown field ${key}`);
  }
}
function nonNegative(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    error(`${label} must be a non-negative integer`);
  }
  return value;
}
function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}
function normalizePointValues(value) {
  plain(value, "pointValues");
  const actual = Object.keys(value).sort();
  const expected = [...ACTIVITY_TYPES].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    error("pointValues must cover every canonical Activity type exactly");
  }
  return Object.fromEntries(ACTIVITY_TYPES.map((type) => [
    type, nonNegative(value[type], `pointValues.${type}`),
  ]));
}

export function createPerformanceScoringPolicy(input = {}) {
  plain(input, "policy");
  exact(input, ALLOWED_KEYS, "policy");

  const schemaVersion = input.schemaVersion ?? PERFORMANCE_SCORING_POLICY_SCHEMA_VERSION;
  const policyId = input.policyId ?? PERFORMANCE_SCORING_POLICY_ID;
  const periodKind = input.periodKind ?? "DAILY";
  const targetPoints = input.targetPoints ?? PERFORMANCE_DAILY_TARGET_POINTS;
  const eligibilitySource = input.eligibilitySource ??
    "ACTIVITY_PERIOD_AGGREGATION.eligibleByType";
  const pointCap = input.pointCap ?? null;

  if (schemaVersion !== PERFORMANCE_SCORING_POLICY_SCHEMA_VERSION) error("schemaVersion is not supported");
  if (policyId !== PERFORMANCE_SCORING_POLICY_ID) error("policyId is not supported");
  if (periodKind !== "DAILY") error("periodKind must be DAILY");
  if (!Number.isSafeInteger(targetPoints) || targetPoints < 1) error("targetPoints must be positive");
  if (eligibilitySource !== "ACTIVITY_PERIOD_AGGREGATION.eligibleByType") error("eligibilitySource is not supported");
  if (pointCap !== null) error("pointCap must remain null in v1");
  for (const key of ["rankingAuthority", "humanWorthAuthority", "enforcementAuthority"]) {
    if ((input[key] ?? false) !== false) error(`${key} must be false`);
  }

  return deepFreeze({
    schemaVersion,
    policyId,
    periodKind,
    targetPoints,
    pointValues: normalizePointValues(input.pointValues ?? PERFORMANCE_ACTIVITY_POINT_VALUES),
    eligibilitySource,
    pointCap,
    rankingAuthority: false,
    humanWorthAuthority: false,
    enforcementAuthority: false,
    sourceBasis: JSON.parse(JSON.stringify(input.sourceBasis ?? PERFORMANCE_SCORING_SOURCE_BASIS)),
  });
}

export function assertPerformanceScoringPolicy(value) {
  return createPerformanceScoringPolicy(value);
}

export const PERFORMANCE_SCORING_POLICY_V1 = createPerformanceScoringPolicy();
