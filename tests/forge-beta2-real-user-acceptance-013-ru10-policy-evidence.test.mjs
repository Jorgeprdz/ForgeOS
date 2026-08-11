import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const owner = fs.readFileSync(
  'docs/static-preview/forge-aura/cartera/cartera-policy-evidence-presentation-013.js',
  'utf8',
);
const wrapper = fs.readFileSync(
  'docs/static-preview/forge-aura/cartera/cartera-module-v10-013.js',
  'utf8',
);
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');

test('RU10 presentation distinguishes document-only coverage evidence from canonical Policy Truth', () => {
  assert.match(owner, /DOCUMENT_EVIDENCE_ONLY/);
  assert.match(owner, /El documento sí contiene coberturas, pero todavía no hay detalle de coberturas confirmado en la póliza/);
  assert.match(owner, /esas filas siguen siendo evidencia documental/);
  assert.match(owner, /no deben leerse como coberturas contratadas confirmadas/);
});

test('RU10 presentation also explains coexistence of canonical coverage and document evidence', () => {
  assert.match(owner, /CANONICAL_AND_DOCUMENT_EVIDENCE/);
  assert.match(owner, /Las coberturas confirmadas son la referencia de Policy Truth/);
  assert.match(owner, /no crean ni reemplazan coberturas por sí solas/);
  assert.match(owner, /NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS/);
  assert.match(owner, /Esto no significa que la póliza no tenga coberturas/);
});

test('RU10 is presentation-only, consumed by the wrapper, and productively mounted by Aura', () => {
  for (const forbidden of [
    '.insert(', '.update(', '.delete(', '.rpc(', 'service_role',
    'create table', 'create or replace function', 'premium_amount =',
  ]) {
    assert.equal(owner.toLowerCase().includes(forbidden), false, forbidden);
  }
  assert.match(owner, /role:\s*'PRESENTATION_ONLY'/);
  assert.match(owner, /evidencePromotedToTruth:\s*false/);
  assert.match(owner, /createsPolicy:\s*false/);
  assert.match(owner, /persists:\s*false/);
  assert.match(wrapper, /cartera-policy-evidence-presentation-013\.js/);
  assert.match(wrapper, /reconcilePolicyEvidencePresentation\(root\)/);
  assert.match(
    index,
    /"\.\/cartera\/cartera-module\.js\?v=aura-cartera-pdf-auth-002"\s*:\s*"\.\/cartera\/cartera-module-v10-013\.js\?v=forge-beta2-013-policy-evidence-presentation"/,
  );
});
