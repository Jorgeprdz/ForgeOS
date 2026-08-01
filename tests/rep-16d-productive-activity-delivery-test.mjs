import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash as createNativeHash } from "node:crypto";

import {
  createHash as createBrowserHash,
} from "../docs/static-preview/forge-alive-material3/node-crypto-shim.mjs";

import {
  createProductiveActivityReportingBridge,
  ProductiveActivityReportingBridgeError,
  PRODUCTIVE_ACTIVITY_REPORTING_BRIDGE_SCHEMA_VERSION,
} from "../docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs";

const FIXED_NOW = new Date("2026-07-31T23:00:00.000Z");

function canonicalEvent(overrides = {}) {
  return {
    schema_version: "forge.activity_event.v1",
    event_id: "evt-follow-up-1",
    event_type: "DUE_ACTION_COMPLETED",
    tenant_id: "advisor-1",
    idempotency_key: "evt-follow-up-1",
    occurred_at: "2026-07-10T16:00:00.000Z",
    recorded_at: "2026-07-10T16:00:01.000Z",
    confirmation_state: "CONFIRMED",
    actor: {
      type: "ADVISOR",
      id: "advisor-1",
    },
    payload: {},
    correction_of: null,
    ...overrides,
  };
}

function ledgerEntry(event = canonicalEvent(), overrides = {}) {
  return {
    tenant_id: event.tenant_id,
    canonical_event: event,
    ...overrides,
  };
}

function ledgerRuntimeApi({
  entries = [ledgerEntry()],
  syncError = null,
  calls = {},
} = {}) {
  return {
    async createFromForgeAlive(options) {
      calls.createOptions = options;
      return {
        runtime_version: "FES-02C.1",
        tenant_id: "advisor-1",
        async syncOnce() {
          calls.syncCount = (calls.syncCount ?? 0) + 1;
          if (syncError) throw syncError;
          return { pushed: 0, pulled: entries.length };
        },
        async listEntries() {
          calls.listCount = (calls.listCount ?? 0) + 1;
          return entries;
        },
        async getCursor() {
          return "cursor-1";
        },
        diagnostics() {
          return {
            runtime_version: "FES-02C.1",
            productive_ui_binding: false,
            background_sync: false,
          };
        },
        async close() {
          calls.closed = true;
        },
      };
    },
  };
}

function chartRequest() {
  return {
    period: {
      kind: "CUSTOM_RANGE",
      parameters: {
        from: "2026-07-10",
        to: "2026-07-10",
      },
    },
    timeZone: "America/Mexico_City",
    asOf: FIXED_NOW.toISOString(),
  };
}

test("browser SHA-256 shim matches native Node hashing", () => {
  for (const value of ["", "abc", "ForgeOS reporting identity ñ"]) {
    const expected = createNativeHash("sha256").update(value).digest("hex");
    const actual = createBrowserHash("sha256").update(value).digest("hex");
    assert.equal(actual, expected);
  }

  const expected = createNativeHash("sha256")
    .update("Forge")
    .update("OS")
    .digest("hex");
  const actual = createBrowserHash("sha256")
    .update("Forge")
    .update("OS")
    .digest("hex");
  assert.equal(actual, expected);
});

