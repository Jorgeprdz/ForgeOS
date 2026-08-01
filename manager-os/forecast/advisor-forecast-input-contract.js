const ADVISOR_FORECAST_SIGNAL_STATES = Object.freeze({
  KNOWN: "KNOWN",
  ZERO: "ZERO",
  UNKNOWN: "UNKNOWN",
  MISSING: "MISSING",
  STALE: "STALE"
});

const ADVISOR_FORECAST_SIGNAL_FIELDS = Object.freeze([
  "target",
  "production",
  "pipeline",
  "activity",
  "appointments",
  "followups",
  "prospecting",
  "referrals",
  "historicalContext"
]);

const DEFAULT_TIME_ZONE = "America/Mexico_City";

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

function clone(value) {
  if (!present(value)) return value;
  return JSON.parse(JSON.stringify(value));
}

function normalizeState(value) {
  const state = String(value || "").trim().toUpperCase();
  return Object.values(ADVISOR_FORECAST_SIGNAL_STATES).includes(state) ? state : null;
}

function createAdvisorForecastSignal({
  state,
  value = null,
  unit = null,
  sourceAuthority = null,
  sourceOwner = null,
  evidenceRefs = [],
  sourceEvidenceIds = [],
  capturedAt = null,
  freshness = null,
  details = null,
  uncertainty = [],
  defaultZeroRisks = []
} = {}) {
  const normalizedState = normalizeState(state);
  if (!normalizedState) throw new TypeError("advisor forecast signal state is invalid");
  if (!present(sourceAuthority)) throw new TypeError("advisor forecast signal sourceAuthority is required");

  const refs = unique(asArray(evidenceRefs));
  const evidenceIds = unique(asArray(sourceEvidenceIds));
  const zeroHasEvidence = refs.length > 0 || evidenceIds.length > 0;

  if (normalizedState === ADVISOR_FORECAST_SIGNAL_STATES.KNOWN && !present(value)) {
    throw new TypeError("KNOWN advisor forecast signal requires a value");
  }
  if (normalizedState === ADVISOR_FORECAST_SIGNAL_STATES.ZERO && value !== 0) {
    throw new TypeError("ZERO advisor forecast signal requires value 0");
  }
  if (normalizedState === ADVISOR_FORECAST_SIGNAL_STATES.ZERO && !zeroHasEvidence) {
    throw new TypeError("ZERO advisor forecast signal requires direct evidence");
  }
  if ([ADVISOR_FORECAST_SIGNAL_STATES.UNKNOWN, ADVISOR_FORECAST_SIGNAL_STATES.MISSING].includes(normalizedState) && present(value)) {
    throw new TypeError(`${normalizedState} advisor forecast signal cannot carry a value`);
  }
  if (normalizedState === ADVISOR_FORECAST_SIGNAL_STATES.STALE && !present(value)) {
    throw new TypeError("STALE advisor forecast signal requires the retained stale value");
  }

  return Object.freeze({
    state: normalizedState,
    value: clone(value),
    unit: unit || null,
    sourceAuthority: String(sourceAuthority),
    sourceOwner: sourceOwner || String(sourceAuthority),
    evidenceRefs: refs,
    sourceEvidenceIds: evidenceIds,
    capturedAt: capturedAt || null,
    freshness: clone(freshness),
    details: clone(details),
    uncertainty: unique(asArray(uncertainty)),
    defaultZeroRisks: unique(asArray(defaultZeroRisks)),
    referenceOnly: true,
    createsTruth: false
  });
}

function createMissingAdvisorForecastSignal(sourceAuthority, reason = "source_not_supplied") {
  return createAdvisorForecastSignal({
    state: ADVISOR_FORECAST_SIGNAL_STATES.MISSING,
    value: null,
    sourceAuthority,
    uncertainty: [reason]
  });
}

function normalizePeriod(period = {}) {
  const safePeriod = isObject(period) ? clone(period) : {};
  return {
    yearMonth: present(safePeriod.yearMonth) ? String(safePeriod.yearMonth) : null,
    start: present(safePeriod.start) ? String(safePeriod.start) : null,
    end: present(safePeriod.end) ? String(safePeriod.end) : null,
    timeZone: present(safePeriod.timeZone) ? String(safePeriod.timeZone) : DEFAULT_TIME_ZONE
  };
}

