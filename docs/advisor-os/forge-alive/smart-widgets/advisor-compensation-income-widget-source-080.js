const ADVISOR_COMPENSATION_UI_STATES = Object.freeze({
  LOADING: "LOADING",
  READY: "READY",
  PARTIAL: "PARTIAL",
  EMPTY: "EMPTY",
  BLOCKED: "BLOCKED",
  STALE: "STALE",
  ERROR: "ERROR",
  DISCONNECTED: "DISCONNECTED",
});

export const ADVISOR_COMPENSATION_INCOME_WIDGET_SOURCE_CONTRACT =
  "ADVISOR_COMPENSATION_INCOME_WIDGET_SNAPSHOT_001";

const PRODUCT_CONTRACT = "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001";
const PERIOD_SNAPSHOT_CONTRACT = "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001";
const HISTORY_CONTRACT = "ADVISOR_COMPENSATION_HISTORY_SERIES_001";
const USABLE_PAID_SOURCE_STATES = new Set(["AVAILABLE", "PARTIAL", "STALE"]);

function abortError() {
  return new DOMException("Income Smart Widget source load aborted", "AbortError");
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function finiteOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function periodKeyFor(value, timeZone = "America/Mexico_City") {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError("Income source now is invalid");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) throw new TypeError("Income source period could not be resolved");
  return `${year}-${month}`;
}

