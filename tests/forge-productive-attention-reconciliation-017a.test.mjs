import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildProductiveSmartWidgetStack } from "../advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs";
import { projectProductiveSmartWidgetStack } from "../platform/attention/forge-home-attention-source-adapters.js";
import { composeHomeAttention } from "../platform/attention/forge-home-attention-composition.js";

const NOW = "2026-08-28T16:00:00-06:00";
const ADVISOR = "advisor-017a";

function governedSources() {
  return {
    activity: {
      sourceConnected: false,
      sourceComplete: false,
      blockedReason: "MICK_ACTIVITY_SCORING_SNAPSHOT_NOT_CONNECTED_TO_AURA_HOME",
    },
    monthlyGoal: {
      sourceConnected: true,
      sourceComplete: true,
      goalSnapshot: { yearMonth: "2026-08", targetPolicyCount: 10, evidenceRef: "goal-aug" },
      policyFacts: [
        { eventType: "POLICY_SOLD_CONFIRMED", policyId: "P1", soldAt: "2026-08-03T10:00:00-06:00", evidenceRef: "policy:P1" },
      ],
    },
    policyService: {
      sourceConnected: true,
      sourceComplete: true,
      radarSnapshot: {
        signals: [{ signalType: "OVERDUE_CONFIRMED", evidenceRefs: ["policy:P2:overdue"] }],
      },
    },
    opportunities: {
      sourceConnected: false,
      sourceComplete: false,
      blockedReason: "PIPELINE_BITACORA_SIGNAL_MAPPING_NOT_CONNECTED",
    },
    income: { sourceConnected: false, sourceComplete: false },
  };
}

test("017A source boundary reconnects only governed owners and keeps missing authorities blocked", async () => {
  const adapter = await readFile(new URL("../docs/static-preview/forge-aura/home/home-adapter-pages-v3-015.js", import.meta.url), "utf8");
  const pagesWorkflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  const pagesClosure = await readFile(new URL("../scripts/prepare-forge-alive-pages-runtime-closure.mjs", import.meta.url), "utf8");
  assert.match(adapter, /buildProductiveSmartWidgetStack/);
  assert.match(adapter, /projectProductiveSmartWidgetStack/);
  assert.match(adapter, /composeHomeAttention/);
  assert.match(adapter, /ADVISOR_MONTHLY_POLICY_GOAL/);
  assert.match(adapter, /PRODUCTION_EVENTS/);
  assert.match(adapter, /CARTERA_050_FUTURE_RADAR/);
  assert.match(adapter, /MICK_ACTIVITY_SCORING_SNAPSHOT_NOT_CONNECTED_TO_AURA_HOME/);
  assert.match(adapter, /PIPELINE_BITACORA_SIGNAL_MAPPING_NOT_CONNECTED/);
  assert.doesNotMatch(adapter, /rankProductiveSmartWidgets/);
  assert.match(pagesWorkflow, /'\.mjs'/);
  assert.match(pagesClosure, /rewriteAuraAlfredConsumers/);
  assert.match(pagesClosure, /FORGE_ALIVE_PAGES_AURA_ALFRED_SOURCE_NAMESPACE_LEAK/);
});

test("017A many governed signals retain one primary, at most two supporting, evidence and hard priority", async () => {
  const stack = await buildProductiveSmartWidgetStack({
    now: NOW,
    session: { status: "AUTHENTICATED", advisorId: ADVISOR },
    sources: governedSources(),
  });
  assert.equal(stack.visible.length, 2);
  assert.equal(stack.supporting.length, 1);
  assert.equal(stack.primary.widgetId, "forge-policy-service-risk");
  assert.ok(stack.primary.evidence.includes("policy:P2:overdue"));

  const bundle = projectProductiveSmartWidgetStack({ advisorReference: ADVISOR, stack });
  const attention = composeHomeAttention({ advisorReference: ADVISOR, projectionBundle: bundle, sourceState: stack.stackStatus, asOf: NOW });
  assert.equal(attention.items.length, stack.visible.length);
  assert.deepEqual(attention.provenance.sourceOrder, stack.visible.map(item => item.widgetId));
  assert.equal(attention.items[0].sourceReference, stack.primary.widgetId);
  assert.equal(attention.boundaries.rankingPerformed, false);
  assert.equal(attention.boundaries.domainWrites, 0);
  assert.equal(attention.boundaries.automaticCommercialAction, false);
});

test("017A presentation renders attention units, keeps detail available and collapses Compass", async () => {
  const home = await readFile(new URL("../docs/static-preview/forge-aura/home/home-module.js", import.meta.url), "utf8");
  const compass = await readFile(new URL("../docs/static-preview/forge-aura/home/home-module-015.js", import.meta.url), "utf8");
  const ready = home.slice(home.indexOf("function renderReady"), home.indexOf("function renderError"));
  assert.match(ready, /renderBriefing\(snapshot\)/);
  assert.match(ready, /renderSupportingAttention\(snapshot\)/);
  assert.match(ready, /renderDetailNavigation\(\)/);
  assert.doesNotMatch(ready, /renderAgenda\(/);
  assert.doesNotMatch(ready, /renderCartera\(/);
  assert.doesNotMatch(ready, /renderRhythm\(/);
  assert.doesNotMatch(ready, /renderMick\(/);
  assert.match(home, /snapshot\.attention\.value\.items\.slice\(1, 3\)/);
  assert.match(home, /Ver por qué/);
  assert.match(compass, /<details class="commercial-compass-015"/);
  assert.match(compass, /<summary>Progreso y metas<\/summary>/);
});
