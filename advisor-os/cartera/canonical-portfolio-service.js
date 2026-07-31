// CARTERA 010C authenticated canonical portfolio reader.
// This module deliberately exposes no canonical write, edit, delete or import operation.

import { SupabaseRuntime } from '../../supabase-runtime.js';
import { buildCanonicalPortfolioProjection } from '../../platform/policy-intelligence/cartera-010c-portfolio-read-model.js';
import { createCanonicalPolicyDetailProjection } from '../../platform/policy-intelligence/cartera-010c-policy-detail-timeline.js';

const POLICY_SELECT = [
    'id',
    'policy_reference',
    'carrier_reference',
    'product_reference',
    'issue_date',
    'effective_from',
    'effective_to',
    'status_value',
    'status_as_of',
    'currency',
    'premium_amount',
    'payment_frequency',
    'sum_insured',
    'completeness_state',
    'freshness_state',
    'conflict_state',
    'current_version',
    'updated_at',
    'archived_at',
].join(',');

const POLICY_DETAIL_SELECT = [
    'id',
    'policy_reference',
    'carrier_reference',
    'policy_number',
    'product_reference',
    'issue_date',
    'effective_from',
    'effective_to',
    'status_value',
    'status_source',
    'status_as_of',
    'currency',
    'premium_amount',
    'payment_frequency',
    'sum_insured',
    'completeness_state',
    'freshness_state',
    'conflict_state',
    'current_version',
    'created_at',
    'created_by',
    'updated_at',
    'archived_at',
].join(',');

const POLICY_VERSION_SELECT = [
    'id',
    'policy_id',
    'policy_version_reference',
    'version_number',
    'evidence_version_id',
    'quote_reference',
    'application_reference',
    'previous_policy_version_id',
    'correction_of',
    'confirmed_at',
    'confirmed_by',
    'created_at',
].join(',');

const POLICY_EVIDENCE_SELECT = [
    'id',
    'policy_id',
    'evidence_version_reference',
    'source_type',
    'observed_at',
    'verification_state',
    'correction_of',
    'created_at',
    'created_by',
].join(',');

const POLICY_CONFLICT_SELECT = [
    'id',
    'policy_id',
    'conflict_reference',
    'conflict_type',
    'conflict_state',
    'evidence_references',
    'recorded_at',
    'recorded_by',
].join(',');

const PERSON_SELECT = [
    'id',
    'person_reference',
    'display_name',
    'preferred_name',
    'lifecycle_state',
    'privacy_classification',
].join(',');

const ACCOUNT_SELECT = [
    'id',
    'account_reference',
    'display_label',
    'account_type',
    'lifecycle_state',
    'privacy_classification',
].join(',');

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) {
        error.cause = cause;
    }
    return error;
}

function unwrap(result, code) {
    if (result?.error) {
        throw fail(code, result.error);
    }
    return Array.isArray(result?.data) ? result.data : [];
}

function unwrapSingle(result, code, notFoundCode) {
    if (result?.error) {
        throw fail(code, result.error);
    }
    if (!result?.data) {
        throw fail(notFoundCode);
    }
    return result.data;
}

function normalizePolicyReference(value) {
    const reference = typeof value === 'string' ? value.trim() : '';
    if (!REFERENCE_PATTERN.test(reference)) {
        throw fail('CARTERA010C_POLICY_REFERENCE_INVALID');
    }
    return reference;
}

async function authenticatedUser(client) {
    const authResult = await client.auth.getUser();
    if (authResult?.error) {
        throw fail('CARTERA010C_AUTH_LOOKUP_FAILED', authResult.error);
    }
    if (!authResult?.data?.user?.id) {
        throw fail('CARTERA010C_AUTH_REQUIRED');
    }
    return authResult.data.user;
}

async function loadRowsByIds(client, table, select, ids, errorCode) {
    if (ids.length === 0) {
        return [];
    }

    const result = await client
        .from(table)
        .select(select)
        .in('id', ids);

    return unwrap(result, errorCode);
}

async function loadGeneralRoles(client, policyReference) {
    const roleResult = await client.rpc(
        'forge_cartera010b_list_general_policy_roles',
        { p_policy_reference: policyReference }
    );
    return unwrap(
        roleResult,
        'CARTERA010C_GENERAL_POLICY_ROLE_READ_FAILED'
    );
}

function participantIds(roles) {
    const personIds = new Set();
    const accountIds = new Set();
    for (const role of roles) {
        if (role.participant_person_id) {
            personIds.add(role.participant_person_id);
        }
        if (role.participant_account_id) {
            accountIds.add(role.participant_account_id);
        }
    }
    return { personIds: [...personIds], accountIds: [...accountIds] };
}

