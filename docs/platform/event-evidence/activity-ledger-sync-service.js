"use strict";

(function activityLedgerSyncServiceModule(root, factory) {
  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-contract")
      : root.ForgeActivityLedgerContractFES02A;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeActivityLedgerSyncServiceFES02A = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function activityLedgerSyncServiceFactory(contract) {
    if (!contract) {
      throw new Error("FES02A_ACTIVITY_LEDGER_CONTRACT_REQUIRED");
    }

    const SERVICE_VERSION = "FES-02A.1";

    class ActivityLedgerSyncServiceError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ActivityLedgerSyncServiceError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ActivityLedgerSyncServiceError(code, message, details);
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

    function normalizeGatewayPushResult(result) {
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        error(
          "LEDGER_GATEWAY_PUSH_RESULT_INVALID",
          "La respuesta push no es válida.",
        );
      }

      if (result.status === "CONFLICT") {
        return deepFreeze({
          status: "CONFLICT",
          reason_code: requireOpaque(
            result.reason_code,
            "LEDGER_GATEWAY_CONFLICT_REASON_INVALID",
            "La razón de conflicto",
            120,
          ),
          remote_record:
            result.remote_record === null || result.remote_record === undefined
              ? null
              : contract.assertLedgerRecord(result.remote_record),
          detected_at:
            result.detected_at || new Date().toISOString(),
        });
      }

      return deepFreeze({
        status: result.status,
        receipt: contract.assertReceipt(result.receipt),
      });
    }

    function normalizePullResult(result, tenantId) {
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        error(
          "LEDGER_GATEWAY_PULL_RESULT_INVALID",
          "La respuesta pull no es válida.",
        );
      }

      if (!Array.isArray(result.changes)) {
        error(
          "LEDGER_GATEWAY_PULL_CHANGES_INVALID",
          "Los cambios remotos no son válidos.",
        );
      }

      const changes = result.changes.map(change => {
        if (!change || typeof change !== "object" || Array.isArray(change)) {
          error(
            "LEDGER_GATEWAY_PULL_CHANGE_INVALID",
            "Un cambio remoto no es válido.",
          );
        }
        const record = contract.assertLedgerRecord(change.ledger_record);
        const receipt = contract.assertReceipt(change.receipt);
        if (
          record.tenant_id !== tenantId ||
          receipt.tenant_id !== tenantId ||
          record.event_id !== receipt.event_id
        ) {
          error(
            "LEDGER_GATEWAY_PULL_TENANT_MISMATCH",
            "Un cambio remoto pertenece a otro tenant.",
          );
        }
        return deepFreeze({ ledger_record: record, receipt });
      });

      return deepFreeze({
        changes,
        cursor:
          result.cursor === null ||
          result.cursor === undefined ||
          result.cursor === ""
            ? null
            : requireOpaque(
                result.cursor,
                "REMOTE_CURSOR_INVALID",
                "El cursor remoto",
              ),
        has_more: Boolean(result.has_more),
      });
    }

    function create({
      store,
      gateway,
      clock = () => new Date().toISOString(),
      pullLimit = 200,
    } = {}) {
      if (
        !store ||
        typeof store.listPendingOutbox !== "function" ||
        typeof store.acknowledgeMutation !== "function" ||
        typeof store.markMutationRetry !== "function" ||
        typeof store.recordConflict !== "function" ||
        typeof store.getCursor !== "function" ||
        typeof store.setCursor !== "function" ||
        typeof store.applyRemoteRecord !== "function"
      ) {
        error(
          "LEDGER_SYNC_STORE_INVALID",
          "El store no cumple el contrato de sincronización.",
        );
      }

      if (
        !gateway ||
        typeof gateway.pushMutation !== "function" ||
        typeof gateway.pullChanges !== "function"
      ) {
        error(
          "LEDGER_SYNC_GATEWAY_INVALID",
          "El gateway no cumple el contrato de sincronización.",
        );
      }

      if (!Number.isSafeInteger(pullLimit) || pullLimit < 1 || pullLimit > 500) {
        error(
          "LEDGER_SYNC_PULL_LIMIT_INVALID",
          "El límite de pull no es válido.",
        );
      }

      let closed = false;
      let activeSync = null;

      function ensureOpen() {
        if (closed) {
          error(
            "LEDGER_SYNC_SERVICE_CLOSED",
            "El servicio de sincronización está cerrado.",
          );
        }
      }

      async function runSync(tenantId) {
        const tenant = requireOpaque(
          tenantId,
          "TENANT_ID_INVALID",
          "El tenant",
        );

        const summary = {
          tenant_id: tenant,
          started_at: clock(),
          push_attempted: 0,
          push_acknowledged: 0,
          push_idempotent_replays: 0,
          push_conflicts: 0,
          push_retries: 0,
          pull_batches: 0,
          pull_received: 0,
          pull_applied: 0,
          pull_idempotent_replays: 0,
          pull_conflicts: 0,
          final_cursor: null,
          completed_at: null,
        };

        const pending = await store.listPendingOutbox(tenant);

        for (const mutation of pending) {
          summary.push_attempted += 1;

          try {
            const result = normalizeGatewayPushResult(
              await gateway.pushMutation(mutation),
            );

            if (
              result.status === "ACKNOWLEDGED" ||
              result.status === "IDEMPOTENT_REPLAY"
            ) {
              await store.acknowledgeMutation(
                mutation.mutation_id,
                result.receipt,
              );
              if (result.status === "ACKNOWLEDGED") {
                summary.push_acknowledged += 1;
              } else {
                summary.push_idempotent_replays += 1;
              }
              continue;
            }

            if (result.status === "CONFLICT") {
              const conflict = contract.createConflict({
                tenant_id: mutation.tenant_id,
                event_id: mutation.event_id,
                mutation_id: mutation.mutation_id,
                reason_code: result.reason_code,
                local_record: mutation.ledger_record,
                remote_record: result.remote_record,
                detected_at: result.detected_at,
              });
              await store.recordConflict(conflict, mutation);
              summary.push_conflicts += 1;
              continue;
            }

            error(
              "LEDGER_GATEWAY_PUSH_STATUS_INVALID",
              "El estado push no es válido.",
            );
          } catch (caught) {
            const retryCode =
              caught && caught.code
                ? caught.code
                : "LEDGER_REMOTE_PUSH_FAILED";
            await store.markMutationRetry(
              mutation.mutation_id,
              retryCode,
            );
            summary.push_retries += 1;
          }
        }

        let cursor = await store.getCursor(tenant);
        let hasMore = true;

        while (hasMore) {
          const pulled = normalizePullResult(
            await gateway.pullChanges({
              tenant_id: tenant,
              cursor,
              limit: pullLimit,
            }),
            tenant,
          );

          summary.pull_batches += 1;
          summary.pull_received += pulled.changes.length;

          for (const change of pulled.changes) {
            const applied = await store.applyRemoteRecord(
              change.ledger_record,
              change.receipt,
            );
            if (applied.conflict) {
              summary.pull_conflicts += 1;
            } else if (applied.idempotent_replay) {
              summary.pull_idempotent_replays += 1;
            } else if (applied.applied) {
              summary.pull_applied += 1;
            }
          }

          if (pulled.cursor !== null) {
            cursor = pulled.cursor;
            await store.setCursor(tenant, cursor, clock());
          }

          hasMore = pulled.has_more;
          if (hasMore && pulled.changes.length === 0) {
            error(
              "LEDGER_PULL_CURSOR_STALLED",
              "El pull remoto quedó estancado.",
            );
          }
        }

        summary.final_cursor = await store.getCursor(tenant);
        summary.completed_at = clock();
        return deepFreeze(summary);
      }

      async function syncOnce(tenantId) {
        ensureOpen();
        if (activeSync) return activeSync;
        activeSync = runSync(tenantId);
        try {
          return await activeSync;
        } finally {
          activeSync = null;
        }
      }

      async function close() {
        closed = true;
        if (activeSync) {
          await activeSync.catch(() => {});
        }
      }

      return deepFreeze({
        service_version: SERVICE_VERSION,
        syncOnce,
        close,
      });
    }

    return deepFreeze({
      SERVICE_VERSION,
      ActivityLedgerSyncServiceError,
      create,
      _private: deepFreeze({
        normalizeGatewayPushResult,
        normalizePullResult,
      }),
    });
  },
);
