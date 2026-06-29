const {
  buildManagerHistoricalAnalyticsBoundary
} = require("./manager-historical-analytics-boundary-contract");

const MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_DECISIONS = Object.freeze({
  USE_AS_MANAGER_REVIEW_CONTEXT: "USE_AS_MANAGER_REVIEW_CONTEXT",
  COMPARE_RECRUITMENT_PERIODS: "COMPARE_RECRUITMENT_PERIODS",
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
    createsHiringTruth: false,
    createsAutomaticApprovalTruth: false,
    createsAutomaticRejectionTruth: false
  };
}
function periodIdOf(item) { return item && (item.periodId || item.period && (item.period.periodId || item.period.id) || item.id || null); }
function metricPayload(item) { return item && (item.recruitmentMetrics || item.metrics || item); }
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
function contextRateTrend(series, path, label) {
  return trendFor(series, path, label);
}
function resolveStatus(boundary, use, humanReviewRequired) {
  if (use.blockedUses.length > 0 || boundary.boundaryStatus === "BLOCKED") return MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.BLOCKED;
  if (boundary.boundaryStatus === "UNKNOWN") return MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.UNKNOWN;
  if (boundary.boundaryStatus === "NEEDS_EVIDENCE") return MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.NEEDS_EVIDENCE;
  if (boundary.boundaryStatus === "NEEDS_SOURCE_OWNER") return MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.NEEDS_SOURCE_OWNER;
  if (boundary.boundaryStatus === "NEEDS_FRESHNESS") return MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired || boundary.boundaryStatus === "NEEDS_HUMAN_REVIEW") return MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function calculateManagerRecruitmentHistoricalAnalytics({
  recruitmentMetricsSeries = [],
  periodSeries = [],
  sourceEvidence = {},
  requestedUse = null,
  generatedAt = null,
  assumptions = []
} = {}) {
  const series = asArray(recruitmentMetricsSeries).map((entry) => clone(entry));
  const periods = asArray(periodSeries).map((period) => clone(period));
  const use = resolveUse(requestedUse);
  const boundary = buildManagerHistoricalAnalyticsBoundary({ periodSeries: periods, metricsSeries: series, sourceEvidence, requestedUse, assumptions, generatedAt });
  const freshness = resolveFreshness({ sourceEvidence, values: series });
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [series, boundary] });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [series, boundary] });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values: [series, boundary] });
  const missingEvidence = unique([...asArray(boundary.missingEvidence)]);
  const unknownSignals = unique([...asArray(boundary.unknownSignals)]);
  const staleSignals = unique([...asArray(boundary.staleSignals)]);
  const defaultZeroRisks = unique([...asArray(boundary.defaultZeroRisks), ...series.flatMap((entry) => asArray(entry.defaultZeroRisks))]);
  const warnings = [
    ...asArray(boundary.warnings),
    "Recruitment historical trends are context only.",
    "Trend decline is not punishment truth.",
    "Trend improvement is not promotion truth.",
    "Withdrawn trend is not rejection truth.",
    "Blocked trend is not punishment truth.",
    "Reactivation and reentry trends are not automatic approval truth.",
    "Ready for precontract review trend is not precontract truth."
  ];
  const historicalAnalytics = {
    recruitmentFunnelTrends: {
      namesAdded: trendFor(series, "namesAdded", "names added trend"),
      contactedCandidates: trendFor(series, "contactedCandidates", "contacted candidates trend"),
      connectedCandidates: trendFor(series, "connectedCandidates", "connected candidates trend")
    },
    interviewCompletionTrendContext: {
      initial: contextRateTrend(series, "interviewCompletionRates.initial.value", "initial interview completion trend"),
      selection: contextRateTrend(series, "interviewCompletionRates.selection.value", "selection interview completion trend"),
      career: contextRateTrend(series, "interviewCompletionRates.career.value", "career interview completion trend"),
      additional: contextRateTrend(series, "interviewCompletionRates.additional.value", "additional interview completion trend")
    },
    readyForPrecontractReviewTrend: trendFor(series, "readyForPrecontractReviewCount", "ready for precontract review trend"),
    withdrawnCandidatesTrend: trendFor(series, "withdrawnCandidates", "withdrawn candidates trend"),
    blockedCandidatesTrend: trendFor(series, "blockedCandidates", "blocked candidates trend"),
    reactivatedCandidatesTrend: trendFor(series, "reactivatedCandidates", "reactivated candidates trend"),
    reentryReviewTrend: trendFor(series, "reentryReviewCandidates", "reentry review trend"),
    pipelineVelocityContext: trendFor(series, "pipelineVelocityContext.eventCount", "pipeline velocity event-count trend"),
    candidateCohortContext: {
      periodCount: series.length || null,
      totalCandidateSnapshots: trendFor(series, "totalCandidateSnapshots", "candidate cohort size trend"),
      referenceOnly: true,
      createsTruth: false
    },
    conversionRateTrendContext: {
      contactToInitialInterview: contextRateTrend(series, "stageConversionRates.contactToInitialInterview.value", "contact to initial interview conversion trend"),
      initialToSelectionInterview: contextRateTrend(series, "stageConversionRates.initialToSelectionInterview.value", "initial to selection conversion trend"),
      selectionToCareerInterview: contextRateTrend(series, "stageConversionRates.selectionToCareerInterview.value", "selection to career conversion trend"),
      careerToPrecontractReview: contextRateTrend(series, "stageConversionRates.careerToPrecontractReview.value", "career to precontract review conversion trend")
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
    recruitmentHistoricalAnalytics: historicalAnalytics,
    boundaryContext: clone(boundary),
    missingEvidence,
    unknownSignals,
    staleSignals,
    defaultZeroRisks,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshness.value || boundary.freshness,
    assumptions: unique([...asArray(assumptions), ...asArray(boundary.assumptions), "Recruitment trends compare protected recruitment metrics series only."]),
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
  calculateManagerRecruitmentHistoricalAnalytics,
  MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES,
  MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_DECISIONS
};
