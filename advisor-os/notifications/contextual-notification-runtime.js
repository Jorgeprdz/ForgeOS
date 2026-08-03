const DEFAULT_COOLDOWN_MS = 30 * 60 * 1000;
const ALLOWED_TYPES = Object.freeze(['OVERDUE','DUE_TODAY','WAITING_STALE','COMMERCIAL_RISK','MUTATION_RECEIPT']);
const PRIORITY = Object.freeze({ OVERDUE: 100, COMMERCIAL_RISK: 90, DUE_TODAY: 80, WAITING_STALE: 60, MUTATION_RECEIPT: 20 });

function text(value) { return String(value || '').trim(); }
function freeze(value) { return Object.freeze({ ...value }); }

export function normalizeNotificationSignal(input = {}) {
  const type = text(input.type).toUpperCase();
  if (!ALLOWED_TYPES.includes(type)) return { ok: false, reason: 'NOTIFICATION_TYPE_UNSUPPORTED' };
  const subjectReference = text(input.subjectReference);
  if (!subjectReference) return { ok: false, reason: 'SUBJECT_REFERENCE_REQUIRED' };
  return {
    ok: true,
    signal: freeze({
      id: text(input.id) || `${type}:${subjectReference}`,
      type,
      subjectReference,
      title: text(input.title) || type,
      body: text(input.body),
      draft: text(input.draft),
      route: text(input.route),
      occurredAt: input.occurredAt || null,
      priority: PRIORITY[type],
      containsBusinessData: false,
    }),
  };
}

export function createContextualNotificationRuntime({ clock = () => Date.now(), cooldownMs = DEFAULT_COOLDOWN_MS } = {}) {
  const seen = new Map();
  let muted = false;

  function evaluate(inputs = []) {
    if (muted) return freeze({ status: 'MUTED', notification: null });
    const now = Number(clock());
    const candidates = inputs
      .map(normalizeNotificationSignal)
      .filter(result => result.ok)
      .map(result => result.signal)
      .filter(signal => now - Number(seen.get(signal.id) || 0) >= cooldownMs)
      .sort((a, b) => b.priority - a.priority || String(a.id).localeCompare(String(b.id)));
    const notification = candidates[0] || null;
    if (!notification) return freeze({ status: 'NONE', notification: null });
    seen.set(notification.id, now);
    return freeze({ status: 'READY', notification });
  }

  function dismiss(id) { if (text(id)) seen.set(text(id), Number(clock())); }
  function setMuted(value) { muted = value === true; }
  function scrub() { seen.clear(); muted = false; }

  return Object.freeze({ evaluate, dismiss, setMuted, scrub, diagnostics: () => freeze({ autonomousAction: false, directWrite: false, storedBusinessData: false, cooldownMs }) });
}
