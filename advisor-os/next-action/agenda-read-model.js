const DAY_MS = 86_400_000;

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date) {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 1);
  return value;
}

function priorityOf(item) {
  const value = Number(item.commercialPriority);
  return Number.isFinite(value) ? value : -Infinity;
}

function immutableSection(id, items) {
  return Object.freeze({ id, count: items.length, items: Object.freeze(items.map(Object.freeze)) });
}

export function buildAgendaReadModel({ actions = [], activeCases = [], now = new Date() } = {}) {
  const todayStart = startOfDay(now);
  const tomorrowStart = endOfDay(now);
  const weekEnd = new Date(todayStart.getTime() + (8 * DAY_MS));
  const scheduledProspects = new Set();
  const buckets = {
    OVERDUE: [],
    TODAY: [],
    UPCOMING_7_DAYS: [],
    WAITING: [],
    UNSCHEDULED_ACTIVE_CASES: [],
  };

  for (const action of actions) {
    const status = String(action.status || 'OPEN').toUpperCase();
    const dueAt = asDate(action.nextActionAt);
    if (status === 'WAITING' || action.caseResolution === 'WAITING_FOR_EXTERNAL_EVENT') {
      buckets.WAITING.push({ ...action });
      continue;
    }
    if (status !== 'OPEN' || !dueAt) continue;
    scheduledProspects.add(String(action.prospectReference || ''));
    if (dueAt < todayStart) buckets.OVERDUE.push({ ...action });
    else if (dueAt < tomorrowStart) buckets.TODAY.push({ ...action });
    else if (dueAt < weekEnd) buckets.UPCOMING_7_DAYS.push({ ...action });
  }

  for (const caseSnapshot of activeCases) {
    if (caseSnapshot.active !== true) continue;
    const resolution = String(caseSnapshot.caseResolution || '').trim();
    const prospectReference = String(caseSnapshot.prospectReference || '');
    if (resolution === 'WAITING_FOR_EXTERNAL_EVENT') {
      if (!buckets.WAITING.some(item => String(item.prospectReference || '') === prospectReference)) {
        buckets.WAITING.push({ ...caseSnapshot });
      }
      continue;
    }
    if (resolution !== 'NEXT_ACTION_SCHEDULED' || !scheduledProspects.has(prospectReference)) {
      buckets.UNSCHEDULED_ACTIVE_CASES.push({ ...caseSnapshot });
    }
  }

  buckets.OVERDUE.sort((a, b) => asDate(a.nextActionAt) - asDate(b.nextActionAt));
  buckets.TODAY.sort((a, b) => asDate(a.nextActionAt) - asDate(b.nextActionAt));
  buckets.UPCOMING_7_DAYS.sort((a, b) => asDate(a.nextActionAt) - asDate(b.nextActionAt));
  buckets.WAITING.sort((a, b) => {
    const left = asDate(a.expectedAt)?.getTime() ?? Infinity;
    const right = asDate(b.expectedAt)?.getTime() ?? Infinity;
    return left - right;
  });
  buckets.UNSCHEDULED_ACTIVE_CASES.sort((a, b) => priorityOf(b) - priorityOf(a));

  return Object.freeze({
    generatedAt: new Date(now).toISOString(),
    sections: Object.freeze([
      immutableSection('OVERDUE', buckets.OVERDUE),
      immutableSection('TODAY', buckets.TODAY),
      immutableSection('UPCOMING_7_DAYS', buckets.UPCOMING_7_DAYS),
      immutableSection('WAITING', buckets.WAITING),
      immutableSection('UNSCHEDULED_ACTIVE_CASES', buckets.UNSCHEDULED_ACTIVE_CASES),
    ]),
    diagnostics: Object.freeze({
      projectionOnly: true,
      persistenceOwned: false,
      silentOverdueRollover: false,
      unknownAsZero: false,
    }),
  });
}

export function selectAgendaSection(readModel, id) {
  return readModel?.sections?.find(section => section.id === id) || immutableSection(id, []);
}
