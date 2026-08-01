"use strict";

(function crs01ExistingCarteraAuthorityRegistryModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeCrs01ExistingCarteraAuthorityRegistry = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory() {
  const CONTRACT_VERSION = "CRS-01-AUTHORITY-PROMOTION-001.1";
  const CONTRACT_TYPE = "FORGE_EXISTING_CARTERA_AUTHORITY_REGISTRY";

  const AUTHORITY_STATUS = Object.freeze({
    PRODUCTIVE_REMOTE_ACCEPTED: "PRODUCTIVE_REMOTE_ACCEPTED",
    PRODUCTIVE_READ_MODEL: "PRODUCTIVE_READ_MODEL",
    ACCEPTED_FOUNDATION: "ACCEPTED_FOUNDATION",
  });

  const BOUNDARIES = Object.freeze({
    newCommercialPersonTable: false,
    parallelIdentityResolution: false,
    newAdvisorCommercialRelationshipPersistence: false,
    newPersonTimelineLedger: false,
    newRelationshipIntelligenceStack: false,
    automaticIdentityMerge: false,
    automaticOpportunityCreation: false,
    automaticApplicationCreation: false,
    automaticPolicyCreation: false,
    automaticStageAdvance: false,
    automaticContact: false,
    automaticMessage: false,
    automaticTask: false,
    automaticCalendar: false,
    databaseMutation: false,
    crmMutation: false,
    quoteMutation: false,
  });

  const RESIDUAL_GAPS = Object.freeze({
    sharedReadFacade: "DELIVERED_BY_CRS_01",
    commonDomainLinkEnvelope: "CRS_02",
    pipelinePersonConvergence: "CRS_03",
    activityFesPersonConvergence: "CRS_04",
    quotePersonConvergence: "CRS_05",
    applicationAndSignatureAuthority: "CRS_06",
    applicationPolicyLineage: "CRS_07",
    personHistorySourceExtension: "CRS_08",
    crossModuleWorkspaceEntryPoints: "CRS_09",
    crossModuleIntelligenceComposition: "CRS_10",
    endToEndAcceptance: "CRS_11",
  });

  class Crs01AuthorityRegistryError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs01AuthorityRegistryError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs01AuthorityRegistryError(code, message, details);
  };
  const plain = value => Boolean(value) && typeof value === "object" &&
    !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const authority = ({
    authorityId,
    sourceStage,
    status,
    domainOwner,
    capabilities,
    sourcePaths,
    consumers,
    mutationMode = "GOVERNED_BY_EXISTING_AUTHORITY",
  }) => freeze({
    authorityId,
    sourceStage,
    status,
    domainOwner,
    capabilities: [...capabilities],
    sourcePaths: [...sourcePaths],
    consumers: [...consumers],
    mutationMode,
    promotedBy: "CRS_01_EXISTING_CARTERA_AUTHORITY_PROMOTION",
  });

  const AUTHORITIES = freeze([
    authority({
      authorityId: "CARTERA_010B_COMMERCIAL_PERSON",
      sourceStage: "CARTERA_010B",
      status: AUTHORITY_STATUS.PRODUCTIVE_REMOTE_ACCEPTED,
      domainOwner: "SHARED_COMMERCIAL_MODEL",
      capabilities: [
        "CANONICAL_PERSON_IDENTITY",
        "OWNER_SCOPED_PERSISTENCE",
        "PRIVACY_CLASSIFICATION",
        "VERSION_AND_ARCHIVE_LINEAGE",
      ],
      sourcePaths: [
        "platform/shared-commercial-model/cartera-010b-contract-validator.js",
        "schemas/commercial-person-v1.schema.json",
        "supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql",
      ],
      consumers: ["PIPELINE", "ACTIVITY", "QUOTES", "APPLICATION", "CARTERA"],
    }),
    authority({
      authorityId: "CARTERA_010B_IDENTITY_RESOLUTION",
      sourceStage: "CARTERA_010B",
      status: AUTHORITY_STATUS.PRODUCTIVE_REMOTE_ACCEPTED,
      domainOwner: "SHARED_COMMERCIAL_MODEL",
      capabilities: [
        "MATCH_CANDIDATE",
        "LINK_CONFIRMED",
        "CREATE_CONFIRMED",
        "CONFLICT_AND_CORRECTION_LINEAGE",
        "IDEMPOTENT_COMMAND_EXECUTION",
      ],
      sourcePaths: [
        "platform/shared-commercial-model/cartera-010b-contract-validator.js",
        "supabase/migrations/20260731000211_cartera010b_identity_resolution_rpc.sql",
      ],
      consumers: ["PIPELINE", "QUOTES", "APPLICATION", "CARTERA"],
      mutationMode: "HUMAN_GOVERNED_COMMAND_ONLY",
    }),
    authority({
      authorityId: "CARTERA_010B_SOURCE_IDENTITY_LINKS",
      sourceStage: "CARTERA_010B",
      status: AUTHORITY_STATUS.PRODUCTIVE_REMOTE_ACCEPTED,
      domainOwner: "SHARED_COMMERCIAL_MODEL",
      capabilities: [
        "PROSPECT_TO_PERSON_LINK",
        "SOURCE_DOMAIN_ATTRIBUTION",
        "EFFECTIVE_DATING",
        "CORRECTION_LINEAGE",
      ],
      sourcePaths: [
        "supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql",
        "supabase/migrations/20260731000211_cartera010b_identity_resolution_rpc.sql",
      ],
      consumers: ["PIPELINE", "QUOTES", "APPLICATION", "CARTERA"],
      mutationMode: "IDENTITY_DECISION_DERIVED_ONLY",
    }),
    authority({
      authorityId: "CARTERA_010B_COMMERCIAL_ACCOUNT_MEMBERSHIP",
      sourceStage: "CARTERA_010B",
      status: AUTHORITY_STATUS.PRODUCTIVE_REMOTE_ACCEPTED,
      domainOwner: "SHARED_COMMERCIAL_MODEL",
      capabilities: [
        "HOUSEHOLD_AND_BUSINESS_GROUPING",
        "PERSON_ACCOUNT_MEMBERSHIP",
        "TEMPORAL_RELATIONSHIP_ROLE",
      ],
      sourcePaths: [
        "platform/shared-commercial-model/cartera-010b-contract-validator.js",
        "schemas/commercial-account-v1.schema.json",
        "supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql",
      ],
      consumers: ["CARTERA", "PERSON_WORKSPACE"],
    }),
    authority({
      authorityId: "CARTERA_010B_CANONICAL_POLICY_AND_ROLE",
      sourceStage: "CARTERA_010B_TO_020C",
      status: AUTHORITY_STATUS.PRODUCTIVE_REMOTE_ACCEPTED,
      domainOwner: "CARTERA",
      capabilities: [
        "CANONICAL_POLICY",
        "POLICY_VERSION",
        "POLICY_ROLE",
        "EVIDENCE_BOUND_CONFIRMATION",
        "QUOTE_AND_APPLICATION_LINEAGE_FIELDS",
      ],
      sourcePaths: [
        "platform/shared-commercial-model/cartera-010b-contract-validator.js",
        "schemas/policy-v2.schema.json",
        "schemas/policy-role-v1.schema.json",
        "advisor-os/cartera/persistent-confirmation-orchestration-service.js",
      ],
      consumers: ["CARTERA", "APPLICATION", "PIPELINE", "PERSON_WORKSPACE"],
      mutationMode: "CARTERA_020C_HUMAN_GOVERNED_CONFIRMATION_ONLY",
    }),
    authority({
      authorityId: "CARTERA_010C_CANONICAL_PORTFOLIO",
      sourceStage: "CARTERA_010C",
      status: AUTHORITY_STATUS.PRODUCTIVE_READ_MODEL,
      domainOwner: "CARTERA",
      capabilities: ["PORTFOLIO_READ", "POLICY_DETAIL", "POLICY_TIMELINE"],
      sourcePaths: [
        "advisor-os/cartera/canonical-portfolio-service.js",
        "platform/policy-intelligence/cartera-010c-portfolio-read-model.js",
        "platform/policy-intelligence/cartera-010c-policy-detail-timeline.js",
      ],
      consumers: ["CARTERA", "PERSON_WORKSPACE"],
      mutationMode: "READ_ONLY",
    }),
    authority({
      authorityId: "CARTERA_010D_UNIFIED_DIRECTORY",
      sourceStage: "CARTERA_010D",
      status: AUTHORITY_STATUS.PRODUCTIVE_READ_MODEL,
      domainOwner: "SHARED_COMMERCIAL_MODEL",
      capabilities: [
        "PERSON_DIRECTORY",
        "ACCOUNT_DIRECTORY",
        "POLICY_DIRECTORY",
        "RELATIONSHIP_SEARCH",
      ],
      sourcePaths: [
        "advisor-os/cartera/canonical-directory-service.js",
        "platform/policy-intelligence/cartera-010d-unified-directory-read-model.js",
      ],
      consumers: ["PIPELINE", "ACTIVITY", "QUOTES", "APPLICATION", "CARTERA"],
      mutationMode: "READ_ONLY",
    }),
    authority({
      authorityId: "CARTERA_040_RELATIONSHIP_MEMORY",
      sourceStage: "CARTERA_040A",
      status: AUTHORITY_STATUS.PRODUCTIVE_REMOTE_ACCEPTED,
      domainOwner: "RELATIONSHIP_MEMORY",
      capabilities: [
        "CONFIRMED_RELATIONSHIP_MEMORY",
        "CONSENTED_LIFE_CONTEXT",
        "PREFERENCES",
        "OPEN_COMMITMENTS",
      ],
      sourcePaths: [
        "advisor-os/cartera/cartera-040a-relationship-memory-service.js",
        "supabase/migrations/20260801000270_cartera040_relationship_memory_authority.sql",
      ],
      consumers: ["ACTIVITY", "CARTERA", "PERSON_WORKSPACE"],
      mutationMode: "EXPLICIT_ADVISOR_CONFIRMATION_ONLY",
    }),
    authority({
      authorityId: "CARTERA_040B_PERSON_RELATIONSHIP_BRIEF",
      sourceStage: "CARTERA_040B",
      status: AUTHORITY_STATUS.PRODUCTIVE_READ_MODEL,
      domainOwner: "SHARED_COMMERCIAL_MODEL",
      capabilities: [
        "PERSON_SUMMARY",
        "ACCOUNT_AND_POLICY_NETWORK",
        "RELATIONSHIP_HISTORY",
        "PREFERENCES_AND_COMMITMENTS",
      ],
      sourcePaths: [
        "platform/relationship-intelligence/cartera-040b-relationship-memory-projection.js",
        "supabase/migrations/20260801000271_cartera040_relationship_brief_read.sql",
      ],
      consumers: ["PIPELINE", "ACTIVITY", "QUOTES", "APPLICATION", "CARTERA"],
      mutationMode: "READ_ONLY",
    }),
    authority({
      authorityId: "CARTERA_050_TO_100_RELATIONSHIP_INTELLIGENCE",
      sourceStage: "CARTERA_050_TO_100",
      status: AUTHORITY_STATUS.ACCEPTED_FOUNDATION,
      domainOwner: "RELATIONSHIP_INTELLIGENCE",
      capabilities: [
        "FUTURE_RADAR",
        "RELATIONSHIP_GROWTH",
        "RELATIONAL_ACTIVATION",
        "ECONOMIC_CONNECTION",
        "RELATIONSHIP_CAPITAL",
        "PRODUCTIVITY_PROOF_AND_EXPLICIT_LEARNING",
      ],
      sourcePaths: [
        "advisor-os/cartera/cartera-050a-future-radar-service.js",
        "advisor-os/cartera/cartera-060c-relationship-growth-service.js",
        "advisor-os/cartera/cartera-070c-relational-activation-service.js",
        "advisor-os/cartera/cartera-080-economic-connection-service.js",
        "advisor-os/cartera/cartera-090c-relationship-capital-service.js",
        "advisor-os/cartera/cartera-100c-productivity-proof-service.js",
      ],
      consumers: ["CARTERA", "PERSON_WORKSPACE", "ALFRED", "NBA", "NASH"],
      mutationMode: "READ_OR_EXPLICIT_FEEDBACK_ONLY",
    }),
  ]);

  const BY_ID = new Map(AUTHORITIES.map(entry => [entry.authorityId, entry]));

  function getAuthority(authorityId) {
    const normalized = String(authorityId || "").trim();
    const entry = BY_ID.get(normalized);
    if (!entry) fail("CRS01_AUTHORITY_NOT_FOUND", "La autoridad solicitada no existe.", { authorityId: normalized });
    return entry;
  }

  function listAuthorities({ domainOwner = null, capability = null, consumer = null } = {}) {
    return Object.freeze(AUTHORITIES.filter(entry => (
      (!domainOwner || entry.domainOwner === domainOwner)
      && (!capability || entry.capabilities.includes(capability))
      && (!consumer || entry.consumers.includes(consumer))
    )));
  }

  function assertNoDuplicateAuthorityPlan(input = {}) {
    if (!plain(input)) fail("CRS01_PLAN_OBJECT_REQUIRED", "El plan debe ser un objeto.");
    const forbidden = [
      ["newCommercialPersonTable", input.newCommercialPersonTable],
      ["parallelIdentityResolution", input.parallelIdentityResolution],
      ["newAdvisorCommercialRelationshipPersistence", input.newAdvisorCommercialRelationshipPersistence],
      ["newPersonTimelineLedger", input.newPersonTimelineLedger],
      ["newRelationshipIntelligenceStack", input.newRelationshipIntelligenceStack],
    ].filter(([, enabled]) => enabled === true).map(([key]) => key);
    if (forbidden.length) {
      fail("CRS01_DUPLICATE_AUTHORITY_PLAN_FORBIDDEN", "El plan intenta duplicar autoridades existentes.", { forbidden });
    }
    return true;
  }

  function createAuthorityPromotionSnapshot() {
    return freeze({
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      stage: "CRS_01_EXISTING_CARTERA_AUTHORITY_PROMOTION_AND_GAP_LOCK",
      canonicalPersonAuthority: "CARTERA_010B_COMMERCIAL_PERSON",
      personHistoryFoundation: "CARTERA_040B_PERSON_RELATIONSHIP_BRIEF",
      relationshipIntelligenceFoundation: "CARTERA_050_TO_100_RELATIONSHIP_INTELLIGENCE",
      authorities: AUTHORITIES,
      residualGaps: RESIDUAL_GAPS,
      boundaries: BOUNDARIES,
      next: "CRS_02_MISSING_CROSS_MODULE_LINK_EXTENSION",
      readOnlyPromotion: true,
    });
  }

  return freeze({
    CONTRACT_TYPE,
    CONTRACT_VERSION,
    AUTHORITY_STATUS,
    AUTHORITIES,
    BOUNDARIES,
    RESIDUAL_GAPS,
    Crs01AuthorityRegistryError,
    getAuthority,
    listAuthorities,
    assertNoDuplicateAuthorityPlan,
    createAuthorityPromotionSnapshot,
  });
});