import assert from 'node:assert/strict';

import {
  ATTRIBUTION_EVIDENCE_STATUS,
  RELATIONSHIP_ATTRIBUTION_STATUS,
  RELATIONSHIP_TYPE,
  evaluateAdvisorRelationshipAttribution,
  evaluateConnectionAttribution,
  evaluateDevelopmentAttribution,
} from '../compensation/advisor-development/advisor-relationship-attribution-evaluator.js';

function createConnectionFacts(overrides = {}) {
  return {
    connectorId: 'connector-001',
    connectedAdvisorId: 'connected-001',
    connectionDate: '2026-02-15',
    connectorActiveAtMonthClose: true,
    connectedAdvisorActiveAtMonthClose: true,
    onboardingEvidence: true,
    attributionEvidenceStatus: ATTRIBUTION_EVIDENCE_STATUS.CONFIRMED_BY_OFFICIAL_RECORD,
    ...overrides,
  };
}

function createDevelopmentFacts(overrides = {}) {
  return {
    developerId: 'developer-001',
    developedAdvisorId: 'developed-001',
    developmentStartDate: '2026-02-15',
    developerEligibilityEvidence: true,
    developerActiveAtMonthClose: true,
    developedAdvisorActiveAtMonthClose: true,
    developerShare: 1,
    attributionEvidenceStatus: ATTRIBUTION_EVIDENCE_STATUS.CONFIRMED_BY_OFFICIAL_RECORD,
    ...overrides,
  };
}

function testMissingConnectorIdReturnsBlocked() {
  const facts = createConnectionFacts();
  delete facts.connectorId;

  const result = evaluateConnectionAttribution(facts);

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED);
  assert.equal(result.reason, 'missing_connectorId');
  assert.equal(result.payoutTruth, false);

  console.log('PASS missing connector ID returns blocked');
}

function testMissingOnboardingEvidenceReturnsPending() {
  const facts = createConnectionFacts();
  delete facts.onboardingEvidence;

  const result = evaluateConnectionAttribution(facts);

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.PENDING);
  assert.equal(result.reason, 'pending_onboarding_evidence');
  assert.deepEqual(result.requiredEvidence, ['onboardingEvidence']);
  assert.equal(result.payoutTruth, false);

  console.log('PASS missing onboardingEvidence returns pending');
}

function testInactiveConnectedAdvisorAtMonthCloseReturnsBlocked() {
  const result = evaluateConnectionAttribution(createConnectionFacts({
    connectedAdvisorActiveAtMonthClose: false,
  }));

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED);
  assert.equal(result.reason, 'connectedAdvisorActiveAtMonthClose_not_confirmed');

  console.log('PASS inactive connected advisor at month close returns blocked');
}

function testCompleteConnectionInputReturnsConfirmed() {
  const result = evaluateConnectionAttribution(createConnectionFacts());

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED);
  assert.equal(result.reason, null);
  assert.equal(result.attribution.connectorId, 'connector-001');
  assert.equal(result.attribution.connectedAdvisorId, 'connected-001');
  assert.equal(result.attribution.confirmed, true);
  assert.equal(result.payoutTruth, false);
  assert.deepEqual(result.evidenceRequirements, ['commission_statement_required']);
  assert(result.warnings.some((warning) => warning.code === 'relationship_attribution_is_not_payout_truth'));

  console.log('PASS complete connection input returns confirmed and payoutTruth false');
}

function testUnofficialConnectionEntryReturnsPending() {
  const result = evaluateConnectionAttribution(createConnectionFacts({
    attributionEvidenceStatus: ATTRIBUTION_EVIDENCE_STATUS.UNOFFICIAL_SYSTEM_ENTRY,
  }));

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.PENDING);
  assert.equal(result.reason, ATTRIBUTION_EVIDENCE_STATUS.UNOFFICIAL_SYSTEM_ENTRY);

  console.log('PASS unofficial connection entry returns pending');
}

