import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');
const index=read('docs/static-preview/forge-aura/index.html');
const app=read('docs/static-preview/forge-aura/app-v4-r1.js');
const bridge=read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-011b.js');
const bridge015=read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-015.js');
const cartera015=read('docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js');
const css=read('docs/static-preview/forge-aura/cartera/cartera-relational-011b.css');

test('011B productive invariants remain reachable through the exact governed Fase 015 importmap successors',()=>{
  assert.match(app,/import\("\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012"\)/);
  assert.match(app,/import\("\.\/recomposition\/pipeline-consumer-bridge-008\.js\?v=forge-global-aura-recomposition-008"\)/);
  assert.match(index,/"\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012": "\.\/cartera\/cartera-module-v12-015\.js\?v=forge-commercial-compass-015"/);
  assert.match(index,/"\.\/recomposition\/pipeline-consumer-bridge-008\.js\?v=forge-global-aura-recomposition-008": "\.\/recomposition\/pipeline-consumer-bridge-015\.js\?v=forge-commercial-compass-015"/);
  assert.match(cartera015,/cartera-module-v10-013\.js\?v=forge-commercial-compass-015-base/);
  assert.match(bridge015,/pipeline-consumer-bridge-008\.js\?v=forge-commercial-compass-015-base/);
});

test('011B productive page keeps governed conversation and integrated Cartera styles while using the current bootstrap key',()=>{
  assert.match(index,/pipeline-conversation-workspace\.css\?v=forge-aura-production-entrypoint-hotfix-011b/);
  assert.match(index,/cartera-relational-011b\.css\?v=forge-aura-production-entrypoint-hotfix-011b/);
  assert.match(index,/aura-bootstrap-v4-r1\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
  assert.doesNotMatch(index,/cartera-relationship-011a\.css/);
});

test('011B historical Pipeline bridge still preserves 008 while binding governed adapter and Conversation Workspace',()=>{
  assert.match(bridge,/pipeline-consumer-bridge-008\.js\?v=forge-aura-production-entrypoint-hotfix-011b-base/);
  assert.match(bridge,/pipeline-adapter-pages-v5\.js\?v=forge-aura-production-entrypoint-hotfix-011b/);
  assert.match(bridge,/pipeline-conversation-workspace\.js\?v=forge-aura-production-entrypoint-hotfix-011b/);
  assert.match(bridge,/adapterFactory: async args/);
  assert.match(bridge,/event\.preventDefault\(\)/);
  assert.match(bridge,/event\.stopImmediatePropagation\(\)/);
  assert.match(bridge,/workspace\.open\(\{ card, adapter, trigger \}\)/);
  assert.doesNotMatch(bridge,/windowRef\.open\(/);
});

test('011B Cartera is one visual relationship card, not a second policy box',()=>{
  assert.match(css,/\.cartera-relationship-card\{/);
  assert.match(css,/\.cartera-relationship-card>\.cartera-directory-row\{[\s\S]*border:0!important/);
  assert.match(css,/\.cartera-related-heading\{display:none!important\}/);
  assert.match(css,/\.cartera-related-section \.cartera-directory-row,[\s\S]*border:0!important/);
  assert.match(css,/\.cartera-related-section \.cartera-directory-icon,[\s\S]*display:none!important/);
  assert.match(css,/content:'Póliza · '/);
});