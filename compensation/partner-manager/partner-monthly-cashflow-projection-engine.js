export class MissingGovernanceMetadataError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'MissingGovernanceMetadataError';
    this.code = 'MISSING_GOVERNANCE_METADATA';
    this.details = details;
  }
}

export const PARTNER_MONTHLY_CASHFLOW_STATUSES = Object.freeze({
  COMPLETE_PROJECTION: 'complete_projection',
  PARTIAL_PROJECTION: 'partial_projection',
  EMPTY_PROJECTION: 'empty_projection',
});

export const PARTNER_MONTHLY_CASHFLOW_MONTH_STATUSES = Object.freeze({
  COMPLETE_PROJECTION: 'complete_projection',
  PARTIAL_PROJECTION: 'partial_projection',
  EMPTY_PROJECTION: 'empty_projection',
});

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;

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

  const raw = value.paymentMonth || value.month || value.targetMonth || value.date || value.startDate || value.endDate;

  if (typeof raw === 'string') {
    if (/^\d{4}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 7);
  }

  return null;
}

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeCategories(categories = []) {
  if (!Array.isArray(categories)) return [];

  return unique(
    categories
      .map((category) => String(category || '').trim())
      .filter(Boolean)
  );
}

function emptyCategories(categories = []) {
  return categories.reduce((acc, category) => {
    acc[category] = null;
    return acc;
  }, {});
}

function addAmount(current, amount) {
  const right = numberOrNull(amount);
  if (right === null) return current === undefined ? null : current;

  const left = numberOrNull(current);
  if (left === null) return roundMoney(right);

  return roundMoney(left + right);
}

function inferRulePackIdentity({ rulePackIdentity = null, cadenceSchedule = null } = {}) {
  const fromInput = rulePackIdentity || {};
  const fromSchedule = cadenceSchedule || {};
  const fromScheduleNested = cadenceSchedule?.rulePack || {};

  return {
    rulePackId: fromInput.rulePackId || fromSchedule.rulePackId || fromScheduleNested.rulePackId || null,
    rulePackVersion: fromInput.rulePackVersion || fromSchedule.rulePackVersion || fromScheduleNested.rulePackVersion || null,
    rulePackHash: fromInput.rulePackHash || fromSchedule.rulePackHash || fromScheduleNested.rulePackHash || null,
    rulePackEffectiveDate: fromInput.rulePackEffectiveDate || fromSchedule.rulePackEffectiveDate || fromScheduleNested.rulePackEffectiveDate || null,
    sourceEvidenceRefs: fromInput.sourceEvidenceRefs || fromSchedule.sourceEvidenceRefs || fromScheduleNested.sourceEvidenceRefs || [],
  };
}

function assertRulePackIdentity(identity = {}) {
  const missing = [];

  if (!identity.rulePackId) missing.push('rulePackId');
  if (!identity.rulePackVersion) missing.push('rulePackVersion');
  if (!identity.rulePackHash) missing.push('rulePackHash');

  if (missing.length > 0) {
    throw new MissingGovernanceMetadataError(
      'Monthly Cashflow Projection requires rulePackId, rulePackVersion and rulePackHash for temporal snapshotting.',
      missing.map((field) => ({
        code: 'missing_rule_pack_identity_field',
        field,
      }))
    );
  }
}

function createEmptyMonth({ paymentMonth, categories, rulePackIdentity }) {
  return {
    paymentMonth,
    month: paymentMonth,
    status: PARTNER_MONTHLY_CASHFLOW_MONTH_STATUSES.EMPTY_PROJECTION,
    payoutTruth: false,
    rulePackId: rulePackIdentity.rulePackId,
    rulePackVersion: rulePackIdentity.rulePackVersion,
    rulePackHash: rulePackIdentity.rulePackHash,
    rulePackEffectiveDate: rulePackIdentity.rulePackEffectiveDate,
    monthlyTotalCandidate: null,
    categories: emptyCategories(categories),
    projectedPayments: [],
    blockedPayments: [],
    excludedConcepts: [],
    unmappedConcepts: [],
    warnings: [],
  };
}

function normalizeProjectedPayment(payment = {}) {
  const paymentMonth = monthKeyFrom(payment);
  const amount = roundMoney(payment.amount ?? payment.candidateAmount ?? payment.value);
  const canonicalConceptKey = payment.canonicalConceptKey || payment.conceptKey || payment.sourceConceptKey || null;

  return {
    ...payment,
    paymentMonth,
    month: paymentMonth,
    amount,
    candidateAmount: amount,
    canonicalConceptKey,
    payoutTruth: false,
  };
}

function normalizeBoundaryEvent(event = {}) {
  const paymentMonth = monthKeyFrom(event);
  const canonicalConceptKey = event.canonicalConceptKey || event.conceptKey || event.sourceConceptKey || null;

  return {
    ...event,
    paymentMonth,
    month: paymentMonth,
    canonicalConceptKey,
    payoutTruth: false,
  };
}

