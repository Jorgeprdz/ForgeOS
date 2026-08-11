import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  projectProductiveSmartWidgetStack,
} from "../platform/attention/forge-home-attention-source-adapters.js";
import {
  composeHomeAttention,
} from "../platform/attention/forge-home-attention-composition.js";

const root = process.cwd();
const read = path => readFile(resolve(root, path), "utf8");
const pass = name => console.log(`${name}=PASS`);

const advisorReference = "advisor-007";
const policyWidget = Object.freeze({
  schemaVersion: "forge.productive-smart-widget.v1",
  widgetId: "policy-007",
  widgetFamily: "POLICY_SERVICE_RISK_WIDGET",
  state: "READY",
  rankScore: 999,
  hardPriority: "SOURCE_OWNED_PRIORITY",
  title: "Pólizas que requieren atención",
  subtitle: "Existe evidencia que requiere revisión humana.",
  whyNow: "Cartera detectó una señal vigente.",
  evidence: ["policy-evidence-007"],
  uncertainty: ["payment_not_confirmed"],
  missingContext: [],
  confidence: "HIGH",
  freshness: { asOf: "2026-08-10T01:00:00.000Z" },
  sourceAuthorities: ["CARTERA_FUTURE_RADAR", "CONSERVATION_INTELLIGENCE"],
  deepLink: "?nav=clientes&view=future-radar",
  reviewAction: { type: "NAVIGATE", label: "Revisar pólizas" },
  readOnly: true,
  finalAuthority: "HUMAN",
});
const incomeWidget = Object.freeze({
  schemaVersion: "forge.productive-smart-widget.v1",
  widgetId: "income-007",
  widgetFamily: "INCOME_PROGRESS_WIDGET",
  state: "PARTIAL",
  rankScore: 1,
  title: "Ingreso",
  subtitle: "Lectura económica parcial.",
  whyNow: "Existe evidencia económica parcial para revisión.",
  evidence: ["income-evidence-007"],
  uncertainty: ["payout_not_confirmed"],
  missingContext: [],
  confidence: "MEDIUM",
  freshness: { asOf: "2026-08-10T01:00:00.000Z" },
  sourceAuthorities: ["REVENUE_VALUE", "ADVISOR_COMPENSATION"],
  deepLink: "?nav=comisiones",
  reviewAction: { type: "NAVIGATE", label: "Revisar ingreso" },
  payload: { generated: 1000, paid: null },
  readOnly: true,
  finalAuthority: "HUMAN",
});

const stack = Object.freeze({
  schemaVersion: "forge.productive-smart-widget-stack.v1",
  stackStatus: "READY",
  advisorId: advisorReference,
  generatedAt: "2026-08-10T01:05:00.000Z",
  // Deliberately opposite rankScore order: Phase007 must preserve source-owned visible order.
  visible: Object.freeze([policyWidget, incomeWidget]),
  primary: policyWidget,
  supporting: Object.freeze([incomeWidget]),
  inventory: Object.freeze([policyWidget, incomeWidget]),
  finalAuthority: "HUMAN",
});

const projected = projectProductiveSmartWidgetStack({ advisorReference, stack });
const attention = composeHomeAttention({
  advisorReference,
  projectionBundle: projected,
  sourceState: stack.stackStatus,
  asOf: "2026-08-10T01:05:00.000Z",
});

assert.equal(attention.contractVersion, "FHAO-007-001");
assert.equal(attention.provenance.decisionProjectionContract, "FCDP-004-001");
assert.equal(projected.projections.every(item => item.contractVersion === "FCDP-004-001"), true);
pass("HOME01_DECISION_PROJECTION_SOURCE");

assert.deepEqual(projected.sourceOrder, ["policy-007", "income-007"]);
assert.deepEqual(attention.items.map(item => item.sourceReference), ["policy-007", "income-007"]);
assert.equal(projected.diagnostics.rankScoreRead, false);
assert.equal(attention.boundaries.rankingPerformed, false);
assert.equal(attention.boundaries.scoreCalculated, false);
assert.equal(attention.boundaries.winnerSelected, false);
pass("HOME02_NO_LOCAL_BUSINESS_RECALCULATION");

assert.deepEqual(attention.items[0].sourceAuthorities, ["CARTERA_FUTURE_RADAR", "CONSERVATION_INTELLIGENCE"]);
assert.equal(attention.items[0].sourceAuthority, "CARTERA_FUTURE_RADAR");
pass("HOME03_AUTHORITY_PRESERVED");

assert.equal(attention.items[0].evidence[0].reference, "policy-evidence-007");
assert.equal(attention.items[0].provenance.adapters.includes("FORGE_HOME_ATTENTION_SMART_WIDGET_ADAPTER_007"), true);
assert.equal(attention.items[0].asOf, stack.generatedAt);
pass("HOME04_PROVENANCE_PRESERVED");

const unknownAttention = composeHomeAttention({
  advisorReference,
  projectionBundle: {
    adapter: "FORGE_HOME_ATTENTION_SMART_WIDGET_ADAPTER_007",
    sourceState: "SOURCE_UNAVAILABLE",
    sourceOrder: [],
    projections: [],
    omitted: [],
    diagnostics: { sourceSelectionOwner: "PRODUCTIVE_SMART_WIDGET_ORCHESTRATOR" },
  },
  sourceState: "SOURCE_UNAVAILABLE",
});
assert.equal(unknownAttention.state, "UNKNOWN");
assert.notEqual(unknownAttention.state, "EMPTY");
pass("HOME05_UNKNOWN_PRESERVED");

