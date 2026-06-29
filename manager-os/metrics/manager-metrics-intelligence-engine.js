const {
  buildManagerMetricsBoundary
} = require("./manager-metrics-boundary-contract");
const {
  calculateManagerRecruitmentMetrics
} = require("./manager-recruitment-metrics-engine");
const {
  calculateManagerAdvisorMetrics
} = require("./manager-advisor-metrics-engine");

const MANAGER_METRICS_INTELLIGENCE_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_METRICS_INTELLIGENCE_DECISIONS = Object.freeze({
  BUILD_MANAGER_METRICS_INTELLIGENCE: "BUILD_MANAGER_METRICS_INTELLIGENCE",
  USE_RECRUITMENT_METRICS_CONTEXT: "USE_RECRUITMENT_METRICS_CONTEXT",
  USE_ADVISOR_METRICS_CONTEXT: "USE_ADVISOR_METRICS_CONTEXT",
  USE_METRICS_BOUNDARY_CONTEXT: "USE_METRICS_BOUNDARY_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function clone(value) {
  if (!present(value)) return value;
  return JSON.parse(JSON.stringify(value));
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

function resolveStatus(boundaryContext, recruitmentMetrics, advisorMetrics) {
  if (boundaryContext.boundaryStatus === "BLOCKED" || recruitmentMetrics.metricsStatus === "BLOCKED" || advisorMetrics.metricsStatus === "BLOCKED") {
    return MANAGER_METRICS_INTELLIGENCE_STATUSES.BLOCKED;
  }
  if (boundaryContext.boundaryStatus === "UNKNOWN") return MANAGER_METRICS_INTELLIGENCE_STATUSES.UNKNOWN;
  if (boundaryContext.boundaryStatus === "NEEDS_EVIDENCE") return MANAGER_METRICS_INTELLIGENCE_STATUSES.NEEDS_EVIDENCE;
  if (boundaryContext.boundaryStatus === "NEEDS_SOURCE_OWNER") return MANAGER_METRICS_INTELLIGENCE_STATUSES.NEEDS_SOURCE_OWNER;
  if (boundaryContext.boundaryStatus === "NEEDS_FRESHNESS") return MANAGER_METRICS_INTELLIGENCE_STATUSES.NEEDS_FRESHNESS;
  if (
    boundaryContext.boundaryStatus === "NEEDS_HUMAN_REVIEW" ||
    recruitmentMetrics.managerReviewRequired === true ||
    advisorMetrics.managerReviewRequired === true
  ) {
    return MANAGER_METRICS_INTELLIGENCE_STATUSES.NEEDS_HUMAN_REVIEW;
  }
  return MANAGER_METRICS_INTELLIGENCE_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function buildManagerMetricsIntelligence({
  candidateManagerSnapshots = [],
  advisorManagerSnapshots = [],
  period = null,
  sourceEvidence = {},
  requestedUse = null,
  generatedAt = null,
  assumptions = []
} = {}) {
  const candidateSnapshots = asArray(candidateManagerSnapshots).map((snapshot) => clone(snapshot));
  const advisorSnapshots = asArray(advisorManagerSnapshots).map((snapshot) => clone(snapshot));
  const recruitmentMetrics = calculateManagerRecruitmentMetrics({
    candidateManagerSnapshots: candidateSnapshots,
    period,
    sourceEvidence,
    requestedUse,
    generatedAt
  });
  const advisorMetrics = calculateManagerAdvisorMetrics({
    advisorManagerSnapshots: advisorSnapshots,
    period,
    sourceEvidence,
    requestedUse,
    generatedAt
  });
  const boundaryContext = buildManagerMetricsBoundary({
    candidateManagerSnapshots: candidateSnapshots,
    advisorManagerSnapshots: advisorSnapshots,
    recruitmentMetrics,
    advisorMetrics,
    teamMetricsContext: {
      recruitmentSnapshotCount: candidateSnapshots.length,
      advisorSnapshotCount: advisorSnapshots.length,
      referenceOnly: true,
      createsTruth: false
    },
    period,
    sourceEvidence,
    requestedUse,
    generatedAt,
    assumptions: [
      ...asArray(assumptions),
      ...asArray(recruitmentMetrics.assumptions),
      ...asArray(advisorMetrics.assumptions)
    ]
  });
  const metricsStatus = resolveStatus(boundaryContext, recruitmentMetrics, advisorMetrics);
  const managerReviewRequired =
    boundaryContext.managerReviewRequired === true ||
    recruitmentMetrics.managerReviewRequired === true ||
    advisorMetrics.managerReviewRequired === true;
  const humanReviewRequired =
    boundaryContext.humanReviewRequired === true ||
    recruitmentMetrics.humanReviewRequired === true ||
    advisorMetrics.humanReviewRequired === true;

  return {
    metricsStatus,
    period: period || sourceEvidence.period || boundaryContext.period || null,
    generatedAt: generatedAt || sourceEvidence.generatedAt || boundaryContext.generatedAt || null,
    recruitmentMetrics: clone(recruitmentMetrics.recruitmentMetrics),
    advisorMetrics: clone(advisorMetrics.advisorMetrics),
    teamMetricsContext: {
      recruitmentSnapshotCount: candidateSnapshots.length,
      advisorSnapshotCount: advisorSnapshots.length,
      referenceOnly: true,
      createsTruth: false
    },
    boundaryContext: clone(boundaryContext),
    missingEvidence: unique([
      ...asArray(boundaryContext.missingEvidence),
      ...asArray(recruitmentMetrics.missingEvidence),
      ...asArray(advisorMetrics.missingEvidence)
    ]),
    unknownSignals: unique([
      ...asArray(boundaryContext.unknownSignals),
      ...asArray(recruitmentMetrics.unknownSignals),
      ...asArray(advisorMetrics.unknownSignals)
    ]),
    staleSignals: unique([
      ...asArray(boundaryContext.staleSignals),
      ...asArray(recruitmentMetrics.staleSignals),
      ...asArray(advisorMetrics.staleSignals)
    ]),
    defaultZeroRisks: unique([
      ...asArray(boundaryContext.defaultZeroRisks),
      ...asArray(recruitmentMetrics.defaultZeroRisks),
      ...asArray(advisorMetrics.defaultZeroRisks)
    ]),
    evidenceRefs: unique([
      ...asArray(boundaryContext.evidenceRefs),
      ...asArray(recruitmentMetrics.evidenceRefs),
      ...asArray(advisorMetrics.evidenceRefs)
    ]),
    sourceEvidenceIds: unique([
      ...asArray(boundaryContext.sourceEvidenceIds),
      ...asArray(recruitmentMetrics.sourceEvidenceIds),
      ...asArray(advisorMetrics.sourceEvidenceIds)
    ]),
    sourceOwners: unique([
      ...asArray(boundaryContext.sourceOwners),
      ...asArray(recruitmentMetrics.sourceOwners),
      ...asArray(advisorMetrics.sourceOwners)
    ]),
    freshness: boundaryContext.freshness || recruitmentMetrics.freshness || advisorMetrics.freshness || null,
    assumptions: unique([
      ...asArray(assumptions),
      ...asArray(boundaryContext.assumptions),
      ...asArray(recruitmentMetrics.assumptions),
      ...asArray(advisorMetrics.assumptions)
    ]),
    confidenceLimitations: unique([
      ...asArray(boundaryContext.confidenceLimitations),
      ...asArray(recruitmentMetrics.confidenceLimitations),
      ...asArray(advisorMetrics.confidenceLimitations)
    ]),
    warnings: unique([
      ...asArray(boundaryContext.warnings),
      ...asArray(recruitmentMetrics.warnings),
      ...asArray(advisorMetrics.warnings),
      "Manager Metrics Intelligence consumes protected snapshots only and does not create revenue, compensation, payout, lifecycle, ranking, promotion, punishment, termination or automatic decision truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique([
      ...asArray(boundaryContext.allowedUses),
      ...asArray(recruitmentMetrics.allowedUses),
      ...asArray(advisorMetrics.allowedUses)
    ]),
    blockedUses: unique([
      ...asArray(boundaryContext.blockedUses),
      ...asArray(recruitmentMetrics.blockedUses),
      ...asArray(advisorMetrics.blockedUses)
    ]),
    ...truthFlags()
  };
}

module.exports = {
  buildManagerMetricsIntelligence,
  MANAGER_METRICS_INTELLIGENCE_STATUSES,
  MANAGER_METRICS_INTELLIGENCE_DECISIONS
};
