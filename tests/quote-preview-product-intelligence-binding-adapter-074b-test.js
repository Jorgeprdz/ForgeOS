import assert from 'node:assert/strict';
import {
  DEFAULT_SAFETY_FLAGS,
  SAFE_ERROR_CODES,
  SCHEMA_VERSION,
  bindQuotePreviewToProductIntelligence,
  buildQuotePreviewBindingNotBoundError,
  validateQuotePreviewBindingShape
} from '../platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js';

function assertFalseFlags(flags, label) {
  Object.keys(DEFAULT_SAFETY_FLAGS).forEach((key) => {
    assert.equal(flags[key], false, `${label}.${key} must be false`);
  });
}

function assertNoExecution(binding) {
  assert.equal(binding.execution_markers.parserExecution, false);
  assert.equal(binding.execution_markers.calculatorExecution, false);
  assert.equal(binding.execution_markers.banxicoCall, false);
  assert.equal(binding.execution_markers.pdfRead, false);
  assert.equal(binding.execution_markers.realEngineExecution, false);
  assert.ok(binding.blocked_effects.includes('parser_execute'));
  assert.ok(binding.blocked_effects.includes('calculator_execute'));
  assert.ok(binding.blocked_effects.includes('banxico_call'));
  assert.ok(binding.blocked_effects.includes('pdf_read'));
}

const gmmBinding = bindQuotePreviewToProductIntelligence({
  quote_preview_request_id: 'quote_preview_request_gmm_074b',
  product_family_hint: 'GMM',
  source_evidence_refs: ['product_intelligence_evidence_gmm_073d'],
  requested_preview_mode: 'reference_only'
});

assert.equal(gmmBinding.schemaVersion, SCHEMA_VERSION);
assert.equal(gmmBinding.domainId, 'quote_preview');
assert.equal(gmmBinding.mode, 'read_only');
assert.equal(gmmBinding.routeClass, 'preview_safe');
assert.equal(gmmBinding.product_family, 'GMM');
assert.equal(gmmBinding.product_intelligence_ref.product_intelligence_id, 'product_intelligence_preview_gmm_073d');
assert.equal(gmmBinding.product_intelligence_ref.imported, false);
assert.equal(gmmBinding.product_intelligence_ref.executed, false);
assert.equal(gmmBinding.parser_ref.ref, 'product-intelligence/evidence/gmm-quote-parser.js');
assert.ok(gmmBinding.calculator_refs.some((ref) => ref.ref === 'product-intelligence/coverage/gmm-out-of-pocket-engine.js'));
assert.equal(gmmBinding.quote_pdf_preview_role, 'consumer_reference_only');
assert.equal(gmmBinding.safe_error, null);
assertFalseFlags(gmmBinding.safety_flags, 'gmmBinding.safety_flags');
assertNoExecution(gmmBinding);
assert.equal(validateQuotePreviewBindingShape(gmmBinding).valid, true);

const imaginaBinding = bindQuotePreviewToProductIntelligence({
  quote_preview_request_id: 'quote_preview_request_imagina_074b',
  product_family_hint: 'Imagina Ser',
  product_ref_hint: 'Imagina Ser',
  requested_preview_mode: 'reference_only'
});

assert.equal(imaginaBinding.product_family, 'Imagina Ser');
assert.equal(imaginaBinding.product_intelligence_ref.product_intelligence_id, 'product_intelligence_preview_imagina_ser_073d');
assert.equal(imaginaBinding.imagina_ser_universal_architecture, false);
assert.equal(imaginaBinding.quote_pdf_preview_role, 'consumer_reference_only');
assert.ok(imaginaBinding.calculator_refs.some((ref) => ref.ref === 'retirement-future-udi-projection-engine.js'));
assert.equal(imaginaBinding.safe_error, null);
assertFalseFlags(imaginaBinding.safety_flags, 'imaginaBinding.safety_flags');
assertNoExecution(imaginaBinding);
assert.equal(validateQuotePreviewBindingShape(imaginaBinding).valid, true);

const byProductRef = bindQuotePreviewToProductIntelligence({
  quote_preview_request_id: 'quote_preview_request_alfa_074b',
  product_ref_hint: 'Alfa Medical'
});

assert.equal(byProductRef.product_family, 'GMM');
assert.equal(byProductRef.resolution, 'product_ref_hint');
assert.equal(byProductRef.safe_error, null);
assertNoExecution(byProductRef);

const missing = bindQuotePreviewToProductIntelligence({
  quote_preview_request_id: 'quote_preview_request_missing_074b',
  product_family_hint: 'Missing Family'
});

assert.equal(missing.readModel.status, 'error');
assert.equal(missing.safe_error, SAFE_ERROR_CODES.productFamilyNotMapped);
assertFalseFlags(missing.safety_flags, 'missing.safety_flags');
assertNoExecution(missing);
assert.equal(validateQuotePreviewBindingShape(missing).valid, true);

const notBound = buildQuotePreviewBindingNotBoundError({
  quote_preview_request_id: 'quote_preview_request_not_bound_074b'
});

assert.equal(notBound.safe_error, SAFE_ERROR_CODES.notBound);
assert.equal(notBound.product_intelligence_ref, null);
assertFalseFlags(notBound.safety_flags, 'notBound.safety_flags');
assertNoExecution(notBound);
assert.equal(validateQuotePreviewBindingShape(notBound).valid, true);

console.log('PASS quote preview product intelligence binding adapter 074B');
