"use strict";

(function crs03PipelinePersonConvergenceServiceModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const productiveProspectModule = isCommonJs
    ? require("./productive-prospect-service.js")
    : root?.ForgeProductiveProspectService067G17B;
  const convergenceContract = isCommonJs
    ? require("../../platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js")
    : root?.ForgeCrs03PipelinePersonConvergenceContract;
  const domainLinkAdapters = isCommonJs
    ? require("../../platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js")
    : root?.ForgeCrs02AuthoritativeDomainLinkAdapters;
  const domainLinkContract = isCommonJs
    ? require("../../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(
    productiveProspectModule,
    convergenceContract,
    domainLinkAdapters,
    domainLinkContract,
  );
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeCrs03PipelinePersonConvergenceService = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(
  productiveProspectModule,
  convergenceContract,
  domainLinkAdapters,
  domainLinkContract,
) {
  const SERVICE_VERSION = "CRS-03-PIPELINE-PERSON-SERVICE-001.1";
  const ACTIVE_PERSON_STATES = new Set(["CONFIRMED"]);

  class Crs03PipelinePersonConvergenceServiceError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs03PipelinePersonConvergenceServiceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs03PipelinePersonConvergenceServiceError(code, message, details);
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const optionalReference = value => {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || null;
  };
  const iso = value => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return null;
    return new Date(value).toISOString();
  };
  const valueOf = (row, camel, snake) => row?.[camel] ?? row?.[snake] ?? null;

  function requireDependencies() {
    if (!productiveProspectModule?.create) {
      fail("CRS03_PRODUCTIVE_PROSPECT_SERVICE_REQUIRED", "El servicio productivo de Prospect no está disponible.");
    }
    if (!convergenceContract?.createPipelinePersonConvergence) {
      fail("CRS03_CONVERGENCE_CONTRACT_REQUIRED", "El contrato de convergencia no está disponible.");
    }
    if (!domainLinkAdapters?.fromAuthoritativeReceipt) {
      fail("CRS03_DOMAIN_LINK_ADAPTER_REQUIRED", "El adaptador CRS 02 no está disponible.");
    }
    if (!domainLinkContract?.deriveCorrelationId) {
      fail("CRS03_DOMAIN_LINK_CONTRACT_REQUIRED", "El contrato CRS 02 no está disponible.");
    }
  }

  async function authenticatedUser(client) {
    if (!client?.auth?.getUser || !client?.from) {
      fail("CRS03_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) {
      fail("CRS03_AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
    }
    return data.user;
  }

  function queryError(error, fallback = "CRS03_PIPELINE_CONVERGENCE_READ_FAILED") {
    if (!error) return;
    fail(
      error.code || fallback,
      "No pudimos leer la convergencia de persona para Pipeline.",
      { sourceMessage: error.message || null },
    );
  }

  function normalizeProspect(prospect, advisorReference) {
    const prospectReference = optionalReference(valueOf(prospect, "id", "id"));
    if (!prospectReference) fail("CRS03_PROSPECT_REFERENCE_REQUIRED", "Prospect requiere una referencia.");
    const createdAt = iso(valueOf(prospect, "createdAt", "created_at")) ||
      iso(valueOf(prospect, "updatedAt", "updated_at")) ||
      new Date(0).toISOString();
    const updatedAt = iso(valueOf(prospect, "updatedAt", "updated_at")) || createdAt;
    return freeze({
      prospectReference,
      advisorReference,
      displayName: String(valueOf(prospect, "fullName", "full_name") || "").trim(),
      stage: String(valueOf(prospect, "status", "status") || "referred_new").trim(),
      source: String(valueOf(prospect, "source", "source") || "").trim(),
      createdAt,
      updatedAt,
      archived: Boolean(valueOf(prospect, "archivedAt", "archived_at")),
      version: Number(valueOf(prospect, "version", "version") || 1),
    });
  }

  async function loadActiveIdentityLink(client, prospectReference) {
    const { data, error } = await client
      .from("commercial_source_identity_links")
      .select(
        "id,link_reference,person_id,source_domain,source_identity_type,source_record_reference,match_status,decision_id,effective_from,effective_to,created_at,correction_of",
      )
      .eq("source_identity_type", "PROSPECT")
      .eq("source_record_reference", prospectReference)
      .is("effective_to", null)
      .order("effective_from", { ascending: false })
      .limit(2);
    queryError(error);
    const rows = Array.isArray(data) ? data : [];
    if (rows.length > 1) {
      fail("CRS03_MULTIPLE_ACTIVE_IDENTITY_LINKS", "Prospect tiene más de un vínculo de identidad activo.", {
        prospectReference,
        linkReferences: rows.map(row => row.link_reference || row.id),
      });
    }
    return rows[0] || null;
  }

  async function loadPerson(client, personId) {
    const { data, error } = await client
      .from("commercial_people")
      .select("id,advisor_id,person_reference,display_name,lifecycle_state,privacy_classification,archived_at")
      .eq("id", personId)
      .is("archived_at", null)
      .single();
    queryError(error, "CRS03_COMMERCIAL_PERSON_READ_FAILED");
    if (!data?.person_reference || !ACTIVE_PERSON_STATES.has(data.lifecycle_state)) {
      fail("CRS03_COMMERCIAL_PERSON_NOT_ACTIVE", "El vínculo apunta a una persona no disponible.");
    }
    return data;
  }

  async function loadDecision(client, decisionId) {
    const { data, error } = await client
      .from("identity_resolution_decisions")
      .select("id,decision_reference,outcome,resolved_person_id,source_record_reference")
      .eq("id", decisionId)
      .single();
    queryError(error, "CRS03_IDENTITY_DECISION_READ_FAILED");
    if (!data?.decision_reference) {
      fail("CRS03_IDENTITY_DECISION_NOT_FOUND", "No encontramos la decisión de identidad del vínculo.");
    }
    return data;
  }

  function pipelineReceipt(prospect) {
    const sourceEventReference = `pipeline-prospect:${prospect.prospectReference}:v${prospect.version}`;
    return freeze({
      authoritative: true,
      domain: "PIPELINE",
      recordType: "PROSPECT",
      recordReference: prospect.prospectReference,
      authority: "PIPELINE_PROSPECT_AUTHORITY",
      sourceEventReference,
      effectiveAt: prospect.createdAt,
      recordedAt: prospect.updatedAt,
      privacyClassification: "PRIVATE",
      idempotencyKey: `crs03-prospect:${prospect.prospectReference}:v${prospect.version}`,
    });
  }

  function stageReceipt(prospect) {
    const sourceEventReference =
      `pipeline-stage:${prospect.prospectReference}:${prospect.stage}:v${prospect.version}`;
    return freeze({
      authoritative: true,
      domain: "PIPELINE",
      recordType: "PIPELINE_EVENT",
      recordReference: sourceEventReference,
      authority: "PIPELINE_STAGE_EVENT_AUTHORITY",
      sourceEventReference,
      effectiveAt: prospect.updatedAt,
      recordedAt: prospect.updatedAt,
      privacyClassification: "PRIVATE",
      idempotencyKey: `crs03-stage:${prospect.prospectReference}:${prospect.stage}:v${prospect.version}`,
    });
  }

  async function convergeProspect(client, user, prospectInput, options = {}) {
    const prospect = normalizeProspect(prospectInput, user.id);
    const activeLink = await loadActiveIdentityLink(client, prospect.prospectReference);
    let person = null;
    let decision = null;

    if (activeLink) {
      [person, decision] = await Promise.all([
        loadPerson(client, activeLink.person_id),
        loadDecision(client, activeLink.decision_id),
      ]);
      if (person.advisor_id !== user.id) {
        fail("CRS03_PERSON_OWNER_MISMATCH", "La persona no pertenece al asesor autenticado.");
      }
      if (decision.resolved_person_id !== activeLink.person_id ||
        decision.source_record_reference !== prospect.prospectReference) {
        fail("CRS03_IDENTITY_LINEAGE_MISMATCH", "El vínculo de identidad no coincide con su decisión.");
      }
    }

    const domainLink = domainLinkAdapters.fromAuthoritativeReceipt(
      pipelineReceipt(prospect),
      {
        advisorReference: user.id,
        personReference: person?.person_reference || null,
        relationshipReference: null,
        correlationId: optionalReference(options.correlationId),
        sourceIdentityReference: prospect.prospectReference,
        privacyClassification: person?.privacy_classification || "PRIVATE",
        correctionOf: optionalReference(options.correctionOf),
        sourceEventReference: null,
      },
    );

    return convergenceContract.createPipelinePersonConvergence({
      prospect,
      identity: activeLink
        ? {
            state: "LINKED",
            personReference: person.person_reference,
            sourceIdentityLinkReference: activeLink.link_reference,
            identityDecisionReference: decision.decision_reference,
            matchStatus: activeLink.match_status,
            reason: null,
          }
        : {
            state: "UNRESOLVED",
            personReference: null,
            sourceIdentityLinkReference: null,
            identityDecisionReference: null,
            matchStatus: null,
            reason: "PERSON_UNRESOLVED",
          },
      domainLink,
      opportunityAuthorityState: "NOT_PRODUCTIVE",
      stageAuthority: "PIPELINE_STAGE_RPC",
      externalMilestones: {
        applicationSigned: "PROJECTED_ONLY",
        policyIssued: "PROJECTED_ONLY",
      },
    });
  }

  function create(client, { defaultCountry = "MX", prospectService = null } = {}) {
    requireDependencies();
    const productive = prospectService || productiveProspectModule.create(client, { defaultCountry });

    async function getConvergedProspect(prospectReference, options = {}) {
      const user = await authenticatedUser(client);
      const prospect = await productive.getProspect(prospectReference);
      return convergeProspect(client, user, prospect, options);
    }

    async function listConvergedProspects(options = {}) {
      const user = await authenticatedUser(client);
      const prospects = await productive.listProspects();
      const correlationByProspect = options.correlationByProspect || {};
      return Promise.all(prospects.map(prospect =>
        convergeProspect(client, user, prospect, {
          correlationId: correlationByProspect[prospect.id] || correlationByProspect[prospect.prospectReference] || null,
        })
      ));
    }

    async function createConvergedProspect(input) {
      const user = await authenticatedUser(client);
      const prospect = await productive.createProspect(input);
      const snapshot = await convergeProspect(client, user, prospect);
      if (snapshot.identity.state !== "UNRESOLVED") {
        fail("CRS03_NEW_PROSPECT_AUTOMATIC_LINK_FORBIDDEN", "Un Prospect nuevo no puede vincularse automáticamente.");
      }
      return snapshot;
    }

    async function updateConvergedProspect(prospectReference, changes, options = {}) {
      const user = await authenticatedUser(client);
      const prospect = await productive.updateProspect(prospectReference, changes);
      return convergeProspect(client, user, prospect, options);
    }

    async function archiveConvergedProspect(prospectReference, reason) {
      const user = await authenticatedUser(client);
      const prospect = await productive.archiveProspect(prospectReference, reason);
      return convergeProspect(client, user, prospect);
    }

    async function createCommercialMovementView(prospectReference, movementReference) {
      const user = await authenticatedUser(client);
      const prospect = await productive.getProspect(prospectReference);
      const baseSnapshot = await convergeProspect(client, user, prospect);
      if (baseSnapshot.identity.state !== "LINKED") {
        fail("CRS03_MOVEMENT_REQUIRES_CONFIRMED_PERSON", "Un movimiento comercial requiere persona confirmada.");
      }
      const correlationId = domainLinkContract.deriveCorrelationId({
        personReference: baseSnapshot.identity.personReference,
        movementReference,
      });
      return convergeProspect(client, user, prospect, { correlationId });
    }

    async function createConfirmedStageProjection(confirmedProspect, convergenceSnapshot) {
      const user = await authenticatedUser(client);
      const snapshot = convergenceContract.assertPipelinePersonConvergence(convergenceSnapshot);
      const prospect = normalizeProspect(confirmedProspect, user.id);
      if (snapshot.prospect.prospectReference !== prospect.prospectReference) {
        fail("CRS03_STAGE_PROSPECT_MISMATCH", "El recibo de stage no corresponde al Prospect convergido.");
      }
      if (snapshot.prospect.advisorReference !== user.id) {
        fail("CRS03_STAGE_ADVISOR_MISMATCH", "El recibo de stage no pertenece al asesor autenticado.");
      }
      return domainLinkAdapters.fromAuthoritativeReceipt(stageReceipt(prospect), {
        advisorReference: user.id,
        personReference: snapshot.identity.personReference,
        relationshipReference: snapshot.domainLink.relationshipReference || null,
        correlationId: snapshot.domainLink.correlationId || null,
        sourceIdentityReference: prospect.prospectReference,
        privacyClassification: snapshot.domainLink.privacyClassification || "PRIVATE",
        correctionOf: null,
        sourceEventReference: null,
      });
    }

    return freeze({
      getConvergedProspect,
      listConvergedProspects,
      createConvergedProspect,
      updateConvergedProspect,
      archiveConvergedProspect,
      createCommercialMovementView,
      createConfirmedStageProjection,
      diagnostics: () => freeze({
        serviceVersion: SERVICE_VERSION,
        personAuthority: "CARTERA_010B_COMMERCIAL_PERSON",
        sourceIdentityLinkAuthority: "CARTERA_010B_SOURCE_IDENTITY_LINKS",
        prospectAuthority: "PIPELINE_PROSPECT_AUTHORITY",
        stageAuthority: "PIPELINE_STAGE_RPC",
        opportunityAuthority: "NOT_PRODUCTIVE",
        automaticIdentityResolution: false,
        automaticOpportunityCreation: false,
        automaticStageAdvance: false,
        identityMutation: false,
        domainLinkPersistence: false,
      }),
    });
  }

  return freeze({
    SERVICE_VERSION,
    Crs03PipelinePersonConvergenceServiceError,
    create,
    _private: freeze({
      normalizeProspect,
      pipelineReceipt,
      stageReceipt,
      convergeProspect,
      loadActiveIdentityLink,
      loadPerson,
      loadDecision,
    }),
  });
});
