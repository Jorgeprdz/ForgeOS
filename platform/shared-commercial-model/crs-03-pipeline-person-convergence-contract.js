"use strict";

(function crs03PipelinePersonConvergenceContractModule(root, factory) {
  const linkContract = typeof module !== "undefined" && module.exports
    ? require("./crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(linkContract);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeCrs03PipelinePersonConvergenceContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(linkContract) {
  const CONTRACT_VERSION = "CRS-03-PIPELINE-PERSON-001.1";
  const SCHEMA_VERSION = "forge.pipeline_person_convergence.v1";
  const CONTRACT_TYPE = "FORGE_PIPELINE_PERSON_CONVERGENCE";
  const IDENTITY_STATES = Object.freeze(["LINKED", "UNRESOLVED"]);
  const OPPORTUNITY_AUTHORITY_STATES = Object.freeze([
    "NOT_PRODUCTIVE",
    "AUTHORITATIVE_RECEIPT_REQUIRED",
  ]);
  const STAGES = Object.freeze([
    "referred_new",
    "contacted",
    "appointment_scheduled",
    "proposal",
    "decision",
    "client",
  ]);
  const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

  class Crs03PipelinePersonConvergenceError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs03PipelinePersonConvergenceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs03PipelinePersonConvergenceError(code, message, details);
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
  const iso = (value, code, label) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      fail(code, `${label} no es una fecha ISO válida.`);
    }
    return new Date(value).toISOString();
  };
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

  function requireLinkContract() {
    if (!linkContract?.assertDomainLinkEnvelope || !linkContract?.assertMissingDomainLink) {
      fail("CRS03_LINK_CONTRACT_REQUIRED", "El contrato CRS 02 no está disponible.");
    }
    return linkContract;
  }

  function normalizeProspect(value) {
    record(value, "CRS03_PROSPECT_REQUIRED", "El Prospect autoritativo");
    exact(value, [
      "prospectReference",
      "advisorReference",
      "displayName",
      "stage",
      "source",
      "createdAt",
      "updatedAt",
      "archived",
      "version",
    ], "CRS03_PROSPECT_KEYS_INVALID", "El Prospect autoritativo");
    const stage = oneOf(value.stage, STAGES, "CRS03_PIPELINE_STAGE_INVALID", "El stage");
    const createdAt = iso(value.createdAt, "CRS03_PROSPECT_CREATED_AT_INVALID", "La creación de Prospect");
    const updatedAt = iso(value.updatedAt || value.createdAt, "CRS03_PROSPECT_UPDATED_AT_INVALID", "La actualización de Prospect");
    if (Date.parse(updatedAt) < Date.parse(createdAt)) {
      fail("CRS03_PROSPECT_TIME_ORDER_INVALID", "La actualización de Prospect no puede preceder su creación.");
    }
    return freeze({
      prospectReference: opaque(value.prospectReference, "CRS03_PROSPECT_REFERENCE_INVALID", "La referencia de Prospect"),
      advisorReference: opaque(value.advisorReference, "CRS03_ADVISOR_REFERENCE_INVALID", "La referencia del asesor"),
      displayName: String(value.displayName || "").trim().slice(0, 240),
      stage,
      source: String(value.source || "").trim().slice(0, 120),
      createdAt,
      updatedAt,
      archived: value.archived === true,
      version: Number.isInteger(value.version) && value.version >= 1 ? value.version : 1,
    });
  }

  function normalizeIdentity(value, prospect) {
    record(value, "CRS03_IDENTITY_REQUIRED", "La identidad convergida");
    exact(value, [
      "state",
      "personReference",
      "sourceIdentityLinkReference",
      "identityDecisionReference",
      "matchStatus",
      "reason",
      "sourceIdentityReference",
    ], "CRS03_IDENTITY_KEYS_INVALID", "La identidad convergida");
    const state = oneOf(value.state, IDENTITY_STATES, "CRS03_IDENTITY_STATE_INVALID", "El estado de identidad");
    const personReference = optionalOpaque(value.personReference, "CRS03_PERSON_REFERENCE_INVALID", "La referencia de persona");
    const sourceIdentityLinkReference = optionalOpaque(
      value.sourceIdentityLinkReference,
      "CRS03_SOURCE_LINK_REFERENCE_INVALID",
      "La referencia del vínculo fuente",
    );
    const identityDecisionReference = optionalOpaque(
      value.identityDecisionReference,
      "CRS03_IDENTITY_DECISION_REFERENCE_INVALID",
      "La referencia de decisión",
    );
    const matchStatus = optionalOpaque(value.matchStatus, "CRS03_MATCH_STATUS_INVALID", "El estado de vínculo", 120);
    const reason = optionalOpaque(value.reason, "CRS03_IDENTITY_REASON_INVALID", "La razón de identidad", 120);
    const sourceIdentityReference = optionalOpaque(
      value.sourceIdentityReference,
      "CRS03_SOURCE_IDENTITY_REFERENCE_INVALID",
      "La identidad fuente",
    ) || prospect.prospectReference;
    if (sourceIdentityReference !== prospect.prospectReference) {
      fail("CRS03_SOURCE_IDENTITY_MISMATCH", "La identidad fuente no coincide con Prospect.");
    }
    if (state === "LINKED" && (!personReference || !sourceIdentityLinkReference || !identityDecisionReference)) {
      fail("CRS03_LINKED_IDENTITY_INCOMPLETE", "Una identidad vinculada requiere persona, vínculo y decisión.");
    }
    if (state === "UNRESOLVED" && (personReference || sourceIdentityLinkReference || identityDecisionReference)) {
      fail("CRS03_UNRESOLVED_IDENTITY_CANNOT_CARRY_LINK", "Una identidad no resuelta no puede transportar un vínculo parcial.");
    }
    return freeze({
      state,
      personReference,
      sourceIdentityLinkReference,
      identityDecisionReference,
      matchStatus,
      reason: reason || (state === "UNRESOLVED" ? "PERSON_UNRESOLVED" : null),
      sourceIdentityReference,
    });
  }

  function normalizeDomainLink(value, identity, prospect) {
    const common = requireLinkContract();
    const link = identity.state === "LINKED"
      ? common.assertDomainLinkEnvelope(value)
      : common.assertMissingDomainLink(value);
    if (link.domain !== "PIPELINE" || link.recordType !== "PROSPECT" ||
      link.recordReference !== prospect.prospectReference ||
      link.authority !== "PIPELINE_PROSPECT_AUTHORITY") {
      fail("CRS03_PIPELINE_DOMAIN_LINK_MISMATCH", "El vínculo no corresponde al Prospect autoritativo.");
    }
    if (identity.state === "LINKED" && link.personReference !== identity.personReference) {
      fail("CRS03_PERSON_LINK_MISMATCH", "La persona del vínculo no coincide con la identidad confirmada.");
    }
    if (identity.state === "UNRESOLVED" && link.contractType !== common.MISSING_LINK_TYPE) {
      fail("CRS03_MISSING_LINK_REQUIRED", "La identidad no resuelta requiere un missing-link explícito.");
    }
    return link;
  }

  function createPipelinePersonConvergence(input = {}) {
    record(input, "CRS03_CONVERGENCE_INPUT_REQUIRED", "La convergencia de Pipeline");
    exact(input, [
      "prospect",
      "identity",
      "domainLink",
      "opportunityAuthorityState",
      "stageAuthority",
      "externalMilestones",
    ], "CRS03_CONVERGENCE_INPUT_KEYS_INVALID", "La convergencia de Pipeline");
    const prospect = normalizeProspect(input.prospect);
    const identity = normalizeIdentity(input.identity, prospect);
    const domainLink = normalizeDomainLink(input.domainLink, identity, prospect);
    const opportunityAuthorityState = oneOf(
      input.opportunityAuthorityState || "NOT_PRODUCTIVE",
      OPPORTUNITY_AUTHORITY_STATES,
      "CRS03_OPPORTUNITY_AUTHORITY_STATE_INVALID",
      "El estado de Opportunity",
    );
    if (input.stageAuthority !== "PIPELINE_STAGE_RPC") {
      fail("CRS03_STAGE_AUTHORITY_INVALID", "Pipeline stage debe permanecer bajo PIPELINE_STAGE_RPC.");
    }
    record(input.externalMilestones, "CRS03_EXTERNAL_MILESTONES_REQUIRED", "Los hitos externos");
    exact(input.externalMilestones, ["applicationSigned", "policyIssued"], "CRS03_EXTERNAL_MILESTONE_KEYS_INVALID", "Los hitos externos");
    if (input.externalMilestones.applicationSigned !== "PROJECTED_ONLY" ||
      input.externalMilestones.policyIssued !== "PROJECTED_ONLY") {
      fail("CRS03_EXTERNAL_MILESTONE_AUTHORITY_VIOLATION", "Pipeline sólo puede proyectar hitos externos.");
    }
    const base = {
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      prospect,
      identity,
      domainLink,
      opportunityAuthorityState,
      stageAuthority: "PIPELINE_STAGE_RPC",
      externalMilestones: freeze({
        applicationSigned: "PROJECTED_ONLY",
        policyIssued: "PROJECTED_ONLY",
      }),
      automaticIdentityResolution: false,
      automaticOpportunityCreation: false,
      automaticStageAdvance: false,
    };
    return freeze({ ...base, convergenceDigest: stableDigest(base) });
  }

  function assertPipelinePersonConvergence(value) {
    record(value, "CRS03_CONVERGENCE_OBJECT_REQUIRED", "La convergencia persistida");
    const normalized = createPipelinePersonConvergence({
      prospect: value.prospect,
      identity: value.identity,
      domainLink: value.domainLink,
      opportunityAuthorityState: value.opportunityAuthorityState,
      stageAuthority: value.stageAuthority,
      externalMilestones: value.externalMilestones,
    });
    if (value.contractType !== CONTRACT_TYPE || value.contractVersion !== CONTRACT_VERSION ||
      value.schemaVersion !== SCHEMA_VERSION || value.convergenceDigest !== normalized.convergenceDigest) {
      fail("CRS03_CONVERGENCE_DIGEST_OR_VERSION_MISMATCH", "La convergencia no coincide con el contrato.");
    }
    if (value.automaticIdentityResolution !== false || value.automaticOpportunityCreation !== false ||
      value.automaticStageAdvance !== false) {
      fail("CRS03_AUTOMATIC_ACTION_FORBIDDEN", "La convergencia no autoriza acciones automáticas.");
    }
    return normalized;
  }

  return freeze({
    CONTRACT_VERSION,
    SCHEMA_VERSION,
    CONTRACT_TYPE,
    IDENTITY_STATES,
    OPPORTUNITY_AUTHORITY_STATES,
    STAGES,
    Crs03PipelinePersonConvergenceError,
    createPipelinePersonConvergence,
    assertPipelinePersonConvergence,
    stableDigest,
  });
});
