"use strict";

const assert = require("assert");
const {
  PAYMENT_EVENT_CONTRACT_VERSION,
  COMPENSATION_INTERPRETATION_STATES,
  PAYMENT_INTAKE_STATUSES,
  PAYMENT_CONFLICT_TYPES,
  createAdvisorCompensationConfirmedPaymentEvent,
  validateAdvisorCompensationConfirmedPaymentEvent
} = require("../payment/advisor-compensation-payment-event-contract");
const {
  sha256: carteraSha256,
  consumeCartera080ConfirmedPayment,
  Cartera080ConfirmedPaymentConsumerError
} = require("../payment/cartera-080-confirmed-payment-consumer");
const {
  adaptCartera080PaymentToAdvisorCompensationEvent
} = require("../payment/advisor-compensation-payment-event-adapter");
const {
  createInMemoryAdvisorCompensationPaymentIntakeStore,
  createAdvisorCompensationPaymentIntakeService
} = require("../payment/advisor-compensation-payment-intake-service");

console.log("\nFORGE ADVISOR COMPENSATION STAGE 030 MASTER TEST v1.0\n");

const PRODUCTS = Object.freeze([
  Object.freeze({ productId: "SMNYL_ORVI", displayName: "Orvi", aliases: ["ORVI"], lineOfBusiness: "VIDA" }),
  Object.freeze({ productId: "SMNYL_ALFA_MEDICAL", displayName: "Alfa Medical", aliases: ["ALFA MEDICAL"], lineOfBusiness: "GMM" })
]);

const clone = value => JSON.parse(JSON.stringify(value));

function commandFixture(overrides = {}) {
  const humanOverride = overrides.humanDecisionReceipt || {};
  const commandOverrides = { ...overrides };
  delete commandOverrides.humanDecisionReceipt;
  return {
    paymentEvidenceReference: "ev-030-1",
    policyReference: "policy-030-1",
    obligationReference: "obligation-030-1",
    personReference: "person-030-1",
    paymentAmount: 3890.21,
    currency: "MXN",
    paymentDate: "2026-08-01",
    periodCoveredStart: "2026-08-01",
    periodCoveredEnd: "2026-08-31",
    paymentSource: "payment_proof",
    evidenceReferences: ["ev-030-1", "attachment-030-1"],
    confirmationState: "confirmed",
    humanDecisionReceipt: {
      decisionId: "corr-030-1:idem-030-1",
      actorId: "advisor-human-1",
      decidedAt: "2026-08-02T04:45:00.000Z",
      reason: "Validación humana completa",
      evidenceHash: "hash-030-1",
      authorizationBasis: "human_decision_receipt",
      ...humanOverride
    },
    idempotencyKey: "idem-030-1",
    correlationId: "corr-030-1",
    canonicalAuthority: "policy_payment_reconciliation_030c",
    commissionCalculationRequested: false,
    ...commandOverrides
  };
}

function handoffFixture(command, overrides = {}) {
  return {
    handoffId: `${command.correlationId}:${command.idempotencyKey}`,
    paymentEvidenceReference: command.paymentEvidenceReference,
    policyReference: command.policyReference,
    obligationReference: command.obligationReference,
    humanDecisionId: command.humanDecisionReceipt.decisionId,
    commandDigest: carteraSha256(command),
    idempotencyKey: command.idempotencyKey,
    correlationId: command.correlationId,
    status: "confirmed_handoff_recorded",
    truthOwner: "Policy Truth / Cartera 030C",
    compensationState: "not_interpreted",
    commissionCalculationPerformed: false,
    downstreamResult: { reconciliationState: "COMPLETE", outcome: "MATCHED" },
    replayed: false,
    ...overrides
  };
}

function payloadFixture(options = {}) {
  const command = commandFixture(options.command || {});
  return {
    command,
    handoffReceipt: handoffFixture(command, options.handoff || {}),
    policyContext: Object.prototype.hasOwnProperty.call(options, "policyContext")
      ? options.policyContext
      : {
        policyReference: command.policyReference,
        advisorReference: "advisor-030-1",
        productName: "Orvi",
        variant: "DEFAULT",
        policyYear: 1,
        sourceAuthority: "POLICY_TRUTH",
        sourceSnapshotReference: "policy-snapshot-030-1"
      },
    productIdentities: options.productIdentities || PRODUCTS
  };
}

function consumerError(payload, code) {
  assert.throws(
    () => consumeCartera080ConfirmedPayment(payload),
    error => error instanceof Cartera080ConfirmedPaymentConsumerError && error.code === code
  );
}

const tests = [];
const add = (name, run) => tests.push([name, run]);

