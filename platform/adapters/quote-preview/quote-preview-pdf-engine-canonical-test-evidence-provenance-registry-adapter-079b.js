'use strict';

const evidenceRegistry = require('./quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js');

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_canonical_test_evidence_provenance';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const PROVENANCE_TYPES = Object.freeze({
  REAL_PDF_FILE: 'real_pdf_file_provenance',
  OCR_TEXT_OUTPUT: 'ocr_text_output_provenance',
  FIXTURE_TEXT: 'fixture_text_provenance',
  EXPECTED_VALUE: 'expected_value_provenance',
  DETERMINISTIC_INPUT: 'deterministic_input_provenance',
  RATE_CACHE: 'rate_cache_provenance',
  PROVIDER_METADATA: 'provider_metadata_provenance',
  GOVERNANCE_ASSERTION: 'governance_assertion_provenance',
  ENGINE_REFERENCE: 'engine_reference_provenance',
});

const PROVENANCE_STATUSES = Object.freeze({
  SOURCE_TRACE_REQUIRED: 'source_trace_required',
  FILE_OR_HASH_REQUIRED: 'file_or_hash_required',
  FIXTURE_ONLY: 'fixture_only',
  GOVERNANCE_ONLY: 'governance_only',
  RUNTIME_GATE_REQUIRED: 'runtime_gate_required',
  ENGINE_REF_REQUIRED: 'engine_ref_required',
  DECISION_REQUIRED: 'decision_required',
});

const SOURCE_KINDS = Object.freeze({
  EXISTING_TEST_FILE: 'existing_test_file',
  EXISTING_ENGINE_FILE: 'existing_engine_file',
  TEXT_FIXTURE: 'text_fixture',
  REAL_PDF_FIXTURE: 'real_pdf_fixture',
  EXPECTED_VALUE_ASSERTION: 'expected_value_assertion',
  RATE_CACHE_METADATA: 'rate_cache_metadata',
  GOVERNANCE_ASSERTION: 'governance_assertion',
});

const VERIFICATION_POLICIES = Object.freeze({
  STATIC_CLASSIFICATION_ONLY: 'static_classification_only',
  REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION: 'require_file_path_or_hash_before_execution',
  REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION: 'require_expected_value_source_before_execution',
  REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL: 'require_runtime_gate_before_provider_call',
  REQUIRE_ENGINE_REF_MATCH_BEFORE_EXECUTION: 'require_engine_ref_match_before_execution',
});

