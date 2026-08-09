import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { parseGMMQuote } from "../product-intelligence/evidence/gmm-quote-parser.js";
import {
  buildGmmAcceptedQuoteCalculation,
  buildGmmDashboardModel,
  isGmmQuoteText,
  parseGmmQuoteTextToAcceptedQuotePacket,
} from "../docs/static-preview/quote-runtime/forge-gmm-product-decision-adapter.js";
import {
  calculateAcceptedQuote,
} from "../docs/static-preview/quote-runtime/forge-accepted-quote-adapter-006.js";
import {
  buildProductSpecificDecisionReadModel,
} from "../docs/static-preview/quote-runtime/forge-product-specific-decision-read-model-006.js";
import {
  buildProductSpecificDecisionReadModel as buildBaseProductSpecificDecisionReadModel,
} from "../docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js";
import {
  projectBonusCoach,
  projectGenerated,
  projectIncomeReadModel,
} from "../docs/static-preview/forge-aura/income/income-core.mjs";

const GMM_TEXT = `
Alfa Medical
plan: INTEGRO Zona: 1
Deducible: $40,000 Pesos
Coaseguro: 10%
con límite de $85,000 Pesos
Suma Asegurada: $160,000,000 Pesos
Territorialidad: NACIONAL
Tabulador: GAMMA
Moneda: Pesos
PRIMA ANUAL $35,629.03
`;

function findItem(model, id) {
  return (model?.sections || [])
    .flatMap((section) => section?.items || [])
    .find((item) => item?.id === id) || null;
}

function earnedSnapshot() {
  return {
    contractVersion: "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001",
    advisorReference: "advisor-synthetic-phase006",
    periodKey: "2026-08",
    currency: "MXN",
    status: "READY",
    capturedAt: "2026-08-09T00:00:00.000Z",
    amounts: {
      earned: { gross: 1500, adjustments: 0, reversals: 0, net: 1500 },
      paid: { sourceState: "DISCONNECTED", value: null, knownZero: false },
    },
    sourceHealth: {
      compensationEvents: "AVAILABLE",
      payoutTruth: "DISCONNECTED",
      forwardSignals: "DISCONNECTED",
    },
    details: {
      aggregates: [{
        aggregateKey: "commission-initial",
        concept: "LIFE_INITIAL",
        kind: "COMMISSION",
        latestState: "EARNED",
        earnedEventId: "earned-1",
        earnedNetAmount: 1500,
        earnedGrossAmount: 1500,
        adjustmentAmount: 0,
        reversalAmount: 0,
        policyReference: "policy-synthetic-1",
        paymentEventId: null,
        sourceCalculationDigest: "c".repeat(64),
        rulePackDigest: "r".repeat(64),
        events: [{
          concept: "LIFE_INITIAL",
          kind: "COMMISSION",
          createdAt: "2026-08-09T00:00:00.000Z",
          metadata: { policyYear: 1, productName: "Vida" },
        }],
      }],
      forwardSignals: [],
      metadata: {},
    },
    safeguards: { unknownAsZero: false },
  };
}

test("PHASE_006_IMPLEMENTATION_ACCEPTANCE: canonical GMM parser remains the evidence authority", () => {
  assert.equal(isGmmQuoteText(GMM_TEXT), true);
  const parsed = parseGMMQuote({ text: GMM_TEXT });
  assert.equal(parsed.productType, "GMM");
  assert.equal(parsed.productName, "Alfa Medical");
  assert.equal(parsed.plan, "INTEGRO");
  assert.equal(parsed.deductible, 40000);
  assert.equal(parsed.coinsurance.percent, 10);
  assert.equal(parsed.coinsurance.maxOutOfPocket, 85000);
  assert.equal(parsed.sumAssured, 160000000);
  assert.equal(parsed.territoriality, "NACIONAL");
  assert.equal(parsed.tabulator, "GAMMA");
  assert.equal(parsed.annualPremium, 35629.03);
});

