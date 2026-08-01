const ADVISOR_ACTIVITY_REQUIREMENT_STATUSES = Object.freeze({
  GOAL_COVERED: "GOAL_COVERED",
  READY: "READY",
  PARTIAL: "PARTIAL",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",
  BLOCKED: "BLOCKED"
});

const CONVERSION_RATE_KEYS = Object.freeze([
  "contactToAppointment",
  "appointmentToPresentation",
  "presentationToApplication",
  "applicationToPolicy"
]);

const SOURCE_PRIORITY = Object.freeze([
  { key: "advisorHistoricalConversions", authority: "ADVISOR_HISTORICAL_CONVERSION" },
  { key: "advisorRecentConversions", authority: "ADVISOR_RECENT_CONVERSION" },
  { key: "governedBenchmarkConversions", authority: "GOVERNED_CONVERSION_BENCHMARK" }
]);

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizedStatus(value) {
  return present(value) ? String(value).trim().toUpperCase() : null;
}

function normalizeRate(raw, authority, rateKey) {
  const value = finite(raw && typeof raw === "object" ? raw.value : raw);
  const context = raw && typeof raw === "object" ? raw : {};
  const evidenceRefs = unique([
    ...asArray(context.evidenceRefs),
    ...asArray(context.evidenceRef)
  ]);
  const sourceEvidenceIds = unique([
    ...asArray(context.sourceEvidenceIds),
    ...asArray(context.sourceEvidenceId)
  ]);
  const sourceOwners = unique([
    ...asArray(context.sourceOwners),
    ...asArray(context.sourceOwner),
    authority
  ]);
  const freshnessStatus = normalizedStatus(
    context.freshness && typeof context.freshness === "object"
      ? context.freshness.status
      : context.freshness || context.freshnessStatus
  );
  const stale = context.stale === true || freshnessStatus === "STALE" || freshnessStatus === "EXPIRED";
  const numerator = finite(context.numerator);
  const denominator = finite(context.denominator ?? context.sampleSize);
  const valid = value !== null && value > 0 && value <= 1;
  const evidenceBacked = evidenceRefs.length > 0 || sourceEvidenceIds.length > 0;

  return {
    rateKey,
    value,
    valid,
    evidenceBacked,
    authority,
    sourceOwner: sourceOwners[0] || authority,
    numerator,
    denominator,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    stale,
    freshness: freshnessStatus || null,
    periodRange: clone(context.periodRange || null)
  };
}

function selectRate(input, rateKey) {
  const candidates = SOURCE_PRIORITY.map((source) => normalizeRate(
    input[source.key] && input[source.key][rateKey],
    source.authority,
    rateKey
  ));
  const usable = candidates.filter((candidate) => candidate.valid && candidate.evidenceBacked);
  const selected = usable.find((candidate) => !candidate.stale) || usable[0] || null;

  return {
    selected,
    candidates,
    missing: selected === null,
    rejected: candidates.filter((candidate) => !candidate.valid || !candidate.evidenceBacked).map((candidate) => ({
      authority: candidate.authority,
      reason: !candidate.valid ? "INVALID_RATE" : "MISSING_EVIDENCE"
    }))
  };
}

function remainingCalendarDays(generatedAt, period) {
  if (!generatedAt || !period || !period.end) return null;
  const generated = new Date(generatedAt);
  const end = new Date(`${period.end}T23:59:59.999Z`);
  if (Number.isNaN(generated.getTime()) || Number.isNaN(end.getTime())) return null;
  if (generated > end) return 0;
  return Math.max(1, Math.ceil((end.getTime() - generated.getTime()) / 86400000));
}

function confidenceOf(rates) {
  if (!rates.length) return "INSUFFICIENT_DATA";
  const allHistorical = rates.every((rate) => rate.authority === "ADVISOR_HISTORICAL_CONVERSION");
  const anyBenchmark = rates.some((rate) => rate.authority === "GOVERNED_CONVERSION_BENCHMARK");
  const anyStale = rates.some((rate) => rate.stale);
  const denominators = rates.map((rate) => rate.denominator).filter((value) => value !== null);
  const minimumSample = denominators.length === rates.length ? Math.min(...denominators) : null;

  if (allHistorical && !anyStale && minimumSample !== null && minimumSample >= 20) return "HIGH";
  if (!anyBenchmark && !anyStale && minimumSample !== null && minimumSample >= 10) return "MEDIUM";
  return "LOW";
}

