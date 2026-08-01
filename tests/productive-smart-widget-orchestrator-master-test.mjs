import assert from "node:assert/strict";
import {
  SMART_WIDGET_STATES,
  PRODUCTIVE_SMART_WIDGET_FAMILIES,
} from "../advisor-os/forge-alive/smart-widgets/productive-smart-widget-contract.mjs";
import {
  createActivityProgressWidget,
  createMonthlyPolicyGoalWidget,
  createPolicyServiceRiskWidget,
  createOpportunityCloseLikelihoodWidget,
  createIncomeProgressWidget,
  scoreOpportunityLikelihood,
} from "../advisor-os/forge-alive/smart-widgets/productive-smart-widget-providers.mjs";
import {
  buildProductiveSmartWidgetStack,
  rankProductiveSmartWidgets,
} from "../advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs";

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("una sesión anónima nunca recibe widgets privados", async () => {
  const stack = await buildProductiveSmartWidgetStack({
    now: "2026-08-01T09:00:00-06:00",
    session: { status: "ANONYMOUS" },
    sources: { activity: { activityCount: 99, sourceComplete: true } },
  });
  assert.equal(stack.stackStatus, SMART_WIDGET_STATES.SESSION_REQUIRED);
  assert.equal(stack.visible.length, 0);
  assert.equal(stack.primary, null);
});

test("Actividad usa REP para gráfica y no finge puntos sin snapshot de Mick", () => {
  const widget = createActivityProgressWidget({
    reportResult: {
      report: { totals: { activityCount: 12 } },
      chartReady: { series: [{ x: "2026-08-01", y: 12 }] },
    },
  });
  assert.equal(widget.state, SMART_WIDGET_STATES.PARTIAL);
  assert.equal(widget.primaryMetric.value, 12);
  assert.ok(widget.uncertainty.includes("activity_scoring_snapshot_not_connected"));
  assert.deepEqual(widget.chartReady.series[0], { x: "2026-08-01", y: 12 });
});

test("Actividad queda READY con puntuación real y meta diaria", () => {
  const widget = createActivityProgressWidget({
    reportResult: { report: { totals: { activityCount: 9 } }, chartReady: { series: [] } },
    scoringSnapshot: { pointsEarned: 18, dailyTarget: 25 },
  });
  assert.equal(widget.state, SMART_WIDGET_STATES.READY);
  assert.equal(widget.primaryMetric.display, "18 / 25");
  assert.equal(widget.payload.remaining, 7);
});

test("Meta mensual deduplica una póliza vendida y compara histórico", () => {
  const widget = createMonthlyPolicyGoalWidget({
    asOf: "2026-08-15T12:00:00-06:00",
    goalSnapshot: { yearMonth: "2026-08", targetPolicyCount: 10, evidenceRef: "goal-aug" },
    sourceComplete: true,
    policyFacts: [
      { eventType: "POLICY_SOLD_CONFIRMED", policyId: "P1", soldAt: "2026-08-01T10:00:00-06:00" },
      { eventType: "POLICY_SOLD_CONFIRMED", policyId: "P1", soldAt: "2026-08-02T10:00:00-06:00" },
      { eventType: "POLICY_SOLD_CONFIRMED", policyId: "P2", soldAt: "2026-08-03T10:00:00-06:00" },
      { eventType: "POLICY_SOLD_CONFIRMED", policyId: "J1", soldAt: "2026-07-03T10:00:00-06:00" },
      { eventType: "POLICY_SOLD_CONFIRMED", policyId: "J2", soldAt: "2026-07-04T10:00:00-06:00" },
      { eventType: "POLICY_SOLD_CONFIRMED", policyId: "J3", soldAt: "2026-07-05T10:00:00-06:00" },
      { eventType: "POLICY_SOLD_CONFIRMED", policyId: "K1", soldAt: "2026-06-05T10:00:00-06:00" },
    ],
  });
  assert.equal(widget.state, SMART_WIDGET_STATES.READY);
  assert.equal(widget.payload.sold, 2);
  assert.equal(widget.payload.gap, 8);
  assert.equal(widget.primaryMetric.display, "20%");
  assert.equal(widget.comparison.bestLast12CompletedMonths, 3);
});

