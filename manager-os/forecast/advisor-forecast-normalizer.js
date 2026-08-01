const {
  ADVISOR_FORECAST_SIGNAL_STATES,
  DEFAULT_TIME_ZONE,
  createAdvisorForecastSignal,
  createMissingAdvisorForecastSignal,
  buildAdvisorForecastInput
} = require("./advisor-forecast-input-contract");

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function clone(value) {
  if (!present(value)) return value;
  return JSON.parse(JSON.stringify(value));
}

function asIso(value) {
  if (!present(value)) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function monthKey(value, timeZone = DEFAULT_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return year && month ? `${year}-${month}` : null;
}

function periodBounds(yearMonth, timeZone = DEFAULT_TIME_ZONE) {
  if (!/^\d{4}-\d{2}$/.test(String(yearMonth || ""))) {
    return { yearMonth: null, start: null, end: null, timeZone };
  }
  const [year, month] = yearMonth.split("-").map(Number);
  const start = `${yearMonth}-01`;
  const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { yearMonth, start, end: `${yearMonth}-${String(endDay).padStart(2, "0")}`, timeZone };
}

function normalizePeriod({ period = null, goalSnapshot = null, now = new Date().toISOString(), timeZone = DEFAULT_TIME_ZONE } = {}) {
  const explicitYearMonth = isObject(period) ? period.yearMonth : null;
  const yearMonth = explicitYearMonth || goalSnapshot?.yearMonth || monthKey(now, timeZone);
  const bounds = periodBounds(yearMonth, timeZone);
  return {
    yearMonth: bounds.yearMonth,
    start: isObject(period) && period.start ? String(period.start) : bounds.start,
    end: isObject(period) && period.end ? String(period.end) : bounds.end,
    timeZone
  };
}

function extractEvidence(value = {}, fallback = {}) {
  return {
    evidenceRefs: unique([
      ...safeArray(value.evidenceRefs),
      ...(value.evidenceRef ? [value.evidenceRef] : []),
      ...safeArray(fallback.evidenceRefs),
      ...(fallback.evidenceRef ? [fallback.evidenceRef] : [])
    ]),
    sourceEvidenceIds: unique([
      ...safeArray(value.sourceEvidenceIds),
      ...(value.sourceEvidenceId ? [value.sourceEvidenceId] : []),
      ...safeArray(fallback.sourceEvidenceIds),
      ...(fallback.sourceEvidenceId ? [fallback.sourceEvidenceId] : [])
    ]),
    sourceOwners: unique([
      ...safeArray(value.sourceOwners),
      ...(value.sourceOwner ? [value.sourceOwner] : []),
      ...safeArray(fallback.sourceOwners),
      ...(fallback.sourceOwner ? [fallback.sourceOwner] : [])
    ])
  };
}

function staleOf(value = {}, fallback = {}) {
  const statuses = [value.freshness?.status, value.freshnessStatus, fallback.freshness?.status, fallback.freshnessStatus]
    .filter(present)
    .map((entry) => String(entry).toUpperCase());
  return value.stale === true || fallback.stale === true || statuses.includes("STALE") || statuses.includes("EXPIRED");
}

function countSignal({ value, sourceAuthority, unit, evidence, stale = false, capturedAt = null, details = null, missingReason }) {
  if (!present(value)) return createMissingAdvisorForecastSignal(sourceAuthority, missingReason || "source_value_missing");
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return createAdvisorForecastSignal({
      state: ADVISOR_FORECAST_SIGNAL_STATES.UNKNOWN,
      sourceAuthority,
      uncertainty: ["invalid_non_negative_count"]
    });
  }
  const state = stale
    ? ADVISOR_FORECAST_SIGNAL_STATES.STALE
    : number === 0
      ? ((evidence.evidenceRefs.length || evidence.sourceEvidenceIds.length)
        ? ADVISOR_FORECAST_SIGNAL_STATES.ZERO
        : ADVISOR_FORECAST_SIGNAL_STATES.UNKNOWN)
      : ADVISOR_FORECAST_SIGNAL_STATES.KNOWN;
  if (state === ADVISOR_FORECAST_SIGNAL_STATES.UNKNOWN) {
    return createAdvisorForecastSignal({
      state,
      sourceAuthority,
      uncertainty: ["explicit_zero_without_direct_evidence"],
      defaultZeroRisks: [`${sourceAuthority.toLowerCase()}_zero_requires_evidence_review`]
    });
  }
  return createAdvisorForecastSignal({
    state,
    value: number,
    unit,
    sourceAuthority,
    sourceOwner: evidence.sourceOwners[0] || sourceAuthority,
    evidenceRefs: evidence.evidenceRefs,
    sourceEvidenceIds: evidence.sourceEvidenceIds,
    capturedAt,
    freshness: { status: stale ? "STALE" : "FRESH" },
    details
  });
}

