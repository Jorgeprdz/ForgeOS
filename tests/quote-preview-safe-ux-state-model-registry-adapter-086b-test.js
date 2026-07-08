'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.safe_ux_state_model.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.safe_ux_state_model.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewSafeUxStateModelRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_safe_ux_state_model');
assert.equal(catalog.registry_type, 'local_static_read_only_safe_ux_state_model_registry');
assert.equal(catalog.overall_ux_state_status, 'safe_state_model_mapped_no_effects');
assert.equal(catalog.states.length, 9);
assert.equal(adapter.validateSafeUxStateModelRegistryCatalog(catalog).ok, true);

for (const flag of [
  'ui_mutation_allowed_in_registry',
  'quote_truth_creation_allowed_in_registry',
  'quote_issuance_allowed_in_registry',
  'quote_send_allowed_in_registry',
  'quote_write_allowed_in_registry',
  'crm_write_allowed_in_registry',
  'policy_write_allowed_in_registry',
  'pipeline_write_allowed_in_registry',
  'provider_runtime_allowed_in_registry',
  'backend_connection_allowed_in_registry',
  'parser_execution_allowed_in_registry',
  'calculator_execution_allowed_in_registry',
  'banxico_call_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

for (const state of catalog.states) {
  for (const field of adapter.REQUIRED_UX_STATE_FIELDS) assert(field in state, `${state.state_id} missing ${field}`);
  assert.equal(state.quote_truth_allowed, false);
  assert.equal(state.execution_allowed, false);
  assert.equal(state.write_allowed, false);
  assert(state.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED));
  assert(state.safe_errors.includes(adapter.SAFE_ERROR_CODES.WRITE_NOT_AUTHORIZED));
  assert(state.safe_errors.includes(adapter.SAFE_ERROR_CODES.EXECUTION_NOT_AUTHORIZED));
  assert.equal(adapter.validateSafeUxStateShape(state).ok, true);
}

const preview = adapter.getSafeUxStateById('preview_reference_available');
assert.equal(preview.state_kind, adapter.STATE_KINDS.PREVIEW_READY);
assert.equal(preview.preview_reference_allowed, true);
assert.equal(preview.quote_truth_allowed, false);
assert(preview.required_badges.includes(adapter.BADGES.NO_ES_COTIZACION));
assert(preview.allowed_actions.includes(adapter.SAFE_ACTIONS.VIEW_REFERENCE_PREVIEW));
assert(preview.blocked_actions.includes(adapter.BLOCKED_ACTIONS.ISSUE_QUOTE));
assert(preview.blocked_actions.includes(adapter.BLOCKED_ACTIONS.WRITE_QUOTE));

const blocked = adapter.getSafeUxStateById('quote_truth_blocked');
assert.equal(blocked.state_kind, adapter.STATE_KINDS.BLOCKED);
assert(blocked.required_badges.includes(adapter.BADGES.QUOTE_TRUTH_BLOQUEADO));
assert.equal(blocked.quote_truth_allowed, false);

const human = adapter.getSafeUxStateById('ready_for_human_review');
assert.equal(human.state_kind, adapter.STATE_KINDS.HUMAN_REVIEW);
assert(human.allowed_actions.includes(adapter.SAFE_ACTIONS.REQUEST_HUMAN_REVIEW));
assert(human.required_badges.includes(adapter.BADGES.REQUIERE_REVISION_HUMANA));

assert.equal(adapter.getVisibleSafeUxStates().length, 9);
assert.equal(adapter.getPreviewReferenceAllowedSafeUxStates().length, 8);
assert.equal(adapter.getQuoteTruthBlockedSafeUxStates().length, 9);
assert.equal(adapter.getExecutableSafeUxStates().length, 0);
assert.equal(adapter.getWritableSafeUxStates().length, 0);
assert.equal(adapter.getSafeUxStatesByKind(adapter.STATE_KINDS.WARNING).length, 3);
assert.equal(adapter.getSafeUxStatesByKind(adapter.STATE_KINDS.BLOCKED).length, 2);

const missing = adapter.getSafeUxStateById('missing_state');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.execution_allowed, false);
assert.equal(missing.write_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.UX_STATE_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED));
assert.equal(adapter.validateSafeUxStateShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const state of catalog.states) {
  for (const [key, value] of Object.entries(state.safety_flags || {})) {
    assert.equal(value, false, `${state.state_id}.${key} must be false`);
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

console.log('PASS quote preview safe ux state model registry adapter 086B');
