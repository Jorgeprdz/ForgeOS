export const MANUAL_ACTIVITY_CAPTURE_TYPES = Object.freeze({
  REFERRAL_RECEIVED: "REFERRAL_RECEIVED",
  CALL_COMPLETED: "CALL_COMPLETED",
  INITIAL_APPOINTMENT_SCHEDULED: "INITIAL_APPOINTMENT_SCHEDULED",
  CLOSING_APPOINTMENT_SCHEDULED: "CLOSING_APPOINTMENT_SCHEDULED",
  INITIAL_APPOINTMENT_HELD: "INITIAL_APPOINTMENT_HELD",
  CLOSING_APPOINTMENT_HELD: "CLOSING_APPOINTMENT_HELD",
  CONTEXT_NOTE: "CONTEXT_NOTE",
});

export const MANUAL_ACTIVITY_CAPTURE_OPTIONS = Object.freeze([
  Object.freeze({ value: "REFERRAL_RECEIVED", label: "Referido recibido", countable: true }),
  Object.freeze({ value: "CALL_COMPLETED", label: "Llamada completada", countable: true }),
  Object.freeze({ value: "INITIAL_APPOINTMENT_SCHEDULED", label: "Cita inicial agendada", countable: true }),
  Object.freeze({ value: "CLOSING_APPOINTMENT_SCHEDULED", label: "Cita de cierre agendada", countable: true }),
  Object.freeze({ value: "INITIAL_APPOINTMENT_HELD", label: "Cita inicial realizada", countable: true }),
  Object.freeze({ value: "CLOSING_APPOINTMENT_HELD", label: "Cita de cierre realizada", countable: true }),
  Object.freeze({ value: "CONTEXT_NOTE", label: "Seguimiento o nota", countable: false }),
]);

const COUNTABLE = new Set(MANUAL_ACTIVITY_CAPTURE_OPTIONS.filter(item => item.countable).map(item => item.value));
const SCHEDULED = new Set(["INITIAL_APPOINTMENT_SCHEDULED", "CLOSING_APPOINTMENT_SCHEDULED"]);

function required(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new TypeError(`${label} es obligatorio.`);
  return normalized;
}

function iso(value, label) {
  const normalized = required(value, label);
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) throw new TypeError(`${label} no es válida.`);
  return date.toISOString();
}

function appointmentPurpose(captureType) {
  return captureType.startsWith("INITIAL_") ? "INITIAL" : "CLOSING";
}

export function isCountableManualActivity(captureType) {
  return COUNTABLE.has(captureType);
}

export function requiresAppointmentDuration(captureType) {
  return SCHEDULED.has(captureType);
}

export function buildManualActivityFact({
  captureType,
  relatedReference,
  occurredAt,
  durationMinutes = 60,
  activityReference,
  appointmentReference,
  referralReference,
  notes = null,
} = {}) {
  const selected = required(captureType, "El tipo de actividad");
  if (!MANUAL_ACTIVITY_CAPTURE_OPTIONS.some(item => item.value === selected)) {
    throw new TypeError("El tipo de actividad no está autorizado.");
  }
  const related = required(relatedReference, "La persona relacionada");
  const occurred = iso(occurredAt, "La fecha y hora");
  const activityRef = required(activityReference, "La referencia de actividad");

  if (selected === "REFERRAL_RECEIVED") {
    return Object.freeze({
      eventType: "REFERRAL_RECEIVED",
      subject: Object.freeze({ type: "ACTIVITY", id: activityRef }),
      payload: Object.freeze({
        activity_reference: activityRef,
        referral_reference: required(referralReference, "La referencia de referido"),
      }),
      occurredAt: occurred,
      privacyClass: "OPERATIONAL",
      countable: true,
    });
  }

  if (selected === "CALL_COMPLETED") {
    return Object.freeze({
      eventType: "CALL_COMPLETED",
      subject: Object.freeze({ type: "ACTIVITY", id: activityRef }),
      payload: Object.freeze({
        activity_reference: activityRef,
        contact_reference: related,
      }),
      occurredAt: occurred,
      privacyClass: "OPERATIONAL",
      countable: true,
    });
  }

  if (SCHEDULED.has(selected)) {
    const minutes = Number(durationMinutes);
    if (!Number.isInteger(minutes) || minutes < 15 || minutes > 240) {
      throw new TypeError("La duración debe estar entre 15 y 240 minutos.");
    }
    const end = new Date(new Date(occurred).getTime() + minutes * 60000).toISOString();
    const appointmentRef = required(appointmentReference, "La referencia de cita");
    return Object.freeze({
      eventType: "APPOINTMENT_SCHEDULED",
      subject: Object.freeze({ type: "APPOINTMENT", id: appointmentRef }),
      payload: Object.freeze({
        appointment_reference: appointmentRef,
        starts_at: occurred,
        ends_at: end,
        appointment_purpose: appointmentPurpose(selected),
      }),
      occurredAt: occurred,
      privacyClass: "OPERATIONAL",
      countable: true,
    });
  }

  if (selected === "INITIAL_APPOINTMENT_HELD" || selected === "CLOSING_APPOINTMENT_HELD") {
    const appointmentRef = required(appointmentReference, "La referencia de cita");
    return Object.freeze({
      eventType: "APPOINTMENT_HELD",
      subject: Object.freeze({ type: "APPOINTMENT", id: appointmentRef }),
      payload: Object.freeze({
        appointment_reference: appointmentRef,
        outcome_confirmed_at: occurred,
        appointment_purpose: appointmentPurpose(selected),
      }),
      occurredAt: occurred,
      privacyClass: "OPERATIONAL",
      countable: true,
    });
  }

  const note = String(notes || "").trim();
  if (!note) throw new TypeError("Escribe el contexto que quieres guardar.");
  if (note.length > 500) throw new TypeError("La nota no puede superar 500 caracteres.");
  return Object.freeze({
    eventType: "ACTIVITY_CONTEXT_ADDED",
    subject: Object.freeze({ type: "ACTIVITY", id: activityRef }),
    payload: Object.freeze({
      activity_reference: activityRef,
      context_reference: related,
      capture_mode: "MANUAL_CONFIRMED",
      related_reference: related,
      activity_type: "FOLLOW_UP",
      occurred_at: occurred,
      notes: note,
    }),
    occurredAt: occurred,
    privacyClass: "PRIVATE",
    countable: false,
  });
}
