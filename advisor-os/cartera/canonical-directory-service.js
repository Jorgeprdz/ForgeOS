// CARTERA 010D authenticated unified directory reader.
// Owner-scoped read-only composition; phone/email are search inputs but never public entry fields.

import { SupabaseRuntime } from '../../supabase-runtime.js';
import { createCanonicalDirectoryProjection } from '../../platform/policy-intelligence/cartera-010d-unified-directory-read-model.js';

const PERSON_DIRECTORY_SELECT = [
    'id',
    'person_reference',
    'display_name',
    'preferred_name',
    'verified_phone',
    'verified_email',
    'lifecycle_state',
    'privacy_classification',
    'archived_at',
].join(',');

const ACCOUNT_DIRECTORY_SELECT = [
    'id',
    'account_reference',
    'account_type',
    'display_label',
    'lifecycle_state',
    'privacy_classification',
    'archived_at',
].join(',');

const MEMBERSHIP_DIRECTORY_SELECT = [
    'id',
    'membership_reference',
    'account_id',
    'person_id',
    'relationship_role',
    'confirmation_state',
    'privacy_classification',
    'effective_from',
    'effective_to',
    'correction_of',
].join(',');

const POLICY_DIRECTORY_SELECT = [
    'id',
    'policy_reference',
    'carrier_reference',
    'policy_number',
    'product_reference',
    'status_value',
    'status_as_of',
    'archived_at',
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

async function authenticatedUser(client) {
    const authResult = await client.auth.getUser();
    if (authResult?.error) {
        throw fail('CARTERA010D_AUTH_LOOKUP_FAILED', authResult.error);
    }
    if (!authResult?.data?.user?.id) {
        throw fail('CARTERA010D_AUTH_REQUIRED');
    }
    return authResult.data.user;
}

async function loadGeneralRoles(client, policyReference) {
    const result = await client.rpc(
        'forge_cartera010b_list_general_policy_roles',
        { p_policy_reference: policyReference }
    );
    return unwrap(result, 'CARTERA010D_GENERAL_POLICY_ROLE_READ_FAILED');
}

export function createCanonicalDirectoryService({ client, clock } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();
    const resolvedClock = typeof clock === 'function'
        ? clock
        : () => new Date().toISOString();

    if (!resolvedClient?.auth?.getUser || !resolvedClient?.from || !resolvedClient?.rpc) {
        throw fail('CARTERA010D_SUPABASE_CLIENT_INVALID');
    }

    async function loadDirectory() {
        await authenticatedUser(resolvedClient);

        const [peopleResult, accountResult, membershipResult, policyResult] = await Promise.all([
            resolvedClient
                .from('commercial_people')
                .select(PERSON_DIRECTORY_SELECT)
                .order('display_name', { ascending: true }),
            resolvedClient
                .from('commercial_accounts')
                .select(ACCOUNT_DIRECTORY_SELECT)
                .order('display_label', { ascending: true }),
            resolvedClient
                .from('commercial_account_memberships')
                .select(MEMBERSHIP_DIRECTORY_SELECT)
                .order('effective_from', { ascending: false }),
            resolvedClient
                .from('canonical_policies')
                .select(POLICY_DIRECTORY_SELECT)
                .order('status_as_of', { ascending: false }),
        ]);

        const people = unwrap(peopleResult, 'CARTERA010D_PERSON_READ_FAILED');
        const accounts = unwrap(accountResult, 'CARTERA010D_ACCOUNT_READ_FAILED');
        const memberships = unwrap(
            membershipResult,
            'CARTERA010D_ACCOUNT_MEMBERSHIP_READ_FAILED'
        );
        const policies = unwrap(policyResult, 'CARTERA010D_POLICY_READ_FAILED');
        const activePolicies = policies.filter(policy => !policy.archived_at);

        const rolesByPolicyReference = new Map();
        await Promise.all(activePolicies.map(async policy => {
            rolesByPolicyReference.set(
                policy.policy_reference,
                await loadGeneralRoles(resolvedClient, policy.policy_reference)
            );
        }));

        return createCanonicalDirectoryProjection({
            people,
            accounts,
            memberships,
            policies,
            rolesByPolicyReference,
            asOf: resolvedClock(),
        });
    }

    return Object.freeze({
        loadDirectory,
        async searchDirectory(query, options = {}) {
            const directory = await loadDirectory();
            return directory.search(query, options);
        },
    });
}

export const CARTERA_010D_PERSON_DIRECTORY_SELECT = PERSON_DIRECTORY_SELECT;
export const CARTERA_010D_ACCOUNT_DIRECTORY_SELECT = ACCOUNT_DIRECTORY_SELECT;
export const CARTERA_010D_MEMBERSHIP_DIRECTORY_SELECT = MEMBERSHIP_DIRECTORY_SELECT;
export const CARTERA_010D_POLICY_DIRECTORY_SELECT = POLICY_DIRECTORY_SELECT;
