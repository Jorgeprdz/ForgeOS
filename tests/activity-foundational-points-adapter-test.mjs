import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DAILY_POINTS_RULES } from "../daily-points-engine.js";
import {
  REQUIRED_POINT_METRICS,
  calculateActivityPoints,
  describeActivityPointsAuthority,
  evaluatePointCombination,
  findPointCombinations,
} from "../platform/productivity/activity-points-authority-adapter.mjs";

const envelope = (value, overrides = {}) => ({
  value,
  completeness: "COMPLETE",
  evidenceState: "CONFIRMED",
  sourceRefs: [`source-${value}`],
  metricOwner: "PRODUCTIVITY",
  ...overrides,
});
const zeroCounts = Object.fromEntries(
  REQUIRED_POINT_METRICS.map((key) => [key, envelope(0)]),
);

const authority = describeActivityPointsAuthority();
assert.equal(authority.state, "READY");
assert.equal(authority.objective, 25);
assert.deepEqual(authority.weights, DAILY_POINTS_RULES);
assert.equal(authority.boundaries.qualitativeLabelsExposed, false);

const zero = calculateActivityPoints({
  counts: zeroCounts,
  period: { from: "2026-08-05", to: "2026-08-05" },
  timezone: "America/Mexico_City",
});
assert.equal(zero.state, "READY");
assert.equal(zero.total, 0);
assert.equal(zero.confirmedMinimum, 0);
assert.equal(zero.remaining, 25);
assert.deepEqual(zero.weights, DAILY_POINTS_RULES);
assert.equal("momentum" in zero, false);
assert.equal("progreso" in zero, false);
for (const label of [
  "legendario",
  "elite",
  "muy_bien",
  "avanzando",
  "bajo_ritmo",
  "imparable",
  "fuerte",
  "estable",
  "debil",
]) {
  assert.equal(JSON.stringify(zero).includes(label), false);
}

const counts = structuredClone(zeroCounts);
counts.solicitudes_firmadas = envelope(1);
const five = calculateActivityPoints({
  counts,
  period: { from: "2026-08-05", to: "2026-08-05" },
  timezone: "America/Mexico_City",
});
assert.equal(five.total, DAILY_POINTS_RULES.solicitudes_firmadas);
assert.equal(five.remaining, 20);

const partialCounts = structuredClone(zeroCounts);
partialCounts.llamadas = envelope(3);
partialCounts.polizas_pagadas = envelope(null, {
  completeness: "UNKNOWN",
  evidenceState: "UNKNOWN",
});
const partial = calculateActivityPoints({ counts: partialCounts });
assert.equal(partial.state, "INCOMPLETE");
assert.equal(partial.total, null);
assert.equal(partial.remaining, null);
assert.equal(partial.confirmedMinimum, 3);
assert.equal(partial.boundaries.unknownTreatedAsZero, false);
assert.equal(partial.boundaries.confirmedMinimumIsLowerBound, true);
assert.ok(partial.missingOrIncompleteMetrics.includes("polizas_pagadas"));

const unknown = calculateActivityPoints({
  counts: {
    ...zeroCounts,
    referidos: envelope(null, {
      completeness: "INCOMPLETE",
      evidenceState: "UNKNOWN",
    }),
  },
});
assert.equal(unknown.state, "INCOMPLETE");
assert.equal(unknown.total, null);
assert.equal(unknown.remaining, null);
assert.ok(unknown.missingOrIncompleteMetrics.includes("referidos"));

const missing = { ...zeroCounts };
delete missing.llamadas;
assert.equal(calculateActivityPoints({ counts: missing }).state, "INCOMPLETE");

const combination = evaluatePointCombination(
  { llamadas: 3, citas_agendadas: 1 },
  5,
);
assert.equal(combination.totalPoints, 6);
assert.equal(combination.excessPoints, 1);
assert.equal(combination.exact, false);
assert.equal(combination.reachesTarget, true);
assert.ok(findPointCombinations(5).some((candidate) => candidate.totalPoints >= 5));

const conflicting = calculateActivityPoints({
  counts: zeroCounts,
  ruleSnapshot: {
    valid: false,
    state: "CONFLICTING",
    reference: "snapshot-conflict",
  },
});
assert.equal(conflicting.state, "CONFLICTING_RULE_AUTHORITY");
assert.equal(conflicting.total, null);

const matchingSnapshot = calculateActivityPoints({
  counts: zeroCounts,
  ruleSnapshot: {
    valid: true,
    state: "VALID",
    reference: "snapshot-current",
    rules: { ...DAILY_POINTS_RULES },
  },
});
assert.equal(matchingSnapshot.state, "READY");
assert.equal(matchingSnapshot.authority.authorityType, "RULE_SNAPSHOT");

const before = structuredClone(zeroCounts);
calculateActivityPoints({ counts: zeroCounts });
assert.deepEqual(zeroCounts, before);

const adapterSource = readFileSync(
  new URL(
    "../platform/productivity/activity-points-authority-adapter.mjs",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  adapterSource,
  /import\s*\{\s*DAILY_POINTS_RULES,\s*calcularPuntosDiarios,?\s*\}\s*from/,
);
for (const [key, value] of Object.entries(DAILY_POINTS_RULES)) {
  assert.equal(new RegExp(`${key}\\s*:\\s*${value}`).test(adapterSource), false);
}
assert.doesNotMatch(
  adapterSource,
  /NASH|human performance|legendario|elite|bajo_ritmo|imparable/,
);

console.log("POINT_AUTHORITY_ADAPTER=PASS");
console.log("POINTS_RULES_COPIED=ZERO");
console.log("LEGACY_HUMAN_JUDGMENTS_EXPOSED=ZERO");
console.log("UNKNOWN_TO_ZERO_GUARD=PASS");
console.log("CONFIRMED_MINIMUM_LOWER_BOUND=PASS");
console.log("POINT_COMBINATION_EXCESS_REPORTING=PASS");
