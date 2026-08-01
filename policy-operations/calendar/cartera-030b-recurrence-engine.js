const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export const CARTERA_030B_PAYMENT_FREQUENCIES = Object.freeze({
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMIANNUAL: 'SEMIANNUAL',
  ANNUAL: 'ANNUAL',
  SINGLE: 'SINGLE',
  OTHER: 'OTHER',
  UNKNOWN: 'UNKNOWN',
});

export const CARTERA_030B_AMOUNT_SEMANTICS = Object.freeze({
  PER_OCCURRENCE: 'PER_OCCURRENCE',
  UNKNOWN: 'UNKNOWN',
});

export const CARTERA_030B_OBLIGATION_STATES = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  UPCOMING: 'UPCOMING',
  DETECTED: 'DETECTED',
  CONFIRMATION_REQUIRED: 'CONFIRMATION_REQUIRED',
  CONFIRMED: 'CONFIRMED',
  PARTIAL: 'PARTIAL',
  OVERDUE: 'OVERDUE',
  NOT_FOUND: 'NOT_FOUND',
  CORRECTED: 'CORRECTED',
  CANCELLED: 'CANCELLED',
});

export const CARTERA_030B_CONFIRMATION_STATES = Object.freeze({
  SCHEDULE_DERIVED: 'SCHEDULE_DERIVED',
  EVIDENCE_PENDING: 'EVIDENCE_PENDING',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  UNKNOWN: 'UNKNOWN',
});

const MONTH_INTERVALS = Object.freeze({
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMIANNUAL: 6,
  ANNUAL: 12,
});

function requireReference(value, label) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized || normalized.length > 240) {
    throw new TypeError(`${label}_INVALID`);
  }
  return normalized;
}

function optionalReference(value, label) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return requireReference(value, label);
}

function requireDigest(value, label) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw new TypeError(`${label}_INVALID`);
  }
  return value;
}

function uniqueReferences(values = []) {
  if (!Array.isArray(values)) {
    throw new TypeError('SOURCE_EVIDENCE_REFERENCES_MUST_BE_ARRAY');
  }
  return Object.freeze([
    ...new Set(values.map(value => requireReference(value, 'SOURCE_EVIDENCE_REFERENCE'))),
  ]);
}

function parseLocalDate(value, label) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new TypeError(`${label}_INVALID`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new TypeError(`${label}_INVALID`);
  }
  return Object.freeze({ year, month, day, value });
}

function formatLocalDate({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function compareLocalDates(left, right) {
  return left.value.localeCompare(right.value);
}

function monthEnd(date) {
  return date.day === daysInMonth(date.year, date.month);
}

export function addMonthsClamped(anchorDate, monthsToAdd) {
  const anchor = typeof anchorDate === 'string'
    ? parseLocalDate(anchorDate, 'ANCHOR_DATE')
    : anchorDate;
  if (!Number.isInteger(monthsToAdd) || monthsToAdd < 0) {
    throw new TypeError('MONTHS_TO_ADD_INVALID');
  }

  const absoluteMonth = (anchor.year * 12 + (anchor.month - 1)) + monthsToAdd;
  const year = Math.floor(absoluteMonth / 12);
  const month = (absoluteMonth % 12) + 1;
  const lastDay = daysInMonth(year, month);
  const day = monthEnd(anchor) ? lastDay : Math.min(anchor.day, lastDay);
  return formatLocalDate({ year, month, day });
}

function stableJson(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createExpectedPaymentObligationReference({
  advisorId,
  policyReference,
  policyVersionReference,
  policyTermsDigest,
  obligationKind = 'PREMIUM_PAYMENT',
  expectedDate,
  sequenceNumber,
  paymentFrequency,
  scheduleRuleReference = null,
}) {
  const identity = {
    advisorId: requireReference(advisorId, 'ADVISOR_ID'),
    policyReference: requireReference(policyReference, 'POLICY_REFERENCE'),
    policyVersionReference: requireReference(policyVersionReference, 'POLICY_VERSION_REFERENCE'),
    policyTermsDigest: requireDigest(policyTermsDigest, 'POLICY_TERMS_DIGEST'),
    obligationKind: requireReference(obligationKind, 'OBLIGATION_KIND'),
    expectedDate: parseLocalDate(expectedDate, 'EXPECTED_DATE').value,
    sequenceNumber,
    paymentFrequency: requireReference(paymentFrequency, 'PAYMENT_FREQUENCY'),
    scheduleRuleReference: optionalReference(scheduleRuleReference, 'SCHEDULE_RULE_REFERENCE'),
  };

  if (!Number.isInteger(sequenceNumber) || sequenceNumber < 1) {
    throw new TypeError('SEQUENCE_NUMBER_INVALID');
  }

  return `PAYMENT_OBLIGATION:${await sha256Hex(stableJson(identity))}`;
}

function normalizePremiumAmount(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new TypeError('PREMIUM_AMOUNT_INVALID');
  }
  return number;
}

function normalizeCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !CURRENCY_PATTERN.test(value)) {
    throw new TypeError('CURRENCY_INVALID');
  }
  return value;
}

