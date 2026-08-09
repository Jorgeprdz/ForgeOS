const CONFIRMED_SOURCE_MATCHES = new Set(['CREATE_CONFIRMED', 'LINK_CONFIRMED']);
const BLOCKED_CONSENT = new Set(['DENIED', 'REVOKED', 'BLOCKED', 'OPTED_OUT']);

function text(value) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function time(value) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizedMethodType(value) {
  const type = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if (['PHONE', 'TELEPHONE', 'MOBILE', 'CELL', 'CELLPHONE'].includes(type)) return 'phone';
  if (['WHATSAPP', 'WA'].includes(type)) return 'whatsapp';
  if (['EMAIL', 'E_MAIL', 'MAIL'].includes(type)) return 'email';
  return null;
}

function consent(value) {
  return String(value || 'unknown').trim().toUpperCase() || 'UNKNOWN';
}

export function isConfirmedProspectSourceLink(row = {}) {
  return row.source_identity_type === 'PROSPECT'
    && !row.effective_to
    && CONFIRMED_SOURCE_MATCHES.has(String(row.match_status || '').toUpperCase());
}

export function isCurrentConfirmedPolicyRole(row = {}, now = Date.now()) {
  if (String(row.confirmation_state || '').toUpperCase() !== 'CONFIRMED') return false;
  if (String(row.role_type || '').toUpperCase() === 'BENEFICIARY') return false;
  const from = time(row.effective_from);
  const to = time(row.effective_to);
  if (from !== null && from > now) return false;
  if (to !== null && to < now) return false;
  return Boolean(row.policy_id && row.participant_person_id);
}

function presentationToken(token, index) {
  const raw = String(token || '').trim();
  if (!raw) return '';
  if (/^\d+$/.test(raw)) return raw;
  if (/^[A-Z0-9]{2,6}$/.test(raw)) return raw;
  const lower = raw.toLocaleLowerCase('es-MX');
  if (['udi', 'mxn', 'usd'].includes(lower)) return lower.toUpperCase();
  if (index === 0 || raw.length > 0) return lower.charAt(0).toLocaleUpperCase('es-MX') + lower.slice(1);
  return raw;
}

export function presentProductReference(value) {
  const source = String(value || '').trim();
  if (!source) return 'Producto no identificado';
  const withoutNamespace = source.replace(/^product:/i, '');
  const tokens = withoutNamespace.split(/[-_/\s]+/).filter(Boolean);
  if (!tokens.length) return 'Producto no identificado';
  return tokens.map(presentationToken).filter(Boolean).join(' ');
}

function sourceValue(prospect, key) {
  if (!prospect || prospect.archived_at) return null;
  return text(prospect[key]);
}

function methodCandidate(methods, kind) {
  const matching = methods
    .filter(method => !method.archived_at && normalizedMethodType(method.method_type) === kind)
    .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)));
  const blocked = matching.some(method => BLOCKED_CONSENT.has(consent(method.consent_status)));
  if (blocked) {
    return Object.freeze({ value: null, state: 'RESTRICTED', source: 'PROSPECT_CONTACT_METHOD', consentStatus: 'RESTRICTED' });
  }
  const selected = matching.find(method => text(method.method_value));
  if (!selected) return null;
  return Object.freeze({
    value: text(selected.method_value),
    state: 'AVAILABLE',
    source: 'PROSPECT_CONTACT_METHOD',
    consentStatus: consent(selected.consent_status),
  });
}

function fallbackCandidate(prospects, keys, kind, methods) {
  const explicit = methodCandidate(methods, kind);
  if (explicit) return explicit;
  for (const prospect of prospects) {
    for (const key of keys) {
      const value = sourceValue(prospect, key);
      if (value) {
        return Object.freeze({
          value,
          state: 'AVAILABLE',
          source: 'PIPELINE_PROSPECT',
          consentStatus: 'NOT_ASSERTED',
        });
      }
    }
  }
  return Object.freeze({ value: null, state: 'NOT_INFORMED', source: null, consentStatus: null });
}

export function buildContactProjection({ prospects = [], methods = [], sourceState = 'AVAILABLE', reason = null } = {}) {
  if (sourceState === 'UNAVAILABLE') {
    const unavailable = Object.freeze({ value: null, state: 'UNAVAILABLE', source: null, consentStatus: null });
    return Object.freeze({ sourceState: 'UNAVAILABLE', reason, phone: unavailable, whatsapp: unavailable, email: unavailable, prospectStates: [] });
  }
  const activeProspects = prospects.filter(prospect => !prospect.archived_at);
  const phone = fallbackCandidate(activeProspects, ['phone_normalized'], 'phone', methods);
  const whatsapp = fallbackCandidate(activeProspects, ['whatsapp_normalized'], 'whatsapp', methods);
  const email = fallbackCandidate(activeProspects, ['email_normalized'], 'email', methods);
  const hasAny = [phone, whatsapp, email].some(item => item.state === 'AVAILABLE' || item.state === 'RESTRICTED');
  return Object.freeze({
    sourceState: hasAny || activeProspects.length ? 'AVAILABLE' : 'EMPTY',
    reason,
    phone,
    whatsapp,
    email,
    prospectStates: [...new Set(activeProspects.map(row => text(row.status)).filter(Boolean))],
  });
}

export function humanPipelineState(states = []) {
  const normalized = [...new Set(states.map(state => String(state || '').trim().toLowerCase()).filter(Boolean))];
  if (normalized.includes('client')) return 'Cliente';
  if (normalized.includes('decision')) return 'En decisión';
  if (normalized.includes('proposal')) return 'Propuesta presentada';
  if (normalized.includes('appointment_scheduled')) return 'Cita programada';
  if (normalized.includes('contacted')) return 'Contactado';
  if (normalized.includes('referred_new')) return 'Prospecto';
  return normalized.length ? 'Relación comercial' : 'Persona';
}

export const CARTERA_PERSON_PROJECTION_016 = Object.freeze({
  version: 'CARTERA-PERSON-PROJECTION-016.1',
  sourceMatches: Object.freeze([...CONFIRMED_SOURCE_MATCHES]),
  writes: false,
  automaticIdentityResolution: false,
});
