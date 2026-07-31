import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
    buildPolicyDomainTimelineEvents,
    createCanonicalPolicyDetailProjection,
} from '../platform/policy-intelligence/cartera-010c-policy-detail-timeline.js';
import {
    createCanonicalPortfolioService,
} from '../advisor-os/cartera/canonical-portfolio-service.js';

const advisorId = '40000000-0000-0000-0000-000000000001';
const policy = Object.freeze({
    id: '10000000-0000-0000-0000-000000000001',
    policy_reference: 'POLICY:DETAIL:001',
    carrier_reference: 'SMNYL',
    policy_number: 'VM-SECRET-2026',
    product_reference: 'VIDA-MUJER',
    issue_date: '2026-07-01',
    effective_from: '2026-07-01T00:00:00.000Z',
    effective_to: null,
    status_value: 'ACTIVE',
    status_source: 'CONFIRMED_POLICY_COMMAND',
    status_as_of: '2026-07-31T12:00:00.000Z',
    currency: 'MXN',
    premium_amount: 24000,
    payment_frequency: 'ANNUAL',
    sum_insured: 1500000,
    completeness_state: 'COMPLETE',
    freshness_state: 'CURRENT',
    conflict_state: 'CONFLICT',
    current_version: 2,
    created_at: '2026-07-01T12:00:00.000Z',
    created_by: advisorId,
    updated_at: '2026-07-31T12:00:00.000Z',
    archived_at: null,
});

const evidence1 = Object.freeze({
    id: '60000000-0000-0000-0000-000000000001',
    policy_id: policy.id,
    evidence_version_reference: 'POLICY_EVIDENCE:001',
    source_type: 'ISSUED_POLICY_PDF',
    observed_at: '2026-07-01T11:00:00.000Z',
    verification_state: 'CONFIRMED',
    correction_of: null,
    created_at: '2026-07-01T12:00:00.000Z',
    created_by: advisorId,
});

const evidence2 = Object.freeze({
    id: '60000000-0000-0000-0000-000000000002',
    policy_id: policy.id,
    evidence_version_reference: 'POLICY_EVIDENCE:002',
    source_type: 'POLICY_ENDORSEMENT_PDF',
    observed_at: '2026-07-31T11:00:00.000Z',
    verification_state: 'CONFIRMED',
    correction_of: evidence1.id,
    created_at: '2026-07-31T12:00:00.000Z',
    created_by: advisorId,
});

const version1 = Object.freeze({
    id: '50000000-0000-0000-0000-000000000001',
    policy_id: policy.id,
    policy_version_reference: 'POLICY_VERSION:001',
    version_number: 1,
    evidence_version_id: evidence1.id,
    quote_reference: 'QUOTE:001',
    application_reference: 'APPLICATION:001',
    previous_policy_version_id: null,
    correction_of: null,
    confirmed_at: '2026-07-01T12:00:00.000Z',
    confirmed_by: advisorId,
    created_at: '2026-07-01T12:00:00.000Z',
});

const version2 = Object.freeze({
    id: '50000000-0000-0000-0000-000000000002',
    policy_id: policy.id,
    policy_version_reference: 'POLICY_VERSION:002',
    version_number: 2,
    evidence_version_id: evidence2.id,
    quote_reference: 'QUOTE:001',
    application_reference: 'APPLICATION:001',
    previous_policy_version_id: version1.id,
    correction_of: version1.id,
    confirmed_at: '2026-07-31T12:00:00.000Z',
    confirmed_by: advisorId,
    created_at: '2026-07-31T12:00:00.000Z',
});

const person1 = Object.freeze({
    id: '20000000-0000-0000-0000-000000000001',
    person_reference: 'PERSON:001',
    display_name: 'Ana Torres',
    preferred_name: 'Ana',
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
});

const person2 = Object.freeze({
    id: '20000000-0000-0000-0000-000000000002',
    person_reference: 'PERSON:002',
    display_name: 'Ana Torres Pérez',
    preferred_name: 'Ana',
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
});

