import {
  composeDecisionProjectionSet,
} from "../../platform/decision-projection/forge-cross-domain-decision-projection.js";

const CONSUMER_ID = "FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A";
const STATES = Object.freeze(["ready", "partial", "unavailable", "degraded"]);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function consumerError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeProjections(projections) {
  if (!Array.isArray(projections)) {
    throw consumerError("PIPELINE_INTELLIGENCE_PROJECTIONS_ARRAY_REQUIRED", "Las proyecciones deben ser una lista FCDP.");
  }
  return composeDecisionProjectionSet(projections);
}

function sourceAuthorities(projectionSet, diagnostics) {
  const values = new Set([
    diagnostics?.prospectAuthority,
    diagnostics?.stageAuthority,
    diagnostics?.personAuthority,
    diagnostics?.sourceIdentityLinkAuthority,
  ].filter(Boolean));
  projectionSet.items.forEach(item => {
    (item.provenance?.sourceAuthorities || []).forEach(authority => values.add(authority));
  });
  return [...values];
}

function unavailableContext(prospectReference, error) {
  const projectionSet = composeDecisionProjectionSet([]);
  return freeze({
    consumerId: CONSUMER_ID,
    state: "unavailable",
    prospectReference,
    personReference: null,
    identityState: "UNKNOWN",
    opportunityAuthorityState: "UNKNOWN",
    projections: projectionSet.items,
    projectionSet,
    provenance: {
      sourceAuthorities: [],
      consumer: CONSUMER_ID,
    },
    degradedReasons: [error?.code || "PIPELINE_INTELLIGENCE_SOURCE_UNAVAILABLE"],
    boundaries: {
      readOnly: true,
      createsTruth: false,
      createsScore: false,
      calculatesPriority: false,
      calculatesConfidence: false,
      calculatesImpact: false,
      automaticExecutionAllowed: false,
      identityMutationAllowed: false,
      persistenceAllowed: false,
    },
  });
}

export function createPipelineDomainIntelligenceConsumer({
  client,
  convergenceServiceModule = globalThis.ForgeCrs03PipelinePersonConvergenceService,
} = {}) {
  if (!client) {
    throw consumerError("PIPELINE_INTELLIGENCE_AUTHENTICATED_CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
  }
  if (!convergenceServiceModule?.create) {
    throw consumerError("PIPELINE_INTELLIGENCE_PERSON_CONVERGENCE_REQUIRED", "CRS-03 Person convergence no está disponible.");
  }

  const convergence = convergenceServiceModule.create(client);
  if (!convergence?.getConvergedProspect) {
    throw consumerError("PIPELINE_INTELLIGENCE_PERSON_CONSUMER_INVALID", "CRS-03 no expone el read consumer requerido.");
  }

  async function getProspectDecisionContext(prospectReference, { projections = [] } = {}) {
    if (!prospectReference) {
      throw consumerError("PIPELINE_INTELLIGENCE_PROSPECT_REFERENCE_REQUIRED", "Prospect requiere referencia.");
    }

    const projectionSet = normalizeProjections(projections);
    let snapshot;
    try {
      snapshot = await convergence.getConvergedProspect(prospectReference);
    } catch (error) {
      return unavailableContext(prospectReference, error);
    }

    const diagnostics = typeof convergence.diagnostics === "function"
      ? convergence.diagnostics()
      : {};
    const identityState = snapshot?.identity?.state || "UNRESOLVED";
    const personReference = snapshot?.identity?.personReference || null;
    const opportunityAuthorityState = snapshot?.opportunityAuthorityState || diagnostics?.opportunityAuthority || "UNKNOWN";
    const degradedReasons = [];

    if (identityState !== "LINKED") degradedReasons.push("PERSON_UNRESOLVED");
    if (opportunityAuthorityState === "NOT_PRODUCTIVE") degradedReasons.push("OPPORTUNITY_AUTHORITY_NOT_PRODUCTIVE");
    if (!projectionSet.items.length) degradedReasons.push("NO_AUTHORIZED_PROJECTIONS");

    const state = degradedReasons.length ? "partial" : "ready";
    if (!STATES.includes(state)) {
      throw consumerError("PIPELINE_INTELLIGENCE_STATE_INVALID", "Estado de consumer inválido.");
    }

    return freeze({
      consumerId: CONSUMER_ID,
      state,
      prospectReference,
      personReference,
      identityState,
      opportunityAuthorityState,
      convergence: snapshot,
      projections: projectionSet.items,
      projectionSet,
      provenance: {
        sourceAuthorities: sourceAuthorities(projectionSet, diagnostics),
        consumer: CONSUMER_ID,
      },
      degradedReasons,
      boundaries: {
        readOnly: true,
        createsTruth: false,
        createsScore: false,
        calculatesPriority: false,
        calculatesConfidence: false,
        calculatesImpact: false,
        automaticExecutionAllowed: false,
        identityMutationAllowed: false,
        persistenceAllowed: false,
      },
    });
  }

  function diagnostics() {
    const upstream = typeof convergence.diagnostics === "function" ? convergence.diagnostics() : {};
    return freeze({
      consumerId: CONSUMER_ID,
      consumerMode: "read_only",
      projectionContract: "FCDP-004-001",
      convergenceService: upstream.serviceVersion || "CRS-03",
      personAuthority: upstream.personAuthority || "CARTERA_010B_COMMERCIAL_PERSON",
      prospectAuthority: upstream.prospectAuthority || "PIPELINE_PROSPECT_AUTHORITY",
      stageAuthority: upstream.stageAuthority || "PIPELINE_STAGE_RPC",
      opportunityAuthority: upstream.opportunityAuthority || "UNKNOWN",
      automaticIdentityResolution: false,
      automaticOpportunityCreation: false,
      automaticStageAdvance: false,
      identityMutation: false,
      persistence: false,
      scoreCalculation: false,
    });
  }

  return freeze({
    getProspectDecisionContext,
    diagnostics,
  });
}

export { CONSUMER_ID };
