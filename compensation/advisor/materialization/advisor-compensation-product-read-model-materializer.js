"use strict";

const {
  clone,
  deepFreeze,
  sha256,
  validateAdvisorCompensationEvent,
} = require("../events/advisor-compensation-event-contract");
const {
  ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES,
  validateAdvisorCompensationConfirmedPayoutRecord,
} = require("../income/advisor-compensation-paid-truth-adapter");
const {
  validateAdvisorCompensationForwardSignal,
} = require("../income/advisor-compensation-forward-signal-contract");
const {
  buildAdvisorCompensationPeriodSnapshot,
} = require("../income/advisor-compensation-period-snapshot-builder");
const {
  ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES,
  createAdvisorCompensationPeriodSnapshot,
} = require("../income/advisor-compensation-period-snapshot-contract");

const CONTRACT_VERSION =
  "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_MATERIALIZATION_001";
const HISTORY_CONTRACT_VERSION =
  "ADVISOR_COMPENSATION_HISTORY_SERIES_001";
const FORWARD_SOURCE_STATES = Object.freeze({
  AVAILABLE: "AVAILABLE",
  DISCONNECTED: "DISCONNECTED",
  PARTIAL: "PARTIAL",
  STALE: "STALE",
});

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  throw error;
}

function requiredString(value, code) {
  if (value === null || value === undefined || String(value).trim() === "") {
    fail(code);
  }
  return String(value).trim();
}

function requiredPeriod(value, code = "ADVISOR_COMPENSATION_MATERIALIZATION_PERIOD_INVALID") {
  const periodKey = requiredString(value, code);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey)) fail(code);
  return periodKey;
}

function requiredTimestamp(value) {
  const timestamp = requiredString(
    value,
    "ADVISOR_COMPENSATION_MATERIALIZATION_CAPTURED_AT_REQUIRED",
  );
  if (!timestamp.includes("T") || !Number.isFinite(Date.parse(timestamp))) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_CAPTURED_AT_INVALID");
  }
  return new Date(timestamp).toISOString();
}

function normalizePeriodKeys(periodKey, periodKeys) {
  const requested = Array.isArray(periodKeys) && periodKeys.length
    ? periodKeys.map((value) => requiredPeriod(value))
    : sixMonthPeriods(periodKey);
  const unique = [...new Set(requested)].sort();
  if (unique.length !== requested.length) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_DUPLICATE_PERIOD");
  }
  if (!unique.includes(periodKey)) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_CURRENT_PERIOD_MISSING");
  }
  return Object.freeze(unique);
}

function shiftPeriod(periodKey, offset) {
  const [year, month] = requiredPeriod(periodKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + Number(offset), 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function sixMonthPeriods(periodKey) {
  return Object.freeze(
    Array.from({ length: 6 }, (_, index) => shiftPeriod(periodKey, index - 5)),
  );
}

function payloadFromRow(row, code) {
  const raw = row && Object.prototype.hasOwnProperty.call(row, "payload")
    ? row.payload
    : row;
  if (raw === null || raw === undefined) fail(code);
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      fail(code);
    }
  }
  if (typeof raw !== "object" || Array.isArray(raw)) fail(code);
  return raw;
}

function normalizeEvents(rows, advisorReference) {
  if (!Array.isArray(rows)) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_EVENT_ROWS_REQUIRED");
  }
  return Object.freeze(rows.map((row) => {
    const event = payloadFromRow(
      row,
      "ADVISOR_COMPENSATION_MATERIALIZATION_EVENT_PAYLOAD_INVALID",
    );
    const validation = validateAdvisorCompensationEvent(event);
    if (!validation.valid) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_EVENT_INVALID", validation.errors);
    }
    if (event.advisorReference !== advisorReference) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_EVENT_OWNER_MISMATCH");
    }
    return event;
  }));
}

function resolvePayoutSourceState(rows, requestedState) {
  if (requestedState !== null && requestedState !== undefined && requestedState !== "") {
    const normalized = String(requestedState).trim().toUpperCase();
    if (!Object.values(ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES).includes(normalized)) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_SOURCE_STATE_INVALID");
    }
    if (normalized === ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.DISCONNECTED
        && rows.length > 0) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_ROWS_WITH_DISCONNECTED_SOURCE");
    }
    return normalized;
  }
  return rows.length > 0
    ? ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.PARTIAL
    : ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.DISCONNECTED;
}