function eventIsInsideExplicitPeriod({ paymentMonth, explicitMonthSet }) {
  if (!paymentMonth) return false;
  if (!explicitMonthSet) return true;
  return explicitMonthSet.has(paymentMonth);
}

function ensureMonth(rowsByMonth, { paymentMonth, categories, rulePackIdentity, explicitMonthSet }) {
  if (!paymentMonth) return null;
  if (!eventIsInsideExplicitPeriod({ paymentMonth, explicitMonthSet })) return null;

  if (!rowsByMonth.has(paymentMonth)) {
    rowsByMonth.set(paymentMonth, createEmptyMonth({ paymentMonth, categories, rulePackIdentity }));
  }

  return rowsByMonth.get(paymentMonth);
}

function monthStatusOf(row, categories) {
  const hasProjected = row.projectedPayments.length > 0;
  const hasBlocked = row.blockedPayments.length > 0;
  const hasUnmapped = row.unmappedConcepts.length > 0;
  const hasNullProjectedPayment = row.projectedPayments.some((payment) => numberOrNull(payment.amount) === null);
  const hasAnyNullCategory = categories.some((category) => row.categories[category] === null);

  if (!hasProjected && !hasBlocked && !hasUnmapped) {
    return PARTNER_MONTHLY_CASHFLOW_MONTH_STATUSES.EMPTY_PROJECTION;
  }

  if (hasBlocked || hasUnmapped || hasNullProjectedPayment || hasAnyNullCategory) {
    return PARTNER_MONTHLY_CASHFLOW_MONTH_STATUSES.PARTIAL_PROJECTION;
  }

  return PARTNER_MONTHLY_CASHFLOW_MONTH_STATUSES.COMPLETE_PROJECTION;
}

