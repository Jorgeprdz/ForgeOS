"use strict";

const crypto = require("crypto");
const {
  deepFreeze
} = require("./advisor-compensation-payment-event-contract");

const CARTERA_080_PAYMENT_AUTHORITY = "policy_payment_reconciliation_030c";
const CARTERA_080_HANDOFF_STATUS = "confirmed_handoff_recorded";
const CARTERA_080_COMPENSATION_STATE = "not_interpreted";

class Cartera080ConfirmedPaymentConsumerError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = "Cartera080ConfirmedPaymentConsumerError";
    this.code = code;
    if (details) this.details = details;
  }
}

function fail(code, details = null) {
  throw new Cartera080ConfirmedPaymentConsumerError(code, code, details);
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

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function requiredString(value, code) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) fail(code);
  return normalized;
}

function requiredPositiveMoney(value, code) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) fail(code);
  return amount;
}

function requiredDate(value, code) {
  const text = requiredString(value, code);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) fail(code);
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) fail(code);
  return text;
}

function requiredInstant(value, code) {
  const text = requiredString(value, code);
  const parsed = new Date(text);
  if (!text.includes("T") || !Number.isFinite(parsed.getTime())) fail(code);
  return new Date(parsed).toISOString();
}

function optionalDate(value, code) {
  return present(value) ? requiredDate(value, code) : null;
}

