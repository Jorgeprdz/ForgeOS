"use strict";

const ADVISOR_COMPENSATION_SCOPES = Object.freeze({
  ADVISOR_COMPENSATION: "ADVISOR_COMPENSATION",
  PARTNER_COMPENSATION: "PARTNER_COMPENSATION",
  MANAGER_COMPENSATION: "MANAGER_COMPENSATION",
  ADVISOR_DEVELOPMENT_COMPENSATION: "ADVISOR_DEVELOPMENT_COMPENSATION"
});

const ADVISOR_COMPENSATION_TRUTH_STATES = Object.freeze({
  UNKNOWN: "UNKNOWN",
  POTENTIAL: "POTENTIAL",
  ESTIMATED: "ESTIMATED",
  EARNED: "EARNED",
  PAID: "PAID",
  ADJUSTED: "ADJUSTED",
  REVERSED: "REVERSED",
  BLOCKED: "BLOCKED",
  CONFLICTING: "CONFLICTING"
});

const ADVISOR_COMPENSATION_BOUNDARY_STATUSES = Object.freeze({
  READY: "READY",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_HUMAN_CONFIRMATION: "NEEDS_HUMAN_CONFIRMATION",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN"
});

const ADVISOR_COMPENSATION_USES = Object.freeze({
  BUILD_POTENTIAL: "BUILD_POTENTIAL",
  CALCULATE_ESTIMATE: "CALCULATE_ESTIMATE",
  PROMOTE_EARNED: "PROMOTE_EARNED",
  PROMOTE_PAID: "PROMOTE_PAID",
  APPLY_ADJUSTMENT: "APPLY_ADJUSTMENT",
  APPLY_REVERSAL: "APPLY_REVERSAL",
  BUILD_PERIOD_SNAPSHOT: "BUILD_PERIOD_SNAPSHOT",
  RUN_SIMULATION: "RUN_SIMULATION"
});

const ADVISOR_COMPENSATION_AUTHORITIES = Object.freeze({
  policyTruth: "POLICY_TRUTH",
  productTruth: "PRODUCT_TRUTH",
  paymentObligation: "CARTERA_PAYMENT_OBLIGATION",
  paidPremiumTruth: "CONFIRMED_PAYMENT_EVENT",
  compensationRules: "COMPENSATION_RULE_SNAPSHOT",
  compensationCalculation: "COMPENSATION_INTELLIGENCE",
  compensationPayoutTruth: "COMPENSATION_PAYOUT_EVIDENCE",
  advisorPresentation: "ADVISOR_EXPERIENCE",
  homeSummary: "SMART_WIDGETS"
});

const ADVISOR_COMPENSATION_FORBIDDEN_SHORTCUTS = Object.freeze([
  "ISSUED_PREMIUM_AS_PAID",
  "QUOTE_AS_INCOME",
  "DEFAULT_COMMISSION_RATE",
  "UNKNOWN_PRODUCT_CALCULATION",
  "AUTOMATIC_PAYOUT_CONFIRMATION",
  "PRODUCT_RECOMMENDATION_BY_COMMISSION"
]);

const ALLOWED_SCOPES = Object.freeze([
  ADVISOR_COMPENSATION_SCOPES.ADVISOR_COMPENSATION
]);

const ALLOWED_USES = Object.freeze(Object.values(ADVISOR_COMPENSATION_USES));

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function normalize(value) {
  return present(value) ? String(value).trim().toUpperCase() : null;
}

function clone(value) {
  if (!present(value)) return value;
  return JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value];
}

