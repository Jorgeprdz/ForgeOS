import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  createAdvisorBusinessPlanningReadModel,
} = require("../platform/business-intelligence/advisor-business-planning-read-model.js");
const {
  createBusinessPlanningNbaCandidates,
} = require("../platform/business-intelligence/advisor-business-planning-nba-adapter.js");
const {
  adaptMiDiaFollowUpReadModel,
} = require("../platform/business-intelligence/advisor-business-planning-source-adapter.js");
const {
  composeAdvisorForecastV2,
} = require("../manager-os/forecast/advisor-forecast-composer-v2.js");
const {
  createMiDiaFollowUpReadModel,
} = await import("../advisor-os/home/mi-dia-follow-up-read-model.js");

const advisorId = "advisor-017b";
const period = Object.freeze({ yearMonth: "2026-08" });

function forecast({ target = 10, actual = 4, evidence = true } = {}) {
  return {
    schema: "ADVISOR_FORECAST_COMPOSER_V2",
    advisorId,
    period,
    generatedAt: "2026-08-11T12:00:00.000Z",
    sourceEvidence: {
      evidenceRefs: evidence ? ["goal:2026-08:r3", "production:2026-08"] : [],
      freshness: "CURRENT",
    },
    goalGap: {
      target,
      currentProduction: actual,
      confirmedGap: Math.max(0, target - actual),
      confidenceLimitations: [],
    },
  };
}

function followUps(items = []) {
  return {
    advisorId,
    period,
    sourceAuthority: "MI_DIA_FOLLOW_UP_READ_MODEL",
    generatedAt: "2026-08-11T12:00:00.000Z",
    fingerprint: "NFAST09-MIDIA-017B",
    stale: false,
    items,
  };
}

function overdue(overrides = {}) {
  return {
    itemKey: "prospect-1:due-v3",
    prospectReference: "prospect-1",
    approvedDisplayName: "Mariana",
    nextActionType: "FOLLOW_UP",
    nextActionAt: "2026-08-10T15:00:00.000Z",
    bucket: "OVERDUE",
    stale: false,
    ...overrides,
  };
}

{
  const plan = createAdvisorBusinessPlanningReadModel({
    advisorId,
    period,
    forecast: forecast(),
    generatedAt: "2026-08-11T13:00:00.000Z",
  });
  assert.equal(plan.gap.value, 6);
  assert.equal(plan.gap.unit, "POLICY_COUNT");
  assert.equal(plan.constraintState, "INSUFFICIENT_EVIDENCE");
  assert.deepEqual(plan.actionPathCandidates, []);
  assert.equal(plan.requiredActivity.state, "UNKNOWN");
}

{
  const evidence = (owner, id) => ({
    evidenceRefs: [`${id}-ref`],
    sourceEvidenceIds: [`${id}-source`],
    sourceOwners: [owner],
    freshness: { status: "FRESH" },
    generatedAt: "2026-08-11T12:00:00.000Z",
  });
  const productiveForecast = composeAdvisorForecastV2({
    advisorId,
    now: "2026-08-11T12:00:00.000Z",
    period,
    goalSnapshot: {
      advisorId,
      yearMonth: period.yearMonth,
      targetPolicyCount: 10,
      evidenceRef: "goal:2026-08:r3",
    },
    policyFacts: [
      {
        advisorId,
        eventType: "POLICY_SOLD_CONFIRMED",
        policyId: "policy-1",
        yearMonth: period.yearMonth,
        evidenceRef: "production:policy-1",
      },
    ],
    opportunities: [],
    activityReportResult: null,
    sourceEvidence: {
      goal: evidence("ADVISOR_MONTHLY_POLICY_GOAL", "goal"),
      production: evidence("PRODUCTION_EVENTS", "production"),
      pipeline: evidence("PIPELINE", "pipeline"),
    },
  });
  const productiveMiDia = createMiDiaFollowUpReadModel({
    asOf: "2026-08-11T12:00:00.000Z",
    timeZone: "America/Mexico_City",
    records: [{
      prospectReference: "prospect-productive",
      approvedDisplayName: "Mariana",
      nextActionType: "FOLLOW_UP",
      nextActionAt: "2026-08-10T12:00:00.000Z",
      dueActionState: "SCHEDULED",
      dueActionVersion: "due-v1",
      acknowledgementState: "UNSEEN",
      syncState: "SYNCED",
      lastSyncedAt: "2026-08-11T12:00:00.000Z",
    }],
  });
  const productiveFollowUps = adaptMiDiaFollowUpReadModel({
    advisorId,
    period,
    readModel: productiveMiDia,
  });
  const plan = createAdvisorBusinessPlanningReadModel({
    advisorId,
    period,
    forecast: productiveForecast,
    followUpContext: productiveFollowUps,
    generatedAt: "2026-08-11T13:00:00.000Z",
  });
  const candidates = createBusinessPlanningNbaCandidates(plan);

  assert.equal(plan.gap.value, 9);
  assert.equal(plan.constraintState, "CONFIRMED_CONSTRAINT");
  assert.equal(candidates[0].nba.contractStatus, "READY_FOR_HUMAN_REVIEW");
  assert.equal(candidates[0].nba.automaticExecutionAllowed, false);
}