test("binds the authenticated FES ledger to the universal Activity runtime", async () => {
  const calls = {};
  const bridge = await createProductiveActivityReportingBridge({
    ledgerRuntimeApi: ledgerRuntimeApi({ calls }),
    deviceId: "device-rep-16d",
    storage: null,
    clock: () => FIXED_NOW,
  });

  assert.equal(
    bridge.schemaVersion,
    PRODUCTIVE_ACTIVITY_REPORTING_BRIDGE_SCHEMA_VERSION,
  );
  assert.equal(bridge.authority.organizationId, "advisor-1");
  assert.equal(bridge.authority.advisorId, "advisor-1");
  assert.equal(bridge.boundary.authenticatedLedgerBinding, true);
  assert.equal(bridge.boundary.explicitSyncBeforeRead, true);
  assert.equal(bridge.boundary.parallelLedger, false);
  assert.equal(bridge.boundary.activityWriteAuthority, false);
  assert.equal(typeof bridge.appendCanonicalEvent, "undefined");

  const result = await bridge.runChartReady(chartRequest());

  assert.equal(calls.createOptions.device_id, "device-rep-16d");
  assert.equal(calls.syncCount, 1);
  assert.equal(calls.listCount, 1);
  assert.equal(result.report.state, "READY");
  assert.equal(result.report.totals.activityCount, 1);
  assert.equal(result.report.provenance[0].sourceId, "fes-activity-ledger-browser-runtime");
  assert.equal(result.report.provenance[0].authority, "FES_CANONICAL_ACTIVITY_EVENT");
  assert.equal(result.chartReady.missingDataState, "AVAILABLE");
  assert.equal(result.chartReady.series.length, 1);
  assert.equal(
    result.chartReady.series[0].seriesId,
    "activity-series:FOLLOW_UP_COMPLETED",
  );
  assert.equal(result.chartReady.series[0].points[0].value, 1);

  const diagnostics = bridge.diagnostics();
  assert.equal(diagnostics.lastRead.eventCount, 1);
  assert.equal(diagnostics.lastRead.cursor, "cursor-1");
  assert.equal(diagnostics.boundary.aiDecisionAuthority, false);

  await bridge.close();
  assert.equal(calls.closed, true);
});

test("does not promote cached ledger data when canonical synchronization fails", async () => {
  const bridge = await createProductiveActivityReportingBridge({
    ledgerRuntimeApi: ledgerRuntimeApi({
      syncError: new Error("NETWORK_DOWN"),
    }),
    deviceId: "device-sync-failure",
    storage: null,
    clock: () => FIXED_NOW,
  });

  await assert.rejects(
    bridge.runChartReady(chartRequest()),
    (error) => {
      assert.ok(error instanceof ProductiveActivityReportingBridgeError);
      assert.equal(error.code, "FES_LEDGER_SYNC_UNAVAILABLE");
      return true;
    },
  );
});

test("rejects ledger entries outside authenticated tenant authority", async () => {
  const drifted = ledgerEntry(
    canonicalEvent({ tenant_id: "other-tenant" }),
    { tenant_id: "other-tenant" },
  );
  const bridge = await createProductiveActivityReportingBridge({
    ledgerRuntimeApi: ledgerRuntimeApi({ entries: [drifted] }),
    deviceId: "device-authority-drift",
    storage: null,
    clock: () => FIXED_NOW,
  });

  await assert.rejects(
    bridge.runChartReady(chartRequest()),
    (error) => {
      assert.ok(error instanceof ProductiveActivityReportingBridgeError);
      assert.equal(error.code, "FES_LEDGER_AUTHORITY_DRIFT");
      return true;
    },
  );
});

test("locks canonical shell and Material 3 Activity delivery boundaries", async () => {
  const base = new URL(
    "../docs/static-preview/forge-alive-material3/",
    import.meta.url,
  );
  const [app, navigation, moduleSource, styles] = await Promise.all([
    readFile(new URL("app.js", base), "utf8"),
    readFile(new URL("forge-navigation-contract.js", base), "utf8"),
    readFile(new URL("activity-module.js", base), "utf8"),
    readFile(new URL("activity-module.css", base), "utf8"),
  ]);

  assert.match(app, /ForgeActivityLedgerBrowserRuntimeFES02C/);
  assert.match(app, /node:crypto/);
  assert.match(app, /registerRouteModule\("actividad", activity\)/);
  assert.match(app, /dataset\.activityReportingRuntime = "REP-16D"/);
  assert.match(navigation, /routeId: "actividad"/);
  assert.match(navigation, /availability: "available"/);
  assert.match(moduleSource, /runChartReady/);
  assert.match(moduleSource, /const total = report\.totals\.activityCount/);
  assert.match(moduleSource, /data-row-keys/);
  assert.match(moduleSource, /No mostraremos datos locales como si fueran completos/);
  assert.doesNotMatch(moduleSource, /appendCanonicalEvent/);
  assert.doesNotMatch(moduleSource, /score|scoring/i);
  assert.match(styles, /calc\(170px \+ env\(safe-area-inset-bottom\)\)/);
});
