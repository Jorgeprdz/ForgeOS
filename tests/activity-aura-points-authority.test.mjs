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
} from "../docs/static-preview/forge-aura/activity/activity-points-projection.js";

const envelope = (value, ref) => ({
  value,
  completeness: "COMPLETE",
  evidenceState: "CONFIRMED",
  metricOwner: "PRODUCTIVITY",
  sourceRefs: [ref],
});

test("Aura reads the official point rules through the approved safe adapter", () => {
  const projection = projectOfficialActivityPoints({});
  assert.equal(projection.state, "INCOMPLETE");
  assert.equal(projection.total, null);
  assert.equal(projection.objective, null);
  assert.deepEqual(projection.weights, DAILY_POINTS_RULES);
  assert.equal(projection.authority.authoritySource, "daily-points-engine.js");
  assert.deepEqual(pointRuleRows(projection).map(row => row.metricKey), Object.keys(DAILY_POINTS_RULES));
});

test("missing point evidence never becomes zero", () => {
  const score = calculateActivityPoints({
    counts: {
      llamadas: envelope(3, "fes:calls"),
    },
  });
  assert.equal(score.state, "INCOMPLETE");
  assert.equal(score.total, null);
  assert.equal(score.remaining, null);
  assert.ok(score.missingOrIncompleteMetrics.includes("referidos"));
  assert.ok(score.missingOrIncompleteMetrics.includes("polizas_pagadas"));
});

test("complete evidence delegates scoring to the official 25-point engine", () => {
  const values = Object.fromEntries(REQUIRED_POINT_METRICS.map(key => [key, 0]));
  values.llamadas = 5;
  values.solicitudes_firmadas = 2;
  values.polizas_pagadas = 1;
  const counts = Object.fromEntries(
    REQUIRED_POINT_METRICS.map(key => [key, envelope(values[key], `evidence:${key}`)]),
  );
  const score = calculateActivityPoints({ counts });
  assert.equal(score.state, "READY");
  assert.equal(score.total, 25);
  assert.equal(score.objective, 25);
  assert.equal(score.remaining, 0);
  assert.equal(score.breakdown.llamadas.points, 5);
  assert.equal(score.breakdown.solicitudes_firmadas.points, 10);
  assert.equal(score.breakdown.polizas_pagadas.points, 10);
});
