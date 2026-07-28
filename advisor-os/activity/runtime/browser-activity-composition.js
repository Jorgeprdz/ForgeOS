"use strict";

(function browserActivityCompositionModule(root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.ForgeBrowserActivityCompositionFES08A = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function browserActivityCompositionFactory(root) {
    const LINEAGE_SCHEMA =
      "forge.fes_activity_lineage.v1";
    const PROJECTION_SCHEMA =
      "fes-event-activity-projection.v1";
    const ACTIVITY_SCHEMA =
      "activity-record.v1";
    const ACTIVITY_TYPES = Object.freeze([
      "REFERRAL_ACQUIRED",
      "CONTACT_ATTEMPTED",
      "CONVERSATION_COMPLETED",
      "INITIAL_APPOINTMENT_SCHEDULED",
      "INITIAL_APPOINTMENT_COMPLETED",
      "CLOSING_APPOINTMENT_SCHEDULED",
      "CLOSING_APPOINTMENT_COMPLETED",
      "APPLICATION_SUBMITTED",
      "POLICY_PAID",
      "FOLLOW_UP_COMPLETED",
    ]);
    const MAPPINGS = Object.freeze({
      CALL_NOT_ANSWERED_CONFIRMED: Object.freeze({
        type: "CONTACT_ATTEMPTED",
        subtype: "FES_CALL_NOT_ANSWERED_CONFIRMED",
      }),
      CALL_CONNECTED_CONFIRMED: Object.freeze({
        type: "CONVERSATION_COMPLETED",
        subtype: "FES_CALL_CONNECTED_CONFIRMED",
      }),
      APPOINTMENT_SCHEDULED: Object.freeze({
        type: "INITIAL_APPOINTMENT_SCHEDULED",
        subtype: "FES_APPOINTMENT_SCHEDULED",
      }),
      APPOINTMENT_HELD: Object.freeze({
        type: "INITIAL_APPOINTMENT_COMPLETED",
        subtype: "FES_APPOINTMENT_HELD",
      }),
    });

    class BrowserActivityCompositionError extends Error {
      constructor(code, message) {
        super(message);
        this.name = "BrowserActivityCompositionError";
        this.code = code;
      }
    }

    function fail(code, message) {
      throw new BrowserActivityCompositionError(
        code,
        message,
      );
    }

    function required(value, label) {
      const normalized =
        typeof value === "string"
          ? value.trim()
          : "";
      if (!normalized) {
        fail(
          "BROWSER_ACTIVITY_IDENTITY_REQUIRED",
          `${label} is required`,
        );
      }
      return normalized;
    }

    function optional(value) {
      return value === undefined ||
        value === null ||
        value === ""
        ? null
        : required(value, "optional identity");
    }

    function freeze(value) {
      if (
        !value ||
        typeof value !== "object" ||
        Object.isFrozen(value)
      ) {
        return value;
      }
      Object.values(value).forEach(freeze);
      return Object.freeze(value);
    }

    async function sha256(value) {
      if (
        !root.crypto?.subtle ||
        typeof TextEncoder !== "function"
      ) {
        fail(
          "WEB_CRYPTO_REQUIRED",
          "Web Crypto SHA-256 is required",
        );
      }
      const digest = await root.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(value),
      );
      return [...new Uint8Array(digest)]
        .map(byte =>
          byte.toString(16).padStart(2, "0"),
        )
        .join("");
    }

    function evaluationDate(instant, timeZone) {
      const parts = new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      ).formatToParts(new Date(instant));
      const values = Object.fromEntries(
        parts
          .filter(part =>
            ["year", "month", "day"].includes(
              part.type,
            ),
          )
          .map(part => [part.type, part.value]),
      );
      return `${values.year}-${values.month}-${values.day}`;
    }

    async function authorityFromClient(client) {
      if (
        !client?.auth ||
        typeof client.auth.getUser !== "function"
      ) {
        fail(
          "ACTIVITY_AUTH_CLIENT_REQUIRED",
          "authenticated client is required",
        );
      }
      const response = await client.auth.getUser();
      const user = response?.data?.user;
      if (response?.error || !user?.id) {
        fail(
          "ACTIVITY_AUTH_USER_REQUIRED",
          "authenticated advisor is required",
        );
      }
      const organizationId =
        user.app_metadata?.organization_id ??
        user.app_metadata?.organizationId;
      return freeze({
        organizationId: required(
          organizationId,
          "app_metadata.organization_id",
        ),
        advisorId: required(
          user.id,
          "user.id",
        ),
        authenticatedUserId: required(
          user.id,
          "user.id",
        ),
        tenantId: required(
          user.id,
          "user.id",
        ),
      });
    }

    async function project({
      event,
      authority,
      timeZone =
        "America/Mexico_City",
    } = {}) {
      const mapping =
        MAPPINGS[event?.event_type];
      if (!mapping) {
        return freeze({
          status: "IGNORED",
          reason:
            "NO_ACTIVITY_SEMANTIC_EQUIVALENCE",
          sourceEventId:
            event?.event_id ?? null,
        });
      }
      const organizationId = required(
        authority?.organizationId,
        "authority.organizationId",
      );
      const advisorId = required(
        authority?.advisorId,
        "authority.advisorId",
      );
      if (
        advisorId !==
        authority?.authenticatedUserId
      ) {
        fail(
          "ACTIVITY_ADVISOR_AUTHORITY_MISMATCH",
          "advisor does not match authenticated user",
        );
      }
      if (
        event.tenant_id !==
        authority?.tenantId
      ) {
        fail(
          "ACTIVITY_TENANT_AUTHORITY_MISMATCH",
          "event tenant does not match authenticated authority",
        );
      }
      if (
        event.confirmation_state !== "CONFIRMED" ||
        ![
          "HUMAN_CONFIRMED",
          "EXTERNAL_CONFIRMED",
        ].includes(event.evidence_strength)
      ) {
        fail(
          "ACTIVITY_CONFIRMED_EVIDENCE_REQUIRED",
          "confirmed evidence is required",
        );
      }
      const prospectId = required(
        event.payload?.prospect_reference,
        "event.payload.prospect_reference",
      );
      const appointmentId =
        event.subject?.type === "APPOINTMENT"
          ? required(
              event.subject.id,
              "event.subject.id",
            )
          : null;
      if (
        event.source?.type ===
          "ADVISOR_CONFIRMED" &&
        event.actor?.id !== advisorId
      ) {
        fail(
          "ACTIVITY_ADVISOR_EVENT_MISMATCH",
          "event actor does not match advisor",
        );
      }
      const idHash = await sha256(
        [
          PROJECTION_SCHEMA,
          organizationId,
          advisorId,
          required(
            event.event_id,
            "event.event_id",
          ),
          mapping.type,
        ].join("\u001f"),
      );
      const record = freeze({
        schemaVersion: ACTIVITY_SCHEMA,
        id: `activity:fes:${idHash}`,
        organizationId,
        advisorId,
        managerId: optional(
          authority.managerId,
        ),
        prospectId,
        opportunityId: optional(
          authority.opportunityId,
        ),
        appointmentId,
        policyId: optional(
          authority.policyId,
        ),
        type: mapping.type,
        subtype: mapping.subtype,
        lifecycle: "CONFIRMED",
        source: {
          system: "FES_RECONCILIATION",
          eventId: event.event_id,
          recordedAt: new Date(
            event.recorded_at,
          ).toISOString(),
          producerVersion:
            PROJECTION_SCHEMA,
          evidenceState: "VERIFIED",
        },
        occurredAt: new Date(
          event.occurred_at,
        ).toISOString(),
        evaluationDate:
          evaluationDate(
            event.occurred_at,
            timeZone,
          ),
        timeZone,
        confirmation: {
          method:
            event.source?.type ===
              "EXTERNAL_PROVIDER_CONFIRMED"
              ? "CALENDAR_COMPLETION"
              : "MANUAL_ADVISOR",
          confirmedAt: new Date(
            event.recorded_at,
          ).toISOString(),
          confirmedBy:
            event.source?.type ===
              "EXTERNAL_PROVIDER_CONFIRMED"
              ? required(
                  event.actor?.id,
                  "event.actor.id",
                )
              : advisorId,
        },
        correction: null,
        reversal: null,
        metadata: {
          lineageSchema: LINEAGE_SCHEMA,
          projectionSchema:
            PROJECTION_SCHEMA,
          canonicalEventSchema:
            event.schema_version,
        },
        revision: 1,
        createdAt: new Date(
          event.recorded_at,
        ).toISOString(),
        updatedAt: new Date(
          event.recorded_at,
        ).toISOString(),
      });
      const truthHash = await sha256(
        [
          record.schemaVersion,
          record.organizationId,
          record.advisorId,
          record.source.system,
          record.source.eventId,
          record.type,
          record.occurredAt,
        ].join("\u001f"),
      );
      return freeze({
        status: "PROJECTED",
        sourceEventId: event.event_id,
        activityRecord: record,
        truthKey:
          `activity:${truthHash}`,
      });
    }

    function create({ client, authority }) {
      if (
        !client ||
        typeof client.rpc !== "function"
      ) {
        fail(
          "ACTIVITY_RPC_CLIENT_REQUIRED",
          "client.rpc is required",
        );
      }

      async function appendEvent(input) {
        const projection =
          await project({
            ...input,
            authority,
          });
        if (projection.status === "IGNORED") {
          return projection;
        }
        const response = await client.rpc(
          "activity_records_append_v1",
          {
            p_record:
              projection.activityRecord,
            p_truth_key:
              projection.truthKey,
          },
        );
        if (response?.error) {
          fail(
            "ACTIVITY_RPC_APPEND_FAILED",
            response.error.message ||
              "Activity append failed",
          );
        }
        const data =
          Array.isArray(response?.data) &&
          response.data.length === 1
            ? response.data[0]
            : response?.data;
        if (!data?.row) {
          fail(
            "ACTIVITY_RPC_APPEND_RESPONSE_INVALID",
            "Activity append response is invalid",
          );
        }
        return freeze({
          ...projection,
          record:
            data.row.payload ??
            projection.activityRecord,
          inserted: data.inserted === true,
        });
      }

      async function list({
        limit = 500,
      } = {}) {
        const response = await client.rpc(
          "activity_records_list_v1",
          {
            p_query: {
              organizationId:
                authority.organizationId,
              advisorId:
                authority.advisorId,
              order: "asc",
              limit,
            },
          },
        );
        if (response?.error) {
          fail(
            "ACTIVITY_RPC_LIST_FAILED",
            response.error.message ||
              "Activity list failed",
          );
        }
        const rows =
          Array.isArray(response?.data)
            ? response.data
            : [];
        return freeze(
          rows.map(row =>
            row.payload ?? row,
          ),
        );
      }

      return freeze({
        schemaVersion:
          "browser-activity-composition.v1",
        authority,
        persistence: {
          appendRpc:
            "activity_records_append_v1",
          listRpc:
            "activity_records_list_v1",
          directTableAccess: false,
        },
        appendEvent,
        list,
      });
    }

    return freeze({
      LINEAGE_SCHEMA,
      PROJECTION_SCHEMA,
      ACTIVITY_SCHEMA,
      ACTIVITY_TYPES,
      MAPPINGS,
      BrowserActivityCompositionError,
      sha256,
      authorityFromClient,
      project,
      create,
    });
  },
);
