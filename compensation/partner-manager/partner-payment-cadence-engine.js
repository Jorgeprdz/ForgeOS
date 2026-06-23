const PAYABLE_CONCEPT_ALIASES = Object.freeze({
  production: new Set(['production', 'production-bonus']),
  productivity: new Set(['productivity', 'productivityMultiplier', 'productivity-multiplier', 'productivity-bonus']),
  activity: new Set(['activity', 'activity-bonus']),
  development: new Set(['development', 'development-bonus']),
  connection: new Set(['connection', 'connection-bonus']),
  partnerSignup: new Set(['partnerSignup', 'partner-signup', 'partner-signup-bonus', 'partnerAlta', 'partner-alta-bonus']),
  fixedSupport: new Set(['fixedSupport', 'fixed-support', 'fixed-support-bonus']),
});

const NON_PAYABLE_CONCEPT_ALIASES = new Set([
  'productivityBase',
  'productivity-base',
  'productivity_base',
]);

export const PARTNER_PAYMENT_CADENCE_STATUSES = Object.freeze({
  PROJECTED_CANDIDATE: 'projected_candidate',
  PARTIAL_PROJECTED_WITH_BLOCKED_PAYMENTS: 'partial_projected_with_blocked_payments',
  PROJECTED_WITH_EXCLUDED_NON_PAYABLE_CONCEPTS: 'projected_with_excluded_non_payable_concepts',
  BLOCKED_BY_MISSING_PAYMENT_MONTH: 'blocked_by_missing_payment_month',
  BLOCKED_BY_MISSING_AMOUNT: 'blocked_by_missing_amount',
  BLOCKED_BY_SOURCE_CONCEPT: 'blocked_by_source_concept',
  BLOCKED_BY_NOT_PAYABLE_CONCEPT: 'blocked_by_not_payable_concept',
});

function numberOrNull(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function roundMoney(value) {
  const numericValue = numberOrNull(value);
  if (numericValue === null) return null;
  return Math.round((numericValue + Number.EPSILON) * 100) / 100;
}

function monthKeyFrom(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}$/.test(value)) return value;
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 7);
    return null;
  }

  const raw = value.month || value.monthId || value.monthKey || value.paymentMonth || value.periodMonth || value.date || value.startDate || value.endDate;

  if (typeof raw === 'string') {
    if (/^\d{4}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 7);
  }

  return null;
}

