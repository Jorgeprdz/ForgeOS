"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  calculateManagerAdvisorDashboardContext
} = require("../dashboard-intelligence/manager-advisor-dashboard-engine");

let total = 0;
let fail = 0;

function test(name, fn) {
  total += 1;
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    fail += 1;
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
  }
}

function assertFalseFlags(result) {
  [
    "automaticDecisionAllowed",
    "createsRevenueTruth",
    "createsCompensationTruth",
    "createsPayoutTruth",
    "createsAdvisorLifecycleTruth",
    "createsHumanRankingTruth",
    "createsPromotionDecisionTruth",
    "createsPunishmentTruth",
    "createsTerminationTruth",
    "createsPrecontractTruth",
    "createsHiringTruth",
    "createsDatabaseWrite",
    "createsFilesystemWrite",
    "createsCacheWrite",
    "createsMigrationWrite",
    "createsSchemaWrite",
    "createsUiRendering"
  ].forEach((flag) => assert.strictEqual(result[flag], false, `${flag} must be false`));
}

const evidence = {
  evidenceRefs: ["E1"],
  sourceEvidenceIds: ["S1"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

console.log("\nFORGE MANAGER ADVISOR DASHBOARD ENGINE MASTER TEST v1.0\n");

test("Advisor activity card is context only", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: { activityContext: { activities: 12 } },
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.advisorActivityCard.contextOnly, true);
});

test("Followup prospecting referral card is context only", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: { followupProspectingReferralContext: { followups: 5 } },
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.followupProspectingReferralCard.contextOnly, true);
});

test("Appointment and pipeline cards are context only", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: { appointmentContext: { appointments: 2 }, pipelineContext: { pipeline: 7 } },
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.appointmentCard.contextOnly, true);
  assert.strictEqual(result.cards.pipelineCard.contextOnly, true);
});

test("Missing activity does not become zero activity", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: {},
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.advisorActivityCard.cardStatus, "UNKNOWN");
});

test("Missing pipeline does not become low pipeline", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: {},
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.pipelineCard.cardStatus, "UNKNOWN");
});

test("Production card does not create revenue truth", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: { productionContext: { production: 100 } },
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.productionContextCard.dashboardCardCreatesRevenueTruth, false);
  assert.strictEqual(result.createsRevenueTruth, false);
});

test("Qualification card does not create promotion or lifecycle truth", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: { qualificationContext: { qualification: "context" } },
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.qualificationContextCard.dashboardCardCreatesPromotionTruth, false);
  assert.strictEqual(result.cards.qualificationContextCard.dashboardCardCreatesLifecycleTruth, false);
});

test("Support coaching card does not create punishment truth", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: { supportCoachingContext: { needsSupport: true } },
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.cards.supportCoachingContextCard.dashboardCardCreatesPunishmentTruth, false);
});

test("Forecast scenario summary is context only", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: {},
    advisorHistoricalContext: {},
    advisorForecastContext: { stretchScenario: { projectedContext: { appointments: 9 } } }
  });
  assert.strictEqual(result.cards.forecastScenarioSummaryCard.valueContext[2].contextOnly, true);
});

test("Missing stale evidence propagates", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } },
    advisorMetricsContext: {},
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assert(result.boundary.staleSignals.includes("STALE_FRESHNESS"));
});

test("Forbidden uses are blocked", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: {},
    advisorHistoricalContext: {},
    advisorForecastContext: {},
    requestedUse: "REVENUE_TRUTH"
  });
  assert.strictEqual(result.advisorDashboardDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allowed uses are allowed", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: {},
    advisorHistoricalContext: {},
    advisorForecastContext: {},
    requestedUse: "DASHBOARD_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("DASHBOARD_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, advisorMetricsContext: {}, advisorHistoricalContext: {}, advisorForecastContext: {} };
  const before = JSON.stringify(input);
  calculateManagerAdvisorDashboardContext(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("No direct Advisor OS import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../dashboard-intelligence/manager-advisor-dashboard-engine.js"), "utf8");
  assert(!/require\(["'][^"']*advisor-os/i.test(source));
});

test("No legacy Manager OS import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../dashboard-intelligence/manager-advisor-dashboard-engine.js"), "utf8");
  assert(!/require\(["'][^"']*manager-os\/(dashboard|momentum|report)/i.test(source));
});

test("All truth and write flags remain false", () => {
  const result = calculateManagerAdvisorDashboardContext({
    sourceEvidence: evidence,
    advisorMetricsContext: {},
    advisorHistoricalContext: {},
    advisorForecastContext: {}
  });
  assertFalseFlags(result);
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
