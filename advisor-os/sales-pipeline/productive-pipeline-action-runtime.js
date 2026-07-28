"use strict";

(function forgeProductivePipelineActionRuntimeFES08(global) {
  const VERSION = "FES-08.PRODUCTIVE-ACTION.1";
  const CONFIRMED = Object.freeze(new Set([
    "CALL_NOT_ANSWERED_CONFIRMED",
    "CALL_CONNECTED_CONFIRMED",
    "APPOINTMENT_SCHEDULED",
    "APPOINTMENT_HELD",
    "APPOINTMENT_NOT_HELD",
    "APPOINTMENT_RESCHEDULED",
    "APPOINTMENT_NO_SHOW",
  ]));
  const SOURCE_TYPES = Object.freeze({
    OBJECTION_CAPTURED: "ADVISOR_REPORTED",
    OBJECTION_ANALYSIS_GENERATED: "SYSTEM_GENERATED",
    OBJECTION_RESPONSE_GENERATED: "SYSTEM_GENERATED",
    OBJECTION_RESPONSE_EDITED: "SYSTEM_OBSERVED",
    OBJECTION_RESPONSE_APPROVED: "ADVISOR_CONFIRMED",
    OBJECTION_RESPONSE_USED: "ADVISOR_CONFIRMED",
    CALL_NOT_ANSWERED_CONFIRMED: "ADVISOR_CONFIRMED",
    CALL_CONNECTED_CONFIRMED: "ADVISOR_CONFIRMED",
    APPOINTMENT_SCHEDULED: "ADVISOR_CONFIRMED",
    APPOINTMENT_HELD: "ADVISOR_CONFIRMED",
    APPOINTMENT_NOT_HELD: "ADVISOR_CONFIRMED",
    APPOINTMENT_RESCHEDULED: "ADVISOR_CONFIRMED",
    APPOINTMENT_NO_SHOW: "ADVISOR_CONFIRMED",
  });

  function opaque(value, label) {
    const normalized = String(value || "").trim();
    if (!normalized || !/^[A-Za-z0-9._:@/-]+$/.test(normalized)) throw new TypeError(`${label}_REQUIRED`);
    return normalized;
  }

  function reference(prefix, prospectId, time = Date.now()) {
    return `${prefix}-${prospectId}-${time}`;
  }

  let performanceModulePromise = null;
  function loadPerformanceModule({ document = global.document, timeoutMs = 10000 } = {}) {
    if (performanceModulePromise) return performanceModulePromise;
    performanceModulePromise = new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.hidden = true;
      iframe.setAttribute("aria-hidden", "true");
      const timeout = global.setTimeout(() => {
        iframe.remove();
        performanceModulePromise = null;
        reject(new Error("PERFORMANCE_BROWSER_READ_TIMEOUT"));
      }, timeoutMs);
      iframe.addEventListener("load", () => {
        const realm = iframe.contentWindow;
        const realmDocument = iframe.contentDocument;
        const importMap = realmDocument.createElement("script");
        importMap.type = "importmap";
        importMap.textContent = JSON.stringify({
          imports: {
            "node:crypto": "data:text/javascript,export function createHash(){throw new Error('BROWSER_READ_ONLY_NO_HASH')}",
          },
        });
        realmDocument.head.append(importMap);
        const module = realmDocument.createElement("script");
        module.type = "module";
        module.textContent = `import * as api from "/ForgeOS/advisor-os/performance/runtime/supabase-performance-read-runtime.mjs"; window.__forgePerformanceReadModule=api; window.parent.postMessage({type:"FORGE_PERFORMANCE_READ_READY"},"${global.location.origin}");`;
        realmDocument.head.append(module);
      }, { once: true });
      const receive = event => {
        if (event.origin !== global.location.origin || event.source !== iframe.contentWindow || event.data?.type !== "FORGE_PERFORMANCE_READ_READY") return;
        global.removeEventListener("message", receive);
        global.clearTimeout(timeout);
        const api = iframe.contentWindow.__forgePerformanceReadModule;
        if (typeof api?.createSupabasePerformanceReadRuntime !== "function") {
          iframe.remove();
          performanceModulePromise = null;
          reject(new Error("PERFORMANCE_BROWSER_READ_EXPORT_INVALID"));
          return;
        }
        resolve(Object.freeze({ api, iframe }));
      };
      global.addEventListener("message", receive);
      document.body.append(iframe);
    });
    return performanceModulePromise;
  }

  async function create({ client, clock = () => new Date().toISOString(), ledgerRuntime = null, performanceRefresh = null } = {}) {
    if (!client?.auth?.getUser || !client?.rpc) throw new TypeError("PRODUCTIVE_ACTION_CLIENT_REQUIRED");
    const auth = await client.auth.getUser();
    const user = auth?.data?.user;
    if (auth?.error || !user?.id) throw new Error("PRODUCTIVE_ACTION_AUTH_REQUIRED");
    const organizationId = user.app_metadata?.organization_id || user.app_metadata?.organizationId;
    if (!organizationId) throw new Error("PRODUCTIVE_ACTION_ORGANIZATION_REQUIRED");
    const authority = Object.freeze({
      organizationId: opaque(organizationId, "ORGANIZATION_ID"),
      advisorId: opaque(user.id, "ADVISOR_ID"),
      authenticatedUserId: opaque(user.id, "AUTHENTICATED_USER_ID"),
      tenantId: opaque(user.id, "TENANT_ID"),
    });
    const ledger = ledgerRuntime || await global.ForgeActivityLedgerBrowserRuntimeFES02C.createFromForgeAlive();
    const activity = global.ForgeBrowserActivityCompositionFES08A.create({ client, authority });

    async function refreshPerformance() {
      if (typeof performanceRefresh === "function") {
        return performanceRefresh({ client, authority, clock });
      }
      const loaded = await loadPerformanceModule();
      const runtime = loaded.api.createSupabasePerformanceReadRuntime({
        client,
        organizationId: authority.organizationId,
        advisorId: authority.advisorId,
      });
      const now = new Date(clock());
      const result = await runtime.readDay({
        evaluationDate: now.toISOString().slice(0, 10),
        asOf: now.toISOString(),
      });
      global.dispatchEvent?.(new CustomEvent("forge:performance-read-refreshed", { detail: result }));
      return result;
    }

    async function record({ actionCode, prospectId, payload, occurredAt = clock(), evidenceReferences = [] } = {}) {
      const sourceType = SOURCE_TYPES[actionCode];
      if (!sourceType) throw new Error("PRODUCTIVE_ACTION_SEMANTIC_UNSUPPORTED");
      const prospectReference = opaque(prospectId, "PROSPECT_REFERENCE");
      const observationSource = {
        observation_reference: reference("observation", prospectReference),
        tenant_id: authority.tenantId,
        actor_id: authority.advisorId,
        prospect_id: prospectReference,
        action_code: actionCode,
        source_type: sourceType,
        occurred_at: occurredAt,
        recorded_at: clock(),
        payload: { ...payload, prospect_reference: prospectReference },
        evidence_references: evidenceReferences.length
          ? [...evidenceReferences]
          : [reference("evidence", prospectReference)],
      };
      const observation = global.ForgePassiveCaptureBridgeFES05A.createPassiveCaptureObservation(observationSource);
      const canonicalEvent = global.ForgeBridgeCanonicalEventAdapterFES05C.createCanonicalEventFromObservation({
        observation,
        observation_source: observationSource,
      });
      const ledgerResult = await ledger.appendCanonicalEvent({
        canonical_event: canonicalEvent,
        evidence_references: observation.evidence_references,
      });
      const ledgerSync = await ledger.syncOnce();
      const activityResult = await activity.appendEvent({ event: canonicalEvent, timeZone: "America/Mexico_City" });
      const activityRecords = await activity.list();
      const performanceRead = await refreshPerformance();
      const detail = Object.freeze({
        version: VERSION,
        actionCode,
        prospectReference,
        canonicalEvent,
        ledgerResult,
        ledgerSync,
        activityResult,
        activityRecords,
        performanceRead,
      });
      global.dispatchEvent?.(new CustomEvent("forge:productive-action-confirmed", { detail }));
      global.dispatchEvent?.(new CustomEvent("forge:activity-records-refreshed", {
        detail: { prospectReference, records: activityRecords },
      }));
      return detail;
    }

    async function confirm(input = {}) {
      if (!CONFIRMED.has(input.actionCode)) throw new Error("PRODUCTIVE_ACTION_CONFIRMATION_UNSUPPORTED");
      return record(input);
    }

    return Object.freeze({
      version: VERSION,
      authority,
      record,
      confirm,
      listActivity: activity.list,
      refreshPerformance,
      diagnostics: () => Object.freeze({
        version: VERSION,
        canonicalFes: true,
        activityRpcOnly: true,
        performanceWrite: false,
        pipelineTransitionMutation: false,
      }),
    });
  }

  const api = Object.freeze({ VERSION, create, reference, loadPerformanceModule });
  global.ForgeProductivePipelineActionRuntimeFES08 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