add("complete Cartera handoff is consumed", () => {
  const value = consumeCartera080ConfirmedPayment(payloadFixture());
  assert.equal(value.sourceAuthority, "policy_payment_reconciliation_030c");
  assert.equal(value.compensationState, "not_interpreted");
});
add("consumer digest matches Cartera", () => {
  const payload = payloadFixture();
  assert.equal(consumeCartera080ConfirmedPayment(payload).commandDigest, carteraSha256(payload.command));
});
add("evidence references deduplicate", () => {
  const payload = payloadFixture({ command: { evidenceReferences: ["ev-030-1", "ev-030-1", "attachment-030-1"] } });
  assert.deepEqual(consumeCartera080ConfirmedPayment(payload).evidenceReferences, ["ev-030-1", "attachment-030-1"]);
});

[
  ["missing command", () => ({ handoffReceipt: {} }), "ADVISOR_COMPENSATION_CARTERA080_COMMAND_REQUIRED"],
  ["unconfirmed command", () => payloadFixture({ command: { confirmationState: "pending" } }), "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_NOT_CONFIRMED"],
  ["wrong authority", () => payloadFixture({ command: { canonicalAuthority: "other" } }), "ADVISOR_COMPENSATION_CARTERA080_AUTHORITY_INVALID"],
  ["commission request", () => payloadFixture({ command: { commissionCalculationRequested: true } }), "ADVISOR_COMPENSATION_CARTERA080_COMMISSION_REQUEST_FORBIDDEN"],
  ["missing human receipt", () => { const p = payloadFixture(); delete p.command.humanDecisionReceipt; return p; }, "ADVISOR_COMPENSATION_CARTERA080_HUMAN_RECEIPT_REQUIRED"],
  ["wrong authorization", () => payloadFixture({ command: { humanDecisionReceipt: { authorizationBasis: "automation" } } }), "ADVISOR_COMPENSATION_CARTERA080_HUMAN_AUTHORIZATION_INVALID"],
  ["missing policy", () => payloadFixture({ command: { policyReference: "" } }), "ADVISOR_COMPENSATION_CARTERA080_POLICY_REFERENCE_REQUIRED"],
  ["zero amount", () => payloadFixture({ command: { paymentAmount: 0 } }), "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_AMOUNT_INVALID"],
  ["invalid currency", () => payloadFixture({ command: { currency: "PESO" } }), "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_CURRENCY_INVALID"],
  ["invalid date", () => payloadFixture({ command: { paymentDate: "2026-02-31" } }), "ADVISOR_COMPENSATION_CARTERA080_PAYMENT_DATE_INVALID"],
  ["inverted period", () => payloadFixture({ command: { periodCoveredStart: "2026-09-01", periodCoveredEnd: "2026-08-01" } }), "ADVISOR_COMPENSATION_CARTERA080_PERIOD_INVALID"],
  ["missing receipt", () => ({ command: commandFixture() }), "ADVISOR_COMPENSATION_CARTERA080_HANDOFF_RECEIPT_REQUIRED"],
  ["wrong receipt status", () => payloadFixture({ handoff: { status: "pending" } }), "ADVISOR_COMPENSATION_CARTERA080_HANDOFF_STATUS_INVALID"],
  ["interpreted receipt", () => payloadFixture({ handoff: { compensationState: "interpreted" } }), "ADVISOR_COMPENSATION_CARTERA080_COMPENSATION_STATE_INVALID"],
  ["prior calculation", () => payloadFixture({ handoff: { commissionCalculationPerformed: true } }), "ADVISOR_COMPENSATION_CARTERA080_COMMISSION_ALREADY_CALCULATED"],
  ["digest mismatch", () => payloadFixture({ handoff: { commandDigest: "0".repeat(64) } }), "ADVISOR_COMPENSATION_CARTERA080_COMMAND_DIGEST_MISMATCH"],
  ["policy mismatch", () => payloadFixture({ handoff: { policyReference: "other" } }), "ADVISOR_COMPENSATION_CARTERA080_POLICYREFERENCE_MISMATCH"],
  ["handoff id mismatch", () => payloadFixture({ handoff: { handoffId: "other" } }), "ADVISOR_COMPENSATION_CARTERA080_HANDOFF_ID_MISMATCH"]
].forEach(([name, factory, code]) => add(name, () => consumerError(factory(), code)));

