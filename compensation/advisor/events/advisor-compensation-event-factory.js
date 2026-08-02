"use strict";

const {
  ADVISOR_COMPENSATION_EVENT_STATES,
  ADVISOR_COMPENSATION_EVENT_KINDS,
  createAdvisorCompensationEvent,
  present,
  sha256
} = require("./advisor-compensation-event-contract");

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function periodKeyFromCalculation(calculation, explicitPeriodKey) {
  if (present(explicitPeriodKey)) return String(explicitPeriodKey).trim();
  const date = calculation?.period?.paymentDate || calculation?.calculatedAt;
  if (typeof date === "string" && /^\d{4}-\d{2}/.test(date)) return date.slice(0, 7);
  fail("ADVISOR_COMPENSATION_PERIOD_KEY_REQUIRED");
}

function classifyCalculation(calculation) {
  if (!calculation || calculation.status !== "CALCULATED") {
    fail("ADVISOR_COMPENSATION_CALCULATION_NOT_CALCULATED");
  }
  if (!/^[a-f0-9]{64}$/.test(calculation.calculationDigest || "")) {
    fail("ADVISOR_COMPENSATION_CALCULATION_DIGEST_INVALID");
  }

  if (calculation.calculationType) {
    const amount = calculation.amounts?.commissionAmount;
    if (!Number.isFinite(amount) || amount < 0) fail("ADVISOR_COMPENSATION_COMMISSION_AMOUNT_INVALID");
    return {
      kind: ADVISOR_COMPENSATION_EVENT_KINDS.COMMISSION,
      concept: calculation.calculationType,
      amount,
      currency: calculation.amounts.currency,
      advisorReference: calculation.advisorReference,
      policyReference: calculation.policyReference,
      paymentEventId: calculation.paymentEventId,
      paymentEvidenceReference: calculation.evidence?.paymentEvidenceReference,
      evidenceHash: calculation.evidence?.evidenceHash,
      humanDecisionId: calculation.evidence?.humanDecisionId,
      calculationRecord: {
        calculationId: calculation.calculationId,
        calculationType: calculation.calculationType,
        calculationDigest: calculation.calculationDigest,
        truthState: calculation.truthState,
        eligibleForEarnedPromotion: calculation.eligibleForEarnedPromotion,
        product: calculation.product,
        basis: calculation.basis,
        production: calculation.production,
        amounts: calculation.amounts,
        period: calculation.period,
        explanation: calculation.explanation
      },
      ruleSnapshot: {
        ruleId: calculation.rule?.ruleId,
        rulePackId: calculation.rule?.rulePackId,
        rulePackVersion: calculation.rule?.rulePackVersion,
        rulePackDigest: calculation.rule?.rulePackDigest,
        governanceStatus: calculation.rule?.governanceStatus,
        sourceState: calculation.rule?.sourceState,
        bandKey: calculation.rule?.bandKey,
        commissionBasis: calculation.rule?.commissionBasis,
        baseRate: calculation.rule?.baseRate,
        developmentFactor: calculation.rule?.developmentFactor,
        effectiveRate: calculation.rule?.effectiveRate
      }
    };
  }

  if (calculation.concept) {
    const amount = Number.isFinite(calculation.amounts?.candidateAmount)
      ? calculation.amounts.candidateAmount
      : calculation.candidateAmount;
    if (!Number.isFinite(amount) || amount < 0) fail("ADVISOR_COMPENSATION_BONUS_AMOUNT_INVALID");
    return {
      kind: ADVISOR_COMPENSATION_EVENT_KINDS.BONUS,
      concept: calculation.concept,
      amount,
      currency: calculation.currency || "MXN",
      advisorReference: calculation.advisorReference || null,
      policyReference: null,
      paymentEventId: null,
      paymentEvidenceReference: null,
      evidenceHash: null,
      humanDecisionId: null,
      calculationRecord: {
        concept: calculation.concept,
        calculationDigest: calculation.calculationDigest,
        truthState: calculation.truthState,
        eligibleForEarnedPromotion: calculation.eligibleForEarnedPromotion,
        qualifies: calculation.qualifies,
        inputs: calculation.inputs || calculation.actual || null,
        amounts: calculation.amounts || { candidateAmount: amount },
        authority: calculation.authority || null,
        warnings: calculation.warnings || []
      },
      ruleSnapshot: calculation.authority || {
        governanceStatus: calculation.ruleGovernanceStatus || "candidate",
        sourceState: calculation.ruleSourceState || null
      }
    };
  }

  fail("ADVISOR_COMPENSATION_CALCULATION_TYPE_UNSUPPORTED");
}

function createEstimatedAdvisorCompensationEvent({
  calculation,
  advisorReference = null,
  periodKey = null,
  idempotencyKey,
  correlationId,
  createdAt,
  sequence = 1,
  previousEventId = null,
  evidenceReferences = [],
  metadata = {}
} = {}) {
  const classified = classifyCalculation(calculation);
  const advisor = advisorReference || classified.advisorReference;
  if (!present(advisor)) fail("ADVISOR_COMPENSATION_EVENT_ADVISOR_REQUIRED");
  const period = periodKeyFromCalculation(calculation, periodKey);
  const aggregateKey = [
    "advisor-compensation",
    advisor,
    classified.policyReference || classified.concept,
    period
  ].join(":");
  const eventId = `advisor-compensation-event:estimated:${calculation.calculationDigest}`;

  return createAdvisorCompensationEvent({
    eventId,
    aggregateKey,
    sequence,
    previousEventId,
    state: ADVISOR_COMPENSATION_EVENT_STATES.ESTIMATED,
    kind: classified.kind,
    concept: classified.concept,
    advisorReference: advisor,
    policyReference: classified.policyReference,
    paymentEventId: classified.paymentEventId,
    periodKey: period,
    amount: classified.amount,
    currency: classified.currency || "MXN",
    calculation: classified.calculationRecord,
    ruleSnapshot: classified.ruleSnapshot,
    evidenceReferences,
    paymentEvidenceReference: classified.paymentEvidenceReference,
    evidenceHash: classified.evidenceHash,
    humanDecisionId: classified.humanDecisionId,
    sourceCalculationId: calculation.calculationId || null,
    sourceCalculationDigest: calculation.calculationDigest,
    reason: "calculation_recorded_as_estimated",
    idempotencyKey,
    correlationId,
    createdAt,
    metadata: {
      ...metadata,
      sourceTruthState: calculation.truthState,
      earnedPromotionEvaluated: false,
      payoutTruth: false
    }
  });
}

function calculateCalculationRecordDigest(event) {
  return sha256({
    calculation: event.calculation,
    ruleSnapshot: event.ruleSnapshot,
    sourceCalculationDigest: event.lineage?.sourceCalculationDigest,
    amount: event.amount,
    advisorReference: event.advisorReference,
    policyReference: event.policyReference,
    paymentEventId: event.paymentEventId,
    periodKey: event.periodKey
  });
}

module.exports = {
  periodKeyFromCalculation,
  classifyCalculation,
  createEstimatedAdvisorCompensationEvent,
  calculateCalculationRecordDigest
};
