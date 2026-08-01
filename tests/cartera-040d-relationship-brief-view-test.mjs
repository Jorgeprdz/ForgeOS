import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCartera040RelationshipBrief } from '../platform/relationship-intelligence/cartera-040d-relationship-brief-view.js';

const brief = {
    person: { personReference: 'PERSON:1', displayName: 'Ana', preferredName: 'Ani' },
    summary: { activePolicyCount: 1, preferenceCount: 1, openCommitmentCount: 1, historyCount: 2 },
    network: { accounts: [], policies: [] },
    preferences: [{ kind: 'CONTACT_PREFERENCE', summary: 'WhatsApp', truthClass: 'CONFIRMED_MEMORY', occurredAt: '2026-08-01T00:00:00Z', sourceAuthority: 'CLIENT_CONFIRMED' }],
    commitments: [{ kind: 'UNRESOLVED_COMMITMENT', summary: 'Enviar documento', truthClass: 'CONFIRMED_MEMORY', occurredAt: '2026-08-01T00:00:00Z', sourceAuthority: 'ADVISOR_CONFIRMED' }],
    lifeContext: [],
    history: [{ title: 'Servicio', summary: 'Revisión', truthClass: 'CONFIRMED_MEMORY', occurredAt: '2026-08-01T00:00:00Z', sourceAuthority: 'ADVISOR_CONFIRMED' }],
};

test('040D renders the pre-contact brief and explicit human memory capture', () => {
    const html = renderCartera040RelationshipBrief({ status: 'READY', brief });
    assert.match(html, /Brief previo al contacto/);
    assert.match(html, /Ver memoria|Memoria de relación/);
    assert.match(html, /data-relationship-memory-form/);
    assert.match(html, /consentimiento confirmado/i);
    assert.match(html, /no ejecuta contacto/i);
    assert.match(html, /no crea oportunidades/i);
    assert.doesNotMatch(html, /Enviar mensaje ahora|Crear oportunidad automáticamente|Contactar automáticamente/i);
});
