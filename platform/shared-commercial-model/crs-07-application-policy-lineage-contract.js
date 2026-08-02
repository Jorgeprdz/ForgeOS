"use strict";

(function (root, factory) {
  const common = typeof module !== "undefined" && module.exports;
  const links = common
    ? require("./crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(links);
  if (common) module.exports = api;
  if (root) root.ForgeCrs07ApplicationPolicyLineageContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (links) {
  const CONTRACT_TYPE = "FORGE_APPLICATION_POLICY_LINEAGE";
  const CONTRACT_VERSION = "CRS-07-APPLICATION-POLICY-001.1";
  const SCHEMA_VERSION = "forge.application_policy_lineage.v1";
  const VERIFIED_STATE = "VERIFIED";
  const MISSING_TYPE = "FORGE_MISSING_APPLICATION_POLICY_LINEAGE";
  const MISSING_REASONS = Object.freeze([
    "APPLICATION_NOT_APPROVED", "POLICY_NOT_ISSUED", "ISSUANCE_EVIDENCE_UNAVAILABLE",
    "PERSON_ROLE_UNAVAILABLE", "LINEAGE_CONFLICT",
  ]);
  const APPLICATION_STATES = Object.freeze([
    "DRAFT", "READY_FOR_SIGNATURE", "PARTIALLY_SIGNED", "SIGNED", "SUBMITTED",
    "REQUIREMENTS_PENDING", "REQUIREMENTS_SATISFIED", "APPROVED", "DECLINED", "WITHDRAWN",
  ]);
  const POLICY_STATES = Object.freeze([
    "PENDING", "ISSUED", "ACTIVE", "SUSPENDED", "LAPSED", "CANCELLED",
    "MATURED", "CLAIMED", "UNKNOWN",
  ]);
  const APPLICATION_PERSON_POLICY_ROLES = Object.freeze([
    "POLICY_OWNER", "INSURED", "ADDITIONAL_INSURED", "PAYOR",
  ]);
  const STRONG_ISSUANCE_SOURCE_TYPES = Object.freeze([
    "CARTERA020B_POLICY_PACKET", "POLICY_CONTRACT", "POLICY_SCHEDULE",
    "POLICY_ADMIN_RECORD", "ISSUANCE_CONFIRMATION", "CARRIER_ISSUANCE_RECEIPT",
  ]);
  const BOUNDARIES = Object.freeze({
    automaticPolicyCreation: false,
    automaticPolicyUpdate: false,
    automaticApplicationMutation: false,
    automaticPipelineAdvance: false,
    quoteAsPolicyAuthority: false,
    applicationAsPolicyAuthority: false,
    policyTruthCopied: false,
    signatureEvidenceCopied: false,
    providerMutation: false,
    paymentMutation: false,
    serviceMutation: false,
    timelineMutation: false,
    automaticBusinessAction: false,
  });

  class Crs07ApplicationPolicyLineageError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs07ApplicationPolicyLineageError";
      this.code = code;
      this.details = details;
    }
  }
  const fail = (code, message, details = null) => {
    throw new Crs07ApplicationPolicyLineageError(code, message, details);
  };
  const plain = value => Boolean(value) && typeof value === "object" &&
    !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const object = (value, code, label) => plain(value) ? value : fail(code, `${label} debe ser un objeto.`);
  const exact = (value, allowed, code, label) => {
    const extras = Object.keys(value).filter(key => !allowed.includes(key)).sort();
    if (extras.length) fail(code, `${label} contiene campos no autorizados.`, { extras });
  };
  const reference = (value, code, label, max = 240) => {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text || text.length > max || !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(text)) {
      fail(code, `${label} no es válida.`);
    }
    return text;
  };
  const optionalReference = (value, code, label, max = 240) =>
    value == null || value === "" ? null : reference(value, code, label, max);
  const oneOf = (value, allowed, code, label) => {
    const text = typeof value === "string" ? value.trim().toUpperCase() : "";
    if (!allowed.includes(text)) fail(code, `${label} no es válido.`, { allowed: [...allowed] });
    return text;
  };
  const integer = (value, code, label) => {
    if (!Number.isInteger(value) || value < 1) fail(code, `${label} no es válida.`);
    return value;
  };
  const iso = (value, code, label) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code, `${label} no es ISO.`);
    return new Date(value).toISOString();
  };
  const optionalIso = (value, code, label) => value == null || value === "" ? null : iso(value, code, label);
  const sha256 = (value, code, label) => {
    const text = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!/^[a-f0-9]{64}$/.test(text)) fail(code, `${label} debe ser SHA-256.`);
    return text;
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const stable = value => Array.isArray(value)
    ? value.map(stable)
    : plain(value)
      ? Object.keys(value).sort().reduce((out, key) => ({ ...out, [key]: stable(value[key]) }), {})
      : value;
  const fnv = (text, seed) => {
    let hash = seed >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  };
  const stableDigest = value => {
    const text = typeof value === "string" ? value : JSON.stringify(stable(value));
    return [0, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35, 0x27d4eb2f, 0x165667b1, 0xd3a2646c, 0xfd7046c5]
      .map(mask => fnv(text, 2166136261 ^ mask)).join("");
  };

  function normalizeApplication(input) {
    const value = object(input, "CRS07_APPLICATION_REQUIRED", "Application");
    exact(value, ["applicationReference", "lifecycleState", "personReference", "quoteReference",
      "quoteVersionReference", "prospectReference", "productReference", "currentVersion"],
    "CRS07_APPLICATION_KEYS_INVALID", "Application");
    return freeze({
      applicationReference: reference(value.applicationReference, "CRS07_APPLICATION_REFERENCE_INVALID", "Application"),
      lifecycleState: oneOf(value.lifecycleState, APPLICATION_STATES, "CRS07_APPLICATION_STATE_INVALID", "Estado"),
      personReference: reference(value.personReference, "CRS07_APPLICATION_PERSON_INVALID", "Persona"),
      quoteReference: reference(value.quoteReference, "CRS07_APPLICATION_QUOTE_INVALID", "Quote"),
      quoteVersionReference: reference(value.quoteVersionReference, "CRS07_APPLICATION_QUOTE_VERSION_INVALID", "QuoteVersion"),
      prospectReference: reference(value.prospectReference, "CRS07_APPLICATION_PROSPECT_INVALID", "Prospect"),
      productReference: reference(value.productReference, "CRS07_APPLICATION_PRODUCT_INVALID", "Producto"),
      currentVersion: integer(value.currentVersion, "CRS07_APPLICATION_VERSION_INVALID", "Versión"),
    });
  }

  function normalizePolicy(input) {
    const value = object(input, "CRS07_POLICY_REQUIRED", "Policy");
    exact(value, ["policyReference", "policyVersionReference", "versionNumber", "carrierReference",
      "policyNumber", "productReference", "statusValue", "issueDate", "effectiveFrom",
      "applicationReference", "quoteReference", "evidenceVersionReference", "confirmedAt"],
    "CRS07_POLICY_KEYS_INVALID", "Policy");
    return freeze({
      policyReference: reference(value.policyReference, "CRS07_POLICY_REFERENCE_INVALID", "Policy"),
      policyVersionReference: reference(value.policyVersionReference, "CRS07_POLICY_VERSION_REFERENCE_INVALID", "PolicyVersion"),
      versionNumber: integer(value.versionNumber, "CRS07_POLICY_VERSION_INVALID", "Versión"),
      carrierReference: reference(value.carrierReference, "CRS07_POLICY_CARRIER_INVALID", "Carrier"),
      policyNumber: reference(value.policyNumber, "CRS07_POLICY_NUMBER_INVALID", "Número", 160),
      productReference: reference(value.productReference, "CRS07_POLICY_PRODUCT_INVALID", "Producto"),
      statusValue: oneOf(value.statusValue, POLICY_STATES, "CRS07_POLICY_STATUS_INVALID", "Estado"),
      issueDate: optionalIso(value.issueDate, "CRS07_POLICY_ISSUE_DATE_INVALID", "Emisión"),
      effectiveFrom: optionalIso(value.effectiveFrom, "CRS07_POLICY_EFFECTIVE_FROM_INVALID", "Vigencia"),
      applicationReference: reference(value.applicationReference, "CRS07_POLICY_APPLICATION_INVALID", "Application"),
      quoteReference: reference(value.quoteReference, "CRS07_POLICY_QUOTE_INVALID", "Quote"),
      evidenceVersionReference: reference(value.evidenceVersionReference, "CRS07_POLICY_EVIDENCE_INVALID", "Evidencia"),
      confirmedAt: iso(value.confirmedAt, "CRS07_POLICY_CONFIRMED_AT_INVALID", "Confirmación"),
    });
  }

  function normalizeEvidence(input) {
    const value = object(input, "CRS07_ISSUANCE_EVIDENCE_REQUIRED", "Evidencia");
    exact(value, ["evidenceVersionReference", "verificationState", "sourceType", "documentHash",
      "observedAt", "provenance"], "CRS07_ISSUANCE_EVIDENCE_KEYS_INVALID", "Evidencia");
    const provenance = object(value.provenance, "CRS07_ISSUANCE_PROVENANCE_REQUIRED", "Procedencia");
    exact(provenance, ["issuanceConfirmed", "applicationReference", "sourceAuthority", "reviewReference",
      "packetReference", "sourceReference", "confirmationBoundary"],
    "CRS07_ISSUANCE_PROVENANCE_KEYS_INVALID", "Procedencia");
    if (String(value.verificationState || "").toUpperCase() !== "CONFIRMED") {
      fail("CRS07_ISSUANCE_EVIDENCE_NOT_CONFIRMED", "La evidencia debe estar CONFIRMED.");
    }
    if (provenance.issuanceConfirmed !== true) {
      fail("CRS07_ISSUANCE_CONFIRMATION_REQUIRED", "La emisión debe confirmarse explícitamente.");
    }
    return freeze({
      evidenceVersionReference: reference(value.evidenceVersionReference, "CRS07_EVIDENCE_REFERENCE_INVALID", "Evidencia"),
      verificationState: "CONFIRMED",
      sourceType: oneOf(value.sourceType, STRONG_ISSUANCE_SOURCE_TYPES, "CRS07_ISSUANCE_SOURCE_WEAK", "Fuente"),
      documentHash: sha256(value.documentHash, "CRS07_EVIDENCE_HASH_INVALID", "Hash"),
      observedAt: iso(value.observedAt, "CRS07_EVIDENCE_OBSERVED_AT_INVALID", "Observación"),
      provenance: freeze({
        issuanceConfirmed: true,
        applicationReference: reference(provenance.applicationReference, "CRS07_PROVENANCE_APPLICATION_INVALID", "Application"),
        sourceAuthority: reference(provenance.sourceAuthority, "CRS07_PROVENANCE_AUTHORITY_INVALID", "Autoridad"),
        reviewReference: optionalReference(provenance.reviewReference, "CRS07_PROVENANCE_REVIEW_INVALID", "Revisión"),
        packetReference: optionalReference(provenance.packetReference, "CRS07_PROVENANCE_PACKET_INVALID", "Paquete"),
        sourceReference: optionalReference(provenance.sourceReference, "CRS07_PROVENANCE_SOURCE_INVALID", "Fuente"),
        confirmationBoundary: optionalReference(provenance.confirmationBoundary, "CRS07_PROVENANCE_BOUNDARY_INVALID", "Boundary"),
      }),
    });
  }

  function normalizePersonRole(input) {
    const value = object(input, "CRS07_PERSON_ROLE_REQUIRED", "PolicyRole");
    exact(value, ["policyRoleReference", "policyReference", "personReference", "roleType",
      "confirmationState", "privacyClassification", "visibilityScope", "effectiveFrom", "effectiveTo"],
    "CRS07_PERSON_ROLE_KEYS_INVALID", "PolicyRole");
    if (String(value.confirmationState || "").toUpperCase() !== "CONFIRMED") {
      fail("CRS07_PERSON_ROLE_NOT_CONFIRMED", "El PolicyRole debe estar confirmado.");
    }
    return freeze({
      policyRoleReference: reference(value.policyRoleReference, "CRS07_ROLE_REFERENCE_INVALID", "PolicyRole"),
      policyReference: reference(value.policyReference, "CRS07_ROLE_POLICY_INVALID", "Policy"),
      personReference: reference(value.personReference, "CRS07_ROLE_PERSON_INVALID", "Persona"),
      roleType: oneOf(value.roleType, APPLICATION_PERSON_POLICY_ROLES, "CRS07_ROLE_TYPE_NOT_PERMITTED", "Rol"),
      confirmationState: "CONFIRMED",
      privacyClassification: oneOf(value.privacyClassification, ["PRIVATE", "SENSITIVE", "RESTRICTED"], "CRS07_ROLE_PRIVACY_INVALID", "Privacidad"),
      visibilityScope: oneOf(value.visibilityScope, ["POLICY_TEAM", "OWNING_ADVISOR_ONLY", "RESTRICTED_ROLE_VIEW"], "CRS07_ROLE_VISIBILITY_INVALID", "Visibilidad"),
      effectiveFrom: iso(value.effectiveFrom, "CRS07_ROLE_EFFECTIVE_FROM_INVALID", "Inicio"),
      effectiveTo: optionalIso(value.effectiveTo, "CRS07_ROLE_EFFECTIVE_TO_INVALID", "Fin"),
    });
  }

  function normalizeDomainLink(input) {
    if (!links?.assertDomainLinkEnvelope) fail("CRS07_CRS02_LINK_CONTRACT_REQUIRED", "CRS 02 es obligatorio.");
    const link = links.assertDomainLinkEnvelope(input);
    if (link.domain !== "CARTERA" || link.recordType !== "POLICY" || link.authority !== "CARTERA_POLICY_AUTHORITY") {
      fail("CRS07_POLICY_DOMAIN_LINK_INVALID", "El vínculo debe ser Policy de Cartera.");
    }
    return link;
  }

  function assertSemantics(application, policy, evidence, role, link) {
    if (application.lifecycleState !== "APPROVED") fail("CRS07_APPROVED_APPLICATION_REQUIRED", "Application aprobada requerida.");
    if (policy.applicationReference !== application.applicationReference ||
      evidence.provenance.applicationReference !== application.applicationReference) {
      fail("CRS07_APPLICATION_LINEAGE_MISMATCH", "Application no coincide.");
    }
    if (policy.quoteReference !== application.quoteReference) fail("CRS07_QUOTE_LINEAGE_MISMATCH", "Quote no coincide.");
    if (policy.productReference !== application.productReference) fail("CRS07_PRODUCT_LINEAGE_MISMATCH", "Producto no coincide.");
    if (policy.evidenceVersionReference !== evidence.evidenceVersionReference) fail("CRS07_EVIDENCE_LINEAGE_MISMATCH", "Evidencia no coincide.");
    if (role.policyReference !== policy.policyReference || role.personReference !== application.personReference) {
      fail("CRS07_PERSON_ROLE_LINEAGE_MISMATCH", "PolicyRole no coincide.");
    }
    if (link.personReference !== application.personReference || link.recordReference !== policy.policyReference) {
      fail("CRS07_DOMAIN_LINK_LINEAGE_MISMATCH", "Vínculo CRS 02 no coincide.");
    }
    if (policy.versionNumber === 1 && !["ISSUED", "ACTIVE"].includes(policy.statusValue)) {
      fail("CRS07_INITIAL_POLICY_NOT_ISSUED", "La primera versión debe estar emitida.");
    }
    if (Date.parse(evidence.observedAt) > Date.parse(policy.confirmedAt)) {
      fail("CRS07_EVIDENCE_AFTER_CONFIRMATION", "La evidencia no puede ser posterior.");
    }
  }

  function createApplicationPolicyLineage(input = {}) {
    object(input, "CRS07_LINEAGE_INPUT_REQUIRED", "Lineage");
    exact(input, ["advisorReference", "application", "policy", "issuanceEvidence", "personRole",
      "domainLink", "correlationId"], "CRS07_LINEAGE_INPUT_KEYS_INVALID", "Lineage");
    const application = normalizeApplication(input.application);
    const policy = normalizePolicy(input.policy);
    const issuanceEvidence = normalizeEvidence(input.issuanceEvidence);
    const personRole = normalizePersonRole(input.personRole);
    const domainLink = normalizeDomainLink(input.domainLink);
    assertSemantics(application, policy, issuanceEvidence, personRole, domainLink);
    const base = {
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      lineageState: VERIFIED_STATE,
      advisorReference: reference(input.advisorReference, "CRS07_ADVISOR_REFERENCE_INVALID", "Asesor"),
      application, policy, issuanceEvidence, personRole, domainLink,
      correlationId: optionalReference(input.correlationId ?? domainLink.correlationId, "CRS07_CORRELATION_ID_INVALID", "Correlación"),
      boundaries: BOUNDARIES,
    };
    return freeze({ ...base, lineageDigest: stableDigest(base) });
  }

  function assertApplicationPolicyLineage(value) {
    object(value, "CRS07_LINEAGE_OBJECT_REQUIRED", "Lineage");
    exact(value, ["contractType", "contractVersion", "schemaVersion", "lineageState", "advisorReference",
      "application", "policy", "issuanceEvidence", "personRole", "domainLink", "correlationId",
      "boundaries", "lineageDigest"], "CRS07_LINEAGE_OBJECT_KEYS_INVALID", "Lineage");
    if (value.contractType !== CONTRACT_TYPE || value.contractVersion !== CONTRACT_VERSION ||
      value.schemaVersion !== SCHEMA_VERSION || value.lineageState !== VERIFIED_STATE) {
      fail("CRS07_LINEAGE_CONTRACT_INVALID", "Contrato inválido.");
    }
    const normalized = createApplicationPolicyLineage({
      advisorReference: value.advisorReference,
      application: value.application,
      policy: value.policy,
      issuanceEvidence: value.issuanceEvidence,
      personRole: value.personRole,
      domainLink: value.domainLink,
      correlationId: value.correlationId,
    });
    if (normalized.lineageDigest !== value.lineageDigest) fail("CRS07_LINEAGE_DIGEST_MISMATCH", "Digest inválido.");
    return normalized;
  }

  function createMissingApplicationPolicyLineage(input = {}) {
    object(input, "CRS07_MISSING_INPUT_REQUIRED", "Lineage faltante");
    exact(input, ["advisorReference", "application", "missingReason", "observedAt", "details"],
      "CRS07_MISSING_INPUT_KEYS_INVALID", "Lineage faltante");
    const base = {
      contractType: MISSING_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      lineageState: "UNRESOLVED",
      advisorReference: reference(input.advisorReference, "CRS07_ADVISOR_REFERENCE_INVALID", "Asesor"),
      application: normalizeApplication(input.application),
      missingReason: oneOf(input.missingReason, MISSING_REASONS, "CRS07_MISSING_REASON_INVALID", "Razón"),
      observedAt: iso(input.observedAt, "CRS07_MISSING_OBSERVED_AT_INVALID", "Observación"),
      details: input.details == null ? null : stable(object(input.details, "CRS07_MISSING_DETAILS_INVALID", "Detalles")),
      boundaries: BOUNDARIES,
    };
    return freeze({ ...base, lineageDigest: stableDigest(base) });
  }

  function prepareIssuedPolicyCommand(input = {}) {
    object(input, "CRS07_COMMAND_PREPARATION_REQUIRED", "Preparación");
    exact(input, ["command", "applicationReference", "sourceAuthority"],
      "CRS07_COMMAND_PREPARATION_KEYS_INVALID", "Preparación");
    const command = object(input.command, "CRS07_CONFIRMED_POLICY_COMMAND_REQUIRED", "Comando");
    if (command.contractType !== "FORGE_CONFIRMED_POLICY_COMMAND") {
      fail("CRS07_CONFIRMED_POLICY_COMMAND_INVALID", "Comando Cartera 010B requerido.");
    }
    const applicationReference = reference(input.applicationReference, "CRS07_APPLICATION_REFERENCE_INVALID", "Application");
    const sourceAuthority = reference(input.sourceAuthority, "CRS07_SOURCE_AUTHORITY_INVALID", "Autoridad");
    const cloned = stable(command);
    cloned.lineage = { ...(cloned.lineage || {}), applicationReference };
    cloned.evidence = { ...(cloned.evidence || {}), verificationState: "CONFIRMED" };
    cloned.evidence.provenance = {
      ...(cloned.evidence.provenance || {}), issuanceConfirmed: true, applicationReference, sourceAuthority,
    };
    const digestInput = { ...cloned };
    delete digestInput.commandDigest;
    cloned.commandDigest = stableDigest(digestInput);
    return freeze(cloned);
  }

  return freeze({
    CONTRACT_TYPE, CONTRACT_VERSION, SCHEMA_VERSION, VERIFIED_STATE, MISSING_TYPE,
    MISSING_REASONS, APPLICATION_PERSON_POLICY_ROLES, STRONG_ISSUANCE_SOURCE_TYPES,
    BOUNDARIES, Crs07ApplicationPolicyLineageError, stableDigest, normalizeApplication,
    normalizePolicy, normalizeEvidence, normalizePersonRole, createApplicationPolicyLineage,
    assertApplicationPolicyLineage, createMissingApplicationPolicyLineage, prepareIssuedPolicyCommand,
    diagnostics: () => freeze({
      contractVersion: CONTRACT_VERSION,
      applicationAuthority: "APPLICATION_AUTHORITY",
      policyAuthority: "CARTERA_POLICY_AUTHORITY",
      policyTruthOwner: "POLICY_INTELLIGENCE",
      applicationCreatesPolicy: false,
      quoteCreatesPolicy: false,
      issuanceEvidenceRequired: true,
      confirmedPersonRoleRequired: true,
      multiplePoliciesPerPersonSupported: true,
      multiplePoliciesPerApplicationSupported: false,
      automaticBusinessAction: false,
    }),
  });
});
