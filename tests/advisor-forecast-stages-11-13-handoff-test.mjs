import assert from "node:assert/strict";
import {
  createAdvisorForecastActivityHandoff,
  submitAdvisorForecastActivityHandoff,
  ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES,
} from "../advisor-os/forge-alive/activity/advisor-forecast-activity-handoff.mjs";
import {
  ADVISOR_FORECAST_DESTINATIONS,
  resolveAdvisorForecastNavigationAction,
} from "../advisor-os/forge-alive/navigation/advisor-forecast-navigation.mjs";
import {
  createAdvisorForecastSmartWidget,
  createAdvisorForecastHomeAdditionalWidgets,
  ADVISOR_FORECAST_WIDGET_FAMILY,
} from "../advisor-os/forge-alive/smart-widgets/advisor-forecast-smart-widget.mjs";

const detailSource = await import(`data:text/javascript,${encodeURIComponent(
  (await import("node:fs/promises")).readFile
    ? await (await import("node:fs/promises")).readFile(new URL("../docs/static-preview/forge-alive-material3/advisor-forecast-detail-screen.js", import.meta.url), "utf8")
    : ""
)}`);
const { buildAdvisorForecastDetailView, renderAdvisorForecastDetailMarkup } = detailSource;

console.log("\nADVISOR FORECAST STAGES 11-13 HANDOFF TEST\n");

function requirement(overrides = {}) {
  return {
    requirementStatus: "READY",
    period: { yearMonth: "2026-08", end: "2026-08-31", timeZone: "America/Mexico_City" },
    residualPolicyGap: 3,
    policiesRequired: 3,
    applicationsRequired: 6,
    presentationsRequired: 12,
    appointmentsRequired: 16,
    contactsRequired: 80,
    confidence: "HIGH",
    cadence: { contactsPerRemainingDay: 4, appointmentsPerRemainingWeek: 6 },
    evidenceRefs: ["conversion-ref"],
    warnings: [],
    recommendedActions: [
      { actionType: "PROSPECTING_CONTACTS", requiredCount: 80, unit: "contacts" },
      { actionType: "APPOINTMENTS", requiredCount: 16, unit: "appointments" },
      { actionType: "PRESENTATIONS", requiredCount: 12, unit: "presentations" },
      { actionType: "APPLICATIONS", requiredCount: 6, unit: "applications" },
    ],
    ...overrides,
  };
}

function readModel(overrides = {}) {
  return {
    schema: "ADVISOR_FORECAST_READ_MODEL_V3",
    advisorId: "advisor-1",
    period: { yearMonth: "2026-08", start: "2026-08-01", end: "2026-08-31", timeZone: "America/Mexico_City" },
    periodLabel: "2026-08",
    generatedAt: "2026-08-10T16:00:00.000Z",
    state: "READY",
    target: 10,
    targetUnit: "policies",
    currentProduction: 2,
    productionUnit: "policies",
    paceProjection: 6.2,
    confidence: "HIGH",
    healthStatus: "BEHIND",
    primaryExplanation: "El Pipeline ponderado no cubre la brecha actual.",
    goalGap: {
      state: "PIPELINE_INSUFFICIENT",
      confirmedGap: 8,
      weightedPipelineContribution: 1.67,
      remainingAfterWeightedPipeline: 6.33,
      currentCoverage: 20,
      paceCoverage: 62,
      weightedPipelineCoverage: 36.7,
    },
    opportunityForecast: {
      activeOpportunityCount: 2,
      atRiskCount: 0,
      unknownCount: 0,
      topContributors: [],
    },
    activityRequirement: {
      status: "READY",
      residualPolicyGap: 6.33,
      policiesRequired: 7,
      applicationsRequired: 14,
      presentationsRequired: 28,
      appointmentsRequired: 38,
      contactsRequired: 190,
      confidence: "HIGH",
      cadence: { contactsPerRemainingDay: 9 },
      missingRates: [],
      recommendedActions: requirement().recommendedActions,
      humanConfirmationRequired: true,
    },
    activityHandoff: {
      available: true,
      destination: "ACTIVITY_FORECAST_PLAN",
      requiresHumanConfirmation: true,
      automaticSubmissionAllowed: false,
    },
    evidenceRefs: ["forecast-ref"],
    warnings: [],
    missingInformation: [],
    staleInformation: [],
    actions: [
      { type: "NAVIGATE", label: "Abrir Forecast", destination: "ADVISOR_FORECAST_DETAIL" },
      { type: "NAVIGATE", label: "Planificar actividad", destination: "ACTIVITY_FORECAST_PLAN" },
      { type: "NAVIGATE", label: "Ver oportunidades", destination: "PIPELINE_FORECAST_CONTEXT" },
    ],
    ...overrides,
  };
}

