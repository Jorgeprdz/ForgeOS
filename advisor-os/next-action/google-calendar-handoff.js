function required(value, code) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw Object.assign(new TypeError(code), { code });
  return normalized;
}

function compactUtc(value) {
  const date = new Date(required(value, 'CALENDAR_DATE_REQUIRED'));
  if (Number.isNaN(date.getTime())) throw Object.assign(new TypeError('CALENDAR_DATE_INVALID'), { code: 'CALENDAR_DATE_INVALID' });
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function createGoogleCalendarDraft({
  title,
  startAt,
  endAt,
  details = '',
  location = '',
  timezone = 'America/Mexico_City',
} = {}) {
  const start = compactUtc(startAt);
  const end = compactUtc(endAt);
  if (end <= start) throw Object.assign(new TypeError('CALENDAR_END_MUST_FOLLOW_START'), { code: 'CALENDAR_END_MUST_FOLLOW_START' });

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', required(title, 'CALENDAR_TITLE_REQUIRED'));
  url.searchParams.set('dates', `${start}/${end}`);
  if (details) url.searchParams.set('details', String(details));
  if (location) url.searchParams.set('location', String(location));
  url.searchParams.set('ctz', timezone);

  return Object.freeze({
    status: 'DRAFT_READY',
    url: url.toString(),
    eventSaved: 'UNKNOWN',
    oauthRequired: false,
    tokensStored: false,
  });
}

export function openGoogleCalendarDraft(draft, { opener = globalThis.open } = {}) {
  if (!draft?.url) throw Object.assign(new TypeError('CALENDAR_DRAFT_REQUIRED'), { code: 'CALENDAR_DRAFT_REQUIRED' });
  if (typeof opener !== 'function') return Object.freeze({ ok: false, reason: 'CALENDAR_OPENER_UNAVAILABLE' });
  const opened = opener(draft.url, '_blank', 'noopener,noreferrer');
  return Object.freeze({
    ok: Boolean(opened !== null),
    status: opened === null ? 'HANDOFF_BLOCKED' : 'HANDOFF_OPENED',
    eventSaved: 'UNKNOWN',
    receiptType: 'CALENDAR_HANDOFF',
  });
}