test("GMM evidence becomes Accepted Quote + Product Intelligence without invented values", () => {
  const packet = parseGmmQuoteTextToAcceptedQuotePacket(GMM_TEXT, { fileName: "synthetic-gmm.pdf" });
  assert.equal(packet.productFamily, "GMM");
  assert.equal(packet.currency, "MXN");
  assert.equal(packet.nativeResult.deductible, 40000);
  assert.equal(packet.nativeResult.coinsurancePercent, 10);
  assert.equal(packet.nativeResult.coinsuranceCap, 85000);
  assert.equal(packet.productIntelligence.medical_plan.deductible.truth_status, "source_provided");
  assert.equal(packet.productIntelligence.medical_plan.hospital_network.truth_status, "unknown");
  assert.equal(packet.productIntelligence.medical_plan.hospital_network.value, null);
  assert.equal(packet.productIntelligence.provenance.parser_ref, "product-intelligence/evidence/gmm-quote-parser.js");
});

test("GMM never falls through to retirement or UDI calculation", async () => {
  const packet = parseGmmQuoteTextToAcceptedQuotePacket(GMM_TEXT);
  const direct = buildGmmAcceptedQuoteCalculation({ packet, nativeResult: packet.nativeResult });
  const routed = await calculateAcceptedQuote(packet);
  for (const calculation of [direct, routed]) {
    assert.equal(calculation.productFamily, "GMM");
    assert.equal(calculation.paymentYears, null);
    assert.equal(calculation.totalContributed, null);
    assert.equal(calculation.totalRecovery, null);
    assert.equal(calculation.projectedUdiAtRetirement, null);
    assert.equal(calculation.monthlyIncomeMXN, null);
    assert.equal(calculation.annualIncomeMXN, null);
    assert.equal(calculation.udiProjection, null);
  }
});

test("GMM Aura decision projection exposes medical meaning and keeps projection bucket empty", () => {
  const packet = parseGmmQuoteTextToAcceptedQuotePacket(GMM_TEXT);
  const calculation = buildGmmAcceptedQuoteCalculation({ packet, nativeResult: packet.nativeResult });
  const dashboard = buildGmmDashboardModel(calculation);
  const decision = buildProductSpecificDecisionReadModel({ packet, calculation, benefitSummary: [] });

  assert.equal(dashboard.productType, "gmm");
  assert.deepEqual(dashboard.sections.map((section) => section.kind), [
    "medical_plan",
    "cost_sharing",
    "medical_coverage",
    "premium",
  ]);
  assert.equal(decision.readModelId, "forge.quotes.product-specific-decision-read-model.v1");
  assert.equal(decision.productType, "gmm");
  assert.equal(decision.supported, true);
  assert.equal(decision.humanDecisionRequired, true);
  assert.equal(decision.buckets.projection.length, 0);
  assert.match(String(findItem(decision, "deductible")?.value), /40[,.]?000/);
  assert.equal(findItem(decision, "coinsurance")?.value, "10%");
  assert.match(String(findItem(decision, "coinsurance_cap")?.value), /85[,.]?000/);
  assert.equal(findItem(decision, "territory")?.value, "NACIONAL");
  assert.equal(findItem(decision, "tabulator")?.value, "GAMMA");
  assert.equal(decision.safety.recalculationAllowed, false);
  assert.equal(decision.safety.forecastAllowed, false);
  assert.equal(decision.safety.compensationInfluenceAllowed, false);
  assert.equal(decision.safety.unknownIsZero, false);
});

test("partial GMM preserves UNKNOWN and never manufactures zero", () => {
  const partial = `Alfa Medical plan: INTEGRO Zona: 1 Deducible: $40,000 Pesos Coaseguro: 10%`;
  const packet = parseGmmQuoteTextToAcceptedQuotePacket(partial);
  const calculation = buildGmmAcceptedQuoteCalculation({ packet, nativeResult: packet.nativeResult });
  const decision = buildProductSpecificDecisionReadModel({ packet, calculation });
  assert.equal(packet.productIntelligence.protection_summary.basic_sum_assured.truth_status, "unknown");
  assert.equal(packet.productIntelligence.protection_summary.basic_sum_assured.value, null);
  assert.equal(findItem(decision, "sum_assured"), null);
  assert.ok(decision.missingInformation.some((item) => /suma asegurada/i.test(item)));
  assert.ok(decision.missingInformation.some((item) => /prima anual/i.test(item)));
});

