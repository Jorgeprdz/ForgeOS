const {
  buildManagerHistoricalAnalyticsBoundary
} = require("./manager-historical-analytics-boundary-contract");

const MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_ADVISOR_HISTORICAL_ANALYTICS_DECISIONS = Object.freeze({
  USE_AS_MANAGER_REVIEW_CONTEXT: "USE_AS_MANAGER_REVIEW_CONTEXT",
  COMPARE_ADVISOR_PERIODS: "COMPARE_ADVISOR_PERIODS",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const ALLOWED_USES = Object.freeze(["MANAGER_REVIEW", "TEAM_PATTERN_CONTEXT", "COACHING_CONTEXT", "FORECAST_CONTEXT", "DASHBOARD_CONTEXT", "CONVERSATION_CONTEXT"]);
const FORBIDDEN_USES = Object.freeze(["HUMAN_RANKING", "PROMOTION_DECISION", "PUNISHMENT", "TERMINATION", "COMPENSATION", "PAYOUT", "REVENUE_TRUTH", "ADVISOR_LIFECYCLE_TRUTH", "AUTOMATIC_DECISION", "PRECONTRACT_TRUTH", "HIRING_TRUTH"]);

function present(value) { return value !== undefined && value !== null && value !== ""; }
function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function asArray(value) { if (!present(value)) return []; return Array.isArray(value) ? value.filter(present) : [value].filter(present); }
function unique(values) { return [...new Set(values.filter(present))]; }
function normalizeText(value) { return present(value) ? String(value).trim().toUpperCase() : null; }
function clone(value) { if (!present(value)) return value; return JSON.parse(JSON.stringify(value)); }
function valueAtPath(object, path) { return path.split(".").reduce((current, key) => (current && current[key] !== undefined ? current[key] : null), object); }
function collectFromValue(value, field) {
  if (!present(value)) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectFromValue(item, field));
  if (!isObject(value)) return [];
  return [...asArray(value[field]), ...Object.values(value).flatMap((entry) => collectFromValue(entry, field))];
}
function collectEvidenceRefs({ sourceEvidence = {}, values = [] } = {}) {
  return unique([...asArray(sourceEvidence.evidenceRefs), ...asArray(sourceEvidence.evidenceRef), ...values.flatMap((value) => collectFromValue(value, "evidenceRefs")), ...values.flatMap((value) => collectFromValue(value, "evidenceRef"))]);
}
function collectSourceEvidenceIds({ sourceEvidence = {}, values = [] } = {}) {
  return unique([...asArray(sourceEvidence.sourceEvidenceIds), ...asArray(sourceEvidence.sourceEvidenceId), ...values.flatMap((value) => collectFromValue(value, "sourceEvidenceIds")), ...values.flatMap((value) => collectFromValue(value, "sourceEvidenceId"))]);
}
function collectSourceOwners({ sourceEvidence = {}, values = [] } = {}) {
  return unique([...asArray(sourceEvidence.sourceOwners), ...asArray(sourceEvidence.sourceOwner), ...values.flatMap((value) => collectFromValue(value, "sourceOwners")), ...values.flatMap((value) => collectFromValue(value, "sourceOwner"))]);
}
function resolveFreshness({ sourceEvidence = {}, values = [] } = {}) {
  const candidates = unique([sourceEvidence.freshness, sourceEvidence.freshnessStatus, sourceEvidence.generatedAt, sourceEvidence.capturedAt, sourceEvidence.updatedAt, ...values.flatMap((value) => collectFromValue(value, "freshness")), ...values.flatMap((value) => collectFromValue(value, "freshnessStatus"))]);
  const explicitFreshness = sourceEvidence.freshness;
  const status = normalizeText(isObject(explicitFreshness) ? explicitFreshness.status : explicitFreshness || sourceEvidence.freshnessStatus);
  return { value: explicitFreshness || sourceEvidence.freshnessStatus || candidates[0] || null, available: candidates.length > 0, stale: status === "STALE" || status === "EXPIRED" || sourceEvidence.isFresh === false || values.some((value) => isObject(value) && value.stale === true) };
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
function periodIdOf(item) { return item && (item.periodId || item.period && (item.period.periodId || item.period.id) || item.id || null); }
function metricPayload(item) { return item && (item.advisorMetrics || item.metrics || item); }
function trendFor(series, path, label) {
  const points = series.map((entry) => ({ periodId: periodIdOf(entry), value: valueAtPath(metricPayload(entry), path) }));
  const known = points.filter((point) => typeof point.value === "number");
  const first = known[0] || null;
  const last = known[known.length - 1] || null;
  return {
    label,
    points,
    change: first && last ? last.value - first.value : null,
    direction: first && last ? (last.value > first.value ? "UP" : last.value < first.value ? "DOWN" : "FLAT") : "UNKNOWN",
    referenceOnly: true,
    createsTruth: false
  };
}
function resolveStatus(boundary, use, humanReviewRequired) {
  if (use.blockedUses.length > 0 || boundary.boundaryStatus === "BLOCKED") return MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.BLOCKED;
  if (boundary.boundaryStatus === "UNKNOWN") return MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.UNKNOWN;
  if (boundary.boundaryStatus === "NEEDS_EVIDENCE") return MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.NEEDS_EVIDENCE;
  if (boundary.boundaryStatus === "NEEDS_SOURCE_OWNER") return MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.NEEDS_SOURCE_OWNER;
  if (boundary.boundaryStatus === "NEEDS_FRESHNESS") return MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired || boundary.boundaryStatus === "NEEDS_HUMAN_REVIEW") return MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function calculateManagerAdvisorHistoricalAnalytics({
  advisorMetricsSeries = [],
  periodSeries = [],
  sourceEvidence = {},
  requestedUse = null,
  generatedAt = null,
  assumptions = []
} = {}) {
  const series = asArray(advisorMetricsSeries).map((entry) => clone(entry));
  const periods = asArray(periodSeries).map((period) => clone(period));
  const use = resolveUse(requestedUse);
  const boundary = buildManagerHistoricalAnalyticsBoundary({ periodSeries: periods, metricsSeries: series, sourceEvidence, requestedUse, assumptions, generatedAt });
  const freshness = resolveFreshness({ sourceEvidence, values: series });
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [series, boundary] });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [series, boundary] });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values: [series, boundary] });
  const missingEvidence = unique([...asArray(boundary.missingEvidence)]);
  const unknownSignals = unique([
    ...asArray(boundary.unknownSignals),
    ...series.filter((entry) => valueAtPath(metricPayload(entry), "activitySignalCount") === null || valueAtPath(metricPayload(entry), "activitySignalCount") === undefined).map(() => "advisor_historical_activity_unknown"),
    ...series.filter((entry) => !present(valueAtPath(metricPayload(entry), "pipelineContext.count"))).map(() => "advisor_historical_pipeline_unknown")
  ]);
  const staleSignals = unique([...asArray(boundary.staleSignals)]);
  const defaultZeroRisks = unique([...asArray(boundary.defaultZeroRisks), ...series.flatMap((entry) => asArray(entry.defaultZeroRisks || metricPayload(entry).defaultZeroRisks))]);
  const warnings = [
    ...asArray(boundary.warnings),
    "Advisor historical trends are context only.",
    "Missing activity does not become zero activity.",
    "Missing pipeline does not become low pipeline.",
    "Production trend is not revenue truth.",
    "Qualification trend is not promotion truth.",
    "Advisor status trend is not Advisor Lifecycle truth.",
    "Support and coaching trends are not punishment truth.",
    "Team pattern context is not ranking, leaderboard or HR truth."
  ];
  defaultZeroRisks.forEach((risk) => warnings.push(`${risk}: explicit zero-like advisor historical value is context only.`));
  const historicalAnalytics = {
    activityTrendContext: trendFor(series, "activitySignalCount", "activity signal trend"),
    followupTrendContext: trendFor(series, "followupSignalCount", "followup signal trend"),
    prospectingTrendContext: trendFor(series, "prospectingSignalCount", "prospecting signal trend"),
    referralTrendContext: trendFor(series, "referralSignalCount", "referral signal trend"),
    pipelineTrendContext: trendFor(series, "pipelineContext.count", "pipeline context trend"),
    appointmentTrendContext: trendFor(series, "appointmentContext.count", "appointment context trend"),
    productionContextTrend: trendFor(series, "productionContext.count", "production context trend"),
    qualificationContextTrend: trendFor(series, "qualificationContext.count", "qualification context trend"),
    supportCoachingNeedTrendContext: {
      supportNeeds: trendFor(series, "supportNeedsContext.count", "support needs trend"),
      coachingNeeds: trendFor(series, "coachingNeedsContext.count", "coaching needs trend"),
      referenceOnly: true,
      createsTruth: false
    },
    evidenceQualityTrendContext: {
      staleAdvisorSignals: trendFor(series, "staleAdvisorSignals.length", "stale advisor signal trend"),
      missingAdvisorEvidence: trendFor(series, "missingAdvisorEvidence.length", "missing advisor evidence trend"),
      defaultZeroRiskCount: trendFor(series, "defaultZeroRiskCount", "default zero risk trend"),
      referenceOnly: true,
      createsTruth: false
    },
    teamPatternContext: {
      advisorCount: trendFor(series, "advisorCountContext.value", "advisor count context trend"),
      activeAdvisorContext: trendFor(series, "activeAdvisorContext.value", "active advisor context trend"),
      referenceOnly: true,
      createsRankingTruth: false,
      createsTruth: false
    },
    referenceOnly: true,
    createsTruth: false
  };
  const managerReviewRequired = boundary.managerReviewRequired === true || use.blockedUses.length > 0 || missingEvidence.length > 0 || unknownSignals.length > 0 || staleSignals.length > 0 || defaultZeroRisks.length > 0;
  const humanReviewRequired = managerReviewRequired;

  return {
    analyticsStatus: resolveStatus(boundary, use, humanReviewRequired),
    periodRange: boundary.periodRange,
    generatedAt: generatedAt || sourceEvidence.generatedAt || null,
    advisorHistoricalAnalytics: historicalAnalytics,
    boundaryContext: clone(boundary),
    missingEvidence,
    unknownSignals,
    staleSignals,
    defaultZeroRisks,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshness.value || boundary.freshness,
    assumptions: unique([...asArray(assumptions), ...asArray(boundary.assumptions), "Advisor trends compare protected advisor metrics series only."]),
    confidenceLimitations: unique([...asArray(boundary.confidenceLimitations), ...defaultZeroRisks]),
    warnings: unique(warnings),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...truthFlags()
  };
}

module.exports = {
  calculateManagerAdvisorHistoricalAnalytics,
  MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES,
  MANAGER_ADVISOR_HISTORICAL_ANALYTICS_DECISIONS
};