export function addMonthsToMonthKey(monthKey, offset = 0) {
  const key = monthKeyFrom(monthKey);
  if (!key) return null;

  const [year, month] = key.split('-').map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;

  const date = new Date(Date.UTC(year, month - 1 + Number(offset || 0), 1));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${nextYear}-${nextMonth}`;
}

function quarterEndMonthFromPeriod(period = {}) {
  const explicitEnd = monthKeyFrom(period.endDate || period.end || period.closeDate);
  if (explicitEnd) return explicitEnd;

  if (Array.isArray(period.months) && period.months.length > 0) {
    const normalizedMonths = period.months.map(monthKeyFrom).filter(Boolean);
    return normalizedMonths[normalizedMonths.length - 1] || null;
  }

  return null;
}

function conceptKeyOf(entryKey, concept = {}) {
  return concept.conceptKey || concept.key || entryKey || null;
}

function canonicalConceptKey(entryKey, concept = {}) {
  const key = conceptKeyOf(entryKey, concept);
  if (!key) return null;

  if (NON_PAYABLE_CONCEPT_ALIASES.has(key)) return 'nonPayable';

  for (const [canonical, aliases] of Object.entries(PAYABLE_CONCEPT_ALIASES)) {
    if (aliases.has(key) || aliases.has(entryKey)) return canonical;
  }

  return null;
}

function candidateAmountOf(concept = {}) {
  return numberOrNull(
    concept.candidateAmount
    ?? concept.amount
    ?? concept.calculatedCandidateAmount
    ?? concept.payableCandidateAmount
  );
}

function sourceConceptIsBlocked(concept = {}) {
  const status = String(concept.status || '');
  return status.includes('blocked') || status.includes('unknown') || status.includes('not_modeled');
}

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function allocateEqualParts(amount, count) {
  const numericAmount = numberOrNull(amount);
  const numericCount = Number(count);

  if (numericAmount === null || !Number.isInteger(numericCount) || numericCount <= 0) return [];

  const cents = Math.round(numericAmount * 100);
  const sign = cents < 0 ? -1 : 1;
  const absoluteCents = Math.abs(cents);
  const base = Math.trunc(absoluteCents / numericCount);
  const remainder = absoluteCents - (base * numericCount);

  return Array.from({ length: numericCount }, (_, index) => {
    const centsForPart = base + (index < remainder ? 1 : 0);
    return roundMoney((centsForPart * sign) / 100);
  });
}

function createPayment({
  sourceConceptKey,
  canonicalConceptKey: canonical,
  paymentMonth,
  amount,
  paymentIndex = 1,
  paymentCount = 1,
  calculationCadence,
  paymentCadence,
  cadenceRule,
  sourceStatus = null,
} = {}) {
  return {
    sourceConceptKey,
    canonicalConceptKey: canonical,
    paymentMonth,
    paymentIndex,
    paymentCount,
    amount: roundMoney(amount),
    calculationCadence,
    paymentCadence,
    cadenceRule,
    status: PARTNER_PAYMENT_CADENCE_STATUSES.PROJECTED_CANDIDATE,
    payoutTruth: false,
    sourceStatus,
    evidenceRequirement: ['commission_statement_for_paid_confirmed'],
  };
}

function createBlockedPayment({
  sourceConceptKey,
  canonicalConceptKey: canonical,
  status,
  blockedReasons = [],
  missingInputs = [],
  sourceStatus = null,
} = {}) {
  return {
    sourceConceptKey,
    canonicalConceptKey: canonical,
    status,
    payoutTruth: false,
    amount: null,
    paymentMonth: null,
    blockedReasons: unique(blockedReasons),
    missingInputs: unique(missingInputs),
    sourceStatus,
    evidenceRequirement: ['commission_statement_for_paid_confirmed'],
  };
}

function extractMonthlyBreakdown({ canonical, concept = {}, monthlyBreakdown = {} } = {}) {
  const direct = monthlyBreakdown[canonical];

  if (Array.isArray(direct)) {
    return direct.map((part) => ({
      month: monthKeyFrom(part),
      amount: numberOrNull(part.amount ?? part.candidateAmount ?? part.value),
    }));
  }

  const candidates = [
    concept.monthlyPayments,
    concept.monthlyBreakdown,
    concept.metadata?.monthlyPayments,
    concept.metadata?.monthlyBreakdown,
    concept.metadata?.parts,
  ];

  const parts = candidates.find(Array.isArray);

  if (!parts) return [];

  return parts.map((part) => {
    const result = part.result || {};
    return {
      month: monthKeyFrom(part) || monthKeyFrom(result),
      amount: numberOrNull(
        part.amount
        ?? part.candidateAmount
        ?? result.amount
        ?? result.candidateAmount
      ),
    };
  });
}

function scheduleDeferredThirds({
  sourceConceptKey,
  canonical,
  concept,
  amount,
  quarterEndMonth,
  firstDeferredPaymentMonth,
} = {}) {
  const blockedPayments = [];
  const projectedPayments = [];

  const firstMonth = monthKeyFrom(firstDeferredPaymentMonth) || addMonthsToMonthKey(quarterEndMonth, 1);

  if (!firstMonth) {
    blockedPayments.push(createBlockedPayment({
      sourceConceptKey,
      canonicalConceptKey: canonical,
      status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_MISSING_PAYMENT_MONTH,
      blockedReasons: ['missing_first_deferred_payment_month'],
      missingInputs: ['firstDeferredPaymentMonth'],
      sourceStatus: concept.status,
    }));

    return { projectedPayments, blockedPayments };
  }

  const parts = allocateEqualParts(amount, 3);

  parts.forEach((partAmount, index) => {
    projectedPayments.push(createPayment({
      sourceConceptKey,
      canonicalConceptKey: canonical,
      paymentMonth: addMonthsToMonthKey(firstMonth, index),
      amount: partAmount,
      paymentIndex: index + 1,
      paymentCount: 3,
      calculationCadence: 'quarterly',
      paymentCadence: 'deferred_equal_thirds',
      cadenceRule: 'quarterly_candidate_paid_over_following_three_months',
      sourceStatus: concept.status,
    }));
  });

  return { projectedPayments, blockedPayments };
}

function scheduleQuarterCloseFull({
  sourceConceptKey,
  canonical,
  concept,
  amount,
  quarterEndMonth,
  activityPaymentMonth,
} = {}) {
  const paymentMonth = monthKeyFrom(activityPaymentMonth) || quarterEndMonth;

  if (!paymentMonth) {
    return {
      projectedPayments: [],
      blockedPayments: [createBlockedPayment({
        sourceConceptKey,
        canonicalConceptKey: canonical,
        status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_MISSING_PAYMENT_MONTH,
        blockedReasons: ['missing_quarter_close_payment_month'],
        missingInputs: ['quarterEndMonth'],
        sourceStatus: concept.status,
      })],
    };
  }

  return {
    projectedPayments: [createPayment({
      sourceConceptKey,
      canonicalConceptKey: canonical,
      paymentMonth,
      amount,
      calculationCadence: 'quarterly',
      paymentCadence: 'quarter_close_full',
      cadenceRule: 'quarterly_activity_candidate_paid_full_at_quarter_close',
      sourceStatus: concept.status,
    })],
    blockedPayments: [],
  };
}

function scheduleMonthlyBreakdown({
  sourceConceptKey,
  canonical,
  concept,
  monthlyBreakdown,
  amount = null,
} = {}) {
  const parts = extractMonthlyBreakdown({ canonical, concept, monthlyBreakdown });
  const projectedPayments = [];
  const blockedPayments = [];

  if (parts.length === 0) {
    if (numberOrNull(amount) === 0) {
      return { projectedPayments, blockedPayments };
    }

    blockedPayments.push(createBlockedPayment({
      sourceConceptKey,
      canonicalConceptKey: canonical,
      status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_MISSING_PAYMENT_MONTH,
      blockedReasons: ['missing_monthly_payment_breakdown'],
      missingInputs: [`${canonical}MonthlyBreakdown`],
      sourceStatus: concept.status,
    }));

    return { projectedPayments, blockedPayments };
  }

  parts.forEach((part, index) => {
    if (!part.month) {
      blockedPayments.push(createBlockedPayment({
        sourceConceptKey,
        canonicalConceptKey: canonical,
        status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_MISSING_PAYMENT_MONTH,
        blockedReasons: ['missing_month_for_monthly_payment'],
        missingInputs: [`${canonical}MonthlyBreakdown[${index}].month`],
        sourceStatus: concept.status,
      }));
      return;
    }

    if (numberOrNull(part.amount) === null) {
      blockedPayments.push(createBlockedPayment({
        sourceConceptKey,
        canonicalConceptKey: canonical,
        status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_MISSING_AMOUNT,
        blockedReasons: ['missing_monthly_payment_amount'],
        missingInputs: [`${canonical}MonthlyBreakdown[${index}].amount`],
        sourceStatus: concept.status,
      }));
      return;
    }

    projectedPayments.push(createPayment({
      sourceConceptKey,
      canonicalConceptKey: canonical,
      paymentMonth: part.month,
      amount: part.amount,
      paymentIndex: index + 1,
      paymentCount: parts.length,
      calculationCadence: 'monthly',
      paymentCadence: 'monthly',
      cadenceRule: 'monthly_candidate_paid_in_own_month',
      sourceStatus: concept.status,
    }));
  });

  return { projectedPayments, blockedPayments };
}

export function createPartnerPaymentCadenceSchedule({
  quarterlyResult = null,
  concepts = null,
  period = null,
  quarterEndMonth = null,
  firstDeferredPaymentMonth = null,
  activityPaymentMonth = null,
  monthlyBreakdown = {},
} = {}) {
  const sourceConcepts = concepts || quarterlyResult?.concepts || {};
  const sourcePeriod = period || quarterlyResult?.period || {};
  const resolvedQuarterEndMonth = monthKeyFrom(quarterEndMonth) || quarterEndMonthFromPeriod(sourcePeriod);

  const projectedPayments = [];
  const blockedPayments = [];
  const excludedConcepts = [];
  const warnings = [];

  Object.entries(sourceConcepts).forEach(([entryKey, concept]) => {
    const sourceConceptKey = conceptKeyOf(entryKey, concept);
    const canonical = canonicalConceptKey(entryKey, concept);

    if (canonical === 'nonPayable') {
      excludedConcepts.push({
        sourceConceptKey,
        canonicalConceptKey: canonical,
        reason: 'concept_is_not_payable',
        status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_NOT_PAYABLE_CONCEPT,
        payoutTruth: false,
        sourceStatus: concept.status,
      });
      return;
    }

    if (!canonical) {
      warnings.push(`unknown_payment_cadence:${sourceConceptKey || entryKey}`);
      return;
    }

    if (sourceConceptIsBlocked(concept)) {
      blockedPayments.push(createBlockedPayment({
        sourceConceptKey,
        canonicalConceptKey: canonical,
        status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_SOURCE_CONCEPT,
        blockedReasons: concept.blockedReasons || ['source_concept_blocked'],
        missingInputs: concept.missingInputs || [],
        sourceStatus: concept.status,
      }));
      return;
    }

    const amount = candidateAmountOf(concept);

    if (amount === null) {
      blockedPayments.push(createBlockedPayment({
        sourceConceptKey,
        canonicalConceptKey: canonical,
        status: PARTNER_PAYMENT_CADENCE_STATUSES.BLOCKED_BY_MISSING_AMOUNT,
        blockedReasons: ['missing_candidate_amount'],
        missingInputs: [`${sourceConceptKey || entryKey}.candidateAmount`],
        sourceStatus: concept.status,
      }));
      return;
    }

    let scheduled;

    if (canonical === 'production' || canonical === 'productivity') {
      scheduled = scheduleDeferredThirds({
        sourceConceptKey,
        canonical,
        concept,
        amount,
        quarterEndMonth: resolvedQuarterEndMonth,
        firstDeferredPaymentMonth,
      });
    } else if (canonical === 'activity') {
      scheduled = scheduleQuarterCloseFull({
        sourceConceptKey,
        canonical,
        concept,
        amount,
        quarterEndMonth: resolvedQuarterEndMonth,
        activityPaymentMonth,
      });
    } else {
      scheduled = scheduleMonthlyBreakdown({
        sourceConceptKey,
        canonical,
        concept,
        monthlyBreakdown,
        amount,
      });
    }

    projectedPayments.push(...scheduled.projectedPayments);
    blockedPayments.push(...scheduled.blockedPayments);
  });

  const status = blockedPayments.length > 0
    ? PARTNER_PAYMENT_CADENCE_STATUSES.PARTIAL_PROJECTED_WITH_BLOCKED_PAYMENTS
    : excludedConcepts.length > 0
      ? PARTNER_PAYMENT_CADENCE_STATUSES.PROJECTED_WITH_EXCLUDED_NON_PAYABLE_CONCEPTS
      : PARTNER_PAYMENT_CADENCE_STATUSES.PROJECTED_CANDIDATE;

  return {
    status,
    payoutTruth: false,
    quarterEndMonth: resolvedQuarterEndMonth,
    projectedPayments,
    blockedPayments,
    excludedConcepts,
    warnings: unique(warnings),
    totals: {
      projectedAmount: roundMoney(projectedPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0)),
      blockedPaymentCount: blockedPayments.length,
      excludedConceptCount: excludedConcepts.length,
      projectedPaymentCount: projectedPayments.length,
    },
  };
}

export default {
  createPartnerPaymentCadenceSchedule,
  addMonthsToMonthKey,
  PARTNER_PAYMENT_CADENCE_STATUSES,
};
