"use strict";

(function activityLedgerBrowserRuntimeModule(root, factory) {
  const canonical =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-event-contract")
      : root.ForgeCanonicalActivityEventContractFES01;
  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-contract")
      : root.ForgeActivityLedgerContractFES02A;
  const localStore =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-local-store")
      : root.ForgeActivityLedgerLocalStoreFES02A;
  const syncService =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-sync-service")
      : root.ForgeActivityLedgerSyncServiceFES02A;
  const supabaseGateway =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-supabase-gateway")
      : root.ForgeActivityLedgerSupabaseGatewayFES02C;

  const api = factory(
    canonical,
    contract,
    localStore,
    syncService,
    supabaseGateway,
    root,
  );

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeActivityLedgerBrowserRuntimeFES02C = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function activityLedgerBrowserRuntimeFactory(
    canonical,
    contract,
    localStore,
    syncService,
    supabaseGateway,
    root,
  ) {
    if (!canonical || !contract || !localStore || !syncService || !supabaseGateway) {
      throw new Error("FES02C_ACTIVITY_LEDGER_DEPENDENCIES_REQUIRED");
    }

    const RUNTIME_VERSION = "FES-02C.1";

    class ActivityLedgerBrowserRuntimeError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ActivityLedgerBrowserRuntimeError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ActivityLedgerBrowserRuntimeError(code, message, details);
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

    function create({
      client,
      tenant_id,
      device_id,
      store = null,
      gateway = null,
      indexedDBFactory = null,
      databaseName,
      clock = () => new Date().toISOString(),
      pullLimit = 200,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "TENANT_ID_INVALID",
        "El tenant",
      );
      const deviceId = requireOpaque(
        device_id,
        "DEVICE_ID_INVALID",
        "El dispositivo",
      );

      const selectedStore =
        store ||
        localStore.create({
          indexedDBFactory,
          databaseName,
          clock,
        });
      const selectedGateway = gateway || supabaseGateway.create(client, {
        pullLimit,
      });
      const selectedSync = syncService.create({
        store: selectedStore,
        gateway: selectedGateway,
        clock,
        pullLimit,
      });

      let closed = false;

      function ensureOpen() {
        if (closed) {
          error(
            "ACTIVITY_LEDGER_BROWSER_RUNTIME_CLOSED",
            "El runtime del ledger está cerrado.",
          );
        }
      }

      async function appendCanonicalEvent({
        canonical_event,
        evidence_references = [],
        appended_at,
      } = {}) {
        ensureOpen();
        const event = canonical.assertCanonicalActivityEvent(canonical_event);
        if (event.tenant_id !== tenantId) {
          error(
            "ACTIVITY_LEDGER_BROWSER_TENANT_MISMATCH",
            "El evento pertenece a otro tenant.",
          );
        }
        const record = contract.createLedgerRecord({
          canonical_event: event,
          evidence_references,
          appended_at: appended_at || clock(),
        });
        const cursor = await selectedStore.getCursor(tenantId);
        const mutation = contract.createAppendMutation({
          ledger_record: record,
          device_id: deviceId,
          base_cursor: cursor,
          created_at: appended_at || clock(),
        });
        return selectedStore.appendLocal(record, mutation);
      }

      async function syncOnce() {
        ensureOpen();
        return selectedSync.syncOnce(tenantId);
      }

      async function listEntries() {
        ensureOpen();
        return selectedStore.listEntries(tenantId);
      }

      async function listPendingOutbox() {
        ensureOpen();
        return selectedStore.listPendingOutbox(tenantId);
      }

      async function listConflicts(status = "OPEN") {
        ensureOpen();
        return selectedStore.listConflicts(tenantId, status);
      }

      async function getReceipt(eventId) {
        ensureOpen();
        return selectedStore.getReceipt(eventId);
      }

      async function getCursor() {
        ensureOpen();
        return selectedStore.getCursor(tenantId);
      }

      function diagnostics() {
        return deepFreeze({
          runtime_version: RUNTIME_VERSION,
          tenant_id: tenantId,
          device_id: deviceId,
          store_version: selectedStore.store_version,
          store_driver: selectedStore.driver_type,
          gateway_version: selectedGateway.gateway_version,
          sync_service_version: selectedSync.service_version,
          local_first: true,
          atomic_event_and_outbox: true,
          push_before_pull: true,
          authenticated_rpc_only: true,
          background_sync: false,
          productive_ui_binding: false,
          provider_mutation: false,
          automatic_business_action: false,
          human_review_for_conflicts: true,
        });
      }

      async function close() {
        if (closed) return;
        closed = true;
        await selectedSync.close();
        await selectedStore.close();
      }

      return deepFreeze({
        runtime_version: RUNTIME_VERSION,
        tenant_id: tenantId,
        appendCanonicalEvent,
        syncOnce,
        listEntries,
        listPendingOutbox,
        listConflicts,
        getReceipt,
        getCursor,
        diagnostics,
        close,
      });
    }

    async function createFromForgeAlive(options = {}) {
      const bootstrap =
        options.bootstrap || root?.ForgeProductiveProspectBootstrap067G17B;
      if (!bootstrap || typeof bootstrap.getClient !== "function") {
        error(
          "FORGE_ALIVE_AUTH_BOOTSTRAP_REQUIRED",
          "La frontera autenticada de Forge Alive no está disponible.",
        );
      }
      const client = await bootstrap.getClient();
      const response = await client.auth.getUser();
      if (response?.error || !response?.data?.user?.id) {
        error(
          "FORGE_ALIVE_AUTHENTICATED_USER_REQUIRED",
          "Forge Alive requiere una sesión autenticada.",
        );
      }
      return create({
        ...options,
        bootstrap: undefined,
        client,
        tenant_id: String(response.data.user.id),
      });
    }

    return deepFreeze({
      RUNTIME_VERSION,
      ActivityLedgerBrowserRuntimeError,
      create,
      createFromForgeAlive,
    });
  },
);
