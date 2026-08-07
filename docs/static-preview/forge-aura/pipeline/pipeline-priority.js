const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_MS = 72 * 60 * 60 * 1000;

function parsed(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? new Date(time) : null;
}

function zonedParts(value) {
  const date = value instanceof Date ? value : parsed(value);
  if (!date) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function localDayKey(value) {
  const parts = zonedParts(value);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : "";
}

function formatRelativeDays(ms) {
  const days = Math.max(1, Math.floor(Math.abs(ms) / DAY_MS));
  return days === 1 ? "1 día" : `${days} días`;
}

function missingFields(record) {
  const prospect = record?.prospect || {};
  const missing = [];
  if (!String(prospect.fullName || record?.fullName || "").trim()) missing.push("nombre");
  if (!String(prospect.source || record?.sourceValue || "").trim()) missing.push("fuente");
  if (!String(prospect.initialContext || "").trim()) missing.push("contexto inicial");
  if (!String(record?.phone || prospect.phone || prospect.whatsapp || prospect.email || "").trim()) {
    missing.push("medio de contacto");
  }
  return missing;
}

function nextBusinessDay(now) {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 0 || date.getDay() === 6);
  return date;
}

function dateValue(date) {
  return localDayKey(date);
}

function timeValue(date) {
  const parts = zonedParts(date);
  return parts ? `${parts.hour}:${parts.minute}` : "";
}

export function recordEvidence(record, nowValue = new Date()) {
  const now = new Date(nowValue);
  const due = parsed(record?.nextCommitment?.dueAt);
  const latest = parsed(record?.latestActivity?.occurredAt);
  const timelineConnected = record?.timelineState !== "UNAVAILABLE";
  const missing = missingFields(record);
  const overdue = Boolean(due && due.getTime() < now.getTime() && localDayKey(due) !== localDayKey(now));
  const dueToday = Boolean(due && localDayKey(due) === localDayKey(now));
  const stale = Boolean(
    timelineConnected &&
    latest &&
    now.getTime() - latest.getTime() >= STALE_MS,
  );
  const noVerifiedActivity = Boolean(timelineConnected && !latest);

  return Object.freeze({
    due,
    latest,
    overdue,
    dueToday,
    noCommitment: !due,
    stale,
    noVerifiedActivity,
    missing,
    timelineConnected,
  });
}

export function attentionForRecord(record, nowValue = new Date()) {
  const evidence = recordEvidence(record, nowValue);
  const name = record?.fullName || "Prospecto";
  const source = record?.nextCommitment?.dueAt ? "Compromiso productivo" : "Registro productivo";

  if (evidence.overdue) {
    return Object.freeze({
      id: `overdue:${record.id}`,
      order: 10,
      kind: "overdue",
      title: "Compromiso vencido",
      reason: `${name} tenía un compromiso para ${evidence.due.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}.`,
      consequence: "Conviene definir una nueva fecha para que el seguimiento no quede sin continuidad.",
      recordId: record.id,
      recordName: name,
      evidence: Object.freeze({
        source,
        label: "Fecha registrada",
        value: evidence.due.toISOString(),
      }),
      action: Object.freeze({ type: "calendar", label: "Reprogramar seguimiento" }),
    });
  }

  if (evidence.dueToday) {
    return Object.freeze({
      id: `today:${record.id}`,
      order: 20,
      kind: "today",
      title: "Seguimiento para hoy",
      reason: `${name} tiene un compromiso registrado para hoy.`,
      consequence: "Atenderlo hoy mantiene la continuidad ya acordada.",
      recordId: record.id,
      recordName: name,
      evidence: Object.freeze({
        source,
        label: "Fecha registrada",
        value: evidence.due.toISOString(),
      }),
      action: Object.freeze({ type: "calendar", label: "Preparar seguimiento" }),
    });
  }

  if (evidence.noCommitment) {
    return Object.freeze({
      id: `no-commitment:${record.id}`,
      order: 30,
      kind: "no_commitment",
      title: "Sin próximo compromiso",
      reason: `${name} no tiene una siguiente fecha registrada.`,
      consequence: "El registro puede quedar sin un paso concreto si no se define cuándo continuar.",
      recordId: record.id,
      recordName: name,
      evidence: Object.freeze({
        source: "Prospecto productivo",
        label: "Próximo compromiso",
        value: "No registrado",
      }),
      action: Object.freeze({ type: "calendar", label: "Programar seguimiento" }),
    });
  }

  if (evidence.stale) {
    const elapsed = new Date(nowValue).getTime() - evidence.latest.getTime();
    return Object.freeze({
      id: `stale:${record.id}`,
      order: 40,
      kind: "stale",
      title: "Actividad sin actualización reciente",
      reason: `${name} lleva ${formatRelativeDays(elapsed)} sin actividad verificada.`,
      consequence: "La señal se muestra para revisar si el contexto comercial sigue vigente.",
      recordId: record.id,
      recordName: name,
      evidence: Object.freeze({
        source: "Timeline productivo",
        label: "Última actividad verificada",
        value: evidence.latest.toISOString(),
      }),
      action: Object.freeze({
        type: String(record?.phone || record?.prospect?.whatsapp || "") ? "whatsapp" : "timeline",
        label: String(record?.phone || record?.prospect?.whatsapp || "") ? "Contactar" : "Revisar Timeline",
      }),
    });
  }

  if (evidence.noVerifiedActivity) {
    return Object.freeze({
      id: `no-activity:${record.id}`,
      order: 50,
      kind: "no_activity",
      title: "Sin actividad verificada",
      reason: `${name} no tiene eventos disponibles en el Timeline productivo.`,
      consequence: "Revisar el registro permite decidir si corresponde contactar o completar contexto.",
      recordId: record.id,
      recordName: name,
      evidence: Object.freeze({
        source: "Timeline productivo",
        label: "Actividad verificada",
        value: "No disponible en el Timeline",
      }),
      action: Object.freeze({
        type: String(record?.phone || record?.prospect?.whatsapp || "") ? "whatsapp" : "edit",
        label: String(record?.phone || record?.prospect?.whatsapp || "") ? "Contactar" : "Completar información",
      }),
    });
  }

  if (evidence.missing.length) {
    return Object.freeze({
      id: `incomplete:${record.id}`,
      order: 60,
      kind: "incomplete",
      title: "Información incompleta",
      reason: `${name} necesita completar: ${evidence.missing.join(", ")}.`,
      consequence: "Completar esos datos facilita el siguiente contacto y mantiene explicable el registro.",
      recordId: record.id,
      recordName: name,
      evidence: Object.freeze({
        source: "Prospecto productivo",
        label: "Campos faltantes",
        value: evidence.missing.join(", "),
      }),
      action: Object.freeze({ type: "edit", label: "Completar información" }),
    });
  }

  return null;
}

