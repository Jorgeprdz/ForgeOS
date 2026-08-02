"use strict";

const crypto = require("crypto");

const ADVISOR_COMPENSATION_EVENT_CONTRACT_VERSION = "ADVISOR_COMPENSATION_EVENT_001";

const ADVISOR_COMPENSATION_EVENT_STATES = Object.freeze({
  ESTIMATED: "ESTIMATED",
  EARNED: "EARNED",
  ADJUSTED: "ADJUSTED",
  REVERSED: "REVERSED"
});

const ADVISOR_COMPENSATION_EVENT_KINDS = Object.freeze({
  COMMISSION: "COMMISSION",
  BONUS: "BONUS",
  ADJUSTMENT: "ADJUSTMENT",
  REVERSAL: "REVERSAL"
});

const ADVISOR_COMPENSATION_EVENT_CONCEPTS = Object.freeze({
  LIFE_INITIAL: "LIFE_INITIAL",
  LIFE_RENEWAL: "LIFE_RENEWAL",
  GMM_INITIAL: "GMM_INITIAL",
  GMM_RENEWAL: "GMM_RENEWAL",
  TRAINING_ALLOWANCE: "TRAINING_ALLOWANCE",
  NEW_PROFESSIONAL_BONUS: "NEW_PROFESSIONAL_BONUS",
  GMM_QUARTERLY_BONUS: "GMM_QUARTERLY_BONUS",
  RETROACTIVE_DIFFERENCE: "RETROACTIVE_DIFFERENCE",
  RATE_CORRECTION: "RATE_CORRECTION",
  REFUND: "REFUND",
  CANCELLATION: "CANCELLATION",
  FULL_REVERSAL: "FULL_REVERSAL"
});

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stable(value[key]);
    return output;
  }, {});
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function requiredString(value, code) {
  if (!present(value)) fail(code);
  return String(value).trim();
}

function requiredInstant(value, code) {
  const text = requiredString(value, code);
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed) || !text.includes("T")) fail(code);
  return text;
}

function requiredMoney(value, code, { nonZero = false } = {}) {
  if (value === null || value === undefined || value === "") fail(code);
  const amount = Number(value);
  if (!Number.isFinite(amount) || (nonZero && amount === 0)) fail(code);
  return Math.round(amount * 100) / 100;
}

function stringList(value) {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze([...new Set(value.filter(present).map((item) => String(item).trim()))]);
}

