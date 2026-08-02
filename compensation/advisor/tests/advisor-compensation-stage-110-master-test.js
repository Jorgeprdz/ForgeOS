"use strict";

const assert = require("assert");
const C = require("../events/advisor-compensation-event-contract");
const P = require("../income/advisor-compensation-paid-truth-adapter");
const F = require("../income/advisor-compensation-forward-signal-contract");
const M = require("../materialization/advisor-compensation-product-read-model-materializer");

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
  id = "agg-1:1:ESTIMATED",
  aggregate = "agg-1",
  sequence = 1,
  previous = null,
  state = "ESTIMATED",
  amount = 100,
  advisor = "advisor-1",
  period = "2026-08",
  currency = "MXN",
  createdAt = "2026-08-02T12:00:00.000Z",
} = {}) {
  const value = {
    contractVersion: "ADVISOR_COMPENSATION_EVENT_001",
    eventId: id,
    aggregateKey: aggregate,
    sequence,
    previousEventId: previous,
    state,
    kind: state === "ADJUSTED"
      ? "ADJUSTMENT"
      : state === "REVERSED"
        ? "REVERSAL"
        : "COMMISSION",
    concept: "LIFE_INITIAL",
    advisorReference: advisor,
    policyReference: "policy-1",
    paymentEventId: "payment-1",
    periodKey: period,
    amount: { value: amount, currency },
    calculation: { calculationDigest: "c".repeat(64) },
    ruleSnapshot: { rulePackDigest: "r".repeat(64) },
    evidence: { references: ["evidence-1"] },
    lineage: { sourceCalculationDigest: "c".repeat(64) },
    idempotencyKey: `idem:${id}`,
    correlationId: "corr-1",
    createdAt,
    safeguards: {
      appendOnly: true,
      overwriteAuthorized: false,
      deleteAuthorized: false,
      payoutTruth: false,
    },
    metadata: {},
  };
  value.eventDigest = C.sha256(value);
  return C.deepFreeze(value);
}

function payout({
  advisor = "advisor-1",
  period = "2026-08",
  amount = 90,
  id = "payout-1",
} = {}) {
  return P.createAdvisorCompensationConfirmedPayoutRecord({
    payoutRecordId: id,
    advisorReference: advisor,
    periodKey: period,
    amount,
    currency: "MXN",
    matchedCompensationEventIds: ["agg-1:2:EARNED"],
    payoutEvidenceReference: `statement:${id}`,
    payoutEvidenceHash: `hash:${id}`,
    humanDecisionId: `decision:${id}`,
    confirmedAt: "2026-08-31T20:00:00.000Z",
    sourceAuthority: "PAYOUT_RECONCILIATION_STAGE_090",
  });
}

function signal({ advisor = "advisor-1", period = "2026-08" } = {}) {
  return F.createAdvisorCompensationForwardSignal({
    signalId: "signal-1",
    kind: "POTENTIAL",
    state: "ACTIVE",
    advisorReference: advisor,
    periodKey: period,
    amount: 500,
    currency: "MXN",
    sourceAuthority: "FORECAST_COMPENSATION_PROJECTION",
    sourceReference: "forecast:signal-1",
  });
}

const capturedAt = "2026-08-02T18:00:00.000Z";
const estimated = event();
const earned = event({
  id: "agg-1:2:EARNED",
  sequence: 2,
  previous: estimated.eventId,
  state: "EARNED",
  amount: 100,
  createdAt: "2026-08-02T13:00:00.000Z",
});

function materialize(overrides = {}) {
  return M.materializeAdvisorCompensationProductReadModel({
    advisorReference: "advisor-1",
    periodKey: "2026-08",
    periodKeys: ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"],
    eventRows: [{ payload: estimated }, { payload: earned }],
    payoutRows: [{ payload: payout() }],
    forwardSignals: [],
    capturedAt,
    ...overrides,
  });
}