function testInvalidConnectionDateReturnsUnknown() {
  const result = evaluateConnectionAttribution(createConnectionFacts({
    connectionDate: 'not-a-date',
  }));

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN);
  assert.equal(result.reason, 'invalid_connectionDate');

  console.log('PASS invalid connection date returns unknown');
}

function testHalfDevelopmentShareReturnsConfirmed() {
  const result = evaluateDevelopmentAttribution(createDevelopmentFacts({
    developerShare: 0.5,
  }));

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED);
  assert.equal(result.share.developerShare, 0.5);
  assert.equal(result.payoutTruth, false);

  console.log('PASS 50/50 development share returns confirmed with 0.5 factor');
}

function testMissingDeveloperShareReturnsBlocked() {
  const facts = createDevelopmentFacts();
  delete facts.developerShare;

  const result = evaluateDevelopmentAttribution(facts);

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED);
  assert.equal(result.reason, 'missing_developerShare');

  console.log('PASS missing developerShare returns blocked');
}

function testNonNumericDeveloperShareReturnsUnknown() {
  const result = evaluateDevelopmentAttribution(createDevelopmentFacts({
    developerShare: '0.5',
  }));

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN);
  assert.equal(result.reason, 'invalid_developerShare');

  console.log('PASS non-numeric developerShare returns unknown');
}

function testUnsupportedDeveloperShareReturnsNotModeled() {
  const result = evaluateDevelopmentAttribution(createDevelopmentFacts({
    developerShare: 0.333333,
  }));

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'unsupported_developerShare');

  console.log('PASS unsupported developerShare returns not_modeled');
}

function testMissingDeveloperEligibilityEvidenceReturnsPending() {
  const facts = createDevelopmentFacts();
  delete facts.developerEligibilityEvidence;

  const result = evaluateDevelopmentAttribution(facts);

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.PENDING);
  assert.equal(result.reason, 'pending_developer_eligibility_evidence');

  console.log('PASS missing developerEligibilityEvidence returns pending');
}

function testInactiveDevelopedAdvisorReturnsBlocked() {
  const result = evaluateDevelopmentAttribution(createDevelopmentFacts({
    developedAdvisorActiveAtMonthClose: false,
  }));

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED);
  assert.equal(result.reason, 'developedAdvisorActiveAtMonthClose_not_confirmed');

  console.log('PASS inactive developed advisor returns blocked');
}

function testCompleteDevelopmentInputReturnsConfirmed() {
  const result = evaluateDevelopmentAttribution(createDevelopmentFacts());

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED);
  assert.equal(result.reason, null);
  assert.equal(result.attribution.developerId, 'developer-001');
  assert.equal(result.attribution.developedAdvisorId, 'developed-001');
  assert.equal(result.share.developerShare, 1);
  assert.equal(result.payoutTruth, false);
  assert(result.warnings.some((warning) => warning.code === 'relationship_attribution_is_not_payout_truth'));

  console.log('PASS complete development input returns confirmed and payoutTruth false');
}

function testGenericDispatcherRoutesConnection() {
  const result = evaluateAdvisorRelationshipAttribution({
    relationshipType: RELATIONSHIP_TYPE.CONNECTION,
    facts: createConnectionFacts(),
  });

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED);
  assert.equal(result.relationshipType, RELATIONSHIP_TYPE.CONNECTION);

  console.log('PASS generic dispatcher routes connection facts');
}

function testGenericDispatcherRoutesDevelopment() {
  const result = evaluateAdvisorRelationshipAttribution({
    relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
    facts: createDevelopmentFacts({
      developerShare: 0.5,
    }),
  });

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED);
  assert.equal(result.relationshipType, RELATIONSHIP_TYPE.DEVELOPMENT);
  assert.equal(result.share.developerShare, 0.5);

  console.log('PASS generic dispatcher routes development facts');
}

function testUnknownRelationshipTypeReturnsNotModeled() {
  const result = evaluateAdvisorRelationshipAttribution({
    relationshipType: 'unknown-bonus',
  });

  assert.equal(result.status, RELATIONSHIP_ATTRIBUTION_STATUS.NOT_MODELED);
  assert.equal(result.reason, 'relationship_type_not_modeled');

  console.log('PASS unknown relationship type returns not_modeled');
}

