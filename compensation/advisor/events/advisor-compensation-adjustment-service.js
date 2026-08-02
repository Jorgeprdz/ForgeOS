"use strict";

const {
  ADVISOR_COMPENSATION_EVENT_STATES,
  ADVISOR_COMPENSATION_EVENT_KINDS,
  ADVISOR_COMPENSATION_EVENT_CONCEPTS,
  createAdvisorCompensationEvent,
  present
} = require("./advisor-compensation-event-contract");

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function validateBaseEvent(baseEvent) {
  if (!baseEvent || !["EARNED", "ADJUSTED"].includes(baseEvent.state)) {
    fail("ADVISOR_COMPENSATION_ADJUSTMENT_BASE_EVENT_INVALID");
  }
  if (!Number.isFinite(baseEvent.amount?.value)) {
    fail("ADVISOR_COMPENSATION_ADJUSTMENT_BASE_AMOUNT_INVALID");
  }
}

function resolveCurrentNetAmount(baseEvent) {
  validateBaseEvent(baseEvent);
  if (baseEvent.state === ADVISOR_COMPENSATION_EVENT_STATES.EARNED) {
    return baseEvent.amount.value;
  }
  const currentNetAmount = Number(baseEvent.metadata?.resultingNetAmount);
  if (!Number.isFinite(currentNetAmount)) {
    fail("ADVISOR_COMPENSATION_ADJUSTED_NET_AMOUNT_REQUIRED");
  }
  return Math.round(currentNetAmount * 100) / 100;
}

function createAdvisorCompensationAdjustmentEvent({
  baseEvent,
  amountDelta,
  concept = ADVISOR_COMPENSATION_EVENT_CONCEPTS.RETROACTIVE_DIFFERENCE,
  reason,
  actorId,
  evidenceReferences = [],
  idempotencyKey,
  correlationId,
  createdAt,
  metadata = {}
} = {}) {
  validateBaseEvent(baseEvent);
  if (amountDelta === null || amountDelta === undefined || amountDelta === "" ||
      !Number.isFinite(Number(amountDelta)) || Number(amountDelta) === 0) {
    fail("ADVISOR_COMPENSATION_ADJUSTMENT_DELTA_INVALID");
  }
  if (!present(reason)) fail("ADVISOR_COMPENSATION_ADJUSTMENT_REASON_REQUIRED");
  if (!present(actorId)) fail("ADVISOR_COMPENSATION_ADJUSTMENT_ACTOR_REQUIRED");

  const delta = Math.round(Number(amountDelta) * 100) / 100;
  const baseNetAmount = resolveCurrentNetAmount(baseEvent);
  const resultingNetAmount = Math.round((baseNetAmount + delta) * 100) / 100;
  return createAdvisorCompensationEvent({
    eventId: `advisor-compensation-event:adjustment:${baseEvent.eventDigest}:${String(idempotencyKey)}`,
    aggregateKey: baseEvent.aggregateKey,
    sequence: baseEvent.sequence + 1,
    previousEventId: baseEvent.eventId,
    state: ADVISOR_COMPENSATION_EVENT_STATES.ADJUSTED,
    kind: ADVISOR_COMPENSATION_EVENT_KINDS.ADJUSTMENT,
    concept,
    advisorReference: baseEvent.advisorReference,
    policyReference: baseEvent.policyReference,
    paymentEventId: baseEvent.paymentEventId,
    periodKey: baseEvent.periodKey,
    amount: delta,
    currency: baseEvent.amount.currency,
    calculation: baseEvent.calculation,
    ruleSnapshot: baseEvent.ruleSnapshot,
    evidenceReferences: [
      ...baseEvent.evidence.references,
      ...evidenceReferences
    ],
    paymentEvidenceReference: baseEvent.evidence.paymentEvidenceReference,
    evidenceHash: baseEvent.evidence.evidenceHash,
    humanDecisionId: baseEvent.evidence.humanDecisionId,
    sourceCalculationId: baseEvent.lineage.sourceCalculationId,
    sourceCalculationDigest: baseEvent.lineage.sourceCalculationDigest,
    adjustedEventId: baseEvent.eventId,
    reason,
    actorId,
    idempotencyKey,
    correlationId,
    createdAt,
    safeguards: {
      adjustmentRequiresReason: true,
      automaticAdjustment: false
    },
    metadata: {
      ...metadata,
      baseAmount: baseNetAmount,
      adjustmentDelta: delta,
      resultingNetAmount,
      payoutTruth: false
    }
  });
}

function createAdvisorCompensationReversalEvent({
  baseEvent,
  reason,
  actorId,
  evidenceReferences = [],
  idempotencyKey,
  correlationId,
  createdAt,
  metadata = {}
} = {}) {
  validateBaseEvent(baseEvent);
  if (!present(reason)) fail("ADVISOR_COMPENSATION_REVERSAL_REASON_REQUIRED");
  if (!present(actorId)) fail("ADVISOR_COMPENSATION_REVERSAL_ACTOR_REQUIRED");

  const currentNetAmount = resolveCurrentNetAmount(baseEvent);
  if (currentNetAmount <= 0) {
    fail("ADVISOR_COMPENSATION_REVERSAL_POSITIVE_BASE_REQUIRED");
  }

  return createAdvisorCompensationEvent({
    eventId: `advisor-compensation-event:reversal:${baseEvent.eventDigest}:${String(idempotencyKey)}`,
    aggregateKey: baseEvent.aggregateKey,
    sequence: baseEvent.sequence + 1,
    previousEventId: baseEvent.eventId,
    state: ADVISOR_COMPENSATION_EVENT_STATES.REVERSED,
    kind: ADVISOR_COMPENSATION_EVENT_KINDS.REVERSAL,
    concept: ADVISOR_COMPENSATION_EVENT_CONCEPTS.FULL_REVERSAL,
    advisorReference: baseEvent.advisorReference,
    policyReference: baseEvent.policyReference,
    paymentEventId: baseEvent.paymentEventId,
    periodKey: baseEvent.periodKey,
    amount: -Math.abs(currentNetAmount),
    currency: baseEvent.amount.currency,
    calculation: baseEvent.calculation,
    ruleSnapshot: baseEvent.ruleSnapshot,
    evidenceReferences: [
      ...baseEvent.evidence.references,
      ...evidenceReferences
    ],
    paymentEvidenceReference: baseEvent.evidence.paymentEvidenceReference,
    evidenceHash: baseEvent.evidence.evidenceHash,
    humanDecisionId: baseEvent.evidence.humanDecisionId,
    sourceCalculationId: baseEvent.lineage.sourceCalculationId,
    sourceCalculationDigest: baseEvent.lineage.sourceCalculationDigest,
    reversedEventId: baseEvent.eventId,
    reason,
    actorId,
    idempotencyKey,
    correlationId,
    createdAt,
    safeguards: {
      reversalRequiresReason: true,
      automaticReversal: false
    },
    metadata: {
      ...metadata,
      reversedAmount: currentNetAmount,
      resultingNetAmount: 0,
      payoutTruth: false
    }
  });
}

module.exports = {
  resolveCurrentNetAmount,
  createAdvisorCompensationAdjustmentEvent,
  createAdvisorCompensationReversalEvent
};