function normalizeTarget(goalSnapshot, sourceEvidence) {
  if (!goalSnapshot) return createMissingAdvisorForecastSignal("ADVISOR_MONTHLY_POLICY_GOAL", "goal_snapshot_missing");
  const evidence = extractEvidence(goalSnapshot, sourceEvidence);
  return countSignal({
    value: goalSnapshot.targetPolicyCount,
    sourceAuthority: "ADVISOR_MONTHLY_POLICY_GOAL",
    unit: "policies",
    evidence,
    stale: staleOf(goalSnapshot, sourceEvidence),
    capturedAt: goalSnapshot.createdAt || goalSnapshot.updatedAt || sourceEvidence.generatedAt || null,
    details: { yearMonth: goalSnapshot.yearMonth || null, goalVersion: goalSnapshot.version || goalSnapshot.revision || null },
    missingReason: "target_policy_count_missing"
  });
}

function normalizeProduction({ policyFacts, period, advisorId, sourceEvidence }) {
  if (!Array.isArray(policyFacts)) return createMissingAdvisorForecastSignal("PRODUCTION_EVENTS", "policy_facts_missing");
  const scopedFacts = policyFacts.filter((fact) => {
    if (!isObject(fact)) return false;
    if (fact.advisorId && fact.advisorId !== advisorId) throw new Error("Advisor forecast production source returned cross-advisor data");
    const factMonth = fact.yearMonth || monthKey(fact.soldAt || fact.occurredAt || fact.createdAt, period.timeZone);
    return fact.eventType === "POLICY_SOLD_CONFIRMED" && fact.policyId && factMonth === period.yearMonth;
  });
  const uniquePolicies = new Map(scopedFacts.map((fact) => [fact.policyId, fact]));
  const facts = [...uniquePolicies.values()];
  const evidence = {
    evidenceRefs: unique(facts.flatMap((fact) => extractEvidence(fact).evidenceRefs)),
    sourceEvidenceIds: unique(facts.flatMap((fact) => extractEvidence(fact).sourceEvidenceIds)),
    sourceOwners: unique([...facts.flatMap((fact) => extractEvidence(fact).sourceOwners), "PRODUCTION_EVENTS"])
  };
  const directSourceEvidence = extractEvidence(sourceEvidence);
  evidence.evidenceRefs = unique([...evidence.evidenceRefs, ...directSourceEvidence.evidenceRefs]);
  evidence.sourceEvidenceIds = unique([...evidence.sourceEvidenceIds, ...directSourceEvidence.sourceEvidenceIds]);
  evidence.sourceOwners = unique([...evidence.sourceOwners, ...directSourceEvidence.sourceOwners]);
  return countSignal({
    value: facts.length,
    sourceAuthority: "PRODUCTION_EVENTS",
    unit: "policies",
    evidence,
    stale: staleOf(sourceEvidence),
    capturedAt: sourceEvidence.generatedAt || null,
    details: {
      familyProtectedDefinition: "ONE_CONFIRMED_SOLD_POLICY",
      policyIds: facts.map((fact) => fact.policyId),
      yearMonth: period.yearMonth
    }
  });
}

