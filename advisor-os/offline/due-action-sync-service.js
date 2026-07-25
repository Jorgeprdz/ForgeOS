"use strict";

(function dueActionSyncServiceModule(root, factory) {
  const contract =
    typeof module !== "undefined" &&
    module.exports
      ? require("./due-action-offline-contract")
      : root.ForgeDueActionOfflineContractNFAST09;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeDueActionSyncServiceNFAST09 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function dueActionSyncServiceFactory(contract) {
    if (!contract) {
      throw new Error(
        "NFAST_09_OFFLINE_CONTRACT_REQUIRED",
      );
    }

    const SYNC_SERVICE_VERSION = "NFAST-09.3B";

    class DueActionSyncServiceError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "DueActionSyncServiceError";
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
        throw new DueActionSyncServiceError(
          code,
          `${label} no es válido.`,
        );
      }

      return normalized;
    }

    function requireIso(value, code, label) {
      if (!contract._private.isIsoDate(value)) {
        throw new DueActionSyncServiceError(
          code,
          `${label} no es válida.`,
        );
      }

      return new Date(value).toISOString();
    }

    function normalizePushResponse(
      response,
      expectedMutationId,
    ) {
      if (
        !response ||
        typeof response !== "object" ||
        Array.isArray(response)
      ) {
        throw new DueActionSyncServiceError(
          "PUSH_RESPONSE_INVALID",
          "La respuesta de envío es inválida.",
        );
      }

      if (
        response.mutationId !==
        expectedMutationId
      ) {
        throw new DueActionSyncServiceError(
          "PUSH_MUTATION_ID_MISMATCH",
          "La respuesta no corresponde a la mutación enviada.",
        );
      }

      if (response.status === "ACKNOWLEDGED") {
        return deepFreeze({
          status: "ACKNOWLEDGED",
          mutationId:
            expectedMutationId,
          acknowledgedAt:
            requireIso(
              response.acknowledgedAt,
              "ACKNOWLEDGED_AT_INVALID",
              "La confirmación remota",
            ),
          serverRevision:
            requireOpaque(
              response.serverRevision,
              "SERVER_REVISION_INVALID",
              "La revisión remota",
            ),
          serverRecord:
            contract.normalizeDueActionRecord(
              response.serverRecord,
            ),
        });
      }

      if (response.status === "CONFLICT") {
        return deepFreeze({
          status: "CONFLICT",
          mutationId:
            expectedMutationId,
          detectedAt:
            requireIso(
              response.detectedAt,
              "CONFLICT_TIME_INVALID",
              "La fecha del conflicto",
            ),
          reasonCode:
            requireOpaque(
              response.reasonCode,
              "CONFLICT_REASON_INVALID",
              "La razón del conflicto",
            ),
          remoteRecord:
            contract.normalizeDueActionRecord(
              response.remoteRecord,
            ),
        });
      }

      throw new DueActionSyncServiceError(
        "PUSH_STATUS_INVALID",
        "El estado remoto de la mutación es inválido.",
      );
    }

    function normalizePullResponse(response) {
      if (
        !response ||
        typeof response !== "object" ||
        Array.isArray(response) ||
        !Array.isArray(response.records)
      ) {
        throw new DueActionSyncServiceError(
          "PULL_RESPONSE_INVALID",
          "La respuesta incremental es inválida.",
        );
      }

      const records =
        response.records.map(
          contract.normalizeDueActionRecord,
        );

      const nextCursor =
        response.nextCursor === null ||
        response.nextCursor === undefined
          ? null
          : requireOpaque(
              response.nextCursor,
              "SYNC_CURSOR_INVALID",
              "El cursor remoto",
            );

      return deepFreeze({
        records,
        nextCursor,
        hasMore:
          Boolean(response.hasMore),
      });
    }

    function create({
      store,
      journal,
      gateway,
      clock = () =>
        new Date().toISOString(),
      maxPullPages = 20,
    } = {}) {
      for (const method of [
        "getDueAction",
        "listPendingMutations",
        "acknowledgeMutation",
        "getSyncCursor",
        "reconcileRemoteChanges",
      ]) {
        if (
          !store ||
          typeof store[method] !==
          "function"
        ) {
          throw new DueActionSyncServiceError(
            "OFFLINE_STORE_INVALID",
            "La tienda offline no cumple el contrato.",
            {
              missingMethod: method,
            },
          );
        }
      }

      for (const method of [
        "markMutationState",
        "recordConflict",
        "listOpenConflicts",
      ]) {
        if (
          !journal ||
          typeof journal[method] !==
          "function"
        ) {
          throw new DueActionSyncServiceError(
            "SYNC_JOURNAL_INVALID",
            "El journal no cumple el contrato.",
            {
              missingMethod: method,
            },
          );
        }
      }

      for (const method of [
        "pushMutation",
        "pullChanges",
      ]) {
        if (
          !gateway ||
          typeof gateway[method] !==
          "function"
        ) {
          throw new DueActionSyncServiceError(
            "SYNC_GATEWAY_INVALID",
            "El gateway remoto no cumple el contrato.",
            {
              missingMethod: method,
            },
          );
        }
      }

      if (
        !Number.isInteger(maxPullPages) ||
        maxPullPages < 1 ||
        maxPullPages > 100
      ) {
        throw new DueActionSyncServiceError(
          "MAX_PULL_PAGES_INVALID",
          "El límite de páginas es inválido.",
        );
      }

      const inFlightByAdvisor = new Map();

      async function performSync({
        advisorPartitionKey,
        online,
        authenticated,
        trigger = "MANUAL",
      }) {
        const advisor =
          requireOpaque(
            advisorPartitionKey,
            "ADVISOR_PARTITION_INVALID",
            "La partición del asesor",
          );

        const normalizedTrigger =
          requireOpaque(
            trigger,
            "SYNC_TRIGGER_INVALID",
            "El disparador",
          );

        if (online !== true) {
          return deepFreeze({
            status: "OFFLINE",
            advisorPartitionKey:
              advisor,
            trigger:
              normalizedTrigger,
            gatewayInvoked: false,
            pushed: 0,
            conflicts: 0,
            failed: 0,
            pulled: 0,
            cursor: null,
          });
        }

        if (authenticated !== true) {
          return deepFreeze({
            status: "AUTH_REQUIRED",
            advisorPartitionKey:
              advisor,
            trigger:
              normalizedTrigger,
            gatewayInvoked: false,
            pushed: 0,
            conflicts: 0,
            failed: 0,
            pulled: 0,
            cursor: null,
          });
        }

        const syncStartedAt =
          requireIso(
            clock(),
            "SYNC_TIME_INVALID",
            "La fecha de sincronización",
          );

        const initialPending =
          await store.listPendingMutations(
            advisor,
          );

        let pushed = 0;
        let conflicts = 0;
        let failed = 0;

        for (
          const originalMutation
          of initialPending
        ) {
          const mutation =
            contract.normalizeOutboxMutation(
              originalMutation,
            );

          if (
            mutation.syncState ===
            "CONFLICT_REVIEW_REQUIRED"
          ) {
            conflicts += 1;
            continue;
          }

          const marked =
            await journal.markMutationState({
              advisorPartitionKey:
                advisor,
              mutationId:
                mutation.mutationId,
              syncState: "SYNCING",
              attemptIncrement: 1,
            });

          if (marked.mutationMissing) {
            continue;
          }

          let rawResponse;

          try {
            rawResponse =
              await gateway.pushMutation({
                advisorPartitionKey:
                  advisor,
                mutation:
                  marked.mutation,
              });
          } catch (error) {
            failed += 1;

            await journal.markMutationState({
              advisorPartitionKey:
                advisor,
              mutationId:
                mutation.mutationId,
              syncState:
                "SYNC_FAILED",
              attemptIncrement: 0,
            });

            continue;
          }

          let response;

          try {
            response =
              normalizePushResponse(
                rawResponse,
                mutation.mutationId,
              );
          } catch (error) {
            failed += 1;

            await journal.markMutationState({
              advisorPartitionKey:
                advisor,
              mutationId:
                mutation.mutationId,
              syncState:
                "SYNC_FAILED",
              attemptIncrement: 0,
            });

            throw error;
          }

          if (
            response.status ===
            "ACKNOWLEDGED"
          ) {
            if (
              response.serverRecord
                .advisorPartitionKey !==
              advisor
            ) {
              throw new DueActionSyncServiceError(
                "CROSS_ADVISOR_ACK_DENIED",
                "La confirmación remota pertenece a otro asesor.",
              );
            }

            await store.acknowledgeMutation({
              advisorPartitionKey:
                advisor,
              mutationId:
                mutation.mutationId,
              acknowledged: true,
              serverRecord:
                response.serverRecord,
              serverRevision:
                response.serverRevision,
              acknowledgedAt:
                response.acknowledgedAt,
            });

            pushed += 1;
            continue;
          }

          const localRecord =
            await store.getDueAction(
              advisor,
              mutation.prospectReference,
            );

          if (localRecord === null) {
            throw new DueActionSyncServiceError(
              "LOCAL_CONFLICT_RECORD_MISSING",
              "No existe la copia local en conflicto.",
            );
          }

          await journal.recordConflict({
            advisorPartitionKey:
              advisor,
            mutationId:
              mutation.mutationId,
            localRecord,
            remoteRecord:
              response.remoteRecord,
            reasonCode:
              response.reasonCode,
            detectedAt:
              response.detectedAt,
          });

          conflicts += 1;
        }

        const remaining =
          await store.listPendingMutations(
            advisor,
          );

        if (remaining.length > 0) {
          const openConflicts =
            await journal.listOpenConflicts(
              advisor,
            );

          return deepFreeze({
            status:
              conflicts > 0
                ? "CONFLICT_REVIEW_REQUIRED"
                : "RETRY_REQUIRED",
            advisorPartitionKey:
              advisor,
            trigger:
              normalizedTrigger,
            gatewayInvoked: true,
            syncStartedAt,
            pushed,
            conflicts:
              openConflicts.length,
            failed,
            pulled: 0,
            cursor: null,
            pullSkippedReason:
              "OUTBOX_NOT_EMPTY",
            remainingMutations:
              remaining.length,
          });
        }

        const initialCursorMetadata =
          await store.getSyncCursor(
            advisor,
          );

        let cursor =
          initialCursorMetadata?.cursor ??
          null;
        let pulled = 0;
        let pages = 0;

        while (pages < maxPullPages) {
          const rawPull =
            await gateway.pullChanges({
              advisorPartitionKey:
                advisor,
              cursor,
            });

          const page =
            normalizePullResponse(
              rawPull,
            );

          for (const record of page.records) {
            if (
              record.advisorPartitionKey !==
              advisor
            ) {
              throw new DueActionSyncServiceError(
                "CROSS_ADVISOR_PULL_DENIED",
                "El cambio remoto pertenece a otro asesor.",
              );
            }
          }

          if (
            page.hasMore &&
            (
              page.nextCursor === null ||
              page.nextCursor === cursor
            )
          ) {
            throw new DueActionSyncServiceError(
              "NON_ADVANCING_CURSOR",
              "El cursor remoto no avanzó.",
            );
          }

          await store.reconcileRemoteChanges({
            advisorPartitionKey:
              advisor,
            records:
              page.records,
            cursor:
              page.nextCursor,
            reconciledAt:
              requireIso(
                clock(),
                "RECONCILIATION_TIME_INVALID",
                "La fecha de reconciliación",
              ),
          });

          pulled += page.records.length;
          pages += 1;
          cursor = page.nextCursor;

          if (!page.hasMore) {
            break;
          }
        }

        if (pages >= maxPullPages) {
          throw new DueActionSyncServiceError(
            "MAX_PULL_PAGES_EXCEEDED",
            "La sincronización excedió el límite de páginas.",
          );
        }

        return deepFreeze({
          status: "SYNCED",
          advisorPartitionKey:
            advisor,
          trigger:
            normalizedTrigger,
          gatewayInvoked: true,
          syncStartedAt,
          pushed,
          conflicts: 0,
          failed,
          pulled,
          pages,
          cursor,
          remainingMutations: 0,
        });
      }

      function syncAdvisor(options) {
        const advisor =
          requireOpaque(
            options?.advisorPartitionKey,
            "ADVISOR_PARTITION_INVALID",
            "La partición del asesor",
          );

        if (inFlightByAdvisor.has(advisor)) {
          return inFlightByAdvisor.get(advisor);
        }

        const operation =
          performSync({
            ...options,
            advisorPartitionKey:
              advisor,
          }).finally(() => {
            inFlightByAdvisor.delete(advisor);
          });

        inFlightByAdvisor.set(
          advisor,
          operation,
        );

        return operation;
      }

      return deepFreeze({
        serviceVersion:
          SYNC_SERVICE_VERSION,
        contractVersion:
          contract.CONTRACT_VERSION,
        syncAdvisor,
        diagnostics: () =>
          deepFreeze({
            incrementalSync: true,
            fullCacheDeleteAllowed:
              false,
            durableRetry:
              true,
            idempotentMutationDelivery:
              true,
            cursorAdvanceAfterLocalCommit:
              true,
            conflictReviewRequired:
              true,
            silentLastWriteWinsAllowed:
              false,
            concurrentAdvisorSyncCoalesced:
              true,
            directNetworkAccessAllowed:
              false,
            injectedGatewayRequired:
              true,
            providerInvocationAllowed:
              false,
            messageGenerationAllowed:
              false,
            messageSendAllowed: false,
          }),
        _private: {
          normalizePushResponse,
          normalizePullResponse,
          clone,
          deepFreeze,
        },
      });
    }

    return deepFreeze({
      SYNC_SERVICE_VERSION,
      DueActionSyncServiceError,
      create,
    });
  },
);
