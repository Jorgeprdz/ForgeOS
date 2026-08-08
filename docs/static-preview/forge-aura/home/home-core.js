export const HOME_STATES = Object.freeze({
  LOADING: "LOADING",
  READY: "READY",
  EMPTY: "EMPTY",
  PARTIAL: "PARTIAL",
  STALE: "STALE",
  SOURCE_UNAVAILABLE: "SOURCE_UNAVAILABLE",
  NOT_CONNECTED: "NOT_CONNECTED",
  SESSION_REQUIRED: "SESSION_REQUIRED",
  BLOCKED_BY_MISSING_EVIDENCE: "BLOCKED_BY_MISSING_EVIDENCE",
});

export const AGENDA_SECTIONS = Object.freeze([
  "OVERDUE",
  "TODAY",
  "UPCOMING_7_DAYS",
  "WAITING",
  "UNSCHEDULED_ACTIVE_CASES",
]);

const POLICY_SIGNAL_MAP = Object.freeze({
  UNCONFIRMED_PAYMENT_EVIDENCE: "PAYMENT_CONFIRMATION_REQUIRED",
  EXPECTED_PAYMENT: "DUE_SOON",
  POSSIBLE_LATE_PAYMENT: "POSSIBLE_LATE_PAYMENT",
  POLICY_END_OR_RENEWAL_REVIEW: "POLICY_RENEWAL_DUE",
  POLICY_YEAR_TRANSITION: "POLICY_RENEWAL_DUE",
  INCOMPLETE_POLICY_DATA: "DUE_SOON",
});

export function validDate(value, fallback = new Date()) {
  const candidate = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(candidate.getTime()) ? new Date(fallback) : candidate;
}

export function resolveBrowserTimeZone(intl = globalThis.Intl) {
  try {
    const value = intl?.DateTimeFormat?.().resolvedOptions?.().timeZone;
    return typeof value === "string" && value.trim() ? value.trim() : "UTC";
  } catch {
    return "UTC";
  }
}

export function localHour(value = new Date(), timeZone = resolveBrowserTimeZone()) {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(validDate(value)).find(item => item.type === "hour");
  return Number(part?.value || 0);
}