function buildAdvisorForecastInput({
  advisorId,
  period = {},
  target,
  production,
  pipeline,
  activity,
  appointments,
  followups,
  prospecting,
  referrals,
  historicalContext,
  evidence = {},
  freshness = null,
  generatedAt = null
} = {}) {
  if (!present(advisorId)) throw new TypeError("AdvisorForecastInput advisorId is required");

  const signalValues = {
    target,
    production,
    pipeline,
    activity,
    appointments,
    followups,
    prospecting,
    referrals,
    historicalContext
  };

  ADVISOR_FORECAST_SIGNAL_FIELDS.forEach((field) => {
    if (!isObject(signalValues[field])) throw new TypeError(`AdvisorForecastInput ${field} signal is required`);
    if (!normalizeState(signalValues[field].state)) throw new TypeError(`AdvisorForecastInput ${field} signal state is invalid`);
  });

  const normalized = {
    contractVersion: "ADVISOR_FORECAST_INPUT_V1",
    advisorId: String(advisorId),
    period: normalizePeriod(period),
    ...Object.fromEntries(ADVISOR_FORECAST_SIGNAL_FIELDS.map((field) => [field, clone(signalValues[field])])),
    evidence: {
      evidenceRefs: unique(asArray(evidence.evidenceRefs)),
      sourceEvidenceIds: unique(asArray(evidence.sourceEvidenceIds)),
      sourceOwners: unique(asArray(evidence.sourceOwners))
    },
    freshness: clone(freshness),
    generatedAt: generatedAt || null,
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

  const validation = validateAdvisorForecastInput(normalized);
  if (!validation.valid) {
    throw new TypeError(`AdvisorForecastInput invalid: ${validation.errors.join(", ")}`);
  }
  return Object.freeze(normalized);
}

function validateAdvisorForecastInput(input) {
  const errors = [];
  const warnings = [];
  if (!isObject(input)) return { valid: false, errors: ["input_not_object"], warnings };
  if (!present(input.advisorId)) errors.push("advisor_id_missing");
  if (!isObject(input.period)) errors.push("period_missing");
  else if (input.period.timeZone !== DEFAULT_TIME_ZONE) warnings.push("non_default_timezone_requires_review");

  ADVISOR_FORECAST_SIGNAL_FIELDS.forEach((field) => {
    const signal = input[field];
    if (!isObject(signal)) {
      errors.push(`${field}_signal_missing`);
      return;
    }
    const state = normalizeState(signal.state);
    if (!state) errors.push(`${field}_signal_state_invalid`);
    if (!present(signal.sourceAuthority)) errors.push(`${field}_source_authority_missing`);
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.KNOWN && !present(signal.value)) errors.push(`${field}_known_value_missing`);
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.ZERO) {
      if (signal.value !== 0) errors.push(`${field}_zero_value_invalid`);
      if (asArray(signal.evidenceRefs).length === 0 && asArray(signal.sourceEvidenceIds).length === 0) {
        errors.push(`${field}_zero_evidence_missing`);
      }
    }
    if ([ADVISOR_FORECAST_SIGNAL_STATES.UNKNOWN, ADVISOR_FORECAST_SIGNAL_STATES.MISSING].includes(state) && present(signal.value)) {
      errors.push(`${field}_${state.toLowerCase()}_must_not_carry_value`);
    }
    if (state === ADVISOR_FORECAST_SIGNAL_STATES.STALE && !present(signal.value)) errors.push(`${field}_stale_value_missing`);
  });

  return { valid: errors.length === 0, errors: unique(errors), warnings: unique(warnings) };
}

module.exports = {
  ADVISOR_FORECAST_SIGNAL_STATES,
  ADVISOR_FORECAST_SIGNAL_FIELDS,
  DEFAULT_TIME_ZONE,
  createAdvisorForecastSignal,
  createMissingAdvisorForecastSignal,
  buildAdvisorForecastInput,
  validateAdvisorForecastInput
};