function normalizePipeline(opportunities, advisorId, sourceEvidence) {
  if (!Array.isArray(opportunities)) return createMissingAdvisorForecastSignal("PIPELINE", "opportunities_missing");
  const scoped = opportunities.filter((opportunity) => {
    if (!isObject(opportunity)) return false;
    if (opportunity.advisorId && opportunity.advisorId !== advisorId) throw new Error("Advisor forecast pipeline source returned cross-advisor data");
    return opportunity.archived !== true && opportunity.deleted !== true;
  });
  const evidence = {
    evidenceRefs: unique([...scoped.flatMap((entry) => extractEvidence(entry).evidenceRefs), ...extractEvidence(sourceEvidence).evidenceRefs]),
    sourceEvidenceIds: unique([...scoped.flatMap((entry) => extractEvidence(entry).sourceEvidenceIds), ...extractEvidence(sourceEvidence).sourceEvidenceIds]),
    sourceOwners: unique(["PIPELINE", "BITACORA", ...extractEvidence(sourceEvidence).sourceOwners])
  };
  return countSignal({
    value: scoped.length,
    sourceAuthority: "PIPELINE",
    unit: "opportunities",
    evidence,
    stale: staleOf(sourceEvidence),
    capturedAt: sourceEvidence.generatedAt || null,
    details: {
      opportunityIds: scoped.map((entry) => entry.opportunityId || entry.id).filter(Boolean),
      probabilityWeightingApplied: false,
      amountWeightingApplied: false
    }
  });
}

function normalizeActivity(reportResult, sourceEvidence) {
  if (!reportResult) return createMissingAdvisorForecastSignal("FES", "activity_report_missing");
  const report = reportResult.report || reportResult;
  const evidence = extractEvidence(report, sourceEvidence);
  return countSignal({
    value: report?.totals?.activityCount,
    sourceAuthority: "FES",
    unit: "events",
    evidence,
    stale: staleOf(reportResult, sourceEvidence),
    capturedAt: report.generatedAt || sourceEvidence.generatedAt || null,
    details: { adapter: "REP", chartReadyAvailable: Boolean(reportResult.chartReady) },
    missingReason: "activity_count_missing"
  });
}

function metricsPayload(context) {
  if (!context) return null;
  return context.advisorMetrics || context.metrics || context;
}

function normalizeMetricSignal(context, path, sourceAuthority, unit, sourceEvidence) {
  const metrics = metricsPayload(context);
  const value = path.split(".").reduce((current, key) => current && current[key] !== undefined ? current[key] : null, metrics);
  const evidence = extractEvidence(context || {}, sourceEvidence);
  return countSignal({
    value,
    sourceAuthority,
    unit,
    evidence,
    stale: staleOf(context || {}, sourceEvidence),
    capturedAt: context?.generatedAt || sourceEvidence.generatedAt || null,
    details: { protectedMetricContext: true },
    missingReason: `${path.replaceAll(".", "_")}_missing`
  });
}

function normalizeHistoricalContext(context, sourceEvidence) {
  if (!context) return createMissingAdvisorForecastSignal("MANAGER_ADVISOR_HISTORICAL_ANALYTICS", "historical_context_missing");
  const evidence = extractEvidence(context, sourceEvidence);
  const stale = staleOf(context, sourceEvidence);
  return createAdvisorForecastSignal({
    state: stale ? ADVISOR_FORECAST_SIGNAL_STATES.STALE : ADVISOR_FORECAST_SIGNAL_STATES.KNOWN,
    value: clone(context.advisorHistoricalAnalytics || context),
    unit: "context",
    sourceAuthority: "MANAGER_ADVISOR_HISTORICAL_ANALYTICS",
    sourceOwner: evidence.sourceOwners[0] || "MANAGER_OS",
    evidenceRefs: evidence.evidenceRefs,
    sourceEvidenceIds: evidence.sourceEvidenceIds,
    capturedAt: context.generatedAt || sourceEvidence.generatedAt || null,
    freshness: { status: stale ? "STALE" : "FRESH" },
    details: { protectedHistoricalContext: true }
  });
}

