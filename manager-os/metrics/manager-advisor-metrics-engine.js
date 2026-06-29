const {
  ADVISOR_MANAGER_SNAPSHOT_STATUSES
} = require("../advisor-snapshots/advisor-manager-snapshot-engine");

const MANAGER_ADVISOR_METRICS_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_ADVISOR_METRICS_DECISIONS = Object.freeze({
  USE_AS_MANAGER_REVIEW_CONTEXT: "USE_AS_MANAGER_REVIEW_CONTEXT",
  COLLECT_METRIC_EVIDENCE: "COLLECT_METRIC_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_METRIC_CONTEXT: "REFRESH_METRIC_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
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
    createsAdvisorLifecycleTruth: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false,
    createsHumanRankingTruth: false,
    createsPromotionDecisionTruth: false
  };
}

function contextPresent(context) {
  if (!present(context)) return false;
  if (isObject(context) && present(context.value)) return true;
  return isObject(context) && Object.keys(context).length > 0;
}

function contextCount(snapshots, field) {
  return snapshots.filter((snapshot) => contextPresent(snapshot[field])).length;
}

function timelineCount(snapshots, field) {
  return snapshots.reduce((total, snapshot) => total + asArray(snapshot[field]).length, 0);
}

function buildAdvisorMetrics(snapshots) {
  const hasSnapshots = snapshots.length > 0;
  return {
    totalAdvisorSnapshots: hasSnapshots ? snapshots.length : null,
    advisorCountContext: {
      value: hasSnapshots ? unique(snapshots.map((snapshot) => snapshot.advisorId)).length : null,
      referenceOnly: true,
      createsTruth: false
    },
    activeAdvisorContext: {
      value: hasSnapshots
        ? snapshots.filter((snapshot) => snapshot.advisorStatusContext && snapshot.advisorStatusContext.value && snapshot.advisorStatusContext.value.status === "ACTIVE").length
        : null,
      referenceOnly: true,
      createsTruth: false
    },
    activitySignalCount: hasSnapshots ? timelineCount(snapshots, "activityTimeline") : null,
    followupSignalCount: hasSnapshots ? contextCount(snapshots, "followupContext") : null,
    prospectingSignalCount: hasSnapshots ? contextCount(snapshots, "prospectingContext") : null,
    referralSignalCount: hasSnapshots ? contextCount(snapshots, "referralContext") : null,
    appointmentContext: {
      count: hasSnapshots ? contextCount(snapshots, "appointmentContext") : null,
      referenceOnly: true,
      createsTruth: false
    },
    pipelineContext: {
      count: hasSnapshots ? contextCount(snapshots, "pipelineContext") : null,
      referenceOnly: true,
      createsTruth: false
    },
    productionContext: {
      count: hasSnapshots ? contextCount(snapshots, "productionContext") : null,
      referenceOnly: true,
      createsRevenueTruth: false,
      createsTruth: false
    },
    qualificationContext: {
      count: hasSnapshots ? contextCount(snapshots, "qualificationContext") : null,
      referenceOnly: true,
      createsPromotionDecisionTruth: false,
      createsTruth: false
    },
    supportNeedsContext: {
      count: hasSnapshots ? contextCount(snapshots, "supportNeedsContext") : null,
      referenceOnly: true,
      createsTruth: false
    },
    coachingNeedsContext: {
      count: hasSnapshots ? contextCount(snapshots, "coachingContext") : null,
      referenceOnly: true,
      createsTruth: false
    },
    staleAdvisorSignals: unique(snapshots.flatMap((snapshot) => asArray(snapshot.staleSignals))),
    missingAdvisorEvidence: unique(snapshots.flatMap((snapshot) => asArray(snapshot.missingEvidence))),
    defaultZeroRiskCount: snapshots.reduce((total, snapshot) => total + asArray(snapshot.defaultZeroRisks).length, 0),
    referenceOnly: true,
    createsTruth: false
  };
}

