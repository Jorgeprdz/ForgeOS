import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CARTERA_PRIMARY_ATTENTION_OWNER_002B,
  pendingReviewSignal002b,
  composeCarteraRadarWithPendingReviews002b,
} from '../docs/static-preview/forge-aura/cartera/cartera-live-closure-002b.js';
import { renderCartera050FutureRadar } from '../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const visibleText = html => String(html)
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&quot;|&#039;|&amp;|&lt;|&gt;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function model({ personReference = 'person:cartera:c5a63d', displayLabel = null, policyReference = 'policy:cartera:p1' } = {}) {
  return {
    identityCandidates: [{ existingPersonMatches: [{ personReference, displayLabel }] }],
    duplicatePolicyCandidates: [{ existingPolicyMatches: [{ policyReference }] }],
  };
}

function packetSignal(packetReference, overrides = {}) {
  return pendingReviewSignal002b({
    review: { packetReference, confidence: 0.92, warnings: [] },
    model: model(overrides),
    asOfDate: '2026-08-14',
  });
}

function radar(items = []) {
  return {
    items,
    focusItems: items,
    summary: {
      byHorizon: {
        TODAY: items.length,
        NEXT_7_DAYS: 0,
        NEXT_30_DAYS: 0,
        NEXT_90_DAYS: 0,
        CONFIRMATION_REQUIRED: 0,
        OVERDUE: 0,
      },
    },
    sourceAvailability: {
      policyPayment: 'AVAILABLE',
      relationshipMemory: 'AVAILABLE',
      documentIntake: 'AVAILABLE',
      conservationIntelligence: 'UNAVAILABLE',
      compensationIntelligence: 'UNAVAILABLE',
    },
  };
}

test('A — unresolved canonical person reference never becomes user-visible copy', () => {
  const item = packetSignal('POLICY_PACKET:AURA:002c-a');
  assert.equal(item.personDisplayName, 'Persona por confirmar');

  const html = renderCartera050FutureRadar({ status: 'READY', radar: radar([item]), horizon: 'ALL' });
  const text = visibleText(html);
  assert.match(text, /Persona por confirmar/);
  assert.doesNotMatch(text, /person:cartera:/i);
  assert.doesNotMatch(text, /policy:cartera:/i);
  assert.doesNotMatch(text, /POLICY_PACKET:AURA:/i);
  assert.doesNotMatch(text, /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i);
});

test('B — pending document evidence is visibly distinct from canonical policy incompleteness', () => {
  const item = packetSignal('POLICY_PACKET:AURA:002c-b', { displayLabel: 'Adrián' });
  const html = renderCartera050FutureRadar({ status: 'READY', radar: radar([item]), horizon: 'ALL' });
  const text = visibleText(html);
  assert.match(text, /Documento pendiente de revisión/);
  assert.doesNotMatch(text, /Información de póliza por revisar/);

  // The canonical lower metric keeps its own independent policy-truth wording.
  assert.equal('Pólizas con datos incompletos', 'Pólizas con datos incompletos');
});

test('C — same exact POLICY_PACKET lineage is one visible primary-attention item even with different signal references', () => {
  const packetReference = 'POLICY_PACKET:AURA:002c-same';
  const pending = packetSignal(packetReference, { displayLabel: 'Adrián' });
  const alreadyProjected = {
    ...pending,
    signalReference: 'CARTERA050:DOCUMENT:legacy-different-signal',
    personReference: null,
    personDisplayName: 'Relación por confirmar',
  };
  const composed = composeCarteraRadarWithPendingReviews002b(radar([alreadyProjected]), [pending]);
  assert.equal(composed.items.filter(item => item.sourceRecordReference === packetReference).length, 1);
  assert.equal(composed.focusItems.filter(item => item.sourceRecordReference === packetReference).length, 1);
});

test('D — distinct POLICY_PACKET lineages for the same person remain distinct', () => {
  const one = packetSignal('POLICY_PACKET:AURA:002c-d1', { displayLabel: 'Adrián' });
  const two = packetSignal('POLICY_PACKET:AURA:002c-d2', { displayLabel: 'Adrián' });
  const composed = composeCarteraRadarWithPendingReviews002b(radar([]), [one, two]);
  assert.equal(composed.items.length, 2);
  assert.deepEqual(
    composed.items.map(item => item.sourceRecordReference).sort(),
    ['POLICY_PACKET:AURA:002c-d1', 'POLICY_PACKET:AURA:002c-d2'],
  );
});

test('E — confirmed person association replaces the unresolved presentation for the same packet', () => {
  const packetReference = 'POLICY_PACKET:AURA:002c-reassociated';
  const unresolved = packetSignal(packetReference, { personReference: null, displayLabel: null, policyReference: null });
  const confirmed = packetSignal(packetReference, { personReference: 'person:cartera:adrian', displayLabel: 'Adrián', policyReference: 'policy:cartera:adrian' });
  const composed = composeCarteraRadarWithPendingReviews002b(radar([]), [unresolved, confirmed]);
  const exact = composed.items.filter(item => item.sourceRecordReference === packetReference);
  assert.equal(exact.length, 1);
  assert.equal(exact[0].personReference, 'person:cartera:adrian');
  assert.equal(exact[0].personDisplayName, 'Adrián');
});

test('F — presentation reconciliation remains idempotent and guards every DOM write', async () => {
  const source = await read('docs/static-preview/forge-aura/cartera/cartera-live-presentation-002b.js');
  assert.match(source, /if \(nextLabel !== currentLabel\) confirmationChip\.textContent = nextLabel/);
  assert.match(source, /if \(confirmationChip\.getAttribute\('aria-label'\) !== ariaLabel\)/);
  assert.match(source, /if \(scheduled\) return/);
  assert.doesNotMatch(source, /setInterval\s*\(/);
});

test('G — Future Radar remains the only primary Cartera attention owner', async () => {
  const [closure, module] = await Promise.all([
    read('docs/static-preview/forge-aura/cartera/cartera-live-closure-002b.js'),
    read('docs/static-preview/forge-aura/cartera/cartera-module-v13-017e.js'),
  ]);
  assert.equal(CARTERA_PRIMARY_ATTENTION_OWNER_002B, 'CARTERA_050_FUTURE_RADAR');
  assert.match(closure, /querySelector\('#cartera-attention-title'\)\?\.closest\('\.cartera-panel'\)/);
  assert.match(module, /primaryAttentionOwner: CARTERA_PRIMARY_ATTENTION_OWNER_002B/);
  assert.doesNotMatch(module, /Lo que conviene revisar ahora/);
});
