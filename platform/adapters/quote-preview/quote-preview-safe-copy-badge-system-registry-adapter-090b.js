'use strict';

const visual = require('./quote-preview-safe-visual-layout-spec-registry-adapter-089b.js');

const ADAPTER_ID = 'forge.quote_preview.safe_copy_badge_system.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.safe_copy_badge_system.registry.v1';
const DOMAIN_ID = 'quote_preview_safe_copy_badge_system';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const BADGE_TONES = Object.freeze({
  CYAN: 'cyan',
  BLUE: 'blue',
  GOLD: 'gold',
  NEUTRAL: 'neutral',
  WARNING: 'warning',
  DANGER: 'danger',
});

const SAFE_ERROR_CODES = Object.freeze({
  COPY_BADGE_NOT_MAPPED: 'QUOTE_PREVIEW_COPY_BADGE_NOT_MAPPED',
  OFFICIAL_QUOTE_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_OFFICIAL_QUOTE_LANGUAGE_NOT_ALLOWED',
  SEND_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_SEND_LANGUAGE_NOT_ALLOWED',
  CRM_WRITE_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_CRM_WRITE_LANGUAGE_NOT_ALLOWED',
  CALENDAR_CREATE_LANGUAGE_NOT_ALLOWED: 'QUOTE_PREVIEW_CALENDAR_CREATE_LANGUAGE_NOT_ALLOWED',
  QUOTE_TRUTH_LANGUAGE_BLOCKED: 'QUOTE_PREVIEW_QUOTE_TRUTH_LANGUAGE_BLOCKED',
  EFFECT_LANGUAGE_BLOCKED: 'QUOTE_PREVIEW_EFFECT_LANGUAGE_BLOCKED',
});

const DEFAULT_SAFETY_FLAGS = Object.freeze({
  crmWrite: false,
  pipelineWrite: false,
  policyWrite: false,
  quoteWrite: false,
  taskCreate: false,
  calendarCreate: false,
  messageSend: false,
  authReal: false,
  providerRuntime: false,
  secretAccess: false,
  browserPersistence: false,
  realEngineExecution: false,
  realEffectsAllowed: false,
  realEffectsEnabled: false,
  backendConnection: false,
  pdfRead: false,
  ocrExecution: false,
  parserExecution: false,
  calculatorExecution: false,
  banxicoCall: false,
  testExecution: false,
});

const FORBIDDEN_COPY_PATTERNS = Object.freeze([
  /\bcotizaci[oó]n oficial lista\b/i,
  /\benviar ahora\b/i,
  /\bguardar en crm\b/i,
  /\bcrear evento\b/i,
  /\bagendar autom[aá]ticamente\b/i,
  /\bemitir cotizaci[oó]n\b/i,
  /\bcotizaci[oó]n verificada\b/i,
  /\bprecio confirmado\b/i,
]);

const REQUIRED_BADGE_FIELDS = Object.freeze([
  'badge_id',
  'label',
  'tone',
  'meaning',
  'required_when',
  'official_quote_allowed',
  'send_allowed',
  'crm_write_allowed',
  'calendar_create_allowed',
  'quote_truth_allowed',
  'write_allowed',
  'safety_flags',
]);

