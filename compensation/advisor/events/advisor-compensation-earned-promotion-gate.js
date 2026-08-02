"use strict";

const {
  ADVISOR_COMPENSATION_EVENT_STATES,
  createAdvisorCompensationEvent,
  clone,
  present
} = require("./advisor-compensation-event-contract");

function blocked(reasons, details = {}) {
  return Object.freeze({
    status: "BLOCKED",
    eligible: false,
    reasons: Object.freeze([...new Set(reasons)]),
    details: Object.freeze(clone(details)),
    payoutTruth: false,
    mutationAuthorized: false
  });
}

function evaluateAdvisorCompensationEarnedPromotion({
  estimatedEvent,
  calculation,
  paymentEvent,
  officialRuleSnapshot
} = {}) {
  const reasons = [];
  if (!estimatedEvent || estimatedEvent.state !== ADVISOR_COMPENSATION_EVENT_STATES.ESTIMATED) {
    reasons.push("estimated_event_required");
  }
  if (!calculation || calculation.status !== "CALCULATED") reasons.push("calculation_required");
  if (calculation?.eligibleForEarnedPromotion !== true) {
    reasons.push("calculation_not_eligible_for_earned_promotion");
  }
  if (estimatedEvent?.lineage?.sourceCalculationDigest !== calculation?.calculationDigest) {
    reasons.push("calculation_digest_mismatch");
  }
  if (estimatedEvent?.advisorReference !== calculation?.advisorReference) {
    reasons.push("advisor_reference_mismatch");
  }
  if (estimatedEvent?.policyReference !== (calculation?.policyReference || null)) {
    reasons.push("policy_reference_mismatch");
  }
  if (estimatedEvent?.paymentEventId !== (calculation?.paymentEventId || null)) {
    reasons.push("payment_event_reference_mismatch");
  }
  if (!paymentEvent || paymentEvent.truthClass !== "CONFIRMED_PAYMENT") {
    reasons.push("confirmed_payment_event_required");
  }
  if (paymentEvent?.eventId !== estimatedEvent?.paymentEventId) {
    reasons.push("confirmed_payment_event_id_mismatch");
  }
  if (paymentEvent?.interpretation?.readyForCalculation !== true) {
    reasons.push("confirmed_payment_event_not_ready");
  }
  if (paymentEvent?.safeguards?.payoutTruth !== false) {
    reasons.push("payment_event_payout_truth_invalid");
  }
  if (!officialRuleSnapshot || officialRuleSnapshot.governanceStatus !== "official") {
    reasons.push("official_rule_snapshot_required");
  }
  if (officialRuleSnapshot?.officialSourceTruth !== true) {
    reasons.push("official_rule_source_truth_required");
  }
  if (officialRuleSnapshot?.calculatedDigest !== calculation?.rule?.rulePackDigest) {
    reasons.push("rule_snapshot_digest_mismatch");
  }
  if (calculation?.rule?.governanceStatus !== "official") {
    reasons.push("calculation_rule_not_official");
  }
  if (!present(calculation?.evidence?.paymentEvidenceReference)) {
    reasons.push("payment_evidence_reference_required");
  }
  if (!present(calculation?.evidence?.humanDecisionId)) {
    reasons.push("human_decision_reference_required");
  }

  if (reasons.length) return blocked(reasons);
  return Object.freeze({
    status: "READY",
    eligible: true,
    reasons: Object.freeze([]),
    promotionBasis: Object.freeze({
      confirmedPaymentEventId: paymentEvent.eventId,
      paymentEvidenceReference: calculation.evidence.paymentEvidenceReference,
      humanDecisionId: calculation.evidence.humanDecisionId,
      calculationDigest: calculation.calculationDigest,
      rulePackDigest: calculation.rule.rulePackDigest,
      rulePackId: calculation.rule.rulePackId,
      rulePackVersion: calculation.rule.rulePackVersion,
      ruleSnapshotCapturedAt: officialRuleSnapshot.capturedAt || null
    }),
    payoutTruth: false,
    mutationAuthorized: false
  });
}

function promoteAdvisorCompensationEventToEarned({
  estimatedEvent,
  promotionEvaluation,
  idempotencyKey,
  correlationId,
  createdAt,
  actorId = null,
  sequence = null,
  metadata = {}
} = {}) {
  if (!promotionEvaluation || promotionEvaluation.status !== "READY" ||
      promotionEvaluation.eligible !== true) {
    const error = new Error("ADVISOR_COMPENSATION_EARNED_PROMOTION_NOT_READY");
    error.code = "ADVISOR_COMPENSATION_EARNED_PROMOTION_NOT_READY";
    throw error;
  }
  const nextSequence = Number.isInteger(sequence) && sequence > 0
    ? sequence
    : estimatedEvent.sequence + 1;

  return createAdvisorCompensationEvent({
    eventId: `advisor-compensation-event:earned:${estimatedEvent.lineage.sourceCalculationDigest}`,
    aggregateKey: estimatedEvent.aggregateKey,
    sequence: nextSequence,
    previousEventId: estimatedEvent.eventId,
    state: ADVISOR_COMPENSATION_EVENT_STATES.EARNED,
    kind: estimatedEvent.kind,
    concept: estimatedEvent.concept,
    advisorReference: estimatedEvent.advisorReference,
    policyReference: estimatedEvent.policyReference,
    paymentEventId: estimatedEvent.paymentEventId,
    periodKey: estimatedEvent.periodKey,
    amount: estimatedEvent.amount.value,
    currency: estimatedEvent.amount.currency,
    calculation: estimatedEvent.calculation,
    ruleSnapshot: estimatedEvent.ruleSnapshot,
    evidenceReferences: estimatedEvent.evidence.references,
    paymentEvidenceReference: estimatedEvent.evidence.paymentEvidenceReference,
    evidenceHash: estimatedEvent.evidence.evidenceHash,
    humanDecisionId: estimatedEvent.evidence.humanDecisionId,
    promotionEvidence: promotionEvaluation.promotionBasis,
    sourceCalculationId: estimatedEvent.lineage.sourceCalculationId,
    sourceCalculationDigest: estimatedEvent.lineage.sourceCalculationDigest,
    reason: "confirmed_payment_and_official_rule_promoted_to_earned",
    actorId,
    idempotencyKey,
    correlationId,
    createdAt,
    safeguards: {
      automaticEarnedPromotion: false,
      humanOrGovernedGateRequired: true
    },
    metadata: {
      ...metadata,
      promotedFromEventId: estimatedEvent.eventId,
      payoutTruth: false
    }
  });
}

module.exports = {
  evaluateAdvisorCompensationEarnedPromotion,
  promoteAdvisorCompensationEventToEarned
};