function boundaryFlags() {
  return {
    automaticDecisionAllowed: false,
    automaticTaskCreationAllowed: false,
    automaticCalendarCreationAllowed: false,
    createsActivityTruth: false,
    createsDatabaseWrite: false,
    createsCrmWrite: false,
    createsRevenueTruth: false,
    sourceMutationPerformed: false
  };
}

function insufficientResult({ generatedAt, residualGap, missingRates, evidenceRefs = [], warnings = [] }) {
  return Object.freeze({
    requirementStatus: ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.INSUFFICIENT_DATA,
    generatedAt: generatedAt || null,
    residualPolicyGap: residualGap,
    policiesRequired: null,
    applicationsRequired: null,
    presentationsRequired: null,
    appointmentsRequired: null,
    contactsRequired: null,
    selectedRates: {},
    missingRates,
    evidenceRefs: unique(evidenceRefs),
    confidence: "INSUFFICIENT_DATA",
    precisionPolicy: "NO_REQUIREMENT_WITHOUT_EVIDENCE_BACKED_CONVERSIONS",
    warnings: unique([
      ...warnings,
      "Missing conversion context remains UNKNOWN and does not become a zero or an invented benchmark."
    ]),
    humanConfirmationRequired: true,
    ...boundaryFlags()
  });
}