function validateCommand(command) {
  if (!command || typeof command !== "object" || Array.isArray(command)) {
    fail("ADVISOR_COMPENSATION_CARTERA080_COMMAND_REQUIRED");
  }
  if (command.confirmationState !== "confirmed") {
    fail("ADVISOR_COMPENSATION_CARTERA080_PAYMENT_NOT_CONFIRMED");
  }
  if (command.canonicalAuthority !== CARTERA_080_PAYMENT_AUTHORITY) {
    fail("ADVISOR_COMPENSATION_CARTERA080_AUTHORITY_INVALID");
  }
  if (command.commissionCalculationRequested !== false) {
    fail("ADVISOR_COMPENSATION_CARTERA080_COMMISSION_REQUEST_FORBIDDEN");
  }
  const human = command.humanDecisionReceipt;
  if (!human || typeof human !== "object") {
    fail("ADVISOR_COMPENSATION_CARTERA080_HUMAN_RECEIPT_REQUIRED");
  }
  requiredString(human.decisionId, "ADVISOR_COMPENSATION_CARTERA080_HUMAN_DECISION_ID_REQUIRED");
  requiredString(human.actorId, "ADVISOR_COMPENSATION_CARTERA080_HUMAN_ACTOR_REQUIRED");
  requiredString(human.decidedAt, "ADVISOR_COMPENSATION_CARTERA080_HUMAN_DECIDED_AT_REQUIRED");
  requiredString(human.reason, "ADVISOR_COMPENSATION_CARTERA080_HUMAN_REASON_REQUIRED");
  requiredString(human.evidenceHash, "ADVISOR_COMPENSATION_CARTERA080_EVIDENCE_HASH_REQUIRED");
  if (human.authorizationBasis !== "human_decision_receipt") {
    fail("ADVISOR_COMPENSATION_CARTERA080_HUMAN_AUTHORIZATION_INVALID");
  }
  requiredString(command.paymentEvidenceReference, "ADVISOR_COMPENSATION_CARTERA080_EVIDENCE_REFERENCE_REQUIRED");
  requiredString(command.policyReference, "ADVISOR_COMPENSATION_CARTERA080_POLICY_REFERENCE_REQUIRED");
  requiredString(command.obligationReference, "ADVISOR_COMPENSATION_CARTERA080_OBLIGATION_REFERENCE_REQUIRED");
  requiredString(command.personReference, "ADVISOR_COMPENSATION_CARTERA080_PERSON_REFERENCE_REQUIRED");
  requiredPositiveMoney(command.paymentAmount, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_AMOUNT_INVALID");
  const currency = requiredString(command.currency, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_CURRENCY_REQUIRED").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) fail("ADVISOR_COMPENSATION_CARTERA080_PAYMENT_CURRENCY_INVALID");
  requiredDate(command.paymentDate, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_DATE_INVALID");
  optionalDate(command.periodCoveredStart, "ADVISOR_COMPENSATION_CARTERA080_PERIOD_START_INVALID");
  optionalDate(command.periodCoveredEnd, "ADVISOR_COMPENSATION_CARTERA080_PERIOD_END_INVALID");
  requiredString(command.paymentSource, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_SOURCE_REQUIRED");
  requiredString(command.idempotencyKey, "ADVISOR_COMPENSATION_CARTERA080_IDEMPOTENCY_KEY_REQUIRED");
  requiredString(command.correlationId, "ADVISOR_COMPENSATION_CARTERA080_CORRELATION_ID_REQUIRED");
}

function validateHandoff(command, handoffReceipt, expectedDigest) {
  if (!handoffReceipt || typeof handoffReceipt !== "object" || Array.isArray(handoffReceipt)) {
    fail("ADVISOR_COMPENSATION_CARTERA080_HANDOFF_RECEIPT_REQUIRED");
  }
  if (handoffReceipt.status !== CARTERA_080_HANDOFF_STATUS) {
    fail("ADVISOR_COMPENSATION_CARTERA080_HANDOFF_STATUS_INVALID");
  }
  if (handoffReceipt.compensationState !== CARTERA_080_COMPENSATION_STATE) {
    fail("ADVISOR_COMPENSATION_CARTERA080_COMPENSATION_STATE_INVALID");
  }
  if (handoffReceipt.commissionCalculationPerformed !== false) {
    fail("ADVISOR_COMPENSATION_CARTERA080_COMMISSION_ALREADY_CALCULATED");
  }
  if (handoffReceipt.commandDigest !== expectedDigest) {
    fail("ADVISOR_COMPENSATION_CARTERA080_COMMAND_DIGEST_MISMATCH", {
      expectedDigest,
      receivedDigest: handoffReceipt.commandDigest || null
    });
  }

  const comparisons = [
    ["paymentEvidenceReference", command.paymentEvidenceReference],
    ["policyReference", command.policyReference],
    ["obligationReference", command.obligationReference],
    ["humanDecisionId", command.humanDecisionReceipt.decisionId],
    ["idempotencyKey", command.idempotencyKey],
    ["correlationId", command.correlationId]
  ];
  comparisons.forEach(([field, expected]) => {
    if (handoffReceipt[field] !== expected) {
      fail(`ADVISOR_COMPENSATION_CARTERA080_${field.toUpperCase()}_MISMATCH`);
    }
  });

  const expectedHandoffId = `${command.correlationId}:${command.idempotencyKey}`;
  if (handoffReceipt.handoffId !== expectedHandoffId) {
    fail("ADVISOR_COMPENSATION_CARTERA080_HANDOFF_ID_MISMATCH");
  }
}

function paymentResult({
  sourceSystem,
  handoffId,
  commandDigest,
  idempotencyKey,
  correlationId,
  paymentEvidenceReference,
  policyReference,
  obligationReference,
  personReference,
  paymentAmount,
  currency,
  paymentDate,
  periodCoveredStart,
  periodCoveredEnd,
  paymentSource,
  evidenceReferences,
  humanDecision,
  sourceReplay = false,
  downstreamResult = {}
}) {
  const periodStart = optionalDate(
    periodCoveredStart,
    "ADVISOR_COMPENSATION_CARTERA080_PERIOD_START_INVALID"
  );
  const periodEnd = optionalDate(
    periodCoveredEnd,
    "ADVISOR_COMPENSATION_CARTERA080_PERIOD_END_INVALID"
  );
  if (periodStart && periodEnd && periodStart > periodEnd) {
    fail("ADVISOR_COMPENSATION_CARTERA080_PERIOD_INVALID");
  }

  return deepFreeze({
    consumerVersion: "ADVISOR_COMPENSATION_CARTERA080_CONSUMER_001",
    sourceSystem,
    sourceAuthority: CARTERA_080_PAYMENT_AUTHORITY,
    handoffId,
    commandDigest,
    idempotencyKey,
    correlationId,
    paymentEvidenceReference,
    policyReference,
    obligationReference,
    personReference,
    paymentAmount: Number(paymentAmount),
    currency: String(currency).trim().toUpperCase(),
    paymentDate,
    periodCoveredStart: periodStart,
    periodCoveredEnd: periodEnd,
    paymentSource,
    evidenceReferences: Object.freeze(
      [...new Set((Array.isArray(evidenceReferences) ? evidenceReferences : [])
        .filter(present)
        .map(String))]
    ),
    humanDecision: deepFreeze({ ...humanDecision }),
    handoffStatus: CARTERA_080_HANDOFF_STATUS,
    compensationState: CARTERA_080_COMPENSATION_STATE,
    commissionCalculationRequested: false,
    commissionCalculationPerformed: false,
    downstreamResult: deepFreeze({ ...downstreamResult }),
    sourceReplay,
    mutationAuthorized: false,
    compensationEventWriteAuthorized: false,
    payoutTruth: false
  });
}

function consumeCartera080ConfirmedPayment({ command, handoffReceipt } = {}) {
  validateCommand(command);
  const commandDigest = sha256(command);
  validateHandoff(command, handoffReceipt, commandDigest);

  return paymentResult({
    sourceSystem: "CARTERA_080",
    handoffId: handoffReceipt.handoffId,
    commandDigest,
    idempotencyKey: command.idempotencyKey,
    correlationId: command.correlationId,
    paymentEvidenceReference: command.paymentEvidenceReference,
    policyReference: command.policyReference,
    obligationReference: command.obligationReference,
    personReference: command.personReference,
    paymentAmount: requiredPositiveMoney(command.paymentAmount, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_AMOUNT_INVALID"),
    currency: requiredString(command.currency, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_CURRENCY_REQUIRED"),
    paymentDate: requiredDate(command.paymentDate, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_DATE_INVALID"),
    periodCoveredStart: command.periodCoveredStart,
    periodCoveredEnd: command.periodCoveredEnd,
    paymentSource: command.paymentSource,
    evidenceReferences: command.evidenceReferences,
    humanDecision: command.humanDecisionReceipt,
    sourceReplay: handoffReceipt.replayed === true,
    downstreamResult: handoffReceipt.downstreamResult || {}
  });
}

function consumeCartera030cCanonicalPayment({ paymentEvent, reconciliation, personReference } = {}) {
  if (!paymentEvent || typeof paymentEvent !== "object" || Array.isArray(paymentEvent)) {
    fail("ADVISOR_COMPENSATION_CARTERA030C_PAYMENT_EVENT_REQUIRED");
  }
  if (paymentEvent.confirmationState !== "CONFIRMED") {
    fail("ADVISOR_COMPENSATION_CARTERA080_PAYMENT_NOT_CONFIRMED");
  }
  const advisorId = requiredString(paymentEvent.advisorId, "ADVISOR_COMPENSATION_CARTERA030C_ADVISOR_REQUIRED");
  const confirmedBy = requiredString(paymentEvent.confirmedBy, "ADVISOR_COMPENSATION_CARTERA030C_CONFIRMED_BY_REQUIRED");
  if (advisorId !== confirmedBy) fail("ADVISOR_COMPENSATION_CARTERA030C_CONFIRMED_OWNER_MISMATCH");
  if (!reconciliation || !["MATCHED", "PARTIAL_MATCH"].includes(reconciliation.outcome)) {
    fail("ADVISOR_COMPENSATION_CARTERA030C_OBLIGATION_RECONCILIATION_REQUIRED");
  }

  const paymentEventReference = requiredString(
    paymentEvent.paymentEventReference,
    "ADVISOR_COMPENSATION_CARTERA030C_PAYMENT_REFERENCE_REQUIRED"
  );
  const eventDigest = requiredString(
    paymentEvent.eventDigest,
    "ADVISOR_COMPENSATION_CARTERA030C_EVENT_DIGEST_REQUIRED"
  );
  if (!/^[a-f0-9]{64}$/.test(eventDigest)) fail("ADVISOR_COMPENSATION_CARTERA030C_EVENT_DIGEST_INVALID");
  const evidenceHash = eventDigest;
  const canonicalDecision = {
    decisionId: paymentEventReference,
    actorId: confirmedBy,
    decidedAt: requiredInstant(paymentEvent.confirmedAt, "ADVISOR_COMPENSATION_CARTERA030C_CONFIRMED_AT_REQUIRED"),
    reason: "canonical_confirmed_payment_event",
    evidenceHash,
    authorizationBasis: "cartera_030c_confirmed_payment_event"
  };

  return paymentResult({
    sourceSystem: "CARTERA_030C",
    handoffId: `canonical:${paymentEventReference}`,
    commandDigest: eventDigest,
    idempotencyKey: requiredString(paymentEvent.idempotencyKey, "ADVISOR_COMPENSATION_CARTERA030C_IDEMPOTENCY_REQUIRED"),
    correlationId: paymentEventReference,
    paymentEvidenceReference: requiredString(
      paymentEvent.paymentEvidenceReference,
      "ADVISOR_COMPENSATION_CARTERA080_EVIDENCE_REFERENCE_REQUIRED"
    ),
    policyReference: requiredString(paymentEvent.policyReference, "ADVISOR_COMPENSATION_CARTERA080_POLICY_REFERENCE_REQUIRED"),
    obligationReference: requiredString(
      reconciliation.obligationReference,
      "ADVISOR_COMPENSATION_CARTERA080_OBLIGATION_REFERENCE_REQUIRED"
    ),
    personReference: requiredString(personReference, "ADVISOR_COMPENSATION_CARTERA080_PERSON_REFERENCE_REQUIRED"),
    paymentAmount: requiredPositiveMoney(paymentEvent.paymentAmount, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_AMOUNT_INVALID"),
    currency: requiredString(paymentEvent.currency, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_CURRENCY_REQUIRED"),
    paymentDate: requiredDate(paymentEvent.paymentDate, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_DATE_INVALID"),
    periodCoveredStart: paymentEvent.periodCoveredStart,
    periodCoveredEnd: paymentEvent.periodCoveredEnd,
    paymentSource: requiredString(paymentEvent.paymentSource, "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_SOURCE_REQUIRED"),
    evidenceReferences: paymentEvent.evidenceReferences,
    humanDecision: canonicalDecision,
    sourceReplay: false,
    downstreamResult: {
      canonicalPaymentEventReference: paymentEventReference,
      reconciliationOutcome: reconciliation.outcome
    }
  });
}

module.exports = {
  CARTERA_080_PAYMENT_AUTHORITY,
  CARTERA_080_HANDOFF_STATUS,
  CARTERA_080_COMPENSATION_STATE,
  Cartera080ConfirmedPaymentConsumerError,
  stable,
  sha256,
  consumeCartera080ConfirmedPayment,
  consumeCartera030cCanonicalPayment
};
