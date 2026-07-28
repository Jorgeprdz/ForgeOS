"use strict";

(function pipelineCardProjectionModule(root, factory) {
  const prospectDetailProjection =
    typeof module !== "undefined" && module.exports
      ? require("./prospect-detail-projection")
      : root.ForgeProspectDetailProjectionFES03D;

  const api = factory(prospectDetailProjection);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgePipelineCardProjectionFES03E = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function pipelineCardProjectionFactory(
    prospectDetailProjection,
  ) {
    if (!prospectDetailProjection) {
      throw new Error(
        "FES03D_PROSPECT_DETAIL_PROJECTION_REQUIRED",
      );
    }

    const PROJECTION_CONTRACT_VERSION = "FES-03E.1";
    const PROJECTION_VERSION =
      "forge.pipeline_card_projection.v1";

    const STAGE_CODES = Object.freeze([
      "NEW_PROSPECT",
      "CONTEXT_CAPTURED",
      "APPOINTMENT_SCHEDULED",
      "APPOINTMENT_RESCHEDULED",
      "APPOINTMENT_HELD",
      "APPOINTMENT_NOT_HELD",
      "APPOINTMENT_NO_SHOW",
    ]);

    const STAGE_PRESENTATION = Object.freeze({
      NEW_PROSPECT: "Prospecto nuevo",
      CONTEXT_CAPTURED: "Contexto capturado",
      APPOINTMENT_SCHEDULED: "Cita agendada",
      APPOINTMENT_RESCHEDULED: "Cita reagendada",
      APPOINTMENT_HELD: "Cita realizada",
      APPOINTMENT_NOT_HELD: "Cita no realizada",
      APPOINTMENT_NO_SHOW: "Inasistencia",
    });

    const MILESTONE_EVENT_TO_STAGE = Object.freeze({
      PROSPECT_CREATED: "NEW_PROSPECT",
      INITIAL_CONTEXT_CAPTURED: "CONTEXT_CAPTURED",
      APPOINTMENT_SCHEDULED: "APPOINTMENT_SCHEDULED",
      APPOINTMENT_RESCHEDULED: "APPOINTMENT_RESCHEDULED",
      APPOINTMENT_HELD: "APPOINTMENT_HELD",
      APPOINTMENT_NOT_HELD: "APPOINTMENT_NOT_HELD",
      APPOINTMENT_NO_SHOW: "APPOINTMENT_NO_SHOW",
    });

    const ATTENTION_CODES = Object.freeze([
      "NONE",
      "PENDING_CONFIRMATION",
      "DUE_FOLLOW_UP_PRESENT",
      "APPOINTMENT_OUTCOME_PENDING",
      "CONFLICT_REVIEW_REQUIRED",
    ]);

    const PROJECTION_KEYS = Object.freeze([
      "projection_version",
      "projection_id",
      "source_prospect_detail_version",
      "source_prospect_detail_id",
      "source_prospect_detail_digest",
      "source_timeline_id",
      "source_timeline_digest",
      "tenant_id",
      "correlation_id",
      "prospect_id",
      "stage",
      "last_activity",
      "appointment",
      "pending_outcome",
      "due_follow_up",
      "conflict",
      "attention_reasons",
      "primary_attention",
      "operational_status",
      "projection_digest",
    ]);

    class PipelineCardProjectionError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "PipelineCardProjectionError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new PipelineCardProjectionError(
        code,
        message,
        details,
      );
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return prototype === Object.prototype || prototype === null;
    }

    function clone(value) {
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

    function stableValue(value) {
      if (Array.isArray(value)) {
        return value.map(stableValue);
      }

      if (isPlainObject(value)) {
        const result = {};
        for (const key of Object.keys(value).sort()) {
          result[key] = stableValue(value[key]);
        }
        return result;
      }

      return value;
    }

    function stableStringify(value) {
      return JSON.stringify(stableValue(value));
    }

    function stableDigest(value) {
      if (
        prospectDetailProjection._private &&
        typeof prospectDetailProjection._private.stableDigest === "function"
      ) {
        return prospectDetailProjection._private.stableDigest(value);
      }

      const text =
        typeof value === "string"
          ? value
          : stableStringify(value);
      let hash = 2166136261;

      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }

      return (hash >>> 0).toString(16).padStart(8, "0");
    }

    function assertPlainObject(value, code, label) {
      if (!isPlainObject(value)) {
        error(code, `${label} debe ser un objeto.`);
      }
    }

    function assertAllowedKeys(value, allowed, code, label) {
      assertPlainObject(value, code, label);
      const unsupported = Object.keys(value)
        .filter(key => !allowed.includes(key))
        .sort();

      if (unsupported.length > 0) {
        error(code, `${label} contiene campos no autorizados.`, {
          unsupported_keys: unsupported,
        });
      }
    }

    function assertRequiredKeys(value, required, code, label) {
      const missing = required
        .filter(key => value[key] === undefined)
        .sort();

      if (missing.length > 0) {
        error(code, `${label} no contiene todos los campos obligatorios.`, {
          missing_keys: missing,
        });
      }
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

    function derivePipelineCardProjectionId({
      tenant_id,
      prospect_id,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "PIPELINE_CARD_TENANT_INVALID",
        "El tenant de la tarjeta",
      );
      const prospectId = requireOpaque(
        prospect_id,
        "PIPELINE_CARD_PROSPECT_INVALID",
        "El prospecto de la tarjeta",
      );

      return `pc_${stableDigest({
        tenant_id: tenantId,
        prospect_id: prospectId,
        projection_version: PROJECTION_VERSION,
      })}`;
    }

    function conflictSummary(detail) {
      const reasons = [];

      if (
        detail.identity.state ===
        "CONFLICT_REVIEW_REQUIRED"
      ) {
        reasons.push({
          code: "IDENTITY_CONFLICT",
          reference: detail.prospect_id,
        });
      }

      if (
        detail.profile.state ===
        "CONFLICT_REVIEW_REQUIRED"
      ) {
        reasons.push({
          code: "PROFILE_CONFLICT",
          reference:
            detail.profile.root_event_id,
        });
      }

      for (const appointment of detail.appointments) {
        if (
          appointment.state ===
          "CONFLICT_REVIEW_REQUIRED"
        ) {
          reasons.push({
            code: "APPOINTMENT_CONFLICT",
            reference:
              appointment.appointment_reference,
          });
        }
      }

      for (const dueAction of detail.due_actions) {
        if (
          dueAction.state ===
          "CONFLICT_REVIEW_REQUIRED"
        ) {
          reasons.push({
            code: "DUE_ACTION_CONFLICT",
            reference:
              dueAction.due_action_reference,
          });
        }
      }

      for (const conflict of detail.correction_conflicts) {
        reasons.push({
          code: "CORRECTION_FORK",
          reference:
            conflict.root_event_id,
        });
      }

      const unique = [
        ...new Map(
          reasons.map(reason => [
            `${reason.code}:${reason.reference}`,
            reason,
          ]),
        ).values(),
      ].sort(
        (left, right) =>
          `${left.code}:${left.reference}`.localeCompare(
            `${right.code}:${right.reference}`,
          ),
      );

      return {
        state:
          unique.length > 0
            ? "CONFLICT_REVIEW_REQUIRED"
            : "NONE",
        count: unique.length,
        reasons: unique,
      };
    }

    function projectStage(detail, conflict) {
      if (conflict.count > 0) {
        return {
          state: "CONFLICT_REVIEW_REQUIRED",
          code: null,
          label: null,
          event_id: null,
          occurred_at: null,
        };
      }

      const milestone = detail.history.find(
        item =>
          !item.is_corrected &&
          Boolean(
            MILESTONE_EVENT_TO_STAGE[
              item.event_type
            ],
          ),
      );

      if (!milestone) {
        error(
          "PIPELINE_CARD_STAGE_MISSING",
          "La tarjeta requiere un hito de Pipeline.",
        );
      }

      const code =
        MILESTONE_EVENT_TO_STAGE[
          milestone.event_type
        ];

      return {
        state:
          milestone.pending_state === "NONE"
            ? "CONFIRMED"
            : milestone.pending_state,
        code,
        label: STAGE_PRESENTATION[code],
        event_id: milestone.event_id,
        occurred_at: milestone.occurred_at,
      };
    }

    function projectLastActivity(detail) {
      const item = detail.history[0];

      if (!item) {
        error(
          "PIPELINE_CARD_HISTORY_REQUIRED",
          "La tarjeta requiere historial Activity.",
        );
      }

      return {
        event_id: item.event_id,
        event_type: item.event_type,
        title: item.title,
        category: item.category,
        occurred_at: item.occurred_at,
        source: clone(item.source),
        confirmation_state:
          item.confirmation_state,
        pending_state: item.pending_state,
        is_correction: item.is_correction,
        is_corrected: item.is_corrected,
      };
    }

    function canonicalPositionByEvent(detail) {
      return new Map(
        detail.history.map(item => [
          item.event_id,
          item.canonical_position,
        ]),
      );
    }

    function projectAppointment(detail) {
      if (detail.appointments.length === 0) {
        return null;
      }

      const positions =
        canonicalPositionByEvent(detail);

      return [...detail.appointments]
        .sort((left, right) => {
          const leftPosition =
            positions.get(
              left.latest_event_id,
            ) || 0;
          const rightPosition =
            positions.get(
              right.latest_event_id,
            ) || 0;

          return (
            rightPosition -
              leftPosition ||
            left.appointment_reference
              .localeCompare(
                right.appointment_reference,
              )
          );
        })
        .map(item => ({
          appointment_reference:
            item.appointment_reference,
          state: item.state,
          status: item.status,
          starts_at: item.starts_at,
          ends_at: item.ends_at,
          provider_event_reference:
            item.provider_event_reference,
          reason_code: item.reason_code,
          party: item.party,
          outcome_confirmed_at:
            item.outcome_confirmed_at,
          latest_event_id:
            item.latest_event_id,
        }))[0];
    }

    function projectPendingOutcome(
      appointment,
    ) {
      if (!appointment) {
        return {
          state: "NONE",
          reason: null,
          appointment_reference: null,
          event_id: null,
        };
      }

      if (
        appointment.state ===
        "CONFLICT_REVIEW_REQUIRED"
      ) {
        return {
          state:
            "CONFLICT_REVIEW_REQUIRED",
          reason:
            "APPOINTMENT_STATE_CONFLICT",
          appointment_reference:
            appointment.appointment_reference,
          event_id: null,
        };
      }

      if (
        [
          "SCHEDULED",
          "RESCHEDULED",
        ].includes(appointment.status)
      ) {
        return {
          state:
            "APPOINTMENT_OUTCOME_PENDING",
          reason:
            "OUTCOME_EVENT_NOT_RECORDED",
          appointment_reference:
            appointment.appointment_reference,
          event_id:
            appointment.latest_event_id,
        };
      }

      return {
        state: "NONE",
        reason: null,
        appointment_reference:
          appointment.appointment_reference,
        event_id:
          appointment.latest_event_id,
      };
    }

    function projectDueFollowUp(detail) {
      const candidates =
        detail.due_actions.filter(
          item =>
            ["OPEN", "RESCHEDULED"].includes(
              item.status,
            ) &&
            item.state !==
              "CONFLICT_REVIEW_REQUIRED",
        );

      if (candidates.length === 0) {
        return null;
      }

      const sorted = [...candidates].sort(
        (left, right) => {
          const leftDue =
            left.due_at ||
            "9999-12-31T23:59:59.999Z";
          const rightDue =
            right.due_at ||
            "9999-12-31T23:59:59.999Z";

          return (
            leftDue.localeCompare(rightDue) ||
            left.due_action_reference
              .localeCompare(
                right.due_action_reference,
              )
          );
        },
      );

      const item = sorted[0];

      return {
        due_action_reference:
          item.due_action_reference,
        state: item.state,
        status: item.status,
        action_type: item.action_type,
        due_at: item.due_at,
        latest_event_id:
          item.latest_event_id,
      };
    }

    function attentionReasons({
      conflict,
      pendingOutcome,
      dueFollowUp,
      detail,
    }) {
      const reasons = [];

      if (conflict.count > 0) {
        reasons.push({
          code:
            "CONFLICT_REVIEW_REQUIRED",
          reference:
            detail.prospect_id,
        });
      }

      if (
        pendingOutcome.state ===
        "APPOINTMENT_OUTCOME_PENDING"
      ) {
        reasons.push({
          code:
            "APPOINTMENT_OUTCOME_PENDING",
          reference:
            pendingOutcome
              .appointment_reference,
        });
      }

      if (dueFollowUp) {
        reasons.push({
          code:
            "DUE_FOLLOW_UP_PRESENT",
          reference:
            dueFollowUp
              .due_action_reference,
        });
      }

      if (
        detail.counters.pending_count > 0
      ) {
        reasons.push({
          code:
            "PENDING_CONFIRMATION",
          reference:
            detail.prospect_id,
        });
      }

      const priority = new Map([
        [
          "CONFLICT_REVIEW_REQUIRED",
          0,
        ],
        [
          "APPOINTMENT_OUTCOME_PENDING",
          1,
        ],
        ["DUE_FOLLOW_UP_PRESENT", 2],
        ["PENDING_CONFIRMATION", 3],
      ]);

      return reasons.sort(
        (left, right) =>
          priority.get(left.code) -
            priority.get(right.code) ||
          left.reference.localeCompare(
            right.reference,
          ),
      );
    }

    function buildPipelineCardProjection(
      timelineInput,
    ) {
      const detail =
        prospectDetailProjection
          .createProspectDetailProjection({
            timeline: timelineInput,
          });
      const projectionId =
        derivePipelineCardProjectionId({
          tenant_id: detail.tenant_id,
          prospect_id: detail.prospect_id,
        });
      const conflict =
        conflictSummary(detail);
      const stage =
        projectStage(detail, conflict);
      const lastActivity =
        projectLastActivity(detail);
      const appointment =
        projectAppointment(detail);
      const pendingOutcome =
        projectPendingOutcome(
          appointment,
        );
      const dueFollowUp =
        projectDueFollowUp(detail);
      const reasons =
        attentionReasons({
          conflict,
          pendingOutcome,
          dueFollowUp,
          detail,
        });
      const primaryAttention =
        reasons.length > 0
          ? reasons[0].code
          : "NONE";
      const operationalStatus =
        primaryAttention ===
        "CONFLICT_REVIEW_REQUIRED"
          ? "BLOCKED_BY_CONFLICT"
          : primaryAttention === "NONE"
            ? "CLEAR"
            : "REQUIRES_ATTENTION";

      const digestInput = {
        projection_version:
          PROJECTION_VERSION,
        projection_id: projectionId,
        source_prospect_detail_version:
          detail.projection_version,
        source_prospect_detail_id:
          detail.projection_id,
        source_prospect_detail_digest:
          detail.projection_digest,
        source_timeline_id:
          detail.source_timeline_id,
        source_timeline_digest:
          detail.source_timeline_digest,
        tenant_id: detail.tenant_id,
        correlation_id:
          detail.correlation_id,
        prospect_id: detail.prospect_id,
        stage,
        last_activity: lastActivity,
        appointment,
        pending_outcome:
          pendingOutcome,
        due_follow_up: dueFollowUp,
        conflict,
        attention_reasons: reasons,
        primary_attention:
          primaryAttention,
        operational_status:
          operationalStatus,
      };

      return {
        ...digestInput,
        projection_digest:
          stableDigest(digestInput),
      };
    }

    function normalizeProjection(
      input,
      timelineInput,
      { requireCanonicalShape = false } = {},
    ) {
      assertAllowedKeys(
        input,
        PROJECTION_KEYS,
        "PIPELINE_CARD_PROJECTION_FIELDS_INVALID",
        "La tarjeta de Pipeline",
      );
      assertRequiredKeys(
        input,
        PROJECTION_KEYS,
        "PIPELINE_CARD_PROJECTION_FIELDS_REQUIRED",
        "La tarjeta de Pipeline",
      );

      const normalized =
        buildPipelineCardProjection(
          timelineInput,
        );

      if (
        requireCanonicalShape &&
        stableStringify(input) !==
          stableStringify(normalized)
      ) {
        error(
          "PIPELINE_CARD_PROJECTION_NOT_CANONICAL",
          "La tarjeta no coincide con su timeline fuente.",
        );
      }

      return normalized;
    }

    function createPipelineCardProjection({
      timeline,
    } = {}) {
      return deepFreeze(
        buildPipelineCardProjection(
          timeline,
        ),
      );
    }

    function assertPipelineCardProjection(
      projection,
      { timeline } = {},
    ) {
      return deepFreeze(
        normalizeProjection(
          clone(projection),
          timeline,
          {
            requireCanonicalShape: true,
          },
        ),
      );
    }

    function validatePipelineCardProjection(
      projection,
      { timeline } = {},
    ) {
      try {
        assertPipelineCardProjection(
          projection,
          { timeline },
        );

        return deepFreeze({
          valid: true,
          errors: [],
        });
      } catch (caught) {
        return deepFreeze({
          valid: false,
          errors: [
            {
              code:
                caught && caught.code
                  ? caught.code
                  : "PIPELINE_CARD_PROJECTION_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La tarjeta de Pipeline no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildPipelineCardProjection({
      projection,
      timeline,
    } = {}) {
      assertPipelineCardProjection(
        projection,
        { timeline },
      );

      return createPipelineCardProjection({
        timeline,
      });
    }

    return deepFreeze({
      PROJECTION_CONTRACT_VERSION,
      PROJECTION_VERSION,
      STAGE_CODES,
      STAGE_PRESENTATION,
      MILESTONE_EVENT_TO_STAGE,
      ATTENTION_CODES,
      PipelineCardProjectionError,
      derivePipelineCardProjectionId,
      createPipelineCardProjection,
      assertPipelineCardProjection,
      validatePipelineCardProjection,
      rebuildPipelineCardProjection,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        conflictSummary,
        projectStage,
        projectAppointment,
        projectPendingOutcome,
        projectDueFollowUp,
        attentionReasons,
        buildPipelineCardProjection,
        deepFreeze,
      }),
    });
  },
);
