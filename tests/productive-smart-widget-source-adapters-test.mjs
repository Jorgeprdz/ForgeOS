import assert from "node:assert/strict";
import {
  createMonthlyPolicyGoalSourceAdapter,
  createCarteraFutureRadarSourceAdapter,
  createIncomeCompensationSourceAdapter,
} from "../advisor-os/forge-alive/smart-widgets/productive-smart-widget-source-adapters.mjs";

const context = {
  advisorId: "advisor-1",
  now: "2026-08-01T10:00:00-06:00",
  timeZone: "America/Mexico_City",
};

const goal = createMonthlyPolicyGoalSourceAdapter({
  loadGoalSnapshot: async () => ({ advisorId: "advisor-1", targetPolicyCount: 10 }),
  loadPolicyFacts: async () => [{ advisorId: "advisor-1", policyId: "policy-1" }],
});
assert.equal((await goal.load(context)).sourceComplete, true);

const cartera = createCarteraFutureRadarSourceAdapter({ connected: false });
assert.equal((await cartera.load(context)).sourceConnected, false);

const income = createIncomeCompensationSourceAdapter({ connected: false });
assert.equal((await income.load(context)).blockedReason, "WAITING_FOR_COMPENSATION_INCOME_TRUTH_MINIMUM");

await assert.rejects(
  () => goal.load({ ...context, signal: { aborted: true } }),
  /aborted/,
);

await assert.rejects(
  () => createMonthlyPolicyGoalSourceAdapter({
    loadGoalSnapshot: async () => ({ advisorId: "another-advisor", targetPolicyCount: 10 }),
    loadPolicyFacts: async () => [],
  }).load(context),
  /cross-advisor/,
);

console.log("Productive Smart Widget Source Adapters PASS 5/5");
