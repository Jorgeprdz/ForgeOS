import test from 'node:test';
import assert from 'node:assert/strict';
import { createPipelineCrs10ContextAdapter } from '../docs/static-preview/forge-aura/pipeline/pipeline-crs10-context-adapter-013.js';

function baseContext({ linked = true } = {}) {
  return Object.freeze({
    consumerId: 'FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A',
    state: 'partial',
    prospectReference: 'PROSPECT:013',
    personReference: linked ? 'PERSON:013' : null,
    identityState: linked ? 'LINKED' : 'UNRESOLVED',
    opportunityAuthorityState: 'NOT_PRODUCTIVE',
    projections: Object.freeze([]),
    degradedReasons: Object.freeze([
      ...(linked ? [] : ['PERSON_UNRESOLVED']),
      'OPPORTUNITY_AUTHORITY_NOT_PRODUCTIVE',
      'NO_AUTHORIZED_PROJECTIONS',
    ]),
    boundaries: Object.freeze({
      readOnly: true,
      createsTruth: false,
      createsScore: false,
      automaticExecutionAllowed: false,
      identityMutationAllowed: false,
      persistenceAllowed: false,
    }),
  });
}

function composition() {
  return Object.freeze({
    contractType: 'FORGE_EXISTING_RELATIONSHIP_INTELLIGENCE_COMPOSITION',
    contractVersion: 'CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001',
    personReference: 'PERSON:013',
    itemCount: 1,
    reviewCount: 1,
    domains: Object.freeze({}),
    readOnly: true,
    boundaries: Object.freeze({
      existingCarteraIntelligenceReused: true,
      secondScoreEngine: false,
      secondRelationshipMemoryAuthority: false,
      automaticContact: false,
    }),
  });
}

test('RU04 source-owner: LINKED CRS03 personReference is the only identity passed to CRS10', async () => {
  const calls = { decision: [], relationship: [] };
  const adapter = await createPipelineCrs10ContextAdapter({
    client: {},
    convergenceServiceModule: { create() {} },
    decisionConsumerFactory: ({ convergenceServiceModule }) => {
      assert.equal(typeof convergenceServiceModule.create, 'function');
      return {
        async getProspectDecisionContext(prospectReference, options) {
          calls.decision.push({ prospectReference, options });
          return baseContext({ linked: true });
        },
      };
    },
    relationshipServiceFactory: () => ({
      async loadRelationshipIntelligence(input) {
        calls.relationship.push(input);
        return composition();
      },
    }),
  });

  const result = await adapter.intelligence('PROSPECT:013');
  assert.equal(calls.decision.length, 1);
  assert.deepEqual(calls.decision[0].options.projections, []);
  assert.deepEqual(calls.relationship, [{ personReference: 'PERSON:013' }]);
  assert.equal(result.relationshipIntelligenceState, 'AVAILABLE');
  assert.deepEqual(result.relationshipIntelligence, composition());
  assert.ok(result.degradedReasons.includes('NO_AUTHORIZED_PROJECTIONS'));
  assert.equal(result.boundaries.existingCarteraIntelligenceReused, true);
  assert.equal(result.boundaries.secondRelationshipEngine, false);
  assert.equal(result.boundaries.relationshipMutationAllowed, false);
  assert.equal(result.boundaries.createsScore, false);
});

test('RU04 source-owner: UNRESOLVED prospect never calls CRS10 or invents a person identity', async () => {
  let relationshipCalls = 0;
  const adapter = await createPipelineCrs10ContextAdapter({
    client: {},
    convergenceServiceModule: { create() {} },
    decisionConsumerFactory: () => ({
      async getProspectDecisionContext() {
        return baseContext({ linked: false });
      },
    }),
    relationshipServiceFactory: () => ({
      async loadRelationshipIntelligence() {
        relationshipCalls += 1;
        throw new Error('MUST_NOT_BE_CALLED');
      },
    }),
  });

  const result = await adapter.intelligence('PROSPECT:013');
  assert.equal(relationshipCalls, 0);
  assert.equal(result.identityState, 'UNRESOLVED');
  assert.equal(result.personReference, null);
  assert.equal(result.relationshipIntelligence, null);
  assert.equal(result.relationshipIntelligenceState, 'UNAVAILABLE');
  assert.ok(result.degradedReasons.includes('PERSON_UNRESOLVED'));
});

test('RU04 source-owner: CRS10 degradation remains separate from FCDP degradation', async () => {
  const adapter = await createPipelineCrs10ContextAdapter({
    client: {},
    convergenceServiceModule: { create() {} },
    decisionConsumerFactory: () => ({
      async getProspectDecisionContext() {
        return baseContext({ linked: true });
      },
    }),
    relationshipServiceFactory: () => ({
      async loadRelationshipIntelligence() {
        const error = new Error('SOURCE_TEMPORARILY_UNAVAILABLE');
        error.code = 'CRS10_SOURCE_TEMPORARILY_UNAVAILABLE';
        throw error;
      },
    }),
  });

  const result = await adapter.intelligence('PROSPECT:013');
  assert.equal(result.relationshipIntelligenceState, 'DEGRADED');
  assert.equal(result.relationshipIntelligence, null);
  assert.ok(result.degradedReasons.includes('NO_AUTHORIZED_PROJECTIONS'));
  assert.ok(result.degradedReasons.includes('CRS10_SOURCE_TEMPORARILY_UNAVAILABLE'));
});
