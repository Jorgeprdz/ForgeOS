import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
    CARTERA_010D_ENTRY_KIND,
    createCanonicalDirectoryProjection,
} from '../platform/policy-intelligence/cartera-010d-unified-directory-read-model.js';
import {
    createCanonicalDirectoryService,
} from '../advisor-os/cartera/canonical-directory-service.js';

const AS_OF = '2026-07-31T16:00:00.000Z';

const person = Object.freeze({
    id: '10000000-0000-0000-0000-000000000001',
    person_reference: 'PERSON:ANA',
    display_name: 'Ana Pérez Torres',
    preferred_name: 'Anita',
    verified_phone: '+525512345678',
    verified_email: 'ana.private@example.com',
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
    archived_at: null,
});

const secondPerson = Object.freeze({
    id: '10000000-0000-0000-0000-000000000002',
    person_reference: 'PERSON:LUIS',
    display_name: 'Luis Pérez',
    preferred_name: null,
    verified_phone: null,
    verified_email: null,
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
    archived_at: null,
});

const account = Object.freeze({
    id: '20000000-0000-0000-0000-000000000001',
    account_reference: 'ACCOUNT:FAMILY:PEREZ',
    account_type: 'HOUSEHOLD',
    display_label: 'Familia Pérez',
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
    archived_at: null,
});

const policy = Object.freeze({
    id: '30000000-0000-0000-0000-000000000001',
    policy_reference: 'POLICY:VIDA:001',
    carrier_reference: 'SMNYL',
    policy_number: 'VM-010D-7788',
    product_reference: 'VIDA_MUJER',
    status_value: 'ACTIVE',
    status_as_of: '2026-07-30T12:00:00.000Z',
    archived_at: null,
});

function membership(overrides = {}) {
    return {
        id: crypto.randomUUID(),
        membership_reference: `MEMBERSHIP:${crypto.randomUUID()}`,
        account_id: account.id,
        person_id: person.id,
        relationship_role: 'HOUSEHOLD_MEMBER',
        confirmation_state: 'CONFIRMED',
        privacy_classification: 'PRIVATE',
        effective_from: '2026-07-01T00:00:00.000Z',
        effective_to: null,
        correction_of: null,
        ...overrides,
    };
}

function role(overrides = {}) {
    return {
        id: crypto.randomUUID(),
        policy_role_reference: `ROLE:${crypto.randomUUID()}`,
        policy_id: policy.id,
        participant_person_id: person.id,
        participant_account_id: null,
        role_type: 'INSURED',
        confirmation_state: 'CONFIRMED',
        privacy_classification: 'PRIVATE',
        visibility_scope: 'POLICY_TEAM',
        effective_from: '2026-07-01T00:00:00.000Z',
        effective_to: null,
        role_version: 1,
        ...overrides,
    };
}

function createProjection(overrides = {}) {
    return createCanonicalDirectoryProjection({
        people: [person, secondPerson],
        accounts: [account],
        memberships: [membership()],
        policies: [policy],
        rolesByPolicyReference: new Map([[
            policy.policy_reference,
            [
                role(),
                role({
                    policy_role_reference: 'ROLE:PAYOR',
                    participant_person_id: secondPerson.id,
                    role_type: 'PAYOR',
                }),
                role({
                    policy_role_reference: 'ROLE:OWNER-ACCOUNT',
                    participant_person_id: null,
                    participant_account_id: account.id,
                    role_type: 'POLICY_OWNER',
                }),
            ],
        ]]),
        asOf: AS_OF,
        ...overrides,
    });
}

test('directory preserves separate Person, Account and Policy entry kinds', () => {
    const directory = createProjection();

    assert.deepEqual(directory.counts, {
        people: 2,
        accounts: 1,
        policies: 1,
        total: 4,
    });
    assert.deepEqual(
        [...new Set(directory.entries.map(entry => entry.kind))].sort(),
        [
            CARTERA_010D_ENTRY_KIND.ACCOUNT,
            CARTERA_010D_ENTRY_KIND.PERSON,
            CARTERA_010D_ENTRY_KIND.POLICY,
        ].sort()
    );
    assert.equal(directory.entries.some(entry => 'clientId' in entry), false);
});