function resolveStatus({
  blockedUses,
  snapshots,
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
  if (blockedUses.length > 0) return MANAGER_ADVISOR_METRICS_STATUSES.BLOCKED;
  if (snapshots.length === 0) return MANAGER_ADVISOR_METRICS_STATUSES.UNKNOWN;
  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) return MANAGER_ADVISOR_METRICS_STATUSES.NEEDS_EVIDENCE;
  if (directSourceOwners.length === 0) return MANAGER_ADVISOR_METRICS_STATUSES.NEEDS_SOURCE_OWNER;
  if (!directFreshness.available || directFreshness.stale) return MANAGER_ADVISOR_METRICS_STATUSES.NEEDS_FRESHNESS;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return MANAGER_ADVISOR_METRICS_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return MANAGER_ADVISOR_METRICS_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_ADVISOR_METRICS_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return MANAGER_ADVISOR_METRICS_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_ADVISOR_METRICS_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function calculateManagerAdvisorMetrics({
  advisorManagerSnapshots = [],
  period = null,
  sourceEvidence = {},
  requestedUse = null,
  generatedAt = null
} = {}) {
  const snapshots = asArray(advisorManagerSnapshots).map((snapshot) => clone(snapshot));
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values: snapshots });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: snapshots });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values: snapshots });
  const directEvidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [] });
  const directSourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [] });
  const directSourceOwners = collectSourceOwners({ sourceEvidence, values: [] });
  const freshness = resolveFreshness({ sourceEvidence, values: snapshots });
  const directFreshness = resolveFreshness({ sourceEvidence, values: [] });
  const use = resolveUse(requestedUse);
  const missingEvidence = [];
  const unknownSignals = [];
  const staleSignals = [];
  const defaultZeroRisks = unique(snapshots.flatMap((snapshot) => asArray(snapshot.defaultZeroRisks)));
  const confidenceLimitations = [];
  const warnings = [];

  if (snapshots.length === 0) {
    unknownSignals.push("advisor_manager_snapshots_missing");
    warnings.push("AdvisorManagerSnapshot inputs are missing; missing advisor snapshots do not become zero advisors.");
  }

  snapshots.forEach((snapshot) => {
    if (!Array.isArray(snapshot.activityTimeline)) {
      unknownSignals.push("advisor_snapshot_activity_timeline_missing");
      warnings.push("Missing activity does not become zero activity.");
    }
    if (!contextPresent(snapshot.pipelineContext)) {
      unknownSignals.push("advisor_snapshot_pipeline_context_missing");
      warnings.push("Missing pipeline does not become low pipeline.");
    }
    if (snapshot.productionContext) {
      warnings.push("Production context is not official revenue truth.");
    }
    if (snapshot.qualificationContext) {
      warnings.push("Qualification context is not promotion truth.");
    }
    if (snapshot.advisorStatusContext) {
      warnings.push("Advisor status context is not Advisor Lifecycle truth.");
    }
  });

  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) {
    missingEvidence.push("manager_advisor_metrics_evidence_missing");
    confidenceLimitations.push("missing_advisor_metrics_evidence");
  }
  if (directSourceOwners.length === 0) {
    missingEvidence.push("manager_advisor_metrics_source_owner_missing");
    confidenceLimitations.push("missing_advisor_metrics_source_owner");
  }
  if (!directFreshness.available) {
    staleSignals.push("manager_advisor_metrics_freshness_missing");
    confidenceLimitations.push("missing_advisor_metrics_freshness");
  }
  if (directFreshness.stale) {
    staleSignals.push("manager_advisor_metrics_freshness_stale");
    confidenceLimitations.push("stale_advisor_metrics_freshness");
  }
  defaultZeroRisks.forEach((risk) => {
    confidenceLimitations.push(risk);
    warnings.push(`${risk}: explicit zero-like advisor value is metrics context only.`);
  });

  use.blockedUses.forEach((blockedUse) => warnings.push(`${blockedUse} use is blocked for advisor metrics.`));

  const assumptions = [
    "Advisor metrics count protected AdvisorManagerSnapshot context only.",
    "Production, qualification and status contexts are not revenue, promotion or lifecycle truth."
  ];
  const managerReviewRequired =
    use.blockedUses.length > 0 ||
    snapshots.length === 0 ||
    missingEvidence.length > 0 ||
    unknownSignals.length > 0 ||
    staleSignals.length > 0 ||
    defaultZeroRisks.length > 0 ||
    snapshots.some((snapshot) => snapshot.managerReviewRequired === true || snapshot.humanReviewRequired === true);
  const humanReviewRequired = managerReviewRequired;
  const metricsStatus = resolveStatus({
    blockedUses: use.blockedUses,
    snapshots,
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
    metricsStatus,
    period: period || sourceEvidence.period || null,
    generatedAt: generatedAt || sourceEvidence.generatedAt || sourceEvidence.capturedAt || null,
    advisorMetrics: buildAdvisorMetrics(snapshots),
    missingEvidence: unique(missingEvidence),
    unknownSignals: unique(unknownSignals),
    staleSignals: unique(staleSignals),
    defaultZeroRisks,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshness.value,
    assumptions: unique(assumptions),
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "Advisor metrics are manager review context only and do not create lifecycle, revenue, compensation, payout, ranking, promotion, punishment, termination or automatic decision truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...truthFlags()
  };
}

module.exports = {
  calculateManagerAdvisorMetrics,
  MANAGER_ADVISOR_METRICS_STATUSES,
  MANAGER_ADVISOR_METRICS_DECISIONS
};