const tests = [
  ["creates one human-review activity handoff", () => {
    const handoff = createAdvisorForecastActivityHandoff({
      advisorId: "advisor-1",
      period: { yearMonth: "2026-08" },
      generatedAt: "2026-08-10T16:00:00.000Z",
      activityRequirement: requirement(),
      sourceForecastId: "forecast-1",
    });
    assert.equal(handoff.status, ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.READY_FOR_HUMAN_REVIEW);
    assert.equal(handoff.recommendations.length, 4);
    assert.equal(handoff.confirmationState, "UNCONFIRMED");
  }],
  ["draft creates no task calendar or database truth", () => {
    const handoff = createAdvisorForecastActivityHandoff({ advisorId: "advisor-1", activityRequirement: requirement() });
    assert.equal(handoff.automaticSubmissionAllowed, false);
    assert.equal(handoff.automaticTaskCreationAllowed, false);
    assert.equal(handoff.automaticCalendarCreationAllowed, false);
    assert.equal(handoff.createsActivityTruth, false);
    assert.equal(handoff.createsDatabaseWrite, false);
  }],
  ["covered goal produces no activity recommendations", () => {
    const handoff = createAdvisorForecastActivityHandoff({
      advisorId: "advisor-1",
      activityRequirement: requirement({ requirementStatus: "GOAL_COVERED", recommendedActions: [] }),
    });
    assert.equal(handoff.status, ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.GOAL_COVERED);
    assert.equal(handoff.recommendations.length, 0);
  }],
  ["submission requires explicit advisor confirmation", async () => {
    const handoff = createAdvisorForecastActivityHandoff({ advisorId: "advisor-1", activityRequirement: requirement() });
    await assert.rejects(() => submitAdvisorForecastActivityHandoff({
      handoff,
      confirmation: { confirmedByAdvisor: false, advisorId: "advisor-1", confirmedAt: "2026-08-10T17:00:00.000Z" },
      selectedItems: [],
      submitDraft: async () => ({}),
    }), /confirmation/i);
  }],
  ["submission rejects mismatched advisor identity", async () => {
    const handoff = createAdvisorForecastActivityHandoff({ advisorId: "advisor-1", activityRequirement: requirement() });
    await assert.rejects(() => submitAdvisorForecastActivityHandoff({
      handoff,
      confirmation: { confirmedByAdvisor: true, advisorId: "advisor-2", confirmedAt: "2026-08-10T17:00:00.000Z" },
      selectedItems: [{ recommendationId: handoff.recommendations[0].recommendationId, dueAt: "2026-08-11T15:00:00.000Z" }],
      submitDraft: async () => ({}),
    }), /identity/i);
  }],
  ["submission rejects unscheduled recommendations", async () => {
    const handoff = createAdvisorForecastActivityHandoff({ advisorId: "advisor-1", activityRequirement: requirement() });
    await assert.rejects(() => submitAdvisorForecastActivityHandoff({
      handoff,
      confirmation: { confirmedByAdvisor: true, advisorId: "advisor-1", confirmedAt: "2026-08-10T17:00:00.000Z" },
      selectedItems: [{ recommendationId: handoff.recommendations[0].recommendationId, dueAt: null }],
      submitDraft: async () => ({}),
    }), /dueAt/);
  }],
  ["confirmed submission invokes only supplied Activity boundary", async () => {
    const handoff = createAdvisorForecastActivityHandoff({ advisorId: "advisor-1", activityRequirement: requirement(), sourceForecastId: "forecast-1" });
    let calls = 0;
    let received = null;
    const result = await submitAdvisorForecastActivityHandoff({
      handoff,
      confirmation: { confirmedByAdvisor: true, advisorId: "advisor-1", confirmedAt: "2026-08-10T17:00:00.000Z" },
      selectedItems: [{ recommendationId: handoff.recommendations[0].recommendationId, dueAt: "2026-08-11T15:00:00.000Z" }],
      submitDraft: async (draft) => {
        calls += 1;
        received = draft;
        return { acceptedForReview: true };
      },
    });
    assert.equal(calls, 1);
    assert.equal(received.status, "ADVISOR_CONFIRMED_READY_FOR_ACTIVITY_RUNTIME");
    assert.equal(received.directDatabaseWriteAllowed, false);
    assert.equal(result.status, ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.SUBMITTED_AFTER_HUMAN_CONFIRMATION);
    assert.equal(result.humanConfirmedSubmission, true);
  }],
  ["Activity planning route remains human initiated", () => {
    const route = resolveAdvisorForecastNavigationAction({
      destination: ADVISOR_FORECAST_DESTINATIONS.ACTIVITY_FORECAST_PLAN,
      label: "Planificar actividad",
    }, { advisorId: "advisor-1" });
    assert.equal(route.deepLink, "?nav=actividad&view=forecast-plan");
    assert.equal(route.humanInitiated, true);
    assert.equal(route.createsActivityMutation, false);
  }],
  ["single Forecast widget accepts Read Model V3", () => {
    const widget = createAdvisorForecastSmartWidget({ readModel: readModel() });
    const widgets = createAdvisorForecastHomeAdditionalWidgets({ readModel: readModel() });
    assert.equal(widget.widgetFamily, ADVISOR_FORECAST_WIDGET_FAMILY);
    assert.equal(widgets.length, 1);
    assert.equal(widget.payload.activityRequirement.contactsRequired, 190);
    assert.equal(widget.createsTask, false);
  }],
  ["detail view exposes activity requirement separately", () => {
    const view = buildAdvisorForecastDetailView(readModel());
    assert.equal(view.activityRequirement.contactsRequired, 190);
    assert.equal(view.activityRequirement.humanConfirmationRequired, true);
    assert.equal(view.createsTask, false);
  }],
  ["detail markup includes activity plan and truth boundary", () => {
    const markup = renderAdvisorForecastDetailMarkup(readModel());
    assert.match(markup, /Actividad mínima para sostener la brecha/);
    assert.match(markup, /Planificar actividad/);
    assert.match(markup, /no crean ingreso, emisión, tarea ni cierre automático/i);
  }],
  ["handoff does not mutate activity requirement", () => {
    const source = requirement();
    const before = JSON.parse(JSON.stringify(source));
    createAdvisorForecastActivityHandoff({ advisorId: "advisor-1", activityRequirement: source });
    assert.deepEqual(source, before);
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
