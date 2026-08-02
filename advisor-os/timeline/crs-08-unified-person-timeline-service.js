"use strict";

(function (root, factory) {
  const common = typeof module !== "undefined" && module.exports;
  const contract = common
    ? require("../../platform/shared-commercial-model/crs-08-unified-person-timeline-contract.js")
    : root?.ForgeCrs08UnifiedPersonTimelineContract;
  const adapters = common
    ? require("../../platform/shared-commercial-model/crs-08-unified-person-timeline-adapters.js")
    : root?.ForgeCrs08UnifiedPersonTimelineAdapters;
  const links = common
    ? require("../../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  let crs07 = null;
  if (common) {
    try { crs07 = require("../cartera/crs-07-application-policy-lineage-service.js"); } catch { crs07 = null; }
  } else {
    crs07 = root?.ForgeCrs07ApplicationPolicyLineageService || null;
  }
  const api = factory(contract, adapters, links, crs07);
  if (common) module.exports = api;
  if (root) root.ForgeCrs08UnifiedPersonTimelineService = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (contract, adapters, links, crs07) {
  const SERVICE_VERSION = "CRS-08-UNIFIED-PERSON-TIMELINE-SERVICE-001.1";
  const ACTIVITY_PULL_RPC = "forge_fes02_pull_activity_events";
  const RELATIONSHIP_BRIEF_RPC = "forge_cartera040_list_relationship_brief";
  const MAX_ACTIVITY_PAGES = 20;
  const ACTIVITY_PAGE_SIZE = 500;

  class Crs08UnifiedPersonTimelineServiceError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs08UnifiedPersonTimelineServiceError";
      this.code = code;
      this.details = details;
    }
  }
  const fail = (code, message, details = null) => {
    throw new Crs08UnifiedPersonTimelineServiceError(code, message, details);
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const optional = value => typeof value === "string" && value.trim() ? value.trim() : null;
  const required = (value, code, label) => optional(value) || fail(code, `${label} es obligatoria.`);
  const codeOf = error => optional(error?.code) || optional(error?.name) || "SOURCE_READ_FAILED";
  const array = value => Array.isArray(value) ? value : [];

  function ensureDependencies() {
    if (!contract?.createUnifiedPersonTimeline || !contract?.filterTimeline ||
      !adapters?.fromPipelineProspect || !links?.deriveRelationshipReference) {
      fail("CRS08_DEPENDENCIES_REQUIRED", "Los contratos CRS 02 y CRS 08 son obligatorios.");
    }
  }
  async function authenticatedUser(client) {
    if (!client?.auth?.getUser || !client?.from) {
      fail("CRS08_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) fail("CRS08_AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
    return data.user;
  }
  function queryError(error, fallback) {
    if (error) fail(error.code || fallback, error.message || "La lectura autoritativa falló.");
  }
  async function one(query, fallback) {
    const response = typeof query?.single === "function" ? await query.single() : await query;
    const { data, error } = response || {};
    queryError(error, fallback);
    if (!data) fail(fallback, "Registro autoritativo no encontrado.");
    return data;
  }
  async function many(query, fallback) {
    const { data, error } = await query;
    queryError(error, fallback);
    return array(data);
  }
  function normalizedRpcData(data) {
    return Array.isArray(data) && data.length === 1 && data[0] && typeof data[0] === "object" ? data[0] : data;
  }

  async function loadPerson(client, user, personReference) {
    const person = await one(
      client.from("commercial_people")
        .select("id,advisor_id,person_reference,display_name,lifecycle_state,privacy_classification,archived_at")
        .eq("advisor_id", user.id)
        .eq("person_reference", personReference)
        .single(),
      "CRS08_PERSON_READ_FAILED",
    );
    if (person.advisor_id !== user.id) fail("CRS08_PERSON_NOT_OWNED", "CommercialPerson pertenece a otro asesor.");
    if (person.lifecycle_state !== "CONFIRMED" || person.archived_at) {
      fail("CRS08_PERSON_NOT_ACTIVE", "CommercialPerson no está confirmada o está archivada.");
    }
    return person;
  }

  async function loadProspectReferences(client, user, person) {
    const linksRows = await many(
      client.from("commercial_source_identity_links")
        .select("source_record_reference,source_identity_type,effective_to,correction_of")
        .eq("advisor_id", user.id)
        .eq("person_id", person.id)
        .eq("source_identity_type", "PROSPECT")
        .is("effective_to", null),
      "CRS08_IDENTITY_LINK_READ_FAILED",
    );
    return [...new Set(linksRows.map(row => optional(row.source_record_reference)).filter(Boolean))].sort();
  }


  async function loadRelationshipFoundation({ client, user, person, relationshipReference, correlationId }) {
    if (!client?.rpc) fail("CRS08_HISTORY_FOUNDATION_RPC_REQUIRED", "Cartera 040B requiere RPC autenticado.");
    const { data, error } = await client.rpc(RELATIONSHIP_BRIEF_RPC, {
      p_payload: { personReference: person.person_reference, limit: 100 },
    });
    queryError(error, "CRS08_HISTORY_FOUNDATION_READ_FAILED");
    const brief = normalizedRpcData(data);
    if (!brief || typeof brief !== "object" || Array.isArray(brief)) {
      fail("CRS08_HISTORY_FOUNDATION_RESPONSE_INVALID", "Cartera 040B no devolvió un brief válido.");
    }
    if (brief?.person?.personReference !== person.person_reference) {
      fail("CRS08_HISTORY_FOUNDATION_PERSON_MISMATCH", "Cartera 040B devolvió otra CommercialPerson.");
    }
    const entries = array(brief.history).map(item => adapters.fromCartera040HistoryEvent(item, {
      advisorReference: user.id,
      personReference: person.person_reference,
      relationshipReference,
      correlationId,
    }));
    return { status: entries.length ? "AVAILABLE" : "EMPTY", reason: null, entries };
  }

  async function loadPipelineSource({ client, user, person, prospectReferences, relationshipReference, correlationId }) {
    if (!prospectReferences.length) return [];
    const rows = await many(
      client.from("prospects")
        .select("id,advisor_id,status,source,version,created_at,updated_at,archived_at")
        .eq("advisor_id", user.id)
        .in("id", prospectReferences),
      "CRS08_PIPELINE_READ_FAILED",
    );
    return rows.map(row => adapters.fromPipelineProspect(row, {
      advisorReference: user.id,
      personReference: person.person_reference,
      relationshipReference,
      correlationId,
    }));
  }

  async function loadActivitySource({ client, user, person, prospectReferences, relationshipReference, correlationId }) {
    if (!client?.rpc) fail("CRS08_ACTIVITY_RPC_REQUIRED", "El Timeline de Activity requiere el RPC FES 02.");
    if (!prospectReferences.length) return [];
    const wanted = new Set(prospectReferences);
    const records = [];
    let cursor = null;
    for (let page = 0; page < MAX_ACTIVITY_PAGES; page += 1) {
      const { data, error } = await client.rpc(ACTIVITY_PULL_RPC, { p_cursor: cursor, p_limit: ACTIVITY_PAGE_SIZE });
      queryError(error, "CRS08_ACTIVITY_READ_FAILED");
      const payload = normalizedRpcData(data) || {};
      for (const change of array(payload.changes)) {
        const record = change?.ledger_record || change?.ledgerRecord || change;
        const event = record?.canonical_event || record?.canonicalEvent || {};
        const subjectType = record?.subject_type || event?.subject?.type;
        const subjectId = record?.subject_id || event?.subject?.id;
        if (subjectType === "PROSPECT" && wanted.has(String(subjectId))) records.push(record);
      }
      if (payload.has_more !== true) break;
      cursor = optional(payload.cursor);
      if (!cursor) fail("CRS08_ACTIVITY_CURSOR_REQUIRED", "FES 02 indicó más páginas sin cursor.");
      if (page === MAX_ACTIVITY_PAGES - 1) fail("CRS08_ACTIVITY_PAGE_LIMIT", "Activity excede el límite seguro de lectura.");
    }
    return records.map(row => adapters.fromActivityLedgerRow(row, {
      advisorReference: user.id,
      personReference: person.person_reference,
      relationshipReference,
      correlationId,
    }));
  }

  async function loadQuoteSource({ client, user, person, prospectReferences, relationshipReference, correlationId }) {
    if (!prospectReferences.length) return [];
    const quotes = await many(
      client.from("quote_lifecycle_quotes")
        .select("id,quote_reference,advisor_id,prospect_id,product_reference,current_version,lifecycle_state,created_at,updated_at")
        .eq("advisor_id", user.id)
        .in("prospect_id", prospectReferences),
      "CRS08_QUOTE_READ_FAILED",
    );
    if (!quotes.length) return [];
    const quoteById = new Map(quotes.map(row => [row.id, row]));
    const events = await many(
      client.from("quote_lifecycle_events")
        .select("event_id,advisor_id,quote_id,event_type,lifecycle_state,previous_lifecycle_state,occurred_at,recorded_at,confirmation_state,correction_of")
        .eq("advisor_id", user.id)
        .in("quote_id", [...quoteById.keys()])
        .order("occurred_at", { ascending: true }),
      "CRS08_QUOTE_EVENT_READ_FAILED",
    );
    return events.map(row => {
      const quote = quoteById.get(row.quote_id);
      if (!quote) fail("CRS08_QUOTE_EVENT_LINEAGE_MISMATCH", "Evento Quote sin Quote del mismo Timeline.");
      return adapters.fromQuoteLifecycleEvent(row, quote, {
        advisorReference: user.id,
        personReference: person.person_reference,
        relationshipReference,
        correlationId,
      });
    });
  }

  async function loadApplicationSource({ client, user, person, relationshipReference, correlationId }) {
    const applications = await many(
      client.from("commercial_applications")
        .select("id,application_reference,advisor_id,person_id,quote_reference,product_reference,lifecycle_state,created_at,updated_at")
        .eq("advisor_id", user.id)
        .eq("person_id", person.id),
      "CRS08_APPLICATION_READ_FAILED",
    );
    if (!applications.length) return [];
    const applicationById = new Map(applications.map(row => [row.id, row]));
    const events = await many(
      client.from("application_events")
        .select("event_reference,advisor_id,application_id,event_type,lifecycle_state,previous_lifecycle_state,occurred_at,recorded_at,correction_of")
        .eq("advisor_id", user.id)
        .in("application_id", [...applicationById.keys()])
        .order("occurred_at", { ascending: true }),
      "CRS08_APPLICATION_EVENT_READ_FAILED",
    );
    return events.map(row => {
      const application = applicationById.get(row.application_id);
      if (!application) fail("CRS08_APPLICATION_EVENT_LINEAGE_MISMATCH", "Evento Application sin Application del mismo Timeline.");
      return adapters.fromApplicationEvent(row, application, {
        advisorReference: user.id,
        personReference: person.person_reference,
        relationshipReference,
        correlationId,
      });
    });
  }

  async function loadPolicySource({ client, user, person, relationshipReference, correlationId, policyService }) {
    const service = policyService || (crs07?.createService ? crs07.createService({ client }) : null);
    if (!service?.listPoliciesForPerson) {
      fail("CRS08_POLICY_READER_REQUIRED", "La lectura de Policy requiere el servicio CRS 07.");
    }
    const lineages = await service.listPoliciesForPerson({ personReference: person.person_reference });
    return array(lineages).map(lineage => adapters.fromApplicationPolicyLineage(lineage, {
      advisorReference: user.id,
      personReference: person.person_reference,
      relationshipReference,
      correlationId,
    }));
  }

  const DEFAULT_LOADERS = Object.freeze({
    PIPELINE: loadPipelineSource,
    ACTIVITY: loadActivitySource,
    QUOTE: loadQuoteSource,
    APPLICATION: loadApplicationSource,
    CARTERA: loadPolicySource,
  });

  function createService({ client, sourceLoaders = {}, policyService = null, historyLoader = loadRelationshipFoundation, clock = () => new Date().toISOString() } = {}) {
    ensureDependencies();
    const loaders = { ...DEFAULT_LOADERS, ...sourceLoaders };

    async function readDomain(domain, context, strictSources) {
      const loader = loaders[domain];
      if (typeof loader !== "function") {
        return { domain, status: "UNAVAILABLE", reason: "SOURCE_READER_UNAVAILABLE", entries: [] };
      }
      try {
        const entries = await loader({ ...context, policyService });
        if (!Array.isArray(entries)) fail("CRS08_SOURCE_RESULT_INVALID", `${domain} no devolvió una lista.`);
        const normalized = entries.map(entry => contract.createSourceEntry(entry));
        return { domain, status: normalized.length ? "AVAILABLE" : "EMPTY", reason: null, entries: normalized };
      } catch (error) {
        if (strictSources) throw error;
        return { domain, status: "DEGRADED", reason: codeOf(error), entries: [] };
      }
    }

    async function getUnifiedPersonTimeline(personReferenceInput, options = {}) {
      const user = await authenticatedUser(client);
      const personReference = required(personReferenceInput, "CRS08_PERSON_REFERENCE_REQUIRED", "CommercialPerson");
      const person = await loadPerson(client, user, personReference);
      const relationshipReference = links.deriveRelationshipReference({
        advisorReference: user.id,
        personReference: person.person_reference,
      });
      const prospectReferences = await loadProspectReferences(client, user, person);
      const context = {
        client,
        user,
        person,
        prospectReferences,
        relationshipReference,
        correlationId: optional(options.correlationId),
      };
      let foundation;
      try {
        foundation = await historyLoader(context);
        if (!foundation || !Array.isArray(foundation.entries)) {
          fail("CRS08_HISTORY_FOUNDATION_RESULT_INVALID", "Cartera 040B no devolvió entradas válidas.");
        }
      } catch (error) {
        if (options.strictSources === true) throw error;
        foundation = { status: "DEGRADED", reason: codeOf(error), entries: [] };
      }
      const foundationEntries = foundation.entries.map(entry => contract.createSourceEntry(entry));
      const results = await Promise.all(contract.SOURCE_DOMAINS.map(domain =>
        readDomain(domain, context, options.strictSources === true)
      ));
      const mergedBySource = new Map();
      for (const entry of foundationEntries) {
        mergedBySource.set(`${entry.domain}:${entry.sourceEventReference}`, entry);
      }
      for (const result of results) {
        for (const entry of result.entries) {
          mergedBySource.set(`${entry.domain}:${entry.sourceEventReference}`, entry);
        }
      }
      const sourceEntries = [...mergedBySource.values()];
      const sourceCoverage = Object.fromEntries(results.map(result => {
        const count = sourceEntries.filter(entry => entry.domain === result.domain).length;
        const status = result.status === "DEGRADED"
          ? "DEGRADED"
          : count > 0 ? "AVAILABLE" : result.status;
        return [result.domain, { status, count, reason: result.reason }];
      }));
      return contract.createUnifiedPersonTimeline({
        advisorReference: user.id,
        personReference: person.person_reference,
        relationshipReference,
        builtAt: options.builtAt || clock(),
        sourceEntries,
        sourceCoverage,
        historyFoundation: {
          status: foundation.status,
          entryCount: foundationEntries.length,
          reason: foundation.reason || null,
        },
      });
    }

    async function getFilteredPersonTimeline(personReference, options = {}) {
      const timeline = await getUnifiedPersonTimeline(personReference, options);
      return contract.filterTimeline(timeline, options.filter || {});
    }

    function filterTimeline(timeline, options = {}) {
      return contract.filterTimeline(timeline, options);
    }

    return freeze({
      version: SERVICE_VERSION,
      getUnifiedPersonTimeline,
      getFilteredPersonTimeline,
      filterTimeline,
      diagnostics: () => freeze({
        serviceVersion: SERVICE_VERSION,
        personAuthority: "CARTERA_010B_COMMERCIAL_PERSON",
        relationshipAuthority: "CRS_01_ADVISOR_COMMERCIAL_RELATIONSHIP",
        historyFoundationAuthority: "CARTERA_040B_PERSON_RELATIONSHIP_BRIEF",
        domainLinkContract: "CRS_02",
        activityAuthority: "FES_ACTIVITY_EVENT_LEDGER",
        pipelineAuthority: "PIPELINE_PROSPECT_AUTHORITY",
        quoteAuthority: "QUOTE_LIFECYCLE_EVENT_AUTHORITY",
        applicationAuthority: "APPLICATION_AUTHORITY",
        policyAuthority: "CARTERA_POLICY_AUTHORITY",
        readOnlyProjection: true,
        secondLedger: false,
        timelinePersistence: false,
        truthMutation: false,
        automaticBusinessAction: false,
        providerMutation: false,
        productUiMutation: false,
      }),
    });
  }

  return freeze({
    SERVICE_VERSION,
    ACTIVITY_PULL_RPC,
    RELATIONSHIP_BRIEF_RPC,
    MAX_ACTIVITY_PAGES,
    ACTIVITY_PAGE_SIZE,
    Crs08UnifiedPersonTimelineServiceError,
    createService,
    _private: freeze({
      authenticatedUser,
      loadPerson,
      loadRelationshipFoundation,
      loadProspectReferences,
      loadPipelineSource,
      loadActivitySource,
      loadQuoteSource,
      loadApplicationSource,
      loadPolicySource,
      normalizedRpcData,
    }),
  });
});
