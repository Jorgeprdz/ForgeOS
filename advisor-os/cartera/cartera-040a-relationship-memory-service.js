import { SupabaseRuntime } from '../../supabase-runtime.js';
import {
    CARTERA_030C_SHA256,
} from './cartera-030c-confirmed-payment-reconciliation-service.js';
import {
    createCartera040RelationshipMemoryProjection,
} from '../../platform/relationship-intelligence/cartera-040b-relationship-memory-projection.js';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$/;
const VALUE_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$/;
const KINDS = new Set([
    'ORIGIN_REFERRAL',
    'APPOINTMENT_CONTEXT',
    'NEED',
    'OBJECTION',
    'DECISION',
    'SERVICE_INTERACTION',
    'ANNUAL_REVIEW',
    'CONTACT_PREFERENCE',
    'CONTACT_TIME_PREFERENCE',
    'DECISION_PARTICIPANT',
    'EXPLANATION_PREFERENCE',
    'UNRESOLVED_COMMITMENT',
    'SERVICE_EXPECTATION',
    'LIFE_CONTEXT',
]);
const AUTHORITIES = new Set([
    'PIPELINE_TIMELINE',
    'POLICY_INTELLIGENCE',
    'PAYMENT_EVENT',
    'SERVICE_WORKFLOW',
    'ADVISOR_CONFIRMED',
    'CLIENT_CONFIRMED',
]);
const SENSITIVITY = new Set(['STANDARD', 'PERSONAL', 'SENSITIVE']);
const CONSENT = new Set(['NOT_REQUIRED', 'CONFIRMED', 'UNKNOWN', 'REVOKED']);
const CONTEXT_USE = new Set([
    'GENERAL_RELATIONSHIP',
    'SERVICE_ONLY',
    'CONVERSATION_PREPARATION',
]);
const FORBIDDEN_RESPONSE_KEYS = new Set([
    'verifiedPhone',
    'verifiedEmail',
    'birthDate',
    'rawText',
    'transcript',
    'beneficiary',
    'beneficiaries',
    'bankAccount',
    'paymentInstrument',
    'cardNumber',
    'health',
    'medicalInformation',
    'income',
    'prompt',
    'providerRequest',
    'providerResponse',
    'finalMessage',
]);

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

function requiredReference(value, code, pattern = REFERENCE_PATTERN) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!pattern.test(normalized)) throw fail(code);
    return normalized;
}

function requiredEnum(value, allowed, code) {
    const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
    if (!allowed.has(normalized)) throw fail(code);
    return normalized;
}

function optionalReference(value, code, pattern = REFERENCE_PATTERN) {
    if (value === null || value === undefined || value === '') return null;
    return requiredReference(value, code, pattern);
}

