import assert from "node:assert/strict";
import {
  createAdvisorForecastSmartWidget,
  createAdvisorForecastHomeAdditionalWidgets,
  reconcileAdvisorForecastHome,
  ADVISOR_FORECAST_WIDGET_FAMILY,
} from "../advisor-os/forge-alive/smart-widgets/advisor-forecast-smart-widget.mjs";
import {
  ADVISOR_FORECAST_DESTINATIONS,
  buildAdvisorForecastNavigationActions,
  resolveAdvisorForecastNavigationAction,
  navigateAdvisorForecastAction,
} from "../advisor-os/forge-alive/navigation/advisor-forecast-navigation.mjs";
import {
  buildAdvisorForecastDetailView,
  renderAdvisorForecastDetailMarkup,
} from "../docs/static-preview/forge-alive-material3/advisor-forecast-detail-screen.js";

console.log("\nADVISOR FORECAST STAGES 6-8 TEST\n");

function readModel(overrides = {}) {
  return {
    schema: "ADVISOR_FORECAST_READ_MODEL_V2",
    advisorId: "advisor-1",
    period: { yearMonth: "2026-08", timeZone: "America/Mexico_City" },
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
      paceGap: 3.8,
      weightedPipelineContribution: 1.67,
      remainingAfterWeightedPipeline: 6.33,
      currentCoverage: 20,
      paceCoverage: 62,
      weightedPipelineCoverage: 36.7,
    },
    opportunityForecast: {
      status: "READY",
      activeOpportunityCount: 3,
      weightedPolicyContribution: 1.67,
      atRiskCount: 1,
      unknownCount: 0,
      classificationCounts: { COMMITTED: 1, PROBABLE: 1, POTENTIAL: 0, AT_RISK: 1, UNKNOWN: 0 },
      topContributors: [
        { opportunityId: "O-APP", stage: "APPLICATION", classification: "COMMITTED", probability: 94, expectedPolicyContribution: .94, evidenceRefs: ["app-ref"], signalTrace: [] },
        { opportunityId: "O-QUOTE", stage: "QUOTE_PRESENTED", classification: "PROBABLE", probability: 65, expectedPolicyContribution: .65, evidenceRefs: ["quote-ref"], signalTrace: [] },
      ],
    },
    scenarios: { conservative: {}, baseline: {}, stretch: {} },
    riskSignals: [],
    missingInformation: [],
    staleInformation: [],
    staleSignalCount: 0,
    evidenceRefs: ["goal-ref", "production-ref", "pipeline-ref"],
    warnings: ["Forecast is context only."],
    actions: [
      { type: "NAVIGATE", label: "Abrir Forecast", destination: "ADVISOR_FORECAST_DETAIL" },
      { type: "NAVIGATE", label: "Ver oportunidades", destination: "PIPELINE_FORECAST_CONTEXT" },
      { type: "NAVIGATE", label: "Revisar casos en riesgo", destination: "PIPELINE_AT_RISK" },
    ],
    ...overrides,
  };
}

