"use strict";

(function dueActionIndexedDbStoreModule(root, factory) {
  const contract =
    typeof module !== "undefined" &&
    module.exports
      ? require(
          "./due-action-offline-contract",
        )
      : root
          .ForgeDueActionOfflineContractNFAST09;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeDueActionIndexedDbStoreNFAST09 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function dueActionIndexedDbStoreFactory(contract) {
    if (!contract) {
      throw new Error(
        "NFAST_09_OFFLINE_CONTRACT_REQUIRED",
      );
    }

    const STORE_VERSION = "NFAST-09.3A";
    const DATABASE_NAME = "FORGE_OS_DUE_ACTIONS";
    const DATABASE_VERSION = 1;

    const STORE_NAMES = Object.freeze({
      DUE_ACTIONS: "dueActions",
      OUTBOX: "outbox",
      SYNC_META: "syncMeta",
    });

    class DueActionIndexedDbStoreError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name =
          "DueActionIndexedDbStoreError";
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
        throw new DueActionIndexedDbStoreError(
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
              const database =
                event.target.result;

              if (
                !database.objectStoreNames
                  .contains(
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
                !database.objectStoreNames
                  .contains(
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
                !database.objectStoreNames
                  .contains(
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
                new DueActionIndexedDbStoreError(
                  "INDEXEDDB_UPGRADE_BLOCKED",
                  "La actualización local está bloqueada por otra pestaña.",
                ),
              );
            };
          },
        );

        return databasePromise;
      }

      async function get(
        storeName,
        key,
      ) {
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

      async function getAllByIndex(
        storeName,
        indexName,
        value,
      ) {
        const database = await openDatabase();
        const transaction =
          database.transaction(
            [storeName],
            "readonly",
          );
        const index =
          transaction
            .objectStore(storeName)
            .index(indexName);
        const request =
          index.getAll(value);
        const result =
          await requestPromise(request);
        await transactionPromise(transaction);
        return clone(result || []);
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
            throw new DueActionIndexedDbStoreError(
              "ATOMIC_OPERATION_INVALID",
              "La operación local no es válida.",
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
        getAllByIndex,
        runAtomic,
        close,
      });
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
        "getAllByIndex",
        "runAtomic",
      ]) {
        if (
          typeof selectedDriver[method] !==
          "function"
        ) {
          throw new DueActionIndexedDbStoreError(
            "STORE_DRIVER_INVALID",
            "El driver local no cumple el contrato.",
            {
              missingMethod: method,
            },
          );
        }
      }

      async function getDueAction(
        advisorPartitionKey,
        prospectReference,
      ) {
        const recordKey =
          contract.recordKeyFor(
            advisorPartitionKey,
            prospectReference,
          );

        const result =
          await selectedDriver.get(
            STORE_NAMES.DUE_ACTIONS,
            recordKey,
          );

        if (result === null) return null;

        const normalized =
          contract
            .normalizeDueActionRecord(
              result,
            );

        if (
          normalized.advisorPartitionKey !==
          advisorPartitionKey
        ) {
          throw new DueActionIndexedDbStoreError(
            "CROSS_ADVISOR_LOCAL_READ_DENIED",
            "La copia local pertenece a otro asesor.",
          );
        }

        return normalized;
      }

      async function listDueActions(
        advisorPartitionKey,
      ) {
        contract.recordKeyFor(
          advisorPartitionKey,
          "partition-check",
        );

        const records =
          await selectedDriver.getAllByIndex(
            STORE_NAMES.DUE_ACTIONS,
            "advisorPartitionKey",
            advisorPartitionKey,
          );

        return deepFreeze(
          records
            .map(
              contract
                .normalizeDueActionRecord,
            )
            .filter(
              record =>
                record.advisorPartitionKey ===
                advisorPartitionKey,
            )
            .sort((left, right) =>
              left.recordKey.localeCompare(
                right.recordKey,
              ),
            ),
        );
      }

      async function listPendingMutations(
        advisorPartitionKey,
      ) {
        contract.recordKeyFor(
          advisorPartitionKey,
          "partition-check",
        );

        const mutations =
          await selectedDriver.getAllByIndex(
            STORE_NAMES.OUTBOX,
            "advisorPartitionKey",
            advisorPartitionKey,
          );

        return deepFreeze(
          mutations
            .map(
              contract
                .normalizeOutboxMutation,
            )
            .filter(
              mutation =>
                mutation.advisorPartitionKey ===
                advisorPartitionKey,
            )
            .sort((left, right) =>
              left.createdAt.localeCompare(
                right.createdAt,
              ) ||
              left.mutationId.localeCompare(
                right.mutationId,
              ),
            ),
        );
      }

      async function commitLocalMutation(
        recordInput,
        mutationInput,
      ) {
        const record =
          contract
            .normalizeDueActionRecord(
              recordInput,
            );
        const mutation =
          contract
            .normalizeOutboxMutation(
              mutationInput,
            );

        if (
          record.advisorPartitionKey !==
            mutation.advisorPartitionKey ||
          record.prospectReference !==
            mutation.prospectReference
        ) {
          throw new DueActionIndexedDbStoreError(
            "LOCAL_ATOMIC_PARTITION_MISMATCH",
            "El registro y la outbox no corresponden.",
          );
        }

        const existing =
          await selectedDriver.get(
            STORE_NAMES.OUTBOX,
            mutation.mutationId,
          );

        if (existing !== null) {
          const normalizedExisting =
            contract
              .normalizeOutboxMutation(
                existing,
              );

          if (
            contract._private
              .stableStringify(
                normalizedExisting,
              ) !==
            contract._private
              .stableStringify(mutation)
          ) {
            throw new DueActionIndexedDbStoreError(
              "MUTATION_ID_COLLISION",
              "La mutación ya existe con otro contenido.",
            );
          }

          return deepFreeze({
            idempotentReplay: true,
            record,
            mutation:
              normalizedExisting,
          });
        }

        await selectedDriver.runAtomic([
          {
            type: "put",
            storeName:
              STORE_NAMES.DUE_ACTIONS,
            value: record,
          },
          {
            type: "put",
            storeName:
              STORE_NAMES.OUTBOX,
            value: mutation,
          },
        ]);

        return deepFreeze({
          idempotentReplay: false,
          record,
          mutation,
        });
      }

      async function acknowledgeMutation({
        advisorPartitionKey,
        mutationId,
        acknowledged,
        serverRecord = null,
        serverRevision = null,
        acknowledgedAt,
      }) {
        contract.recordKeyFor(
          advisorPartitionKey,
          "partition-check",
        );

        if (acknowledged !== true) {
          throw new DueActionIndexedDbStoreError(
            "REMOTE_ACK_REQUIRED",
            "La outbox solo puede limpiarse con confirmación remota.",
          );
        }

        const mutation =
          await selectedDriver.get(
            STORE_NAMES.OUTBOX,
            mutationId,
          );

        if (mutation === null) {
          return deepFreeze({
            alreadyAcknowledged: true,
          });
        }

        const normalizedMutation =
          contract
            .normalizeOutboxMutation(
              mutation,
            );

        if (
          normalizedMutation
            .advisorPartitionKey !==
          advisorPartitionKey
        ) {
          throw new DueActionIndexedDbStoreError(
            "CROSS_ADVISOR_OUTBOX_ACK_DENIED",
            "La mutación pertenece a otro asesor.",
          );
        }

        const operations = [];

        if (serverRecord !== null) {
          const normalizedRecord =
            contract
              .normalizeDueActionRecord({
                ...serverRecord,
                serverRevision:
                  serverRevision ??
                  serverRecord
                    .serverRevision,
                lastSyncedAt:
                  acknowledgedAt,
                syncState: "SYNCED",
              });

          if (
            normalizedRecord
              .advisorPartitionKey !==
            advisorPartitionKey
          ) {
            throw new DueActionIndexedDbStoreError(
              "CROSS_ADVISOR_SERVER_RECORD_DENIED",
              "La confirmación remota pertenece a otro asesor.",
            );
          }

          operations.push({
            type: "put",
            storeName:
              STORE_NAMES.DUE_ACTIONS,
            value: normalizedRecord,
          });
        }

        operations.push({
          type: "delete",
          storeName:
            STORE_NAMES.OUTBOX,
          key: mutationId,
        });

        await selectedDriver.runAtomic(
          operations,
        );

        return deepFreeze({
          alreadyAcknowledged: false,
          mutationId,
          serverRevision,
        });
      }

      async function getSyncCursor(
        advisorPartitionKey,
      ) {
        contract.recordKeyFor(
          advisorPartitionKey,
          "partition-check",
        );

        const metadata =
          await selectedDriver.get(
            STORE_NAMES.SYNC_META,
            advisorPartitionKey,
          );

        return metadata === null
          ? null
          : deepFreeze(clone(metadata));
      }

      async function reconcileRemoteChanges({
        advisorPartitionKey,
        records,
        cursor,
        reconciledAt,
      }) {
        contract.recordKeyFor(
          advisorPartitionKey,
          "partition-check",
        );

        if (!Array.isArray(records)) {
          throw new DueActionIndexedDbStoreError(
            "REMOTE_RECORDS_INVALID",
            "Los cambios remotos no son válidos.",
          );
        }

        const normalizedRecords =
          records.map(record => {
            const normalized =
              contract
                .normalizeDueActionRecord({
                  ...record,
                  lastSyncedAt:
                    reconciledAt,
                  syncState: "SYNCED",
                });

            if (
              normalized
                .advisorPartitionKey !==
              advisorPartitionKey
            ) {
              throw new DueActionIndexedDbStoreError(
                "CROSS_ADVISOR_REMOTE_CHANGE_DENIED",
                "El cambio remoto pertenece a otro asesor.",
              );
            }

            return normalized;
          });

        const operations =
          normalizedRecords.map(record => ({
            type: "put",
            storeName:
              STORE_NAMES.DUE_ACTIONS,
            value: record,
          }));

        operations.push({
          type: "put",
          storeName:
            STORE_NAMES.SYNC_META,
          value: {
            partitionKey:
              advisorPartitionKey,
            cursor,
            reconciledAt,
          },
        });

        await selectedDriver.runAtomic(
          operations,
        );

        return deepFreeze({
          recordsApplied:
            normalizedRecords.length,
          cursor,
        });
      }

      async function clearAdvisorPartition(
        advisorPartitionKey,
      ) {
        const records =
          await listDueActions(
            advisorPartitionKey,
          );
        const mutations =
          await listPendingMutations(
            advisorPartitionKey,
          );

        const operations = [
          ...records.map(record => ({
            type: "delete",
            storeName:
              STORE_NAMES.DUE_ACTIONS,
            key: record.recordKey,
          })),
          ...mutations.map(mutation => ({
            type: "delete",
            storeName:
              STORE_NAMES.OUTBOX,
            key: mutation.mutationId,
          })),
          {
            type: "delete",
            storeName:
              STORE_NAMES.SYNC_META,
            key: advisorPartitionKey,
          },
        ];

        if (operations.length > 0) {
          await selectedDriver.runAtomic(
            operations,
          );
        }

        return deepFreeze({
          advisorPartitionKey,
          recordsRemoved: records.length,
          mutationsRemoved:
            mutations.length,
        });
      }

      return deepFreeze({
        storeVersion: STORE_VERSION,
        contractVersion:
          contract.CONTRACT_VERSION,
        driverType:
          selectedDriver.driverType ||
          "INJECTED",
        getDueAction,
        listDueActions,
        listPendingMutations,
        commitLocalMutation,
        acknowledgeMutation,
        getSyncCursor,
        reconcileRemoteChanges,
        clearAdvisorPartition,
        close:
          typeof selectedDriver.close ===
          "function"
            ? () => selectedDriver.close()
            : async () => {},
        diagnostics: () =>
          deepFreeze({
            offlineFirst: true,
            indexedDbProductionDriver: true,
            persistentLocalReplica: true,
            cacheDeleteOnReconnect: false,
            durableOutbox: true,
            outboxDeleteRequiresRemoteAck:
              true,
            atomicLocalMutation: true,
            atomicCursorReconciliation:
              true,
            advisorPartitionIsolation:
              true,
            directNetworkAccessAllowed:
              false,
            directDatabaseRemoteAccessAllowed:
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
      STORE_VERSION,
      DATABASE_NAME,
      DATABASE_VERSION,
      STORE_NAMES,
      DueActionIndexedDbStoreError,
      createIndexedDbDriver,
      create,
      _private: {
        clone,
        deepFreeze,
        requestPromise,
        transactionPromise,
      },
    });
  },
);
