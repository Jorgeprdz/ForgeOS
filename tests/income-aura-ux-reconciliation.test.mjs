import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  classifyAggregate,
  projectAnnual,
  projectBonusCoach,
  projectExpectedRenewals,
  projectGenerated,
  projectIncomeReadModel,
  projectPipelineScenario,
} from "../docs/static-preview/forge-aura/income/income-core.mjs";

const digest = char => char.repeat(64);

function event({ concept, kind = "COMMISSION", policyReference, policyYear = 1 }) {
  return {
    concept,
    kind,
    policyReference,
    createdAt: "2026-08-08T12:00:00.000Z",
    metadata: { policyYear, productName: concept.includes("GMM") ? "GMM" : "Vida" },
  };
}

function aggregate({ key, concept, kind = "COMMISSION", amount, policyYear = 1 }) {
  return {
    aggregateKey: key,
    concept,
    kind,
    latestState: "EARNED",
    earnedEventId: `${key}:earned`,
    earnedNetAmount: amount,
    earnedGrossAmount: amount,
    adjustmentAmount: 0,
    reversalAmount: 0,
    policyReference: `policy-${key}`,
    paymentEventId: `payment-${key}`,
    sourceCalculationDigest: digest("c"),
    rulePackDigest: digest("d"),
    events: [event({ concept, kind, policyReference: `policy-${key}`, policyYear })],
  };
}

function forwardSignal({ id, scenarioType, amount, metadata = {}, probabilityWeightingApplied = false, digestChar = "a" }) {
  return {
    signalId: id,
    kind: "POTENTIAL",
    state: "ACTIVE",
    periodKey: "2026-08",
    amount: { value: amount, currency: "MXN" },
    source: {
      authority: scenarioType === "PIPELINE_WHAT_IF" ? "PIPELINE_COMPENSATION_SCENARIO" : "POLICY_RENEWAL_COMPENSATION_SCENARIO",
      reference: `source-${id}`,
      snapshotReference: `rule-snapshot-${id}`,
    },
    metadata: { scenarioType, ...metadata },
    signalDigest: digest(digestChar),
    safeguards: {
      incomeTruth: false,
      earnedTruth: false,
      paidTruth: false,
      includedInRealIncome: false,
      probabilityWeightingApplied,
    },
  };
}

function snapshot(overrides = {}) {
  const aggregates = [
    aggregate({ key: "initial", concept: "LIFE_INITIAL", amount: 52400, policyYear: 1 }),
    aggregate({ key: "renewal", concept: "LIFE_RENEWAL", amount: 13600, policyYear: 2 }),
    aggregate({ key: "bonus", concept: "TRAINING_ALLOWANCE", kind: "BONUS", amount: 8280, policyYear: 1 }),
  ];
  const signals = [
    forwardSignal({
      id: "renewal-1",
      scenarioType: "EXPECTED_RENEWAL",
      amount: 16840,
      metadata: {
        policyReference: "policy-renewal-next",
        policyYear: 2,
        expectedPaymentPeriod: "2026-08",
        ruleSnapshotReference: "renewal-rule-snapshot-2026-08",
      },
      digestChar: "a",
    }),
    forwardSignal({
      id: "pipeline-1",
      scenarioType: "PIPELINE_WHAT_IF",
      amount: 42680,
      metadata: {
        opportunityReference: "opportunity-123",
        opportunityLabel: "Oportunidad identificada",
        ruleSnapshotReference: "pipeline-rule-snapshot-2026-08",
      },
      digestChar: "b",
    }),
  ];
  return {
    contractVersion: "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001",
    snapshotId: "snapshot:test:2026-08",
    snapshotDigest: digest("e"),
    advisorReference: "advisor-test",
    periodKey: "2026-08",
    currency: "MXN",
    status: "READY",
    capturedAt: "2026-08-08T12:00:00.000Z",
    amounts: {
      estimated: 0,
      earned: { gross: 74280, adjustments: 0, reversals: 0, net: 74280 },
      paid: { sourceState: "DISCONNECTED", value: null, knownZero: false },
      real: { basis: "EARNED", value: 74280 },
      potential: 59520,
      atRisk: 0,
    },
    counts: { earnedAggregates: 3 },
    sourceHealth: { compensationEvents: "AVAILABLE", payoutTruth: "DISCONNECTED", forwardSignals: "AVAILABLE" },
    details: { aggregates, forwardSignals: signals, metadata: {} },
    safeguards: { unknownAsZero: false },
    ...overrides,
  };
}

test("canonical compensation concepts classify initial, renewal and bonus without frontend rate rules", () => {
  assert.equal(classifyAggregate({ concept: "LIFE_INITIAL", kind: "COMMISSION" }), "INITIAL");
  assert.equal(classifyAggregate({ concept: "GMM_RENEWAL", kind: "COMMISSION" }), "RENEWAL");
  assert.equal(classifyAggregate({ concept: "NEW_PROFESSIONAL_BONUS", kind: "BONUS" }), "BONUS");
});

test("generated income reconciles initial + renewal + generated bonus from canonical earned aggregates", () => {
  const generated = projectGenerated(snapshot());
  assert.equal(generated.state, "GENERATED");
  assert.equal(generated.value, 74280);
  assert.equal(generated.initial, 52400);
  assert.equal(generated.renewal, 13600);
  assert.equal(generated.bonus, 8280);
  assert.equal(generated.initial + generated.renewal + generated.bonus, generated.value);
  assert.equal(generated.compositionComplete, true);
});

