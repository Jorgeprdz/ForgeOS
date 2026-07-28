"use strict";

(function dueActionOfflineContractModule(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeDueActionOfflineContractNFAST09 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function dueActionOfflineContractFactory() {
    const CONTRACT_VERSION = "NFAST-09.3A";
    const STORE_VERSION = 1;

    const DUE_ACTION_STATES = Object.freeze([
      "SCHEDULED",
      "COMPLETED",
      "CANCELLED",
      "CONFLICT_REVIEW_REQUIRED",
    ]);

    const ACKNOWLEDGEMENT_STATES = Object.freeze([
      "UNSEEN",
      "SEEN",
      "ACKNOWLEDGED",
      "SNOOZED",
    ]);

    const SYNC_STATES = Object.freeze([
      "SYNCED",
      "LOCAL_PENDING",
      "SYNCING",
      "SYNC_FAILED",
      "CONFLICT_REVIEW_REQUIRED",
    ]);

    const MUTATION_OPERATIONS = Object.freeze([
      "SCHEDULE",
      "RESCHEDULE",
      "COMPLETE",
      "CANCEL",
      "MARK_SEEN",
      "ACKNOWLEDGE",
      "SNOOZE",
    ]);

    const ALLOWED_RECORD_KEYS = Object.freeze([
      "recordKey",
      "advisorPartitionKey",
      "prospectReference",
      "approvedDisplayName",
      "nextActionType",
      "nextActionAt",
      "dueActionState",
      "dueActionVersion",
      "serverRevision",
      "remoteUpdatedAt",
      "localUpdatedAt",
      "lastSyncedAt",
      "syncState",
      "acknowledgementState",
      "acknowledgedAt",
      "acknowledgedOnDeviceId",
      "snoozedUntil",
      "tombstone",
    ]);

    const ALLOWED_MUTATION_KEYS = Object.freeze([
      "mutationId",
      "deviceId",
      "advisorPartitionKey",
      "prospectReference",
      "dueActionVersion",
      "operation",
      "authorizedPatch",
      "baseServerRevision",
      "createdAt",
      "attemptCount",
      "syncState",
    ]);

    const ALLOWED_PATCH_KEYS = Object.freeze([
      "approvedDisplayName",
      "nextActionType",
      "nextActionAt",
      "acknowledgementState",
      "acknowledgedAt",
      "acknowledgedOnDeviceId",
      "snoozedUntil",
      "dueActionState",
      "dueActionVersion",
      "tombstone",
    ]);

    const PROHIBITED_KEYS = Object.freeze([
      "rawNotes",
      "raw_notes",
      "notes",
      "initialContext",
      "initial_context",
      "prompt",
      "systemPrompt",
      "draft",
      "message",
      "messageText",
      "transcript",
      "phone",
      "phoneNormalized",
      "phone_normalized",
      "whatsapp",
      "whatsappNormalized",
      "whatsapp_normalized",
      "email",
      "health",
      "medical",
      "income",
      "estimatedIncome",
      "estimated_income",
      "family",
      "dependents",
      "authToken",
      "accessToken",
      "refreshToken",
      "providerPayload",
      "providerResponse",
    ]);

    const ACK_RANK = Object.freeze({
      UNSEEN: 0,
      SNOOZED: 1,
      SEEN: 2,
      ACKNOWLEDGED: 3,
    });

    class DueActionOfflineError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "DueActionOfflineError";
        this.code = code;
        this.details = details;
      }
    }

    function isObject(value) {
      return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value),
      );
    }

    function clone(value) {
      if (value === undefined) return undefined;
      return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
      if (
        !value ||
        typeof value !== "object" ||
        Object.isFrozen(value)
      ) {
        return value;
      }

      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function uniqueSorted(values) {
      return [...new Set(values)].sort();
    }

    function stableValue(value) {
      if (Array.isArray(value)) {
        return value.map(stableValue);
      }

      if (isObject(value)) {
        const result = {};
        for (const key of Object.keys(value).sort()) {
          result[key] = stableValue(value[key]);
        }
        return result;
      }

      return value;
    }

    function stableStringify(value) {
      return JSON.stringify(stableValue(value));
    }

    function stableHash(value) {
      const text =
        typeof value === "string"
          ? value
          : stableStringify(value);

      let hash = 2166136261;

      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }

      return (hash >>> 0)
        .toString(16)
        .padStart(8, "0");
    }

    function isIsoDate(value) {
      return Boolean(
        typeof value === "string" &&
        value.trim() &&
        !Number.isNaN(Date.parse(value)),
      );
    }

    function isOpaqueToken(value, maximum = 180) {
      return Boolean(
        typeof value === "string" &&
        value.length > 0 &&
        value.length <= maximum &&
        /^[A-Za-z0-9._:@/-]+$/.test(value),
      );
    }

    function assertAllowedKeys(
      input,
      allowedKeys,
      code,
      label,
    ) {
      const unsupported = Object.keys(input)
        .filter(key => !allowedKeys.includes(key));

      if (unsupported.length > 0) {
        throw new DueActionOfflineError(
          code,
          `${label} contiene campos no autorizados.`,
          {
            unsupportedKeys: unsupported.sort(),
          },
        );
      }
    }

    function findProhibitedKeys(value, path = "$") {
      const findings = [];

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          findings.push(
            ...findProhibitedKeys(
              item,
              `${path}[${index}]`,
            ),
          );
        });

        return findings;
      }

      if (!isObject(value)) {
        return findings;
      }

      for (const [key, nested] of Object.entries(value)) {
        const nestedPath = `${path}.${key}`;

        if (
          PROHIBITED_KEYS.includes(key) ||
          PROHIBITED_KEYS.includes(
            key.toLowerCase(),
          )
        ) {
          findings.push(nestedPath);
        }

        findings.push(
          ...findProhibitedKeys(
            nested,
            nestedPath,
          ),
        );
      }

      return uniqueSorted(findings);
    }

    function requireOpaque(
      value,
      code,
      label,
      maximum = 180,
    ) {
      const normalized = String(value || "").trim();

      if (!isOpaqueToken(normalized, maximum)) {
        throw new DueActionOfflineError(
          code,
          `${label} no es válido.`,
        );
      }

      return normalized;
    }

    function normalizeOptionalIso(value, code, label) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return null;
      }

      if (!isIsoDate(value)) {
        throw new DueActionOfflineError(
          code,
          `${label} no es válido.`,
        );
      }

      return new Date(value).toISOString();
    }

    function normalizeRequiredIso(value, code, label) {
      const normalized =
        normalizeOptionalIso(value, code, label);

      if (normalized === null) {
        throw new DueActionOfflineError(
          code,
          `${label} es obligatorio.`,
        );
      }

      return normalized;
    }

    function recordKeyFor(
      advisorPartitionKey,
      prospectReference,
    ) {
      return [
        requireOpaque(
          advisorPartitionKey,
          "ADVISOR_PARTITION_INVALID",
          "La partición del asesor",
        ),
        requireOpaque(
          prospectReference,
          "PROSPECT_REFERENCE_INVALID",
          "El prospecto",
        ),
      ].join("::");
    }

    function normalizeDueActionRecord(input) {
      if (!isObject(input)) {
        throw new DueActionOfflineError(
          "DUE_ACTION_RECORD_INVALID",
          "El registro local no es válido.",
        );
      }

      const prohibited = findProhibitedKeys(input);

      if (prohibited.length > 0) {
        throw new DueActionOfflineError(
          "PROHIBITED_LOCAL_DATA",
          "El registro local contiene datos prohibidos.",
          {
            prohibitedPaths: prohibited,
          },
        );
      }

      assertAllowedKeys(
        input,
        ALLOWED_RECORD_KEYS,
        "DUE_ACTION_RECORD_FIELDS_INVALID",
        "El registro local",
      );

      const advisorPartitionKey =
        requireOpaque(
          input.advisorPartitionKey,
          "ADVISOR_PARTITION_INVALID",
          "La partición del asesor",
        );

      const prospectReference =
        requireOpaque(
          input.prospectReference,
          "PROSPECT_REFERENCE_INVALID",
          "El prospecto",
        );

      const recordKey =
        recordKeyFor(
          advisorPartitionKey,
          prospectReference,
        );

      if (
        input.recordKey !== undefined &&
        input.recordKey !== recordKey
      ) {
        throw new DueActionOfflineError(
          "RECORD_KEY_MISMATCH",
          "La llave local no corresponde a su partición.",
        );
      }

      const approvedDisplayName =
        String(
          input.approvedDisplayName || "",
        ).trim();

      if (
        !approvedDisplayName ||
        approvedDisplayName.length > 160
      ) {
        throw new DueActionOfflineError(
          "DISPLAY_NAME_INVALID",
          "El nombre de presentación no es válido.",
        );
      }

      const dueActionState =
        input.dueActionState || "SCHEDULED";

      if (
        !DUE_ACTION_STATES.includes(
          dueActionState,
        )
      ) {
        throw new DueActionOfflineError(
          "DUE_ACTION_STATE_INVALID",
          "El estado de la acción no es válido.",
        );
      }

      const acknowledgementState =
        input.acknowledgementState || "UNSEEN";

      if (
        !ACKNOWLEDGEMENT_STATES.includes(
          acknowledgementState,
        )
      ) {
        throw new DueActionOfflineError(
          "ACKNOWLEDGEMENT_STATE_INVALID",
          "El estado de lectura no es válido.",
        );
      }

      const syncState =
        input.syncState || "SYNCED";

      if (!SYNC_STATES.includes(syncState)) {
        throw new DueActionOfflineError(
          "SYNC_STATE_INVALID",
          "El estado de sincronización no es válido.",
        );
      }

      const dueActionVersion =
        Number(input.dueActionVersion ?? 1);

      if (
        !Number.isInteger(dueActionVersion) ||
        dueActionVersion < 1
      ) {
        throw new DueActionOfflineError(
          "DUE_ACTION_VERSION_INVALID",
          "La versión de la acción no es válida.",
        );
      }

      const nextActionAt =
        normalizeOptionalIso(
          input.nextActionAt,
          "NEXT_ACTION_AT_INVALID",
          "La fecha de próxima acción",
        );

      const nextActionType =
        input.nextActionType === null ||
        input.nextActionType === undefined
          ? null
          : String(input.nextActionType).trim();

      if (
        nextActionType !== null &&
        (
          !nextActionType ||
          nextActionType.length > 120
        )
      ) {
        throw new DueActionOfflineError(
          "NEXT_ACTION_TYPE_INVALID",
          "El tipo de próxima acción no es válido.",
        );
      }

      if (
        dueActionState === "SCHEDULED" &&
        (
          nextActionAt === null ||
          nextActionType === null
        )
      ) {
        throw new DueActionOfflineError(
          "SCHEDULE_FIELDS_REQUIRED",
          "Una acción programada requiere tipo y fecha.",
        );
      }

      const tombstone =
        Boolean(input.tombstone);

      if (
        tombstone &&
        dueActionState === "SCHEDULED"
      ) {
        throw new DueActionOfflineError(
          "ACTIVE_TOMBSTONE_INVALID",
          "Una acción activa no puede ser tombstone.",
        );
      }

      return deepFreeze({
        recordKey,
        advisorPartitionKey,
        prospectReference,
        approvedDisplayName,
        nextActionType,
        nextActionAt,
        dueActionState,
        dueActionVersion,
        serverRevision:
          input.serverRevision === undefined ||
          input.serverRevision === null
            ? null
            : String(input.serverRevision),
        remoteUpdatedAt:
          normalizeOptionalIso(
            input.remoteUpdatedAt,
            "REMOTE_UPDATED_AT_INVALID",
            "La actualización remota",
          ),
        localUpdatedAt:
          normalizeRequiredIso(
            input.localUpdatedAt,
            "LOCAL_UPDATED_AT_INVALID",
            "La actualización local",
          ),
        lastSyncedAt:
          normalizeOptionalIso(
            input.lastSyncedAt,
            "LAST_SYNCED_AT_INVALID",
            "La última sincronización",
          ),
        syncState,
        acknowledgementState,
        acknowledgedAt:
          normalizeOptionalIso(
            input.acknowledgedAt,
            "ACKNOWLEDGED_AT_INVALID",
            "La fecha de lectura",
          ),
        acknowledgedOnDeviceId:
          input.acknowledgedOnDeviceId === undefined ||
          input.acknowledgedOnDeviceId === null
            ? null
            : requireOpaque(
                input.acknowledgedOnDeviceId,
                "ACK_DEVICE_INVALID",
                "El dispositivo de lectura",
              ),
        snoozedUntil:
          normalizeOptionalIso(
            input.snoozedUntil,
            "SNOOZED_UNTIL_INVALID",
            "La fecha de posposición",
          ),
        tombstone,
      });
    }

    function normalizeAuthorizedPatch(input = {}) {
      if (!isObject(input)) {
        throw new DueActionOfflineError(
          "AUTHORIZED_PATCH_INVALID",
          "El cambio autorizado no es válido.",
        );
      }

      const prohibited = findProhibitedKeys(input);

      if (prohibited.length > 0) {
        throw new DueActionOfflineError(
          "PROHIBITED_OUTBOX_DATA",
          "La outbox contiene datos prohibidos.",
          {
            prohibitedPaths: prohibited,
          },
        );
      }

      assertAllowedKeys(
        input,
        ALLOWED_PATCH_KEYS,
        "AUTHORIZED_PATCH_FIELDS_INVALID",
        "El cambio autorizado",
      );

      return clone(input);
    }

    function normalizeOutboxMutation(input) {
      if (!isObject(input)) {
        throw new DueActionOfflineError(
          "OUTBOX_MUTATION_INVALID",
          "La mutación de outbox no es válida.",
        );
      }

      const prohibited = findProhibitedKeys(input);

      if (prohibited.length > 0) {
        throw new DueActionOfflineError(
          "PROHIBITED_OUTBOX_DATA",
          "La outbox contiene datos prohibidos.",
          {
            prohibitedPaths: prohibited,
          },
        );
      }

      assertAllowedKeys(
        input,
        ALLOWED_MUTATION_KEYS,
        "OUTBOX_MUTATION_FIELDS_INVALID",
        "La mutación de outbox",
      );

      const operation =
        String(input.operation || "").trim();

      if (!MUTATION_OPERATIONS.includes(operation)) {
        throw new DueActionOfflineError(
          "OUTBOX_OPERATION_INVALID",
          "La operación offline no es válida.",
        );
      }

      const dueActionVersion =
        Number(input.dueActionVersion);

      if (
        !Number.isInteger(dueActionVersion) ||
        dueActionVersion < 1
      ) {
        throw new DueActionOfflineError(
          "DUE_ACTION_VERSION_INVALID",
          "La versión de la acción no es válida.",
        );
      }

      const attemptCount =
        Number(input.attemptCount ?? 0);

      if (
        !Number.isInteger(attemptCount) ||
        attemptCount < 0
      ) {
        throw new DueActionOfflineError(
          "ATTEMPT_COUNT_INVALID",
          "El número de intentos no es válido.",
        );
      }

      const normalized = {
        mutationId:
          requireOpaque(
            input.mutationId,
            "MUTATION_ID_INVALID",
            "La mutación",
          ),
        deviceId:
          requireOpaque(
            input.deviceId,
            "DEVICE_ID_INVALID",
            "El dispositivo",
          ),
        advisorPartitionKey:
          requireOpaque(
            input.advisorPartitionKey,
            "ADVISOR_PARTITION_INVALID",
            "La partición del asesor",
          ),
        prospectReference:
          requireOpaque(
            input.prospectReference,
            "PROSPECT_REFERENCE_INVALID",
            "El prospecto",
          ),
        dueActionVersion,
        operation,
        authorizedPatch:
          normalizeAuthorizedPatch(
            input.authorizedPatch,
          ),
        baseServerRevision:
          input.baseServerRevision === undefined ||
          input.baseServerRevision === null
            ? null
            : String(input.baseServerRevision),
        createdAt:
          normalizeRequiredIso(
            input.createdAt,
            "MUTATION_CREATED_AT_INVALID",
            "La fecha de la mutación",
          ),
        attemptCount,
        syncState:
          input.syncState || "LOCAL_PENDING",
      };

      if (
        ![
          "LOCAL_PENDING",
          "SYNCING",
          "SYNC_FAILED",
          "CONFLICT_REVIEW_REQUIRED",
        ].includes(normalized.syncState)
      ) {
        throw new DueActionOfflineError(
          "OUTBOX_SYNC_STATE_INVALID",
          "El estado de outbox no es válido.",
        );
      }

      return deepFreeze(normalized);
    }

    function createMutationId(input) {
      if (!isObject(input)) {
        throw new DueActionOfflineError(
          "MUTATION_SEED_INVALID",
          "La semilla de mutación no es válida.",
        );
      }

      const normalizedSeed = {
        deviceId:
          requireOpaque(
            input.deviceId,
            "DEVICE_ID_INVALID",
            "El dispositivo",
          ),
        advisorPartitionKey:
          requireOpaque(
            input.advisorPartitionKey,
            "ADVISOR_PARTITION_INVALID",
            "La partición del asesor",
          ),
        prospectReference:
          requireOpaque(
            input.prospectReference,
            "PROSPECT_REFERENCE_INVALID",
            "El prospecto",
          ),
        dueActionVersion:
          Number(input.dueActionVersion),
        operation:
          String(input.operation || "").trim(),
        createdAt:
          normalizeRequiredIso(
            input.createdAt,
            "MUTATION_CREATED_AT_INVALID",
            "La fecha de la mutación",
          ),
        authorizedPatch:
          normalizeAuthorizedPatch(
            input.authorizedPatch || {},
          ),
      };

      if (
        !Number.isInteger(
          normalizedSeed.dueActionVersion,
        ) ||
        normalizedSeed.dueActionVersion < 1
      ) {
        throw new DueActionOfflineError(
          "DUE_ACTION_VERSION_INVALID",
          "La versión de la acción no es válida.",
        );
      }

      if (
        !MUTATION_OPERATIONS.includes(
          normalizedSeed.operation,
        )
      ) {
        throw new DueActionOfflineError(
          "OUTBOX_OPERATION_INVALID",
          "La operación offline no es válida.",
        );
      }

      return [
        "NFAST09",
        normalizedSeed.deviceId,
        stableHash(normalizedSeed),
      ].join(":");
    }

    function mergeAcknowledgement(
      currentState,
      incomingState,
    ) {
      if (
        !ACKNOWLEDGEMENT_STATES.includes(
          currentState,
        ) ||
        !ACKNOWLEDGEMENT_STATES.includes(
          incomingState,
        )
      ) {
        throw new DueActionOfflineError(
          "ACKNOWLEDGEMENT_STATE_INVALID",
          "El estado de lectura no es válido.",
        );
      }

      return ACK_RANK[incomingState] >
        ACK_RANK[currentState]
        ? incomingState
        : currentState;
    }

    function applyLocalMutation(
      currentRecord,
      mutationInput,
    ) {
      const mutation =
        normalizeOutboxMutation(
          mutationInput,
        );

      const now = mutation.createdAt;
      const existing =
        currentRecord === null ||
        currentRecord === undefined
          ? null
          : normalizeDueActionRecord(
              currentRecord,
            );

      if (
        existing &&
        (
          existing.advisorPartitionKey !==
            mutation.advisorPartitionKey ||
          existing.prospectReference !==
            mutation.prospectReference
        )
      ) {
        throw new DueActionOfflineError(
          "MUTATION_RECORD_PARTITION_MISMATCH",
          "La mutación no corresponde al registro local.",
        );
      }

      const base = existing || {
        recordKey:
          recordKeyFor(
            mutation.advisorPartitionKey,
            mutation.prospectReference,
          ),
        advisorPartitionKey:
          mutation.advisorPartitionKey,
        prospectReference:
          mutation.prospectReference,
        approvedDisplayName:
          mutation.authorizedPatch
            .approvedDisplayName,
        nextActionType: null,
        nextActionAt: null,
        dueActionState: "CANCELLED",
        dueActionVersion:
          mutation.dueActionVersion,
        serverRevision:
          mutation.baseServerRevision,
        remoteUpdatedAt: null,
        localUpdatedAt: now,
        lastSyncedAt: null,
        syncState: "LOCAL_PENDING",
        acknowledgementState: "UNSEEN",
        acknowledgedAt: null,
        acknowledgedOnDeviceId: null,
        snoozedUntil: null,
        tombstone: true,
      };

      if (
        existing &&
        mutation.dueActionVersion <
          existing.dueActionVersion
      ) {
        throw new DueActionOfflineError(
          "STALE_LOCAL_MUTATION",
          "La mutación corresponde a una versión anterior.",
        );
      }

      const next = clone(base);

      next.localUpdatedAt = now;
      next.syncState = "LOCAL_PENDING";

      switch (mutation.operation) {
        case "SCHEDULE":
        case "RESCHEDULE": {
          const nextActionType =
            String(
              mutation.authorizedPatch
                .nextActionType || "",
            ).trim();

          const nextActionAt =
            normalizeRequiredIso(
              mutation.authorizedPatch
                .nextActionAt,
              "NEXT_ACTION_AT_INVALID",
              "La fecha de próxima acción",
            );

          const approvedDisplayName =
            String(
              mutation.authorizedPatch
                .approvedDisplayName ||
              next.approvedDisplayName ||
              "",
            ).trim();

          if (!nextActionType) {
            throw new DueActionOfflineError(
              "NEXT_ACTION_TYPE_INVALID",
              "El tipo de próxima acción es obligatorio.",
            );
          }

          next.approvedDisplayName =
            approvedDisplayName;
          next.nextActionType = nextActionType;
          next.nextActionAt = nextActionAt;
          next.dueActionState = "SCHEDULED";
          next.dueActionVersion =
            mutation.dueActionVersion;
          next.acknowledgementState = "UNSEEN";
          next.acknowledgedAt = null;
          next.acknowledgedOnDeviceId = null;
          next.snoozedUntil = null;
          next.tombstone = false;
          break;
        }

        case "COMPLETE":
          next.dueActionState = "COMPLETED";
          next.dueActionVersion =
            mutation.dueActionVersion;
          next.tombstone = true;
          break;

        case "CANCEL":
          next.dueActionState = "CANCELLED";
          next.dueActionVersion =
            mutation.dueActionVersion;
          next.tombstone = true;
          break;

        case "MARK_SEEN":
          next.acknowledgementState =
            mergeAcknowledgement(
              next.acknowledgementState,
              "SEEN",
            );
          next.acknowledgedAt = now;
          next.acknowledgedOnDeviceId =
            mutation.deviceId;
          break;

        case "ACKNOWLEDGE":
          next.acknowledgementState =
            mergeAcknowledgement(
              next.acknowledgementState,
              "ACKNOWLEDGED",
            );
          next.acknowledgedAt = now;
          next.acknowledgedOnDeviceId =
            mutation.deviceId;
          break;

        case "SNOOZE":
          next.acknowledgementState =
            mergeAcknowledgement(
              next.acknowledgementState,
              "SNOOZED",
            );
          next.snoozedUntil =
            normalizeRequiredIso(
              mutation.authorizedPatch
                .snoozedUntil,
              "SNOOZED_UNTIL_INVALID",
              "La fecha de posposición",
            );
          break;

        default:
          throw new DueActionOfflineError(
            "OUTBOX_OPERATION_INVALID",
            "La operación offline no es válida.",
          );
      }

      return normalizeDueActionRecord(next);
    }

    return deepFreeze({
      CONTRACT_VERSION,
      STORE_VERSION,
      DUE_ACTION_STATES,
      ACKNOWLEDGEMENT_STATES,
      SYNC_STATES,
      MUTATION_OPERATIONS,
      ALLOWED_RECORD_KEYS,
      ALLOWED_MUTATION_KEYS,
      ALLOWED_PATCH_KEYS,
      PROHIBITED_KEYS,
      DueActionOfflineError,
      recordKeyFor,
      normalizeDueActionRecord,
      normalizeOutboxMutation,
      normalizeAuthorizedPatch,
      createMutationId,
      mergeAcknowledgement,
      applyLocalMutation,
      diagnostics: () =>
        deepFreeze({
          offlineFirst: true,
          indexedDbRequired: true,
          localReplicaDeleteOnReconnect: false,
          durableOutboxRequired: true,
          acknowledgedOutboxRemovalOnly: true,
          advisorPartitionRequired: true,
          sensitiveContextAllowed: false,
          authTokenStorageAllowed: false,
          readCompletesAction: false,
          silentLastWriteWinsAllowed: false,
          providerInvocationAllowed: false,
          messageGenerationAllowed: false,
          messageSendAllowed: false,
          directNetworkAccessAllowed: false,
        }),
      _private: {
        isObject,
        clone,
        deepFreeze,
        stableValue,
        stableStringify,
        stableHash,
        isIsoDate,
        isOpaqueToken,
        findProhibitedKeys,
        requireOpaque,
      },
    });
  },
);