const role1 = Object.freeze({
    id: '70000000-0000-0000-0000-000000000001',
    advisor_id: advisorId,
    policy_role_reference: 'POLICY_ROLE:INSURED:001',
    policy_id: policy.id,
    policy_version_id: version1.id,
    participant_person_id: person1.id,
    participant_account_id: null,
    role_type: 'INSURED',
    confirmation_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
    visibility_scope: 'POLICY_TEAM',
    effective_from: '2026-07-01T12:00:00.000Z',
    effective_to: '2026-07-31T12:00:00.000Z',
    role_version: 1,
    correction_of: null,
    created_at: '2026-07-01T12:00:00.000Z',
});

const role2 = Object.freeze({
    id: '70000000-0000-0000-0000-000000000002',
    advisor_id: advisorId,
    policy_role_reference: 'POLICY_ROLE:INSURED:001',
    policy_id: policy.id,
    policy_version_id: version2.id,
    participant_person_id: person2.id,
    participant_account_id: null,
    role_type: 'INSURED',
    confirmation_state: 'CORRECTED',
    privacy_classification: 'PRIVATE',
    visibility_scope: 'POLICY_TEAM',
    effective_from: '2026-07-31T12:00:00.000Z',
    effective_to: null,
    role_version: 2,
    correction_of: role1.id,
    created_at: '2026-07-31T12:00:00.000Z',
});

const conflict = Object.freeze({
    id: '80000000-0000-0000-0000-000000000001',
    policy_id: policy.id,
    conflict_reference: 'POLICY_CONFLICT:001',
    conflict_type: 'FIELD_CLAIM_CONFLICT',
    conflict_state: 'OPEN',
    evidence_references: ['POLICY_EVIDENCE:002'],
    recorded_at: '2026-07-31T12:05:00.000Z',
    recorded_by: advisorId,
});

const fixture = Object.freeze({
    policy,
    versions: [version1, version2],
    evidenceVersions: [evidence1, evidence2],
    roles: [role1, role2],
    conflicts: [conflict],
    people: [person1, person2],
    accounts: [],
});

test('Policy detail exposes financial truth while Timeline payloads stay minimized', () => {
    const detail = createCanonicalPolicyDetailProjection(fixture);
    assert.equal(detail.policy.policyNumber.value, 'VM-SECRET-2026');
    assert.equal(detail.policy.premiumAmount.value, 24000);
    assert.equal(detail.policy.sumInsured.value, 1500000);
    assert.equal(detail.policy.generalParticipantSummary.length, 1);
    assert.equal(detail.policy.generalParticipantSummary[0].participantReference, 'PERSON:002');

    const timelineJson = JSON.stringify(detail.timeline);
    assert.doesNotMatch(timelineJson, /VM-SECRET-2026/);
    assert.doesNotMatch(timelineJson, /24000/);
    assert.doesNotMatch(timelineJson, /1500000/);
    assert.doesNotMatch(timelineJson, /premiumAmount|sumInsured|currency|policyNumber/);
    assert.doesNotMatch(timelineJson, /evidenceReferences|documentHash|fieldClaims|provenance/);
});

test('domain Timeline derives confirmed, version, evidence, role correction and conflict events', () => {
    const events = buildPolicyDomainTimelineEvents(fixture);
    const types = new Set(events.map(event => event.eventType));

    assert.ok(types.has('POLICY_CONFIRMED'));
    assert.ok(types.has('POLICY_VERSION_CONFIRMED'));
    assert.ok(types.has('POLICY_EVIDENCE_CONFIRMED'));
    assert.ok(types.has('POLICY_ROLE_CONFIRMED'));
    assert.ok(types.has('POLICY_ROLE_SUPERSEDED'));
    assert.ok(types.has('POLICY_CONFLICT_RECORDED'));
    assert.ok(events.every(event => Object.isFrozen(event)));
    assert.ok(events.every(event => event.evidenceReferences.length >= 1));

    const superseded = events.find(event => event.eventType === 'POLICY_ROLE_SUPERSEDED');
    assert.match(superseded.correctionOf, /^POLICY_ROLE_EVENT:/);
    assert.equal(superseded.payload.personReference, undefined);
});

