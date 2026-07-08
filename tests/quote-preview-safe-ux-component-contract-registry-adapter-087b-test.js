'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.safe_ux_component_contract.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.safe_ux_component_contract.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

const catalog = adapter.getQuotePreviewSafeUxComponentContractRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_safe_ux_component_contract');
assert.equal(catalog.registry_type, 'local_static_read_only_safe_ux_component_contract_registry');
assert.equal(catalog.overall_component_contract_status, 'component_contracts_mapped_no_render_no_effects');
assert.equal(catalog.component_contracts.length, 8);
assert.equal(adapter.validateComponentContractRegistryCatalog(catalog).ok, true);

for (const flag of [
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

for (const contract of catalog.component_contracts) {
  for (const field of adapter.REQUIRED_COMPONENT_CONTRACT_FIELDS) assert(field in contract, `${contract.component_id} missing ${field}`);
  assert.equal(contract.render_allowed, false);
  assert.equal(contract.ui_mutation_allowed, false);
  assert.equal(contract.quote_truth_allowed, false);
  assert.equal(contract.execution_allowed, false);
  assert.equal(contract.write_allowed, false);
  assert(contract.required_badges.includes('no_es_cotizacion'));
  assert(contract.safe_errors.includes(adapter.SAFE_ERROR_CODES.COMPONENT_RENDERING_NOT_AUTHORIZED));
  assert(contract.safe_errors.includes(adapter.SAFE_ERROR_CODES.UI_MUTATION_NOT_AUTHORIZED));
  assert(contract.safe_errors.includes(adapter.SAFE_ERROR_CODES.QUOTE_TRUTH_NOT_AUTHORIZED));
  assert.equal(adapter.validateComponentContractShape(contract).ok, true);
}

assert.equal(adapter.getNonRenderingComponentContracts().length, 8);
assert.equal(adapter.getNonWritableComponentContracts().length, 8);
assert.equal(adapter.getQuoteTruthBlockedComponentContracts().length, 8);

const shell = adapter.getComponentContractByName('QuotePreviewShell');
assert.equal(shell.component_id, 'quote_preview_shell');
assert(shell.consumes_state_ids.includes('quote_truth_blocked'));

const table = adapter.getComponentContractById('quote_preview_value_table');
assert.equal(table.component_kind, adapter.COMPONENT_KINDS.READ_ONLY_VALUE_TABLE_CONTRACT);
assert(table.allowed_actions.includes('copy_preview_reference_summary'));
assert(table.blocked_actions.includes('write_quote'));

const actionBar = adapter.getComponentContractByName('QuotePreviewActionBar');
assert.equal(actionBar.component_kind, adapter.COMPONENT_KINDS.SAFE_ACTION_CONTRACT);
assert(actionBar.blocked_actions.includes('connect_backend'));
assert(actionBar.blocked_actions.includes('write_quote'));

const human = adapter.getComponentContractByName('QuotePreviewHumanReviewCard');
assert.equal(human.component_kind, adapter.COMPONENT_KINDS.HUMAN_REVIEW_CONTRACT);
assert(human.allowed_actions.includes('request_human_review'));
assert(human.required_badges.includes('requiere_revision_humana'));

assert(adapter.getComponentContractsByStateId('preview_reference_available').length >= 4);
assert(adapter.getComponentContractsByStateId('quote_truth_blocked').length >= 4);

const missing = adapter.getComponentContractById('missing_component');
assert.equal(missing.readModelStatus, 'error');
assert.equal(missing.render_allowed, false);
assert.equal(missing.quote_truth_allowed, false);
assert.equal(missing.write_allowed, false);
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.COMPONENT_CONTRACT_NOT_MAPPED));
assert.equal(adapter.validateComponentContractShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const contract of catalog.component_contracts) {
  for (const [key, value] of Object.entries(contract.safety_flags || {})) {
    assert.equal(value, false, `${contract.component_id}.${key} must be false`);
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

console.log('PASS quote preview safe ux component contract registry adapter 087B');
