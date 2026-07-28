import assert from "node:assert/strict";
import fs from "node:fs";
import { buildQuoteBenefitSummary } from "../quote-benefit-summary-engine.js";
import {
  createQuoteResultSnapshot,
} from "../docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js";

const summary = (product, blocks, extra = {}) => createQuoteResultSnapshot({
  calculation: {
    product,
    productFamily: product,
    nativeResult: { product, benefitSummary: blocks },
    ...extra,
  },
});

const imagina = summary("Imagina Ser", [{
  type: "retirement_scenarios",
  scenarios: [{ id: "base", label: "Base", singlePayment: { udi: 90000, mxn: 4000000 } }],
}]);
assert.equal(imagina.dashboard.type, "imagina_ser");

const segubeca = summary("Segubeca", [{
  type: "education_payout",
  lines: [{ id: "target_amount", label: "Meta educativa", value: { udi: 30000, mxn: 264898 } }],
}]);
assert.equal(segubeca.dashboard.type, "segubeca");

const orvi = createQuoteResultSnapshot({ calculation: {
  product: "ORVI",
  productFamily: "ORVI",
  orviDashboardViewModel: {
    view_model_id: "orvi.dashboard.dynamic-protection-recovery-view-model.v1",
    canonical_owner: "product-intelligence",
    source_currency: "UDI",
    checkpoint_years: [10],
    navigation: [{ view_id: "protection", label: "Protección" }],
    views: {
      protection: { source_sum_assured: { value: "50,000 UDI" }, current_mxn_equivalence: { value: "$441,497 MXN" } },
      future_protection: { checkpoints: [] },
      guaranteed_recovery: { checkpoints: [{
        policy_year: 10,
        current: { cumulative_paid: { value: "12,000 UDI" }, total_recovery: { value: "8,000 UDI" } },
        future: { cumulative_paid: { value: "$147,458 MXN" }, total_recovery: { value: "$118,887 MXN" } },
      }] },
    },
    disclosure_contract: {
      recommendation: null,
      human_decision_required: true,
      future_values_are_guaranteed: false,
    },
    rate_context: { key: "UDI_MXN", value: 8.82994, source: "BANXICO_SIE_API", source_date: "2026-06-10" },
  },
} });
assert.equal(orvi.dashboard.type, "orvi");

const vidaBlocks = buildQuoteBenefitSummary({
  productFamily: "Vida Mujer",
  product: "Vida Mujer",
  nativeResult: {
    product: "Vida Mujer",
    currency: "UDI",
    totalAnnualPremium: 3061.82,
    sumAssured: 50000,
    paymentYears: 20,
    coverages: [
      { name: "Vida Mujer (Vida Mujer)", sumAssured: 50000, annualPremium: 2926.93 },
      { name: "Protección por Cáncer Femenino (PCF A)", sumAssured: 50000, annualPremium: 67 },
    ],
    recommendedCoverages: [
      { name: "Protección para Complicaciones del Embarazo (PEP A)", sumAssured: 50000, annualPremium: 79.5 },
    ],
    guaranteedValues: [{
      age: 52,
      annualPremiumAccumulatedWithAve: 152136,
      aveSurrenderValue: 107486,
      cashValue: 40000,
      totalRecovery: 147486,
      basicSumAssured: 50000,
      recoveryPercentage: 96.94,
    }],
  },
  udiProjection: {
    rows: Array.from({ length: 20 }, (_, index) => ({
      year: index + 1,
      policyYear: index + 1,
      projectedUdiValue: 8.82994 * Math.pow(1.04, index),
    })),
  },
  currencyMetadata: { currentUdiValue: 8.82994 },
});
const vida = summary("Vida Mujer", vidaBlocks);
assert.equal(vida.dashboard.type, "vida_mujer");
for (const kind of [
  "contribution_summary",
  "protection_summary",
  "scheduled_endowments",
  "recovery_summary",
  "women_health_benefits",
  "recommended_benefits",
]) {
  assert.ok(vida.dashboard.model.sections.some((section) => section.kind === kind), `Vida Mujer conserva ${kind}`);
}
assert.ok(
  vida.dashboard.model.sections.find((section) => section.kind === "scheduled_endowments")
    .items.some((item) => /^Año /.test(item.label)),
  "Vida Mujer conserva el calendario de dotales como filas estructuradas",
);

const unknown = summary("Producto experimental", [{
  type: "protection_summary",
  lines: [{ label: "Protección", value: "Disponible" }],
}]);
assert.equal(unknown.dashboard.type, "generic");

const presenter = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js",
  "utf8",
);
const css = fs.readFileSync("docs/static-preview/forge-alive-material3/quotes-module.css", "utf8");
assert.match(presenter, /vida_mujer/);
assert.match(presenter, /Verificado con información pendiente/);
assert.match(presenter, /Fuente de validación:.*Product Intelligence/s);
assert.doesNotMatch(presenter, /target\.textContent = parts\.join\(" · "\)/);
assert.match(css, /grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
assert.match(css, /padding-bottom:calc\(150px \+ env\(safe-area-inset-bottom,0px\)\)/);
assert.match(css, /\[data-product-dashboard=vida_mujer\]/);
assert.match(css, /\[data-product-dashboard=segubeca\]/);
assert.match(css, /\[data-product-dashboard=orvi\]/);
assert.match(css, /\[data-product-dashboard=imagina_ser\]/);

console.log("UI-M05D multi-product presentation parity: PASS");