export function greetingFor(value = new Date(), timeZone = resolveBrowserTimeZone()) {
  const hour = localHour(value, timeZone);
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function firstNameFor(user) {
  const metadata = user?.user_metadata || {};
  const source = metadata.given_name
    || metadata.full_name
    || metadata.name
    || user?.email?.split("@")[0]
    || "Usuario";
  const cleaned = String(source).trim().replace(/[._-]+/g, " ");
  return cleaned.split(/\s+/).filter(Boolean)[0] || "Usuario";
}

export function formatLocalDay(value = new Date(), timeZone = resolveBrowserTimeZone()) {
  const text = new Intl.DateTimeFormat("es-MX", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(validDate(value));
  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : "";
}

export function formatLocalTime(value, timeZone = resolveBrowserTimeZone()) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Hora no disponible";
  return new Intl.DateTimeFormat("es-MX", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function buildAgendaInputFromPipeline(cards = []) {
  const actions = [];
  const activeCases = [];
  for (const card of Array.isArray(cards) ? cards : []) {
    if (!card?.id || card.status === "client") continue;
    const prospectReference = String(card.id);
    const nextActionAt = card.nextCommitment?.dueAt || null;
    if (nextActionAt) {
      actions.push(Object.freeze({
        actionReference: `PIPELINE:${prospectReference}`,
        prospectReference,
        personDisplayName: card.fullName || "Persona sin nombre disponible",
        nextActionType: card.nextCommitment?.type || "Seguimiento",
        nextActionAt,
        status: "OPEN",
        commercialPriority: Number.isFinite(Number(card.priority)) ? Number(card.priority) : null,
        sourceAuthority: "PIPELINE",
        sourceState: card.timelineState || "UNKNOWN",
      }));
    }
    activeCases.push(Object.freeze({
      caseReference: `PIPELINE:${prospectReference}`,
      prospectReference,
      personDisplayName: card.fullName || "Persona sin nombre disponible",
      active: true,
      caseResolution: nextActionAt ? "NEXT_ACTION_SCHEDULED" : null,
      commercialPriority: Number.isFinite(Number(card.priority)) ? Number(card.priority) : null,
      sourceAuthority: "PIPELINE",
      sourceState: card.timelineState || "UNKNOWN",
    }));
  }
  return Object.freeze({ actions: Object.freeze(actions), activeCases: Object.freeze(activeCases) });
}

export function normalizeRadarForOrchestrator(radar = {}) {
  const items = Array.isArray(radar?.items) ? radar.items : [];
  const signals = items.flatMap(item => {
    const signalType = POLICY_SIGNAL_MAP[item?.signalType];
    if (!signalType) return [];
    return [Object.freeze({
      ...item,
      originalSignalType: item.signalType,
      signalType,
      evidenceRefs: [item.sourceRecordReference, item.signalReference].filter(Boolean),
    })];
  });
  return Object.freeze({ ...radar, signals: Object.freeze(signals) });
}

export function selectCarteraAttention(radar = {}, limit = 3) {
  const source = Array.isArray(radar?.focusItems)
    ? radar.focusItems
    : Array.isArray(radar?.items) ? radar.items : [];
  return Object.freeze(source.slice(0, Math.max(0, limit)).map(item => Object.freeze({
    signalReference: item.signalReference || null,
    personReference: item.personReference || null,
    personDisplayName: item.personDisplayName || "Cliente por identificar",
    policyReference: item.policyReference || null,
    signalType: item.signalType || "REVIEW_REQUIRED",
    eventDate: item.eventDate || null,
    horizon: item.horizon || null,
    truthClass: item.truthClass || null,
    sourceAuthority: item.sourceAuthority || null,
    whyNow: item.whyNow || "Revisión requerida por la fuente de Cartera.",
    uncertainty: item.uncertainty || "Sin detalle de incertidumbre disponible.",
    smallestUsefulAction: item.smallestUsefulAction || "Abrir Cartera y revisar evidencia.",
    advisorConfirmationRequired: item.advisorConfirmationRequired !== false,
  })));
}

export function sectionOf(agenda, id) {
  return agenda?.sections?.find(section => section.id === id) || Object.freeze({ id, count: 0, items: Object.freeze([]) });
}

export function primaryAgendaItem(agenda) {
  return sectionOf(agenda, "OVERDUE").items?.[0]
    || sectionOf(agenda, "TODAY").items?.[0]
    || sectionOf(agenda, "UNSCHEDULED_ACTIVE_CASES").items?.[0]
    || null;
}

export function briefingFromStack(stack, agenda = null) {
  const widget = stack?.primary || null;
  if (widget && ["READY", "PARTIAL", "STALE", "BLOCKED_BY_MISSING_EVIDENCE"].includes(widget.state)) {
    return Object.freeze({
      state: widget.state,
      source: "SMART_WIDGET_ORCHESTRATOR",
      title: widget.title || "Revisa la prioridad principal",
      detail: widget.whyNow || widget.subtitle || "Forge encontró una señal que requiere revisión.",
      actionLabel: widget.reviewAction?.label || "Ver contexto",
      deepLink: widget.deepLink || null,
      confidence: widget.confidence || null,
      uncertainty: Array.isArray(widget.uncertainty) ? widget.uncertainty : [],
      sourceAuthorities: Array.isArray(widget.sourceAuthorities) ? widget.sourceAuthorities : [],
    });
  }
  const agendaItem = primaryAgendaItem(agenda);
  if (agendaItem) {
    const name = agendaItem.personDisplayName || "esta persona";
    const type = agendaItem.nextActionType || "seguimiento";
    return Object.freeze({
      state: "PARTIAL",
      source: "CANONICAL_AGENDA_PROJECTION",
      title: `Empieza por ${type.toLocaleLowerCase("es-MX")} con ${name}`,
      detail: "Agenda confirma que este compromiso requiere atención; no se asignó una probabilidad ni una urgencia adicional.",
      actionLabel: "Abrir Pipeline",
      deepLink: "?route=pipeline",
      confidence: "EVIDENCE_BOUND",
      uncertainty: [],
      sourceAuthorities: ["PIPELINE", "AGENDA_READ_MODEL"],
    });
  }
  return Object.freeze({
    state: stack?.stackStatus || HOME_STATES.BLOCKED_BY_MISSING_EVIDENCE,
    source: "NO_ELIGIBLE_PRIORITY",
    title: "No hay una siguiente acción confiable todavía",
    detail: "Forge no convertirá una fuente ausente, un dato desconocido o una inferencia en una instrucción.",
    actionLabel: "Revisar mi día",
    deepLink: null,
    confidence: "LOW",
    uncertainty: ["missing_or_incomplete_operational_evidence"],
    sourceAuthorities: [],
  });
}

export function rhythmFromStack(stack) {
  const inventory = Array.isArray(stack?.inventory) ? stack.inventory : [];
  const activity = inventory.find(widget => widget.widgetFamily === "ACTIVITY_PROGRESS_WIDGET") || null;
  const monthlyGoal = inventory.find(widget => widget.widgetFamily === "MONTHLY_POLICY_GOAL_WIDGET") || null;
  const useful = widget => widget && ["READY", "PARTIAL", "STALE"].includes(widget.state);
  const signal = useful(activity) ? activity : useful(monthlyGoal) ? monthlyGoal : null;
  const supporting = [activity, monthlyGoal]
    .filter(widget => useful(widget) && widget?.widgetId !== signal?.widgetId)
    .slice(0, 2);
  return Object.freeze({
    state: signal ? signal.state : HOME_STATES.SOURCE_UNAVAILABLE,
    primary: signal,
    supporting: Object.freeze(supporting),
  });
}

export function mickHonestState(source = null) {
  if (source && typeof source === "object" && source.message && source.detail) {
    return Object.freeze({
      state: source.status || "READY",
      message: source.message,
      detail: source.detail,
      actionLabel: source.actionLabel || "Ver mi patrón",
      actionRoute: source.actionRoute || "actividad",
      evidenceBound: true,
    });
  }
  return Object.freeze({
    state: HOME_STATES.BLOCKED_BY_MISSING_EVIDENCE,
    message: "Mick todavía no tiene evidencia disponible en Inicio para mostrar un patrón confiable.",
    detail: "Cuando exista una lectura respaldada por actividad observable, aparecerá aquí sin inferir disciplina, motivación ni carácter.",
    actionLabel: "Ver actividad",
    actionRoute: "actividad",
    evidenceBound: false,
  });
}

export function homeAttentionCount({ agenda, radar } = {}) {
  if (!agenda || !radar) return null;
  const overdue = Number(sectionOf(agenda, "OVERDUE").count || 0);
  const today = Number(sectionOf(agenda, "TODAY").count || 0);
  const cartera = Array.isArray(radar?.focusItems) ? radar.focusItems.length : Array.isArray(radar?.items) ? radar.items.length : 0;
  return overdue + today + cartera;
}