test('beneficiary and restricted role data fail closed before detail or Timeline projection', () => {
    const beneficiary = {
        ...role2,
        id: '70000000-0000-0000-0000-000000000003',
        role_type: 'BENEFICIARY',
        visibility_scope: 'OWNING_ADVISOR_ONLY',
        correction_of: null,
    };

    assert.throws(
        () => buildPolicyDomainTimelineEvents({ ...fixture, roles: [beneficiary] }),
        /BENEFICIARY_POLICY_DETAIL_FORBIDDEN/
    );
    assert.throws(
        () => createCanonicalPolicyDetailProjection({ ...fixture, roles: [beneficiary] }),
        /BENEFICIARY_GENERAL_PROJECTION_FORBIDDEN|BENEFICIARY_POLICY_DETAIL_FORBIDDEN/
    );
});

test('evidence detail excludes hashes, field claims, provenance and raw documents', () => {
    const detail = createCanonicalPolicyDetailProjection(fixture);
    assert.deepEqual(Object.keys(detail.evidence[0]).sort(), [
        'evidenceVersionReference',
        'observedAt',
        'sourceType',
        'verificationState',
    ]);
});

function createDetailClient() {
    const calls = [];
    const rowsByTable = {
        canonical_policies: policy,
        policy_versions: [version1, version2],
        policy_conflicts: [conflict],
        policy_evidence_versions: [evidence1, evidence2],
        commercial_people: [person1, person2],
        commercial_accounts: [],
    };

    return {
        calls,
        auth: {
            async getUser() {
                return { data: { user: { id: advisorId } }, error: null };
            },
        },
        from(table) {
            calls.push(['from', table]);
            const query = {
                select(columns) {
                    calls.push(['select', table, columns]);
                    return query;
                },
                eq(column, value) {
                    calls.push(['eq', table, column, value]);
                    return query;
                },
                maybeSingle() {
                    calls.push(['maybeSingle', table]);
                    return Promise.resolve({ data: rowsByTable[table], error: null });
                },
                order(column, options) {
                    calls.push(['order', table, column, options]);
                    return Promise.resolve({ data: rowsByTable[table], error: null });
                },
                in(column, values) {
                    calls.push(['in', table, column, values]);
                    return Promise.resolve({ data: rowsByTable[table], error: null });
                },
            };
            return query;
        },
        async rpc(name, params) {
            calls.push(['rpc', name, params]);
            return { data: [role1, role2], error: null };
        },
    };
}

test('authenticated service loads detail from canonical RLS tables and governed role RPC', async () => {
    const client = createDetailClient();
    const service = createCanonicalPortfolioService({ client });
    const detail = await service.loadPolicyDetail('POLICY:DETAIL:001');

    assert.equal(detail.policy.policyReference, 'POLICY:DETAIL:001');
    assert.equal(detail.timeline.length > 0, true);
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'policy_versions'));
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'policy_evidence_versions'));
    assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'policy_conflicts'));
    assert.ok(client.calls.some(call => (
        call[0] === 'rpc'
        && call[1] === 'forge_cartera010b_list_general_policy_roles'
        && call[2].p_policy_reference === 'POLICY:DETAIL:001'
    )));
    assert.equal(client.calls.some(call => call[0] === 'from' && call[1] === 'policy_roles'), false);
});

test('service and route remain read-only while exposing Policy detail navigation', async () => {
    const [serviceSource, routeSource] = await Promise.all([
        readFile(
            new URL('../advisor-os/cartera/canonical-portfolio-service.js', import.meta.url),
            'utf8'
        ),
        readFile(new URL('../cartera.js', import.meta.url), 'utf8'),
    ]);

    assert.match(serviceSource, /loadPolicyDetail/);
    assert.match(serviceSource, /policy_versions/);
    assert.match(serviceSource, /policy_evidence_versions/);
    assert.match(serviceSource, /policy_conflicts/);
    assert.doesNotMatch(serviceSource, /from\('policy_roles'\)/);
    assert.doesNotMatch(serviceSource, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/);

    assert.match(routeSource, /data-policy-open/);
    assert.match(routeSource, /Detalle canónico de póliza/);
    assert.match(routeSource, /Timeline canónico minimizado/);
    assert.match(routeSource, /data-policy-timeline/);
    assert.match(routeSource, /beneficiarios y roles restringidos no forman parte/i);
    assert.doesNotMatch(routeSource, /btn-new-policy|data-edit|data-delete|excel-input/);
});
