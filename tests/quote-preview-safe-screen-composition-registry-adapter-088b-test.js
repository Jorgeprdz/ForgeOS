'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-safe-screen-composition-registry-adapter-088b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.safe_screen_composition.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.safe_screen_composition.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewSafeScreenCompositionRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_safe_screen_composition');
assert.equal(catalog.registry_type, 'local_static_read_only_safe_screen_composition_registry');
assert.equal(catalog.overall_screen_composition_status, 'screen_compositions_mapped_no_render_no_effects');
assert.equal(catalog.screen_compositions.length, 5);
assert.equal(adapter.validateScreenCompositionRegistryCatalog(catalog).ok, true);

for (const flag of [
  'screen_rendering_allowed_in_registry',
  'component_rendering_allowed_in_registry',
  'ui_mutation_allowed_in_registry',
  'quote_truth_allowed_in_registry',
  'execution_allowed_in_registry',
  'write_allowed_in_registry',
  'quote_write_allowed_in_registry',
  'crm_write_allowed_in_registry',
  'policy_write_allowed_in_registry',
  'pipeline_write_allowed_in_registry',
  'provider_runtime_allowed_in_registry',
  'backend_connection_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const composition of catalog.screen_compositions) {
  for (const field of adapter.REQUIRED_SCREEN_COMPOSITION_FIELDS) assert(field in composition, `${composition.composition_id} missing ${field}`);
  assert.equal(composition.render_allowed, false);
  assert.equal(composition.ui_mutation_allowed, false);
  assert.equal(composition.quote_truth_allowed, false);
  assert.equal(composition.execution_allowed, false);
  assert.equal(composition.write_allowed, false);
  assert(composition.required_badges.includes('no_es_cotizacion'));
  assert(composition.safe_errors.includes(adapter.SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED));
  assert(composition.safe_errors.includes(adapter.SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED));
  assert(composition.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED));
  assert.equal(adapter.validateScreenCompositionShape(composition).ok, true);
}

assert.equal(adapter.getNonRenderingScreenCompositions().length, 5);
assert.equal(adapter.getNonWritableScreenCompositions().length, 5);
assert.equal(adapter.getQuoteTruthBlockedScreenCompositions().length, 5);

const reference = adapter.getScreenCompositionByName('QuotePreviewReferenceScreen');
assert.equal(reference.composition_id, 'quote_preview_reference_screen');
assert(reference.primary_component_ids.includes('quote_preview_value_table'));
assert(reference.secondary_component_ids.includes('quote_preview_evidence_panel'));
assert(reference.allowed_actions.includes('copy_preview_reference_summary'));
assert(reference.blocked_actions.includes('write_quote'));

const human = adapter.getScreenCompositionById('quote_preview_human_review_screen');
assert.equal(human.composition_kind, adapter.COMPOSITION_KINDS.HUMAN_REVIEW_SCREEN_COMPOSITION);
assert(human.primary_component_ids.includes('quote_preview_human_review_card'));
assert(human.required_badges.includes('requiere_revision_humana'));

const blocked = adapter.getScreenCompositionsByStateId('quote_truth_blocked');
assert.equal(blocked.length, 1);
assert.equal(blocked[0].composition_id, 'quote_preview_blocked_screen');

assert(adapter.getScreenCompositionsByLayoutMode(adapter.LAYOUT_MODES.MOBILE_SINGLE_COLUMN).length >= 5);
assert(adapter.getScreenCompositionsByLayoutMode(adapter.LAYOUT_MODES.DESKTOP_TWO_COLUMN).length >= 4);

const missing = adapter.getScreenCompositionById('missing_screen');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.render_allowed, false);
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.write_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.SCREEN_COMPOSITION_NOT_MAPPED));
assert.equal(adapter.validateScreenCompositionShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const composition of catalog.screen_compositions) {
  for (const [key, value] of Object.entries(composition.safety_flags || {})) {
    assert.equal(value, false, `${composition.composition_id}.${key} must be false`);
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

console.log('PASS quote preview safe screen composition registry adapter 088B');
