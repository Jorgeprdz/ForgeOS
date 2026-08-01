import { normalizeCartera050FutureItem } from './cartera-050a-future-radar-projection.js';

const AUTHORITY_CONFIG = Object.freeze({
    CONSERVATION_INTELLIGENCE: Object.freeze({
        availabilityKey: 'conservationIntelligence',
        allowedSignalTypes: Object.freeze([
            'CONSERVATION_RISK',
            'POLICY_SERVICE_REQUIRED',
            'PERSISTENCY_REVIEW',
        ]),
    }),
    COMPENSATION_INTELLIGENCE: Object.freeze({
        availabilityKey: 'compensationIntelligence',
        allowedSignalTypes: Object.freeze([
            'EXPECTED_COMMISSION_EVENT',
            'COMPENSATION_REVIEW_REQUIRED',
        ]),
    }),
});

const FORBIDDEN_EXTERNAL_KEYS = new Set([
    'riskScore',
    'lapseProbability',
    'conservationFormula',
    'commissionFormula',
    'commissionAmount',
    'payoutAmount',
    'bankAccount',
    'paymentInstrument',
    'beneficiary',
    'beneficiaries',
    'finalPriority',
    'priorityScore',
    'finalMessage',
]);

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

function assertSafe(value, path = 'externalSignal') {
    if (Array.isArray(value)) {
        value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
        if (FORBIDDEN_EXTERNAL_KEYS.has(key)) {
            throw fail('CARTERA050_EXTERNAL_AUTHORITY_LEAK', { path: `${path}.${key}` });
        }
        assertSafe(nested, `${path}.${key}`);
    }
}

export function unavailableCartera050Authority(authority) {
    const normalized = String(authority || '').trim().toUpperCase();
    const config = AUTHORITY_CONFIG[normalized];
    if (!config) throw fail('CARTERA050_EXTERNAL_AUTHORITY_INVALID');
    return Object.freeze({
        authority: normalized,
        availabilityKey: config.availabilityKey,
        availability: 'NOT_CONNECTED',
        signals: Object.freeze([]),
    });
}

export function normalizeCartera050AuthorityEnvelope(authority, envelope = {}) {
    const normalized = String(authority || '').trim().toUpperCase();
    const config = AUTHORITY_CONFIG[normalized];
    if (!config) throw fail('CARTERA050_EXTERNAL_AUTHORITY_INVALID');
    if (!envelope || typeof envelope !== 'object') {
        throw fail('CARTERA050_EXTERNAL_ENVELOPE_INVALID');
    }

    const availability = String(envelope.availability || 'AVAILABLE').trim().toUpperCase();
    if (!['AVAILABLE', 'NOT_CONNECTED', 'UNAVAILABLE'].includes(availability)) {
        throw fail('CARTERA050_EXTERNAL_AVAILABILITY_INVALID');
    }
    if (availability !== 'AVAILABLE') {
        return Object.freeze({
            authority: normalized,
            availabilityKey: config.availabilityKey,
            availability,
            signals: Object.freeze([]),
        });
    }

    if (!Array.isArray(envelope.signals)) {
        throw fail('CARTERA050_EXTERNAL_SIGNALS_INVALID');
    }
    assertSafe(envelope.signals);

    const signals = envelope.signals.map(signal => {
        if (String(signal?.sourceAuthority || '').toUpperCase() !== normalized) {
            throw fail('CARTERA050_EXTERNAL_SOURCE_AUTHORITY_MISMATCH');
        }
        const signalType = String(signal?.signalType || '').toUpperCase();
        if (!config.allowedSignalTypes.includes(signalType)) {
            throw fail('CARTERA050_EXTERNAL_SIGNAL_TYPE_INVALID');
        }
        return normalizeCartera050FutureItem({
            ...signal,
            sourceAuthority: normalized,
            signalType,
            advisorConfirmationRequired: true,
            readOnly: true,
        });
    });

    return Object.freeze({
        authority: normalized,
        availabilityKey: config.availabilityKey,
        availability: 'AVAILABLE',
        signals: Object.freeze(signals),
    });
}

export async function loadCartera050Authority(provider, authority, context = {}) {
    if (!provider) return unavailableCartera050Authority(authority);
    const loader = typeof provider === 'function'
        ? provider
        : provider?.loadFutureSignals;
    if (typeof loader !== 'function') {
        throw fail('CARTERA050_EXTERNAL_PROVIDER_INVALID');
    }
    const envelope = await loader(context);
    return normalizeCartera050AuthorityEnvelope(authority, envelope);
}

export const CARTERA_050_EXTERNAL_AUTHORITIES = Object.freeze(Object.keys(AUTHORITY_CONFIG));
