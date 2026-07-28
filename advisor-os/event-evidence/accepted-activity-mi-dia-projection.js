"use strict";

(function acceptedActivityMiDiaProjectionModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeAcceptedActivityMiDiaProjectionFES08C = api;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function acceptedActivityMiDiaProjectionFactory() {
    const VERSION = "FES-08C.1";
    const ACTIVITY_SCHEMA = "activity-record.v1";
    const PROJECTION_SCHEMA = "forge.mi_dia_accepted_activity_projection.v1";
    const EVENT_NAME = "forge:accepted-activity-mi-dia-projected";
    const SUPPORTED = Object.freeze({
      INITIAL_APPOINTMENT_SCHEDULED: Object.freeze({
        label: "Cita inicial programada",
        activityState: "SCHEDULED",
        priority: "ALTA",
      }),
      INITIAL_APPOINTMENT_COMPLETED: Object.freeze({
        label: "Cita inicial realizada",
        activityState: "COMPLETED",
        priority: "COMPLETADA",
      }),
    });

    class AcceptedActivityMiDiaProjectionError extends TypeError {
      constructor(code, message) {
        super(message);
        this.name = "AcceptedActivityMiDiaProjectionError";
        this.code = code;
      }
    }

    function fail(code, message) {
      throw new AcceptedActivityMiDiaProjectionError(code, message);
    }

    function required(value, label) {
      const normalized = typeof value === "string" ? value.trim() : "";
      if (!normalized) fail("MI_DIA_ACTIVITY_FIELD_REQUIRED", `${label} is required`);
      return normalized;
    }

    function deepFreeze(value) {
      if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
      Object.values(value).forEach(deepFreeze);
      return Object.freeze(value);
    }

    function acceptedRecord(input) {
      if (!input || typeof input !== "object" || Array.isArray(input)) {
        fail("MI_DIA_ACCEPTED_ACTIVITY_REQUIRED", "accepted activity result is required");
      }
      if (input.status !== "PROJECTED" || input.record === undefined) {
        fail("MI_DIA_ACTIVITY_NOT_ACCEPTED", "activity must be canonically accepted before projection");
      }
      const record = input.record;
      if (
        record.schemaVersion !== ACTIVITY_SCHEMA ||
        record.lifecycle !== "CONFIRMED" ||
        record.source?.evidenceState !== "VERIFIED"
      ) {
        fail("MI_DIA_ACTIVITY_NOT_ACCEPTED", "activity record is not accepted confirmed truth");
      }
      return record;
    }

    function projectAcceptedActivity(input) {
      const record = acceptedRecord(input);
      const mapping = SUPPORTED[record.type];
      if (!mapping) {
        return deepFreeze({
          schemaVersion: PROJECTION_SCHEMA,
          status: "IGNORED",
          reason: "NO_MI_DIA_PRODUCTIVE_ACTIVITY_SEMANTIC",
          sourceActivityId: required(record.id, "record.id"),
        });
      }

      const activityId = required(record.id, "record.id");
      const occurredAt = required(record.occurredAt, "record.occurredAt");
      return deepFreeze({
        schemaVersion: PROJECTION_SCHEMA,
        status: "PROJECTED",
        projectionId: `mi-dia:activity:${activityId}`,
        sourceActivityId: activityId,
        sourceEventId: required(record.source?.eventId, "record.source.eventId"),
        organizationId: required(record.organizationId, "record.organizationId"),
        advisorId: required(record.advisorId, "record.advisorId"),
        prospectId: required(record.prospectId, "record.prospectId"),
        appointmentId: record.appointmentId == null
          ? null
          : required(record.appointmentId, "record.appointmentId"),
        activityType: record.type,
        activityState: mapping.activityState,
        label: mapping.label,
        priority: mapping.priority,
        occurredAt,
        dueAt: record.dueAt == null ? occurredAt : required(record.dueAt, "record.dueAt"),
        provenance: deepFreeze({
          system: required(record.source?.system, "record.source.system"),
          producerVersion: required(
            record.source?.producerVersion,
            "record.source.producerVersion",
          ),
          evidenceState: record.source.evidenceState,
          confirmationMethod: required(
            record.confirmation?.method,
            "record.confirmation.method",
          ),
          lineageSchema: required(
            record.metadata?.lineageSchema,
            "record.metadata.lineageSchema",
          ),
          projectionSchema: required(
            record.metadata?.projectionSchema,
            "record.metadata.projectionSchema",
          ),
        }),
      });
    }

    function publishAcceptedActivity(input, {
      eventTarget = typeof globalThis !== "undefined" ? globalThis : null,
    } = {}) {
      const projection = projectAcceptedActivity(input);
      if (projection.status !== "PROJECTED") return projection;
      if (!eventTarget || typeof eventTarget.dispatchEvent !== "function") {
        fail("MI_DIA_INVALIDATION_TARGET_REQUIRED", "Mi Día event target is required");
      }
      const EventCtor = eventTarget.CustomEvent || globalThis.CustomEvent;
      if (typeof EventCtor !== "function") {
        fail("MI_DIA_CUSTOM_EVENT_REQUIRED", "CustomEvent is required");
      }
      eventTarget.dispatchEvent(new EventCtor(EVENT_NAME, {
        detail: { projection },
      }));
      return projection;
    }

    return deepFreeze({
      VERSION,
      ACTIVITY_SCHEMA,
      PROJECTION_SCHEMA,
      EVENT_NAME,
      SUPPORTED,
      AcceptedActivityMiDiaProjectionError,
      projectAcceptedActivity,
      publishAcceptedActivity,
    });
  },
);
