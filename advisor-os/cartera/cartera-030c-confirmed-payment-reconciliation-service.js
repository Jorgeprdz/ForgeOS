import { SupabaseRuntime } from '../../supabase-runtime.js';
import { PAYMENT_EVIDENCE_STATES } from '../../policy-operations/evidence/payment-evidence-packet.js';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const DECISION_REFERENCE_PATTERN = /^evt_[a-f0-9]{32}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SOURCES = new Set([
    'policy_receipt',
    'payment_proof',
    'bank_proof',
    'carrier_statement',
    'manual_capture',
    'integration',
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

function optionalDate(value, code) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) throw fail(code);
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw fail(code);
    }
    return value;
}

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).sort().reduce((output, key) => {
        output[key] = stable(value[key]);
        return output;
    }, {});
}

async function sha256(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(stable(value)));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

async function authenticatedUser(client) {
    const result = await client.auth.getUser();
    if (result?.error) throw fail('CARTERA030C_AUTH_LOOKUP_FAILED', result.error);
    if (!result?.data?.user?.id) throw fail('CARTERA030C_AUTH_REQUIRED');
    return result.data.user;
}

function normalizeCommand(input = {}) {
    if (input.confirmationState !== PAYMENT_EVIDENCE_STATES.CONFIRMED) {
        throw fail('CARTERA030C_CONFIRMED_PAYMENT_EVIDENCE_REQUIRED');
    }
    const amount = Number(input.paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) throw fail('CARTERA030C_PAYMENT_AMOUNT_INVALID');
    const currency = input.currency == null || input.currency === ''
        ? null
        : String(input.currency).trim().toUpperCase();
    if (currency && !/^[A-Z]{3}$/.test(currency)) throw fail('CARTERA030C_CURRENCY_INVALID');
    const paymentSource = String(input.paymentSource || '').trim();
    if (!SOURCES.has(paymentSource)) throw fail('CARTERA030C_PAYMENT_SOURCE_INVALID');
    const periodCoveredStart = optionalDate(input.periodCoveredStart, 'CARTERA030C_PERIOD_START_INVALID');
    const periodCoveredEnd = optionalDate(input.periodCoveredEnd, 'CARTERA030C_PERIOD_END_INVALID');
    if (periodCoveredStart && periodCoveredEnd && periodCoveredStart > periodCoveredEnd) {
        throw fail('CARTERA030C_PERIOD_INVALID');
    }
    const evidenceReferences = Array.isArray(input.evidenceReferences)
        ? input.evidenceReferences.map(reference => requiredReference(
            reference,
            'CARTERA030C_EVIDENCE_REFERENCE_INVALID'
        ))
        : [];
    const recommendationDecisionReference = input.recommendationDecisionReference == null || input.recommendationDecisionReference === ''
        ? null
        : requiredReference(input.recommendationDecisionReference, 'CARTERA030C_RECOMMENDATION_DECISION_REFERENCE_INVALID', DECISION_REFERENCE_PATTERN);
    const paymentObligationReference = recommendationDecisionReference
        ? requiredReference(input.paymentObligationReference, 'CARTERA030C_PAYMENT_OBLIGATION_REFERENCE_REQUIRED')
        : null;

    return Object.freeze({
        policyReference: requiredReference(input.policyReference, 'CARTERA030C_POLICY_REFERENCE_INVALID'),
        paymentEvidenceReference: requiredReference(
            input.paymentEvidenceReference,
            'CARTERA030C_PAYMENT_EVIDENCE_REFERENCE_INVALID'
        ),
        paymentAmount: amount,
        currency,
        paymentDate: optionalDate(input.paymentDate, 'CARTERA030C_PAYMENT_DATE_INVALID'),
        periodCoveredStart,
        periodCoveredEnd,
        paymentSource,
        evidenceReferences: Object.freeze(evidenceReferences),
        confirmationState: 'CONFIRMED',
        idempotencyKey: requiredReference(
            input.idempotencyKey,
            'CARTERA030C_IDEMPOTENCY_KEY_INVALID',
            IDEMPOTENCY_PATTERN
        ),
        ...(recommendationDecisionReference ? { recommendationDecisionReference, paymentObligationReference } : {}),
    });
}

export function createCartera030cConfirmedPaymentReconciliationService({ client } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();
    if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
        throw fail('CARTERA030C_SUPABASE_CLIENT_INVALID');
    }

    return Object.freeze({
        async reconcileConfirmedPayment(input = {}) {
            await authenticatedUser(resolvedClient);
            const command = normalizeCommand(input);
            const payloadDigest = await sha256(command);
            const result = await resolvedClient.rpc(
                'forge_cartera030c_record_and_reconcile_confirmed_payment',
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
            if (result?.error) {
                throw fail('CARTERA030C_RECONCILIATION_FAILED', result.error);
            }
            if (!result?.data || typeof result.data !== 'object') {
                throw fail('CARTERA030C_RECONCILIATION_RESPONSE_INVALID');
            }
            return Object.freeze({ ...result.data });
        },
    });
}

export const CARTERA_030C_STABLE = stable;
export const CARTERA_030C_SHA256 = sha256;
