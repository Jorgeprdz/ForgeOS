import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const edge = fs.readFileSync('supabase/functions/cartera-pdf-intake/index.ts', 'utf8');
const moduleV12Phase015 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js', 'utf8');
const moduleV14 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v14-hotfix002.js', 'utf8');
const hotfixCore = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-hotfix002.js', 'utf8');
const v13 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v13.js', 'utf8');
const v12 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v12.js', 'utf8');
const v11 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js', 'utf8');
const v10 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js', 'utf8');
const v9 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v9.js', 'utf8');
const v8 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v8.js', 'utf8');
const v7 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js', 'utf8');
const semantic = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-semantic-v1.js', 'utf8');
const ui = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v5.js', 'utf8');
const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4-r1.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');

const requiredSemanticKeys = ['policyType','currency','paymentFrequency','issueDate','basicPremiumTotal','plannedPremium','annualTotal','beneficiariesDetected','coverageCandidates'];

test('Edge extraction contract preserves the golden document semantics', () => {
  for (const key of requiredSemanticKeys) assert.match(edge, new RegExp(`\\b${key}\\b`), `Edge contract is missing ${key}`);
  assert.match(edge, /TIPO DE P[ÓO]LIZA|TIPO DE POLIZA/i);
  assert.match(edge, /PRIMA B[ÁA]SICA TOTAL|PRIMA BASICA TOTAL/i);
  assert.match(edge, /PRIMA PLANEADA/i);
  assert.match(edge, /TOTAL ANUAL/i);
  assert.match(edge, /declara UDI, currency=UDI/);
  assert.match(edge, /NORMAL es policyType/);
  assert.match(edge, /automaticCoverageCreation:\s*false/);
  assert.match(edge, /semanticRecoveryReasons/);
});

test('v8 still enriches new-document 020B results before persistence', () => {
  for (const key of requiredSemanticKeys) assert.match(v8 + semantic, new RegExp(`\\b${key}\\b`), `semantic transport is missing ${key}`);
  assert.match(v8, /RESULT_RPC\s*=\s*'forge_cartera020b_record_processing_result'/);
  assert.match(v8, /enrichProcessingArgs/);
  assert.match(v8, /extractedFields:\s*fields/);
  assert.match(semantic, /createsTruth:\s*false/);
  assert.match(semantic, /confirmationStatus:\s*previous\?\.confirmationStatus \|\| 'PENDING_CONFIRMATION'/);
});

test('same-PDF chain preserves semantic fields and current boundary repairs stale legacy packets append-only', () => {
  for (const key of requiredSemanticKeys) assert.match(v7 + v9 + semantic, new RegExp(`\\b${key}\\b`), `same-PDF mapping is missing ${key}`);
  assert.match(v10, /cartera-adapter-pages-v9\.js/);
  assert.match(v7, /semanticReviewCandidate/);
  assert.match(v7, /pdfCoverageExtraction:\s*edgeCandidate\.coverageExtractionState/);
  assert.match(v7, /reviewCompleteness:\s*edgeCandidate\.reviewCompleteness/);
  assert.match(v9, /forge_cartera020b_refresh_pending_packet_semantics/);
  assert.match(v9, /POLICY_PACKET:AURA:SEMANTIC_REFRESH:/);
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
  assert.match(ui, /data-semantic-review="014"/);
  assert.doesNotMatch(ui, /Referencia de persona existente/);
  assert.doesNotMatch(ui, /person:…/);
  assert.doesNotMatch(ui, /Confianza alta/);
});

test('canonical Aura keeps inherited app specifier while Hotfix002 preserves phase015, v13 and semantic chains', () => {
  assert.match(app, /cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012/);
  assert.match(index, /"\.\/cartera\/cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh": "\.\/cartera\/cartera-adapter-pages-v13\.js\?v=forge-aura-production-entrypoint-hotfix-011b"/);
  assert.match(index, /"\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012": "\.\/cartera\/cartera-module-v14-hotfix002\.js\?v=post017e-hotfix002"/);
  assert.match(moduleV14, /cartera-module-hotfix002-entry\.js\?v=post017e-hotfix002/);
  assert.match(hotfixCore, /cartera-module-v13-017e\.js\?v=post017e-hotfix001/);
  assert.match(moduleV12Phase015, /cartera-module-v10-013\.js\?v=forge-commercial-compass-015-base/);
  assert.match(index, /aura-bootstrap-v4-r1\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
  assert.match(v13, /cartera-adapter-pages-v12\.js/);
  assert.match(v12, /cartera-adapter-pages-v11\.js/);
  assert.match(v11, /cartera-adapter-pages-v10\.js/);
  assert.match(v10, /cartera-adapter-pages-v9\.js/);
});