import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderCartera090RelationshipCapital,
} from '../platform/relationship-intelligence/cartera-090d-relationship-capital-view.js';

function capital(overrides = {}) {
  return {
    summary: {
      confirmedEdgeCount: 2,
      hypothesisCount: 1,
      reviewItemCount: 1,
    },
    sourceState: {
      relationshipGrowth: 'CONNECTED',
      relationshipMemory: 'CONNECTED',
    },
    items: [{
      capitalReference: 'capital-1',
      capitalClass: 'CENTER_OF_INFLUENCE_CONTEXT',
      personReference: 'person-1',
      displayName: 'Karla',
      whyThisRelationship: 'La relación está activa.',
      whyNow: 'Conviene fortalecerla sin esperar una venta.',
      uncertainty: 'No prueba influencia ni voluntad futura.',
      smallestUsefulAction: 'Preparar una revisión de relación.',
      advisorMustConfirm: 'Confirmar propósito y consentimiento.',
      evidence: [{
        reference: 'memory-1',
        authority: 'RELATIONSHIP_MEMORY',
        truthClass: 'CLIENT_CONFIRMED_WILLINGNESS',
      }],
    }],
    ...overrides,
  };
}

test('090D explains relationship context, uncertainty and evidence without a score', () => {
  const html = renderCartera090RelationshipCapital({
    status: 'READY',
    capital: capital(),
  });
  assert.match(html, /CAPITAL RELACIONAL/);
  assert.match(html, /SIN SCORE/);
  assert.match(html, /Por qué esta relación/);
  assert.match(html, /Incertidumbre/);
  assert.match(html, /Preparar revisión/);
  assert.doesNotMatch(html, /99%|score de influencia:\s*\d|prioridad final/i);
});

test('090D exposes partial source state honestly', () => {
  const html = renderCartera090RelationshipCapital({
    status: 'READY',
    capital: capital({
      sourceState: {
        relationshipGrowth: 'CONNECTED',
        relationshipMemory: 'PARTIAL',
      },
    }),
  });
  assert.match(html, /no está disponible/i);
  assert.match(html, /No se sustituyó con ceros/i);
});

test('090D escapes untrusted labels and evidence', () => {
  const fixture = capital();
  fixture.items[0].displayName = '<script>alert(1)</script>';
  fixture.items[0].evidence[0].reference = '<img src=x>';
  const html = renderCartera090RelationshipCapital({ status: 'READY', capital: fixture });
  assert.doesNotMatch(html, /<script>|<img src=x>/);
  assert.match(html, /&lt;script&gt;/);
});

test('090D states every prohibited execution boundary', () => {
  const html = renderCartera090RelationshipCapital({ status: 'READY', capital: capital({ items: [] }) });
  assert.match(html, /No modifica el grafo/);
  assert.match(html, /no pide referidos/);
  assert.match(html, /no contacta personas/);
  assert.match(html, /no crea tareas, calendarios u oportunidades/);
  assert.match(html, /no decide prioridad NBA/);
});