test('phone and email find the Person without entering public entries', () => {
    const directory = createProjection();
    const serialized = JSON.stringify(directory.entries);

    assert.equal(serialized.includes('+525512345678'), false);
    assert.equal(serialized.includes('ana.private@example.com'), false);

    const phoneResult = directory.search('5512345678');
    assert.equal(phoneResult.length, 1);
    assert.equal(phoneResult[0].entry.reference, 'PERSON:ANA');
    assert.deepEqual(phoneResult[0].matchReasons, ['VERIFIED_PHONE']);

    const emailResult = directory.search('ana.private@example.com');
    assert.equal(emailResult.length, 1);
    assert.equal(emailResult[0].entry.reference, 'PERSON:ANA');
    assert.deepEqual(emailResult[0].matchReasons, ['VERIFIED_EMAIL']);
    assert.equal(JSON.stringify(emailResult).includes('ana.private@example.com'), false);
});

test('search covers names, account labels, relationship roles, policies, carrier and product', () => {
    const directory = createProjection();

    assert.equal(directory.search('Anita')[0].entry.reference, 'PERSON:ANA');
    assert.equal(directory.search('Familia Perez')[0].entry.reference, 'ACCOUNT:FAMILY:PEREZ');
    assert.ok(directory.search('HOUSEHOLD_MEMBER').some(result => (
        result.entry.reference === 'PERSON:ANA'
        || result.entry.reference === 'ACCOUNT:FAMILY:PEREZ'
    )));
    assert.equal(directory.search('VM-010D-7788')[0].entry.reference, 'POLICY:VIDA:001');
    assert.equal(directory.search('SMNYL')[0].entry.reference, 'POLICY:VIDA:001');
    assert.equal(directory.search('VIDA MUJER')[0].entry.reference, 'POLICY:VIDA:001');
    assert.ok(directory.search('PAYOR').some(result => result.entry.reference === 'POLICY:VIDA:001'));
});

test('Person and Account relationship summaries remain explicit and multi-party', () => {
    const directory = createProjection();
    const ana = directory.entries.find(entry => entry.reference === 'PERSON:ANA');
    const household = directory.entries.find(entry => entry.reference === 'ACCOUNT:FAMILY:PEREZ');
    const policyEntry = directory.entries.find(entry => entry.reference === 'POLICY:VIDA:001');

    assert.equal(ana.accountCount, 1);
    assert.equal(ana.policyCount, 1);
    assert.ok(ana.relationships.some(item => item.relationshipType === 'HOUSEHOLD_MEMBER'));
    assert.ok(ana.relationships.some(item => item.relationshipType === 'INSURED'));

    assert.equal(household.personCount, 1);
    assert.equal(household.policyCount, 1);
    assert.ok(household.relationships.some(item => item.relationshipType === 'POLICY_OWNER'));

    assert.deepEqual([...policyEntry.personReferences].sort(), ['PERSON:ANA', 'PERSON:LUIS']);
    assert.deepEqual(policyEntry.accountReferences, ['ACCOUNT:FAMILY:PEREZ']);
});

test('non-current, future and restricted memberships do not enter the current projection', () => {
    const directory = createProjection({
        memberships: [
            membership({ confirmation_state: 'PROPOSED' }),
            membership({
                membership_reference: 'MEMBERSHIP:FUTURE',
                effective_from: '2026-08-15T00:00:00.000Z',
            }),
            membership({
                membership_reference: 'MEMBERSHIP:RESTRICTED',
                privacy_classification: 'RESTRICTED',
            }),
        ],
    });
    const ana = directory.entries.find(entry => entry.reference === 'PERSON:ANA');
    assert.equal(ana.accountCount, 0);
    assert.equal(ana.relationships.some(item => item.relationshipType === 'HOUSEHOLD_MEMBER'), false);
});

