'use strict';

const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const boundary = require('./quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');

const ADAPTER_ID = 'forge.quote_preview.safe_ux_state_model.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.safe_ux_state_model.registry.v1';
const DOMAIN_ID = 'quote_preview_safe_ux_state_model';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const STATE_KINDS = Object.freeze({
  NEUTRAL: 'neutral',
  INFORMATIONAL: 'informational',
  WARNING: 'warning',
  BLOCKED: 'blocked',
  PREVIEW_READY: 'preview_ready',
  HUMAN_REVIEW: 'human_review',
});

const SAFE_ACTIONS = Object.freeze({
  VIEW_EMPTY_STATE: 'view_empty_state',
  VIEW_REFERENCE_PREVIEW: 'view_reference_preview',
  OPEN_EVIDENCE_PANEL: 'open_evidence_panel',
  OPEN_PROVENANCE_PANEL: 'open_provenance_panel',
  REQUEST_HUMAN_REVIEW: 'request_human_review',
  COPY_PREVIEW_REFERENCE_SUMMARY: 'copy_preview_reference_summary',
});

const BLOCKED_ACTIONS = Object.freeze({
  ISSUE_QUOTE: 'issue_quote',
  SEND_QUOTE: 'send_quote',
  WRITE_QUOTE: 'write_quote',
  WRITE_CRM: 'write_crm',
  WRITE_POLICY: 'write_policy',
  WRITE_PIPELINE: 'write_pipeline',
  CONNECT_PROVIDER: 'connect_provider',
  CONNECT_BACKEND: 'connect_backend',
  RUN_PARSER: 'run_parser',
  RUN_CALCULATOR: 'run_calculator',
  CALL_BANXICO: 'call_banxico',
  READ_PDF: 'read_pdf',
});

const BADGES = Object.freeze({
  PREVIEW: 'preview',
  NO_ES_COTIZACION: 'no_es_cotizacion',
  NO_VERIFICADO: 'no_verificado',
  ARCHIVO_NO_VERIFICADO: 'archivo_no_verificado',
  SIN_SOURCE_TRACE: 'sin_source_trace',
  PARSER_BLOQUEADO: 'parser_bloqueado',
  INPUTS_NO_VERIFICADOS: 'inputs_no_verificados',
  QUOTE_TRUTH_BLOQUEADO: 'quote_truth_bloqueado',
  REQUIERE_REVISION_HUMANA: 'requiere_revision_humana',
});