function createAdvisorCompensationEvent(input = {}) {
  const state = requiredString(input.state, "ADVISOR_COMPENSATION_EVENT_STATE_REQUIRED");
  if (!Object.values(ADVISOR_COMPENSATION_EVENT_STATES).includes(state)) {
    fail("ADVISOR_COMPENSATION_EVENT_STATE_INVALID");
  }
  if (state === "PAID") fail("ADVISOR_COMPENSATION_PAID_EVENT_NOT_AUTHORIZED");

  const kind = requiredString(input.kind, "ADVISOR_COMPENSATION_EVENT_KIND_REQUIRED");
  if (!Object.values(ADVISOR_COMPENSATION_EVENT_KINDS).includes(kind)) {
    fail("ADVISOR_COMPENSATION_EVENT_KIND_INVALID");
  }

  const amount = requiredMoney(input.amount, "ADVISOR_COMPENSATION_EVENT_AMOUNT_INVALID", {
    nonZero: state === ADVISOR_COMPENSATION_EVENT_STATES.ADJUSTED ||
      state === ADVISOR_COMPENSATION_EVENT_STATES.REVERSED
  });
  if ([ADVISOR_COMPENSATION_EVENT_STATES.ESTIMATED, ADVISOR_COMPENSATION_EVENT_STATES.EARNED]
      .includes(state) && amount < 0) {
    fail("ADVISOR_COMPENSATION_BASE_EVENT_AMOUNT_NEGATIVE");
  }
  if (state === ADVISOR_COMPENSATION_EVENT_STATES.REVERSED && amount >= 0) {
    fail("ADVISOR_COMPENSATION_REVERSAL_AMOUNT_MUST_BE_NEGATIVE");
  }

  const currency = requiredString(input.currency, "ADVISOR_COMPENSATION_EVENT_CURRENCY_REQUIRED").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) fail("ADVISOR_COMPENSATION_EVENT_CURRENCY_INVALID");

  const event = {
    contractVersion: ADVISOR_COMPENSATION_EVENT_CONTRACT_VERSION,
    eventId: requiredString(input.eventId, "ADVISOR_COMPENSATION_EVENT_ID_REQUIRED"),
    aggregateKey: requiredString(input.aggregateKey, "ADVISOR_COMPENSATION_AGGREGATE_KEY_REQUIRED"),
    sequence: Number.isInteger(input.sequence) && input.sequence > 0
      ? input.sequence
      : fail("ADVISOR_COMPENSATION_EVENT_SEQUENCE_INVALID"),
    previousEventId: present(input.previousEventId) ? String(input.previousEventId).trim() : null,
    state,
    kind,
    concept: requiredString(input.concept, "ADVISOR_COMPENSATION_EVENT_CONCEPT_REQUIRED"),
    advisorReference: requiredString(input.advisorReference, "ADVISOR_COMPENSATION_EVENT_ADVISOR_REQUIRED"),
    policyReference: present(input.policyReference) ? String(input.policyReference).trim() : null,
    paymentEventId: present(input.paymentEventId) ? String(input.paymentEventId).trim() : null,
    periodKey: requiredString(input.periodKey, "ADVISOR_COMPENSATION_EVENT_PERIOD_REQUIRED"),
    amount: { value: amount, currency },
    calculation: clone(input.calculation || null),
    ruleSnapshot: clone(input.ruleSnapshot || null),
    evidence: {
      references: stringList(input.evidenceReferences),
      paymentEvidenceReference: present(input.paymentEvidenceReference)
        ? String(input.paymentEvidenceReference).trim()
        : null,
      evidenceHash: present(input.evidenceHash) ? String(input.evidenceHash).trim() : null,
      humanDecisionId: present(input.humanDecisionId) ? String(input.humanDecisionId).trim() : null,
      promotionEvidence: clone(input.promotionEvidence || null)
    },
    lineage: {
      sourceCalculationId: present(input.sourceCalculationId)
        ? String(input.sourceCalculationId).trim()
        : null,
      sourceCalculationDigest: present(input.sourceCalculationDigest)
        ? String(input.sourceCalculationDigest).trim()
        : null,
      adjustedEventId: present(input.adjustedEventId) ? String(input.adjustedEventId).trim() : null,
      reversedEventId: present(input.reversedEventId) ? String(input.reversedEventId).trim() : null
    },
    reason: present(input.reason) ? String(input.reason).trim() : null,
    actorId: present(input.actorId) ? String(input.actorId).trim() : null,
    idempotencyKey: requiredString(input.idempotencyKey, "ADVISOR_COMPENSATION_EVENT_IDEMPOTENCY_REQUIRED"),
    correlationId: requiredString(input.correlationId, "ADVISOR_COMPENSATION_EVENT_CORRELATION_REQUIRED"),
    createdAt: requiredInstant(input.createdAt, "ADVISOR_COMPENSATION_EVENT_CREATED_AT_REQUIRED"),
    safeguards: {
      appendOnly: true,
      overwriteAuthorized: false,
      deleteAuthorized: false,
      payoutTruth: false,
      paidPromotionAuthorized: false,
      externalMutationAuthorized: false,
      ...clone(input.safeguards || {})
    },
    metadata: clone(input.metadata || {})
  };

  const digestPayload = clone(event);
  delete digestPayload.eventDigest;
  event.eventDigest = sha256(digestPayload);
  return deepFreeze(event);
}

function validateAdvisorCompensationEvent(event) {
  const errors = [];
  if (!event || typeof event !== "object") {
    return Object.freeze({ valid: false, errors: Object.freeze(["event_missing"]) });
  }
  if (event.contractVersion !== ADVISOR_COMPENSATION_EVENT_CONTRACT_VERSION) {
    errors.push("event_contract_version_invalid");
  }
  if (!Object.values(ADVISOR_COMPENSATION_EVENT_STATES).includes(event.state)) {
    errors.push("event_state_invalid");
  }
  if (event.state === "PAID") errors.push("paid_event_not_authorized");
  if (!Object.values(ADVISOR_COMPENSATION_EVENT_KINDS).includes(event.kind)) {
    errors.push("event_kind_invalid");
  }
  if (!Number.isInteger(event.sequence) || event.sequence < 1) errors.push("event_sequence_invalid");
  if (!Number.isFinite(event.amount?.value)) errors.push("event_amount_invalid");
  if (!/^[A-Z]{3}$/.test(event.amount?.currency || "")) errors.push("event_currency_invalid");
  if (!/^[a-f0-9]{64}$/.test(event.eventDigest || "")) errors.push("event_digest_invalid");
  if (event.safeguards?.appendOnly !== true) errors.push("append_only_required");
  if (event.safeguards?.overwriteAuthorized !== false) errors.push("overwrite_must_be_false");
  if (event.safeguards?.deleteAuthorized !== false) errors.push("delete_must_be_false");
  if (event.safeguards?.payoutTruth !== false) errors.push("payout_truth_must_be_false");
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

module.exports = {
  ADVISOR_COMPENSATION_EVENT_CONTRACT_VERSION,
  ADVISOR_COMPENSATION_EVENT_STATES,
  ADVISOR_COMPENSATION_EVENT_KINDS,
  ADVISOR_COMPENSATION_EVENT_CONCEPTS,
  present,
  clone,
  deepFreeze,
  stable,
  sha256,
  createAdvisorCompensationEvent,
  validateAdvisorCompensationEvent
};
