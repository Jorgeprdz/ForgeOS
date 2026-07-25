"use strict";

import "../offline/due-action-offline-contract.js";
import "../offline/due-action-indexeddb-store.js";
import "../offline/due-action-sync-journal.js";
import "../offline/due-action-sync-service.js";
import "../offline/due-action-supabase-gateway.js";

import { SupabaseRuntime } from "../../supabase-runtime.js";
import { createMiDiaFollowUpReadModel } from "./mi-dia-follow-up-read-model.js";

export const RUNTIME_VERSION = "NFAST-09.3E";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function defaultOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

function defaultVisible() {
  return typeof document === "undefined" ||
    document.visibilityState === "visible";
}

function dependencies() {
  return {
    store: globalThis.ForgeDueActionIndexedDbStoreNFAST09,
    journal: globalThis.ForgeDueActionSyncJournalNFAST09,
    sync: globalThis.ForgeDueActionSyncServiceNFAST09,
    gateway: globalThis.ForgeDueActionSupabaseGatewayNFAST09,
  };
}

export function createMiDiaDueActionRuntime({
  store = null,
  journal = null,
  syncService = null,
  gateway = null,
  client = null,
  remoteEnabled = true,
  clock = () => new Date().toISOString(),
  onlineProvider = defaultOnline,
  visibleProvider = defaultVisible,
  eventTarget = typeof window !== "undefined" ? window : null,
  visibilityTarget = typeof document !== "undefined" ? document : null,
  timerApi = { setInterval, clearInterval },
  intervalMs = 60_000,
} = {}) {
  if (!Number.isInteger(intervalMs) || intervalMs < 1_000) {
    throw new TypeError("INTERVAL_INVALID");
  }

  const modules = dependencies();
  const localStore = store || modules.store?.create();

  if (!localStore || typeof localStore.listDueActions !== "function") {
    throw new TypeError("DUE_ACTION_STORE_INVALID");
  }

  const syncJournal = remoteEnabled
    ? (journal || modules.journal?.create())
    : null;
  const remoteGateway = remoteEnabled
    ? (gateway || modules.gateway?.create(client || SupabaseRuntime.getClient()))
    : null;
  const synchronizer = remoteEnabled
    ? (syncService || modules.sync?.create({
        store: localStore,
        journal: syncJournal,
        gateway: remoteGateway,
        clock,
      }))
    : null;

  if (remoteEnabled &&
      (!synchronizer || typeof synchronizer.syncAdvisor !== "function")) {
    throw new TypeError("SYNC_SERVICE_INVALID");
  }

  let advisor = null;
  let timeZone = null;
  let render = null;
  let onStatus = null;
  let fingerprint = null;
  let intervalId = null;
  let pendingSync = null;
  let mounted = false;
  let destroyed = false;
  const cleanups = [];

  function status(payload) {
    onStatus?.(deepFreeze({ runtimeVersion: RUNTIME_VERSION, ...payload }));
  }

  async function readLocal(trigger) {
    const records = await localStore.listDueActions(advisor);
    const viewModel = createMiDiaFollowUpReadModel({
      records,
      asOf: clock(),
      timeZone,
    });

    const changed = viewModel.fingerprint !== fingerprint;
    if (changed) {
      fingerprint = viewModel.fingerprint;
      render(viewModel, { trigger, source: "LOCAL_REPLICA" });
    }

    return deepFreeze({ changed, viewModel });
  }

  async function performSync(trigger) {
    if (!remoteEnabled) return deepFreeze({ status: "REMOTE_DISABLED" });
    if (!mounted || destroyed) return deepFreeze({ status: "NOT_MOUNTED" });
    if (!onlineProvider()) {
      status({ status: "OFFLINE", trigger });
      return deepFreeze({ status: "OFFLINE" });
    }

    status({ status: "SYNCING", trigger });

    try {
      const result = await synchronizer.syncAdvisor({
        advisorPartitionKey: advisor,
        online: true,
        authenticated: true,
        trigger,
      });
      const local = await readLocal(`${trigger}:SYNC_RESULT`);
      status({ status: result.status, trigger, rerendered: local.changed });
      return deepFreeze({ ...result, rerendered: local.changed });
    } catch (error) {
      status({
        status: "SYNC_ERROR",
        trigger,
        code: error?.code || "SYNC_ERROR",
      });
      return deepFreeze({
        status: "SYNC_ERROR",
        code: error?.code || "SYNC_ERROR",
      });
    }
  }

  function requestSync(trigger) {
    if (pendingSync) return pendingSync;
    pendingSync = performSync(trigger).finally(() => {
      pendingSync = null;
    });
    return pendingSync;
  }

  function bind(target, name, handler) {
    if (!target?.addEventListener) return;
    target.addEventListener(name, handler);
    cleanups.push(() => target.removeEventListener(name, handler));
  }

  async function refreshAndSync(trigger) {
    await readLocal(trigger);
    return requestSync(trigger);
  }

  async function mount(options = {}) {
    if (mounted) throw new TypeError("RUNTIME_ALREADY_MOUNTED");

    advisor = String(options.advisorPartitionKey || "").trim();
    timeZone = String(
      options.timeZone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "America/Mexico_City",
    ).trim();
    render = options.render;
    onStatus = options.onStatus || null;

    if (!advisor || typeof render !== "function") {
      throw new TypeError("RUNTIME_MOUNT_INVALID");
    }

    mounted = true;
    destroyed = false;

    const initial = await readLocal("BOOTSTRAP_LOCAL");

    bind(eventTarget, "focus", () => void refreshAndSync("FOCUS"));
    bind(eventTarget, "online", () => void requestSync("ONLINE"));
    bind(
      eventTarget,
      "nfast09:due-action-mutated",
      () => void refreshAndSync("LOCAL_MUTATION"),
    );
    bind(visibilityTarget, "visibilitychange", () => {
      if (visibleProvider()) void refreshAndSync("VISIBILITY_VISIBLE");
    });

    intervalId = timerApi.setInterval?.(() => {
      if (visibleProvider()) void refreshAndSync("VISIBLE_TICK");
    }, intervalMs) ?? null;

    const syncPromise = requestSync("BOOTSTRAP");

    return deepFreeze({
      initialViewModel: initial.viewModel,
      initialRenderSource: "LOCAL_REPLICA",
      syncPromise,
      requestSync,
      refreshLocal: trigger =>
        readLocal(trigger || "MANUAL_LOCAL_REFRESH"),
      destroy,
    });
  }

  async function destroy() {
    if (destroyed) return;
    destroyed = true;
    mounted = false;
    cleanups.splice(0).forEach(cleanup => cleanup());

    if (intervalId !== null) {
      timerApi.clearInterval?.(intervalId);
      intervalId = null;
    }

    await Promise.allSettled([
      localStore.close?.(),
      syncJournal?.close?.(),
    ]);

    advisor = null;
    timeZone = null;
    render = null;
    onStatus = null;
    fingerprint = null;
  }

  return deepFreeze({
    runtimeVersion: RUNTIME_VERSION,
    mount,
    requestSync,
    destroy,
    diagnostics: () => deepFreeze({
      localFirstRender: true,
      remoteRenderBlocking: false,
      persistentReplicaRequired: true,
      incrementalSync: true,
      rerenderOnlyOnEffectiveChange: true,
      visibleTickSeconds: Math.round(intervalMs / 1000),
      onlineEventRole: "SYNC_TRIGGER_ONLY",
      fullCacheDeleteAllowed: false,
      backgroundPushImplemented: false,
      providerInvocationAllowed: false,
      messageGenerationAllowed: false,
      messageSendAllowed: false,
    }),
  });
}
