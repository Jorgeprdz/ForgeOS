import test from "node:test";
import assert from "node:assert/strict";
import { deriveActivityMetricSuggestions } from "../docs/static-preview/forge-aura/activity/activity-daily-confirmation.js";

test("daily confirmation suggestions use only semantically safe current-day facts and leave unknowns unknown", () => {
  const result = deriveActivityMetricSuggestions({
    generatedAt: "2026-08-07T16:00:00Z",
    timeZone: "America/Mexico_City",
    activity: { current: { chartReady: { series: [
      { seriesId: "activity-series:CONVERSATION_COMPLETED", points: [{ x: "2026-08-06", value: 9 }, { x: "2026-08-07", value: 4 }] },
      { seriesId: "activity-series:INITIAL_APPOINTMENT_SCHEDULED", points: [{ x: "2026-08-07", value: 2 }] },
      { seriesId: "activity-series:CLOSING_APPOINTMENT_SCHEDULED", points: [{ x: "2026-08-07", value: 1 }] },
      { seriesId: "activity-series:INITIAL_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 1 }] },
      { seriesId: "activity-series:CLOSING_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 2 }] },
    ] } } },
  });
  assert.equal(result.activityDate, "2026-08-07");
  assert.equal(result.counts.llamadas, null, "REP conversation facts must not be relabeled as calls");
  assert.equal(result.counts.citas_agendadas.value, 3);
  assert.equal(result.counts.citas_iniciales.value, 1);
  assert.equal(result.counts.citas_cierre.value, 2);
  assert.equal(result.counts.referidos, null);
  assert.equal(result.counts.polizas_pagadas, null);
});
