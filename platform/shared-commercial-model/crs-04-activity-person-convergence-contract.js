"use strict";

(function crs04ActivityPersonConvergenceContractModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const ledgerContract = isCommonJs
    ? require("../event-evidence/activity-ledger-contract.js")
    : root?.ForgeActivityLedgerContractFES02A;
  const linkContract = isCommonJs
    ? require("./crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(ledgerContract, linkContract);
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeCrs04ActivityPersonConvergenceContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(
  ledgerContract,
  linkContract,
) {
  const CONTRACT_VERSION = "CRS-04-ACTIVITY-PERSON-001.1";
  const SCHEMA_VERSION = "forge.activity_person_convergence.v1";
  const CONTRACT_TYPE = "FORGE_ACTIVITY_PERSON_CONVERGENCE";
  const IDENTITY_STATES = Object.freeze(["LINKED", "UNRESOLVED"]);
  const LEDGER_STATES = Object.freeze([
    "LOCAL_APPENDED",
    "REMOTE_ACKNOWLEDGED",
    "REMOTE_IDEMPOTENT_REPLAY",
  ]);
  const TIMELINE_AUTHORITY = "FES_CANONICAL_ACTIVITY_TIMELINE";
  const LEDGER_AUTHORITY = "FES_ACTIVITY_EVENT_LEDGER";
  const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

  class Crs04ActivityPersonConvergenceError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs04ActivityPersonConvergenceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs04ActivityPersonConvergenceError(code, message, details);
  };
  const record = (value, code, label) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      fail(code, `${label} debe ser un objeto.`);
    }
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
    value === undefined || value === null || value === ""
      ? null
      : opaque(value, code, label, maximum);
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const stableValue = value => {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
    }
    return value;
  };
  const stableStringify = value => JSON.stringify(stableValue(value));
  function fnv1a32(text, seed) {
    let hash = seed >>> 0;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }
  const stableDigest = value => {
    const text = typeof value === "string" ? value : stableStringify(value);
    return [
      2166136261,
      2166136261 ^ 0x9e3779b9,
      2166136261 ^ 0x85ebca6b,
      2166136261 ^ 0xc2b2ae35,
    ].map(seed => fnv1a32(text, seed)).join("");
  };
  const oneOf = (value, allowed, code, label) => {
    const normalized = String(value || "").trim();
    if (!allowed.includes(normalized)) fail(code, `${label} no es válido.`, { allowed });
    return normalized;
  };

  function requireDependencies() {
    if (!ledgerContract?.assertLedgerRecord || !ledgerContract?.assertReceipt) {
      fail("CRS04_LEDGER_CONTRACT_REQUIRED", "El contrato FES 02 del ledger no está disponible.");
    }
    if (!linkContract?.assertDomainLinkEnvelope || !linkContract?.assertMissingDomainLink) {
      fail("CRS04_LINK_CONTRACT_REQUIRED", "El contrato CRS 02 no está disponible.");
    }
  }

  function recordSemantics(event) {
    if (event.subject.type === "APPOINTMENT") {
      return freeze({ recordType: "APPOINTMENT", recordReference: event.subject.id });
    }
    if (event.subject.type === "DUE_ACTION") {
      return freeze({ recordType: "DUE_ACTION", recordReference: event.subject.id });
    }
    return freeze({ recordType: "ACTIVITY_EVENT", recordReference: event.event_id });
  }

  function normalizeIdentity(value, event) {
    record(value, "CRS04_IDENTITY_REQUIRED", "La identidad convergida");
    exact(value, [
      "state",
      "personReference",
      "sourceIdentityLinkReference",
      "identityDecisionReference",
      "matchStatus",
      "reason",
      "sourceIdentityReference",
    ], "CRS04_IDENTITY_KEYS_INVALID", "La identidad convergida");

    const state = oneOf(value.state, IDENTITY_STATES, "CRS04_IDENTITY_STATE_INVALID", "El estado de identidad");
    const personReference = optionalOpaque(
      value.personReference,
      "CRS04_PERSON_REFERENCE_INVALID",
      "La referencia de persona",
    );
    const sourceIdentityLinkReference = optionalOpaque(
      value.sourceIdentityLinkReference,
      "CRS04_SOURCE_LINK_REFERENCE_INVALID",
      "La referencia del vínculo fuente",
    );
    const identityDecisionReference = optionalOpaque(
      value.identityDecisionReference,
      "CRS04_IDENTITY_DECISION_REFERENCE_INVALID",
      "La referencia de decisión",
    );
    const matchStatus = optionalOpaque(
      value.matchStatus,
      "CRS04_MATCH_STATUS_INVALID",
      "El estado del vínculo",
      120,
    );
    const reason = optionalOpaque(
      value.reason,
      "CRS04_IDENTITY_REASON_INVALID",
      "La razón de identidad",
      120,
    );
    const sourceIdentityReference = optionalOpaque(
      value.sourceIdentityReference,
      "CRS04_SOURCE_IDENTITY_REFERENCE_INVALID",
      "La identidad fuente",
    );

    if (event.subject.type === "PROSPECT" && sourceIdentityReference !== event.subject.id) {
      fail(
        "CRS04_PROSPECT_SOURCE_IDENTITY_MISMATCH",
        "La identidad fuente del evento Prospect no coincide con su sujeto.",
      );
    }
    if (state === "LINKED" &&
      (!personReference || !sourceIdentityLinkReference || !identityDecisionReference ||
        !sourceIdentityReference)) {
      fail(
        "CRS04_LINKED_IDENTITY_INCOMPLETE",
        "Una identidad vinculada requiere persona, identidad fuente, vínculo y decisión.",
      );
    }
    if (state === "UNRESOLVED" &&
      (personReference || sourceIdentityLinkReference || identityDecisionReference)) {
      fail(
        "CRS04_UNRESOLVED_IDENTITY_CANNOT_CARRY_LINK",
        "Una identidad no resuelta no puede transportar un vínculo parcial.",
      );
    }

    return freeze({
      state,
      personReference,
      sourceIdentityLinkReference,
      identityDecisionReference,
      matchStatus,
      reason: reason || (sourceIdentityReference ? "PERSON_UNRESOLVED" : "SOURCE_IDENTITY_UNAVAILABLE"),
      sourceIdentityReference,
    });
  }

  function normalizeDomainLink(value, identity, event) {
    const common = linkContract;
    const link = identity.state === "LINKED"
      ? common.assertDomainLinkEnvelope(value)
      : common.assertMissingDomainLink(value);
    const expected = recordSemantics(event);

    if (
      link.domain !== "ACTIVITY" ||
      link.recordType !== expected.recordType ||
      link.recordReference !== expected.recordReference ||
      link.authority !== LEDGER_AUTHORITY ||
      link.sourceEventReference !== event.event_id
    ) {
      fail(
        "CRS04_ACTIVITY_DOMAIN_LINK_MISMATCH",
        "El vínculo no corresponde al evento FES autoritativo.",
      );
    }
    if (identity.state === "LINKED" && link.personReference !== identity.personReference) {
      fail("CRS04_PERSON_LINK_MISMATCH", "La persona del vínculo no coincide con la identidad confirmada.");
    }
    if (identity.state === "UNRESOLVED" && link.contractType !== common.MISSING_LINK_TYPE) {
      fail("CRS04_MISSING_LINK_REQUIRED", "La identidad no resuelta requiere un missing-link explícito.");
    }
    if (identity.state === "UNRESOLVED" && link.correlationId) {
      fail(
        "CRS04_UNRESOLVED_COMMERCIAL_MOVEMENT_FORBIDDEN",
        "Un evento sin persona confirmada no puede pertenecer a un movimiento comercial.",
      );
    }
    if (link.correlationId && !/^movement:[a-f0-9]{32}$/.test(link.correlationId)) {
      fail(
        "CRS04_COMMERCIAL_MOVEMENT_CORRELATION_INVALID",
        "La correlación comercial debe derivarse explícitamente mediante CRS 02.",
      );
    }
    return link;
  }

  function normalizeReceipt(value, ledgerRecord) {
    if (value === undefined || value === null) return null;
    const receipt = ledgerContract.assertReceipt(value);
    if (receipt.tenant_id !== ledgerRecord.tenant_id || receipt.event_id !== ledgerRecord.event_id) {
      fail(
        "CRS04_RECEIPT_LEDGER_MISMATCH",
        "El recibo remoto no corresponde al registro del ledger.",
      );
    }
    return receipt;
  }

  function createActivityPersonConvergence(input = {}) {
    requireDependencies();
    record(input, "CRS04_CONVERGENCE_INPUT_REQUIRED", "La convergencia de Actividad");
    exact(input, [
      "ledgerRecord",
      "identity",
      "domainLink",
      "remoteReceipt",
      "timelineAuthority",
    ], "CRS04_CONVERGENCE_INPUT_KEYS_INVALID", "La convergencia de Actividad");

    const ledgerRecord = ledgerContract.assertLedgerRecord(input.ledgerRecord);
    const event = ledgerRecord.canonical_event;
    const identity = normalizeIdentity(input.identity, event);
    const domainLink = normalizeDomainLink(input.domainLink, identity, event);
    const remoteReceipt = normalizeReceipt(input.remoteReceipt, ledgerRecord);

    if (input.timelineAuthority !== TIMELINE_AUTHORITY) {
      fail(
        "CRS04_TIMELINE_AUTHORITY_INVALID",
        "La proyección temporal debe permanecer bajo FES_CANONICAL_ACTIVITY_TIMELINE.",
      );
    }

    const ledgerState = remoteReceipt
      ? remoteReceipt.status === "IDEMPOTENT_REPLAY"
        ? "REMOTE_IDEMPOTENT_REPLAY"
        : "REMOTE_ACKNOWLEDGED"
      : "LOCAL_APPENDED";

    const sourceCorrelationId = optionalOpaque(
      event.correlation_id,
      "CRS04_SOURCE_CORRELATION_INVALID",
      "La correlación fuente",
    );
    const commercialMovementCorrelationId = optionalOpaque(
      domainLink.correlationId,
      "CRS04_COMMERCIAL_CORRELATION_INVALID",
      "La correlación comercial",
    );

    const base = {
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      ledgerAuthority: LEDGER_AUTHORITY,
      timelineAuthority: TIMELINE_AUTHORITY,
      ledgerState: oneOf(
        ledgerState,
        LEDGER_STATES,
        "CRS04_LEDGER_STATE_INVALID",
        "El estado del ledger",
      ),
      ledgerRecord,
      identity,
      domainLink,
      remoteReceipt,
      sourceCorrelation: freeze({
        eventCorrelationId: sourceCorrelationId,
        commercialMovementCorrelationId,
        legacyCorrelationReinterpretedAsCommercialMovement: false,
      }),
      correctionLineage: freeze({
        eventCorrectionOf: event.correction_of || null,
        domainLinkCorrectionOf: domainLink.correctionOf || null,
        appendOnly: true,
      }),
      automaticIdentityResolution: false,
      automaticTimelineMutation: false,
      automaticTaskCreation: false,
      automaticContact: false,
      automaticCalendarMutation: false,
      automaticMessageSend: false,
    };

    return freeze({ ...base, convergenceDigest: stableDigest(base) });
  }

  function assertActivityPersonConvergence(value) {
    record(value, "CRS04_CONVERGENCE_OBJECT_REQUIRED", "La convergencia persistida");
    exact(value, [
      "contractType",
      "contractVersion",
      "schemaVersion",
      "ledgerAuthority",
      "timelineAuthority",
      "ledgerState",
      "ledgerRecord",
      "identity",
      "domainLink",
      "remoteReceipt",
      "sourceCorrelation",
      "correctionLineage",
      "automaticIdentityResolution",
      "automaticTimelineMutation",
      "automaticTaskCreation",
      "automaticContact",
      "automaticCalendarMutation",
      "automaticMessageSend",
      "convergenceDigest",
    ], "CRS04_CONVERGENCE_OBJECT_KEYS_INVALID", "La convergencia persistida");

    const normalized = createActivityPersonConvergence({
      ledgerRecord: value.ledgerRecord,
      identity: value.identity,
      domainLink: value.domainLink,
      remoteReceipt: value.remoteReceipt,
      timelineAuthority: value.timelineAuthority,
    });

    if (
      value.contractType !== CONTRACT_TYPE ||
      value.contractVersion !== CONTRACT_VERSION ||
      value.schemaVersion !== SCHEMA_VERSION ||
      value.ledgerAuthority !== LEDGER_AUTHORITY ||
      value.ledgerState !== normalized.ledgerState ||
      value.convergenceDigest !== normalized.convergenceDigest
    ) {
      fail(
        "CRS04_CONVERGENCE_DIGEST_OR_VERSION_MISMATCH",
        "La convergencia no coincide con el contrato.",
      );
    }
    if (
      value.automaticIdentityResolution !== false ||
      value.automaticTimelineMutation !== false ||
      value.automaticTaskCreation !== false ||
      value.automaticContact !== false ||
      value.automaticCalendarMutation !== false ||
      value.automaticMessageSend !== false
    ) {
      fail("CRS04_AUTOMATIC_ACTION_FORBIDDEN", "La convergencia no autoriza acciones automáticas.");
    }
    if (stableStringify(value.sourceCorrelation) !== stableStringify(normalized.sourceCorrelation) ||
      stableStringify(value.correctionLineage) !== stableStringify(normalized.correctionLineage)) {
      fail("CRS04_DERIVED_LINEAGE_MISMATCH", "La correlación o corrección derivada no coincide.");
    }

    return normalized;
  }

  return freeze({
    CONTRACT_VERSION,
    SCHEMA_VERSION,
    CONTRACT_TYPE,
    IDENTITY_STATES,
    LEDGER_STATES,
    TIMELINE_AUTHORITY,
    LEDGER_AUTHORITY,
    Crs04ActivityPersonConvergenceError,
    recordSemantics,
    createActivityPersonConvergence,
    assertActivityPersonConvergence,
    stableDigest,
  });
});
