export const PAYMENT_TERM_CLASSIFICATIONS = Object.freeze({
  INITIAL: 'initial',
  RENEWAL: 'renewal',
  UNKNOWN: 'unknown',
  BLOCKED_BY_MISSING_POLICY_DATES: 'blocked_by_missing_policy_dates',
  BLOCKED_BY_MISSING_PAYMENT_PERIOD: 'blocked_by_missing_payment_period',
  CARRIER_SPECIFIC_RESOLUTION_REQUIRED: 'carrier_specific_resolution_required',
});

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}`.includes('T') ? value : `${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addYears(date, years) {
  const output = new Date(date.getTime());
  output.setFullYear(output.getFullYear() + years);
  return output;
}

export function createInitialRenewalClassification({
  classification = PAYMENT_TERM_CLASSIFICATIONS.UNKNOWN,
  policyYear = null,
  issueDate = null,
  effectiveDate = null,
  renewalDate = null,
  paymentDate = null,
  periodCoveredStart = null,
  periodCoveredEnd = null,
  carrierId = null,
  receiptType = null,
  resolver = 'universal_date_classifier',
  warnings = [],
} = {}) {
  return {
    classification,
    policyYear,
    issueDate,
    effectiveDate,
    renewalDate,
    paymentDate,
    periodCoveredStart,
    periodCoveredEnd,
    carrierId,
    receiptType,
    resolver,
    warnings,
    countsAsInitial: classification === PAYMENT_TERM_CLASSIFICATIONS.INITIAL,
    countsAsRenewal: classification === PAYMENT_TERM_CLASSIFICATIONS.RENEWAL,
  };
}

export function classifyInitialOrRenewal({
  issueDate = null,
  effectiveDate = null,
  renewalDate = null,
  policyYear = null,
  paymentDate = null,
  periodCoveredStart = null,
  periodCoveredEnd = null,
  carrierId = null,
  receiptType = null,
  carrierSpecificResolutionRequired = false,
} = {}) {
  if (carrierSpecificResolutionRequired) {
    return createInitialRenewalClassification({
      classification: PAYMENT_TERM_CLASSIFICATIONS.CARRIER_SPECIFIC_RESOLUTION_REQUIRED,
      policyYear,
      issueDate,
      effectiveDate,
      renewalDate,
      paymentDate,
      periodCoveredStart,
      periodCoveredEnd,
      carrierId,
      receiptType,
      resolver: 'carrier_rule_pack_required',
      warnings: ['Carrier-specific exception requires rule pack resolution.'],
    });
  }

  const policyStart = parseDate(effectiveDate || issueDate);
  const policyRenewal = parseDate(renewalDate);

  if (!policyStart || !policyRenewal) {
    return createInitialRenewalClassification({
      classification: PAYMENT_TERM_CLASSIFICATIONS.BLOCKED_BY_MISSING_POLICY_DATES,
      policyYear,
      issueDate,
      effectiveDate,
      renewalDate,
      paymentDate,
      periodCoveredStart,
      periodCoveredEnd,
      carrierId,
      receiptType,
      warnings: ['Policy dates are required before initial/renewal classification.'],
    });
  }

  const coverageStart = parseDate(periodCoveredStart);
  const coverageEnd = parseDate(periodCoveredEnd);
  const paidAt = parseDate(paymentDate);

  if (!coverageStart || !coverageEnd || !paidAt) {
    return createInitialRenewalClassification({
      classification: PAYMENT_TERM_CLASSIFICATIONS.BLOCKED_BY_MISSING_PAYMENT_PERIOD,
      policyYear,
      issueDate,
      effectiveDate,
      renewalDate,
      paymentDate,
      periodCoveredStart,
      periodCoveredEnd,
      carrierId,
      receiptType,
      warnings: ['Payment date and covered period are required before classification.'],
    });
  }

  const firstPolicyYearEnd = addYears(policyStart, 1);

  if (coverageStart < firstPolicyYearEnd && paidAt < policyRenewal) {
    return createInitialRenewalClassification({
      classification: PAYMENT_TERM_CLASSIFICATIONS.INITIAL,
      policyYear,
      issueDate,
      effectiveDate,
      renewalDate,
      paymentDate,
      periodCoveredStart,
      periodCoveredEnd,
      carrierId,
      receiptType,
    });
  }

  if (coverageStart >= policyRenewal || paidAt >= policyRenewal) {
    return createInitialRenewalClassification({
      classification: PAYMENT_TERM_CLASSIFICATIONS.RENEWAL,
      policyYear,
      issueDate,
      effectiveDate,
      renewalDate,
      paymentDate,
      periodCoveredStart,
      periodCoveredEnd,
      carrierId,
      receiptType,
    });
  }

  return createInitialRenewalClassification({
    classification: PAYMENT_TERM_CLASSIFICATIONS.UNKNOWN,
    policyYear,
    issueDate,
    effectiveDate,
    renewalDate,
    paymentDate,
    periodCoveredStart,
    periodCoveredEnd,
    carrierId,
    receiptType,
    warnings: ['Classification remains unknown; do not count in initial or renewal totals.'],
  });
}
