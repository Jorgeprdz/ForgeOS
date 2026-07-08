'use strict';

const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const expectedTrace = require('./quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.parser_ownership.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.parser_ownership.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_parser_ownership';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const OWNERSHIP_STATUSES = Object.freeze({
  EXISTING_REFERENCE_ONLY: 'existing_reference_only',
  DECISION_REQUIRED: 'decision_required',
  NOT_PARSER_OWNER: 'not_parser_owner',
});

const PARSER_KINDS = Object.freeze({
  OCR_ENGINE_REFERENCE: 'ocr_engine_reference',
  RETIREMENT_PDF_PARSER: 'retirement_pdf_parser',
  GMM_PDF_PARSER: 'gmm_pdf_parser',
  PREVIEW_ENGINE_NOT_PARSER_TRUTH: 'preview_engine_not_parser_truth',
});

const SAFE_ERROR_CODES = Object.freeze({
  OWNERSHIP_NOT_MAPPED: 'QUOTE_PREVIEW_PARSER_OWNERSHIP_NOT_MAPPED',
  PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_EXECUTION_NOT_AUTHORIZED',
  PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_PDF_READ_NOT_AUTHORIZED',
  OCR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PARSER_OCR_EXECUTION_NOT_AUTHORIZED',
  DUPLICATE_PARSER_CREATION_BLOCKED: 'QUOTE_PREVIEW_DUPLICATE_PARSER_CREATION_BLOCKED',
  PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED: 'QUOTE_PREVIEW_PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED',
  UNOWNED_PARSER_EXECUTION_BLOCKED: 'QUOTE_PREVIEW_UNOWNED_PARSER_EXECUTION_BLOCKED',
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

const REQUIRED_OWNERSHIP_FIELDS = Object.freeze([
  'ownership_id',
  'parser_surface_id',
  'parser_kind',
  'file_path',
  'owner_domain',
  'candidate_role',
  'ownership_status',
  'execution_allowed',
  'blocked_misuse',
  'safe_errors',
  'safety_flags',
]);

function freezeOwnership(entry) {
  return Object.freeze({
    ...entry,
    blocked_misuse: Object.freeze([...(entry.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(entry.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(entry.safety_flags || {}) }),
  });
}

const PARSER_OWNERSHIP_ENTRIES = Object.freeze([
  freezeOwnership({
    ownership_id: 'owner_policy_ocr_engine_reference',
    parser_surface_id: 'policy_ocr_engine',
    parser_kind: PARSER_KINDS.OCR_ENGINE_REFERENCE,
    file_path: 'policy-operations/evidence/policy-ocr-engine.js',
    owner_domain: 'policy_operations_evidence',
    candidate_role: 'existing_ocr_engine_reference_only',
    ownership_status: OWNERSHIP_STATUSES.EXISTING_REFERENCE_ONLY,
    execution_allowed: false,
    blocked_misuse: ['ocr_engine_as_quote_truth', 'ocr_execution_before_pdf_file_hash_gate', 'ocr_execution_disguised_as_parser_ownership'],
    safe_errors: [
      SAFE_ERROR_CODES.OCR_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeOwnership({
    ownership_id: 'owner_solucionline_retirement_parser',
    parser_surface_id: 'solucionline_retirement_parser',
    parser_kind: PARSER_KINDS.RETIREMENT_PDF_PARSER,
    file_path: 'product-intelligence/evidence/solucionline-retirement-parser.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'retirement_parser_candidate',
    ownership_status: OWNERSHIP_STATUSES.DECISION_REQUIRED,
    execution_allowed: false,
    blocked_misuse: ['parser_execution_disguised_as_ownership', 'new_parser_before_ownership_decision', 'unowned_parser_execution'],
    safe_errors: [
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED,
      SAFE_ERROR_CODES.DUPLICATE_PARSER_CREATION_BLOCKED,
    ],
  }),
  freezeOwnership({
    ownership_id: 'owner_gmm_quote_parser',
    parser_surface_id: 'gmm_quote_parser',
    parser_kind: PARSER_KINDS.GMM_PDF_PARSER,
    file_path: 'product-intelligence/evidence/gmm-quote-parser.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'gmm_parser_candidate',
    ownership_status: OWNERSHIP_STATUSES.DECISION_REQUIRED,
    execution_allowed: false,
    blocked_misuse: ['parser_execution_disguised_as_ownership', 'new_parser_before_ownership_decision', 'unowned_parser_execution'],
    safe_errors: [
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED,
      SAFE_ERROR_CODES.DUPLICATE_PARSER_CREATION_BLOCKED,
    ],
  }),
  freezeOwnership({
    ownership_id: 'owner_quote_pdf_preview_engine',
    parser_surface_id: 'quote_pdf_preview_engine',
    parser_kind: PARSER_KINDS.PREVIEW_ENGINE_NOT_PARSER_TRUTH,
    file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',
    owner_domain: 'product_intelligence_evidence',
    candidate_role: 'preview_reference_only',
    ownership_status: OWNERSHIP_STATUSES.NOT_PARSER_OWNER,
    execution_allowed: false,
    blocked_misuse: ['preview_engine_as_parser_truth', 'preview_engine_as_quote_truth', 'parser_execution_disguised_as_preview'],
    safe_errors: [
      SAFE_ERROR_CODES.PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSourceRefs() {
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
  const expectedTraceCatalog = expectedTrace.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();
  return {
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness,
    },
    expected_trace: {
      adapter_id: expectedTraceCatalog.adapter_id,
      schemaVersion: expectedTraceCatalog.schemaVersion,
      overall_trace_status: expectedTraceCatalog.overall_trace_status,
    },
  };
}

function getQuotePreviewPdfEngineParserOwnershipRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_parser_ownership_registry',
    overall_ownership_status: 'ownership_mapped_execution_blocked',
    parser_execution_allowed_in_registry: false,
    pdf_read_allowed_in_registry: false,
    ocr_execution_allowed_in_registry: false,
    calculator_execution_allowed_in_registry: false,
    banxico_call_allowed_in_registry: false,
    provider_call_allowed_in_registry: false,
    test_execution_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_ownership_fields: [...REQUIRED_OWNERSHIP_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    ownership_entries: clone(PARSER_OWNERSHIP_ENTRIES),
  };
}

function buildParserOwnershipSafeError(ownershipId, code = SAFE_ERROR_CODES.OWNERSHIP_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    ownership_id: ownershipId || null,
    parser_surface_id: null,
    parser_kind: null,
    file_path: null,
    owner_domain: null,
    candidate_role: null,
    ownership_status: OWNERSHIP_STATUSES.DECISION_REQUIRED,
    execution_allowed: false,
    blocked_misuse: ['unmapped_parser_ownership_execution', 'parser_execution_disguised_as_ownership'],
    safe_errors: [code, SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Parser ownership is not mapped. Parser execution is blocked.',
    },
  };
}

function getParserOwnershipById(ownershipId) {
  const match = PARSER_OWNERSHIP_ENTRIES.find((entry) => entry.ownership_id === ownershipId);
  return match ? clone(match) : buildParserOwnershipSafeError(ownershipId);
}

function getParserOwnershipBySurfaceId(surfaceId) {
  const match = PARSER_OWNERSHIP_ENTRIES.find((entry) => entry.parser_surface_id === surfaceId);
  return match ? clone(match) : buildParserOwnershipSafeError(surfaceId);
}

function getParserOwnershipEntriesByStatus(status) {
  return clone(PARSER_OWNERSHIP_ENTRIES.filter((entry) => entry.ownership_status === status));
}

function getDecisionRequiredParserOwnershipEntries() {
  return getParserOwnershipEntriesByStatus(OWNERSHIP_STATUSES.DECISION_REQUIRED);
}

function getNonExecutableParserOwnershipEntries() {
  return clone(PARSER_OWNERSHIP_ENTRIES.filter((entry) => entry.execution_allowed === false));
}

function validateParserOwnershipShape(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { ok: false, valid: false, errors: ['parser_ownership_object_required'] };
  }

  for (const field of REQUIRED_OWNERSHIP_FIELDS) {
    if (!(field in entry)) errors.push(`missing_${field}`);
  }

  if (entry.execution_allowed !== false) errors.push('execution_allowed_must_be_false');

  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
  };
}

function validateParserOwnershipRegistryCatalog(catalog) {
  const errors = [];

  if (!catalog || typeof catalog !== 'object') {
    return { ok: false, valid: false, errors: ['catalog_object_required'] };
  }

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_ownership_status !== 'ownership_mapped_execution_blocked') errors.push('overall_ownership_status_must_remain_execution_blocked');

  for (const flagName of [
    'parser_execution_allowed_in_registry',
    'pdf_read_allowed_in_registry',
    'ocr_execution_allowed_in_registry',
    'calculator_execution_allowed_in_registry',
    'banxico_call_allowed_in_registry',
    'provider_call_allowed_in_registry',
    'test_execution_allowed_in_registry',
    'backend_connection_allowed_in_registry',
    'quote_write_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const entries = Array.isArray(catalog.ownership_entries) ? catalog.ownership_entries : [];
  if (entries.length !== 4) errors.push('four_parser_ownership_entries_required');

  for (const entry of entries) {
    const result = validateParserOwnershipShape(entry);
    if (!result.ok) errors.push(...result.errors.map((error) => `${entry.ownership_id || 'unknown'}:${error}`));
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  OWNERSHIP_STATUSES,
  PARSER_KINDS,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_OWNERSHIP_FIELDS,
  PARSER_OWNERSHIP_ENTRIES,
  getQuotePreviewPdfEngineParserOwnershipRegistryCatalog,
  getParserOwnershipById,
  getParserOwnershipBySurfaceId,
  getParserOwnershipEntriesByStatus,
  getDecisionRequiredParserOwnershipEntries,
  getNonExecutableParserOwnershipEntries,
  buildParserOwnershipSafeError,
  validateParserOwnershipShape,
  validateParserOwnershipRegistryCatalog,
};