export function createPartnerMonthlyCashflowProjection({
  periodMonths = null,
  months = null,
  cadenceSchedule = null,
  rulePackIdentity = null,
  canonicalFinancialCategories = null,
} = {}) {
  const identity = inferRulePackIdentity({ rulePackIdentity, cadenceSchedule });

  assertRulePackIdentity(identity);

  const categories = normalizeCategories(canonicalFinancialCategories);

  if (categories.length === 0) {
    throw new MissingGovernanceMetadataError(
      'Monthly Cashflow Projection requires canonicalFinancialCategories from the active rule pack.',
      [{
        code: 'missing_canonical_financial_categories',
        field: 'canonicalFinancialCategories',
      }]
    );
  }

  const explicitMonths = Array.isArray(periodMonths) ? periodMonths : months;
  const normalizedExplicitMonths = Array.isArray(explicitMonths)
    ? normalizeCategories(explicitMonths.map(monthKeyFrom))
    : null;

  const explicitMonthSet = normalizedExplicitMonths ? new Set(normalizedExplicitMonths) : null;
  const categorySet = new Set(categories);

  const rowsByMonth = new Map();

  if (normalizedExplicitMonths) {
    for (const paymentMonth of normalizedExplicitMonths) {
      rowsByMonth.set(paymentMonth, createEmptyMonth({ paymentMonth, categories, rulePackIdentity: identity }));
    }
  }

  const projectedPayments = (cadenceSchedule?.projectedPayments || []).map(normalizeProjectedPayment);
  const blockedPayments = (cadenceSchedule?.blockedPayments || []).map(normalizeBoundaryEvent);
  const excludedConcepts = (cadenceSchedule?.excludedConcepts || []).map(normalizeBoundaryEvent);
  const existingUnmappedConcepts = (cadenceSchedule?.unmappedConcepts || []).map(normalizeBoundaryEvent);

  const rootBlockedPayments = [];
  const rootExcludedConcepts = [];
  const rootUnmappedConcepts = [...existingUnmappedConcepts];
  const warnings = [...(cadenceSchedule?.warnings || [])];

  for (const payment of projectedPayments) {
    const row = ensureMonth(rowsByMonth, {
      paymentMonth: payment.paymentMonth,
      categories,
      rulePackIdentity: identity,
      explicitMonthSet,
    });

    if (!row) {
      rootUnmappedConcepts.push({
        ...payment,
        status: 'projected_payment_outside_cashflow_period',
        blockedReasons: unique([...(payment.blockedReasons || []), 'projected_payment_outside_cashflow_period']),
        payoutTruth: false,
      });
      warnings.push('projected_payment_outside_cashflow_period');
      continue;
    }

    if (!payment.canonicalConceptKey || !categorySet.has(payment.canonicalConceptKey)) {
      const unmapped = {
        ...payment,
        status: 'cashflow_unmapped_financial_category',
        blockedReasons: unique([...(payment.blockedReasons || []), 'cashflow_unmapped_financial_category']),
        payoutTruth: false,
      };

      row.unmappedConcepts.push(unmapped);
      rootUnmappedConcepts.push(unmapped);
      warnings.push('cashflow_unmapped_financial_category');
      continue;
    }

    row.projectedPayments.push(payment);
    row.categories[payment.canonicalConceptKey] = addAmount(row.categories[payment.canonicalConceptKey], payment.amount);
    row.monthlyTotalCandidate = addAmount(row.monthlyTotalCandidate, payment.amount);
  }

  for (const event of blockedPayments) {
    rootBlockedPayments.push(event);

    const row = ensureMonth(rowsByMonth, {
      paymentMonth: event.paymentMonth,
      categories,
      rulePackIdentity: identity,
      explicitMonthSet,
    });

    if (row) row.blockedPayments.push(event);
  }

  for (const event of excludedConcepts) {
    rootExcludedConcepts.push(event);

    const row = ensureMonth(rowsByMonth, {
      paymentMonth: event.paymentMonth,
      categories,
      rulePackIdentity: identity,
      explicitMonthSet,
    });

    if (row) row.excludedConcepts.push(event);
  }

  for (const event of existingUnmappedConcepts) {
    const row = ensureMonth(rowsByMonth, {
      paymentMonth: event.paymentMonth,
      categories,
      rulePackIdentity: identity,
      explicitMonthSet,
    });

    if (row) row.unmappedConcepts.push(event);
  }

  const monthlyCashflow = [...rowsByMonth.values()]
    .sort((a, b) => a.paymentMonth.localeCompare(b.paymentMonth))
    .map((row) => ({
      ...row,
      status: monthStatusOf(row, categories),
      payoutTruth: false,
      warnings: unique(row.warnings),
      blockedPayments: row.blockedPayments.map((event) => ({ ...event, payoutTruth: false })),
      excludedConcepts: row.excludedConcepts.map((event) => ({ ...event, payoutTruth: false })),
      unmappedConcepts: row.unmappedConcepts.map((event) => ({ ...event, payoutTruth: false })),
      projectedPayments: row.projectedPayments.map((event) => ({ ...event, payoutTruth: false })),
      monthlyTotalCandidate: roundMoney(row.monthlyTotalCandidate),
    }));

  const validMonthlyTotals = monthlyCashflow
    .map((row) => numberOrNull(row.monthlyTotalCandidate))
    .filter((value) => value !== null);

  const totalProjectedCandidate = validMonthlyTotals.length > 0
    ? roundMoney(validMonthlyTotals.reduce((total, value) => total + value, 0))
    : null;

  const hasAnyProjectedPayment = projectedPayments.length > 0;
  const hasPartialSignals = rootBlockedPayments.length > 0
    || rootUnmappedConcepts.length > 0
    || monthlyCashflow.some((row) => row.status === PARTNER_MONTHLY_CASHFLOW_MONTH_STATUSES.PARTIAL_PROJECTION);

  const status = !hasAnyProjectedPayment && rootBlockedPayments.length === 0 && rootUnmappedConcepts.length === 0
    ? PARTNER_MONTHLY_CASHFLOW_STATUSES.EMPTY_PROJECTION
    : hasPartialSignals
      ? PARTNER_MONTHLY_CASHFLOW_STATUSES.PARTIAL_PROJECTION
      : PARTNER_MONTHLY_CASHFLOW_STATUSES.COMPLETE_PROJECTION;

  return {
    status,
    payoutTruth: false,
    rulePackIdentity: identity,
    rulePackId: identity.rulePackId,
    rulePackVersion: identity.rulePackVersion,
    rulePackHash: identity.rulePackHash,
    rulePackEffectiveDate: identity.rulePackEffectiveDate,
    totalProjectedCandidate,
    months: monthlyCashflow,
    monthlyCashflow,
    rootBlockedPayments: rootBlockedPayments.map((event) => ({ ...event, payoutTruth: false })),
    rootExcludedConcepts: rootExcludedConcepts.map((event) => ({ ...event, payoutTruth: false })),
    rootUnmappedConcepts: rootUnmappedConcepts.map((event) => ({ ...event, payoutTruth: false })),
    blockedPayments: rootBlockedPayments.map((event) => ({ ...event, payoutTruth: false })),
    excludedConcepts: rootExcludedConcepts.map((event) => ({ ...event, payoutTruth: false })),
    unmappedConcepts: rootUnmappedConcepts.map((event) => ({ ...event, payoutTruth: false })),
    warnings: unique(warnings),
    totals: {
      totalProjectedCandidate,
      monthCount: monthlyCashflow.length,
      projectedPaymentCount: projectedPayments.length,
      blockedPaymentCount: rootBlockedPayments.length,
      excludedConceptCount: rootExcludedConcepts.length,
      unmappedConceptCount: rootUnmappedConcepts.length,
    },
  };
}

export default {
  MissingGovernanceMetadataError,
  PARTNER_MONTHLY_CASHFLOW_STATUSES,
  PARTNER_MONTHLY_CASHFLOW_MONTH_STATUSES,
  createPartnerMonthlyCashflowProjection,
};
