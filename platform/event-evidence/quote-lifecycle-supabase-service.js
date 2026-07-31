"use strict";

(function quoteLifecycleSupabaseServiceModule(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeQuoteLifecycleSupabaseServiceCartera001B = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function quoteLifecycleSupabaseServiceFactory() {
    const SERVICE_VERSION = "CARTERA-001B.1";
    const CONFIRM_RPC = "forge_cartera001b_confirm_reviewed_quote";
    const APPEND_RPC = "forge_cartera001b_append_quote_lifecycle_event";
    const HISTORY_VIEW = "quote_lifecycle_history";

    class QuoteLifecycleServiceError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "QuoteLifecycleServiceError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new QuoteLifecycleServiceError(code, message, details);
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) return false;
      const prototype = Object.getPrototypeOf(value);
      return prototype === Object.prototype || prototype === null;
    }

    function deepFreeze(value) {
      if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function requireOpaque(value, code, label, maximum = 240) {
      const normalized = String(value || "").trim();
      if (
        !normalized ||
        normalized.length > maximum ||
        !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(normalized)
      ) {
        error(code, `${label} no es válido.`);
      }
      return normalized;
    }

    function requireIso(value, code, label) {
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        error(code, `${label} no es válido.`);
      }
      return new Date(value).toISOString();
    }

    function normalizeEvidenceReferences(value) {
      if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
        error("EVIDENCE_REFERENCES_REQUIRED", "Se requiere evidencia de Quote.");
      }
      const normalized = value.map(reference =>
        requireOpaque(reference, "EVIDENCE_REFERENCE_INVALID", "La evidencia"),
      );
      if (new Set(normalized).size !== normalized.length) {
        error("EVIDENCE_REFERENCES_DUPLICATED", "La evidencia no puede repetirse.");
      }
      return normalized;
    }

    function mapRemoteError(remoteError) {
      if (remoteError instanceof QuoteLifecycleServiceError) throw remoteError;
      const message = String(remoteError?.message || remoteError || "");
      const mappings = [
        ["CARTERA001B_AUTH_REQUIRED", "AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente."],
        ["CARTERA001B_PROSPECT_NOT_OWNED", "PROSPECT_NOT_FOUND", "No encontramos un Prospect propio con esa identidad."],
        ["CARTERA001B_IDENTITY_REQUIRED", "IDENTITY_REQUIRED", "Selecciona un Prospect antes de guardar la cotización."],
        ["CARTERA001B_REVIEW_SNAPSHOT_INVALID", "REVIEW_SNAPSHOT_INVALID", "El snapshot revisado no cumple el contrato."],
        ["CARTERA001B_FORBIDDEN_REVIEW_KEY", "FORBIDDEN_REVIEW_KEY", "El snapshot contiene material binario o no autorizado."],
        ["CARTERA001B_APPLICATION_AUTHORITY_REQUIRED", "APPLICATION_AUTHORITY_REQUIRED", "La conversión a solicitud requiere su autoridad."],
        ["CARTERA001B_EVENT_CONFLICT", "EVENT_CONFLICT", "El evento ya existe con contenido distinto y requiere revisión."],
        ["CARTERA001B_EVENT_TYPE_INVALID", "EVENT_TYPE_INVALID", "El evento de Quote no cumple el contrato."],
      ];
      for (const [needle, code, safeMessage] of mappings) {
        if (message.includes(needle)) error(code, safeMessage, { remote_message: message });
      }
      error("NETWORK_ERROR", "No pudimos guardar la continuidad de la cotización.", {
        remote_message: message,
      });
    }

    async function authenticatedUser(client) {
      const response = await client.auth.getUser();
      if (response?.error || !response?.data?.user?.id) {
        error("AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
      }
      return response.data.user;
    }

    function create(client) {
      if (!client?.auth?.getUser || !client?.rpc || !client?.from) {
        error("CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
      }

      async function confirmReviewedQuote(input = {}) {
        await authenticatedUser(client);
        if (!isPlainObject(input.reviewSnapshot)) {
          error("REVIEW_SNAPSHOT_REQUIRED", "La confirmación requiere el snapshot revisado.");
        }
        const prospectReference = requireOpaque(
          input.prospectReference,
          "PROSPECT_REFERENCE_REQUIRED",
          "La referencia de Prospect",
        );
        const productReference = requireOpaque(
          input.productReference,
          "PRODUCT_REFERENCE_REQUIRED",
          "La referencia de producto",
        );
        const sourceRecordReference = requireOpaque(
          input.sourceRecordReference,
          "SOURCE_RECORD_REFERENCE_REQUIRED",
          "La referencia del documento fuente",
        );
        const idempotencyKey = requireOpaque(
          input.idempotencyKey,
          "IDEMPOTENCY_KEY_REQUIRED",
          "La llave de idempotencia",
        );
        const evidenceReferences = normalizeEvidenceReferences(input.evidenceReferences);
        const freshness = isPlainObject(input.freshness) ? input.freshness : null;
        if (!freshness?.status) {
          error("FRESHNESS_REQUIRED", "La confirmación requiere frescura explícita.");
        }

        const { data, error: remoteError } = await client.rpc(CONFIRM_RPC, {
          p_prospect_id: prospectReference,
          p_product_reference: productReference,
          p_review_snapshot: input.reviewSnapshot,
          p_source_record_reference: sourceRecordReference,
          p_source_evidence_references: evidenceReferences,
          p_freshness_metadata: freshness,
          p_occurred_at: requireIso(input.occurredAt, "OCCURRED_AT_REQUIRED", "La fecha efectiva"),
          p_idempotency_key: idempotencyKey,
        });

        if (remoteError) mapRemoteError(remoteError);
        if (!data?.quoteReference || !data?.quoteVersionReference) {
          error("PERSISTENCE_RECEIPT_INVALID", "La persistencia no devolvió identidad durable.");
        }
        return deepFreeze(data);
      }

      async function appendLifecycleEvent(input = {}) {
        await authenticatedUser(client);
        const { data, error: remoteError } = await client.rpc(APPEND_RPC, {
          p_quote_reference: requireOpaque(input.quoteReference, "QUOTE_REFERENCE_REQUIRED", "La referencia de Quote"),
          p_quote_version_reference: requireOpaque(
            input.quoteVersionReference,
            "QUOTE_VERSION_REFERENCE_REQUIRED",
            "La referencia de versión",
          ),
          p_event_type: requireOpaque(input.eventType, "EVENT_TYPE_REQUIRED", "El tipo de evento", 80),
          p_occurred_at: requireIso(input.occurredAt, "OCCURRED_AT_REQUIRED", "La fecha efectiva"),
          p_source_record_reference: requireOpaque(
            input.sourceRecordReference,
            "SOURCE_RECORD_REFERENCE_REQUIRED",
            "La referencia fuente",
          ),
          p_evidence_references: normalizeEvidenceReferences(input.evidenceReferences),
          p_decision_reason_code: input.decisionReasonCode || null,
          p_application_reference: input.applicationReference || null,
          p_idempotency_key: requireOpaque(
            input.idempotencyKey,
            "IDEMPOTENCY_KEY_REQUIRED",
            "La llave de idempotencia",
          ),
          p_correction_of: input.correctionOf || null,
        });
        if (remoteError) mapRemoteError(remoteError);
        if (!data?.eventId) {
          error("EVENT_RECEIPT_INVALID", "La persistencia no devolvió el evento de Quote.");
        }
        return deepFreeze(data);
      }

      async function listProspectQuoteHistory(prospectReference, options = {}) {
        await authenticatedUser(client);
        const prospectId = requireOpaque(
          prospectReference,
          "PROSPECT_REFERENCE_REQUIRED",
          "La referencia de Prospect",
        );
        const limit = Math.min(100, Math.max(1, Number(options.limit) || 50));
        let query = client
          .from(HISTORY_VIEW)
          .select(
            "quote_reference,quote_version_reference,prospect_id,product_reference,lifecycle_state,event_id,event_type,occurred_at,recorded_at,evidence_references,freshness_metadata,confirmation_state,contract_version",
          )
          .eq("prospect_id", prospectId)
          .order("occurred_at", { ascending: false })
          .order("recorded_at", { ascending: false });
        if (options.before) {
          query = query.lt(
            "occurred_at",
            requireIso(options.before, "BEFORE_INVALID", "El cursor"),
          );
        }
        const { data, error: remoteError } = await query.limit(limit);
        if (remoteError) mapRemoteError(remoteError);
        return deepFreeze(Array.isArray(data) ? data : []);
      }

      return deepFreeze({
        serviceVersion: SERVICE_VERSION,
        confirmReviewedQuote,
        appendLifecycleEvent,
        listProspectQuoteHistory,
        diagnostics: () => deepFreeze({
          serviceVersion: SERVICE_VERSION,
          confirmRpc: CONFIRM_RPC,
          appendRpc: APPEND_RPC,
          historyView: HISTORY_VIEW,
          directInsertAllowed: false,
          directUpdateAllowed: false,
          directDeleteAllowed: false,
          automaticExternalEffects: false,
          applicationCreationAllowed: false,
        }),
      });
    }

    return deepFreeze({
      SERVICE_VERSION,
      CONFIRM_RPC,
      APPEND_RPC,
      HISTORY_VIEW,
      QuoteLifecycleServiceError,
      create,
    });
  },
);
