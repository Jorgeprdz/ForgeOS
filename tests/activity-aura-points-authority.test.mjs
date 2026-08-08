import test from "node:test";
import assert from "node:assert/strict";
import { DAILY_POINTS_RULES } from "../daily-points-engine.js";
import {
  calculateActivityPoints,
  REQUIRED_POINT_METRICS,
} from "../platform/productivity/activity-points-authority-adapter.mjs";
import {
  pointRuleRows,
  projectOfficialActivityPoints,
  recommendOfficialActivityActions,
} from "../docs/static-preview/forge-aura/activity/activity-points-projection.js";

const envelope = (value, ref, evidenceState = "CONFIRMED") => ({
  value,
  completeness: "COMPLETE",
  evidenceState,
  metricOwner: "PRODUCTIVITY",
  sourceRefs: [ref],
});

function completeCounts(values = {}) {
  return Object.fromEntries(REQUIRED_POINT_METRICS.map(key => [
    key,
    envelope(values[key] ?? 0, `evidence:${key}`),
  ]));
}

test("Aura reads point rules only through the approved Productivity adapter", () => {
  const projection = projectOfficialActivityPoints({});
  assert.equal(projection.state, "INCOMPLETE");
  assert.equal(projection.total, null);
  assert.deepEqual(projection.weights, DAILY_POINTS_RULES);
  assert.equal(projection.authority.authoritySource, "daily-points-engine.js");
  assert.deepEqual(pointRuleRows(projection).map(row => row.metricKey), Object.keys(DAILY_POINTS_RULES));
});

test("missing evidence never becomes zero", () => {
  const score = calculateActivityPoints({ counts: { llamadas: envelope(3, "fes:calls", "OBSERVED") } });
  assert.equal(score.state, "INCOMPLETE");
  assert.equal(score.total, null);
  assert.equal(score.remaining, null);
  assert.ok(score.missingOrIncompleteMetrics.includes("referidos"));
  assert.ok(score.missingOrIncompleteMetrics.includes("polizas_pagadas"));
});

test("complete evidence delegates scoring to the official engine", () => {
  const score = calculateActivityPoints({
    counts: completeCounts({ llamadas: 5, solicitudes_firmadas: 2, polizas_pagadas: 1 }),
  });
  assert.equal(score.state, "READY");
  assert.equal(score.total, 25);
  assert.equal(score.objective, 25);
  assert.equal(score.remaining, 0);
});

test("next-action combination comes from official rules and only exposes manual Activity actions", () => {
  const projection = projectOfficialActivityPoints({
    activityPointsInput: {
      counts: completeCounts({
        referidos: 2,
        llamadas: 3,
        citas_agendadas: 1,
        citas_iniciales: 3,
      }),
    },
  });
  assert.equal(projection.state, "READY");
  assert.equal(projection.total, 18);
  assert.equal(projection.remaining, 7);
  const recommendation = recommendOfficialActivityActions(projection);
  assert.ok(recommendation);
  assert.equal(recommendation.totalPoints, 7);
  assert.equal(recommendation.exact, true);
  assert.ok(recommendation.actions.every(action => ["referidos", "llamadas", "citas_agendadas", "citas_iniciales", "citas_cierre"].includes(action.metricKey)));
  assert.equal(recommendation.actions.some(action => ["solicitudes_firmadas", "polizas_pagadas", "referido_asesor"].includes(action.metricKey)), false);
  assert.equal(recommendation.decisionBoundary.includes("Tú decides"), true);
});