test("unknown economic evidence never becomes zero", () => {
  const unknown = projectGenerated(snapshot({
    sourceHealth: { compensationEvents: "DISCONNECTED", forwardSignals: "DISCONNECTED" },
  }));
  assert.equal(unknown.state, "UNKNOWN");
  assert.equal(unknown.value, null);
  assert.equal(unknown.initial, null);
  assert.notEqual(unknown.value, 0);
});

test("expected renewals require explicit typed signal plus policy year, period and rule evidence", () => {
  const expected = projectExpectedRenewals(snapshot());
  assert.equal(expected.state, "EXPECTED");
  assert.equal(expected.value, 16840);
  assert.equal(expected.count, 1);

  const broken = snapshot();
  broken.details.forwardSignals[0].metadata.ruleSnapshotReference = null;
  broken.details.forwardSignals[0].source.snapshotReference = null;
  const invalid = projectExpectedRenewals(broken);
  assert.equal(invalid.value, null);
  assert.equal(invalid.items[0].state, "UNKNOWN");
});

test("Pipeline scenario is explicit what-if and rejects probability-weighted money", () => {
  const scenario = projectPipelineScenario(snapshot());
  assert.equal(scenario.state, "SCENARIO");
  assert.equal(scenario.value, 42680);

  const weighted = snapshot();
  weighted.details.forwardSignals[1].safeguards.probabilityWeightingApplied = true;
  const invalid = projectPipelineScenario(weighted);
  assert.equal(invalid.value, null);
  assert.equal(invalid.items[0].state, "UNKNOWN");
});

test("combined scenario remains separate from generated truth", () => {
  const readModel = {
    state: "READY",
    advisorReference: "advisor-test",
    periodKey: "2026-08",
    snapshot: snapshot(),
    history: { contractVersion: "ADVISOR_COMPENSATION_HISTORY_SERIES_001", currency: "MXN", points: [], snapshots: [] },
  };
  const model = projectIncomeReadModel(readModel);
  assert.equal(model.generated.value, 74280);
  assert.equal(model.pipelineScenario.value, 42680);
  assert.equal(model.combinedScenario, 116960);
  assert.equal(model.safeguards.scenarioIncludedInGenerated, false);
  assert.equal(model.safeguards.pipelineProbabilityWeighting, false);
});

test("annual view refuses to fabricate missing canonical months", () => {
  const readModel = {
    periodKey: "2026-08",
    history: {
      snapshots: ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"].map(periodKey => ({
        ...snapshot(),
        periodKey,
        amounts: { ...snapshot().amounts, earned: { gross: 100, adjustments: 0, reversals: 0, net: 100 } },
      })),
    },
  };
  const annual = projectAnnual(readModel);
  assert.equal(annual.state, "UNKNOWN");
  assert.equal(annual.generatedYtd, null);
  assert.equal(annual.historyLimit, 6);
  assert.equal(annual.reason, "CANONICAL_SOURCE_LIMIT");
});

test("Bonus Coach never infers career eligibility from advisor month alone", () => {
  const coach = projectBonusCoach(snapshot({
    details: { ...snapshot().details, metadata: { advisorMonth: 7 } },
  }));
  assert.equal(coach.state, "BLOCKED");
  assert.equal(coach.reason, "BONUS_COACH_ELIGIBILITY_SNAPSHOT_UNAVAILABLE");
});

test("adjustments and reversals remain visible in generated projection", () => {
  const changed = snapshot();
  changed.amounts.earned = { gross: 76430, adjustments: -1500, reversals: -650, net: 74280 };
  const generated = projectGenerated(changed);
  assert.equal(generated.gross, 76430);
  assert.equal(generated.adjustments, -1500);
  assert.equal(generated.reversals, -650);
  assert.equal(generated.value, 74280);
});

test("Aura implementation contains no payout hero, probability-money heuristic or frontend rule table", () => {
  const moduleText = fs.readFileSync(path.resolve("docs/static-preview/forge-aura/income/income-module.mjs"), "utf8");
  const coreText = fs.readFileSync(path.resolve("docs/static-preview/forge-aura/income/income-core.mjs"), "utf8");
  const adapterText = fs.readFileSync(path.resolve("docs/static-preview/forge-aura/income/income-adapter-pages-v1.mjs"), "utf8");
  assert.match(moduleText, /Ingreso generado este mes/);
  assert.match(moduleText, /SCENARIO · NO GENERADO · NO GARANTIZADO/);
  assert.match(moduleText, /UNKNOWN|No disponible/);
  assert.doesNotMatch(moduleText, /Ingreso real|Te pagaron|Depositado|Recibido/);
  assert.doesNotMatch(coreText, /probability\s*\*|confidence\s*\*|premium\s*\*/i);
  assert.doesNotMatch(adapterText, /\.insert\(|\.update\(|\.upsert\(|\.delete\(|\.from\(/);
  assert.match(adapterText, /forge_advisor_compensation_read_product/);
});

test("Aura CSS consumes canonical Forge tokens and required accessibility dimensions", () => {
  const css = fs.readFileSync(path.resolve("docs/static-preview/forge-aura/income/income.css"), "utf8");
  assert.match(css, /--forge-success/);
  assert.match(css, /--forge-warning/);
  assert.match(css, /--forge-brand/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /font-variant-numeric:tabular-nums/);
  assert.match(css, /max-width:620px/);
  assert.match(css, /max-width:900px/);
});
