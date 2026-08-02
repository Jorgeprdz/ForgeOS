"use strict";

const {
  validateAdvisorCompensationConfirmedPaymentEvent
} = require("../payment/advisor-compensation-payment-event-contract");
const {
  resolveAdvisorCompensationCommissionRule
} = require("../rules/advisor-compensation-rule-resolver");
const {
  COMMISSION_CALCULATION_CONTRACT_VERSION,
  COMMISSION_CALCULATION_STATUSES,
  COMMISSION_CALCULATION_TYPES,
  deepFreeze
} = require("./advisor-commission-calculation-contract");
const {
  roundMoney,
  resolveAdvisorCommissionPaymentBasis
} = require("./advisor-commission-basis-resolver");
const {
  calculateAdvisorCompensationCalculationDigest
} = require("./advisor-compensation-calculation-digest");

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function blocked(reason, extra = {}) {
  return deepFreeze({
    contractVersion: COMMISSION_CALCULATION_CONTRACT_VERSION,
    status: COMMISSION_CALCULATION_STATUSES.BLOCKED,
    reason,
    truthState: "BLOCKED",
    eligibleForEarnedPromotion: false,
    calculationDigest: null,
    amounts: null,
    safeguards: {
      confirmedPaymentIsNotPaidCommission: true,
      payoutTruth: false,
      compensationEventWritten: false,
      externalMutationAuthorized: false
    },
    ...extra
  });
}

function determineCalculationType(lineOfBusiness, policyYear) {
  const renewal = policyYear > 1;
  if (lineOfBusiness === "GMM") {
    return renewal
      ? COMMISSION_CALCULATION_TYPES.GMM_RENEWAL
      : COMMISSION_CALCULATION_TYPES.GMM_INITIAL;
  }
  return renewal
    ? COMMISSION_CALCULATION_TYPES.LIFE_RENEWAL
    : COMMISSION_CALCULATION_TYPES.LIFE_INITIAL;
}

function resolveDevelopmentFactor(rulePack, advisorMonth) {
  if (!Number.isInteger(advisorMonth) || advisorMonth < 1) {
    return Object.freeze({ status: "BLOCKED", reason: "advisor_month_required" });
  }
  const rule = rulePack?.auxiliaryRules?.developmentFactor;
  if (!rule) {
    return Object.freeze({
      status: "READY",
      factor: 1,
      applied: false,
      reason: "development_factor_rule_absent"
    });
  }
  const applies = advisorMonth >= rule.advisorMonthFrom && advisorMonth <= rule.advisorMonthTo;
  return Object.freeze({
    status: "READY",
    factor: applies ? Number(rule.factor) : 1,
    applied: applies,
    reason: applies ? null : "outside_development_factor_window",
    sourceState: rule.sourceState || null
  });
}

function resolvePointsAndWeightedPremium({
  rulePack,
  productId,
  displayName,
  lineOfBusiness,
  annualPremium,
  isPersonal
}) {
  if (isPersonal) {
    return Object.freeze({
      policyPoints: 0,
      weightedPremium: 0,
      excludedReason: "personal_policy"
    });
  }

  const pointsRule = rulePack?.auxiliaryRules?.policyPoints || {};
  const excluded = (pointsRule.excludedLegacyNames || [])
    .some((name) => String(displayName || "").includes(name));

  let policyPoints = 0;
  if (!excluded && lineOfBusiness === "GMM") {
    if (annualPremium >= Number(pointsRule.gmmMinimumAnnualPremium)) {
      policyPoints = Number(pointsRule.gmmPoints);
    }
  } else if (!excluded) {
    const tier = (pointsRule.lifeThresholds || []).find((candidate) =>
      annualPremium >= candidate.minimum &&
      (candidate.maximumExclusive === null || annualPremium < candidate.maximumExclusive)
    );
    policyPoints = tier ? Number(tier.points) : 0;
  }

  const weight = (rulePack?.auxiliaryRules?.premiumWeights || [])
    .find((candidate) => candidate.productId === productId);
  const weightedPremium = roundMoney(annualPremium * (weight ? Number(weight.factor) : 1));

  return Object.freeze({
    policyPoints,
    weightedPremium,
    excludedReason: excluded ? "product_excluded_from_points" : null
  });
}

