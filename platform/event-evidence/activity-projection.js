"use strict";

(function activityProjectionModule(root, factory) {
  const timelineContract =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-timeline-contract")
      : root.ForgeCanonicalActivityTimelineContractFES03B;
  const api = factory(timelineContract);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeActivityProjectionFES03C = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function activityProjectionFactory(timelineContract) {
  if (!timelineContract) throw new Error("FES03B_CANONICAL_TIMELINE_REQUIRED");

  const PROJECTION_CONTRACT_VERSION = "FES-03C.1";
  const PROJECTION_VERSION = "forge.activity_projection.v1";
  const ITEM_VERSION = "forge.activity_projection_item.v1";
  const ORDERING = Object.freeze({ display: "occurred_at:DESC", canonical_reference: "canonical_position:ASC" });
  const CATEGORIES = Object.freeze(["SYSTEM", "PROSPECT", "CONTEXT", "APPOINTMENT", "DUE_ACTION", "MESSAGE", "OBJECTION", "CALL", "QUOTE", "PRESENTATION"]);
  const CONFIRMATION_STATES = Object.freeze(["UNCONFIRMED", "REPORTED", "CONFIRMED", "DISPUTED"]);
  const PENDING_STATES = Object.freeze(["NONE", "PENDING_CONFIRMATION", "REVIEWABLE_REPORTED", "CONFLICT_REVIEW_REQUIRED"]);
  const EVENT_PRESENTATION = Object.freeze({
    PROSPECT_PROFILE_CREATED: Object.freeze({ category: "PROSPECT", title: "Perfil de prospecto creado" }),
    PROSPECT_CREATED: Object.freeze({ category: "PROSPECT", title: "Prospecto registrado" }),
    INITIAL_CONTEXT_CAPTURED: Object.freeze({ category: "CONTEXT", title: "Contexto inicial capturado" }),
    TIMELINE_INITIALIZED: Object.freeze({ category: "SYSTEM", title: "Historial iniciado" }),
    APPOINTMENT_SCHEDULED: Object.freeze({ category: "APPOINTMENT", title: "Cita agendada" }),
    APPOINTMENT_HELD: Object.freeze({ category: "APPOINTMENT", title: "Cita realizada" }),
    APPOINTMENT_NOT_HELD: Object.freeze({ category: "APPOINTMENT", title: "Cita no realizada" }),
    APPOINTMENT_RESCHEDULED: Object.freeze({ category: "APPOINTMENT", title: "Cita reagendada" }),
    APPOINTMENT_NO_SHOW: Object.freeze({ category: "APPOINTMENT", title: "Inasistencia registrada" }),
    ACTIVITY_CONTEXT_ADDED: Object.freeze({ category: "CONTEXT", title: "Contexto de actividad añadido" }),
    DUE_ACTION_CREATED: Object.freeze({ category: "DUE_ACTION", title: "Seguimiento creado" }),
    DUE_ACTION_RESCHEDULED: Object.freeze({ category: "DUE_ACTION", title: "Seguimiento reagendado" }),
    DUE_ACTION_COMPLETED: Object.freeze({ category: "DUE_ACTION", title: "Seguimiento completado" }),
    MESSAGE_DRAFT_GENERATED: Object.freeze({ category: "MESSAGE", title: "Borrador de mensaje generado" }),
    MESSAGE_DRAFT_EDITED: Object.freeze({ category: "MESSAGE", title: "Borrador de mensaje editado" }),
    MESSAGE_DRAFT_APPROVED: Object.freeze({ category: "MESSAGE", title: "Borrador de mensaje aprobado" }),
    MESSAGE_SENT_CONFIRMED: Object.freeze({ category: "MESSAGE", title: "Envío de mensaje confirmado" }),
    PROSPECT_REPLIED_CONFIRMED: Object.freeze({ category: "MESSAGE", title: "Respuesta del prospecto confirmada" }),
    OBJECTION_CAPTURED: Object.freeze({ category: "OBJECTION", title: "Objeción capturada" }),
    OBJECTION_ANALYSIS_GENERATED: Object.freeze({ category: "OBJECTION", title: "Análisis de objeción generado" }),
    OBJECTION_RESPONSE_GENERATED: Object.freeze({ category: "OBJECTION", title: "Respuesta a objeción generada" }),
    OBJECTION_RESPONSE_EDITED: Object.freeze({ category: "OBJECTION", title: "Respuesta a objeción editada" }),
    OBJECTION_RESPONSE_APPROVED: Object.freeze({ category: "OBJECTION", title: "Respuesta a objeción aprobada" }),
    OBJECTION_RESPONSE_USED: Object.freeze({ category: "OBJECTION", title: "Uso de respuesta a objeción confirmado" }),
    OBJECTION_OUTCOME_CONFIRMED: Object.freeze({ category: "OBJECTION", title: "Resultado de objeción confirmado" }),
    CALL_CONNECTED_CONFIRMED: Object.freeze({ category: "CALL", title: "Llamada conectada confirmada" }),
    CALL_NOT_ANSWERED_CONFIRMED: Object.freeze({ category: "CALL", title: "Llamada no contestada confirmada" }),
    CALL_CONTEXT_ADDED: Object.freeze({ category: "CALL", title: "Contexto de llamada añadido" }),
    QUOTE_STARTED: Object.freeze({ category: "QUOTE", title: "Cotización iniciada" }),
    QUOTE_PREPARED: Object.freeze({ category: "QUOTE", title: "Cotización preparada" }),
    QUOTE_REVIEWED: Object.freeze({ category: "QUOTE", title: "Cotización revisada" }),
    PRESENTATION_HELD_CONFIRMED: Object.freeze({ category: "PRESENTATION", title: "Presentación realizada confirmada" }),
    PRODUCT_QUESTION_CAPTURED: Object.freeze({ category: "PRESENTATION", title: "Pregunta de producto capturada" }),
    PROPOSAL_REQUESTED_CONFIRMED: Object.freeze({ category: "QUOTE", title: "Solicitud de propuesta confirmada" }),
  });
  const PROJECTION_KEYS = Object.freeze(["projection_version", "projection_id", "source_timeline_version", "source_timeline_id", "source_timeline_reference", "source_timeline_digest", "tenant_id", "correlation_id", "ordering", "item_count", "pending_count", "correction_count", "corrected_original_count", "oldest_activity_at", "newest_activity_at", "counts_by_category", "counts_by_confirmation", "counts_by_pending_state", "projection_digest", "items"]);
  const ITEM_KEYS = Object.freeze(["item_version", "activity_id", "display_position", "canonical_position", "projection_id", "tenant_id", "correlation_id", "event_id", "event_type", "category", "title", "occurred_at", "recorded_at", "appended_at", "effective_period", "actor", "subject", "source", "evidence_strength", "confirmation_state", "pending_state", "is_pending", "is_correction", "is_corrected", "correction_of", "correction_root_event_id", "correction_depth", "corrected_by_event_ids", "facts", "provenance_summary", "evidence_reference_ids"]);

  class ActivityProjectionError extends TypeError {
    constructor(code, message, details = null) { super(message); this.name = "ActivityProjectionError"; this.code = code; this.details = details; }
  }
  function error(code, message, details = null) { throw new ActivityProjectionError(code, message, details); }
  function isPlainObject(value) { if (!value || typeof value !== "object" || Array.isArray(value)) return false; const p = Object.getPrototypeOf(value); return p === Object.prototype || p === null; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function deepFreeze(value) { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.freeze(value); Object.values(value).forEach(deepFreeze); return value; }
  function stableValue(value) { if (Array.isArray(value)) return value.map(stableValue); if (isPlainObject(value)) { const result = {}; for (const key of Object.keys(value).sort()) result[key] = stableValue(value[key]); return result; } return value; }
  function stableStringify(value) { return JSON.stringify(stableValue(value)); }
  function stableDigest(value) { if (timelineContract._private && typeof timelineContract._private.stableDigest === "function") return timelineContract._private.stableDigest(value); const text = typeof value === "string" ? value : stableStringify(value); let hash = 2166136261; for (let i = 0; i < text.length; i += 1) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16).padStart(8, "0"); }
  function assertPlainObject(value, code, label) { if (!isPlainObject(value)) error(code, `${label} debe ser un objeto.`); }
  function assertAllowedKeys(value, allowed, code, label) { assertPlainObject(value, code, label); const unsupported = Object.keys(value).filter(key => !allowed.includes(key)).sort(); if (unsupported.length) error(code, `${label} contiene campos no autorizados.`, { unsupported_keys: unsupported }); }
  function assertRequiredKeys(value, required, code, label) { const missing = required.filter(key => value[key] === undefined).sort(); if (missing.length) error(code, `${label} no contiene todos los campos obligatorios.`, { missing_keys: missing }); }
  function requireOpaque(value, code, label, maximum = 240) { const normalized = String(value || "").trim(); if (!normalized || normalized.length > maximum || !/^[A-Za-z0-9._:@/-]+$/.test(normalized)) error(code, `${label} no es válido.`); return normalized; }
  function presentationFor(eventType) { const value = EVENT_PRESENTATION[eventType]; if (!value) error("ACTIVITY_EVENT_PRESENTATION_MISSING", "El evento no tiene presentación autorizada en Activity.", { event_type: eventType }); return value; }
  function pendingStateFor(confirmationState) { const value = { UNCONFIRMED: "PENDING_CONFIRMATION", REPORTED: "REVIEWABLE_REPORTED", CONFIRMED: "NONE", DISPUTED: "CONFLICT_REVIEW_REQUIRED" }[confirmationState]; if (!value) error("ACTIVITY_CONFIRMATION_STATE_INVALID", "El estado de confirmación no tiene una proyección autorizada.", { confirmation_state: confirmationState }); return value; }
  function deriveActivityProjectionId({ tenant_id, timeline_id } = {}) { const tenantId = requireOpaque(tenant_id, "ACTIVITY_PROJECTION_TENANT_INVALID", "El tenant de Activity"); const timelineId = requireOpaque(timeline_id, "ACTIVITY_PROJECTION_TIMELINE_INVALID", "La timeline de Activity"); return `ap_${stableDigest({ tenant_id: tenantId, timeline_id: timelineId, projection_version: PROJECTION_VERSION })}`; }
  function deriveActivityItemId({ projection_id, event_id } = {}) { const projectionId = requireOpaque(projection_id, "ACTIVITY_PROJECTION_ID_INVALID", "La proyección de Activity"); const eventId = requireOpaque(event_id, "ACTIVITY_EVENT_ID_INVALID", "El evento de Activity"); return `act_${stableDigest({ projection_id: projectionId, event_id: eventId })}`; }
  function emptyCounts(keys) { return Object.fromEntries(keys.map(key => [key, 0])); }

  function buildActivityProjection(timelineInput) {
    const timeline = timelineContract.assertCanonicalActivityTimeline(clone(timelineInput));
    const projectionId = deriveActivityProjectionId({ tenant_id: timeline.tenant_id, timeline_id: timeline.timeline_id });
    const countsByCategory = emptyCounts(CATEGORIES);
    const countsByConfirmation = emptyCounts(CONFIRMATION_STATES);
    const countsByPendingState = emptyCounts(PENDING_STATES);
    const items = [...timeline.entries].reverse().map((entry, index) => {
      const event = entry.ledger_record.canonical_event;
      const presentation = presentationFor(event.event_type);
      const pendingState = pendingStateFor(event.confirmation_state);
      countsByCategory[presentation.category] += 1;
      countsByConfirmation[event.confirmation_state] += 1;
      countsByPendingState[pendingState] += 1;
      return {
        item_version: ITEM_VERSION,
        activity_id: deriveActivityItemId({ projection_id: projectionId, event_id: event.event_id }),
        display_position: index + 1,
        canonical_position: entry.position,
        projection_id: projectionId,
        tenant_id: timeline.tenant_id,
        correlation_id: timeline.correlation_id,
        event_id: event.event_id,
        event_type: event.event_type,
        category: presentation.category,
        title: presentation.title,
        occurred_at: event.occurred_at,
        recorded_at: event.recorded_at,
        appended_at: entry.appended_at,
        effective_period: clone(event.effective_period),
        actor: clone(event.actor),
        subject: clone(event.subject),
        source: clone(event.source),
        evidence_strength: event.evidence_strength,
        confirmation_state: event.confirmation_state,
        pending_state: pendingState,
        is_pending: pendingState !== "NONE",
        is_correction: entry.is_correction,
        is_corrected: entry.is_corrected,
        correction_of: entry.correction_of,
        correction_root_event_id: entry.correction_root_event_id,
        correction_depth: entry.correction_depth,
        corrected_by_event_ids: [...entry.corrected_by_event_ids],
        facts: clone(event.payload),
        provenance_summary: {
          source_system: event.provenance.source_system,
          captured_via: event.provenance.captured_via,
          correction_reason_code: event.provenance.correction_reason_code || null,
          evidence_reference_count: event.provenance.evidence_references.length,
        },
        evidence_reference_ids: [...event.provenance.evidence_references],
      };
    });
    const digestInput = {
      projection_version: PROJECTION_VERSION,
      projection_id: projectionId,
      source_timeline_version: timeline.timeline_version,
      source_timeline_id: timeline.timeline_id,
      source_timeline_reference: timeline.timeline_reference,
      source_timeline_digest: timeline.timeline_digest,
      tenant_id: timeline.tenant_id,
      correlation_id: timeline.correlation_id,
      ordering: ORDERING,
      item_count: items.length,
      pending_count: items.filter(item => item.is_pending).length,
      correction_count: items.filter(item => item.is_correction).length,
      corrected_original_count: items.filter(item => item.is_corrected).length,
      oldest_activity_at: timeline.entries[0].occurred_at,
      newest_activity_at: timeline.entries[timeline.entries.length - 1].occurred_at,
      counts_by_category: countsByCategory,
      counts_by_confirmation: countsByConfirmation,
      counts_by_pending_state: countsByPendingState,
      items,
    };
    return { ...digestInput, projection_digest: stableDigest(digestInput) };
  }

  function normalizeProjection(input, timelineInput, { requireCanonicalShape = false } = {}) {
    assertAllowedKeys(input, PROJECTION_KEYS, "ACTIVITY_PROJECTION_FIELDS_INVALID", "La proyección de Activity");
    assertRequiredKeys(input, PROJECTION_KEYS, "ACTIVITY_PROJECTION_FIELDS_REQUIRED", "La proyección de Activity");
    if (!Array.isArray(input.items)) error("ACTIVITY_PROJECTION_ITEMS_INVALID", "Los elementos de Activity deben ser una lista.");
    input.items.forEach((item, index) => { assertAllowedKeys(item, ITEM_KEYS, "ACTIVITY_ITEM_FIELDS_INVALID", `El elemento Activity ${index + 1}`); assertRequiredKeys(item, ITEM_KEYS, "ACTIVITY_ITEM_FIELDS_REQUIRED", `El elemento Activity ${index + 1}`); });
    const normalized = buildActivityProjection(timelineInput);
    if (requireCanonicalShape && stableStringify(input) !== stableStringify(normalized)) error("ACTIVITY_PROJECTION_NOT_CANONICAL", "La proyección no coincide con su timeline fuente.");
    return normalized;
  }
  function createActivityProjection({ timeline } = {}) { return deepFreeze(buildActivityProjection(timeline)); }
  function assertActivityProjection(projection, { timeline } = {}) { return deepFreeze(normalizeProjection(clone(projection), timeline, { requireCanonicalShape: true })); }
  function validateActivityProjection(projection, { timeline } = {}) { try { assertActivityProjection(projection, { timeline }); return deepFreeze({ valid: true, errors: [] }); } catch (caught) { return deepFreeze({ valid: false, errors: [{ code: caught?.code || "ACTIVITY_PROJECTION_VALIDATION_FAILED", message: caught?.message || "La proyección de Activity no es válida.", details: caught?.details ? stableValue(caught.details) : null }] }); } }
  function rebuildActivityProjection({ projection, timeline } = {}) { assertActivityProjection(projection, { timeline }); return createActivityProjection({ timeline }); }
  function findActivityItem({ projection, timeline, event_id } = {}) { const canonicalProjection = assertActivityProjection(projection, { timeline }); const eventId = requireOpaque(event_id, "ACTIVITY_EVENT_ID_INVALID", "El evento de Activity"); return canonicalProjection.items.find(item => item.event_id === eventId) || null; }

  return deepFreeze({ PROJECTION_CONTRACT_VERSION, PROJECTION_VERSION, ITEM_VERSION, ORDERING, CATEGORIES, CONFIRMATION_STATES, PENDING_STATES, EVENT_PRESENTATION, ActivityProjectionError, deriveActivityProjectionId, deriveActivityItemId, createActivityProjection, assertActivityProjection, validateActivityProjection, rebuildActivityProjection, findActivityItem, _private: deepFreeze({ stableStringify, stableDigest, presentationFor, pendingStateFor, buildActivityProjection, deepFreeze }) });
});