test("Phase006 read-model extension delegates all non-GMM behavior to the existing product-specific authority", () => {
  const unsupported = { calculation: { productFamily: "UNKNOWN", product: "UNKNOWN" }, benefitSummary: [] };
  assert.deepEqual(
    buildProductSpecificDecisionReadModel(unsupported),
    buildBaseProductSpecificDecisionReadModel(unsupported),
  );
  const source = fs.readFileSync(
    path.resolve("docs/static-preview/quote-runtime/forge-product-specific-decision-read-model-006.js"),
    "utf8",
  );
  assert.match(source, /buildBaseProductSpecificDecisionReadModel/);
  assert.match(source, /return buildBaseProductSpecificDecisionReadModel/);
});

test("economic truth remains earned/generated only and paid is not inferred", () => {
  const snapshot = earnedSnapshot();
  const generated = projectGenerated(snapshot);
  const model = projectIncomeReadModel({
    state: "READY",
    advisorReference: snapshot.advisorReference,
    periodKey: snapshot.periodKey,
    snapshot,
    history: { snapshots: [], points: [], currency: "MXN" },
  });
  assert.equal(generated.state, "GENERATED");
  assert.equal(generated.value, 1500);
  assert.equal(model.paidEvidence.value, null);
  assert.equal(model.safeguards.payoutClaim, false);
  assert.equal(model.safeguards.expectedIncludedInGenerated, false);
  assert.equal(model.safeguards.scenarioIncludedInGenerated, false);
  assert.equal(model.safeguards.unknownIsNotZero, true);
  assert.equal(model.safeguards.frontendCommissionRateCalculation, false);
});

test("advisor lifecycle remains authority-backed and frontend month inference stays blocked", () => {
  const snapshot = earnedSnapshot();
  snapshot.details.metadata = { advisorMonth: 7 };
  const coach = projectBonusCoach(snapshot);
  assert.equal(coach.state, "BLOCKED");
  assert.equal(coach.reason, "BONUS_COACH_ELIGIBILITY_SNAPSHOT_UNAVAILABLE");
});

test("Pages build wires GMM parser, accepted quote wrapper and decision projection without changing source owners", () => {
  const prepare = fs.readFileSync(path.resolve("scripts/prepare-gmm-quote-pages-runtime.mjs"), "utf8");
  const build = fs.readFileSync(path.resolve("scripts/build-advisor-presentation-pages-runtime.mjs"), "utf8");
  assert.match(prepare, /product-intelligence\/evidence\/gmm-quote-parser\.js/);
  assert.match(prepare, /gmm-quote-parser-authority\.js/);
  assert.match(prepare, /parseGmmQuoteTextToAcceptedQuotePacket/);
  assert.match(prepare, /forge-accepted-quote-adapter-006\.js/);
  assert.match(prepare, /forge-product-specific-decision-read-model-006\.js/);
  assert.match(build, /prepare-gmm-quote-pages-runtime\.mjs/);
});

test("Phase006 source creates no compensation, forecast, bonus, lifecycle or general intelligence engine", () => {
  const files = [
    "docs/static-preview/quote-runtime/forge-gmm-product-decision-adapter.js",
    "docs/static-preview/quote-runtime/forge-accepted-quote-adapter-006.js",
    "docs/static-preview/quote-runtime/forge-product-specific-decision-read-model-006.js",
    "scripts/prepare-gmm-quote-pages-runtime.mjs",
  ];
  const source = files.map((file) => fs.readFileSync(path.resolve(file), "utf8")).join("\n");
  assert.doesNotMatch(source, /class\s+.*(?:Compensation|Forecast|Bonus|Lifecycle|GeneralIntelligence).*Engine/i);
  assert.doesNotMatch(source, /commissionRate\s*[=*]|bonusRate\s*[=*]|forecastRate\s*[=*]/i);
  assert.doesNotMatch(source, /service_role|rls\s*bypass/i);
});
