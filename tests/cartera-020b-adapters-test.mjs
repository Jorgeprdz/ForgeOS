import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalPdftotextAdapter } from '../policy-operations/intake/cartera-020b-pdftotext-adapter.js';
import { classifyPolicyDocument } from '../policy-operations/intake/cartera-020b-document-classifier.js';
import { createPendingPolicyPacketFromCandidates } from '../policy-operations/intake/cartera-020b-policy-packet-adapter.js';
import {
  INTAKE_CLASSIFICATION_STATES,
  INTAKE_DOCUMENT_TYPES,
  INTAKE_EXTRACTION_STATUSES,
  createPolicyFieldCandidate,
} from '../policy-operations/intake/cartera-020b-intake-contracts.js';

test('pdftotext adapter maps complete output into provider-neutral envelope', async () => {
  const times = [new Date('2026-07-31T18:00:00Z'), new Date('2026-07-31T18:00:01Z')];
  const adapter = createLocalPdftotextAdapter({
    extractor: async () => ({ status: 'ocr_complete', extractedText: 'PÓLIZA VIDA MUJER', source: 'pdftotext' }),
    clock: () => times.shift(),
  });
  const result = await adapter.extract({ filePath: '/fixture/policy.pdf', sourceDigest: 'c'.repeat(64) });
  assert.equal(result.envelope.status, INTAKE_EXTRACTION_STATUSES.COMPLETE);
  assert.equal(result.envelope.provider, 'LOCAL_PDFTOTEXT');
  assert.match(result.textDigest, /^[a-f0-9]{64}$/);
  assert.equal(result.createsTruth, false);
});

test('pdftotext failure remains failed evidence without text', async () => {
  const adapter = createLocalPdftotextAdapter({
    extractor: async () => ({ status: 'ocr_failed', extractedText: '', error: 'pdftotext failed' }),
    clock: (() => { let i = 0; return () => new Date(`2026-07-31T18:00:0${i++}Z`); })(),
  });
  const result = await adapter.extract({ filePath: '/fixture/policy.pdf', sourceDigest: 'd'.repeat(64) });
  assert.equal(result.envelope.status, INTAKE_EXTRACTION_STATUSES.FAILED);
  assert.equal(result.envelope.text, null);
  assert.deepEqual(result.envelope.errors, ['pdftotext failed']);
});

test('classifier does not coerce receipt mentioning policy into policy', () => {
  const result = classifyPolicyDocument({ text: 'RECIBO DE PAGO. NÚMERO DE PÓLIZA 123. IMPORTE 1000.' });
  assert.equal(result.documentType, INTAKE_DOCUMENT_TYPES.RECEIPT);
  assert.notEqual(result.state, INTAKE_CLASSIFICATION_STATES.UNKNOWN);
});

test('classifier marks materially competing receipt and endorsement signals ambiguous', () => {
  const result = classifyPolicyDocument({ text: 'RECIBO ENDOSO IMPORTE VIGENCIA DEL ENDOSO PÓLIZA' });
  assert.equal(result.state, INTAKE_CLASSIFICATION_STATES.AMBIGUOUS);
  assert.equal(result.requiresReview, true);
  assert.ok(result.competingCandidates.length >= 1);
});

test('packet adapter reuses canonical packet and remains pending confirmation', () => {
  const premium = createPolicyFieldCandidate({
    fieldName: 'annualPremium', rawValue: '$12,000', normalizedValue: 12000, confidence: 0.94,
    sourceLocation: { page: 2, label: 'Prima anual' }, extractionMethod: 'PDF_TEXT',
    parserId: 'SMNYL_VIDA_MUJER', parserVersion: '1',
  });
  const unknownCurrency = createPolicyFieldCandidate({
    fieldName: 'currency', extractionMethod: 'PDF_TEXT', parserId: 'SMNYL_VIDA_MUJER', parserVersion: '1',
  });
  const packet = createPendingPolicyPacketFromCandidates({
    packetReference: 'packet-1', documentReference: 'evidence-source/abc', documentType: 'POLICY',
    fieldCandidates: [premium, unknownCurrency], extractionConfidence: 0.9,
  });
  assert.equal(packet.confirmationState, 'pending_confirmation');
  assert.equal(packet.confirmedBy, null);
  assert.equal(packet.createsTruth, false);
  assert.equal(packet.canInvokeConfirmedPolicyCommand, false);
  assert.equal(packet.extractedFields.currency.value, null);
  assert.equal(packet.extractedFields.currency.state, 'unknown');
  assert.equal(packet.extractedFields.annualPremium.sourceLocation.page, 2);
});
