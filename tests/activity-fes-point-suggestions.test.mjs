import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { projectActivityPointFacts } from "../docs/static-preview/forge-alive-material3/activity-reports-productivity-runtime.js";
import { deriveActivityMetricSuggestions } from "../docs/static-preview/forge-aura/activity/activity-daily-confirmation.js";

const TODAY = "2026-08-07";

function event(event_id, event_type, occurred_at, extra = {}) {
  return {
    event_id,
    event_type,
    occurred_at,
    confirmation_state: "CONFIRMED",
    source: { reference: `source:${event_id}` },
    ...extra,
  };
}

test("canonical FES point projection counts only confirmed unsuperseded in-period facts", () => {
  const snapshot = {
    events: [
      event("evt_referral", "REFERRAL_RECEIVED", "2026-08-07T14:00:00.000Z"),
      event("evt_call_old", "CALL_COMPLETED", "2026-08-07T15:00:00.000Z"),
      event("evt_call_new", "CALL_COMPLETED", "2026-08-07T15:05:00.000Z", { correction_of: "evt_call_old" }),
      event("evt_advisor", "ADVISOR_REFERRAL_RECEIVED", "2026-08-07T16:00:00.000Z"),
      { ...event("evt_reported", "CALL_COMPLETED", "2026-08-07T17:00:00.000Z"), confirmation_state: "REPORTED" },
      event("evt_old_day", "CALL_COMPLETED", "2026-08-05T17:00:00.000Z"),
      event("evt_context", "ACTIVITY_CONTEXT_ADDED", "2026-08-07T18:00:00.000Z"),
    ],
  };

  const result = projectActivityPointFacts(snapshot, {
    from: TODAY,
    to: TODAY,
    timeZone: "America/Mexico_City",
  });

  assert.equal(result.state, "READY");
  assert.deepEqual(result.facts.map(row => row.eventType).sort(), [
    "ADVISOR_REFERRAL_RECEIVED",
    "CALL_COMPLETED",
    "REFERRAL_RECEIVED",
  ]);
  assert.ok(result.facts.some(row => row.eventReference === "evt_call_new"));
  assert.ok(!result.facts.some(row => row.eventReference === "evt_call_old"));
  for (const row of result.facts) {
    assert.deepEqual(Object.keys(row).sort(), ["eventReference", "eventType", "occurredAt", "sourceReference"]);
    assert.equal("payload" in row, false);
    assert.equal("subject" in row, false);
  }
});

test("Aura suggestions use exact FES fact semantics and preserve FES evidence references", () => {
  const suggestions = deriveActivityMetricSuggestions({
    generatedAt: "2026-08-07T16:00:00.000Z",
    timeZone: "America/Mexico_City",
    activity: {
      current: { chartReady: { series: [] } },
      pointFacts: {
        state: "READY",
        facts: [
          { eventType: "REFERRAL_RECEIVED", eventReference: "evt_referral", occurredAt: "2026-08-07T14:00:00.000Z", sourceReference: null },
          { eventType: "CALL_COMPLETED", eventReference: "evt_call", occurredAt: "2026-08-07T15:00:00.000Z", sourceReference: null },
          { eventType: "ADVISOR_REFERRAL_RECEIVED", eventReference: "evt_advisor", occurredAt: "2026-08-07T16:00:00.000Z", sourceReference: null },
        ],
      },
    },
  });

  assert.equal(suggestions.counts.referidos.value, 1);
  assert.deepEqual(suggestions.counts.referidos.sourceRefs, ["fes:evt_referral"]);
  assert.equal(suggestions.counts.llamadas.value, 1);
  assert.deepEqual(suggestions.counts.llamadas.sourceRefs, ["fes:evt_call"]);
  assert.equal(suggestions.counts.referido_asesor.value, 1);
  assert.deepEqual(suggestions.counts.referido_asesor.sourceRefs, ["fes:evt_advisor"]);
});

test("a READY canonical FES snapshot with no matching facts may suggest zero but never confirms it", () => {
  const suggestions = deriveActivityMetricSuggestions({
    generatedAt: "2026-08-07T16:00:00.000Z",
    timeZone: "America/Mexico_City",
    activity: {
      current: { chartReady: { series: [] } },
      pointFacts: { state: "READY", facts: [] },
    },
  });

  assert.equal(suggestions.counts.referidos.value, 0);
  assert.equal(suggestions.counts.llamadas.value, 0);
  assert.equal(suggestions.counts.referido_asesor.value, 0);
  assert.equal(suggestions.counts.referidos.state, "SUGGESTED");
});

test("bridge exposes canonical events only through the existing authenticated FES runtime", async () => {
  const source = await readFile("docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs", "utf8");
  assert.match(source, /readCanonicalSnapshot/);
  assert.match(source, /readCanonicalEvents\(\)/);
  assert.match(source, /ledger\.syncOnce\(\)/);
  assert.match(source, /ledger\.listEntries\(\)/);
  assert.doesNotMatch(source, /\.from\(["']activity_event_ledger["']\)/);
  assert.doesNotMatch(source, /supabase\.from\(/);
});
