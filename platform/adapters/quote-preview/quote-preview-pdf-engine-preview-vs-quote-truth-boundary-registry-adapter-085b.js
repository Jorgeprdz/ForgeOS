'use strict';

const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const deterministicInput = require('./quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_preview_vs_quote_truth_boundary';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const SURFACE_KINDS = Object.freeze({
  PREVIEW_ENGINE: 'preview_engine',
  REFERENCE_REGISTRY: 'reference_registry',
  REAL_QUOTE_AUTHORITY: 'real_quote_authority',
  USER_VISIBLE_PREVIEW_SURFACE: 'user_visible_preview_surface',
});

const TRUTH_CLASSES = Object.freeze({
  PREVIEW_REFERENCE_ONLY: 'preview_reference_only',
  NOT_VERIFIED_REFERENCE_ONLY: 'not_verified_reference_only',
  REAL_QUOTE_TRUTH_REQUIRES_PROVIDER_RUNTIME_GATE: 'real_quote_truth_requires_provider_runtime_gate',
  MUST_LABEL_AS_PREVIEW_NOT_QUOTE: 'must_label_as_preview_not_quote',
});

const BOUNDARY_STATUSES = Object.freeze({
  PREVIEW_ALLOWED_QUOTE_TRUTH_BLOCKED: 'preview_allowed_quote_truth_blocked',
  BLOCKED_UNTIL_REAL_EXECUTION_GATES: 'blocked_until_real_execution_gates',
  PREVIEW_LABEL_REQUIRED_QUOTE_TRUTH_BLOCKED: 'preview_label_required_quote_truth_blocked',
});

const SAFE_ERROR_CODES = Object.freeze({
  BOUNDARY_NOT_MAPPED: 'QUOTE_PREVIEW_TRUTH_BOUNDARY_NOT_MAPPED',
  QUOTE_TRUTH_CREATION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_TRUTH_CREATION_NOT_AUTHORIZED',
  QUOTE_ISSUANCE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_ISSUANCE_NOT_AUTHORIZED',
  QUOTE_SEND_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_SEND_NOT_AUTHORIZED',
  PROVIDER_RUNTIME_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PROVIDER_RUNTIME_NOT_AUTHORIZED',
  BACKEND_CONNECTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_BACKEND_CONNECTION_NOT_AUTHORIZED',
  QUOTE_WRITE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_QUOTE_WRITE_NOT_AUTHORIZED',
  PREVIEW_AS_QUOTE_TRUTH_BLOCKED: 'QUOTE_PREVIEW_PREVIEW_AS_QUOTE_TRUTH_BLOCKED',
  PREVIEW_LABEL_REQUIRED: 'QUOTE_PREVIEW_PREVIEW_LABEL_REQUIRED',
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

const REQUIRED_BOUNDARY_FIELDS = Object.freeze([
  'boundary_id',
  'surface_id',
  'surface_kind',
  'owner_domain',
  'allowed_truth_class',
  'preview_allowed',
  'quote_truth_allowed',
  'execution_allowed',
  'boundary_status',
  'blocked_misuse',
  'safe_errors',
  'safety_flags',
]);

function freezeBoundary(boundary) {
  return Object.freeze({
    ...boundary,
    blocked_misuse: Object.freeze([...(boundary.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(boundary.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(boundary.safety_flags || {}) }),
  });
}

const BOUNDARY_ENTRIES = Object.freeze([
  freezeBoundary({
    boundary_id: 'boundary_quote_preview_pdf_engine',
    surface_id: 'quote_pdf_preview_engine',
    surface_kind: SURFACE_KINDS.PREVIEW_ENGINE,
    owner_domain: 'product_intelligence_evidence',
    allowed_truth_class: TRUTH_CLASSES.PREVIEW_REFERENCE_ONLY,
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.PREVIEW_ALLOWED_QUOTE_TRUTH_BLOCKED,
    blocked_misuse: ['preview_as_quote_truth', 'preview_engine_as_binding_quote', 'unverified_value_as_quote_truth'],
    safe_errors: [
      SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_AS_QUOTE_TRUTH_BLOCKED,
      SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,
    ],
  }),
  freezeBoundary({
    boundary_id: 'boundary_quote_preview_expected_values',
    surface_id: 'expected_value_source_trace_registry',
    surface_kind: SURFACE_KINDS.REFERENCE_REGISTRY,
    owner_domain: 'quote_preview_pdf_engine',
    allowed_truth_class: TRUTH_CLASSES.NOT_VERIFIED_REFERENCE_ONLY,
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.PREVIEW_ALLOWED_QUOTE_TRUTH_BLOCKED,
    blocked_misuse: ['reference_value_as_bound_quote', 'unverified_value_as_quote_truth', 'expected_value_as_quote_truth'],
    safe_errors: [
      SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PREVIEW_AS_QUOTE_TRUTH_BLOCKED,
      SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,
    ],
  }),
  freezeBoundary({
    boundary_id: 'boundary_real_quote_truth_provider_backend',
    surface_id: 'provider_backend_quote_truth',
    surface_kind: SURFACE_KINDS.REAL_QUOTE_AUTHORITY,
    owner_domain: 'provider_backend',
    allowed_truth_class: TRUTH_CLASSES.REAL_QUOTE_TRUTH_REQUIRES_PROVIDER_RUNTIME_GATE,
    preview_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.BLOCKED_UNTIL_REAL_EXECUTION_GATES,
    blocked_misuse: ['provider_quote_truth_without_runtime_gate', 'backend_quote_write_without_gate', 'quote_issuance_without_authority'],
    safe_errors: [
      SAFE_ERROR_CODES.PROVIDER_RUNTIME_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.BACKEND_CONNECTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_ISSUANCE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_SEND_NOT_AUTHORIZED,
    ],
  }),
  freezeBoundary({
    boundary_id: 'boundary_user_visible_quote_preview_ui',
    surface_id: 'quote_preview_ui',
    surface_kind: SURFACE_KINDS.USER_VISIBLE_PREVIEW_SURFACE,
    owner_domain: 'forge_ui',
    allowed_truth_class: TRUTH_CLASSES.MUST_LABEL_AS_PREVIEW_NOT_QUOTE,
    preview_allowed: true,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.PREVIEW_LABEL_REQUIRED_QUOTE_TRUTH_BLOCKED,
    blocked_misuse: ['user_visible_quote_without_preview_label', 'preview_as_binding_quote', 'policy_or_crm_write_from_preview'],
    safe_errors: [
      SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED,
      SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_SEND_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSourceRefs() {
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
  const deterministicCatalog = deterministicInput.getQuotePreviewPdfEngineDeterministicInputSourceTraceRegistryCatalog();

  return {
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness,
    },
    deterministic_input: {
      adapter_id: deterministicCatalog.adapter_id,
      schemaVersion: deterministicCatalog.schemaVersion,
      overall_input_trace_status: deterministicCatalog.overall_input_trace_status,
    },
  };
}

function getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_preview_vs_quote_truth_boundary_registry',
    overall_boundary_status: 'preview_boundary_mapped_quote_truth_blocked',
    preview_reference_allowed_in_registry: true,
    quote_truth_creation_allowed_in_registry: false,
    quote_issuance_allowed_in_registry: false,
    quote_send_allowed_in_registry: false,
    provider_runtime_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    crm_write_allowed_in_registry: false,
    policy_write_allowed_in_registry: false,
    pipeline_write_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_boundary_fields: [...REQUIRED_BOUNDARY_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    boundary_entries: clone(BOUNDARY_ENTRIES),
  };
}

function buildPreviewVsQuoteTruthBoundarySafeError(boundaryId, code = SAFE_ERROR_CODES.BOUNDARY_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    boundary_id: boundaryId || null,
    surface_id: null,
    surface_kind: null,
    owner_domain: null,
    allowed_truth_class: null,
    preview_allowed: false,
    quote_truth_allowed: false,
    execution_allowed: false,
    boundary_status: BOUNDARY_STATUSES.BLOCKED_UNTIL_REAL_EXECUTION_GATES,
    blocked_misuse: ['unmapped_boundary_quote_truth_creation', 'preview_as_quote_truth'],
    safe_errors: [code, SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED, SAFE_ERROR_CODES.QUOTE_WRITE_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Preview vs Quote Truth boundary is not mapped. Quote truth creation is blocked.',
    },
  };
}

function getPreviewVsQuoteTruthBoundaryById(boundaryId) {
  const match = BOUNDARY_ENTRIES.find((entry) => entry.boundary_id === boundaryId);
  return match ? clone(match) : buildPreviewVsQuoteTruthBoundarySafeError(boundaryId);
}

function getPreviewVsQuoteTruthBoundaryBySurfaceId(surfaceId) {
  const match = BOUNDARY_ENTRIES.find((entry) => entry.surface_id === surfaceId);
  return match ? clone(match) : buildPreviewVsQuoteTruthBoundarySafeError(surfaceId);
}

function getPreviewAllowedBoundaryEntries() {
  return clone(BOUNDARY_ENTRIES.filter((entry) => entry.preview_allowed === true));
}

function getQuoteTruthBlockedBoundaryEntries() {
  return clone(BOUNDARY_ENTRIES.filter((entry) => entry.quote_truth_allowed === false));
}

function getUserVisiblePreviewBoundaryEntries() {
  return clone(BOUNDARY_ENTRIES.filter((entry) => entry.surface_kind === SURFACE_KINDS.USER_VISIBLE_PREVIEW_SURFACE));
}

function validatePreviewVsQuoteTruthBoundaryShape(entry) {
  const errors = [];
  if (!entry || typeof entry !== 'object') return { ok: false, valid: false, errors: ['boundary_object_required'] };

  for (const field of REQUIRED_BOUNDARY_FIELDS) {
    if (!(field in entry)) errors.push(`missing_${field}`);
  }

  if (entry.quote_truth_allowed !== false) errors.push('quote_truth_allowed_must_be_false');
  if (entry.execution_allowed !== false) errors.push('execution_allowed_must_be_false');

  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validatePreviewVsQuoteTruthBoundaryRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_boundary_status !== 'preview_boundary_mapped_quote_truth_blocked') errors.push('overall_boundary_status_must_remain_quote_truth_blocked');

  for (const flagName of [
    'quote_truth_creation_allowed_in_registry',
    'quote_issuance_allowed_in_registry',
    'quote_send_allowed_in_registry',
    'provider_runtime_allowed_in_registry',
    'backend_connection_allowed_in_registry',
    'quote_write_allowed_in_registry',
    'crm_write_allowed_in_registry',
    'policy_write_allowed_in_registry',
    'pipeline_write_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const entries = Array.isArray(catalog.boundary_entries) ? catalog.boundary_entries : [];
  if (entries.length !== 4) errors.push('four_boundary_entries_required');

  for (const entry of entries) {
    const result = validatePreviewVsQuoteTruthBoundaryShape(entry);
    if (!result.ok) errors.push(...result.errors.map((error) => `${entry.boundary_id || 'unknown'}:${error}`));
  }

  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  SURFACE_KINDS,
  TRUTH_CLASSES,
  BOUNDARY_STATUSES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_BOUNDARY_FIELDS,
  BOUNDARY_ENTRIES,
  getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog,
  getPreviewVsQuoteTruthBoundaryById,
  getPreviewVsQuoteTruthBoundaryBySurfaceId,
  getPreviewAllowedBoundaryEntries,
  getQuoteTruthBlockedBoundaryEntries,
  getUserVisiblePreviewBoundaryEntries,
  buildPreviewVsQuoteTruthBoundarySafeError,
  validatePreviewVsQuoteTruthBoundaryShape,
  validatePreviewVsQuoteTruthBoundaryRegistryCatalog,
};
