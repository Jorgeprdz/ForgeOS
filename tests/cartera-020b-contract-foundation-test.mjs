import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTAKE_CLASSIFICATION_STATES,
  INTAKE_DOCUMENT_TYPES,
  INTAKE_EXTRACTION_STATUSES,
  INTAKE_FIELD_STATES,
  INTAKE_PARSER_RESOLUTION_STATES,
  createClassificationCandidate,
  createExtractionEnvelope,
  createParserDescriptor,
  createPolicyFieldCandidate,
  intakeCreatesPolicyTruth,
} from '../policy-operations/intake/cartera-020b-intake-contracts.js';
import { createPolicyParserRegistry } from '../policy-operations/intake/cartera-020b-parser-registry.js';

test('provider-neutral extraction envelope preserves digest and no-truth boundary', () => {
  const envelope = createExtractionEnvelope({
    provider: 'LOCAL_PDFTOTEXT', providerVersion: '1.0.0', method: 'PDF_TEXT',
    status: INTAKE_EXTRACTION_STATUSES.COMPLETE,
    sourceDigest: 'a'.repeat(64), pageCount: 3, text: 'Póliza de vida',
    startedAt: '2026-07-31T18:00:00Z', completedAt: '2026-07-31T18:00:01Z',
  });
  assert.equal(envelope.createsTruth, false);
  assert.equal(envelope.sourceDigest, 'a'.repeat(64));
  assert.equal(Object.isFrozen(envelope), true);
});

test('failed or unsupported extraction cannot carry invented text', () => {
  assert.throws(() => createExtractionEnvelope({
    provider: 'P', providerVersion: '1', method: 'OCR',
    status: INTAKE_EXTRACTION_STATUSES.FAILED,
    sourceDigest: 'b'.repeat(64), text: 'invented',
    startedAt: '2026-07-31T18:00:00Z', completedAt: '2026-07-31T18:00:01Z',
  }), /non_complete_extraction_cannot_carry_text/);
});

test('classification with competing evidence remains ambiguous and reviewable', () => {
  const classification = createClassificationCandidate({
    documentType: INTAKE_DOCUMENT_TYPES.POLICY,
    confidence: 0.81,
    matchedEvidence: ['POLIZA'],
    competingCandidates: [{ documentType: INTAKE_DOCUMENT_TYPES.RECEIPT, confidence: 0.8 }],
  });
  assert.equal(classification.state, INTAKE_CLASSIFICATION_STATES.AMBIGUOUS);
  assert.equal(classification.requiresReview, true);
});

test('unknown field remains null and cannot silently acquire defaults', () => {
  const field = createPolicyFieldCandidate({
    fieldName: 'premium_amount', extractionMethod: 'PARSER', parserId: 'SMNYL_POLICY', parserVersion: '1',
  });
  assert.equal(field.state, INTAKE_FIELD_STATES.UNKNOWN);
  assert.equal(field.normalizedValue, null);
  assert.equal(field.rawValue, null);
  assert.equal(field.createsTruth, false);
});

test('unknown field rejects hidden values', () => {
  assert.throws(() => createPolicyFieldCandidate({
    fieldName: 'currency', rawValue: 'MXN', normalizedValue: 'MXN', state: INTAKE_FIELD_STATES.UNKNOWN,
    extractionMethod: 'PARSER', parserId: 'PARSER', parserVersion: '1',
  }), /unknown_field_cannot_carry_value/);
});

test('parser registry selects the strongest carrier/product match', () => {
  const registry = createPolicyParserRegistry([
    createParserDescriptor({ parserId: 'GENERIC', parserVersion: '1', carrier: '*', documentType: INTAKE_DOCUMENT_TYPES.POLICY, product: '*', priority: 0 }),
    createParserDescriptor({ parserId: 'SMNYL_VIDA', parserVersion: '2', carrier: 'SMNYL', documentType: INTAKE_DOCUMENT_TYPES.POLICY, product: 'VIDA_MUJER', priority: 1 }),
  ]);
  const resolved = registry.resolve({ carrier: 'SMNYL', documentType: INTAKE_DOCUMENT_TYPES.POLICY, product: 'VIDA_MUJER' });
  assert.equal(resolved.state, INTAKE_PARSER_RESOLUTION_STATES.MATCHED);
  assert.equal(resolved.parser.parserId, 'SMNYL_VIDA');
});

test('parser selection cannot use filename', () => {
  const registry = createPolicyParserRegistry([]);
  assert.throws(() => registry.resolve({ carrier: 'SMNYL', documentType: INTAKE_DOCUMENT_TYPES.POLICY, product: 'VIDA', filename: 'smnyl.pdf' }), /filename_cannot_select_parser/);
});

test('unknown carrier and product remain explicit', () => {
  const registry = createPolicyParserRegistry([
    createParserDescriptor({ parserId: 'SMNYL_VIDA', parserVersion: '1', carrier: 'SMNYL', documentType: INTAKE_DOCUMENT_TYPES.POLICY, product: 'VIDA_MUJER' }),
  ]);
  assert.equal(registry.resolve({ documentType: INTAKE_DOCUMENT_TYPES.POLICY, product: 'VIDA_MUJER' }).state, INTAKE_PARSER_RESOLUTION_STATES.UNKNOWN_CARRIER);
  assert.equal(registry.resolve({ carrier: 'SMNYL', documentType: INTAKE_DOCUMENT_TYPES.POLICY }).state, INTAKE_PARSER_RESOLUTION_STATES.UNKNOWN_PRODUCT);
});

test('intake contract never creates Policy truth', () => {
  assert.equal(intakeCreatesPolicyTruth(), false);
});
