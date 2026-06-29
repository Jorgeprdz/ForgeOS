const {
  buildManagerHistoricalAnalyticsBoundary
} = require("./manager-historical-analytics-boundary-contract");
const {
  calculateManagerRecruitmentHistoricalAnalytics
} = require("./manager-recruitment-historical-analytics-engine");
const {
  calculateManagerAdvisorHistoricalAnalytics
} = require("./manager-advisor-historical-analytics-engine");

const MANAGER_HISTORICAL_ANALYTICS_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_HISTORICAL_ANALYTICS_DECISIONS = Object.freeze({
  BUILD_MANAGER_HISTORICAL_ANALYTICS: "BUILD_MANAGER_HISTORICAL_ANALYTICS",
  USE_RECRUITMENT_HISTORICAL_CONTEXT: "USE_RECRUITMENT_HISTORICAL_CONTEXT",
  USE_ADVISOR_HISTORICAL_CONTEXT: "USE_ADVISOR_HISTORICAL_CONTEXT",
  USE_BOUNDARY_CONTEXT: "USE_BOUNDARY_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

function present(value) { return value !== undefined && value !== null && value !== ""; }
function asArray(value) { if (!present(value)) return []; return Array.isArray(value) ? value.filter(present) : [value].filter(present); }
function unique(values) { return [...new Set(values.filter(present))]; }
function clone(value) { if (!present(value)) return value; return JSON.parse(JSON.stringify(value)); }
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
function resolveStatus(boundary, recruitment, advisor) {
  if (boundary.boundaryStatus === "BLOCKED" || recruitment.analyticsStatus === "BLOCKED" || advisor.analyticsStatus === "BLOCKED") return MANAGER_HISTORICAL_ANALYTICS_STATUSES.BLOCKED;
  if (boundary.boundaryStatus === "UNKNOWN") return MANAGER_HISTORICAL_ANALYTICS_STATUSES.UNKNOWN;
  if (boundary.boundaryStatus === "NEEDS_EVIDENCE") return MANAGER_HISTORICAL_ANALYTICS_STATUSES.NEEDS_EVIDENCE;
  if (boundary.boundaryStatus === "NEEDS_SOURCE_OWNER") return MANAGER_HISTORICAL_ANALYTICS_STATUSES.NEEDS_SOURCE_OWNER;
  if (boundary.boundaryStatus === "NEEDS_FRESHNESS") return MANAGER_HISTORICAL_ANALYTICS_STATUSES.NEEDS_FRESHNESS;
  if (boundary.boundaryStatus === "NEEDS_HUMAN_REVIEW" || recruitment.managerReviewRequired === true || advisor.managerReviewRequired === true) return MANAGER_HISTORICAL_ANALYTICS_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_HISTORICAL_ANALYTICS_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function buildManagerHistoricalAnalytics({
  recruitmentMetricsSeries = [],
  advisorMetricsSeries = [],
  managerMetricsSeries = [],
  teamMetricsSeries = [],
  periodSeries = [],
  sourceEvidence = {},
  requestedUse = null,
  periodRange = null,
  generatedAt = null,
  assumptions = []
} = {}) {
  const recruitmentSeries = asArray(recruitmentMetricsSeries).map((entry) => clone(entry));
  const advisorSeries = asArray(advisorMetricsSeries).map((entry) => clone(entry));
  const managerSeries = asArray(managerMetricsSeries).map((entry) => clone(entry));
  const teamSeries = asArray(teamMetricsSeries).map((entry) => clone(entry));
  const periods = asArray(periodSeries).map((period) => clone(period));
  const recruitment = calculateManagerRecruitmentHistoricalAnalytics({
    recruitmentMetricsSeries: recruitmentSeries,
    periodSeries: periods,
    sourceEvidence,
    requestedUse,
    generatedAt,
    assumptions
  });
  const advisor = calculateManagerAdvisorHistoricalAnalytics({
    advisorMetricsSeries: advisorSeries,
    periodSeries: periods,
    sourceEvidence,
    requestedUse,
    generatedAt,
    assumptions
  });
  const boundary = buildManagerHistoricalAnalyticsBoundary({
    periodSeries: periods,
    metricsSeries: [...managerSeries, ...teamSeries, ...recruitmentSeries, ...advisorSeries, recruitment, advisor],
    sourceEvidence,
    requestedUse,
    assumptions: [
      ...asArray(assumptions),
      ...asArray(recruitment.assumptions),
      ...asArray(advisor.assumptions)
    ],
    generatedAt
  });
  const historicalStatus = resolveStatus(boundary, recruitment, advisor);
  const managerReviewRequired = boundary.managerReviewRequired === true || recruitment.managerReviewRequired === true || advisor.managerReviewRequired === true;
  const humanReviewRequired = boundary.humanReviewRequired === true || recruitment.humanReviewRequired === true || advisor.humanReviewRequired === true;

  return {
    historicalStatus,
    periodRange: periodRange || boundary.periodRange,
    generatedAt: generatedAt || sourceEvidence.generatedAt || boundary.generatedAt || null,
    recruitmentHistoricalAnalytics: clone(recruitment.recruitmentHistoricalAnalytics),
    advisorHistoricalAnalytics: clone(advisor.advisorHistoricalAnalytics),
    teamHistoricalContext: {
      managerMetricsPeriods: managerSeries.length,
      teamMetricsPeriods: teamSeries.length,
      referenceOnly: true,
      createsRankingTruth: false,
      createsTruth: false
    },
    boundaryContext: clone(boundary),
    missingEvidence: unique([...asArray(boundary.missingEvidence), ...asArray(recruitment.missingEvidence), ...asArray(advisor.missingEvidence)]),
    unknownSignals: unique([...asArray(boundary.unknownSignals), ...asArray(recruitment.unknownSignals), ...asArray(advisor.unknownSignals)]),
    staleSignals: unique([...asArray(boundary.staleSignals), ...asArray(recruitment.staleSignals), ...asArray(advisor.staleSignals)]),
    defaultZeroRisks: unique([...asArray(boundary.defaultZeroRisks), ...asArray(recruitment.defaultZeroRisks), ...asArray(advisor.defaultZeroRisks)]),
    evidenceRefs: unique([...asArray(boundary.evidenceRefs), ...asArray(recruitment.evidenceRefs), ...asArray(advisor.evidenceRefs)]),
    sourceEvidenceIds: unique([...asArray(boundary.sourceEvidenceIds), ...asArray(recruitment.sourceEvidenceIds), ...asArray(advisor.sourceEvidenceIds)]),
    sourceOwners: unique([...asArray(boundary.sourceOwners), ...asArray(recruitment.sourceOwners), ...asArray(advisor.sourceOwners)]),
    freshness: boundary.freshness || recruitment.freshness || advisor.freshness || null,
    assumptions: unique([...asArray(assumptions), ...asArray(boundary.assumptions), ...asArray(recruitment.assumptions), ...asArray(advisor.assumptions)]),
    confidenceLimitations: unique([...asArray(boundary.confidenceLimitations), ...asArray(recruitment.confidenceLimitations), ...asArray(advisor.confidenceLimitations)]),
    warnings: unique([
      ...asArray(boundary.warnings),
      ...asArray(recruitment.warnings),
      ...asArray(advisor.warnings),
      "Manager Historical Analytics consumes protected metrics/snapshots context only and does not create revenue, compensation, payout, lifecycle, ranking, promotion, punishment, termination, precontract, hiring or automatic decision truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique([...asArray(boundary.allowedUses), ...asArray(recruitment.allowedUses), ...asArray(advisor.allowedUses)]),
    blockedUses: unique([...asArray(boundary.blockedUses), ...asArray(recruitment.blockedUses), ...asArray(advisor.blockedUses)]),
    ...truthFlags()
  };
}

module.exports = {
  buildManagerHistoricalAnalytics,
  MANAGER_HISTORICAL_ANALYTICS_STATUSES,
  MANAGER_HISTORICAL_ANALYTICS_DECISIONS
};
