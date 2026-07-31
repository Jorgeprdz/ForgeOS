"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeCartera010BContractValidator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const CONTRACT_VERSION = "CARTERA-010B.1";
  const PERSON_STATES = ["CANDIDATE", "CONFIRMED", "DISPUTED", "ARCHIVED"];
  const ACCOUNT_TYPES = ["INDIVIDUAL", "HOUSEHOLD", "BUSINESS", "CORPORATE", "FAMILY_BUSINESS", "GROUP_AFFINITY"];
  const POLICY_STATUSES = ["PENDING", "ISSUED", "ACTIVE", "SUSPENDED", "LAPSED", "CANCELLED", "MATURED", "CLAIMED", "UNKNOWN"];
  const ROLE_TYPES = ["POLICY_OWNER", "INSURED", "ADDITIONAL_INSURED", "PAYOR", "BENEFICIARY", "ADVISOR_OF_RECORD", "ORIGINATING_ADVISOR", "SERVICING_ADVISOR"];
  const CONFIRMATION_STATES = ["CONFIRMED", "PROPOSED", "DISPUTED", "CORRECTED"];
  const PRIVACY = ["PRIVATE", "SENSITIVE", "RESTRICTED"];
  const VISIBILITY = ["POLICY_TEAM", "OWNING_ADVISOR_ONLY", "RESTRICTED_ROLE_VIEW"];
  const COMPLETENESS = ["COMPLETE", "PARTIAL", "UNKNOWN"];
  const FRESHNESS = ["CURRENT", "STALE", "UNKNOWN"];
  const CONFLICT = ["CLEAR", "CONFLICT", "UNRESOLVED"];
  const FREQUENCIES = ["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "SINGLE", "OTHER"];

  class Cartera010BContractError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Cartera010BContractError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Cartera010BContractError(code, message, details);
  };
  const plain = value =>
    !!value && typeof value === "object" && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const exact = (value, keys, code) => {
    const extras = Object.keys(value).filter(key => !keys.includes(key));
    if (extras.length) fail(code, "Campos no autorizados.", { extras });
  };
  const text = (value, code, max = 240) => {
    if (typeof value !== "string" || !value.trim() || value.trim().length > max) fail(code, "Texto inválido.");
    return value.trim();
  };
  const optionalText = (value, code, max = 240) =>
    value === undefined || value === null || value === "" ? null : text(value, code, max);
  const opaque = (value, code, max = 240) => {
    const normalized = text(value, code, max);
    if (!/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(normalized)) fail(code, "Referencia opaca inválida.");
    return normalized;
  };
  const optionalOpaque = (value, code, max = 240) =>
    value === undefined || value === null || value === "" ? null : opaque(value, code, max);
  const oneOf = (value, allowed, code) => {
    const normalized = text(value, code, 80);
    if (!allowed.includes(normalized)) fail(code, "Valor fuera de catálogo.", { allowed });
    return normalized;
  };
  const iso = (value, code) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code, "Fecha ISO inválida.");
    return new Date(value).toISOString();
  };
  const optionalIso = (value, code) =>
    value === undefined || value === null || value === "" ? null : iso(value, code);
  const date = (value, code) => {
    const normalized = text(value, code, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || Number.isNaN(Date.parse(`${normalized}T00:00:00Z`))) fail(code, "Fecha inválida.");
    return normalized;
  };
  const optionalDate = (value, code) =>
    value === undefined || value === null || value === "" ? null : date(value, code);
  const integer = (value, code) => {
    if (!Number.isInteger(value) || value < 1) fail(code, "Versión inválida.");
    return value;
  };
  const amount = (value, code) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) fail(code, "Monto inválido.");
    return value;
  };
  const refs = (value, code, min = 0) => {
    if (!Array.isArray(value) || value.length < min || value.length > 100) fail(code, "Lista de referencias inválida.");
    const normalized = value.map(item => opaque(item, code));
    if (new Set(normalized).size !== normalized.length) fail(code, "Referencias duplicadas.");
    return normalized;
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const stable = value => {
    if (Array.isArray(value)) return value.map(stable);
    if (!plain(value)) return value;
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = stable(value[key]);
      return out;
    }, {});
  };
  const stableStringify = value => JSON.stringify(stable(value));
  const fnv = (input, seed) => {
    let hash = seed >>> 0;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  };
  const stableDigest = value => {
    const input = typeof value === "string" ? value : stableStringify(value);
    return [0, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35, 0x27d4eb2f, 0x165667b1, 0xd3a2646c, 0xfd7046c5]
      .map(mask => fnv(input, 2166136261 ^ mask)).join("");
  };
  const object = (value, code) => {
    if (!plain(value)) fail(code, "Objeto requerido.");
    return value;
  };

  function archive(value, state, code) {
    const archivedAt = optionalIso(value.archivedAt, code);
    const archivedBy = optionalOpaque(value.archivedBy, code);
    const archiveReason = optionalText(value.archiveReason, code, 500);
    const complete = !!archivedAt && !!archivedBy && !!archiveReason;
    if (state === "ARCHIVED" ? !complete : archivedAt || archivedBy || archiveReason) fail(code, "Metadatos de archivo inválidos.");
    return { archivedAt, archivedBy, archiveReason };
  }

  function validateCommercialPerson(input) {
    const value = object(input, "CARTERA010B_PERSON_OBJECT_REQUIRED");
    exact(value, ["contractType", "schemaVersion", "personReference", "advisorId", "displayIdentity", "normalizedMatching", "lifecycleState", "privacyClassification", "evidenceReferences", "createdAt", "createdBy", "updatedAt", "version", "archivedAt", "archivedBy", "archiveReason"], "CARTERA010B_PERSON_KEYS_INVALID");
    if (value.contractType !== "FORGE_COMMERCIAL_PERSON" || value.schemaVersion !== "1.0.0") fail("CARTERA010B_PERSON_CONTRACT_INVALID", "Contrato inválido.");
    const display = object(value.displayIdentity, "CARTERA010B_PERSON_DISPLAY_INVALID");
    const matching = object(value.normalizedMatching, "CARTERA010B_PERSON_MATCHING_INVALID");
    exact(display, ["displayName", "preferredName"], "CARTERA010B_PERSON_DISPLAY_KEYS_INVALID");
    exact(matching, ["normalizedName", "verifiedPhone", "verifiedEmail", "birthDate"], "CARTERA010B_PERSON_MATCHING_KEYS_INVALID");
    const state = oneOf(value.lifecycleState, PERSON_STATES, "CARTERA010B_PERSON_STATE_INVALID");
    return freeze({
      contractType: value.contractType,
      schemaVersion: value.schemaVersion,
      personReference: opaque(value.personReference, "CARTERA010B_PERSON_REFERENCE_INVALID"),
      advisorId: opaque(value.advisorId, "CARTERA010B_PERSON_ADVISOR_INVALID"),
      displayIdentity: {
        displayName: text(display.displayName, "CARTERA010B_PERSON_DISPLAY_NAME_INVALID"),
        preferredName: optionalText(display.preferredName, "CARTERA010B_PERSON_PREFERRED_NAME_INVALID", 160),
      },
      normalizedMatching: {
        normalizedName: text(matching.normalizedName, "CARTERA010B_PERSON_NORMALIZED_NAME_INVALID"),
        verifiedPhone: optionalText(matching.verifiedPhone, "CARTERA010B_PERSON_PHONE_INVALID", 40),
        verifiedEmail: optionalText(matching.verifiedEmail, "CARTERA010B_PERSON_EMAIL_INVALID", 320),
        birthDate: optionalDate(matching.birthDate, "CARTERA010B_PERSON_BIRTH_DATE_INVALID"),
      },
      lifecycleState: state,
      privacyClassification: oneOf(value.privacyClassification, PRIVACY, "CARTERA010B_PERSON_PRIVACY_INVALID"),
      evidenceReferences: refs(value.evidenceReferences, "CARTERA010B_PERSON_EVIDENCE_INVALID"),
      createdAt: iso(value.createdAt, "CARTERA010B_PERSON_CREATED_AT_INVALID"),
      createdBy: opaque(value.createdBy, "CARTERA010B_PERSON_CREATED_BY_INVALID"),
      updatedAt: iso(value.updatedAt, "CARTERA010B_PERSON_UPDATED_AT_INVALID"),
      version: integer(value.version, "CARTERA010B_PERSON_VERSION_INVALID"),
      ...archive(value, state, "CARTERA010B_PERSON_ARCHIVE_INVALID"),
    });
  }

  function validateCommercialAccount(input) {
    const value = object(input, "CARTERA010B_ACCOUNT_OBJECT_REQUIRED");
    exact(value, ["contractType", "schemaVersion", "accountReference", "advisorId", "accountType", "displayLabel", "lifecycleState", "privacyClassification", "evidenceReferences", "createdAt", "createdBy", "updatedAt", "version", "archivedAt", "archivedBy", "archiveReason"], "CARTERA010B_ACCOUNT_KEYS_INVALID");
    if (value.contractType !== "FORGE_COMMERCIAL_ACCOUNT" || value.schemaVersion !== "1.0.0") fail("CARTERA010B_ACCOUNT_CONTRACT_INVALID", "Contrato inválido.");
    const state = oneOf(value.lifecycleState, PERSON_STATES, "CARTERA010B_ACCOUNT_STATE_INVALID");
    return freeze({
      contractType: value.contractType,
      schemaVersion: value.schemaVersion,
      accountReference: opaque(value.accountReference, "CARTERA010B_ACCOUNT_REFERENCE_INVALID"),
      advisorId: opaque(value.advisorId, "CARTERA010B_ACCOUNT_ADVISOR_INVALID"),
      accountType: oneOf(value.accountType, ACCOUNT_TYPES, "CARTERA010B_ACCOUNT_TYPE_INVALID"),
      displayLabel: text(value.displayLabel, "CARTERA010B_ACCOUNT_LABEL_INVALID"),
      lifecycleState: state,
      privacyClassification: oneOf(value.privacyClassification, PRIVACY, "CARTERA010B_ACCOUNT_PRIVACY_INVALID"),
      evidenceReferences: refs(value.evidenceReferences, "CARTERA010B_ACCOUNT_EVIDENCE_INVALID"),
      createdAt: iso(value.createdAt, "CARTERA010B_ACCOUNT_CREATED_AT_INVALID"),
      createdBy: opaque(value.createdBy, "CARTERA010B_ACCOUNT_CREATED_BY_INVALID"),
      updatedAt: iso(value.updatedAt, "CARTERA010B_ACCOUNT_UPDATED_AT_INVALID"),
      version: integer(value.version, "CARTERA010B_ACCOUNT_VERSION_INVALID"),
      ...archive(value, state, "CARTERA010B_ACCOUNT_ARCHIVE_INVALID"),
    });
  }

  function validatePolicyRole(input) {
    const value = object(input, "CARTERA010B_ROLE_OBJECT_REQUIRED");
    exact(value, ["contractType", "schemaVersion", "policyRoleReference", "policyReference", "advisorId", "participantPersonReference", "participantAccountReference", "roleType", "confirmationState", "privacyClassification", "visibilityScope", "evidenceReferences", "effectiveFrom", "effectiveTo", "createdAt", "createdBy", "version", "correctionOf", "archivedAt", "archivedBy", "archiveReason"], "CARTERA010B_ROLE_KEYS_INVALID");
    if (value.contractType !== "FORGE_POLICY_ROLE" || value.schemaVersion !== "1.0.0") fail("CARTERA010B_ROLE_CONTRACT_INVALID", "Contrato inválido.");
    const person = optionalOpaque(value.participantPersonReference, "CARTERA010B_ROLE_PERSON_INVALID");
    const account = optionalOpaque(value.participantAccountReference, "CARTERA010B_ROLE_ACCOUNT_INVALID");
    if (!!person === !!account) fail("CARTERA010B_ROLE_PARTICIPANT_XOR_INVALID", "Se requiere exactamente una persona o cuenta.");
    const roleType = oneOf(value.roleType, ROLE_TYPES, "CARTERA010B_ROLE_TYPE_INVALID");
    const visibility = oneOf(value.visibilityScope, VISIBILITY, "CARTERA010B_ROLE_VISIBILITY_INVALID");
    if (roleType === "BENEFICIARY" && visibility === "POLICY_TEAM") fail("CARTERA010B_BENEFICIARY_VISIBILITY_TOO_BROAD", "Beneficiario restringido.");
    const from = iso(value.effectiveFrom, "CARTERA010B_ROLE_EFFECTIVE_FROM_INVALID");
    const to = optionalIso(value.effectiveTo, "CARTERA010B_ROLE_EFFECTIVE_TO_INVALID");
    if (to && to <= from) fail("CARTERA010B_ROLE_EFFECTIVE_RANGE_INVALID", "Rango inválido.");
    const archivedAt = optionalIso(value.archivedAt, "CARTERA010B_ROLE_ARCHIVE_INVALID");
    const archivedBy = optionalOpaque(value.archivedBy, "CARTERA010B_ROLE_ARCHIVE_INVALID");
    const archiveReason = optionalText(value.archiveReason, "CARTERA010B_ROLE_ARCHIVE_INVALID", 500);
    if ([archivedAt, archivedBy, archiveReason].filter(Boolean).length % 3) fail("CARTERA010B_ROLE_ARCHIVE_METADATA_INVALID", "Archivo incompleto.");
    return freeze({
      contractType: value.contractType,
      schemaVersion: value.schemaVersion,
      policyRoleReference: opaque(value.policyRoleReference, "CARTERA010B_ROLE_REFERENCE_INVALID"),
      policyReference: opaque(value.policyReference, "CARTERA010B_ROLE_POLICY_INVALID"),
      advisorId: opaque(value.advisorId, "CARTERA010B_ROLE_ADVISOR_INVALID"),
      participantPersonReference: person,
      participantAccountReference: account,
      roleType,
      confirmationState: oneOf(value.confirmationState, CONFIRMATION_STATES, "CARTERA010B_ROLE_CONFIRMATION_INVALID"),
      privacyClassification: oneOf(value.privacyClassification, PRIVACY, "CARTERA010B_ROLE_PRIVACY_INVALID"),
      visibilityScope: visibility,
      evidenceReferences: refs(value.evidenceReferences, "CARTERA010B_ROLE_EVIDENCE_INVALID", 1),
      effectiveFrom: from,
      effectiveTo: to,
      createdAt: iso(value.createdAt, "CARTERA010B_ROLE_CREATED_AT_INVALID"),
      createdBy: opaque(value.createdBy, "CARTERA010B_ROLE_CREATED_BY_INVALID"),
      version: integer(value.version, "CARTERA010B_ROLE_VERSION_INVALID"),
      correctionOf: optionalOpaque(value.correctionOf, "CARTERA010B_ROLE_CORRECTION_INVALID"),
      archivedAt, archivedBy, archiveReason,
    });
  }

  function validatePolicy(input) {
    const value = object(input, "CARTERA010B_POLICY_OBJECT_REQUIRED");
    exact(value, ["contractType", "schemaVersion", "policyReference", "advisorId", "carrierReference", "policyNumber", "productReference", "issueDate", "effectiveFrom", "effectiveTo", "status", "currency", "premiumAmount", "paymentFrequency", "sumInsured", "completenessState", "freshnessState", "conflictState", "evidenceVersionReferences", "currentVersion", "createdAt", "createdBy", "updatedAt", "archivedAt", "archivedBy", "archiveReason"], "CARTERA010B_POLICY_KEYS_INVALID");
    if (value.contractType !== "FORGE_CANONICAL_POLICY" || value.schemaVersion !== "2.0.0") fail("CARTERA010B_POLICY_CONTRACT_INVALID", "Contrato inválido.");
    const status = object(value.status, "CARTERA010B_POLICY_STATUS_OBJECT_INVALID");
    exact(status, ["value", "source", "asOf"], "CARTERA010B_POLICY_STATUS_KEYS_INVALID");
    const currency = optionalText(value.currency, "CARTERA010B_POLICY_CURRENCY_INVALID", 3);
    if (currency && !/^[A-Z]{3}$/.test(currency)) fail("CARTERA010B_POLICY_CURRENCY_INVALID", "Moneda inválida.");
    const from = optionalIso(value.effectiveFrom, "CARTERA010B_POLICY_EFFECTIVE_FROM_INVALID");
    const to = optionalIso(value.effectiveTo, "CARTERA010B_POLICY_EFFECTIVE_TO_INVALID");
    if (from && to && to <= from) fail("CARTERA010B_POLICY_EFFECTIVE_RANGE_INVALID", "Rango inválido.");
    return freeze({
      contractType: value.contractType,
      schemaVersion: value.schemaVersion,
      policyReference: opaque(value.policyReference, "CARTERA010B_POLICY_REFERENCE_INVALID"),
      advisorId: opaque(value.advisorId, "CARTERA010B_POLICY_ADVISOR_INVALID"),
      carrierReference: opaque(value.carrierReference, "CARTERA010B_POLICY_CARRIER_INVALID"),
      policyNumber: text(value.policyNumber, "CARTERA010B_POLICY_NUMBER_INVALID", 160),
      productReference: opaque(value.productReference, "CARTERA010B_POLICY_PRODUCT_INVALID"),
      issueDate: optionalDate(value.issueDate, "CARTERA010B_POLICY_ISSUE_DATE_INVALID"),
      effectiveFrom: from,
      effectiveTo: to,
      status: {
        value: oneOf(status.value, POLICY_STATUSES, "CARTERA010B_POLICY_STATUS_INVALID"),
        source: opaque(status.source, "CARTERA010B_POLICY_STATUS_SOURCE_INVALID"),
        asOf: iso(status.asOf, "CARTERA010B_POLICY_STATUS_AS_OF_INVALID"),
      },
      currency,
      premiumAmount: amount(value.premiumAmount, "CARTERA010B_POLICY_PREMIUM_INVALID"),
      paymentFrequency: value.paymentFrequency == null ? null : oneOf(value.paymentFrequency, FREQUENCIES, "CARTERA010B_POLICY_FREQUENCY_INVALID"),
      sumInsured: amount(value.sumInsured, "CARTERA010B_POLICY_SUM_INSURED_INVALID"),
      completenessState: oneOf(value.completenessState, COMPLETENESS, "CARTERA010B_POLICY_COMPLETENESS_INVALID"),
      freshnessState: oneOf(value.freshnessState, FRESHNESS, "CARTERA010B_POLICY_FRESHNESS_INVALID"),
      conflictState: oneOf(value.conflictState, CONFLICT, "CARTERA010B_POLICY_CONFLICT_INVALID"),
      evidenceVersionReferences: refs(value.evidenceVersionReferences, "CARTERA010B_POLICY_EVIDENCE_INVALID", 1),
      currentVersion: integer(value.currentVersion, "CARTERA010B_POLICY_VERSION_INVALID"),
      createdAt: iso(value.createdAt, "CARTERA010B_POLICY_CREATED_AT_INVALID"),
      createdBy: opaque(value.createdBy, "CARTERA010B_POLICY_CREATED_BY_INVALID"),
      updatedAt: iso(value.updatedAt, "CARTERA010B_POLICY_UPDATED_AT_INVALID"),
      archivedAt: optionalIso(value.archivedAt, "CARTERA010B_POLICY_ARCHIVE_INVALID"),
      archivedBy: optionalOpaque(value.archivedBy, "CARTERA010B_POLICY_ARCHIVE_INVALID"),
      archiveReason: optionalText(value.archiveReason, "CARTERA010B_POLICY_ARCHIVE_INVALID", 500),
    });
  }

  function buildIdentityResolutionCommand(input) {
    const value = object(input, "CARTERA010B_IDENTITY_COMMAND_OBJECT_REQUIRED");
    exact(value, ["advisorId", "actorReference", "idempotencyKey", "decidedAt", "outcome", "sourceIdentity", "existingPersonReference", "newPerson", "candidatePersonReferences", "evidenceReferences", "reasonCode"], "CARTERA010B_IDENTITY_COMMAND_KEYS_INVALID");
    const outcome = oneOf(value.outcome, ["LINK_CONFIRMED", "CREATE_CONFIRMED", "UNRESOLVED", "REJECTED_MATCH", "CONFLICT", "CORRECTED"], "CARTERA010B_IDENTITY_OUTCOME_INVALID");
    const source = object(value.sourceIdentity, "CARTERA010B_SOURCE_IDENTITY_INVALID");
    exact(source, ["sourceDomain", "sourceIdentityType", "sourceRecordReference", "prospectReference"], "CARTERA010B_SOURCE_IDENTITY_KEYS_INVALID");
    const existing = optionalOpaque(value.existingPersonReference, "CARTERA010B_EXISTING_PERSON_INVALID");
    const newPerson = value.newPerson == null ? null : object(value.newPerson, "CARTERA010B_NEW_PERSON_INVALID");
    if (outcome === "LINK_CONFIRMED" && (!existing || newPerson)) fail("CARTERA010B_LINK_COMMAND_INVALID", "LINK_CONFIRMED inválido.");
    if (outcome === "CREATE_CONFIRMED" && (!newPerson || existing)) fail("CARTERA010B_CREATE_COMMAND_INVALID", "CREATE_CONFIRMED inválido.");
    if (!["LINK_CONFIRMED", "CREATE_CONFIRMED", "CORRECTED"].includes(outcome) && (existing || newPerson)) fail("CARTERA010B_UNRESOLVED_COMMAND_MUTATION_FORBIDDEN", "Resultado no confirmado no puede mutar.");
    let reviewed = null;
    if (newPerson) {
      exact(newPerson, ["personReference", "displayName", "preferredName", "normalizedName", "verifiedPhone", "verifiedEmail", "birthDate", "privacyClassification"], "CARTERA010B_NEW_PERSON_KEYS_INVALID");
      reviewed = {
        personReference: opaque(newPerson.personReference, "CARTERA010B_NEW_PERSON_REFERENCE_INVALID"),
        displayName: text(newPerson.displayName, "CARTERA010B_NEW_PERSON_DISPLAY_NAME_INVALID"),
        preferredName: optionalText(newPerson.preferredName, "CARTERA010B_NEW_PERSON_PREFERRED_NAME_INVALID", 160),
        normalizedName: text(newPerson.normalizedName, "CARTERA010B_NEW_PERSON_NORMALIZED_NAME_INVALID"),
        verifiedPhone: optionalText(newPerson.verifiedPhone, "CARTERA010B_NEW_PERSON_PHONE_INVALID", 40),
        verifiedEmail: optionalText(newPerson.verifiedEmail, "CARTERA010B_NEW_PERSON_EMAIL_INVALID", 320),
        birthDate: optionalDate(newPerson.birthDate, "CARTERA010B_NEW_PERSON_BIRTH_DATE_INVALID"),
        privacyClassification: oneOf(newPerson.privacyClassification, PRIVACY, "CARTERA010B_NEW_PERSON_PRIVACY_INVALID"),
      };
    }
    const command = {
      contractType: "FORGE_IDENTITY_RESOLUTION_COMMAND",
      contractVersion: CONTRACT_VERSION,
      advisorId: opaque(value.advisorId, "CARTERA010B_IDENTITY_ADVISOR_INVALID"),
      actorReference: opaque(value.actorReference, "CARTERA010B_IDENTITY_ACTOR_INVALID"),
      idempotencyKey: opaque(value.idempotencyKey, "CARTERA010B_IDENTITY_IDEMPOTENCY_INVALID", 160),
      decidedAt: iso(value.decidedAt, "CARTERA010B_IDENTITY_DECIDED_AT_INVALID"),
      outcome,
      sourceIdentity: {
        sourceDomain: opaque(source.sourceDomain, "CARTERA010B_SOURCE_DOMAIN_INVALID", 120),
        sourceIdentityType: opaque(source.sourceIdentityType, "CARTERA010B_SOURCE_TYPE_INVALID", 120),
        sourceRecordReference: opaque(source.sourceRecordReference, "CARTERA010B_SOURCE_RECORD_INVALID"),
        prospectReference: optionalOpaque(source.prospectReference, "CARTERA010B_SOURCE_PROSPECT_INVALID"),
      },
      existingPersonReference: existing,
      newPerson: reviewed,
      candidatePersonReferences: refs(value.candidatePersonReferences || [], "CARTERA010B_IDENTITY_CANDIDATES_INVALID"),
      evidenceReferences: refs(value.evidenceReferences, "CARTERA010B_IDENTITY_EVIDENCE_INVALID", 1),
      reasonCode: opaque(value.reasonCode, "CARTERA010B_IDENTITY_REASON_INVALID", 120),
    };
    return freeze({ ...command, commandDigest: stableDigest(command) });
  }

  function buildConfirmedPolicyCommand(input) {
    const value = object(input, "CARTERA010B_POLICY_COMMAND_OBJECT_REQUIRED");
    exact(value, ["advisorId", "actorReference", "idempotencyKey", "confirmedAt", "policy", "roles", "evidence", "lineage"], "CARTERA010B_POLICY_COMMAND_KEYS_INVALID");
    const policy = validatePolicy(value.policy);
    if (policy.advisorId !== value.advisorId) fail("CARTERA010B_POLICY_COMMAND_OWNER_MISMATCH", "Owner mismatch.");
    if (!Array.isArray(value.roles) || !value.roles.length || value.roles.length > 100) fail("CARTERA010B_POLICY_COMMAND_ROLES_INVALID", "Roles inválidos.");
    const roles = value.roles.map(validatePolicyRole);
    roles.forEach(role => {
      if (role.policyReference !== policy.policyReference || role.advisorId !== policy.advisorId) fail("CARTERA010B_POLICY_ROLE_SCOPE_MISMATCH", "Scope mismatch.");
      if (role.confirmationState !== "CONFIRMED") fail("CARTERA010B_POLICY_ROLE_UNCONFIRMED", "Rol no confirmado.");
    });
    const evidence = object(value.evidence, "CARTERA010B_POLICY_EVIDENCE_OBJECT_INVALID");
    exact(evidence, ["evidenceVersionReference", "documentHash", "sourceType", "observedAt", "verificationState", "fieldClaims", "provenance"], "CARTERA010B_POLICY_EVIDENCE_KEYS_INVALID");
    const documentHash = text(evidence.documentHash, "CARTERA010B_POLICY_DOCUMENT_HASH_INVALID", 64).toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(documentHash) || !plain(evidence.fieldClaims) || !plain(evidence.provenance)) fail("CARTERA010B_POLICY_EVIDENCE_PAYLOAD_INVALID", "Evidencia inválida.");
    const lineage = value.lineage == null ? {} : object(value.lineage, "CARTERA010B_POLICY_LINEAGE_INVALID");
    exact(lineage, ["quoteReference", "applicationReference", "previousPolicyVersionReference"], "CARTERA010B_POLICY_LINEAGE_KEYS_INVALID");
    const command = {
      contractType: "FORGE_CONFIRMED_POLICY_COMMAND",
      contractVersion: CONTRACT_VERSION,
      advisorId: opaque(value.advisorId, "CARTERA010B_POLICY_COMMAND_ADVISOR_INVALID"),
      actorReference: opaque(value.actorReference, "CARTERA010B_POLICY_COMMAND_ACTOR_INVALID"),
      idempotencyKey: opaque(value.idempotencyKey, "CARTERA010B_POLICY_COMMAND_IDEMPOTENCY_INVALID", 160),
      confirmedAt: iso(value.confirmedAt, "CARTERA010B_POLICY_COMMAND_CONFIRMED_AT_INVALID"),
      policy,
      roles,
      evidence: {
        evidenceVersionReference: opaque(evidence.evidenceVersionReference, "CARTERA010B_POLICY_EVIDENCE_REFERENCE_INVALID"),
        documentHash,
        sourceType: opaque(evidence.sourceType, "CARTERA010B_POLICY_EVIDENCE_SOURCE_INVALID", 120),
        observedAt: iso(evidence.observedAt, "CARTERA010B_POLICY_EVIDENCE_OBSERVED_AT_INVALID"),
        verificationState: oneOf(evidence.verificationState, ["UNVERIFIED", "REVIEWED", "CONFIRMED", "DISPUTED"], "CARTERA010B_POLICY_EVIDENCE_VERIFICATION_INVALID"),
        fieldClaims: stable(evidence.fieldClaims),
        provenance: stable(evidence.provenance),
      },
      lineage: {
        quoteReference: optionalOpaque(lineage.quoteReference, "CARTERA010B_POLICY_QUOTE_LINEAGE_INVALID"),
        applicationReference: optionalOpaque(lineage.applicationReference, "CARTERA010B_POLICY_APPLICATION_LINEAGE_INVALID"),
        previousPolicyVersionReference: optionalOpaque(lineage.previousPolicyVersionReference, "CARTERA010B_POLICY_PREVIOUS_VERSION_INVALID"),
      },
    };
    return freeze({ ...command, commandDigest: stableDigest(command) });
  }

  return freeze({
    CONTRACT_VERSION,
    PERSON_STATES,
    ACCOUNT_TYPES,
    POLICY_STATUSES,
    POLICY_ROLE_TYPES: ROLE_TYPES,
    CONFIRMATION_STATES,
    PRIVACY_CLASSES: PRIVACY,
    VISIBILITY_SCOPES: VISIBILITY,
    COMPLETENESS_STATES: COMPLETENESS,
    FRESHNESS_STATES: FRESHNESS,
    CONFLICT_STATES: CONFLICT,
    PAYMENT_FREQUENCIES: FREQUENCIES,
    Cartera010BContractError,
    stableStringify,
    stableDigest,
    validateCommercialPerson,
    validateCommercialAccount,
    validatePolicy,
    validatePolicyRole,
    buildIdentityResolutionCommand,
    buildConfirmedPolicyCommand,
  });
});
