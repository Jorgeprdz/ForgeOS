const {
  ADVISOR_FORECAST_SIGNAL_STATES,
  ADVISOR_FORECAST_SIGNAL_FIELDS,
  validateAdvisorForecastInput
} = require("./advisor-forecast-input-contract");

const ADVISOR_FORECAST_STATUSES = Object.freeze({
  ON_TRACK: "ON_TRACK",
  AT_RISK: "AT_RISK",
  BEHIND: "BEHIND",
  NEEDS_UPDATE: "NEEDS_UPDATE",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA"
});

const ADVISOR_FORECAST_CONFIDENCE = Object.freeze({
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA"
});

const SCENARIO_MULTIPLIERS = Object.freeze({
  CONSERVATIVE: 0.8,
  BASELINE: 1,
  STRETCH: 1.2
});

function present(value) { return value !== undefined && value !== null && value !== ""; }
function asArray(value) { if (!present(value)) return []; return Array.isArray(value) ? value.filter(present) : [value].filter(present); }
function unique(values) { return [...new Set(values.filter(present))]; }
function clone(value) { return present(value) ? JSON.parse(JSON.stringify(value)) : value; }
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}
function round(value, decimals = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
function signalHasValue(signal) {
  return Boolean(signal) && [
    ADVISOR_FORECAST_SIGNAL_STATES.KNOWN,
    ADVISOR_FORECAST_SIGNAL_STATES.ZERO,
    ADVISOR_FORECAST_SIGNAL_STATES.STALE
  ].includes(signal.state) && present(signal.value);
}
function numericSignalValue(signal) {
  if (!signalHasValue(signal)) return null;
  const value = Number(signal.value);
  return Number.isFinite(value) ? value : null;
}
function localDateKey(value, timeZone) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : null;
}
function daysBetweenInclusive(start, end) {
  if (!start || !end) return null;
  const left = Date.parse(`${start}T00:00:00.000Z`);
  const right = Date.parse(`${end}T00:00:00.000Z`);
  if (!Number.isFinite(left) || !Number.isFinite(right) || right < left) return null;
  return Math.floor((right - left) / 86400000) + 1;
}
function calculatePaceProjection({ production, period, generatedAt }) {
  if (typeof production !== "number" || production < 0) {
    return { status: "UNAVAILABLE", reason: "production_unavailable" };
  }
  const totalDays = daysBetweenInclusive(period.start, period.end);
  const currentDate = localDateKey(generatedAt, period.timeZone);
  if (!totalDays || !currentDate) {
    return { status: "UNAVAILABLE", reason: "period_or_generated_at_invalid" };
  }
  let elapsedDays = 0;
  if (currentDate < period.start) elapsedDays = 0;
  else if (currentDate > period.end) elapsedDays = totalDays;
  else elapsedDays = daysBetweenInclusive(period.start, currentDate);
  if (!elapsedDays) {
    return { status: "UNAVAILABLE", reason: "period_not_started", totalDays, elapsedDays: 0 };
  }
  const dailyRate = production / elapsedDays;
  const baseline = round(dailyRate * totalDays, 1);
  return {
    status: "READY",
    authority: "SMNYL_PACE_FORECAST_COMPATIBLE_V1",
    productionUnit: "policies",
    elapsedDays,
    totalDays,
    dailyRate: round(dailyRate, 3),
    baselineProjection: baseline,
    scenarios: {
      conservative: round(baseline * SCENARIO_MULTIPLIERS.CONSERVATIVE, 1),
      baseline,
      stretch: round(baseline * SCENARIO_MULTIPLIERS.STRETCH, 1)
    },
    assumptions: [
      "Confirmed policy pace is extrapolated linearly across the normalized monthly period.",
      "Conservative and stretch scenarios use the existing 0.8 and 1.2 forecast scenario multipliers."
    ]
  };
}
function buildManagerMetricsContext(input) {
  const value = (signal) => numericSignalValue(signal);
  const metrics = {};
  const activity = value(input.activity); if (activity !== null) metrics.activitySignalCount = activity;
  const followups = value(input.followups); if (followups !== null) metrics.followupSignalCount = followups;
  const prospecting = value(input.prospecting); if (prospecting !== null) metrics.prospectingSignalCount = prospecting;
  const referrals = value(input.referrals); if (referrals !== null) metrics.referralSignalCount = referrals;
  const appointments = value(input.appointments); if (appointments !== null) metrics.appointmentContext = { count: appointments };
  const pipeline = value(input.pipeline); if (pipeline !== null) metrics.pipelineContext = { count: pipeline };
  const production = value(input.production); if (production !== null) metrics.productionContext = { count: production };
  return {
    advisorMetrics: metrics,
    evidenceRefs: clone(input.evidence.evidenceRefs),
    sourceEvidenceIds: clone(input.evidence.sourceEvidenceIds),
    sourceOwners: clone(input.evidence.sourceOwners),
    freshness: clone(input.freshness)
  };
}
function resolveManagerForecastEngine(override) {
  if (typeof override === "function") return override;
  return require("./manager-advisor-forecast-engine").calculateManagerAdvisorForecast;
}
function signalQuality(input) {
  const counts = {
    known: 0,
    zero: 0,
    stale: 0,
    unknown: 0,
    missing: 0,
    usable: 0,
    freshUsable: 0
  };
  const byState = {};
  for (const field of ADVISOR_FORECAST_SIGNAL_FIELDS) {
    const state = input[field].state;
    byState[field] = state;
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.KNOWN) counts.known += 1;
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.ZERO) counts.zero += 1;
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.STALE) counts.stale += 1;
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.UNKNOWN) counts.unknown += 1;
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.MISSING) counts.missing += 1;
    if (signalHasValue(input[field])) counts.usable += 1;
    if ([ADVISOR_FORECAST_SIGNAL_STATES.KNOWN, ADVISOR_FORECAST_SIGNAL_STATES.ZERO].includes(state)) {
      counts.freshUsable += 1;
    }
  }
  return { ...counts, byState };
}
function resolveConfidence(input, quality) {
  if (!signalHasValue(input.target) || !signalHasValue(input.production)) {
    return ADVISOR_FORECAST_CONFIDENCE.INSUFFICIENT_DATA;
  }
  if ([input.target.state, input.production.state].includes(ADVISOR_FORECAST_SIGNAL_STATES.STALE)) {
    return ADVISOR_FORECAST_CONFIDENCE.LOW;
  }
  if (quality.stale > 0 || quality.unknown + quality.missing >= 4) {
    return ADVISOR_FORECAST_CONFIDENCE.LOW;
  }
  if (
    quality.freshUsable === ADVISOR_FORECAST_SIGNAL_FIELDS.length &&
    input.evidence.evidenceRefs.length + input.evidence.sourceEvidenceIds.length > 0
  ) {
    return ADVISOR_FORECAST_CONFIDENCE.HIGH;
  }
  return ADVISOR_FORECAST_CONFIDENCE.MEDIUM;
}
function resolveStatus({ input, confidence, pace, target }) {
  if (
    confidence === ADVISOR_FORECAST_CONFIDENCE.INSUFFICIENT_DATA ||
    pace.status !== "READY" ||
    typeof target !== "number" ||
    target <= 0
  ) {
    return ADVISOR_FORECAST_STATUSES.INSUFFICIENT_DATA;
  }
  if ([input.target.state, input.production.state].includes(ADVISOR_FORECAST_SIGNAL_STATES.STALE)) {
    return ADVISOR_FORECAST_STATUSES.NEEDS_UPDATE;
  }
  const coverage = pace.baselineProjection / target;
  if (coverage >= 1) return ADVISOR_FORECAST_STATUSES.ON_TRACK;
  if (coverage >= 0.8) return ADVISOR_FORECAST_STATUSES.AT_RISK;
  return ADVISOR_FORECAST_STATUSES.BEHIND;
}
function composeAdvisorForecast(input, options = {}) {
  const validation = validateAdvisorForecastInput(input);
  if (!validation.valid) {
    throw new TypeError(`AdvisorForecastInput invalid: ${validation.errors.join(", ")}`);
  }
  const safeInput = clone(input);
  const quality = signalQuality(safeInput);
  const target = numericSignalValue(safeInput.target);
  const production = numericSignalValue(safeInput.production);
  const pace = calculatePaceProjection({
    production,
    period: safeInput.period,
    generatedAt: safeInput.generatedAt
  });
  const confidence = resolveConfidence(safeInput, quality);
  const status = resolveStatus({ input: safeInput, confidence, pace, target });
  const coverage = pace.status === "READY" && typeof target === "number" && target > 0
    ? round((pace.baselineProjection / target) * 100, 1)
    : null;
  const currentProgress = typeof production === "number" && typeof target === "number" && target > 0
    ? round((production / target) * 100, 1)
    : null;
  const managerEngine = resolveManagerForecastEngine(options.managerForecastEngine);
  const historicalUsable = signalHasValue(safeInput.historicalContext);
  const managerForecast = managerEngine({
    advisorMetricsContext: buildManagerMetricsContext(safeInput),
    advisorHistoricalContext: historicalUsable ? {
      advisorHistoricalAnalytics: clone(safeInput.historicalContext.value),
      evidenceRefs: clone(safeInput.historicalContext.evidenceRefs),
      sourceEvidenceIds: clone(safeInput.historicalContext.sourceEvidenceIds),
      sourceOwners: [safeInput.historicalContext.sourceOwner],
      freshness: clone(safeInput.historicalContext.freshness)
    } : null,
    sourceEvidence: {
      evidenceRefs: clone(safeInput.evidence.evidenceRefs),
      sourceEvidenceIds: clone(safeInput.evidence.sourceEvidenceIds),
      sourceOwners: clone(safeInput.evidence.sourceOwners),
      freshness: clone(safeInput.freshness),
      generatedAt: safeInput.generatedAt
    },
    requestedUse: "FORECAST_CONTEXT",
    periodRange: clone(safeInput.period),
    generatedAt: safeInput.generatedAt,
    assumptions: [
      "Advisor Forecast V1 uses confirmed policy count pace and protected operational context only.",
      "Pipeline is active opportunity count without probability or amount weighting."
    ],
    confidenceLimitations: [
      "Pace projection is linear and does not predict individual opportunity closure.",
      "Forecast context does not create revenue, compensation, ranking, promotion or lifecycle truth."
    ]
  });
  const evidenceRefs = unique([
    ...asArray(safeInput.evidence.evidenceRefs),
    ...ADVISOR_FORECAST_SIGNAL_FIELDS.flatMap((field) => asArray(safeInput[field].evidenceRefs)),
    ...asArray(managerForecast.evidenceRefs)
  ]);
  const sourceEvidenceIds = unique([
    ...asArray(safeInput.evidence.sourceEvidenceIds),
    ...ADVISOR_FORECAST_SIGNAL_FIELDS.flatMap((field) => asArray(safeInput[field].sourceEvidenceIds)),
    ...asArray(managerForecast.sourceEvidenceIds)
  ]);
  const result = {
    contractVersion: "ADVISOR_FORECAST_COMPOSER_V1",
    advisorId: safeInput.advisorId,
    period: clone(safeInput.period),
    generatedAt: safeInput.generatedAt,
    freshness: clone(safeInput.freshness),
    forecastStatus: status,
    confidence,
    current: {
      target,
      production,
      currentProgressPercent: currentProgress,
      unit: "policies"
    },
    pace,
    projectedCoveragePercent: coverage,
    operationalContext: {
      pipeline: clone(safeInput.pipeline),
      activity: clone(safeInput.activity),
      appointments: clone(safeInput.appointments),
      followups: clone(safeInput.followups),
      prospecting: clone(safeInput.prospecting),
      referrals: clone(safeInput.referrals)
    },
    protectedForecastContext: clone(managerForecast.advisorForecastContext),
    forecastBoundary: clone(managerForecast.boundaryContext),
    managerForecastStatus: managerForecast.forecastStatus,
    signalQuality: quality,
    evidence: {
      evidenceRefs,
      sourceEvidenceIds,
      sourceOwners: unique([
        ...asArray(safeInput.evidence.sourceOwners),
        ...asArray(managerForecast.sourceOwners)
      ])
    },
    assumptions: unique([
      ...asArray(pace.assumptions),
      ...asArray(managerForecast.assumptions)
    ]),
    confidenceLimitations: unique(asArray(managerForecast.confidenceLimitations)),
    warnings: unique([
      ...asArray(managerForecast.warnings),
      "Advisor Forecast V1 does not weight opportunities by amount or probability.",
      "Confirmed policy counts are not revenue truth."
    ]),
    truthFlags: {
      automaticDecisionAllowed: false,
      createsRevenueTruth: false,
      createsCompensationTruth: false,
      createsPipelineTruth: false,
      createsActivityTruth: false,
      createsDatabaseWrite: false,
      createsFilesystemWrite: false,
      createsCacheWrite: false
    }
  };
  return deepFreeze(result);
}

module.exports = {
  ADVISOR_FORECAST_STATUSES,
  ADVISOR_FORECAST_CONFIDENCE,
  SCENARIO_MULTIPLIERS,
  calculatePaceProjection,
  composeAdvisorForecast
};