[
  ["contract version", () => assert.equal(materialize().contractVersion, M.CONTRACT_VERSION)],
  ["six month helper", () => assert.deepStrictEqual([...M.sixMonthPeriods("2026-08")], ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"])],
  ["shift across year", () => assert.equal(M.shiftPeriod("2026-01", -1), "2025-12")],
  ["history contains six points", () => assert.equal(materialize().historyPayload.points.length, 6)],
  ["history is ascending", () => assert.deepStrictEqual(materialize().historyPayload.points.map((point) => point.periodKey), ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"])],
  ["current snapshot selected", () => assert.equal(materialize().snapshotPayload.periodKey, "2026-08")],
  ["earned truth projected", () => assert.equal(materialize().snapshotPayload.amounts.earned.net, 100)],
  ["confirmed payout projected", () => assert.equal(materialize().snapshotPayload.amounts.paid.value, 90)],
  ["payout rows default to partial source", () => assert.equal(materialize().snapshotPayload.amounts.paid.sourceState, "PARTIAL")],
  ["paid truth wins real basis", () => assert.deepStrictEqual(materialize().snapshotPayload.amounts.real, { basis: "PAID", value: 90 })],
  ["missing forward source marks snapshot partial", () => assert.equal(materialize().snapshotPayload.status, "PARTIAL")],
  ["forward source health remains explicit", () => assert.equal(materialize().sourceHealth.forwardSignals, "DISCONNECTED")],
  ["append-only intent", () => assert.equal(materialize().writeIntent.operation, "APPEND_NEW_REVISION")],
  ["browser mutation remains blocked", () => assert.equal(materialize().safeguards.directBrowserMutation, false)],
  ["automatic payout confirmation remains false", () => assert.equal(materialize().safeguards.automaticPayoutConfirmation, false)],
  ["snapshot digest valid", () => assert.match(materialize().snapshotDigest, /^[a-f0-9]{64}$/)],
  ["history digest valid", () => assert.match(materialize().historyDigest, /^[a-f0-9]{64}$/)],
  ["deterministic materialization", () => assert.equal(materialize().snapshotDigest, materialize().snapshotDigest)],
].forEach(([name, fn]) => test(name, fn));

const unknown = M.materializeAdvisorCompensationProductReadModel({
  advisorReference: "advisor-1",
  periodKey: "2026-08",
  eventRows: [],
  payoutRows: [],
  forwardSignals: [],
  capturedAt,
});
[
  ["unknown payout stays null", () => assert.equal(unknown.snapshotPayload.amounts.paid.value, null)],
  ["unknown payout is not known zero", () => assert.equal(unknown.snapshotPayload.amounts.paid.knownZero, false)],
  ["unknown real stays null", () => assert.equal(unknown.snapshotPayload.amounts.real.value, null)],
  ["unknown sources produce partial state", () => assert.equal(unknown.sourceState, "PARTIAL")],
  ["unknown is not zero safeguard", () => assert.equal(unknown.safeguards.unknownAsZero, false)],
].forEach(([name, fn]) => test(name, fn));

const knownEmpty = M.materializeAdvisorCompensationProductReadModel({
  advisorReference: "advisor-1",
  periodKey: "2026-08",
  eventRows: [],
  payoutRows: [],
  payoutSourceState: "AVAILABLE",
  forwardSignals: [],
  forwardSignalSourceState: "AVAILABLE",
  capturedAt,
});
[
  ["explicit complete empty is empty", () => assert.equal(knownEmpty.sourceState, "EMPTY")],
  ["explicit complete empty paid is zero", () => assert.equal(knownEmpty.snapshotPayload.amounts.paid.value, 0)],
  ["explicit complete empty is known zero", () => assert.equal(knownEmpty.snapshotPayload.amounts.paid.knownZero, true)],
].forEach(([name, fn]) => test(name, fn));

[
  ["advisor required", () => code(() => materialize({ advisorReference: "" }), "ADVISOR_COMPENSATION_MATERIALIZATION_ADVISOR_REQUIRED")],
  ["period invalid", () => code(() => materialize({ periodKey: "2026-13" }), "ADVISOR_COMPENSATION_MATERIALIZATION_PERIOD_INVALID")],
  ["current period required in history", () => code(() => materialize({ periodKeys: ["2026-07"] }), "ADVISOR_COMPENSATION_MATERIALIZATION_CURRENT_PERIOD_MISSING")],
  ["duplicate periods blocked", () => code(() => materialize({ periodKeys: ["2026-08", "2026-08"] }), "ADVISOR_COMPENSATION_MATERIALIZATION_DUPLICATE_PERIOD")],
  ["event owner mismatch blocked", () => code(() => materialize({ eventRows: [{ payload: event({ advisor: "advisor-2" }) }] }), "ADVISOR_COMPENSATION_MATERIALIZATION_EVENT_OWNER_MISMATCH")],
  ["payout owner mismatch blocked", () => code(() => materialize({ payoutRows: [{ payload: payout({ advisor: "advisor-2" }) }] }), "ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_OWNER_MISMATCH")],
  ["invalid event blocked", () => code(() => materialize({ eventRows: [{ payload: { bad: true } }] }), "ADVISOR_COMPENSATION_MATERIALIZATION_EVENT_INVALID")],
  ["invalid payout blocked", () => code(() => materialize({ payoutRows: [{ payload: { bad: true } }], payoutSourceState: "PARTIAL" }), "ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_INVALID")],
  ["payout rows cannot claim disconnected", () => code(() => materialize({ payoutSourceState: "DISCONNECTED" }), "ADVISOR_COMPENSATION_MATERIALIZATION_PAYOUT_ROWS_WITH_DISCONNECTED_SOURCE")],
  ["signals cannot claim disconnected", () => code(() => materialize({ forwardSignals: [signal()] }), "ADVISOR_COMPENSATION_MATERIALIZATION_FORWARD_SIGNALS_WITH_DISCONNECTED_SOURCE")],
  ["signal owner mismatch blocked", () => code(() => materialize({ forwardSignals: [signal({ advisor: "advisor-2" })], forwardSignalSourceState: "AVAILABLE" }), "ADVISOR_COMPENSATION_MATERIALIZATION_FORWARD_SIGNAL_OWNER_MISMATCH")],
  ["capture time required", () => code(() => materialize({ capturedAt: null }), "ADVISOR_COMPENSATION_MATERIALIZATION_CAPTURED_AT_REQUIRED")],
].forEach(([name, fn]) => test(name, fn));

console.log(`MASTER_TEST_TOTAL=${total}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${total - passed}`);
if (passed !== total) process.exit(1);
