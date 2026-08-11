import { createPipelineDomainIntelligenceConsumer } from '../../../../advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js';
import { createCrs10ExistingRelationshipIntelligenceService } from '../../../../advisor-os/person-workspace/crs-10-existing-relationship-intelligence-service.js';

const CONTRACT_ID = 'FORGE_PIPELINE_CRS10_PRESENTATION_CONTEXT_ADAPTER_013';
const rootUrl = new URL('../../../../', import.meta.url);
let convergenceAuthorityPromise;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

async function load(path) {
  await import(`${new URL(path, rootUrl).href}?v=forge-beta2-013-crs10-context`);
}

async function ensureConvergenceAuthority() {
  if (convergenceAuthorityPromise) return convergenceAuthorityPromise;
  convergenceAuthorityPromise = (async () => {
    for (const path of [
      'advisor-os/sales-pipeline/productive-prospect-service.js',
      'platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js',
      'platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js',
      'platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js',
      'advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js',
    ]) await load(path);

    const authority = globalThis.ForgeCrs03PipelinePersonConvergenceService;
    if (!authority?.create) throw new Error('CRS03_PIPELINE_PERSON_CONVERGENCE_UNAVAILABLE');
    return authority;
  })().catch(error => {
    convergenceAuthorityPromise = null;
    throw error;
  });
  return convergenceAuthorityPromise;
}

export async function createPipelineCrs10ContextAdapter({
  client,
  convergenceServiceModule = null,
  decisionConsumerFactory = createPipelineDomainIntelligenceConsumer,
  relationshipServiceFactory = createCrs10ExistingRelationshipIntelligenceService,
} = {}) {
  if (!client) throw new Error('PRODUCTIVE_CLIENT_REQUIRED');
  const convergence = convergenceServiceModule || await ensureConvergenceAuthority();
  const decisionConsumer = decisionConsumerFactory({ client, convergenceServiceModule: convergence });
  const relationshipService = relationshipServiceFactory({ client });

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
