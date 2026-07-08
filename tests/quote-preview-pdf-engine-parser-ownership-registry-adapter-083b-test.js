'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.parser_ownership.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.parser_ownership.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfEngineParserOwnershipRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_parser_ownership');
assert.equal(catalog.registry_type, 'local_static_read_only_parser_ownership_registry');
assert.equal(catalog.overall_ownership_status, 'ownership_mapped_execution_blocked');
assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert.equal(catalog.ownership_entries.length, 4);
assert.equal(adapter.validateParserOwnershipRegistryCatalog(catalog).ok, true);

for (const flag of [
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
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const entry of catalog.ownership_entries) {
  for (const field of adapter.REQUIRED_OWNERSHIP_FIELDS) {
    assert(field in entry, `${entry.ownership_id} missing ${field}`);
  }
  assert.equal(entry.execution_allowed, false);
  assert(entry.safe_errors.includes(adapter.SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED));
  assert.equal(adapter.validateParserOwnershipShape(entry).ok, true);
}

const policy = adapter.getParserOwnershipById('owner_policy_ocr_engine_reference');
assert.equal(policy.parser_kind, adapter.PARSER_KINDS.OCR_ENGINE_REFERENCE);
assert.equal(policy.ownership_status, adapter.OWNERSHIP_STATUSES.EXISTING_REFERENCE_ONLY);
assert(policy.safe_errors.includes(adapter.SAFE_ERROR_CODES.OCR_EXECUTION_NOT_AUTHORIZED));

const retirement = adapter.getParserOwnershipById('owner_solucionline_retirement_parser');
assert.equal(retirement.parser_kind, adapter.PARSER_KINDS.RETIREMENT_PDF_PARSER);
assert.equal(retirement.ownership_status, adapter.OWNERSHIP_STATUSES.DECISION_REQUIRED);
assert(retirement.safe_errors.includes(adapter.SAFE_ERROR_CODES.UNOWNED_PARSER_EXECUTION_BLOCKED));

const gmm = adapter.getParserOwnershipBySurfaceId('gmm_quote_parser');
assert.equal(gmm.parser_kind, adapter.PARSER_KINDS.GMM_PDF_PARSER);
assert.equal(gmm.ownership_status, adapter.OWNERSHIP_STATUSES.DECISION_REQUIRED);

const preview = adapter.getParserOwnershipById('owner_quote_pdf_preview_engine');
assert.equal(preview.parser_kind, adapter.PARSER_KINDS.PREVIEW_ENGINE_NOT_PARSER_TRUTH);
assert.equal(preview.ownership_status, adapter.OWNERSHIP_STATUSES.NOT_PARSER_OWNER);
assert(preview.safe_errors.includes(adapter.SAFE_ERROR_CODES.PREVIEW_ENGINE_AS_PARSER_TRUTH_BLOCKED));

assert.equal(adapter.getDecisionRequiredParserOwnershipEntries().length, 2);
assert.equal(adapter.getNonExecutableParserOwnershipEntries().length, 4);

const missing = adapter.getParserOwnershipById('missing_parser_owner');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.execution_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.OWNERSHIP_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PARSER_EXECUTION_NOT_AUTHORIZED));
assert.equal(adapter.validateParserOwnershipShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const entry of catalog.ownership_entries) {
  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    assert.equal(value, false, `${entry.ownership_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({
  catalog,
  missing,
  flags: adapter.DEFAULT_SAFETY_FLAGS,
  safeErrors: adapter.SAFE_ERROR_CODES,
});

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

console.log('PASS quote preview pdf engine parser ownership registry adapter 083B');
