export const INCOME_PRESENTATION_CONTRACT = "FORGE_AURA_INCOME_PRESENTATION_001";
export const PRODUCT_READ_MODEL_CONTRACT = "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001";
export const PERIOD_SNAPSHOT_CONTRACT = "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001";
export const HISTORY_CONTRACT = "ADVISOR_COMPENSATION_HISTORY_SERIES_001";

export const INCOME_STATES = Object.freeze({
  LOADING: "LOADING",
  READY: "READY",
  PARTIAL: "PARTIAL",
  EMPTY: "EMPTY",
  BLOCKED: "BLOCKED",
  STALE: "STALE",
  ERROR: "ERROR",
  DISCONNECTED: "DISCONNECTED",
});

const INITIAL_CONCEPTS = new Set(["LIFE_INITIAL", "GMM_INITIAL"]);
const RENEWAL_CONCEPTS = new Set(["LIFE_RENEWAL", "GMM_RENEWAL"]);
const BONUS_CONCEPTS = new Set([
  "TRAINING_ALLOWANCE",
  "NEW_PROFESSIONAL_BONUS",
  "GMM_QUARTERLY_BONUS",
]);

const EXPECTED_RENEWAL_TYPES = new Set(["EXPECTED_RENEWAL"]);
const PIPELINE_SCENARIO_TYPES = new Set(["PIPELINE_WHAT_IF"]);

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function knownNumber(value) {
  return value !== null
    && value !== undefined
    && value !== ""
    && Number.isFinite(Number(value));
}

export function roundMoney(value) {
  return knownNumber(value) ? Math.round(Number(value) * 100) / 100 : null;
}

export function formatMoney(value, currency = "MXN") {
  if (!knownNumber(value)) return "No disponible";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function validPeriodKey(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));
}

