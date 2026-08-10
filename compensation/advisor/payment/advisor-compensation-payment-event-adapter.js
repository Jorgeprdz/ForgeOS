"use strict";

const crypto = require("crypto");
const {
  COMPENSATION_INTERPRETATION_STATES,
  createAdvisorCompensationConfirmedPaymentEvent
} = require("./advisor-compensation-payment-event-contract");
const {
  consumeCartera080ConfirmedPayment,
  consumeCartera030cCanonicalPayment,
  stable
} = require("./cartera-080-confirmed-payment-consumer");
const {
  resolveProductIdentity
} = require("../rules/advisor-compensation-product-identity-registry");

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

function normalizePolicyContext(policyContext, payment) {
  if (!policyContext || typeof policyContext !== "object" || Array.isArray(policyContext)) {
    return {
      provided: false,
      policyReference: payment.policyReference,
      advisorReference: null,
      productInput: null,
      variant: null,
      policyYear: null,
      sourceAuthority: null,
      sourceSnapshotReference: null
    };
  }

  if (present(policyContext.policyReference) && policyContext.policyReference !== payment.policyReference) {
    const error = new Error("ADVISOR_COMPENSATION_POLICY_CONTEXT_REFERENCE_MISMATCH");
    error.code = "ADVISOR_COMPENSATION_POLICY_CONTEXT_REFERENCE_MISMATCH";
    throw error;
  }

  return {
    provided: true,
    policyReference: payment.policyReference,
    advisorReference: present(policyContext.advisorReference)
      ? String(policyContext.advisorReference).trim()
      : null,
    productInput: present(policyContext.productId)
      ? String(policyContext.productId).trim()
      : present(policyContext.productName)
        ? String(policyContext.productName).trim()
        : null,
    variant: present(policyContext.variant) ? String(policyContext.variant).trim() : null,
    policyYear: Number.isInteger(policyContext.policyYear) && policyContext.policyYear > 0
      ? policyContext.policyYear
      : null,
    sourceAuthority: present(policyContext.sourceAuthority)
      ? String(policyContext.sourceAuthority).trim()
      : null,
    sourceSnapshotReference: present(policyContext.sourceSnapshotReference)
      ? String(policyContext.sourceSnapshotReference).trim()
      : null
  };
}

function resolveInterpretationState({ policyContext, productResolution }) {
  const missingContext = [];
  if (!policyContext.provided) missingContext.push("policy_context");
  if (!policyContext.advisorReference) missingContext.push("advisor_attribution");
  if (!policyContext.productInput) missingContext.push("product_identity");
  if (productResolution.status === "UNKNOWN" && policyContext.productInput) {
    missingContext.push("recognized_product_identity");
  }
  if (productResolution.status === "CONFLICTING") {
    missingContext.push("non_conflicting_product_identity");
  }

  let state = COMPENSATION_INTERPRETATION_STATES.READY_FOR_INTERPRETATION;
  if (!policyContext.provided) state = COMPENSATION_INTERPRETATION_STATES.NEEDS_POLICY_CONTEXT;
  else if (!policyContext.advisorReference) state = COMPENSATION_INTERPRETATION_STATES.NEEDS_ADVISOR_ATTRIBUTION;
  else if (!policyContext.productInput || productResolution.status === "UNKNOWN") {
    state = COMPENSATION_INTERPRETATION_STATES.NEEDS_PRODUCT_IDENTITY;
  } else if (productResolution.status === "CONFLICTING") {
    state = COMPENSATION_INTERPRETATION_STATES.CONFLICTING_PRODUCT_IDENTITY;
  }

  return {
    state,
    missingContext: [...new Set(missingContext)],
    readyForCalculation: state === COMPENSATION_INTERPRETATION_STATES.READY_FOR_INTERPRETATION
  };
}

function selectPayment(payload = {}) {
  if (payload.canonicalPaymentEvent) {
    return consumeCartera030cCanonicalPayment({
      paymentEvent: payload.canonicalPaymentEvent,
      reconciliation: payload.canonicalReconciliation,
      personReference: payload.canonicalPersonReference
    });
  }
  return consumeCartera080ConfirmedPayment({
    command: payload.command,
    handoffReceipt: payload.handoffReceipt
  });
}

