// CARTERA 010C canonical Policy detail and minimized Timeline projection.
// Pure projection only. Financial Policy Truth stays in detail and never enters Timeline payloads.

import {
    assertPolicyDomainEvent,
} from '../event-evidence/policy-domain-event-contract.js';
import {
    createCanonicalPortfolioItem,
} from './cartera-010c-portfolio-read-model.js';

const POLICY_DETAIL_KEYS = new Set([
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
]);

const PORTFOLIO_POLICY_KEYS = Object.freeze([
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

function requireTimestamp(value, label) {
    if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
        throw new TypeError(`${label}_INVALID`);
    }
    return value;
}

function rejectUnknownKeys(record, allowed, label) {
    for (const key of Object.keys(record)) {
        if (!allowed.has(key)) {
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

function uniqueReferences(values) {
    return Object.freeze([
        ...new Set(
            values
                .filter(Boolean)
                .map(value => requireReference(value, 'EVIDENCE_REFERENCE'))
        ),
    ]);
}

function pick(record, keys) {
    return Object.fromEntries(
        keys.map(key => [key, record[key]])
    );
}

function eventId(prefix, ...parts) {
    const value = [prefix, ...parts].join(':');
    return requireReference(value, 'POLICY_EVENT_ID');
}

function policyVersionEventId(version) {
    return eventId('POLICY_VERSION_EVENT', version.id);
}

function policyRoleConfirmedEventId(role) {
    return eventId('POLICY_ROLE_EVENT', role.id, 'CONFIRMED');
}

function participantPayload(role, peopleById, accountsById) {
    if (role.participant_person_id) {
        const person = peopleById.get(role.participant_person_id);
        if (!person) {
            throw new TypeError('POLICY_DETAIL_ROLE_PERSON_MISSING');
        }
        return {
            personReference: requireReference(
                person.person_reference,
                'PERSON_REFERENCE'
            ),
        };
    }

    if (role.participant_account_id) {
        const account = accountsById.get(role.participant_account_id);
        if (!account) {
            throw new TypeError('POLICY_DETAIL_ROLE_ACCOUNT_MISSING');
        }
        return {
            accountReference: requireReference(
                account.account_reference,
                'ACCOUNT_REFERENCE'
            ),
        };
    }

    throw new TypeError('POLICY_DETAIL_ROLE_PARTICIPANT_REQUIRED');
}

function versionEvidence(version, evidenceById) {
    const evidence = evidenceById.get(version.evidence_version_id);
    if (!evidence) {
        throw new TypeError('POLICY_VERSION_EVIDENCE_MISSING');
    }
    return evidence;
}

function assertGeneralRole(role) {
    if (role.role_type === 'BENEFICIARY') {
        throw new TypeError('BENEFICIARY_POLICY_DETAIL_FORBIDDEN');
    }
    if (role.visibility_scope !== 'POLICY_TEAM') {
        throw new TypeError('RESTRICTED_POLICY_DETAIL_ROLE_FORBIDDEN');
    }
}

export function buildPolicyDomainTimelineEvents({
    policy,
    versions = [],
    evidenceVersions = [],
    roles = [],
    conflicts = [],
    people = [],
    accounts = [],
}) {
    const policyRow = requireRecord(policy, 'CANONICAL_POLICY');
    rejectUnknownKeys(policyRow, POLICY_DETAIL_KEYS, 'CANONICAL_POLICY_DETAIL');

    const policyReference = requireReference(
        policyRow.policy_reference,
        'POLICY_REFERENCE'
    );
    const evidenceById = new Map(
        evidenceVersions.map(evidence => [evidence.id, evidence])
    );
    const versionById = new Map(versions.map(version => [version.id, version]));
    const versionByNumber = [...versions].sort(
        (left, right) => Number(left.version_number) - Number(right.version_number)
    );
    const versionEventById = new Map(
        versions.map(version => [version.id, policyVersionEventId(version)])
    );
    const peopleById = new Map(people.map(person => [person.id, person]));
    const accountsById = new Map(accounts.map(account => [account.id, account]));
    const roleById = new Map(roles.map(role => [role.id, role]));
    const events = [];

    const firstVersion = versionByNumber[0];
    if (firstVersion) {
        const evidence = versionEvidence(firstVersion, evidenceById);
        events.push(assertPolicyDomainEvent({
            contractType: 'FORGE_POLICY_DOMAIN_EVENT',
            contractVersion: 'CARTERA-010C.1',
            eventId: eventId('POLICY_EVENT', policyRow.id, 'CONFIRMED'),
            subjectType: 'POLICY',
            subjectReference: policyReference,
            eventType: 'POLICY_CONFIRMED',
            occurredAt: requireTimestamp(
                policyRow.created_at || firstVersion.confirmed_at,
                'POLICY_CONFIRMED_AT'
            ),
            actorReference: requireReference(
                policyRow.created_by || firstVersion.confirmed_by,
                'POLICY_CONFIRMED_ACTOR'
            ),
            evidenceReferences: uniqueReferences([
                evidence.evidence_version_reference,
            ]),
            payload: {
                policyReference,
                statusValue: policyRow.status_value,
            },
        }));
    }

    for (const evidence of evidenceVersions) {
        events.push(assertPolicyDomainEvent({
            contractType: 'FORGE_POLICY_DOMAIN_EVENT',
            contractVersion: 'CARTERA-010C.1',
            eventId: eventId('POLICY_EVIDENCE_EVENT', evidence.id),
            subjectType: 'POLICY_EVIDENCE_VERSION',
            subjectReference: requireReference(
                evidence.evidence_version_reference,
                'EVIDENCE_VERSION_REFERENCE'
            ),
            eventType: 'POLICY_EVIDENCE_CONFIRMED',
            occurredAt: requireTimestamp(
                evidence.observed_at || evidence.created_at,
                'EVIDENCE_OBSERVED_AT'
            ),
            actorReference: requireReference(
                evidence.created_by,
                'EVIDENCE_CREATED_BY'
            ),
            evidenceReferences: uniqueReferences([
                evidence.evidence_version_reference,
            ]),
            payload: {
                policyReference,
                evidenceVersionReference: evidence.evidence_version_reference,
            },
            ...(evidence.correction_of
                ? {
                    correctionOf: eventId(
                        'POLICY_EVIDENCE_EVENT',
                        evidence.correction_of
                    ),
                }
                : {}),
        }));
    }

    for (const version of versions) {
        const evidence = versionEvidence(version, evidenceById);
        const previous = version.previous_policy_version_id
            ? versionById.get(version.previous_policy_version_id)
            : null;

        events.push(assertPolicyDomainEvent({
            contractType: 'FORGE_POLICY_DOMAIN_EVENT',
            contractVersion: 'CARTERA-010C.1',
            eventId: policyVersionEventId(version),
            subjectType: 'POLICY',
            subjectReference: policyReference,
            eventType: 'POLICY_VERSION_CONFIRMED',
            occurredAt: requireTimestamp(
                version.confirmed_at,
                'POLICY_VERSION_CONFIRMED_AT'
            ),
            actorReference: requireReference(
                version.confirmed_by,
                'POLICY_VERSION_CONFIRMED_BY'
            ),
            evidenceReferences: uniqueReferences([
                evidence.evidence_version_reference,
            ]),
            payload: {
                policyReference,
                policyVersionReference: requireReference(
                    version.policy_version_reference,
                    'POLICY_VERSION_REFERENCE'
                ),
                ...(previous
                    ? {
                        previousReference: requireReference(
                            previous.policy_version_reference,
                            'PREVIOUS_POLICY_VERSION_REFERENCE'
                        ),
                    }
                    : {}),
                currentReference: requireReference(
                    version.policy_version_reference,
                    'CURRENT_POLICY_VERSION_REFERENCE'
                ),
            },
            ...(version.correction_of && versionEventById.has(version.correction_of)
                ? { correctionOf: versionEventById.get(version.correction_of) }
                : {}),
        }));
    }

    for (const role of roles) {
        assertGeneralRole(role);
        const version = versionById.get(role.policy_version_id);
        if (!version) {
            throw new TypeError('POLICY_ROLE_VERSION_MISSING');
        }
        const evidence = versionEvidence(version, evidenceById);
        const participant = participantPayload(role, peopleById, accountsById);

        events.push(assertPolicyDomainEvent({
            contractType: 'FORGE_POLICY_DOMAIN_EVENT',
            contractVersion: 'CARTERA-010C.1',
            eventId: policyRoleConfirmedEventId(role),
            subjectType: 'POLICY_ROLE',
            subjectReference: requireReference(
                role.policy_role_reference,
                'POLICY_ROLE_REFERENCE'
            ),
            eventType: 'POLICY_ROLE_CONFIRMED',
            occurredAt: requireTimestamp(
                role.effective_from || role.created_at,
                'POLICY_ROLE_CONFIRMED_AT'
            ),
            actorReference: requireReference(
                version.confirmed_by,
                'POLICY_ROLE_CONFIRMED_BY'
            ),
            evidenceReferences: uniqueReferences([
                evidence.evidence_version_reference,
            ]),
            payload: {
                policyReference,
                policyRoleReference: role.policy_role_reference,
                roleType: role.role_type,
                confirmationState: role.confirmation_state,
                ...participant,
            },
            ...(role.correction_of && roleById.has(role.correction_of)
                ? {
                    correctionOf: policyRoleConfirmedEventId(
                        roleById.get(role.correction_of)
                    ),
                }
                : {}),
        }));

        if (role.correction_of && roleById.has(role.correction_of)) {
            const previousRole = roleById.get(role.correction_of);
            assertGeneralRole(previousRole);
            events.push(assertPolicyDomainEvent({
                contractType: 'FORGE_POLICY_DOMAIN_EVENT',
                contractVersion: 'CARTERA-010C.1',
                eventId: eventId(
                    'POLICY_ROLE_EVENT',
                    previousRole.id,
                    'SUPERSEDED_BY',
                    role.id
                ),
                subjectType: 'POLICY_ROLE',
                subjectReference: requireReference(
                    previousRole.policy_role_reference,
                    'PREVIOUS_POLICY_ROLE_REFERENCE'
                ),
                eventType: 'POLICY_ROLE_SUPERSEDED',
                occurredAt: requireTimestamp(
                    role.effective_from || role.created_at,
                    'POLICY_ROLE_SUPERSEDED_AT'
                ),
                actorReference: requireReference(
                    version.confirmed_by,
                    'POLICY_ROLE_SUPERSEDED_BY'
                ),
                evidenceReferences: uniqueReferences([
                    evidence.evidence_version_reference,
                ]),
                payload: {
                    policyReference,
                    policyRoleReference: previousRole.policy_role_reference,
                    roleType: previousRole.role_type,
                    previousReference: previousRole.policy_role_reference,
                    currentReference: role.policy_role_reference,
                },
                correctionOf: policyRoleConfirmedEventId(previousRole),
            }));
        }
    }

    for (const conflict of conflicts) {
        const evidenceReferences = uniqueReferences(
            conflict.evidence_references || []
        );
        if (evidenceReferences.length === 0) {
            continue;
        }
        events.push(assertPolicyDomainEvent({
            contractType: 'FORGE_POLICY_DOMAIN_EVENT',
            contractVersion: 'CARTERA-010C.1',
            eventId: eventId('POLICY_CONFLICT_EVENT', conflict.id),
            subjectType: 'POLICY',
            subjectReference: policyReference,
            eventType: 'POLICY_CONFLICT_RECORDED',
            occurredAt: requireTimestamp(
                conflict.recorded_at,
                'POLICY_CONFLICT_RECORDED_AT'
            ),
            actorReference: requireReference(
                conflict.recorded_by,
                'POLICY_CONFLICT_RECORDED_BY'
            ),
            evidenceReferences,
            payload: {
                policyReference,
                conflictReference: requireReference(
                    conflict.conflict_reference,
                    'POLICY_CONFLICT_REFERENCE'
                ),
            },
        }));
    }

    return Object.freeze(
        events.sort((left, right) => {
            const time = Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
            return time || left.eventId.localeCompare(right.eventId);
        })
    );
}

const TIMELINE_LABELS = Object.freeze({
    POLICY_CONFIRMED: 'Póliza confirmada',
    POLICY_VERSION_CONFIRMED: 'Versión de póliza confirmada',
    POLICY_CONFLICT_RECORDED: 'Conflicto de póliza registrado',
    POLICY_ROLE_CONFIRMED: 'Participación confirmada',
    POLICY_ROLE_SUPERSEDED: 'Participación corregida',
    POLICY_EVIDENCE_CONFIRMED: 'Evidencia confirmada',
});

export function projectPolicyTimelineEntry(event) {
    const accepted = assertPolicyDomainEvent(event);
    const payload = accepted.payload;
    const summary = (() => {
        if (accepted.eventType === 'POLICY_VERSION_CONFIRMED') {
            return payload.policyVersionReference;
        }
        if (
            accepted.eventType === 'POLICY_ROLE_CONFIRMED'
            || accepted.eventType === 'POLICY_ROLE_SUPERSEDED'
        ) {
            return `${payload.roleType} · ${payload.confirmationState || 'CORREGIDO'}`;
        }
        if (accepted.eventType === 'POLICY_EVIDENCE_CONFIRMED') {
            return payload.evidenceVersionReference;
        }
        if (accepted.eventType === 'POLICY_CONFLICT_RECORDED') {
            return payload.conflictReference;
        }
        return payload.statusValue || payload.policyReference;
    })();

    return Object.freeze({
        eventId: accepted.eventId,
        eventType: accepted.eventType,
        subjectType: accepted.subjectType,
        subjectReference: accepted.subjectReference,
        occurredAt: accepted.occurredAt,
        title: TIMELINE_LABELS[accepted.eventType] || accepted.eventType,
        summary,
        correctionOf: accepted.correctionOf || null,
        evidenceCount: accepted.evidenceReferences.length,
    });
}

export function createCanonicalPolicyDetailProjection({
    policy,
    versions = [],
    evidenceVersions = [],
    roles = [],
    conflicts = [],
    people = [],
    accounts = [],
}) {
    const row = requireRecord(policy, 'CANONICAL_POLICY');
    rejectUnknownKeys(row, POLICY_DETAIL_KEYS, 'CANONICAL_POLICY_DETAIL');
    if (row.archived_at) {
        throw new TypeError('ARCHIVED_POLICY_DETAIL_FORBIDDEN');
    }

    const peopleById = new Map(people.map(person => [person.id, person]));
    const accountsById = new Map(accounts.map(account => [account.id, account]));
    const portfolioItem = createCanonicalPortfolioItem({
        policy: pick(row, PORTFOLIO_POLICY_KEYS),
        roles,
        peopleById,
        accountsById,
    });
    const domainEvents = buildPolicyDomainTimelineEvents({
        policy: row,
        versions,
        evidenceVersions,
        roles,
        conflicts,
        people,
        accounts,
    });

    return Object.freeze({
        policy: Object.freeze({
            ...portfolioItem,
            policyNumber: visibleFact(row.policy_number),
            statusSource: requireReference(row.status_source, 'POLICY_STATUS_SOURCE'),
            createdAt: row.created_at,
        }),
        versions: Object.freeze(
            [...versions]
                .sort((left, right) => Number(right.version_number) - Number(left.version_number))
                .map(version => Object.freeze({
                    policyVersionReference: requireReference(
                        version.policy_version_reference,
                        'POLICY_VERSION_REFERENCE'
                    ),
                    versionNumber: Number(version.version_number),
                    quoteReference: version.quote_reference || null,
                    applicationReference: version.application_reference || null,
                    confirmedAt: version.confirmed_at,
                }))
        ),
        evidence: Object.freeze(
            [...evidenceVersions]
                .sort((left, right) => (
                    Date.parse(right.observed_at || right.created_at)
                    - Date.parse(left.observed_at || left.created_at)
                ))
                .map(evidence => Object.freeze({
                    evidenceVersionReference: requireReference(
                        evidence.evidence_version_reference,
                        'EVIDENCE_VERSION_REFERENCE'
                    ),
                    sourceType: evidence.source_type,
                    observedAt: evidence.observed_at,
                    verificationState: evidence.verification_state,
                }))
        ),
        conflicts: Object.freeze(
            [...conflicts]
                .sort((left, right) => Date.parse(right.recorded_at) - Date.parse(left.recorded_at))
                .map(conflict => Object.freeze({
                    conflictReference: requireReference(
                        conflict.conflict_reference,
                        'POLICY_CONFLICT_REFERENCE'
                    ),
                    conflictType: conflict.conflict_type,
                    conflictState: conflict.conflict_state,
                    recordedAt: conflict.recorded_at,
                }))
        ),
        timeline: Object.freeze(domainEvents.map(projectPolicyTimelineEntry)),
    });
}
