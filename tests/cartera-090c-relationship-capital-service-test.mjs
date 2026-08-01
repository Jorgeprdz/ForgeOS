import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCartera090RelationshipCapitalService,
} from '../advisor-os/cartera/cartera-090c-relationship-capital-service.js';

function growthProjection(items = []) {
  return {
    asOfDate: '2026-08-01',
    scope: 'PORTFOLIO',
    items,
    boundaries: {
      automaticOpportunityCreation: false,
      automaticContactExecution: false,
      finalMessageGeneration: false,
      lifeContextAsSalesTrigger: false,
      referralRequestExecution: false,
      finalNbaPriorityTruth: false,
      advisorConfirmationRequired: true,
    },
    projectionAuthority: 'CARTERA060_RELATIONSHIP_GROWTH_REVIEW_READ_MODEL',
    readOnly: true,
  };
}

function growthItem(personReference, growthClass = 'CENTER_OF_INFLUENCE') {
  return {
    candidateReference: `candidate-${personReference}`,
    growthClass,
    personReference,
    displayName: personReference,
    whyThisPerson: 'Relación activa con evidencia.',
    whyNow: 'Conviene revisar el contexto.',
    uncertainty: 'No prueba influencia ni intención.',
    smallestUsefulAction: 'Revisar.',
    advisorMustConfirm: 'Confirmar vigencia y consentimiento.',
    evidence: [{
      reference: `memory-${personReference}`,
      authority: 'RELATIONSHIP_MEMORY',
      truthClass: 'CLIENT_CONFIRMED_WILLINGNESS',
    }],
    clientWillingnessConfirmed: true,
    candidateState: 'REVIEW_REQUIRED',
    opportunityCreated: false,
    contactExecuted: false,
    referralRequested: false,
    lifeContextUsed: false,
    finalNbaPriority: false,
  };
}

function brief(personReference) {
  return {
    person: {
      personReference,
      displayName: personReference,
      preferredName: null,
      lifecycleState: 'CLIENT',
      privacyClassification: 'PRIVATE',
    },
    summary: { lastInteractionAt: null },
    network: { accounts: [], policies: [] },
    preferences: [],
    commitments: [],
    lifeContext: [],
    history: [],
    projectionAuthority: 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
    readOnly: true,
  };
}

test('090C composes existing 060 and 040 authorities without creating a new truth source', async () => {
  const growthCalls = [];
  const briefCalls = [];
  const service = createCartera090RelationshipCapitalService({
    growthService: {
      async loadGrowthReviews(input) {
        growthCalls.push(input);
        return growthProjection([
          growthItem('person-1'),
          growthItem('person-1', 'REFERRAL_RELATIONSHIP'),
          growthItem('person-2'),
        ]);
      },
    },
    relationshipMemoryService: {
      async loadRelationshipBrief(reference) {
        briefCalls.push(reference);
        return brief(reference);
      },
    },
  });

  const result = await service.loadRelationshipCapital({
    personReferences: ['person-3'],
    briefLimit: 3,
  });

  assert.equal(growthCalls.length, 1);
  assert.deepEqual(briefCalls, ['person-3', 'person-1', 'person-2']);
  assert.equal(result.sourceState.relationshipGrowth, 'CONNECTED');
  assert.equal(result.sourceState.relationshipMemory, 'CONNECTED');
  assert.equal(result.projectionAuthority, 'CARTERA090_RELATIONSHIP_CAPITAL_READ_MODEL');
  assert.equal(result.boundaries.sharedGraphTruthMutated, false);
});

test('090C reports partial memory availability instead of inventing missing graph context', async () => {
  const service = createCartera090RelationshipCapitalService({
    growthService: {
      async loadGrowthReviews() {
        return growthProjection([growthItem('person-1'), growthItem('person-2')]);
      },
    },
    relationshipMemoryService: {
      async loadRelationshipBrief(reference) {
        if (reference === 'person-2') throw new Error('not connected');
        return brief(reference);
      },
    },
  });

  const result = await service.loadRelationshipCapital();
  assert.equal(result.sourceState.relationshipMemory, 'PARTIAL');
  assert.deepEqual(result.unavailablePersonReferences, ['person-2']);
  assert.equal(result.loadedBriefCount, 1);
});

test('090C fails honestly when the primary growth authority is unavailable', async () => {
  const service = createCartera090RelationshipCapitalService({
    growthService: {
      async loadGrowthReviews() {
        throw new Error('offline');
      },
    },
    relationshipMemoryService: {
      async loadRelationshipBrief() {
        return brief('person-1');
      },
    },
  });

  await assert.rejects(
    () => service.loadRelationshipCapital(),
    /CARTERA090_GROWTH_SOURCE_FAILED/
  );
});

test('090C enforces a bounded number of relationship brief reads', async () => {
  const service = createCartera090RelationshipCapitalService({
    growthService: {
      async loadGrowthReviews() {
        return growthProjection(Array.from({ length: 30 }, (_, index) => growthItem(`person-${index + 1}`)));
      },
    },
    relationshipMemoryService: {
      async loadRelationshipBrief(reference) {
        return brief(reference);
      },
    },
  });

  const result = await service.loadRelationshipCapital({ briefLimit: 5 });
  assert.equal(result.requestedPersonCount, 5);
  assert.equal(result.loadedBriefCount, 5);
});
