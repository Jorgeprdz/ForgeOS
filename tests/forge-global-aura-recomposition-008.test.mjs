import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CONTEXT_PARAMS,
  readRouteContext,
  routeUrl,
} from "../docs/static-preview/forge-aura/aura-router-v4.js";

const base = "https://example.test/ForgeOS/static-preview/forge-aura/index.html?route=inicio";
const contextual = routeUrl("pipeline", base, {
  source: "FORGE_HOME_ATTENTION_ORCHESTRATION_007",
  contract: "FHAO-007-001",
  decisionReference: "home-widget:test",
  sourceReference: "widget:test",
});

assert.equal(contextual.searchParams.get("route"), "pipeline");
assert.equal(contextual.searchParams.get(CONTEXT_PARAMS.source), "FORGE_HOME_ATTENTION_ORCHESTRATION_007");
assert.equal(contextual.searchParams.get(CONTEXT_PARAMS.contract), "FHAO-007-001");
assert.equal(contextual.searchParams.get(CONTEXT_PARAMS.decisionReference), "home-widget:test");
assert.equal(contextual.searchParams.get(CONTEXT_PARAMS.sourceReference), "widget:test");

const context = readRouteContext(contextual.href);
assert.deepEqual(context, {
  source: "FORGE_HOME_ATTENTION_ORCHESTRATION_007",
  contract: "FHAO-007-001",
  decisionReference: "home-widget:test",
  sourceReference: "widget:test",
});

const cleared = routeUrl("cartera", contextual.href);
for (const param of Object.values(CONTEXT_PARAMS)) assert.equal(cleared.searchParams.has(param), false);
assert.equal(cleared.searchParams.get("route"), "cartera");

const app = fs.readFileSync(new URL("../docs/static-preview/forge-aura/app-v4-r1.js", import.meta.url), "utf8");
const homeBridge = fs.readFileSync(new URL("../docs/static-preview/forge-aura/home/home-module-008.js", import.meta.url), "utf8");
const pipelineBridge = fs.readFileSync(new URL("../docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js", import.meta.url), "utf8");
const router = fs.readFileSync(new URL("../docs/static-preview/forge-aura/aura-router-v4.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../docs/static-preview/forge-aura/aura-recomposition-008.css", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../docs/static-preview/forge-aura/index.html", import.meta.url), "utf8");
const bootstrap = fs.readFileSync(new URL("../docs/static-preview/forge-aura/aura-bootstrap-v4-r1.js", import.meta.url), "utf8");

assert.ok(app.includes("home-module-008.js"));
assert.ok(app.includes("pipeline-consumer-bridge-008.js"));
assert.ok(app.includes("router.context()"));
assert.ok(app.includes("router.clearContext()"));
assert.ok(app.includes("CONTINUIDAD DE DECISIÓN"));
assert.ok(app.includes("aura-recomposition-008.css"));

assert.ok(homeBridge.includes("FORGE_HOME_ATTENTION_ORCHESTRATION_007"));
assert.ok(homeBridge.includes("FHAO-007-001"));
assert.ok(homeBridge.includes("decisionReference"));
assert.ok(homeBridge.includes("domainWrites: 0"));

assert.ok(pipelineBridge.includes("createPipelineAdapter"));
assert.ok(pipelineBridge.includes("adapter.intelligence(prospectId, { projections: [] })"));
assert.ok(pipelineBridge.includes("adapter?.capabilities?.intelligenceAvailable"));
assert.ok(pipelineBridge.includes("intelligenceCapability !== false"));
assert.ok(pipelineBridge.includes("FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A"));
assert.ok(pipelineBridge.includes("Prospect ≠ CommercialPerson"));
assert.ok(pipelineBridge.includes("localNbaPresentedAsAuthority: false"));
assert.ok(pipelineBridge.includes("calculatesPriority: false"));
assert.ok(pipelineBridge.includes("automaticExecutionAllowed: false"));
assert.ok(pipelineBridge.includes("Sin información adicional para decidir"));
assert.ok(pipelineBridge.includes('priority.textContent = "Orden anterior"'));
assert.equal(pipelineBridge.includes("createCrossDomainDecisionProjection"), false);
assert.equal(pipelineBridge.includes("nextBestAction("), false);
assert.equal(pipelineBridge.includes("attentionForRecord("), false);

for (const forbidden of [
  ".insert(",
  ".update(",
  ".delete(",
  "service_role",
  "create table",
  "create or replace function",
  "commissionRate",
  "probability *",
]) {
  assert.equal(pipelineBridge.toLowerCase().includes(forbidden.toLowerCase()), false, `forbidden Phase008 bridge behavior: ${forbidden}`);
}

assert.ok(router.includes("readRouteContext"));
assert.ok(router.includes("preserveContext"));
assert.ok(router.includes("clearContext"));
assert.ok(css.includes("var(--forge-brand-soft)"));
assert.ok(css.includes("var(--forge-border-subtle)"));
assert.match(index, /<script type="module" src="\.\/aura-bootstrap-v4-r1\.js\?v=[^"]+"><\/script>/);
assert.ok(bootstrap.includes('import("./app-v4-r1.js?v=aura-boot-cache-isolation-013-forge-global-aura-recomposition-008")'));

console.log("FORGE_GLOBAL_AURA_RECOMPOSITION_008=PASS");