add("missing policy context degrades honestly", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ policyContext: null }));
  assert.equal(event.interpretation.state, COMPENSATION_INTERPRETATION_STATES.NEEDS_POLICY_CONTEXT);
});
add("missing advisor attribution degrades honestly", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ policyContext: { policyReference: "policy-030-1", productName: "Orvi" } }));
  assert.equal(event.interpretation.state, COMPENSATION_INTERPRETATION_STATES.NEEDS_ADVISOR_ATTRIBUTION);
});
add("missing product degrades honestly", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ policyContext: { policyReference: "policy-030-1", advisorReference: "a" } }));
  assert.equal(event.interpretation.state, COMPENSATION_INTERPRETATION_STATES.NEEDS_PRODUCT_IDENTITY);
});
add("unknown product never defaults", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ policyContext: { policyReference: "policy-030-1", advisorReference: "a", productName: "Unknown" } }));
  assert.equal(event.productContext.productId, null);
  assert.equal(event.productContext.status, "UNKNOWN");
});
add("conflicting product aliases block interpretation", () => {
  const productIdentities = [
    { productId: "P1", displayName: "One", aliases: ["Shared"], lineOfBusiness: "VIDA" },
    { productId: "P2", displayName: "Two", aliases: ["Shared"], lineOfBusiness: "GMM" }
  ];
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ productIdentities, policyContext: { policyReference: "policy-030-1", advisorReference: "a", productName: "Shared" } }));
  assert.equal(event.interpretation.state, COMPENSATION_INTERPRETATION_STATES.CONFLICTING_PRODUCT_IDENTITY);
});
add("complete context is ready for interpretation", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture());
  assert.equal(event.productContext.productId, "SMNYL_ORVI");
  assert.equal(event.interpretation.readyForCalculation, true);
});
add("different policy context is rejected", () => {
  assert.throws(() => adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ policyContext: { policyReference: "other", advisorReference: "a", productName: "Orvi" } })), /POLICY_CONTEXT_REFERENCE_MISMATCH/);
});
add("event remains confirmed-payment truth", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture());
  assert.equal(event.contractVersion, PAYMENT_EVENT_CONTRACT_VERSION);
  assert.equal(event.truthClass, "CONFIRMED_PAYMENT");
  assert.equal(event.safeguards.payoutTruth, false);
});
add("event validation passes", () => {
  assert.equal(validateAdvisorCompensationConfirmedPaymentEvent(adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture())).valid, true);
});
add("event validation catches calculation flag", () => {
  const event = clone(adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture()));
  event.safeguards.commissionCalculationPerformed = true;
  assert.equal(validateAdvisorCompensationConfirmedPaymentEvent(event).valid, false);
});
add("adapter deterministic", () => assert.deepEqual(
  adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture()),
  adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture())
));
add("amount changes semantic fingerprint", () => assert.notEqual(
  adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture()).fingerprints.semanticFingerprint,
  adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ command: { paymentAmount: 5000 } })).fingerprints.semanticFingerprint
));
add("evidence hash changes fingerprints", () => {
  const a = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture());
  const b = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ command: { humanDecisionReceipt: { evidenceHash: "other" } } }));
  assert.notEqual(a.fingerprints.evidenceFingerprint, b.fingerprints.evidenceFingerprint);
  assert.notEqual(a.fingerprints.semanticFingerprint, b.fingerprints.semanticFingerprint);
});
add("adapter does not mutate inputs", () => {
  const payload = payloadFixture();
  const before = clone(payload);
  adaptCartera080PaymentToAdvisorCompensationEvent(payload);
  assert.deepEqual(payload, before);
});