testMissingConnectorIdReturnsBlocked();
testMissingOnboardingEvidenceReturnsPending();
testInactiveConnectedAdvisorAtMonthCloseReturnsBlocked();
testCompleteConnectionInputReturnsConfirmed();
testUnofficialConnectionEntryReturnsPending();
testInvalidConnectionDateReturnsUnknown();
testHalfDevelopmentShareReturnsConfirmed();
testMissingDeveloperShareReturnsBlocked();
testNonNumericDeveloperShareReturnsUnknown();
testUnsupportedDeveloperShareReturnsNotModeled();
testMissingDeveloperEligibilityEvidenceReturnsPending();
testInactiveDevelopedAdvisorReturnsBlocked();
testCompleteDevelopmentInputReturnsConfirmed();
testGenericDispatcherRoutesConnection();
testGenericDispatcherRoutesDevelopment();
testUnknownRelationshipTypeReturnsNotModeled();

console.log('PASS advisor-relationship-attribution-evaluator-test');


const forge005B1Assert = (await import('node:assert/strict')).default;
const {
  evaluateManagerPrecontractRdaAttribution: forge005B1EvaluateManagerPrecontractRdaAttribution,
} = await import('../compensation/advisor-development/advisor-relationship-attribution-evaluator.js');

{
  const connectionResult = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'connection',
    connectionOwnerId: 'Pamela',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B1Assert.equal(connectionResult.status, 'confirmed');
  forge005B1Assert.equal(connectionResult.relationshipType, 'connection');
  forge005B1Assert.equal(connectionResult.ownerId, 'Pamela');
  forge005B1Assert.equal(connectionResult.advisorId, 'Fer');
  forge005B1Assert.equal(connectionResult.source, 'manager_os');
  forge005B1Assert.equal(connectionResult.payoutTruth, false);
  console.log('PASS manager precontract RDA connection attribution comes from Manager OS');

  const developmentResult = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerId: 'Juan',
    developerShare: 0.5,
    managerPrecontractAttributionEvidence: true,
  });

  forge005B1Assert.equal(developmentResult.status, 'confirmed');
  forge005B1Assert.equal(developmentResult.relationshipType, 'development');
  forge005B1Assert.equal(developmentResult.ownerId, 'Juan');
  forge005B1Assert.equal(developmentResult.advisorId, 'Fer');
  forge005B1Assert.equal(developmentResult.developerShare, 0.5);
  forge005B1Assert.equal(developmentResult.source, 'manager_os');
  forge005B1Assert.equal(developmentResult.payoutTruth, false);
  console.log('PASS manager precontract RDA development attribution supports shared development');

  const missingManagerEvidence = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'connection',
    connectionOwnerId: 'Pamela',
  });

  forge005B1Assert.equal(missingManagerEvidence.status, 'blocked');
  forge005B1Assert.equal(
    missingManagerEvidence.reason,
    'blocked_by_missing_manager_precontract_attribution',
  );
  forge005B1Assert.deepEqual(
    missingManagerEvidence.requiredEvidence,
    ['manager_precontract_attribution_evidence'],
  );
  forge005B1Assert.equal(missingManagerEvidence.payoutTruth, false);
  console.log('PASS missing Manager OS attribution blocks RDA attribution');

  const advisorSelfAssignment = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerId: 'Juan',
    developerShare: 1.0,
    source: 'advisor_os',
    managerPrecontractAttributionEvidence: false,
  });

  forge005B1Assert.equal(advisorSelfAssignment.status, 'blocked');
  forge005B1Assert.equal(
    advisorSelfAssignment.reason,
    'blocked_by_missing_manager_precontract_attribution',
  );
  forge005B1Assert.equal(advisorSelfAssignment.payoutTruth, false);
  console.log('PASS Advisor OS self-assignment does not confirm RDA attribution');

  const missingShare = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerId: 'Juan',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B1Assert.equal(missingShare.status, 'blocked');
  forge005B1Assert.equal(missingShare.reason, 'blocked_by_missing_developer_share');
  forge005B1Assert.deepEqual(missingShare.requiredEvidence, ['developer_share']);
  forge005B1Assert.equal(missingShare.payoutTruth, false);
  console.log('PASS missing developerShare blocks development attribution');

  const invalidShare = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerId: 'Juan',
    developerShare: '0.5',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B1Assert.equal(invalidShare.status, 'unknown');
  forge005B1Assert.equal(invalidShare.reason, 'invalid_developer_share');
  forge005B1Assert.equal(invalidShare.payoutTruth, false);
  console.log('PASS non-numeric developerShare returns unknown');

  const unsupportedShare = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerId: 'Juan',
    developerShare: 0.25,
    managerPrecontractAttributionEvidence: true,
  });

  forge005B1Assert.equal(unsupportedShare.status, 'not_modeled');
  forge005B1Assert.equal(unsupportedShare.reason, 'unsupported_developer_share');
  forge005B1Assert.equal(unsupportedShare.payoutTruth, false);
  console.log('PASS unsupported developerShare returns not_modeled');

  const unknownRelationship = forge005B1EvaluateManagerPrecontractRdaAttribution({
    advisorId: 'Fer',
    relationshipType: 'mentorship',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B1Assert.equal(unknownRelationship.status, 'not_modeled');
  forge005B1Assert.equal(unknownRelationship.reason, 'unknown_relationship_type');
  forge005B1Assert.equal(unknownRelationship.payoutTruth, false);
  console.log('PASS unknown relationship type returns not_modeled');
}


const forge005B2Assert = (await import('node:assert/strict')).default;
const {
  evaluateManagerPrecontractRelationshipAttribution: forge005B2EvaluateManagerPrecontractRelationshipAttribution,
} = await import('../compensation/advisor-development/advisor-relationship-attribution-evaluator.js');

{
  const directPartnerConnection = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Roberto',
    relationshipType: 'connection',
    connectionOwnerType: 'partner',
    connectionOwnerId: 'Juan',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(directPartnerConnection.status, 'confirmed');
  forge005B2Assert.equal(directPartnerConnection.ownerType, 'partner');
  forge005B2Assert.equal(directPartnerConnection.ownerId, 'Juan');
  forge005B2Assert.equal(directPartnerConnection.connectionOwnerType, 'partner');
  forge005B2Assert.equal(directPartnerConnection.connectionOwnerId, 'Juan');
  forge005B2Assert.equal(directPartnerConnection.rdaStatus, 'not_applicable');
  forge005B2Assert.equal(directPartnerConnection.rdaOwnerId, null);
  forge005B2Assert.equal(directPartnerConnection.payoutTruth, false);
  console.log('PASS partner direct precontract connection does not create RDA');

  const advisorRdaConnection = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Fer',
    relationshipType: 'connection',
    connectionOwnerType: 'advisor',
    connectionOwnerId: 'Pamela',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(advisorRdaConnection.status, 'confirmed');
  forge005B2Assert.equal(advisorRdaConnection.ownerType, 'advisor');
  forge005B2Assert.equal(advisorRdaConnection.ownerId, 'Pamela');
  forge005B2Assert.equal(advisorRdaConnection.rdaStatus, 'confirmed');
  forge005B2Assert.equal(advisorRdaConnection.rdaOwnerId, 'Pamela');
  forge005B2Assert.equal(advisorRdaConnection.payoutTruth, false);
  console.log('PASS advisor precontract connection creates RDA attribution');

  const sharedPartnerDevelopment = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerType: 'partner',
    developmentOwnerId: 'Juan',
    developerShare: 0.5,
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(sharedPartnerDevelopment.status, 'confirmed');
  forge005B2Assert.equal(sharedPartnerDevelopment.ownerType, 'partner');
  forge005B2Assert.equal(sharedPartnerDevelopment.ownerId, 'Juan');
  forge005B2Assert.equal(sharedPartnerDevelopment.developmentOwnerType, 'partner');
  forge005B2Assert.equal(sharedPartnerDevelopment.developmentOwnerId, 'Juan');
  forge005B2Assert.equal(sharedPartnerDevelopment.developerShare, 0.5);
  forge005B2Assert.equal(sharedPartnerDevelopment.payoutTruth, false);
  console.log('PASS partner shared development attribution is supported');

  const fullPartnerDevelopment = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Roberto',
    relationshipType: 'development',
    developmentOwnerType: 'partner',
    developmentOwnerId: 'Juan',
    developerShare: 1.0,
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(fullPartnerDevelopment.status, 'confirmed');
  forge005B2Assert.equal(fullPartnerDevelopment.ownerType, 'partner');
  forge005B2Assert.equal(fullPartnerDevelopment.ownerId, 'Juan');
  forge005B2Assert.equal(fullPartnerDevelopment.developerShare, 1.0);
  forge005B2Assert.equal(fullPartnerDevelopment.payoutTruth, false);
  console.log('PASS partner full development attribution is supported');

  const missingConnectionOwnerType = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Roberto',
    relationshipType: 'connection',
    connectionOwnerId: 'Juan',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(missingConnectionOwnerType.status, 'blocked');
  forge005B2Assert.equal(
    missingConnectionOwnerType.reason,
    'blocked_by_missing_connection_owner_type',
  );
  forge005B2Assert.equal(missingConnectionOwnerType.payoutTruth, false);
  console.log('PASS missing connectionOwnerType blocks connection attribution');

  const unsupportedConnectionOwnerType = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Roberto',
    relationshipType: 'connection',
    connectionOwnerType: 'investor',
    connectionOwnerId: 'External',
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(unsupportedConnectionOwnerType.status, 'not_modeled');
  forge005B2Assert.equal(
    unsupportedConnectionOwnerType.reason,
    'unsupported_connection_owner_type',
  );
  forge005B2Assert.equal(unsupportedConnectionOwnerType.payoutTruth, false);
  console.log('PASS unsupported connectionOwnerType returns not_modeled');

  const missingDevelopmentOwnerId = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerType: 'partner',
    developerShare: 0.5,
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(missingDevelopmentOwnerId.status, 'blocked');
  forge005B2Assert.equal(
    missingDevelopmentOwnerId.reason,
    'blocked_by_missing_development_owner_id',
  );
  forge005B2Assert.equal(missingDevelopmentOwnerId.payoutTruth, false);
  console.log('PASS missing developmentOwnerId blocks development attribution');

  const unsupportedDevelopmentOwnerType = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Fer',
    relationshipType: 'development',
    developmentOwnerType: 'investor',
    developmentOwnerId: 'External',
    developerShare: 0.5,
    managerPrecontractAttributionEvidence: true,
  });

  forge005B2Assert.equal(unsupportedDevelopmentOwnerType.status, 'not_modeled');
  forge005B2Assert.equal(
    unsupportedDevelopmentOwnerType.reason,
    'unsupported_development_owner_type',
  );
  forge005B2Assert.equal(unsupportedDevelopmentOwnerType.payoutTruth, false);
  console.log('PASS unsupported developmentOwnerType returns not_modeled');

  const advisorOsSelfAssignment = forge005B2EvaluateManagerPrecontractRelationshipAttribution({
    advisorId: 'Fer',
    relationshipType: 'connection',
    connectionOwnerType: 'advisor',
    connectionOwnerId: 'Fer',
    source: 'advisor_os',
    managerPrecontractAttributionEvidence: false,
  });

  forge005B2Assert.equal(advisorOsSelfAssignment.status, 'blocked');
  forge005B2Assert.equal(
    advisorOsSelfAssignment.reason,
    'blocked_by_missing_manager_precontract_attribution',
  );
  forge005B2Assert.equal(advisorOsSelfAssignment.payoutTruth, false);
  console.log('PASS Advisor OS self-assignment remains blocked without Manager OS evidence');
}
