"use strict";

const MANAGER_DASHBOARD_BOUNDARY_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_DASHBOARD_BOUNDARY_DECISIONS = Object.freeze({
  ALLOW_CONTEXT_USE: "ALLOW_CONTEXT_USE",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE",
  REQUIRE_MANAGER_REVIEW: "REQUIRE_MANAGER_REVIEW",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW"
});

const ALLOWED_USES = Object.freeze([
  "MANAGER_REVIEW",
  "DASHBOARD_CONTEXT",
  "COACHING_CONTEXT",
  "FORECAST_CONTEXT",
  "CONVERSATION_CONTEXT",
  "TEAM_PATTERN_CONTEXT",
  "SCENARIO_PLANNING_CONTEXT",
  "EXECUTIVE_SUMMARY_CONTEXT"
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
  "SCHEMA_WRITE",
  "UI_RENDERING"
]);

const FALSE_FLAGS = Object.freeze({
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
  createsUiRendering: false
});

function clone(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function arrayOf(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function uniq(values) {
  return [...new Set(arrayOf(values).filter((value) => value !== undefined && value !== null && value !== ""))];
}

function uniqObjects(values) {
  const seen = new Set();
  const out = [];
  for (const value of arrayOf(values).filter(Boolean)) {
    const key = JSON.stringify(value);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

function addMeta(target, input) {
  if (!input || typeof input !== "object") return;

  target.evidenceRefs.push(...arrayOf(input.evidenceRefs));
  target.evidenceRefs.push(...arrayOf(input.evidenceRef));
  target.sourceEvidenceIds.push(...arrayOf(input.sourceEvidenceIds));
  target.sourceEvidenceIds.push(...arrayOf(input.sourceEvidenceId));
  target.sourceOwners.push(...arrayOf(input.sourceOwners));
  target.sourceOwners.push(...arrayOf(input.sourceOwner));

  if (input.freshness) target.freshness.push(input.freshness);
  if (input.freshnessStatus) target.freshness.push({ status: input.freshnessStatus });
}

function addContextSignals(target, input) {
  if (!input || typeof input !== "object") return;

  target.missingRollups.push(...arrayOf(input.missingRollups));
  target.missingData.push(...arrayOf(input.missingData));
  target.blockedPeriods.push(...arrayOf(input.blockedPeriods));
  target.stalePeriods.push(...arrayOf(input.stalePeriods));
  target.unknownSignals.push(...arrayOf(input.unknownSignals));
  target.staleSignals.push(...arrayOf(input.staleSignals));
  target.defaultZeroRisks.push(...arrayOf(input.defaultZeroRisks));
  target.warnings.push(...arrayOf(input.warnings));
  target.assumptions.push(...arrayOf(input.assumptions));
  target.confidenceLimitations.push(...arrayOf(input.confidenceLimitations));

  if (input.explicitZeroContext || input.defaultZeroContext || input.defaultZeroRisk) {
    target.defaultZeroRisks.push(input.metricKey || input.contextKey || "EXPLICIT_ZERO_CONTEXT");
  }
}

function buildManagerDashboardBoundary(input = {}) {
  const safeInput = clone(input) || {};
  const requestedUse = safeInput.requestedUse || "DASHBOARD_CONTEXT";

  const collected = {
    evidenceRefs: [],
    sourceEvidenceIds: [],
    sourceOwners: [],
    freshness: [],
    missingRollups: [],
    missingData: [],
    blockedPeriods: [],
    stalePeriods: [],
    unknownSignals: [],
    staleSignals: [],
    defaultZeroRisks: [],
    warnings: [],
    assumptions: [],
    confidenceLimitations: []
  };

  [
    safeInput.sourceEvidence,
    safeInput.dashboardContext,
    safeInput.metricsContext,
    safeInput.historicalContext,
    safeInput.storageContext,
    safeInput.queryPlanContext,
    safeInput.forecastContext
  ].forEach((entry) => {
    addMeta(collected, entry);
    addContextSignals(collected, entry);
  });

  if (!safeInput.dashboardContext) {
    collected.unknownSignals.push("MISSING_DASHBOARD_CONTEXT");
    collected.missingData.push("MISSING_DASHBOARD_CONTEXT");
  }

  if (!safeInput.metricsContext) {
    collected.unknownSignals.push("MISSING_METRICS_CONTEXT");
    collected.missingData.push("MISSING_METRICS_CONTEXT");
  }

  if (!safeInput.forecastContext) {
    collected.unknownSignals.push("MISSING_FORECAST_CONTEXT");
    collected.missingData.push("MISSING_FORECAST_CONTEXT");
  }

  const evidenceRefs = uniq(collected.evidenceRefs);
  const sourceEvidenceIds = uniq(collected.sourceEvidenceIds);
  const sourceOwners = uniq(collected.sourceOwners);
  const freshness = uniqObjects(collected.freshness);

  const missingEvidence = evidenceRefs.length === 0 ? ["MISSING_EVIDENCE"] : [];
  const missingSourceOwners = sourceOwners.length === 0 ? ["MISSING_SOURCE_OWNER"] : [];
  const missingFreshness = freshness.length === 0 ? ["MISSING_FRESHNESS"] : [];

  const staleSignals = uniq([
    ...collected.staleSignals,
    ...freshness.filter((item) => item && item.status === "STALE").map(() => "STALE_FRESHNESS")
  ]);

  const blockedUse = FORBIDDEN_USES.includes(requestedUse) || !ALLOWED_USES.includes(requestedUse);
  const blockedUses = blockedUse ? [requestedUse] : [];
  const allowedUses = blockedUse ? [] : [requestedUse];

  const missingRollups = uniq(collected.missingRollups);
  const missingData = uniq(collected.missingData);
  const blockedPeriods = uniq(collected.blockedPeriods);
  const stalePeriods = uniq(collected.stalePeriods);
  const unknownSignals = uniq(collected.unknownSignals);
  const defaultZeroRisks = uniq(collected.defaultZeroRisks);

  const warnings = uniq([
    ...collected.warnings,
    ...missingEvidence,
    ...missingSourceOwners,
    ...missingFreshness,
    ...staleSignals,
    ...blockedUses.map((use) => `BLOCKED_USE:${use}`),
    ...defaultZeroRisks.map((risk) => `DEFAULT_ZERO_CONTEXT_ONLY:${risk}`)
  ]);

  const managerReviewRequired =
    warnings.length > 0 ||
    missingRollups.length > 0 ||
    missingData.length > 0 ||
    blockedPeriods.length > 0 ||
    stalePeriods.length > 0 ||
    unknownSignals.length > 0;

  const humanReviewRequired = managerReviewRequired || blockedUse;

  let dashboardBoundaryStatus = MANAGER_DASHBOARD_BOUNDARY_STATUSES.READY_FOR_MANAGER_REVIEW;
  let dashboardBoundaryDecision = MANAGER_DASHBOARD_BOUNDARY_DECISIONS.ALLOW_CONTEXT_USE;

  if (blockedUse) {
    dashboardBoundaryStatus = MANAGER_DASHBOARD_BOUNDARY_STATUSES.BLOCKED;
    dashboardBoundaryDecision = MANAGER_DASHBOARD_BOUNDARY_DECISIONS.BLOCK_FORBIDDEN_USE;
  } else if (humanReviewRequired) {
    dashboardBoundaryStatus = MANAGER_DASHBOARD_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW;
    dashboardBoundaryDecision = MANAGER_DASHBOARD_BOUNDARY_DECISIONS.REQUIRE_HUMAN_REVIEW;
  }

  return {
    dashboardBoundaryStatus,
    dashboardBoundaryDecision,
    requestedUse,
    allowedUses,
    blockedUses,
    periodRange: safeInput.periodRange || null,
    generatedAt: safeInput.generatedAt || new Date().toISOString(),
    missingData,
    missingRollups,
    blockedPeriods,
    stalePeriods,
    unknownSignals,
    missingEvidence,
    missingSourceOwners,
    missingFreshness,
    staleSignals,
    defaultZeroRisks,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness,
    assumptions: uniq(collected.assumptions),
    confidenceLimitations: uniq(collected.confidenceLimitations),
    warnings,
    managerReviewRequired,
    humanReviewRequired,
    contextOnly: true,
    ...FALSE_FLAGS
  };
}

module.exports = {
  buildManagerDashboardBoundary,
  MANAGER_DASHBOARD_BOUNDARY_STATUSES,
  MANAGER_DASHBOARD_BOUNDARY_DECISIONS
};
