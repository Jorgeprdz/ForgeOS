import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const evidence = require("../platform/event-evidence/recommendation-presentation-evidence.js");
const { createAuraPresentationEvidenceControl } = await import("../docs/static-preview/forge-aura/home/home-presentation-evidence-017e.js");

const advisor = "advisor-017e";
const item = Object.freeze({
  decisionReference: "nash:person-017e:call",
  sourceAuthority: "FIP_NASH_NEXT_BEST_ACTION",
  sourceDomain: "NASH",
  subject: Object.freeze({ type: "PERSON", reference: "person-017e" }),
});

function runtime({ syncFailure = false } = {}) {
  const entries = [];
  return {
    entries,
    async listEntries() { return entries; },
    async syncOnce() { if (syncFailure) throw Object.assign(new Error("SYNC_DOWN"), { code: "SYNC_DOWN" }); return { push_failed: false }; },
    async appendCanonicalEvent(input) { entries.push({ canonical_event: input.canonical_event }); return { status: "APPENDED" }; },
    async close() {},
  };
}

function control(mockRuntime, times = ["2026-08-11T18:00:00Z"]) {
  let index = 0;
  return createAuraPresentationEvidenceControl({
    client: {},
    user: { id: advisor },
    runtime: mockRuntime,
    authorityLoader: async () => ({ evidence }),
    clock: () => times[Math.min(index++, times.length - 1)],
  });
}

test("canonical presentation is SYSTEM_OBSERVED and never claims viewed or acted", async () => {
  const mock = runtime();
  const result = await control(mock).present(item);
  assert.equal(result.event.event_type, "RECOMMENDATION_PRESENTED");
  assert.equal(result.event.tenant_id, advisor);
  assert.equal(result.event.actor.type, "SYSTEM");
  assert.equal(result.event.source.type, "SYSTEM_OBSERVED");
  assert.equal(result.event.subject.type, "RECOMMENDATION");
  assert.equal(result.event.payload.recommendation_reference, item.decisionReference);
  assert.equal(result.recommendationPresented, true);
  assert.equal(result.recommendationViewed, false);
  assert.equal(result.activityExecuted, false);
  assert.equal(result.outcomeCreated, false);
});

test("refresh and module return replay the first canonical presentation timestamp", async () => {
  const mock = runtime();
  const c = control(mock, ["2026-08-11T18:00:00Z", "2026-08-11T19:00:00Z"]);
  const first = await c.present(item);
  const second = await c.present(item);
  assert.equal(mock.entries.length, 1);
  assert.equal(second.result.status, "IDEMPOTENT_REPLAY");
  assert.equal(second.event.event_id, first.event.event_id);
  assert.equal(second.event.occurred_at, first.event.occurred_at);
});

test("a materially new recommendation version is eligible for a new presentation", async () => {
  const mock = runtime();
  const c = control(mock, ["2026-08-11T18:00:00Z", "2026-08-11T19:00:00Z"]);
  await c.present({ ...item, recommendationVersion: "v1" });
  await c.present({ ...item, recommendationVersion: "v2" });
  assert.equal(mock.entries.length, 2);
  assert.notEqual(mock.entries[0].canonical_event.event_id, mock.entries[1].canonical_event.event_id);
});

test("advisor identity participates in canonical presentation identity", () => {
  const a = evidence.presentationIdentity({ advisorId: "advisor-a", recommendationId: "rec-1", recommendationVersion: null });
  const b = evidence.presentationIdentity({ advisorId: "advisor-b", recommendationId: "rec-1", recommendationVersion: null });
  assert.notEqual(a, b);
});

test("canonical state sync failure before first append fabricates no presentation", async () => {
  const mock = runtime({ syncFailure: true });
  await assert.rejects(() => control(mock).present(item), /AURA_PRESENTATION_CANONICAL_STATE_UNAVAILABLE/);
  assert.equal(mock.entries.length, 0);
});