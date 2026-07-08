'use strict';

const assert = require('node:assert/strict');
const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.existing_surfaces.canonical_mapping.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfExistingSurfacesCanonicalMappingCatalog();
assert.equal(catalog.no_new_extractor_before_reconciliation, true);
assert.equal(catalog.no_new_parser_before_reconciliation, true);
assert.equal(catalog.no_new_calculator_before_reconciliation, true);
assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert.equal(adapter.validateExistingSurfacesCanonicalMappingCatalog(catalog).ok, true);

for (const surface of catalog.surfaces) {
  for (const field of adapter.REQUIRED_MAPPING_FIELDS) assert(field in surface, `${surface.surface_id} missing ${field}`);
  assert.equal(adapter.validateExistingSurfaceCanonicalMappingShape(surface).ok, true);
}

const byId = (id) => adapter.getExistingSurfaceCanonicalMappingById(id);

assert.equal(byId('pdf_extraction_policy_ocr_engine').file_path, 'policy-operations/evidence/policy-ocr-engine.js');
assert(byId('pdf_extraction_policy_ocr_engine').blocked_growth.includes('parser_ownership'));

assert.equal(byId('pdf_preview_forge_quote_pdf_preview_engine').file_path, 'product-intelligence/evidence/forge-quote-pdf-preview-engine.js');
assert(byId('pdf_preview_forge_quote_pdf_preview_engine').blocked_growth.includes('universal_parser'));
assert(byId('pdf_preview_forge_quote_pdf_preview_engine').blocked_growth.includes('universal_calculator'));

assert.equal(byId('parser_solucionline_retirement').canonical_status, adapter.CANONICAL_STATUSES.DECISION_REQUIRED);
assert(byId('parser_solucionline_retirement').safe_errors.includes(adapter.SAFE_ERROR_CODES.CANONICAL_DECISION_REQUIRED));

assert.equal(byId('parser_gmm_quote').file_path, 'product-intelligence/evidence/gmm-quote-parser.js');
assert.equal(byId('summary_gmm_quote').file_path, 'gmm-quote-summary-engine.js');
assert(byId('summary_gmm_quote').blocked_growth.includes('parser_ownership'));

assert.equal(byId('calculator_retirement_future_udi_projection').file_path, 'retirement-future-udi-projection-engine.js');
assert.equal(byId('bridge_imagina_ser_future_mxn').file_path, 'imagina-ser-future-mxn-bridge.js');
assert(byId('bridge_imagina_ser_future_mxn').engine_refs.includes('retirement-future-udi-projection-engine.js'));

assert.equal(byId('rates_exchange_rate_cache').file_path, 'exchange-rate-cache-engine.js');
assert(byId('rates_exchange_rate_cache').engine_refs.includes('shared-banxico-rate-engine.js'));

assert.equal(byId('quote_preview_pdf_engine_repo_promotion_adapter_076b').canonical_status, adapter.CANONICAL_STATUSES.GOVERNANCE_ADAPTER);
assert(byId('quote_preview_pdf_engine_repo_promotion_adapter_076b').blocked_growth.includes('pdf_read'));
assert(byId('quote_preview_pdf_engine_repo_promotion_adapter_076b').blocked_growth.includes('parser_execution'));

const missing = byId('missing_surface');
assert.equal(missing.readModelStatus, 'error');
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.NEW_EXTRACTOR_BLOCKED));

const decisionRequired = adapter.getCanonicalDecisionRequiredSurfaces().map((s) => s.surface_id);
assert(decisionRequired.includes('parser_solucionline_retirement'));
assert(decisionRequired.includes('test_real_pdf_ocr'));
assert(decisionRequired.includes('test_quote_pdf_preview_fixture'));

const gmm = adapter.getExistingSurfaceCanonicalMappingsByProductFamily('GMM').map((s) => s.surface_id);
assert(gmm.includes('parser_gmm_quote'));
assert(gmm.includes('summary_gmm_quote'));

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) assert.equal(value, false, `${key} must be false`);

const combined = JSON.stringify({ catalog, missing, flags: adapter.DEFAULT_SAFETY_FLAGS });
for (const fragment of ['"pdfRead":'+'true','"ocrExecution":'+'true','"parserExecution":'+'true','"calculatorExecution":'+'true','"banxicoCall":'+'true','"realEngineExecution":'+'true','"providerRuntime":'+'true','"quoteWrite":'+'true','"backendConnection":'+'true']) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

assert(combined.includes('policy-operations/evidence/policy-ocr-engine.js'));
assert(combined.includes('product-intelligence/evidence/forge-quote-pdf-preview-engine.js'));
assert(combined.includes('product-intelligence/evidence/solucionline-retirement-parser.js'));
assert(combined.includes('product-intelligence/evidence/gmm-quote-parser.js'));

console.log('PASS quote preview pdf engine existing surfaces canonical mapping adapter 077B');
