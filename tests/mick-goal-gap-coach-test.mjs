import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import {
  composeMickGoalGapCoach,
  MICK_GOAL_GAP_COACH_BOUNDARIES,
  MICK_GOAL_GAP_COACH_VERSION,
} from "../advisor-os/forge-alive/forecast/mick-goal-gap-coach.mjs";

const policy = Object.freeze({
  target: 10,
  confirmed: 8,
  confirmedGap: 2,
  weightedResidual: 1.25,
  forecastAvailable: true,
  evidenceRefs: ["FORECAST:EVIDENCE"],
});

const incomeSource = Object.freeze({
  compensationSnapshot: Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_INCOME_WIDGET_SNAPSHOT_001",
    currency: "MXN",
    incomePaid: 17_500,
    incomePaidAvailable: true,
    incomeEarned: 19_000,
    incomeEarnedAvailable: true,
    incomeReal: 17_500,
    incomeRealAvailable: true,
    incomeRealBasis: "PAID",
    incomeEstimated: 3_000,
    incomePotential: 5_000,
    incomeAtRisk: null,
    incomeAtRiskConfirmed: false,
  }),
});

const combined = composeMickGoalGapCoach({
  policy,
  economicTarget: 20_000,
  incomeSource,
});
assert.equal(MICK_GOAL_GAP_COACH_VERSION, "MICK_GOAL_GAP_COACH_V1");
assert.equal(combined.status, "READY");
assert.equal(combined.economic.actual, 17_500);
assert.equal(combined.economic.actualBasis, "PAID");
assert.equal(combined.economic.gap, 2_500);
assert.equal(combined.policy.confirmedGap, 2);
assert.match(combined.message, /2 pólizas/);
assert.match(combined.message, /\$2,500/);
assert.match(combined.detail, /estimados/);
assert.match(combined.detail, /no los cuenta como ingreso real/);
assert.equal(combined.economic.gap, 20_000 - 17_500, "estimated income must not reduce the real-income gap");

const incomeOnly = composeMickGoalGapCoach({
  policy: Object.freeze({
    target: 10,
    confirmed: 10,
    confirmedGap: 0,
    weightedResidual: 0,
    forecastAvailable: true,
    evidenceRefs: [],
  }),
  economicTarget: 20_000,
  incomeSource,
});
assert.equal(incomeOnly.priority, "ECONOMIC_GAP");
assert.match(incomeOnly.message, /Te faltan \$2,500/);
assert.match(incomeOnly.message, /\$17,500 pagados/);

const missing = composeMickGoalGapCoach({
  policy: Object.freeze({
    target: null,
    confirmed: null,
    confirmedGap: null,
    weightedResidual: null,
    forecastAvailable: false,
    evidenceRefs: [],
  }),
  economicTarget: 20_000,
  incomeSource: Object.freeze({ compensationSnapshot: null }),
});
assert.equal(missing.status, "INSUFFICIENT_DATA");
assert.doesNotMatch(missing.message, /\b0\b/);

const covered = composeMickGoalGapCoach({
  policy: Object.freeze({
    target: 10,
    confirmed: 10,
    confirmedGap: 0,
    weightedResidual: 0,
    forecastAvailable: true,
    evidenceRefs: [],
  }),
  economicTarget: 15_000,
  incomeSource,
});
assert.equal(covered.status, "GOALS_COVERED");
assert.match(covered.message, /Alcanzaste tus metas/);

assert.deepEqual(MICK_GOAL_GAP_COACH_BOUNDARIES, {
  estimatedAsReal: false,
  potentialAsReal: false,
  unknownAsZero: false,
  pipelineAsConfirmedPolicy: false,
  automaticActionAllowed: false,
  createsCompensationTruth: false,
  createsProductionTruth: false,
});

const [homeModuleSource, runtimeSource] = await Promise.all([
  readFile(new URL("../docs/static-preview/forge-alive-material3/home-module.js", import.meta.url), "utf8"),
  readFile(new URL("../docs/static-preview/forge-alive-material3/home-mick-goal-coach.js", import.meta.url), "utf8"),
]);
assert.match(homeModuleSource, /createHomeMickGoalGapCoach/);
assert.match(homeModuleSource, /mickGoalCoach\.mount\(\)/);
assert.match(homeModuleSource, /mickGoalCoach\.resume\("home-reconcile"\)/);
assert.match(homeModuleSource, /mickGoalCoach\.scrub\("home-route-unmounted"\)/);
assert.match(runtimeSource, /installAdvisorCompensationSupabaseProvider100/);
assert.match(runtimeSource, /createAdvisorCompensationIncomeWidgetLoader080/);
assert.match(runtimeSource, /ADVISOR_FORECAST_WIDGET/);
assert.match(runtimeSource, /MICK · FORECAST/);
assert.doesNotMatch(runtimeSource, /Carnal|Mijo/);

console.log("MICK_GOAL_GAP_COACH=PASS");
