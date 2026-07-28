"use strict";

import "../offline/due-action-offline-contract.js";
import "../offline/due-action-indexeddb-store.js";

export const PIPELINE_DUE_ACTION_WRITER_VERSION = "NFAST-09.3F";

const ALLOWED_INPUT_KEYS = Object.freeze([
  "operation",
  "prospectReference",
  "approvedDisplayName",
  "nextActionType",
  "nextActionAt",
  "snoozedUntil",
  "createdAt",
]);

const OPERATIONS_REQUIRING_ACTIVE = Object.freeze([
  "RESCHEDULE",
  "COMPLETE",
  "CANCEL",
  "MARK_SEEN",
  "ACKNOWLEDGE",
  "SNOOZE",
]);

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
    contract: globalThis.ForgeDueActionOfflineContractNFAST09,
    store: globalThis.ForgeDueActionIndexedDbStoreNFAST09,
  };
}

function assertObject(value, code) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const error = new TypeError(code);
    error.code = code;
    throw error;
  }
}

function assertAllowedInput(input) {
  const unsupported = Object.keys(input).filter(
    key => !ALLOWED_INPUT_KEYS.includes(key),
  );

  if (unsupported.length > 0) {
    const error = new TypeError("PIPELINE_DUE_ACTION_INPUT_FIELDS_INVALID");
    error.code = "PIPELINE_DUE_ACTION_INPUT_FIELDS_INVALID";
    error.details = { unsupportedKeys: unsupported.sort() };
    throw error;
  }
}

function normalizeIso(value, code) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    Number.isNaN(Date.parse(value))
  ) {
    const error = new TypeError(code);
    error.code = code;
    throw error;
  }

  return new Date(value).toISOString();
}

function normalizeDisplayName(value) {
  const normalized = String(value || "").trim();

  if (!normalized || normalized.length > 160) {
    const error = new TypeError("APPROVED_DISPLAY_NAME_REQUIRED");
    error.code = "APPROVED_DISPLAY_NAME_REQUIRED";
    throw error;
  }

  return normalized;
}

function normalizeActionType(value) {
  const normalized = String(value || "").trim();

  if (!normalized || normalized.length > 120) {
    const error = new TypeError("NEXT_ACTION_TYPE_REQUIRED");
    error.code = "NEXT_ACTION_TYPE_REQUIRED";
    throw error;
  }

  return normalized;
}

function defaultEventFactory(type, detail) {
  if (typeof CustomEvent === "function") {
    return new CustomEvent(type, { detail });
  }

  return { type, detail };
}

export function getOrCreatePipelineDeviceId({
  storage = typeof localStorage !== "undefined" ? localStorage : null,
  cryptoProvider = typeof crypto !== "undefined" ? crypto : null,
  key = "forge:nfast09:device-id",
} = {}) {
  try {
    const existing = String(storage?.getItem?.(key) || "").trim();
    if (existing) return existing;
  } catch {
    // Storage may be unavailable. Continue with a session identifier.
  }

  const random =
    typeof cryptoProvider?.randomUUID === "function"
      ? cryptoProvider.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;

  const deviceId = `device-${random}`;

  try {
    storage?.setItem?.(key, deviceId);
  } catch {
    // A session identifier is still valid for local mutation identity.
  }

  return deviceId;
}