test('beneficiary and restricted general PolicyRole rows fail closed', () => {
    assert.throws(
        () => createProjection({
            rolesByPolicyReference: new Map([[
                policy.policy_reference,
                [role({ role_type: 'BENEFICIARY', privacy_classification: 'PRIVATE' })],
            ]]),
        }),
        /BENEFICIARY_DIRECTORY_PROJECTION_FORBIDDEN/
    );

    assert.throws(
        () => createProjection({
            rolesByPolicyReference: new Map([[
                policy.policy_reference,
                [role({ visibility_scope: 'RESTRICTED_ROLE_VIEW' })],
            ]]),
        }),
        /RESTRICTED_ROLE_DIRECTORY_PROJECTION_FORBIDDEN/
    );
});

function createFakeClient({ authenticated = true } = {}) {
    const calls = [];
    const rows = {
        commercial_people: [person, secondPerson],
        commercial_accounts: [account],
        commercial_account_memberships: [membership()],
        canonical_policies: [policy],
    };

    return {
        calls,
        auth: {
            async getUser() {
                return authenticated
                    ? { data: { user: { id: '90000000-0000-0000-0000-000000000001' } }, error: null }
                    : { data: { user: null }, error: null };
            },
        },
        from(table) {
            calls.push(['from', table]);
            const query = {
                select(columns) {
                    calls.push(['select', table, columns]);
                    return query;
                },
                order(column, options) {
                    calls.push(['order', table, column, options]);
                    return Promise.resolve({ data: rows[table] || [], error: null });
                },
            };
            return query;
        },
        async rpc(name, params) {
            calls.push(['rpc', name, params]);
            return {
                data: [
                    role(),
                    role({
                        policy_role_reference: 'ROLE:PAYOR',
                        participant_person_id: secondPerson.id,
                        role_type: 'PAYOR',
                    }),
                ],
                error: null,
            };
        },
    };
}

test('authenticated service composes owner-RLS tables and governed role RPC only', async () => {
    const client = createFakeClient();
    const service = createCanonicalDirectoryService({
        client,
        clock: () => AS_OF,
    });
    const directory = await service.loadDirectory();

    assert.equal(directory.counts.people, 2);
    assert.equal(directory.search('VM-010D-7788')[0].entry.kind, 'POLICY');
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'commercial_people'));
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'commercial_accounts'));
    assert.ok(client.calls.some(call => (
        call[0] === 'from' && call[1] === 'commercial_account_memberships'
    )));
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'canonical_policies'));
    assert.ok(client.calls.some(call => (
        call[0] === 'rpc'
        && call[1] === 'forge_cartera010b_list_general_policy_roles'
        && call[2].p_policy_reference === 'POLICY:VIDA:001'
    )));
    assert.equal(client.calls.some(call => call[0] === 'from' && call[1] === 'policy_roles'), false);
});

test('directory service fails closed without authentication and exposes no mutation source', async () => {
    const service = createCanonicalDirectoryService({
        client: createFakeClient({ authenticated: false }),
        clock: () => AS_OF,
    });
    await assert.rejects(
        () => service.loadDirectory(),
        error => error.code === 'CARTERA010D_AUTH_REQUIRED'
    );

    const source = await readFile(
        new URL('../advisor-os/cartera/canonical-directory-service.js', import.meta.url),
        'utf8'
    );
    assert.match(source, /commercial_account_memberships/);
    assert.match(source, /forge_cartera010b_list_general_policy_roles/);
    assert.doesNotMatch(source, /from\('policy_roles'\)/);
    assert.doesNotMatch(source, /\.insert\(/);
    assert.doesNotMatch(source, /\.update\(/);
    assert.doesNotMatch(source, /\.delete\(/);
    assert.doesNotMatch(source, /\.upsert\(/);
});
