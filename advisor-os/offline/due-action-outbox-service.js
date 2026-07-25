"use strict";

(function dueActionOutboxServiceModule(root, factory) {
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
    root.ForgeDueActionOutboxServiceNFAST09 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function dueActionOutboxServiceFactory(contract) {
    if (!contract) {
      throw new Error(
        "NFAST_09_OFFLINE_CONTRACT_REQUIRED",
      );
    }

    const OUTBOX_SERVICE_VERSION =
      "NFAST-09.3A";

    class DueActionOutboxServiceError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name =
          "DueActionOutboxServiceError";
        this.code = code;
        this.details = details;
      }
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

    function create({
      store,
      deviceId,
      clock = () =>
        new Date().toISOString(),
    } = {}) {
      if (
        !store ||
        typeof store.getDueAction !==
          "function" ||
        typeof store.commitLocalMutation !==
          "function"
      ) {
        throw new DueActionOutboxServiceError(
          "OFFLINE_STORE_REQUIRED",
          "La tienda offline es obligatoria.",
        );
      }

      const normalizedDeviceId =
        contract._private
          .isOpaqueToken(
            String(deviceId || "").trim(),
          )
          ? String(deviceId).trim()
          : null;

      if (!normalizedDeviceId) {
        throw new DueActionOutboxServiceError(
          "DEVICE_ID_INVALID",
          "El dispositivo es obligatorio.",
        );
      }

      function nowIso(explicitAt) {
        const value =
          explicitAt || clock();

        if (
          !contract._private
            .isIsoDate(value)
        ) {
          throw new DueActionOutboxServiceError(
            "OPERATION_TIME_INVALID",
            "La fecha de operación no es válida.",
          );
        }

        return new Date(value).toISOString();
      }

      async function commitOperation({
        advisorPartitionKey,
        prospectReference,
        operation,
        authorizedPatch = {},
        operationAt,
        dueActionVersion,
      }) {
        const createdAt =
          nowIso(operationAt);

        const existing =
          await store.getDueAction(
            advisorPartitionKey,
            prospectReference,
          );

        const resolvedVersion =
          dueActionVersion ??
          (
            operation === "RESCHEDULE"
              ? (
                  existing
                    ?.dueActionVersion || 0
                ) + 1
              : (
                  existing
                    ?.dueActionVersion || 1
                )
          );

        const mutationSeed = {
          deviceId:
            normalizedDeviceId,
          advisorPartitionKey,
          prospectReference,
          dueActionVersion:
            resolvedVersion,
          operation,
          createdAt,
          authorizedPatch,
        };

        const mutationId =
          contract.createMutationId(
            mutationSeed,
          );

        const mutation =
          contract
            .normalizeOutboxMutation({
              mutationId,
              deviceId:
                normalizedDeviceId,
              advisorPartitionKey,
              prospectReference,
              dueActionVersion:
                resolvedVersion,
              operation,
              authorizedPatch,
              baseServerRevision:
                existing
                  ?.serverRevision ??
                null,
              createdAt,
              attemptCount: 0,
              syncState:
                "LOCAL_PENDING",
            });

        const nextRecord =
          contract.applyLocalMutation(
            existing,
            mutation,
          );

        return store.commitLocalMutation(
          nextRecord,
          mutation,
        );
      }

      async function scheduleDueAction({
        advisorPartitionKey,
        prospectReference,
        approvedDisplayName,
        nextActionType,
        nextActionAt,
        operationAt,
      }) {
        return commitOperation({
          advisorPartitionKey,
          prospectReference,
          operation: "SCHEDULE",
          operationAt,
          dueActionVersion: 1,
          authorizedPatch: {
            approvedDisplayName,
            nextActionType,
            nextActionAt,
          },
        });
      }

      async function rescheduleDueAction({
        advisorPartitionKey,
        prospectReference,
        nextActionType,
        nextActionAt,
        operationAt,
      }) {
        return commitOperation({
          advisorPartitionKey,
          prospectReference,
          operation: "RESCHEDULE",
          operationAt,
          authorizedPatch: {
            nextActionType,
            nextActionAt,
          },
        });
      }

      async function completeDueAction({
        advisorPartitionKey,
        prospectReference,
        operationAt,
      }) {
        return commitOperation({
          advisorPartitionKey,
          prospectReference,
          operation: "COMPLETE",
          operationAt,
        });
      }

      async function cancelDueAction({
        advisorPartitionKey,
        prospectReference,
        operationAt,
      }) {
        return commitOperation({
          advisorPartitionKey,
          prospectReference,
          operation: "CANCEL",
          operationAt,
        });
      }

      async function markSeen({
        advisorPartitionKey,
        prospectReference,
        operationAt,
      }) {
        return commitOperation({
          advisorPartitionKey,
          prospectReference,
          operation: "MARK_SEEN",
          operationAt,
        });
      }

      async function acknowledge({
        advisorPartitionKey,
        prospectReference,
        operationAt,
      }) {
        return commitOperation({
          advisorPartitionKey,
          prospectReference,
          operation: "ACKNOWLEDGE",
          operationAt,
        });
      }

      async function snooze({
        advisorPartitionKey,
        prospectReference,
        snoozedUntil,
        operationAt,
      }) {
        return commitOperation({
          advisorPartitionKey,
          prospectReference,
          operation: "SNOOZE",
          operationAt,
          authorizedPatch: {
            snoozedUntil,
          },
        });
      }

      return deepFreeze({
        serviceVersion:
          OUTBOX_SERVICE_VERSION,
        contractVersion:
          contract.CONTRACT_VERSION,
        deviceId:
          normalizedDeviceId,
        scheduleDueAction,
        rescheduleDueAction,
        completeDueAction,
        cancelDueAction,
        markSeen,
        acknowledge,
        snooze,
        diagnostics: () =>
          deepFreeze({
            localFirst: true,
            durableOutboxRequired: true,
            networkAccessAllowed: false,
            remoteAckRemovalOwnedByStore:
              true,
            readCompletesAction: false,
            acknowledgementSeparateFromLifecycle:
              true,
            rescheduleCreatesNewVersion:
              true,
            providerInvocationAllowed:
              false,
            messageGenerationAllowed:
              false,
            messageSendAllowed: false,
          }),
      });
    }

    return deepFreeze({
      OUTBOX_SERVICE_VERSION,
      DueActionOutboxServiceError,
      create,
    });
  },
);
