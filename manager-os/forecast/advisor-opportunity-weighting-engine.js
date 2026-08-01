const ADVISOR_OPPORTUNITY_CLASSIFICATIONS = Object.freeze({
  COMMITTED: "COMMITTED",
  PROBABLE: "PROBABLE",
  POTENTIAL: "POTENTIAL",
  AT_RISK: "AT_RISK",
  UNKNOWN: "UNKNOWN"
});

const STAGE_PRIORS = Object.freeze({
  NEW: 10,
  CONTACTED: 18,
  APPOINTMENT_SCHEDULED: 25,
  DISCOVERY: 32,
  PRESENTATION: 45,
  QUOTE_PRESENTED: 55,
  APPLICATION: 78,
  UNDERWRITING: 84,
  APPROVED: 92
});

const SIGNAL_WEIGHTS = Object.freeze({
  APPOINTMENT_COMPLETED: 8,
  PRESENTATION_COMPLETED: 12,
  QUOTE_PRESENTED: 8,
  BUDGET_CONFIRMED: 10,
  DECISION_DATE_SET: 12,
  DECISION_MAKER_INVOLVED: 8,
  DOCUMENTS_REQUESTED: 8,
  EXPLICIT_BUYING_INTENT: 16,
  FOLLOW_UP_COMPLETED_ON_TIME: 4,
  OBJECTION_RESOLVED: 5,
  OBJECTION_OPEN: -8,
  FOLLOW_UP_OVERDUE: -10,
  DECISION_DELAYED: -8,
  NO_RESPONSE_7D: -12,
  NO_NEXT_ACTION: -10,
  STALE_14D: -14,
  CLIENT_DECLINED: -40,
  COMPETITOR_SELECTED: -30
});

const CLOSED_STATES = new Set(["CLOSED_WON", "WON", "ISSUED", "SOLD", "CLOSED_LOST", "LOST", "DECLINED"]);

function present(value) { return value !== undefined && value !== null && value !== ""; }
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function safeArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(present))]; }
function upper(value) { return present(value) ? String(value).trim().toUpperCase() : null; }
function finite(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
function round(value, digits = 2) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }

