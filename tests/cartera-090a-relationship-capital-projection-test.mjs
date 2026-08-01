import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCartera090RelationshipCapitalProjection,
} from '../platform/relationship-intelligence/cartera-090a-relationship-capital-projection.js';

function growth(items = []) {
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

function brief(overrides = {}) {
  return {
    person: {
      personReference: 'person-1',
      displayName: 'María Pérez',
      preferredName: 'María',
      lifecycleState: 'CLIENT',
      privacyClassification: 'PRIVATE',
    },
    summary: { lastInteractionAt: '2026-07-20T12:00:00.000Z' },
    network: {
      accounts: [
        {
          accountReference: 'household-1',
          displayLabel: 'Familia Pérez',
          accountType: 'HOUSEHOLD',
          relationshipRole: 'FAMILY_MEMBER',
          confirmationState: 'CONFIRMED',
        },
        {
          accountReference: 'company-1',
          displayLabel: 'Estudio Pérez',
          accountType: 'COMPANY',
          relationshipRole: 'OWNER',
          confirmationState: 'CONFIRMED',
        },
      ],
      policies: [],
    },
    preferences: [],
    commitments: [],
    lifeContext: [],
    history: [],
    projectionAuthority: 'CARTERA040_RELATIONSHIP_MEMORY_READ_MODEL',
    readOnly: true,
    ...overrides,
  };
}

function growthItem(growthClass, overrides = {}) {
  return {
    candidateReference: `candidate-${growthClass}`,
    growthClass,
    personReference: 'person-1',
    displayName: 'María Pérez',
    whyThisPerson: 'La relación está activa y existe evidencia confirmada.',
    whyNow: 'Conviene revisar el contexto sin depender de una venta inmediata.',
    uncertainty: 'La evidencia no prueba influencia ni intención de compra.',
    smallestUsefulAction: 'Revisar la relación.',
    advisorMustConfirm: 'Confirmar vigencia y consentimiento específico.',
    evidence: [{
      reference: 'memory-1',
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
    ...overrides,
  };
}

test('090A projects confirmed household and company context without creating graph truth', () => {
  const projection = createCartera090RelationshipCapitalProjection({
    asOfDate: '2026-08-01',
    growthProjection: growth(),
    relationshipBriefs: [brief()],
  });
  assert.equal(projection.summary.confirmedEdgeCount, 2);
  assert.deepEqual(
    projection.edges.map(edge => edge.edgeType),
    ['COMPANY', 'FAMILY']
  );
  assert.equal(projection.boundaries.sharedGraphTruthMutated, false);
  assert.equal(projection.readOnly, true);
  assert.equal(projection.orderingBasis, 'CLASS_THEN_NAME_NOT_PRIORITY');
});

test('090A emits introduction and center-of-influence context only with confirmed willingness', () => {
  const projection = createCartera090RelationshipCapitalProjection({
    growthProjection: growth([
      growthItem('REFERRAL_RELATIONSHIP'),
      growthItem('CENTER_OF_INFLUENCE'),
    ]),
    relationshipBriefs: [brief()],
  });
  assert.equal(projection.summary.introductionContextCount, 1);
  assert.equal(projection.summary.centerOfInfluenceContextCount, 1);
  assert.equal(projection.summary.hypothesisCount, 2);
  assert.ok(projection.items.every(item => item.immediateSaleDue === false));
  assert.ok(projection.items.every(item => item.influenceClaimed === false));
  assert.ok(projection.items.every(item => item.finalPriorityTruth === false));
});

test('090A rejects opaque influence, relationship, revenue or probability scores', () => {
  assert.throws(
    () => createCartera090RelationshipCapitalProjection({
      growthProjection: {
        ...growth(),
        influenceScore: 99,
      },
      relationshipBriefs: [],
    }),
    /CARTERA090_OPAQUE_SCORE_OR_VALUE_EXPOSED/
  );
});

test('090A rejects referral or center context without client-confirmed willingness', () => {
  assert.throws(
    () => createCartera090RelationshipCapitalProjection({
      growthProjection: growth([
        growthItem('CENTER_OF_INFLUENCE', { clientWillingnessConfirmed: false }),
      ]),
      relationshipBriefs: [],
    }),
    /CARTERA090_CLIENT_WILLINGNESS_REQUIRED/
  );
});

test('090A ignores unconfirmed or unknown account relations rather than inventing context', () => {
  const projection = createCartera090RelationshipCapitalProjection({
    growthProjection: growth(),
    relationshipBriefs: [brief({
      network: {
        accounts: [
          {
            accountReference: 'unknown-1',
            displayLabel: 'Relación sin clasificar',
            accountType: 'UNKNOWN',
            relationshipRole: 'RELATIONSHIP',
            confirmationState: 'CONFIRMED',
          },
          {
            accountReference: 'household-2',
            displayLabel: 'Hogar pendiente',
            accountType: 'HOUSEHOLD',
            relationshipRole: 'FAMILY_MEMBER',
            confirmationState: 'PROPOSED',
          },
        ],
        policies: [],
      },
    })],
  });
  assert.equal(projection.edges.length, 0);
  assert.equal(projection.items.length, 0);
});
