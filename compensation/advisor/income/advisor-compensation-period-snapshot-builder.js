"use strict";

const {
  clone,
  deepFreeze
} = require("../events/advisor-compensation-event-contract");
const {
  ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES,
  projectAdvisorCompensationPayoutTruth
} = require("./advisor-compensation-paid-truth-adapter");
const {
  projectAdvisorCompensationForwardSignals
} = require("./advisor-compensation-forward-signal-contract");
const {
  projectAdvisorCompensationEventsToIncome
} = require("./advisor-compensation-event-income-projector");
const {
  ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES,
  ADVISOR_COMPENSATION_REAL_BASES,
  createAdvisorCompensationPeriodSnapshot
} = require("./advisor-compensation-period-snapshot-contract");

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function resolveRealIncome({ eventProjection, payoutProjection }) {
  const payoutUsable = [
    ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.AVAILABLE,
    ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.PARTIAL,
    ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.STALE
  ].includes(payoutProjection.sourceState) &&
    payoutProjection.amount !== null;

  if (payoutUsable) {
    return Object.freeze({
      basis: ADVISOR_COMPENSATION_REAL_BASES.PAID,
      amount: payoutProjection.amount,
      reason: payoutProjection.sourceState ===
        ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.AVAILABLE
        ? "confirmed_payout_truth_available"
        : "confirmed_payout_truth_incomplete_or_stale"
    });
  }

  if (eventProjection.earnedAggregateCount > 0) {
    return Object.freeze({
      basis: ADVISOR_COMPENSATION_REAL_BASES.EARNED,
      amount: eventProjection.amounts.earnedNet,
      reason: "paid_truth_unavailable_using_earned_truth"
    });
  }

  return Object.freeze({
    basis: ADVISOR_COMPENSATION_REAL_BASES.UNAVAILABLE,
    amount: null,
    reason: "no_paid_or_earned_truth_available"
  });
}

function determineSnapshotStatus({
  eventProjection,
  payoutProjection,
  signalProjection
}) {
  const hasAny =
    eventProjection.aggregateCount > 0 ||
    payoutProjection.recordCount > 0 ||
    signalProjection.activeSignalCount > 0;

  if (!hasAny &&
      payoutProjection.sourceState ===
        ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.AVAILABLE) {
    return ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES.EMPTY;
  }

  if (payoutProjection.sourceState !==
      ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATES.AVAILABLE) {
    return ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES.PARTIAL;
  }

  return hasAny
    ? ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES.READY
    : ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_STATUSES.EMPTY;
}

function buildAdvisorCompensationPeriodSnapshot({
  events,
  payoutRecords = null,
  payoutSourceState = null,
  forwardSignals,
  advisorReference,
  periodKey,
  currency = "MXN",
  capturedAt,
  payoutAsOf = null,
  metadata = {}
} = {}) {
  if (!Array.isArray(events)) {
    fail("ADVISOR_COMPENSATION_PERIOD_EVENTS_SOURCE_REQUIRED");
  }
  if (!Array.isArray(forwardSignals)) {
    fail("ADVISOR_COMPENSATION_FORWARD_SIGNAL_SOURCE_REQUIRED");
  }
  if (!advisorReference) {
    fail("ADVISOR_COMPENSATION_PERIOD_ADVISOR_REQUIRED");
  }
  if (!capturedAt) {
    fail("ADVISOR_COMPENSATION_PERIOD_CAPTURED_AT_REQUIRED");
  }

  const eventProjection = projectAdvisorCompensationEventsToIncome({
    events,
    advisorReference,
    periodKey,
    currency
  });
  const payoutProjection = projectAdvisorCompensationPayoutTruth({
    records: payoutRecords,
    sourceState: payoutSourceState,
    advisorReference,
    periodKey,
    currency,
    asOf: payoutAsOf
  });
  const signalProjection = projectAdvisorCompensationForwardSignals({
    signals: forwardSignals,
    advisorReference,
    periodKey,
    currency
  });
  const real = resolveRealIncome({
    eventProjection,
    payoutProjection
  });
  const status = determineSnapshotStatus({
    eventProjection,
    payoutProjection,
    signalProjection
  });

  return createAdvisorCompensationPeriodSnapshot({
    snapshotId: [
      "advisor-compensation-period-snapshot",
      advisorReference,
      periodKey
    ].join(":"),
    advisorReference,
    periodKey,
    currency,
    status,
    capturedAt,
    estimatedAmount: eventProjection.amounts.estimated,
    earnedGrossAmount: eventProjection.amounts.earnedGross,
    adjustmentAmount: eventProjection.amounts.adjustments,
    reversalAmount: eventProjection.amounts.reversals,
    earnedNetAmount: eventProjection.amounts.earnedNet,
    paidSourceState: payoutProjection.sourceState,
    paidAmount: payoutProjection.amount,
    paidKnownZero: payoutProjection.knownZero,
    realBasis: real.basis,
    realAmount: real.amount,
    potentialAmount: signalProjection.potentialAmount,
    atRiskAmount: signalProjection.atRiskAmount,
    counts: {
      aggregates: eventProjection.aggregateCount,
      events: eventProjection.eventCount,
      estimatedAggregates: eventProjection.estimatedAggregateCount,
      earnedAggregates: eventProjection.earnedAggregateCount,
      payoutRecords: payoutProjection.recordCount,
      forwardSignals: signalProjection.activeSignalCount,
      potentialSignals: signalProjection.potentialCount,
      atRiskSignals: signalProjection.atRiskCount
    },
    sourceHealth: {
      compensationEvents: "AVAILABLE",
      payoutTruth: payoutProjection.sourceState,
      forwardSignals: "AVAILABLE"
    },
    details: {
      aggregates: eventProjection.aggregates,
      payoutRecords: payoutProjection.records,
      forwardSignals: signalProjection.signals,
      metadata: clone(metadata)
    },
    explanation: {
      realReason: real.reason,
      estimatedDefinition:
        "Active calculation events not yet promoted to EARNED.",
      earnedDefinition:
        "Official-rule compensation events plus append-only adjustments and reversals.",
      paidDefinition:
        "Confirmed payout records with statement evidence and human confirmation.",
      potentialDefinition:
        "Forward compensation signals; never counted as real, earned or paid.",
      atRiskDefinition:
        "Explicit risk signals; never subtracted silently from earned or paid."
    },
    safeguards: {
      periodIsolation: true,
      ownerScopeRequired: true,
      paidPromotionPerformed: false,
      eventMutationPerformed: false
    }
  });
}

module.exports = {
  resolveRealIncome,
  determineSnapshotStatus,
  buildAdvisorCompensationPeriodSnapshot
};
