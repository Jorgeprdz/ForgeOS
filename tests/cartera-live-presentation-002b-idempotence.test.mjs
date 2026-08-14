import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { confirmationChipLabel002b } from '../docs/static-preview/forge-aura/cartera/cartera-live-presentation-002b.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('confirmation chip relabeling is idempotent', () => {
  const first = confirmationChipLabel002b('Confirmar · 0');
  const second = confirmationChipLabel002b(first);
  assert.equal(first, 'Pago por confirmar · 0');
  assert.equal(second, first);
});

test('MutationObserver reconciliation only writes chip text when the label changes', async () => {
  const [presentation, v13] = await Promise.all([
    read('docs/static-preview/forge-aura/cartera/cartera-live-presentation-002b.js'),
    read('docs/static-preview/forge-aura/cartera/cartera-module-v13-017e.js'),
  ]);

  assert.match(presentation, /const currentLabel = text\(confirmationChip\.textContent\)/);
  assert.match(presentation, /const nextLabel = confirmationChipLabel002b\(currentLabel\)/);
  assert.match(presentation, /if \(nextLabel !== currentLabel\) confirmationChip\.textContent = nextLabel/);
  assert.match(presentation, /observer\.observe\(root, \{ childList: true, subtree: true, characterData: true \}\)/);
  assert.match(v13, /cartera-live-presentation-002b\.js\?v=post017e-hotfix002-live-presentation-002b/);
  assert.match(v13, /presentationReconciliation: 'IDEMPOTENT_MUTATION_OBSERVER'/);
});
