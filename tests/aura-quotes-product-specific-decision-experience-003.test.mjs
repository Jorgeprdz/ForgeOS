import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildProductSpecificDecisionReadModel,
  __productSpecificDecisionReadModelTest,
} from "../docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const read = (relative) => fs.readFileSync(path.join(repo, relative), "utf8");

const decisionSource = read("docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js");
const adapterSource = read("docs/static-preview/forge-aura/quotes/quotes-adapter.js");
const moduleSource = read("docs/static-preview/forge-aura/quotes/quotes-module.js");

for (const authority of [
  "forge-imagina-ser-product-dashboard-adapter.js",
  "forge-orvi-product-dashboard-adapter.js",
  "forge-segubeca-product-dashboard-adapter.js",
  "forge-vida-mujer-product-dashboard-adapter.js",
]) {
  assert.match(decisionSource, new RegExp(authority.replaceAll(".", "\\.")), `missing authority import: ${authority}`);
}

assert.match(adapterSource, /buildProductSpecificDecisionReadModel/);
assert.match(adapterSource, /productDecision/);
assert.match(moduleSource, /viewModel\?\.productDecision\?\.hero/);
assert.match(moduleSource, /data-product-specific-sections/);
assert.match(moduleSource, /Read model product-specific/);
assert.doesNotMatch(moduleSource, /quote-runtime\//, "Aura renderer must not import productive quote runtime directly");
assert.doesNotMatch(moduleSource, /forge-alive-material3|material 3/i, "Aura renderer must remain visually independent from Material 3");

const premiumTruth = adapterSource.indexOf("premium.total_annual_premium");
const calculationAlias = adapterSource.indexOf("calculation?.annualPremium");
assert.ok(premiumTruth >= 0 && calculationAlias >= 0 && premiumTruth < calculationAlias,
  "source-backed premium structure must outrank calculation annualPremium alias");

for (const forbiddenRealPdfValue of ["4295.04", "135000", "3080.09", "57500", "147486"]) {
  assert.equal(
    decisionSource.includes(forbiddenRealPdfValue) || adapterSource.includes(forbiddenRealPdfValue) || moduleSource.includes(forbiddenRealPdfValue),
    false,
    `production must not hardcode audit PDF value ${forbiddenRealPdfValue}`,
  );
}

const segubecaSummary = [
  {
    type: "summary_plan",
    title: "Resumen del plan",
    lines: [{ id: "plan", label: "Plan", value: "SeguBeca 18" }],
  },
  {
    type: "participants",
    title: "Participantes",
    lines: [{ id: "child", label: "Menor asociado", value: "Persona menor de edad" }],
  },
  {
    type: "contribution_summary",
    title: "Lo que aportas",
    lines: [{ id: "total_annual_premium", label: "Prima anual total", value: { udi: 2524.19 } }],
  },
  {
    type: "education_payout",
    title: "Meta educativa",
    lines: [{ id: "education_goal", label: "Meta educativa", value: { udi: 30000 } }],
  },
  {
    type: "payout_options",
    title: "Cómo se entrega",
    lines: [{ id: "delivery", label: "Entrega", value: "48 mensualidades" }],
  },
  {
    type: "protection_summary",
    title: "Lo que proteges",
    lines: [{ id: "bait_sum_assured", label: "Suma asegurada BAIT", value: { udi: 60000 } }],
  },
];

const segubeca = buildProductSpecificDecisionReadModel({
  calculation: { productFamily: "segubeca", product: "SeguBeca" },
  benefitSummary: segubecaSummary,
});
assert.equal(segubeca?.productType, "segubeca");
assert.equal(segubeca?.hero?.sourceSection, "education_goal");
assert.match(String(segubeca?.hero?.label), /Meta educativa/i);
assert.match(String(segubeca?.hero?.value), /30[,.]?000|30000/);
assert.doesNotMatch(String(segubeca?.hero?.value), /60[,.]?000|60000/);
assert.ok(segubeca?.buckets?.summary?.some((section) => section.kind === "education_goal"));
assert.ok(segubeca?.buckets?.summary?.some((section) => section.kind === "participants"));

const orviHero = __productSpecificDecisionReadModelTest.explicitOrviHero({
  sections: [{
    kind: "protection",
    items: [{
      id: "contracted_protection",
      role: "primary",
      label: "Protección contratada",
      value: "135,000 UDI",
      secondaryLabel: "Equivalencia actual",
      secondaryValue: "$1,000,000 MXN",
    }],
  }],
});
assert.equal(orviHero?.sourceSection, "protection");
assert.equal(orviHero?.value, "135,000 UDI");

const orviMandatory = __productSpecificDecisionReadModelTest.mandatoryFacts({
  packet: { annualPremium: 0 },
  calculation: {
    annualPremium: 0,
    nativeResult: { annualPremium: 0, totalAnnualPremium: 0 },
  },
  productIntelligence: {
    premium_structure: { total_annual_premium: 4295.04 },
  },
  model: { sections: [] },
});
assert.equal(orviMandatory.annualContribution?.value, 4295.04,
  "Product Intelligence premium structure must beat generic zero aliases");

const imagina = buildProductSpecificDecisionReadModel({
  calculation: { productFamily: "imagina_ser", product: "Imagina Ser" },
  benefitSummary: [
    {
      type: "contribution_summary",
      title: "Lo que aportas",
      lines: [{ id: "annual_contribution", label: "Aportación anual", value: { udi: 1200 } }],
    },
    {
      type: "protection_summary",
      title: "Lo que proteges",
      lines: [{ id: "sum_assured", label: "Suma asegurada", value: { udi: 100000 } }],
    },
    {
      type: "retirement_scenarios",
      title: "Escenarios",
      scenarios: [{ id: "base", label: "Base", singlePayment: { udi: 150000 } }],
    },
  ],
});
assert.equal(imagina?.productType, "imagina_ser");
assert.ok(imagina?.hero, "Imagina Ser must keep its existing product-specific hero");
assert.ok(imagina?.buckets?.projection?.some((section) => section.kind === "construction"));

const vida = buildProductSpecificDecisionReadModel({
  calculation: { productFamily: "vida_mujer", product: "Vida Mujer" },
  benefitSummary: [
    {
      type: "contribution_summary",
      title: "Lo que aportas",
      rows: [{ label: "Prima anual", value: "3,000 UDI" }],
    },
    {
      type: "protection_summary",
      title: "Lo que proteges",
      rows: [{ label: "Fallecimiento", value: "50,000 UDI" }],
    },
    {
      type: "scheduled_endowments",
      title: "Dotales por supervivencia",
      rows: [{ label: "Calendario", value: "Según tabla contractual" }],
    },
    {
      type: "women_health_benefits",
      title: "Protección para la mujer",
      rows: [{ label: "PCF", value: "Amparado" }],
    },
  ],
});
assert.equal(vida?.productType, "vida_mujer");
assert.ok(vida?.buckets?.projection?.some((section) => section.kind === "scheduled_endowments"));
assert.ok(vida?.buckets?.benefits?.some((section) => section.kind === "women_health_benefits"));

console.log("PASS aura quotes product-specific decision experience 003");
