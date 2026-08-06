import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const policyApi = require("../platform/productivity/activity-coaching-policy.js");
const intelligenceApi = require("../platform/productivity/activity-coaching-intelligence.js");
const policy = JSON.parse(await readFile(new URL("../platform/productivity/policies/FORGE_ACTIVITY_COACHING_POLICY_V1.json", import.meta.url), "utf8"));
const locale = JSON.parse(await readFile(new URL("../docs/static-preview/forge-aura/activity/es-MX.json", import.meta.url), "utf8"));
const { createActivityTipPresenter } = await import("../docs/static-preview/forge-aura/activity/activity-tip-presenter.js");

const resolution = policyApi.resolvePolicySnapshot([policy], { asOf: "2026-08-05T18:00:00.000Z" });

test("validates the one active Activity coaching policy snapshot", () => {
  assert.equal(resolution.state, "READY");
  assert.equal(resolution.policySnapshotId, "FORGE_ACTIVITY_COACHING_POLICY_V1@1.0.0");
  assert.equal(policyApi.resolvePolicySnapshot([], { asOf: "2026-08-05T18:00:00.000Z" }).state, "UNAVAILABLE_OR_CONFLICTING");
  assert.equal(policyApi.resolvePolicySnapshot([policy, policy], { asOf: "2026-08-05T18:00:00.000Z" }).state, "UNAVAILABLE_OR_CONFLICTING");
  assert.equal(policyApi.resolvePolicySnapshot([{ ...policy, effectiveTo: "2026-08-04T00:00:00.000Z" }], { asOf: "2026-08-05T18:00:00.000Z" }).state, "UNAVAILABLE_OR_CONFLICTING");
});

test("generates only structured tips and limits them through the snapshot", () => {
  const output = intelligenceApi.generateActivityTips({
    policyResolution: resolution,
    points: { state: "READY", total: 20, objective: 25, remaining: 5, period: { from: "2026-08-05", to: "2026-08-05" }, sourceRefs: ["points:1"], warnings: [] },
    pointCombinations: [{ counts: { llamadas: 3, citas_agendadas: 1 }, totalPoints: 6, excessPoints: 1, exact: false, reachesTarget: true }],
    dailyPoints: [
      { localDate: "2026-07-30", eligible: true, state: "CONFIRMED", points: 31, sourceRefs: ["d1"] },
      { localDate: "2026-07-31", eligible: true, state: "CONFIRMED", points: 32, sourceRefs: ["d2"] },
      { localDate: "2026-08-01", eligible: true, state: "CONFIRMED", points: 33, sourceRefs: ["d3"] },
      { localDate: "2026-08-04", eligible: true, state: "CONFIRMED", points: 34, sourceRefs: ["d4"] },
      { localDate: "2026-08-05", eligible: true, state: "CONFIRMED", points: 35, sourceRefs: ["d5"] },
    ],
    calendar: { period: { from: "2026-07-30", to: "2026-08-05" } },
    scheduling: { state: "CONFIRMED", completedEligibleWeeks: 1, newScheduledAppointments: 0, period: { from: "2026-07-27", to: "2026-07-31" }, sourceRefs: ["schedule:1"] },
    conversions: [{ metricState: "CONFIRMED", percentage: 66.666666, sourceRefs: ["conversion:1"], warnings: [] }],
  });
  assert.equal(output.coachingPolicyState, "READY");
  assert.equal(output.tips.length, policy.thresholds.maxVisibleTips);
  assert.deepEqual(Object.keys(output.tips[0]), ["tipType", "observedValue", "targetValue", "period", "reasonWhy", "whyNow", "evidenceRefs", "uncertainty", "combinationCandidates", "policySnapshotId"]);
  assert.equal(typeof output.tips[0].reasonWhy, "object");
  assert.equal(JSON.stringify(output.tips).includes("Te faltan"), false);
});

test("does not generate tips without a valid snapshot", () => {
  const output = intelligenceApi.generateActivityTips({ policyResolution: { state: "UNAVAILABLE_OR_CONFLICTING" } });
  assert.equal(output.coachingPolicyState, "UNAVAILABLE_OR_CONFLICTING");
  assert.equal(output.tipsState, "NOT_GENERATED");
  assert.deepEqual(output.tips, []);
});

test("presents visible copy only from the localization catalog", () => {
  const presenter = createActivityTipPresenter(locale);
  const structured = intelligenceApi.generateActivityTips({
    policyResolution: resolution,
    points: { state: "READY", total: 20, objective: 25, remaining: 5, period: null, sourceRefs: ["points:1"], warnings: [] },
    pointCombinations: [{ totalPoints: 6, excessPoints: 1 }],
  });
  const visible = presenter.present(structured.tips[0]);
  assert.match(visible.body, /5 puntos/);
  assert.match(visible.combination, /6 puntos/);
  assert.match(visible.combination, /1/);
});

test("locks Aura route, lifecycle, canonical authority imports and honest unavailable states", async () => {
  const base = new URL("../docs/static-preview/forge-aura/", import.meta.url);
  const [router, app, shell, html, module, runtime, styles, policySource, intelligenceSource] = await Promise.all([
    readFile(new URL("aura-router-v4.js", base), "utf8"),
    readFile(new URL("app-v4.js", base), "utf8"),
    readFile(new URL("aura-shell.js", base), "utf8"),
    readFile(new URL("auth-v4.html", base), "utf8"),
    readFile(new URL("activity/activity-module.js", base), "utf8"),
    readFile(new URL("activity/activity-runtime-adapter.js", base), "utf8"),
    readFile(new URL("activity/activity.css", base), "utf8"),
    readFile(new URL("../platform/productivity/activity-coaching-policy.js", import.meta.url), "utf8"),
    readFile(new URL("../platform/productivity/activity-coaching-intelligence.js", import.meta.url), "utf8"),
  ]);
  assert.match(router, /actividad: "actividad"/);
  assert.match(router, /requested === ROUTES\.login \? ROUTES\.pipeline : requested/);
  assert.match(app, /activeModule/);
  assert.match(app, /destroyActiveModule/);
  assert.match(app, /createActivityModule/);
  assert.match(shell, /data-aura-route-link="actividad"/);
  assert.match(html, /activity-ledger-browser-runtime\.js/);
  assert.match(html, /activity-conversion-read-model\.js/);
  assert.match(runtime, /createProductiveActivityReportingBridge/);
  assert.match(runtime, /calculateActivityPoints/);
  assert.match(runtime, /appendCanonicalEvent/);
  assert.match(runtime, /productionMigrationExecuted: false/);
  assert.match(module, /activity\.state\.calendar/);
  assert.match(module, /data-activity-slider/);
  assert.match(module, /data-activity-number/);
  assert.doesNotMatch(module, /dailyGoal|consecutiveEligibleDays|strictlyGreaterThanPoints|completedEligibleWeeks|maxVisibleTips/);
  assert.doesNotMatch(policySource, /Te faltan|Llevas cinco|semana laboral no aparecen/);
  assert.doesNotMatch(intelligenceSource, /Te faltan|Llevas cinco|semana laboral no aparecen/);
  assert.doesNotMatch(runtime, /create table|from\("activity_/i);
  assert.doesNotMatch(module, /actividad\.js|forge-alive-material3\/activity-module/);
  assert.doesNotMatch(styles, /#[0-9a-f]{3,8}|rgba?\(/i);
  assert.match(styles, /min-height:44px/);
  assert.match(styles, /prefers-reduced-motion/);
});