export function shiftPeriod(periodKey, offset) {
  if (!validPeriodKey(periodKey)) return null;
  const [year, month] = periodKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + Number(offset), 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function sixMonthPeriods(periodKey) {
  return Object.freeze(Array.from({ length: 6 }, (_, index) => shiftPeriod(periodKey, index - 5)));
}

export function monthLabel(periodKey) {
  if (!validPeriodKey(periodKey)) return "Periodo";
  const [year, month] = periodKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function classifyAggregate(aggregate = {}) {
  const concept = String(aggregate.concept || "").toUpperCase();
  const kind = String(aggregate.kind || "").toUpperCase();
  if (kind === "BONUS" || BONUS_CONCEPTS.has(concept)) return "BONUS";
  if (INITIAL_CONCEPTS.has(concept)) return "INITIAL";
  if (RENEWAL_CONCEPTS.has(concept)) return "RENEWAL";
  return "OTHER";
}

function sourceAvailable(snapshot, key) {
  return String(snapshot?.sourceHealth?.[key] || "").toUpperCase() === "AVAILABLE";
}

export function earnedEvidenceAvailable(snapshot = null) {
  if (!snapshot || snapshot.contractVersion !== PERIOD_SNAPSHOT_CONTRACT) return false;
  if (!sourceAvailable(snapshot, "compensationEvents")) return false;
  return Number.isFinite(Number(snapshot?.counts?.earnedAggregates))
    && knownNumber(snapshot?.amounts?.earned?.net);
}

function earnedAggregates(snapshot = null) {
  if (!earnedEvidenceAvailable(snapshot)) return [];
  const values = Array.isArray(snapshot?.details?.aggregates) ? snapshot.details.aggregates : [];
  return values.filter(item => item?.earnedEventId && knownNumber(item?.earnedNetAmount));
}

function sumKnown(items, selector) {
  return roundMoney(items.reduce((total, item) => total + Number(selector(item) || 0), 0));
}

export function projectGenerated(snapshot = null) {
  const available = earnedEvidenceAvailable(snapshot);
  if (!available) {
    return Object.freeze({
      state: "UNKNOWN",
      value: null,
      gross: null,
      initial: null,
      renewal: null,
      bonus: null,
      unclassified: null,
      compositionComplete: false,
      adjustments: null,
      reversals: null,
      evidenceState: "UNKNOWN",
    });
  }

  const aggregates = earnedAggregates(snapshot);
  const byType = {
    INITIAL: aggregates.filter(item => classifyAggregate(item) === "INITIAL"),
    RENEWAL: aggregates.filter(item => classifyAggregate(item) === "RENEWAL"),
    BONUS: aggregates.filter(item => classifyAggregate(item) === "BONUS"),
    OTHER: aggregates.filter(item => classifyAggregate(item) === "OTHER"),
  };
  const initial = sumKnown(byType.INITIAL, item => item.earnedNetAmount);
  const renewal = sumKnown(byType.RENEWAL, item => item.earnedNetAmount);
  const bonus = sumKnown(byType.BONUS, item => item.earnedNetAmount);
  const unclassified = sumKnown(byType.OTHER, item => item.earnedNetAmount);
  const value = roundMoney(snapshot.amounts.earned.net);
  const gross = roundMoney(snapshot.amounts.earned.gross);
  const adjustments = roundMoney(snapshot.amounts.earned.adjustments);
  const reversals = roundMoney(snapshot.amounts.earned.reversals);
  const compositionSum = roundMoney(initial + renewal + bonus + unclassified);
  const compositionComplete = byType.OTHER.length === 0
    && compositionSum === value;

  return Object.freeze({
    state: snapshot.status === "EMPTY" ? "EMPTY" : "GENERATED",
    value,
    gross,
    initial,
    renewal,
    bonus,
    unclassified,
    compositionComplete,
    adjustments,
    reversals,
    evidenceState: "EARNED",
  });
}

function signalScenarioType(signal) {
  const metadata = signal?.metadata || {};
  const value = metadata.scenarioType
    || metadata.incomeScenarioType
    || metadata.compensationScenarioType
    || null;
  return String(value || "").trim().toUpperCase();
}

function validSignalBase(signal) {
  return Boolean(
    signal
    && signal.state === "ACTIVE"
    && signal.kind === "POTENTIAL"
    && knownNumber(signal?.amount?.value)
    && signal?.source?.authority
    && signal?.source?.reference
    && /^[a-f0-9]{64}$/.test(String(signal.signalDigest || ""))
    && signal?.safeguards?.incomeTruth === false
    && signal?.safeguards?.earnedTruth === false
    && signal?.safeguards?.paidTruth === false
    && signal?.safeguards?.includedInRealIncome === false
    && signal?.safeguards?.probabilityWeightingApplied === false
  );
}

function coverage(metadata, key) {
  const value = metadata?.forwardSignalCoverage?.[key]
    ?? metadata?.scenarioCoverage?.[key]
    ?? null;
  return value === true;
}

function expectedRenewalItem(signal) {
  const metadata = signal.metadata || {};
  const policyReference = metadata.policyReference || null;
  const policyYear = Number.isInteger(Number(metadata.policyYear))
    ? Number(metadata.policyYear)
    : null;
  const expectedPaymentPeriod = metadata.expectedPaymentPeriod || null;
  const ruleSnapshotReference = metadata.ruleSnapshotReference
    || metadata.ruleSnapshotId
    || signal?.source?.snapshotReference
    || null;
  const valid = validSignalBase(signal)
    && policyReference
    && policyYear !== null
    && policyYear > 1
    && expectedPaymentPeriod === signal.periodKey
    && ruleSnapshotReference;
  return Object.freeze({
    state: valid ? "EXPECTED" : "UNKNOWN",
    signalId: signal.signalId || null,
    policyReference,
    policyYear,
    expectedPaymentPeriod,
    ruleSnapshotReference,
    sourceAuthority: signal?.source?.authority || null,
    sourceReference: signal?.source?.reference || null,
    amount: valid ? roundMoney(signal.amount.value) : null,
    reason: valid ? signal.reason || null : "NO_ECONOMIC_CONCLUSION",
  });
}

export function projectExpectedRenewals(snapshot = null) {
  if (!snapshot) return Object.freeze({ state: "UNKNOWN", value: null, count: null, items: [] });
  const sourceState = String(snapshot?.sourceHealth?.forwardSignals || "").toUpperCase();
  const metadata = snapshot?.details?.metadata || {};
  const signals = Array.isArray(snapshot?.details?.forwardSignals)
    ? snapshot.details.forwardSignals
    : [];
  const typed = signals
    .filter(signal => EXPECTED_RENEWAL_TYPES.has(signalScenarioType(signal)))
    .map(expectedRenewalItem);
  const valid = typed.filter(item => item.state === "EXPECTED");
  const invalid = typed.filter(item => item.state === "UNKNOWN");

  if (valid.length) {
    return Object.freeze({
      state: invalid.length ? "PARTIAL" : "EXPECTED",
      value: sumKnown(valid, item => item.amount),
      count: new Set(valid.map(item => item.policyReference)).size,
      items: Object.freeze(typed),
      sourceState,
    });
  }
  if (sourceState === "AVAILABLE" && coverage(metadata, "expectedRenewals") && !invalid.length) {
    return Object.freeze({ state: "EMPTY", value: 0, count: 0, items: Object.freeze([]), sourceState });
  }
  return Object.freeze({
    state: sourceState === "DISCONNECTED" ? "DISCONNECTED" : "UNKNOWN",
    value: null,
    count: null,
    items: Object.freeze(typed),
    sourceState,
  });
}

function pipelineItem(signal) {
  const metadata = signal.metadata || {};
  const opportunityReference = metadata.opportunityReference || metadata.pipelineOpportunityReference || null;
  const ruleSnapshotReference = metadata.ruleSnapshotReference
    || metadata.ruleSnapshotId
    || signal?.source?.snapshotReference
    || null;
  const valid = validSignalBase(signal)
    && opportunityReference
    && ruleSnapshotReference;
  return Object.freeze({
    state: valid ? "SCENARIO" : "UNKNOWN",
    signalId: signal.signalId || null,
    opportunityReference,
    label: metadata.opportunityLabel || metadata.clientName || null,
    ruleSnapshotReference,
    sourceAuthority: signal?.source?.authority || null,
    sourceReference: signal?.source?.reference || null,
    amount: valid ? roundMoney(signal.amount.value) : null,
    reason: valid ? signal.reason || null : "NO_ECONOMIC_CONCLUSION",
  });
}

export function projectPipelineScenario(snapshot = null) {
  if (!snapshot) return Object.freeze({ state: "UNKNOWN", value: null, count: null, items: [] });
  const sourceState = String(snapshot?.sourceHealth?.forwardSignals || "").toUpperCase();
  const metadata = snapshot?.details?.metadata || {};
  const signals = Array.isArray(snapshot?.details?.forwardSignals)
    ? snapshot.details.forwardSignals
    : [];
  const typed = signals
    .filter(signal => PIPELINE_SCENARIO_TYPES.has(signalScenarioType(signal)))
    .map(pipelineItem);
  const valid = typed.filter(item => item.state === "SCENARIO");
  const invalid = typed.filter(item => item.state === "UNKNOWN");

  if (valid.length) {
    return Object.freeze({
      state: invalid.length ? "PARTIAL" : "SCENARIO",
      value: sumKnown(valid, item => item.amount),
      count: valid.length,
      unknownCount: invalid.length,
      items: Object.freeze(typed),
      sourceState,
    });
  }
  if (sourceState === "AVAILABLE" && coverage(metadata, "pipelineWhatIf") && !invalid.length) {
    return Object.freeze({ state: "EMPTY", value: 0, count: 0, unknownCount: 0, items: Object.freeze([]), sourceState });
  }
  return Object.freeze({
    state: sourceState === "DISCONNECTED" ? "DISCONNECTED" : "UNKNOWN",
    value: null,
    count: null,
    unknownCount: invalid.length,
    items: Object.freeze(typed),
    sourceState,
  });
}

function snapshotEarnedPoint(snapshot) {
  if (!earnedEvidenceAvailable(snapshot)) return null;
  return roundMoney(snapshot?.amounts?.earned?.net);
}

export function projectAnnual(readModel = {}) {
  const currentPeriod = readModel.periodKey;
  if (!validPeriodKey(currentPeriod)) {
    return Object.freeze({ state: "UNKNOWN", generatedYtd: null, historyLimit: 0, reason: "PERIOD_UNKNOWN" });
  }
  const [year, month] = currentPeriod.split("-").map(Number);
  const required = Array.from({ length: month }, (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`);
  const snapshots = Array.isArray(readModel?.history?.snapshots) ? readModel.history.snapshots : [];
  const byPeriod = new Map(snapshots.map(snapshot => [snapshot.periodKey, snapshot]));
  const complete = required.every(key => byPeriod.has(key) && snapshotEarnedPoint(byPeriod.get(key)) !== null);
  if (!complete) {
    return Object.freeze({
      state: "UNKNOWN",
      generatedYtd: null,
      expectedRenewalsRemainder: null,
      baseExpectedYear: null,
      pipelineScenario: null,
      historyLimit: snapshots.length || (Array.isArray(readModel?.history?.points) ? readModel.history.points.length : 0),
      reason: "CANONICAL_SOURCE_LIMIT",
    });
  }
  const generatedYtd = roundMoney(required.reduce((sum, key) => sum + snapshotEarnedPoint(byPeriod.get(key)), 0));
  return Object.freeze({
    state: "PARTIAL",
    generatedYtd,
    expectedRenewalsRemainder: null,
    baseExpectedYear: null,
    pipelineScenario: null,
    historyLimit: snapshots.length,
    reason: "FORWARD_YEAR_AUTHORITIES_UNAVAILABLE",
  });
}

export function projectBonusCoach(snapshot = null) {
  const coach = snapshot?.details?.metadata?.bonusCoach;
  if (!coach || typeof coach !== "object") {
    return Object.freeze({ state: "BLOCKED", reason: "BONUS_COACH_ELIGIBILITY_SNAPSHOT_UNAVAILABLE" });
  }
  const required = [
    coach.authority,
    coach.rulePackId,
    coach.ruleSnapshotId,
    coach.periodKey,
    coach.careerStage,
    coach.eligibilityState,
  ];
  if (required.some(value => !value)) {
    return Object.freeze({ state: "BLOCKED", reason: "BONUS_COACH_EVIDENCE_INCOMPLETE" });
  }
  if (coach.periodKey !== snapshot.periodKey) {
    return Object.freeze({ state: "BLOCKED", reason: "BONUS_COACH_PERIOD_MISMATCH" });
  }
  return Object.freeze({
    state: "READY",
    careerStage: String(coach.careerStage),
    eligibilityState: String(coach.eligibilityState),
    rulePackId: String(coach.rulePackId),
    ruleSnapshotId: String(coach.ruleSnapshotId),
    authority: String(coach.authority),
    nextLevel: coach.nextLevel || null,
    gap: coach.gap || null,
    explanation: coach.explanation || null,
  });
}

function eventMetadata(aggregate) {
  const events = Array.isArray(aggregate?.events) ? aggregate.events : [];
  const base = events[0] || {};
  return {
    product: base?.metadata?.productName || base?.metadata?.product || base?.calculation?.product || null,
    policyYear: Number.isInteger(Number(base?.metadata?.policyYear)) ? Number(base.metadata.policyYear) : null,
    effectiveDate: base?.metadata?.economicDate || base?.createdAt || null,
  };
}

export function projectMovements(snapshot = null) {
  const aggregates = Array.isArray(snapshot?.details?.aggregates) ? snapshot.details.aggregates : [];
  return Object.freeze(aggregates.map(aggregate => {
    const classification = classifyAggregate(aggregate);
    const meta = eventMetadata(aggregate);
    const truth = aggregate.latestState || "UNKNOWN";
    const value = aggregate.earnedEventId
      ? aggregate.earnedNetAmount
      : aggregate.estimatedAmount;
    return Object.freeze({
      id: aggregate.aggregateKey,
      concept: aggregate.concept || "Compensación",
      classification,
      policyReference: aggregate.policyReference || null,
      product: meta.product,
      policyYear: meta.policyYear,
      date: meta.effectiveDate,
      amount: knownNumber(value) ? roundMoney(value) : null,
      truth,
      adjustmentAmount: knownNumber(aggregate.adjustmentAmount) ? roundMoney(aggregate.adjustmentAmount) : null,
      reversalAmount: knownNumber(aggregate.reversalAmount) ? roundMoney(aggregate.reversalAmount) : null,
      sourceCalculationDigest: aggregate.sourceCalculationDigest || null,
      rulePackDigest: aggregate.rulePackDigest || null,
      paymentEventId: aggregate.paymentEventId || null,
      events: Array.isArray(aggregate.events) ? aggregate.events : [],
    });
  }));
}

export function projectIncomeReadModel(readModel = {}) {
  const snapshot = readModel?.snapshot || null;
  const generated = projectGenerated(snapshot);
  const expectedRenewals = projectExpectedRenewals(snapshot);
  const pipelineScenario = projectPipelineScenario(snapshot);
  const annual = projectAnnual(readModel);
  const bonusCoach = projectBonusCoach(snapshot);
  const movements = projectMovements(snapshot);
  const combinedScenario = knownNumber(generated.value) && knownNumber(pipelineScenario.value)
    ? roundMoney(generated.value + pipelineScenario.value)
    : null;

  return Object.freeze({
    contractVersion: INCOME_PRESENTATION_CONTRACT,
    state: String(readModel?.state || "ERROR").toUpperCase(),
    advisorReference: readModel?.advisorReference || null,
    periodKey: readModel?.periodKey || null,
    currency: snapshot?.currency || readModel?.history?.currency || "MXN",
    capturedAt: snapshot?.capturedAt || readModel?.history?.capturedAt || null,
    sourceHealth: readModel?.sourceHealth || snapshot?.sourceHealth || {},
    generated,
    expectedRenewals,
    pipelineScenario,
    combinedScenario,
    annual,
    bonusCoach,
    history: readModel?.history || null,
    movements,
    paidEvidence: snapshot?.amounts?.paid || null,
    safeguards: Object.freeze({
      payoutClaim: false,
      paidDominatesHero: false,
      unknownIsNotZero: true,
      pipelineProbabilityWeighting: false,
      expectedIncludedInGenerated: false,
      scenarioIncludedInGenerated: false,
      frontendCommissionRateCalculation: false,
      rulePackMutation: false,
      compensationEngineMutation: false,
    }),
  });
}
