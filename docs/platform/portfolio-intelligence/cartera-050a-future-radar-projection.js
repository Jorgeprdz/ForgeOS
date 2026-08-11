const HORIZONS = Object.freeze([
    'CONFIRMATION_REQUIRED',
    'OVERDUE',
    'TODAY',
    'NEXT_7_DAYS',
    'NEXT_30_DAYS',
    'NEXT_90_DAYS',
]);

const TRUTH_CLASSES = Object.freeze([
    'CONFIRMED_FACT',
    'SCHEDULED_EVENT',
    'DETECTED_EVIDENCE',
    'INFERENCE',
    'RECOMMENDATION',
]);

const SOURCE_AUTHORITIES = Object.freeze([
    'PAYMENT_OBLIGATION',
    'POLICY_INTELLIGENCE',
    'RELATIONSHIP_MEMORY',
    'DOCUMENT_INTAKE',
    'CONSERVATION_INTELLIGENCE',
    'COMPENSATION_INTELLIGENCE',
]);

const HORIZON_RANK = Object.freeze(Object.fromEntries(HORIZONS.map((value, index) => [value, index])));
const REQUIRED_EXPLANATION_FIELDS = Object.freeze([
    'whyThisPerson',
    'whyNow',
    'evidenceSummary',
    'uncertainty',
    'smallestUsefulAction',
    'advisorConfirmationRequired',
]);
const FORBIDDEN_KEYS = new Set([
    'rawEvidence',
    'evidenceReferences',
    'providerRequest',
    'providerResponse',
    'beneficiary',
    'beneficiaries',
    'paymentInstrument',
    'bankAccount',
    'commissionFormula',
    'conservationFormula',
    'riskScore',
    'lapseProbability',
    'finalMessage',
    'priorityScore',
]);

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

function stringValue(value, code, max = 500) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized || normalized.length > max) throw fail(code);
    return normalized;
}

function optionalString(value, max = 240) {
    if (value == null || value === '') return null;
    const normalized = String(value).trim();
    if (!normalized || normalized.length > max) throw fail('CARTERA050_OPTIONAL_TEXT_INVALID');
    return normalized;
}

function enumValue(value, allowed, code) {
    const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
    if (!allowed.includes(normalized)) throw fail(code);
    return normalized;
}

function dateValue(value, code) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) throw fail(code);
    const date = new Date(`${normalized}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) throw fail(code);
    return normalized;
}

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function assertNoForbiddenKeys(value, path = 'radar') {
    if (Array.isArray(value)) {
        value.forEach((entry, index) => assertNoForbiddenKeys(entry, `${path}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
        if (FORBIDDEN_KEYS.has(key)) {
            throw fail('CARTERA050_RESTRICTED_FIELD_EXPOSED', { path: `${path}.${key}` });
        }
        assertNoForbiddenKeys(nested, `${path}.${key}`);
    }
}

function normalizeEvidenceSummary(value) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 8) {
        throw fail('CARTERA050_EVIDENCE_SUMMARY_INVALID');
    }
    return Object.freeze(value.map(entry => stringValue(
        entry,
        'CARTERA050_EVIDENCE_SUMMARY_ITEM_INVALID',
        240
    )));
}

export function normalizeCartera050FutureItem(input = {}) {
    assertNoForbiddenKeys(input, 'input');
    for (const field of REQUIRED_EXPLANATION_FIELDS) {
        if (!(field in input)) throw fail(`CARTERA050_EXPLANATION_${field.toUpperCase()}_MISSING`);
    }

    const advisorConfirmationRequired = input.advisorConfirmationRequired;
    if (advisorConfirmationRequired !== true) {
        throw fail('CARTERA050_ADVISOR_CONFIRMATION_REQUIRED');
    }

    const item = {
        signalReference: stringValue(input.signalReference, 'CARTERA050_SIGNAL_REFERENCE_INVALID', 240),
        personReference: optionalString(input.personReference),
        personDisplayName: optionalString(input.personDisplayName, 160),
        policyReference: optionalString(input.policyReference),
        signalType: stringValue(input.signalType, 'CARTERA050_SIGNAL_TYPE_INVALID', 120).toUpperCase(),
        eventDate: dateValue(input.eventDate, 'CARTERA050_EVENT_DATE_INVALID'),
        horizon: enumValue(input.horizon, HORIZONS, 'CARTERA050_HORIZON_INVALID'),
        truthClass: enumValue(input.truthClass, TRUTH_CLASSES, 'CARTERA050_TRUTH_CLASS_INVALID'),
        sourceAuthority: enumValue(
            input.sourceAuthority,
            SOURCE_AUTHORITIES,
            'CARTERA050_SOURCE_AUTHORITY_INVALID'
        ),
        sourceRecordReference: stringValue(
            input.sourceRecordReference,
            'CARTERA050_SOURCE_RECORD_REFERENCE_INVALID',
            240
        ),
        whyThisPerson: stringValue(input.whyThisPerson, 'CARTERA050_WHY_PERSON_INVALID'),
        whyNow: stringValue(input.whyNow, 'CARTERA050_WHY_NOW_INVALID'),
        evidenceSummary: normalizeEvidenceSummary(input.evidenceSummary),
        uncertainty: stringValue(input.uncertainty, 'CARTERA050_UNCERTAINTY_INVALID'),
        smallestUsefulAction: stringValue(
            input.smallestUsefulAction,
            'CARTERA050_SMALLEST_ACTION_INVALID'
        ),
        advisorConfirmationRequired: true,
        readOnly: true,
    };

    assertNoForbiddenKeys(item);
    return deepFreeze(item);
}

