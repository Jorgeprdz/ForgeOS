'use strict';

const assert = require('node:assert/strict');
const adapter = require('../platform/adapters/quote-preview/quote-preview-safe-copy-badge-system-registry-adapter-090b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.safe_copy_badge_system.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.safe_copy_badge_system.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewSafeCopyBadgeSystemRegistryCatalog();
assert.equal(catalog.registry_type, 'local_static_read_only_safe_copy_badge_system_registry');
assert.equal(catalog.overall_copy_badge_status, 'copy_badges_mapped_no_effect_language_no_truth');
assert.equal(catalog.badges.length, 10);
assert.equal(catalog.copy_blocks.length, 7);
assert.equal(adapter.validateCopyBadgeSystemRegistryCatalog(catalog).ok, true);

for (const flag of [
  'official_quote_allowed_in_registry',
  'send_allowed_in_registry',
  'crm_write_allowed_in_registry',
  'calendar_create_allowed_in_registry',
  'quote_truth_allowed_in_registry',
  'execution_allowed_in_registry',
  'write_allowed_in_registry',
  'ui_mutation_allowed_in_registry',
  'css_injection_allowed_in_registry',
  'dom_write_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const badge of catalog.badges) {
  for (const field of adapter.REQUIRED_BADGE_FIELDS) assert(field in badge, `${badge.badge_id} missing ${field}`);
  assert.equal(badge.official_quote_allowed, false);
  assert.equal(badge.send_allowed, false);
  assert.equal(badge.crm_write_allowed, false);
  assert.equal(badge.calendar_create_allowed, false);
  assert.equal(badge.quote_truth_allowed, false);
  assert.equal(badge.write_allowed, false);
  assert.equal(adapter.validateBadgeShape(badge).ok, true);
}

for (const copy of catalog.copy_blocks) {
  for (const field of adapter.REQUIRED_COPY_FIELDS) assert(field in copy, `${copy.copy_id} missing ${field}`);
  assert.equal(copy.official_quote_allowed, false);
  assert.equal(copy.send_allowed, false);
  assert.equal(copy.crm_write_allowed, false);
  assert.equal(copy.calendar_create_allowed, false);
  assert.equal(copy.quote_truth_allowed, false);
  assert.equal(copy.write_allowed, false);
  assert.equal(adapter.hasForbiddenCopyLanguage(copy.text), false);
  assert(copy.required_badge_ids.includes('preview'));
  assert.equal(adapter.validateCopyBlockShape(copy).ok, true);
}

assert.equal(adapter.getBadgeById('preview').label, 'Preview');
assert.equal(adapter.getBadgeById('read_only').label, 'Solo lectura');
assert.equal(adapter.getBadgeById('human_review_required').label, 'Revisión humana');
assert.equal(adapter.getBadgeById('not_official_quote').label, 'No cotización oficial');
assert.equal(adapter.getBadgeById('no_send').label, 'Sin envío');
assert.equal(adapter.getBadgeById('no_crm').label, 'Sin CRM');
assert.equal(adapter.getBadgeById('no_calendar').label, 'Sin calendario');

assert.equal(adapter.getCopyBlockById('preview_disclaimer_primary').text.includes('No es una cotización oficial'), true);
assert.equal(adapter.getCopyBlockById('no_effects_boundary').text.includes('Sin envío'), true);
assert.equal(adapter.getCopyBlockById('no_effects_boundary').text.includes('sin CRM'), true);
assert.equal(adapter.getCopyBlockById('no_effects_boundary').text.includes('sin calendario'), true);
assert.equal(adapter.getCopyBlocksByUsage('primary_cta').length, 1);
assert.equal(adapter.getCopyBlockById('safe_prepare_preview_cta').text, 'Preparar preview');

assert.equal(adapter.hasForbiddenCopyLanguage('Enviar ahora'), true);
assert.equal(adapter.hasForbiddenCopyLanguage('Guardar en CRM'), true);
assert.equal(adapter.hasForbiddenCopyLanguage('Cotización verificada'), true);
assert.equal(adapter.hasForbiddenCopyLanguage('Preparar preview'), false);

const missingBadge = adapter.getBadgeById('missing_badge');
assert.equal(missingBadge.readModelStatus, 'error');
assert.equal(missingBadge.official_quote_allowed, false);

const missingCopy = adapter.getCopyBlockById('missing_copy');
assert.equal(missingCopy.readModelStatus, 'error');
assert.equal(missingCopy.quote_truth_allowed, false);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
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

console.log('PASS quote preview safe copy badge system registry adapter 090B');
