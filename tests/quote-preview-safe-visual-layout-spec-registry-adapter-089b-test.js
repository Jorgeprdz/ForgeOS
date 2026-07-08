'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.safe_visual_layout_spec.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.safe_visual_layout_spec.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewSafeVisualLayoutSpecRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_safe_visual_layout_spec');
assert.equal(catalog.registry_type, 'local_static_read_only_safe_visual_layout_spec_registry');
assert.equal(catalog.overall_visual_layout_spec_status, 'visual_layout_specs_mapped_no_render_no_effects');
assert.equal(catalog.visual_layout_specs.length, 3);
assert.equal(adapter.validateVisualLayoutSpecRegistryCatalog(catalog).ok, true);

for (const flag of [
  'render_allowed_in_registry',
  'screen_render_allowed_in_registry',
  'component_render_allowed_in_registry',
  'ui_mutation_allowed_in_registry',
  'css_injection_allowed_in_registry',
  'dom_write_allowed_in_registry',
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

assert.equal(catalog.visual_style_tokens.color_system, 'midnight_navy_with_warm_gold_and_cyan_safety_accents');
assert(catalog.visual_style_tokens.cta.includes('gold'));
assert(catalog.visual_style_tokens.safety_labels.includes('preview_not_quote'));

for (const spec of catalog.visual_layout_specs) {
  for (const field of adapter.REQUIRED_VISUAL_LAYOUT_SPEC_FIELDS) assert(field in spec, `${spec.layout_spec_id} missing ${field}`);
  assert.equal(spec.render_allowed, false);
  assert.equal(spec.screen_render_allowed, false);
  assert.equal(spec.component_render_allowed, false);
  assert.equal(spec.ui_mutation_allowed, false);
  assert.equal(spec.css_injection_allowed, false);
  assert.equal(spec.dom_write_allowed, false);
  assert.equal(spec.quote_truth_allowed, false);
  assert.equal(spec.execution_allowed, false);
  assert.equal(spec.write_allowed, false);
  assert(spec.primary_cta_treatment.includes('gold'));
  assert(spec.safety_badge_treatment.includes('cyan'));
  assert(spec.safe_errors.includes(adapter.SAFE_ERROR_CODES.SCREEN_RENDERING_NOT_AUTHORIZED));
  assert(spec.safe_errors.includes(adapter.SAFE_ERROR_CODES.CSS_INJECTION_NOT_AUTHORIZED));
  assert(spec.safe_errors.includes(adapter.SAFE_ERROR_CODES.DOM_WRITE_NOT_AUTHORIZED));
  assert.equal(adapter.validateVisualLayoutSpecShape(spec).ok, true);
}

assert.equal(adapter.getNonRenderingVisualLayoutSpecs().length, 3);
assert.equal(adapter.getNonMutableVisualLayoutSpecs().length, 3);
assert.equal(adapter.getQuoteTruthBlockedVisualLayoutSpecs().length, 3);

const desktop = adapter.getVisualLayoutSpecById('desktop_safe_visual_layout');
assert.equal(desktop.viewport_class, adapter.VIEWPORT_CLASSES.DESKTOP);
assert.equal(desktop.navigation_pattern, 'fixed_left_sidebar');
assert(desktop.visual_hierarchy.includes('priority_table'));
assert.equal(desktop.table_treatment, 'dark_operational_table_with_soft_dividers');

const tablet = adapter.getVisualLayoutSpecById('tablet_safe_visual_layout');
assert.equal(tablet.viewport_class, adapter.VIEWPORT_CLASSES.TABLET);
assert.equal(tablet.table_treatment, 'responsive_table_or_card_list');

const mobile = adapter.getVisualLayoutSpecById('mobile_safe_visual_layout');
assert.equal(mobile.viewport_class, adapter.VIEWPORT_CLASSES.MOBILE);
assert.equal(mobile.navigation_pattern, 'bottom_tab_bar');
assert(mobile.visual_hierarchy.includes('bottom_nav'));
assert.equal(mobile.table_treatment, 'priority_list_cards_not_table');

assert.equal(adapter.getVisualLayoutSpecsByViewportClass(adapter.VIEWPORT_CLASSES.DESKTOP).length, 1);
assert.equal(adapter.getVisualLayoutSpecsByViewportClass(adapter.VIEWPORT_CLASSES.TABLET).length, 1);
assert.equal(adapter.getVisualLayoutSpecsByViewportClass(adapter.VIEWPORT_CLASSES.MOBILE).length, 1);
assert.equal(adapter.getVisualLayoutSpecsByLayoutMode(adapter.LAYOUT_MODES.MOBILE_SINGLE_COLUMN).length, 1);

const missing = adapter.getVisualLayoutSpecById('missing_layout');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.render_allowed, false);
assert.equal(missing.css_injection_allowed, false);
assert.equal(missing.dom_write_allowed, false);
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.write_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.VISUAL_LAYOUT_SPEC_NOT_MAPPED));
assert.equal(adapter.validateVisualLayoutSpecShape(missing).ok, false);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const spec of catalog.visual_layout_specs) {
  for (const [key, value] of Object.entries(spec.safety_flags || {})) {
    assert.equal(value, false, `${spec.layout_spec_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({ catalog, flags: adapter.DEFAULT_SAFETY_FLAGS });
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

console.log('PASS quote preview safe visual layout spec registry adapter 089B');
