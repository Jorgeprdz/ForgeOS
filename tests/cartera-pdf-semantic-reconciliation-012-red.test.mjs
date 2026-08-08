import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const edge = fs.readFileSync('supabase/functions/cartera-pdf-intake/index.ts', 'utf8');
const v8 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v8.js', 'utf8');
const v7 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js', 'utf8');
const semantic = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-semantic-v1.js', 'utf8');
const ui = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v4.js', 'utf8');
const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');

const requiredSemanticKeys = [
  'policyType',
  'currency',
  'paymentFrequency',
  'issueDate',
  'basicPremiumTotal',
  'plannedPremium',
  'annualTotal',
  'beneficiariesDetected',
  'coverageCandidates',
];

test('Edge extraction contract preserves the golden document semantics', () => {
  for (const key of requiredSemanticKeys) {
    assert.match(edge, new RegExp(`\\b${key}\\b`), `Edge contract is missing ${key}`);
  }
  assert.match(edge, /TIPO DE P[ÓO]LIZA|TIPO DE POLIZA/i);
  assert.match(edge, /PRIMA B[ÁA]SICA TOTAL|PRIMA BASICA TOTAL/i);
  assert.match(edge, /PRIMA PLANEADA/i);
  assert.match(edge, /TOTAL ANUAL/i);
  assert.match(edge, /MONEDA UDI/);
  assert.match(edge, /NORMAL es policyType/);
  assert.match(edge, /automaticCoverageCreation:\s*false/);
});

test('v8 enriches the productive 020B result before persistence', () => {
  for (const key of requiredSemanticKeys) {
    assert.match(v8 + semantic, new RegExp(`\\b${key}\\b`), `semantic transport is missing ${key}`);
  }
  assert.match(v8, /RESULT_RPC\s*=\s*'forge_cartera020b_record_processing_result'/);
  assert.match(v8, /enrichProcessingArgs/);
  assert.match(v8, /extractedFields:\s*fields/);
  assert.match(semantic, /createsTruth:\s*false/);
  assert.match(semantic, /confirmationStatus:\s*previous\?\.confirmationStatus \|\| 'PENDING_CONFIRMATION'/);
});

test('same-PDF v7 rehydration preserves semantic fields and coverage candidates', () => {
  for (const key of requiredSemanticKeys) {
    assert.match(v7, new RegExp(`\\b${key}\\b`), `v7 reopen mapping is missing ${key}`);
  }
  assert.match(v7, /semanticReviewCandidate/);
  assert.match(v7, /CANDIDATES_REVIEW_REQUIRED/);
  assert.doesNotMatch(v7, /pdfCoverageExtraction:\s*'NOT_SUPPORTED'/);
});

test('review UI distinguishes type/status, protected beneficiaries and document premiums', () => {
  assert.match(ui, /Tipo de póliza/);
  assert.match(ui, /Estado/);
  assert.match(ui, /Prima básica total/i);
  assert.match(ui, /Prima planeada/i);
  assert.match(ui, /Total anual/i);
  assert.match(ui, /Beneficiarios detectados/);
  assert.match(ui, /Información protegida/);
  assert.match(ui, /Coberturas detectadas/i);
  assert.match(ui, /Vincular persona existente/);
  assert.doesNotMatch(ui, /Referencia de persona existente/);
  assert.doesNotMatch(ui, /person:…/);
});

test('canonical Aura import graph points Cartera at module v4 and adapter v8', () => {
  assert.match(app, /cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012/);
  assert.match(app, /cartera-semantic-012\.css\?v=cartera-pdf-semantic-reconciliation-012/);
  assert.match(index, /cartera-adapter-pages-v8\.js\?v=cartera-pdf-semantic-reconciliation-012/);
  assert.match(index, /cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012/);
});
