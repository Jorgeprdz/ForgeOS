"use strict";

const assert = require("assert");
const C = require("../events/advisor-compensation-event-contract");
const S = require("../income/advisor-compensation-period-snapshot-contract");
const E = require("../income/advisor-compensation-event-income-projector");
const T = require("../income/advisor-compensation-period-attribution");
const F = require("../income/advisor-compensation-forward-signal-contract");
const P = require("../income/advisor-compensation-paid-truth-adapter");
const B = require("../income/advisor-compensation-period-snapshot-builder");
const H = require("../income/advisor-compensation-history-series");
const A = require("../events/advisor-compensation-adjustment-service");

let total = 0;
let passed = 0;
function test(name, fn) {
  total += 1;
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}:`, error.stack || error);
  }
}
function code(fn, expected) {
  assert.throws(fn, (error) => error?.code === expected);
}

function event({
  id,
  aggregate = "agg-1",
  sequence = 1,
  previous = null,
  state = "ESTIMATED",
  amount = 100,
  advisor = "advisor-1",
  period = "2026-08",
  currency = "MXN",
  policy = "policy-1",
  payment = "payment-1",
  concept = "LIFE_INITIAL",
  metadata = {}
} = {}) {
  const base = {
    contractVersion: "ADVISOR_COMPENSATION_EVENT_001",
    eventId: id || `${aggregate}:${sequence}:${state}`,
    aggregateKey: aggregate,
    sequence,
    previousEventId: previous,
    state,
    kind: ["ADJUSTED", "REVERSED"].includes(state)
      ? (state === "ADJUSTED" ? "ADJUSTMENT" : "REVERSAL")
      : "COMMISSION",
    concept,
    advisorReference: advisor,
    policyReference: policy,
    paymentEventId: payment,
    periodKey: period,
    amount: { value: amount, currency },
    calculation: { calculationDigest: "c".repeat(64) },
    ruleSnapshot: { rulePackDigest: "r".repeat(64) },
    evidence: { references: ["ev-1"] },
    lineage: { sourceCalculationDigest: "c".repeat(64) },
    idempotencyKey: `idem:${id || `${aggregate}:${sequence}:${state}`}`,
    correlationId: "corr-1",
    createdAt: `2026-08-${String(sequence).padStart(2, "0")}T00:00:00.000Z`,
    safeguards: {
      appendOnly: true,
      overwriteAuthorized: false,
      deleteAuthorized: false,
      payoutTruth: false
    },
    metadata
  };
  base.eventDigest = C.sha256(base);
  return C.deepFreeze(base);
}

function signal({
  id = "signal-1",
  kind = "POTENTIAL",
  amount = 500,
  advisor = "advisor-1",
  period = "2026-08",
  currency = "MXN",
  state = "ACTIVE"
} = {}) {
  return F.createAdvisorCompensationForwardSignal({
    signalId: id,
    kind,
    state,
    advisorReference: advisor,
    periodKey: period,
    amount,
    currency,
    sourceAuthority: "FORECAST_COMPENSATION_PROJECTION",
    sourceReference: `source:${id}`,
    confidence: 0.5,
    reason: "governed_forward_signal"
  });
}

function payout({
  id = "payout-1",
  amount = 80,
  advisor = "advisor-1",
  period = "2026-08",
  currency = "MXN"
} = {}) {
  return P.createAdvisorCompensationConfirmedPayoutRecord({
    payoutRecordId: id,
    advisorReference: advisor,
    periodKey: period,
    amount,
    currency,
    matchedCompensationEventIds: ["agg-1:2:EARNED"],
    payoutEvidenceReference: `statement:${id}`,
    payoutEvidenceHash: `hash:${id}`,
    humanDecisionId: `decision:${id}`,
    confirmedAt: "2026-08-31T20:00:00.000Z",
    sourceAuthority: "PAYOUT_RECONCILIATION_STAGE_090"
  });
}

const estimated = event();
const earned = event({
  id: "agg-1:2:EARNED",
  sequence: 2,
  previous: estimated.eventId,
  state: "EARNED",
  amount: 100
});
const adjusted = event({
  id: "agg-1:3:ADJUSTED",
  sequence: 3,
  previous: earned.eventId,
  state: "ADJUSTED",
  amount: 20
});
const reversed = event({
  id: "agg-1:3:REVERSED",
  sequence: 3,
  previous: earned.eventId,
  state: "REVERSED",
  amount: -100
});


[
  ["monthly period recognition", () => assert.equal(T.resolveAdvisorCompensationMonthlyPeriod(estimated).monthlyPeriodKey, "2026-08")],
  ["monthly period source", () => assert.equal(T.resolveAdvisorCompensationMonthlyPeriod(estimated).source, "EVENT_PERIOD_KEY")],
  ["quarter needs attribution", () => code(() => T.resolveAdvisorCompensationMonthlyPeriod(event({ period: "2026-Q3" })), "ADVISOR_COMPENSATION_MONTHLY_PERIOD_ATTRIBUTION_REQUIRED")],
  ["quarter explicit attribution", () => assert.equal(T.resolveAdvisorCompensationMonthlyPeriod(event({
    period: "2026-Q3", metadata: { incomePeriodKey: "2026-09" }
  })).monthlyPeriodKey, "2026-09")],
  ["semester explicit attribution source", () => assert.equal(T.resolveAdvisorCompensationMonthlyPeriod(event({
    period: "2026-S2", metadata: { incomePeriodKey: "2026-12" }
  })).source, "EXPLICIT_INCOME_PERIOD_ATTRIBUTION")],
  ["invalid attribution blocked", () => code(() => T.resolveAdvisorCompensationMonthlyPeriod(event({
    period: "2026-Q3", metadata: { incomePeriodKey: "2026-13" }
  })), "ADVISOR_COMPENSATION_MONTHLY_PERIOD_ATTRIBUTION_INVALID")],
  ["conflicting attribution blocked", () => code(() => T.resolveAdvisorCompensationMonthlyPeriod(event({
    period: "2026-08", metadata: { incomePeriodKey: "2026-09" }
  })), "ADVISOR_COMPENSATION_MONTHLY_PERIOD_ATTRIBUTION_CONFLICT")],
  ["projector rejects unallocated nonmonthly event", () => code(() => E.projectAdvisorCompensationEventsToIncome({
    events: [event({ period: "2026-Q3" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_MONTHLY_PERIOD_ATTRIBUTION_REQUIRED")],
  ["projector accepts attributed nonmonthly event", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [event({ period: "2026-Q3", metadata: { incomePeriodKey: "2026-08" } })],
    advisorReference: "advisor-1", periodKey: "2026-08"
  }).amounts.estimated, 100)]
].forEach(([name, fn]) => test(name, fn));

[
  ["forward contract", () => assert.equal(signal().contractVersion, "ADVISOR_COMPENSATION_FORWARD_SIGNAL_001")],
  ["forward potential kind", () => assert.equal(signal().kind, "POTENTIAL")],
  ["forward at risk kind", () => assert.equal(signal({ kind: "AT_RISK" }).kind, "AT_RISK")],
  ["forward digest", () => assert.match(signal().signalDigest, /^[a-f0-9]{64}$/)],
  ["forward frozen", () => assert(Object.isFrozen(signal().amount))],
  ["forward not income truth", () => assert.equal(signal().safeguards.incomeTruth, false)],
  ["forward not real", () => assert.equal(signal().safeguards.includedInRealIncome, false)],
  ["forward confidence kept", () => assert.equal(signal().confidence, 0.5)],
  ["forward zero allowed", () => assert.equal(signal({ amount: 0 }).amount.value, 0)],
  ["forward negative blocked", () => code(() => signal({ amount: -1 }), "ADVISOR_COMPENSATION_FORWARD_SIGNAL_AMOUNT_INVALID")],
  ["forward bad confidence", () => code(() => F.createAdvisorCompensationForwardSignal({
    signalId: "bad", kind: "POTENTIAL", advisorReference: "advisor-1",
    periodKey: "2026-08", amount: 1, currency: "MXN",
    sourceAuthority: "x", sourceReference: "x", confidence: 2
  }), "ADVISOR_COMPENSATION_FORWARD_SIGNAL_CONFIDENCE_INVALID")],
  ["forward bad period", () => code(() => F.createAdvisorCompensationForwardSignal({
    signalId: "bad", kind: "POTENTIAL", advisorReference: "advisor-1",
    periodKey: "2026-13", amount: 1, currency: "MXN",
    sourceAuthority: "x", sourceReference: "x"
  }), "ADVISOR_COMPENSATION_FORWARD_SIGNAL_PERIOD_INVALID")],
  ["forward validation", () => assert(F.validateAdvisorCompensationForwardSignal(signal()).valid)],
  ["forward projection potential", () => assert.equal(F.projectAdvisorCompensationForwardSignals({
    signals: [signal()], advisorReference: "advisor-1", periodKey: "2026-08"
  }).potentialAmount, 500)],
  ["forward projection risk", () => assert.equal(F.projectAdvisorCompensationForwardSignals({
    signals: [signal({ kind: "AT_RISK", amount: 200 })], advisorReference: "advisor-1", periodKey: "2026-08"
  }).atRiskAmount, 200)],
  ["forward projection separate", () => {
    const result = F.projectAdvisorCompensationForwardSignals({
      signals: [signal(), signal({ id: "risk", kind: "AT_RISK", amount: 200 })],
      advisorReference: "advisor-1", periodKey: "2026-08"
    });
    assert.equal(result.potentialAmount, 500);
    assert.equal(result.atRiskAmount, 200);
  }],
  ["forward resolved excluded", () => assert.equal(F.projectAdvisorCompensationForwardSignals({
    signals: [signal({ state: "RESOLVED" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }).activeSignalCount, 0)],
  ["forward other advisor filtered", () => assert.equal(F.projectAdvisorCompensationForwardSignals({
    signals: [signal({ advisor: "advisor-2" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }).potentialAmount, 0)],
  ["forward other period filtered", () => assert.equal(F.projectAdvisorCompensationForwardSignals({
    signals: [signal({ period: "2026-09" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }).potentialAmount, 0)],
  ["forward currency mismatch", () => code(() => F.projectAdvisorCompensationForwardSignals({
    signals: [signal({ currency: "USD" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_FORWARD_SIGNAL_CURRENCY_MISMATCH")]
].forEach(([name, fn]) => test(name, fn));

[
  ["payout contract", () => assert.equal(payout().contractVersion, "ADVISOR_COMPENSATION_CONFIRMED_PAYOUT_RECORD_001")],
  ["payout truth class", () => assert.equal(payout().truthClass, "CONFIRMED_COMPENSATION_PAYOUT")],
  ["payout human decision", () => assert.equal(payout().humanDecisionId, "decision:payout-1")],
  ["payout digest", () => assert.match(payout().recordDigest, /^[a-f0-9]{64}$/)],
  ["payout validation", () => assert(P.validateAdvisorCompensationConfirmedPayoutRecord(payout()).valid)],
  ["payout matched event required", () => code(() => P.createAdvisorCompensationConfirmedPayoutRecord({
    payoutRecordId: "unmatched", advisorReference: "advisor-1",
    periodKey: "2026-08", amount: 10, currency: "MXN",
    matchedCompensationEventIds: [], payoutEvidenceReference: "statement",
    payoutEvidenceHash: "hash", humanDecisionId: "decision",
    confirmedAt: "2026-08-31T20:00:00.000Z",
    sourceAuthority: "PAYOUT_RECONCILIATION_STAGE_090"
  }), "ADVISOR_COMPENSATION_PAYOUT_MATCHED_EVENT_REQUIRED")],

  ["payout automatic false", () => assert.equal(payout().safeguards.automaticConfirmation, false)],
  ["payout negative blocked", () => code(() => payout({ amount: -1 }), "ADVISOR_COMPENSATION_PAYOUT_AMOUNT_INVALID")],
  ["payout zero blocked", () => code(() => payout({ amount: 0 }), "ADVISOR_COMPENSATION_PAYOUT_AMOUNT_INVALID")],
  ["payout disconnected null", () => {
    const result = P.projectAdvisorCompensationPayoutTruth({
      records: null, advisorReference: "advisor-1", periodKey: "2026-08"
    });
    assert.equal(result.sourceState, "DISCONNECTED");
    assert.equal(result.amount, null);
  }],
  ["payout unknown not zero", () => assert.equal(P.projectAdvisorCompensationPayoutTruth({
    records: null, advisorReference: "advisor-1", periodKey: "2026-08"
  }).safeguards.unknownIsNotZero, true)],
  ["payout empty available zero", () => {
    const result = P.projectAdvisorCompensationPayoutTruth({
      records: [], advisorReference: "advisor-1", periodKey: "2026-08"
    });
    assert.equal(result.amount, 0);
    assert.equal(result.knownZero, true);
  }],
  ["payout sum", () => assert.equal(P.projectAdvisorCompensationPayoutTruth({
    records: [payout(), payout({ id: "payout-2", amount: 20 })],
    advisorReference: "advisor-1", periodKey: "2026-08"
  }).amount, 100)],
  ["payout other advisor filtered", () => assert.equal(P.projectAdvisorCompensationPayoutTruth({
    records: [payout({ advisor: "advisor-2" })],
    advisorReference: "advisor-1", periodKey: "2026-08"
  }).amount, 0)],
  ["payout other period filtered", () => assert.equal(P.projectAdvisorCompensationPayoutTruth({
    records: [payout({ period: "2026-09" })],
    advisorReference: "advisor-1", periodKey: "2026-08"
  }).amount, 0)],
  ["payout currency mismatch", () => code(() => P.projectAdvisorCompensationPayoutTruth({
    records: [payout({ currency: "USD" })],
    advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_PAYOUT_CURRENCY_MISMATCH")],
  ["payout records disconnected invalid", () => code(() => P.projectAdvisorCompensationPayoutTruth({
    records: [payout()], sourceState: "DISCONNECTED",
    advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_PAYOUT_RECORDS_WITH_DISCONNECTED_SOURCE")]
].forEach(([name, fn]) => test(name, fn));

[
  ["event projector estimated", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [estimated], advisorReference: "advisor-1", periodKey: "2026-08"
  }).amounts.estimated, 100)],
  ["event projector earned no double", () => {
    const result = E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, earned], advisorReference: "advisor-1", periodKey: "2026-08"
    });
    assert.equal(result.amounts.estimated, 0);
    assert.equal(result.amounts.earnedGross, 100);
  }],
  ["event projector adjustment", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, earned, adjusted], advisorReference: "advisor-1", periodKey: "2026-08"
  }).amounts.adjustments, 20)],
  ["event projector adjusted net", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, earned, adjusted], advisorReference: "advisor-1", periodKey: "2026-08"
  }).amounts.earnedNet, 120)],
  ["event projector reversal", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, earned, reversed], advisorReference: "advisor-1", periodKey: "2026-08"
  }).amounts.reversals, -100)],
  ["event projector reversal net zero", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, earned, reversed], advisorReference: "advisor-1", periodKey: "2026-08"
  }).amounts.earnedNet, 0)],
  ["event projector negative adjustment", () => {
    const negative = event({ id: "agg-1:3:ADJUSTED:-20", sequence: 3, previous: earned.eventId, state: "ADJUSTED", amount: -20 });
    assert.equal(E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, earned, negative], advisorReference: "advisor-1", periodKey: "2026-08"
    }).amounts.earnedNet, 80);
  }],
  ["event projector aggregate count", () => {
    const second = event({ id: "agg-2:1", aggregate: "agg-2", amount: 50, policy: "policy-2" });
    assert.equal(E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, second], advisorReference: "advisor-1", periodKey: "2026-08"
    }).aggregateCount, 2);
  }],
  ["event projector sums aggregates", () => {
    const second = event({ id: "agg-2:1", aggregate: "agg-2", amount: 50, policy: "policy-2" });
    assert.equal(E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, second], advisorReference: "advisor-1", periodKey: "2026-08"
    }).amounts.estimated, 150);
  }],
  ["event projector filters advisor", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [event({ advisor: "advisor-2" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }).eventCount, 0)],
  ["event projector filters period", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [event({ period: "2026-09" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }).eventCount, 0)],
  ["event exact duplicate ignored", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, estimated], advisorReference: "advisor-1", periodKey: "2026-08"
  }).eventCount, 1)],
  ["event id conflict", () => {
    const changed = { ...estimated, amount: { value: 101, currency: "MXN" }, eventDigest: "f".repeat(64) };
    code(() => E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, changed], advisorReference: "advisor-1", periodKey: "2026-08"
    }), "ADVISOR_COMPENSATION_INCOME_EVENT_ID_CONFLICT");
  }],
  ["event currency mismatch", () => code(() => E.projectAdvisorCompensationEventsToIncome({
    events: [event({ currency: "USD" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_INCOME_EVENT_CURRENCY_MISMATCH")],
  ["event sequence gap", () => code(() => E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, event({ id: "gap", sequence: 3, previous: estimated.eventId, state: "EARNED" })],
    advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_INCOME_SEQUENCE_CONFLICT")],
  ["event previous mismatch", () => code(() => E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, event({ id: "prev", sequence: 2, previous: "other", state: "EARNED" })],
    advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_INCOME_PREVIOUS_EVENT_MISMATCH")],
  ["event first previous forbidden", () => code(() => E.projectAdvisorCompensationEventsToIncome({
    events: [event({ previous: "other" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_INCOME_FIRST_EVENT_PREVIOUS_FORBIDDEN")],
  ["event estimated base required", () => code(() => E.projectAdvisorCompensationEventsToIncome({
    events: [event({ state: "EARNED" })], advisorReference: "advisor-1", periodKey: "2026-08"
  }), "ADVISOR_COMPENSATION_INCOME_ESTIMATED_BASE_REQUIRED")],
  ["event multiple estimated", () => {
    const second = event({ id: "est2", sequence: 2, previous: estimated.eventId, state: "ESTIMATED" });
    code(() => E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, second], advisorReference: "advisor-1", periodKey: "2026-08"
    }), "ADVISOR_COMPENSATION_INCOME_MULTIPLE_ESTIMATED_EVENTS");
  }],
  ["event multiple earned", () => {
    const secondEarned = event({ id: "earn3", sequence: 3, previous: earned.eventId, state: "EARNED" });
    code(() => E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, earned, secondEarned], advisorReference: "advisor-1", periodKey: "2026-08"
    }), "ADVISOR_COMPENSATION_INCOME_MULTIPLE_EARNED_EVENTS");
  }],
  ["event adjustment before earned", () => {
    const bad = event({ id: "adj2", sequence: 2, previous: estimated.eventId, state: "ADJUSTED", amount: 10 });
    code(() => E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, bad], advisorReference: "advisor-1", periodKey: "2026-08"
    }), "ADVISOR_COMPENSATION_INCOME_EARNED_EVENT_REQUIRED");
  }],
  ["event after reversal", () => {
    const after = event({ id: "after4", sequence: 4, previous: reversed.eventId, state: "ADJUSTED", amount: 10 });
    code(() => E.projectAdvisorCompensationEventsToIncome({
      events: [estimated, earned, reversed, after], advisorReference: "advisor-1", periodKey: "2026-08"
    }), "ADVISOR_COMPENSATION_INCOME_EVENT_AFTER_REVERSAL_FORBIDDEN");
  }]
].forEach(([name, fn]) => test(name, fn));


const governedAdjustment1 = A.createAdvisorCompensationAdjustmentEvent({
  baseEvent: earned,
  amountDelta: 20,
  reason: "rate correction",
  actorId: "reviewer-1",
  idempotencyKey: "stage060-adjust-1",
  correlationId: "stage060",
  createdAt: "2026-08-03T00:00:00.000Z"
});
const governedAdjustment2 = A.createAdvisorCompensationAdjustmentEvent({
  baseEvent: governedAdjustment1,
  amountDelta: 10,
  reason: "second correction",
  actorId: "reviewer-1",
  idempotencyKey: "stage060-adjust-2",
  correlationId: "stage060",
  createdAt: "2026-08-04T00:00:00.000Z"
});
const governedReversal = A.createAdvisorCompensationReversalEvent({
  baseEvent: governedAdjustment2,
  reason: "full cancellation",
  actorId: "reviewer-2",
  idempotencyKey: "stage060-reverse",
  correlationId: "stage060",
  createdAt: "2026-08-05T00:00:00.000Z"
});

[
  ["earned current net", () => assert.equal(A.resolveCurrentNetAmount(earned), 100)],
  ["first adjustment base net", () => assert.equal(governedAdjustment1.metadata.baseAmount, 100)],
  ["first adjustment resulting net", () => assert.equal(governedAdjustment1.metadata.resultingNetAmount, 120)],
  ["chained adjustment base uses prior net", () => assert.equal(governedAdjustment2.metadata.baseAmount, 120)],
  ["chained adjustment resulting net", () => assert.equal(governedAdjustment2.metadata.resultingNetAmount, 130)],
  ["adjusted reversal reverses aggregate net", () => assert.equal(governedReversal.amount.value, -130)],
  ["adjusted reversal resulting zero", () => assert.equal(governedReversal.metadata.resultingNetAmount, 0)],
  ["adjusted reversal projector zero", () => assert.equal(E.projectAdvisorCompensationEventsToIncome({
    events: [estimated, earned, governedAdjustment1, governedAdjustment2, governedReversal],
    advisorReference: "advisor-1",
    periodKey: "2026-08"
  }).amounts.earnedNet, 0)],
  ["adjusted event without net blocked", () => code(() => A.resolveCurrentNetAmount(event({
    id: "bad-adjusted-net",
    state: "ADJUSTED",
    sequence: 3,
    previous: earned.eventId,
    amount: 5
  })), "ADVISOR_COMPENSATION_ADJUSTED_NET_AMOUNT_REQUIRED")]
].forEach(([name, fn]) => test(name, fn));

const disconnectedSnapshot = B.buildAdvisorCompensationPeriodSnapshot({
  events: [estimated],
  payoutRecords: null,
  forwardSignals: [],
  advisorReference: "advisor-1",
  periodKey: "2026-08",
  capturedAt: "2026-08-02T06:00:00.000Z"
});
const earnedSnapshot = B.buildAdvisorCompensationPeriodSnapshot({
  events: [estimated, earned, adjusted],
  payoutRecords: null,
  forwardSignals: [
    signal(),
    signal({ id: "risk-1", kind: "AT_RISK", amount: 30 })
  ],
  advisorReference: "advisor-1",
  periodKey: "2026-08",
  capturedAt: "2026-08-02T06:00:00.000Z"
});
const paidSnapshot = B.buildAdvisorCompensationPeriodSnapshot({
  events: [estimated, earned, adjusted],
  payoutRecords: [payout({ amount: 90 })],
  forwardSignals: [
    signal(),
    signal({ id: "risk-1", kind: "AT_RISK", amount: 30 })
  ],
  advisorReference: "advisor-1",
  periodKey: "2026-08",
  capturedAt: "2026-08-02T06:00:00.000Z"
});

[
  ["snapshot contract", () => assert.equal(disconnectedSnapshot.contractVersion, "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001")],
  ["snapshot digest", () => assert.match(disconnectedSnapshot.snapshotDigest, /^[a-f0-9]{64}$/)],
  ["snapshot validation", () => assert(S.validateAdvisorCompensationPeriodSnapshot(disconnectedSnapshot).valid)],
  ["snapshot frozen", () => assert(Object.isFrozen(disconnectedSnapshot.amounts.earned))],
  ["snapshot estimated amount", () => assert.equal(disconnectedSnapshot.amounts.estimated, 100)],
  ["snapshot paid disconnected", () => assert.equal(disconnectedSnapshot.amounts.paid.sourceState, "DISCONNECTED")],
  ["snapshot paid unknown null", () => assert.equal(disconnectedSnapshot.amounts.paid.value, null)],
  ["snapshot real unavailable", () => assert.equal(disconnectedSnapshot.amounts.real.basis, "UNAVAILABLE")],
  ["snapshot partial disconnected", () => assert.equal(disconnectedSnapshot.status, "PARTIAL")],
  ["snapshot earned gross", () => assert.equal(earnedSnapshot.amounts.earned.gross, 100)],
  ["snapshot adjustments", () => assert.equal(earnedSnapshot.amounts.earned.adjustments, 20)],
  ["snapshot earned net", () => assert.equal(earnedSnapshot.amounts.earned.net, 120)],
  ["snapshot real earned fallback", () => assert.equal(earnedSnapshot.amounts.real.basis, "EARNED")],
  ["snapshot real earned value", () => assert.equal(earnedSnapshot.amounts.real.value, 120)],
  ["snapshot potential separate", () => assert.equal(earnedSnapshot.amounts.potential, 500)],
  ["snapshot at risk separate", () => assert.equal(earnedSnapshot.amounts.atRisk, 30)],
  ["snapshot potential not real", () => assert.equal(earnedSnapshot.amounts.real.value, 120)],
  ["snapshot paid ready", () => assert.equal(paidSnapshot.status, "READY")],
  ["snapshot paid amount", () => assert.equal(paidSnapshot.amounts.paid.value, 90)],
  ["snapshot real paid basis", () => assert.equal(paidSnapshot.amounts.real.basis, "PAID")],
  ["snapshot real paid value", () => assert.equal(paidSnapshot.amounts.real.value, 90)],
  ["snapshot earned preserved beside paid", () => assert.equal(paidSnapshot.amounts.earned.net, 120)],
  ["snapshot estimated not earned", () => assert.equal(disconnectedSnapshot.safeguards.estimatedAsEarnedIncome, false)],
  ["snapshot earned not paid", () => assert.equal(disconnectedSnapshot.safeguards.earnedAsPaidIncome, false)],
  ["snapshot quote excluded", () => assert.equal(disconnectedSnapshot.safeguards.quoteAsIncome, false)],
  ["snapshot unknown not zero", () => assert.equal(disconnectedSnapshot.safeguards.unknownAsZero, false)],
  ["snapshot deterministic", () => assert.equal(
    B.buildAdvisorCompensationPeriodSnapshot({
      events: [estimated], payoutRecords: null, forwardSignals: [],
      advisorReference: "advisor-1", periodKey: "2026-08",
      capturedAt: "2026-08-02T06:00:00.000Z"
    }).snapshotDigest,
    disconnectedSnapshot.snapshotDigest
  )],
  ["snapshot event source required", () => code(() => B.buildAdvisorCompensationPeriodSnapshot({
    events: null, payoutRecords: null, forwardSignals: [],
    advisorReference: "advisor-1", periodKey: "2026-08",
    capturedAt: "2026-08-02T06:00:00.000Z"
  }), "ADVISOR_COMPENSATION_PERIOD_EVENTS_SOURCE_REQUIRED")],
  ["snapshot signal source required", () => code(() => B.buildAdvisorCompensationPeriodSnapshot({
    events: [], payoutRecords: null, forwardSignals: null,
    advisorReference: "advisor-1", periodKey: "2026-08",
    capturedAt: "2026-08-02T06:00:00.000Z"
  }), "ADVISOR_COMPENSATION_FORWARD_SIGNAL_SOURCE_REQUIRED")],
  ["snapshot empty known", () => assert.equal(B.buildAdvisorCompensationPeriodSnapshot({
    events: [], payoutRecords: [], forwardSignals: [],
    advisorReference: "advisor-1", periodKey: "2026-08",
    capturedAt: "2026-08-02T06:00:00.000Z"
  }).status, "EMPTY")],
  ["snapshot empty paid zero", () => assert.equal(B.buildAdvisorCompensationPeriodSnapshot({
    events: [], payoutRecords: [], forwardSignals: [],
    advisorReference: "advisor-1", periodKey: "2026-08",
    capturedAt: "2026-08-02T06:00:00.000Z"
  }).amounts.paid.value, 0)],
  ["snapshot empty real paid zero", () => assert.equal(B.buildAdvisorCompensationPeriodSnapshot({
    events: [], payoutRecords: [], forwardSignals: [],
    advisorReference: "advisor-1", periodKey: "2026-08",
    capturedAt: "2026-08-02T06:00:00.000Z"
  }).amounts.real.value, 0)]
].forEach(([name, fn]) => test(name, fn));

const sepEstimated = event({ id: "sep-est", aggregate: "agg-sep", period: "2026-09", amount: 40 });
const history = H.buildAdvisorCompensationHistorySeries({
  periodKeys: ["2026-09", "2026-08"],
  events: [estimated, earned, adjusted, sepEstimated],
  payoutRecords: null,
  forwardSignals: [signal(), signal({ id: "sep-pot", period: "2026-09", amount: 70 })],
  advisorReference: "advisor-1",
  capturedAt: "2026-08-02T06:00:00.000Z"
});

[
  ["history contract", () => assert.equal(history.contractVersion, "ADVISOR_COMPENSATION_HISTORY_SERIES_001")],
  ["history sorted", () => assert.deepStrictEqual(history.points.map((p) => p.periodKey), ["2026-08", "2026-09"])],
  ["history august earned", () => assert.equal(history.points[0].earnedNet, 120)],
  ["history september estimated", () => assert.equal(history.points[1].estimated, 40)],
  ["history no cross period potential", () => assert.equal(history.points[0].potential, 500)],
  ["history september potential", () => assert.equal(history.points[1].potential, 70)],
  ["history paid unknown null", () => assert.equal(history.points[0].paid, null)],
  ["history digest", () => assert.match(history.seriesDigest, /^[a-f0-9]{64}$/)],
  ["history validation", () => assert(H.validateAdvisorCompensationHistorySeries(history).valid)],
  ["history duplicate period blocked", () => code(() => H.buildAdvisorCompensationHistorySeries({
    periodKeys: ["2026-08", "2026-08"], events: [], payoutRecords: [],
    forwardSignals: [], advisorReference: "advisor-1",
    capturedAt: "2026-08-02T06:00:00.000Z"
  }), "ADVISOR_COMPENSATION_HISTORY_DUPLICATE_PERIOD")],
  ["history bad period blocked", () => code(() => H.buildAdvisorCompensationHistorySeries({
    periodKeys: ["2026-13"], events: [], payoutRecords: [],
    forwardSignals: [], advisorReference: "advisor-1",
    capturedAt: "2026-08-02T06:00:00.000Z"
  }), "ADVISOR_COMPENSATION_HISTORY_PERIOD_INVALID")],
  ["history empty periods blocked", () => code(() => H.buildAdvisorCompensationHistorySeries({
    periodKeys: [], events: [], payoutRecords: [], forwardSignals: [],
    advisorReference: "advisor-1", capturedAt: "2026-08-02T06:00:00.000Z"
  }), "ADVISOR_COMPENSATION_HISTORY_PERIODS_REQUIRED")],
  ["history safeguards", () => assert.equal(history.safeguards.noCrossPeriodLeakage, true)]
].forEach(([name, fn]) => test(name, fn));

console.log(`MASTER_TEST_TOTAL=${total}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${total - passed}`);
console.log(`STAGE_060_COMPLETE=${total === passed ? "YES" : "NO"}`);
if (total !== passed) process.exit(1);
