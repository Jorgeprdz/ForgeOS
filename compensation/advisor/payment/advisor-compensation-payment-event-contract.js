"use strict";

const PAYMENT_EVENT_CONTRACT_VERSION = "ADVISOR_COMPENSATION_CONFIRMED_PAYMENT_EVENT_001";

const PAYMENT_EVENT_TYPES = Object.freeze({
  CONFIRMED_PREMIUM_PAYMENT: "CONFIRMED_PREMIUM_PAYMENT"
});

const PAYMENT_EVENT_TRUTH_CLASSES = Object.freeze({
  CONFIRMED_PAYMENT: "CONFIRMED_PAYMENT"
});

const COMPENSATION_INTERPRETATION_STATES = Object.freeze({
  NOT_INTERPRETED: "NOT_INTERPRETED",
  READY_FOR_INTERPRETATION: "READY_FOR_INTERPRETATION",
  NEEDS_POLICY_CONTEXT: "NEEDS_POLICY_CONTEXT",
  NEEDS_PRODUCT_IDENTITY: "NEEDS_PRODUCT_IDENTITY",
  NEEDS_ADVISOR_ATTRIBUTION: "NEEDS_ADVISOR_ATTRIBUTION",
  CONFLICTING_PRODUCT_IDENTITY: "CONFLICTING_PRODUCT_IDENTITY",
  BLOCKED_CONFLICT: "BLOCKED_CONFLICT"
});

const PAYMENT_INTAKE_STATUSES = Object.freeze({
  ACCEPTED: "ACCEPTED",
  REPLAYED: "REPLAYED",
  BLOCKED_CONFLICT: "BLOCKED_CONFLICT"
});

const PAYMENT_CONFLICT_TYPES = Object.freeze({
  IDEMPOTENCY_KEY_REUSE: "IDEMPOTENCY_KEY_REUSE",
  EVIDENCE_REUSE: "EVIDENCE_REUSE",
  SEMANTIC_DUPLICATE: "SEMANTIC_DUPLICATE"
});

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function requiredString(value, code) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
  return normalized;
}

function requiredPositiveMoney(value, code) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
  return amount;
}

function requiredDate(value, code) {
  const text = requiredString(value, code);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
  return text;
}

function optionalDate(value, code) {
  return present(value) ? requiredDate(value, code) : null;
}

function normalizeCurrency(value) {
  const currency = requiredString(value, "ADVISOR_COMPENSATION_PAYMENT_CURRENCY_REQUIRED").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    const error = new Error("ADVISOR_COMPENSATION_PAYMENT_CURRENCY_INVALID");
    error.code = "ADVISOR_COMPENSATION_PAYMENT_CURRENCY_INVALID";
    throw error;
  }
  return currency;
}

