const MANAGER_HISTORICAL_QUERY_PLAN_STATUSES = Object.freeze({
  READY_FOR_QUERY_PLANNING_CONTEXT: "READY_FOR_QUERY_PLANNING_CONTEXT",
  NEEDS_PERIOD_RANGE: "NEEDS_PERIOD_RANGE",
  NEEDS_MANAGER_OR_TEAM_SCOPE: "NEEDS_MANAGER_OR_TEAM_SCOPE",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_HISTORICAL_QUERY_PLAN_DECISIONS = Object.freeze({
  USE_PERIOD_ROLLUPS: "USE_PERIOD_ROLLUPS",
  AVOID_RAW_EVENT_SCANS: "AVOID_RAW_EVENT_SCANS",
  REQUIRE_PERIOD_RANGE: "REQUIRE_PERIOD_RANGE",
  REQUIRE_MANAGER_OR_TEAM_SCOPE: "REQUIRE_MANAGER_OR_TEAM_SCOPE",
  REQUIRE_FRESHNESS: "REQUIRE_FRESHNESS",
  BLOCK_UNSAFE_SOURCE_SCAN: "BLOCK_UNSAFE_SOURCE_SCAN",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const ALLOWED_USES = Object.freeze([
  "MANAGER_REVIEW",
  "HISTORICAL_ANALYTICS_CONTEXT",
  "TEAM_PATTERN_CONTEXT",
  "COACHING_CONTEXT",
  "FORECAST_CONTEXT",
  "DASHBOARD_CONTEXT",
  "CONVERSATION_CONTEXT",
  "STORAGE_PLANNING_CONTEXT",
  "QUERY_PLANNING_CONTEXT"
]);

const FORBIDDEN_USES = Object.freeze([
  "HUMAN_RANKING",
  "PERFORMANCE_LEADERBOARD",
  "PROMOTION_DECISION",
  "PUNISHMENT",
  "TERMINATION",
  "COMPENSATION",
  "PAYOUT",
  "REVENUE_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "AUTOMATIC_DECISION",
  "PRECONTRACT_TRUTH",
  "HIRING_TRUTH",
  "DATABASE_WRITE",
  "FILESYSTEM_WRITE",
  "CACHE_WRITE",
  "MIGRATION_WRITE",
  "SCHEMA_WRITE"
]);

const UNSAFE_SOURCES = Object.freeze([
  "RAW_ADVISOR_OS_SCAN",
  "RAW_RECRUITMENT_FULL_SCAN",
  "LEGACY_MANAGER_DASHBOARD_SCAN",
  "LEGACY_MANAGER_MOMENTUM_SCAN",
  "COMPENSATION_SOURCE_SCAN",
  "REVENUE_SOURCE_SCAN",
  "PAYOUT_SOURCE_SCAN",
  "ADVISOR_LIFECYCLE_SOURCE_SCAN"
]);

function present(value) { return value !== undefined && value !== null && value !== ""; }
function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function asArray(value) { if (!present(value)) return []; return Array.isArray(value) ? value.filter(present) : [value].filter(present); }
function unique(values) { return [...new Set(values.filter(present))]; }
function normalizeText(value) { return present(value) ? String(value).trim().toUpperCase() : null; }
function clone(value) { if (!present(value)) return value; return JSON.parse(JSON.stringify(value)); }
function resolveUse(requestedUse) {
  const normalized = normalizeText(requestedUse);
  if (!normalized) return { allowedUses: ["QUERY_PLANNING_CONTEXT"], blockedUses: [], forbiddenUses: [], unknownUses: [] };
  if (FORBIDDEN_USES.includes(normalized)) return { allowedUses: [], blockedUses: [normalized], forbiddenUses: [normalized], unknownUses: [] };
  if (ALLOWED_USES.includes(normalized)) return { allowedUses: [normalized], blockedUses: [], forbiddenUses: [], unknownUses: [] };
  return { allowedUses: [], blockedUses: [normalized], forbiddenUses: [], unknownUses: [normalized] };
}
function freshnessAvailable(sourceEvidence) {
  return present(sourceEvidence.freshness) || present(sourceEvidence.freshnessStatus) || present(sourceEvidence.generatedAt) || present(sourceEvidence.capturedAt);
}
function truthAndWriteFlags() {
  return {
    automaticDecisionAllowed: false,
    createsHumanRankingTruth: false,
    createsPerformanceLeaderboardTruth: false,
    createsPromotionDecisionTruth: false,
    createsPunishmentTruth: false,
    createsTerminationTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false,
    createsPrecontractTruth: false,
    createsHiringTruth: false,
    createsDatabaseWrite: false,
    createsFilesystemWrite: false,
    createsCacheWrite: false,
    createsMigrationWrite: false,
    createsSchemaWrite: false,
    executesQuery: false
  };
}
function detectUnsafeSources(sourceEvidence) {
  return unique([
    ...asArray(sourceEvidence.requestedSources),
    ...asArray(sourceEvidence.sourceTypes),
    ...asArray(sourceEvidence.scanPlan),
    ...asArray(sourceEvidence.unsafeSources)
  ].map(normalizeText).filter((item) => UNSAFE_SOURCES.includes(item)));
}
function resolveStatus({ forbiddenUses, unknownUses, unsafeSources, periodRange, managerId, teamId, sourceEvidence }) {
  if (forbiddenUses.length > 0 || unsafeSources.length > 0) return MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.BLOCKED;
  if (unknownUses.length > 0) return MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NOT_MODELED;
  if (!present(periodRange) || (!present(periodRange.periodStart) && !present(periodRange.start))) return MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NEEDS_PERIOD_RANGE;
  if (!present(managerId) && !present(teamId)) return MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NEEDS_MANAGER_OR_TEAM_SCOPE;
  if (!freshnessAvailable(sourceEvidence)) return MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NEEDS_FRESHNESS;
  return MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.READY_FOR_QUERY_PLANNING_CONTEXT;
}

function buildManagerHistoricalQueryPlanContract({
  managerId = null,
  teamId = null,
  periodRange = null,
  grain = null,
  metricFamilies = [],
  metricKeys = [],
  requestedUse = null,
  sourceEvidence = {},
  unsafeSources: unsafeSourcesInput = []
} = {}) {
  const use = resolveUse(requestedUse);
  const sourceEvidenceWithUnsafe = { ...sourceEvidence, unsafeSources: unsafeSourcesInput };
  const unsafeSources = detectUnsafeSources(sourceEvidenceWithUnsafe);
  const missingPrerequisites = [];
  const staleSignals = [];
  const warnings = [];
  const confidenceLimitations = [];

  if (!present(periodRange) || (!present(periodRange.periodStart) && !present(periodRange.start))) {
    missingPrerequisites.push("historical_query_plan_period_range_required");
    warnings.push("Missing period range requires review.");
  }
  if (!present(managerId) && !present(teamId)) {
    missingPrerequisites.push("historical_query_plan_manager_or_team_scope_required");
    warnings.push("Missing manager/team scope requires review.");
  }
  if (!freshnessAvailable(sourceEvidence)) {
    missingPrerequisites.push("historical_query_freshness_required");
    staleSignals.push("historical_query_plan_freshness_missing");
    confidenceLimitations.push("missing_query_freshness");
    warnings.push("Missing freshness requirement requires review.");
  }
  unsafeSources.forEach((source) => warnings.push(`${source} is blocked; use period rollups instead of unsafe raw/source scans.`));
  use.blockedUses.forEach((blockedUse) => warnings.push(`${blockedUse} use is blocked for historical query planning.`));

  const queryPlanStatus = resolveStatus({
    forbiddenUses: use.forbiddenUses,
    unknownUses: use.unknownUses,
    unsafeSources,
    periodRange,
    managerId,
    teamId,
    sourceEvidence
  });
  const managerReviewRequired = queryPlanStatus !== MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.READY_FOR_QUERY_PLANNING_CONTEXT;
  const humanReviewRequired = managerReviewRequired;

  return {
    queryPlanStatus,
    queryPlan: {
      recommendedSource: "PERIOD_ROLLUPS",
      executeQuery: false,
      usePeriodRollups: true,
      avoidRawEventFullScans: true,
      indexes: unique(["managerId", "teamId", "periodStart", "grain", "metricFamily", "metricKey"]),
      filters: {
        managerId,
        teamId,
        periodRange: clone(periodRange),
        grain,
        metricFamilies: unique(asArray(metricFamilies)),
        metricKeys: unique(asArray(metricKeys))
      },
      preserveEvidenceFreshnessRequirements: true,
      referenceOnly: true,
      createsTruth: false
    },
    unsafeSources,
    blockedSources: unique(unsafeSources),
    missingPrerequisites: unique(missingPrerequisites),
    staleSignals: unique(staleSignals),
    evidenceRefs: unique(asArray(sourceEvidence.evidenceRefs)),
    sourceEvidenceIds: unique(asArray(sourceEvidence.sourceEvidenceIds)),
    sourceOwners: unique(asArray(sourceEvidence.sourceOwners)),
    freshness: sourceEvidence.freshness || sourceEvidence.freshnessStatus || sourceEvidence.generatedAt || sourceEvidence.capturedAt || null,
    assumptions: unique(["Query plan contract recommends future rollup reads only and executes no query."]),
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "Historical query plan contract does not execute database, filesystem, or cache calls."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...truthAndWriteFlags()
  };
}

module.exports = {
  buildManagerHistoricalQueryPlanContract,
  MANAGER_HISTORICAL_QUERY_PLAN_STATUSES,
  MANAGER_HISTORICAL_QUERY_PLAN_DECISIONS
};
