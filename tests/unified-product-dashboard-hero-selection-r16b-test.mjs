import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { buildImaginaSerDashboardModel } from "../docs/static-preview/quote-runtime/forge-imagina-ser-product-dashboard-adapter.js";
import { buildSegubecaDashboardModel } from "../docs/static-preview/quote-runtime/forge-segubeca-product-dashboard-adapter.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [renderer, layout, orviAdapter, intakeState] = await Promise.all([
  read("docs/static-preview/quote-runtime/forge-benefit-summary-renderer.js"),
  read("docs/static-preview/quote-runtime/forge-benefit-summary-layout.js"),
  read("docs/static-preview/quote-runtime/forge-orvi-product-dashboard-adapter.js"),
  read("docs/static-preview/quote-runtime/forge-quote-intake-state.js"),
]);

const segubecaGoal = buildSegubecaDashboardModel([
  { type: "summary_plan", lines: [{ id: "product", value: "SeguBeca sintético" }] },
  { type: "education_goal", lines: [{ id: "target_amount", value: { udi: 30000, mxn: 260000 } }] },
]);
assert.equal(segubecaGoal.hero.label, "Meta educativa");
assert.equal(segubecaGoal.hero.sourceField, "target_amount");
assert.notEqual(segubecaGoal.hero.label, "Suma asegurada");

const segubecaSumAssured = buildSegubecaDashboardModel([
  { type: "summary_plan", lines: [{ id: "sum_assured", value: { udi: 40000 } }] },
  { type: "contribution_summary", lines: [{ id: "annual_premium", value: { udi: 1000 } }] },
  { type: "education_goal", lines: [{ id: "target_amount", value: { udi: 30000 } }] },
]);
assert.equal(segubecaSumAssured.hero.label, "Suma asegurada");
assert.equal(segubecaSumAssured.hero.sourceField, "sum_assured");
assert.notEqual(segubecaSumAssured.hero.sourceField, "annual_premium");

const imagina = buildImaginaSerDashboardModel([
  { type: "protection_summary", lines: [{ id: "sum_assured_udi", label: "Suma asegurada", value: 75000, unit: "UDI" }] },
  { type: "contribution_summary", lines: [{ id: "total_contributed_udi", value: 12000, unit: "UDI" }] },
]);
assert.equal(imagina.hero.label, "Suma asegurada");
assert.equal(imagina.hero.sourceField, "sum_assured_udi");

const imaginaGoal = buildImaginaSerDashboardModel([
  { type: "retirement_scenarios", scenarios: [{ id: "base", label: "Base", singlePayment: { udi: 90000 } }] },
]);
assert.equal(imaginaGoal.hero.label, "Meta patrimonial");
assert.equal(imaginaGoal.hero.sourceField, "base_goal");

assert.match(orviAdapter, /role:\s*"primary"[\s\S]*?label:\s*"Suma asegurada"/);
assert.doesNotMatch(orviAdapter, /forgeUnifiedGrid/);

assert.match(renderer, /function canonicalHeroFromRows\(rows\)/);
assert.match(renderer, /key\.includes\("suma asegurada"\)/);
assert.match(renderer, /key\.includes\("prima"\) \|\| key\.includes\("recomendad"\)/);
assert.match(renderer, /if \(hero\) \{[\s\S]*?createDashboardHeroMetric/);
assert.match(renderer, /productType:\s*isVidaMujerDashboard/);

assert.match(layout, /data-forge-unified-grid="true"/);
assert.match(layout, /repeat\(12, minmax\(0, 1fr\)\)/);
assert.match(layout, /repeat\(8, minmax\(0, 1fr\)\)/);
assert.match(layout, /grid-template-columns:\s*minmax\(0, 1fr\)\s*!important/);
assert.match(layout, /align-items:\s*stretch\s*!important/);
assert.match(layout, /fq-benefit-hero-value-r16b/);
assert.match(layout, /fq-benefit-compact-metadata-r16b/);

assert.match(intakeState, /results\.hidden = !ready/);
assert.match(intakeState, /submit\.hidden = !ready/);

console.log("PASS R16B cross-product hero selection and aligned grid contract", {
  orviHero: "Suma asegurada",
  segubecaHeroWithoutSumAssured: "Meta educativa",
  imaginaSerHero: "Suma asegurada",
  vidaMujerExplicitOnly: true,
  genericFallbackInventedHero: false,
  desktopColumns: 12,
  tabletColumns: 8,
  mobileColumns: 1,
});
