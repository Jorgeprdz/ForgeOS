import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
    buildCanonicalPortfolioProjection,
    createCanonicalPortfolioItem,
} from '../platform/policy-intelligence/cartera-010c-portfolio-read-model.js';
import {
    createCanonicalPortfolioService,
} from '../advisor-os/cartera/canonical-portfolio-service.js';

const policy = Object.freeze({
    id: '10000000-0000-0000-0000-000000000001',
    policy_reference: 'POLICY:001',
    carrier_reference: 'SMNYL',
    product_reference: 'VIDA-MUJER',
    issue_date: '2026-07-01',
    effective_from: '2026-07-01T00:00:00.000Z',
    effective_to: null,
    status_value: 'ACTIVE',
    status_as_of: '2026-07-31T12:00:00.000Z',
    currency: 'MXN',
    premium_amount: 24000,
    payment_frequency: 'ANNUAL',
    sum_insured: 1500000,
    completeness_state: 'COMPLETE',
    freshness_state: 'CURRENT',
    conflict_state: 'CLEAR',
    current_version: 1,
    updated_at: '2026-07-31T12:00:00.000Z',
    archived_at: null,
});

const person = Object.freeze({
    id: '20000000-0000-0000-0000-000000000001',
    person_reference: 'PERSON:001',
    display_name: 'Ana Torres',
    preferred_name: 'Ana',
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
});

const payor = Object.freeze({
    id: '20000000-0000-0000-0000-000000000002',
    person_reference: 'PERSON:002',
    display_name: 'Luis Torres',
    preferred_name: null,
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
});

const account = Object.freeze({
    id: '30000000-0000-0000-0000-000000000001',
    account_reference: 'ACCOUNT:FAMILY:001',
    display_label: 'Familia Torres',
    account_type: 'HOUSEHOLD',
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
});

function role(overrides = {}) {
    return {
        id: crypto.randomUUID(),
        advisor_id: '40000000-0000-0000-0000-000000000001',
        policy_role_reference: overrides.policy_role_reference || `ROLE:${crypto.randomUUID()}`,
        policy_id: policy.id,
        policy_version_id: '50000000-0000-0000-0000-000000000001',
        participant_person_id: person.id,
        participant_account_id: null,
        role_type: 'INSURED',
        confirmation_state: 'CONFIRMED',
        privacy_classification: 'PRIVATE',
        visibility_scope: 'POLICY_TEAM',
        effective_from: '2026-07-01T00:00:00.000Z',
        effective_to: null,
        role_version: 1,
        correction_of: null,
        created_at: '2026-07-31T12:00:00.000Z',
        ...overrides,
    };
}

test('canonical portfolio preserves known Policy facts without legacy identity fields', () => {
    const item = createCanonicalPortfolioItem({
        policy,
        roles: [role()],
        peopleById: new Map([[person.id, person]]),
        accountsById: new Map(),
    });

    assert.equal(item.policyReference, 'POLICY:001');
    assert.equal(item.premiumAmount.state, 'KNOWN');
    assert.equal(item.currency.value, 'MXN');
    assert.deepEqual(item.personReferences, ['PERSON:001']);
    assert.equal('cliente' in item, false);
    assert.equal('clientId' in item, false);
    assert.equal('policyNumber' in item, false);
});

test('unknown premium, currency and status remain explicit unknown values', () => {
    const item = createCanonicalPortfolioItem({
        policy: {
            ...policy,
            status_value: 'UNKNOWN',
            currency: null,
            premium_amount: null,
            sum_insured: null,
            payment_frequency: null,
        },
        roles: [],
    });

    assert.deepEqual(item.status, { state: 'UNKNOWN', value: 'UNKNOWN' });
    assert.deepEqual(item.currency, { state: 'UNKNOWN', value: null });
    assert.deepEqual(item.premiumAmount, { state: 'UNKNOWN', value: null });
    assert.deepEqual(item.sumInsured, { state: 'UNKNOWN', value: null });
});

test('one Policy projects separate insured, payor and account roles', () => {
    const roles = [
        role({ policy_role_reference: 'ROLE:INSURED', role_type: 'INSURED' }),
        role({
            policy_role_reference: 'ROLE:PAYOR',
            role_type: 'PAYOR',
            participant_person_id: payor.id,
        }),
        role({
            policy_role_reference: 'ROLE:OWNER-ACCOUNT',
            role_type: 'POLICY_OWNER',
            participant_person_id: null,
            participant_account_id: account.id,
        }),
    ];

    const item = createCanonicalPortfolioItem({
        policy,
        roles,
        peopleById: new Map([[person.id, person], [payor.id, payor]]),
        accountsById: new Map([[account.id, account]]),
    });

    assert.deepEqual(item.personReferences.sort(), ['PERSON:001', 'PERSON:002']);
    assert.deepEqual(item.accountReferences, ['ACCOUNT:FAMILY:001']);
    assert.deepEqual(
        item.generalParticipantSummary.map(entry => entry.roleType).sort(),
        ['INSURED', 'PAYOR', 'POLICY_OWNER']
    );
});

test('beneficiary and restricted roles fail closed in a general projection', () => {
    assert.throws(
        () => createCanonicalPortfolioItem({
            policy,
            roles: [role({ role_type: 'BENEFICIARY', visibility_scope: 'OWNING_ADVISOR_ONLY' })],
            peopleById: new Map([[person.id, person]]),
        }),
        /BENEFICIARY_GENERAL_PROJECTION_FORBIDDEN/
    );

    assert.throws(
        () => createCanonicalPortfolioItem({
            policy,
            roles: [role({ visibility_scope: 'RESTRICTED_ROLE_VIEW' })],
            peopleById: new Map([[person.id, person]]),
        }),
        /RESTRICTED_ROLE_GENERAL_PROJECTION_FORBIDDEN/
    );
});