const SAFE_ERROR_CODES = Object.freeze({
  UX_STATE_NOT_MAPPED: 'QUOTE_PREVIEW_UX_STATE_NOT_MAPPED',
  QUOTE_TRUTH_NOT_AUTHORIZED: 'QUOTE_PREVIEW_UX_QUOTE_TRUTH_NOT_AUTHORIZED',
  WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_UX_WRITE_NOT_AUTHORIZED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_UX_EXECUTION_NOT_AUTHORIZED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_UX_PREVIEW_LABEL_REQUIRED',
  HUMAN_REVIEW_REQUIRED: 'QUOTE_PREVIEW_UX_HUMAN_REVIEW_REQUIRED',
  SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_UX_SOURCE_TRACE_NOT_BOUND',
  FILE_HASH_NOT_VERIFIED: 'QUOTE_PREVIEW_UX_FILE_HASH_NOT_VERIFIED',
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

const REQUIRED_UX_STATE_FIELDS = Object.freeze([
  'state_id',
  'state_kind',
  'display_label',
  'description',
  'visible_allowed',
  'preview_reference_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'write_allowed',
  'allowed_actions',
  'blocked_actions',
  'required_badges',
  'safe_errors',
  'safety_flags',
]);

const GLOBAL_BLOCKED_ACTIONS = Object.freeze(Object.values(BLOCKED_ACTIONS));

function freezeState(state) {
  return Object.freeze({
    ...state,
    allowed_actions: Object.freeze([...(state.allowed_actions || [])]),
    blocked_actions: Object.freeze([...(state.blocked_actions || [])]),
    required_badges: Object.freeze([...(state.required_badges || [])]),
    safe_errors: Object.freeze([...(state.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(state.safety_flags || {}) }),
  });
}

function makeState({
  stateId,
  stateKind,
  displayLabel,
  description,
  previewReferenceAllowed,
  allowedActions,
  requiredBadges,
  safeErrors,
}) {
  return freezeState({
    state_id: stateId,
    state_kind: stateKind,
    display_label: displayLabel,
    description,
    visible_allowed: true,
    preview_reference_allowed: previewReferenceAllowed,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    allowed_actions: allowedActions,
    blocked_actions: [...GLOBAL_BLOCKED_ACTIONS],
    required_badges: requiredBadges,
    safe_errors: [
      SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
      ...safeErrors,
    ],
  });
}

const SAFE_UX_STATES = Object.freeze([
  makeState({
    stateId: 'empty',
    stateKind: STATE_KINDS.NEUTRAL,
    displayLabel: 'Sin PDF cargado',
    description: 'No hay PDF candidato ni datos de preview disponibles.',
    previewReferenceAllowed: false,
    allowedActions: [SAFE_ACTIONS.VIEW_EMPTY_STATE],
    requiredBadges: [BADGES.PREVIEW],
    safeErrors: [SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED],
  }),
  makeState({
    stateId: 'pdf_candidate_detected',
    stateKind: STATE_KINDS.INFORMATIONAL,
    displayLabel: 'PDF candidato detectado',
    description: 'Hay un PDF candidato, pero todavía no está verificado ni autorizado para lectura o ejecución.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.VIEW_REFERENCE_PREVIEW, SAFE_ACTIONS.OPEN_EVIDENCE_PANEL],
    requiredBadges: [BADGES.PREVIEW, BADGES.NO_VERIFICADO, BADGES.NO_ES_COTIZACION],
    safeErrors: [SAFE_ERROR_CODES.FILE_HASH_NOT_VERIFIED],
  }),
  makeState({
    stateId: 'file_hash_not_verified',
    stateKind: STATE_KINDS.WARNING,
    displayLabel: 'Archivo no verificado',
    description: 'El archivo candidato no tiene hash verificado. Sólo puede mostrarse como referencia.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.VIEW_REFERENCE_PREVIEW, SAFE_ACTIONS.OPEN_EVIDENCE_PANEL],
    requiredBadges: [BADGES.PREVIEW, BADGES.ARCHIVO_NO_VERIFICADO, BADGES.NO_ES_COTIZACION],
    safeErrors: [SAFE_ERROR_CODES.FILE_HASH_NOT_VERIFIED],
  }),
  makeState({
    stateId: 'source_trace_not_bound',
    stateKind: STATE_KINDS.WARNING,
    displayLabel: 'Valores sin fuente trazada',
    description: 'Los valores esperados o inputs no tienen source trace bound. No pueden tratarse como verdad.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.VIEW_REFERENCE_PREVIEW, SAFE_ACTIONS.OPEN_PROVENANCE_PANEL],
    requiredBadges: [BADGES.PREVIEW, BADGES.SIN_SOURCE_TRACE, BADGES.NO_ES_COTIZACION],
    safeErrors: [SAFE_ERROR_CODES.SOURCE_TRACE_NOT_BOUND],
  }),
  makeState({
    stateId: 'parser_owner_decision_required',
    stateKind: STATE_KINDS.BLOCKED,
    displayLabel: 'Parser pendiente de ownership',
    description: 'El parser candidato requiere decisión de ownership. No se ejecuta parser.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.OPEN_EVIDENCE_PANEL, SAFE_ACTIONS.REQUEST_HUMAN_REVIEW],
    requiredBadges: [BADGES.PREVIEW, BADGES.PARSER_BLOQUEADO, BADGES.NO_ES_COTIZACION],
    safeErrors: [SAFE_ERROR_CODES.HUMAN_REVIEW_REQUIRED],
  }),
  makeState({
    stateId: 'deterministic_inputs_not_verified',
    stateKind: STATE_KINDS.WARNING,
    displayLabel: 'Inputs determinísticos no verificados',
    description: 'Inputs como UDI, crecimiento, horizonte o fórmula no están verificados. No hay cálculo autorizado.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.OPEN_PROVENANCE_PANEL, SAFE_ACTIONS.REQUEST_HUMAN_REVIEW],
    requiredBadges: [BADGES.PREVIEW, BADGES.INPUTS_NO_VERIFICADOS, BADGES.NO_ES_COTIZACION],
    safeErrors: [SAFE_ERROR_CODES.SOURCE_TRACE_NOT_BOUND],
  }),
  makeState({
    stateId: 'preview_reference_available',
    stateKind: STATE_KINDS.PREVIEW_READY,
    displayLabel: 'Preview de referencia disponible',
    description: 'Puede mostrarse un preview de referencia con etiquetas de no cotización y no verificado.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.VIEW_REFERENCE_PREVIEW, SAFE_ACTIONS.OPEN_EVIDENCE_PANEL, SAFE_ACTIONS.COPY_PREVIEW_REFERENCE_SUMMARY],
    requiredBadges: [BADGES.PREVIEW, BADGES.NO_ES_COTIZACION, BADGES.NO_VERIFICADO],
    safeErrors: [SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED],
  }),
  makeState({
    stateId: 'quote_truth_blocked',
    stateKind: STATE_KINDS.BLOCKED,
    displayLabel: 'Cotización real bloqueada',
    description: 'La cotización real está bloqueada hasta que existan gates de provider/backend autorizados.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.OPEN_EVIDENCE_PANEL, SAFE_ACTIONS.REQUEST_HUMAN_REVIEW],
    requiredBadges: [BADGES.NO_ES_COTIZACION, BADGES.QUOTE_TRUTH_BLOQUEADO],
    safeErrors: [SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED],
  }),
  makeState({
    stateId: 'ready_for_human_review',
    stateKind: STATE_KINDS.HUMAN_REVIEW,
    displayLabel: 'Listo para revisión humana',
    description: 'El preview puede revisarse por humano, pero no puede convertirse en cotización real ni escribirse.',
    previewReferenceAllowed: true,
    allowedActions: [SAFE_ACTIONS.VIEW_REFERENCE_PREVIEW, SAFE_ACTIONS.OPEN_EVIDENCE_PANEL, SAFE_ACTIONS.REQUEST_HUMAN_REVIEW],
    requiredBadges: [BADGES.PREVIEW, BADGES.REQUIERE_REVISION_HUMANA, BADGES.NO_ES_COTIZACION],
    safeErrors: [SAFE_ERROR_CODES.HUMAN_REVIEW_REQUIRED],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSourceRefs() {
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
  const boundaryCatalog = boundary.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();
  return {
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness,
    },
    preview_vs_quote_truth_boundary: {
      adapter_id: boundaryCatalog.adapter_id,
      schemaVersion: boundaryCatalog.schemaVersion,
      overall_boundary_status: boundaryCatalog.overall_boundary_status,
    },
  };
}

function getQuotePreviewSafeUxStateModelRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_safe_ux_state_model_registry',
    overall_ux_state_status: 'safe_state_model_mapped_no_effects',
    ui_mutation_allowed_in_registry: false,
    quote_truth_creation_allowed_in_registry: false,
    quote_issuance_allowed_in_registry: false,
    quote_send_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    policy_write_allowed_in_registry: false,
    pipeline_write_allowed_in_registry: false,
    provider_runtime_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    parser_execution_allowed_in_registry: false,
    calculator_execution_allowed_in_registry: false,
    banxico_call_allowed_in_registry: false,
    required_ux_state_fields: [...REQUIRED_UX_STATE_FIELDS],
    safe_actions: Object.values(SAFE_ACTIONS),
    blocked_actions: Object.values(BLOCKED_ACTIONS),
    badges: Object.values(BADGES),
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    states: clone(SAFE_UX_STATES),
  };
}

function buildSafeUxStateModelSafeError(stateId, code = SAFE_ERROR_CODES.UX_STATE_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    state_id: stateId || null,
    state_kind: STATE_KINDS.BLOCKED,
    display_label: 'Estado UX no mapeado',
    description: 'El estado UX solicitado no está mapeado. Todo efecto real permanece bloqueado.',
    visible_allowed: true,
    preview_reference_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    write_allowed: false,
    allowed_actions: [SAFE_ACTIONS.REQUEST_HUMAN_REVIEW],
    blocked_actions: [...GLOBAL_BLOCKED_ACTIONS],
    required_badges: [BADGES.NO_ES_COTIZACION, BADGES.QUOTE_TRUTH_BLOQUEADO],
    safe_errors: [code, SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED, SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Safe UX state is not mapped. Quote truth, execution, and writes are blocked.',
    },
  };
}

function getSafeUxStateById(stateId) {
  const match = SAFE_UX_STATES.find((state) => state.state_id === stateId);
  return match ? clone(match) : buildSafeUxStateModelSafeError(stateId);
}

function getSafeUxStatesByKind(stateKind) {
  return clone(SAFE_UX_STATES.filter((state) => state.state_kind === stateKind));
}

function getVisibleSafeUxStates() {
  return clone(SAFE_UX_STATES.filter((state) => state.visible_allowed === true));
}

function getPreviewReferenceAllowedSafeUxStates() {
  return clone(SAFE_UX_STATES.filter((state) => state.preview_reference_allowed === true));
}

function getQuoteTruthBlockedSafeUxStates() {
  return clone(SAFE_UX_STATES.filter((state) => state.quote_truth_allowed === false));
}

function getExecutableSafeUxStates() {
  return clone(SAFE_UX_STATES.filter((state) => state.execution_allowed === true));
}

function getWritableSafeUxStates() {
  return clone(SAFE_UX_STATES.filter((state) => state.write_allowed === true));
}

function validateSafeUxStateShape(state) {
  const errors = [];
  if (!state || typeof state !== 'object') return { ok: false, valid: false, errors: ['ux_state_object_required'] };

  for (const field of REQUIRED_UX_STATE_FIELDS) {
    if (!(field in state)) errors.push(`missing_${field}`);
  }

  if (state.quote_truth_allowed !== false) errors.push('quote_truth_allowed_must_be_false');
  if (state.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (state.write_allowed !== false) errors.push('write_allowed_must_be_false');

  const badges = Array.isArray(state.required_badges) ? state.required_badges : [];
  if (!badges.includes(BADGES.NO_ES_COTIZACION) && state.state_id !== 'empty') {
    errors.push('non_empty_state_must_include_no_es_cotizacion_badge');
  }

  for (const [key, value] of Object.entries(state.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateSafeUxStateModelRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_ux_state_status !== 'safe_state_model_mapped_no_effects') errors.push('overall_ux_state_status_must_remain_no_effects');

  for (const flagName of [
    'ui_mutation_allowed_in_registry',
    'quote_truth_creation_allowed_in_registry',
    'quote_issuance_allowed_in_registry',
    'quote_send_allowed_in_registry',
    'quote_write_allowed_in_registry',
    'crm_write_allowed_in_registry',
    'policy_write_allowed_in_registry',
    'pipeline_write_allowed_in_registry',
    'provider_runtime_allowed_in_registry',
    'backend_connection_allowed_in_registry',
    'parser_execution_allowed_in_registry',
    'calculator_execution_allowed_in_registry',
    'banxico_call_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const states = Array.isArray(catalog.states) ? catalog.states : [];
  if (states.length !== 9) errors.push('nine_safe_ux_states_required');

  for (const state of states) {
    const result = validateSafeUxStateShape(state);
    if (!result.ok) errors.push(...result.errors.map((error) => `${state.state_id || 'unknown'}:${error}`));
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  STATE_KINDS,
  SAFE_ACTIONS,
  BLOCKED_ACTIONS,
  BADGES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_UX_STATE_FIELDS,
  SAFE_UX_STATES,
  getQuotePreviewSafeUxStateModelRegistryCatalog,
  getSafeUxStateById,
  getSafeUxStatesByKind,
  getVisibleSafeUxStates,
  getPreviewReferenceAllowedSafeUxStates,
  getQuoteTruthBlockedSafeUxStates,
  getExecutableSafeUxStates,
  getWritableSafeUxStates,
  buildSafeUxStateModelSafeError,
  validateSafeUxStateShape,
  validateSafeUxStateModelRegistryCatalog,
};
