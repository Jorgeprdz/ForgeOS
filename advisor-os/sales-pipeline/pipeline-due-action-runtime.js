"use strict";

import "../offline/due-action-offline-contract.js";
import "../offline/due-action-indexeddb-store.js";
import "../offline/due-action-sync-journal.js";
import "../offline/due-action-sync-service.js";
import "../offline/due-action-supabase-gateway.js";

import { SupabaseRuntime } from "../../supabase-runtime.js";
import {
  createPipelineDueActionWriter,
} from "./pipeline-due-action-writer.js";

export const PIPELINE_DUE_ACTION_RUNTIME_VERSION = "NFAST-09.3F";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function dependencies() {
  return {
    store: globalThis.ForgeDueActionIndexedDbStoreNFAST09,
    journal: globalThis.ForgeDueActionSyncJournalNFAST09,
    sync: globalThis.ForgeDueActionSyncServiceNFAST09,
    gateway: globalThis.ForgeDueActionSupabaseGatewayNFAST09,
  };
}

function defaultOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

export function createPipelineDueActionRuntime({
  advisorPartitionKey,
  store = null,
  journal = null,
  syncService = null,
  gateway = null,
  client = null,
  remoteEnabled = true,
  authenticated = true,
  clock = () => new Date().toISOString(),
  onlineProvider = defaultOnline,
  eventTarget = typeof window !== "undefined" ? window : null,
  deviceId = null,
  onStatus = null,
} = {}) {
  const modules = dependencies();
  const localStore = store || modules.store?.create();

  if (
    !localStore ||
    typeof localStore.getDueAction !== "function" ||
    typeof localStore.commitLocalMutation !== "function"
  ) {
    throw new TypeError("DUE_ACTION_STORE_INVALID");
  }

  const syncJournal = remoteEnabled
    ? (journal || modules.journal?.create())
    : null;
  const remoteGateway = remoteEnabled
    ? (
        gateway ||
        modules.gateway?.create(
          client || SupabaseRuntime.getClient(),
        )
      )
    : null;
  const synchronizer = remoteEnabled
    ? (
        syncService ||
        modules.sync?.create({
          store: localStore,
          journal: syncJournal,
          gateway: remoteGateway,
          clock,
        })
      )
    : null;

  if (
    remoteEnabled &&
    (
      !synchronizer ||
      typeof synchronizer.syncAdvisor !== "function"
    )
  ) {
    throw new TypeError("SYNC_SERVICE_INVALID");
  }

  const advisor = String(advisorPartitionKey || "").trim();
  let closed = false;
  let pendingSync = null;

  function status(payload) {
    onStatus?.(
      deepFreeze({
        runtimeVersion: PIPELINE_DUE_ACTION_RUNTIME_VERSION,
        ...payload,
      }),
    );
  }

  function requestSync(trigger = "PIPELINE_LOCAL_MUTATION") {
    if (!remoteEnabled) {
      return Promise.resolve({
        status: "REMOTE_DISABLED",
        gatewayInvoked: false,
      });
    }

    if (pendingSync) return pendingSync;

    pendingSync = synchronizer
      .syncAdvisor({
        advisorPartitionKey: advisor,
        online: onlineProvider(),
        authenticated,
        trigger,
      })
      .then(result => {
        status({
          status: result.status,
          trigger,
        });
        return result;
      })
      .catch(error => {
        status({
          status: "SYNC_ERROR",
          trigger,
          code: error?.code || "SYNC_ERROR",
        });

        return {
          status: "SYNC_ERROR",
          code: error?.code || "SYNC_ERROR",
        };
      })
      .finally(() => {
        pendingSync = null;
      });

    return pendingSync;
  }

  const writer = createPipelineDueActionWriter({
    advisorPartitionKey: advisor,
    store: localStore,
    deviceId,
    clock,
    eventTarget,
    requestSync,
  });

  async function load(prospectReference) {
    if (closed) throw new TypeError("PIPELINE_DUE_ACTION_RUNTIME_CLOSED");
    return writer.get(prospectReference);
  }

  async function execute(input) {
    if (closed) throw new TypeError("PIPELINE_DUE_ACTION_RUNTIME_CLOSED");

    status({
      status: "LOCAL_WRITE_STARTED",
      operation: input?.operation || null,
    });

    const result = await writer.execute(input);

    status({
      status: "LOCAL_COMMITTED",
      operation: result.mutation.operation,
      mutationId: result.mutation.mutationId,
    });

    return result;
  }

  async function close() {
    if (closed) return;
    closed = true;

    await Promise.allSettled([
      writer.close(),
      syncJournal?.close?.(),
    ]);
  }

  return deepFreeze({
    runtimeVersion: PIPELINE_DUE_ACTION_RUNTIME_VERSION,
    advisorPartitionKey: advisor,
    load,
    execute,
    requestSync,
    close,
    diagnostics: () =>
      deepFreeze({
        localFirstWrite: true,
        localUiMayUpdateBeforeSync: true,
        syncStartsOnNextTask: true,
        syncIsSecondary: true,
        advisorBoundAtConstruction: true,
        directRemoteTableWriteAllowed: false,
        prospectPersistenceAuthority: false,
        messageGenerationAllowed: false,
        messageSendAllowed: false,
      }),
  });
}
