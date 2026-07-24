"use strict";

(function prospectTimelineServiceModule(root, factory) {
  const contract =
    typeof module !== "undefined" &&
    module.exports
      ? require("./prospect-timeline-contract")
      : root.ForgeProspectTimelineContractNFAST08;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeProspectTimelineServiceNFAST08 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function prospectTimelineServiceFactory(contract) {
    if (!contract) {
      throw new Error(
        "NFAST_08_TIMELINE_CONTRACT_REQUIRED",
      );
    }

    const TIMELINE_VIEW =
      "prospect_commercial_timeline";
    const APPEND_RPC =
      "forge_nfast08_append_prospect_timeline_event";

    class ProspectTimelineError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ProspectTimelineError";
        this.code = code;
        this.details = details;
      }
    }

    function rowToTimelineEvent(row = {}) {
      return Object.freeze({
        id: row.id,
        prospectId: row.prospect_id,
        eventType: row.event_type,
        eventSource: row.event_source,
        sourceRecordReference:
          row.source_record_reference,
        occurredAt: row.occurred_at,
        recordedAt: row.recorded_at,
        payload: row.payload || {},
        evidenceReferences:
          row.evidence_references || [],
        contractVersion: row.contract_version,
        privacyClassification:
          row.privacy_classification,
        retentionPolicy:
          row.retention_policy,
      });
    }

    async function authenticatedUser(client) {
      const { data, error } =
        await client.auth.getUser();
      const user = data?.user;

      if (error || !user?.id) {
        throw new ProspectTimelineError(
          "AUTH_REQUIRED",
          "Tu sesión expiró. Inicia sesión nuevamente.",
        );
      }

      return user;
    }

    function mapError(error) {
      if (error instanceof ProspectTimelineError) {
        throw error;
      }

      const message = String(
        error?.message || "",
      );

      if (
        error?.code === "PGRST116" ||
        message.includes("PROSPECT_NOT_OWNED")
      ) {
        throw new ProspectTimelineError(
          "PROSPECT_NOT_FOUND",
          "No encontramos el prospecto.",
        );
      }

      if (
        error?.code === "23505" ||
        message.includes(
          "prospect_timeline_events_idempotency_uq",
        )
      ) {
        throw new ProspectTimelineError(
          "DUPLICATE_TIMELINE_EVENT",
          "El evento ya fue registrado.",
        );
      }

      if (
        message.includes(
          "NFAST08_TIMELINE_EVENT_TYPE_INVALID",
        ) ||
        message.includes(
          "NFAST08_TIMELINE_PAYLOAD_INVALID",
        ) ||
        message.includes(
          "NFAST08_EVIDENCE_REFERENCES_INVALID",
        )
      ) {
        throw new ProspectTimelineError(
          "VALIDATION_ERROR",
          "El evento del Timeline no cumple el contrato gobernado.",
        );
      }

      throw new ProspectTimelineError(
        "NETWORK_ERROR",
        "No pudimos completar la operación del Timeline.",
      );
    }

    function create(client) {
      if (
        !client?.auth?.getUser ||
        !client?.from ||
        !client?.rpc
      ) {
        throw new ProspectTimelineError(
          "CLIENT_REQUIRED",
          "Supabase autenticado es obligatorio.",
        );
      }

      async function listProspectTimeline(
        prospectId,
        options = {},
      ) {
        await authenticatedUser(client);

        const normalizedProspectId = String(
          prospectId || "",
        ).trim();

        if (!normalizedProspectId) {
          throw new ProspectTimelineError(
            "VALIDATION_ERROR",
            "El prospecto es obligatorio.",
          );
        }

        const limit = Math.min(
          100,
          Math.max(
            1,
            Number(options.limit) || 50,
          ),
        );

        let query = client
          .from(TIMELINE_VIEW)
          .select(
            "id,prospect_id,event_type,event_source,source_record_reference,occurred_at,recorded_at,payload,evidence_references,contract_version,privacy_classification,retention_policy",
          )
          .eq(
            "prospect_id",
            normalizedProspectId,
          )
          .order("occurred_at", {
            ascending: false,
          })
          .order("recorded_at", {
            ascending: false,
          });

        if (options.before) {
          const before = new Date(
            options.before,
          );

          if (
            Number.isNaN(before.getTime())
          ) {
            throw new ProspectTimelineError(
              "VALIDATION_ERROR",
              "El cursor del Timeline no es válido.",
            );
          }

          query = query.lt(
            "occurred_at",
            before.toISOString(),
          );
        }

        const { data, error } =
          await query.limit(limit);

        if (error) {
          mapError(error);
        }

        return Object.freeze(
          (data || []).map(
            rowToTimelineEvent,
          ),
        );
      }

      async function appendProspectTimelineEvent(
        prospectId,
        input,
      ) {
        await authenticatedUser(client);

        const normalizedProspectId = String(
          prospectId || "",
        ).trim();

        if (!normalizedProspectId) {
          throw new ProspectTimelineError(
            "VALIDATION_ERROR",
            "El prospecto es obligatorio.",
          );
        }

        const validation =
          contract.validateProspectTimelineEventInput(
            input,
          );

        if (!validation.valid) {
          throw new ProspectTimelineError(
            "VALIDATION_ERROR",
            "El evento del Timeline no cumple el contrato gobernado.",
            {
              errors: validation.errors,
            },
          );
        }

        const event = validation.normalized;

        const { data, error } =
          await client.rpc(APPEND_RPC, {
            p_prospect_id:
              normalizedProspectId,
            p_event_type: event.eventType,
            p_occurred_at: event.occurredAt,
            p_source_record_reference:
              event.sourceRecordReference,
            p_payload: event.payload,
            p_evidence_references:
              event.evidenceReferences,
            p_idempotency_key:
              event.idempotencyKey,
          });

        if (error) {
          mapError(error);
        }

        const row = Array.isArray(data)
          ? data[0]
          : data;

        if (!row?.id) {
          throw new ProspectTimelineError(
            "NETWORK_ERROR",
            "El Timeline no devolvió el evento persistido.",
          );
        }

        return rowToTimelineEvent(row);
      }

      return Object.freeze({
        contractVersion:
          contract.TIMELINE_CONTRACT_VERSION,
        listProspectTimeline,
        appendProspectTimelineEvent,
        diagnostics: () =>
          Object.freeze({
            contractVersion:
              contract.TIMELINE_CONTRACT_VERSION,
            timelineView: TIMELINE_VIEW,
            appendRpc: APPEND_RPC,
            directInsertAllowed: false,
            updateAllowed: false,
            deleteAllowed: false,
            rawNotesAccepted: false,
            draftPersistenceAllowed: false,
          }),
      });
    }

    return Object.freeze({
      TIMELINE_VIEW,
      APPEND_RPC,
      ProspectTimelineError,
      rowToTimelineEvent,
      create,
    });
  },
);
