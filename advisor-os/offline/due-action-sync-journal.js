"use strict";

(function dueActionSyncJournalModule(root, factory) {
  const contract =
    typeof module !== "undefined" &&
    module.exports
      ? require("./due-action-offline-contract")
      : root.ForgeDueActionOfflineContractNFAST09;

  const storeModule =
    typeof module !== "undefined" &&
    module.exports
      ? require("./due-action-indexeddb-store")
      : root.ForgeDueActionIndexedDbStoreNFAST09;

  const api = factory(contract, storeModule);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeDueActionSyncJournalNFAST09 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function dueActionSyncJournalFactory(
    contract,
    storeModule,
  ) {
    if (!contract || !storeModule) {
      throw new Error(
        "NFAST_09_STAGE_3A_DEPENDENCIES_REQUIRED",
      );
    }

    const JOURNAL_VERSION = "NFAST-09.3B";
    const DATABASE_NAME = storeModule.DATABASE_NAME;
    const DATABASE_VERSION =
      storeModule.DATABASE_VERSION;
    const STORE_NAMES = storeModule.STORE_NAMES;

    class DueActionSyncJournalError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "DueActionSyncJournalError";
        this.code = code;
        this.details = details;
      }
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

    function requestPromise(request) {
      return new Promise((resolve, reject) => {
        request.onsuccess = () =>
          resolve(request.result);
        request.onerror = () =>
          reject(request.error);
      });
    }

    function transactionPromise(transaction) {
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error);
        transaction.onabort = () =>
          reject(
            transaction.error ||
            new Error(
              "INDEXEDDB_TRANSACTION_ABORTED",
            ),
          );
      });
    }

    function ensureSchema(database) {
      if (
        !database.objectStoreNames.contains(
          STORE_NAMES.DUE_ACTIONS,
        )
      ) {
        const dueActions =
          database.createObjectStore(
            STORE_NAMES.DUE_ACTIONS,
            {
              keyPath: "recordKey",
            },
          );

        dueActions.createIndex(
          "advisorPartitionKey",
          "advisorPartitionKey",
          {
            unique: false,
          },
        );
      }

      if (
        !database.objectStoreNames.contains(
          STORE_NAMES.OUTBOX,
        )
      ) {
        const outbox =
          database.createObjectStore(
            STORE_NAMES.OUTBOX,
            {
              keyPath: "mutationId",
            },
          );

        outbox.createIndex(
          "advisorPartitionKey",
          "advisorPartitionKey",
          {
            unique: false,
          },
        );

        outbox.createIndex(
          "createdAt",
          "createdAt",
          {
            unique: false,
          },
        );
      }

      if (
        !database.objectStoreNames.contains(
          STORE_NAMES.SYNC_META,
        )
      ) {
        database.createObjectStore(
          STORE_NAMES.SYNC_META,
          {
            keyPath: "partitionKey",
          },
        );
      }
    }

    function createIndexedDbDriver({
      indexedDBFactory,
      databaseName = DATABASE_NAME,
      databaseVersion = DATABASE_VERSION,
    } = {}) {
      const indexedDB =
        indexedDBFactory ||
        (
          typeof globalThis !== "undefined"
            ? globalThis.indexedDB
            : null
        );

      if (
        !indexedDB ||
        typeof indexedDB.open !== "function"
      ) {
        throw new DueActionSyncJournalError(
          "INDEXEDDB_REQUIRED",
          "IndexedDB no está disponible.",
        );
      }

      let databasePromise = null;

      function openDatabase() {
        if (databasePromise) {
          return databasePromise;
        }

        databasePromise = new Promise(
          (resolve, reject) => {
            const request = indexedDB.open(
              databaseName,
              databaseVersion,
            );

            request.onupgradeneeded = event => {
              ensureSchema(event.target.result);
            };

            request.onsuccess = () => {
              const database = request.result;

              database.onversionchange = () => {
                database.close();
                databasePromise = null;
              };

              resolve(database);
            };

            request.onerror = () => {
              databasePromise = null;
              reject(request.error);
            };

            request.onblocked = () => {
              databasePromise = null;
              reject(
                new DueActionSyncJournalError(
                  "INDEXEDDB_UPGRADE_BLOCKED",
                  "Otra pestaña bloquea la base local.",
                ),
              );
            };
          },
        );

        return databasePromise;
      }

      async function get(storeName, key) {
        const database = await openDatabase();
        const transaction =
          database.transaction(
            [storeName],
            "readonly",
          );
        const request =
          transaction
            .objectStore(storeName)
            .get(key);
        const result =
          await requestPromise(request);
        await transactionPromise(transaction);

        return result === undefined
          ? null
          : clone(result);
      }

      async function runAtomic(operations) {
        if (
          !Array.isArray(operations) ||
          operations.length === 0
        ) {
          return;
        }

        const database = await openDatabase();
        const storeNames = [
          ...new Set(
            operations.map(
              operation =>
                operation.storeName,
            ),
          ),
        ];

        const transaction =
          database.transaction(
            storeNames,
            "readwrite",
          );

        for (const operation of operations) {
          const store =
            transaction.objectStore(
              operation.storeName,
            );

          if (operation.type === "put") {
            store.put(clone(operation.value));
          } else if (
            operation.type === "delete"
          ) {
            store.delete(operation.key);
          } else {
            transaction.abort();
            throw new DueActionSyncJournalError(
              "JOURNAL_OPERATION_INVALID",
              "La operación del journal no es válida.",
            );
          }
        }

        await transactionPromise(transaction);
      }

      async function close() {
        if (!databasePromise) return;
        const database = await databasePromise;
        database.close();
        databasePromise = null;
      }

      return deepFreeze({
        driverType: "INDEXEDDB",
        databaseName,
        databaseVersion,
        get,
        runAtomic,
        close,
      });
    }

    function requireIso(value, code, label) {
      if (!contract._private.isIsoDate(value)) {
        throw new DueActionSyncJournalError(
          code,
          `${label} no es válida.`,
        );
      }

      return new Date(value).toISOString();
    }

    function requireOpaque(
      value,
      code,
      label,
    ) {
      const normalized = String(value || "").trim();

      if (
        !contract._private.isOpaqueToken(
          normalized,
        )
      ) {
        throw new DueActionSyncJournalError(
          code,
          `${label} no es válido.`,
        );
      }

      return normalized;
    }

    function create({
      driver,
      indexedDBFactory,
      databaseName,
    } = {}) {
      const selectedDriver =
        driver ||
        createIndexedDbDriver({
          indexedDBFactory,
          databaseName,
        });

      for (const method of [
        "get",
        "runAtomic",
      ]) {
        if (
          typeof selectedDriver[method] !==
          "function"
        ) {
          throw new DueActionSyncJournalError(
            "SYNC_JOURNAL_DRIVER_INVALID",
            "El driver del journal es inválido.",
            {
              missingMethod: method,
            },
          );
        }
      }

      async function markMutationState({
        advisorPartitionKey,
        mutationId,
        syncState,
        attemptIncrement = 0,
      }) {
        requireOpaque(
          advisorPartitionKey,
          "ADVISOR_PARTITION_INVALID",
          "La partición del asesor",
        );
        requireOpaque(
          mutationId,
          "MUTATION_ID_INVALID",
          "La mutación",
        );

        if (
          ![
            "LOCAL_PENDING",
            "SYNCING",
            "SYNC_FAILED",
            "CONFLICT_REVIEW_REQUIRED",
          ].includes(syncState)
        ) {
          throw new DueActionSyncJournalError(
            "MUTATION_SYNC_STATE_INVALID",
            "El estado de sincronización es inválido.",
          );
        }

        if (
          !Number.isInteger(attemptIncrement) ||
          attemptIncrement < 0
        ) {
          throw new DueActionSyncJournalError(
            "ATTEMPT_INCREMENT_INVALID",
            "El incremento de intentos es inválido.",
          );
        }

        const rawMutation =
          await selectedDriver.get(
            STORE_NAMES.OUTBOX,
            mutationId,
          );

        if (rawMutation === null) {
          return deepFreeze({
            mutationMissing: true,
          });
        }

        const mutation =
          contract.normalizeOutboxMutation(
            rawMutation,
          );

        if (
          mutation.advisorPartitionKey !==
          advisorPartitionKey
        ) {
          throw new DueActionSyncJournalError(
            "CROSS_ADVISOR_MUTATION_STATE_DENIED",
            "La mutación pertenece a otro asesor.",
          );
        }

        const updated =
          contract.normalizeOutboxMutation({
            ...mutation,
            attemptCount:
              mutation.attemptCount +
              attemptIncrement,
            syncState,
          });

        await selectedDriver.runAtomic([
          {
            type: "put",
            storeName: STORE_NAMES.OUTBOX,
            value: updated,
          },
        ]);

        return deepFreeze({
          mutationMissing: false,
          mutation: updated,
        });
      }

      async function recordConflict({
        advisorPartitionKey,
        mutationId,
        localRecord,
        remoteRecord,
        reasonCode,
        detectedAt,
      }) {
        requireOpaque(
          advisorPartitionKey,
          "ADVISOR_PARTITION_INVALID",
          "La partición del asesor",
        );
        requireOpaque(
          mutationId,
          "MUTATION_ID_INVALID",
          "La mutación",
        );

        const normalizedDetectedAt =
          requireIso(
            detectedAt,
            "CONFLICT_TIME_INVALID",
            "La fecha del conflicto",
          );

        const normalizedReason =
          requireOpaque(
            reasonCode,
            "CONFLICT_REASON_INVALID",
            "La razón del conflicto",
          );

        const rawMutation =
          await selectedDriver.get(
            STORE_NAMES.OUTBOX,
            mutationId,
          );

        if (rawMutation === null) {
          throw new DueActionSyncJournalError(
            "CONFLICT_MUTATION_MISSING",
            "La mutación en conflicto no existe.",
          );
        }

        const mutation =
          contract.normalizeOutboxMutation(
            rawMutation,
          );
        const normalizedLocal =
          contract.normalizeDueActionRecord(
            localRecord,
          );
        const normalizedRemote =
          contract.normalizeDueActionRecord(
            remoteRecord,
          );

        for (const candidate of [
          mutation,
          normalizedLocal,
          normalizedRemote,
        ]) {
          if (
            candidate.advisorPartitionKey !==
            advisorPartitionKey
          ) {
            throw new DueActionSyncJournalError(
              "CROSS_ADVISOR_CONFLICT_DENIED",
              "El conflicto mezcla asesores.",
            );
          }

          if (
            candidate.prospectReference !==
            mutation.prospectReference
          ) {
            throw new DueActionSyncJournalError(
              "CROSS_PROSPECT_CONFLICT_DENIED",
              "El conflicto mezcla prospectos.",
            );
          }
        }

        const metadata =
          (
            await selectedDriver.get(
              STORE_NAMES.SYNC_META,
              advisorPartitionKey,
            )
          ) || {
            partitionKey:
              advisorPartitionKey,
            cursor: null,
            reconciledAt: null,
            conflicts: [],
          };

        const conflictId = [
          "NFAST09-CONFLICT",
          contract._private.stableHash({
            mutationId,
            remoteServerRevision:
              normalizedRemote.serverRevision,
            detectedAt:
              normalizedDetectedAt,
          }),
        ].join(":");

        const conflict = deepFreeze({
          conflictId,
          status: "OPEN",
          advisorPartitionKey,
          prospectReference:
            mutation.prospectReference,
          mutationId,
          dueActionVersion:
            mutation.dueActionVersion,
          localOperation:
            mutation.operation,
          localAuthorizedPatch:
            clone(
              mutation.authorizedPatch,
            ),
          baseServerRevision:
            mutation.baseServerRevision,
          remoteServerRevision:
            normalizedRemote.serverRevision,
          localRecord:
            clone(normalizedLocal),
          remoteRecord:
            clone(normalizedRemote),
          reasonCode:
            normalizedReason,
          detectedAt:
            normalizedDetectedAt,
        });

        const conflicts = [
          ...(Array.isArray(metadata.conflicts)
            ? metadata.conflicts
            : []),
        ].filter(
          existing =>
            existing.conflictId !==
            conflictId,
        );

        conflicts.push(conflict);
        conflicts.sort((left, right) =>
          left.detectedAt.localeCompare(
            right.detectedAt,
          ) ||
          left.conflictId.localeCompare(
            right.conflictId,
          ),
        );

        const conflictMutation =
          contract.normalizeOutboxMutation({
            ...mutation,
            syncState:
              "CONFLICT_REVIEW_REQUIRED",
          });

        const conflictRecord =
          contract.normalizeDueActionRecord({
            ...normalizedLocal,
            dueActionState:
              "CONFLICT_REVIEW_REQUIRED",
            syncState:
              "CONFLICT_REVIEW_REQUIRED",
            localUpdatedAt:
              normalizedDetectedAt,
            tombstone: false,
          });

        await selectedDriver.runAtomic([
          {
            type: "put",
            storeName: STORE_NAMES.OUTBOX,
            value: conflictMutation,
          },
          {
            type: "put",
            storeName:
              STORE_NAMES.DUE_ACTIONS,
            value: conflictRecord,
          },
          {
            type: "put",
            storeName:
              STORE_NAMES.SYNC_META,
            value: {
              ...metadata,
              partitionKey:
                advisorPartitionKey,
              conflicts,
            },
          },
        ]);

        return conflict;
      }

      async function listOpenConflicts(
        advisorPartitionKey,
      ) {
        requireOpaque(
          advisorPartitionKey,
          "ADVISOR_PARTITION_INVALID",
          "La partición del asesor",
        );

        const metadata =
          await selectedDriver.get(
            STORE_NAMES.SYNC_META,
            advisorPartitionKey,
          );

        if (
          !metadata ||
          !Array.isArray(metadata.conflicts)
        ) {
          return deepFreeze([]);
        }

        return deepFreeze(
          metadata.conflicts
            .filter(
              conflict =>
                conflict.status === "OPEN",
            )
            .map(clone)
            .sort((left, right) =>
              left.detectedAt.localeCompare(
                right.detectedAt,
              ) ||
              left.conflictId.localeCompare(
                right.conflictId,
              ),
            ),
        );
      }

      return deepFreeze({
        journalVersion: JOURNAL_VERSION,
        contractVersion:
          contract.CONTRACT_VERSION,
        driverType:
          selectedDriver.driverType ||
          "INJECTED",
        markMutationState,
        recordConflict,
        listOpenConflicts,
        close:
          typeof selectedDriver.close ===
          "function"
            ? () => selectedDriver.close()
            : async () => {},
        diagnostics: () =>
          deepFreeze({
            sharesGovernedDueActionDatabase:
              true,
            durableAttemptState: true,
            durableConflictJournal: true,
            conflictCandidatesPreserved:
              true,
            advisorPartitionIsolation:
              true,
            cacheDeleteOnReconnect:
              false,
            directNetworkAccessAllowed:
              false,
            providerInvocationAllowed:
              false,
            messageGenerationAllowed:
              false,
            messageSendAllowed: false,
          }),
      });
    }

    return deepFreeze({
      JOURNAL_VERSION,
      DATABASE_NAME,
      DATABASE_VERSION,
      STORE_NAMES,
      DueActionSyncJournalError,
      createIndexedDbDriver,
      create,
      _private: {
        clone,
        deepFreeze,
        requestPromise,
        transactionPromise,
        ensureSchema,
      },
    });
  },
);
