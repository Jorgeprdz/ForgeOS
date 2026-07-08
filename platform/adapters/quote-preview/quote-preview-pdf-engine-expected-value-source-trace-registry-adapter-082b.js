'use strict';

const evidence = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');
const provenance = require('./quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');
const readiness = require('./quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js');
const fileHash = require('./quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_expected_value_source_trace';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const SOURCE_TRACE_STATUSES = Object.freeze({ NOT_BOUND: 'not_bound' });
const VERIFICATION_STATUSES = Object.freeze({ NOT_VERIFIED: 'not_verified' });
const EXPECTED_VALUE_KINDS = Object.freeze({
  GMM_OUT_OF_POCKET_EXPECTED_VALUE: 'gmm_out_of_pocket_expected_value',
  RETIREMENT_MXN_PROJECTION_EXPECTED_VALUE: 'retirement_mxn_projection_expected_value',
  DETERMINISTIC_PROJECTION_INPUT_TRACE: 'deterministic_projection_input_trace',
});

const SAFE_ERROR_CODES = Object.freeze({
  TRACE_NOT_MAPPED: 'QUOTE_PREVIEW_EXPECTED_VALUE_SOURCE_TRACE_NOT_MAPPED',
  SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_EXPECTED_VALUE_SOURCE_TRACE_NOT_BOUND',
  EXPECTED_VALUE_NOT_VERIFIED: 'QUOTE_PREVIEW_EXPECTED_VALUE_NOT_VERIFIED',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_EXECUTION_NOT_AUTHORIZED',
  INVENTED_EXPECTED_VALUE_BLOCKED: 'QUOTE_PREVIEW_INVENTED_EXPECTED_VALUE_BLOCKED',
  UNTRACEABLE_PROJECTION_BLOCKED: 'QUOTE_PREVIEW_UNTRACEABLE_PROJECTION_BLOCKED',
  DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND: 'QUOTE_PREVIEW_DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND',
  PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_PARSER_EXECUTION_NOT_AUTHORIZED',
  CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_CALCULATOR_EXECUTION_NOT_AUTHORIZED',
  BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_EXPECTED_VALUE_BANXICO_CALL_NOT_AUTHORIZED',
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

const REQUIRED_TRACE_FIELDS = Object.freeze([
  'trace_id',
  'test_id',
  'expected_value_kind',
  'product_family',
  'source_registry_refs',
  'required_source_trace',
  'source_trace_status',
  'verification_status',
  'execution_allowed',
  'blocked_misuse',
  'safe_errors',
  'safety_flags',
]);

function freezeTrace(trace) {
  return Object.freeze({
    ...trace,
    source_registry_refs: Object.freeze([...(trace.source_registry_refs || [])]),
    blocked_misuse: Object.freeze([...(trace.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(trace.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(trace.safety_flags || {}) }),
  });
}

function makeTrace(params) {
  return freezeTrace({
    trace_id: params.trace_id,
    test_id: params.test_id,
    expected_value_kind: params.expected_value_kind,
    product_family: params.product_family,
    source_registry_refs: params.source_registry_refs,
    required_source_trace: params.required_source_trace,
    source_trace_status: SOURCE_TRACE_STATUSES.NOT_BOUND,
    verification_status: VERIFICATION_STATUSES.NOT_VERIFIED,
    execution_allowed: false,
    blocked_misuse: params.blocked_misuse,
    safe_errors: [
      SAFE_ERROR_CODES.SOURCE_TRACE_NOT_BOUND,
      SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED,
      SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED,
      ...params.safe_errors,
    ],
  });
}

const EXPECTED_VALUE_SOURCE_TRACES = Object.freeze([
  makeTrace({
    trace_id: 'trace_gmm_out_of_pocket_expected_values',
    test_id: 'gmm_out_of_pocket_candidate',
    expected_value_kind: EXPECTED_VALUE_KINDS.GMM_OUT_OF_POCKET_EXPECTED_VALUE,
    product_family: 'gmm',
    source_registry_refs: ['prov_gmm_out_of_pocket_expected_values', 'tests/gmm-out-of-pocket-test.js', 'gmm-quote-summary-engine.js'],
    required_source_trace: 'pdf_derived_fields_or_fixture_source_or_existing_summary_engine',
    blocked_misuse: ['invented_expected_value', 'fixture_as_real_pdf', 'governance_as_extraction_proof', 'parser_execution_before_source_trace'],
    safe_errors: [SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED, SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED],
  }),
  makeTrace({
    trace_id: 'trace_real_retirement_mxn_expected_values',
    test_id: 'real_retirement_mxn_scenario_candidate',
    expected_value_kind: EXPECTED_VALUE_KINDS.RETIREMENT_MXN_PROJECTION_EXPECTED_VALUE,
    product_family: 'retirement',
    source_registry_refs: ['prov_real_retirement_mxn_expected_values', 'tests/real-retirement-mxn-scenario-test.js', 'imagina-ser-future-mxn-bridge.js', 'retirement-future-udi-projection-engine.js'],
    required_source_trace: 'pdf_derived_fields_plus_existing_projection_engine_inputs',
    blocked_misuse: ['invented_expected_value', 'untraceable_projection', 'invented_udi_growth', 'invented_current_udi', 'calculator_execution_before_source_trace'],
    safe_errors: [SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED, SAFE_ERROR_CODES.UNTRACEABLE_PROJECTION_BLOCKED, SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED],
  }),
  makeTrace({
    trace_id: 'trace_retirement_future_udi_deterministic_inputs',
    test_id: 'retirement_future_udi_projection_smoke_candidate',
    expected_value_kind: EXPECTED_VALUE_KINDS.DETERMINISTIC_PROJECTION_INPUT_TRACE,
    product_family: 'retirement',
    source_registry_refs: ['prov_retirement_future_udi_deterministic_inputs', 'retirement-future-udi-projection-smoke-test.js', 'retirement-future-udi-projection-engine.js'],
    required_source_trace: 'existing_repo_engine_or_config_for_udi_current_value_and_growth_assumption',
    blocked_misuse: ['invented_udi_growth', 'invented_current_udi', 'calculator_execution_before_input_trace', 'banxico_call_disguised_as_trace'],
    safe_errors: [SAFE_ERROR_CODES.DETERMINISTIC_INPUT_SOURCE_TRACE_NOT_BOUND, SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED],
  }),
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function getSourceRefs() {
  const evidenceCatalog = evidence.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
  const provenanceCatalog = provenance.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();
  const readinessCatalog = readiness.getQuotePreviewPdfCanonicalExecutionReadinessReviewMatrixCatalog();
  const fileHashCatalog = fileHash.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog();
  return {
    evidence: { adapter_id: evidenceCatalog.adapter_id, schemaVersion: evidenceCatalog.schemaVersion },
    provenance: { adapter_id: provenanceCatalog.adapter_id, schemaVersion: provenanceCatalog.schemaVersion },
    readiness: { adapter_id: readinessCatalog.adapter_id, schemaVersion: readinessCatalog.schemaVersion, overall_readiness: readinessCatalog.overall_readiness },
    file_hash: { adapter_id: fileHashCatalog.adapter_id, schemaVersion: fileHashCatalog.schemaVersion, overall_binding_status: fileHashCatalog.overall_binding_status },
  };
}

function getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_expected_value_source_trace_registry',
    overall_trace_status: 'not_bound_not_verified_not_ready',
    execution_allowed_in_registry: false,
    expected_value_verification_allowed_in_registry: false,
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
    required_trace_fields: [...REQUIRED_TRACE_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    source_refs: getSourceRefs(),
    traces: clone(EXPECTED_VALUE_SOURCE_TRACES),
  };
}

function buildExpectedValueSourceTraceSafeError(traceId, code = SAFE_ERROR_CODES.TRACE_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    trace_id: traceId || null,
    test_id: null,
    expected_value_kind: null,
    product_family: null,
    source_registry_refs: [],
    required_source_trace: null,
    source_trace_status: SOURCE_TRACE_STATUSES.NOT_BOUND,
    verification_status: VERIFICATION_STATUSES.NOT_VERIFIED,
    execution_allowed: false,
    blocked_misuse: ['unmapped_expected_value_trace_execution', 'invented_expected_value', 'verification_before_source_trace'],
    safe_errors: [code, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED, SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: { code, message: 'Expected-value source trace is not mapped. Verification and execution are blocked.' },
  };
}

function getExpectedValueSourceTraceById(traceId) {
  const match = EXPECTED_VALUE_SOURCE_TRACES.find((trace) => trace.trace_id === traceId);
  return match ? clone(match) : buildExpectedValueSourceTraceSafeError(traceId);
}
function getExpectedValueSourceTracesByTestId(testId) { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.test_id === testId)); }
function getExpectedValueSourceTracesByProductFamily(productFamily) { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.product_family === productFamily)); }
function getUnboundExpectedValueSourceTraces() { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.source_trace_status === SOURCE_TRACE_STATUSES.NOT_BOUND)); }
function getNotVerifiedExpectedValueSourceTraces() { return clone(EXPECTED_VALUE_SOURCE_TRACES.filter((trace) => trace.verification_status === VERIFICATION_STATUSES.NOT_VERIFIED)); }

