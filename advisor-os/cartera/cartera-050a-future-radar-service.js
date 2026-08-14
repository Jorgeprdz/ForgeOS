import { SupabaseRuntime } from '../../supabase-runtime.js';
import { createCartera050FutureRadarProjection } from '../../platform/portfolio-intelligence/cartera-050a-future-radar-projection.js';
import { loadCartera050Authority } from '../../platform/portfolio-intelligence/cartera-050c-authority-adapters.js';
import {
    CARTERA050_BUSINESS_TIMEZONE,
    cartera050CalendarDate,
} from '../../platform/portfolio-intelligence/cartera-050-business-calendar-date.js';

const FORBIDDEN_RESPONSE_KEYS = new Set([
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

function normalizeDate(value, now, timezone) {
    if (value == null || value === '') return cartera050CalendarDate(now, timezone);
    const normalized = String(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) throw fail('CARTERA050_AS_OF_DATE_INVALID');
    return normalized;
}

function normalizeTimezone(value) {
    const normalized = String(value || CARTERA050_BUSINESS_TIMEZONE).trim();
    if (!normalized || normalized.length > 120) throw fail('CARTERA050_TIMEZONE_INVALID');
    return normalized;
}

function assertSafe(value, path = 'response') {
    if (Array.isArray(value)) {
        value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
        if (FORBIDDEN_RESPONSE_KEYS.has(key)) {
            throw fail('CARTERA050_RESTRICTED_FIELD_EXPOSED', { path: `${path}.${key}` });
        }
        assertSafe(nested, `${path}.${key}`);
    }
}

async function authenticatedUser(client) {
    const result = await client.auth.getUser();
    if (result?.error) throw fail('CARTERA050_AUTH_LOOKUP_FAILED', result.error);
    if (!result?.data?.user?.id) throw fail('CARTERA050_AUTH_REQUIRED');
    return result.data.user;
}

export function createCartera050FutureRadarService({
    client,
    conservationProvider = null,
    compensationProvider = null,
    now = () => new Date(),
} = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();
    if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
        throw fail('CARTERA050_SUPABASE_CLIENT_INVALID');
    }
    if (typeof now !== 'function') throw fail('CARTERA050_NOW_PROVIDER_INVALID');

    return Object.freeze({
        async loadFutureRadar({ asOfDate, timezone } = {}) {
            const user = await authenticatedUser(resolvedClient);
            const normalizedTimezone = normalizeTimezone(timezone);
            const normalizedAsOfDate = normalizeDate(asOfDate, now(), normalizedTimezone);

            const nativeResult = await resolvedClient.rpc(
                'forge_cartera050_list_future_radar',
                {
                    p_payload: {
                        asOfDate: normalizedAsOfDate,
                        timezone: normalizedTimezone,
                    },
                }
            );
            if (nativeResult?.error) throw fail('CARTERA050_RADAR_READ_FAILED', nativeResult.error);
            if (!nativeResult?.data || typeof nativeResult.data !== 'object') {
                throw fail('CARTERA050_RADAR_RESPONSE_INVALID');
            }
            assertSafe(nativeResult.data);

            const context = Object.freeze({
                advisorReference: user.id,
                asOfDate: normalizedAsOfDate,
                timezone: normalizedTimezone,
                readOnly: true,
            });
            const [conservation, compensation] = await Promise.all([
                loadCartera050Authority(
                    conservationProvider,
                    'CONSERVATION_INTELLIGENCE',
                    context
                ),
                loadCartera050Authority(
                    compensationProvider,
                    'COMPENSATION_INTELLIGENCE',
                    context
                ),
            ]);

            return createCartera050FutureRadarProjection(nativeResult.data, {
                conservationSignals: conservation.signals,
                compensationSignals: compensation.signals,
                sourceAvailability: {
                    [conservation.availabilityKey]: conservation.availability,
                    [compensation.availabilityKey]: compensation.availability,
                },
            });
        },
    });
}
