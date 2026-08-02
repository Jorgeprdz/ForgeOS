"use strict";

(function applicationSignatureAuthorityContractModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const linkContract = isCommonJs
    ? require("../shared-commercial-model/crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(linkContract);
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeApplicationSignatureAuthorityContractCrs06 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(linkContract) {
  const CONTRACT_VERSION = "CRS-06-APPLICATION-SIGNATURE-001.1";
  const SCHEMA_VERSION = "forge.application_signature_authority.v1";
  const CONTRACT_TYPE = "FORGE_APPLICATION_SIGNATURE_AUTHORITY";
  const AUTHORITY = "APPLICATION_AUTHORITY";

  const LIFECYCLE_STATES = Object.freeze([
    "DRAFT", "READY_FOR_SIGNATURE", "PARTIALLY_SIGNED", "SIGNED", "SUBMITTED",
    "REQUIREMENTS_PENDING", "REQUIREMENTS_SATISFIED", "APPROVED", "DECLINED", "WITHDRAWN",
  ]);
  const EVENT_TYPES = Object.freeze([
    "APPLICATION_CREATED", "APPLICATION_VERSION_CREATED", "APPLICATION_READY_FOR_SIGNATURE",
    "SIGNATURE_RECORDED", "APPLICATION_SIGNED", "APPLICATION_SUBMITTED",
    "REQUIREMENT_OPENED", "REQUIREMENT_SATISFIED", "REQUIREMENT_WAIVED",
    "REQUIREMENT_DISPUTED", "APPLICATION_APPROVED", "APPLICATION_DECLINED",
    "APPLICATION_WITHDRAWN",
  ]);
  const EVENT_STATES = Object.freeze({
    APPLICATION_CREATED: ["DRAFT"],
    APPLICATION_VERSION_CREATED: ["DRAFT", "READY_FOR_SIGNATURE"],
    APPLICATION_READY_FOR_SIGNATURE: ["READY_FOR_SIGNATURE"],
    SIGNATURE_RECORDED: ["PARTIALLY_SIGNED", "SIGNED"],
    APPLICATION_SIGNED: ["SIGNED"],
    APPLICATION_SUBMITTED: ["SUBMITTED"],
    REQUIREMENT_OPENED: ["REQUIREMENTS_PENDING"],
    REQUIREMENT_SATISFIED: ["REQUIREMENTS_PENDING", "REQUIREMENTS_SATISFIED"],
    REQUIREMENT_WAIVED: ["REQUIREMENTS_PENDING", "REQUIREMENTS_SATISFIED"],
    REQUIREMENT_DISPUTED: ["REQUIREMENTS_PENDING"],
    APPLICATION_APPROVED: ["APPROVED"],
    APPLICATION_DECLINED: ["DECLINED"],
    APPLICATION_WITHDRAWN: ["WITHDRAWN"],
  });
  const SIGNER_ROLES = Object.freeze([
    "APPLICANT", "INSURED", "OWNER", "PAYOR", "LEGAL_REPRESENTATIVE", "ADVISOR_WITNESS",
  ]);
  const SIGNATURE_STATES = Object.freeze(["PENDING", "SIGNED", "DECLINED", "VOIDED"]);
  const SIGNATURE_EVIDENCE_TYPES = Object.freeze([
    "PROVIDER_RECEIPT", "SIGNED_DOCUMENT_DIGEST", "HUMAN_REVIEW_RECEIPT",
  ]);
  const REQUIREMENT_STATES = Object.freeze(["OPEN", "SATISFIED", "WAIVED", "DISPUTED"]);
  const PRIVACY_CLASSES = Object.freeze(["PRIVATE", "SENSITIVE", "RESTRICTED"]);
  const POLICY_BOUNDARY = Object.freeze({
    signedApplicationIsPolicy: false,
    submittedApplicationIsPolicy: false,
    approvedApplicationIsPolicy: false,
    issuanceEvidenceRequiredForPolicy: true,
    automaticPolicyCreation: false,
  });
  const PROHIBITED_KEY_TOKENS = Object.freeze([
    "rawsignature", "signatureimage", "biometric", "password", "secret", "token",
    "providerpayload", "providerresponse", "pdfbytes", "rawpdf", "base64", "blob",
    "medicalanswers", "healthanswers", "bankaccount",
  ]);
  const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
  const HEX_64 = /^[a-f0-9]{64}$/;

  class ApplicationSignatureAuthorityError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "ApplicationSignatureAuthorityError";
      this.code = code;
      this.details = details;
    }
  }
  const fail = (code, message, details = null) => {
    throw new ApplicationSignatureAuthorityError(code, message, details);
  };
  const plain = value => Boolean(value) && typeof value === "object" &&
    !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const record = (value, code, label) => {
    if (!plain(value)) fail(code, `${label} debe ser un objeto.`);
    return value;
  };
  const exact = (value, allowed, code, label) => {
    const extras = Object.keys(value).filter(key => !allowed.includes(key)).sort();
    if (extras.length) fail(code, `${label} contiene campos no autorizados.`, { extras });
  };
  const opaque = (value, code, label, maximum = 240) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized || normalized.length > maximum || !REFERENCE_PATTERN.test(normalized)) {
      fail(code, `${label} no es válida.`);
    }
    return normalized;
  };
  const optionalOpaque = (value, code, label, maximum = 240) =>
    value === undefined || value === null || value === "" ? null : opaque(value, code, label, maximum);
  const oneOf = (value, allowed, code, label) => {
    const normalized = String(value || "").trim().toUpperCase();
    if (!allowed.includes(normalized)) fail(code, `${label} no es válido.`, { allowed: [...allowed] });
    return normalized;
  };
  const iso = (value, code, label) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code, `${label} no es válida.`);
    return new Date(value).toISOString();
  };
  const optionalIso = (value, code, label) =>
    value === undefined || value === null || value === "" ? null : iso(value, code, label);
  const refs = (value, code, label, minimum = 0) => {
    if (!Array.isArray(value) || value.length < minimum || value.length > 50) {
      fail(code, `${label} no es una lista válida.`);
    }
    const normalized = value.map(item => opaque(item, code, label));
    if (new Set(normalized).size !== normalized.length) fail(code, `${label} contiene duplicados.`);
    return normalized;
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const stableValue = value => {
    if (Array.isArray(value)) return value.map(stableValue);
    if (!plain(value)) return value;
    return Object.keys(value).sort().reduce((output, key) => {
      output[key] = stableValue(value[key]);
      return output;
    }, {});
  };
  const stableStringify = value => JSON.stringify(stableValue(value));
  const fnv1a32 = (text, seed) => {
    let hash = seed >>> 0;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  };
  const stableDigest = value => {
    const text = typeof value === "string" ? value : stableStringify(value);
    return [0, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35]
      .map(mask => fnv1a32(text, 2166136261 ^ mask)).join("");
  };
  const normalizeToken = value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  function findProhibitedKeys(value, path = "$") {
    const findings = [];
    if (Array.isArray(value)) {
      value.forEach((entry, index) => findings.push(...findProhibitedKeys(entry, `${path}[${index}]`)));
      return findings;
    }
    if (!plain(value)) return findings;
    for (const [key, nested] of Object.entries(value)) {
      const next = `${path}.${key}`;
      const token = normalizeToken(key);
      if (PROHIBITED_KEY_TOKENS.some(item => token.includes(item))) findings.push(next);
      findings.push(...findProhibitedKeys(nested, next));
    }
    return [...new Set(findings)].sort();
  }

  function createApplicationVersion(input = {}) {
    record(input, "CRS06_VERSION_REQUIRED", "Application Version");
    exact(input, [
      "applicationReference", "versionReference", "versionNumber", "personReference",
      "quoteReference", "quoteVersionReference", "prospectReference", "productReference",
      "lifecycleState", "previousLifecycleState", "documentReference", "snapshotDigest",
      "sourceEvidenceReferences", "createdAt", "correctionOf",
    ], "CRS06_VERSION_KEYS_INVALID", "Application Version");
    const prohibited = findProhibitedKeys(input);
    if (prohibited.length) fail("CRS06_SENSITIVE_APPLICATION_PAYLOAD_FORBIDDEN", "Application Version sólo puede contener referencias.", { paths: prohibited });
    const snapshotDigest = String(input.snapshotDigest || "").trim().toLowerCase();
    if (!HEX_64.test(snapshotDigest)) fail("CRS06_SNAPSHOT_DIGEST_INVALID", "El digest de Application Version no es válido.");
    return freeze({
      applicationReference: opaque(input.applicationReference, "CRS06_APPLICATION_REFERENCE_INVALID", "La referencia de Application"),
      versionReference: opaque(input.versionReference, "CRS06_VERSION_REFERENCE_INVALID", "La referencia de versión"),
      versionNumber: Number.isInteger(input.versionNumber) && input.versionNumber > 0
        ? input.versionNumber
        : fail("CRS06_VERSION_NUMBER_INVALID", "El número de versión no es válido."),
      personReference: opaque(input.personReference, "CRS06_PERSON_REFERENCE_INVALID", "La referencia de persona"),
      quoteReference: opaque(input.quoteReference, "CRS06_QUOTE_REFERENCE_INVALID", "La referencia de Quote"),
      quoteVersionReference: opaque(input.quoteVersionReference, "CRS06_QUOTE_VERSION_REFERENCE_INVALID", "La referencia de Quote Version"),
      prospectReference: opaque(input.prospectReference, "CRS06_PROSPECT_REFERENCE_INVALID", "La referencia de Prospect"),
      productReference: opaque(input.productReference, "CRS06_PRODUCT_REFERENCE_INVALID", "La referencia de producto"),
      lifecycleState: oneOf(input.lifecycleState, LIFECYCLE_STATES, "CRS06_LIFECYCLE_STATE_INVALID", "El lifecycle"),
      previousLifecycleState: input.previousLifecycleState == null
        ? null
        : oneOf(input.previousLifecycleState, LIFECYCLE_STATES, "CRS06_PREVIOUS_STATE_INVALID", "El lifecycle anterior"),
      documentReference: opaque(input.documentReference, "CRS06_DOCUMENT_REFERENCE_INVALID", "La referencia documental"),
      snapshotDigest,
      sourceEvidenceReferences: refs(input.sourceEvidenceReferences, "CRS06_VERSION_EVIDENCE_INVALID", "La evidencia de versión", 1),
      createdAt: iso(input.createdAt, "CRS06_VERSION_CREATED_AT_INVALID", "La fecha de versión"),
      correctionOf: optionalOpaque(input.correctionOf, "CRS06_VERSION_CORRECTION_INVALID", "La versión corregida"),
    });
  }

  function createSigner(input = {}) {
    record(input, "CRS06_SIGNER_REQUIRED", "El firmante");
    exact(input, ["signerReference", "role", "required", "personReference", "signatureState"], "CRS06_SIGNER_KEYS_INVALID", "El firmante");
    if (typeof input.required !== "boolean") fail("CRS06_SIGNER_REQUIRED_FLAG_INVALID", "La obligatoriedad del firmante no es válida.");
    return freeze({
      signerReference: opaque(input.signerReference, "CRS06_SIGNER_REFERENCE_INVALID", "La referencia del firmante"),
      role: oneOf(input.role, SIGNER_ROLES, "CRS06_SIGNER_ROLE_INVALID", "El rol del firmante"),
      required: input.required,
      personReference: optionalOpaque(input.personReference, "CRS06_SIGNER_PERSON_INVALID", "La persona firmante"),
      signatureState: oneOf(input.signatureState, SIGNATURE_STATES, "CRS06_SIGNATURE_STATE_INVALID", "El estado de firma"),
    });
  }

  function createSignatureEvidence(input = {}) {
    record(input, "CRS06_SIGNATURE_EVIDENCE_REQUIRED", "La evidencia de firma");
    exact(input, [
      "signatureReference", "applicationReference", "versionReference", "signerReference",
      "evidenceType", "documentDigest", "providerReference", "signedAt", "capturedAt",
      "evidenceReferences", "confirmationState", "privacyClass", "correctionOf",
    ], "CRS06_SIGNATURE_EVIDENCE_KEYS_INVALID", "La evidencia de firma");
    const prohibited = findProhibitedKeys(input);
    if (prohibited.length) fail("CRS06_RAW_SIGNATURE_DATA_FORBIDDEN", "La evidencia no puede almacenar firma cruda, biometría ni payloads.", { paths: prohibited });
    const evidenceType = oneOf(input.evidenceType, SIGNATURE_EVIDENCE_TYPES, "CRS06_SIGNATURE_EVIDENCE_TYPE_INVALID", "El tipo de evidencia");
    const documentDigest = String(input.documentDigest || "").trim().toLowerCase();
    if (!HEX_64.test(documentDigest)) fail("CRS06_SIGNATURE_DOCUMENT_DIGEST_INVALID", "El digest del documento firmado no es válido.");
    const providerReference = optionalOpaque(input.providerReference, "CRS06_SIGNATURE_PROVIDER_REFERENCE_INVALID", "La referencia del proveedor");
    if (evidenceType === "PROVIDER_RECEIPT" && !providerReference) {
      fail("CRS06_SIGNATURE_PROVIDER_REFERENCE_REQUIRED", "El recibo de proveedor requiere referencia externa.");
    }
    const signedAt = iso(input.signedAt, "CRS06_SIGNATURE_SIGNED_AT_INVALID", "La fecha de firma");
    const capturedAt = iso(input.capturedAt, "CRS06_SIGNATURE_CAPTURED_AT_INVALID", "La fecha de captura");
    if (Date.parse(capturedAt) < Date.parse(signedAt)) fail("CRS06_SIGNATURE_TIME_ORDER_INVALID", "La captura no puede anteceder a la firma.");
    return freeze({
      signatureReference: opaque(input.signatureReference, "CRS06_SIGNATURE_REFERENCE_INVALID", "La referencia de firma"),
      applicationReference: opaque(input.applicationReference, "CRS06_SIGNATURE_APPLICATION_INVALID", "La Application de firma"),
      versionReference: opaque(input.versionReference, "CRS06_SIGNATURE_VERSION_INVALID", "La versión firmada"),
      signerReference: opaque(input.signerReference, "CRS06_SIGNATURE_SIGNER_INVALID", "El firmante"),
      evidenceType,
      documentDigest,
      providerReference,
      signedAt,
      capturedAt,
      evidenceReferences: refs(input.evidenceReferences, "CRS06_SIGNATURE_EVIDENCE_REFERENCES_INVALID", "Las referencias de firma", 1),
      confirmationState: oneOf(input.confirmationState, ["VERIFIED", "DISPUTED"], "CRS06_SIGNATURE_CONFIRMATION_INVALID", "La confirmación de firma"),
      privacyClass: oneOf(input.privacyClass, PRIVACY_CLASSES, "CRS06_SIGNATURE_PRIVACY_INVALID", "La privacidad de firma"),
      correctionOf: optionalOpaque(input.correctionOf, "CRS06_SIGNATURE_CORRECTION_INVALID", "La firma corregida"),
    });
  }

  function createRequirement(input = {}) {
    record(input, "CRS06_REQUIREMENT_REQUIRED", "El requisito");
    exact(input, [
      "requirementReference", "requirementCode", "state", "evidenceReferences",
      "openedAt", "resolvedAt", "reviewReference", "correctionOf",
    ], "CRS06_REQUIREMENT_KEYS_INVALID", "El requisito");
    const state = oneOf(input.state, REQUIREMENT_STATES, "CRS06_REQUIREMENT_STATE_INVALID", "El estado del requisito");
    const evidenceReferences = refs(input.evidenceReferences || [], "CRS06_REQUIREMENT_EVIDENCE_INVALID", "La evidencia del requisito");
    const resolvedAt = optionalIso(input.resolvedAt, "CRS06_REQUIREMENT_RESOLVED_AT_INVALID", "La resolución del requisito");
    const reviewReference = optionalOpaque(input.reviewReference, "CRS06_REQUIREMENT_REVIEW_INVALID", "La revisión del requisito");
    if (state === "OPEN" && (resolvedAt || reviewReference || evidenceReferences.length)) {
      fail("CRS06_OPEN_REQUIREMENT_RESOLUTION_FORBIDDEN", "Un requisito abierto no puede declarar resolución.");
    }
    if (state !== "OPEN" && (!resolvedAt || !reviewReference || !evidenceReferences.length)) {
      fail("CRS06_REQUIREMENT_RESOLUTION_REQUIRED", "Un requisito resuelto requiere evidencia y revisión.");
    }
    return freeze({
      requirementReference: opaque(input.requirementReference, "CRS06_REQUIREMENT_REFERENCE_INVALID", "La referencia del requisito"),
      requirementCode: opaque(input.requirementCode, "CRS06_REQUIREMENT_CODE_INVALID", "El código del requisito", 100),
      state,
      evidenceReferences,
      openedAt: iso(input.openedAt, "CRS06_REQUIREMENT_OPENED_AT_INVALID", "La apertura del requisito"),
      resolvedAt,
      reviewReference,
      correctionOf: optionalOpaque(input.correctionOf, "CRS06_REQUIREMENT_CORRECTION_INVALID", "El requisito corregido"),
    });
  }

  function createApplicationEvent(input = {}) {
    record(input, "CRS06_EVENT_REQUIRED", "El evento de Application");
    exact(input, [
      "eventReference", "eventType", "applicationReference", "versionReference", "personReference",
      "quoteReference", "lifecycleState", "previousLifecycleState", "occurredAt", "recordedAt",
      "sourceReference", "evidenceReferences", "idempotencyKey", "correctionOf",
    ], "CRS06_EVENT_KEYS_INVALID", "El evento de Application");
    const eventType = oneOf(input.eventType, EVENT_TYPES, "CRS06_EVENT_TYPE_INVALID", "El tipo de evento");
    const lifecycleState = oneOf(input.lifecycleState, LIFECYCLE_STATES, "CRS06_EVENT_STATE_INVALID", "El estado del evento");
    if (!EVENT_STATES[eventType].includes(lifecycleState)) fail("CRS06_EVENT_STATE_MISMATCH", "El evento no corresponde al lifecycle declarado.");
    const occurredAt = iso(input.occurredAt, "CRS06_EVENT_OCCURRED_AT_INVALID", "La fecha efectiva");
    const recordedAt = iso(input.recordedAt, "CRS06_EVENT_RECORDED_AT_INVALID", "La fecha registrada");
    if (Date.parse(recordedAt) < Date.parse(occurredAt)) fail("CRS06_EVENT_TIME_ORDER_INVALID", "El registro no puede anteceder al evento.");
    const base = {
      eventReference: opaque(input.eventReference, "CRS06_EVENT_REFERENCE_INVALID", "La referencia del evento"),
      eventType,
      applicationReference: opaque(input.applicationReference, "CRS06_EVENT_APPLICATION_INVALID", "La Application del evento"),
      versionReference: opaque(input.versionReference, "CRS06_EVENT_VERSION_INVALID", "La versión del evento"),
      personReference: opaque(input.personReference, "CRS06_EVENT_PERSON_INVALID", "La persona del evento"),
      quoteReference: opaque(input.quoteReference, "CRS06_EVENT_QUOTE_INVALID", "La Quote del evento"),
      lifecycleState,
      previousLifecycleState: input.previousLifecycleState == null
        ? null
        : oneOf(input.previousLifecycleState, LIFECYCLE_STATES, "CRS06_EVENT_PREVIOUS_STATE_INVALID", "El estado anterior"),
      occurredAt,
      recordedAt,
      sourceReference: opaque(input.sourceReference, "CRS06_EVENT_SOURCE_INVALID", "La fuente del evento"),
      evidenceReferences: refs(input.evidenceReferences, "CRS06_EVENT_EVIDENCE_INVALID", "La evidencia del evento", 1),
      idempotencyKey: opaque(input.idempotencyKey, "CRS06_EVENT_IDEMPOTENCY_INVALID", "La idempotencia"),
      correctionOf: optionalOpaque(input.correctionOf, "CRS06_EVENT_CORRECTION_INVALID", "El evento corregido"),
    };
    return freeze({ ...base, eventDigest: stableDigest(base) });
  }

  function createApplicationAuthoritySnapshot(input = {}) {
    if (!linkContract?.assertDomainLinkEnvelope) fail("CRS06_DOMAIN_LINK_CONTRACT_REQUIRED", "CRS 02 es obligatorio.");
    record(input, "CRS06_SNAPSHOT_REQUIRED", "El snapshot de Application");
    exact(input, ["applicationVersion", "signers", "signatureEvidence", "requirements", "latestEvent", "domainLink"], "CRS06_SNAPSHOT_KEYS_INVALID", "El snapshot de Application");
    const applicationVersion = createApplicationVersion(input.applicationVersion);
    const signers = (Array.isArray(input.signers) ? input.signers : []).map(createSigner);
    if (!signers.length) fail("CRS06_SIGNERS_REQUIRED", "Application requiere al menos un firmante.");
    if (new Set(signers.map(item => item.signerReference)).size !== signers.length) fail("CRS06_SIGNERS_DUPLICATED", "Los firmantes no pueden repetirse.");
    const signatureEvidence = (Array.isArray(input.signatureEvidence) ? input.signatureEvidence : []).map(createSignatureEvidence);
    const requirements = (Array.isArray(input.requirements) ? input.requirements : []).map(createRequirement);
    const { eventDigest: suppliedEventDigest, ...latestEventInput } = input.latestEvent || {};
    const latestEvent = createApplicationEvent(latestEventInput);
    if (suppliedEventDigest && suppliedEventDigest !== latestEvent.eventDigest) fail("CRS06_EVENT_DIGEST_MISMATCH", "El digest del evento no coincide.");
    const domainLink = linkContract.assertDomainLinkEnvelope(input.domainLink);

    if (domainLink.domain !== "APPLICATION" || domainLink.recordType !== "APPLICATION" ||
      domainLink.authority !== AUTHORITY || domainLink.recordReference !== applicationVersion.applicationReference ||
      domainLink.personReference !== applicationVersion.personReference ||
      domainLink.sourceEventReference !== latestEvent.eventReference) {
      fail("CRS06_APPLICATION_DOMAIN_LINK_MISMATCH", "El vínculo CRS 02 no corresponde a Application.");
    }
    if (latestEvent.applicationReference !== applicationVersion.applicationReference ||
      latestEvent.versionReference !== applicationVersion.versionReference ||
      latestEvent.personReference !== applicationVersion.personReference ||
      latestEvent.quoteReference !== applicationVersion.quoteReference ||
      latestEvent.lifecycleState !== applicationVersion.lifecycleState) {
      fail("CRS06_EVENT_VERSION_LINEAGE_MISMATCH", "Evento, versión, persona y Quote no comparten lineage.");
    }
    const signerMap = new Map(signers.map(item => [item.signerReference, item]));
    for (const evidence of signatureEvidence) {
      const signer = signerMap.get(evidence.signerReference);
      if (!signer || evidence.applicationReference !== applicationVersion.applicationReference ||
        evidence.versionReference !== applicationVersion.versionReference) {
        fail("CRS06_SIGNATURE_LINEAGE_MISMATCH", "La evidencia de firma no corresponde al firmante o versión.");
      }
      if (evidence.confirmationState === "VERIFIED" && signer.signatureState !== "SIGNED") {
        fail("CRS06_VERIFIED_SIGNATURE_STATE_MISMATCH", "La evidencia verificada requiere firmante SIGNED.");
      }
    }
    const requiredSigners = signers.filter(item => item.required);
    const allRequiredSigned = requiredSigners.length > 0 && requiredSigners.every(item => item.signatureState === "SIGNED");
    if (["SIGNED", "SUBMITTED", "REQUIREMENTS_PENDING", "REQUIREMENTS_SATISFIED", "APPROVED"].includes(applicationVersion.lifecycleState) && !allRequiredSigned) {
      fail("CRS06_REQUIRED_SIGNATURES_INCOMPLETE", "El lifecycle requiere todas las firmas obligatorias verificadas.");
    }
    const base = {
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      authority: AUTHORITY,
      applicationVersion,
      signers,
      signatureEvidence,
      requirements,
      latestEvent,
      domainLink,
      policyBoundary: POLICY_BOUNDARY,
      automaticApplicationCreation: false,
      automaticSignatureRequest: false,
      automaticSubmission: false,
      automaticRequirementResolution: false,
      automaticPipelineStageAdvance: false,
      automaticPolicyCreation: false,
      providerMutation: false,
    };
    return freeze({ ...base, snapshotDigest: stableDigest(base) });
  }

  function assertApplicationAuthoritySnapshot(value) {
    record(value, "CRS06_SNAPSHOT_OBJECT_REQUIRED", "El snapshot persistido");
    const recreated = createApplicationAuthoritySnapshot({
      applicationVersion: value.applicationVersion,
      signers: value.signers,
      signatureEvidence: value.signatureEvidence,
      requirements: value.requirements,
      latestEvent: value.latestEvent,
      domainLink: value.domainLink,
    });
    if (value.contractType !== CONTRACT_TYPE || value.contractVersion !== CONTRACT_VERSION ||
      value.schemaVersion !== SCHEMA_VERSION || value.authority !== AUTHORITY ||
      value.snapshotDigest !== recreated.snapshotDigest) {
      fail("CRS06_SNAPSHOT_DIGEST_OR_VERSION_MISMATCH", "El snapshot no coincide con el contrato CRS 06.");
    }
    return recreated;
  }

  function projectApplicationMilestone(eventLike) {
    const { eventDigest: suppliedEventDigest, ...eventInput } = eventLike || {};
    const event = createApplicationEvent(eventInput);
    if (suppliedEventDigest && suppliedEventDigest !== event.eventDigest) fail("CRS06_EVENT_DIGEST_MISMATCH", "El digest del evento no coincide.");
    const milestone = ({
      APPLICATION_SIGNED: "APPLICATION_SIGNED",
      APPLICATION_SUBMITTED: "APPLICATION_SUBMITTED",
      APPLICATION_APPROVED: "APPLICATION_APPROVED",
      APPLICATION_DECLINED: "APPLICATION_DECLINED",
    })[event.eventType] || null;
    return freeze({
      projected: Boolean(milestone),
      milestone,
      applicationReference: event.applicationReference,
      personReference: event.personReference,
      quoteReference: event.quoteReference,
      sourceEventReference: event.eventReference,
      occurredAt: event.occurredAt,
      automaticStageAdvance: false,
      automaticTaskCreation: false,
      automaticPolicyCreation: false,
    });
  }

  return freeze({
    CONTRACT_VERSION, SCHEMA_VERSION, CONTRACT_TYPE, AUTHORITY, LIFECYCLE_STATES,
    EVENT_TYPES, EVENT_STATES, SIGNER_ROLES, SIGNATURE_STATES,
    SIGNATURE_EVIDENCE_TYPES, REQUIREMENT_STATES, POLICY_BOUNDARY,
    PROHIBITED_KEY_TOKENS, ApplicationSignatureAuthorityError, stableDigest,
    findProhibitedKeys, createApplicationVersion, createSigner, createSignatureEvidence,
    createRequirement, createApplicationEvent, createApplicationAuthoritySnapshot,
    assertApplicationAuthoritySnapshot, projectApplicationMilestone,
  });
});
