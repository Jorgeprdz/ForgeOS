// CARTERA 010D unified owner-scoped directory projection.
// Pure read model only: no mutation, identity merge, contact execution or hidden-role disclosure.

import {
    CARTERA_010C_GENERAL_ROLE_TYPES,
    CARTERA_010C_CURRENT_ROLE_CONFIRMATION_STATES,
} from './cartera-010c-portfolio-read-model.js';

const ENTRY_KIND = Object.freeze({
    PERSON: 'COMMERCIAL_PERSON',
    ACCOUNT: 'COMMERCIAL_ACCOUNT',
    POLICY: 'POLICY',
});

const ENTRY_KIND_ORDER = Object.freeze({
    [ENTRY_KIND.PERSON]: 0,
    [ENTRY_KIND.ACCOUNT]: 1,
    [ENTRY_KIND.POLICY]: 2,
});

const SEARCH_REASON_WEIGHT = Object.freeze({
    VERIFIED_PHONE: 120,
    VERIFIED_EMAIL: 120,
    POLICY_NUMBER: 110,
    DISPLAY_NAME: 100,
    PREFERRED_NAME: 100,
    ACCOUNT_LABEL: 100,
    PERSON_REFERENCE: 90,
    ACCOUNT_REFERENCE: 90,
    POLICY_REFERENCE: 90,
    CARRIER_REFERENCE: 80,
    PRODUCT_REFERENCE: 80,
    ACCOUNT_TYPE: 70,
    POLICY_STATUS: 70,
    RELATIONSHIP_ROLE: 45,
    POLICY_ROLE: 45,
    RELATIONSHIP_LABEL: 20,
    RELATIONSHIP_REFERENCE: 20,
    PARTICIPANT_LABEL: 20,
    PARTICIPANT_REFERENCE: 20,
});

const CURRENT_STATES = new Set(CARTERA_010C_CURRENT_ROLE_CONFIRMATION_STATES);
const GENERAL_ROLE_TYPES = new Set(CARTERA_010C_GENERAL_ROLE_TYPES);
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

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
    const reference = typeof value === 'string' ? value.trim() : '';
    if (!REFERENCE_PATTERN.test(reference)) {
        throw new TypeError(`${label}_INVALID`);
    }
    return reference;
}

function requireLabel(value, label) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text || text.length > 240) {
        throw new TypeError(`${label}_INVALID`);
    }
    return text;
}

export function normalizeCarteraDirectorySearchText(value = '') {
    return String(value)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ');
}

function validAsOf(value) {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) {
        throw new TypeError('CARTERA010D_AS_OF_INVALID');
    }
    return timestamp;
}

function isCurrentTemporal(row, asOfTimestamp) {
    if (!CURRENT_STATES.has(row.confirmation_state)) {
        return false;
    }
    if (row.privacy_classification === 'RESTRICTED') {
        return false;
    }

    const effectiveFrom = Date.parse(row.effective_from || 0);
    const effectiveTo = row.effective_to ? Date.parse(row.effective_to) : null;

    if (Number.isFinite(effectiveFrom) && effectiveFrom > asOfTimestamp) {
        return false;
    }
    if (effectiveTo !== null && Number.isFinite(effectiveTo) && effectiveTo <= asOfTimestamp) {
        return false;
    }
    return true;
}

function freezeList(values) {
    return Object.freeze([...values]);
}

function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((left, right) => (
        String(left).localeCompare(String(right))
    ));
}

function addSearchToken(tokens, reason, value) {
    const normalized = normalizeCarteraDirectorySearchText(value);
    if (!normalized) {
        return;
    }
    tokens.push(Object.freeze({ reason, value: normalized }));
}

function publicRelationship({
    relationshipType,
    targetKind,
    targetReference,
    targetLabel,
}) {
    return Object.freeze({
        relationshipType: requireReference(relationshipType, 'RELATIONSHIP_TYPE'),
        targetKind,
        targetReference: requireReference(targetReference, 'RELATIONSHIP_TARGET_REFERENCE'),
        targetLabel: requireLabel(targetLabel, 'RELATIONSHIP_TARGET_LABEL'),
    });
}

