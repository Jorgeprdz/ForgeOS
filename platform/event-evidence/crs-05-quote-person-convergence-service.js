"use strict";

(function crs05QuotePersonConvergenceServiceModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const quoteContract = isCommonJs
    ? require("./quote-lifecycle-event-contract.js")
    : root?.ForgeQuoteLifecycleEventContractCartera001B;
  const convergenceContract = isCommonJs
    ? require("../shared-commercial-model/crs-05-quote-person-convergence-contract.js")
    : root?.ForgeCrs05QuotePersonConvergenceContract;
  const domainLinkAdapters = isCommonJs
    ? require("../shared-commercial-model/crs-02-authoritative-domain-link-adapters.js")
    : root?.ForgeCrs02AuthoritativeDomainLinkAdapters;
  const domainLinkContract = isCommonJs
    ? require("../shared-commercial-model/crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const api = factory(
    quoteContract,
    convergenceContract,
    domainLinkAdapters,
    domainLinkContract,
  );
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeCrs05QuotePersonConvergenceService = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(
  quoteContract,
  convergenceContract,
  domainLinkAdapters,
  domainLinkContract,
) {
  const SERVICE_VERSION = "CRS-05-QUOTE-PERSON-SERVICE-001.1";
  const ACTIVE_PERSON_STATES = new Set(["CONFIRMED"]);

  class Crs05QuotePersonConvergenceServiceError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs05QuotePersonConvergenceServiceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs05QuotePersonConvergenceServiceError(code, message, details);
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const valueOf = (row, camel, snake) => row?.[camel] ?? row?.[snake] ?? null;
  const optionalReference = value => {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || null;
  };
  const requiredReference = (value, code, label) => {
    const normalized = optionalReference(value);
    if (!normalized) fail(code, `${label} es obligatoria.`);
    return normalized;
  };
  const iso = value => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return null;
    return new Date(value).toISOString();
  };
  const array = value => Array.isArray(value) ? value : [];

  function requireDependencies() {
    if (!quoteContract?.assertQuoteLifecycleEvent) {
      fail("CRS05_QUOTE_CONTRACT_REQUIRED", "El contrato de ciclo de Quote no está disponible.");
    }
    if (!convergenceContract?.createQuotePersonConvergence) {
      fail("CRS05_CONVERGENCE_CONTRACT_REQUIRED", "El contrato CRS 05 no está disponible.");
    }
    if (!domainLinkAdapters?.fromAuthoritativeReceipt) {
      fail("CRS05_DOMAIN_LINK_ADAPTER_REQUIRED", "El adaptador CRS 02 no está disponible.");
    }
    if (!domainLinkContract?.deriveCorrelationId) {
      fail("CRS05_DOMAIN_LINK_CONTRACT_REQUIRED", "El contrato de movimiento CRS 02 no está disponible.");
    }
  }

  async function authenticatedUser(client) {
    if (!client?.auth?.getUser || !client?.from) {
      fail("CRS05_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) {
      fail("CRS05_AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
    }
    return data.user;
  }

  function queryError(error, fallback = "CRS05_QUOTE_CONVERGENCE_READ_FAILED") {
    if (!error) return;
    fail(error.code || fallback, "No pudimos leer la convergencia de Quote.", {
      sourceMessage: error.message || null,
    });
  }

  async function loadQuoteByReference(client, quoteReference) {
    const { data, error } = await client
      .from("quote_lifecycle_quotes")
      .select(
        "id,quote_reference,advisor_id,prospect_id,product_reference,current_version,lifecycle_state,created_at,updated_at",
      )
      .eq("quote_reference", quoteReference)
      .single();
    queryError(error, "CRS05_QUOTE_READ_FAILED");
    if (!data?.id) fail("CRS05_QUOTE_NOT_FOUND", "No encontramos la Quote durable.");
    return data;
  }

  async function loadCurrentVersion(client, quoteRow) {
    const { data, error } = await client
      .from("quote_lifecycle_versions")
      .select(
        "id,quote_id,advisor_id,quote_version_reference,version_number,snapshot_digest,source_record_reference,source_evidence_references,freshness_metadata,confirmation_state,created_at",
      )
      .eq("quote_id", quoteRow.id)
      .eq("version_number", Number(quoteRow.current_version))
      .single();
    queryError(error, "CRS05_QUOTE_VERSION_READ_FAILED");
    if (!data?.id) fail("CRS05_QUOTE_VERSION_NOT_FOUND", "No encontramos la versión actual de Quote.");
    return data;
  }

  async function loadLatestEvent(client, quoteRow) {
    const { data, error } = await client
      .from("quote_lifecycle_events")
      .select(
        "event_id,advisor_id,quote_id,quote_version_id,prospect_id,event_type,lifecycle_state,previous_lifecycle_state,occurred_at,recorded_at,source_record_reference,idempotency_key,payload,evidence_references,freshness_metadata,snapshot_digest,confirmation_state,correction_of,event_digest",
      )
      .eq("quote_id", quoteRow.id)
      .order("occurred_at", { ascending: false })
      .order("recorded_at", { ascending: false })
      .limit(1);
    queryError(error, "CRS05_QUOTE_EVENT_READ_FAILED");
    const row = array(data)[0] || null;
    if (!row?.event_id) fail("CRS05_QUOTE_EVENT_NOT_FOUND", "Quote no tiene un evento de ciclo durable.");
    return row;
  }

  async function loadActiveIdentityLink(client, prospectReference) {
    const { data, error } = await client
      .from("commercial_source_identity_links")
      .select(
        "id,link_reference,person_id,source_identity_type,source_record_reference,match_status,decision_id,effective_from,effective_to",
      )
      .eq("source_identity_type", "PROSPECT")
      .eq("source_record_reference", prospectReference)
      .is("effective_to", null)
      .order("effective_from", { ascending: false })
      .limit(2);
    queryError(error, "CRS05_IDENTITY_LINK_READ_FAILED");
    const rows = array(data);
    if (rows.length > 1) {
      fail("CRS05_MULTIPLE_ACTIVE_IDENTITY_LINKS", "Prospect tiene más de un vínculo de identidad activo.", {
        prospectReference,
        linkReferences: rows.map(row => row.link_reference || row.id),
      });
    }
    return rows[0] || null;
  }

  async function loadPerson(client, personId) {
    const { data, error } = await client
      .from("commercial_people")
      .select("id,advisor_id,person_reference,lifecycle_state,privacy_classification,archived_at")
      .eq("id", personId)
      .is("archived_at", null)
      .single();
    queryError(error, "CRS05_COMMERCIAL_PERSON_READ_FAILED");
    if (!data?.person_reference || !ACTIVE_PERSON_STATES.has(data.lifecycle_state)) {
      fail("CRS05_COMMERCIAL_PERSON_NOT_ACTIVE", "El vínculo apunta a una persona no disponible.");
    }
    return data;
  }

  async function loadDecision(client, decisionId) {
    const { data, error } = await client
      .from("identity_resolution_decisions")
      .select("id,decision_reference,outcome,resolved_person_id,source_record_reference")
      .eq("id", decisionId)
      .single();
    queryError(error, "CRS05_IDENTITY_DECISION_READ_FAILED");
    if (!data?.decision_reference) {
      fail("CRS05_IDENTITY_DECISION_NOT_FOUND", "No encontramos la decisión de identidad.");
    }
    return data;
  }

  function normalizeQuoteRow(quoteRow) {
    return freeze({
      quoteReference: requiredReference(quoteRow.quote_reference, "CRS05_QUOTE_REFERENCE_REQUIRED", "Quote"),
      advisorReference: requiredReference(quoteRow.advisor_id, "CRS05_ADVISOR_REFERENCE_REQUIRED", "El asesor"),
      prospectReference: requiredReference(quoteRow.prospect_id, "CRS05_PROSPECT_REFERENCE_REQUIRED", "Prospect"),
      productReference: requiredReference(quoteRow.product_reference, "CRS05_PRODUCT_REFERENCE_REQUIRED", "El producto"),
      lifecycleState: requiredReference(quoteRow.lifecycle_state, "CRS05_LIFECYCLE_STATE_REQUIRED", "El estado"),
      currentVersionNumber: Number(quoteRow.current_version),
      createdAt: iso(quoteRow.created_at) || new Date(0).toISOString(),
      updatedAt: iso(quoteRow.updated_at) || iso(quoteRow.created_at) || new Date(0).toISOString(),
      persistenceReceiptReference: `quote-persist:${quoteRow.id}`,
    });
  }

  function normalizeVersionRow(versionRow, options = {}) {
    const freshness = valueOf(versionRow, "freshnessMetadata", "freshness_metadata") || {};
    return freeze({
      quoteVersionReference: requiredReference(
        versionRow.quote_version_reference,
        "CRS05_QUOTE_VERSION_REFERENCE_REQUIRED",
        "Quote Version",
      ),
      versionNumber: Number(versionRow.version_number),
      snapshotDigest: requiredReference(versionRow.snapshot_digest, "CRS05_SNAPSHOT_DIGEST_REQUIRED", "El digest"),
      sourceRecordReference: requiredReference(
        versionRow.source_record_reference,
        "CRS05_SOURCE_RECORD_REFERENCE_REQUIRED",
        "El registro fuente",
      ),
      sourceEvidenceReferences: array(versionRow.source_evidence_references),
      freshnessStatus: requiredReference(freshness.status, "CRS05_FRESHNESS_STATUS_REQUIRED", "La frescura"),
      confirmationState: requiredReference(
        versionRow.confirmation_state,
        "CRS05_VERSION_CONFIRMATION_REQUIRED",
        "La confirmación",
      ),
      createdAt: iso(versionRow.created_at) || new Date(0).toISOString(),
      printableArtifactReference: optionalReference(options.printableArtifactReference),
      calculationAuthorityReference: optionalReference(options.calculationAuthorityReference),
    });
  }

  function payloadValue(payload, camel, snake) {
    return payload?.[camel] ?? payload?.[snake] ?? null;
  }

  function normalizeLifecycleRow(eventRow, quote, version) {
    const payload = eventRow.payload || {};
    const eventType = requiredReference(eventRow.event_type, "CRS05_EVENT_TYPE_REQUIRED", "El evento");
    const applicationReference = payloadValue(payload, "applicationReference", "application_reference");
    return freeze({
      eventReference: requiredReference(eventRow.event_id, "CRS05_EVENT_REFERENCE_REQUIRED", "El evento"),
      eventType,
      lifecycleState: requiredReference(eventRow.lifecycle_state, "CRS05_EVENT_STATE_REQUIRED", "El estado del evento"),
      previousLifecycleState: optionalReference(eventRow.previous_lifecycle_state),
      quoteReference: quote.quoteReference,
      quoteVersionReference: version.quoteVersionReference,
      prospectReference: quote.prospectReference,
      productReference: quote.productReference,
      occurredAt: iso(eventRow.occurred_at) || quote.updatedAt,
      recordedAt: iso(eventRow.recorded_at) || iso(eventRow.occurred_at) || quote.updatedAt,
      correctionOf: optionalReference(eventRow.correction_of),
      applicationReference: optionalReference(applicationReference),
      evidenceReferences: array(eventRow.evidence_references),
    });
  }

  function quoteReceipt(quote, lifecycle) {
    return freeze({
      authoritative: true,
      domain: "QUOTE",
      recordType: "QUOTE",
      recordReference: quote.quoteReference,
      authority: "QUOTE_PERSISTENCE_AUTHORITY",
      sourceEventReference: lifecycle.eventReference,
      effectiveAt: lifecycle.occurredAt,
      recordedAt: lifecycle.recordedAt,
      privacyClassification: "PRIVATE",
      idempotencyKey: `crs05-quote:${quote.quoteReference}:${lifecycle.eventReference}`,
    });
  }

  async function resolveIdentity(client, user, prospectReference) {
    const activeLink = await loadActiveIdentityLink(client, prospectReference);
    if (!activeLink) {
      return freeze({
        identity: {
          state: "UNRESOLVED",
          personReference: null,
          sourceIdentityLinkReference: null,
          identityDecisionReference: null,
          matchStatus: null,
          reason: "PERSON_UNRESOLVED",
          sourceIdentityReference: prospectReference,
        },
        person: null,
      });
    }
    const [person, decision] = await Promise.all([
      loadPerson(client, activeLink.person_id),
      loadDecision(client, activeLink.decision_id),
    ]);
    if (person.advisor_id !== user.id) {
      fail("CRS05_PERSON_OWNER_MISMATCH", "La persona no pertenece al asesor autenticado.");
    }
    if (decision.resolved_person_id !== activeLink.person_id ||
      decision.source_record_reference !== prospectReference) {
      fail("CRS05_IDENTITY_LINEAGE_MISMATCH", "El vínculo no coincide con su decisión de identidad.");
    }
    return freeze({
      identity: {
        state: "LINKED",
        personReference: person.person_reference,
        sourceIdentityLinkReference: activeLink.link_reference,
        identityDecisionReference: decision.decision_reference,
        matchStatus: activeLink.match_status,
        reason: null,
        sourceIdentityReference: prospectReference,
      },
      person,
    });
  }

  async function convergeRows(client, user, quoteRow, versionRow, eventRow, options = {}) {
    if (quoteRow.advisor_id !== user.id || versionRow.advisor_id !== user.id || eventRow.advisor_id !== user.id) {
      fail("CRS05_QUOTE_OWNER_MISMATCH", "Quote, Version o evento pertenecen a otro asesor.");
    }
    if (versionRow.quote_id !== quoteRow.id || eventRow.quote_id !== quoteRow.id ||
      eventRow.quote_version_id !== versionRow.id || eventRow.prospect_id !== quoteRow.prospect_id) {
      fail("CRS05_DURABLE_LINEAGE_MISMATCH", "La lineage durable de Quote no coincide.");
    }
    const quote = normalizeQuoteRow(quoteRow);
    const version = normalizeVersionRow(versionRow, options);
    const lifecycle = normalizeLifecycleRow(eventRow, quote, version);
    const resolved = await resolveIdentity(client, user, quote.prospectReference);
    const correlationId = optionalReference(options.correlationId);
    const domainLink = domainLinkAdapters.fromAuthoritativeReceipt(quoteReceipt(quote, lifecycle), {
      advisorReference: user.id,
      personReference: resolved.person?.person_reference || null,
      relationshipReference: null,
      correlationId,
      sourceIdentityReference: quote.prospectReference,
      privacyClassification: resolved.person?.privacy_classification || "PRIVATE",
      correctionOf: optionalReference(options.correctionOf),
      sourceEventReference: null,
    });
    return convergenceContract.createQuotePersonConvergence({
      quote,
      version,
      lifecycle,
      identity: resolved.identity,
      domainLink,
      acceptedQuoteRelationship: options.acceptedQuoteRelationship || null,
    });
  }

  function create(client) {
    requireDependencies();

    async function getConvergedQuote(quoteReference, options = {}) {
      const user = await authenticatedUser(client);
      const quoteRow = await loadQuoteByReference(client, quoteReference);
      const [versionRow, eventRow] = await Promise.all([
        loadCurrentVersion(client, quoteRow),
        loadLatestEvent(client, quoteRow),
      ]);
      return convergeRows(client, user, quoteRow, versionRow, eventRow, options);
    }

    async function listConvergedQuotesForProspect(prospectReference, options = {}) {
      const user = await authenticatedUser(client);
      const { data, error } = await client
        .from("quote_lifecycle_quotes")
        .select(
          "id,quote_reference,advisor_id,prospect_id,product_reference,current_version,lifecycle_state,created_at,updated_at",
        )
        .eq("prospect_id", prospectReference)
        .order("updated_at", { ascending: false });
      queryError(error, "CRS05_QUOTE_LIST_READ_FAILED");
      const results = [];
      for (const quoteRow of array(data)) {
        const [versionRow, eventRow] = await Promise.all([
          loadCurrentVersion(client, quoteRow),
          loadLatestEvent(client, quoteRow),
        ]);
        results.push(await convergeRows(client, user, quoteRow, versionRow, eventRow, options));
      }
      return freeze(results);
    }

    async function listQuoteVersions(quoteReference) {
      const user = await authenticatedUser(client);
      const quoteRow = await loadQuoteByReference(client, quoteReference);
      if (quoteRow.advisor_id !== user.id) fail("CRS05_QUOTE_OWNER_MISMATCH", "Quote pertenece a otro asesor.");
      const { data, error } = await client
        .from("quote_lifecycle_versions")
        .select(
          "id,quote_id,advisor_id,quote_version_reference,version_number,snapshot_digest,source_record_reference,source_evidence_references,freshness_metadata,confirmation_state,created_at",
        )
        .eq("quote_id", quoteRow.id)
        .order("version_number", { ascending: false });
      queryError(error, "CRS05_QUOTE_VERSION_LIST_FAILED");
      return freeze(array(data).map(row => freeze({
        quoteVersionReference: row.quote_version_reference,
        versionNumber: Number(row.version_number),
        snapshotDigest: row.snapshot_digest,
        confirmationState: row.confirmation_state,
        createdAt: iso(row.created_at),
      })));
    }

    async function createCommercialMovementView(quoteReference, movementReference, options = {}) {
      const snapshot = await getConvergedQuote(quoteReference, options);
      if (snapshot.identity.state !== "LINKED") {
        fail("CRS05_MOVEMENT_REQUIRES_CONFIRMED_PERSON", "Un movimiento comercial requiere persona confirmada.");
      }
      const correlationId = domainLinkContract.deriveCorrelationId({
        personReference: snapshot.identity.personReference,
        movementReference,
      });
      return getConvergedQuote(quoteReference, { ...options, correlationId });
    }

    function convergeAcceptedQuoteCarteraRelationship(snapshotLike, relationship) {
      const snapshot = convergenceContract.assertQuotePersonConvergence(snapshotLike);
      return convergenceContract.createQuotePersonConvergence({
        quote: snapshot.quote,
        version: snapshot.version,
        lifecycle: snapshot.lifecycle,
        identity: snapshot.identity,
        domainLink: snapshot.domainLink,
        acceptedQuoteRelationship: relationship,
      });
    }

    function convergeCanonicalLifecycleEvent(eventLike, context = {}) {
      const event = quoteContract.assertQuoteLifecycleEvent(eventLike);
      const quote = freeze({
        quoteReference: event.payload.quote_reference,
        advisorReference: event.tenant_id,
        prospectReference: event.payload.prospect_reference,
        productReference: event.payload.product_reference,
        lifecycleState: event.payload.lifecycle_state,
        currentVersionNumber: Number(context.versionNumber || 1),
        createdAt: event.occurred_at,
        updatedAt: event.recorded_at,
        persistenceReceiptReference: optionalReference(context.persistenceReceiptReference),
      });
      const version = freeze({
        quoteVersionReference: event.payload.quote_version_reference,
        versionNumber: quote.currentVersionNumber,
        snapshotDigest: event.provenance.snapshot_digest,
        sourceRecordReference: event.provenance.source_record_id,
        sourceEvidenceReferences: event.provenance.evidence_references,
        freshnessStatus: event.provenance.freshness_status,
        confirmationState: event.confirmation_state,
        createdAt: event.recorded_at,
        printableArtifactReference: optionalReference(context.printableArtifactReference),
        calculationAuthorityReference: optionalReference(context.calculationAuthorityReference),
      });
      const lifecycle = freeze({
        eventReference: event.event_id,
        eventType: event.event_type,
        lifecycleState: event.payload.lifecycle_state,
        previousLifecycleState: event.payload.previous_lifecycle_state,
        quoteReference: event.payload.quote_reference,
        quoteVersionReference: event.payload.quote_version_reference,
        prospectReference: event.payload.prospect_reference,
        productReference: event.payload.product_reference,
        occurredAt: event.occurred_at,
        recordedAt: event.recorded_at,
        correctionOf: event.correction_of,
        applicationReference: event.payload.application_reference,
        evidenceReferences: event.provenance.evidence_references,
      });
      const identity = context.identity || {
        state: "UNRESOLVED",
        personReference: null,
        sourceIdentityLinkReference: null,
        identityDecisionReference: null,
        matchStatus: null,
        reason: "PERSON_UNRESOLVED",
        sourceIdentityReference: quote.prospectReference,
      };
      const domainLink = domainLinkAdapters.fromAuthoritativeReceipt(quoteReceipt(quote, lifecycle), {
        advisorReference: quote.advisorReference,
        personReference: identity.personReference || null,
        relationshipReference: null,
        correlationId: optionalReference(context.correlationId),
        sourceIdentityReference: quote.prospectReference,
        privacyClassification: event.privacy_class,
        correctionOf: optionalReference(context.correctionOf),
        sourceEventReference: null,
      });
      return convergenceContract.createQuotePersonConvergence({
        quote,
        version,
        lifecycle,
        identity,
        domainLink,
        acceptedQuoteRelationship: context.acceptedQuoteRelationship || null,
      });
    }

    return freeze({
      getConvergedQuote,
      listConvergedQuotesForProspect,
      listQuoteVersions,
      createCommercialMovementView,
      convergeAcceptedQuoteCarteraRelationship,
      convergeCanonicalLifecycleEvent,
      diagnostics: () => freeze({
        serviceVersion: SERVICE_VERSION,
        quoteAuthority: "QUOTE_PERSISTENCE_AUTHORITY",
        quoteLifecycleAuthority: "QUOTE_LIFECYCLE_AUTHORITY",
        personAuthority: "CARTERA_010B_COMMERCIAL_PERSON",
        sourceIdentityLinkAuthority: "CARTERA_010B_SOURCE_IDENTITY_LINKS",
        domainLinkContract: "CRS_02",
        productSpecificIdentityAdapter: false,
        numericQuoteTruthCopied: false,
        pdfBytesCopied: false,
        quoteMutation: false,
        applicationMutation: false,
        policyMutation: false,
        automaticBusinessAction: false,
      }),
    });
  }

  return freeze({
    SERVICE_VERSION,
    Crs05QuotePersonConvergenceServiceError,
    create,
    _private: freeze({
      normalizeQuoteRow,
      normalizeVersionRow,
      normalizeLifecycleRow,
      quoteReceipt,
      resolveIdentity,
      convergeRows,
    }),
  });
});