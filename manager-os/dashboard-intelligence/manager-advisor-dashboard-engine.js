"use strict";

const {
  buildManagerDashboardBoundary
} = require("./manager-dashboard-boundary-contract");

const MANAGER_ADVISOR_DASHBOARD_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const MANAGER_ADVISOR_DASHBOARD_DECISIONS = Object.freeze({
  PRESENT_CONTEXT: "PRESENT_CONTEXT",
  REQUIRE_REVIEW: "REQUIRE_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

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
  return [...new Set(arrayOf(values).filter(Boolean))];
}

function card(cardKey, title, context, warnings = []) {
  return {
    cardKey,
    title,
    contextOnly: true,
    cardStatus: context === undefined || context === null ? "UNKNOWN" : "READY_FOR_MANAGER_REVIEW",
    valueContext: context === undefined ? null : context,
    warnings: uniq(warnings),
    dashboardCardCreatesDecisionTruth: false,
    dashboardCardCreatesPunishmentTruth: false,
    dashboardCardCreatesPromotionTruth: false,
    dashboardCardCreatesRevenueTruth: false,
    dashboardCardCreatesLifecycleTruth: false,
    automaticDecisionAllowed: false
  };
}

function scenarioSummary(forecastContext = {}) {
  return ["conservativeScenario", "baselineScenario", "stretchScenario"].map((key) => ({
    scenarioKey: key,
    contextOnly: true,
    projectedContext: forecastContext[key] ? clone(forecastContext[key].projectedContext || forecastContext[key]) : null,
    assumptions: arrayOf(forecastContext[key] && forecastContext[key].assumptions),
    confidenceLimitations: arrayOf(forecastContext[key] && forecastContext[key].confidenceLimitations),
    automaticDecisionAllowed: false,
    ...FALSE_FLAGS
  }));
}

function calculateManagerAdvisorDashboardContext(input = {}) {
  const safeInput = clone(input) || {};
  const metrics = safeInput.advisorMetricsContext || {};
  const historical = safeInput.advisorHistoricalContext || {};
  const forecast = safeInput.advisorForecastContext || {};

  const boundary = buildManagerDashboardBoundary({
    requestedUse: safeInput.requestedUse || "DASHBOARD_CONTEXT",
    sourceEvidence: safeInput.sourceEvidence,
    periodRange: safeInput.periodRange,
    dashboardContext: { dashboardFamily: "ADVISOR_DASHBOARD_CONTEXT" },
    metricsContext: metrics,
    historicalContext: historical,
    forecastContext: forecast,
    storageContext: safeInput.historicalStorageBoundaryContext,
    queryPlanContext: safeInput.historicalQueryPlanContext
  });

  const cards = {
    advisorActivityCard: card("ADVISOR_ACTIVITY", "Advisor activity context", metrics.activityContext || historical.activityTrendContext || forecast.activityForecastContext),
    followupProspectingReferralCard: card("FOLLOWUP_PROSPECTING_REFERRAL", "Followup prospecting referral context", metrics.followupProspectingReferralContext || forecast.followupProspectingReferralForecastContext),
    appointmentCard: card("APPOINTMENT_CONTEXT", "Appointment context", metrics.appointmentContext || forecast.appointmentForecastContext),
    pipelineCard: card("PIPELINE_CONTEXT", "Pipeline context", metrics.pipelineContext || forecast.pipelineForecastContext),
    productionContextCard: card("PRODUCTION_CONTEXT", "Production context", metrics.productionContext || forecast.productionForecastContext, ["Production card is not revenue truth."]),
    qualificationContextCard: card("QUALIFICATION_CONTEXT", "Qualification context", metrics.qualificationContext || forecast.qualificationForecastContext, ["Qualification card is not promotion or lifecycle truth."]),
    supportCoachingContextCard: card("SUPPORT_COACHING_CONTEXT", "Support coaching context", metrics.supportCoachingContext || forecast.supportCoachingForecastContext, ["Support/coaching card is not punishment truth."]),
    evidenceQualityCard: card("EVIDENCE_QUALITY_CONTEXT", "Evidence quality context", historical.evidenceQualityContext || metrics.evidenceQualityContext),
    forecastScenarioSummaryCard: card("ADVISOR_FORECAST_SCENARIOS", "Advisor forecast scenario summary", scenarioSummary(forecast))
  };

  const status = boundary.blockedUses.length
    ? MANAGER_ADVISOR_DASHBOARD_STATUSES.BLOCKED
    : boundary.humanReviewRequired
      ? MANAGER_ADVISOR_DASHBOARD_STATUSES.NEEDS_HUMAN_REVIEW
      : MANAGER_ADVISOR_DASHBOARD_STATUSES.READY_FOR_MANAGER_REVIEW;

  return {
    advisorDashboardStatus: status,
    advisorDashboardDecision: status === MANAGER_ADVISOR_DASHBOARD_STATUSES.BLOCKED
      ? MANAGER_ADVISOR_DASHBOARD_DECISIONS.BLOCK_FORBIDDEN_USE
      : status === MANAGER_ADVISOR_DASHBOARD_STATUSES.NEEDS_HUMAN_REVIEW
        ? MANAGER_ADVISOR_DASHBOARD_DECISIONS.REQUIRE_REVIEW
        : MANAGER_ADVISOR_DASHBOARD_DECISIONS.PRESENT_CONTEXT,
    contextOnly: true,
    cards,
    boundary,
    warnings: uniq([...boundary.warnings, "Advisor dashboard cards are review context only."]),
    assumptions: boundary.assumptions,
    confidenceLimitations: boundary.confidenceLimitations,
    evidenceRefs: boundary.evidenceRefs,
    sourceEvidenceIds: boundary.sourceEvidenceIds,
    sourceOwners: boundary.sourceOwners,
    freshness: boundary.freshness,
    ...FALSE_FLAGS
  };
}

module.exports = {
  calculateManagerAdvisorDashboardContext,
  MANAGER_ADVISOR_DASHBOARD_STATUSES,
  MANAGER_ADVISOR_DASHBOARD_DECISIONS
};