export function createCanonicalPortfolioService({ client } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();

    if (!resolvedClient?.auth?.getUser || !resolvedClient?.from || !resolvedClient?.rpc) {
        throw fail('CARTERA010C_SUPABASE_CLIENT_INVALID');
    }

    return Object.freeze({
        async loadPortfolio() {
            await authenticatedUser(resolvedClient);

            const policyResult = await resolvedClient
                .from('canonical_policies')
                .select(POLICY_SELECT)
                .order('status_as_of', { ascending: false });

            const policies = unwrap(policyResult, 'CARTERA010C_POLICY_READ_FAILED')
                .filter(policy => !policy.archived_at);

            const rolesByPolicyReference = new Map();
            await Promise.all(
                policies.map(async policy => {
                    rolesByPolicyReference.set(
                        policy.policy_reference,
                        await loadGeneralRoles(resolvedClient, policy.policy_reference)
                    );
                })
            );

            const allRoles = [...rolesByPolicyReference.values()].flat();
            const { personIds, accountIds } = participantIds(allRoles);
            const [people, accounts] = await Promise.all([
                loadRowsByIds(
                    resolvedClient,
                    'commercial_people',
                    PERSON_SELECT,
                    personIds,
                    'CARTERA010C_PERSON_READ_FAILED'
                ),
                loadRowsByIds(
                    resolvedClient,
                    'commercial_accounts',
                    ACCOUNT_SELECT,
                    accountIds,
                    'CARTERA010C_ACCOUNT_READ_FAILED'
                ),
            ]);

            return buildCanonicalPortfolioProjection({
                policies,
                rolesByPolicyReference,
                people,
                accounts,
            });
        },

        async loadPolicyDetail(policyReferenceInput) {
            await authenticatedUser(resolvedClient);
            const policyReference = normalizePolicyReference(policyReferenceInput);

            const policyResult = await resolvedClient
                .from('canonical_policies')
                .select(POLICY_DETAIL_SELECT)
                .eq('policy_reference', policyReference)
                .maybeSingle();

            const policy = unwrapSingle(
                policyResult,
                'CARTERA010C_POLICY_DETAIL_READ_FAILED',
                'CARTERA010C_POLICY_NOT_FOUND'
            );
            if (policy.archived_at) {
                throw fail('CARTERA010C_POLICY_NOT_FOUND');
            }

            const [versionResult, roleRows, conflictResult] = await Promise.all([
                resolvedClient
                    .from('policy_versions')
                    .select(POLICY_VERSION_SELECT)
                    .eq('policy_id', policy.id)
                    .order('version_number', { ascending: true }),
                loadGeneralRoles(resolvedClient, policyReference),
                resolvedClient
                    .from('policy_conflicts')
                    .select(POLICY_CONFLICT_SELECT)
                    .eq('policy_id', policy.id)
                    .order('recorded_at', { ascending: false }),
            ]);

            const versions = unwrap(
                versionResult,
                'CARTERA010C_POLICY_VERSION_READ_FAILED'
            );
            const conflicts = unwrap(
                conflictResult,
                'CARTERA010C_POLICY_CONFLICT_READ_FAILED'
            );
            const evidenceIds = [...new Set(
                versions.map(version => version.evidence_version_id).filter(Boolean)
            )];
            const { personIds, accountIds } = participantIds(roleRows);

            const [evidenceVersions, people, accounts] = await Promise.all([
                loadRowsByIds(
                    resolvedClient,
                    'policy_evidence_versions',
                    POLICY_EVIDENCE_SELECT,
                    evidenceIds,
                    'CARTERA010C_POLICY_EVIDENCE_READ_FAILED'
                ),
                loadRowsByIds(
                    resolvedClient,
                    'commercial_people',
                    PERSON_SELECT,
                    personIds,
                    'CARTERA010C_PERSON_READ_FAILED'
                ),
                loadRowsByIds(
                    resolvedClient,
                    'commercial_accounts',
                    ACCOUNT_SELECT,
                    accountIds,
                    'CARTERA010C_ACCOUNT_READ_FAILED'
                ),
            ]);

            return createCanonicalPolicyDetailProjection({
                policy,
                versions,
                evidenceVersions,
                roles: roleRows,
                conflicts,
                people,
                accounts,
            });
        },
    });
}

export const CARTERA_010C_POLICY_SELECT = POLICY_SELECT;
export const CARTERA_010C_POLICY_DETAIL_SELECT = POLICY_DETAIL_SELECT;