function normalizePayoutRecords(rows, advisorReference, sourceState) {
  if (!Array.isArray(rows)) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_ROWS_REQUIRED");
  }
  if (sourceState === ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.DISCONNECTED) {
    return null;
  }
  return Object.freeze(rows.map((row) => {
    const record = payloadFromRow(
      row,
      "ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_PAYLOAD_INVALID",
    );
    const validation = validateAdvisorCompensationConfirmedPayoutRecord(record);
    if (!validation.valid) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_INVALID", validation.errors);
    }
    if (record.advisorReference !== advisorReference) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_OWNER_MISMATCH");
    }
    return record;
  }));
}

function normalizeForwardSourceState(value, signals) {
  const normalized = value === null || value === undefined || value === ""
    ? FORWARD_SOURCE_STATES.DISCONNECTED
    : String(value).trim().toUpperCase();
  if (!Object.values(FORWARD_SOURCE_STATES).includes(normalized)) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_FORWARD_SOURCE_STATE_INVALID");
  }
  if (normalized === FORWARD_SOURCE_STATES.DISCONNECTED && signals.length > 0) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_FORWARD_SIGNALS_WITH_DISCONNECTED_SOURCE");
  }
  return normalized;
}

function normalizeForwardSignals(signals, advisorReference) {
  if (!Array.isArray(signals)) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_FORWARD_SIGNALS_REQUIRED");
  }
  return Object.freeze(signals.map((signal) => {
    const validation = validateAdvisorCompensationForwardSignal(signal);
    if (!validation.valid) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_FORWARD_SIGNAL_INVALID", validation.errors);
    }
    if (signal.advisorReference !== advisorReference) {
      fail("ADVISOR_COMPENSATION_MATERIALIZATION_FORWARD_SIGNAL_OWNER_MISMATCH");
    }
    return signal;
  }));
}

function adjustedStatus(status, forwardSourceState) {
  if (status === ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES.BLOCKED) return status;
  return forwardSourceState === FORWARD_SOURCE_STATES.AVAILABLE
    ? status
    : ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES.PARTIAL;
}

function rehydrateSnapshot(snapshot, { forwardSourceState, metadata }) {
  return createAdvisorCompensationPeriodSnapshot({
    snapshotId: snapshot.snapshotId,
    advisorReference: snapshot.advisorReference,
    periodKey: snapshot.periodKey,
    currency: snapshot.currency,
    status: adjustedStatus(snapshot.status, forwardSourceState),
    capturedAt: snapshot.capturedAt,
    estimatedAmount: snapshot.amounts.estimated,
    earnedGrossAmount: snapshot.amounts.earned.gross,
    adjustmentAmount: snapshot.amounts.earned.adjustments,
    reversalAmount: snapshot.amounts.earned.reversals,
    earnedNetAmount: snapshot.amounts.earned.net,
    paidSourceState: snapshot.amounts.paid.sourceState,
    paidAmount: snapshot.amounts.paid.value,
    paidKnownZero: snapshot.amounts.paid.knownZero,
    realBasis: snapshot.amounts.real.basis,
    realAmount: snapshot.amounts.real.value,
    potentialAmount: snapshot.amounts.potential,
    atRiskAmount: snapshot.amounts.atRisk,
    counts: snapshot.counts,
    sourceHealth: {
      ...snapshot.sourceHealth,
      forwardSignals: forwardSourceState,
    },
    details: {
      ...snapshot.details,
      metadata: {
        ...(snapshot.details?.metadata || {}),
        ...clone(metadata || {}),
        forwardSignalSourceState: forwardSourceState,
      },
    },
    explanation: snapshot.explanation,
    safeguards: snapshot.safeguards,
  });
}

function buildHistory({ snapshots, advisorReference, currency, capturedAt }) {
  const periods = snapshots.map((snapshot) => snapshot.periodKey);
  const history = {
    contractVersion: HISTORY_CONTRACT_VERSION,
    seriesId: `advisor-compensation-history:${advisorReference}:${periods[0]}:${periods[periods.length - 1]}`,
    advisorReference,
    currency,
    periodFrom: periods[0],
    periodTo: periods[periods.length - 1],
    capturedAt,
    points: snapshots.map((snapshot) => ({
      periodKey: snapshot.periodKey,
      status: snapshot.status,
      estimated: snapshot.amounts.estimated,
      earnedGross: snapshot.amounts.earned.gross,
      adjustments: snapshot.amounts.earned.adjustments,
      reversals: snapshot.amounts.earned.reversals,
      earnedNet: snapshot.amounts.earned.net,
      paid: snapshot.amounts.paid.value,
      paidSourceState: snapshot.amounts.paid.sourceState,
      real: snapshot.amounts.real.value,
      realBasis: snapshot.amounts.real.basis,
      potential: snapshot.amounts.potential,
      atRisk: snapshot.amounts.atRisk,
      snapshotDigest: snapshot.snapshotDigest,
    })),
    snapshots: snapshots.map(clone),
    safeguards: {
      periodsSorted: true,
      noCrossPeriodLeakage: true,
      unknownPaidRemainsNull: true,
      potentialSeparated: true,
      atRiskSeparated: true,
      appendOnlyMaterialization: true,
      directBrowserMutation: false,
      externalMutationAuthorized: false,
    },
  };
  history.seriesDigest = sha256(history);
  return deepFreeze(history);
}

