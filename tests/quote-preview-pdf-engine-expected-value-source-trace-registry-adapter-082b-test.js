'use strict';

const assert = require('node:assert/strict');
const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.expected_value_source_trace.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewPdfEngineExpectedValueSourceTraceRegistryCatalog();
assert.equal(catalog.registry_type, 'local_static_read_only_expected_value_source_trace_registry');
assert.equal(catalog.overall_trace_status, 'not_bound_not_verified_not_ready');
assert.equal(adapter.validateExpectedValueSourceTraceRegistryCatalog(catalog).ok, true);
assert.equal(catalog.traces.length, 3);

for (const flag of [
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
]) assert.equal(catalog[flag], false, `${flag} must be false`);

for (const trace of catalog.traces) {
  for (const field of adapter.REQUIRED_TRACE_FIELDS) assert(field in trace, `${trace.trace_id} missing ${field}`);
  assert.equal(trace.source_trace_status, adapter.SOURCE_TRACE_STATUSES.NOT_BOUND);
  assert.equal(trace.verification_status, adapter.VERIFICATION_STATUSES.NOT_VERIFIED);
  assert.equal(trace.execution_allowed, false);
  assert(trace.safe_errors.includes(adapter.SAFE_ERROR_CODES.SOURCE_TRACE_NOT_BOUND));
  assert(trace.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED));
  assert(trace.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
  assert.equal(adapter.validateExpectedValueSourceTraceShape(trace).ok, true);
}

assert.equal(adapter.getExpectedValueSourceTraceById('trace_gmm_out_of_pocket_expected_values').product_family, 'gmm');
assert.equal(adapter.getExpectedValueSourceTraceById('trace_real_retirement_mxn_expected_values').product_family, 'retirement');
assert.equal(adapter.getExpectedValueSourceTraceById('trace_retirement_future_udi_deterministic_inputs').expected_value_kind, adapter.EXPECTED_VALUE_KINDS.DETERMINISTIC_PROJECTION_INPUT_TRACE);
assert.equal(adapter.getExpectedValueSourceTracesByTestId('real_retirement_mxn_scenario_candidate').length, 1);
assert.equal(adapter.getExpectedValueSourceTracesByProductFamily('retirement').length, 2);
assert.equal(adapter.getExpectedValueSourceTracesByProductFamily('gmm').length, 1);
assert.equal(adapter.getUnboundExpectedValueSourceTraces().length, 3);
assert.equal(adapter.getNotVerifiedExpectedValueSourceTraces().length, 3);

const missing = adapter.getExpectedValueSourceTraceById('missing_trace');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.execution_allowed, false);
assert.equal(missing.source_trace_status, adapter.SOURCE_TRACE_STATUSES.NOT_BOUND);
assert.equal(missing.verification_status, adapter.VERIFICATION_STATUSES.NOT_VERIFIED);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.TRACE_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXPECTED_VALUE_NOT_VERIFIED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
assert.equal(adapter.validateExpectedValueSourceTraceShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
for (const trace of catalog.traces) {
  for (const [key, value] of Object.entries(trace.safety_flags || {})) assert.equal(value, false, `${trace.trace_id}.${key} must be false`);
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
]) assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);

console.log('PASS quote preview pdf engine expected value source trace registry adapter 082B');
