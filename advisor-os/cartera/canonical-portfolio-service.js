// CARTERA 010C authenticated canonical portfolio reader.
// This module deliberately exposes no canonical write, edit, delete or import operation.

import { SupabaseRuntime } from '../../supabase-runtime.js';
import { buildCanonicalPortfolioProjection } from '../../platform/policy-intelligence/cartera-010c-portfolio-read-model.js';

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

export function createCanonicalPortfolioService({ client } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();

    if (!resolvedClient?.auth?.getUser || !resolvedClient?.from || !resolvedClient?.rpc) {
        throw fail('CARTERA010C_SUPABASE_CLIENT_INVALID');
    }

    return Object.freeze({
        async loadPortfolio() {
            const authResult = await resolvedClient.auth.getUser();
            if (authResult?.error) {
                throw fail('CARTERA010C_AUTH_LOOKUP_FAILED', authResult.error);
            }
            if (!authResult?.data?.user?.id) {
                throw fail('CARTERA010C_AUTH_REQUIRED');
            }

            const policyResult = await resolvedClient
                .from('canonical_policies')
                .select(POLICY_SELECT)
                .order('status_as_of', { ascending: false });

            const policies = unwrap(policyResult, 'CARTERA010C_POLICY_READ_FAILED')
                .filter(policy => !policy.archived_at);

            const rolesByPolicyReference = new Map();
            await Promise.all(
                policies.map(async policy => {
                    const roleResult = await resolvedClient.rpc(
                        'forge_cartera010b_list_general_policy_roles',
                        { p_policy_reference: policy.policy_reference }
                    );
                    const roles = unwrap(
                        roleResult,
                        'CARTERA010C_GENERAL_POLICY_ROLE_READ_FAILED'
                    );
                    rolesByPolicyReference.set(policy.policy_reference, roles);
                })
            );

            const personIds = new Set();
            const accountIds = new Set();
            for (const roles of rolesByPolicyReference.values()) {
                for (const role of roles) {
                    if (role.participant_person_id) {
                        personIds.add(role.participant_person_id);
                    }
                    if (role.participant_account_id) {
                        accountIds.add(role.participant_account_id);
                    }
                }
            }

            const [people, accounts] = await Promise.all([
                loadRowsByIds(
                    resolvedClient,
                    'commercial_people',
                    PERSON_SELECT,
                    [...personIds],
                    'CARTERA010C_PERSON_READ_FAILED'
                ),
                loadRowsByIds(
                    resolvedClient,
                    'commercial_accounts',
                    ACCOUNT_SELECT,
                    [...accountIds],
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
    });
}

export const CARTERA_010C_POLICY_SELECT = POLICY_SELECT;
