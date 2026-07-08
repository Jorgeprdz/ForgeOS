'use strict';

const evidence = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');
const provenance = require('./quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');
const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_real_pdf_file_hash_provenance';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const SOURCE_DOCUMENT_KINDS = Object.freeze({
  REAL_PDF_CANDIDATE: 'real_pdf_candidate',
  UNDECLARED: 'undeclared',
});

const HASH_ALGORITHMS = Object.freeze({
  SHA256: 'sha256',
  UNDECLARED: 'undeclared',
});

const HASH_VERIFICATION_STATUSES = Object.freeze({
  NOT_VERIFIED: 'not_verified',
  DECLARED_ONLY: 'declared_only',
  REJECTED: 'rejected',
});

const FILE_READ_STATUSES = Object.freeze({
  NOT_READ: 'not_read',
  READ_NOT_AUTHORIZED: 'read_not_authorized',
});

const SAFE_ERROR_CODES = Object.freeze({
  BINDING_NOT_MAPPED: 'QUOTE_PREVIEW_REAL_PDF_FILE_HASH_BINDING_NOT_MAPPED',
  FILE_PATH_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_FILE_PATH_NOT_BOUND',
  HASH_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_HASH_NOT_BOUND',
  FILE_SIZE_NOT_BOUND: 'QUOTE_PREVIEW_REAL_PDF_FILE_SIZE_NOT_BOUND',
  PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_READ_NOT_AUTHORIZED',
  HASH_COMPUTE_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_HASH_COMPUTE_NOT_AUTHORIZED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_REAL_PDF_EXECUTION_NOT_AUTHORIZED',
  FIXTURE_AS_REAL_PDF_BLOCKED: 'QUOTE_PREVIEW_REAL_PDF_FIXTURE_AS_REAL_PDF_BLOCKED',
  UNVERIFIED_SOURCE_DOCUMENT_BLOCKED: 'QUOTE_PREVIEW_REAL_PDF_UNVERIFIED_SOURCE_DOCUMENT_BLOCKED',
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

const REQUIRED_BINDING_FIELDS = Object.freeze([
  'binding_id',
  'test_id',
  'candidate_file_path',
  'source_document_kind',
  'source_document_origin',
  'declared_sha256',
  'declared_file_size_bytes',
  'hash_algorithm',
  'hash_verification_status',
  'file_read_status',
  'execution_allowed',
  'safe_errors',
  'safety_flags',
]);

function freezeBinding(binding) {
  return Object.freeze({
    ...binding,
    related_evidence_refs: Object.freeze([...(binding.related_evidence_refs || [])]),
    related_provenance_refs: Object.freeze([...(binding.related_provenance_refs || [])]),
    blocked_misuse: Object.freeze([...(binding.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(binding.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(binding.safety_flags || {}) }),
  });
}

const REAL_PDF_FILE_HASH_BINDINGS = Object.freeze([
  freezeBinding({
    binding_id: 'binding_real_pdf_ocr_solucionline_file_hash',
    test_id: 'real_pdf_ocr_solucionline_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-pdf-ocr-test.js'],
    related_provenance_refs: ['prov_real_pdf_ocr_solucionline_file'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'ocr_before_file_hash_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeBinding({
    binding_id: 'binding_real_gmm_quote_pdf_file_hash',
    test_id: 'real_gmm_quote_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-gmm-quote-test.js'],
    related_provenance_refs: ['prov_real_gmm_quote_pdf_file'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'parser_before_file_hash_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeBinding({
    binding_id: 'binding_real_retirement_scenario_pdf_file_hash',
    test_id: 'real_retirement_scenario_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-retirement-scenario-test.js'],
    related_provenance_refs: ['prov_real_retirement_parser_pdf_file'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'parser_before_file_hash_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeBinding({
    binding_id: 'binding_real_retirement_mxn_scenario_pdf_file_hash',
    test_id: 'real_retirement_mxn_scenario_candidate',
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.REAL_PDF_CANDIDATE,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.SHA256,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: ['tests/real-retirement-mxn-scenario-test.js'],
    related_provenance_refs: ['prov_real_retirement_mxn_expected_values'],
    blocked_misuse: ['pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate', 'fixture_as_real_pdf', 'parser_before_file_hash_gate', 'calculator_before_expected_value_trace_gate'],
    safe_errors: [
      SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND,
      SAFE_ERROR_CODES.HASH_NOT_BOUND,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSourceRefs() {
  const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
  const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();

  return {
    evidence: {
      adapter_id: evidenceCatalog.adapter_id,
      schemaVersion: evidenceCatalog.schemaVersion,
      evidence_count: Array.isArray(evidenceCatalog.evidence) ? evidenceCatalog.evidence.length : 0,
    },
    provenance: {
      adapter_id: provenanceCatalog.adapter_id,
      schemaVersion: provenanceCatalog.schemaVersion,
      provenance_count: Array.isArray(provenanceCatalog.provenance) ? provenanceCatalog.provenance.length : 0,
    },
    readiness: {
      adapter_id: readinessCatalog.adapter_id,
      schemaVersion: readinessCatalog.schemaVersion,
      overall_readiness: readinessCatalog.overall_readiness,
    },
  };
}

function getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_real_pdf_file_hash_provenance_registry',
    overall_binding_status: 'not_bound_not_verified_not_ready',
    execution_allowed_in_registry: false,
    pdf_read_allowed_in_registry: false,
    pdf_hash_computation_allowed_in_registry: false,
    ocr_execution_allowed_in_registry: false,
    parser_execution_allowed_in_registry: false,
    calculator_execution_allowed_in_registry: false,
    banxico_call_allowed_in_registry: false,
    provider_call_allowed_in_registry: false,
    test_execution_allowed_in_registry: false,
    backend_connection_allowed_in_registry: false,
    quote_write_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_binding_fields: [...REQUIRED_BINDING_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    bindings: clone(REAL_PDF_FILE_HASH_BINDINGS),
  };
}

function getRealPdfFileHashBindingById(bindingId) {
  const match = REAL_PDF_FILE_HASH_BINDINGS.find((binding) => binding.binding_id === bindingId);
  return match ? clone(match) : buildRealPdfFileHashBindingSafeError(bindingId);
}

function getRealPdfFileHashBindingsByTestId(testId) {
  return clone(REAL_PDF_FILE_HASH_BINDINGS.filter((binding) => binding.test_id === testId));
}

function getUnboundRealPdfFileHashBindings() {
  return clone(
    REAL_PDF_FILE_HASH_BINDINGS.filter((binding) =>
      !binding.candidate_file_path ||
      !binding.declared_sha256 ||
      binding.declared_file_size_bytes === null ||
      binding.declared_file_size_bytes === undefined
    )
  );
}

function getNotVerifiedRealPdfFileHashBindings() {
  return clone(
    REAL_PDF_FILE_HASH_BINDINGS.filter((binding) =>
      binding.hash_verification_status !== HASH_VERIFICATION_STATUSES.DECLARED_ONLY
    )
  );
}

function buildRealPdfFileHashBindingSafeError(bindingId, code = SAFE_ERROR_CODES.BINDING_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    binding_id: bindingId || null,
    test_id: null,
    candidate_file_path: null,
    source_document_kind: SOURCE_DOCUMENT_KINDS.UNDECLARED,
    source_document_origin: 'not_declared',
    declared_sha256: null,
    declared_file_size_bytes: null,
    hash_algorithm: HASH_ALGORITHMS.UNDECLARED,
    hash_verification_status: HASH_VERIFICATION_STATUSES.NOT_VERIFIED,
    file_read_status: FILE_READ_STATUSES.NOT_READ,
    execution_allowed: false,
    related_evidence_refs: [],
    related_provenance_refs: [],
    blocked_misuse: ['unmapped_real_pdf_binding_execution', 'pdf_read_before_file_hash_gate', 'hash_compute_before_file_hash_gate'],
    safe_errors: [code, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Real PDF file/hash binding is not mapped. PDF read, hash computation, and execution are blocked.',
    },
  };
}

function validateRealPdfFileHashBindingShape(binding) {
  const errors = [];

  if (!binding || typeof binding !== 'object') {
    return { ok: false, valid: false, errors: ['binding_object_required'] };
  }

  for (const field of REQUIRED_BINDING_FIELDS) {
    if (!(field in binding)) errors.push(`missing_${field}`);
  }

  if (binding.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (binding.file_read_status !== FILE_READ_STATUSES.NOT_READ) errors.push('file_read_status_must_remain_not_read');
  if (binding.hash_verification_status !== HASH_VERIFICATION_STATUSES.NOT_VERIFIED) errors.push('hash_verification_status_must_remain_not_verified');

  for (const [key, value] of Object.entries(binding.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }

  const serialized = JSON.stringify(binding);
  const forbiddenFragments = [
    '"pdfRead":' + 'true',
    '"ocrExecution":' + 'true',
    '"parserExecution":' + 'true',
    '"calculatorExecution":' + 'true',
    '"banxicoCall":' + 'true',
    '"realEngineExecution":' + 'true',
    '"providerRuntime":' + 'true',
    '"quoteWrite":' + 'true',
    '"backendConnection":' + 'true',
    '"testExecution":' + 'true',
  ];

  for (const fragment of forbiddenFragments) {
    if (serialized.includes(fragment)) errors.push(`forbidden_true_fragment_${fragment}`);
  }

  return {
    ok: errors.length === 0,
    valid: errors.length === 0,
    errors,
  };
}

function validateRealPdfFileHashRegistryCatalog(catalog) {
  const errors = [];

  if (!catalog || typeof catalog !== 'object') {
    return { ok: false, valid: false, errors: ['catalog_object_required'] };
  }

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_binding_status !== 'not_bound_not_verified_not_ready') errors.push('overall_binding_status_must_remain_not_ready');

  for (const flagName of [
    'execution_allowed_in_registry',
    'pdf_read_allowed_in_registry',
    'pdf_hash_computation_allowed_in_registry',
    'ocr_execution_allowed_in_registry',
    'parser_execution_allowed_in_registry',
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

  const bindings = Array.isArray(catalog.bindings) ? catalog.bindings : [];
  if (!bindings.length) errors.push('bindings_required');

  for (const binding of bindings) {
    const result = validateRealPdfFileHashBindingShape(binding);
    if (!result.ok) errors.push(...result.errors.map((error) => `${binding.binding_id || 'unknown'}:${error}`));
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
  SOURCE_DOCUMENT_KINDS,
  HASH_ALGORITHMS,
  HASH_VERIFICATION_STATUSES,
  FILE_READ_STATUSES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_BINDING_FIELDS,
  REAL_PDF_FILE_HASH_BINDINGS,
  getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog,
  getRealPdfFileHashBindingById,
  getRealPdfFileHashBindingsByTestId,
  getUnboundRealPdfFileHashBindings,
  getNotVerifiedRealPdfFileHashBindings,
  buildRealPdfFileHashBindingSafeError,
  validateRealPdfFileHashBindingShape,
  validateRealPdfFileHashRegistryCatalog,
};
