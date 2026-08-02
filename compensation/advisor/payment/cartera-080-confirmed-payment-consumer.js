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

function consumeCartera080ConfirmedPayment({ command, handoffReceipt } = {}) {
  validateCommand(command);
  const commandDigest = sha256(command);
  validateHandoff(command, handoffReceipt, commandDigest);

  const periodStart = optionalDate(
    command.periodCoveredStart,
    "ADVISOR_COMPENSATION_CARTERA080_PERIOD_START_INVALID"
  );
  const periodEnd = optionalDate(
    command.periodCoveredEnd,
    "ADVISOR_COMPENSATION_CARTERA080_PERIOD_END_INVALID"
  );
  if (periodStart && periodEnd && periodStart > periodEnd) {
    fail("ADVISOR_COMPENSATION_CARTERA080_PERIOD_INVALID");
  }

  return deepFreeze({
    consumerVersion: "ADVISOR_COMPENSATION_CARTERA080_CONSUMER_001",
    sourceSystem: "CARTERA_080",
    sourceAuthority: CARTERA_080_PAYMENT_AUTHORITY,
    handoffId: handoffReceipt.handoffId,
    commandDigest,
    idempotencyKey: command.idempotencyKey,
    correlationId: command.correlationId,
    paymentEvidenceReference: command.paymentEvidenceReference,
    policyReference: command.policyReference,
    obligationReference: command.obligationReference,
    personReference: command.personReference,
    paymentAmount: Number(command.paymentAmount),
    currency: String(command.currency).trim().toUpperCase(),
    paymentDate: command.paymentDate,
    periodCoveredStart: periodStart,
    periodCoveredEnd: periodEnd,
    paymentSource: command.paymentSource,
    evidenceReferences: Object.freeze(
      [...new Set((Array.isArray(command.evidenceReferences) ? command.evidenceReferences : [])
        .filter(present)
        .map(String))]
    ),
    humanDecision: deepFreeze({ ...command.humanDecisionReceipt }),
    handoffStatus: handoffReceipt.status,
    compensationState: handoffReceipt.compensationState,
    commissionCalculationRequested: false,
    commissionCalculationPerformed: false,
    downstreamResult: deepFreeze({ ...(handoffReceipt.downstreamResult || {}) }),
    sourceReplay: handoffReceipt.replayed === true,
    mutationAuthorized: false,
    compensationEventWriteAuthorized: false,
    payoutTruth: false
  });
}

module.exports = {
  CARTERA_080_PAYMENT_AUTHORITY,
  CARTERA_080_HANDOFF_STATUS,
  CARTERA_080_COMPENSATION_STATE,
  Cartera080ConfirmedPaymentConsumerError,
  stable,
  sha256,
  consumeCartera080ConfirmedPayment
};