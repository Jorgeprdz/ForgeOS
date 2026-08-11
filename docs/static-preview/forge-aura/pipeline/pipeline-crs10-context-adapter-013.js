const CONTRACT_ID = 'FORGE_PIPELINE_CRS10_PRESENTATION_CONTEXT_ADAPTER_013';
const sourceLayout = import.meta.url.includes('/docs/static-preview/');
const rootUrl = new URL(sourceLayout ? '../../../../' : '../../../', import.meta.url);
let authoritiesPromise;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

async function load(path) {
  return import(`${new URL(path, rootUrl).href}?v=forge-beta2-013-crs10-context`);
}

async function ensureAuthorities() {
  if (authoritiesPromise) return authoritiesPromise;
  authoritiesPromise = (async () => {
    for (const path of [
      'advisor-os/sales-pipeline/productive-prospect-service.js',
      'platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js',
      'platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js',
      'platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js',
      'advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js',
    ]) await load(path);

    const [decisionModule, relationshipModule] = await Promise.all([
      load('advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js'),
      load('advisor-os/person-workspace/crs-10-existing-relationship-intelligence-service.js'),
    ]);
    const convergence = globalThis.ForgeCrs03PipelinePersonConvergenceService;
    if (!convergence?.create) throw new Error('CRS03_PIPELINE_PERSON_CONVERGENCE_UNAVAILABLE');
    if (typeof decisionModule?.createPipelineDomainIntelligenceConsumer !== 'function') {
      throw new Error('PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_UNAVAILABLE');
    }
    if (typeof relationshipModule?.createCrs10ExistingRelationshipIntelligenceService !== 'function') {
      throw new Error('CRS10_RELATIONSHIP_INTELLIGENCE_SERVICE_UNAVAILABLE');
    }
    return freeze({
      convergence,
      decisionConsumerFactory: decisionModule.createPipelineDomainIntelligenceConsumer,
      relationshipServiceFactory: relationshipModule.createCrs10ExistingRelationshipIntelligenceService,
    });
  })().catch(error => {
    authoritiesPromise = null;
    throw error;
  });
  return authoritiesPromise;
}

export async function createPipelineCrs10ContextAdapter({
  client,
  convergenceServiceModule = null,
  decisionConsumerFactory = null,
  relationshipServiceFactory = null,
} = {}) {
  if (!client) throw new Error('PRODUCTIVE_CLIENT_REQUIRED');

  let convergence = convergenceServiceModule;
  let decisionFactory = decisionConsumerFactory;
  let relationshipFactory = relationshipServiceFactory;
  if (!convergence || !decisionFactory || !relationshipFactory) {
    const authorities = await ensureAuthorities();
    convergence ||= authorities.convergence;
    decisionFactory ||= authorities.decisionConsumerFactory;
    relationshipFactory ||= authorities.relationshipServiceFactory;
  }

  const decisionConsumer = decisionFactory({ client, convergenceServiceModule: convergence });
  const relationshipService = relationshipFactory({ client });

  async function intelligence(prospectReference, options = {}) {
    const base = await decisionConsumer.getProspectDecisionContext(prospectReference, {
      ...options,
      projections: Array.isArray(options.projections) ? options.projections : [],
    });

    if (base.identityState !== 'LINKED' || !base.personReference) {
      return freeze({
        ...base,
        relationshipIntelligence: null,
        relationshipIntelligenceState: 'UNAVAILABLE',
      });
    }

    try {
      const composition = await relationshipService.loadRelationshipIntelligence({
        personReference: base.personReference,
      });
      return freeze({
        ...base,
        relationshipIntelligence: composition,
        relationshipIntelligenceState: 'AVAILABLE',
        boundaries: {
          ...(base.boundaries || {}),
          existingCarteraIntelligenceReused: true,
          secondRelationshipEngine: false,
          relationshipMutationAllowed: false,
        },
      });
    } catch (error) {
      return freeze({
        ...base,
        relationshipIntelligence: null,
        relationshipIntelligenceState: 'DEGRADED',
        degradedReasons: [...new Set([
          ...(base.degradedReasons || []),
          error?.code || error?.message || 'CRS10_RELATIONSHIP_INTELLIGENCE_UNAVAILABLE',
        ])],
      });
    }
  }

  return freeze({
    intelligence,
    diagnostics: () => freeze({
      contractId: CONTRACT_ID,
      decisionConsumer: 'FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A',
      relationshipAuthority: 'CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001',
      pageSafeRootResolution: sourceLayout ? 'SOURCE_DOCS' : 'PUBLISHED_SITE',
      existingCarteraIntelligenceReused: true,
      createsTruth: false,
      createsScore: false,
      calculatesPriority: false,
      automaticExecutionAllowed: false,
      identityMutationAllowed: false,
      relationshipMutationAllowed: false,
      persistenceAllowed: false,
    }),
  });
}

export { CONTRACT_ID };
