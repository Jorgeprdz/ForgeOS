"use strict";

(function acceptedQuoteCarteraRelationshipAdapterModule(root, factory) {
  const contract = typeof module !== "undefined" && module.exports
    ? require("./accepted-quote-cartera-relationship-contract.js")
    : root?.ForgeAcceptedQuoteCarteraRelationshipContract;
  const api = factory(contract);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeAcceptedQuoteCarteraRelationshipAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(contract) {
  const ADAPTER_VERSION = "QUOTE-CARTERA-RELATION-ADAPTER-001.1";
  const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

  class AcceptedQuoteCarteraRelationshipAdapterError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "AcceptedQuoteCarteraRelationshipAdapterError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new AcceptedQuoteCarteraRelationshipAdapterError(code, message, details);
  };
  const isRecord = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const requireRecord = (value, code, label) => {
    if (!isRecord(value)) fail(code, `${label} debe ser un objeto.`);
    return value;
  };
  const reference = (value, code, label) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!REFERENCE_PATTERN.test(normalized)) fail(code, `${label} no es válida.`);
    return normalized;
  };
  const optionalReference = (value, code, label) =>
    value === undefined || value === null || value === ""
      ? null
      : reference(value, code, label);
  const iso = (value, code, label) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      fail(code, `${label} no es una fecha ISO válida.`);
    }
    return new Date(value).toISOString();
  };
  const uniqueReferences = (value, code, label) => {
    const list = Array.isArray(value) ? value : [];
    const output = list.map(item => reference(item, code, label));
    return [...new Set(output)];
  };
  const firstDefined = (...values) => values.find(value =>
    value !== undefined && value !== null && value !== ""
  );
  const frozen = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(frozen);
    return value;
  };

  function requireContract() {
    if (!contract?.createAcceptedQuoteCarteraRelationship) {
      fail("RELATIONSHIP_CONTRACT_REQUIRED", "El contrato Quote-Cartera no está disponible.");
    }
    return contract;
  }

  function persistenceReceiptReference(receipt) {
    const persistence = receipt.persistenceReceipt;
    if (typeof persistence === "string") return persistence;
    if (isRecord(persistence)) {
      return firstDefined(
        persistence.receiptReference,
        persistence.persistenceReceiptReference,
        persistence.eventReceiptReference,
        persistence.id,
      ) || null;
    }
    return firstDefined(
      receipt.persistenceReceiptReference,
      receipt.receiptReference,
    ) || null;
  }

  function quoteFromReceipt(receipt) {
    requireRecord(receipt, "QUOTE_RECEIPT_REQUIRED", "El recibo de Quote");
    const eventReferences = uniqueReferences(
      firstDefined(receipt.eventIds, receipt.eventReferences, receipt.events) || [],
      "QUOTE_RECEIPT_EVENT_REFERENCE_INVALID",
      "La referencia de evento de Quote",
    );
    if (eventReferences.length === 0) {
      fail("QUOTE_RECEIPT_EVENTS_REQUIRED", "El recibo durable debe incluir eventos de Quote.");
    }
    return {
      durable: receipt.durable === true,
      quoteReference: reference(
        receipt.quoteReference,
        "QUOTE_RECEIPT_QUOTE_REFERENCE_INVALID",
        "La referencia de Quote",
      ),
      quoteVersionReference: reference(
        receipt.quoteVersionReference,
        "QUOTE_RECEIPT_VERSION_REFERENCE_INVALID",
        "La referencia de Quote Version",
      ),
      prospectReference: reference(
        receipt.prospectReference,
        "QUOTE_RECEIPT_PROSPECT_REFERENCE_INVALID",
        "La referencia de Prospect",
      ),
      productReference: reference(
        receipt.productReference,
        "QUOTE_RECEIPT_PRODUCT_REFERENCE_INVALID",
        "La referencia de producto",
      ),
      lifecycleState: String(receipt.lifecycleState || "").trim(),
      snapshotDigest: reference(
        receipt.snapshotDigest,
        "QUOTE_RECEIPT_SNAPSHOT_DIGEST_INVALID",
        "El digest del snapshot",
      ),
      eventReferences,
      applicationReference: optionalReference(
        receipt.applicationReference,
        "QUOTE_RECEIPT_APPLICATION_REFERENCE_INVALID",
        "La referencia de Application",
      ),
      persistenceReceiptReference: optionalReference(
        persistenceReceiptReference(receipt),
        "QUOTE_RECEIPT_REFERENCE_INVALID",
        "La referencia del recibo durable",
      ),
    };
  }

  function identityFromReceipt(receipt, prospectReference) {
    if (receipt === undefined || receipt === null) {
      return {
        outcome: "UNRESOLVED",
        prospectReference,
        commercialPersonReference: null,
        decisionReference: null,
        evidenceReferences: [],
      };
    }
    requireRecord(receipt, "IDENTITY_RECEIPT_INVALID", "El recibo de identidad");
    const outcome = String(firstDefined(
      receipt.outcome,
      receipt.identityOutcome,
      receipt.decisionOutcome,
    ) || "").trim();
    if (!outcome) {
      fail("IDENTITY_RECEIPT_OUTCOME_REQUIRED", "El recibo de identidad requiere un resultado explícito.");
    }
    return {
      outcome,
      prospectReference: optionalReference(
        firstDefined(receipt.prospectReference, receipt.sourceProspectReference),
        "IDENTITY_RECEIPT_PROSPECT_REFERENCE_INVALID",
        "La referencia de Prospect de identidad",
      ) || prospectReference,
      commercialPersonReference: optionalReference(
        firstDefined(
          receipt.commercialPersonReference,
          receipt.personReference,
          receipt.resolvedPersonReference,
          receipt.expectedPersonReference,
        ),
        "IDENTITY_RECEIPT_PERSON_REFERENCE_INVALID",
        "La referencia de CommercialPerson",
      ),
      decisionReference: optionalReference(
        firstDefined(
          receipt.decisionReference,
          receipt.identityDecisionReference,
          receipt.commandReceiptReference,
          receipt.receiptReference,
        ),
        "IDENTITY_RECEIPT_DECISION_REFERENCE_INVALID",
        "La referencia de decisión de identidad",
      ),
      evidenceReferences: uniqueReferences(
        firstDefined(receipt.evidenceReferences, receipt.sourceEvidenceReferences) || [],
        "IDENTITY_RECEIPT_EVIDENCE_REFERENCE_INVALID",
        "La referencia de evidencia de identidad",
      ),
    };
  }

  function policyEvidenceFromReceipt(receipt) {
    if (receipt === undefined || receipt === null) {
      return {
        state: "ABSENT",
        packetReference: null,
        evidenceReferences: [],
        reviewedAt: null,
        reviewReference: null,
      };
    }
    requireRecord(receipt, "POLICY_EVIDENCE_RECEIPT_INVALID", "El recibo de evidencia");
    const sourceState = String(firstDefined(
      receipt.state,
      receipt.reviewState,
      receipt.verificationState,
    ) || "").trim();
    if (!sourceState) {
      fail("POLICY_EVIDENCE_RECEIPT_STATE_REQUIRED", "El recibo de evidencia requiere estado explícito.");
    }
    const state = sourceState === "CONFIRMED" ? "REVIEWED" : sourceState;
    return {
      state,
      packetReference: optionalReference(
        firstDefined(receipt.packetReference, receipt.policyPacketReference),
        "POLICY_EVIDENCE_RECEIPT_PACKET_REFERENCE_INVALID",
        "La referencia del paquete de evidencia",
      ),
      evidenceReferences: uniqueReferences(
        firstDefined(
          receipt.evidenceReferences,
          receipt.evidenceVersionReferences,
          receipt.documentReferences,
        ) || [],
        "POLICY_EVIDENCE_RECEIPT_REFERENCE_INVALID",
        "La referencia de evidencia de póliza",
      ),
      reviewedAt: firstDefined(receipt.reviewedAt, receipt.confirmedAt)
        ? iso(
            firstDefined(receipt.reviewedAt, receipt.confirmedAt),
            "POLICY_EVIDENCE_RECEIPT_REVIEWED_AT_INVALID",
            "La fecha de revisión de evidencia",
          )
        : null,
      reviewReference: optionalReference(
        firstDefined(
          receipt.reviewReference,
          receipt.policyReviewReference,
          receipt.confirmationReviewReference,
        ),
        "POLICY_EVIDENCE_RECEIPT_REVIEW_REFERENCE_INVALID",
        "La referencia de revisión de evidencia",
      ),
    };
  }

  function createRelationshipFromAuthorityReceipts(input = {}) {
    requireRecord(input, "ADAPTER_INPUT_REQUIRED", "La entrada del adaptador");
    const relationshipContract = requireContract();
    const quote = quoteFromReceipt(input.quoteReceipt);
    return relationshipContract.createAcceptedQuoteCarteraRelationship({
      relationReference: input.relationReference || null,
      advisorId: reference(input.advisorId, "ADAPTER_ADVISOR_ID_INVALID", "El advisor"),
      actorReference: reference(
        input.actorReference,
        "ADAPTER_ACTOR_REFERENCE_INVALID",
        "El actor",
      ),
      createdAt: iso(input.createdAt, "ADAPTER_CREATED_AT_INVALID", "La fecha de relación"),
      quote,
      identity: identityFromReceipt(input.identityReceipt, quote.prospectReference),
      policyEvidence: policyEvidenceFromReceipt(input.policyEvidenceReceipt),
    });
  }

  return frozen({
    ADAPTER_VERSION,
    AcceptedQuoteCarteraRelationshipAdapterError,
    quoteFromReceipt,
    identityFromReceipt,
    policyEvidenceFromReceipt,
    createRelationshipFromAuthorityReceipts,
    diagnostics: () => frozen({
      adapterVersion: ADAPTER_VERSION,
      automaticListeners: false,
      automaticRpc: false,
      automaticPersistence: false,
      automaticPolicyCreation: false,
      automaticPolicyConfirmation: false,
    }),
  });
});