function adaptCartera080PaymentToAdvisorCompensationEvent({
  command,
  handoffReceipt,
  canonicalPaymentEvent = null,
  canonicalReconciliation = null,
  canonicalPersonReference = null,
  policyContext = null,
  productIdentities = []
} = {}) {
  const payment = selectPayment({
    command,
    handoffReceipt,
    canonicalPaymentEvent,
    canonicalReconciliation,
    canonicalPersonReference
  });
  const normalizedPolicyContext = normalizePolicyContext(policyContext, payment);
  const productResolution = resolveProductIdentity(
    productIdentities,
    normalizedPolicyContext.productInput
  );
  const interpretation = resolveInterpretationState({
    policyContext: normalizedPolicyContext,
    productResolution
  });

  const semanticPayload = {
    policyReference: payment.policyReference,
    obligationReference: payment.obligationReference,
    personReference: payment.personReference,
    paymentAmount: payment.paymentAmount,
    currency: payment.currency,
    paymentDate: payment.paymentDate,
    periodCoveredStart: payment.periodCoveredStart,
    periodCoveredEnd: payment.periodCoveredEnd,
    evidenceHash: payment.humanDecision.evidenceHash
  };
  const semanticFingerprint = sha256(semanticPayload);
  const evidenceFingerprint = sha256({
    paymentEvidenceReference: payment.paymentEvidenceReference,
    evidenceHash: payment.humanDecision.evidenceHash
  });

  return createAdvisorCompensationConfirmedPaymentEvent({
    eventId: `advisor-compensation-payment:${payment.commandDigest}`,
    sourceSystem: payment.sourceSystem,
    sourceAuthority: payment.sourceAuthority,
    handoffId: payment.handoffId,
    commandDigest: payment.commandDigest,
    idempotencyKey: payment.idempotencyKey,
    correlationId: payment.correlationId,
    paymentEvidenceReference: payment.paymentEvidenceReference,
    policyReference: payment.policyReference,
    obligationReference: payment.obligationReference,
    personReference: payment.personReference,
    advisorReference: normalizedPolicyContext.advisorReference,
    productStatus: productResolution.status,
    productId: productResolution.productId,
    lineOfBusiness: productResolution.identity ? productResolution.identity.lineOfBusiness : null,
    variant: normalizedPolicyContext.variant,
    policyYear: normalizedPolicyContext.policyYear,
    productReason: productResolution.reason,
    paymentAmount: payment.paymentAmount,
    currency: payment.currency,
    paymentDate: payment.paymentDate,
    paymentSource: payment.paymentSource,
    periodCoveredStart: payment.periodCoveredStart,
    periodCoveredEnd: payment.periodCoveredEnd,
    evidenceReferences: payment.evidenceReferences,
    evidenceHash: payment.humanDecision.evidenceHash,
    humanDecisionId: payment.humanDecision.decisionId,
    humanActorId: payment.humanDecision.actorId,
    humanDecidedAt: payment.humanDecision.decidedAt,
    humanReason: payment.humanDecision.reason,
    authorizationBasis: payment.humanDecision.authorizationBasis,
    interpretationState: interpretation.state,
    readyForCalculation: interpretation.readyForCalculation,
    missingContext: interpretation.missingContext,
    semanticFingerprint,
    evidenceFingerprint,
    metadata: {
      sourceCompensationState: payment.compensationState,
      sourceHandoffStatus: payment.handoffStatus,
      sourceReplay: payment.sourceReplay,
      policyContextAuthority: normalizedPolicyContext.sourceAuthority,
      policyContextSnapshotReference: normalizedPolicyContext.sourceSnapshotReference,
      productCandidateIds: productResolution.candidateProductIds || [],
      downstreamResult: payment.downstreamResult
    }
  });
}

module.exports = {
  sha256,
  normalizePolicyContext,
  resolveInterpretationState,
  selectPayment,
  adaptCartera080PaymentToAdvisorCompensationEvent
};