{
  const plan = createAdvisorBusinessPlanningReadModel({
    advisorId,
    period,
    forecast: forecast(),
    followUpContext: followUps([overdue()]),
  });
  assert.equal(plan.constraintState, "CONFIRMED_CONSTRAINT");
  assert.equal(plan.constraintCandidates.length, 1);
  assert.equal(plan.actionPathCandidates.length, 1);
  assert.equal(plan.actionPathCandidates[0].effort.state, "UNKNOWN");
  assert.equal(plan.actionPathCandidates[0].automaticExecutionAllowed, false);
  assert.match(plan.constraintCandidates[0].limitations.join(" "), /no demuestra que sea la única causa/i);

  const candidates = createBusinessPlanningNbaCandidates(plan);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].nba.contractStatus, "READY_FOR_HUMAN_REVIEW");
  assert.equal(candidates[0].nba.humanApprovalRequired, true);
  assert.equal(candidates[0].nba.automaticExecutionAllowed, false);
  assert.equal(candidates[0].nba.createsTask, false);
  assert.equal(candidates[0].nba.sendsMessage, false);
}

{
  const plan = createAdvisorBusinessPlanningReadModel({
    advisorId,
    period,
    forecast: forecast({ target: 4, actual: 4 }),
    followUpContext: followUps([overdue()]),
  });
  assert.equal(plan.gap.value, 0);
  assert.equal(plan.constraintState, "NOT_APPLICABLE");
  assert.deepEqual(plan.actionPathCandidates, []);
}

{
  const plan = createAdvisorBusinessPlanningReadModel({ advisorId, period });
  assert.equal(plan.gap, null);
  assert.equal(plan.constraintState, "BLOCKED_BY_MISSING_EVIDENCE");
  assert.equal(plan.reviewState, "REVIEW_BLOCKED");
}

assert.throws(() => createAdvisorBusinessPlanningReadModel({
  advisorId,
  period,
  forecast: {
    ...forecast(),
    goalGap: { target: 10, currentProduction: 4, confirmedGap: 2 },
  },
}), /BUSINESS_PLANNING_GAP_RECONCILIATION_FAILED/);

assert.throws(() => createAdvisorBusinessPlanningReadModel({
  advisorId,
  period,
  forecast: {
    ...forecast(),
    baseForecast: {
      input: {
        target: { unit: "POLICIES", evidenceRefs: ["goal"] },
        production: { unit: "COMMISSION", evidenceRefs: ["production"] },
      },
    },
  },
}), /BUSINESS_PLANNING_GOAL_ACTUAL_UNITS_NOT_COMPARABLE/);

assert.throws(() => createAdvisorBusinessPlanningReadModel({
  advisorId,
  period,
  forecast: forecast(),
  followUpContext: followUps([overdue({ bucket: "TODAY" })]),
}), /BUSINESS_PLANNING_NON_OVERDUE_ITEM_REJECTED/);

{
  const first = createAdvisorBusinessPlanningReadModel({
    advisorId,
    period,
    forecast: forecast(),
    followUpContext: followUps([overdue()]),
    generatedAt: "2026-08-11T13:00:00.000Z",
  });
  const unchanged = createAdvisorBusinessPlanningReadModel({
    advisorId,
    period,
    forecast: forecast(),
    followUpContext: followUps([overdue()]),
    previousPlan: first,
    generatedAt: "2026-08-11T14:00:00.000Z",
  });
  const changed = createAdvisorBusinessPlanningReadModel({
    advisorId,
    period,
    forecast: forecast({ actual: 5 }),
    followUpContext: followUps([overdue()]),
    previousPlan: first,
    generatedAt: "2026-08-11T15:00:00.000Z",
  });
  assert.equal(unchanged.reviewState, "NO_MATERIAL_CHANGE");
  assert.equal(changed.reviewState, "EVIDENCE_CHANGED");
  assert.equal(changed.createsCausalClaim, false);
}

console.log("ADVISOR_BUSINESS_PLANNING_017B=PASS cases=9");