test('superseded role versions do not leak into the current participant summary', () => {
    const item = createCanonicalPortfolioItem({
        policy,
        roles: [
            role({
                policy_role_reference: 'ROLE:VERSIONED',
                role_version: 1,
                effective_to: '2026-07-15T00:00:00.000Z',
            }),
            role({
                policy_role_reference: 'ROLE:VERSIONED',
                role_version: 2,
                participant_person_id: payor.id,
            }),
        ],
        peopleById: new Map([[person.id, person], [payor.id, payor]]),
    });

    assert.deepEqual(item.personReferences, ['PERSON:002']);
});

test('portfolio projection orders by canonical status as-of time', () => {
    const projection = buildCanonicalPortfolioProjection({
        policies: [
            { ...policy, policy_reference: 'POLICY:OLD', status_as_of: '2026-07-01T00:00:00.000Z' },
            { ...policy, policy_reference: 'POLICY:NEW', status_as_of: '2026-07-30T00:00:00.000Z' },
        ],
    });

    assert.deepEqual(
        projection.map(item => item.policyReference),
        ['POLICY:NEW', 'POLICY:OLD']
    );
});

function createFakeClient({ authenticated = true } = {}) {
    const calls = [];
    const roles = [role()];

    return {
        calls,
        auth: {
            async getUser() {
                return authenticated
                    ? { data: { user: { id: '40000000-0000-0000-0000-000000000001' } }, error: null }
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
                    if (table !== 'canonical_policies') {
                        throw new Error(`UNEXPECTED_ORDER:${table}`);
                    }
                    return Promise.resolve({ data: [policy], error: null });
                },
                in(column, ids) {
                    calls.push(['in', table, column, ids]);
                    if (table === 'commercial_people') {
                        return Promise.resolve({ data: [person], error: null });
                    }
                    if (table === 'commercial_accounts') {
                        return Promise.resolve({ data: [], error: null });
                    }
                    throw new Error(`UNEXPECTED_IN:${table}`);
                },
            };
            return query;
        },
        async rpc(name, params) {
            calls.push(['rpc', name, params]);
            return { data: roles, error: null };
        },
    };
}

test('authenticated service reads canonical tables and governed general role RPC only', async () => {
    const client = createFakeClient();
    const service = createCanonicalPortfolioService({ client });
    const result = await service.loadPortfolio();

    assert.equal(result.length, 1);
    assert.equal(result[0].generalParticipantSummary[0].displayLabel, 'Ana');
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'canonical_policies'));
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'commercial_people'));
    assert.ok(client.calls.some(call => (
        call[0] === 'rpc'
        && call[1] === 'forge_cartera010b_list_general_policy_roles'
        && call[2].p_policy_reference === 'POLICY:001'
    )));
    assert.equal(client.calls.some(call => call[0] === 'from' && call[1] === 'policy_roles'), false);
});

test('service fails closed without an authenticated user', async () => {
    const service = createCanonicalPortfolioService({
        client: createFakeClient({ authenticated: false }),
    });

    await assert.rejects(
        () => service.loadPortfolio(),
        error => error.code === 'CARTERA010C_AUTH_REQUIRED'
    );
});

test('service source exposes no canonical mutation methods', async () => {
    const source = await readFile(
        new URL('../advisor-os/cartera/canonical-portfolio-service.js', import.meta.url),
        'utf8'
    );

    assert.match(source, /from\('canonical_policies'\)/);
    assert.match(source, /forge_cartera010b_list_general_policy_roles/);
    assert.doesNotMatch(source, /from\('policy_roles'\)/);
    assert.doesNotMatch(source, /\.insert\(/);
    assert.doesNotMatch(source, /\.update\(/);
    assert.doesNotMatch(source, /\.delete\(/);
    assert.doesNotMatch(source, /\.upsert\(/);
});

test('Cartera route no longer imports IndexedDB or exposes direct write controls', async () => {
    const source = await readFile(
        new URL('../cartera.js', import.meta.url),
        'utf8'
    );

    assert.match(source, /createCanonicalPortfolioService/);
    assert.match(source, /SOLO LECTURA/);
    assert.match(source, /padding-bottom:calc\(112px \+ env\(safe-area-inset-bottom\)\)/);
    assert.match(source, /La ruta falló cerrada y no recurrió a IndexedDB/);
    assert.doesNotMatch(source, /crmaddlife-indexeddb/);
    assert.doesNotMatch(source, /DB\.obtenerTodos/);
    assert.doesNotMatch(source, /btn-new-policy/);
    assert.doesNotMatch(source, /data-edit/);
    assert.doesNotMatch(source, /data-delete/);
    assert.doesNotMatch(source, /excel-input/);
    assert.doesNotMatch(source, /UNKNOWN.*0/);
});

test('route keeps loading, empty, error and conflict states explicit', async () => {
    const source = await readFile(
        new URL('../cartera.js', import.meta.url),
        'utf8'
    );

    assert.match(source, /Cargando la cartera canónica/);
    assert.match(source, /Aún no hay pólizas canónicas confirmadas/);
    assert.match(source, /No se pudo cargar la cartera/);
    assert.match(source, /REQUIERE REVISIÓN/);
    assert.match(source, /Prima desconocida/);
    assert.match(source, /moneda desconocida/);
});