function calculatePolicyYear(anchor, dueDate) {
  const due = parseLocalDate(dueDate, 'DUE_DATE');
  let years = due.year - anchor.year;
  const anniversary = addMonthsClamped(anchor, years * 12);
  if (due.value < anniversary) {
    years -= 1;
  }
  return Math.max(1, years + 1);
}

function blockedResult(reason, warnings = []) {
  return Object.freeze({
    generationState: 'BLOCKED',
    reason,
    obligations: Object.freeze([]),
    warnings: Object.freeze([...warnings]),
  });
}

export async function generateExpectedPaymentObligationCandidates({
  advisorId,
  policyReference,
  policyVersionReference,
  policyTermsDigest,
  anchorDate = null,
  coverageEndDate = null,
  generationHorizonDate,
  paymentFrequency = CARTERA_030B_PAYMENT_FREQUENCIES.UNKNOWN,
  premiumAmount = null,
  currency = null,
  amountSemantics = CARTERA_030B_AMOUNT_SEMANTICS.UNKNOWN,
  scheduleRuleReference = null,
  sourceEvidenceReferences = [],
  timezone,
  obligationKind = 'PREMIUM_PAYMENT',
  maxOccurrences = 600,
} = {}) {
  const owner = requireReference(advisorId, 'ADVISOR_ID');
  const policy = requireReference(policyReference, 'POLICY_REFERENCE');
  const version = requireReference(policyVersionReference, 'POLICY_VERSION_REFERENCE');
  const digest = requireDigest(policyTermsDigest, 'POLICY_TERMS_DIGEST');
  const horizon = parseLocalDate(generationHorizonDate, 'GENERATION_HORIZON_DATE');
  const normalizedTimezone = requireReference(timezone, 'TIMEZONE');
  const evidenceReferences = uniqueReferences(sourceEvidenceReferences);
  const ruleReference = optionalReference(scheduleRuleReference, 'SCHEDULE_RULE_REFERENCE');
  const amount = normalizePremiumAmount(premiumAmount);
  const normalizedCurrency = normalizeCurrency(currency);

  if (!anchorDate) {
    return blockedResult('UNKNOWN_ANCHOR_DATE', ['No due dates were guessed.']);
  }
  const anchor = parseLocalDate(anchorDate, 'ANCHOR_DATE');
  const coverageEnd = coverageEndDate
    ? parseLocalDate(coverageEndDate, 'COVERAGE_END_DATE')
    : null;

  if (compareLocalDates(horizon, anchor) < 0) {
    return Object.freeze({
      generationState: 'COMPLETE',
      reason: 'HORIZON_BEFORE_ANCHOR',
      obligations: Object.freeze([]),
      warnings: Object.freeze([]),
    });
  }

  if (!Number.isInteger(maxOccurrences) || maxOccurrences < 1 || maxOccurrences > 1200) {
    throw new TypeError('MAX_OCCURRENCES_INVALID');
  }

  if (
    paymentFrequency === CARTERA_030B_PAYMENT_FREQUENCIES.UNKNOWN
    || paymentFrequency === CARTERA_030B_PAYMENT_FREQUENCIES.OTHER
    || !Object.values(CARTERA_030B_PAYMENT_FREQUENCIES).includes(paymentFrequency)
  ) {
    return blockedResult('UNKNOWN_PAYMENT_FREQUENCY', ['No recurrence was guessed.']);
  }

  if (!Object.values(CARTERA_030B_AMOUNT_SEMANTICS).includes(amountSemantics)) {
    throw new TypeError('AMOUNT_SEMANTICS_INVALID');
  }

  const warnings = [];
  const expectedAmount = amountSemantics === CARTERA_030B_AMOUNT_SEMANTICS.PER_OCCURRENCE
    ? amount
    : null;
  if (amount !== null && amountSemantics !== CARTERA_030B_AMOUNT_SEMANTICS.PER_OCCURRENCE) {
    warnings.push('PREMIUM_AMOUNT_SEMANTICS_UNKNOWN');
  }

  const dueDates = [];
  if (paymentFrequency === CARTERA_030B_PAYMENT_FREQUENCIES.SINGLE) {
    dueDates.push(anchor.value);
  } else {
    const interval = MONTH_INTERVALS[paymentFrequency];
    if (!interval) {
      return blockedResult('UNSUPPORTED_PAYMENT_FREQUENCY', ['No recurrence was guessed.']);
    }
    for (let index = 0; index < maxOccurrences; index += 1) {
      const dueDate = addMonthsClamped(anchor, index * interval);
      const parsedDue = parseLocalDate(dueDate, 'DUE_DATE');
      if (compareLocalDates(parsedDue, horizon) > 0) {
        break;
      }
      if (coverageEnd && compareLocalDates(parsedDue, coverageEnd) > 0) {
        break;
      }
      dueDates.push(dueDate);
    }
    if (dueDates.length === maxOccurrences) {
      const nextDue = addMonthsClamped(anchor, maxOccurrences * interval);
      if (nextDue <= horizon.value && (!coverageEnd || nextDue <= coverageEnd.value)) {
        throw new RangeError('MAX_OCCURRENCES_EXCEEDED');
      }
    }
  }

  const obligations = [];
  for (let index = 0; index < dueDates.length; index += 1) {
    const expectedDate = dueDates[index];
    const sequenceNumber = index + 1;
    const obligationReference = await createExpectedPaymentObligationReference({
      advisorId: owner,
      policyReference: policy,
      policyVersionReference: version,
      policyTermsDigest: digest,
      obligationKind,
      expectedDate,
      sequenceNumber,
      paymentFrequency,
      scheduleRuleReference: ruleReference,
    });
    obligations.push(Object.freeze({
      contractType: 'FORGE_CARTERA_EXPECTED_PAYMENT_OBLIGATION',
      contractVersion: 'CARTERA-030B.1',
      obligationReference,
      advisorId: owner,
      policyReference: policy,
      policyVersionReference: version,
      policyTermsDigest: digest,
      obligationKind,
      expectedDate,
      expectedAmount,
      currency: normalizedCurrency,
      paymentFrequency,
      policyYear: calculatePolicyYear(anchor, expectedDate),
      sequenceNumber,
      status: CARTERA_030B_OBLIGATION_STATES.SCHEDULED,
      scheduleRuleReference: ruleReference,
      sourceEvidenceReferences: evidenceReferences,
      matchedPaymentEventReferences: Object.freeze([]),
      actualDate: null,
      actualAmount: null,
      confirmationState: CARTERA_030B_CONFIRMATION_STATES.SCHEDULE_DERIVED,
      supersedesObligationReference: null,
      dateAuthority: 'CONFIRMED_POLICY_TERMS_DERIVED',
      timezone: normalizedTimezone,
      stateVersion: 1,
    }));
  }

  return Object.freeze({
    generationState: 'COMPLETE',
    reason: null,
    obligations: Object.freeze(obligations),
    warnings: Object.freeze(warnings),
  });
}