function validateExpectedValueSourceTraceShape(trace) {
  const errors = [];
  if (!trace || typeof trace !== 'object') return { ok: false, valid: false, errors: ['trace_object_required'] };
  for (const field of REQUIRED_TRACE_FIELDS) if (!(field in trace)) errors.push(`missing_${field}`);
  if (trace.execution_allowed !== false) errors.push('execution_allowed_must_be_false');
  if (trace.source_trace_status !== SOURCE_TRACE_STATUSES.NOT_BOUND) errors.push('source_trace_status_must_remain_not_bound');
  if (trace.verification_status !== VERIFICATION_STATUSES.NOT_VERIFIED) errors.push('verification_status_must_remain_not_verified');
  for (const [key, value] of Object.entries(trace.safety_flags || {})) if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateExpectedValueSourceTraceRegistryCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };
  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.overall_trace_status !== 'not_bound_not_verified_not_ready') errors.push('overall_trace_status_must_remain_not_ready');
  for (const flagName of [
    'execution_allowed_in_registry',
    'expected_value_verification_allowed_in_registry',
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
  ]) if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  const traces = Array.isArray(catalog.traces) ? catalog.traces : [];
  if (traces.length !== 3) errors.push('three_expected_value_traces_required');
  for (const trace of traces) {
    const result = validateExpectedValueSourceTraceShape(trace);
    if (!result.ok) errors.push(...result.errors.map((error) => `${trace.trace_id || 'unknown'}:${error}`));
  }
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID,
  SCHEMA_VERSION,
  DOMAIN_ID,
  MODE,
  ROUTE_CLASS,
  SOURCE_TRACE_STATUSES,
  VERIFICATION_STATUSES,
  EXPECTED_VALUE_KINDS,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_TRACE_FIELDS,
  EXPECTED_VALUE_SOURCE_TRACES,
  getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog,
  getExpectedValueSourceTraceById,
  getExpectedValueSourceTracesByTestId,
  getExpectedValueSourceTracesByProductFamily,
  getUnboundExpectedValueSourceTraces,
  getNotVerifiedExpectedValueSourceTraces,
  buildExpectedValueSourceTraceSafeError,
  validateExpectedValueSourceTraceShape,
  validateExpectedValueSourceTraceRegistryCatalog,
};