function policyRoleParticipant(role, peopleById, accountsById) {
    if (role.role_type === 'BENEFICIARY') {
        throw new TypeError('BENEFICIARY_DIRECTORY_PROJECTION_FORBIDDEN');
    }
    if (!GENERAL_ROLE_TYPES.has(role.role_type)) {
        throw new TypeError(`GENERAL_ROLE_TYPE_FORBIDDEN:${role.role_type}`);
    }
    if (role.visibility_scope !== 'POLICY_TEAM') {
        throw new TypeError('RESTRICTED_ROLE_DIRECTORY_PROJECTION_FORBIDDEN');
    }

    const hasPerson = Boolean(role.participant_person_id);
    const hasAccount = Boolean(role.participant_account_id);
    if (hasPerson === hasAccount) {
        throw new TypeError('POLICY_ROLE_PARTICIPANT_XOR_REQUIRED');
    }

    if (hasPerson) {
        const person = peopleById.get(role.participant_person_id);
        if (!person) {
            throw new TypeError('POLICY_ROLE_PERSON_DIRECTORY_MISSING');
        }
        return Object.freeze({
            kind: ENTRY_KIND.PERSON,
            id: person.id,
            reference: person.person_reference,
            label: person.preferred_name || person.display_name,
        });
    }

    const account = accountsById.get(role.participant_account_id);
    if (!account) {
        throw new TypeError('POLICY_ROLE_ACCOUNT_DIRECTORY_MISSING');
    }
    return Object.freeze({
        kind: ENTRY_KIND.ACCOUNT,
        id: account.id,
        reference: account.account_reference,
        label: account.display_label,
    });
}

function tokenMatchScore(token, term) {
    const reasonWeight = SEARCH_REASON_WEIGHT[token.reason] || 0;
    if (token.value === term) {
        return reasonWeight + 100;
    }
    if (token.value.startsWith(term)) {
        return reasonWeight + 30;
    }
    return reasonWeight + 10;
}

function searchRecords(records, query, limit) {
    const normalizedQuery = normalizeCarteraDirectorySearchText(query);
    const safeLimit = Number.isInteger(limit) && limit > 0
        ? Math.min(limit, 200)
        : 50;

    if (!normalizedQuery) {
        return freezeList(records.slice(0, safeLimit).map(record => Object.freeze({
            entry: record.entry,
            matchReasons: Object.freeze([]),
        })));
    }

    const terms = normalizedQuery.split(' ').filter(Boolean);
    const matches = [];

    for (const record of records) {
        const reasons = new Set();
        let score = 0;
        let complete = true;

        for (const term of terms) {
            const termTokens = record.tokens.filter(token => token.value.includes(term));
            if (termTokens.length === 0) {
                complete = false;
                break;
            }

            let bestTermScore = 0;
            for (const token of termTokens) {
                reasons.add(token.reason);
                bestTermScore = Math.max(bestTermScore, tokenMatchScore(token, term));
            }
            score += bestTermScore;
        }

        if (complete) {
            matches.push({ record, reasons, score });
        }
    }

    matches.sort((left, right) => (
        right.score - left.score
        || ENTRY_KIND_ORDER[left.record.entry.kind] - ENTRY_KIND_ORDER[right.record.entry.kind]
        || left.record.entry.displayLabel.localeCompare(right.record.entry.displayLabel)
    ));

    return freezeList(matches.slice(0, safeLimit).map(match => Object.freeze({
        entry: match.record.entry,
        matchReasons: freezeList([...match.reasons].sort()),
    })));
}

