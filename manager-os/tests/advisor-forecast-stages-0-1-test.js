const assert = require("assert");
const { getAdvisorForecastSourceAuthority, buildAdvisorForecastRuntimeReconciliation } = require("../forecast/advisor-forecast-runtime-reconciliation");
const { ADVISOR_FORECAST_SIGNAL_STATES, createAdvisorForecastSignal, createMissingAdvisorForecastSignal, buildAdvisorForecastInput, validateAdvisorForecastInput } = require("../forecast/advisor-forecast-input-contract");

console.log("\nADVISOR FORECAST STAGES 0-1 TEST\n");

function signal(sourceAuthority, value = 1, unit = "count") {
  return createAdvisorForecastSignal({ state: "KNOWN", value, unit, sourceAuthority, evidenceRefs: [`${sourceAuthority}-ref`] });
}

function input() {
  return buildAdvisorForecastInput({
    advisorId: "advisor-1",
    period: { yearMonth: "2026-08", start: "2026-08-01", end: "2026-08-31", timeZone: "America/Mexico_City" },
    target: signal("ADVISOR_MONTHLY_POLICY_GOAL", 10, "policies"),
    production: signal("PRODUCTION_EVENTS", 3, "policies"),
    pipeline: signal("PIPELINE", 4, "opportunities"),
    activity: signal("FES", 8, "events"),
    appointments: signal("ADVISOR_MANAGER_SNAPSHOT", 3),
    followups: signal("ADVISOR_MANAGER_SNAPSHOT", 5),
    prospecting: signal("ADVISOR_MANAGER_SNAPSHOT", 6),
    referrals: signal("ADVISOR_MANAGER_SNAPSHOT", 2),
    historicalContext: signal("MANAGER_ADVISOR_HISTORICAL_ANALYTICS", { periods: 3 }, "context"),
    evidence: { evidenceRefs: ["input-ref"], sourceOwners: ["MANAGER_OS"] }
  });
}

const tests = [
  ["target owner", () => assert.equal(getAdvisorForecastSourceAuthority("target").primaryAuthority, "ADVISOR_MONTHLY_POLICY_GOAL")],
  ["production owner", () => assert.equal(getAdvisorForecastSourceAuthority("production").primaryAuthority, "PRODUCTION_EVENTS")],
  ["legacy scalar rejected", () => {
    const r = buildAdvisorForecastRuntimeReconciliation();
    assert.equal(r.runtimeMap.find((x) => x.componentId === "LEGACY_REVENUE_FORECAST_ENGINE").disposition, "REJECT_FOR_ADVISOR_FORECAST_V1");
    assert.equal(r.duplicateCalculationPolicy.uiCalculationAllowed, false);
  }],
  ["direct UI and DB blocked", () => {
    const r = buildAdvisorForecastRuntimeReconciliation();
    assert.ok(r.forbiddenDirectDependencies.includes("MATERIAL3_HOME"));
    assert.ok(r.forbiddenDirectDependencies.includes("SUPABASE_CLIENT"));
    assert.equal(r.truthFlags.createsDatabaseWrite, false);
  }],
  ["canonical input valid", () => assert.equal(validateAdvisorForecastInput(input()).valid, true)],
  ["missing differs from zero", () => {
    const x = createMissingAdvisorForecastSignal("PIPELINE");
    assert.equal(x.state, ADVISOR_FORECAST_SIGNAL_STATES.MISSING);
    assert.equal(x.value, null);
  }],
  ["zero requires evidence", () => {
    assert.throws(() => createAdvisorForecastSignal({ state: "ZERO", value: 0, sourceAuthority: "FES" }), /requires direct evidence/);
    assert.equal(createAdvisorForecastSignal({ state: "ZERO", value: 0, sourceAuthority: "FES", evidenceRefs: ["zero-ref"] }).state, "ZERO");
  }],
  ["stale retains value", () => assert.equal(createAdvisorForecastSignal({ state: "STALE", value: 4, sourceAuthority: "PIPELINE" }).value, 4)],
  ["truth flags false", () => Object.values(input().truthFlags).forEach((value) => assert.equal(value, false))]
];

let failed = 0;
for (const [name, run] of tests) {
  try { run(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error); }
}
console.log(`Total: ${tests.length} Pass: ${tests.length - failed} Fail: ${failed}`);
if (failed) process.exit(1);
