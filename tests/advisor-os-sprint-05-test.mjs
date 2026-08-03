import test from 'node:test';
import assert from 'node:assert/strict';

import { createPersonRelationshipWorkspaceRuntime } from '../advisor-os/person-workspace/person-relationship-workspace-runtime.js';

function workspaceFixture() {
  return {
    personReference: 'person-1',
    sections: [
      { id: 'OPPORTUNITIES', items: [{ reference: 'prospect-1', label: 'Seguimiento vencido', state: 'OVERDUE', authority: 'PIPELINE', attentionRequired: true, deepLink: '?nav=pipeline&prospect=prospect-1' }] },
      { id: 'POLICIES', items: [{ reference: 'policy-1', label: 'Vida', state: 'ACTIVE', authority: 'CARTERA' }] },
    ],
  };
}

function intelligenceFixture(personReference = 'person-1') {
  return {
    personReference,
    domains: [
      { id: 'FUTURE_RADAR', items: [{ reference: 'signal-1', label: 'Revisión anual', state: 'REVIEW_REQUIRED', reviewRequired: true, smallestUsefulAction: 'Preparar revisión anual', authority: 'CARTERA_050', deepLink: '?nav=cartera&intelligence=future-radar' }] },
      { id: 'PRODUCTIVITY', status: 'UNAVAILABLE', items: [] },
    ],
  };
}

test('composes CRS-09 workspace with CRS-10 intelligence without becoming authority', async () => {
  const runtime = createPersonRelationshipWorkspaceRuntime({
    workspaceLoader: async () => workspaceFixture(),
    intelligenceLoader: async ({ personReference }) => intelligenceFixture(personReference),
  });
  const result = await runtime.load({ personReference: 'person-1' });
  assert.equal(result.status, 'READY');
  assert.equal(result.snapshot.personReference, 'person-1');
  assert.equal(result.snapshot.priorities[0].label, 'Seguimiento vencido');
  assert.equal(result.snapshot.diagnostics.secondPersonStore, false);
  assert.equal(result.snapshot.diagnostics.secondScoreEngine, false);
  assert.equal(result.snapshot.diagnostics.directWrite, false);
  assert.equal(result.snapshot.diagnostics.unknownAsZero, false);
});

test('emits advisory notification signals but no mutation commands', async () => {
  const runtime = createPersonRelationshipWorkspaceRuntime({
    workspaceLoader: async () => workspaceFixture(),
    intelligenceLoader: async () => intelligenceFixture(),
  });
  const result = await runtime.load({ personReference: 'person-1' });
  assert.ok(result.snapshot.notificationSignals.length >= 2);
  for (const signal of result.snapshot.notificationSignals) {
    assert.equal(signal.subjectReference, 'person-1');
    assert.equal(signal.containsBusinessData, false);
    assert.equal('execute' in signal, false);
    assert.equal('confirm' in signal, false);
  }
});

test('rejects cross-person intelligence contamination', async () => {
  const runtime = createPersonRelationshipWorkspaceRuntime({
    workspaceLoader: async () => workspaceFixture(),
    intelligenceLoader: async () => intelligenceFixture('person-2'),
  });
  await assert.rejects(() => runtime.load({ personReference: 'person-1' }), /PERSON_CONTEXT_MISMATCH/);
});

test('scrub invalidates late results after logout or person switch', async () => {
  let release;
  const runtime = createPersonRelationshipWorkspaceRuntime({
    workspaceLoader: () => new Promise(resolve => { release = resolve; }),
    intelligenceLoader: async () => intelligenceFixture(),
  });
  const pending = runtime.load({ personReference: 'person-1' });
  runtime.scrub();
  release(workspaceFixture());
  const result = await pending;
  assert.equal(result.status, 'STALE');
  assert.equal(result.snapshot, null);
});