function normalizeAvailability(input = {}) {
    const allowed = new Set(['AVAILABLE', 'NOT_CONNECTED', 'ADAPTER_REQUIRED', 'UNAVAILABLE']);
    const output = {};
    for (const authority of [
        'policyPayment',
        'relationshipMemory',
        'documentIntake',
        'conservationIntelligence',
        'compensationIntelligence',
    ]) {
        const value = String(input?.[authority] || 'UNAVAILABLE').toUpperCase();
        if (!allowed.has(value)) throw fail('CARTERA050_SOURCE_AVAILABILITY_INVALID');
        output[authority] = value;
    }
    return deepFreeze(output);
}

function sortItems(a, b) {
    const horizon = HORIZON_RANK[a.horizon] - HORIZON_RANK[b.horizon];
    if (horizon !== 0) return horizon;
    const date = a.eventDate.localeCompare(b.eventDate);
    if (date !== 0) return date;
    return a.signalReference.localeCompare(b.signalReference);
}

function deduplicate(items) {
    const seen = new Set();
    return items.filter(item => {
        if (seen.has(item.signalReference)) return false;
        seen.add(item.signalReference);
        return true;
    });
}

function summarize(items) {
    const byHorizon = Object.fromEntries(HORIZONS.map(horizon => [horizon, 0]));
    const byTruthClass = Object.fromEntries(TRUTH_CLASSES.map(truthClass => [truthClass, 0]));
    for (const item of items) {
        byHorizon[item.horizon] += 1;
        byTruthClass[item.truthClass] += 1;
    }
    return deepFreeze({
        total: items.length,
        byHorizon,
        byTruthClass,
    });
}

export function createCartera050FutureRadarProjection(
    nativeEnvelope = {},
    { conservationSignals = [], compensationSignals = [], sourceAvailability = {} } = {}
) {
    if (!nativeEnvelope || typeof nativeEnvelope !== 'object') {
        throw fail('CARTERA050_NATIVE_ENVELOPE_INVALID');
    }
    if (nativeEnvelope.readOnly !== true) throw fail('CARTERA050_READ_ONLY_REQUIRED');

    const nativeItems = Array.isArray(nativeEnvelope.items) ? nativeEnvelope.items : [];
    const allItems = deduplicate([
        ...nativeItems,
        ...conservationSignals,
        ...compensationSignals,
    ].map(normalizeCartera050FutureItem)).sort(sortItems);

    const boundaries = {
        automaticContact: false,
        automaticOpportunity: false,
        finalMessageGeneration: false,
        lapseInference: false,
        compensationCalculation: false,
        conservationFormulaOwnership: false,
        finalPriorityTruth: false,
        humanConfirmationRequired: true,
        ...(nativeEnvelope.boundaries || {}),
    };
    const requiredFalse = [
        'automaticContact',
        'automaticOpportunity',
        'finalMessageGeneration',
        'lapseInference',
        'compensationCalculation',
        'conservationFormulaOwnership',
        'finalPriorityTruth',
    ];
    for (const key of requiredFalse) {
        if (boundaries[key] !== false) throw fail(`CARTERA050_BOUNDARY_${key.toUpperCase()}_INVALID`);
    }
    if (boundaries.humanConfirmationRequired !== true) {
        throw fail('CARTERA050_HUMAN_CONFIRMATION_BOUNDARY_INVALID');
    }

    const result = {
        asOfDate: dateValue(nativeEnvelope.asOfDate, 'CARTERA050_AS_OF_DATE_INVALID'),
        timezone: stringValue(nativeEnvelope.timezone, 'CARTERA050_TIMEZONE_INVALID', 120),
        items: allItems,
        focusItems: allItems.slice(0, 12),
        summary: summarize(allItems),
        sourceAvailability: normalizeAvailability({
            ...(nativeEnvelope.sourceAvailability || {}),
            ...sourceAvailability,
        }),
        readOnly: true,
        boundaries: deepFreeze(boundaries),
        presentationOrderAuthority: 'DETERMINISTIC_HORIZON_ORDER_NOT_NBA_PRIORITY',
    };

    assertNoForbiddenKeys(result);
    return deepFreeze(result);
}

export {
    HORIZONS as CARTERA_050_HORIZONS,
    TRUTH_CLASSES as CARTERA_050_TRUTH_CLASSES,
    SOURCE_AUTHORITIES as CARTERA_050_SOURCE_AUTHORITIES,
};
