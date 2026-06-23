import {
  FatalGovernanceError,
  assertValidPaymentDistributionRulePack,
} from './partner-payment-distribution-rule-pack-validator.js';

import {
  GovernanceIdentityMissingError,
  createRulePackIdentitySnapshot,
  flattenRulePackIdentitySnapshot,
} from '../../governance/rule-pack-identity-snapshot.js';

export const PARTNER_PAYMENT_CADENCE_STATUSES = Object.freeze({
  PROJECTED_CANDIDATE: 'projected_candidate',
  PROJECTED_WITH_EXCLUDED_NON_PAYABLE_CONCEPTS: 'projected_with_excluded_non_payable_concepts',
  PARTIAL_PROJECTED_WITH_BLOCKED_PAYMENTS: 'partial_projected_with_blocked_payments',
  EMPTY_PROJECTION: 'empty_projection',
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

  const raw = value.month || value.paymentMonth || value.monthId || value.monthKey || value.date || value.startDate || value.endDate;

  if (typeof raw === 'string') {
    if (/^\d{4}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 7);
  }

  return null;
}

function addMonthsToMonthKey(monthKey, offset) {
  if (!/^\d{4}-\d{2}$/.test(monthKey || '')) return null;

  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${y}-${m}`;
}

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeConceptValue(sourceConceptKey, rawConcept) {
  if (rawConcept === null || rawConcept === undefined || typeof rawConcept !== 'object' || Array.isArray(rawConcept)) {
    return {
      sourceConceptKey,
      conceptKey: sourceConceptKey,
      status: 'calculated_candidate',
      candidateAmount: rawConcept,
      blockedReasons: [],
      missingInputs: [],
      warnings: [],
      metadata: {},
    };
  }

  return {
    ...rawConcept,
    sourceConceptKey,
    conceptKey: rawConcept.conceptKey || rawConcept.canonicalConceptKey || sourceConceptKey,
    status: rawConcept.status || 'calculated_candidate',
    candidateAmount: rawConcept.candidateAmount ?? rawConcept.amount ?? rawConcept.value ?? null,
    blockedReasons: Array.isArray(rawConcept.blockedReasons) ? rawConcept.blockedReasons : [],
    missingInputs: Array.isArray(rawConcept.missingInputs) ? rawConcept.missingInputs : [],
    warnings: Array.isArray(rawConcept.warnings) ? rawConcept.warnings : [],
    metadata: rawConcept.metadata || {},
  };
}

function resolveCanonicalConceptKey({ sourceConceptKey, concept, aliasMap }) {
  const candidates = [
    concept.canonicalConceptKey,
    concept.conceptKey,
    sourceConceptKey,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = aliasMap.get(String(candidate).trim().toLowerCase());
    if (resolved) return resolved;
  }

  return null;
}

function isUncertainStatus(status = '') {
  const normalized = String(status || '').toLowerCase();

  return normalized.includes('blocked')
    || normalized.includes('unknown')
    || normalized.includes('not_modeled')
    || normalized.includes('not_modelled')
    || normalized.includes('hidden_by_scope');
}

function candidateAmountOf(concept) {
  return roundMoney(concept.candidateAmount ?? concept.amount ?? concept.value);
}

function allocateEqualParts(amount, parts) {
  if (amount === null) return Array.from({ length: parts }, () => null);

  const totalCents = Math.round(Number(amount) * 100);
  const baseCents = Math.trunc(totalCents / parts);
  const remainder = totalCents - (baseCents * parts);

  return Array.from({ length: parts }, (_, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0);
    return roundMoney(cents / 100);
  });
}

function pickRulePackMetadata({ rulePackIdentity }) {
  const identity = createRulePackIdentitySnapshot({
    rulePackIdentity,
    calculatedAt: rulePackIdentity?.calculatedAt ?? null,
    generatedAt: rulePackIdentity?.generatedAt ?? null,
    allowDraft: true,
  });

  return flattenRulePackIdentitySnapshot(identity);
}

function resolveAnchorMonth({ anchor, period, policy }) {
  const quarterCloseMonth = monthKeyFrom(period?.endDate || period?.endMonth || period?.quarterEndMonth || period);

  if (anchor === 'quarter_close' || anchor === 'period_end') {
    return quarterCloseMonth;
  }

  if (anchor === 'month_after_quarter_close') {
    return addMonthsToMonthKey(quarterCloseMonth, 1);
  }

  if (anchor === 'explicit_payment_month') {
    return monthKeyFrom(policy.paymentMonth || policy.targetMonth);
  }

  return null;
}

function createProjectedPayment({
  sourceConceptKey,
  canonicalConceptKey,
  concept,
  policy,
  paymentMonth,
  amount,
  fractionIndex = null,
  totalFractions = null,
  rulePackMetadata,
} = {}) {
  const sourceStatus = concept.status || 'calculated_candidate';
  const sourceIsUncertain = isUncertainStatus(sourceStatus);
  const projectedAmount = sourceIsUncertain ? null : roundMoney(amount);

  return {
    sourceConceptKey,
    canonicalConceptKey,
    conceptKey: canonicalConceptKey,
    sourceStatus,
    status: sourceIsUncertain ? sourceStatus : PARTNER_PAYMENT_CADENCE_STATUSES.PROJECTED_CANDIDATE,
    paymentMonth,
    month: paymentMonth,
    amount: projectedAmount,
    candidateAmount: projectedAmount,
    payoutTruth: false,
    paymentCadence: policy.distributionType,
    distributionType: policy.distributionType,
    fractionIndex,
    totalFractions,
    ruleId: policy.ruleId || null,
    sourceEvidenceRef: policy.sourceEvidenceRef || null,
    blockedReasons: unique([...(concept.blockedReasons || [])]),
    missingInputs: unique([...(concept.missingInputs || [])]),
    warnings: unique([...(concept.warnings || [])]),
    ...rulePackMetadata,
  };
}

function createBlockedPayment({
  sourceConceptKey,
  canonicalConceptKey = null,
  policy = {},
  concept = {},
  blockedReasons = [],
  missingInputs = [],
  status = 'blocked_by_payment_distribution_boundary',
  rulePackMetadata = {},
} = {}) {
  return {
    sourceConceptKey,
    canonicalConceptKey,
    conceptKey: canonicalConceptKey,
    sourceStatus: concept.status || null,
    status,
    payoutTruth: false,
    paymentCadence: policy.distributionType || null,
    distributionType: policy.distributionType || null,
    ruleId: policy.ruleId || null,
    sourceEvidenceRef: policy.sourceEvidenceRef || null,
    blockedReasons: unique([
      ...(concept.blockedReasons || []),
      ...blockedReasons,
    ]),
    missingInputs: unique([
      ...(concept.missingInputs || []),
      ...missingInputs,
    ]),
    warnings: unique([...(concept.warnings || [])]),
    ...rulePackMetadata,
  };
}

function extractMonthlyBreakdown({ sourceConceptKey, canonicalConceptKey, concept, monthlyBreakdown }) {
  const sources = [
    monthlyBreakdown?.[canonicalConceptKey],
    monthlyBreakdown?.[sourceConceptKey],
    monthlyBreakdown?.[concept.conceptKey],
    concept.monthlyBreakdown,
    concept.monthlyPayments,
    concept.parts,
    concept.metadata?.monthlyBreakdown,
    concept.metadata?.monthlyPayments,
    concept.metadata?.parts,
  ];

  for (const source of sources) {
    if (Array.isArray(source)) return source;
  }

  return [];
}

function scheduleDeferredEqualParts({
  sourceConceptKey,
  canonicalConceptKey,
  concept,
  policy,
  period,
  rulePackMetadata,
} = {}) {
  const projectedPayments = [];
  const blockedPayments = [];
  const parts = policy.parts;
  const startMonth = resolveAnchorMonth({ anchor: policy.startAnchor, period, policy });

  if (!Number.isInteger(parts) || parts <= 0 || !startMonth) {
    blockedPayments.push(createBlockedPayment({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      blockedReasons: ['blocked_by_incomplete_cadence_rule_definition'],
      missingInputs: [
        ...(!Number.isInteger(parts) || parts <= 0 ? ['paymentDistributionPolicy.parts'] : []),
        ...(!startMonth ? ['paymentDistributionPolicy.startAnchor'] : []),
      ],
      status: 'blocked_by_incomplete_cadence_rule_definition',
      rulePackMetadata,
    }));

    return { projectedPayments, blockedPayments };
  }

  const amount = candidateAmountOf(concept);
  const allocatedParts = allocateEqualParts(amount, parts);

  for (let index = 0; index < parts; index += 1) {
    projectedPayments.push(createProjectedPayment({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      paymentMonth: addMonthsToMonthKey(startMonth, index),
      amount: allocatedParts[index],
      fractionIndex: index + 1,
      totalFractions: parts,
      rulePackMetadata,
    }));
  }

  return { projectedPayments, blockedPayments };
}

function scheduleSinglePayment({
  sourceConceptKey,
  canonicalConceptKey,
  concept,
  policy,
  period,
  rulePackMetadata,
} = {}) {
  const anchor = policy.paymentAnchor || policy.startAnchor;
  const paymentMonth = resolveAnchorMonth({ anchor, period, policy });

  if (!paymentMonth) {
    return {
      projectedPayments: [],
      blockedPayments: [
        createBlockedPayment({
          sourceConceptKey,
          canonicalConceptKey,
          concept,
          policy,
          blockedReasons: ['blocked_by_missing_payment_anchor_month'],
          missingInputs: ['paymentDistributionPolicy.paymentAnchor'],
          status: 'blocked_by_missing_payment_anchor_month',
          rulePackMetadata,
        }),
      ],
    };
  }

  return {
    projectedPayments: [
      createProjectedPayment({
        sourceConceptKey,
        canonicalConceptKey,
        concept,
        policy,
        paymentMonth,
        amount: candidateAmountOf(concept),
        rulePackMetadata,
      }),
    ],
    blockedPayments: [],
  };
}

function scheduleMonthlyBreakdownRequired({
  sourceConceptKey,
  canonicalConceptKey,
  concept,
  policy,
  monthlyBreakdown,
  rulePackMetadata,
} = {}) {
  const projectedPayments = [];
  const blockedPayments = [];
  const parts = extractMonthlyBreakdown({ sourceConceptKey, canonicalConceptKey, concept, monthlyBreakdown });
  const amount = candidateAmountOf(concept);

  if (parts.length === 0) {
    if (amount === 0 && !isUncertainStatus(concept.status)) {
      return { projectedPayments, blockedPayments };
    }

    blockedPayments.push(createBlockedPayment({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      blockedReasons: ['missing_monthly_payment_breakdown'],
      missingInputs: [`monthlyBreakdown.${canonicalConceptKey}`],
      status: 'blocked_by_missing_monthly_payment_breakdown',
      rulePackMetadata,
    }));

    return { projectedPayments, blockedPayments };
  }

  for (const part of parts) {
    const paymentMonth = monthKeyFrom(part.month || part.paymentMonth || part.date);
    const partAmount = roundMoney(part.amount ?? part.candidateAmount ?? part.value);

    if (!paymentMonth) {
      blockedPayments.push(createBlockedPayment({
        sourceConceptKey,
        canonicalConceptKey,
        concept,
        policy,
        blockedReasons: ['missing_month_for_monthly_payment'],
        missingInputs: [`monthlyBreakdown.${canonicalConceptKey}.month`],
        status: 'blocked_by_missing_month_for_monthly_payment',
        rulePackMetadata,
      }));
      continue;
    }

    if (partAmount === null) {
      blockedPayments.push(createBlockedPayment({
        sourceConceptKey,
        canonicalConceptKey,
        concept,
        policy,
        blockedReasons: ['missing_amount_for_monthly_payment'],
        missingInputs: [`monthlyBreakdown.${canonicalConceptKey}.amount`],
        status: 'blocked_by_missing_amount_for_monthly_payment',
        rulePackMetadata,
      }));
      continue;
    }

    projectedPayments.push(createProjectedPayment({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      paymentMonth,
      amount: partAmount,
      rulePackMetadata,
    }));
  }

  return { projectedPayments, blockedPayments };
}

function scheduleConcept({
  sourceConceptKey,
  canonicalConceptKey,
  concept,
  policy,
  period,
  monthlyBreakdown,
  rulePackMetadata,
}) {
  if (policy.payable === false || policy.distributionType === 'excluded_non_payable') {
    return {
      projectedPayments: [],
      blockedPayments: [],
      excludedConcepts: [{
        sourceConceptKey,
        canonicalConceptKey,
        conceptKey: canonicalConceptKey,
        reason: policy.excludeReason || 'concept_is_not_payable',
        status: 'excluded_non_payable',
        payoutTruth: false,
        ruleId: policy.ruleId || null,
        sourceEvidenceRef: policy.sourceEvidenceRef || null,
        ...rulePackMetadata,
      }],
    };
  }

  let scheduled;

  if (policy.distributionType === 'deferred_equal_parts') {
    scheduled = scheduleDeferredEqualParts({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      period,
      rulePackMetadata,
    });
  } else if (policy.distributionType === 'single_payment') {
    scheduled = scheduleSinglePayment({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      period,
      rulePackMetadata,
    });
  } else if (policy.distributionType === 'monthly_breakdown_required') {
    scheduled = scheduleMonthlyBreakdownRequired({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      monthlyBreakdown,
      rulePackMetadata,
    });
  } else {
    scheduled = {
      projectedPayments: [],
      blockedPayments: [
        createBlockedPayment({
          sourceConceptKey,
          canonicalConceptKey,
          concept,
          policy,
          blockedReasons: ['unsupported_payment_distribution_type'],
          status: 'blocked_by_unsupported_payment_distribution_type',
          rulePackMetadata,
        }),
      ],
    };
  }

  return {
    ...scheduled,
    excludedConcepts: [],
  };
}

export function createPartnerPaymentCadenceSchedule({
  period = null,
  concepts = null,
  quarterlyResult = null,
  monthlyBreakdown = {},
  rulePack = null,
  paymentDistributionRulePack = null,
  rulePackIdentity = null,
} = {}) {
  const activeRulePack = paymentDistributionRulePack || rulePack;

  if (!activeRulePack) {
    throw new FatalGovernanceError('Missing payment distribution rule pack. ADR-0027 requires JSON rule packs for variable business rules.', [
      {
        code: 'missing_payment_distribution_rule_pack',
        message: 'Payment Cadence Engine must receive a rulePack or paymentDistributionRulePack.',
      },
    ]);
  }

  if (!rulePackIdentity) {
    throw new GovernanceIdentityMissingError(
      'Payment Cadence Engine requires explicit rulePackIdentity. ADR-0027 forbids hidden latest-rule defaults.',
      [{
        code: 'missing_explicit_rule_pack_identity',
        field: 'rulePackIdentity',
      }]
    );
  }

  const validation = assertValidPaymentDistributionRulePack(activeRulePack);
  const aliasMap = validation.aliasMap;
  const rulePackMetadata = pickRulePackMetadata({ rulePackIdentity });
  const activeConcepts = concepts || quarterlyResult?.concepts || {};
  const activePeriod = period || quarterlyResult?.period || null;

  const projectedPayments = [];
  const blockedPayments = [];
  const excludedConcepts = [];
  const unmappedConcepts = [];
  const warnings = [];

  for (const [sourceConceptKey, rawConcept] of Object.entries(activeConcepts)) {
    const concept = normalizeConceptValue(sourceConceptKey, rawConcept);
    const canonicalConceptKey = resolveCanonicalConceptKey({ sourceConceptKey, concept, aliasMap });

    if (!canonicalConceptKey) {
      unmappedConcepts.push({
        sourceConceptKey,
        conceptKey: concept.conceptKey,
        status: 'unmapped_concept_missing_cadence_rule',
        payoutTruth: false,
        blockedReasons: ['unmapped_concept_missing_cadence_rule'],
        ...rulePackMetadata,
      });
      warnings.push('unmapped_concept_missing_cadence_rule');
      continue;
    }

    const policy = activeRulePack.paymentDistributionPolicies?.[canonicalConceptKey];

    if (!policy) {
      unmappedConcepts.push({
        sourceConceptKey,
        canonicalConceptKey,
        conceptKey: concept.conceptKey,
        status: 'unmapped_concept_missing_payment_distribution_policy',
        payoutTruth: false,
        blockedReasons: ['unmapped_concept_missing_payment_distribution_policy'],
        ...rulePackMetadata,
      });
      warnings.push('unmapped_concept_missing_payment_distribution_policy');
      continue;
    }

    const scheduled = scheduleConcept({
      sourceConceptKey,
      canonicalConceptKey,
      concept,
      policy,
      period: activePeriod,
      monthlyBreakdown,
      rulePackMetadata,
    });

    projectedPayments.push(...scheduled.projectedPayments);
    blockedPayments.push(...scheduled.blockedPayments);
    excludedConcepts.push(...scheduled.excludedConcepts);
    warnings.push(...(concept.warnings || []));
  }

  const projectedAmountValues = projectedPayments
    .map((payment) => numberOrNull(payment.amount))
    .filter((value) => value !== null);

  const projectedAmount = projectedAmountValues.length > 0
    ? roundMoney(projectedAmountValues.reduce((total, value) => total + value, 0))
    : null;

  const status = blockedPayments.length > 0 || unmappedConcepts.length > 0
    ? PARTNER_PAYMENT_CADENCE_STATUSES.PARTIAL_PROJECTED_WITH_BLOCKED_PAYMENTS
    : projectedPayments.length === 0
      ? PARTNER_PAYMENT_CADENCE_STATUSES.EMPTY_PROJECTION
      : excludedConcepts.length > 0
        ? PARTNER_PAYMENT_CADENCE_STATUSES.PROJECTED_WITH_EXCLUDED_NON_PAYABLE_CONCEPTS
        : PARTNER_PAYMENT_CADENCE_STATUSES.PROJECTED_CANDIDATE;

  return {
    status,
    payoutTruth: false,
    projectedPayments,
    blockedPayments,
    excludedConcepts,
    unmappedConcepts,
    warnings: unique(warnings),
    rulePack: rulePackMetadata,
    ...rulePackMetadata,
    totals: {
      projectedAmount,
      projectedPaymentCount: projectedPayments.length,
      blockedPaymentCount: blockedPayments.length,
      excludedConceptCount: excludedConcepts.length,
      unmappedConceptCount: unmappedConcepts.length,
    },
  };
}

export default {
  createPartnerPaymentCadenceSchedule,
  PARTNER_PAYMENT_CADENCE_STATUSES,
};