function shiftPeriod(periodKey, offset) {
  const [year, month] = String(periodKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + Number(offset), 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function sixMonthPeriods(periodKey) {
  return Array.from({ length: 6 }, (_, index) => shiftPeriod(periodKey, index - 5));
}

function uniqueStrings(values) {
  return [...new Set(values.flat(Infinity).filter((value) =>
    typeof value === "string" && value.trim()))];
}

function sourceError(code, extra = {}) {
  return freeze({
    sourceConnected: true,
    sourceComplete: false,
    sourceUnavailable: true,
    blockedByMissingEvidence: false,
    blockedReason: code,
    compensationSnapshot: null,
    deepLink: "?nav=comisiones",
    ...extra,
  });
}

function disconnected(code = "COMPENSATION_PRODUCT_SOURCE_DISCONNECTED") {
  return freeze({
    sourceConnected: false,
    sourceComplete: false,
    sourceUnavailable: false,
    blockedByMissingEvidence: false,
    blockedReason: code,
    compensationSnapshot: null,
    deepLink: "?nav=comisiones",
    uncertainty: ["income_must_not_be_derived_from_quotes_premium_pipeline_or_cartera"],
  });
}

function blocked(product) {
  return freeze({
    sourceConnected: true,
    sourceComplete: false,
    sourceUnavailable: false,
    blockedByMissingEvidence: true,
    blockedReason: product?.errorCode || "COMPENSATION_SNAPSHOT_BLOCKED_BY_MISSING_EVIDENCE",
    compensationSnapshot: null,
    deepLink: "?nav=comisiones",
    freshness: product?.snapshot?.capturedAt
      ? { asOf: product.snapshot.capturedAt, stale: false }
      : null,
  });
}

function assertProduct(product, advisorId, periodKey) {
  if (!product || typeof product !== "object") {
    throw new TypeError("Income source product read model is required");
  }
  if (product.contractVersion !== PRODUCT_CONTRACT) {
    throw new TypeError("Income source product contract is invalid");
  }
  if (product.advisorReference !== advisorId) {
    throw new Error("Income source returned cross-advisor data");
  }
  if (product.periodKey !== periodKey) {
    throw new Error("Income source returned cross-period data");
  }
}

function assertSnapshot(snapshot, advisorId, periodKey) {
  if (!snapshot || snapshot.contractVersion !== PERIOD_SNAPSHOT_CONTRACT) {
    throw new TypeError("Income source period snapshot is invalid");
  }
  if (snapshot.advisorReference !== advisorId) {
    throw new Error("Income source snapshot owner mismatch");
  }
  if (snapshot.periodKey !== periodKey) {
    throw new Error("Income source snapshot period mismatch");
  }
}

function assertHistory(history, advisorId, periodKeys) {
  if (!history || history.contractVersion !== HISTORY_CONTRACT) {
    throw new TypeError("Income source history series is invalid");
  }
  if (history.advisorReference !== advisorId) {
    throw new Error("Income source history owner mismatch");
  }
  const allowed = new Set(periodKeys);
  if (!Array.isArray(history.points) ||
      history.points.some((point) => !allowed.has(point.periodKey))) {
    throw new Error("Income source history period mismatch");
  }
}

function atRiskEvidence(snapshot) {
  const signals = Array.isArray(snapshot?.details?.forwardSignals)
    ? snapshot.details.forwardSignals
    : [];
  const active = signals.filter((signal) =>
    signal?.kind === "AT_RISK" &&
    signal?.state === "ACTIVE" &&
    typeof signal?.source?.authority === "string" &&
    typeof signal?.source?.reference === "string" &&
    /^[a-f0-9]{64}$/.test(signal?.signalDigest || "") &&
    finiteOrNull(signal?.amount?.value) !== null);
  const confirmedAmount = Math.round(
    active.reduce((total, signal) => total + signal.amount.value, 0) * 100,
  ) / 100;
  const snapshotAmount = finiteOrNull(snapshot?.amounts?.atRisk);
  return freeze({
    signals: active,
    confirmed: snapshotAmount !== null && active.length > 0 &&
      confirmedAmount === snapshotAmount,
    confirmedAmount,
    snapshotAmount,
  });
}

function evidenceReferences(snapshot, history, risk) {
  const aggregates = Array.isArray(snapshot?.details?.aggregates)
    ? snapshot.details.aggregates
    : [];
  const payout = Array.isArray(snapshot?.details?.payoutRecords)
    ? snapshot.details.payoutRecords
    : [];
  return uniqueStrings([
    snapshot?.snapshotDigest,
    history?.seriesDigest,
    aggregates.flatMap((item) => [
      item?.sourceCalculationDigest,
      item?.rulePackDigest,
      item?.latestEventId,
    ]),
    payout.flatMap((item) => [
      item?.payoutRecordId,
      item?.statementReference,
      item?.evidenceReference,
    ]),
    risk.signals.flatMap((signal) => [
      signal.signalDigest,
      signal.source?.reference,
      signal.source?.snapshotReference,
    ]),
  ]);
}

function mapHistory(history) {
  return history.points.map((point) => freeze({
    periodKey: point.periodKey,
    real: finiteOrNull(point.real),
    realBasis: point.realBasis || "UNAVAILABLE",
    paid: finiteOrNull(point.paid),
    earnedNet: finiteOrNull(point.earnedNet),
    estimated: finiteOrNull(point.estimated),
    potential: finiteOrNull(point.potential),
    atRisk: finiteOrNull(point.atRisk),
  }));
}

export function projectAdvisorCompensationIncomeWidgetSource080(product, {
  advisorId,
  periodKey,
  periodKeys,
} = {}) {
  assertProduct(product, advisorId, periodKey);

  if (product.state === ADVISOR_COMPENSATION_UI_STATES.DISCONNECTED) {
    return disconnected();
  }
  if (product.state === ADVISOR_COMPENSATION_UI_STATES.ERROR) {
    return sourceError(product.errorCode || "COMPENSATION_PRODUCT_SOURCE_ERROR");
  }
  if (product.state === ADVISOR_COMPENSATION_UI_STATES.BLOCKED) {
    return blocked(product);
  }

  assertSnapshot(product.snapshot, advisorId, periodKey);
  assertHistory(product.history, advisorId, periodKeys);

  const snapshot = product.snapshot;
  const amounts = snapshot.amounts || {};
  const realBasis = amounts.real?.basis || "UNAVAILABLE";
  const paid = finiteOrNull(amounts.paid?.value);
  const earned = finiteOrNull(amounts.earned?.net);
  const real = finiteOrNull(amounts.real?.value);
  const risk = atRiskEvidence(snapshot);
  const paidAvailable = paid !== null &&
    USABLE_PAID_SOURCE_STATES.has(amounts.paid?.sourceState);
  const earnedAvailable = Number(snapshot.counts?.earnedAggregates || 0) > 0 ||
    realBasis === "EARNED";
  const stale = product.state === ADVISOR_COMPENSATION_UI_STATES.STALE ||
    product.stale === true;
  const partial = product.state === ADVISOR_COMPENSATION_UI_STATES.PARTIAL;
  const empty = product.state === ADVISOR_COMPENSATION_UI_STATES.EMPTY;
  const riskDetailMissing = risk.snapshotAmount > 0 && !risk.confirmed;

  const compensationSnapshot = freeze({
    contractVersion: ADVISOR_COMPENSATION_INCOME_WIDGET_SOURCE_CONTRACT,
    advisorId,
    periodKey,
    currency: snapshot.currency,
    incomeReal: real,
    incomeRealBasis: realBasis,
    incomeRealAvailable: real !== null && realBasis !== "UNAVAILABLE",
    incomeEarned: earned,
    incomeEarnedAvailable: earnedAvailable,
    incomePaid: paid,
    incomePaidAvailable: paidAvailable,
    incomeEstimated: finiteOrNull(amounts.estimated),
    incomePotential: finiteOrNull(amounts.potential),
    incomeAtRisk: risk.confirmed ? risk.snapshotAmount : null,
    incomeAtRiskObserved: risk.snapshotAmount,
    incomeAtRiskConfirmed: risk.confirmed,
    incomeAtRiskEvidenceCount: risk.signals.length,
    paidKnownZero: amounts.paid?.knownZero === true,
    history: mapHistory(product.history),
    evidenceRefs: evidenceReferences(snapshot, product.history, risk),
    sourceSnapshotDigest: snapshot.snapshotDigest,
    sourceHistoryDigest: product.history.seriesDigest,
    sourceHealth: product.sourceHealth || snapshot.sourceHealth || {},
    explanation: snapshot.explanation || {},
    safeguards: freeze({
      unknownIsNotZero: true,
      quoteAsIncome: false,
      issuedPremiumAsIncome: false,
      pipelineAsIncome: false,
      carteraAsIncome: false,
      potentialIncludedInActual: false,
      atRiskIncludedInActual: false,
      simulationIncludedInActual: false,
      paidRequiresPayoutEvidence: true,
      ownerScopeEnforced: true,
    }),
  });

  return freeze({
    compensationSnapshot,
    sourceConnected: true,
    sourceComplete: !partial && !riskDetailMissing,
    sourceUnavailable: false,
    blockedByMissingEvidence: false,
    blockedReason: null,
    stale,
    empty,
    currency: snapshot.currency,
    deepLink: "?nav=comisiones",
    freshness: {
      asOf: snapshot.capturedAt,
      stale,
      periodKey,
      snapshotDigest: snapshot.snapshotDigest,
      historyDigest: product.history.seriesDigest,
    },
    uncertainty: uniqueStrings([
      ...(partial ? ["compensation_snapshot_partial"] : []),
      ...(stale ? ["compensation_snapshot_stale"] : []),
      ...(riskDetailMissing ? ["at_risk_amount_missing_confirming_signal_detail"] : []),
    ]),
  });
}

function providerCapabilities(provider) {
  if (!provider || typeof provider !== "object") return null;
  const unified = typeof provider.loadCompensationProduct === "function";
  const split = typeof provider.loadPeriodSnapshot === "function" &&
    typeof provider.loadHistorySeries === "function";
  return unified || split ? Object.freeze({ unified, split }) : null;
}

async function loadProductFromProvider(provider, context) {
  const capabilities = providerCapabilities(provider);
  if (!capabilities) return null;
  if (capabilities.unified) {
    const result = await provider.loadCompensationProduct(context);
    return result && typeof result === "object" ? result : null;
  }
  const [snapshot, history] = await Promise.all([
    provider.loadPeriodSnapshot(context),
    provider.loadHistorySeries(context),
  ]);
  return { snapshot, history };
}

function mapProductState(result, snapshot, now, maxAgeMs) {
  const explicit = result?.sourceState || null;
  if (Object.values(ADVISOR_COMPENSATION_UI_STATES).includes(explicit)) {
    return explicit;
  }
  const captured = Date.parse(snapshot?.capturedAt || "");
  if (Number.isFinite(captured) && Number.isFinite(maxAgeMs) &&
      maxAgeMs >= 0 && now() - captured > maxAgeMs) {
    return ADVISOR_COMPENSATION_UI_STATES.STALE;
  }
  if (snapshot?.status === "READY") return ADVISOR_COMPENSATION_UI_STATES.READY;
  if (snapshot?.status === "PARTIAL") return ADVISOR_COMPENSATION_UI_STATES.PARTIAL;
  if (snapshot?.status === "EMPTY") return ADVISOR_COMPENSATION_UI_STATES.EMPTY;
  if (snapshot?.status === "BLOCKED") return ADVISOR_COMPENSATION_UI_STATES.BLOCKED;
  return ADVISOR_COMPENSATION_UI_STATES.ERROR;
}

function createProductReadModelFromProviderResult(result, {
  advisorId,
  periodKey,
  periodKeys,
  now,
  maxAgeMs,
} = {}) {
  const snapshot = result?.snapshot || null;
  const history = result?.history || null;
  if (!snapshot || !history) {
    return freeze({
      contractVersion: PRODUCT_CONTRACT,
      state: ADVISOR_COMPENSATION_UI_STATES.ERROR,
      advisorReference: advisorId,
      periodKey,
      periodKeys,
      snapshot: null,
      history: null,
      errorCode: "COMPENSATION_PRODUCT_PROVIDER_RESPONSE_INVALID",
      stale: false,
    });
  }
  assertSnapshot(snapshot, advisorId, periodKey);
  assertHistory(history, advisorId, periodKeys);
  const state = mapProductState(result, snapshot, now, maxAgeMs);
  return freeze({
    contractVersion: PRODUCT_CONTRACT,
    state,
    advisorReference: advisorId,
    periodKey,
    periodKeys: [...periodKeys],
    snapshot,
    history,
    sourceHealth: result.sourceHealth || snapshot.sourceHealth || null,
    providerMetadata: result.metadata || null,
    errorCode: result.errorCode || null,
    stale: state === ADVISOR_COMPENSATION_UI_STATES.STALE,
  });
}

export function createAdvisorCompensationIncomeWidgetLoader080({
  provider = null,
  providerResolver = () => globalThis?.ForgeAdvisorCompensationProductSource070 || null,
  now = () => Date.now(),
  maxAgeMs = 36 * 60 * 60 * 1000,
} = {}) {
  return Object.freeze({
    sourceId: "ADVISOR_COMPENSATION_INCOME_WIDGET_SOURCE_080",
    authority: ["COMPENSATION_INTELLIGENCE", "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001"],
    async load(context = {}) {
      if (!context.advisorId) {
        throw new TypeError("Income source context advisorId is required");
      }
      throwIfAborted(context.signal);
      const periodKey = periodKeyFor(context.now || new Date(), context.timeZone);
      const periodKeys = sixMonthPeriods(periodKey);
      const resolvedProvider = provider || providerResolver();
      if (!providerCapabilities(resolvedProvider)) {
        return disconnected();
      }
      try {
        const providerResult = await loadProductFromProvider(resolvedProvider, {
          advisorReference: context.advisorId,
          advisorId: context.advisorId,
          periodKey,
          periodKeys,
          signal: context.signal,
          requestId: context.requestId || null,
          readOnly: true,
          contractVersion: PRODUCT_CONTRACT,
        });
        throwIfAborted(context.signal);
        const product = createProductReadModelFromProviderResult(providerResult, {
          advisorId: context.advisorId,
          periodKey,
          periodKeys,
          now,
          maxAgeMs,
        });
        return projectAdvisorCompensationIncomeWidgetSource080(product, {
          advisorId: context.advisorId,
          periodKey,
          periodKeys,
        });
      } catch (error) {
        if (error?.name === "AbortError" || context.signal?.aborted) throw abortError();
        return sourceError(error?.code || error?.message ||
          "COMPENSATION_PRODUCT_SOURCE_ERROR");
      }
    },
  });
}

export {
  periodKeyFor,
  shiftPeriod,
  sixMonthPeriods,
  atRiskEvidence,
};