const REQUIRED_COPY_FIELDS = Object.freeze([
  'copy_id',
  'text',
  'usage',
  'required_badge_ids',
  'official_quote_allowed',
  'send_allowed',
  'crm_write_allowed',
  'calendar_create_allowed',
  'quote_truth_allowed',
  'write_allowed',
  'safe_errors',
  'safety_flags',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeBadge(badge) {
  return Object.freeze({
    ...badge,
    required_when: Object.freeze([...(badge.required_when || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(badge.safety_flags || {}) }),
  });
}

function freezeCopy(copy) {
  return Object.freeze({
    ...copy,
    required_badge_ids: Object.freeze([...(copy.required_badge_ids || [])]),
    safe_errors: Object.freeze([...(copy.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(copy.safety_flags || {}) }),
  });
}

function buildBadge({ badgeId, label, tone, meaning, requiredWhen }) {
  return freezeBadge({
    badge_id: badgeId,
    label,
    tone,
    meaning,
    required_when: requiredWhen,
    official_quote_allowed: false,
    send_allowed: false,
    crm_write_allowed: false,
    calendar_create_allowed: false,
    quote_truth_allowed: false,
    write_allowed: false,
    safety_flags: DEFAULT_SAFETY_FLAGS,
  });
}

function buildCopy({ copyId, text, usage, requiredBadgeIds }) {
  return freezeCopy({
    copy_id: copyId,
    text,
    usage,
    required_badge_ids: requiredBadgeIds,
    official_quote_allowed: false,
    send_allowed: false,
    crm_write_allowed: false,
    calendar_create_allowed: false,
    quote_truth_allowed: false,
    write_allowed: false,
    safe_errors: [
      SAFE_ERROR_CODES.OFFICIAL_QUOTE_LANGUAGE_NOT_ALLOWED,
      SAFE_ERROR_CODES.SEND_LANGUAGE_NOT_ALLOWED,
      SAFE_ERROR_CODES.CRM_WRITE_LANGUAGE_NOT_ALLOWED,
      SAFE_ERROR_CODES.CALENDAR_CREATE_LANGUAGE_NOT_ALLOWED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_LANGUAGE_BLOCKED,
      SAFE_ERROR_CODES.EFFECT_LANGUAGE_BLOCKED,
    ],
    safety_flags: DEFAULT_SAFETY_FLAGS,
  });
}

const BADGES = Object.freeze([
  buildBadge({ badgeId: 'preview', label: 'Preview', tone: BADGE_TONES.CYAN, meaning: 'Reference preview only.', requiredWhen: ['all_quote_preview_surfaces'] }),
  buildBadge({ badgeId: 'read_only', label: 'Solo lectura', tone: BADGE_TONES.BLUE, meaning: 'No writes are allowed.', requiredWhen: ['all_quote_preview_surfaces'] }),
  buildBadge({ badgeId: 'human_review_required', label: 'Revisión humana', tone: BADGE_TONES.GOLD, meaning: 'Human review required before any real action.', requiredWhen: ['ready_for_human_review', 'quote_truth_blocked'] }),
  buildBadge({ badgeId: 'not_official_quote', label: 'No cotización oficial', tone: BADGE_TONES.GOLD, meaning: 'Not an official quote.', requiredWhen: ['all_quote_preview_surfaces'] }),
  buildBadge({ badgeId: 'no_send', label: 'Sin envío', tone: BADGE_TONES.NEUTRAL, meaning: 'No message sending is allowed.', requiredWhen: ['action_bar', 'command_bar'] }),
  buildBadge({ badgeId: 'no_crm', label: 'Sin CRM', tone: BADGE_TONES.NEUTRAL, meaning: 'No CRM write is allowed.', requiredWhen: ['action_bar', 'command_bar'] }),
  buildBadge({ badgeId: 'no_calendar', label: 'Sin calendario', tone: BADGE_TONES.NEUTRAL, meaning: 'No calendar event creation is allowed.', requiredWhen: ['action_bar', 'command_bar'] }),
  buildBadge({ badgeId: 'source_not_bound', label: 'Fuente no vinculada', tone: BADGE_TONES.WARNING, meaning: 'Source trace is not bound.', requiredWhen: ['source_trace_not_bound'] }),
  buildBadge({ badgeId: 'hash_not_verified', label: 'Hash no verificado', tone: BADGE_TONES.WARNING, meaning: 'File hash is not verified.', requiredWhen: ['file_hash_not_verified'] }),
  buildBadge({ badgeId: 'quote_truth_blocked', label: 'Quote truth bloqueado', tone: BADGE_TONES.DANGER, meaning: 'Quote truth cannot be created here.', requiredWhen: ['quote_truth_blocked'] }),
]);

const COPY_BLOCKS = Object.freeze([
  buildCopy({
    copyId: 'preview_disclaimer_primary',
    text: 'Este preview es solo una referencia operativa. No es una cotización oficial.',
    usage: 'status_and_reference_cards',
    requiredBadgeIds: ['preview', 'read_only', 'not_official_quote'],
  }),
  buildCopy({
    copyId: 'human_review_required',
    text: 'Requiere revisión humana antes de cualquier acción real.',
    usage: 'human_review_card',
    requiredBadgeIds: ['preview', 'human_review_required', 'not_official_quote'],
  }),
  buildCopy({
    copyId: 'no_effects_boundary',
    text: 'Sin envío, sin CRM, sin calendario y sin cambios reales.',
    usage: 'action_bar_boundary',
    requiredBadgeIds: ['preview', 'read_only', 'no_send', 'no_crm', 'no_calendar'],
  }),
  buildCopy({
    copyId: 'blocked_quote_truth',
    text: 'La verdad de cotización está bloqueada hasta que una fuente autorizada la confirme.',
    usage: 'blocked_screen',
    requiredBadgeIds: ['preview', 'not_official_quote', 'quote_truth_blocked', 'human_review_required'],
  }),
  buildCopy({
    copyId: 'source_trace_missing',
    text: 'Falta vincular la fuente antes de confiar en este preview.',
    usage: 'warning_stack',
    requiredBadgeIds: ['preview', 'source_not_bound', 'not_official_quote'],
  }),
  buildCopy({
    copyId: 'safe_prepare_preview_cta',
    text: 'Preparar preview',
    usage: 'primary_cta',
    requiredBadgeIds: ['preview', 'read_only'],
  }),
  buildCopy({
    copyId: 'safe_request_review_cta',
    text: 'Solicitar revisión humana',
    usage: 'human_review_cta',
    requiredBadgeIds: ['preview', 'human_review_required'],
  }),
]);

function getSourceRefs() {
  const visualCatalog = visual.getQuotePreviewSafeVisualLayoutSpecRegistryCatalog();
  return {
    safe_visual_layout_spec: {
      adapter_id: visualCatalog.adapter_id,
      schemaVersion: visualCatalog.schemaVersion,
      overall_visual_layout_spec_status: visualCatalog.overall_visual_layout_spec_status,
      visual_layout_spec_count: visualCatalog.visual_layout_specs.length,
      template_reconciled: Boolean(visualCatalog.design_template_source_refs && visualCatalog.desktop_template_source_refs && visualCatalog.mobile_template_source_refs),
    },
  };
}

function getQuotePreviewSafeCopyBadgeSystemRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_safe_copy_badge_system_registry',
    overall_copy_badge_status: 'copy_badges_mapped_no_effect_language_no_truth',
    official_quote_allowed_in_registry: false,
    send_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    calendar_create_allowed_in_registry: false,
    quote_truth_allowed_in_registry: false,
    execution_allowed_in_registry: false,
    write_allowed_in_registry: false,
    ui_mutation_allowed_in_registry: false,
    css_injection_allowed_in_registry: false,
    dom_write_allowed_in_registry: false,
    required_badge_fields: [...REQUIRED_BADGE_FIELDS],
    required_copy_fields: [...REQUIRED_COPY_FIELDS],
    forbidden_copy_patterns: FORBIDDEN_COPY_PATTERNS.map((pattern) => pattern.toString()),
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    badges: clone(BADGES),
    copy_blocks: clone(COPY_BLOCKS),
  };
}

function getBadgeById(badgeId) {
  const match = BADGES.find((badge) => badge.badge_id === badgeId);
  return match ? clone(match) : {
    readModelStatus: 'error',
    badge_id: badgeId || null,
    label: null,
    tone: BADGE_TONES.DANGER,
    meaning: 'Badge not mapped. Treat as unsafe.',
    required_when: [],
    official_quote_allowed: false,
    send_allowed: false,
    crm_write_allowed: false,
    calendar_create_allowed: false,
    quote_truth_allowed: false,
    write_allowed: false,
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code: SAFE_ERROR_CODES.COPY_BADGE_NOT_MAPPED,
      message: 'Badge is not mapped. Official quote, send, CRM, calendar, truth, and writes remain blocked.',
    },
  };
}

function getCopyBlockById(copyId) {
  const match = COPY_BLOCKS.find((copy) => copy.copy_id === copyId);
  return match ? clone(match) : {
    readModelStatus: 'error',
    copy_id: copyId || null,
    text: null,
    usage: null,
    required_badge_ids: ['preview', 'read_only', 'not_official_quote'],
    official_quote_allowed: false,
    send_allowed: false,
    crm_write_allowed: false,
    calendar_create_allowed: false,
    quote_truth_allowed: false,
    write_allowed: false,
    safe_errors: [SAFE_ERROR_CODES.COPY_BADGE_NOT_MAPPED, SAFE_ERROR_CODES.EFFECT_LANGUAGE_BLOCKED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code: SAFE_ERROR_CODES.COPY_BADGE_NOT_MAPPED,
      message: 'Copy block is not mapped. Effect language and quote truth remain blocked.',
    },
  };
}

function getCopyBlocksByUsage(usage) {
  return clone(COPY_BLOCKS.filter((copy) => copy.usage === usage));
}

function hasForbiddenCopyLanguage(text) {
  return FORBIDDEN_COPY_PATTERNS.some((pattern) => pattern.test(String(text || '')));
}

function validateBadgeShape(badge) {
  const errors = [];
  if (!badge || typeof badge !== 'object') return { ok: false, valid: false, errors: ['badge_object_required'] };

  for (const field of REQUIRED_BADGE_FIELDS) if (!(field in badge)) errors.push(`missing_${field}`);
  for (const flagName of ['official_quote_allowed', 'send_allowed', 'crm_write_allowed', 'calendar_create_allowed', 'quote_truth_allowed', 'write_allowed']) {
    if (badge[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }
  for (const [key, value] of Object.entries(badge.safety_flags || {})) if (value !== false) errors.push(`safety_flag_not_false_${key}`);

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateCopyBlockShape(copy) {
  const errors = [];
  if (!copy || typeof copy !== 'object') return { ok: false, valid: false, errors: ['copy_object_required'] };

  for (const field of REQUIRED_COPY_FIELDS) if (!(field in copy)) errors.push(`missing_${field}`);
  for (const flagName of ['official_quote_allowed', 'send_allowed', 'crm_write_allowed', 'calendar_create_allowed', 'quote_truth_allowed', 'write_allowed']) {
    if (copy[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  if (hasForbiddenCopyLanguage(copy.text)) errors.push('forbidden_copy_language_detected');
  if (!Array.isArray(copy.required_badge_ids) || !copy.required_badge_ids.includes('preview')) errors.push('preview_badge_required');
  if (!copy.required_badge_ids.includes('not_official_quote') && copy.usage !== 'primary_cta' && copy.usage !== 'human_review_cta' && copy.usage !== 'action_bar_boundary') {
    errors.push('not_official_quote_badge_required_for_non_cta_copy');
  }

  for (const [key, value] of Object.entries(copy.safety_flags || {})) if (value !== false) errors.push(`safety_flag_not_false_${key}`);

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateCopyBadgeSystemRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_copy_badge_status !== 'copy_badges_mapped_no_effect_language_no_truth') errors.push('overall_copy_badge_status_must_remain_no_effects');

  for (const flagName of [
    'official_quote_allowed_in_registry',
    'send_allowed_in_registry',
    'crm_write_allowed_in_registry',
    'calendar_create_allowed_in_registry',
    'quote_truth_allowed_in_registry',
    'execution_allowed_in_registry',
    'write_allowed_in_registry',
    'ui_mutation_allowed_in_registry',
    'css_injection_allowed_in_registry',
    'dom_write_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  const badges = Array.isArray(catalog.badges) ? catalog.badges : [];
  const copyBlocks = Array.isArray(catalog.copy_blocks) ? catalog.copy_blocks : [];
  if (badges.length !== 10) errors.push('ten_badges_required');
  if (copyBlocks.length !== 7) errors.push('seven_copy_blocks_required');

  const badgeIds = new Set(badges.map((badge) => badge.badge_id));
  for (const requiredBadge of ['preview', 'read_only', 'human_review_required', 'not_official_quote', 'no_send', 'no_crm', 'no_calendar']) {
    if (!badgeIds.has(requiredBadge)) errors.push(`missing_required_badge_${requiredBadge}`);
  }

  for (const badge of badges) {
    const result = validateBadgeShape(badge);
    if (!result.ok) errors.push(...result.errors.map((error) => `${badge.badge_id || 'unknown'}:${error}`));
  }

  for (const copy of copyBlocks) {
    const result = validateCopyBlockShape(copy);
    if (!result.ok) errors.push(...result.errors.map((error) => `${copy.copy_id || 'unknown'}:${error}`));
    for (const badgeId of copy.required_badge_ids || []) {
      if (!badgeIds.has(badgeId)) errors.push(`${copy.copy_id}:unknown_badge_${badgeId}`);
    }
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  BADGE_TONES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  FORBIDDEN_COPY_PATTERNS,
  REQUIRED_BADGE_FIELDS,
  REQUIRED_COPY_FIELDS,
  BADGES,
  COPY_BLOCKS,
  getQuotePreviewSafeCopyBadgeSystemRegistryCatalog,
  getBadgeById,
  getCopyBlockById,
  getCopyBlocksByUsage,
  hasForbiddenCopyLanguage,
  validateBadgeShape,
  validateCopyBlockShape,
  validateCopyBadgeSystemRegistryCatalog,
};