add("first intake accepted", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  assert.equal(service.intakeConfirmedPayment(payloadFixture()).intakeStatus, PAYMENT_INTAKE_STATUSES.ACCEPTED);
});
add("same key and digest replays", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  assert.equal(service.intakeConfirmedPayment(payloadFixture()).intakeStatus, PAYMENT_INTAKE_STATUSES.REPLAYED);
  assert.equal(service.size(), 1);
});
add("same key different command conflicts", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  assert.equal(service.intakeConfirmedPayment(payloadFixture({ command: { paymentAmount: 5000 } })).conflictType, PAYMENT_CONFLICT_TYPES.IDEMPOTENCY_KEY_REUSE);
});
add("same evidence new key conflicts", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  const result = service.intakeConfirmedPayment(payloadFixture({ command: { idempotencyKey: "idem-2", correlationId: "corr-2", humanDecisionReceipt: { decisionId: "corr-2:idem-2" } } }));
  assert.equal(result.conflictType, PAYMENT_CONFLICT_TYPES.EVIDENCE_REUSE);
});
add("same evidence changed semantics conflicts", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  const result = service.intakeConfirmedPayment(payloadFixture({ command: { idempotencyKey: "idem-2", correlationId: "corr-2", paymentAmount: 5000, humanDecisionReceipt: { decisionId: "corr-2:idem-2" } } }));
  assert.equal(result.reason, "same_evidence_claims_different_payment_semantics");
});
add("different evidence same semantics conflicts", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  const result = service.intakeConfirmedPayment(payloadFixture({ command: { paymentEvidenceReference: "ev-2", evidenceReferences: ["ev-2"], idempotencyKey: "idem-2", correlationId: "corr-2", humanDecisionReceipt: { decisionId: "corr-2:idem-2" } } }));
  assert.equal(result.conflictType, PAYMENT_CONFLICT_TYPES.SEMANTIC_DUPLICATE);
});
add("different legitimate payment accepted", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  const result = service.intakeConfirmedPayment(payloadFixture({ command: { paymentEvidenceReference: "ev-2", evidenceReferences: ["ev-2"], paymentDate: "2026-09-01", periodCoveredStart: "2026-09-01", periodCoveredEnd: "2026-09-30", idempotencyKey: "idem-2", correlationId: "corr-2", humanDecisionReceipt: { decisionId: "corr-2:idem-2", evidenceHash: "hash-2" } } }));
  assert.equal(result.intakeStatus, PAYMENT_INTAKE_STATUSES.ACCEPTED);
  assert.equal(service.size(), 2);
});
add("conflict exposes no calculation event", () => {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  const result = service.intakeConfirmedPayment(payloadFixture({ command: { paymentAmount: 5000 } }));
  assert.equal(result.event, null);
  assert.equal(result.interpretationState, COMPENSATION_INTERPRETATION_STATES.BLOCKED_CONFLICT);
});
add("accepted result writes no compensation event", () => {
  const result = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCTS }).intakeConfirmedPayment(payloadFixture());
  assert.equal(result.compensationEventWritten, false);
  assert.equal(result.payoutTruth, false);
});
add("store contains accepted events only", () => {
  const store = createInMemoryAdvisorCompensationPaymentIntakeStore();
  const service = createAdvisorCompensationPaymentIntakeService({ store, productIdentities: PRODUCTS });
  service.intakeConfirmedPayment(payloadFixture());
  service.intakeConfirmedPayment(payloadFixture({ command: { paymentAmount: 5000 } }));
  assert.equal(store.snapshot().length, 1);
});
add("invalid store rejected", () => assert.throws(() => createAdvisorCompensationPaymentIntakeService({ store: {} }), /PAYMENT_INTAKE_STORE_REQUIRED/));

add("factory rejects inverted period", () => {
  assert.throws(() => createAdvisorCompensationConfirmedPaymentEvent({
    eventId: "e", sourceSystem: "s", sourceAuthority: "a", handoffId: "h", commandDigest: "d",
    idempotencyKey: "i", correlationId: "c", paymentEvidenceReference: "ev", policyReference: "p",
    obligationReference: "o", personReference: "person", productStatus: "UNKNOWN", paymentAmount: 1,
    currency: "MXN", paymentDate: "2026-08-01", paymentSource: "proof", periodCoveredStart: "2026-09-01",
    periodCoveredEnd: "2026-08-01", evidenceHash: "hash", humanDecisionId: "decision", humanActorId: "actor",
    humanDecidedAt: "2026-08-01T00:00:00Z", humanReason: "reason", authorizationBasis: "human_decision_receipt",
    interpretationState: "NEEDS_POLICY_CONTEXT", semanticFingerprint: "semantic", evidenceFingerprint: "evidence"
  }), /PAYMENT_PERIOD_INVALID/);
});
add("events deeply frozen", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture());
  assert.equal(Object.isFrozen(event), true);
  assert.equal(Object.isFrozen(event.payment), true);
  assert.equal(Object.isFrozen(event.metadata), true);
});
add("source replay preserved as metadata", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture({ handoff: { replayed: true } }));
  assert.equal(event.metadata.sourceReplay, true);
});
add("downstream reconciliation is metadata only", () => {
  const event = adaptCartera080PaymentToAdvisorCompensationEvent(payloadFixture());
  assert.equal(event.metadata.downstreamResult.outcome, "MATCHED");
  assert.equal(event.safeguards.compensationEventWritten, false);
});

assert.equal(tests.length, 50, `expected 50 tests, got ${tests.length}`);
let passed = 0;
let failed = 0;
for (const [name, run] of tests) {
  try { run(); passed += 1; console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error.stack || error); }
}
console.log("\nSTAGE 030 RESULT");
console.log(`MASTER_TEST_TOTAL=${tests.length}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${failed}`);
console.log(`STAGE_030_COMPLETE=${failed === 0 ? "YES" : "NO"}`);
if (failed > 0) process.exitCode = 1;