function evidenceOf(value = {}, fallback = {}) {
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

function normalizedSignals(opportunity = {}, sourceEvidence = {}) {
  return safeArray(opportunity.signals)
    .map((signal) => typeof signal === "string" ? { code: signal } : signal)
    .filter((signal) => signal && signal.code)
    .map((signal) => {
      const evidence = evidenceOf(signal, sourceEvidence);
      const explicitWeight = finite(signal.weight);
      return {
        code: upper(signal.code),
        weight: explicitWeight === null ? (SIGNAL_WEIGHTS[upper(signal.code)] || 0) : explicitWeight,
        occurredAt: signal.occurredAt || signal.createdAt || null,
        evidenceRefs: evidence.evidenceRefs,
        sourceEvidenceIds: evidence.sourceEvidenceIds,
        evidenceBacked: evidence.evidenceRefs.length > 0 || evidence.sourceEvidenceIds.length > 0
      };
    });
}

function classify(probability, signals) {
  if (probability === null) return ADVISOR_OPPORTUNITY_CLASSIFICATIONS.UNKNOWN;
  const codes = new Set(signals.map((signal) => signal.code));
  if (codes.has("CLIENT_DECLINED") || codes.has("COMPETITOR_SELECTED") || probability < 25) {
    return ADVISOR_OPPORTUNITY_CLASSIFICATIONS.AT_RISK;
  }
  if (probability >= 80) return ADVISOR_OPPORTUNITY_CLASSIFICATIONS.COMMITTED;
  if (probability >= 55) return ADVISOR_OPPORTUNITY_CLASSIFICATIONS.PROBABLE;
  return ADVISOR_OPPORTUNITY_CLASSIFICATIONS.POTENTIAL;
}

function weightOpportunity(opportunity, { advisorId, sourceEvidence = {} } = {}) {
  if (!opportunity || typeof opportunity !== "object") return null;
  if (opportunity.advisorId && advisorId && opportunity.advisorId !== advisorId) {
    throw new Error("Advisor opportunity weighting source returned cross-advisor data");
  }

  const opportunityId = opportunity.opportunityId || opportunity.id || null;
  const status = upper(opportunity.status || opportunity.state);
  const stage = upper(opportunity.stage || opportunity.pipelineStage || opportunity.status);
  const evidence = evidenceOf(opportunity, sourceEvidence);
  const signals = normalizedSignals(opportunity, sourceEvidence);
  const directEvidence = evidence.evidenceRefs.length > 0 || evidence.sourceEvidenceIds.length > 0;
  const evidenceBackedSignals = signals.filter((signal) => signal.evidenceBacked);
  const ignoredSignals = signals.filter((signal) => !signal.evidenceBacked).map((signal) => signal.code);
  const closed = opportunity.archived === true || opportunity.deleted === true || CLOSED_STATES.has(status) || CLOSED_STATES.has(stage);

  if (closed) {
    return Object.freeze({
      opportunityId,
      stage,
      status,
      included: false,
      excludedReason: "CLOSED_OR_ARCHIVED_OPPORTUNITY",
      probability: null,
      expectedPolicyContribution: 0,
      classification: ADVISOR_OPPORTUNITY_CLASSIFICATIONS.UNKNOWN,
      evidenceRefs: evidence.evidenceRefs,
      sourceEvidenceIds: evidence.sourceEvidenceIds,
      signalTrace: [],
      ignoredSignals,
      amountWeightingApplied: false,
      createsRevenueTruth: false
    });
  }

  if (!directEvidence && evidenceBackedSignals.length === 0) {
    return Object.freeze({
      opportunityId,
      stage,
      status,
      included: true,
      probability: null,
      expectedPolicyContribution: null,
      classification: ADVISOR_OPPORTUNITY_CLASSIFICATIONS.UNKNOWN,
      missingEvidence: ["opportunity_probability_evidence_missing"],
      evidenceRefs: [],
      sourceEvidenceIds: [],
      signalTrace: [],
      ignoredSignals,
      amountWeightingApplied: false,
      createsRevenueTruth: false
    });
  }

  const stagePrior = STAGE_PRIORS[stage] ?? 20;
  const signalAdjustment = evidenceBackedSignals.reduce((sum, signal) => sum + signal.weight, 0);
  const probability = Math.max(5, Math.min(95, Math.round(stagePrior + signalAdjustment)));
  const classification = classify(probability, evidenceBackedSignals);

  return Object.freeze({
    opportunityId,
    stage,
    status,
    included: true,
    probability,
    expectedPolicyContribution: round(probability / 100, 2),
    classification,
    evidenceRefs: unique([...evidence.evidenceRefs, ...evidenceBackedSignals.flatMap((signal) => signal.evidenceRefs)]),
    sourceEvidenceIds: unique([...evidence.sourceEvidenceIds, ...evidenceBackedSignals.flatMap((signal) => signal.sourceEvidenceIds)]),
    sourceOwners: unique([...evidence.sourceOwners, "PIPELINE", "BITACORA"]),
    signalTrace: evidenceBackedSignals.map((signal) => ({ code: signal.code, weight: signal.weight, occurredAt: signal.occurredAt })),
    ignoredSignals,
    stagePrior,
    signalAdjustment,
    policyEquivalentCount: 1,
    amount: finite(opportunity.amount || opportunity.estimatedAmount),
    weightedAmount: null,
    amountWeightingApplied: false,
    probabilityIsDecisionContextOnly: true,
    createsRevenueTruth: false
  });
}

function weightAdvisorOpportunities({ advisorId, opportunities = null, sourceEvidence = {}, generatedAt = null } = {}) {
  if (!advisorId) throw new TypeError("advisorId is required for opportunity weighting");
  if (!Array.isArray(opportunities)) {
    return Object.freeze({
      weightingStatus: "MISSING_DATA",
      advisorId,
      generatedAt,
      activeOpportunityCount: null,
      weightedPolicyContribution: null,
      classificationCounts: null,
      opportunities: [],
      topContributors: [],
      atRiskCount: null,
      unknownCount: null,
      warnings: ["Opportunity source is missing; missing pipeline is not zero pipeline."],
      amountWeightingApplied: false,
      createsRevenueTruth: false,
      sourceMutationPerformed: false
    });
  }

  const before = JSON.stringify(opportunities);
  const weighted = opportunities.map((opportunity) => weightOpportunity(clone(opportunity), { advisorId, sourceEvidence })).filter(Boolean);
  const included = weighted.filter((entry) => entry.included);
  const known = included.filter((entry) => typeof entry.expectedPolicyContribution === "number");
  const classificationCounts = Object.fromEntries(Object.values(ADVISOR_OPPORTUNITY_CLASSIFICATIONS).map((key) => [key, 0]));
  included.forEach((entry) => { classificationCounts[entry.classification] += 1; });
  const weightedPolicyContribution = round(known.reduce((sum, entry) => sum + entry.expectedPolicyContribution, 0), 2);
  const unknownCount = classificationCounts.UNKNOWN;
  const weightingStatus = included.length === 0
    ? "EMPTY"
    : unknownCount === included.length
      ? "MISSING_EVIDENCE"
      : unknownCount > 0
        ? "PARTIAL"
        : "READY";

  const topContributors = known
    .slice()
    .sort((left, right) => right.expectedPolicyContribution - left.expectedPolicyContribution || String(left.opportunityId).localeCompare(String(right.opportunityId)))
    .slice(0, 5);

  if (JSON.stringify(opportunities) !== before) throw new Error("Opportunity weighting mutated source input");

  return Object.freeze({
    weightingStatus,
    advisorId,
    generatedAt,
    activeOpportunityCount: included.length,
    weightedPolicyContribution,
    classificationCounts,
    opportunities: weighted,
    topContributors,
    atRiskCount: classificationCounts.AT_RISK,
    unknownCount,
    evidenceRefs: unique(known.flatMap((entry) => entry.evidenceRefs)),
    sourceEvidenceIds: unique(known.flatMap((entry) => entry.sourceEvidenceIds)),
    warnings: unique([
      ...(unknownCount > 0 ? ["Some opportunities remain UNKNOWN because evidence is incomplete."] : []),
      "Opportunity weighting estimates policy contribution only; it does not create revenue truth."
    ]),
    amountWeightingApplied: false,
    automaticDecisionAllowed: false,
    createsRevenueTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false
  });
}

module.exports = {
  ADVISOR_OPPORTUNITY_CLASSIFICATIONS,
  STAGE_PRIORS,
  SIGNAL_WEIGHTS,
  weightOpportunity,
  weightAdvisorOpportunities
};
