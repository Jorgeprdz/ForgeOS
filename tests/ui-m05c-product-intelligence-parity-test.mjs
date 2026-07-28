import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createQuoteResultSnapshot,
} from "../docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js";

const imaginaBenefitSummary = [
  {
    type: "contribution_summary",
    lines: [
      { id: "premium_paying_years", label: "Años de pago", value: 15, unit: "years" },
      { id: "total_contributed_udi", label: "Total aportado", value: 50000, unit: "UDI" },
    ],
  },
  {
    type: "protection_summary",
    lines: [{ id: "sum_assured_udi", label: "Suma asegurada", value: 75000, unit: "UDI" }],
  },
  {
    type: "retirement_scenarios",
    scenarios: [{
      id: "base",
      label: "Base",
      singlePayment: { udi: 90000, mxn: 4000000, targetAge: 65 },
      monthlyIncome: { udi: 600, mxn: 27000, targetAge: 65 },
      annualIncome: { udi: 7200, mxn: 324000, targetAge: 65 },
      accumulatedIncome: [{ toAge: 75, udi: 120000, mxn: 5400000 }],
    }],
  },
  { type: "missing_information", missing: ["Falta escenario desfavorable"] },
];

const imaginaCalculation = {
  productFamily: "Imagina Ser",
  product: "Imagina Ser 65",
  nativeResult: { benefitSummary: imaginaBenefitSummary },
  productIntelligence: {
    schema: { id: "forge.product_intelligence.imagina_ser", version: "R13" },
    identity: { detected_product_name: "Imagina Ser 65", product_version: "2026" },
    ownership: { canonical_owner: "product-intelligence" },
    truth_status: "verified_with_missing_information",
    missing_information: ["Confirmar escenario desfavorable"],
  },
};

const imagina = createQuoteResultSnapshot({ calculation: imaginaCalculation });
assert.equal(imagina.dashboard.type, "imagina_ser");
assert.equal(imagina.identity.version, "2026");
assert.ok(imagina.dashboard.model.sections.some((section) => section.kind === "contribution"));
assert.ok(imagina.dashboard.model.sections.some((section) => section.kind === "construction"));
assert.ok(imagina.missingInformation.includes("Falta escenario desfavorable"));
assert.deepEqual(imagina.calculation, imaginaCalculation);
assert.notEqual(imagina.calculation, imaginaCalculation);
assert.equal(Object.isFrozen(imagina.calculation), true);
assert.equal(Object.isFrozen(imagina.productIntelligence), true);

const segubecaBenefitSummary = {
  blocks: [
    { type: "summary_plan", lines: [{ id: "product", label: "Producto", value: "SeguBeca" }] },
    { type: "participants", participant_modality: "joint", participants: {
      primary_insured: "Titular", joint_insured: "Contratante", child_or_education_beneficiary: "Menor",
    } },
    { type: "contribution_summary", lines: [{ id: "annual_premium", value: 2524.19, unit: "UDI" }] },
    { type: "education_goal", lines: [{ id: "target_amount", value: { udi: 30000, mxn: 264898 } }] },
    { type: "payout_options", lines: [{ id: "payout_mode", value: "Pago único o mensualidades" }] },
    { type: "protection_summary", lines: [{ id: "death_benefit", value: "Meta educativa protegida" }] },
  ],
};
const segubeca = createQuoteResultSnapshot({
  calculation: {
    productFamily: "segubeca",
    product: "SeguBeca 18",
    nativeResult: { benefitSummary: segubecaBenefitSummary },
  },
});
assert.equal(segubeca.dashboard.type, "segubeca");
assert.ok(segubeca.dashboard.model.sections.some((section) => section.kind === "participants"));
assert.ok(segubeca.dashboard.model.sections.some((section) => section.kind === "payout"));
assert.equal(segubeca.dashboard.model.hero.label, "Meta educativa");

const orviViewModel = {
  view_model_id: "orvi.dashboard.dynamic-protection-recovery-view-model.v1",
  canonical_owner: "product-intelligence",
  source_currency: "UDI",
  checkpoint_years: [10],
  navigation: [{ view_id: "protection", label: "Protección" }],
  views: {
    protection: {
      source_sum_assured: { value: "50,000 UDI" },
      current_mxn_equivalence: { value: "$441,497 MXN" },
    },
    future_protection: { checkpoints: [] },
    guaranteed_recovery: { checkpoints: [{
      policy_year: 10,
      current: { cumulative_paid: { value: "12,000 UDI" }, total_recovery: { value: "8,000 UDI" } },
      future: { cumulative_paid: { value: "$147,458 MXN" }, total_recovery: { value: "$118,887 MXN" } },
    }] },
  },
  rate_context: {
    key: "UDI_MXN",
    value: 8.82994,
    source: "BANXICO_SIE_API",
    source_date: "2026-06-10",
  },
  disclosure_contract: {
    recommendation: null,
    human_decision_required: true,
    future_values_are_guaranteed: false,
  },
};
const orvi = createQuoteResultSnapshot({
  calculation: {
    productFamily: "orvi",
    product: "ORVI 99",
    orviDashboardViewModel: orviViewModel,
    productIntelligence: {
      schema: { id: "forge.product_intelligence.orvi", version: "R15A" },
      identity: { detected_product_name: "ORVI 99", currency: "UDI" },
      ownership: { canonical_owner: "product-intelligence" },
      decision_scenarios: { human_decision_required: true },
    },
  },
});
assert.equal(orvi.dashboard.type, "orvi");
assert.equal(orvi.rateMetadata.key, "UDI_MXN");
assert.equal(orvi.rateMetadata.source, "BANXICO_SIE_API");
assert.equal(orvi.rateMetadata.date, "2026-06-10");
assert.equal(orvi.truthState.humanDecisionRequired, true);

const generic = createQuoteResultSnapshot({
  calculation: {
    productFamily: "vida",
    benefitSummary: {
      blocks: [{ type: "protection_summary", lines: [{ label: "Protección", value: "Vigente" }] }],
    },
  },
});
assert.equal(generic.dashboard.type, "generic");
assert.equal(generic.dashboard.model.sections[0].items[0].value, "Vigente");

const adapterSource = fs.readFileSync(
  new URL("../docs/static-preview/forge-alive-material3/quote-runtime-adapter.js", import.meta.url),
  "utf8",
);
assert.match(adapterSource, /getCalculation\(\)/);
assert.match(adapterSource, /getProductIntelligence\(\)/);
assert.match(adapterSource, /getBenefitSummary\(\)/);
assert.match(adapterSource, /getProductDashboardModel\(\)/);
assert.match(adapterSource, /getRateMetadata\(\)/);
assert.match(adapterSource, /getMissingInformation\(\)/);
assert.match(adapterSource, /getTruthState\(\)/);
assert.doesNotMatch(adapterSource, /DOMParser|importNode|nueva-cotizacion\/index\.html/);

console.log("UI-M05C Product Intelligence presentation parity: PASS");
