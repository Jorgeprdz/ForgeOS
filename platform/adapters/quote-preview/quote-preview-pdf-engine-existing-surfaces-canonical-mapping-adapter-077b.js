'use strict';

const ADAPTER_ID = 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1';
const SCHEMA_VERSION = 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1';
const DOMAIN_ID = 'quote_preview_pdf_engine_existing_surfaces_canonical_mapping';
const MODE = 'read_only';
const ROUTE_CLASS = 'preview_safe';

const CANONICAL_STATUSES = Object.freeze({
  CANDIDATE_CANONICAL: 'candidate_canonical',
  CURRENT_CANONICAL: 'current_canonical',
  DECISION_REQUIRED: 'canonical_decision_required',
  GOVERNANCE_ADAPTER: 'governance_adapter',
  NOT_PRESENT: 'not_present',
});

const SURFACE_TYPES = Object.freeze({
  PDF_EXTRACTION: 'pdf_extraction',
  PDF_PREVIEW_ORCHESTRATION: 'pdf_preview_orchestration',
  PARSER: 'parser',
  SUMMARY_ENGINE: 'summary_engine',
  CALCULATOR: 'calculator',
  RATE_PROVIDER: 'rate_provider',
  RATE_CACHE: 'rate_cache',
  PRODUCT_INTELLIGENCE_ADAPTER: 'product_intelligence_adapter',
  QUOTE_PREVIEW_BINDING_ADAPTER: 'quote_preview_binding_adapter',
  PDF_TO_PI_INTEGRATION_ADAPTER: 'pdf_to_product_intelligence_integration_adapter',
  REPO_PROMOTION_GUARDRAIL: 'repo_promotion_guardrail_adapter',
  REAL_TEST: 'real_test',
  FIXTURE_TEST: 'fixture_test',
});

const SAFE_ERROR_CODES = Object.freeze({
  SURFACE_NOT_MAPPED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_NOT_MAPPED',
  CANONICAL_DECISION_REQUIRED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_CANONICAL_DECISION_REQUIRED',
  NEW_EXTRACTOR_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_EXTRACTOR_BLOCKED_BEFORE_RECONCILIATION',
  NEW_PARSER_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_PARSER_BLOCKED_BEFORE_RECONCILIATION',
  NEW_CALCULATOR_BLOCKED: 'QUOTE_PREVIEW_PDF_NEW_CALCULATOR_BLOCKED_BEFORE_RECONCILIATION',
  EXECUTION_NOT_AUTHORIZED: 'QUOTE_PREVIEW_PDF_EXISTING_SURFACE_EXECUTION_NOT_AUTHORIZED',
});

const DEFAULT_SAFETY_FLAGS = Object.freeze({
  crmWrite: false, pipelineWrite: false, policyWrite: false, quoteWrite: false,
  taskCreate: false, calendarCreate: false, messageSend: false, authReal: false,
  providerRuntime: false, secretAccess: false, browserPersistence: false,
  realEngineExecution: false, realEffectsAllowed: false, realEffectsEnabled: false,
  backendConnection: false, pdfRead: false, ocrExecution: false,
  parserExecution: false, calculatorExecution: false, banxicoCall: false,
});

const REQUIRED_MAPPING_FIELDS = Object.freeze([
  'surface_id', 'file_path', 'surface_type', 'domain', 'product_family',
  'canonical_candidate', 'canonical_status', 'allowed_role', 'blocked_growth',
  'test_refs', 'engine_refs', 'product_intelligence_binding_required',
  'quote_preview_downstream_only', 'safe_errors', 'safety_flags',
]);

