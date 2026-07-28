"use strict";

(function activityLedgerSupabaseGatewayModule(root, factory) {
  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-contract")
      : root.ForgeActivityLedgerContractFES02A;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeActivityLedgerSupabaseGatewayFES02C = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function activityLedgerSupabaseGatewayFactory(contract) {
    if (!contract) {
      throw new Error("FES02A_ACTIVITY_LEDGER_CONTRACT_REQUIRED");
    }

    const GATEWAY_VERSION = "FES-02C.1";
    const DEFAULT_PUSH_RPC = "forge_fes02_append_activity_event";
    const DEFAULT_PULL_RPC = "forge_fes02_pull_activity_events";

    class ActivityLedgerSupabaseGatewayError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ActivityLedgerSupabaseGatewayError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ActivityLedgerSupabaseGatewayError(code, message, details);
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

    function requireLimit(value, fallback) {
      const selected = value === undefined || value === null ? fallback : value;
      if (!Number.isSafeInteger(selected) || selected < 1 || selected > 500) {
        error(
          "LEDGER_GATEWAY_PULL_LIMIT_INVALID",
          "El límite incremental no es válido.",
        );
      }
      return selected;
    }

    function normalizeRpcData(data) {
      return Array.isArray(data) && data.length === 1 ? data[0] : data;
    }

    function mapRpcError(remoteError, operation) {
      const remoteCode = String(remoteError?.code || "").trim();
      const remoteMessage = String(remoteError?.message || "").trim();
      const combined = `${remoteCode} ${remoteMessage}`;

      if (
        ["PGRST301", "42501", "AUTH_REQUIRED"].includes(remoteCode) ||
        combined.includes("FES02_AUTH_REQUIRED") ||
        combined.includes("JWT")
      ) {
        return new ActivityLedgerSupabaseGatewayError(
          "AUTH_REQUIRED",
          "Tu sesión expiró. Inicia sesión nuevamente.",
          { operation, remote_code: remoteCode || null },
        );
      }

      const fesCode =
        remoteCode.startsWith("FES02_")
          ? remoteCode
          : (combined.match(/FES02_[A-Z0-9_]+/) || [])[0];

      if (fesCode) {
        return new ActivityLedgerSupabaseGatewayError(
          fesCode,
          "La autoridad remota rechazó el evento.",
          { operation, remote_code: remoteCode || null },
        );
      }

      return new ActivityLedgerSupabaseGatewayError(
        "NETWORK_ERROR",
        "No pudimos sincronizar el evento. Se conservará para reintento.",
        { operation, remote_code: remoteCode || null },
      );
    }

    function normalizePushResult(rawData, mutation, tenantId) {
      const data = normalizeRpcData(rawData);
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        error(
          "LEDGER_GATEWAY_PUSH_RESPONSE_INVALID",
          "La confirmación remota no es válida.",
        );
      }

      if (["ACKNOWLEDGED", "IDEMPOTENT_REPLAY"].includes(data.status)) {
        const receipt = contract.assertReceipt(data.receipt);
        if (
          receipt.status !== data.status ||
          receipt.tenant_id !== tenantId ||
          receipt.event_id !== mutation.event_id ||
          receipt.mutation_id !== mutation.mutation_id
        ) {
          error(
            "LEDGER_GATEWAY_RECEIPT_MISMATCH",
            "El recibo remoto no coincide con la mutación.",
          );
        }
        return deepFreeze({ status: data.status, receipt });
      }

      if (data.status === "CONFLICT") {
        const remoteRecord =
          data.remote_record === null || data.remote_record === undefined
            ? null
            : contract.assertLedgerRecord(data.remote_record);
        if (
          remoteRecord &&
          (remoteRecord.tenant_id !== tenantId ||
            remoteRecord.event_id !== mutation.event_id)
        ) {
          error(
            "LEDGER_GATEWAY_CONFLICT_TENANT_MISMATCH",
            "El conflicto remoto pertenece a otro tenant.",
          );
        }
        const detectedAt = new Date(data.detected_at || Date.now()).toISOString();
        return deepFreeze({
          status: "CONFLICT",
          reason_code: requireOpaque(
            data.reason_code,
            "LEDGER_GATEWAY_CONFLICT_REASON_INVALID",
            "La razón de conflicto",
            120,
          ),
          remote_record: remoteRecord,
          detected_at: detectedAt,
        });
      }

      error(
        "LEDGER_GATEWAY_PUSH_STATUS_INVALID",
        "El estado push remoto no es válido.",
      );
    }

    function normalizePullResult(rawData, tenantId) {
      const data = normalizeRpcData(rawData);
      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        !Array.isArray(data.changes)
      ) {
        error(
          "LEDGER_GATEWAY_PULL_RESPONSE_INVALID",
          "La página remota no es válida.",
        );
      }

      const changes = data.changes.map(change => {
        if (!change || typeof change !== "object" || Array.isArray(change)) {
          error(
            "LEDGER_GATEWAY_PULL_CHANGE_INVALID",
            "Un cambio remoto no es válido.",
          );
        }
        const ledgerRecord = contract.assertLedgerRecord(change.ledger_record);
        const receipt = contract.assertReceipt(change.receipt);
        if (
          ledgerRecord.tenant_id !== tenantId ||
          receipt.tenant_id !== tenantId ||
          ledgerRecord.event_id !== receipt.event_id
        ) {
          error(
            "LEDGER_GATEWAY_PULL_TENANT_MISMATCH",
            "La página contiene datos de otro tenant.",
          );
        }
        return deepFreeze({
          ledger_record: ledgerRecord,
          receipt,
        });
      });

      return deepFreeze({
        changes,
        cursor:
          data.cursor === null || data.cursor === undefined || data.cursor === ""
            ? null
            : requireOpaque(
                data.cursor,
                "LEDGER_GATEWAY_CURSOR_INVALID",
                "El cursor remoto",
              ),
        has_more: data.has_more === true,
      });
    }

    function create(
      client,
      {
        pushRpc = DEFAULT_PUSH_RPC,
        pullRpc = DEFAULT_PULL_RPC,
        pullLimit = 200,
      } = {},
    ) {
      if (
        !client ||
        typeof client.rpc !== "function" ||
        !client.auth ||
        typeof client.auth.getUser !== "function"
      ) {
        error(
          "SUPABASE_CLIENT_INVALID",
          "Un cliente Supabase autenticado es obligatorio.",
        );
      }

      const selectedPushRpc = requireOpaque(
        pushRpc,
        "LEDGER_GATEWAY_PUSH_RPC_INVALID",
        "El RPC push",
      );
      const selectedPullRpc = requireOpaque(
        pullRpc,
        "LEDGER_GATEWAY_PULL_RPC_INVALID",
        "El RPC pull",
      );
      const selectedPullLimit = requireLimit(pullLimit, 200);

      async function authenticatedTenant(expectedTenantId) {
        const expected = requireOpaque(
          expectedTenantId,
          "TENANT_ID_INVALID",
          "El tenant",
        );
        const response = await client.auth.getUser();
        if (response?.error || !response?.data?.user?.id) {
          throw mapRpcError(
            response?.error || { code: "AUTH_REQUIRED" },
            "AUTH_GET_USER",
          );
        }
        const authenticated = String(response.data.user.id);
        if (authenticated !== expected) {
          error(
            "LEDGER_GATEWAY_TENANT_SESSION_MISMATCH",
            "La sesión no corresponde al tenant solicitado.",
          );
        }
        return authenticated;
      }

      async function pushMutation(input) {
        const mutation = contract.assertAppendMutation(clone(input));
        const tenantId = await authenticatedTenant(mutation.tenant_id);
        const response = await client.rpc(selectedPushRpc, {
          p_mutation: clone(mutation),
        });
        if (response?.error) {
          throw mapRpcError(response.error, "PUSH_MUTATION");
        }
        return normalizePushResult(
          response?.data,
          mutation,
          tenantId,
        );
      }

      async function pullChanges({ tenant_id, cursor = null, limit } = {}) {
        const tenantId = await authenticatedTenant(tenant_id);
        const selectedLimit = requireLimit(limit, selectedPullLimit);
        const selectedCursor =
          cursor === null || cursor === undefined || cursor === ""
            ? null
            : requireOpaque(
                cursor,
                "LEDGER_GATEWAY_CURSOR_INVALID",
                "El cursor remoto",
              );
        const response = await client.rpc(selectedPullRpc, {
          p_cursor: selectedCursor,
          p_limit: selectedLimit,
        });
        if (response?.error) {
          throw mapRpcError(response.error, "PULL_CHANGES");
        }
        return normalizePullResult(response?.data, tenantId);
      }

      function diagnostics() {
        return deepFreeze({
          gateway_version: GATEWAY_VERSION,
          contract_version: contract.CONTRACT_VERSION,
          authenticated_user_required: true,
          tenant_derived_from_session: true,
          rpc_only: true,
          direct_table_access: false,
          push_rpc: selectedPushRpc,
          pull_rpc: selectedPullRpc,
          pull_limit: selectedPullLimit,
          background_sync: false,
          productive_ui_binding: false,
          raw_private_payload_allowed: false,
          provider_mutation_allowed: false,
          automatic_business_action_allowed: false,
        });
      }

      return deepFreeze({
        gateway_version: GATEWAY_VERSION,
        pushMutation,
        pullChanges,
        diagnostics,
      });
    }

    return deepFreeze({
      GATEWAY_VERSION,
      DEFAULT_PUSH_RPC,
      DEFAULT_PULL_RPC,
      ActivityLedgerSupabaseGatewayError,
      create,
      _private: deepFreeze({
        clone,
        deepFreeze,
        normalizeRpcData,
        normalizePushResult,
        normalizePullResult,
        mapRpcError,
      }),
    });
  },
);
