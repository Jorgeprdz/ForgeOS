const MANAGER_METRICS_BOUNDARY_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_METRICS_BOUNDARY_DECISIONS = Object.freeze({
  USE_AS_MANAGER_REVIEW_CONTEXT: "USE_AS_MANAGER_REVIEW_CONTEXT",
  COLLECT_METRIC_EVIDENCE: "COLLECT_METRIC_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_METRIC_CONTEXT: "REFRESH_METRIC_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE",
  NOT_MODELED_FOR_USE: "NOT_MODELED_FOR_USE"
});

const ALLOWED_USES = Object.freeze([
  "MANAGER_REVIEW",
  "TEAM_PATTERN_CONTEXT",
  "COACHING_CONTEXT",
  "FORECAST_CONTEXT",
  "HISTORICAL_ANALYTICS_CONTEXT",
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
  const status = normalizeText(
    isObject(explicitFreshness)
      ? explicitFreshness.status
      : explicitFreshness || sourceEvidence.freshnessStatus
  );
  const stale =
    status === "STALE" ||
    status === "EXPIRED" ||
    sourceEvidence.isFresh === false ||
    values.some((value) => isObject(value) && value.stale === true);

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
    createsAdvisorLifecycleTruth: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false
  };
}

function resolveBoundaryStatus({
  blockedUses,
  hasSnapshots,
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
  if (blockedUses.length > 0) return MANAGER_METRICS_BOUNDARY_STATUSES.BLOCKED;
  if (!hasSnapshots) return MANAGER_METRICS_BOUNDARY_STATUSES.UNKNOWN;
  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) return MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_EVIDENCE;
  if (directSourceOwners.length === 0) return MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER;
  if (!directFreshness.available || directFreshness.stale) return MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_METRICS_BOUNDARY_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function buildManagerMetricsBoundary({
  candidateManagerSnapshots = [],
  advisorManagerSnapshots = [],
  recruitmentMetrics = null,
  advisorMetrics = null,
  teamMetricsContext = null,
  period = null,
  sourceEvidence = {},
  requestedUse = null,
  assumptions = [],
  generatedAt = null
} = {}) {
  const candidateSnapshots = asArray(candidateManagerSnapshots).map((snapshot) => clone(snapshot));
  const advisorSnapshots = asArray(advisorManagerSnapshots).map((snapshot) => clone(snapshot));
  const values = [
    candidateSnapshots,
    advisorSnapshots,
    recruitmentMetrics,
    advisorMetrics,
    teamMetricsContext
  ].filter(present);
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values });
  const directEvidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [] });
  const directSourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [] });
  const directSourceOwners = collectSourceOwners({ sourceEvidence, values: [] });
  const freshness = resolveFreshness({ sourceEvidence, values });
  const directFreshness = resolveFreshness({ sourceEvidence, values: [] });
  const use = resolveUse(requestedUse);
  const missingEvidence = [];
  const unknownSignals = [];
  const staleSignals = [];
  const defaultZeroRisks = unique([
    ...values.flatMap((value) => collectFromValue(value, "defaultZeroRisks")).flatMap(asArray)
  ]);
  const confidenceLimitations = [];
  const warnings = [];
  const hasSnapshots = candidateSnapshots.length > 0 || advisorSnapshots.length > 0;

  if (!hasSnapshots) {
    unknownSignals.push("manager_metrics_snapshot_context_missing");
    warnings.push("Manager metrics snapshot context is missing; unknown is not zero.");
  }

  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) {
    missingEvidence.push("manager_metrics_evidence_missing");
    confidenceLimitations.push("missing_metrics_evidence");
    warnings.push("Manager metrics evidence is missing; missing evidence is not negative evidence.");
  }

  if (directSourceOwners.length === 0) {
    missingEvidence.push("manager_metrics_source_owner_missing");
    confidenceLimitations.push("missing_metrics_source_owner");
    warnings.push("Manager metrics source owner is missing.");
  }

  if (!directFreshness.available) {
    staleSignals.push("manager_metrics_freshness_missing");
    confidenceLimitations.push("missing_metrics_freshness");
    warnings.push("Manager metrics freshness is missing.");
  }

  if (directFreshness.stale) {
    staleSignals.push("manager_metrics_freshness_stale");
    confidenceLimitations.push("stale_metrics_freshness");
    warnings.push("Manager metrics freshness is stale.");
  }

  defaultZeroRisks.forEach((risk) => {
    confidenceLimitations.push(risk);
    warnings.push(`${risk}: zero-like metric context requires evidence/source/freshness review.`);
  });

  use.blockedUses.forEach((blockedUse) => {
    warnings.push(`${blockedUse} use is blocked for Manager OS metrics.`);
  });

  const managerReviewRequired =
    use.blockedUses.length > 0 ||
    !hasSnapshots ||
    missingEvidence.length > 0 ||
    staleSignals.length > 0 ||
    defaultZeroRisks.length > 0 ||
    values.some((value) => isObject(value) && value.managerReviewRequired === true);
  const humanReviewRequired = managerReviewRequired;
  const boundaryStatus = resolveBoundaryStatus({
    blockedUses: use.blockedUses,
    hasSnapshots,
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
    period: period || sourceEvidence.period || null,
    generatedAt: generatedAt || sourceEvidence.generatedAt || sourceEvidence.capturedAt || null,
    candidateSnapshotCountContext: {
      value: hasSnapshots ? candidateSnapshots.length : null,
      referenceOnly: true,
      createsTruth: false
    },
    advisorSnapshotCountContext: {
      value: hasSnapshots ? advisorSnapshots.length : null,
      referenceOnly: true,
      createsTruth: false
    },
    metricsContext: {
      recruitmentMetrics: clone(recruitmentMetrics),
      advisorMetrics: clone(advisorMetrics),
      teamMetricsContext: clone(teamMetricsContext),
      referenceOnly: true,
      createsTruth: false
    },
    missingEvidence: unique(missingEvidence),
    unknownSignals: unique([
      ...unknownSignals,
      ...values.flatMap((value) => collectFromValue(value, "unknownSignals")).flatMap(asArray)
    ]),
    staleSignals: unique([
      ...staleSignals,
      ...values.flatMap((value) => collectFromValue(value, "staleSignals")).flatMap(asArray)
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
      "Manager metrics are review context only and do not create payout, compensation, revenue, lifecycle, ranking, promotion, punishment, termination or automatic decision truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...truthFlags()
  };
}

module.exports = {
  buildManagerMetricsBoundary,
  MANAGER_METRICS_BOUNDARY_STATUSES,
  MANAGER_METRICS_BOUNDARY_DECISIONS
};