export function createPipelineDueActionWriter({
  advisorPartitionKey,
  contract = null,
  store = null,
  deviceId = null,
  clock = () => new Date().toISOString(),
  eventTarget = typeof window !== "undefined" ? window : null,
  eventFactory = defaultEventFactory,
  requestSync = null,
  defer = callback => setTimeout(callback, 0),
} = {}) {
  const modules = dependencies();
  const dueActionContract = contract || modules.contract;
  const localStore = store || modules.store?.create();
  const advisor = String(advisorPartitionKey || "").trim();
  const selectedDeviceId =
    String(deviceId || getOrCreatePipelineDeviceId()).trim();

  if (
    !dueActionContract ||
    typeof dueActionContract.applyLocalMutation !== "function" ||
    typeof dueActionContract.createMutationId !== "function"
  ) {
    throw new TypeError("DUE_ACTION_CONTRACT_INVALID");
  }

  dueActionContract.recordKeyFor(advisor, "partition-check");
  dueActionContract._private.requireOpaque(
    selectedDeviceId,
    "DEVICE_ID_INVALID",
    "El dispositivo",
  );

  if (
    !localStore ||
    typeof localStore.getDueAction !== "function" ||
    typeof localStore.commitLocalMutation !== "function"
  ) {
    throw new TypeError("DUE_ACTION_STORE_INVALID");
  }

  if (typeof defer !== "function") {
    throw new TypeError("SYNC_DEFER_INVALID");
  }

  let closed = false;

  function ensureOpen() {
    if (closed) {
      const error = new TypeError("PIPELINE_DUE_ACTION_WRITER_CLOSED");
      error.code = "PIPELINE_DUE_ACTION_WRITER_CLOSED";
      throw error;
    }
  }

  function dispatchMutation(mutation) {
    if (!eventTarget?.dispatchEvent) return false;

    const detail = deepFreeze({
      writerVersion: PIPELINE_DUE_ACTION_WRITER_VERSION,
      mutationId: mutation.mutationId,
      prospectReference: mutation.prospectReference,
      operation: mutation.operation,
      dueActionVersion: mutation.dueActionVersion,
      localCommitted: true,
    });

    return eventTarget.dispatchEvent(
      eventFactory("nfast09:due-action-mutated", detail),
    );
  }

  function buildAuthorizedPatch({
    operation,
    input,
    existing,
    createdAt,
  }) {
    if (operation === "SCHEDULE" || operation === "RESCHEDULE") {
      return dueActionContract.normalizeAuthorizedPatch({
        approvedDisplayName: normalizeDisplayName(
          input.approvedDisplayName || existing?.approvedDisplayName,
        ),
        nextActionType: normalizeActionType(input.nextActionType),
        nextActionAt: normalizeIso(
          input.nextActionAt,
          "NEXT_ACTION_AT_REQUIRED",
        ),
        acknowledgementState: "UNSEEN",
        acknowledgedAt: null,
        acknowledgedOnDeviceId: null,
        snoozedUntil: null,
        dueActionState: "SCHEDULED",
        tombstone: false,
      });
    }

    if (operation === "SNOOZE") {
      const snoozedUntil =
        input.snoozedUntil ||
        new Date(
          new Date(createdAt).getTime() + 24 * 60 * 60 * 1000,
        ).toISOString();

      return dueActionContract.normalizeAuthorizedPatch({
        snoozedUntil: normalizeIso(
          snoozedUntil,
          "SNOOZED_UNTIL_REQUIRED",
        ),
      });
    }

    return dueActionContract.normalizeAuthorizedPatch({});
  }

  function versionFor(operation, existing) {
    if (operation === "SCHEDULE") {
      return existing ? existing.dueActionVersion + 1 : 1;
    }

    if (
      operation === "RESCHEDULE" ||
      operation === "COMPLETE" ||
      operation === "CANCEL"
    ) {
      return existing.dueActionVersion + 1;
    }

    return existing.dueActionVersion;
  }

  async function execute(input = {}) {
    ensureOpen();
    assertObject(input, "PIPELINE_DUE_ACTION_INPUT_INVALID");
    assertAllowedInput(input);

    const operation = String(input.operation || "").trim();

    if (!dueActionContract.MUTATION_OPERATIONS.includes(operation)) {
      const error = new TypeError("PIPELINE_DUE_ACTION_OPERATION_INVALID");
      error.code = "PIPELINE_DUE_ACTION_OPERATION_INVALID";
      throw error;
    }

    const prospectReference =
      dueActionContract._private.requireOpaque(
        input.prospectReference,
        "PROSPECT_REFERENCE_INVALID",
        "El prospecto",
      );

    const existing = await localStore.getDueAction(
      advisor,
      prospectReference,
    );

    if (
      OPERATIONS_REQUIRING_ACTIVE.includes(operation) &&
      (
        !existing ||
        existing.dueActionState !== "SCHEDULED" ||
        existing.tombstone
      )
    ) {
      const error = new TypeError("ACTIVE_DUE_ACTION_REQUIRED");
      error.code = "ACTIVE_DUE_ACTION_REQUIRED";
      throw error;
    }

    if (
      operation === "SCHEDULE" &&
      existing &&
      existing.dueActionState === "SCHEDULED" &&
      !existing.tombstone
    ) {
      const error = new TypeError("ACTIVE_DUE_ACTION_ALREADY_EXISTS");
      error.code = "ACTIVE_DUE_ACTION_ALREADY_EXISTS";
      throw error;
    }

    const createdAt = normalizeIso(
      input.createdAt || clock(),
      "MUTATION_CREATED_AT_INVALID",
    );
    const dueActionVersion = versionFor(operation, existing);
    const authorizedPatch = buildAuthorizedPatch({
      operation,
      input,
      existing,
      createdAt,
    });

    const mutationSeed = {
      deviceId: selectedDeviceId,
      advisorPartitionKey: advisor,
      prospectReference,
      dueActionVersion,
      operation,
      createdAt,
      authorizedPatch,
    };

    const mutation = dueActionContract.normalizeOutboxMutation({
      ...mutationSeed,
      mutationId:
        dueActionContract.createMutationId(mutationSeed),
      baseServerRevision: existing?.serverRevision || null,
      attemptCount: 0,
      syncState: "LOCAL_PENDING",
    });

    const record = dueActionContract.applyLocalMutation(
      existing,
      mutation,
    );

    const committed = await localStore.commitLocalMutation(
      record,
      mutation,
    );

    dispatchMutation(committed.mutation);

    const syncPromise =
      typeof requestSync === "function"
        ? new Promise((resolve, reject) => {
            defer(() => {
              Promise.resolve()
                .then(() =>
                  requestSync("PIPELINE_LOCAL_MUTATION"),
                )
                .then(resolve, reject);
            });
          })
        : Promise.resolve({
            status: "LOCAL_ONLY",
            gatewayInvoked: false,
          });

    return Object.freeze({
      writerVersion: PIPELINE_DUE_ACTION_WRITER_VERSION,
      localCommitted: true,
      idempotentReplay: committed.idempotentReplay,
      record: committed.record,
      mutation: committed.mutation,
      syncPromise,
    });
  }

  async function get(prospectReference) {
    ensureOpen();
    const prospect =
      dueActionContract._private.requireOpaque(
        prospectReference,
        "PROSPECT_REFERENCE_INVALID",
        "El prospecto",
      );

    return localStore.getDueAction(advisor, prospect);
  }

  async function close() {
    if (closed) return;
    closed = true;
    await localStore.close?.();
  }

  return deepFreeze({
    writerVersion: PIPELINE_DUE_ACTION_WRITER_VERSION,
    advisorPartitionKey: advisor,
    deviceId: selectedDeviceId,
    get,
    execute,
    close,
    diagnostics: () =>
      deepFreeze({
        localFirstWrite: true,
        atomicRecordAndOutbox: true,
        deterministicMutationId: true,
        advisorBoundAtConstruction: true,
        advisorInjectionAccepted: false,
        sensitiveContextAccepted: false,
        directRemoteTableWriteAllowed: false,
        messageGenerationAllowed: false,
        messageSendAllowed: false,
        conflictAutoResolutionAllowed: false,
      }),
  });
}
