import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createCommercialPersonAuthorityFacade,
    CRS_01_COMMERCIAL_PERSON_AUTHORITY_BOUNDARIES,
} from '../advisor-os/shared-commercial-model/crs-01-commercial-person-authority-facade.js';

const personEntry = Object.freeze({
    kind: 'COMMERCIAL_PERSON',
    reference: 'PERSON:ANA',
    displayLabel: 'Ana Pérez',
    lifecycleState: 'CONFIRMED',
    policyReferences: Object.freeze(['POLICY:001']),
    accountReferences: Object.freeze(['ACCOUNT:FAMILY:ANA']),
    relationships: Object.freeze([]),
});

const policyEntry = Object.freeze({
    kind: 'POLICY',
    reference: 'POLICY:001',
    displayLabel: 'VM-001',
});

function createFixture({ briefPersonReference = 'PERSON:ANA' } = {}) {
    const calls = {
        directoryLoads: 0,
        searches: [],
        portfolioLoads: 0,
        policyDetails: [],
        briefs: [],
    };

    const directory = Object.freeze({
        entries: Object.freeze([personEntry, policyEntry]),
        counts: Object.freeze({ people: 1, accounts: 0, policies: 1, total: 2 }),
    });

    const directoryService = {
        async loadDirectory() {
            calls.directoryLoads += 1;
            return directory;
        },
        async searchDirectory(query, options) {
            calls.searches.push({ query, options });
            return Object.freeze([
                Object.freeze({
                    entry: personEntry,
                    matchReasons: Object.freeze(['DISPLAY_NAME']),
                }),
                Object.freeze({
                    entry: policyEntry,
                    matchReasons: Object.freeze(['POLICY_NUMBER']),
                }),
            ]);
        },
    };

    const portfolioService = {
        async loadPortfolio() {
            calls.portfolioLoads += 1;
            return Object.freeze({ policies: Object.freeze([]) });
        },
        async loadPolicyDetail(reference) {
            calls.policyDetails.push(reference);
            return Object.freeze({
                policyReference: reference,
                projectionAuthority: 'CARTERA010C_POLICY_DETAIL_TIMELINE',
            });
        },
    };

    const relationshipMemoryService = {
        async loadRelationshipBrief(reference, options) {
            calls.briefs.push({ reference, options });
            return Object.freeze({
                person: Object.freeze({
                    personReference: briefPersonReference,
                    displayName: 'Ana Pérez',
                }),
                summary: Object.freeze({ activePolicyCount: 1, historyCount: 2 }),
                history: Object.freeze([]),
                projectionAuthority: 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
                readOnly: true,
            });
        },
    };

    return {
        calls,
        facade: createCommercialPersonAuthorityFacade({
            directoryService,
            portfolioService,
            relationshipMemoryService,
        }),
    };
}

test('facade exposes only promoted read capabilities and no mutation methods', () => {
    const { facade } = createFixture();

    assert.equal(facade.contractType, 'FORGE_COMMERCIAL_PERSON_AUTHORITY_FACADE');
    assert.equal(facade.capabilities.exactPersonRead, true);
    assert.equal(facade.capabilities.relationshipBriefRead, true);
    assert.equal(facade.boundaries.readOnly, true);

    for (const method of [
        'createPerson',
        'mergePerson',
        'resolveIdentity',
        'recordRelationshipMemory',
        'createPolicy',
        'updatePolicy',
        'createOpportunity',
        'sendMessage',
        'createTask',
        'createCalendarEvent',
    ]) {
        assert.equal(method in facade, false, method);
    }
});

test('exact person read delegates to the existing Cartera 010D directory', async () => {
    const { facade, calls } = createFixture();
    const person = await facade.loadPerson('PERSON:ANA');

    assert.equal(person, personEntry);
    assert.equal(calls.directoryLoads, 1);
    await assert.rejects(
        () => facade.loadPerson('PERSON:UNKNOWN'),
        error => error.code === 'CRS01_PERSON_NOT_FOUND'
    );
});

test('person search filters account and Policy entries without copying directory truth', async () => {
    const { facade, calls } = createFixture();
    const results = await facade.searchPeople('Ana', { limit: 20 });

    assert.equal(results.length, 1);
    assert.equal(results[0].entry, personEntry);
    assert.deepEqual(results[0].matchReasons, ['DISPLAY_NAME']);
    assert.deepEqual(calls.searches, [{ query: 'Ana', options: { limit: 20 } }]);
    assert.equal(Object.isFrozen(results), true);
});

test('authority snapshot composes existing 010D, 010C and 040B reads', async () => {
    const { facade, calls } = createFixture();
    const snapshot = await facade.loadPersonAuthoritySnapshot('PERSON:ANA', {
        historyLimit: 40,
        includePolicyDetails: true,
    });

    assert.equal(snapshot.contractType, 'FORGE_COMMERCIAL_PERSON_AUTHORITY_SNAPSHOT');
    assert.equal(snapshot.person, personEntry);
    assert.equal(snapshot.relationshipBrief.person.personReference, 'PERSON:ANA');
    assert.deepEqual(snapshot.policyReferences, ['POLICY:001']);
    assert.equal(snapshot.policyDetails[0].policyReference, 'POLICY:001');
    assert.equal(snapshot.sourceAuthorities.person, 'CARTERA_010B_COMMERCIAL_PERSON');
    assert.equal(snapshot.sourceAuthorities.directory, 'CARTERA_010D_UNIFIED_DIRECTORY');
    assert.equal(snapshot.sourceAuthorities.policies, 'CARTERA_010C_CANONICAL_PORTFOLIO');
    assert.equal(
        snapshot.sourceAuthorities.relationshipBrief,
        'CARTERA_040B_PERSON_RELATIONSHIP_BRIEF'
    );
    assert.equal(snapshot.readOnly, true);
    assert.equal(Object.isFrozen(snapshot), true);
    assert.deepEqual(calls.policyDetails, ['POLICY:001']);
    assert.deepEqual(calls.briefs, [
        { reference: 'PERSON:ANA', options: { limit: 40 } },
    ]);
});

test('person mismatch, malformed references and invalid limits fail closed', async () => {
    const { facade } = createFixture({ briefPersonReference: 'PERSON:OTHER' });

    await assert.rejects(
        () => facade.loadPersonAuthoritySnapshot('PERSON:ANA'),
        error => error.code === 'CRS01_RELATIONSHIP_BRIEF_PERSON_MISMATCH'
    );
    await assert.rejects(
        () => facade.loadPerson('bad reference with spaces'),
        error => error.code === 'CRS01_PERSON_REFERENCE_INVALID'
    );
    await assert.rejects(
        () => facade.searchPeople('Ana', { limit: 0 }),
        error => error.code === 'CRS01_LIMIT_INVALID'
    );
});

test('all automatic and canonical mutations stay blocked', () => {
    assert.equal(CRS_01_COMMERCIAL_PERSON_AUTHORITY_BOUNDARIES.readOnly, true);
    for (const [boundary, value] of Object.entries(
        CRS_01_COMMERCIAL_PERSON_AUTHORITY_BOUNDARIES
    )) {
        if (boundary === 'readOnly') continue;
        assert.equal(value, false, boundary);
    }
});