import {
  CARTERA_030B_OBLIGATION_STATES,
} from '../../../policy-operations/calendar/cartera-030b-recurrence-engine.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TERMINAL_STATES = new Set([
  CARTERA_030B_OBLIGATION_STATES.CONFIRMED,
  CARTERA_030B_OBLIGATION_STATES.CORRECTED,
  CARTERA_030B_OBLIGATION_STATES.CANCELLED,
]);

function requireReference(value, label) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized || normalized.length > 240) {
    throw new TypeError(`${label}_INVALID`);
  }
  return normalized;
}

function parseDate(value, label) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new TypeError(`${label}_INVALID`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new TypeError(`${label}_INVALID`);
  }
  return parsed;
}

function dateString(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function deriveReadStatus(obligation, asOfDate) {
  if (TERMINAL_STATES.has(obligation.status)) {
    return obligation.status;
  }
  if (obligation.status === CARTERA_030B_OBLIGATION_STATES.PARTIAL) {
    return obligation.status;
  }
  if (obligation.status === CARTERA_030B_OBLIGATION_STATES.CONFIRMATION_REQUIRED) {
    return obligation.status;
  }
  if (!obligation.expectedDate) {
    return obligation.status;
  }
  if (obligation.expectedDate < asOfDate) {
    return CARTERA_030B_OBLIGATION_STATES.OVERDUE;
  }
  const nextThirty = dateString(addDays(parseDate(asOfDate, 'AS_OF_DATE'), 30));
  if (obligation.expectedDate <= nextThirty) {
    return CARTERA_030B_OBLIGATION_STATES.UPCOMING;
  }
  return CARTERA_030B_OBLIGATION_STATES.SCHEDULED;
}

function sanitizeObligation(obligation, asOfDate, advisorId) {
  if (!obligation || typeof obligation !== 'object' || Array.isArray(obligation)) {
    throw new TypeError('OBLIGATION_MUST_BE_OBJECT');
  }
  if (requireReference(obligation.advisorId, 'OBLIGATION_ADVISOR_ID') !== advisorId) {
    throw new TypeError('CROSS_ADVISOR_OBLIGATION_FORBIDDEN');
  }
  const expectedDate = obligation.expectedDate || null;
  if (expectedDate) {
    parseDate(expectedDate, 'EXPECTED_DATE');
  }
  const status = deriveReadStatus(obligation, asOfDate);
  const explanation = (() => {
    if (status === CARTERA_030B_OBLIGATION_STATES.OVERDUE) {
      return 'Fecha esperada vencida sin satisfacción confirmada. No implica cancelación ni pérdida de cobertura.';
    }
    if (status === CARTERA_030B_OBLIGATION_STATES.CONFIRMATION_REQUIRED) {
      return 'Existe evidencia candidata pendiente de confirmación.';
    }
    if (status === CARTERA_030B_OBLIGATION_STATES.PARTIAL) {
      return 'Existe un pago confirmado parcial respecto del monto esperado.';
    }
    if (status === CARTERA_030B_OBLIGATION_STATES.CONFIRMED) {
      return 'La obligación fue satisfecha por un PaymentEvent confirmado.';
    }
    return 'Fecha derivada de términos de póliza confirmados.';
  })();

  return Object.freeze({
    itemReference: requireReference(obligation.obligationReference, 'OBLIGATION_REFERENCE'),
    sourceType: 'EXPECTED_PAYMENT_OBLIGATION',
    sourceReference: obligation.obligationReference,
    policyReference: requireReference(obligation.policyReference, 'POLICY_REFERENCE'),
    policyVersionReference: requireReference(
      obligation.policyVersionReference,
      'POLICY_VERSION_REFERENCE'
    ),
    obligationKind: obligation.obligationKind || 'PREMIUM_PAYMENT',
    date: expectedDate,
    dateConfidence: expectedDate ? 'DERIVED_FROM_CONFIRMED_TERMS' : 'UNKNOWN',
    dateAuthority: obligation.dateAuthority || 'CONFIRMED_POLICY_TERMS_DERIVED',
    status,
    ledgerStatus: obligation.status,
    expectedAmount: obligation.expectedAmount ?? null,
    currency: obligation.currency ?? null,
    actualDate: obligation.actualDate ?? null,
    actualAmount: obligation.actualAmount ?? null,
    policyYear: obligation.policyYear ?? null,
    sequenceNumber: obligation.sequenceNumber ?? null,
    title: 'Pago esperado de póliza',
    explanation,
  });
}

function inRange(item, start, end) {
  return Boolean(item.date && item.date >= start && item.date <= end);
}

function sortItems(items) {
  return Object.freeze([...items].sort((left, right) => {
    const leftDate = left.date || '9999-12-31';
    const rightDate = right.date || '9999-12-31';
    return leftDate.localeCompare(rightDate)
      || left.itemReference.localeCompare(right.itemReference);
  }));
}

export function createPolicyCalendarProjection({
  advisorId,
  obligations = [],
  asOfDate,
  timezone,
} = {}) {
  const owner = requireReference(advisorId, 'ADVISOR_ID');
  const normalizedTimezone = requireReference(timezone, 'TIMEZONE');
  const asOf = dateString(parseDate(asOfDate, 'AS_OF_DATE'));
  if (!Array.isArray(obligations)) {
    throw new TypeError('OBLIGATIONS_MUST_BE_ARRAY');
  }

  const items = sortItems(obligations.map(obligation =>
    sanitizeObligation(obligation, asOf, owner)
  ));
  const asOfObject = parseDate(asOf, 'AS_OF_DATE');
  const day7 = dateString(addDays(asOfObject, 7));
  const day30 = dateString(addDays(asOfObject, 30));
  const day90 = dateString(addDays(asOfObject, 90));

  const horizons = Object.freeze({
    TODAY: sortItems(items.filter(item => item.date === asOf)),
    NEXT_7_DAYS: sortItems(items.filter(item => inRange(item, asOf, day7))),
    NEXT_30_DAYS: sortItems(items.filter(item => inRange(item, asOf, day30))),
    NEXT_90_DAYS: sortItems(items.filter(item => inRange(item, asOf, day90))),
    OVERDUE: sortItems(items.filter(item =>
      item.status === CARTERA_030B_OBLIGATION_STATES.OVERDUE
    )),
    CONFIRMATION_REQUIRED: sortItems(items.filter(item =>
      item.status === CARTERA_030B_OBLIGATION_STATES.CONFIRMATION_REQUIRED
    )),
  });

  return Object.freeze({
    contractType: 'FORGE_CARTERA_POLICY_CALENDAR_PROJECTION',
    contractVersion: 'CARTERA-030B.1',
    advisorId: owner,
    timezone: normalizedTimezone,
    asOfDate: asOf,
    items,
    horizons,
  });
}