function evaluateAdvisorCompensationBoundary(input = {}) {
  const safeInput = clone(input) || {};
  const requestedScope = normalize(
    safeInput.requestedScope || ADVISOR_COMPENSATION_SCOPES.ADVISOR_COMPENSATION
  );
  const requestedUse = normalize(
    safeInput.requestedUse || ADVISOR_COMPENSATION_USES.CALCULATE_ESTIMATE
  );
  const requestedTruthState = normalize(safeInput.requestedTruthState);
  const attemptedShortcuts = unique(
    asArray(safeInput.attemptedShortcuts).map(normalize)
  );
  const evidence = safeInput.evidence && typeof safeInput.evidence === "object"
    ? safeInput.evidence
    : {};
  const assumptions = asArray(safeInput.assumptions).map(String);
  const missingEvidence = [];
  const blockedReasons = [];
  const warnings = [];

  if (!ALLOWED_SCOPES.includes(requestedScope)) {
    blockedReasons.push(`scope_not_authorized:${requestedScope || "UNKNOWN"}`);
  }

  if (!ALLOWED_USES.includes(requestedUse)) {
    blockedReasons.push(`use_not_modeled:${requestedUse || "UNKNOWN"}`);
  }

  attemptedShortcuts.forEach((shortcut) => {
    if (ADVISOR_COMPENSATION_FORBIDDEN_SHORTCUTS.includes(shortcut)) {
      blockedReasons.push(`forbidden_shortcut:${shortcut}`);
    }
  });

  const hasPolicyTruth = evidence.policyTruth === true;
  const hasProductTruth = evidence.productTruth === true;
  const hasRuleSnapshot = evidence.ruleSnapshot === true;
  const hasConfirmedPaymentEvent = evidence.confirmedPaymentEvent === true;
  const hasPayoutEvidence = evidence.payoutEvidence === true;
  const hasHumanPayoutConfirmation = evidence.humanPayoutConfirmation === true;
  const hasPriorActiveCompensationEvent = evidence.priorActiveCompensationEvent === true;

  if (!hasPolicyTruth) missingEvidence.push("policy_truth");
  if (!hasProductTruth) missingEvidence.push("product_truth");

  const needsRuleSnapshot = [
    ADVISOR_COMPENSATION_USES.CALCULATE_ESTIMATE,
    ADVISOR_COMPENSATION_USES.PROMOTE_EARNED,
    ADVISOR_COMPENSATION_USES.PROMOTE_PAID,
    ADVISOR_COMPENSATION_USES.APPLY_ADJUSTMENT,
    ADVISOR_COMPENSATION_USES.APPLY_REVERSAL
  ].includes(requestedUse);

  if (needsRuleSnapshot && !hasRuleSnapshot) {
    missingEvidence.push("compensation_rule_snapshot");
  }

  if (
    requestedUse === ADVISOR_COMPENSATION_USES.PROMOTE_EARNED ||
    requestedUse === ADVISOR_COMPENSATION_USES.PROMOTE_PAID
  ) {
    if (!hasConfirmedPaymentEvent) {
      missingEvidence.push("confirmed_payment_event");
    }
  }

  if (requestedUse === ADVISOR_COMPENSATION_USES.PROMOTE_PAID) {
    if (!hasPayoutEvidence) missingEvidence.push("compensation_payout_evidence");
    if (!hasHumanPayoutConfirmation) {
      missingEvidence.push("human_payout_confirmation");
    }
  }

  if (
    requestedUse === ADVISOR_COMPENSATION_USES.APPLY_ADJUSTMENT ||
    requestedUse === ADVISOR_COMPENSATION_USES.APPLY_REVERSAL
  ) {
    if (!hasPriorActiveCompensationEvent) {
      missingEvidence.push("prior_active_compensation_event");
    }
  }

  if (
    requestedTruthState === ADVISOR_COMPENSATION_TRUTH_STATES.PAID &&
    (!hasPayoutEvidence || !hasHumanPayoutConfirmation)
  ) {
    blockedReasons.push("paid_truth_requires_payout_evidence_and_human_confirmation");
  }

  if (
    requestedTruthState === ADVISOR_COMPENSATION_TRUTH_STATES.EARNED &&
    !hasConfirmedPaymentEvent
  ) {
    blockedReasons.push("earned_truth_requires_confirmed_payment_event");
  }

  if (
    requestedUse === ADVISOR_COMPENSATION_USES.RUN_SIMULATION &&
    [
      ADVISOR_COMPENSATION_TRUTH_STATES.EARNED,
      ADVISOR_COMPENSATION_TRUTH_STATES.PAID
    ].includes(requestedTruthState)
  ) {
    blockedReasons.push("simulation_cannot_create_earned_or_paid_truth");
  }

  if (!hasRuleSnapshot && assumptions.length > 0) {
    warnings.push("assumptions_do_not_replace_rule_snapshot");
  }

  let permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.UNKNOWN;

  if (requestedUse === ADVISOR_COMPENSATION_USES.BUILD_POTENTIAL) {
    permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.POTENTIAL;
  } else if (
    requestedUse === ADVISOR_COMPENSATION_USES.CALCULATE_ESTIMATE ||
    requestedUse === ADVISOR_COMPENSATION_USES.RUN_SIMULATION
  ) {
    permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.ESTIMATED;
  } else if (requestedUse === ADVISOR_COMPENSATION_USES.PROMOTE_EARNED) {
    permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.EARNED;
  } else if (requestedUse === ADVISOR_COMPENSATION_USES.PROMOTE_PAID) {
    permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.PAID;
  } else if (requestedUse === ADVISOR_COMPENSATION_USES.APPLY_ADJUSTMENT) {
    permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.ADJUSTED;
  } else if (requestedUse === ADVISOR_COMPENSATION_USES.APPLY_REVERSAL) {
    permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.REVERSED;
  }

  let boundaryStatus = ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY;

  if (blockedReasons.length > 0) {
    boundaryStatus = ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED;
    permittedTruthState = ADVISOR_COMPENSATION_TRUTH_STATES.BLOCKED;
  } else if (missingEvidence.includes("human_payout_confirmation")) {
    boundaryStatus = ADVISOR_COMPENSATION_BOUNDARY_STATUSES.NEEDS_HUMAN_CONFIRMATION;
  } else if (missingEvidence.length > 0) {
    boundaryStatus = ADVISOR_COMPENSATION_BOUNDARY_STATUSES.NEEDS_EVIDENCE;
  }

  return Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_BOUNDARY_001",
    requestedScope,
    requestedUse,
    requestedTruthState,
    boundaryStatus,
    permittedTruthState,
    missingEvidence: unique(missingEvidence),
    blockedReasons: unique(blockedReasons),
    attemptedShortcuts,
    warnings: unique(warnings),
    assumptions,
    authorities: ADVISOR_COMPENSATION_AUTHORITIES,
    safeguards: Object.freeze({
      unknownIsNotZero: true,
      issuedPremiumIsNotPaidPremium: true,
      paidPremiumIsNotPaidCommission: true,
      quoteIsNotIncome: true,
      simulationIsNotEarned: true,
      simulationIsNotPaid: true,
      defaultCommissionRateForbidden: true,
      automaticPayoutConfirmationForbidden: true,
      productRecommendationByCommissionForbidden: true
    }),
    mutationAuthorized: false,
    payoutPromotionAuthorized:
      boundaryStatus === ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY &&
      permittedTruthState === ADVISOR_COMPENSATION_TRUTH_STATES.PAID
  });
}

module.exports = {
  ADVISOR_COMPENSATION_SCOPES,
  ADVISOR_COMPENSATION_TRUTH_STATES,
  ADVISOR_COMPENSATION_BOUNDARY_STATUSES,
  ADVISOR_COMPENSATION_USES,
  ADVISOR_COMPENSATION_AUTHORITIES,
  ADVISOR_COMPENSATION_FORBIDDEN_SHORTCUTS,
  evaluateAdvisorCompensationBoundary
};
