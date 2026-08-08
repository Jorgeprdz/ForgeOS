import test from "node:test";
import assert from "node:assert/strict";
import { deriveActivityMetricSuggestions } from "../docs/static-preview/forge-aura/activity/activity-daily-confirmation.js";

test("daily reconciliation reuses exact current-day Activity facts and leaves external truths unknown", () => {
  const result = deriveActivityMetricSuggestions({
    generatedAt: "2026-08-07T16:00:00Z",
    timeZone: "America/Mexico_City",
    activity: {
      current: {
        report: { state: "READY" },
        chartReady: { series: [
          { seriesId: "activity-series:CONVERSATION_COMPLETED", points: [{ x: "2026-08-07", value: 4 }] },
          { seriesId: "activity-series:INITIAL_APPOINTMENT_SCHEDULED", points: [{ x: "2026-08-07", value: 2 }] },
          { seriesId: "activity-series:CLOSING_APPOINTMENT_SCHEDULED", points: [{ x: "2026-08-07", value: 1 }] },
          { seriesId: "activity-series:INITIAL_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 1 }] },
          { seriesId: "activity-series:CLOSING_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 2 }] },
        ] },
      },
      pointFacts: {
        state: "READY",
        facts: [
          { eventType: "REFERRAL_RECEIVED", eventReference: "evt_ref", occurredAt: "2026-08-07T14:00:00Z" },
          { eventType: "CALL_COMPLETED", eventReference: "evt_call", occurredAt: "2026-08-07T15:00:00Z" },
        ],
      },
    },
  });

  assert.equal(result.activityDate, "2026-08-07");
  assert.equal(result.counts.referidos.value, 1);
  assert.equal(result.counts.referidos.state, "OBSERVED");
  assert.equal(result.counts.llamadas.value, 1, "conversation aggregates must not be relabeled as calls");
  assert.equal(result.counts.llamadas.state, "OBSERVED");
  assert.equal(result.counts.citas_agendadas.value, 3);
  assert.equal(result.counts.citas_agendadas.state, "OBSERVED");
  assert.equal(result.counts.citas_iniciales.value, 1);
  assert.equal(result.counts.citas_cierre.value, 2);
  assert.equal(result.counts.solicitudes_firmadas, null);
  assert.equal(result.counts.polizas_pagadas, null);
});
