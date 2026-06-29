const MANAGER_HISTORICAL_ROLLUP_STATUSES = Object.freeze({
  READY_FOR_STORAGE_CONTEXT: "READY_FOR_STORAGE_CONTEXT",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  UNKNOWN: "UNKNOWN",
  BLOCKED: "BLOCKED",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_HISTORICAL_ROLLUP_DECISIONS = Object.freeze({
  BUILD_ROLLUP_CONTEXT: "BUILD_ROLLUP_CONTEXT",
  MARK_EXPLICIT_ZERO_CONTEXT: "MARK_EXPLICIT_ZERO_CONTEXT",
  COLLECT_ROLLUP_EVIDENCE: "COLLECT_ROLLUP_EVIDENCE",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW"
});

function present(value) { return value !== undefined && value !== null && value !== ""; }
function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function asArray(value) { if (!present(value)) return []; return Array.isArray(value) ? value.filter(present) : [value].filter(present); }
function unique(values) { return [...new Set(values.filter(present))]; }
function normalizeText(value) { return present(value) ? String(value).trim().toUpperCase() : null; }
function clone(value) { if (!present(value)) return value; return JSON.parse(JSON.stringify(value)); }
function collectFromValue(value, field) {
  if (!present(value)) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => collectFromValue(entry, field));
  if (!isObject(value)) return [];
  return [...asArray(value[field]), ...Object.values(value).flatMap((entry) => collectFromValue(entry, field))];
}
function collectEvidenceRefs(values) { return unique(values.flatMap((value) => [...asArray(value && value.evidenceRefs), ...asArray(value && value.evidenceRef), ...collectFromValue(value, "evidenceRefs")])); }
function collectSourceEvidenceIds(values) { return unique(values.flatMap((value) => [...asArray(value && value.sourceEvidenceIds), ...asArray(value && value.sourceEvidenceId), ...collectFromValue(value, "sourceEvidenceIds")])); }
function collectSourceOwners(values) { return unique(values.flatMap((value) => [...asArray(value && value.sourceOwners), ...asArray(value && value.sourceOwner), ...collectFromValue(value, "sourceOwners")])); }
function resolveFreshness(values) {
  const candidates = unique(values.flatMap((value) => [value && value.freshness, value && value.freshnessStatus, ...collectFromValue(value, "freshness")]));
  const first = candidates[0] || null;
  const status = normalizeText(isObject(first) ? first.status : first);
  return { value: first, available: candidates.length > 0, stale: status === "STALE" || status === "EXPIRED" || values.some((value) => value && value.stale === true) };
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
function resolveStatus({ metricValueContext, evidenceRefs, sourceEvidenceIds, sourceOwners, freshness, explicitZeroContext }) {
  if (!present(metricValueContext)) return MANAGER_HISTORICAL_ROLLUP_STATUSES.UNKNOWN;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_FRESHNESS;
  if (explicitZeroContext) return MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_HISTORICAL_ROLLUP_STATUSES.READY_FOR_STORAGE_CONTEXT;
}

function buildManagerHistoricalRollupContract({
  organizationId = null,
  managerId = null,
  teamId = null,
  periodId = null,
  periodStart = null,
  periodEnd = null,
  grain = null,
  metricFamily = null,
  metricKey = null,
  metricValueContext = null,
  metricStatus = null,
  evidenceRefs = [],
  sourceEvidenceIds = [],
  sourceOwners = [],
  freshness = null,
  assumptions = [],
  confidenceLimitations = [],
  warnings = [],
  generatedAt = null
} = {}) {
  const inputSnapshot = {
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness,
    generatedAt
  };
  const mergedEvidenceRefs = collectEvidenceRefs([inputSnapshot]);
  const mergedSourceEvidenceIds = collectSourceEvidenceIds([inputSnapshot]);
  const mergedSourceOwners = collectSourceOwners([inputSnapshot]);
  const freshnessContext = resolveFreshness([inputSnapshot]);
  const explicitZeroContext = metricValueContext === 0 || (isObject(metricValueContext) && metricValueContext.value === 0);
  const family = normalizeText(metricFamily);
  const missingEvidence = [];
  const unknownSignals = [];
  const staleSignals = [];
  const defaultZeroRisks = [];
  const localWarnings = [...asArray(warnings)];
  const localLimitations = [...asArray(confidenceLimitations)];

  if (!present(metricValueContext)) {
    unknownSignals.push("historical_rollup_metric_value_missing");
    localWarnings.push("Missing metricValueContext is UNKNOWN, not zero.");
  }
  if (explicitZeroContext) {
    defaultZeroRisks.push("historical_rollup_explicit_zero_requires_evidence_review");
    localWarnings.push("Explicit zero rollup value is context only and requires evidence/source/freshness.");
    localLimitations.push("explicit_zero_rollup_requires_evidence_source_freshness");
  }
  if (family === "PRODUCTION") localWarnings.push("Production rollup does not create revenue truth.");
  if (family === "QUALIFICATION") localWarnings.push("Qualification rollup does not create promotion or Advisor Lifecycle truth.");
  if (family === "TEAM_PATTERN") localWarnings.push("Team pattern rollup does not create ranking truth.");
  if (mergedEvidenceRefs.length === 0 && mergedSourceEvidenceIds.length === 0) missingEvidence.push("historical_rollup_evidence_missing");
  if (mergedSourceOwners.length === 0) missingEvidence.push("historical_rollup_source_owner_missing");
  if (!freshnessContext.available) {
    missingEvidence.push("historical_rollup_freshness_missing");
    staleSignals.push("historical_rollup_freshness_missing");
  }
  if (freshnessContext.stale) staleSignals.push("historical_rollup_freshness_stale");

  const rollupStatus = resolveStatus({
    metricValueContext,
    evidenceRefs: mergedEvidenceRefs,
    sourceEvidenceIds: mergedSourceEvidenceIds,
    sourceOwners: mergedSourceOwners,
    freshness: freshnessContext,
    explicitZeroContext
  });

  return {
    rollupStatus,
    organizationId,
    managerId,
    teamId,
    periodId,
    periodStart,
    periodEnd,
    grain,
    metricFamily,
    metricKey,
    rollupContext: {
      organizationId,
      managerId,
      teamId,
      periodId,
      periodStart,
      periodEnd,
      grain,
      metricFamily,
      metricKey,
      metricValueContext: present(metricValueContext) ? clone(metricValueContext) : "UNKNOWN",
      metricStatus: metricStatus || rollupStatus,
      explicitZeroContext,
      referenceOnly: true,
      createsTruth: false
    },
    metricValueContext: {
      value: clone(metricValueContext),
      explicitZeroContext,
      referenceOnly: true,
      createsTruth: false
    },
    metricStatus: metricStatus || rollupStatus,
    evidenceRefs: mergedEvidenceRefs,
    sourceEvidenceIds: mergedSourceEvidenceIds,
    sourceOwners: mergedSourceOwners,
    freshness: freshnessContext.value,
    assumptions: unique(asArray(assumptions)),
    confidenceLimitations: unique(localLimitations),
    warnings: unique([
      ...localWarnings,
      "Historical rollup contract defines safe future persistence shape only and performs no writes."
    ]),
    missingEvidence: unique(missingEvidence),
    unknownSignals: unique(unknownSignals),
    staleSignals: unique(staleSignals),
    defaultZeroRisks: unique(defaultZeroRisks),
    managerReviewRequired: rollupStatus !== MANAGER_HISTORICAL_ROLLUP_STATUSES.READY_FOR_STORAGE_CONTEXT,
    humanReviewRequired: rollupStatus !== MANAGER_HISTORICAL_ROLLUP_STATUSES.READY_FOR_STORAGE_CONTEXT,
    ...truthAndWriteFlags()
  };
}

module.exports = {
  buildManagerHistoricalRollupContract,
  MANAGER_HISTORICAL_ROLLUP_STATUSES,
  MANAGER_HISTORICAL_ROLLUP_DECISIONS
};