function normalizeIso(value, code) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) throw fail(code);
    return date.toISOString();
}

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function assertSanitized(value, path = 'response') {
    if (Array.isArray(value)) {
        value.forEach((item, index) => assertSanitized(item, `${path}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
        if (FORBIDDEN_RESPONSE_KEYS.has(key)) {
            throw fail('CARTERA040_RESTRICTED_FIELD_EXPOSED', { path: `${path}.${key}` });
        }
        assertSanitized(nested, `${path}.${key}`);
    }
}

async function authenticatedUser(client) {
    const result = await client.auth.getUser();
    if (result?.error) throw fail('CARTERA040_AUTH_LOOKUP_FAILED', result.error);
    if (!result?.data?.user?.id) throw fail('CARTERA040_AUTH_REQUIRED');
    return result.data.user;
}

function normalizeEvidenceReferences(input) {
    if (!Array.isArray(input) || input.length < 1 || input.length > 20) {
        throw fail('CARTERA040_EVIDENCE_REFERENCES_REQUIRED');
    }
    const references = input.map(reference => requiredReference(
        reference,
        'CARTERA040_EVIDENCE_REFERENCE_INVALID'
    ));
    if (new Set(references).size !== references.length) {
        throw fail('CARTERA040_EVIDENCE_REFERENCE_DUPLICATED');
    }
    return Object.freeze(references);
}

function normalizeMemoryCommand(input = {}) {
    const memoryKind = requiredEnum(input.memoryKind, KINDS, 'CARTERA040_MEMORY_KIND_INVALID');
    const summary = typeof input.summary === 'string' ? input.summary.trim() : '';
    if (!summary || summary.length > 500) throw fail('CARTERA040_SUMMARY_INVALID');

    const sensitivity = requiredEnum(
        input.sensitivity,
        SENSITIVITY,
        'CARTERA040_SENSITIVITY_INVALID'
    );
    const consentState = requiredEnum(
        input.consentState,
        CONSENT,
        'CARTERA040_CONSENT_STATE_INVALID'
    );
    const contextUse = requiredEnum(
        input.contextUse,
        CONTEXT_USE,
        'CARTERA040_CONTEXT_USE_INVALID'
    );

    if (sensitivity === 'SENSITIVE' && consentState !== 'CONFIRMED') {
        throw fail('CARTERA040_SENSITIVE_CONTEXT_REQUIRES_CONSENT');
    }
    if (
        memoryKind === 'LIFE_CONTEXT'
        && (
            sensitivity !== 'SENSITIVE'
            || consentState !== 'CONFIRMED'
            || !['SERVICE_ONLY', 'CONVERSATION_PREPARATION'].includes(contextUse)
        )
    ) {
        throw fail('CARTERA040_LIFE_CONTEXT_BOUNDARY_VIOLATION');
    }

    const valueCode = input.valueCode == null || input.valueCode === ''
        ? null
        : requiredReference(input.valueCode, 'CARTERA040_VALUE_CODE_INVALID', VALUE_CODE_PATTERN)
            .toUpperCase();

    return deepFreeze({
        personReference: requiredReference(
            input.personReference,
            'CARTERA040_PERSON_REFERENCE_INVALID'
        ),
        memoryKind,
        summary,
        valueCode,
        occurredAt: normalizeIso(input.occurredAt, 'CARTERA040_OCCURRED_AT_INVALID'),
        sourceAuthority: requiredEnum(
            input.sourceAuthority,
            AUTHORITIES,
            'CARTERA040_SOURCE_AUTHORITY_INVALID'
        ),
        sourceRecordReference: requiredReference(
            input.sourceRecordReference,
            'CARTERA040_SOURCE_RECORD_REFERENCE_INVALID'
        ),
        evidenceReferences: normalizeEvidenceReferences(input.evidenceReferences),
        sensitivity,
        consentState,
        contextUse,
        idempotencyKey: requiredReference(
            input.idempotencyKey,
            'CARTERA040_IDEMPOTENCY_KEY_INVALID',
            IDEMPOTENCY_PATTERN
        ),
        supersedesMemoryReference: optionalReference(
            input.supersedesMemoryReference,
            'CARTERA040_SUPERSEDES_REFERENCE_INVALID'
        ),
    });
}

export function createCartera040RelationshipMemoryService({ client } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();
    if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
        throw fail('CARTERA040_SUPABASE_CLIENT_INVALID');
    }

    return Object.freeze({
        async loadRelationshipBrief(personReference, { limit = 60 } = {}) {
            await authenticatedUser(resolvedClient);
            const reference = requiredReference(
                personReference,
                'CARTERA040_PERSON_REFERENCE_INVALID'
            );
            const normalizedLimit = Number(limit);
            if (!Number.isInteger(normalizedLimit) || normalizedLimit < 1 || normalizedLimit > 100) {
                throw fail('CARTERA040_HISTORY_LIMIT_INVALID');
            }
            const result = await resolvedClient.rpc(
                'forge_cartera040_list_relationship_brief',
                {
                    p_payload: {
                        personReference: reference,
                        limit: normalizedLimit,
                    },
                }
            );
            if (result?.error) throw fail('CARTERA040_BRIEF_READ_FAILED', result.error);
            if (!result?.data || typeof result.data !== 'object') {
                throw fail('CARTERA040_BRIEF_RESPONSE_INVALID');
            }
            assertSanitized(result.data);
            return createCartera040RelationshipMemoryProjection(result.data);
        },

        async recordRelationshipMemory(input = {}) {
            await authenticatedUser(resolvedClient);
            const command = normalizeMemoryCommand(input);
            const payloadDigest = await CARTERA_030C_SHA256(command);
            const result = await resolvedClient.rpc(
                'forge_cartera040_record_relationship_memory',
                {
                    p_payload: {
                        ...command,
                        authorization: {
                            authorized: true,
                            payloadDigest,
                        },
                    },
                }
            );
            if (result?.error) throw fail('CARTERA040_MEMORY_RECORD_FAILED', result.error);
            if (!result?.data || typeof result.data !== 'object') {
                throw fail('CARTERA040_MEMORY_RESPONSE_INVALID');
            }
            assertSanitized(result.data);
            return deepFreeze({ ...result.data });
        },
    });
}

export {
    CARTERA_040_MEMORY_KINDS,
    CARTERA_040_SOURCE_AUTHORITIES,
};

const CARTERA_040_MEMORY_KINDS = Object.freeze([...KINDS]);
const CARTERA_040_SOURCE_AUTHORITIES = Object.freeze([...AUTHORITIES]);
