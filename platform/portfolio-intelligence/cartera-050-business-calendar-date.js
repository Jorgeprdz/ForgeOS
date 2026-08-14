export const CARTERA050_BUSINESS_TIMEZONE = 'America/Mexico_City';

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

function validInstant(value) {
    const instant = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(instant.getTime())) throw fail('CARTERA050_NOW_INVALID');
    return instant;
}

export function cartera050CalendarDate(
    now = new Date(),
    timezone = CARTERA050_BUSINESS_TIMEZONE,
) {
    const normalizedTimezone = String(timezone || '').trim();
    if (!normalizedTimezone || normalizedTimezone.length > 120) {
        throw fail('CARTERA050_TIMEZONE_INVALID');
    }

    let parts;
    try {
        parts = new Intl.DateTimeFormat('en-US', {
            timeZone: normalizedTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(validInstant(now));
    } catch (error) {
        if (error?.code === 'CARTERA050_NOW_INVALID') throw error;
        throw fail('CARTERA050_TIMEZONE_INVALID', error);
    }

    const fields = Object.fromEntries(
        parts
            .filter(part => ['year', 'month', 'day'].includes(part.type))
            .map(part => [part.type, part.value]),
    );
    if (!/^\d{4}$/.test(fields.year || '')
        || !/^\d{2}$/.test(fields.month || '')
        || !/^\d{2}$/.test(fields.day || '')) {
        throw fail('CARTERA050_CALENDAR_DATE_FORMAT_INVALID');
    }
    return `${fields.year}-${fields.month}-${fields.day}`;
}
