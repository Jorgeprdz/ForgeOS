import { SupabaseRuntime } from '../../supabase-runtime.js';

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

function normalizeDate(value) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!DATE_PATTERN.test(normalized)) throw fail('CARTERA030D_AS_OF_DATE_INVALID');
    return normalized;
}

function normalizePolicyReference(value) {
    if (value === null || value === undefined || value === '') return null;
    const normalized = String(value).trim();
    if (!REFERENCE_PATTERN.test(normalized)) throw fail('CARTERA030D_POLICY_REFERENCE_INVALID');
    return normalized;
}

function todayInTimezone(timezone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${byType.year}-${byType.month}-${byType.day}`;
}

async function authenticatedUser(client) {
    const result = await client.auth.getUser();
    if (result?.error) throw fail('CARTERA030D_AUTH_LOOKUP_FAILED', result.error);
    if (!result?.data?.user?.id) throw fail('CARTERA030D_AUTH_REQUIRED');
    return result.data.user;
}

function validateResponse(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw fail('CARTERA030D_RESPONSE_INVALID');
    }
    if (!Array.isArray(data.items) || !data.summary || typeof data.summary !== 'object') {
        throw fail('CARTERA030D_RESPONSE_INVALID');
    }
    const serialized = JSON.stringify(data).toLowerCase();
    if (/(beneficiary|bank_account|clabe|card_number|payment_token|evidence_references)/.test(serialized)) {
        throw fail('CARTERA030D_PRIVACY_BOUNDARY_VIOLATION');
    }
    return Object.freeze({
        ...data,
        summary: Object.freeze({ ...data.summary }),
        items: Object.freeze(data.items.map(item => Object.freeze({ ...item }))),
    });
}

export function createCartera030dPolicyPaymentCalendarService({ client } = {}) {
    const resolvedClient = client || SupabaseRuntime.getClient();
    if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
        throw fail('CARTERA030D_SUPABASE_CLIENT_INVALID');
    }

    return Object.freeze({
        async loadCalendar({
            policyReference = null,
            asOfDate = null,
            timezone = 'America/Mexico_City',
        } = {}) {
            await authenticatedUser(resolvedClient);
            const resolvedTimezone = String(timezone || 'America/Mexico_City').trim();
            if (!resolvedTimezone || resolvedTimezone.length > 120) {
                throw fail('CARTERA030D_TIMEZONE_INVALID');
            }
            const resolvedAsOfDate = normalizeDate(asOfDate || todayInTimezone(resolvedTimezone));
            const result = await resolvedClient.rpc(
                'forge_cartera030d_list_policy_payment_calendar',
                {
                    p_payload: {
                        policyReference: normalizePolicyReference(policyReference),
                        asOfDate: resolvedAsOfDate,
                        timezone: resolvedTimezone,
                    },
                }
            );
            if (result?.error) throw fail('CARTERA030D_CALENDAR_READ_FAILED', result.error);
            return validateResponse(result?.data);
        },
    });
}
