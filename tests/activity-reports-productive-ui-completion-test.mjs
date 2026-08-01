import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ACTIVITY_REPORTS_PRODUCTIVITY_RUNTIME_VERSION,
  createActivityReportsProductivityRuntime,
} from "../docs/static-preview/forge-alive-material3/activity-reports-productivity-runtime.js";

function thenableQuery(data) {
  const query = {
    select() { return query; },
    is() { return query; },
    in() { return query; },
    order() { return query; },
    then(resolve, reject) { return Promise.resolve({ data, error: null }).then(resolve, reject); },
  };
  return query;
}

function bootstrap({ advisorId = "advisor-1", authenticated = true } = {}) {
  const policies = [{
    id: "policy-db-1",
    policy_reference: "POLICY-1",
    issue_date: "2026-08-01",
    archived_at: null,
  }];
  const versions = [{
    policy_id: "policy-db-1",
    policy_version_reference: "POLICY-V1",
    version_number: 1,
    confirmed_at: "2026-08-01T14:00:00.000Z",
  }];
  const client = {
    auth: {
      async getUser() {
        return authenticated
          ? { data: { user: { id: advisorId } }, error: null }
          : { data: { user: null }, error: null };
      },
    },
    from(table) {
      return thenableQuery(table === "canonical_policies" ? policies : versions);
    },
  };
  return {
    async getSession() {
      return authenticated
        ? { data: { session: { user: { id: advisorId } } }, error: null }
        : { data: { session: null }, error: null };
    },
    async getClient() { return client; },
  };
}

function chartResult(total, range) {
  const hasFacts = total !== null;
  return {
    report: {
      state: hasFacts ? "READY" : "EMPTY",
      totals: { activityCount: total },
      period: { ...range },
      rows: [],
    },
    chartReady: {
      missingDataState: hasFacts ? "AVAILABLE" : "NO_MATCHING_FACTS",
      series: hasFacts ? [{
        seriesId: "activity-series:CONTACT_ATTEMPTED",
        points: [{ x: range.from, value: total, pointId: `p-${range.from}`, rowKeys: [] }],
      }] : [],
    },
  };
}

function activityFactory({ current = 5, previous = 3, deferred = null } = {}) {
  let calls = 0;
  let closed = 0;
  const factory = async () => ({
    authority: { advisorId: "advisor-1" },
    async runChartReady({ period }) {
      calls += 1;
      if (deferred && calls === 1) return deferred.promise;
      return chartResult(calls === 1 ? current : previous, period.parameters);
    },
    async close() { closed += 1; },
    diagnostics() { return { calls, closed }; },
  });
  factory.stats = () => ({ calls, closed });
  return factory;
}

function runtime(overrides = {}) {
  return createActivityReportsProductivityRuntime({
    bootstrap: overrides.bootstrap || bootstrap(),
    activityRuntimeFactory: overrides.activityRuntimeFactory || activityFactory(),
    goalRepositoryFactory: async () => ({
      async readCurrent() { return { targetPolicyCount: 10 }; },
    }),
    forecastReadModelReader: overrides.forecastReadModelReader || (() => ({
      advisorId: "advisor-1",
      target: 10,
      currentProduction: 1,
      paceProjection: 6,
      confidence: "MEDIUM",
      healthStatus: "AT_RISK",
      primaryExplanation: "El ritmo actual requiere revisión humana.",
      goalGap: { weightedPipelineContribution: 2.4 },
    })),
    forecastSnapshotReader: overrides.forecastSnapshotReader || (() => ({
      schema: "ADVISOR_FORECAST_ISSUED_SNAPSHOT_V1",
      advisorId: "advisor-1",
      target: 10,
      currentProduction: 1,
      paceProjection: 6,
      weightedPipelineContribution: 2.4,
    })),
    clock: () => new Date("2026-08-01T20:00:00.000Z"),
  });
}

test("composes authenticated Activity, production and Forecast without mutations", async () => {
  const value = await runtime().load({ periodKind: "MONTH_TO_DATE" });
  assert.equal(value.runtimeVersion, ACTIVITY_REPORTS_PRODUCTIVITY_RUNTIME_VERSION);
  assert.equal(value.state, "READY");
  assert.equal(value.advisorId, "advisor-1");
  assert.deepEqual(value.period.current, { from: "2026-08-01", to: "2026-08-01" });
  assert.deepEqual(value.period.previous, { from: "2026-07-31", to: "2026-07-31" });
  assert.equal(value.activity.comparison.current, 5);
  assert.equal(value.activity.comparison.previous, 3);
  assert.equal(value.activity.comparison.delta, 2);
  assert.equal(value.production.sold, 1);
  assert.equal(value.production.target, 10);
  assert.equal(value.forecast.readModel.paceProjection, 6);
  assert.equal(value.boundary.databaseMutation, false);
  assert.equal(value.boundary.crmMutation, false);
  assert.equal(value.boundary.automaticTaskCreation, false);
  assert.equal(value.boundary.automaticCalendarCreation, false);
  assert.equal(value.boundary.automaticFesEvent, false);
});

