"use strict";

(function activityLedgerLocalStoreModule(root, factory) {
  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-contract")
      : root.ForgeActivityLedgerContractFES02A;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeActivityLedgerLocalStoreFES02A = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function activityLedgerLocalStoreFactory(contract) {
    if (!contract) {
      throw new Error("FES02A_ACTIVITY_LEDGER_CONTRACT_REQUIRED");
    }

    const STORE_VERSION = "FES-02A.1";
    const DATABASE_NAME = "FORGE_OS_ACTIVITY_LEDGER";
    const DATABASE_VERSION = 1;

    const STORE_NAMES = Object.freeze({
      ENTRIES: "entries",
      OUTBOX: "outbox",
      RECEIPTS: "receipts",
      CONFLICTS: "conflicts",
      SYNC_META: "syncMeta",
    });

    class ActivityLedgerLocalStoreError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ActivityLedgerLocalStoreError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ActivityLedgerLocalStoreError(code, message, details);
    }

    function clone(value) {
      if (value === undefined) return undefined;
      return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
      if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
      }
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function requireOpaque(value, code, label, maximum = 240) {
      const normalized = String(value || "").trim();
      if (
        !normalized ||
        normalized.length > maximum ||
        !/^[A-Za-z0-9._:@/-]+$/.test(normalized)
      ) {
        error(code, `${label} no es válido.`);
      }
      return normalized;
    }

    function requestPromise(request) {
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    function transactionPromise(transaction) {
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () =>
          reject(
            transaction.error ||
              new Error("INDEXEDDB_TRANSACTION_ABORTED"),
          );
      });
    }

    function createMemoryDriver() {
      const stores = new Map(
        Object.values(STORE_NAMES).map(name => [name, new Map()]),
      );

      function keyFor(storeName, value) {
        if (storeName === STORE_NAMES.ENTRIES) return value.record_key;
        if (storeName === STORE_NAMES.OUTBOX) return value.mutation_id;
        if (storeName === STORE_NAMES.RECEIPTS) return value.event_id;
        if (storeName === STORE_NAMES.CONFLICTS) return value.conflict_id;
        if (storeName === STORE_NAMES.SYNC_META) return value.tenant_id;
        error("MEMORY_STORE_NAME_INVALID", "El store local no es válido.");
      }

      async function get(storeName, key) {
        const store = stores.get(storeName);
        if (!store) {
          error("MEMORY_STORE_NAME_INVALID", "El store local no es válido.");
        }
        const value = store.get(key);
        return value === undefined ? null : clone(value);
      }

      async function getAll(storeName) {
        const store = stores.get(storeName);
        if (!store) {
          error("MEMORY_STORE_NAME_INVALID", "El store local no es válido.");
        }
        return clone([...store.values()]);
      }

      async function getAllByIndex(storeName, indexName, value) {
        const all = await getAll(storeName);
        return all.filter(item => item[indexName] === value);
      }

      async function runAtomic(operations) {
        if (!Array.isArray(operations) || operations.length === 0) {
          return;
        }

        const snapshots = new Map(
          [...stores.entries()].map(([name, store]) => [
            name,
            new Map([...store.entries()].map(([key, value]) => [key, clone(value)])),
          ]),
        );

        try {
          for (const operation of operations) {
            const store = stores.get(operation.storeName);
            if (!store) {
              error("MEMORY_STORE_NAME_INVALID", "El store local no es válido.");
            }

            if (operation.type === "put") {
              const value = clone(operation.value);
              store.set(keyFor(operation.storeName, value), value);
            } else if (operation.type === "delete") {
              store.delete(operation.key);
            } else {
              error(
                "ATOMIC_OPERATION_INVALID",
                "La operación atómica no es válida.",
              );
            }
          }
        } catch (caught) {
          stores.clear();
          for (const [name, snapshot] of snapshots.entries()) {
            stores.set(name, snapshot);
          }
          throw caught;
        }
      }

      async function close() {}

      return deepFreeze({
        driver_type: "MEMORY",
        get,
        getAll,
        getAllByIndex,
        runAtomic,
        close,
      });
    }

    function createIndexedDbDriver({
      indexedDBFactory,
      databaseName = DATABASE_NAME,
      databaseVersion = DATABASE_VERSION,
    } = {}) {
      const indexedDB =
        indexedDBFactory ||
        (typeof globalThis !== "undefined" ? globalThis.indexedDB : null);

      if (!indexedDB || typeof indexedDB.open !== "function") {
        error("INDEXEDDB_REQUIRED", "IndexedDB no está disponible.");
      }

      let databasePromise = null;

      function openDatabase() {
        if (databasePromise) return databasePromise;

        databasePromise = new Promise((resolve, reject) => {
          const request = indexedDB.open(databaseName, databaseVersion);

          request.onupgradeneeded = event => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAMES.ENTRIES)) {
              const entries = database.createObjectStore(
                STORE_NAMES.ENTRIES,
                { keyPath: "record_key" },
              );
              entries.createIndex("tenant_id", "tenant_id", {
                unique: false,
              });
              entries.createIndex("event_id", "event_id", {
                unique: true,
              });
            }

            if (!database.objectStoreNames.contains(STORE_NAMES.OUTBOX)) {
              const outbox = database.createObjectStore(
                STORE_NAMES.OUTBOX,
                { keyPath: "mutation_id" },
              );
              outbox.createIndex("tenant_id", "tenant_id", {
                unique: false,
              });
              outbox.createIndex("state", "state", {
                unique: false,
              });
              outbox.createIndex("created_at", "created_at", {
                unique: false,
              });
            }

            if (!database.objectStoreNames.contains(STORE_NAMES.RECEIPTS)) {
              const receipts = database.createObjectStore(
                STORE_NAMES.RECEIPTS,
                { keyPath: "event_id" },
              );
              receipts.createIndex("tenant_id", "tenant_id", {
                unique: false,
              });
              receipts.createIndex("server_sequence", "server_sequence", {
                unique: false,
              });
            }

            if (!database.objectStoreNames.contains(STORE_NAMES.CONFLICTS)) {
              const conflicts = database.createObjectStore(
                STORE_NAMES.CONFLICTS,
                { keyPath: "conflict_id" },
              );
              conflicts.createIndex("tenant_id", "tenant_id", {
                unique: false,
              });
              conflicts.createIndex("status", "status", {
                unique: false,
              });
            }

            if (!database.objectStoreNames.contains(STORE_NAMES.SYNC_META)) {
              database.createObjectStore(STORE_NAMES.SYNC_META, {
                keyPath: "tenant_id",
              });
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
              new ActivityLedgerLocalStoreError(
                "INDEXEDDB_UPGRADE_BLOCKED",
                "La actualización local está bloqueada por otra pestaña.",
              ),
            );
          };
        });

        return databasePromise;
      }

      async function get(storeName, key) {
        const database = await openDatabase();
        const transaction = database.transaction([storeName], "readonly");
        const request = transaction.objectStore(storeName).get(key);
        const result = await requestPromise(request);
        await transactionPromise(transaction);
        return result === undefined ? null : clone(result);
      }

      async function getAll(storeName) {
        const database = await openDatabase();
        const transaction = database.transaction([storeName], "readonly");
        const request = transaction.objectStore(storeName).getAll();
        const result = await requestPromise(request);
        await transactionPromise(transaction);
        return clone(result || []);
      }

      async function getAllByIndex(storeName, indexName, value) {
        const database = await openDatabase();
        const transaction = database.transaction([storeName], "readonly");
        const request = transaction
          .objectStore(storeName)
          .index(indexName)
          .getAll(value);
        const result = await requestPromise(request);
        await transactionPromise(transaction);
        return clone(result || []);
      }

      async function runAtomic(operations) {
        if (!Array.isArray(operations) || operations.length === 0) return;

        const storeNames = [
          ...new Set(operations.map(operation => operation.storeName)),
        ];
        const database = await openDatabase();
        const transaction = database.transaction(storeNames, "readwrite");

        for (const operation of operations) {
          const store = transaction.objectStore(operation.storeName);
          if (operation.type === "put") {
            store.put(clone(operation.value));
          } else if (operation.type === "delete") {
            store.delete(operation.key);
          } else {
            transaction.abort();
            error(
              "ATOMIC_OPERATION_INVALID",
              "La operación atómica no es válida.",
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
        driver_type: "INDEXEDDB",
        database_name: databaseName,
        database_version: databaseVersion,
        get,
        getAll,
        getAllByIndex,
        runAtomic,
        close,
      });
    }

    function create({
      driver = null,
      indexedDBFactory = null,
      databaseName = DATABASE_NAME,
      clock = () => new Date().toISOString(),
    } = {}) {
      const selectedDriver =
        driver ||
        createIndexedDbDriver({
          indexedDBFactory,
          databaseName,
        });

      for (const method of [
        "get",
        "getAll",
        "getAllByIndex",
        "runAtomic",
      ]) {
        if (typeof selectedDriver[method] !== "function") {
          error("STORE_DRIVER_INVALID", "El driver local no cumple el contrato.", {
            missing_method: method,
          });
        }
      }

      function tenant(value) {
        return requireOpaque(
          value,
          "TENANT_ID_INVALID",
          "El tenant",
        );
      }

      async function getEntry(tenantId, eventId) {
        const recordKey = contract.recordKeyFor(
          tenant(tenantId),
          requireOpaque(eventId, "EVENT_ID_INVALID", "El evento"),
        );
        const value = await selectedDriver.get(
          STORE_NAMES.ENTRIES,
          recordKey,
        );
        if (value === null) return null;
        const record = contract.assertLedgerRecord(value);
        if (record.tenant_id !== tenantId) {
          error(
            "CROSS_TENANT_LOCAL_READ_DENIED",
            "El registro local pertenece a otro tenant.",
          );
        }
        return record;
      }

      async function getMutation(mutationId) {
        const value = await selectedDriver.get(
          STORE_NAMES.OUTBOX,
          requireOpaque(
            mutationId,
            "LEDGER_MUTATION_ID_INVALID",
            "La mutación",
          ),
        );
        return value === null ? null : contract.assertAppendMutation(value);
      }

      async function getReceipt(eventId) {
        const value = await selectedDriver.get(
          STORE_NAMES.RECEIPTS,
          requireOpaque(eventId, "EVENT_ID_INVALID", "El evento"),
        );
        return value === null ? null : contract.assertReceipt(value);
      }

      async function appendLocal(ledgerRecord, mutation) {
        const record = contract.assertLedgerRecord(ledgerRecord);
        const normalizedMutation = contract.assertAppendMutation(mutation);

        if (
          record.tenant_id !== normalizedMutation.tenant_id ||
          record.event_id !== normalizedMutation.event_id ||
          record.event_digest !== normalizedMutation.event_digest
        ) {
          error(
            "LOCAL_APPEND_MUTATION_MISMATCH",
            "El registro y la mutación local no coinciden.",
          );
        }

        const existing = await selectedDriver.get(
          STORE_NAMES.ENTRIES,
          record.record_key,
        );

        if (existing !== null) {
          const normalizedExisting = contract.assertLedgerRecord(existing);

          if (normalizedExisting.event_digest === record.event_digest) {
            return deepFreeze({
              appended: false,
              idempotent_replay: true,
              conflict: null,
              record: normalizedExisting,
              mutation:
                (await getMutation(normalizedMutation.mutation_id)) ||
                normalizedMutation,
            });
          }

          const conflict = contract.createConflict({
            tenant_id: record.tenant_id,
            event_id: record.event_id,
            mutation_id: normalizedMutation.mutation_id,
            reason_code: "LOCAL_EVENT_ID_DIGEST_CONFLICT",
            local_record: record,
            remote_record: normalizedExisting,
            detected_at: clock(),
          });
          const conflictMutation = contract.createConflictMutation(
            normalizedMutation,
            "LOCAL_EVENT_ID_DIGEST_CONFLICT",
          );

          await selectedDriver.runAtomic([
            {
              type: "put",
              storeName: STORE_NAMES.CONFLICTS,
              value: conflict,
            },
            {
              type: "put",
              storeName: STORE_NAMES.OUTBOX,
              value: conflictMutation,
            },
          ]);

          return deepFreeze({
            appended: false,
            idempotent_replay: false,
            conflict,
            record: normalizedExisting,
            mutation: conflictMutation,
          });
        }

        await selectedDriver.runAtomic([
          {
            type: "put",
            storeName: STORE_NAMES.ENTRIES,
            value: record,
          },
          {
            type: "put",
            storeName: STORE_NAMES.OUTBOX,
            value: normalizedMutation,
          },
        ]);

        return deepFreeze({
          appended: true,
          idempotent_replay: false,
          conflict: null,
          record,
          mutation: normalizedMutation,
        });
      }

      async function listEntries(tenantId) {
        const selectedTenant = tenant(tenantId);
        const values = await selectedDriver.getAllByIndex(
          STORE_NAMES.ENTRIES,
          "tenant_id",
          selectedTenant,
        );

        return deepFreeze(
          values
            .map(contract.assertLedgerRecord)
            .filter(record => record.tenant_id === selectedTenant)
            .sort((left, right) => {
              const occurred =
                left.canonical_event.occurred_at.localeCompare(
                  right.canonical_event.occurred_at,
                );
              return occurred || left.event_id.localeCompare(right.event_id);
            }),
        );
      }

      async function listPendingOutbox(tenantId) {
        const selectedTenant = tenant(tenantId);
        const values = await selectedDriver.getAllByIndex(
          STORE_NAMES.OUTBOX,
          "tenant_id",
          selectedTenant,
        );

        return deepFreeze(
          values
            .map(contract.assertAppendMutation)
            .filter(
              mutation =>
                mutation.tenant_id === selectedTenant &&
                ["PENDING", "RETRY"].includes(mutation.state),
            )
            .sort((left, right) => {
              const created = left.created_at.localeCompare(right.created_at);
              return created || left.mutation_id.localeCompare(right.mutation_id);
            }),
        );
      }

      async function listConflicts(tenantId, status = "OPEN") {
        const selectedTenant = tenant(tenantId);
        const values = await selectedDriver.getAllByIndex(
          STORE_NAMES.CONFLICTS,
          "tenant_id",
          selectedTenant,
        );

        return deepFreeze(
          values
            .map(contract.assertConflict)
            .filter(
              conflict =>
                conflict.tenant_id === selectedTenant &&
                conflict.status === status,
            )
            .sort((left, right) =>
              left.detected_at.localeCompare(right.detected_at),
            ),
        );
      }

      async function markMutationRetry(mutationId, errorCode) {
        const mutation = await getMutation(mutationId);
        if (!mutation) {
          error(
            "OUTBOX_MUTATION_NOT_FOUND",
            "La mutación de outbox no existe.",
          );
        }
        const retry = contract.createRetryMutation(mutation, errorCode);
        await selectedDriver.runAtomic([
          {
            type: "put",
            storeName: STORE_NAMES.OUTBOX,
            value: retry,
          },
        ]);
        return retry;
      }

      async function recordConflict(conflict, mutation = null) {
        const normalized = contract.assertConflict(conflict);
        const operations = [
          {
            type: "put",
            storeName: STORE_NAMES.CONFLICTS,
            value: normalized,
          },
        ];

        if (mutation) {
          const conflictMutation = contract.createConflictMutation(
            mutation,
            normalized.reason_code,
          );
          operations.push({
            type: "put",
            storeName: STORE_NAMES.OUTBOX,
            value: conflictMutation,
          });
        }

        await selectedDriver.runAtomic(operations);
        return normalized;
      }

      async function acknowledgeMutation(mutationId, receipt) {
        const mutation = await getMutation(mutationId);
        if (!mutation) {
          error(
            "OUTBOX_MUTATION_NOT_FOUND",
            "La mutación de outbox no existe.",
          );
        }
        const normalizedReceipt = contract.assertReceipt(receipt);

        if (
          normalizedReceipt.mutation_id !== mutation.mutation_id ||
          normalizedReceipt.tenant_id !== mutation.tenant_id ||
          normalizedReceipt.event_id !== mutation.event_id
        ) {
          error(
            "REMOTE_RECEIPT_MUTATION_MISMATCH",
            "El recibo remoto no coincide con la mutación.",
          );
        }

        await selectedDriver.runAtomic([
          {
            type: "delete",
            storeName: STORE_NAMES.OUTBOX,
            key: mutation.mutation_id,
          },
          {
            type: "put",
            storeName: STORE_NAMES.RECEIPTS,
            value: normalizedReceipt,
          },
          {
            type: "put",
            storeName: STORE_NAMES.SYNC_META,
            value: {
              tenant_id: mutation.tenant_id,
              cursor: normalizedReceipt.cursor,
              updated_at: normalizedReceipt.server_recorded_at,
            },
          },
        ]);

        return normalizedReceipt;
      }

      async function getCursor(tenantId) {
        const selectedTenant = tenant(tenantId);
        const value = await selectedDriver.get(
          STORE_NAMES.SYNC_META,
          selectedTenant,
        );
        if (value === null) return null;
        if (value.tenant_id !== selectedTenant) {
          error(
            "CROSS_TENANT_CURSOR_READ_DENIED",
            "El cursor pertenece a otro tenant.",
          );
        }
        return value.cursor || null;
      }

      async function setCursor(tenantId, cursor, updatedAt = clock()) {
        const selectedTenant = tenant(tenantId);
        const selectedCursor =
          cursor === null || cursor === undefined || cursor === ""
            ? null
            : requireOpaque(
                cursor,
                "REMOTE_CURSOR_INVALID",
                "El cursor remoto",
              );

        await selectedDriver.runAtomic([
          {
            type: "put",
            storeName: STORE_NAMES.SYNC_META,
            value: {
              tenant_id: selectedTenant,
              cursor: selectedCursor,
              updated_at: new Date(updatedAt).toISOString(),
            },
          },
        ]);
        return selectedCursor;
      }

      async function applyRemoteRecord(ledgerRecord, receipt) {
        const record = contract.assertLedgerRecord(ledgerRecord);
        const normalizedReceipt = contract.assertReceipt(receipt);

        if (
          record.tenant_id !== normalizedReceipt.tenant_id ||
          record.event_id !== normalizedReceipt.event_id
        ) {
          error(
            "REMOTE_RECORD_RECEIPT_MISMATCH",
            "El registro remoto no coincide con su recibo.",
          );
        }

        const existing = await selectedDriver.get(
          STORE_NAMES.ENTRIES,
          record.record_key,
        );

        if (existing !== null) {
          const normalizedExisting = contract.assertLedgerRecord(existing);
          if (normalizedExisting.event_digest !== record.event_digest) {
            const conflict = contract.createConflict({
              tenant_id: record.tenant_id,
              event_id: record.event_id,
              mutation_id: normalizedReceipt.mutation_id,
              reason_code: "REMOTE_EVENT_ID_DIGEST_CONFLICT",
              local_record: normalizedExisting,
              remote_record: record,
              detected_at: clock(),
            });
            await recordConflict(conflict);
            return deepFreeze({
              applied: false,
              idempotent_replay: false,
              conflict,
              record: normalizedExisting,
            });
          }
        }

        await selectedDriver.runAtomic([
          {
            type: "put",
            storeName: STORE_NAMES.ENTRIES,
            value: record,
          },
          {
            type: "put",
            storeName: STORE_NAMES.RECEIPTS,
            value: normalizedReceipt,
          },
          {
            type: "put",
            storeName: STORE_NAMES.SYNC_META,
            value: {
              tenant_id: record.tenant_id,
              cursor: normalizedReceipt.cursor,
              updated_at: normalizedReceipt.server_recorded_at,
            },
          },
        ]);

        return deepFreeze({
          applied: existing === null,
          idempotent_replay: existing !== null,
          conflict: null,
          record,
        });
      }

      async function close() {
        if (typeof selectedDriver.close === "function") {
          await selectedDriver.close();
        }
      }

      return deepFreeze({
        store_version: STORE_VERSION,
        driver_type: selectedDriver.driver_type || "CUSTOM",
        appendLocal,
        getEntry,
        listEntries,
        listPendingOutbox,
        listConflicts,
        getMutation,
        getReceipt,
        markMutationRetry,
        recordConflict,
        acknowledgeMutation,
        getCursor,
        setCursor,
        applyRemoteRecord,
        close,
      });
    }

    return deepFreeze({
      STORE_VERSION,
      DATABASE_NAME,
      DATABASE_VERSION,
      STORE_NAMES,
      ActivityLedgerLocalStoreError,
      createMemoryDriver,
      createIndexedDbDriver,
      create,
      _private: deepFreeze({
        deepFreeze,
        clone,
      }),
    });
  },
);
