"use strict";

(function dueActionSupabaseGatewayModule(root, factory) {
  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./due-action-offline-contract")
      : root.ForgeDueActionOfflineContractNFAST09;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeDueActionSupabaseGatewayNFAST09 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function dueActionSupabaseGatewayFactory(contract) {
    if (!contract) {
      throw new Error("NFAST_09_OFFLINE_CONTRACT_REQUIRED");
    }

    const GATEWAY_VERSION = "NFAST-09.3C";
    const DEFAULT_PUSH_RPC = "forge_nfast09_push_due_action_mutation";
    const DEFAULT_PULL_RPC = "forge_nfast09_pull_due_action_changes";

    class DueActionSupabaseGatewayError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "DueActionSupabaseGatewayError";
        this.code = code;
        this.details = details;
      }
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

    function requireOpaque(value, code, label) {
      const normalized = String(value || "").trim();
      if (!contract._private.isOpaqueToken(normalized)) {
        throw new DueActionSupabaseGatewayError(
          code,
          `${label} no es válido.`,
        );
      }
      return normalized;
    }

    function normalizeRpcData(data) {
      return Array.isArray(data) && data.length === 1 ? data[0] : data;
    }

    function mapRpcError(error, operation) {
      if (!error) return null;
      const code = String(error.code || "").trim();
      if (["PGRST301", "42501", "AUTH_REQUIRED"].includes(code)) {
        return new DueActionSupabaseGatewayError(
          "AUTH_REQUIRED",
          "Tu sesión expiró. Inicia sesión nuevamente.",
          { operation },
        );
      }
      if (code.startsWith("NFAST09_")) {
        return new DueActionSupabaseGatewayError(
          code,
          "La autoridad remota rechazó la operación.",
          { operation },
        );
      }
      return new DueActionSupabaseGatewayError(
        "NETWORK_ERROR",
        "No pudimos sincronizar la acción. Se conservará para reintento.",
        { operation, remoteCode: code || null },
      );
    }

    function normalizePushResult(rawData, expectedMutationId, advisor) {
      const data = normalizeRpcData(rawData);
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new DueActionSupabaseGatewayError(
          "PUSH_RESPONSE_INVALID",
          "La confirmación remota es inválida.",
        );
      }
      if (data.mutationId !== expectedMutationId) {
        throw new DueActionSupabaseGatewayError(
          "PUSH_MUTATION_ID_MISMATCH",
          "La confirmación corresponde a otra mutación.",
        );
      }
      if (data.status === "ACKNOWLEDGED") {
        const serverRecord = contract.normalizeDueActionRecord(data.serverRecord);
        if (serverRecord.advisorPartitionKey !== advisor) {
          throw new DueActionSupabaseGatewayError(
            "CROSS_ADVISOR_ACK_DENIED",
            "La confirmación pertenece a otro asesor.",
          );
        }
        return deepFreeze({
          status: "ACKNOWLEDGED",
          mutationId: expectedMutationId,
          acknowledgedAt: new Date(data.acknowledgedAt).toISOString(),
          serverRevision: requireOpaque(
            data.serverRevision,
            "SERVER_REVISION_INVALID",
            "La revisión remota",
          ),
          serverRecord,
        });
      }
      if (data.status === "CONFLICT") {
        const remoteRecord = contract.normalizeDueActionRecord(data.remoteRecord);
        if (remoteRecord.advisorPartitionKey !== advisor) {
          throw new DueActionSupabaseGatewayError(
            "CROSS_ADVISOR_CONFLICT_DENIED",
            "El conflicto pertenece a otro asesor.",
          );
        }
        return deepFreeze({
          status: "CONFLICT",
          mutationId: expectedMutationId,
          detectedAt: new Date(data.detectedAt).toISOString(),
          reasonCode: requireOpaque(
            data.reasonCode,
            "CONFLICT_REASON_INVALID",
            "La razón del conflicto",
          ),
          remoteRecord,
        });
      }
      throw new DueActionSupabaseGatewayError(
        "PUSH_STATUS_INVALID",
        "El estado remoto es inválido.",
      );
    }

    function normalizePullResult(rawData, advisor) {
      const data = normalizeRpcData(rawData);
      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        !Array.isArray(data.records)
      ) {
        throw new DueActionSupabaseGatewayError(
          "PULL_RESPONSE_INVALID",
          "La página incremental es inválida.",
        );
      }
      const records = data.records.map(record => {
        const normalized = contract.normalizeDueActionRecord(record);
        if (normalized.advisorPartitionKey !== advisor) {
          throw new DueActionSupabaseGatewayError(
            "CROSS_ADVISOR_PULL_DENIED",
            "La página contiene registros de otro asesor.",
          );
        }
        return normalized;
      });
      const nextCursor =
        data.nextCursor === null || data.nextCursor === undefined
          ? null
          : requireOpaque(data.nextCursor, "SYNC_CURSOR_INVALID", "El cursor");
      return deepFreeze({ records, nextCursor, hasMore: data.hasMore === true });
    }

    function create(
      client,
      {
        pushRpc = DEFAULT_PUSH_RPC,
        pullRpc = DEFAULT_PULL_RPC,
        pullLimit = 100,
      } = {},
    ) {
      if (
        !client ||
        typeof client.rpc !== "function" ||
        !client.auth ||
        typeof client.auth.getUser !== "function"
      ) {
        throw new DueActionSupabaseGatewayError(
          "SUPABASE_CLIENT_INVALID",
          "Supabase autenticado es obligatorio.",
        );
      }

      const normalizedPushRpc = requireOpaque(
        pushRpc,
        "PUSH_RPC_INVALID",
        "El RPC de envío",
      );
      const normalizedPullRpc = requireOpaque(
        pullRpc,
        "PULL_RPC_INVALID",
        "El RPC incremental",
      );
      if (!Number.isInteger(pullLimit) || pullLimit < 1 || pullLimit > 500) {
        throw new DueActionSupabaseGatewayError(
          "PULL_LIMIT_INVALID",
          "El límite incremental es inválido.",
        );
      }

      async function authenticatedAdvisor(advisorPartitionKey) {
        const advisor = requireOpaque(
          advisorPartitionKey,
          "ADVISOR_PARTITION_INVALID",
          "La partición del asesor",
        );
        const { data, error } = await client.auth.getUser();
        if (error || !data?.user?.id) {
          throw mapRpcError(error || { code: "AUTH_REQUIRED" }, "AUTH_GET_USER");
        }
        if (String(data.user.id) !== advisor) {
          throw new DueActionSupabaseGatewayError(
            "ADVISOR_PARTITION_MISMATCH",
            "La sesión no corresponde a la partición solicitada.",
          );
        }
        return advisor;
      }

      async function pushMutation({ advisorPartitionKey, mutation }) {
        const advisor = await authenticatedAdvisor(advisorPartitionKey);
        const normalizedMutation = contract.normalizeOutboxMutation(mutation);
        if (normalizedMutation.advisorPartitionKey !== advisor) {
          throw new DueActionSupabaseGatewayError(
            "CROSS_ADVISOR_MUTATION_DENIED",
            "La mutación pertenece a otro asesor.",
          );
        }
        const { data, error } = await client.rpc(normalizedPushRpc, {
          p_mutation: clone(normalizedMutation),
        });
        if (error) throw mapRpcError(error, "PUSH_MUTATION");
        return normalizePushResult(
          data,
          normalizedMutation.mutationId,
          advisor,
        );
      }

      async function pullChanges({ advisorPartitionKey, cursor }) {
        const advisor = await authenticatedAdvisor(advisorPartitionKey);
        const normalizedCursor =
          cursor === null || cursor === undefined
            ? null
            : requireOpaque(cursor, "SYNC_CURSOR_INVALID", "El cursor");
        const { data, error } = await client.rpc(normalizedPullRpc, {
          p_cursor: normalizedCursor,
          p_limit: pullLimit,
        });
        if (error) throw mapRpcError(error, "PULL_CHANGES");
        return normalizePullResult(data, advisor);
      }

      return deepFreeze({
        gatewayVersion: GATEWAY_VERSION,
        contractVersion: contract.CONTRACT_VERSION,
        pushMutation,
        pullChanges,
        diagnostics: () =>
          deepFreeze({
            productiveSupabaseGateway: true,
            authenticatedUserRequired: true,
            advisorDerivedFromSession: true,
            directTableAccess: false,
            rpcOnly: true,
            pushRpc: normalizedPushRpc,
            pullRpc: normalizedPullRpc,
            pullLimit,
            rawNotesAllowed: false,
            contactDataAllowed: false,
            providerInvocationAllowed: false,
            messageGenerationAllowed: false,
            messageSendAllowed: false,
          }),
        _private: {
          normalizePushResult,
          normalizePullResult,
          mapRpcError,
          normalizeRpcData,
          clone,
          deepFreeze,
        },
      });
    }

    return deepFreeze({
      GATEWAY_VERSION,
      DEFAULT_PUSH_RPC,
      DEFAULT_PULL_RPC,
      DueActionSupabaseGatewayError,
      create,
    });
  },
);