function calculateAdvisorCommission({
  paymentEvent,
  rulePack,
  calculationContext = {},
  calculatedAt,
  ruleResolver = resolveAdvisorCompensationCommissionRule
} = {}) {
  const paymentValidation = validateAdvisorCompensationConfirmedPaymentEvent(paymentEvent);
  if (!paymentValidation.valid) {
    return blocked("confirmed_payment_event_invalid", {
      validationErrors: paymentValidation.errors
    });
  }
  if (paymentEvent.interpretation?.readyForCalculation !== true) {
    return blocked("confirmed_payment_event_not_ready", {
      missingContext: paymentEvent.interpretation?.missingContext || []
    });
  }
  if (!paymentEvent.references?.advisorReference) {
    return blocked("advisor_attribution_required");
  }
  if (!rulePack || typeof rulePack !== "object") {
    return blocked("rule_pack_required");
  }

  const policyYear = paymentEvent.productContext?.policyYear;
  if (!Number.isInteger(policyYear) || policyYear < 1) {
    return blocked("policy_year_required");
  }

  const isRenewal = policyYear > 1;
  if (present(calculationContext.isRenewal) &&
      Boolean(calculationContext.isRenewal) !== isRenewal) {
    return blocked("renewal_status_conflicts_with_policy_year");
  }

  const asOf = calculationContext.asOf || paymentEvent.payment.paymentDate;
  const ruleResolution = ruleResolver({
    rulePack,
    productInput: paymentEvent.productContext.productId,
    variantInput: paymentEvent.productContext.variant,
    policyYear,
    contractAge: calculationContext.contractAge,
    isRenewal,
    asOf
  });

  if (!ruleResolution ||
      !["READY_CANDIDATE", "READY_OFFICIAL"].includes(ruleResolution.status)) {
    return blocked(ruleResolution?.reason || "commission_rule_resolution_failed", {
      ruleResolution: ruleResolution || null
    });
  }

  const basis = resolveAdvisorCommissionPaymentBasis({
    paymentAmount: paymentEvent.payment.amount,
    annualPremium: calculationContext.annualPremium,
    paymentFrequency: calculationContext.paymentFrequency,
    accumulatedConfirmedPaidPremium: calculationContext.accumulatedConfirmedPaidPremium,
    paymentFrequencyFactors: rulePack?.auxiliaryRules?.paymentFrequencyFactors || {}
  });
  if (basis.status !== "READY") {
    return blocked(basis.reason, { basis });
  }

  const development = resolveDevelopmentFactor(rulePack, calculationContext.advisorMonth);
  if (development.status !== "READY") {
    return blocked(development.reason);
  }

  const baseRate = Number(ruleResolution.rate);
  const effectiveRate = Math.round(baseRate * development.factor * 1e12) / 1e12;
  const currentCommission = roundMoney(basis.commissionableBasisCurrent * effectiveRate);
  const accumulatedCommission = roundMoney(
    basis.commissionableBasisAccumulated * effectiveRate
  );

  const production = resolvePointsAndWeightedPremium({
    rulePack,
    productId: ruleResolution.productId,
    displayName: ruleResolution.displayName,
    lineOfBusiness: ruleResolution.lineOfBusiness,
    annualPremium: basis.annualPremium,
    isPersonal: calculationContext.isPersonal === true
  });

  const calculationType = determineCalculationType(
    ruleResolution.lineOfBusiness,
    policyYear
  );
  const officialRule = ruleResolution.status === "READY_OFFICIAL";
  const digestPayload = {
    contractVersion: COMMISSION_CALCULATION_CONTRACT_VERSION,
    paymentEventId: paymentEvent.eventId,
    paymentCommandDigest: paymentEvent.source.commandDigest,
    advisorReference: paymentEvent.references.advisorReference,
    policyReference: paymentEvent.references.policyReference,
    obligationReference: paymentEvent.references.obligationReference,
    productId: ruleResolution.productId,
    variantId: ruleResolution.variantId,
    policyYear,
    calculationType,
    currentConfirmedPaidPremium: basis.currentConfirmedPaidPremium,
    accumulatedConfirmedPaidPremium: basis.accumulatedConfirmedPaidPremium,
    annualPremium: basis.annualPremium,
    paymentFrequency: basis.paymentFrequency,
    baseRate,
    developmentFactor: development.factor,
    effectiveRate,
    commissionAmount: currentCommission,
    accumulatedCommissionAmount: accumulatedCommission,
    ruleId: ruleResolution.ruleId,
    rulePackId: ruleResolution.rulePackId,
    rulePackVersion: ruleResolution.rulePackVersion,
    rulePackDigest: ruleResolution.rulePackDigest,
    asOf
  };
  const calculationDigest = calculateAdvisorCompensationCalculationDigest(digestPayload);

  const result = {
    contractVersion: COMMISSION_CALCULATION_CONTRACT_VERSION,
    status: COMMISSION_CALCULATION_STATUSES.CALCULATED,
    reason: null,
    calculationId: `advisor-commission:${calculationDigest}`,
    calculationType,
    truthState: "ESTIMATED",
    eligibleForEarnedPromotion: officialRule,
    calculatedAt: calculatedAt || null,
    advisorReference: paymentEvent.references.advisorReference,
    policyReference: paymentEvent.references.policyReference,
    paymentEventId: paymentEvent.eventId,
    product: {
      productId: ruleResolution.productId,
      displayName: ruleResolution.displayName,
      lineOfBusiness: ruleResolution.lineOfBusiness,
      variantId: ruleResolution.variantId,
      policyYear,
      contractAge: present(calculationContext.contractAge)
        ? Number(calculationContext.contractAge)
        : null,
      initialOrRenewal: isRenewal ? "RENEWAL" : "INITIAL"
    },
    rule: {
      ruleId: ruleResolution.ruleId,
      rulePackId: ruleResolution.rulePackId,
      rulePackVersion: ruleResolution.rulePackVersion,
      rulePackDigest: ruleResolution.rulePackDigest,
      governanceStatus: ruleResolution.governanceStatus,
      sourceState: ruleResolution.sourceState,
      bandKey: ruleResolution.bandKey,
      commissionBasis: ruleResolution.commissionBasis,
      baseRate,
      developmentFactor: development.factor,
      developmentFactorApplied: development.applied,
      effectiveRate
    },
    basis,
    production,
    amounts: {
      currency: paymentEvent.payment.currency,
      confirmedPaidPremium: basis.currentConfirmedPaidPremium,
      accumulatedConfirmedPaidPremium: basis.accumulatedConfirmedPaidPremium,
      commissionAmount: currentCommission,
      accumulatedCommissionAmount: accumulatedCommission
    },
    period: {
      paymentDate: paymentEvent.payment.paymentDate,
      coveredStart: paymentEvent.payment.periodCoveredStart,
      coveredEnd: paymentEvent.payment.periodCoveredEnd,
      asOf
    },
    evidence: {
      paymentEvidenceReference:
        paymentEvent.references.paymentEvidenceReference,
      evidenceHash: paymentEvent.evidence.evidenceHash,
      humanDecisionId: paymentEvent.humanConfirmation.decisionId,
      policyContextSnapshotReference:
        paymentEvent.metadata?.policyContextSnapshotReference || null
    },
    explanation: {
      formula: "confirmed_paid_premium × base_rate × development_factor",
      current: `${basis.currentConfirmedPaidPremium} × ${baseRate} × ${development.factor} = ${currentCommission}`,
      accumulated: `${basis.accumulatedConfirmedPaidPremium} × ${baseRate} × ${development.factor} = ${accumulatedCommission}`,
      basisState: basis.basisState,
      candidateRuleWarning: officialRule
        ? null
        : "Rule Pack is candidate; calculation remains ESTIMATED."
    },
    calculationDigest,
    digestPayload,
    safeguards: {
      confirmedPaymentIsNotPaidCommission: true,
      candidateRuleIsNotOfficialTruth: !officialRule,
      automaticEarnedPromotion: false,
      payoutTruth: false,
      compensationEventWritten: false,
      externalMutationAuthorized: false
    }
  };

  return deepFreeze(result);
}

module.exports = {
  determineCalculationType,
  resolveDevelopmentFactor,
  resolvePointsAndWeightedPremium,
  calculateAdvisorCommission
};