export function deriveAttentionItems(records, nowValue = new Date(), limit = 3) {
  return Object.freeze(
    records
      .map(record => attentionForRecord(record, nowValue))
      .filter(Boolean)
      .sort((a, b) => a.order - b.order || a.recordName.localeCompare(b.recordName, "es"))
      .slice(0, Math.max(0, limit)),
  );
}

export function nextBestAction(record, nowValue = new Date()) {
  const signal = attentionForRecord(record, nowValue);
  if (signal) {
    return Object.freeze({
      type: signal.action.type,
      label: signal.action.label,
      reason: signal.reason,
      evidenceKind: signal.kind,
    });
  }

  const evidence = recordEvidence(record, nowValue);
  if (evidence.due) {
    return Object.freeze({
      type: "timeline",
      label: "Revisar contexto",
      reason: `Existe un compromiso futuro para ${evidence.due.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}.`,
      evidenceKind: "future_commitment",
    });
  }

  return null;
}

export function matchesQuickFilter(record, quick, nowValue = new Date()) {
  if (!quick) return true;
  const evidence = recordEvidence(record, nowValue);
  if (quick === "attention") return Boolean(attentionForRecord(record, nowValue));
  if (quick === "today") return evidence.dueToday;
  if (quick === "overdue") return evidence.overdue;
  if (quick === "no_commitment") return evidence.noCommitment;
  if (quick === "stale") return evidence.stale || evidence.noVerifiedActivity;
  if (quick === "incomplete") return evidence.missing.length > 0;
  return true;
}

function dateTimeValue(value, fallback) {
  const date = parsed(value);
  return date ? date.getTime() : fallback;
}

export function sortRecords(records, sort, nowValue = new Date()) {
  const copy = [...records];
  if (sort === "next_commitment") {
    return copy.sort((a, b) =>
      dateTimeValue(a?.nextCommitment?.dueAt, Number.POSITIVE_INFINITY) -
      dateTimeValue(b?.nextCommitment?.dueAt, Number.POSITIVE_INFINITY));
  }
  if (sort === "recent_activity") {
    return copy.sort((a, b) =>
      dateTimeValue(b?.latestActivity?.occurredAt, Number.NEGATIVE_INFINITY) -
      dateTimeValue(a?.latestActivity?.occurredAt, Number.NEGATIVE_INFINITY));
  }
  if (sort === "name") {
    return copy.sort((a, b) => String(a?.fullName || "").localeCompare(String(b?.fullName || ""), "es"));
  }
  if (sort === "stage") {
    return copy.sort((a, b) => String(a?.stageLabel || "").localeCompare(String(b?.stageLabel || ""), "es"));
  }
  return copy.sort((a, b) => {
    const left = attentionForRecord(a, nowValue)?.order ?? 999;
    const right = attentionForRecord(b, nowValue)?.order ?? 999;
    return left - right || String(a?.fullName || "").localeCompare(String(b?.fullName || ""), "es");
  });
}

export function followupDefaults(record, nowValue = new Date()) {
  const now = new Date(nowValue);
  const due = parsed(record?.nextCommitment?.dueAt);
  const usableExisting = Boolean(due && due.getTime() >= now.getTime());

  if (usableExisting) {
    return Object.freeze({
      date: dateValue(due),
      time: timeValue(due),
      durationMinutes: 45,
      reason: "Usamos la fecha y hora del compromiso productivo ya registrado. Puedes modificarlas antes de abrir el borrador.",
      source: "existing_commitment",
    });
  }

  const suggested = nextBusinessDay(now);
  return Object.freeze({
    date: dateValue(suggested),
    time: "",
    durationMinutes: 45,
    reason: "No hay un compromiso futuro utilizable; proponemos el siguiente día hábil. La hora queda vacía porque Forge no tiene contexto suficiente para sugerirla.",
    source: "next_business_day",
  });
}

export function validateContactPhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if ((raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) || digits.length === 10) return "";
  return "Escribe 10 dígitos o incluye el código internacional.";
}