function createAdvisorCompensationConfirmedPaymentEvent(input = {}) {
  const coverageStart = optionalDate(
    input.periodCoveredStart,
    "ADVISOR_COMPENSATION_PAYMENT_PERIOD_START_INVALID"
  );
  const coverageEnd = optionalDate(
    input.periodCoveredEnd,
    "ADVISOR_COMPENSATION_PAYMENT_PERIOD_END_INVALID"
  );
  if (coverageStart && coverageEnd && coverageStart > coverageEnd) {
    const error = new Error("ADVISOR_COMPENSATION_PAYMENT_PERIOD_INVALID");
    error.code = "ADVISOR_COMPENSATION_PAYMENT_PERIOD_INVALID";
    throw error;
  }

  const event = {
    contractVersion: PAYMENT_EVENT_CONTRACT_VERSION,
    eventId: requiredString(input.eventId, "ADVISOR_COMPENSATION_PAYMENT_EVENT_ID_REQUIRED"),
    eventType: PAYMENT_EVENT_TYPES.CONFIRMED_PREMIUM_PAYMENT,
    truthClass: PAYMENT_EVENT_TRUTH_CLASSES.CONFIRMED_PAYMENT,
    source: {
      system: requiredString(input.sourceSystem, "ADVISOR_COMPENSATION_PAYMENT_SOURCE_SYSTEM_REQUIRED"),
      authority: requiredString(input.sourceAuthority, "ADVISOR_COMPENSATION_PAYMENT_SOURCE_AUTHORITY_REQUIRED"),
      handoffId: requiredString(input.handoffId, "ADVISOR_COMPENSATION_PAYMENT_HANDOFF_ID_REQUIRED"),
      commandDigest: requiredString(input.commandDigest, "ADVISOR_COMPENSATION_PAYMENT_COMMAND_DIGEST_REQUIRED"),
      idempotencyKey: requiredString(input.idempotencyKey, "ADVISOR_COMPENSATION_PAYMENT_IDEMPOTENCY_KEY_REQUIRED"),
      correlationId: requiredString(input.correlationId, "ADVISOR_COMPENSATION_PAYMENT_CORRELATION_ID_REQUIRED")
    },
    references: {
      paymentEvidenceReference: requiredString(
        input.paymentEvidenceReference,
        "ADVISOR_COMPENSATION_PAYMENT_EVIDENCE_REFERENCE_REQUIRED"
      ),
      policyReference: requiredString(
        input.policyReference,
        "ADVISOR_COMPENSATION_PAYMENT_POLICY_REFERENCE_REQUIRED"
      ),
      obligationReference: requiredString(
        input.obligationReference,
        "ADVISOR_COMPENSATION_PAYMENT_OBLIGATION_REFERENCE_REQUIRED"
      ),
      personReference: requiredString(
        input.personReference,
        "ADVISOR_COMPENSATION_PAYMENT_PERSON_REFERENCE_REQUIRED"
      ),
      advisorReference: present(input.advisorReference) ? String(input.advisorReference).trim() : null
    },
    productContext: {
      status: requiredString(input.productStatus, "ADVISOR_COMPENSATION_PAYMENT_PRODUCT_STATUS_REQUIRED"),
      productId: present(input.productId) ? String(input.productId).trim() : null,
      lineOfBusiness: present(input.lineOfBusiness) ? String(input.lineOfBusiness).trim() : null,
      variant: present(input.variant) ? String(input.variant).trim() : null,
      policyYear: Number.isInteger(input.policyYear) && input.policyYear > 0 ? input.policyYear : null,
      reason: present(input.productReason) ? String(input.productReason).trim() : null
    },
    payment: {
      amount: requiredPositiveMoney(
        input.paymentAmount,
        "ADVISOR_COMPENSATION_PAYMENT_AMOUNT_INVALID"
      ),
      currency: normalizeCurrency(input.currency),
      paymentDate: requiredDate(
        input.paymentDate,
        "ADVISOR_COMPENSATION_PAYMENT_DATE_INVALID"
      ),
      paymentSource: requiredString(
        input.paymentSource,
        "ADVISOR_COMPENSATION_PAYMENT_SOURCE_REQUIRED"
      ),
      periodCoveredStart: coverageStart,
      periodCoveredEnd: coverageEnd
    },
    evidence: {
      evidenceReferences: Object.freeze(
        [...new Set((Array.isArray(input.evidenceReferences) ? input.evidenceReferences : [])
          .filter(present)
          .map((item) => String(item).trim()))]
      ),
      evidenceHash: requiredString(
        input.evidenceHash,
        "ADVISOR_COMPENSATION_PAYMENT_EVIDENCE_HASH_REQUIRED"
      )
    },
    humanConfirmation: {
      decisionId: requiredString(
        input.humanDecisionId,
        "ADVISOR_COMPENSATION_PAYMENT_HUMAN_DECISION_ID_REQUIRED"
      ),
      actorId: requiredString(
        input.humanActorId,
        "ADVISOR_COMPENSATION_PAYMENT_HUMAN_ACTOR_REQUIRED"
      ),
      decidedAt: requiredString(
        input.humanDecidedAt,
        "ADVISOR_COMPENSATION_PAYMENT_HUMAN_DECIDED_AT_REQUIRED"
      ),
      reason: requiredString(
        input.humanReason,
        "ADVISOR_COMPENSATION_PAYMENT_HUMAN_REASON_REQUIRED"
      ),
      authorizationBasis: requiredString(
        input.authorizationBasis,
        "ADVISOR_COMPENSATION_PAYMENT_AUTHORIZATION_BASIS_REQUIRED"
      )
    },
    interpretation: {
      state: requiredString(
        input.interpretationState,
        "ADVISOR_COMPENSATION_PAYMENT_INTERPRETATION_STATE_REQUIRED"
      ),
      readyForCalculation: input.readyForCalculation === true,
      missingContext: Object.freeze(
        [...new Set((Array.isArray(input.missingContext) ? input.missingContext : [])
          .filter(present)
          .map(String))]
      )
    },
    fingerprints: {
      semanticFingerprint: requiredString(
        input.semanticFingerprint,
        "ADVISOR_COMPENSATION_PAYMENT_SEMANTIC_FINGERPRINT_REQUIRED"
      ),
      evidenceFingerprint: requiredString(
        input.evidenceFingerprint,
        "ADVISOR_COMPENSATION_PAYMENT_EVIDENCE_FINGERPRINT_REQUIRED"
      )
    },
    safeguards: {
      confirmedPremiumPaymentIsNotCommissionEarned: true,
      confirmedPremiumPaymentIsNotCommissionPaid: true,
      commissionCalculationRequested: false,
      commissionCalculationPerformed: false,
      compensationEventWritten: false,
      payoutTruth: false,
      externalMutationAuthorized: false
    },
    metadata: clone(input.metadata || {})
  };

  return deepFreeze(event);
}

function validateAdvisorCompensationConfirmedPaymentEvent(event) {
  const errors = [];
  if (!event || typeof event !== "object") {
    return Object.freeze({ valid: false, errors: Object.freeze(["payment_event_missing"]) });
  }
  if (event.contractVersion !== PAYMENT_EVENT_CONTRACT_VERSION) errors.push("payment_event_contract_version_invalid");
  if (event.eventType !== PAYMENT_EVENT_TYPES.CONFIRMED_PREMIUM_PAYMENT) errors.push("payment_event_type_invalid");
  if (event.truthClass !== PAYMENT_EVENT_TRUTH_CLASSES.CONFIRMED_PAYMENT) errors.push("payment_event_truth_class_invalid");
  if (event.safeguards?.commissionCalculationRequested !== false) errors.push("commission_calculation_requested_must_be_false");
  if (event.safeguards?.commissionCalculationPerformed !== false) errors.push("commission_calculation_performed_must_be_false");
  if (event.safeguards?.compensationEventWritten !== false) errors.push("compensation_event_written_must_be_false");
  if (event.safeguards?.payoutTruth !== false) errors.push("payout_truth_must_be_false");
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

module.exports = {
  PAYMENT_EVENT_CONTRACT_VERSION,
  PAYMENT_EVENT_TYPES,
  PAYMENT_EVENT_TRUTH_CLASSES,
  COMPENSATION_INTERPRETATION_STATES,
  PAYMENT_INTAKE_STATUSES,
  PAYMENT_CONFLICT_TYPES,
  deepFreeze,
  createAdvisorCompensationConfirmedPaymentEvent,
  validateAdvisorCompensationConfirmedPaymentEvent
};