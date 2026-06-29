const MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_HISTORICAL_STORAGE_BOUNDARY_DECISIONS = Object.freeze({
  USE_AS_STORAGE_BOUNDARY_CONTEXT: "USE_AS_STORAGE_BOUNDARY_CONTEXT",
  PLAN_HISTORICAL_STORAGE_CONTEXT: "PLAN_HISTORICAL_STORAGE_CONTEXT",
  COLLECT_STORAGE_EVIDENCE: "COLLECT_STORAGE_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_STORAGE_CONTEXT: "REFRESH_STORAGE_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
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

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function normalizeText(value) {
  return present(value) ? String(value).trim().toUpperCase() : null;
}

function clone(value) {
  if (!present(value)) return value;
  return JSON.parse(JSON.stringify(value));
}

function collectFromValue(value, field) {
  if (!present(value)) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => collectFromValue(entry, field));
  if (!isObject(value)) return [];
  return [
    ...asArray(value[field]),
    ...Object.values(value).flatMap((entry) => collectFromValue(entry, field))
  ];
}

function collectEvidenceRefs({ sourceEvidence = {}, values = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.evidenceRefs),
    ...asArray(sourceEvidence.evidenceRef),
    ...values.flatMap((value) => collectFromValue(value, "evidenceRefs")),
    ...values.flatMap((value) => collectFromValue(value, "evidenceRef"))
  ]);
}

function collectSourceEvidenceIds({ sourceEvidence = {}, values = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceEvidenceIds),
    ...asArray(sourceEvidence.sourceEvidenceId),
    ...values.flatMap((value) => collectFromValue(value, "sourceEvidenceIds")),
    ...values.flatMap((value) => collectFromValue(value, "sourceEvidenceId"))
  ]);
}

function collectSourceOwners({ sourceEvidence = {}, values = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceOwners),
    ...asArray(sourceEvidence.sourceOwner),
    ...values.flatMap((value) => collectFromValue(value, "sourceOwners")),
    ...values.flatMap((value) => collectFromValue(value, "sourceOwner"))
  ]);
}

function resolveFreshness({ freshness = null, sourceEvidence = {}, values = [] } = {}) {
  const candidates = unique([
    freshness,
    sourceEvidence.freshness,
    sourceEvidence.freshnessStatus,
    sourceEvidence.generatedAt,
    sourceEvidence.capturedAt,
    sourceEvidence.updatedAt,
    ...values.flatMap((value) => collectFromValue(value, "freshness")),
    ...values.flatMap((value) => collectFromValue(value, "freshnessStatus"))
  ]);
  const explicitFreshness = freshness || sourceEvidence.freshness;
  const status = normalizeText(isObject(explicitFreshness) ? explicitFreshness.status : explicitFreshness || sourceEvidence.freshnessStatus);
  const stale =
    status === "STALE" ||
    status === "EXPIRED" ||
    sourceEvidence.isFresh === false ||
    values.some((value) => isObject(value) && (value.stale === true || normalizeText(value.periodStatus) === "STALE"));

  return {
    value: explicitFreshness || sourceEvidence.freshnessStatus || candidates[0] || null,
    available: candidates.length > 0,
    stale
  };
}

function resolveUse(requestedUse) {
  const normalized = normalizeText(requestedUse);
  if (!normalized) return { allowedUses: ["MANAGER_REVIEW"], blockedUses: [] };
  if (FORBIDDEN_USES.includes(normalized)) return { allowedUses: [], blockedUses: [normalized] };
  if (ALLOWED_USES.includes(normalized)) return { allowedUses: [normalized], blockedUses: [] };
  return { allowedUses: [], blockedUses: [normalized] };
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
    createsSchemaWrite: false
  };
}

function detectRollups(storageContext) {
  if (!isObject(storageContext)) return [];
  return asArray(storageContext.rollups || storageContext.historicalRollups || storageContext.periodRollups);
}

function periodIdOf(value, fallback) {
  if (!present(value)) return fallback;
  if (typeof value === "string") return value;
  return value.periodId || value.id || value.period && (value.period.periodId || value.period.id) || fallback;
}

function detectBlockedPeriods(values) {
  return values
    .filter((value) => isObject(value) && (normalizeText(value.periodStatus) === "BLOCKED" || normalizeText(value.storageStatus) === "BLOCKED" || normalizeText(value.rollupStatus) === "BLOCKED"))
    .map((value, index) => periodIdOf(value, `period_${index}_blocked`));
}

function detectStalePeriods(values) {
  return values
    .filter((value) => isObject(value) && (value.stale === true || normalizeText(value.periodStatus) === "STALE" || asArray(value.staleSignals).length > 0))
    .map((value, index) => periodIdOf(value, `period_${index}_stale`));
}

function collectDefaultZeroRisks(values) {
  return unique(values.flatMap((value) => [
    ...asArray(value && value.defaultZeroRisks),
    ...collectFromValue(value, "defaultZeroRisks").flatMap(asArray)
  ]));
}

