import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  humanConfidenceLabel,
  humanEvidenceLabel,
  humanStateLabel,
  presentationDiagnostics,
} from '../docs/static-preview/forge-aura/recomposition/human-context-presentation-013.js';

const shared = fs.readFileSync(
  'docs/static-preview/forge-aura/recomposition/human-context-presentation-013.js',
  'utf8',
);
const homePresentation = fs.readFileSync(
  'docs/static-preview/forge-aura/home/home-human-presentation-013.js',
  'utf8',
);
const homeWrapper = fs.readFileSync(
  'docs/static-preview/forge-aura/home/home-module-008.js',
  'utf8',
);
const pipelinePresentation = fs.readFileSync(
  'docs/static-preview/forge-aura/recomposition/pipeline-crs10-context-presentation-013.js',
  'utf8',
);
const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4-r1.js', 'utf8');

test('RU12 shared contract is presentation-only and preserves unknowns without creating authority', () => {
  assert.equal(humanStateLabel('CONFIRMED'), 'Confirmado');
  assert.equal(humanStateLabel('UNKNOWN'), 'Aún no sabemos');
  assert.equal(humanConfidenceLabel('HIGH'), 'Alta');
  assert.equal(humanEvidenceLabel(2), '2 evidencias');
  assert.deepEqual(presentationDiagnostics(), {
    contractId: 'FORGE_HUMAN_CONTEXT_PRESENTATION_013',
    role: 'PRESENTATION_ONLY',
    createsTruth: false,
    createsScore: false,
    calculatesPriority: false,
    createsRecommendation: false,
    callsAi: false,
    callsNash: false,
    persists: false,
    mutatesIdentity: false,
    mutatesPolicy: false,
  });
  for (const forbidden of [
    '.insert(', '.update(', '.delete(', '.rpc(', 'service_role',
    'create table', 'create or replace function', 'weightedScore', 'priorityScore =',
  ]) {
    assert.equal(shared.toLowerCase().includes(forbidden.toLowerCase()), false, forbidden);
  }
});

test('RU12 is actually reused by Home and Pipeline instead of introducing parallel presentation engines', () => {
  assert.match(homePresentation, /recomposition\/human-context-presentation-013\.js/);
  assert.match(pipelinePresentation, /\.\/human-context-presentation-013\.js/);
  assert.match(homePresentation, /presentationDiagnostics\(\)/);
  assert.match(pipelinePresentation, /presentationDiagnostics\(\)/);
  assert.match(homeWrapper, /home-human-presentation-013\.js/);
  assert.match(homeWrapper, /normalizeHomePresentation\(root\)/);
  assert.match(app, /\.\/home\/home-module-008\.js/);
});

test('RU11 Home presentation removes architecture vocabulary from primary copy while retaining technical disclosure', () => {
  assert.match(homePresentation, /La agenda no respondió\. Forge no mostrará tus pendientes como cero mientras falte esa información\./);
  assert.match(homePresentation, /No hay asuntos adicionales que requieran tu revisión con la información disponible\./);
  assert.match(homePresentation, /Por qué conviene revisarlo/);
  assert.match(homePresentation, /Información técnica/);
  assert.match(homePresentation, /Fuente interna/);
  assert.match(homePresentation, /Inicio resume información de las fuentes conectadas/);
  assert.match(homePresentation, /role:\s*'PRESENTATION_ONLY'/);
  assert.match(homePresentation, /domainWrites:\s*0/);
  assert.match(homePresentation, /ownerChanges:\s*0/);
});
