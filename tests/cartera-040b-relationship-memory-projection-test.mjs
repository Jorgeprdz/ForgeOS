import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartera040RelationshipMemoryProjection } from '../platform/relationship-intelligence/cartera-040b-relationship-memory-projection.js';

function raw() {
    return {
        person: {
            personReference: 'PERSON:1',
            displayName: 'Ana',
            lifecycleState: 'CONFIRMED',
            privacyClassification: 'PRIVATE',
        },
        summary: {},
        network: {
            accounts: [{ accountReference: 'ACCOUNT:1', displayLabel: 'Familia', accountType: 'HOUSEHOLD', relationshipRole: 'MEMBER', confirmationState: 'CONFIRMED' }],
            policies: [{ policyReference: 'POLICY:1', carrierReference: 'CARRIER:1', productReference: 'VIDA', status: 'ACTIVE', roleType: 'INSURED' }],
        },
        preferences: [{
            memoryReference: 'MEMORY:1',
            kind: 'CONTACT_PREFERENCE',
            summary: 'Prefiere WhatsApp.',
            valueCode: 'WHATSAPP',
            occurredAt: '2026-08-01T01:00:00Z',
            sourceAuthority: 'CLIENT_CONFIRMED',
            consentState: 'NOT_REQUIRED',
            contextUse: 'GENERAL_RELATIONSHIP',
            truthClass: 'CONFIRMED_MEMORY',
            salesTrigger: false,
        }],
        commitments: [],
        lifeContext: [{
            memoryReference: 'MEMORY:2',
            summary: 'Cambio familiar confirmado.',
            occurredAt: '2026-08-01T02:00:00Z',
            sourceAuthority: 'CLIENT_CONFIRMED',
            consentState: 'CONFIRMED',
            contextUse: 'CONVERSATION_PREPARATION',
            truthClass: 'CONFIRMED_SENSITIVE_CONTEXT',
            salesTrigger: false,
        }],
        history: [
            { eventType: 'POLICY_CONFIRMED', title: 'Póliza confirmada', summary: 'Vida', occurredAt: '2026-07-01T00:00:00Z', sourceAuthority: 'POLICY_INTELLIGENCE', truthClass: 'CONFIRMED_POLICY_FACT', contextUse: 'GENERAL_RELATIONSHIP', salesTrigger: false },
            { eventType: 'SERVICE_INTERACTION', title: 'Servicio', summary: 'Revisión', occurredAt: '2026-08-01T00:00:00Z', sourceAuthority: 'ADVISOR_CONFIRMED', truthClass: 'CONFIRMED_MEMORY', contextUse: 'GENERAL_RELATIONSHIP', salesTrigger: false },
        ],
        boundaries: {
            lifeContextIsSalesTrigger: false,
            automaticOpportunityCreation: false,
            automaticContactExecution: false,
            finalMessageGeneration: false,
            rawEvidenceExposed: false,
            beneficiaryDataExposed: false,
            paymentInstrumentDataExposed: false,
            advisorConfirmationRequired: true,
        },
    };
}

test('040B composes a deterministic relationship history and network context', () => {
    const projected = createCartera040RelationshipMemoryProjection(raw());
    assert.equal(projected.network.accounts.length, 1);
    assert.equal(projected.network.policies.length, 1);
    assert.equal(projected.preferences[0].valueCode, 'WHATSAPP');
    assert.equal(projected.history[0].eventType, 'SERVICE_INTERACTION');
    assert.equal(projected.readiness.canCreateOpportunity, false);
    assert.equal(projected.boundaries.finalMessageGeneration, false);
});

test('040C rejects unconfirmed life context and automatic sales triggers', () => {
    const unsafeConsent = raw();
    unsafeConsent.lifeContext[0].consentState = 'UNKNOWN';
    assert.throws(
        () => createCartera040RelationshipMemoryProjection(unsafeConsent),
        error => error.code === 'CARTERA040_UNCONFIRMED_LIFE_CONTEXT_EXPOSED'
    );

    const unsafeTrigger = raw();
    unsafeTrigger.history[0].salesTrigger = true;
    assert.throws(
        () => createCartera040RelationshipMemoryProjection(unsafeTrigger),
        error => error.code === 'CARTERA040_AUTOMATIC_SALES_TRIGGER_FORBIDDEN'
    );
});