function calculateAdvisorActivityRequirement({
  goalGap = null,
  period = null,
  generatedAt = null,
  advisorHistoricalConversions = null,
  advisorRecentConversions = null,
  governedBenchmarkConversions = null,
  maximumRequiredContacts = 100000
} = {}) {
  const input = {
    advisorHistoricalConversions: clone(advisorHistoricalConversions || {}),
    advisorRecentConversions: clone(advisorRecentConversions || {}),
    governedBenchmarkConversions: clone(governedBenchmarkConversions || {})
  };
  const residualGap = finite(goalGap && goalGap.remainingAfterWeightedPipeline);

  if (residualGap === null) {
    return insufficientResult({
      generatedAt,
      residualGap: null,
      missingRates: CONVERSION_RATE_KEYS,
      warnings: ["Goal Gap residual is required before activity requirements can be calculated."]
    });
  }

  if (residualGap <= 0) {
    return Object.freeze({
      requirementStatus: ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.GOAL_COVERED,
      generatedAt: generatedAt || null,
      residualPolicyGap: 0,
      policiesRequired: 0,
      applicationsRequired: 0,
      presentationsRequired: 0,
      appointmentsRequired: 0,
      contactsRequired: 0,
      selectedRates: {},
      missingRates: [],
      evidenceRefs: [],
      sourceEvidenceIds: [],
      sourceOwners: [],
      confidence: "HIGH",
      cadence: {
        remainingCalendarDays: remainingCalendarDays(generatedAt, period),
        contactsPerRemainingDay: 0,
        appointmentsPerRemainingWeek: 0
      },
      recommendedActions: [],
      precisionPolicy: "INTEGER_MINIMUM_NOT_GUARANTEE",
      assumptions: ["The governed Goal Gap is already covered."],
      warnings: [],
      humanConfirmationRequired: true,
      ...boundaryFlags()
    });
  }

  const selections = Object.fromEntries(CONVERSION_RATE_KEYS.map((rateKey) => [rateKey, selectRate(input, rateKey)]));
  const missingRates = CONVERSION_RATE_KEYS.filter((rateKey) => selections[rateKey].missing);
  if (missingRates.length > 0) {
    return insufficientResult({
      generatedAt,
      residualGap,
      missingRates,
      evidenceRefs: CONVERSION_RATE_KEYS.flatMap((rateKey) => selections[rateKey].selected?.evidenceRefs || []),
      warnings: missingRates.map((rateKey) => `${rateKey} conversion is unavailable or lacks evidence.`)
    });
  }

  const selectedRates = Object.fromEntries(CONVERSION_RATE_KEYS.map((rateKey) => [rateKey, selections[rateKey].selected]));
  const policiesRequired = Math.ceil(residualGap);
  const applicationsRequired = Math.ceil(policiesRequired / selectedRates.applicationToPolicy.value);
  const presentationsRequired = Math.ceil(applicationsRequired / selectedRates.presentationToApplication.value);
  const appointmentsRequired = Math.ceil(presentationsRequired / selectedRates.appointmentToPresentation.value);
  const contactsRequired = Math.ceil(appointmentsRequired / selectedRates.contactToAppointment.value);

  if (![policiesRequired, applicationsRequired, presentationsRequired, appointmentsRequired, contactsRequired].every(Number.isSafeInteger)
      || contactsRequired > maximumRequiredContacts) {
    return Object.freeze({
      requirementStatus: ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.BLOCKED,
      generatedAt: generatedAt || null,
      residualPolicyGap: residualGap,
      selectedRates: clone(selectedRates),
      missingRates: [],
      confidence: "LOW",
      warnings: ["Calculated activity requirement exceeded the governed safety ceiling and requires human review."],
      humanConfirmationRequired: true,
      ...boundaryFlags()
    });
  }

  const rates = Object.values(selectedRates);
  const daysRemaining = remainingCalendarDays(generatedAt, period);
  const weeksRemaining = daysRemaining === null ? null : Math.max(1, Math.ceil(daysRemaining / 7));
  const evidenceRefs = unique(rates.flatMap((rate) => rate.evidenceRefs));
  const sourceEvidenceIds = unique(rates.flatMap((rate) => rate.sourceEvidenceIds));
  const sourceOwners = unique(rates.flatMap((rate) => rate.sourceOwners));
  const confidence = confidenceOf(rates);
  const staleRates = rates.filter((rate) => rate.stale).map((rate) => rate.rateKey);
  const benchmarkRates = rates.filter((rate) => rate.authority === "GOVERNED_CONVERSION_BENCHMARK").map((rate) => rate.rateKey);

  return Object.freeze({
    requirementStatus: confidence === "LOW" ? ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.PARTIAL : ADVISOR_ACTIVITY_REQUIREMENT_STATUSES.READY,
    generatedAt: generatedAt || null,
    period: clone(period || null),
    residualPolicyGap: round(residualGap, 2),
    policiesRequired,
    applicationsRequired,
    presentationsRequired,
    appointmentsRequired,
    contactsRequired,
    selectedRates: clone(selectedRates),
    missingRates: [],
    staleRates,
    benchmarkRates,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    confidence,
    cadence: {
      remainingCalendarDays: daysRemaining,
      remainingCalendarWeeks: weeksRemaining,
      contactsPerRemainingDay: daysRemaining ? Math.ceil(contactsRequired / daysRemaining) : null,
      appointmentsPerRemainingWeek: weeksRemaining ? Math.ceil(appointmentsRequired / weeksRemaining) : null,
      applicationsPerRemainingWeek: weeksRemaining ? Math.ceil(applicationsRequired / weeksRemaining) : null,
      schedulingAuthority: "HUMAN"
    },
    recommendedActions: [
      { actionType: "PROSPECTING_CONTACTS", requiredCount: contactsRequired, unit: "contacts" },
      { actionType: "APPOINTMENTS", requiredCount: appointmentsRequired, unit: "appointments" },
      { actionType: "PRESENTATIONS", requiredCount: presentationsRequired, unit: "presentations" },
      { actionType: "APPLICATIONS", requiredCount: applicationsRequired, unit: "applications" }
    ],
    precisionPolicy: "CEILING_INTEGER_MINIMUM_NOT_GUARANTEE",
    assumptions: [
      "The residual Goal Gap is expressed in expected policy equivalents.",
      "Each funnel requirement is rounded upward to a minimum whole activity count.",
      "Selected conversion rates are context for planning and do not guarantee outcomes."
    ],
    confidenceLimitations: unique([
      ...(staleRates.length ? [`stale_rates:${staleRates.join(",")}`] : []),
      ...(benchmarkRates.length ? [`benchmark_rates:${benchmarkRates.join(",")}`] : []),
      ...(rates.some((rate) => rate.denominator === null) ? ["conversion_sample_size_missing"] : [])
    ]),
    warnings: unique([
      "Activity requirements are planning context and must be reviewed by the advisor.",
      ...(benchmarkRates.length ? ["At least one governed benchmark was used because advisor-specific evidence was unavailable."] : []),
      ...(staleRates.length ? ["At least one selected conversion rate is stale."] : [])
    ]),
    humanConfirmationRequired: true,
    ...boundaryFlags()
  });
}

module.exports = {
  ADVISOR_ACTIVITY_REQUIREMENT_STATUSES,
  CONVERSION_RATE_KEYS,
  calculateAdvisorActivityRequirement
};