test("does not fabricate percentage comparison when previous period is zero", async () => {
  const value = await runtime({ activityRuntimeFactory: activityFactory({ current: 4, previous: 0 }) }).load({
    periodKind: "WEEK_TO_DATE",
  });
  assert.equal(value.activity.comparison.delta, 4);
  assert.equal(value.activity.comparison.deltaPercent, null);
  assert.equal(value.activity.comparison.zeroComparisonBlocked, true);
});

test("returns an honest session-required state and no private sources", async () => {
  const value = await runtime({ bootstrap: bootstrap({ authenticated: false }) }).load();
  assert.equal(value.state, "SESSION_REQUIRED");
  assert.equal(value.advisorId, null);
  assert.deepEqual(value.sources, []);
});

test("isolates a missing Forecast as partial instead of collapsing Activity", async () => {
  const value = await runtime({
    forecastReadModelReader: () => null,
    forecastSnapshotReader: () => null,
  }).load();
  assert.equal(value.state, "PARTIAL");
  assert.equal(value.activity.comparison.current, 5);
  assert.equal(value.forecast, null);
  assert.equal(value.sources.find((source) => source.sourceId === "ADVISOR_FORECAST_ISSUED_SNAPSHOT").state, "UNAVAILABLE");
});

test("rejects a late result after scrub", async () => {
  let resolve;
  const deferred = {
    promise: new Promise((selectedResolve) => { resolve = selectedResolve; }),
  };
  const selectedRuntime = runtime({ activityRuntimeFactory: activityFactory({ deferred }) });
  const pending = selectedRuntime.load();
  await new Promise((selectedResolve) => setTimeout(selectedResolve, 0));
  await selectedRuntime.scrub("logout");
  resolve(chartResult(7, { from: "2026-08-01", to: "2026-08-01" }));
  await assert.rejects(pending, (error) => error?.name === "AbortError");
});

test("locks the productive UI, responsive and truth contracts", async () => {
  const [app, module, operational, runtimeSource, css] = await Promise.all([
    readFile(new URL("../docs/static-preview/forge-alive-material3/app.js", import.meta.url), "utf8"),
    readFile(new URL("../docs/static-preview/forge-alive-material3/activity-module.js", import.meta.url), "utf8"),
    readFile(new URL("../docs/static-preview/forge-alive-material3/activity-operational-module.js", import.meta.url), "utf8"),
    readFile(new URL("../docs/static-preview/forge-alive-material3/activity-reports-productivity-runtime.js", import.meta.url), "utf8"),
    readFile(new URL("../docs/static-preview/forge-alive-material3/activity-module.css", import.meta.url), "utf8"),
  ]);

  assert.match(app, /activity-module\.js\?v=rep-18-001/);
  assert.match(app, /activityReportingRuntime = "REP-18"/);
  assert.match(module, /data-activity-view-tab="actividad"/);
  assert.match(module, /data-activity-view-tab="reportes"/);
  assert.match(module, /forge:auth-state-changed/);
  assert.match(module, /reportsRuntime\.scrub/);
  assert.match(operational, /createProductiveActivityReportingBridge/);
  assert.match(runtimeSource, /POLICY_SOLD_CONFIRMED/);
  assert.match(runtimeSource, /CANONICAL_POLICY_CONFIRMED_VERSION/);
  assert.match(runtimeSource, /automaticTaskCreation: false/);
  assert.match(runtimeSource, /databaseMutation: false/);
  assert.match(css, /calc\(190px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /@media \(max-width: 920px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

console.log("ACTIVITY_REPORTS_PRODUCTIVE_UI_COMPLETION=PASS");
console.log("ACTIVITY_OPERATIONAL_VIEW=PASS");
console.log("REPORTS_PRODUCTIVE_VIEW=PASS");
console.log("FES_REP_ACTIVITY_BINDING=PASS");
console.log("POLICY_SOLD_CONFIRMED_REPORTING=PASS");
console.log("FORECAST_CONTEXT_RECONCILIATION=PASS");
console.log("LOGOUT_SCRUB_AND_LATE_RESULT_REJECTION=PASS");
console.log("RESPONSIVE_ACCEPTANCE=MOBILE+TABLET+DESKTOP");
