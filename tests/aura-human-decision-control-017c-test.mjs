import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createAuraDecisionControl } from "../docs/static-preview/forge-aura/home/home-decision-control-017c.js";

const require = createRequire(import.meta.url);
const evidence = require("../platform/event-evidence/sales-nba-advisor-response-evidence.js");

function item() { return { decisionReference: "home-widget:policy-risk", sourceAuthority: "CARTERA_050_FUTURE_RADAR", sourceDomain: "SERVICING", subject: { type: "ADVISOR", reference: "advisor-a" }, provenance: { decisionProjectionContract: "FCDP-004-001" } }; }
function harness({ failAppend = false } = {}) {
  const entries = [];
  let appendCalls = 0;
  const runtime = {
    async syncOnce() {},
    async listEntries() { return entries; },
    async appendCanonicalEvent({ canonical_event }) { appendCalls += 1; if (failAppend) throw new Error("FES_UNAVAILABLE"); entries.push({ canonical_event }); return { status: "APPENDED" }; },
    async close() {},
  };
  const authorityLoader = async () => ({ evidence: { ...evidence, async persistAdvisorDecision(input) { const event = evidence.createAdvisorDecisionEvidence(input); const result = await runtime.appendCanonicalEvent({ canonical_event: event }); return { event, result, activityExecuted: false, outcomeCreated: false }; } } });
  return { runtime, authorityLoader, entries, appendCalls: () => appendCalls };
}

test("Aura maps all four human intents to canonical FES decisions without action", async () => {
  const h = harness(); let tick = 0;
  const control = createAuraDecisionControl({ user: { id: "advisor-a" }, runtime: h.runtime, authorityLoader: h.authorityLoader, clock: () => `2026-08-11T12:00:0${tick++}.000Z` });
  await control.read();
  for (const [intent, expected] of [["ACCEPT", "ACCEPTED"], ["MODIFY", "MODIFIED"], ["DEFER", "DEFERRED"], ["DISMISS", "DISMISSED"]]) {
    const result = await control.decide(item(), intent);
    assert.equal(result.event.payload.decision, expected);
    assert.equal(result.activityExecuted, false);
    assert.equal(result.outcomeCreated, false);
  }
  assert.equal(h.entries[1].canonical_event.correction_of, h.entries[0].canonical_event.event_id);
});

test("rapid duplicate decision is one durable append and read-after-write survives recreation", async () => {
  const h = harness();
  const options = { user: { id: "advisor-a" }, runtime: h.runtime, authorityLoader: h.authorityLoader, clock: () => "2026-08-11T12:00:00.000Z" };
  const control = createAuraDecisionControl(options); await control.read();
  const [left, right] = await Promise.all([control.decide(item(), "ACCEPT"), control.decide(item(), "ACCEPT")]);
  assert.equal(left.event.event_id, right.event.event_id); assert.equal(h.appendCalls(), 1);
  const recreated = createAuraDecisionControl(options); const state = await recreated.read();
  assert.equal(state.get(item().decisionReference).payload.decision, "ACCEPTED");
});

test("advisor identity and source failure fail closed", async () => {
  const h = harness({ failAppend: true });
  const control = createAuraDecisionControl({ user: { id: "advisor-a" }, runtime: h.runtime, authorityLoader: h.authorityLoader }); await control.read();
  await assert.rejects(() => control.decide({ ...item(), subject: { type: "ADVISOR", reference: "advisor-b" } }, "ACCEPT"), /RECOMMENDATION_RESPONSE_ADVISOR_MISMATCH|AURA_DECISION/);
  await assert.rejects(() => control.decide(item(), "ACCEPT"), /FES_UNAVAILABLE/);
  assert.equal(control.latest(item().decisionReference), null);
});

test("Aura renderer and CSS preserve compact responsive hierarchy", async () => {
  const home = await readFile(new URL("../docs/static-preview/forge-aura/home/home-module.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../docs/static-preview/forge-aura/home/home.css", import.meta.url), "utf8");
  assert.match(home, /data-home-decision="ACCEPT"/); assert.match(home, /data-home-decision="MODIFY"/); assert.match(home, /data-home-decision="DEFER"/); assert.match(home, /data-home-decision="DISMISS"/);
  assert.match(home, /No pudimos guardar tu decisión/); assert.match(home, /decisionControl\.read/);
  assert.match(css, /flex-wrap:wrap/); assert.match(css, /max-width:480px/); assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/); assert.match(css, /focus-visible/);
  assert.doesNotMatch(home, /EXECUTED|acted\s*=\s*true|createTask|sendWhatsApp/);
});

test("Pages closure publishes the existing FES chain and the 017C adapter", async () => {
  const builder = await readFile(new URL("../scripts/prepare-forge-alive-pages-runtime-closure.mjs", import.meta.url), "utf8");
  for (const name of ["canonical-activity-event-contract.js", "activity-ledger-contract.js", "activity-ledger-local-store.js", "activity-ledger-sync-service.js", "activity-ledger-supabase-gateway.js", "activity-ledger-browser-runtime.js", "sales-nba-advisor-response-evidence.js"]) assert.match(builder, new RegExp(name.replaceAll(".", "\\.")));
});
