"use strict";

(function (root, factory) {
  const common = typeof module !== "undefined" && module.exports;
  const contract = common
    ? require("../../platform/shared-commercial-model/crs-09-person-workspace-contract.js")
    : root?.ForgeCrs09PersonWorkspaceContract;
  const api = factory(contract, root);
  if (common) module.exports = api;
  if (root) root.ForgeCrs09PersonWorkspaceService = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (contract, root) {
  const SERVICE_VERSION = "CRS-09-PRODUCTIVE-PERSON-WORKSPACE-SERVICE-001.1";
  const ACTIVE_PERSON_STATES = new Set(["CONFIRMED"]);
  const SOURCE_IDENTITY_TYPES = new Set(["PROSPECT", "QUOTE", "APPLICATION", "POLICY"]);

  class Crs09PersonWorkspaceServiceError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs09PersonWorkspaceServiceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs09PersonWorkspaceServiceError(code, message, details);
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const optional = value => typeof value === "string" && value.trim() ? value.trim() : null;
  const required = (value, code, label) => optional(value) || fail(code, `${label} es obligatoria.`);
  const array = value => Array.isArray(value) ? value : [];
  const codeOf = error => optional(error?.code) || optional(error?.name) || "SOURCE_READ_FAILED";
  const iso = value => {
    if (!value || Number.isNaN(Date.parse(value))) return null;
    return new Date(value).toISOString();
  };
  const deepLink = (nav, params = {}) => {
    const search = new URLSearchParams({ nav });
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && String(value).trim()) search.set(key, String(value));
    }
    return `?${search.toString()}`;
  };

  function ensureDependencies() {
    if (!contract?.createPersonWorkspace || !Array.isArray(contract?.SECTION_IDS)) {
      fail("CRS09_CONTRACT_REQUIRED", "El contrato CRS 09 es obligatorio.");
    }
  }

  async function authenticatedUser(client) {
    if (!client?.auth?.getUser || !client?.from) {
      fail("CRS09_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
    }
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) fail("CRS09_AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
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

  function assertOwnedActivePerson(person, user) {
    if (person?.advisor_id !== user.id) fail("CRS09_PERSON_NOT_OWNED", "CommercialPerson pertenece a otro asesor.");
    if (!ACTIVE_PERSON_STATES.has(person?.lifecycle_state) || person?.archived_at) {
      fail("CRS09_PERSON_NOT_ACTIVE", "CommercialPerson no está confirmada o está archivada.");
    }
    if (!person?.person_reference || !person?.display_name) {
      fail("CRS09_PERSON_INVALID", "CommercialPerson no contiene la identidad mínima requerida.");
    }
    return person;
  }

  async function resolvePersonByReference(client, user, personReference) {
    const person = await one(
      client.from("commercial_people")
        .select("id,advisor_id,person_reference,display_name,lifecycle_state,privacy_classification,archived_at")
        .eq("advisor_id", user.id)
        .eq("person_reference", personReference)
        .single(),
      "CRS09_PERSON_READ_FAILED",
    );
    return assertOwnedActivePerson(person, user);
  }

  function normalizeSourceIdentity(input = {}) {
    const type = required(input.type, "CRS09_SOURCE_IDENTITY_TYPE_REQUIRED", "El tipo de identidad").toUpperCase();
    if (!SOURCE_IDENTITY_TYPES.has(type)) {
      fail("CRS09_SOURCE_IDENTITY_TYPE_INVALID", "La identidad fuente no es compatible.", { type });
    }
    return freeze({ type, reference: required(input.reference, "CRS09_SOURCE_IDENTITY_REFERENCE_REQUIRED", "La identidad fuente") });
  }

  async function resolvePersonBySourceIdentity(client, user, sourceIdentityInput) {
    const sourceIdentity = normalizeSourceIdentity(sourceIdentityInput);
    const links = await many(
      client.from("commercial_source_identity_links")
        .select("id,advisor_id,person_id,source_identity_type,source_record_reference,effective_from,effective_to,correction_of")
        .eq("advisor_id", user.id)
        .eq("source_identity_type", sourceIdentity.type)
        .eq("source_record_reference", sourceIdentity.reference)
        .is("effective_to", null)
        .order("effective_from", { ascending: false })
        .limit(2),
      "CRS09_SOURCE_IDENTITY_LINK_READ_FAILED",
    );
    if (links.length === 0) fail("CRS09_PERSON_UNRESOLVED", "La identidad fuente todavía no está vinculada a una persona confirmada.");
    if (links.length > 1) fail("CRS09_MULTIPLE_ACTIVE_IDENTITY_LINKS", "La identidad fuente tiene más de un vínculo activo.");
    const person = await one(
      client.from("commercial_people")
        .select("id,advisor_id,person_reference,display_name,lifecycle_state,privacy_classification,archived_at")
        .eq("advisor_id", user.id)
        .eq("id", links[0].person_id)
        .single(),
      "CRS09_PERSON_READ_FAILED",
    );
    return assertOwnedActivePerson(person, user);
  }

  async function resolvePerson(client, user, input = {}) {
    if (optional(input.personReference)) return resolvePersonByReference(client, user, input.personReference);
    if (input.sourceIdentity) return resolvePersonBySourceIdentity(client, user, input.sourceIdentity);
    fail("CRS09_PERSON_LOCATOR_REQUIRED", "Se requiere CommercialPerson o una identidad fuente.");
  }

  async function loadProspectReferences(client, user, person) {
    const rows = await many(
      client.from("commercial_source_identity_links")
        .select("source_record_reference,source_identity_type,effective_to")
        .eq("advisor_id", user.id)
        .eq("person_id", person.id)
        .eq("source_identity_type", "PROSPECT")
        .is("effective_to", null),
      "CRS09_PROSPECT_IDENTITY_READ_FAILED",
    );
    return [...new Set(rows.map(row => optional(row.source_record_reference)).filter(Boolean))].sort();
  }

  function identityItem(person, relationshipReference) {
    return {
      reference: person.person_reference,
      recordType: "COMMERCIAL_PERSON",
      label: person.display_name,
      summary: "Identidad comercial canónica confirmada.",
      state: person.lifecycle_state,
      authority: "CARTERA_010B_COMMERCIAL_PERSON",
      privacyClassification: person.privacy_classification || "PRIVATE",
      attentionRequired: false,
      deepLink: deepLink("persona", { person: person.person_reference }),
      sourceDomain: "SHARED_COMMERCIAL_MODEL",
      facts: { personReference: person.person_reference, relationshipReference },
    };
  }

  async function loadOpportunities({ client, user, person, prospectReferences }) {
    if (!prospectReferences.length) return [];
    const rows = await many(
      client.from("prospects")
        .select("id,advisor_id,full_name,status,source,version,created_at,updated_at,archived_at,next_action_type,next_action_at")
        .eq("advisor_id", user.id)
        .in("id", prospectReferences),
      "CRS09_PIPELINE_READ_FAILED",
    );
    return rows.filter(row => !row.archived_at).map(row => ({
      reference: row.id,
      recordType: "PROSPECT",
      label: row.full_name || person.display_name,
      summary: row.source ? `Fuente: ${row.source}` : "Prospecto vinculado a la persona.",
      state: row.status || "UNKNOWN",
      authority: "PIPELINE_PROSPECT_AUTHORITY",
      effectiveAt: iso(row.updated_at || row.created_at),
      privacyClassification: person.privacy_classification || "PRIVATE",
      attentionRequired: false,
      deepLink: deepLink("pipeline", { prospect: row.id, person: person.person_reference }),
      sourceDomain: "PIPELINE",
      facts: {
        personReference: person.person_reference,
        stage: row.status || "UNKNOWN",
        version: Number(row.version || 1),
        nextActionType: optional(row.next_action_type),
        nextActionAt: iso(row.next_action_at),
      },
    }));
  }

  function timelineItems(timeline, person, predicate, deepLinkNav) {
    return array(timeline?.entries).filter(predicate).map(entry => ({
      reference: entry.entryReference,
      recordType: entry.recordType,
      label: entry.title,
      summary: entry.summary,
      state: entry.correctionState || entry.confirmationState,
      authority: entry.authority,
      occurredAt: entry.occurredAt,
      privacyClassification: entry.privacyClassification,
      confirmationState: entry.confirmationState,
      attentionRequired: entry.attentionRequired === true,
      deepLink: deepLink(deepLinkNav, { person: person.person_reference, event: entry.sourceEventReference }),
      sourceDomain: entry.domain,
      sourceEventReference: entry.sourceEventReference,
      correlationId: entry.correlationId,
      facts: {
        personReference: person.person_reference,
        recordReference: entry.recordReference,
        correctionState: entry.correctionState,
      },
    }));
  }

  function isCommitment(entry) {
    if (entry?.domain !== "ACTIVITY") return false;
    const text = `${entry.recordType || ""} ${entry.title || ""}`.toUpperCase();
    return /APPOINTMENT|COMMITMENT|DUE_ACTION|FOLLOW[_ ]?UP|CITA|SEGUIMIENTO/.test(text);
  }

  async function loadQuotes({ client, user, person, prospectReferences }) {
    if (!prospectReferences.length) return [];
    const rows = await many(
      client.from("quote_lifecycle_quotes")
        .select("id,quote_reference,advisor_id,prospect_id,product_reference,current_version,lifecycle_state,created_at,updated_at")
        .eq("advisor_id", user.id)
        .in("prospect_id", prospectReferences),
      "CRS09_QUOTE_READ_FAILED",
    );
    return rows.map(row => ({
      reference: row.quote_reference || row.id,
      recordType: "QUOTE",
      label: row.product_reference || "Cotización",
      summary: `Versión vigente ${Number(row.current_version || 1)}.`,
      state: row.lifecycle_state || "UNKNOWN",
      authority: "QUOTE_LIFECYCLE_AUTHORITY",
      effectiveAt: iso(row.updated_at || row.created_at),
      privacyClassification: person.privacy_classification || "PRIVATE",
      attentionRequired: false,
      deepLink: deepLink("cotizaciones", { person: person.person_reference, quote: row.quote_reference || row.id }),
      sourceDomain: "QUOTE",
      facts: {
        personReference: person.person_reference,
        prospectReference: row.prospect_id,
        productReference: row.product_reference || null,
        currentVersion: Number(row.current_version || 1),
      },
    }));
  }

  async function loadApplications({ client, user, person }) {
    const rows = await many(
      client.from("commercial_applications")
        .select("id,application_reference,advisor_id,person_id,quote_reference,product_reference,lifecycle_state,current_version,created_at,updated_at")
        .eq("advisor_id", user.id)
        .eq("person_id", person.id),
      "CRS09_APPLICATION_READ_FAILED",
    );
    return rows.map(row => ({
      reference: row.application_reference || row.id,
      recordType: "APPLICATION",
      label: row.product_reference || "Solicitud",
      summary: row.quote_reference ? `Originada desde ${row.quote_reference}.` : "Solicitud vinculada a la persona.",
      state: row.lifecycle_state || "UNKNOWN",
      authority: "APPLICATION_AUTHORITY",
      effectiveAt: iso(row.updated_at || row.created_at),
      privacyClassification: person.privacy_classification || "PRIVATE",
      attentionRequired: ["REQUIREMENTS_OPEN", "DISPUTED"].includes(String(row.lifecycle_state || "").toUpperCase()),
      deepLink: deepLink("persona", {
        person: person.person_reference,
        section: "APPLICATIONS",
        record: row.application_reference || row.id,
      }),
      sourceDomain: "APPLICATION",
      facts: {
        personReference: person.person_reference,
        quoteReference: row.quote_reference || null,
        productReference: row.product_reference || null,
        currentVersion: Number(row.current_version || 1),
      },
    }));
  }

  async function loadPolicies({ person, policyService }) {
    if (!policyService?.listPoliciesForPerson) {
      fail("CRS09_POLICY_READER_REQUIRED", "Cartera requiere el servicio CRS 07.");
    }
    const lineages = await policyService.listPoliciesForPerson({ personReference: person.person_reference });
    return array(lineages).map(lineage => ({
      reference: lineage.policy?.policyReference || lineage.policyReference,
      recordType: "POLICY",
      label: lineage.policy?.productReference || "Póliza",
      summary: lineage.policy?.carrierReference || "Póliza emitida vinculada a la persona.",
      state: lineage.policy?.statusValue || lineage.status || "UNKNOWN",
      authority: "CARTERA_POLICY_AUTHORITY",
      effectiveAt: lineage.policy?.effectiveFrom || lineage.policy?.confirmedAt || null,
      privacyClassification: person.privacy_classification || "PRIVATE",
      confirmationState: lineage.personRole?.confirmationState || "CONFIRMED",
      attentionRequired: lineage.personRole?.confirmationState === "DISPUTED",
      deepLink: deepLink("cartera", { person: person.person_reference, policy: lineage.policy?.policyReference || lineage.policyReference }),
      sourceDomain: "CARTERA",
      correlationId: lineage.correlationId || null,
      facts: {
        personReference: person.person_reference,
        applicationReference: lineage.application?.applicationReference || null,
        quoteReference: lineage.policy?.quoteReference || lineage.application?.quoteReference || null,
        productReference: lineage.policy?.productReference || null,
        roleType: lineage.personRole?.roleType || null,
      },
    }));
  }

  function sourceResult(id, items, status = null, reason = null) {
    return freeze({ id, status: status || (items.length ? "AVAILABLE" : "EMPTY"), reason, items });
  }

  function resolveTimelineService(explicit, client) {
    if (explicit?.getUnifiedPersonTimeline) return explicit;
    const authority = root?.ForgeCrs08UnifiedPersonTimelineService;
    return authority?.createService ? authority.createService({ client }) : null;
  }

  function resolvePolicyService(explicit, client) {
    if (explicit?.listPoliciesForPerson) return explicit;
    const authority = root?.ForgeCrs07ApplicationPolicyLineageService;
    return authority?.createService ? authority.createService({ client }) : null;
  }

  function resolveRelationshipReference(explicit, user, person) {
    if (typeof explicit === "function") {
      return explicit({ advisorReference: user.id, personReference: person.person_reference });
    }
    const authority = root?.ForgeCrs02DomainLinkEnvelopeContract;
    if (typeof authority?.deriveRelationshipReference === "function") {
      return authority.deriveRelationshipReference({ advisorReference: user.id, personReference: person.person_reference });
    }
    fail("CRS09_RELATIONSHIP_RESOLVER_REQUIRED", "CRS 02 debe derivar AdvisorCommercialRelationship.");
  }

  function createService({
    client,
    timelineService: explicitTimelineService = null,
    policyService: explicitPolicyService = null,
    deriveRelationshipReference = null,
    sourceLoaders = {},
    clock = () => new Date().toISOString(),
  } = {}) {
    ensureDependencies();

    async function readSection(id, loader, context, strictSources) {
      try {
        const items = await loader(context);
        if (!Array.isArray(items)) fail("CRS09_SECTION_RESULT_INVALID", `${id} no devolvió una lista.`);
        return sourceResult(id, items);
      } catch (error) {
        if (strictSources) throw error;
        return sourceResult(id, [], "DEGRADED", codeOf(error));
      }
    }

    async function getPersonWorkspace(locator = {}, options = {}) {
      const user = await authenticatedUser(client);
      const person = await resolvePerson(client, user, locator);
      const relationshipReference = resolveRelationshipReference(deriveRelationshipReference, user, person);
      const prospectReferences = await loadProspectReferences(client, user, person);
      const timelineService = resolveTimelineService(explicitTimelineService, client);
      if (!timelineService?.getUnifiedPersonTimeline) {
        fail("CRS09_TIMELINE_READER_REQUIRED", "CRS 08 es obligatorio para el workspace productivo.");
      }
      const policyService = resolvePolicyService(explicitPolicyService, client);
      const timeline = await timelineService.getUnifiedPersonTimeline(person.person_reference, {
        strictSources: options.strictSources === true,
        builtAt: options.builtAt || undefined,
      });
      if (timeline.personReference !== person.person_reference) {
        fail("CRS09_TIMELINE_PERSON_MISMATCH", "CRS 08 devolvió otra CommercialPerson.");
      }
      const context = freeze({ client, user, person, relationshipReference, prospectReferences, timeline, policyService });
      const defaultLoaders = {
        OPPORTUNITIES: loadOpportunities,
        COMMITMENTS: async current => timelineItems(current.timeline, current.person, isCommitment, "actividad"),
        INTERACTIONS: async current => timelineItems(current.timeline, current.person, entry => entry.domain === "ACTIVITY" && !isCommitment(entry), "actividad"),
        QUOTES: loadQuotes,
        APPLICATIONS: loadApplications,
        POLICIES: loadPolicies,
        TIMELINE: async current => timelineItems(current.timeline, current.person, () => true, "persona"),
      };
      const loaders = { ...defaultLoaders, ...sourceLoaders };
      const ids = ["OPPORTUNITIES", "COMMITMENTS", "INTERACTIONS", "QUOTES", "APPLICATIONS", "POLICIES", "TIMELINE"];
      const results = await Promise.all(ids.map(id => readSection(id, loaders[id], context, options.strictSources === true)));
      const sections = Object.fromEntries(results.map(result => [result.id, result]));
      sections.IDENTITY = sourceResult("IDENTITY", [identityItem(person, relationshipReference)]);
      const sourceHealth = Object.fromEntries(contract.SECTION_IDS.map(id => [id, {
        status: sections[id].status,
        reason: sections[id].reason,
        count: sections[id].items.length,
      }]));
      return contract.createPersonWorkspace({
        advisorReference: user.id,
        person: {
          personReference: person.person_reference,
          displayName: person.display_name,
          lifecycleState: person.lifecycle_state,
          privacyClassification: person.privacy_classification || "PRIVATE",
        },
        relationshipReference,
        builtAt: options.builtAt || clock(),
        sections,
        sourceHealth,
      });
    }

    return freeze({
      version: SERVICE_VERSION,
      getPersonWorkspace,
      diagnostics: () => freeze({
        serviceVersion: SERVICE_VERSION,
        canonicalRoot: "COMMERCIAL_PERSON",
        relationshipAuthority: "CRS_01_ADVISOR_COMMERCIAL_RELATIONSHIP",
        timelineAuthority: "CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL",
        readOnlyComposition: true,
        secondTruthStore: false,
        workspacePersistence: false,
        localMutationControls: false,
        automaticBusinessAction: false,
        lateResultAcceptance: false,
      }),
    });
  }

  return freeze({
    SERVICE_VERSION,
    SOURCE_IDENTITY_TYPES: freeze([...SOURCE_IDENTITY_TYPES]),
    Crs09PersonWorkspaceServiceError,
    createService,
    _private: freeze({
      authenticatedUser,
      resolvePerson,
      resolvePersonByReference,
      resolvePersonBySourceIdentity,
      loadProspectReferences,
      loadOpportunities,
      loadQuotes,
      loadApplications,
      loadPolicies,
      timelineItems,
      isCommitment,
      deepLink,
    }),
  });
});