const BLOCKED_EFFECTS = Object.freeze([
  'pdf_read', 'ocr_execution', 'parser_execution', 'calculator_execution',
  'banxico_call', 'provider_call', 'quote_generation', 'quote_write',
  'backend_connection', 'real_engine_execution', 'invented_quote_truth',
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function surface(input) {
  return Object.freeze({
    ...input,
    product_family: Object.freeze([...(input.product_family || [])]),
    blocked_growth: Object.freeze([...(input.blocked_growth || [])]),
    test_refs: Object.freeze([...(input.test_refs || [])]),
    engine_refs: Object.freeze([...(input.engine_refs || [])]),
    safe_errors: Object.freeze([...(input.safe_errors || [])]),
    safety_flags: Object.freeze({ ...DEFAULT_SAFETY_FLAGS, ...(input.safety_flags || {}) }),
  });
}

const ALL_SURFACES = Object.freeze([
  surface({
    surface_id: 'pdf_extraction_policy_ocr_engine',
    file_path: 'policy-operations/evidence/policy-ocr-engine.js',
    surface_type: SURFACE_TYPES.PDF_EXTRACTION,
    domain: 'pdf_ocr_extraction',
    product_family: ['GMM', 'Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate canonical local PDF/OCR text extraction source; must not own parsing, calculation, or quote truth',
    blocked_growth: ['parser_ownership', 'calculator_ownership', 'quote_truth_creation', 'provider_runtime'],
    test_refs: ['tests/real-pdf-ocr-test.js', 'tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'pdf_preview_forge_quote_pdf_preview_engine',
    file_path: 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js',
    surface_type: SURFACE_TYPES.PDF_PREVIEW_ORCHESTRATION,
    domain: 'quote_pdf_preview',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate preview/orchestrator only; must delegate parser and calculator ownership',
    blocked_growth: ['universal_parser', 'universal_calculator', 'quote_truth_creation', 'banxico_ownership'],
    test_refs: ['tests/product-intelligence/forge-quote-pdf-preview-engine-test.js'],
    engine_refs: ['product-intelligence/evidence/solucionline-retirement-parser.js', 'retirement-future-udi-projection-engine.js', 'imagina-ser-future-mxn-bridge.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'parser_solucionline_retirement',
    file_path: 'product-intelligence/evidence/solucionline-retirement-parser.js',
    surface_type: SURFACE_TYPES.PARSER,
    domain: 'solucionline_retirement_parser',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical Solucionline parser; boundary must be reconciled against preview engine parsing',
    blocked_growth: ['parallel_parser_growth_before_decision', 'calculation_ownership', 'quote_truth_creation'],
    test_refs: ['tests/real-retirement-scenario-test.js', 'tests/real-retirement-mxn-scenario-test.js'],
    engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
  surface({
    surface_id: 'parser_gmm_quote',
    file_path: 'product-intelligence/evidence/gmm-quote-parser.js',
    surface_type: SURFACE_TYPES.PARSER,
    domain: 'gmm_quote_parser',
    product_family: ['GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate canonical GMM quote parser',
    blocked_growth: ['summary_ownership', 'calculator_ownership', 'quote_truth_creation'],
    test_refs: ['tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],
    engine_refs: ['gmm-quote-summary-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'summary_gmm_quote',
    file_path: 'gmm-quote-summary-engine.js',
    surface_type: SURFACE_TYPES.SUMMARY_ENGINE,
    domain: 'gmm_quote_summary',
    product_family: ['GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate GMM summary/read-model source; should consume parser outputs, not own parsing',
    blocked_growth: ['parser_ownership', 'pdf_extraction_ownership', 'quote_truth_creation'],
    test_refs: ['tests/real-gmm-quote-test.js', 'tests/gmm-out-of-pocket-test.js'],
    engine_refs: ['product-intelligence/evidence/gmm-quote-parser.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'calculator_retirement_future_udi_projection',
    file_path: 'retirement-future-udi-projection-engine.js',
    surface_type: SURFACE_TYPES.CALCULATOR,
    domain: 'udi_future_projection',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate canonical future UDI projection calculator',
    blocked_growth: ['pdf_extraction_ownership', 'parser_ownership', 'banxico_current_rate_ownership', 'quote_truth_creation'],
    test_refs: ['retirement-future-udi-projection-smoke-test.js'],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'bridge_imagina_ser_future_mxn',
    file_path: 'imagina-ser-future-mxn-bridge.js',
    surface_type: SURFACE_TYPES.CALCULATOR,
    domain: 'imagina_ser_future_mxn_bridge',
    product_family: ['Imagina Ser'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate Imagina Ser future MXN bridge; must delegate UDI projection',
    blocked_growth: ['pdf_extraction_ownership', 'parser_ownership', 'quote_truth_creation'],
    test_refs: ['imagina-ser-master-test.js', 'tests/real-retirement-mxn-scenario-test.js'],
    engine_refs: ['retirement-future-udi-projection-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'rates_exchange_rate_cache',
    file_path: 'exchange-rate-cache-engine.js',
    surface_type: SURFACE_TYPES.RATE_CACHE,
    domain: 'exchange_rate_cache',
    product_family: ['Imagina Ser', 'Solucionline', 'GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'candidate current-rate cache over Banxico providers',
    blocked_growth: ['direct_provider_runtime_in_preview', 'quote_truth_creation'],
    test_refs: ['imagina-ser-banxico-integration-test.js', 'imagina-ser-master-test.js'],
    engine_refs: ['shared-banxico-rate-engine.js', 'shared-banxico-edge-provider.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'rates_shared_banxico_direct',
    file_path: 'shared-banxico-rate-engine.js',
    surface_type: SURFACE_TYPES.RATE_PROVIDER,
    domain: 'banxico_direct_rates',
    product_family: ['Imagina Ser', 'Solucionline', 'GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'direct Banxico provider candidate; not authorized for preview runtime execution without later gate',
    blocked_growth: ['direct_preview_call', 'provider_runtime_without_gate', 'secret_access_in_preview'],
    test_refs: ['imagina-ser-banxico-integration-test.js'],
    engine_refs: ['exchange-rate-cache-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'rates_shared_banxico_edge_provider',
    file_path: 'shared-banxico-edge-provider.js',
    surface_type: SURFACE_TYPES.RATE_PROVIDER,
    domain: 'banxico_edge_provider',
    product_family: ['Imagina Ser', 'Solucionline', 'GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CANDIDATE_CANONICAL,
    allowed_role: 'edge Banxico provider candidate; not authorized for preview runtime execution without later gate',
    blocked_growth: ['direct_preview_call', 'provider_runtime_without_gate', 'secret_access_in_preview'],
    test_refs: ['imagina-ser-banxico-integration-test.js'],
    engine_refs: ['exchange-rate-cache-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'pi_read_model_adapter_073d',
    file_path: 'platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js',
    surface_type: SURFACE_TYPES.PRODUCT_INTELLIGENCE_ADAPTER,
    domain: 'product_intelligence_semantics',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CURRENT_CANONICAL,
    allowed_role: 'current upstream semantic authority until ontology promotion',
    blocked_growth: ['parser_execution', 'calculator_execution', 'quote_truth_creation'],
    test_refs: ['tests/product-intelligence/product-intelligence-read-model-adapter-073d-test.js'],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: false,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'quote_preview_pi_binding_adapter_074b',
    file_path: 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js',
    surface_type: SURFACE_TYPES.QUOTE_PREVIEW_BINDING_ADAPTER,
    domain: 'quote_preview_product_intelligence_binding',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CURRENT_CANONICAL,
    allowed_role: 'current Quote Preview to Product Intelligence binding',
    blocked_growth: ['parser_execution', 'calculator_execution', 'pdf_extraction_ownership', 'quote_truth_creation'],
    test_refs: ['tests/quote-preview-product-intelligence-binding-adapter-074b-test.js'],
    engine_refs: ['platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'quote_preview_pdf_pi_integration_adapter_075b',
    file_path: 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js',
    surface_type: SURFACE_TYPES.PDF_TO_PI_INTEGRATION_ADAPTER,
    domain: 'quote_preview_pdf_to_product_intelligence_integration',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.CURRENT_CANONICAL,
    allowed_role: 'current reference integration between PDF preview and Product Intelligence',
    blocked_growth: ['pdf_read', 'parser_execution', 'calculator_execution', 'quote_truth_creation'],
    test_refs: ['tests/quote-preview-pdf-product-intelligence-integration-adapter-075b-test.js'],
    engine_refs: ['platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'quote_preview_pdf_engine_repo_promotion_adapter_076b',
    file_path: 'platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js',
    surface_type: SURFACE_TYPES.REPO_PROMOTION_GUARDRAIL,
    domain: 'quote_preview_pdf_engine_repo_promotion',
    product_family: ['GMM', 'Vida Mujer', 'AVE', 'Imagina Ser', 'ORVI', 'SeguBeca'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.GOVERNANCE_ADAPTER,
    allowed_role: 'repo promotion guardrail only; must not become extractor/parser/calculator',
    blocked_growth: ['pdf_read', 'ocr_execution', 'parser_execution', 'calculator_execution', 'banxico_call', 'provider_runtime', 'quote_truth_creation'],
    test_refs: ['tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js'],
    engine_refs: ['platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js', 'platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js', 'platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js', 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
  }),
  surface({
    surface_id: 'test_real_pdf_ocr',
    file_path: 'tests/real-pdf-ocr-test.js',
    surface_type: SURFACE_TYPES.REAL_TEST,
    domain: 'real_pdf_ocr_test',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical real PDF/OCR evidence test',
    blocked_growth: ['runtime_effects', 'network_calls', 'invented_expected_values'],
    test_refs: [],
    engine_refs: ['policy-operations/evidence/policy-ocr-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
  surface({
    surface_id: 'test_real_gmm_quote',
    file_path: 'tests/real-gmm-quote-test.js',
    surface_type: SURFACE_TYPES.REAL_TEST,
    domain: 'real_gmm_quote_test',
    product_family: ['GMM'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical GMM quote evidence test',
    blocked_growth: ['invented_expected_values', 'quote_truth_creation'],
    test_refs: [],
    engine_refs: ['policy-operations/evidence/policy-ocr-engine.js', 'product-intelligence/evidence/gmm-quote-parser.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
  surface({
    surface_id: 'test_quote_pdf_preview_fixture',
    file_path: 'tests/product-intelligence/forge-quote-pdf-preview-engine-test.js',
    surface_type: SURFACE_TYPES.FIXTURE_TEST,
    domain: 'quote_pdf_preview_fixture_test',
    product_family: ['Imagina Ser', 'Solucionline'],
    canonical_candidate: true,
    canonical_status: CANONICAL_STATUSES.DECISION_REQUIRED,
    allowed_role: 'candidate canonical preview fixture test, not real extraction proof',
    blocked_growth: ['pretending_fixture_is_real_pdf_evidence', 'invented_expected_values'],
    test_refs: [],
    engine_refs: ['product-intelligence/evidence/forge-quote-pdf-preview-engine.js'],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED],
  }),
]);

function getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog() {
  return {
    adapter_id: ADAPTER_ID,
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    mapping_type: 'local_static_read_only_existing_surfaces_canonical_mapping',
    no_new_extractor_before_reconciliation: true,
    no_new_parser_before_reconciliation: true,
    no_new_calculator_before_reconciliation: true,
    product_intelligence_upstream: true,
    quote_preview_downstream: true,
    safe_errors: Object.values(SAFE_ERROR_CODES),
    required_mapping_fields: [...REQUIRED_MAPPING_FIELDS],
    blocked_effects: [...BLOCKED_EFFECTS],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    surfaces: clone(ALL_SURFACES),
  };
}

function getExistingSurfaceCanonicalMappingById(surfaceId) {
  const match = ALL_SURFACES.find((surface) => surface.surface_id === surfaceId);
  return match ? clone(match) : buildExistingSurfaceCanonicalMappingSafeError(surfaceId);
}

function getExistingSurfaceCanonicalMappingsByProductFamily(productFamily) {
  const normalized = String(productFamily || '').trim().toLowerCase();
  return clone(ALL_SURFACES.filter((surface) =>
    surface.product_family.some((family) => String(family).trim().toLowerCase() === normalized)
  ));
}

function getCanonicalDecisionRequiredSurfaces() {
  return clone(ALL_SURFACES.filter((surface) => surface.canonical_status === CANONICAL_STATUSES.DECISION_REQUIRED));
}

function getBlockedGrowthSurfaces() {
  return clone(ALL_SURFACES.filter((surface) => surface.blocked_growth.length > 0));
}

function buildExistingSurfaceCanonicalMappingSafeError(surfaceId, code = SAFE_ERROR_CODES.SURFACE_NOT_MAPPED) {
  return {
    schemaVersion: SCHEMA_VERSION,
    domainId: DOMAIN_ID,
    mode: MODE,
    routeClass: ROUTE_CLASS,
    readModelStatus: 'error',
    surface_id: surfaceId || null,
    file_path: null,
    surface_type: null,
    domain: null,
    product_family: [],
    canonical_candidate: false,
    canonical_status: CANONICAL_STATUSES.NOT_PRESENT,
    allowed_role: null,
    blocked_growth: ['new_surface_creation_before_reconciliation'],
    test_refs: [],
    engine_refs: [],
    product_intelligence_binding_required: true,
    quote_preview_downstream_only: true,
    safe_errors: [code, SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED, SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED],
    safety_flags: clone(DEFAULT_SAFETY_FLAGS),
    safe_error: {
      code,
      message: 'Existing quote/PDF surface is not mapped. New extractor/parser/calculator creation is blocked before reconciliation.',
    },
  };
}

function validateExistingSurfaceCanonicalMappingShape(surface) {
  const errors = [];
  if (!surface || typeof surface !== 'object') return { ok: false, valid: false, errors: ['surface_object_required'] };
  for (const field of REQUIRED_MAPPING_FIELDS) if (!(field in surface)) errors.push(`missing_${field}`);
  for (const [key, value] of Object.entries(surface.safety_flags || {})) {
    if (value !== false) errors.push(`safety_flag_not_false_${key}`);
  }
  const serialized = JSON.stringify(surface);
  for (const fragment of ['"pdfRead":'+'true','"ocrExecution":'+'true','"parserExecution":'+'true','"calculatorExecution":'+'true','"banxicoCall":'+'true','"realEngineExecution":'+'true','"providerRuntime":'+'true','"quoteWrite":'+'true','"backendConnection":'+'true']) {
    if (serialized.includes(fragment)) errors.push(`forbidden_true_fragment_${fragment}`);
  }
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

function validateExistingSurfacesCanonicalMappingCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { ok: false, valid: false, errors: ['catalog_object_required'] };
  if (catalog.schemaVersion !== SCHEMA_VERSION) errors.push('invalid_schemaVersion');
  if (catalog.domainId !== DOMAIN_ID) errors.push('invalid_domainId');
  if (catalog.mode !== MODE) errors.push('invalid_mode');
  if (catalog.routeClass !== ROUTE_CLASS) errors.push('invalid_routeClass');
  if (catalog.no_new_extractor_before_reconciliation !== true) errors.push('new_extractor_not_blocked');
  if (catalog.no_new_parser_before_reconciliation !== true) errors.push('new_parser_not_blocked');
  if (catalog.no_new_calculator_before_reconciliation !== true) errors.push('new_calculator_not_blocked');
  for (const surface of Array.isArray(catalog.surfaces) ? catalog.surfaces : []) {
    const result = validateExistingSurfaceCanonicalMappingShape(surface);
    if (!result.ok) errors.push(...result.errors.map((error) => `${surface.surface_id || 'unknown'}:${error}`));
  }
  return { ok: errors.length === 0, valid: errors.length === 0, errors };
}

module.exports = {
  ADAPTER_ID, SCHEMA_VERSION, DOMAIN_ID, MODE, ROUTE_CLASS,
  CANONICAL_STATUSES, SURFACE_TYPES, SAFE_ERROR_CODES, DEFAULT_SAFETY_FLAGS,
  REQUIRED_MAPPING_FIELDS, BLOCKED_EFFECTS, ALL_SURFACES,
  getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog,
  getExistingSurfaceCanonicalMappingById,
  getExistingSurfaceCanonicalMappingsByProductFamily,
  getCanonicalDecisionRequiredSurfaces,
  getBlockedGrowthSurfaces,
  buildExistingSurfaceCanonicalMappingSafeError,
  validateExistingSurfaceCanonicalMappingShape,
  validateExistingSurfacesCanonicalMappingCatalog,
};