const SAFE_ERROR_CODES = Object.freeze({
  PROVENANCE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_NOT_MAPPED',
  PROVENANCE_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_EXECUTION_NOT_AUTHORIZED',
  PDF_READ_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_PDF_READ_NOT_AUTHORIZED',
  OCR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_OCR_EXECUTION_NOT_AUTHORIZED',
  PARSER_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_PARSER_EXECUTION_NOT_AUTHORIZED',
  CALCULATOR_EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_CALCULATOR_EXECUTION_NOT_AUTHORIZED',
  BANXICO_CALL_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVENANCE_BANXICO_CALL_NOT_AUTHORIZED',
  FIXTURE_AS_REAL_PDF_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_FIXTURE_AS_REAL_PDF_BLOCKED',
  GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED',
  INVENTED_EXPECTED_VALUE_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_INVENTED_EXPECTED_VALUE_BLOCKED',
  UNTRACEABLE_PROJECTION_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_UNTRACEABLE_PROJECTION_BLOCKED',
  PROVIDER_RUNTIME_GATE_REQUIRED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_PROVIDER_RUNTIME_GATE_REQUIRED',
  DUPLICATE_ENGINE_CREATION_BLOCKED: 'QUOTE_PREVIEW_PDF_TEST_EVIDENCE_DUPLICATE_ENGINE_CREATION_BLOCKED',
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

const REQUIRED_PROVENANCE_FIELDS = Object.freeze([
  'provenance_id',
  'test_id',
  'file_path',
  'provenance_type',
  'provenance_status',
  'source_kind',
  'source_path',
  'source_hash_required',
  'expected_value_source_required',
  'engine_refs',
  'blocked_misuse',
  'verification_policy',
  'safe_errors',
  'safety_flags',
]);

function freezeEntry(entry) {
  return Object.freeze({
    ...entry,
    engine_refs: Object.freeze([...(entry.engine_refs || [])]),
    blocked_misuse: Object.freeze([...(entry.blocked_misuse || [])]),
    safe_errors: Object.freeze([...(entry.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(entry.safety_flags || {}) }),
  });
}

const PROVENANCE_REGISTRY = Object.freeze([
  freezeEntry({
    provenance_id: 'prov_real_pdf_ocr_solucionline_file',
    test_id: 'real_pdf_ocr_solucionline_candidate',
    file_path: 'tests/real-pdf-ocr-test.js',
    provenance_type: PROVENANCE_TYPES.REAL_PDF_FILE,
    provenance_status: PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED,
    source_kind: SOURCE_KINDS.REAL_PDF_FIXTURE,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: ['policy-operations/evidence/policy-ocr-engine.js'],
    blocked_misuse: ['fixture_as_real_pdf', 'missing_pdf_origin', 'unverified_source_document', 'parser_ownership'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_real_gmm_quote_pdf_file',
    test_id: 'real_gmm_quote_candidate',
    file_path: 'tests/real-gmm-quote-test.js',
    provenance_type: PROVENANCE_TYPES.REAL_PDF_FILE,
    provenance_status: PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED,
    source_kind: SOURCE_KINDS.REAL_PDF_FIXTURE,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: [
      'policy-operations/evidence/policy-ocr-engine.js',
      'product-intelligence/evidence/gmm-quote-parser.js',
    ],
    blocked_misuse: ['fixture_as_real_pdf', 'missing_pdf_origin', 'unverified_source_document', 'quote_truth_creation'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_gmm_out_of_pocket_expected_values',
    test_id: 'gmm_out_of_pocket_candidate',
    file_path: 'tests/gmm-out-of-pocket-test.js',
    provenance_type: PROVENANCE_TYPES.EXPECTED_VALUE,
    provenance_status: PROVENANCE_STATUSES.SOURCE_TRACE_REQUIRED,
    source_kind: SOURCE_KINDS.EXPECTED_VALUE_ASSERTION,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'product-intelligence/evidence/gmm-quote-parser.js',
      'gmm-quote-summary-engine.js',
    ],
    blocked_misuse: ['invented_expected_value', 'hardcoded_financial_truth', 'summary_parser_boundary_drift'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_real_retirement_parser_pdf_file',
    test_id: 'real_retirement_scenario_candidate',
    file_path: 'tests/real-retirement-scenario-test.js',
    provenance_type: PROVENANCE_TYPES.REAL_PDF_FILE,
    provenance_status: PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED,
    source_kind: SOURCE_KINDS.REAL_PDF_FIXTURE,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: [
      'product-intelligence/evidence/solucionline-retirement-parser.js',
      'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',
    ],
    blocked_misuse: ['fixture_as_real_pdf', 'parallel_parser_growth_before_decision', 'unverified_source_document'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_FILE_PATH_OR_HASH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_real_retirement_mxn_expected_values',
    test_id: 'real_retirement_mxn_scenario_candidate',
    file_path: 'tests/real-retirement-mxn-scenario-test.js',
    provenance_type: PROVENANCE_TYPES.EXPECTED_VALUE,
    provenance_status: PROVENANCE_STATUSES.SOURCE_TRACE_REQUIRED,
    source_kind: SOURCE_KINDS.EXPECTED_VALUE_ASSERTION,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'product-intelligence/evidence/solucionline-retirement-parser.js',
      'retirement-future-udi-projection-engine.js',
      'imagina-ser-future-mxn-bridge.js',
    ],
    blocked_misuse: ['invented_expected_value', 'untraceable_projection', 'invented_udi_growth', 'hardcoded_financial_truth'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
      SAFE_ERROR_CODES.UNTRACEABLE_PROJECTION_BLOCKED,
      SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_imagina_ser_master_rate_cache_boundary',
    test_id: 'imagina_ser_master_candidate',
    file_path: 'imagina-ser-master-test.js',
    provenance_type: PROVENANCE_TYPES.RATE_CACHE,
    provenance_status: PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED,
    source_kind: SOURCE_KINDS.RATE_CACHE_METADATA,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'imagina-ser-future-mxn-bridge.js',
      'retirement-future-udi-projection-engine.js',
      'exchange-rate-cache-engine.js',
    ],
    blocked_misuse: ['provider_runtime_without_gate', 'network_call_without_gate', 'secret_access_without_gate', 'invented_expected_value'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL,
    safe_errors: [
      SAFE_ERROR_CODES.PROVIDER_RUNTIME_GATE_REQUIRED,
      SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED,
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_imagina_ser_banxico_provider_metadata',
    test_id: 'imagina_ser_banxico_integration_candidate',
    file_path: 'imagina-ser-banxico-integration-test.js',
    provenance_type: PROVENANCE_TYPES.PROVIDER_METADATA,
    provenance_status: PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED,
    source_kind: SOURCE_KINDS.RATE_CACHE_METADATA,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: [
      'exchange-rate-cache-engine.js',
      'shared-banxico-rate-engine.js',
      'shared-banxico-edge-provider.js',
    ],
    blocked_misuse: ['provider_runtime_without_gate', 'network_call_without_gate', 'secret_access_without_gate'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL,
    safe_errors: [
      SAFE_ERROR_CODES.PROVIDER_RUNTIME_GATE_REQUIRED,
      SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_retirement_future_udi_deterministic_inputs',
    test_id: 'retirement_future_udi_projection_smoke_candidate',
    file_path: 'retirement-future-udi-projection-smoke-test.js',
    provenance_type: PROVENANCE_TYPES.DETERMINISTIC_INPUT,
    provenance_status: PROVENANCE_STATUSES.SOURCE_TRACE_REQUIRED,
    source_kind: SOURCE_KINDS.EXPECTED_VALUE_ASSERTION,
    source_path: null,
    source_hash_required: false,
    expected_value_source_required: true,
    engine_refs: ['retirement-future-udi-projection-engine.js'],
    blocked_misuse: ['invented_udi_growth', 'invented_current_udi', 'untraceable_projection', 'hardcoded_financial_truth'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_EXPECTED_VALUE_SOURCE_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED,
      SAFE_ERROR_CODES.UNTRACEABLE_PROJECTION_BLOCKED,
      SAFE_ERROR_CODES.CALCULATOR_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_quote_pdf_preview_fixture_text',
    test_id: 'quote_pdf_preview_fixture_candidate',
    file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',
    provenance_type: PROVENANCE_TYPES.FIXTURE_TEXT,
    provenance_status: PROVENANCE_STATUSES.FIXTURE_ONLY,
    source_kind: SOURCE_KINDS.TEXT_FIXTURE,
    source_path: 'inline_or_local_text_fixture',
    source_hash_required: true,
    expected_value_source_required: false,
    engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    blocked_misuse: ['real_pdf_claim', 'ocr_claim', 'quote_truth_claim', 'fixture_as_real_pdf'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [
      SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_repo_promotion_governance_assertion',
    test_id: 'repo_promotion_guardrail_candidate',
    file_path: 'tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js',
    provenance_type: PROVENANCE_TYPES.GOVERNANCE_ASSERTION,
    provenance_status: PROVENANCE_STATUSES.GOVERNANCE_ONLY,
    source_kind: SOURCE_KINDS.GOVERNANCE_ASSERTION,
    source_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js',
    source_hash_required: false,
    expected_value_source_required: false,
    engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js'],
    blocked_misuse: ['real_pdf_claim', 'parser_claim', 'extraction_claim', 'financial_value_claim'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [
      SAFE_ERROR_CODES.GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_existing_surfaces_mapping_governance_assertion',
    test_id: 'existing_surfaces_mapping_guardrail_candidate',
    file_path: 'tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js',
    provenance_type: PROVENANCE_TYPES.GOVERNANCE_ASSERTION,
    provenance_status: PROVENANCE_STATUSES.GOVERNANCE_ONLY,
    source_kind: SOURCE_KINDS.GOVERNANCE_ASSERTION,
    source_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js',
    source_hash_required: false,
    expected_value_source_required: false,
    engine_refs: ['platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js'],
    blocked_misuse: ['real_pdf_claim', 'parser_claim', 'extraction_claim', 'financial_value_claim'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [
      SAFE_ERROR_CODES.GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
  freezeEntry({
    provenance_id: 'prov_engine_refs_existing_catalog_requirement',
    test_id: 'all_cataloged_test_evidence',
    file_path: null,
    provenance_type: PROVENANCE_TYPES.ENGINE_REFERENCE,
    provenance_status: PROVENANCE_STATUSES.ENGINE_REF_REQUIRED,
    source_kind: SOURCE_KINDS.EXISTING_ENGINE_FILE,
    source_path: '077B_existing_surfaces_canonical_mapping_catalog',
    source_hash_required: false,
    expected_value_source_required: false,
    engine_refs: [
      'policy-operations/evidence/policy-ocr-engine.js',
      'product-intelligence/evidence/solucionline-retirement-parser.js',
      'product-intelligence/evidence/gmm-quote-parser.js',
      'gmm-quote-summary-engine.js',
      'retirement-future-udi-projection-engine.js',
      'imagina-ser-future-mxn-bridge.js',
      'exchange-rate-cache-engine.js',
      'shared-banxico-rate-engine.js',
      'shared-banxico-edge-provider.js',
    ],
    blocked_misuse: ['new_engine_creation', 'duplicate_parser_creation', 'duplicate_calculator_creation', 'duplicate_provider_creation'],
    verification_policy: VERIFICATION_POLICIES.REQUIRE_ENGINE_REF_MATCH_BEFORE_EXECUTION,
    safe_errors: [
      SAFE_ERROR_CODES.DUPLICATE_ENGINE_CREATION_BLOCKED,
      SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED,
    ],
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getEvidenceCatalog() {
  return evidenceRegistry.getQuotePreviewPdfCanonicalTestEvidenceRegistryCatalog();
}

function getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog() {
  const evidenceCatalog = getEvidenceCatalog();

  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    registry_type: 'local_static_read_only_test_evidence_provenance_registry',
    execution_allowed_in_registry: false,
    pdf_read_allowed_in_registry: false,
    ocr_execution_allowed_in_registry: false,
    parser_execution_allowed_in_registry: false,
    calculator_execution_allowed_in_registry: false,
    banxico_call_allowed_in_registry: false,
    provider_call_allowed_in_registry: false,
    test_execution_allowed_in_registry: false,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    required_provenance_fields: [...REQUIRED_PROVENANCE_FIELDS],
    safe_errors: Object.values(SAFE_ERROR_CODES),
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    evidence_catalog_ref: {
      adapter_id: evidenceCatalog.adapter_id,
      schemaVersion: evidenceCatalog.schemaVersion,
      evidence_count: Array.isArray(evidenceCatalog.evidence) ? evidenceCatalog.evidence.length : 0,
    },
    provenance: clone(PROVENANCE_REGISTRY),
  };
}

function getProvenanceById(provenanceId) {
  const match = PROVENANCE_REGISTRY.find((entry) => entry.provenance_id === provenanceId);
  return match ? clone(match) : buildProvenanceSafeError(provenanceId);
}

function getProvenanceByTestId(testId) {
  return clone(PROVENANCE_REGISTRY.filter((entry) => entry.test_id === testId));
}

function getProvenanceByType(provenanceType) {
  const normalized = String(provenanceType || '').trim().toLowerCase();
  return clone(PROVENANCE_REGISTRY.filter((entry) => entry.provenance_type.toLowerCase() === normalized));
}

function getExpectedValueProvenanceEntries() {
  return getProvenanceByType(PROVENANCE_TYPES.EXPECTED_VALUE);
}

function getFixtureOnlyProvenanceEntries() {
  return getProvenanceByType(PROVENANCE_TYPES.FIXTURE_TEXT);
}

function getGovernanceOnlyProvenanceEntries() {
  return getProvenanceByType(PROVENANCE_TYPES.GOVERNANCE_ASSERTION);
}

function getRuntimeGateProvenanceEntries() {
  return clone(PROVENANCE_REGISTRY.filter((entry) => entry.provenance_status === PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED));
}

function buildProvenanceSafeError(provenanceId, code = SAFE_ERROR_CODES.PROVENANCE_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    provenance_id: provenanceId || null,
    test_id: null,
    file_path: null,
    provenance_type: null,
    provenance_status: PROVENANCE_STATUSES.DECISION_REQUIRED,
    source_kind: null,
    source_path: null,
    source_hash_required: true,
    expected_value_source_required: true,
    engine_refs: [],
    blocked_misuse: ['new_provenance_creation_before_catalog_decision', 'unmapped_test_evidence_execution'],
    verification_policy: VERIFICATION_POLICIES.STATIC_CLASSIFICATION_ONLY,
    safe_errors: [code, SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Test evidence provenance is not mapped. Execution and new provenance creation are blocked before catalog decision.',
    },
  };
}

function validateProvenanceShape(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { ok: false, valid: false, errors: ['provenance_object_required'] };
  }

  for (const field of REQUIRED_PROVENANCE_FIELDS) {
    if (!(field in entry)) errors.push(`missing_${field}`);
  }

  if (entry.safety_flags) {
    for (const [key, value] of Object.entries(entry.safety_flags)) {
      if (value !== false) errors.push(`safety_flag_not_false_${key}`);
    }
  }

  const serialized = JSON.stringify(entry);
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

function validateProvenanceRegistryCatalog(catalog) {
  const errors = [];

  if (!catalog || typeof catalog !== 'object') {
    return { ok: false, valid: false, errors: ['catalog_object_required'] };
  }

  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');

  for (const flagName of [
    'execution_allowed_in_registry',
    'pdf_read_allowed_in_registry',
    'ocr_execution_allowed_in_registry',
    'parser_execution_allowed_in_registry',
    'calculator_execution_allowed_in_registry',
    'banxico_call_allowed_in_registry',
    'provider_call_allowed_in_registry',
    'test_execution_allowed_in_registry',
  ]) {
    if (catalog[flagName] !== false) errors.push(`${flagName}_must_be_false`);
  }

  for (const [key, value] of Object.entries(catalog.safety_flags || {})) {
    if (value !== false) errors.push(`catalog_safety_flag_not_false_${key}`);
  }

  const provenance = Array.isArray(catalog.provenance) ? catalog.provenance : [];
  if (!provenance.length) errors.push('provenance_required');

  for (const entry of provenance) {
    const result = validateProvenanceShape(entry);
    if (!result.ok) errors.push(...result.errors.map((error) => `${entry.provenance_id || 'unknown'}:${error}`));
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
  PROVENANCE_TYPES,
  PROVENANCE_STATUSES,
  SOURCE_KINDS,
  VERIFICATION_POLICIES,
  SAFE_ERROR_CODES,
  DEFAULT_SAFETY_FLAGS,
  REQUIRED_PROVENANCE_FIELDS,
  PROVENANCE_REGISTRY,
  getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog,
  getProvenanceById,
  getProvenanceByTestId,
  getProvenanceByType,
  getExpectedValueProvenanceEntries,
  getFixtureOnlyProvenanceEntries,
  getGovernanceOnlyProvenanceEntries,
  getRuntimeGateProvenanceEntries,
  buildProvenanceSafeError,
  validateProvenanceShape,
  validateProvenanceRegistryCatalog,
};
