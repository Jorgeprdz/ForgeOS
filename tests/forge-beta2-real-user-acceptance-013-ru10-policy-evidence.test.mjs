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

test('RU10 presentation distinguishes document-found coverage from confirmed policy coverage', () => {
  assert.match(owner, /DOCUMENT_EVIDENCE_ONLY/);
  assert.match(owner, /Encontramos \$\{evidenceCount\} \$\{coverageWord\(evidenceCount\)\} en tu póliza/);
  assert.match(owner, /Revísalas para confirmar que estén correctas/);
  assert.match(owner, /información encontrada en el documento, no como coberturas confirmadas/);
});

test('RU10 presentation explains coexistence without saying document information is absent', () => {
  assert.match(owner, /CANONICAL_AND_DOCUMENT_EVIDENCE/);
  assert.match(owner, /Las confirmadas forman parte de la póliza/);
  assert.match(owner, /información adicional encontrada en el documento/);
  assert.match(owner, /NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS/);
  assert.match(owner, /Esto no significa que la póliza no tenga coberturas/);
});

test('RU10 remains presentation-only and Aura mounts the 014 wrapper over the existing owner', () => {
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
    /"\.\/cartera\/cartera-module\.js\?v=aura-cartera-pdf-auth-002"\s*:\s*"\.\/cartera\/cartera-module-v11-014\.js\?v=forge-aura-real-user-repair-014"/,
  );
});