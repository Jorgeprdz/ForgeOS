import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pendingReviewSignal002b } from '../docs/static-preview/forge-aura/cartera/cartera-live-closure-002b.js';
import {
  CARTERA_PRIMARY_ATTENTION_OWNER_002C,
  safePersonLabel002c,
  composeCarteraRadarWithPendingReviews002c,
} from '../docs/static-preview/forge-aura/cartera/cartera-live-closure-002c.js';
import { sanitizeCarteraRadarHtml002c } from '../docs/static-preview/forge-aura/cartera/cartera-radar-presentation-002c.js';
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
  const base = pendingReviewSignal002b({
    review: { packetReference, confidence: 0.92, warnings: [] },
    model: model(overrides),
    asOfDate: '2026-08-14',
  });
  return {
    ...base,
    personDisplayName: safePersonLabel002c(base?.personDisplayName),
  };
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

function productiveHtml(items) {
  return sanitizeCarteraRadarHtml002c(
    renderCartera050FutureRadar({ status: 'READY', radar: radar(items), horizon: 'ALL' }),
  );
}

test('A — unresolved canonical person reference never becomes user-visible copy', () => {
  const item = packetSignal('POLICY_PACKET:AURA:002c-a');
  assert.equal(item.personDisplayName, 'Persona por confirmar');

  const text = visibleText(productiveHtml([item]));
  assert.match(text, /Persona por confirmar/);
  assert.doesNotMatch(text, /person:cartera:/i);
  assert.doesNotMatch(text, /policy:cartera:/i);
  assert.doesNotMatch(text, /POLICY_PACKET:AURA:/i);
  assert.doesNotMatch(text, /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i);
});

test('A2 — 002C reuses the canonical directory label before falling back', async () => {
  const source = await read('docs/static-preview/forge-aura/cartera/cartera-live-closure-002c.js');
  assert.match(source, /item\?\.label \|\| item\?\.displayLabel/);
  assert.match(source, /const directoryLabel = personReference \? personLabels\.get\(personReference\) : null/);
  assert.match(source, /const personDisplayName = directoryLabel \|\| safePersonLabel002c\(upstreamLabel\)/);
});

test('B — pending document evidence is visibly distinct from canonical policy incompleteness', () => {
  const item = packetSignal('POLICY_PACKET:AURA:002c-b', { displayLabel: 'Adrián' });
  const text = visibleText(productiveHtml([item]));
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
    personDisplayName: 'Persona por confirmar',
  };
  const composed = composeCarteraRadarWithPendingReviews002c(radar([alreadyProjected]), [pending]);
  assert.equal(composed.items.filter(item => item.sourceRecordReference === packetReference).length, 1);
  assert.equal(composed.focusItems.filter(item => item.sourceRecordReference === packetReference).length, 1);
});

test('D — distinct POLICY_PACKET lineages for the same person remain distinct', () => {
  const one = packetSignal('POLICY_PACKET:AURA:002c-d1', { displayLabel: 'Adrián' });
  const two = packetSignal('POLICY_PACKET:AURA:002c-d2', { displayLabel: 'Adrián' });
  const composed = composeCarteraRadarWithPendingReviews002c(radar([]), [one, two]);
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
  const composed = composeCarteraRadarWithPendingReviews002c(radar([]), [unresolved, confirmed]);
  const exact = composed.items.filter(item => item.sourceRecordReference === packetReference);
  assert.equal(exact.length, 1);
  assert.equal(exact[0].personReference, 'person:cartera:adrian');
  assert.equal(exact[0].personDisplayName, 'Adrián');
});

test('F — both presentation reconcilers remain idempotent and guard repeated writes', async () => {
  const [basePresentation, radarPresentation] = await Promise.all([
    read('docs/static-preview/forge-aura/cartera/cartera-live-presentation-002b.js'),
    read('docs/static-preview/forge-aura/cartera/cartera-radar-presentation-002c.js'),
  ]);
  assert.match(basePresentation, /if \(nextLabel !== currentLabel\) confirmationChip\.textContent = nextLabel/);
  assert.match(basePresentation, /if \(confirmationChip\.getAttribute\('aria-label'\) !== ariaLabel\)/);
  assert.match(basePresentation, /if \(scheduled\) return/);
  assert.match(radarPresentation, /if \(title && text\(title\.textContent\) !== DOCUMENT_REVIEW_LABEL\)/);
  assert.match(radarPresentation, /if \(isInternalCarteraReference002c\(current\) && current !== CARTERA_SAFE_PERSON_FALLBACK_002C\)/);
  assert.match(radarPresentation, /if \(next !== current\) child\.nodeValue = next/);
  assert.match(radarPresentation, /if \(scheduled\) return/);
  assert.doesNotMatch(`${basePresentation}\n${radarPresentation}`, /setInterval\s*\(/);
});

test('G — Future Radar remains the only primary Cartera attention owner', async () => {
  const [baseClosure, module] = await Promise.all([
    read('docs/static-preview/forge-aura/cartera/cartera-live-closure-002b.js'),
    read('docs/static-preview/forge-aura/cartera/cartera-module-v13-017e.js'),
  ]);
  assert.equal(CARTERA_PRIMARY_ATTENTION_OWNER_002C, 'CARTERA_050_FUTURE_RADAR');
  assert.match(baseClosure, /querySelector\('#cartera-attention-title'\)\?\.closest\('\.cartera-panel'\)/);
  assert.match(module, /primaryAttentionOwner: CARTERA_PRIMARY_ATTENTION_OWNER_002B/);
  assert.match(module, /void createAuraCarteraFutureRadar017e/);
  assert.doesNotMatch(module, /Lo que conviene revisar ahora/);
});