function resolveStatus({ blockedUses, hasStorageContext, rollups, evidenceRefs, sourceEvidenceIds, sourceOwners, directEvidenceRefs, directSourceEvidenceIds, directSourceOwners, directFreshness, freshness, blockedPeriods, humanReviewRequired }) {
  if (blockedUses.length > 0) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.BLOCKED;
  if (!hasStorageContext || rollups.length === 0) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.UNKNOWN;
  if (blockedPeriods.length > 0) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW;
  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_EVIDENCE;
  if (directSourceOwners.length === 0) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER;
  if (!directFreshness.available || directFreshness.stale) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_FRESHNESS;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function buildManagerHistoricalStorageBoundary({
  storageContext = null,
  requestedUse = null,
  sourceEvidence = {},
  freshness = null,
  periodRange = null
} = {}) {
  const safeStorageContext = clone(storageContext);
  const rollups = detectRollups(safeStorageContext);
  const values = [safeStorageContext, rollups].filter(present);
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values });
  const directEvidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [] });
  const directSourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [] });
  const directSourceOwners = collectSourceOwners({ sourceEvidence, values: [] });
  const freshnessContext = resolveFreshness({ freshness, sourceEvidence, values });
  const directFreshness = resolveFreshness({ freshness, sourceEvidence, values: [] });
  const use = resolveUse(requestedUse);
  const hasStorageContext = present(safeStorageContext);
  const missingEvidence = [];
  const staleSignals = [];
  const unknownSignals = [];
  const confidenceLimitations = [];
  const warnings = [];
  const blockedPeriods = unique(detectBlockedPeriods(rollups));
  const stalePeriods = unique(detectStalePeriods(rollups));
  const defaultZeroRisks = collectDefaultZeroRisks(values);

  if (!hasStorageContext) {
    unknownSignals.push("historical_storage_context_missing");
    warnings.push("Missing storage context is UNKNOWN, not zero.");
  }

  if (hasStorageContext && rollups.length === 0) {
    unknownSignals.push("historical_rollups_missing");
    warnings.push("Missing rollups are UNKNOWN, not poor performance.");
  }

  if (blockedPeriods.length > 0) warnings.push("Blocked periods require review and do not collapse to zero.");

  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) {
    missingEvidence.push("historical_storage_evidence_missing");
    confidenceLimitations.push("missing_storage_evidence");
  }
  if (directSourceOwners.length === 0) {
    missingEvidence.push("historical_storage_source_owner_missing");
    confidenceLimitations.push("missing_storage_source_owner");
  }
  if (!directFreshness.available) {
    staleSignals.push("historical_storage_freshness_missing");
    confidenceLimitations.push("missing_storage_freshness");
  }
  if (directFreshness.stale || stalePeriods.length > 0) {
    staleSignals.push("historical_storage_freshness_stale");
    confidenceLimitations.push("stale_storage_freshness");
    warnings.push("Stale storage/freshness requires review.");
  }
  defaultZeroRisks.forEach((risk) => {
    confidenceLimitations.push(risk);
    warnings.push(`${risk}: explicit zero value is storage context only when evidence/source/freshness exists.`);
  });
  use.blockedUses.forEach((blockedUse) => warnings.push(`${blockedUse} use is blocked for historical storage boundary.`));

  const managerReviewRequired =
    use.blockedUses.length > 0 ||
    !hasStorageContext ||
    rollups.length === 0 ||
    blockedPeriods.length > 0 ||
    missingEvidence.length > 0 ||
    staleSignals.length > 0 ||
    defaultZeroRisks.length > 0;
  const humanReviewRequired = managerReviewRequired;

  return {
    storageBoundaryStatus: resolveStatus({ blockedUses: use.blockedUses, hasStorageContext, rollups, evidenceRefs, sourceEvidenceIds, sourceOwners, directEvidenceRefs, directSourceEvidenceIds, directSourceOwners, directFreshness, freshness: freshnessContext, blockedPeriods, humanReviewRequired }),
    periodRange: clone(periodRange || (safeStorageContext && safeStorageContext.periodRange) || null),
    storageContext: {
      value: safeStorageContext,
      referenceOnly: true,
      createsTruth: false,
      createsWrite: false
    },
    rollupCountContext: {
      value: hasStorageContext ? rollups.length : null,
      referenceOnly: true,
      createsTruth: false
    },
    missingEvidence: unique(missingEvidence),
    unknownSignals: unique(unknownSignals),
    staleSignals: unique(staleSignals),
    blockedPeriods,
    stalePeriods,
    defaultZeroRisks,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshnessContext.value,
    assumptions: unique(["Storage boundary validates future storage context only; it does not persist data."]),
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "Historical storage boundary contracts do not create database, filesystem, cache, migration, or schema writes.",
      "Stored historical rollups are context only and do not create payout, compensation, revenue, lifecycle, ranking, promotion, punishment, termination, precontract, hiring, or automatic decision truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...truthAndWriteFlags()
  };
}

module.exports = {
  buildManagerHistoricalStorageBoundary,
  MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES,
  MANAGER_HISTORICAL_STORAGE_BOUNDARY_DECISIONS
};