export function createCanonicalDirectoryProjection({
    people = [],
    accounts = [],
    memberships = [],
    policies = [],
    rolesByPolicyReference = new Map(),
    asOf = new Date().toISOString(),
} = {}) {
    if (
        !Array.isArray(people)
        || !Array.isArray(accounts)
        || !Array.isArray(memberships)
        || !Array.isArray(policies)
        || !(rolesByPolicyReference instanceof Map)
    ) {
        throw new TypeError('CARTERA010D_DIRECTORY_COLLECTIONS_INVALID');
    }

    const asOfTimestamp = validAsOf(asOf);
    const activePeople = people
        .map(row => requireRecord(row, 'COMMERCIAL_PERSON'))
        .filter(row => !row.archived_at && row.privacy_classification !== 'RESTRICTED');
    const activeAccounts = accounts
        .map(row => requireRecord(row, 'COMMERCIAL_ACCOUNT'))
        .filter(row => !row.archived_at && row.privacy_classification !== 'RESTRICTED');
    const activePolicies = policies
        .map(row => requireRecord(row, 'CANONICAL_POLICY'))
        .filter(row => !row.archived_at);

    const peopleById = new Map(activePeople.map(person => [person.id, person]));
    const accountsById = new Map(activeAccounts.map(account => [account.id, account]));

    const membershipsByPersonId = new Map();
    const membershipsByAccountId = new Map();
    for (const candidate of memberships) {
        const membership = requireRecord(candidate, 'COMMERCIAL_ACCOUNT_MEMBERSHIP');
        if (!isCurrentTemporal(membership, asOfTimestamp)) {
            continue;
        }
        if (!peopleById.has(membership.person_id) || !accountsById.has(membership.account_id)) {
            throw new TypeError('ACCOUNT_MEMBERSHIP_DIRECTORY_TARGET_MISSING');
        }
        const personRows = membershipsByPersonId.get(membership.person_id) || [];
        personRows.push(membership);
        membershipsByPersonId.set(membership.person_id, personRows);
        const accountRows = membershipsByAccountId.get(membership.account_id) || [];
        accountRows.push(membership);
        membershipsByAccountId.set(membership.account_id, accountRows);
    }

    const policyRelationsByPersonId = new Map();
    const policyRelationsByAccountId = new Map();
    const currentRolesByPolicyReference = new Map();

    for (const policy of activePolicies) {
        const roles = rolesByPolicyReference.get(policy.policy_reference) || [];
        const currentRoles = [];
        for (const candidate of roles) {
            const role = requireRecord(candidate, 'POLICY_ROLE');
            if (role.policy_id && role.policy_id !== policy.id) {
                throw new TypeError('POLICY_ROLE_DIRECTORY_POLICY_MISMATCH');
            }
            if (!isCurrentTemporal(role, asOfTimestamp)) {
                continue;
            }
            const participant = policyRoleParticipant(role, peopleById, accountsById);
            const relation = Object.freeze({ role, participant, policy });
            currentRoles.push(relation);
            const targetMap = participant.kind === ENTRY_KIND.PERSON
                ? policyRelationsByPersonId
                : policyRelationsByAccountId;
            const rows = targetMap.get(participant.id) || [];
            rows.push(relation);
            targetMap.set(participant.id, rows);
        }
        currentRolesByPolicyReference.set(policy.policy_reference, currentRoles);
    }

    const records = [];

    for (const person of activePeople) {
        const personReference = requireReference(person.person_reference, 'PERSON_REFERENCE');
        const displayLabel = requireLabel(
            person.preferred_name || person.display_name,
            'PERSON_DISPLAY_LABEL'
        );
        const membershipRows = membershipsByPersonId.get(person.id) || [];
        const policyRelations = policyRelationsByPersonId.get(person.id) || [];
        const relationships = [];

        for (const membership of membershipRows) {
            const account = accountsById.get(membership.account_id);
            relationships.push(publicRelationship({
                relationshipType: membership.relationship_role,
                targetKind: ENTRY_KIND.ACCOUNT,
                targetReference: account.account_reference,
                targetLabel: account.display_label,
            }));
        }
        for (const relation of policyRelations) {
            relationships.push(publicRelationship({
                relationshipType: relation.role.role_type,
                targetKind: ENTRY_KIND.POLICY,
                targetReference: relation.policy.policy_reference,
                targetLabel: relation.policy.policy_number,
            }));
        }

        const policyReferences = uniqueSorted(policyRelations.map(row => row.policy.policy_reference));
        const accountReferences = uniqueSorted(membershipRows.map(row => (
            accountsById.get(row.account_id)?.account_reference
        )));
        const entry = Object.freeze({
            kind: ENTRY_KIND.PERSON,
            reference: personReference,
            displayLabel,
            secondaryLabel: person.lifecycle_state || 'UNKNOWN',
            lifecycleState: person.lifecycle_state || 'UNKNOWN',
            policyCount: policyReferences.length,
            accountCount: accountReferences.length,
            personCount: 1,
            policyReferences: freezeList(policyReferences),
            accountReferences: freezeList(accountReferences),
            personReferences: freezeList([personReference]),
            relationships: freezeList(relationships),
        });
        const tokens = [];
        addSearchToken(tokens, 'DISPLAY_NAME', person.display_name);
        addSearchToken(tokens, 'PREFERRED_NAME', person.preferred_name);
        addSearchToken(tokens, 'PERSON_REFERENCE', personReference);
        addSearchToken(tokens, 'VERIFIED_PHONE', person.verified_phone);
        addSearchToken(tokens, 'VERIFIED_EMAIL', person.verified_email);
        for (const relationship of relationships) {
            addSearchToken(tokens, 'RELATIONSHIP_ROLE', relationship.relationshipType);
            addSearchToken(tokens, 'RELATIONSHIP_LABEL', relationship.targetLabel);
            addSearchToken(tokens, 'RELATIONSHIP_REFERENCE', relationship.targetReference);
        }
        records.push(Object.freeze({ entry, tokens: freezeList(tokens) }));
    }

    for (const account of activeAccounts) {
        const accountReference = requireReference(account.account_reference, 'ACCOUNT_REFERENCE');
        const displayLabel = requireLabel(account.display_label, 'ACCOUNT_DISPLAY_LABEL');
        const membershipRows = membershipsByAccountId.get(account.id) || [];
        const policyRelations = policyRelationsByAccountId.get(account.id) || [];
        const relationships = [];

        for (const membership of membershipRows) {
            const person = peopleById.get(membership.person_id);
            relationships.push(publicRelationship({
                relationshipType: membership.relationship_role,
                targetKind: ENTRY_KIND.PERSON,
                targetReference: person.person_reference,
                targetLabel: person.preferred_name || person.display_name,
            }));
        }
        for (const relation of policyRelations) {
            relationships.push(publicRelationship({
                relationshipType: relation.role.role_type,
                targetKind: ENTRY_KIND.POLICY,
                targetReference: relation.policy.policy_reference,
                targetLabel: relation.policy.policy_number,
            }));
        }

        const policyReferences = uniqueSorted(policyRelations.map(row => row.policy.policy_reference));
        const personReferences = uniqueSorted(membershipRows.map(row => (
            peopleById.get(row.person_id)?.person_reference
        )));
        const entry = Object.freeze({
            kind: ENTRY_KIND.ACCOUNT,
            reference: accountReference,
            displayLabel,
            secondaryLabel: account.account_type || 'UNKNOWN',
            lifecycleState: account.lifecycle_state || 'UNKNOWN',
            policyCount: policyReferences.length,
            accountCount: 1,
            personCount: personReferences.length,
            policyReferences: freezeList(policyReferences),
            accountReferences: freezeList([accountReference]),
            personReferences: freezeList(personReferences),
            relationships: freezeList(relationships),
        });
        const tokens = [];
        addSearchToken(tokens, 'ACCOUNT_LABEL', displayLabel);
        addSearchToken(tokens, 'ACCOUNT_REFERENCE', accountReference);
        addSearchToken(tokens, 'ACCOUNT_TYPE', account.account_type);
        for (const relationship of relationships) {
            addSearchToken(tokens, 'RELATIONSHIP_ROLE', relationship.relationshipType);
            addSearchToken(tokens, 'RELATIONSHIP_LABEL', relationship.targetLabel);
            addSearchToken(tokens, 'RELATIONSHIP_REFERENCE', relationship.targetReference);
        }
        records.push(Object.freeze({ entry, tokens: freezeList(tokens) }));
    }

    for (const policy of activePolicies) {
        const policyReference = requireReference(policy.policy_reference, 'POLICY_REFERENCE');
        const policyNumber = requireLabel(policy.policy_number, 'POLICY_NUMBER');
        const currentRelations = currentRolesByPolicyReference.get(policyReference) || [];
        const relationships = currentRelations.map(relation => publicRelationship({
            relationshipType: relation.role.role_type,
            targetKind: relation.participant.kind,
            targetReference: relation.participant.reference,
            targetLabel: relation.participant.label,
        }));
        const personReferences = uniqueSorted(currentRelations
            .filter(row => row.participant.kind === ENTRY_KIND.PERSON)
            .map(row => row.participant.reference));
        const accountReferences = uniqueSorted(currentRelations
            .filter(row => row.participant.kind === ENTRY_KIND.ACCOUNT)
            .map(row => row.participant.reference));
        const entry = Object.freeze({
            kind: ENTRY_KIND.POLICY,
            reference: policyReference,
            displayLabel: policyNumber,
            secondaryLabel: `${policy.product_reference} · ${policy.status_value || 'UNKNOWN'}`,
            lifecycleState: policy.status_value || 'UNKNOWN',
            policyNumber,
            carrierReference: requireReference(policy.carrier_reference, 'CARRIER_REFERENCE'),
            productReference: requireReference(policy.product_reference, 'PRODUCT_REFERENCE'),
            statusAsOf: policy.status_as_of || null,
            policyCount: 1,
            accountCount: accountReferences.length,
            personCount: personReferences.length,
            policyReferences: freezeList([policyReference]),
            accountReferences: freezeList(accountReferences),
            personReferences: freezeList(personReferences),
            relationships: freezeList(relationships),
        });
        const tokens = [];
        addSearchToken(tokens, 'POLICY_NUMBER', policyNumber);
        addSearchToken(tokens, 'POLICY_REFERENCE', policyReference);
        addSearchToken(tokens, 'CARRIER_REFERENCE', policy.carrier_reference);
        addSearchToken(tokens, 'PRODUCT_REFERENCE', policy.product_reference);
        addSearchToken(tokens, 'POLICY_STATUS', policy.status_value);
        for (const relationship of relationships) {
            addSearchToken(tokens, 'POLICY_ROLE', relationship.relationshipType);
            addSearchToken(tokens, 'PARTICIPANT_LABEL', relationship.targetLabel);
            addSearchToken(tokens, 'PARTICIPANT_REFERENCE', relationship.targetReference);
        }
        records.push(Object.freeze({ entry, tokens: freezeList(tokens) }));
    }

    records.sort((left, right) => (
        ENTRY_KIND_ORDER[left.entry.kind] - ENTRY_KIND_ORDER[right.entry.kind]
        || left.entry.displayLabel.localeCompare(right.entry.displayLabel)
        || left.entry.reference.localeCompare(right.entry.reference)
    ));

    const entries = freezeList(records.map(record => record.entry));
    const counts = Object.freeze({
        people: entries.filter(entry => entry.kind === ENTRY_KIND.PERSON).length,
        accounts: entries.filter(entry => entry.kind === ENTRY_KIND.ACCOUNT).length,
        policies: entries.filter(entry => entry.kind === ENTRY_KIND.POLICY).length,
        total: entries.length,
    });

    return Object.freeze({
        entries,
        counts,
        search(query, options = {}) {
            return searchRecords(records, query, options.limit);
        },
    });
}

export const CARTERA_010D_ENTRY_KIND = ENTRY_KIND;
export const CARTERA_010D_SEARCH_REASON_WEIGHT = SEARCH_REASON_WEIGHT;
