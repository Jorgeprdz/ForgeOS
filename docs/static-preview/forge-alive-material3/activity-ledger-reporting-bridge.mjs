import {
  createFesActivityReportSourceAdapter,
  FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION,
} from "../../../advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.mjs";

import {
  createActivityReportingRuntime,
} from "../../../advisor-os/reporting/runtime/activity-reporting-runtime.mjs";

export const PRODUCTIVE_ACTIVITY_REPORTING_BRIDGE_SCHEMA_VERSION =
  "productive-activity-reporting-bridge.v1";

export class ProductiveActivityReportingBridgeError extends Error {
  constructor(code, message, cause = null) {
    super(`ProductiveActivityReportingBridge: ${message}`, { cause });
    this.name = "ProductiveActivityReportingBridgeError";
    this.code = code;
  }
}

function fail(code, message, cause = null) {
  throw new ProductiveActivityReportingBridgeError(code, message, cause);
}

function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail("ACTIVITY_REPORTING_INPUT_INVALID", `${label} must be a non-empty string`);
  }
  return value.trim();
}

function canonicalTimeZone(value) {
  const zone = requiredString(value, "timeZone");
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone }).format(new Date(0));
  } catch (error) {
    fail("ACTIVITY_REPORTING_TIME_ZONE_INVALID", "timeZone must be an IANA zone", error);
  }
  return zone;
}

function createDeviceId(storage = globalThis.localStorage) {
  const key = "forge.fes.activity.device-id.v1";
  const existing = storage?.getItem?.(key);
  if (existing) return existing;

  const random = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const deviceId = `forge-web-${random}`;
  storage?.setItem?.(key, deviceId);
  return deviceId;
}

function normalizeLedgerEntries(entries, tenantId) {
  if (!Array.isArray(entries)) {
    fail("FES_LEDGER_ENTRIES_INVALID", "ledger entries must be an array");
  }

  return entries.map((entry, index) => {
    if (
      entry === null ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      entry.tenant_id !== tenantId ||
      entry.canonical_event?.tenant_id !== tenantId
    ) {
      fail(
        "FES_LEDGER_AUTHORITY_DRIFT",
        `ledger entry ${index} drifted from authenticated tenant authority`,
      );
    }
    return entry.canonical_event;
  });
}

export async function createProductiveActivityReportingBridge({
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  ledgerRuntimeApi = globalThis.ForgeActivityLedgerBrowserRuntimeFES02C,
  deviceId = null,
  timeZone = "America/Mexico_City",
  clock = () => new Date(),
  storage = globalThis.localStorage,
} = {}) {
  const zone = canonicalTimeZone(timeZone);

  if (typeof ledgerRuntimeApi?.createFromForgeAlive !== "function") {
    fail(
      "FES_LEDGER_BROWSER_RUNTIME_INVALID",
      "the productive FES ledger runtime is unavailable",
    );
  }

  const selectedDeviceId = requiredString(
    deviceId ?? createDeviceId(storage),
    "deviceId",
  );

  let ledger;
  try {
    ledger = await ledgerRuntimeApi.createFromForgeAlive({
      bootstrap,
      device_id: selectedDeviceId,
      clock: () => clock().toISOString(),
    });
  } catch (error) {
    fail(
      "FES_LEDGER_SESSION_BINDING_FAILED",
      "the authenticated FES ledger could not be opened",
      error,
    );
  }

  const tenantId = requiredString(ledger?.tenant_id, "ledger.tenant_id");
  const advisorId = tenantId;
  let lastRead = null;
  let closed = false;

  async function readCanonicalSnapshot() {
    if (closed) {
      fail("ACTIVITY_REPORTING_BRIDGE_CLOSED", "the productive bridge is closed");
    }

    let syncResult;
    try {
      syncResult = await ledger.syncOnce();
    } catch (error) {
      fail(
        "FES_LEDGER_SYNC_UNAVAILABLE",
        "the canonical FES authority could not be synchronized",
        error,
      );
    }

    const entries = await ledger.listEntries();
    const events = normalizeLedgerEntries(entries, tenantId);
    const cursor = await ledger.getCursor?.();

    lastRead = freeze({
      synchronizedAt: clock().toISOString(),
      eventCount: events.length,
      cursor: cursor ?? null,
      syncResult: syncResult ?? null,
    });

    return freeze({
      schemaVersion: FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION,
      authority: {
        organizationId: tenantId,
        advisorId,
      },
      source: {
        sourceId: "fes-activity-ledger-browser-runtime",
        sourceVersion: ledger.runtime_version ?? "FES-02C.1",
        authority: "FES_CANONICAL_ACTIVITY_EVENT",
      },
      events,
    });
  }

  const sourceAdapter = createFesActivityReportSourceAdapter({
    organizationId: tenantId,
    advisorId,
    timeZone: zone,
    readEvents: readCanonicalSnapshot,
  });

  const reportingRuntime = createActivityReportingRuntime({
    sourcePort: sourceAdapter.sourcePort,
    clock,
  });

  const authority = freeze({
    organizationId: tenantId,
    advisorId,
    source: "AUTHENTICATED_FES_LEDGER",
  });

  const api = {
    schemaVersion: PRODUCTIVE_ACTIVITY_REPORTING_BRIDGE_SCHEMA_VERSION,
    authority,
    timeZone: zone,

    createRequest(input) {
      return reportingRuntime.createRequest(input);
    },

    resolveRequest(input) {
      return reportingRuntime.resolveRequest(input);
    },

    runReport(input) {
      return reportingRuntime.runReport(input);
    },

    runChartReady(input) {
      return reportingRuntime.runChartReady(input);
    },

    // Read-only projection gateway for consumers that need canonical facts whose
    // semantics REP intentionally does not relabel (referrals/calls/advisor referrals).
    // It reuses the same authenticated FES runtime and never exposes a direct table read.
    readCanonicalEvents() {
      return readCanonicalSnapshot();
    },

    diagnostics() {
      return freeze({
        schemaVersion: "productive-activity-reporting-diagnostics.v1",
        authority,
        timeZone: zone,
        ledger: ledger.diagnostics?.() ?? null,
        lastRead,
        boundary: {
          eventTruthAuthority: false,
          activityReadAuthority: true,
          canonicalEventProjectionRead: true,
          activityWriteAuthority: false,
          ledgerMutationAuthority: false,
          reportingAggregationAuthority: false,
          chartProjectionAuthority: true,
          uiRenderingAuthority: false,
          aiDecisionAuthority: false,
        },
      });
    },

    async close() {
      if (closed) return;
      closed = true;
      await ledger.close?.();
    },

    boundary: freeze({
      authenticatedLedgerBinding: true,
      explicitSyncBeforeRead: true,
      cachedDataPromotedAsCompleteTruth: false,
      eventTruthAuthority: false,
      activityReadAuthority: true,
      canonicalEventProjectionRead: true,
      activityWriteAuthority: false,
      ledgerMutationAuthority: false,
      reportingAggregationAuthority: false,
      chartProjectionAuthority: true,
      uiRenderingAuthority: false,
      aiDecisionAuthority: false,
      parallelLedger: false,
    }),
  };

  return freeze(api);
}