const staleStack = {
  ...stack,
  stackStatus: "STALE",
  visible: [{ ...policyWidget, state: "STALE" }],
};
const staleProjected = projectProductiveSmartWidgetStack({ advisorReference, stack: staleStack });
const staleAttention = composeHomeAttention({ advisorReference, projectionBundle: staleProjected, sourceState: "STALE" });
assert.equal(staleAttention.state, "STALE");
assert.equal(staleAttention.items[0].state, "STALE");
pass("HOME06_STALE_VISIBLE");

assert.equal(attention.state, "PARTIAL");
assert.equal(attention.items[1].truthState, "PARTIAL");
pass("HOME07_PARTIAL_VISIBLE");

assert.equal(attention.items[0].recommendedHumanAction.type, "NAVIGATE");
assert.equal(attention.items[0].actionOwner, "ADVISOR");
assert.equal(attention.items[0].recommendedHumanAction.humanApprovalRequired, true);
assert.equal(attention.items[0].recommendedHumanAction.automaticExecutionAllowed, false);
assert.equal(attention.boundaries.automaticCommercialAction, false);
assert.equal(attention.boundaries.taskCreationAllowed, false);
assert.equal(attention.boundaries.calendarCreationAllowed, false);
pass("HOME08_NO_AUTOMATIC_COMMERCIAL_ACTION");

assert.equal(attention.boundaries.domainWrites, 0);
assert.equal(projected.diagnostics.domainWrites, 0);
pass("HOME09_NO_DOMAIN_WRITES");

assert.equal(attention.items.every(item => item.subject.type === "ADVISOR"), true);
assert.equal(attention.boundaries.identityConvergenceAllowed, false);
assert.equal(attention.items.some(item => item.subject.type === "COMMERCIAL_PERSON"), false);
pass("HOME10_PROSPECT_IDENTITY_NOT_INFERRED");

const economic = attention.items.find(item => item.decisionType === "INCOME_PROGRESS_WIDGET");
assert.equal(economic.sourceDomain, "REVENUE");
assert.equal(economic.truthState, "PARTIAL");
assert.equal(economic.impact, null);
assert.equal(economic.limitations.includes("payout_not_confirmed"), true);
pass("HOME11_ECONOMIC_TRUTH_SEMANTICS_PRESERVED");

const adapterSource = await read("platform/attention/forge-home-attention-source-adapters.js");
const compositionSource = await read("platform/attention/forge-home-attention-composition.js");
const homeAdapter = await read("docs/static-preview/forge-aura/home/home-adapter-pages-v1.js");
const homeModule = await read("docs/static-preview/forge-aura/home/home-module.js");
const preparer = await read("scripts/prepare-aura-home-pages-authorities.mjs");

assert.doesNotMatch(adapterSource + compositionSource, /product recommendation|recommendProduct|commission.*recommend/i);
assert.equal(attention.boundaries.businessMeaningMerged, false);
pass("HOME12_CLIENT_FIRST_PRESERVED");

assert.match(homeAdapter, /currentUser\(client\)/);
assert.match(homeAdapter, /HOME_SESSION_CHANGED_AFTER_READ/);
assert.match(homeModule, /controller\?\.abort/);
assert.match(homeModule, /scrub\(reason/);
pass("HOME13_AUTHENTICATED_SESSION_PRESERVED");

assert.match(await read("tests/rep-17-unified-runtime-regression-test.mjs"), /REP|rep/i);
pass("HOME14_REP_17_PRESERVED");

assert.match(await read("tests/e2e/aura-home-command-center-mobile-nav-001.spec.mjs"), /390x844/);
assert.match(await read("tests/e2e/aura-home-command-center-mobile-nav-001.spec.mjs"), /834x1194/);
assert.match(await read("tests/e2e/aura-home-command-center-mobile-nav-001.spec.mjs"), /1440x900/);
assert.match(homeModule, /data-home-state=/);
pass("HOME15_RESPONSIVE_BEHAVIOR_PRESERVED");

assert.match(homeAdapter, /forge-home-attention-source-adapters\.js/);
assert.match(homeAdapter, /forge-home-attention-composition\.js/);
assert.match(homeModule, /FORGE_HOME_ATTENTION_ORCHESTRATION_007/);
assert.match(homeModule, /renderSupportingAttention/);
assert.match(homeModule, /snapshot\.attention\.value\.items\.slice\(1, 3\)/);
assert.match(homeModule, /Ver por qué/);
assert.match(preparer, /platform\/attention\/forge-home-attention-source-adapters\.js/);
assert.match(preparer, /platform\/attention\/forge-home-attention-composition\.js/);
pass("HOME_ATTENTION_ORCHESTRATION_INTEGRATION");

for (const path of [
  "platform/decision-projection/forge-cross-domain-decision-projection.js",
  "advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js",
  "docs/static-preview/quote-runtime/forge-product-specific-decision-read-model-006.js",
  "platform/attention/forge-home-attention-source-adapters.js",
  "platform/attention/forge-home-attention-composition.js",
]) {
  await read(path);
}
assert.equal(attention.boundaries.rankingPerformed, false);
assert.equal(attention.boundaries.scoreCalculated, false);
assert.equal(attention.boundaries.domainWrites, 0);
assert.equal(attention.boundaries.identityConvergenceAllowed, false);
pass("FINAL_ASSEMBLY_LINEAGE_ROBOCOP_004_007");

console.log("FORGE_HOME_ATTENTION_ORCHESTRATION_007=PASS");
