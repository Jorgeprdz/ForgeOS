import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const registry = require(
    '../platform/shared-commercial-model/crs-01-existing-cartera-authority-registry.js'
);

test('CRS 01 promotes existing Cartera authorities without creating a parallel root', () => {
    const snapshot = registry.createAuthorityPromotionSnapshot();

    assert.equal(snapshot.contractType, 'FORGE_EXISTING_CARTERA_AUTHORITY_REGISTRY');
    assert.equal(snapshot.canonicalPersonAuthority, 'CARTERA_010B_COMMERCIAL_PERSON');
    assert.equal(
        snapshot.personHistoryFoundation,
        'CARTERA_040B_PERSON_RELATIONSHIP_BRIEF'
    );
    assert.equal(
        snapshot.relationshipIntelligenceFoundation,
        'CARTERA_050_TO_100_RELATIONSHIP_INTELLIGENCE'
    );
    assert.equal(snapshot.readOnlyPromotion, true);
    assert.equal(snapshot.next, 'CRS_02_MISSING_CROSS_MODULE_LINK_EXTENSION');
    assert.equal(Object.isFrozen(snapshot), true);
});

test('all promoted authorities point to existing repository artifacts', () => {
    assert.equal(registry.AUTHORITIES.length, 10);
    for (const authority of registry.AUTHORITIES) {
        assert.ok(authority.authorityId.startsWith('CARTERA_'));
        assert.ok(authority.capabilities.length > 0);
        assert.ok(authority.sourcePaths.length > 0);
        for (const sourcePath of authority.sourcePaths) {
            assert.equal(existsSync(sourcePath), true, sourcePath);
        }
    }
});

test('CommercialPerson, directory, person brief and intelligence foundations are explicit', () => {
    assert.equal(
        registry.getAuthority('CARTERA_010B_COMMERCIAL_PERSON').domainOwner,
        'SHARED_COMMERCIAL_MODEL'
    );
    assert.equal(
        registry.getAuthority('CARTERA_010D_UNIFIED_DIRECTORY').mutationMode,
        'READ_ONLY'
    );
    assert.equal(
        registry.getAuthority('CARTERA_040B_PERSON_RELATIONSHIP_BRIEF').mutationMode,
        'READ_ONLY'
    );
    assert.ok(
        registry.getAuthority('CARTERA_050_TO_100_RELATIONSHIP_INTELLIGENCE')
            .capabilities.includes('PRODUCTIVITY_PROOF_AND_EXPLICIT_LEARNING')
    );
});

test('authority filters expose only the requested shared capability', () => {
    const activityConsumers = registry.listAuthorities({ consumer: 'ACTIVITY' });
    assert.ok(activityConsumers.length >= 3);
    assert.ok(activityConsumers.every(authority => authority.consumers.includes('ACTIVITY')));

    const readModels = registry.listAuthorities({ capability: 'RELATIONSHIP_HISTORY' });
    assert.deepEqual(
        readModels.map(authority => authority.authorityId),
        ['CARTERA_040B_PERSON_RELATIONSHIP_BRIEF']
    );
});

test('duplicate identity, relationship, Timeline and intelligence plans are rejected', () => {
    for (const plan of [
        { newCommercialPersonTable: true },
        { parallelIdentityResolution: true },
        { newAdvisorCommercialRelationshipPersistence: true },
        { newPersonTimelineLedger: true },
        { newRelationshipIntelligenceStack: true },
    ]) {
        assert.throws(
            () => registry.assertNoDuplicateAuthorityPlan(plan),
            error => error.code === 'CRS01_DUPLICATE_AUTHORITY_PLAN_FORBIDDEN'
        );
    }
    assert.equal(
        registry.assertNoDuplicateAuthorityPlan({
            newCommercialPersonTable: false,
            parallelIdentityResolution: false,
        }),
        true
    );
});

test('all mutation and automatic-effect boundaries remain blocked', () => {
    for (const [boundary, value] of Object.entries(registry.BOUNDARIES)) {
        assert.equal(value, false, boundary);
    }
    assert.equal(
        registry.RESIDUAL_GAPS.applicationAndSignatureAuthority,
        'CRS_06'
    );
});