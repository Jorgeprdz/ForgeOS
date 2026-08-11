const ALLOWED_TRUTH_CLASSES = new Set([
    'CONFIRMED_MEMORY',
    'CONFIRMED_SENSITIVE_CONTEXT',
    'CONFIRMED_EVENT',
    'CONFIRMED_POLICY_FACT',
    'CONFIRMED_PAYMENT_EVENT',
]);

const ALLOWED_CONTEXT_USE = new Set([
    'GENERAL_RELATIONSHIP',
    'SERVICE_ONLY',
    'CONVERSATION_PREPARATION',
]);

function fail(code) {
    const error = new Error(code);
    error.code = code;
    return error;
}

function safeText(value, fallback = '', maxLength = 500) {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text ? text.slice(0, maxLength) : fallback;
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function safeIso(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function normalizeEvent(item = {}) {
    const truthClass = safeText(item.truthClass, 'CONFIRMED_EVENT', 80).toUpperCase();
    if (!ALLOWED_TRUTH_CLASSES.has(truthClass)) {
        throw fail('CARTERA040_TRUTH_CLASS_INVALID');
    }
    const contextUse = safeText(item.contextUse, 'GENERAL_RELATIONSHIP', 80).toUpperCase();
    if (!ALLOWED_CONTEXT_USE.has(contextUse)) {
        throw fail('CARTERA040_CONTEXT_USE_INVALID');
    }
    if (item.salesTrigger === true) {
        throw fail('CARTERA040_AUTOMATIC_SALES_TRIGGER_FORBIDDEN');
    }

    return Object.freeze({
        eventType: safeText(item.eventType, 'RELATIONSHIP_EVENT', 120).toUpperCase(),
        title: safeText(item.title, 'Actividad de relación', 160),
        summary: safeText(item.summary, 'Sin detalle adicional.', 500),
        occurredAt: safeIso(item.occurredAt),
        sourceAuthority: safeText(item.sourceAuthority, 'UNKNOWN', 120).toUpperCase(),
        sourceRecordReference: safeText(item.sourceRecordReference, '', 240) || null,
        truthClass,
        consentState: safeText(item.consentState, 'NOT_APPLICABLE', 80).toUpperCase(),
        contextUse,
        salesTrigger: false,
    });
}

function normalizeMemory(item = {}) {
    const event = normalizeEvent({
        ...item,
        eventType: item.kind || item.eventType || 'RELATIONSHIP_MEMORY',
        title: item.kind || item.title || 'Memoria de relación',
        truthClass: item.truthClass || 'CONFIRMED_MEMORY',
    });
    return Object.freeze({
        memoryReference: safeText(item.memoryReference, '', 240) || null,
        kind: safeText(item.kind || event.eventType, 'RELATIONSHIP_MEMORY', 120).toUpperCase(),
        summary: event.summary,
        valueCode: safeText(item.valueCode, '', 120) || null,
        occurredAt: event.occurredAt,
        sourceAuthority: event.sourceAuthority,
        consentState: event.consentState,
        contextUse: event.contextUse,
        truthClass: event.truthClass,
        salesTrigger: false,
    });
}

function normalizeNetwork(raw = {}) {
    const accounts = safeArray(raw.accounts).map(item => Object.freeze({
        accountReference: safeText(item.accountReference, '', 240) || null,
        displayLabel: safeText(item.displayLabel, 'Cuenta', 240),
        accountType: safeText(item.accountType, 'UNKNOWN', 80).toUpperCase(),
        relationshipRole: safeText(item.relationshipRole, 'RELATIONSHIP', 120).toUpperCase(),
        confirmationState: safeText(item.confirmationState, 'CONFIRMED', 80).toUpperCase(),
    }));
    const policies = safeArray(raw.policies).map(item => Object.freeze({
        policyReference: safeText(item.policyReference, '', 240) || null,
        carrierReference: safeText(item.carrierReference, 'Compañía desconocida', 240),
        productReference: safeText(item.productReference, 'Producto desconocido', 240),
        status: safeText(item.status, 'UNKNOWN', 80).toUpperCase(),
        statusAsOf: safeIso(item.statusAsOf),
        roleType: safeText(item.roleType, 'POLICY_PARTICIPANT', 120).toUpperCase(),
    }));
    return Object.freeze({ accounts: Object.freeze(accounts), policies: Object.freeze(policies) });
}

export function createCartera040RelationshipMemoryProjection(raw = {}) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw fail('CARTERA040_PROJECTION_INPUT_INVALID');
    }
    const boundaries = raw.boundaries || {};
    const prohibited = [
        boundaries.lifeContextIsSalesTrigger,
        boundaries.automaticOpportunityCreation,
        boundaries.automaticContactExecution,
        boundaries.finalMessageGeneration,
        boundaries.rawEvidenceExposed,
        boundaries.beneficiaryDataExposed,
        boundaries.paymentInstrumentDataExposed,
    ];
    if (prohibited.some(Boolean)) {
        throw fail('CARTERA040_BOUNDARY_VIOLATION');
    }

    const history = safeArray(raw.history)
        .map(normalizeEvent)
        .sort((left, right) => {
            const a = left.occurredAt ? Date.parse(left.occurredAt) : 0;
            const b = right.occurredAt ? Date.parse(right.occurredAt) : 0;
            return b - a;
        });
    const preferences = safeArray(raw.preferences).map(normalizeMemory);
    const commitments = safeArray(raw.commitments).map(normalizeMemory);
    const lifeContext = safeArray(raw.lifeContext).map(item => {
        const memory = normalizeMemory({
            ...item,
            kind: 'LIFE_CONTEXT',
            truthClass: 'CONFIRMED_SENSITIVE_CONTEXT',
        });
        if (memory.consentState !== 'CONFIRMED') {
            throw fail('CARTERA040_UNCONFIRMED_LIFE_CONTEXT_EXPOSED');
        }
        return memory;
    });

    const person = raw.person || {};
    const network = normalizeNetwork(raw.network);
    const summary = raw.summary || {};
    const projection = {
        person: Object.freeze({
            personReference: safeText(person.personReference, '', 240),
            displayName: safeText(person.displayName, 'Persona', 240),
            preferredName: safeText(person.preferredName, '', 160) || null,
            lifecycleState: safeText(person.lifecycleState, 'UNKNOWN', 80).toUpperCase(),
            privacyClassification: safeText(
                person.privacyClassification,
                'PRIVATE',
                80
            ).toUpperCase(),
        }),
        summary: Object.freeze({
            lastInteractionAt: safeIso(summary.lastInteractionAt),
            accountCount: Number(summary.accountCount || network.accounts.length),
            activePolicyCount: Number(summary.activePolicyCount || network.policies.length),
            preferenceCount: Number(summary.preferenceCount || preferences.length),
            openCommitmentCount: Number(summary.openCommitmentCount || commitments.length),
            confirmedLifeContextCount: Number(
                summary.confirmedLifeContextCount || lifeContext.length
            ),
            historyCount: Number(summary.historyCount || history.length),
        }),
        network,
        preferences: Object.freeze(preferences),
        commitments: Object.freeze(commitments),
        lifeContext: Object.freeze(lifeContext),
        history: Object.freeze(history),
        readiness: Object.freeze({
            hasRelationshipContext: history.length > 0,
            requiresAdvisorReview: commitments.length > 0 || lifeContext.length > 0,
            canGenerateFinalMessage: false,
            canExecuteContact: false,
            canCreateOpportunity: false,
            lifeContextIsSalesTrigger: false,
        }),
        boundaries: Object.freeze({
            lifeContextIsSalesTrigger: false,
            automaticOpportunityCreation: false,
            automaticContactExecution: false,
            finalMessageGeneration: false,
            rawEvidenceExposed: false,
            beneficiaryDataExposed: false,
            paymentInstrumentDataExposed: false,
            advisorConfirmationRequired: true,
        }),
        projectionAuthority: 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
        readOnly: true,
    };

    if (!projection.person.personReference) {
        throw fail('CARTERA040_PERSON_REFERENCE_MISSING');
    }
    return deepFreeze(projection);
}
