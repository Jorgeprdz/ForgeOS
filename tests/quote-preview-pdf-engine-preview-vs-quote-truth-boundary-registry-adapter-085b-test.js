'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.preview_vs_quote_truth_boundary.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfEnginePreviewVsQuoteTruthBoundaryRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_preview_vs_quote_truth_boundary');
assert.equal(catalog.registry_type, 'local_static_read_only_preview_vs_quote_truth_boundary_registry');
assert.equal(catalog.overall_boundary_status, 'preview_boundary_mapped_quote_truth_blocked');
assert.equal(catalog.preview_reference_allowed_in_registry, true);
assert.equal(catalog.boundary_entries.length, 4);
assert.equal(adapter.validatePreviewVsQuoteTruthBoundaryRegistryCatalog(catalog).ok, true);

for (const flag of [
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
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const entry of catalog.boundary_entries) {
  for (const field of adapter.REQUIRED_BOUNDARY_FIELDS) assert(field in entry, `${entry.boundary_id} missing ${field}`);
  assert.equal(entry.quote_truth_allowed, false);
  assert.equal(entry.execution_allowed, false);
  assert(entry.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED) || entry.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVIDER_RUNTIME_NOT_AUTHORIZED));
  assert.equal(adapter.validatePreviewVsQuoteTruthBoundaryShape(entry).ok, true);
}

const previewEngine = adapter.getPreviewVsQuoteTruthBoundaryBySurfaceId('quote_pdf_preview_engine');
assert.equal(previewEngine.preview_allowed, true);
assert.equal(previewEngine.quote_truth_allowed, false);
assert.equal(previewEngine.allowed_truth_class, adapter.TRUTH_CLASSES.PREVIEW_REFERENCE_ONLY);
assert(previewEngine.safe_errors.includes(adapter.SAFE_ERROR_CODES.PREVIEW_AS_QUOTE_TRUTH_BLOCKED));

const provider = adapter.getPreviewVsQuoteTruthBoundaryById('boundary_real_quote_truth_provider_backend');
assert.equal(provider.preview_allowed, false);
assert.equal(provider.quote_truth_allowed, false);
assert.equal(provider.allowed_truth_class, adapter.TRUTH_CLASSES.REAL_QUOTE_TRUTH_REQUIRES_PROVIDER_RUNTIME_GATE);
assert(provider.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVIDER_RUNTIME_NOT_AUTHORIZED));
assert(provider.safe_errors.includes(adapter.SAFE_ERROR_CODES.BACKEND_CONNECTION_NOT_AUTHORIZED));

const ui = adapter.getPreviewVsQuoteTruthBoundaryBySurfaceId('quote_preview_ui');
assert.equal(ui.surface_kind, adapter.SURFACE_KINDS.USER_VISIBLE_PREVIEW_SURFACE);
assert.equal(ui.allowed_truth_class, adapter.TRUTH_CLASSES.MUST_LABEL_AS_PREVIEW_NOT_QUOTE);
assert(ui.safe_errors.includes(adapter.SAFE_ERROR_CODES.PREVIEW_LABEL_REQUIRED));

assert.equal(adapter.getPreviewAllowedBoundaryEntries().length, 3);
assert.equal(adapter.getQuoteTruthBlockedBoundaryEntries().length, 4);
assert.equal(adapter.getUserVisiblePreviewBoundaryEntries().length, 1);

const missing = adapter.getPreviewVsQuoteTruthBoundaryById('missing_boundary');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.execution_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.BOUNDARY_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_CREATION_NOT_AUTHORIZED));
assert.equal(adapter.validatePreviewVsQuoteTruthBoundaryShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const entry of catalog.boundary_entries) {
  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    assert.equal(value, false, `${entry.boundary_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({ catalog, missing, flags: adapter.DEFAULT_SAFETY_FLAGS });
for (const fragment of [
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
]) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log('PASS quote preview pdf engine preview vs quote truth boundary registry adapter 085B');
