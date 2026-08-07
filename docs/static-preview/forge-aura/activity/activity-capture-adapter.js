import { createPipelineAdapter } from "../pipeline/pipeline-adapter-pages-v1.js";

const TYPE_MAP = Object.freeze({
  REFERRAL_RECEIVED: { label: "Referido recibido", eventType: "REFERRAL_RECEIVED", subjectType: "ACTIVITY", resultOptions: ["Recibido", "Pendiente de contacto"] },
  CALL_COMPLETED: { label: "Llamada realizada", eventType: "CALL_COMPLETED", subjectType: "ACTIVITY", resultOptions: ["Conversación realizada", "Requiere seguimiento"] },
  APPOINTMENT_SCHEDULED: { label: "Cita agendada", eventType: "APPOINTMENT_SCHEDULED", subjectType: "APPOINTMENT", resultOptions: ["Confirmada", "Pendiente de confirmar"] },
  APPOINTMENT_HELD: { label: "Cita inicial realizada", eventType: "APPOINTMENT_HELD", subjectType: "APPOINTMENT", appointmentPurpose: "INITIAL", resultOptions: ["Realizada", "Requiere seguimiento"] },
  CLOSING_APPOINTMENT_HELD: { label: "Cita de cierre realizada", eventType: "APPOINTMENT_HELD", subjectType: "APPOINTMENT", appointmentPurpose: "CLOSING", resultOptions: ["Realizada", "Decisión pendiente"] },
  FOLLOW_UP_COMPLETED: { label: "Seguimiento realizado", eventType: "CALL_COMPLETED", subjectType: "ACTIVITY", resultOptions: ["Seguimiento realizado", "Requiere seguimiento"] },
});

function opaque(prefix, prospectId, occurredAt) {
  const stamp = String(occurredAt || new Date().toISOString()).replace(/[^0-9]/g, "").slice(0, 14);
  return `${prefix}:${prospectId}:${stamp}`;
}

function prospectName(card) {
  return card?.prospect?.fullName || card?.fullName || card?.name || "Prospecto sin nombre";
}

export async function createHumanActivityCaptureAdapter({ client } = {}) {
  if (!client) throw new Error("ACTIVITY_CAPTURE_CLIENT_REQUIRED");
  const pipeline = await createPipelineAdapter({ client });

  async function listPeople() {
    const cards = await pipeline.reload();
    return Object.freeze(cards.map((card) => {
      const id = card.id || card.prospect?.id;
      if (!id) return null;
      return Object.freeze({
        id: String(id),
        name: prospectName(card),
        stage: card.stageLabel || card.status || "Sin etapa",
      });
    }).filter(Boolean));
  }

  function definitions() {
    return Object.freeze(Object.entries(TYPE_MAP).map(([id, definition]) => Object.freeze({ id, ...definition })));
  }

  function toCanonicalInput(values) {
    const definition = TYPE_MAP[values.activityType];
    if (!definition) throw new Error("ACTIVITY_HUMAN_TYPE_INVALID");
    const personId = String(values.personId || "").trim();
    if (!personId) throw new Error("ACTIVITY_PERSON_REQUIRED");
    const occurredAt = new Date(values.occurredAt || Date.now()).toISOString();
    const subjectId = opaque(definition.subjectType === "APPOINTMENT" ? "appointment" : "activity", personId, occurredAt);
    let payload;
    if (definition.eventType === "REFERRAL_RECEIVED") {
      payload = { activity_reference: subjectId, referral_reference: opaque("referral", personId, occurredAt), prospect_reference: personId };
    } else if (definition.eventType === "CALL_COMPLETED") {
      payload = { activity_reference: subjectId, contact_reference: personId, prospect_reference: personId };
    } else if (definition.eventType === "APPOINTMENT_SCHEDULED") {
      const startsAt = occurredAt;
      const endsAt = new Date(Date.parse(occurredAt) + 60 * 60 * 1000).toISOString();
      payload = { appointment_reference: subjectId, starts_at: startsAt, ends_at: endsAt, appointment_purpose: values.purpose === "Cierre" ? "CLOSING" : "INITIAL" };
    } else if (definition.eventType === "APPOINTMENT_HELD") {
      payload = { appointment_reference: subjectId, outcome_confirmed_at: occurredAt, appointment_purpose: definition.appointmentPurpose };
    } else {
      throw new Error("ACTIVITY_CAPTURE_TYPE_NOT_IMPLEMENTED");
    }
    return Object.freeze({
      eventType: definition.eventType,
      subjectType: definition.subjectType,
      subjectId,
      occurredAt,
      payload: Object.freeze(payload),
      confirmation: Object.freeze({
        personId,
        personName: String(values.personName || "Prospecto"),
        activityLabel: definition.label,
        result: String(values.result || "Confirmado"),
        channel: String(values.channel || "Otro"),
        purpose: String(values.purpose || "Seguimiento"),
        note: String(values.note || "").trim(),
        nextAction: String(values.nextAction || "Revisar siguiente paso"),
        followUpAt: values.followUpAt ? new Date(values.followUpAt).toISOString() : null,
      }),
    });
  }

  return Object.freeze({ listPeople, definitions, toCanonicalInput });
}
