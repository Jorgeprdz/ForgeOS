import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const repo = process.cwd();
const runtimePath = path.join(repo, "docs/static-preview/forge-alive-material3/advisor-forecast-runtime-acceptance.js");
const adapterPath = path.join(repo, "docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.js");

class MemoryStorage {
  #map = new Map();
  getItem(key) { return this.#map.has(key) ? this.#map.get(key) : null; }
  setItem(key, value) { this.#map.set(key, String(value)); }
  removeItem(key) { this.#map.delete(key); }
  clear() { this.#map.clear(); }
}
globalThis.sessionStorage = new MemoryStorage();

const runtime = await import(`${pathToFileURL(runtimePath).href}?test=${Date.now()}`);
const managerWeighting = require(path.join(repo, "manager-os/forecast/advisor-opportunity-weighting-engine.js"));
const managerGap = require(path.join(repo, "manager-os/forecast/advisor-goal-gap-engine.js"));

const cards = [
  {
    id: "O-1",
    fullName: "Caso uno",
    status: "proposal",
    timelineState: "CONNECTED",
    timeline: [
      { id: "T-1", eventType: "APPOINTMENT_COMPLETED", occurredAt: "2026-08-04T15:00:00.000Z" },
      { id: "T-2", eventType: "PROPOSAL_PRESENTED", occurredAt: "2026-08-05T15:00:00.000Z" },
    ],
    nextCommitment: { dueAt: "2026-08-12T15:00:00.000Z" },
  },
  {
    id: "O-2",
    fullName: "Caso dos",
    status: "decision",
    timelineState: "CONNECTED",
    timeline: [
      { id: "T-3", eventType: "OBJECTION_RECORDED", occurredAt: "2026-08-07T15:00:00.000Z", payload: { resolutionStatus: "OPEN" } },
    ],
    nextCommitment: null,
  },
];

const opportunities = cards.map((card) => runtime.mapPipelineCardToForecastOpportunity(
  card,
  "advisor-1",
  "2026-08-10T16:00:00.000Z",
  "America/Mexico_City",
));

const browserWeighted = runtime.weightAdvisorForecastRuntimeOpportunities(opportunities);
const managerWeighted = managerWeighting.weightAdvisorOpportunities({
  advisorId: "advisor-1",
  opportunities,
  generatedAt: "2026-08-10T16:00:00.000Z",
});

const tests = [
  ["maps Pipeline stages to governed Forecast vocabulary", () => {
    assert.deepEqual(opportunities.map((entry) => entry.stage), ["QUOTE_PRESENTED", "QUOTE_PRESENTED"]);
  }],
  ["maps timeline evidence-backed signals", () => {
    assert.deepEqual(opportunities[0].signals.map((entry) => entry.code), ["APPOINTMENT_COMPLETED", "QUOTE_PRESENTED"]);
    assert.ok(opportunities[0].signals.every((entry) => entry.evidenceRef));
  }],
  ["adds no-next-action risk signal", () => {
    assert.ok(opportunities[1].signals.some((entry) => entry.code === "NO_NEXT_ACTION"));
  }],
  ["browser weighting matches Manager OS policy-equivalent result", () => {
    assert.equal(browserWeighted.weightedPolicyContribution, managerWeighted.weightedPolicyContribution);
    assert.deepEqual(browserWeighted.classificationCounts, managerWeighted.classificationCounts);
  }],
  ["amount weighting remains disabled", () => {
    assert.ok(browserWeighted.opportunities.every((entry) => entry.amountWeightingApplied !== true));
  }],
  ["runtime Goal Gap matches Manager OS state and residual gap", () => {
    const browser = runtime.calculateAdvisorForecastRuntimeGoalGap({
      target: 10,
      current: 2,
      pace: 6.2,
      weighting: browserWeighted,
      activityCount: 8,
    });
    const manager = managerGap.calculateAdvisorGoalGap({
      targetSignal: { state: "KNOWN", value: 10 },
      productionSignal: { state: "KNOWN", value: 2 },
      paceProjection: { projectedPeriodClose: 6.2 },
      opportunityWeighting: managerWeighted,
      activitySignal: { state: "KNOWN", value: 8 },
    });
    assert.equal(browser.state, manager.gapStatus);
    assert.equal(browser.remainingAfterWeightedPipeline, manager.remainingAfterWeightedPipeline);
  }],
  ["missing conversion rates do not produce activity counts", () => {
    const requirement = runtime.calculateAdvisorForecastRuntimeActivityRequirement({ remainingAfterWeightedPipeline: 4 }, null);
    assert.equal(requirement.status, "INSUFFICIENT_DATA");
    assert.equal(requirement.contactsRequired, null);
  }],
  ["evidence-backed rates produce whole minimums", () => {
    const evidence = ["conversion-ref"];
    const requirement = runtime.calculateAdvisorForecastRuntimeActivityRequirement(
      { remainingAfterWeightedPipeline: 2.2 },
      {
        applicationToPolicy: { rate: 0.5, evidenceRefs: evidence },
        presentationToApplication: { rate: 0.5, evidenceRefs: evidence },
        appointmentToPresentation: { rate: 0.75, evidenceRefs: evidence },
        contactToAppointment: { rate: 0.2, evidenceRefs: evidence },
      },
    );
    assert.equal(requirement.status, "READY");
    assert.deepEqual(
      [requirement.policiesRequired, requirement.applicationsRequired, requirement.presentationsRequired, requirement.appointmentsRequired, requirement.contactsRequired],
      [3, 6, 12, 16, 80],
    );
  }],
  ["builds one V3 read model from productive stack snapshots", () => {
    const stack = {
      inventory: [
        { widgetFamily: "MONTHLY_POLICY_GOAL_WIDGET", payload: { currentMonth: "2026-08", target: 10, sold: 2 }, evidence: ["goal-ref", "production-ref"] },
        { widgetFamily: "ACTIVITY_PROGRESS_WIDGET", payload: { activityCount: 8 }, evidence: ["activity-ref"] },
      ],
    };
    const context = {
      advisorId: "advisor-1",
      now: "2026-08-10T16:00:00.000Z",
      timeZone: "America/Mexico_City",
      snapshots: { opportunities: { sourceComplete: true, opportunities, evidence: ["pipeline-ref"] } },
    };
    const model = runtime.buildAdvisorForecastRuntimeReadModel({ stack, context });
    assert.equal(model.schema, "ADVISOR_FORECAST_READ_MODEL_V3");
    assert.equal(model.currentProduction, 2);
    assert.equal(model.target, 10);
    assert.equal(model.paceProjection, 6.2);
    assert.equal(model.opportunityForecast.activeOpportunityCount, 2);
    assert.equal(model.createsRevenueTruth, false);
  }],
  ["issued snapshots are SHA-256 protected and immutable", async () => {
    const snapshot = await runtime.issueAdvisorForecastRuntimeSnapshot({
      advisorId: "advisor-1",
      period: { yearMonth: "2026-08", start: "2026-08-01", end: "2026-08-31", timeZone: "America/Mexico_City" },
      generatedAt: "2026-08-10T16:00:00.000Z",
      currentProduction: 2,
      paceProjection: 6.2,
      goalGap: { weightedPipelineContribution: 1.2 },
      target: 10,
      activityRequirement: { status: "INSUFFICIENT_DATA" },
    });
    assert.equal(snapshot.digestAlgorithm, "SHA-256");
    assert.equal(snapshot.digest.length, 64);
    assert.equal(snapshot.immutable, true);
  }],
  ["Reports reconciliation blocks while period is open", async () => {
    const result = await runtime.reconcileAdvisorForecastIssuedSnapshot({
      snapshot: runtime.getIssuedAdvisorForecastSnapshot(),
      policyFacts: [],
      asOf: "2026-08-15T12:00:00.000Z",
    });
    assert.equal(result.status, "PERIOD_OPEN");
  }],
  ["Reports reconciliation counts unique confirmed policies after close", async () => {
    const result = await runtime.reconcileAdvisorForecastIssuedSnapshot({
      snapshot: runtime.getIssuedAdvisorForecastSnapshot(),
      asOf: "2026-09-02T12:00:00.000Z",
      sourceEvidence: { evidenceRefs: ["period-close-ref"] },
      policyFacts: [
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-1", yearMonth: "2026-08", evidenceRef: "p1" },
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-1", yearMonth: "2026-08", evidenceRef: "p1-dup" },
        { advisorId: "advisor-1", eventType: "POLICY_SOLD_CONFIRMED", policyId: "P-2", yearMonth: "2026-08", evidenceRef: "p2" },
      ],
    });
    assert.equal(result.status, "RECONCILED");
    assert.equal(result.actualConfirmedPolicies, 2);
    assert.equal(result.retroactiveMutationPerformed, false);
  }],
  ["adapter integrates Forecast before render and scrubs on logout", () => {
    const source = fs.readFileSync(adapterPath, "utf8");
    assert.match(source, /prepareAdvisorForecastRuntimeSources/);
    assert.match(source, /enrichProductiveStackWithAdvisorForecast/);
    assert.match(source, /scrubAdvisorForecastRuntime\(reason\)/);
    assert.match(source, /activeController\.signal\.aborted \|\| revision !== requestRevision/);
  }],
  ["runtime has advisor generation rejection and no automatic writes", () => {
    const source = fs.readFileSync(runtimePath, "utf8");
    assert.match(source, /const generation = \+\+runtimeState\.generation/);
    assert.match(source, /generation !== runtimeState\.generation/);
    assert.doesNotMatch(source, /\.from\([^)]*\)\.insert|\.from\([^)]*\)\.update/);
    assert.match(source, /fesEventCreated: false/);
  }],
];

let failed = 0;
for (const [name, run] of tests) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