function normalizeAdvisorForecastInput({
  advisorId,
  period = null,
  timeZone = DEFAULT_TIME_ZONE,
  now = new Date().toISOString(),
  goalSnapshot = null,
  policyFacts = null,
  opportunities = null,
  activityReportResult = null,
  advisorMetricsContext = null,
  advisorHistoricalContext = null,
  sourceEvidence = {}
} = {}) {
  if (!present(advisorId)) throw new TypeError("advisorId is required for Advisor Forecast normalization");
  const safeSources = clone({ goalSnapshot, policyFacts, opportunities, activityReportResult, advisorMetricsContext, advisorHistoricalContext, sourceEvidence });
  const normalizedPeriod = normalizePeriod({ period, goalSnapshot: safeSources.goalSnapshot, now, timeZone });
  const evidenceBySource = isObject(safeSources.sourceEvidence) ? safeSources.sourceEvidence : {};

  const input = buildAdvisorForecastInput({
    advisorId,
    period: normalizedPeriod,
    target: normalizeTarget(safeSources.goalSnapshot, evidenceBySource.goal || {}),
    production: normalizeProduction({
      policyFacts: safeSources.policyFacts,
      period: normalizedPeriod,
      advisorId,
      sourceEvidence: evidenceBySource.production || {}
    }),
    pipeline: normalizePipeline(safeSources.opportunities, advisorId, evidenceBySource.pipeline || {}),
    activity: normalizeActivity(safeSources.activityReportResult, evidenceBySource.activity || {}),
    appointments: normalizeMetricSignal(safeSources.advisorMetricsContext, "appointmentContext.count", "ADVISOR_MANAGER_SNAPSHOT", "appointments", evidenceBySource.metrics || {}),
    followups: normalizeMetricSignal(safeSources.advisorMetricsContext, "followupSignalCount", "ADVISOR_MANAGER_SNAPSHOT", "signals", evidenceBySource.metrics || {}),
    prospecting: normalizeMetricSignal(safeSources.advisorMetricsContext, "prospectingSignalCount", "ADVISOR_MANAGER_SNAPSHOT", "signals", evidenceBySource.metrics || {}),
    referrals: normalizeMetricSignal(safeSources.advisorMetricsContext, "referralSignalCount", "ADVISOR_MANAGER_SNAPSHOT", "signals", evidenceBySource.metrics || {}),
    historicalContext: normalizeHistoricalContext(safeSources.advisorHistoricalContext, evidenceBySource.historical || {}),
    evidence: {
      evidenceRefs: unique(Object.values(evidenceBySource).flatMap((entry) => extractEvidence(entry).evidenceRefs)),
      sourceEvidenceIds: unique(Object.values(evidenceBySource).flatMap((entry) => extractEvidence(entry).sourceEvidenceIds)),
      sourceOwners: unique(Object.values(evidenceBySource).flatMap((entry) => extractEvidence(entry).sourceOwners))
    },
    freshness: { generatedAt: asIso(now), timeZone },
    generatedAt: asIso(now)
  });

  return {
    normalizationStatus: "READY_FOR_COMPOSER",
    input,
    normalization: {
      timeZone,
      targetSemantics: "MONTHLY_CONFIRMED_POLICY_COUNT_GOAL",
      productionSemantics: "UNIQUE_POLICY_SOLD_CONFIRMED_EVENTS",
      pipelineSemantics: "ACTIVE_OPPORTUNITY_COUNT_WITHOUT_WEIGHTING",
      activitySemantics: "REP_CONFIRMED_ACTIVITY_COUNT",
      opportunityWeightingApplied: false,
      revenueTruthCreated: false,
      sourceMutationPerformed: false
    }
  };
}

module.exports = {
  monthKey,
  normalizePeriod,
  normalizeAdvisorForecastInput
};
