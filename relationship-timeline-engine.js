const EVENT_TYPES = [
  "BIRTHDAY",
  "POLICY_RENEWAL",
  "POLICY_REVIEW",
  "PAYMENT_DUE",
  "PAYMENT_OVERDUE",
  "REFERRAL_OPPORTUNITY",
  "LIFE_EVENT",
  "ANNIVERSARY"
];

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toIsoDate(value) {
  const date = parseDate(value);
  if (!date) return null;
  return date.toISOString().slice(0, 10);
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

function buildAnnualDate(monthDayValue, now = new Date()) {
  const date = parseDate(monthDayValue);
  if (!date) return null;

  const next = new Date(now);
  next.setMonth(date.getMonth(), date.getDate());
  next.setHours(0, 0, 0, 0);

  if (next < now) {
    next.setFullYear(next.getFullYear() + 1);
  }

  return next.toISOString().slice(0, 10);
}

function createEvent({ date, type, priority = "LOW", description = "" }) {
  if (!EVENT_TYPES.includes(type)) return null;

  return {
    date: toIsoDate(date) || date || null,
    type,
    priority,
    description
  };
}

function priorityForTimedEvent({ type, date, now }) {
  const diff = daysUntil(date, now);

  if (type === "PAYMENT_OVERDUE") return "HIGH";
  if (diff === null) return "LOW";
  if (diff < 0) return type === "PAYMENT_DUE" ? "HIGH" : "LOW";
  if (type === "POLICY_RENEWAL" && diff <= 30) return "HIGH";
  if (type === "PAYMENT_DUE" && diff <= 7) return "HIGH";
  if (type === "POLICY_REVIEW" && diff <= 30) return "MEDIUM";
  if (type === "BIRTHDAY" && diff <= 14) return "MEDIUM";
  if (type === "REFERRAL_OPPORTUNITY") return "MEDIUM";
  if (type === "LIFE_EVENT") return "HIGH";

  return "LOW";
}

function normalizeManualEvents(events = [], now = new Date()) {
  return events
    .map(event => createEvent({
      date: event.date,
      type: event.type,
      priority: event.priority || priorityForTimedEvent({
        type: event.type,
        date: event.date,
        now
      }),
      description: event.description || event.detail || event.type || "Evento de relación"
    }))
    .filter(Boolean);
}

function buildProfileEvents(profile = {}, now = new Date()) {
  const events = [];

  if (profile.birthDate) {
    const birthdayDate = buildAnnualDate(profile.birthDate, now);
    events.push(createEvent({
      date: birthdayDate,
      type: "BIRTHDAY",
      priority: priorityForTimedEvent({
        type: "BIRTHDAY",
        date: birthdayDate,
        now
      }),
      description: `Cumpleaños de ${profile.name || "cliente"}`
    }));
  }

  if (profile.anniversaryDate) {
    const anniversaryDate = buildAnnualDate(profile.anniversaryDate, now);
    events.push(createEvent({
      date: anniversaryDate,
      type: "ANNIVERSARY",
      priority: "LOW",
      description: `Aniversario relevante de ${profile.name || "cliente"}`
    }));
  }

  (profile.lifeEvents || []).forEach(item => {
    events.push(createEvent({
      date: item.date,
      type: "LIFE_EVENT",
      priority: item.priority || priorityForTimedEvent({
        type: "LIFE_EVENT",
        date: item.date,
        now
      }),
      description: item.description || "Evento de vida relevante"
    }));
  });

  return events.filter(Boolean);
}

function buildPolicyEvents(policies = [], now = new Date()) {
  const events = [];

  policies.forEach(policy => {
    const policyLabel = policy.policyNumber || policy.id || policy.productName || "póliza";
    const renewalDate = policy.renewalDate || policy.fechaRenovacion || policy.renewal?.date;
    const reviewDate = policy.nextReviewDate || policy.reviewDate;
    const paymentDueDate = policy.paymentDueDate || policy.nextPaymentDate;
    const paymentOverdueDate = policy.paymentOverdueDate || paymentDueDate;

    if (renewalDate) {
      events.push(createEvent({
        date: renewalDate,
        type: "POLICY_RENEWAL",
        priority: priorityForTimedEvent({
          type: "POLICY_RENEWAL",
          date: renewalDate,
          now
        }),
        description: `Renovación próxima de ${policyLabel}`
      }));
    }

    if (reviewDate) {
      events.push(createEvent({
        date: reviewDate,
        type: "POLICY_REVIEW",
        priority: priorityForTimedEvent({
          type: "POLICY_REVIEW",
          date: reviewDate,
          now
        }),
        description: `Revisión recomendada de ${policyLabel}`
      }));
    }

    if (paymentDueDate) {
      events.push(createEvent({
        date: paymentDueDate,
        type: "PAYMENT_DUE",
        priority: priorityForTimedEvent({
          type: "PAYMENT_DUE",
          date: paymentDueDate,
          now
        }),
        description: `Pago próximo de ${policyLabel}`
      }));
    }

    if (policy.paymentStatus === "OVERDUE" || policy.paymentOverdueDate) {
      events.push(createEvent({
        date: paymentOverdueDate,
        type: "PAYMENT_OVERDUE",
        priority: "HIGH",
        description: `Pago vencido de ${policyLabel}`
      }));
    }

    if (
      policy.policyIssued ||
      policy.reviewCompleted ||
      Number(policy.clientSatisfaction || 0) >= 9
    ) {
      events.push(createEvent({
        date: policy.referralDate || new Date(now).toISOString(),
        type: "REFERRAL_OPPORTUNITY",
        priority: "MEDIUM",
        description: `Oportunidad de referido por ${policyLabel}`
      }));
    }
  });

  return events.filter(Boolean);
}

function sortTimeline(timeline = []) {
  return timeline.slice().sort((a, b) => {
    const aDate = parseDate(a.date);
    const bDate = parseDate(b.date);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return aDate - bDate;
  });
}

function getNextRelationshipEvent(timeline = [], now = new Date()) {
  return timeline.find(event => {
    const diff = daysUntil(event.date, now);
    return diff !== null && diff >= 0;
  }) || null;
}

function calculateRelationshipHealth(timeline = []) {
  const highCount = timeline.filter(event => event.priority === "HIGH").length;
  const hasPaymentOverdue = timeline.some(event => event.type === "PAYMENT_OVERDUE");
  const hasPaymentRisk = timeline.some(event => event.type === "PAYMENT_DUE" && event.priority === "HIGH");
  const hasRenewalRisk = timeline.some(event => event.type === "POLICY_RENEWAL" && event.priority === "HIGH");
  const hasMediumOpportunity = timeline.some(event => event.priority === "MEDIUM");

  if (hasPaymentOverdue || highCount >= 2) return "RED";
  if (hasPaymentRisk || hasRenewalRisk) return "ORANGE";
  if (hasMediumOpportunity) return "YELLOW";

  return "GREEN";
}

function buildRelationshipOpportunities(timeline = []) {
  return timeline
    .filter(event => [
      "BIRTHDAY",
      "POLICY_RENEWAL",
      "POLICY_REVIEW",
      "REFERRAL_OPPORTUNITY",
      "LIFE_EVENT",
      "PAYMENT_DUE",
      "PAYMENT_OVERDUE"
    ].includes(event.type))
    .map(event => ({
      type: event.type,
      priority: event.priority,
      date: event.date,
      description: event.description
    }));
}

function buildRelationshipTimeline(input = {}) {
  const now = input.now ? new Date(input.now) : new Date();
  const clientId = input.clientId || "UNKNOWN_CLIENT";
  const policies = input.policies || [];
  const profile = input.profile || {};
  const events = input.events || [];

  const timeline = sortTimeline([
    ...buildProfileEvents(profile, now),
    ...buildPolicyEvents(policies, now),
    ...normalizeManualEvents(events, now)
  ]);

  return {
    engine: "RELATIONSHIP_TIMELINE_ENGINE",
    version: "0.1",
    clientId,
    timeline,
    nextRelationshipEvent: getNextRelationshipEvent(timeline, now),
    relationshipHealth: calculateRelationshipHealth(timeline),
    relationshipOpportunities: buildRelationshipOpportunities(timeline)
  };
}

module.exports = {
  buildRelationshipTimeline,
  calculateRelationshipHealth,
  sortTimeline,
  daysUntil
};
