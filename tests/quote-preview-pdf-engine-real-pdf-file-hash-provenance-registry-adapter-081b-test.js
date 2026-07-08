'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.real_pdf_file_hash_provenance.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

assert.equal(typeof adapter.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog, 'function');
assert.equal(typeof adapter.getRealPdfFileHashBindingById, 'function');
assert.equal(typeof adapter.getRealPdfFileHashBindingsByTestId, 'function');
assert.equal(typeof adapter.getUnboundRealPdfFileHashBindings, 'function');
assert.equal(typeof adapter.getNotVerifiedRealPdfFileHashBindings, 'function');
assert.equal(typeof adapter.buildRealPdfFileHashBindingSafeError, 'function');
assert.equal(typeof adapter.validateRealPdfFileHashBindingShape, 'function');
assert.equal(typeof adapter.validateRealPdfFileHashRegistryCatalog, 'function');

const catalog = adapter.getQuotePreviewPdfEngineRealPdfFileHashProvenanceRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_real_pdf_file_hash_provenance');
assert.equal(catalog.mode, 'read_only');
assert.equal(catalog.routeClass, 'preview_safe');
assert.equal(catalog.registry_type, 'local_static_read_only_real_pdf_file_hash_provenance_registry');
assert.equal(catalog.overall_binding_status, 'not_bound_not_verified_not_ready');

for (const flag of [
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
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert(Array.isArray(catalog.bindings));
assert.equal(catalog.bindings.length, 4);
assert.equal(adapter.validateRealPdfFileHashRegistryCatalog(catalog).ok, true);

for (const binding of catalog.bindings) {
  for (const field of adapter.REQUIRED_BINDING_FIELDS) {
    assert(field in binding, `${binding.binding_id} missing ${field}`);
  }

  assert.equal(binding.candidate_file_path, null);
  assert.equal(binding.declared_sha256, null);
  assert.equal(binding.declared_file_size_bytes, null);
  assert.equal(binding.hash_algorithm, adapter.HASH_ALGORITHMS.SHA256);
  assert.equal(binding.hash_verification_status, adapter.HASH_VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(binding.file_read_status, adapter.FILE_READ_STATUSES.NOT_READ);
  assert.equal(binding.execution_allowed, false);
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.FILE_PATH_NOT_BOUND));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.HASH_NOT_BOUND));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.HASH_COMPUTE_NOT_AUTHORIZED));
  assert(binding.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
  assert.equal(adapter.validateRealPdfFileHashBindingShape(binding).ok, true);
}

const requiredBindings = [
  'binding_real_pdf_ocr_solucionline_file_hash',
  'binding_real_gmm_quote_pdf_file_hash',
  'binding_real_retirement_scenario_pdf_file_hash',
  'binding_real_retirement_mxn_scenario_pdf_file_hash',
];

for (const bindingId of requiredBindings) {
  const binding = adapter.getRealPdfFileHashBindingById(bindingId);
  assert.equal(binding.binding_id, bindingId);
}

const byTest = adapter.getRealPdfFileHashBindingsByTestId('real_retirement_mxn_scenario_candidate');
assert.equal(byTest.length, 1);
assert.equal(byTest[0].binding_id, 'binding_real_retirement_mxn_scenario_pdf_file_hash');

const unbound = adapter.getUnboundRealPdfFileHashBindings();
assert.equal(unbound.length, 4);

const notVerified = adapter.getNotVerifiedRealPdfFileHashBindings();
assert.equal(notVerified.length, 4);

const missing = adapter.getRealPdfFileHashBindingById('missing_binding');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.execution_allowed, false);
assert.equal(missing.file_read_status, adapter.FILE_READ_STATUSES.NOT_READ);
assert.equal(missing.hash_verification_status, adapter.HASH_VERIFICATION_STATUSES.NOT_VERIFIED);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.BINDING_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));
assert.equal(adapter.validateRealPdfFileHashBindingShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const binding of catalog.bindings) {
  for (const [key, value] of Object.entries(binding.safety_flags || {})) {
    assert.equal(value, false, `${binding.binding_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({
  catalog,
  missing,
  flags: adapter.DEFAULT_SAFETY_FLAGS,
  safeErrors: adapter.SAFE_ERROR_CODES,
});

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
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log('PASS quote preview pdf engine real pdf file hash provenance registry adapter 081B');
