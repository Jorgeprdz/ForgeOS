"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildForgeAliveSmartWidgetStack,
  FORGE_ALIVE_SMART_WIDGET_FAMILIES,
} = require("../forge-alive/forge-alive-smart-widget-stack-read-model");

let passed = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function widgetFamilies(stack) {
  return stack.widgets.map((widget) => widget.widgetFamily);
}

function findWidget(stack, family) {
  return stack.widgets.find((widget) => widget.widgetFamily === family);
}

function assertFalseBoundaryFlags(target) {
  [
    "actionExecutionAllowed",
    "approvalMutationAllowed",
    "sendAllowed",
    "runtimeExecutionAllowed",
    "truthMutationAllowed",
    "sendsMessage",
    "createsTask",
    "createsCalendarEvent",
    "createsRevenueTruth",
    "createsCompensationTruth",
    "createsPayoutTruth",
    "createsLifecycleTruth",
    "createsHrTruth",
    "createsRankingTruth",
    "createsPunishmentTruth",
  ].forEach((flag) => assert.strictEqual(target[flag], false, flag));
}

function assertWidgetBoundary(widget) {
  assert.strictEqual(widget.readOnly, true);
  assert.strictEqual(widget.finalAuthority, "HUMAN");
  assert.strictEqual(widget.reasonWhyVisible, true);
  assert.ok(widget.whyThisAppearsNow);
  assert.strictEqual(widget.humanDecisionCheckpointRequired, true);
  assert.ok(widget.article0LearningValue);
  assert.ok(widget.reviewQuestions.length > 0);
  assert.ok(widget.boundaryBadges.includes("ARTICLE_0_ACTIVE"));
  assert.ok(widget.blockedActions.includes("send"));
  assertFalseBoundaryFlags(widget);
}

test("8 AM agenda input produces Morning Agenda widget", () => {
  const stack = buildForgeAliveSmartWidgetStack({ hour: 8, agendaAvailable: true });
  assert.ok(widgetFamilies(stack).includes(FORGE_ALIVE_SMART_WIDGET_FAMILIES.MORNING_AGENDA_WIDGET));
  assert.strictEqual(findWidget(stack, FORGE_ALIVE_SMART_WIDGET_FAMILIES.MORNING_AGENDA_WIDGET).priority, 90);
});

test("4 PM review input produces Twenty Five Point Review widget", () => {
  const stack = buildForgeAliveSmartWidgetStack({ hour: 16, twentyFivePointReviewDue: true });
  assert.ok(widgetFamilies(stack).includes(FORGE_ALIVE_SMART_WIDGET_FAMILIES.TWENTY_FIVE_POINT_REVIEW_WIDGET));
});

test("Commission update produces Commission Update widget", () => {
  const stack = buildForgeAliveSmartWidgetStack({ commissionUpdateAvailable: true });
  const widget = findWidget(stack, FORGE_ALIVE_SMART_WIDGET_FAMILIES.COMMISSION_UPDATE_WIDGET);
  assert.ok(widget);
  assert.ok(widget.uncertainty.includes("commission_update_is_not_payout_truth"));
});

test("High follow-up risk produces Follow Up Priority widget", () => {
  const stack = buildForgeAliveSmartWidgetStack({ followUpRisk: "high" });
  assert.ok(widgetFamilies(stack).includes(FORGE_ALIVE_SMART_WIDGET_FAMILIES.FOLLOW_UP_PRIORITY_WIDGET));
});

test("Forgotten client count produces Forgotten Client widget", () => {
  const stack = buildForgeAliveSmartWidgetStack({ forgottenClientCount: 2 });
  assert.ok(widgetFamilies(stack).includes(FORGE_ALIVE_SMART_WIDGET_FAMILIES.FORGOTTEN_CLIENT_WIDGET));
});

test("High goal gap produces Monthly Goal Gap widget", () => {
  const stack = buildForgeAliveSmartWidgetStack({ goalGap: "high" });
  const widget = findWidget(stack, FORGE_ALIVE_SMART_WIDGET_FAMILIES.MONTHLY_GOAL_GAP_WIDGET);
  assert.ok(widget);
  assert.ok(widget.uncertainty.includes("goal_gap_context_is_not_revenue_truth"));
});

