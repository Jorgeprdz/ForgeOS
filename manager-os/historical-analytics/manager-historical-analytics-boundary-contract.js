const MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_DECISIONS = Object.freeze({
  USE_AS_MANAGER_REVIEW_CONTEXT: "USE_AS_MANAGER_REVIEW_CONTEXT",
  COLLECT_HISTORICAL_EVIDENCE: "COLLECT_HISTORICAL_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_HISTORICAL_CONTEXT: "REFRESH_HISTORICAL_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE",
  NOT_MODELED_FOR_USE: "NOT_MODELED_FOR_USE"
});

const ALLOWED_USES = Object.freeze([
  "MANAGER_REVIEW",
  "TEAM_PATTERN_CONTEXT",
  "COACHING_CONTEXT",
  "FORECAST_CONTEXT",
  "DASHBOARD_CONTEXT",
  "CONVERSATION_CONTEXT"
]);

const FORBIDDEN_USES = Object.freeze([
  "HUMAN_RANKING",
  "PROMOTION_DECISION",
  "PUNISHMENT",
  "TERMINATION",
  "COMPENSATION",
  "PAYOUT",
  "REVENUE_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "AUTOMATIC_DECISION",
  "PRECONTRACT_TRUTH",
  "HIRING_TRUTH"
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
  if (Array.isArray(value)) return value.flatMap((item) => collectFromValue(item, field));
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

function resolveFreshness({ sourceEvidence = {}, values = [] } = {}) {
  const candidates = unique([
    sourceEvidence.freshness,
    sourceEvidence.freshnessStatus,
    sourceEvidence.generatedAt,
    sourceEvidence.capturedAt,
    sourceEvidence.updatedAt,
    ...values.flatMap((value) => collectFromValue(value, "freshness")),
    ...values.flatMap((value) => collectFromValue(value, "freshnessStatus")),
    ...values.flatMap((value) => collectFromValue(value, "generatedAt")),
    ...values.flatMap((value) => collectFromValue(value, "capturedAt")),
    ...values.flatMap((value) => collectFromValue(value, "updatedAt"))
  ]);
  const explicitFreshness = sourceEvidence.freshness;
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

function truthFlags() {
  return {
    automaticDecisionAllowed: false,
    createsHumanRankingTruth: false,
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
    createsHiringTruth: false
  };
}

function periodIdOf(period) {
  if (!present(period)) return null;
  if (typeof period === "string") return period;
  return period.periodId || period.id || period.label || null;
}

function detectMissingPeriods(periodSeries = []) {
  return asArray(periodSeries)
    .filter((period) => !present(period) || normalizeText(period.status) === "MISSING" || normalizeText(period.periodStatus) === "MISSING")
    .map((period, index) => periodIdOf(period) || `period_${index}_missing`);
}

function detectBlockedPeriods(values = []) {
  return values
    .filter((value) => isObject(value) && (normalizeText(value.periodStatus) === "BLOCKED" || normalizeText(value.metricsStatus) === "BLOCKED" || normalizeText(value.boundaryStatus) === "BLOCKED"))
    .map((value, index) => periodIdOf(value.period) || value.periodId || `period_${index}_blocked`);
}

function detectStalePeriods(values = []) {
  return values
    .filter((value) => isObject(value) && (value.stale === true || normalizeText(value.periodStatus) === "STALE" || asArray(value.staleSignals).length > 0))
    .map((value, index) => periodIdOf(value.period) || value.periodId || `period_${index}_stale`);
}

function collectDefaultZeroRisks(values = []) {
  return unique(values.flatMap((value) => [
    ...asArray(value && value.defaultZeroRisks),
    ...collectFromValue(value, "defaultZeroRisks").flatMap(asArray)
  ]));
}

function resolveStatus({
  blockedUses,
  hasPeriodSeries,
  missingPeriods,
  blockedPeriods,
  evidenceRefs,
  sourceEvidenceIds,
  sourceOwners,
  directEvidenceRefs,
  directSourceEvidenceIds,
  directSourceOwners,
  directFreshness,
  freshness,
  humanReviewRequired
}) {
  if (blockedUses.length > 0) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.BLOCKED;
  if (blockedPeriods.length > 0) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW;
  if (!hasPeriodSeries || missingPeriods.length > 0) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.UNKNOWN;
  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_EVIDENCE;
  if (directSourceOwners.length === 0) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER;
  if (!directFreshness.available || directFreshness.stale) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function buildManagerHistoricalAnalyticsBoundary({
  periodSeries = [],
  metricsSeries = [],
  sourceEvidence = {},
  requestedUse = null,
  assumptions = [],
  generatedAt = null
} = {}) {
  const periods = asArray(periodSeries).map((period) => clone(period));
  const metrics = asArray(metricsSeries).map((metric) => clone(metric));
  const values = [...periods, ...metrics];
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values });
  const directEvidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [] });
  const directSourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [] });
  const directSourceOwners = collectSourceOwners({ sourceEvidence, values: [] });
  const freshness = resolveFreshness({ sourceEvidence, values });
  const directFreshness = resolveFreshness({ sourceEvidence, values: [] });
  const use = resolveUse(requestedUse);
  const missingPeriods = unique(detectMissingPeriods(periods));
  const blockedPeriods = unique(detectBlockedPeriods(values));
  const stalePeriods = unique(detectStalePeriods(values));
  const defaultZeroRisks = collectDefaultZeroRisks(values);
  const missingEvidence = [];
  const unknownSignals = [];
  const staleSignals = [];
  const confidenceLimitations = [];
  const warnings = [];
  const hasPeriodSeries = periods.length > 0;

  if (!hasPeriodSeries || missingPeriods.length > 0) {
    unknownSignals.push("historical_period_context_missing");
    warnings.push("Missing historical periods remain UNKNOWN and must not collapse to zero.");
  }

  if (blockedPeriods.length > 0) {
    warnings.push("Blocked historical periods require review and must not collapse to zero.");
  }

  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) {
    missingEvidence.push("historical_analytics_evidence_missing");
    confidenceLimitations.push("missing_historical_evidence");
    warnings.push("Historical analytics evidence is missing; missing evidence is not negative evidence.");
  }

  if (directSourceOwners.length === 0) {
    missingEvidence.push("historical_analytics_source_owner_missing");
    confidenceLimitations.push("missing_historical_source_owner");
  }

  if (!directFreshness.available) {
    staleSignals.push("historical_analytics_freshness_missing");
    confidenceLimitations.push("missing_historical_freshness");
  }

  if (directFreshness.stale || stalePeriods.length > 0) {
    staleSignals.push("historical_analytics_freshness_stale");
    confidenceLimitations.push("stale_historical_freshness");
    warnings.push("Stale historical periods require review.");
  }

  defaultZeroRisks.forEach((risk) => {
    confidenceLimitations.push(risk);
    warnings.push(`${risk}: explicit zero-like historical value is context only when evidence/source/freshness exists.`);
  });

  use.blockedUses.forEach((blockedUse) => warnings.push(`${blockedUse} use is blocked for historical analytics.`));

  const managerReviewRequired =
    use.blockedUses.length > 0 ||
    !hasPeriodSeries ||
    missingPeriods.length > 0 ||
    blockedPeriods.length > 0 ||
    missingEvidence.length > 0 ||
    staleSignals.length > 0 ||
    defaultZeroRisks.length > 0 ||
    metrics.some((metric) => metric.managerReviewRequired === true || metric.humanReviewRequired === true);
  const humanReviewRequired = managerReviewRequired;
  const boundaryStatus = resolveStatus({
    blockedUses: use.blockedUses,
    hasPeriodSeries,
    missingPeriods,
    blockedPeriods,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    directEvidenceRefs,
    directSourceEvidenceIds,
    directSourceOwners,
    directFreshness,
    freshness,
    humanReviewRequired
  });

  return {
    boundaryStatus,
    periodRange: {
      start: periodIdOf(periods[0]) || null,
      end: periodIdOf(periods[periods.length - 1]) || null,
      referenceOnly: true,
      createsTruth: false
    },
    generatedAt: generatedAt || sourceEvidence.generatedAt || sourceEvidence.capturedAt || null,
    periodCountContext: {
      value: hasPeriodSeries ? periods.length : (metrics.length || null),
      referenceOnly: true,
      createsTruth: false
    },
    missingPeriods,
    blockedPeriods,
    stalePeriods,
    unknownSignals: unique([
      ...unknownSignals,
      ...metrics.flatMap((metric) => asArray(metric.unknownSignals))
    ]),
    missingEvidence: unique(missingEvidence),
    staleSignals: unique([
      ...staleSignals,
      ...metrics.flatMap((metric) => asArray(metric.staleSignals))
    ]),
    defaultZeroRisks,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshness.value,
    assumptions: unique(asArray(assumptions)),
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "Historical analytics are manager review context only and do not create ranking, promotion, punishment, termination, lifecycle, revenue, compensation, payout, precontract, hiring or automatic decision truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...truthFlags()
  };
}

module.exports = {
  buildManagerHistoricalAnalyticsBoundary,
  MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES,
  MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_DECISIONS
};
