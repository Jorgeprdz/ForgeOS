"use strict";

const {
  clone,
  deepFreeze,
  sha256
} = require("../events/advisor-compensation-event-contract");
const {
  buildAdvisorCompensationPeriodSnapshot
} = require("./advisor-compensation-period-snapshot-builder");

const ADVISOR_COMPENSATION_HISTORY_SERIES_CONTRACT_VERSION =
  "ADVISOR_COMPENSATION_HISTORY_SERIES_001";

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function normalizePeriods(periodKeys) {
  if (!Array.isArray(periodKeys) || periodKeys.length === 0) {
    fail("ADVISOR_COMPENSATION_HISTORY_PERIODS_REQUIRED");
  }
  const normalized = periodKeys.map((periodKey) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey || "")) {
      fail("ADVISOR_COMPENSATION_HISTORY_PERIOD_INVALID");
    }
    return periodKey;
  });
  const unique = [...new Set(normalized)];
  if (unique.length !== normalized.length) {
    fail("ADVISOR_COMPENSATION_HISTORY_DUPLICATE_PERIOD");
  }
  return unique.sort();
}

function buildAdvisorCompensationHistorySeries({
  periodKeys,
  events,
  payoutRecords = null,
  payoutSourceState = null,
  forwardSignals,
  advisorReference,
  currency = "MXN",
  capturedAt,
  payoutAsOf = null,
  metadata = {}
} = {}) {
  if (!Array.isArray(events)) {
    fail("ADVISOR_COMPENSATION_HISTORY_EVENTS_SOURCE_REQUIRED");
  }
  if (!Array.isArray(forwardSignals)) {
    fail("ADVISOR_COMPENSATION_HISTORY_FORWARD_SIGNAL_SOURCE_REQUIRED");
  }
  const periods = normalizePeriods(periodKeys);
  const points = periods.map((periodKey) =>
    buildAdvisorCompensationPeriodSnapshot({
      events,
      payoutRecords,
      payoutSourceState,
      forwardSignals,
      advisorReference,
      periodKey,
      currency,
      capturedAt,
      payoutAsOf,
      metadata: {
        ...metadata,
        historySeriesPoint: true
      }
    })
  );

  const series = {
    contractVersion: ADVISOR_COMPENSATION_HISTORY_SERIES_CONTRACT_VERSION,
    seriesId: `advisor-compensation-history:${advisorReference}:${periods[0]}:${periods[periods.length - 1]}`,
    advisorReference,
    currency: String(currency).toUpperCase(),
    periodFrom: periods[0],
    periodTo: periods[periods.length - 1],
    capturedAt,
    points: points.map((snapshot) => ({
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
      snapshotDigest: snapshot.snapshotDigest
    })),
    snapshots: points.map(clone),
    safeguards: {
      periodsSorted: true,
      noCrossPeriodLeakage: true,
      unknownPaidRemainsNull: true,
      potentialSeparated: true,
      atRiskSeparated: true,
      externalMutationAuthorized: false
    }
  };
  series.seriesDigest = sha256(series);
  return deepFreeze(series);
}

function validateAdvisorCompensationHistorySeries(series) {
  const errors = [];
  if (!series || typeof series !== "object") {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["history_series_missing"])
    });
  }
  if (series.contractVersion !==
      ADVISOR_COMPENSATION_HISTORY_SERIES_CONTRACT_VERSION) {
    errors.push("history_series_contract_version_invalid");
  }
  if (!Array.isArray(series.points) || series.points.length === 0) {
    errors.push("history_series_points_missing");
  }
  const periods = (series.points || []).map((point) => point.periodKey);
  if (periods.join("|") !== [...periods].sort().join("|")) {
    errors.push("history_series_period_order_invalid");
  }
  if (!/^[a-f0-9]{64}$/.test(series.seriesDigest || "")) {
    errors.push("history_series_digest_invalid");
  }
  if (series.safeguards?.unknownPaidRemainsNull !== true) {
    errors.push("history_series_unknown_paid_boundary_missing");
  }
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}

module.exports = {
  ADVISOR_COMPENSATION_HISTORY_SERIES_CONTRACT_VERSION,
  normalizePeriods,
  buildAdvisorCompensationHistorySeries,
  validateAdvisorCompensationHistorySeries
};
