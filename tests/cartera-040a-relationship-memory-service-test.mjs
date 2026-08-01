import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartera040RelationshipMemoryService } from '../advisor-os/cartera/cartera-040a-relationship-memory-service.js';

function briefPayload() {
    return {
        person: {
            personReference: 'PERSON:1',
            displayName: 'Ana',
            preferredName: 'Ani',
            lifecycleState: 'CONFIRMED',
            privacyClassification: 'PRIVATE',
        },
        summary: { historyCount: 0 },
        network: { accounts: [], policies: [] },
        preferences: [],
        commitments: [],
        lifeContext: [],
        history: [],
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

test('040A records digest-bound evidence-backed memory and reads the sanitized brief', async () => {
    const calls = [];
    const client = {
        auth: { getUser: async () => ({ data: { user: { id: 'advisor-1' } } }) },
        rpc: async (name, args) => {
            calls.push({ name, args });
            if (name === 'forge_cartera040_list_relationship_brief') {
                return { data: briefPayload() };
            }
            return {
                data: {
                    recordingState: 'COMPLETE',
                    memoryReference: 'RELATIONSHIP_MEMORY:abc',
                    automaticOpportunityCreated: false,
                    automaticContactExecuted: false,
                    finalMessageGenerated: false,
                },
            };
        },
    };
    const service = createCartera040RelationshipMemoryService({ client });
    const result = await service.recordRelationshipMemory({
        personReference: 'PERSON:1',
        memoryKind: 'CONTACT_PREFERENCE',
        summary: 'Prefiere WhatsApp.',
        valueCode: 'WHATSAPP',
        occurredAt: '2026-08-01T04:00:00.000Z',
        sourceAuthority: 'CLIENT_CONFIRMED',
        sourceRecordReference: 'SERVICE:1',
        evidenceReferences: ['EVIDENCE:1'],
        sensitivity: 'PERSONAL',
        consentState: 'NOT_REQUIRED',
        contextUse: 'GENERAL_RELATIONSHIP',
        idempotencyKey: 'MEMORY:1',
    });
    assert.equal(result.recordingState, 'COMPLETE');
    const write = calls.find(call => call.name === 'forge_cartera040_record_relationship_memory');
    assert.equal(write.args.p_payload.authorization.authorized, true);
    assert.match(write.args.p_payload.authorization.payloadDigest, /^[a-f0-9]{64}$/);
    assert.equal(write.args.p_payload.memoryKind, 'CONTACT_PREFERENCE');

    const brief = await service.loadRelationshipBrief('PERSON:1');
    assert.equal(brief.person.personReference, 'PERSON:1');
    assert.equal(brief.readiness.canExecuteContact, false);
});

test('040C rejects life context without confirmed consent before any RPC call', async () => {
    let rpcCalls = 0;
    const service = createCartera040RelationshipMemoryService({
        client: {
            auth: { getUser: async () => ({ data: { user: { id: 'advisor-1' } } }) },
            rpc: async () => { rpcCalls += 1; return { data: {} }; },
        },
    });
    await assert.rejects(
        () => service.recordRelationshipMemory({
            personReference: 'PERSON:1',
            memoryKind: 'LIFE_CONTEXT',
            summary: 'Cambio familiar.',
            occurredAt: '2026-08-01T04:00:00.000Z',
            sourceAuthority: 'ADVISOR_CONFIRMED',
            sourceRecordReference: 'SERVICE:2',
            evidenceReferences: ['EVIDENCE:2'],
            sensitivity: 'SENSITIVE',
            consentState: 'UNKNOWN',
            contextUse: 'CONVERSATION_PREPARATION',
            idempotencyKey: 'MEMORY:2',
        }),
        error => error.code === 'CARTERA040_SENSITIVE_CONTEXT_REQUIRES_CONSENT'
    );
    assert.equal(rpcCalls, 0);
});

test('040 service fails closed if a read response exposes restricted fields', async () => {
    const unsafe = briefPayload();
    unsafe.person.verifiedPhone = '555';
    const service = createCartera040RelationshipMemoryService({
        client: {
            auth: { getUser: async () => ({ data: { user: { id: 'advisor-1' } } }) },
            rpc: async () => ({ data: unsafe }),
        },
    });
    await assert.rejects(
        () => service.loadRelationshipBrief('PERSON:1'),
        error => error.code === 'CARTERA040_RESTRICTED_FIELD_EXPOSED'
    );
});