const tests = [
  ["creates Advisor Forecast Home widget", () => {
    const widget = createAdvisorForecastSmartWidget({ readModel: readModel() });
    assert.equal(widget.widgetFamily, ADVISOR_FORECAST_WIDGET_FAMILY);
    assert.equal(widget.title, "Forecast mensual");
    assert.equal(widget.primaryMetric.value, 6.2);
    assert.equal(widget.readOnly, true);
  }],
  ["month-end gap receives existing hard priority", () => {
    const widget = createAdvisorForecastSmartWidget({ readModel: readModel(), monthEndWindow: true });
    assert.equal(widget.hardPriority, "MONTH_END_GOAL_RISK");
  }],
  ["widget does not create truth or execution", () => {
    const widget = createAdvisorForecastSmartWidget({ readModel: readModel() });
    assert.equal(widget.createsRevenueTruth, false);
    assert.equal(widget.actionExecutionAllowed, false);
    assert.equal(widget.createsTask, false);
    assert.equal(widget.createsCrmWrite, false);
  }],
  ["widget requires read model v2", () => {
    assert.throws(() => createAdvisorForecastSmartWidget({ readModel: { schema: "V1" } }), /V2/);
  }],
  ["additionalWidgets integration returns one widget", () => {
    const widgets = createAdvisorForecastHomeAdditionalWidgets({ readModel: readModel() });
    assert.equal(widgets.length, 1);
    assert.equal(widgets[0].widgetFamily, ADVISOR_FORECAST_WIDGET_FAMILY);
  }],
  ["Home reconciliation uses existing adapter boundary", async () => {
    let payload = null;
    const adapter = { async reconcile(input) { payload = input; return { ok: true }; } };
    const result = await reconcileAdvisorForecastHome({ homeAdapter: adapter, session: { status: "AUTHENTICATED", advisorId: "advisor-1" }, sources: {}, readModel: readModel() });
    assert.deepEqual(result, { ok: true });
    assert.equal(payload.additionalWidgets.length, 1);
    assert.equal(payload.session.advisorId, "advisor-1");
  }],
  ["detail route resolves to Actividad forecast view", () => {
    const route = resolveAdvisorForecastNavigationAction({ destination: ADVISOR_FORECAST_DESTINATIONS.ADVISOR_FORECAST_DETAIL, label: "Abrir" }, { advisorId: "advisor-1" });
    assert.equal(route.deepLink, "?nav=actividad&view=advisor-forecast");
    assert.equal(route.humanInitiated, true);
  }],
  ["Pipeline risk route is bounded", () => {
    const route = resolveAdvisorForecastNavigationAction({ destination: ADVISOR_FORECAST_DESTINATIONS.PIPELINE_AT_RISK });
    assert.equal(route.filter, "at-risk");
    assert.equal(route.createsPipelineMutation, false);
  }],
  ["read model actions become navigation contracts", () => {
    const actions = buildAdvisorForecastNavigationActions(readModel());
    assert.equal(actions.length, 3);
    assert.ok(actions.every((action) => action.readOnly));
  }],
  ["navigation executes only supplied human callback", () => {
    let called = null;
    navigateAdvisorForecastAction({
      action: { destination: ADVISOR_FORECAST_DESTINATIONS.PIPELINE_FORECAST_CONTEXT },
      navigate(deepLink, resolved) { called = { deepLink, resolved }; return "done"; },
    });
    assert.equal(called.deepLink, "?nav=pipeline&view=forecast-context&filter=weighted-contributors");
  }],
  ["detail view consumes read model without calculation", () => {
    const view = buildAdvisorForecastDetailView(readModel());
    assert.equal(view.summary.currentProduction, 2);
    assert.equal(view.gap.remainingAfterWeightedPipeline, 6.33);
    assert.equal(view.opportunities.contributors.length, 2);
    assert.equal(view.createsRevenueTruth, false);
  }],
  ["detail markup includes forecast and boundary", () => {
    const markup = renderAdvisorForecastDetailMarkup(readModel());
    assert.match(markup, /Proyección mensual/);
    assert.match(markup, /Contexto, no garantía/);
    assert.match(markup, /POLICY_SOLD_CONFIRMED/);
    assert.match(markup, /O-APP/);
  }],
  ["detail renderer escapes opportunity identifiers", () => {
    const model = readModel();
    model.opportunityForecast.topContributors[0].opportunityId = "<script>alert(1)</script>";
    const markup = renderAdvisorForecastDetailMarkup(model);
    assert.equal(markup.includes("<script>alert(1)</script>"), false);
    assert.match(markup, /&lt;script&gt;/);
  }],
  ["missing state becomes blocked widget without invented metrics", () => {
    const model = readModel({ state: "MISSING_DATA", target: null, currentProduction: null, paceProjection: null });
    const widget = createAdvisorForecastSmartWidget({ readModel: model });
    assert.equal(widget.state, "BLOCKED_BY_MISSING_EVIDENCE");
    assert.equal(widget.primaryMetric.value, null);
  }]
];

let failed = 0;
for (const [name, run] of tests) {
  try { await run(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error); }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