test("Meta mensual no inventa una meta cuando falta autoridad", () => {
  const widget = createMonthlyPolicyGoalWidget({ sourceComplete: true, policyFacts: [] });
  assert.equal(widget.state, SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE);
  assert.equal(widget.blockedReason, "MONTHLY_GOAL_NOT_DEFINED");
});

test("Cartera desconectada no se representa como cero pólizas en riesgo", () => {
  const widget = createPolicyServiceRiskWidget({ sourceConnected: false });
  assert.equal(widget.state, SMART_WIDGET_STATES.NOT_CONNECTED);
  assert.equal(widget.primaryMetric.value, 0);
  assert.equal(widget.primaryMetric.display, null);
  assert.equal(widget.blockedReason, "WAITING_FOR_CARTERA_050_MAIN_PROMOTION");
});

test("Impago confirmado conserva prioridad dura y no mezcla inferencia", () => {
  const widget = createPolicyServiceRiskWidget({
    sourceConnected: true,
    sourceComplete: true,
    signals: [
      { signalType: "OVERDUE_CONFIRMED", evidenceRefs: ["payment-ledger-1"] },
      { signalType: "POSSIBLE_LATE_PAYMENT", evidenceRefs: ["expected-obligation-2"] },
    ],
  });
  assert.equal(widget.hardPriority, "CONFIRMED_OVERDUE_POLICY");
  assert.equal(widget.payload.counts.OVERDUE_CONFIRMED, 1);
  assert.equal(widget.payload.counts.POSSIBLE_LATE_PAYMENT, 1);
  assert.ok(widget.uncertainty.includes("possible_late_payment_is_inference_not_confirmed_nonpayment"));
});

test("Probabilidad de cierre v1 es determinista y explicable", () => {
  const result = scoreOpportunityLikelihood({
    signals: [
      "APPOINTMENT_COMPLETED",
      "QUOTE_PRESENTED",
      "BUDGET_CONFIRMED",
      "DECISION_DATE_SET",
      "OBJECTION_OPEN",
    ],
  });
  assert.equal(result.likelihood, 58);
  assert.equal(result.modelVersion, "opportunity-likelihood.v1");
  assert.equal(result.positiveSignals.length, 4);
  assert.equal(result.negativeSignals.length, 1);
  assert.equal(result.confidence, "MEDIUM");
});

test("Widget de oportunidad selecciona primero una decisión de hoy", () => {
  const widget = createOpportunityCloseLikelihoodWidget({
    sourceComplete: true,
    opportunities: [
      { opportunityId: "A", personName: "Alta", signals: ["EXPLICIT_BUYING_INTENT", "QUOTE_PRESENTED", "BUDGET_CONFIRMED"] },
      { opportunityId: "B", personName: "Hoy", decisionDueToday: true, signals: ["QUOTE_PRESENTED"] },
    ],
  });
  assert.equal(widget.payload.topOpportunity.opportunityId, "B");
  assert.equal(widget.hardPriority, "OPPORTUNITY_DECISION_DUE_TODAY");
});

test("Ingresos no usa cotizaciones ni convierte desconexión en cero visible", () => {
  const widget = createIncomeProgressWidget({ sourceConnected: false, quoteProjection: 142000 });
  assert.equal(widget.state, SMART_WIDGET_STATES.NOT_CONNECTED);
  assert.equal(widget.primaryMetric.value, null);
  assert.ok(widget.uncertainty.includes("income_must_not_be_derived_from_quotes_or_premium"));
});

test("Ranking duro pone póliza vencida por encima de actividad", () => {
  const activity = createActivityProgressWidget({
    reportResult: { report: { totals: { activityCount: 20 } }, chartReady: {} },
    scoringSnapshot: { pointsEarned: 24, dailyTarget: 25 },
    rankScore: 99,
  });
  const policy = createPolicyServiceRiskWidget({
    sourceConnected: true,
    sourceComplete: true,
    signals: [{ signalType: "OVERDUE_CONFIRMED" }],
    rankScore: 1,
  });
  const ranked = rankProductiveSmartWidgets({ widgets: [activity, policy], now: "2026-08-01T16:00:00-06:00" });
  assert.equal(ranked.primary.widgetFamily, PRODUCTIVE_SMART_WIDGET_FAMILIES.POLICY_SERVICE_RISK_WIDGET);
});

