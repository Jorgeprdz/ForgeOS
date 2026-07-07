import assert from 'node:assert/strict';
import {
  QUOTE_READ_MODEL_SAFE_ERROR,
  QUOTE_READ_MODEL_SOURCE_ENGINE,
  QUOTE_READ_MODEL_SCHEMA_VERSION,
  getQuoteReadModelManifest,
  getQuoteDetail,
  listQuotes
} from '../platform/adapters/quote-read-model/quote-read-model-adapter-069c.js';

const safetyKeys = [
  'crmWrite',
  'pipelineWrite',
  'policyWrite',
  'quoteWrite',
  'taskCreate',
  'calendarCreate',
  'messageSend',
  'authReal',
  'providerRuntime',
  'secretAccess',
  'browserPersistence',
  'realEngineExecution',
  'realEffectsAllowed',
  'realEffectsEnabled',
  'backendConnection'
];

function assertSafetyFalse(flags) {
  safetyKeys.forEach((key) => {
    assert.equal(flags[key], false, `${key} must be false`);
  });
}

function assertPreviewField(field, label) {
  assert.equal(field.mode, 'preview_non_binding', `${label} must be preview only`);
  assert.ok(Array.isArray(field.source_evidence_ids), `${label} evidence ids missing`);
  assert.ok(field.source_evidence_ids.length > 0, `${label} evidence ids empty`);
  assert.equal(field.freshness_metadata.status, 'preview_static', `${label} freshness mismatch`);
}

const manifest = getQuoteReadModelManifest();
assert.equal(manifest.adapterId, 'forge.quote.read_model.adapter.v1');
assert.equal(manifest.adapterType, 'local_static_existing_engine_wrapper');
assert.equal(manifest.adapterMode, 'read_only');
assert.equal(manifest.routeClass, 'read_only');
assert.equal(manifest.domainId, 'quote');
assert.equal(manifest.schemaVersion, QUOTE_READ_MODEL_SCHEMA_VERSION);
assert.equal(manifest.freshness.status, 'preview_static');
assert.equal(manifest.sourceEngineRef, QUOTE_READ_MODEL_SOURCE_ENGINE);
assert.equal(manifest.safeErrorCode, QUOTE_READ_MODEL_SAFE_ERROR);
assert.equal(manifest.canonicalQuoteTruthClaimed, false);
assert.equal(manifest.newQuoteEngineCreated, false);
assert.equal(manifest.newProductDatabaseCreated, false);
assertSafetyFalse(manifest.safetyFlags);

const listEnvelope = listQuotes();
assert.equal(listEnvelope.schemaVersion, QUOTE_READ_MODEL_SCHEMA_VERSION);
assert.equal(listEnvelope.domainId, 'quote');
assert.equal(listEnvelope.routeClass, 'read_only');
assert.equal(listEnvelope.readModel.status, 'ok');
assert.equal(listEnvelope.audit.event, 'read_model_used');
assert.equal(listEnvelope.freshness.status, 'preview_static');
assert.equal(listEnvelope.canonicalQuoteTruthClaimed, false);
assert.equal(listEnvelope.newQuoteEngineCreated, false);
assert.equal(listEnvelope.newProductDatabaseCreated, false);
assertSafetyFalse(listEnvelope.safetyFlags);
assert.ok(listEnvelope.records.length >= 1, 'listQuotes must return at least one quote');

const quote = listEnvelope.records[0];
assert.equal(quote.quote_id, 'quote_preview_gmm_lariza_alfa_medical_069c');
assert.equal(quote.source_engine_ref, QUOTE_READ_MODEL_SOURCE_ENGINE);
assert.ok(Array.isArray(quote.source_evidence_ids));
assert.ok(quote.source_evidence_ids.length > 0);
assert.equal(quote.freshness_metadata.status, 'preview_static');
assert.equal(quote.audit_event, 'read_model_used');
assert.equal(quote.canonicalQuoteTruthClaimed, false);
assertSafetyFalse(quote.safety_flags);
assertPreviewField(quote.premium_preview, 'premium_preview');
assert.equal(quote.premium_preview.value.binding, false);
assertPreviewField(quote.coverage_summary, 'coverage_summary');
assertPreviewField(quote.deductible_preview, 'deductible_preview');
assertPreviewField(quote.coinsurance_preview, 'coinsurance_preview');
assertPreviewField(quote.sum_assured_preview, 'sum_assured_preview');
assert.ok(quote.blocked_effects.includes('quote_create'));
assert.ok(quote.blocked_effects.includes('quote_update'));
assert.ok(quote.blocked_effects.includes('quote_send'));
assert.ok(quote.blocked_effects.includes('provider_call'));
assert.ok(quote.blocked_effects.includes('policy_write'));
assert.ok(quote.blocked_effects.includes('crm_write'));
assert.ok(quote.blocked_effects.includes('task_create'));
assert.ok(quote.blocked_effects.includes('calendar_create'));
assert.ok(quote.blocked_effects.includes('message_send'));
assert.ok(quote.blocked_effects.includes('real_engine_execution'));

const detail = getQuoteDetail(quote.quote_id);
assert.equal(detail.readModel.status, 'ok');
assert.equal(detail.records[0].quote_id, quote.quote_id);

const missing = getQuoteDetail('missing_quote_id');
assert.equal(missing.readModel.status, 'empty');
assert.equal(missing.emptyState.reason, 'filter_no_match');
assert.equal(missing.errors[0].code, QUOTE_READ_MODEL_SAFE_ERROR);
assertSafetyFalse(missing.safetyFlags);

const invalid = getQuoteDetail();
assert.equal(invalid.readModel.status, 'error');
assert.equal(invalid.errors[0].code, QUOTE_READ_MODEL_SAFE_ERROR);
assertSafetyFalse(invalid.safetyFlags);

const empty = listQuotes({ forceEmpty: true });
assert.equal(empty.readModel.status, 'empty');
assert.equal(empty.emptyState.reason, 'no_modeled_quotes');
assertSafetyFalse(empty.safetyFlags);

console.log('PASS quote read model adapter 069C');
