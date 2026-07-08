'use strict';

const assert = require('node:assert/strict');

const adapter = require('../platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js');

assert.equal(adapter.ADAPTER_ID, 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.adapter.v1');
assert.equal(adapter.SCHEMA_VERSION, 'forge.quote_preview.pdf_engine.canonical_test_evidence.provenance.registry.v1');
assert.equal(adapter.MODE, 'read_only');
assert.equal(adapter.ROUTE_CLASS, 'preview_safe');

assert.equal(typeof adapter.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog, 'function');
assert.equal(typeof adapter.getProvenanceById, 'function');
assert.equal(typeof adapter.getProvenanceByTestId, 'function');
assert.equal(typeof adapter.getProvenanceByType, 'function');
assert.equal(typeof adapter.getExpectedValueProvenanceEntries, 'function');
assert.equal(typeof adapter.getFixtureOnlyProvenanceEntries, 'function');
assert.equal(typeof adapter.getGovernanceOnlyProvenanceEntries, 'function');
assert.equal(typeof adapter.getRuntimeGateProvenanceEntries, 'function');
assert.equal(typeof adapter.validateProvenanceShape, 'function');
assert.equal(typeof adapter.validateProvenanceRegistryCatalog, 'function');

const catalog = adapter.getQuotePreviewPdfCanonicalTestEvidenceProvenanceRegistryCatalog();

assert.equal(catalog.schemaVersion, adapter.SCHEMA_VERSION);
assert.equal(catalog.domainId, 'quote_preview_pdf_engine_canonical_test_evidence_provenance');
assert.equal(catalog.mode, 'read_only');
assert.equal(catalog.routeClass, 'preview_safe');
assert.equal(catalog.registry_type, 'local_static_read_only_test_evidence_provenance_registry');

for (const flag of [
  'execution_allowed_in_registry',
  'pdf_read_allowed_in_registry',
  'ocr_execution_allowed_in_registry',
  'parser_execution_allowed_in_registry',
  'calculator_execution_allowed_in_registry',
  'banxico_call_allowed_in_registry',
  'provider_call_allowed_in_registry',
  'test_execution_allowed_in_registry',
]) {
  assert.equal(catalog[flag], false, `${flag} must be false`);
}

assert.equal(catalog.product_intelligence_upstream, true);
assert.equal(catalog.quote_preview_downstream, true);
assert(Array.isArray(catalog.provenance));
assert(catalog.provenance.length >= 10);
assert.equal(adapter.validateProvenanceRegistryCatalog(catalog).ok, true);

for (const entry of catalog.provenance) {
  for (const field of adapter.REQUIRED_PROVENANCE_FIELDS) {
    assert(field in entry, `${entry.provenance_id} missing ${field}`);
  }
  assert.equal(adapter.validateProvenanceShape(entry).ok, true);
}

const byId = (id) => adapter.getProvenanceById(id);

const realPdf = byId('prov_real_pdf_ocr_solucionline_file');
assert.equal(realPdf.provenance_type, adapter.PROVENANCE_TYPES.REAL_PDF_FILE);
assert.equal(realPdf.provenance_status, adapter.PROVENANCE_STATUSES.FILE_OR_HASH_REQUIRED);
assert.equal(realPdf.source_hash_required, true);
assert(realPdf.blocked_misuse.includes('fixture_as_real_pdf'));
assert(realPdf.safe_errors.includes(adapter.SAFE_ERROR_CODES.PDF_READ_NOT_AUTHORIZED));

const gmmExpected = byId('prov_gmm_out_of_pocket_expected_values');
assert.equal(gmmExpected.provenance_type, adapter.PROVENANCE_TYPES.EXPECTED_VALUE);
assert.equal(gmmExpected.expected_value_source_required, true);
assert(gmmExpected.safe_errors.includes(adapter.SAFE_ERROR_CODES.INVENTED_EXPECTED_VALUE_BLOCKED));

const retirementMxn = byId('prov_real_retirement_mxn_expected_values');
assert(retirementMxn.engine_refs.includes('retirement-future-udi-projection-engine.js'));
assert(retirementMxn.engine_refs.includes('imagina-ser-future-mxn-bridge.js'));
assert(retirementMxn.blocked_misuse.includes('untraceable_projection'));

const banxico = byId('prov_imagina_ser_banxico_provider_metadata');
assert.equal(banxico.provenance_status, adapter.PROVENANCE_STATUSES.RUNTIME_GATE_REQUIRED);
assert.equal(banxico.verification_policy, adapter.VERIFICATION_POLICIES.REQUIRE_RUNTIME_GATE_BEFORE_PROVIDER_CALL);
assert(banxico.safe_errors.includes(adapter.SAFE_ERROR_CODES.BANXICO_CALL_NOT_AUTHORIZED));

const fixture = byId('prov_quote_pdf_preview_fixture_text');
assert.equal(fixture.provenance_type, adapter.PROVENANCE_TYPES.FIXTURE_TEXT);
assert.equal(fixture.provenance_status, adapter.PROVENANCE_STATUSES.FIXTURE_ONLY);
assert(fixture.blocked_misuse.includes('fixture_as_real_pdf'));
assert(fixture.safe_errors.includes(adapter.SAFE_ERROR_CODES.FIXTURE_AS_REAL_PDF_BLOCKED));

const governance = byId('prov_repo_promotion_governance_assertion');
assert.equal(governance.provenance_type, adapter.PROVENANCE_TYPES.GOVERNANCE_ASSERTION);
assert.equal(governance.provenance_status, adapter.PROVENANCE_STATUSES.GOVERNANCE_ONLY);
assert(governance.blocked_misuse.includes('extraction_claim'));
assert(governance.safe_errors.includes(adapter.SAFE_ERROR_CODES.GOVERNANCE_AS_EXTRACTION_PROOF_BLOCKED));

const engineRef = byId('prov_engine_refs_existing_catalog_requirement');
assert.equal(engineRef.provenance_type, adapter.PROVENANCE_TYPES.ENGINE_REFERENCE);
assert(engineRef.blocked_misuse.includes('duplicate_parser_creation'));
assert(engineRef.safe_errors.includes(adapter.SAFE_ERROR_CODES.DUPLICATE_ENGINE_CREATION_BLOCKED));

const byTest = adapter.getProvenanceByTestId('real_retirement_mxn_scenario_candidate');
assert(byTest.some((entry) => entry.provenance_id === 'prov_real_retirement_mxn_expected_values'));

const expectedValueEntries = adapter.getExpectedValueProvenanceEntries();
assert(expectedValueEntries.some((entry) => entry.provenance_id === 'prov_gmm_out_of_pocket_expected_values'));
assert(expectedValueEntries.some((entry) => entry.provenance_id === 'prov_real_retirement_mxn_expected_values'));

const fixtureOnly = adapter.getFixtureOnlyProvenanceEntries();
assert.equal(fixtureOnly.length, 1);
assert.equal(fixtureOnly[0].provenance_id, 'prov_quote_pdf_preview_fixture_text');

const governanceOnly = adapter.getGovernanceOnlyProvenanceEntries();
assert(governanceOnly.length >= 2);
assert(governanceOnly.some((entry) => entry.provenance_id === 'prov_repo_promotion_governance_assertion'));

const runtimeGate = adapter.getRuntimeGateProvenanceEntries();
assert(runtimeGate.some((entry) => entry.provenance_id === 'prov_imagina_ser_banxico_provider_metadata'));

const missing = adapter.getProvenanceById('missing_provenance');
assert.equal(missing.readModelStatus, 'error');
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVENANCE_NOT_MAPPED));
assert(missing.safe_errors.includes(adapter.SAFE_ERROR_CODES.PROVENANCE_EXECUTION_NOT_AUTHORIZED));
assert.equal(adapter.validateProvenanceShape(missing).ok, true);

for (const [key, value] of Object.entries(adapter.DEFAULT_SAFETY_FLAGS)) {
  assert.equal(value, false, `DEFAULT_SAFETY_FLAGS.${key} must be false`);
}

for (const entry of catalog.provenance) {
  for (const [key, value] of Object.entries(entry.safety_flags || {})) {
    assert.equal(value, false, `${entry.provenance_id}.${key} must be false`);
  }
}

const combined = JSON.stringify({
  catalog,
  missing,
  flags: adapter.DEFAULT_SAFETY_FLAGS,
  safeErrors: adapter.SAFE_ERROR_CODES,
});

const forbiddenFragments = [
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
];

for (const fragment of forbiddenFragments) {
  assert(!combined.includes(fragment), `forbidden true flag found: ${fragment}`);
}

console.log('PASS quote preview pdf engine canonical test evidence provenance registry adapter 079B');