test("Genesis review packets produce GENESIS_REVIEW_PACKET_WIDGET_FAMILY", () => {
  const stack = buildForgeAliveSmartWidgetStack({ genesisReviewPacketsAvailable: true });
  const widget = findWidget(stack, FORGE_ALIVE_SMART_WIDGET_FAMILIES.GENESIS_REVIEW_PACKET_WIDGET_FAMILY);
  assert.ok(widget);
  assert.ok(widget.subtitle.includes("not permanent home card"));
});

test("High uncertainty or missing context produces Judgment Prompt widget", () => {
  const stack = buildForgeAliveSmartWidgetStack({ uncertaintyHigh: true, missingContextHigh: true });
  const widget = findWidget(stack, FORGE_ALIVE_SMART_WIDGET_FAMILIES.JUDGMENT_PROMPT_WIDGET);
  assert.ok(widget);
  assert.ok(widget.missingContext.includes("missing_context_high"));
});

test("Genesis widgets are not permanent when no genesis input exists", () => {
  const stack = buildForgeAliveSmartWidgetStack({ hour: 8, agendaAvailable: true, followUpRisk: "high" });
  assert.ok(!widgetFamilies(stack).includes(FORGE_ALIVE_SMART_WIDGET_FAMILIES.GENESIS_REVIEW_PACKET_WIDGET_FAMILY));
  assert.strictEqual(stack.genesisWidgetsAreContextualNotPermanent, true);
});

test("Widgets are sorted by priority", () => {
  const stack = buildForgeAliveSmartWidgetStack({
    hour: 8,
    agendaAvailable: true,
    followUpRisk: "high",
    forgottenClientCount: 3,
    uncertaintyHigh: true,
  });
  const priorities = stack.widgets.map((widget) => widget.priority);
  assert.deepStrictEqual(priorities, [...priorities].sort((a, b) => b - a));
});

test("All widgets expose whyThisAppearsNow", () => {
  const stack = buildForgeAliveSmartWidgetStack({
    hour: 16,
    twentyFivePointReviewDue: true,
    commissionUpdateAvailable: true,
    genesisReviewPacketsAvailable: true,
  });
  stack.widgets.forEach((widget) => assert.ok(widget.whyThisAppearsNow));
});

test("All widgets preserve Article 0 and finalAuthority HUMAN", () => {
  const stack = buildForgeAliveSmartWidgetStack({
    hour: 8,
    agendaAvailable: true,
    uncertaintyHigh: true,
  });
  assert.strictEqual(stack.article0Status, "ARTICLE_0_ACTIVE");
  assert.strictEqual(stack.article0Principle, "Forge exists to strengthen human judgment, not replace it.");
  assert.strictEqual(stack.finalAuthority, "HUMAN");
  assert.strictEqual(stack.reviewOnly, true);
  stack.widgets.forEach(assertWidgetBoundary);
});

test("No widget allows approval send runtime or truth mutation", () => {
  const stack = buildForgeAliveSmartWidgetStack({
    hour: 16,
    twentyFivePointReviewDue: true,
    commissionUpdateAvailable: true,
    followUpRisk: "high",
    forgottenClientCount: 1,
    goalGap: "high",
    genesisReviewPacketsAvailable: true,
    uncertaintyHigh: true,
  });
  assertFalseBoundaryFlags(stack);
  stack.widgets.forEach(assertFalseBoundaryFlags);
});

test("Inputs are not mutated", () => {
  const input = {
    hour: 8,
    agendaAvailable: true,
    evidenceRefs: ["evidence.a"],
    candidateWidgets: [
      {
        widgetFamily: "CUSTOM_WIDGET",
        title: "Custom",
        subtitle: "Supplied",
        priority: 1,
      },
    ],
  };
  const before = JSON.stringify(input);
  buildForgeAliveSmartWidgetStack(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("No UI frontend provider runtime or send imports exist", () => {
  const source = fs.readFileSync(path.join(__dirname, "../forge-alive/forge-alive-smart-widget-stack-read-model.js"), "utf8");
  assert.ok(!/react|vue|svelte|document\.|window\.|jsx|tsx/.test(source));
  assert.ok(!/openai|anthropic|gemini|fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(source));
  assert.ok(!/whatsapp|sms|delivery-adapter|send-execution|child_process|http|https|net|dns/.test(source));
});

for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error("FAIL - " + name);
    console.error(error);
    process.exit(1);
  }
}

console.log("Forge Alive Smart Widget Stack Read Model PASS " + passed + "/" + tests.length);
