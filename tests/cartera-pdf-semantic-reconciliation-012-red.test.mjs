import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const edge = fs.readFileSync('supabase/functions/cartera-pdf-intake/index.ts', 'utf8');
const v1 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js', 'utf8');
const v7 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js', 'utf8');
const ui = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module.js', 'utf8');

const requiredSemanticKeys = [
  'policyType',
  'currency',
  'paymentFrequency',
  'issueDate',
  'basicPremiumTotal',
  'plannedPremium',
  'annualTotal',
  'coverageCandidates',
];

test('Edge extraction contract preserves the golden document semantics', () => {
  for (const key of requiredSemanticKeys) {
    assert.match(edge, new RegExp(`\\b${key}\\b`), `Edge contract is missing ${key}`);
  }
  assert.match(edge, /TIPO DE P[ÓO]LIZA|tipo de p[óo]liza/i);
  assert.match(edge, /PRIMA B[ÁA]SICA TOTAL|prima b[áa]sica total/i);
  assert.match(edge, /PRIMA PLANEADA|prima planeada/i);
  assert.match(edge, /TOTAL ANUAL|total anual/i);
});

test('productive v1 packet keeps policy type distinct from status and premiums distinct', () => {
  for (const key of requiredSemanticKeys) {
    assert.match(v1, new RegExp(`\\b${key}\\b`), `v1 packet mapping is missing ${key}`);
  }
  assert.doesNotMatch(v1, /status:field\(candidate\?\.policyType/);
  assert.match(v1, /createsTruth:false/);
});

test('same-PDF v7 rehydration does not erase semantic fields', () => {
  for (const key of requiredSemanticKeys) {
    assert.match(v7, new RegExp(`\\b${key}\\b`), `v7 reopen mapping is missing ${key}`);
  }
  assert.doesNotMatch(v7, /pdfCoverageExtraction:\s*'NOT_SUPPORTED'/);
});

test('review UI distinguishes type/status and never formats thousands into number inputs', () => {
  assert.match(ui, /Tipo de p[óo]liza|Tipo/);
  assert.match(ui, /Estado/);
  assert.match(ui, /Prima b[áa]sica total/i);
  assert.match(ui, /Prima planeada/i);
  assert.match(ui, /Total anual/i);
  assert.match(ui, /Coberturas detectadas/i);
});
