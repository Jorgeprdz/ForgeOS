"use strict";

(function crs04ActivityPersonConvergenceServiceModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const ledgerContract = isCommonJs
    ? require("./activity-ledger-contract.js")
    : root?.ForgeActivityLedgerContractFES02A;
  const convergenceContract = isCommonJs
    ? require("../shared-commercial-model/crs-04-activity-person-convergence-contract.js")
    : root?.ForgeCrs04ActivityPersonConvergenceContract;
  const domainLinkAdapters = isCommonJs
    ? require("../shared-commercial-model/crs-02-authoritative-domain-link-adapters.js")
    : root?.ForgeCrs02AuthoritativeDomainLinkAdapters;
  const domainLinkContract = isCommonJs
    ? require("../shared-commercial-model/crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(
    ledgerContract,
    convergenceContract,
    domainLinkAdapters,
    domainLinkContract,
  );
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeCrs04ActivityPersonConvergenceService = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(
  ledgerContract,
  convergenceContract,
  domainLinkAdapters,
  domainLinkContract,
) {
  const SERVICE_VERSION = "CRS-04-ACTIVITY-PERSON-SERVICE-001.1";
  const ACTIVE_PERSON_STATES = new Set(["CONFIRMED"]);

  class Crs04ActivityPersonConvergenceServiceError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs04ActivityPersonConvergenceServiceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs04ActivityPersonConvergenceServiceError(code, message, details);
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

  function requireDependencies() {
    if (!ledgerContract?.assertLedgerRecord || !ledgerContract?.assertReceipt) {
      fail("CRS04_LEDGER_CONTRACT_REQUIRED", "El contrato FES 02 del ledger no está disponible.");
    }
    if (!convergenceContract?.createActivityPersonConvergence) {
      fail("CRS04_CONVERGENCE_CONTRACT_REQUIRED", "El contrato CRS 04 no está disponible.");
    }
    if (!domainLinkAdapters?.fromCanonicalActivityEvent) {
      fail("CRS04_DOMAIN_LINK_ADAPTER_REQUIRED", "El adaptador CRS 02 para FES no está disponible.");
    }
    if (!domainLinkContract?.deriveCorrelationId) {
      fail("CRS04_DOMAIN_LINK_CONTRACT_REQUIRED", "El contrato CRS 02 no está disponible.");
    }
  }

  async function authenticatedUser(client) {
    if (!client?.auth?.getUser || !client?.from) {
      fail("CRS04_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) {
      fail("CRS04_AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
    }
    return data.user;
  }

  function queryError(error, fallback = "CRS04_ACTIVITY_CONVERGENCE_READ_FAILED") {
    if (!error) return;
    fail(
      error.code || fallback,
      "No pudimos leer la convergencia de persona para Actividad.",
      { sourceMessage: error.message || null },
    );
  }

  async function loadActiveIdentityLink(client, sourceIdentityReference) {
    const { data, error } = await client
      .from("commercial_source_identity_links")
      .select(
        "id,link_reference,person_id,source_domain,source_identity_type,source_record_reference,match_status,decision_id,effective_from,effective_to,created_at,correction_of",
      )
      .eq("source_identity_type", "PROSPECT")
      .eq("source_record_reference", sourceIdentityReference)
      .is("effective_to", null)
      .order("effective_from", { ascending: false })
      .limit(2);
    queryError(error);
    const rows = Array.isArray(data) ? data : [];
    if (rows.length > 1) {
      fail(
        "CRS04_MULTIPLE_ACTIVE_IDENTITY_LINKS",
        "La identidad fuente tiene más de un vínculo activo.",
        {
          sourceIdentityReference,
          linkReferences: rows.map(row => row.link_reference || row.id),
        },
      );
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
    queryError(error, "CRS04_COMMERCIAL_PERSON_READ_FAILED");
    if (!data?.person_reference || !ACTIVE_PERSON_STATES.has(data.lifecycle_state)) {
      fail("CRS04_COMMERCIAL_PERSON_NOT_ACTIVE", "El vínculo apunta a una persona no disponible.");
    }
    return data;
  }

  async function loadDecision(client, decisionId) {
    const { data, error } = await client
      .from("identity_resolution_decisions")
      .select("id,decision_reference,outcome,resolved_person_id,source_record_reference")
      .eq("id", decisionId)
      .single();
    queryError(error, "CRS04_IDENTITY_DECISION_READ_FAILED");
    if (!data?.decision_reference) {
      fail("CRS04_IDENTITY_DECISION_NOT_FOUND", "No encontramos la decisión de identidad del vínculo.");
    }
    return data;
  }

  function sourceIdentityFor(event, options = {}) {
    const explicit = optionalReference(options.sourceIdentityReference);
    if (event.subject.type === "PROSPECT") {
      if (explicit && explicit !== event.subject.id) {
        fail(
          "CRS04_EXPLICIT_SOURCE_IDENTITY_MISMATCH",
          "La identidad fuente explícita no coincide con el sujeto Prospect.",
        );
      }
      return event.subject.id;
    }
    return explicit;
  }

  async function convergeRecord(client, user, ledgerRecordInput, options = {}) {
    const ledgerRecord = ledgerContract.assertLedgerRecord(ledgerRecordInput);
    const event = ledgerRecord.canonical_event;
    if (event.tenant_id !== user.id || ledgerRecord.tenant_id !== user.id) {
      fail("CRS04_ACTIVITY_TENANT_MISMATCH", "El evento FES pertenece a otro asesor.");
    }

    const sourceIdentityReference = sourceIdentityFor(event, options);
    const activeLink = sourceIdentityReference
      ? await loadActiveIdentityLink(client, sourceIdentityReference)
      : null;
    let person = null;
    let decision = null;

    if (activeLink) {
      [person, decision] = await Promise.all([
        loadPerson(client, activeLink.person_id),
        loadDecision(client, activeLink.decision_id),
      ]);
      if (person.advisor_id !== user.id) {
        fail("CRS04_PERSON_OWNER_MISMATCH", "La persona no pertenece al asesor autenticado.");
      }
      if (
        decision.resolved_person_id !== activeLink.person_id ||
        decision.source_record_reference !== sourceIdentityReference
      ) {
        fail(
          "CRS04_IDENTITY_LINEAGE_MISMATCH",
          "El vínculo de identidad no coincide con su decisión.",
        );
      }
    }

    const commercialMovementCorrelationId = optionalReference(
      options.commercialMovementCorrelationId,
    );
    if (commercialMovementCorrelationId && !person) {
      fail(
        "CRS04_MOVEMENT_REQUIRES_CONFIRMED_PERSON",
        "Un movimiento comercial requiere persona confirmada.",
      );
    }

    const domainLink = domainLinkAdapters.fromCanonicalActivityEvent(event, {
      advisorReference: user.id,
      personReference: person?.person_reference || null,
      relationshipReference: null,
      correlationId: commercialMovementCorrelationId,
      sourceIdentityReference,
      privacyClassification: person?.privacy_classification || event.privacy_class,
      correctionOf: optionalReference(options.domainLinkCorrectionOf),
      sourceEventReference: null,
    });

    const remoteReceipt = options.remoteReceipt
      ? ledgerContract.assertReceipt(options.remoteReceipt)
      : null;

    return convergenceContract.createActivityPersonConvergence({
      ledgerRecord,
      identity: activeLink
        ? {
            state: "LINKED",
            personReference: person.person_reference,
            sourceIdentityLinkReference: activeLink.link_reference,
            identityDecisionReference: decision.decision_reference,
            matchStatus: activeLink.match_status,
            reason: null,
            sourceIdentityReference,
          }
        : {
            state: "UNRESOLVED",
            personReference: null,
            sourceIdentityLinkReference: null,
            identityDecisionReference: null,
            matchStatus: null,
            reason: sourceIdentityReference
              ? "PERSON_UNRESOLVED"
              : "SOURCE_IDENTITY_UNAVAILABLE",
            sourceIdentityReference,
          },
      domainLink,
      remoteReceipt,
      timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
    });
  }

  function create(client, { ledgerRuntime = null } = {}) {
    requireDependencies();

    async function convergeLedgerRecord(ledgerRecord, options = {}) {
      const user = await authenticatedUser(client);
      let remoteReceipt = options.remoteReceipt || null;
      if (!remoteReceipt && ledgerRuntime?.getReceipt) {
        const normalized = ledgerContract.assertLedgerRecord(ledgerRecord);
        remoteReceipt = await ledgerRuntime.getReceipt(normalized.event_id);
      }
      return convergeRecord(client, user, ledgerRecord, {
        ...options,
        remoteReceipt,
      });
    }

    async function getConvergedActivityEvent(eventReference, options = {}) {
      if (!ledgerRuntime?.listEntries) {
        fail("CRS04_LEDGER_RUNTIME_REQUIRED", "La lectura por referencia requiere el runtime FES 02.");
      }
      const entries = await ledgerRuntime.listEntries();
      const selected = entries.find(entry => entry.event_id === eventReference);
      if (!selected) {
        fail("CRS04_ACTIVITY_EVENT_NOT_FOUND", "No encontramos el evento FES solicitado.");
      }
      return convergeLedgerRecord(selected, options);
    }

    async function listConvergedActivityEvents(options = {}) {
      if (!ledgerRuntime?.listEntries) {
        fail("CRS04_LEDGER_RUNTIME_REQUIRED", "La lista convergida requiere el runtime FES 02.");
      }
      const entries = await ledgerRuntime.listEntries();
      const sourceIdentityByEvent = options.sourceIdentityByEvent || {};
      const commercialMovementByEvent = options.commercialMovementByEvent || {};
      return Promise.all(entries.map(entry =>
        convergeLedgerRecord(entry, {
          sourceIdentityReference: sourceIdentityByEvent[entry.event_id] || null,
          commercialMovementCorrelationId: commercialMovementByEvent[entry.event_id] || null,
        })
      ));
    }

    async function createCommercialMovementView(ledgerRecord, movementReference, options = {}) {
      const user = await authenticatedUser(client);
      const baseSnapshot = await convergeRecord(client, user, ledgerRecord, options);
      if (baseSnapshot.identity.state !== "LINKED") {
        fail(
          "CRS04_MOVEMENT_REQUIRES_CONFIRMED_PERSON",
          "Un movimiento comercial requiere persona confirmada.",
        );
      }
      const correlationId = domainLinkContract.deriveCorrelationId({
        personReference: baseSnapshot.identity.personReference,
        movementReference,
      });
      return convergeRecord(client, user, ledgerRecord, {
        ...options,
        commercialMovementCorrelationId: correlationId,
        remoteReceipt: options.remoteReceipt || baseSnapshot.remoteReceipt,
      });
    }

    async function convergeCorrection(correctionLedgerRecord, originalSnapshotInput, options = {}) {
      const user = await authenticatedUser(client);
      const originalSnapshot =
        convergenceContract.assertActivityPersonConvergence(originalSnapshotInput);
      const correction = ledgerContract.assertLedgerRecord(correctionLedgerRecord);
      if (correction.canonical_event.correction_of !== originalSnapshot.ledgerRecord.event_id) {
        fail(
          "CRS04_CORRECTION_LINEAGE_MISMATCH",
          "La corrección no apunta al evento original convergido.",
        );
      }
      return convergeRecord(client, user, correction, {
        ...options,
        sourceIdentityReference:
          options.sourceIdentityReference ||
          originalSnapshot.identity.sourceIdentityReference,
        commercialMovementCorrelationId:
          options.commercialMovementCorrelationId ||
          originalSnapshot.domainLink.correlationId,
        domainLinkCorrectionOf: originalSnapshot.domainLink.linkReference || null,
      });
    }

    return freeze({
      convergeLedgerRecord,
      getConvergedActivityEvent,
      listConvergedActivityEvents,
      createCommercialMovementView,
      convergeCorrection,
      diagnostics: () => freeze({
        serviceVersion: SERVICE_VERSION,
        eventAuthority: "FES01_CANONICAL_ACTIVITY_EVENT",
        ledgerAuthority: "FES_ACTIVITY_EVENT_LEDGER",
        timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
        personAuthority: "CARTERA_010B_COMMERCIAL_PERSON",
        sourceIdentityLinkAuthority: "CARTERA_010B_SOURCE_IDENTITY_LINKS",
        domainLinkContract: "CRS_02",
        legacyCorrelationReinterpretedAsCommercialMovement: false,
        ledgerMutation: false,
        identityMutation: false,
        timelineMutation: false,
        taskMutation: false,
        providerMutation: false,
        automaticBusinessAction: false,
      }),
    });
  }

  return freeze({
    SERVICE_VERSION,
    Crs04ActivityPersonConvergenceServiceError,
    create,
    _private: freeze({
      sourceIdentityFor,
      convergeRecord,
      loadActiveIdentityLink,
      loadPerson,
      loadDecision,
    }),
  });
});