function materializeAdvisorCompensationProductReadModel({
  advisorReference,
  periodKey,
  periodKeys = null,
  eventRows = [],
  payoutRows = [],
  payoutSourceState = null,
  forwardSignals = [],
  forwardSignalSourceState = null,
  currency = "MXN",
  capturedAt,
  metadata = {},
} = {}) {
  const advisor = requiredString(
    advisorReference,
    "ADVISOR_COMPENSATION_MATERIALIZATION_ADVISOR_REQUIRED",
  );
  const currentPeriod = requiredPeriod(periodKey);
  const periods = normalizePeriodKeys(currentPeriod, periodKeys);
  const capture = requiredTimestamp(capturedAt);
  const normalizedCurrency = requiredString(
    currency,
    "ADVISOR_COMPENSATION_MATERIALIZATION_CURRENCY_REQUIRED",
  ).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    fail("ADVISOR_COMPENSATION_MATERIALIZATION_CURRENCY_INVALID");
  }

  const events = normalizeEvents(eventRows, advisor);
  const resolvedPayoutState = resolvePayoutSourceState(
    payoutRows,
    payoutSourceState,
  );
  const payouts = normalizePayoutRecords(
    payoutRows,
    advisor,
    resolvedPayoutState,
  );
  const signals = normalizeForwardSignals(forwardSignals, advisor);
  const resolvedForwardState = normalizeForwardSourceState(
    forwardSignalSourceState,
    signals,
  );

  const snapshots = periods.map((selectedPeriod) => {
    const base = buildAdvisorCompensationPeriodSnapshot({
      events,
      payoutRecords: payouts,
      payoutSourceState: resolvedPayoutState,
      forwardSignals: signals,
      advisorReference: advisor,
      periodKey: selectedPeriod,
      currency: normalizedCurrency,
      capturedAt: capture,
      payoutAsOf: capture,
      metadata: {
        ...clone(metadata),
        productReadModelMaterialization: true,
      },
    });
    return rehydrateSnapshot(base, {
      forwardSourceState: resolvedForwardState,
      metadata,
    });
  });

  const snapshot = snapshots.find((item) => item.periodKey === currentPeriod);
  const history = buildHistory({
    snapshots,
    advisorReference: advisor,
    currency: normalizedCurrency,
    capturedAt: capture,
  });
  const sourceHealth = deepFreeze({
    canonicalSnapshot: snapshot.status,
    historicalSeries: "AVAILABLE",
    compensationEvents: "AVAILABLE",
    payoutTruth: resolvedPayoutState,
    forwardSignals: resolvedForwardState,
    materialization: "READY",
  });

  return deepFreeze({
    contractVersion: CONTRACT_VERSION,
    advisorReference: advisor,
    periodKey: currentPeriod,
    periodKeys: [...periods],
    sourceState: snapshot.status,
    snapshotDigest: snapshot.snapshotDigest,
    historyDigest: history.seriesDigest,
    snapshotPayload: snapshot,
    historyPayload: history,
    sourceHealth,
    capturedAt: capture,
    metadata: clone(metadata),
    writeIntent: {
      table: "public.advisor_compensation_product_read_models",
      operation: "APPEND_NEW_REVISION",
      idempotency: "SNAPSHOT_AND_HISTORY_DIGEST",
    },
    safeguards: {
      appendOnly: true,
      ownerScoped: true,
      directBrowserMutation: false,
      unknownAsZero: false,
      estimatedAsEarned: false,
      earnedAsPaid: false,
      automaticPayoutConfirmation: false,
      productionWritePerformed: false,
    },
  });
}

module.exports = {
  CONTRACT_VERSION,
  FORWARD_SOURCE_STATES,
  shiftPeriod,
  sixMonthPeriods,
  normalizePeriodKeys,
  resolvePayoutSourceState,
  materializeAdvisorCompensationProductReadModel,
};
