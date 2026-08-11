import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const presentation = fs.readFileSync(
  'docs/static-preview/forge-aura/cartera/cartera-module-v10-013.js',
  'utf8',
);
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');

test('RU10 presentation distinguishes document-only coverage evidence from canonical Policy Truth', () => {
  assert.match(presentation, /DOCUMENT_EVIDENCE_ONLY/);
  assert.match(presentation, /El documento sí contiene coberturas, pero todavía no hay detalle de coberturas confirmado en la póliza/);
  assert.match(presentation, /esas filas siguen siendo evidencia documental/);
  assert.match(presentation, /no deben leerse como coberturas contratadas confirmadas/);
});

test('RU10 presentation also explains coexistence of canonical coverage and document evidence', () => {
  assert.match(presentation, /CANONICAL_AND_DOCUMENT_EVIDENCE/);
  assert.match(presentation, /Las coberturas confirmadas son la referencia de Policy Truth/);
  assert.match(presentation, /no crean ni reemplazan coberturas por sí solas/);
  assert.match(presentation, /NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS/);
  assert.match(presentation, /Esto no significa que la póliza no tenga coberturas/);
});

test('RU10 is presentation-only and the productive Aura import map mounts it', () => {
  for (const forbidden of [
    '.insert(', '.update(', '.delete(', '.rpc(', 'service_role',
    'create table', 'create or replace function', 'premium_amount =',
  ]) {
    assert.equal(presentation.toLowerCase().includes(forbidden), false, forbidden);
  }
  assert.match(presentation, /createBaseCarteraModule/);
  assert.match(presentation, /data\.policyEvidenceTruthState/);
  assert.match(
    index,
    /"\.\/cartera\/cartera-module\.js\?v=aura-cartera-pdf-auth-002"\s*:\s*"\.\/cartera\/cartera-module-v10-013\.js\?v=forge-beta2-013-policy-evidence-presentation"/,
  );
});
