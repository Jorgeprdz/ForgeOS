function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function daysUntil(value, now = new Date()) {
  const date = parseDate(value);
  if (!date) return null;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - start) / (1000 * 60 * 60 * 24));
}

function normalizeTimeline(inputTimeline) {
  if (Array.isArray(inputTimeline)) return inputTimeline;
  if (Array.isArray(inputTimeline?.timeline)) return inputTimeline.timeline;
  return [];
}

function priorityRank(priority) {
  const rank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  return rank[priority] || 0;
}

function eventRank(type) {
  const rank = {
    PAYMENT_OVERDUE: 90,
    PAYMENT_DUE: 80,
    POLICY_RENEWAL: 70,
    LIFE_EVENT: 65,
    POLICY_REVIEW: 60,
    REFERRAL_OPPORTUNITY: 50,
    BIRTHDAY: 40,
    ANNIVERSARY: 30
  };

  return rank[type] || 0;
}

function selectRelationshipEvent(timeline = [], now = new Date()) {
  const candidates = timeline
    .map(event => ({
      ...event,
      daysUntil: daysUntil(event.date, now)
    }))
    .filter(event => event.daysUntil === null || event.daysUntil >= 0 || event.type === "PAYMENT_OVERDUE")
    .sort((a, b) => {
      const priorityDiff = priorityRank(b.priority) - priorityRank(a.priority);
      if (priorityDiff !== 0) return priorityDiff;

      const eventDiff = eventRank(b.type) - eventRank(a.type);
      if (eventDiff !== 0) return eventDiff;

      if (a.daysUntil === null && b.daysUntil === null) return 0;
      if (a.daysUntil === null) return 1;
      if (b.daysUntil === null) return -1;

      return a.daysUntil - b.daysUntil;
    });

  return candidates[0] || null;
}

function hasRecentContact(history = [], now = new Date()) {
  return history.some(item => {
    const date = parseDate(item.date || item.createdAt);
    if (!date) return false;
    const diff = daysUntil(date, now);
    return diff !== null && diff >= -3 && diff <= 0;
  });
}

function resolveChannel({ action, client = {}, priority }) {
  if (priority === "CRITICAL") return "CALL";
  if (action === "SCHEDULE_REVIEW") return "MEETING";
  if (action === "RENEWAL_REVIEW") return "CALL";
  if (action === "ASK_FOR_REFERRALS") return client.preferredChannel || "WHATSAPP";
  if (action === "PAYMENT_REMINDER") return "WHATSAPP";
  if (action === "CALL_CLIENT") return "CALL";
  if (client.preferredChannel) return client.preferredChannel;
  return "WHATSAPP";
}

function resolveTiming({ priority, days }) {
  if (priority === "CRITICAL") return "TODAY";
  if (days !== null && days <= 1) return "TODAY";
  if (priority === "HIGH") return "THIS_WEEK";
  if (days !== null && days <= 7) return "THIS_WEEK";
  return "THIS_MONTH";
}

function mapEventToAction(event, client = {}, now = new Date()) {
  if (!event) {
    return {
      nextAction: "NO_ACTION",
      actionReason: "No hay eventos relacionales relevantes hoy.",
      priority: "LOW",
      urgency: "THIS_MONTH",
      recommendedChannel: client.preferredChannel || "WHATSAPP",
      suggestedTiming: "THIS_MONTH",
      relationshipValue: "NONE"
    };
  }

  const days = event.daysUntil ?? daysUntil(event.date, now);

  const map = {
    BIRTHDAY: {
      nextAction: "CHECK_IN",
      relationshipValue: "CELEBRATE",
      reason: "Cumpleaños próximo; conviene contacto humano no comercial."
    },
    POLICY_RENEWAL: {
      nextAction: "RENEWAL_REVIEW",
      relationshipValue: "RETAIN",
      reason: "Renovación próxima; conviene revisar continuidad y riesgos."
    },
    POLICY_REVIEW: {
      nextAction: "SCHEDULE_REVIEW",
      relationshipValue: "SERVICE",
      reason: "Hay oportunidad de revisión de póliza."
    },
    PAYMENT_DUE: {
      nextAction: "PAYMENT_REMINDER",
      relationshipValue: "PROTECT",
      reason: "Pago próximo; conviene prevenir lapse o fricción."
    },
    PAYMENT_OVERDUE: {
      nextAction: "PAYMENT_REMINDER",
      relationshipValue: "PROTECT",
      reason: "Pago vencido; requiere atención inmediata."
    },
    REFERRAL_OPPORTUNITY: {
      nextAction: "ASK_FOR_REFERRALS",
      relationshipValue: "REFER",
      reason: "Hay señal positiva para pedir referido o introducción."
    },
    LIFE_EVENT: {
      nextAction: "CALL_CLIENT",
      relationshipValue: "RECONNECT",
      reason: "Evento de vida relevante; conviene llamada personal."
    },
    ANNIVERSARY: {
      nextAction: "CHECK_IN",
      relationshipValue: "CELEBRATE",
      reason: "Aniversario relevante; buen momento para contacto relacional."
    }
  };

  const selected = map[event.type] || {
    nextAction: "CHECK_IN",
    relationshipValue: "RECONNECT",
    reason: "Evento relacional detectado."
  };
  const priority = event.type === "PAYMENT_OVERDUE"
    ? "CRITICAL"
    : event.priority || "LOW";
  const urgency = resolveTiming({
    priority,
    days
  });

  return {
    nextAction: selected.nextAction,
    actionReason: selected.reason,
    priority,
    urgency,
    recommendedChannel: resolveChannel({
      action: selected.nextAction,
      client,
      priority
    }),
    suggestedTiming: urgency,
    relationshipValue: selected.relationshipValue
  };
}

function buildRelationshipNextAction(input = {}) {
  const now = input.now ? new Date(input.now) : new Date();
  const client = input.client || {};
  const clientId = client.id || client.clientId || input.clientId || "UNKNOWN_CLIENT";
  const timeline = normalizeTimeline(input.timeline);
  const relationshipHistory = input.relationshipHistory || [];
  const selectedEvent = selectRelationshipEvent(timeline, now);
  const action = mapEventToAction(selectedEvent, client, now);

  if (
    action.priority !== "CRITICAL" &&
    action.nextAction !== "PAYMENT_REMINDER" &&
    hasRecentContact(relationshipHistory, now)
  ) {
    return {
      clientId,
      nextAction: "NO_ACTION",
      actionReason: "Ya hubo contacto reciente y no hay urgencia crítica.",
      priority: "LOW",
      urgency: "THIS_MONTH",
      recommendedChannel: client.preferredChannel || "WHATSAPP",
      suggestedTiming: "THIS_MONTH",
      relationshipValue: "NONE"
    };
  }

  return {
    clientId,
    ...action
  };
}

module.exports = {
  buildRelationshipNextAction,
  selectRelationshipEvent,
  mapEventToAction
};
