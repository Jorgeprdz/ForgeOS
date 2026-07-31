// CARTERA 010C canonical portfolio read model.
// Pure projection only: no persistence, mutation, identity merge or Policy Truth inference.

const GENERAL_ROLE_TYPES = new Set([
    'POLICY_OWNER',
    'INSURED',
    'ADDITIONAL_INSURED',
    'PAYOR',
    'ADVISOR_OF_RECORD',
    'ORIGINATING_ADVISOR',
    'SERVICING_ADVISOR',
]);

const CURRENT_ROLE_CONFIRMATION_STATES = new Set([
    'CONFIRMED',
    'CORRECTED',
]);

const POLICY_KEYS = new Set([
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
]);

function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireRecord(value, label) {
    if (!isRecord(value)) {
        throw new TypeError(`${label}_MUST_BE_OBJECT`);
    }
    return value;
}

function requireReference(value, label) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized || normalized.length > 240) {
        throw new TypeError(`${label}_INVALID`);
    }
    return normalized;
}

function rejectUnknownKeys(record, allowedKeys, label) {
    for (const key of Object.keys(record)) {
        if (!allowedKeys.has(key)) {
            throw new TypeError(`${label}_UNKNOWN_KEY:${key}`);
        }
    }
}

function visibleFact(value, unknownValue = null) {
    if (value === null || value === undefined || value === 'UNKNOWN') {
        return Object.freeze({ state: 'UNKNOWN', value: unknownValue });
    }
    return Object.freeze({ state: 'KNOWN', value });
}

function temporalRoleKey(role) {
    return `${role.policy_role_reference}:${role.role_version}`;
}

function selectCurrentGeneralRoles(roles) {
    const latestByReference = new Map();

    for (const candidate of roles) {
        const role = requireRecord(candidate, 'POLICY_ROLE');
        if (role.role_type === 'BENEFICIARY') {
            throw new TypeError('BENEFICIARY_GENERAL_PROJECTION_FORBIDDEN');
        }
        if (!GENERAL_ROLE_TYPES.has(role.role_type)) {
            throw new TypeError(`GENERAL_ROLE_TYPE_FORBIDDEN:${role.role_type}`);
        }
        if (role.visibility_scope !== 'POLICY_TEAM') {
            throw new TypeError('RESTRICTED_ROLE_GENERAL_PROJECTION_FORBIDDEN');
        }
        if (!CURRENT_ROLE_CONFIRMATION_STATES.has(role.confirmation_state)) {
            continue;
        }

        const reference = requireReference(
            role.policy_role_reference,
            'POLICY_ROLE_REFERENCE'
        );
        const current = latestByReference.get(reference);
        const version = Number(role.role_version || 0);

        if (!current || version > Number(current.role_version || 0)) {
            latestByReference.set(reference, role);
        }
    }

    return [...latestByReference.values()]
        .filter(role => role.effective_to === null || role.effective_to === undefined)
        .sort((left, right) => temporalRoleKey(left).localeCompare(temporalRoleKey(right)));
}

function projectPerson(person) {
    const row = requireRecord(person, 'COMMERCIAL_PERSON');
    return Object.freeze({
        id: requireReference(row.id, 'PERSON_ID'),
        personReference: requireReference(row.person_reference, 'PERSON_REFERENCE'),
        displayName: requireReference(row.display_name, 'PERSON_DISPLAY_NAME'),
        preferredName: row.preferred_name || null,
        lifecycleState: row.lifecycle_state,
        privacyClassification: row.privacy_classification,
    });
}

function projectAccount(account) {
    const row = requireRecord(account, 'COMMERCIAL_ACCOUNT');
    return Object.freeze({
        id: requireReference(row.id, 'ACCOUNT_ID'),
        accountReference: requireReference(row.account_reference, 'ACCOUNT_REFERENCE'),
        displayLabel: requireReference(row.display_label, 'ACCOUNT_DISPLAY_LABEL'),
        accountType: row.account_type,
        lifecycleState: row.lifecycle_state,
        privacyClassification: row.privacy_classification,
    });
}