test("Anti-flapping conserva primary durante ventana pegajosa", () => {
  const activity = createActivityProgressWidget({
    reportResult: { report: { totals: { activityCount: 3 } }, chartReady: {} },
    scoringSnapshot: { pointsEarned: 10, dailyTarget: 25 },
    rankScore: 70,
  });
  const income = createIncomeProgressWidget({
    sourceConnected: true,
    sourceComplete: true,
    compensationSnapshot: { incomePaid: 1000 },
    rankScore: 74,
  });
  const ranked = rankProductiveSmartWidgets({
    widgets: [activity, income],
    now: "2026-08-01T10:05:00-06:00",
    previousSelection: { primaryWidgetId: activity.widgetId, selectedAt: "2026-08-01T10:00:00-06:00" },
    challengerMargin: 20,
  });
  assert.equal(ranked.primary.widgetId, activity.widgetId);
  assert.equal(ranked.selectionReason, "ANTI_FLAPPING_STICKY_PRIMARY");
});

test("Una fuente caída no derriba los demás widgets", async () => {
  const stack = await buildProductiveSmartWidgetStack({
    now: "2026-08-01T11:00:00-06:00",
    session: { status: "AUTHENTICATED", advisorId: "advisor-1" },
    sources: {
      activity: { load: async () => { throw new Error("REP unavailable"); } },
      monthlyGoal: { sourceConnected: false },
      policyService: { sourceConnected: false },
      opportunities: {
        sourceComplete: true,
        opportunities: [{ opportunityId: "op-2", personName: "Ana", signals: ["QUOTE_PRESENTED", "BUDGET_CONFIRMED", "DECISION_DATE_SET"] }],
      },
      income: { sourceConnected: false },
    },
  });
  assert.equal(stack.primary.widgetFamily, PRODUCTIVE_SMART_WIDGET_FAMILIES.OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET);
  const activity = stack.inventory.find((widget) => widget.widgetFamily === PRODUCTIVE_SMART_WIDGET_FAMILIES.ACTIVITY_PROGRESS_WIDGET);
  assert.equal(activity.state, SMART_WIDGET_STATES.SOURCE_UNAVAILABLE);
});

test("Orquestador muestra máximo una primaria y dos de apoyo", async () => {
  const input = {
    now: "2026-08-28T16:00:00-06:00",
    session: { status: "AUTHENTICATED", advisorId: "advisor-1" },
    sources: {
      activity: {
        reportResult: { report: { totals: { activityCount: 8 } }, chartReady: { series: [] } },
        scoringSnapshot: { pointsEarned: 18, dailyTarget: 25 },
      },
      monthlyGoal: {
        goalSnapshot: { yearMonth: "2026-08", targetPolicyCount: 10 },
        sourceComplete: true,
        policyFacts: [],
      },
      policyService: { sourceConnected: false },
      opportunities: {
        sourceComplete: true,
        opportunities: [{ opportunityId: "op-1", personName: "María", signals: ["QUOTE_PRESENTED", "BUDGET_CONFIRMED"] }],
      },
      income: { sourceConnected: false },
    },
  };
  const before = JSON.stringify(input);
  const stack = await buildProductiveSmartWidgetStack(input);
  assert.ok(stack.primary);
  assert.ok(stack.supporting.length <= 2);
  assert.ok(stack.visible.length <= 3);
  assert.equal(JSON.stringify(input), before);
  assert.ok(stack.pendingDependencies.some((item) => item.dependencyId === "COMPENSATION_INCOME_TRUTH_MINIMUM" && item.status === "PENDING"));
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}`);
    console.error(error);
    process.exit(1);
  }
}
console.log(`Productive Smart Widget Orchestrator PASS ${passed}/${tests.length}`);
