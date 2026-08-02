"use strict";

const {
  PAYMENT_INTAKE_STATUSES,
  PAYMENT_CONFLICT_TYPES,
  COMPENSATION_INTERPRETATION_STATES,
  deepFreeze
} = require("./advisor-compensation-payment-event-contract");
const {
  adaptCartera080PaymentToAdvisorCompensationEvent
} = require("./advisor-compensation-payment-event-adapter");

function createInMemoryAdvisorCompensationPaymentIntakeStore() {
  const byIdempotencyKey = new Map();
  const byEvidenceFingerprint = new Map();
  const bySemanticFingerprint = new Map();

  return Object.freeze({
    getByIdempotencyKey(key) {
      return byIdempotencyKey.get(key) || null;
    },
    getByEvidenceFingerprint(fingerprint) {
      return byEvidenceFingerprint.get(fingerprint) || null;
    },
    getBySemanticFingerprint(fingerprint) {
      return bySemanticFingerprint.get(fingerprint) || null;
    },
    put(event) {
      byIdempotencyKey.set(event.source.idempotencyKey, event);
      byEvidenceFingerprint.set(event.fingerprints.evidenceFingerprint, event);
      bySemanticFingerprint.set(event.fingerprints.semanticFingerprint, event);
      return event;
    },
    size() {
      return byIdempotencyKey.size;
    },
    snapshot() {
      return Object.freeze([...byIdempotencyKey.values()]);
    }
  });
}

function conflictResult({ conflictType, incomingEvent, existingEvent, reason }) {
  return deepFreeze({
    intakeStatus: PAYMENT_INTAKE_STATUSES.BLOCKED_CONFLICT,
    conflictType,
    reason,
    event: null,
    incomingEventId: incomingEvent.eventId,
    existingEventId: existingEvent ? existingEvent.eventId : null,
    incomingCommandDigest: incomingEvent.source.commandDigest,
    existingCommandDigest: existingEvent && existingEvent.source
      ? existingEvent.source.commandDigest
      : null,
    interpretationState: COMPENSATION_INTERPRETATION_STATES.BLOCKED_CONFLICT,
    replayed: false,
    commissionCalculationPerformed: false,
    compensationEventWritten: false,
    externalMutationAuthorized: false,
    payoutTruth: false
  });
}

function acceptedResult(event) {
  return deepFreeze({
    intakeStatus: PAYMENT_INTAKE_STATUSES.ACCEPTED,
    conflictType: null,
    reason: null,
    event,
    replayed: false,
    commissionCalculationPerformed: false,
    compensationEventWritten: false,
    externalMutationAuthorized: false,
    payoutTruth: false
  });
}

function replayResult(event) {
  return deepFreeze({
    intakeStatus: PAYMENT_INTAKE_STATUSES.REPLAYED,
    conflictType: null,
    reason: "same_idempotency_key_and_command_digest",
    event,
    replayed: true,
    commissionCalculationPerformed: false,
    compensationEventWritten: false,
    externalMutationAuthorized: false,
    payoutTruth: false
  });
}

function createAdvisorCompensationPaymentIntakeService({
  store = createInMemoryAdvisorCompensationPaymentIntakeStore(),
  productIdentities = []
} = {}) {
  if (!store || !store.getByIdempotencyKey || !store.getByEvidenceFingerprint ||
      !store.getBySemanticFingerprint || !store.put) {
    const error = new Error("ADVISOR_COMPENSATION_PAYMENT_INTAKE_STORE_REQUIRED");
    error.code = "ADVISOR_COMPENSATION_PAYMENT_INTAKE_STORE_REQUIRED";
    throw error;
  }

  return Object.freeze({
    intakeConfirmedPayment(payload = {}) {
      const incomingEvent = adaptCartera080PaymentToAdvisorCompensationEvent({
        ...payload,
        productIdentities: payload.productIdentities || productIdentities
      });

      const existingByIdempotency = store.getByIdempotencyKey(
        incomingEvent.source.idempotencyKey
      );
      if (existingByIdempotency) {
        if (existingByIdempotency.source.commandDigest === incomingEvent.source.commandDigest) {
          return replayResult(existingByIdempotency);
        }
        return conflictResult({
          conflictType: PAYMENT_CONFLICT_TYPES.IDEMPOTENCY_KEY_REUSE,
          incomingEvent,
          existingEvent: existingByIdempotency,
          reason: "same_idempotency_key_with_different_command_digest"
        });
      }

      const existingByEvidence = store.getByEvidenceFingerprint(
        incomingEvent.fingerprints.evidenceFingerprint
      );
      if (existingByEvidence) {
        return conflictResult({
          conflictType: PAYMENT_CONFLICT_TYPES.EVIDENCE_REUSE,
          incomingEvent,
          existingEvent: existingByEvidence,
          reason: existingByEvidence.fingerprints.semanticFingerprint ===
            incomingEvent.fingerprints.semanticFingerprint
            ? "same_evidence_reintroduced_with_new_idempotency_key"
            : "same_evidence_claims_different_payment_semantics"
        });
      }

      const existingBySemantic = store.getBySemanticFingerprint(
        incomingEvent.fingerprints.semanticFingerprint
      );
      if (existingBySemantic) {
        return conflictResult({
          conflictType: PAYMENT_CONFLICT_TYPES.SEMANTIC_DUPLICATE,
          incomingEvent,
          existingEvent: existingBySemantic,
          reason: "different_evidence_describes_same_payment_semantics"
        });
      }

      store.put(incomingEvent);
      return acceptedResult(incomingEvent);
    },
    size() {
      return store.size();
    },
    snapshot() {
      return store.snapshot ? store.snapshot() : Object.freeze([]);
    }
  });
}

module.exports = {
  createInMemoryAdvisorCompensationPaymentIntakeStore,
  createAdvisorCompensationPaymentIntakeService,
  conflictResult
};