export function createCanonicalPortfolioItem({
    policy,
    roles = [],
    peopleById = new Map(),
    accountsById = new Map(),
}) {
    const row = requireRecord(policy, 'CANONICAL_POLICY');
    rejectUnknownKeys(row, POLICY_KEYS, 'CANONICAL_POLICY');

    if (row.archived_at) {
        throw new TypeError('ARCHIVED_POLICY_PORTFOLIO_PROJECTION_FORBIDDEN');
    }

    const policyReference = requireReference(
        row.policy_reference,
        'POLICY_REFERENCE'
    );
    const currentRoles = selectCurrentGeneralRoles(roles);
    const participantRoles = [];
    const personReferences = new Set();
    const accountReferences = new Set();

    for (const role of currentRoles) {
        const hasPerson = Boolean(role.participant_person_id);
        const hasAccount = Boolean(role.participant_account_id);
        if (hasPerson === hasAccount) {
            throw new TypeError('POLICY_ROLE_PARTICIPANT_XOR_REQUIRED');
        }

        if (hasPerson) {
            const person = peopleById.get(role.participant_person_id);
            if (!person) {
                throw new TypeError('POLICY_ROLE_PERSON_PROJECTION_MISSING');
            }
            const projected = projectPerson(person);
            personReferences.add(projected.personReference);
            participantRoles.push(Object.freeze({
                roleType: role.role_type,
                participantKind: 'COMMERCIAL_PERSON',
                participantReference: projected.personReference,
                displayLabel: projected.preferredName || projected.displayName,
                effectiveFrom: role.effective_from,
                effectiveTo: role.effective_to || null,
            }));
            continue;
        }

        const account = accountsById.get(role.participant_account_id);
        if (!account) {
            throw new TypeError('POLICY_ROLE_ACCOUNT_PROJECTION_MISSING');
        }
        const projected = projectAccount(account);
        accountReferences.add(projected.accountReference);
        participantRoles.push(Object.freeze({
            roleType: role.role_type,
            participantKind: 'COMMERCIAL_ACCOUNT',
            participantReference: projected.accountReference,
            displayLabel: projected.displayLabel,
            effectiveFrom: role.effective_from,
            effectiveTo: role.effective_to || null,
        }));
    }

    const status = visibleFact(row.status_value, 'UNKNOWN');
    const currency = visibleFact(row.currency);
    const premiumAmount = visibleFact(row.premium_amount);
    const sumInsured = visibleFact(row.sum_insured);

    return Object.freeze({
        policyReference,
        carrierReference: requireReference(row.carrier_reference, 'CARRIER_REFERENCE'),
        productReference: requireReference(row.product_reference, 'PRODUCT_REFERENCE'),
        issueDate: row.issue_date || null,
        policyEffectiveFrom: row.effective_from || null,
        policyEffectiveTo: row.effective_to || null,
        status,
        statusAsOf: row.status_as_of,
        completenessState: row.completeness_state,
        freshnessState: row.freshness_state,
        conflictState: row.conflict_state,
        currentVersion: Number(row.current_version),
        currency,
        premiumAmount,
        paymentFrequency: visibleFact(row.payment_frequency),
        sumInsured,
        generalParticipantSummary: Object.freeze(participantRoles),
        personReferences: Object.freeze([...personReferences]),
        accountReferences: Object.freeze([...accountReferences]),
        latestPolicyActivity: null,
        updatedAt: row.updated_at || row.status_as_of,
    });
}

export function buildCanonicalPortfolioProjection({
    policies = [],
    rolesByPolicyReference = new Map(),
    people = [],
    accounts = [],
}) {
    if (!Array.isArray(policies) || !Array.isArray(people) || !Array.isArray(accounts)) {
        throw new TypeError('PORTFOLIO_COLLECTIONS_MUST_BE_ARRAYS');
    }

    const peopleById = new Map(people.map(person => [person.id, person]));
    const accountsById = new Map(accounts.map(account => [account.id, account]));

    return Object.freeze(
        policies
            .filter(policy => !policy.archived_at)
            .map(policy => createCanonicalPortfolioItem({
                policy,
                roles: rolesByPolicyReference.get(policy.policy_reference) || [],
                peopleById,
                accountsById,
            }))
            .sort((left, right) => {
                const leftTime = Date.parse(left.statusAsOf || left.updatedAt || 0) || 0;
                const rightTime = Date.parse(right.statusAsOf || right.updatedAt || 0) || 0;
                return rightTime - leftTime || left.policyReference.localeCompare(right.policyReference);
            })
    );
}

export const CARTERA_010C_GENERAL_ROLE_TYPES = Object.freeze([...GENERAL_ROLE_TYPES]);
export const CARTERA_010C_CURRENT_ROLE_CONFIRMATION_STATES = Object.freeze([
    ...CURRENT_ROLE_CONFIRMATION_STATES,
]);
