import assert from 'node:assert/strict';

import {
  NEW_PROFESSIONAL_PARTICIPANT_TYPE,
  NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE,
  NEW_PROFESSIONAL_RULE_PACK_ID,
  NEW_PROFESSIONAL_SOURCE_DOCUMENT,
  REQUIRED_GLOBAL_EXCLUSION_KEYS,
  REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS,
  validateNewProfessionalRulePack,
} from '../compensation/new-professional/new-professional-rule-pack-validator.js';

const SOURCE_EVIDENCE = 'CC 2026 Asesores Nuevos Profesionales.pdf';

function createConcept(conceptKey, overrides = {}) {
  return {
    displayName: conceptKey,
    category: conceptKey.includes('gmmi') ? 'gmmi' : 'life',
    cadence: 'skeleton',
    payoutTruth: false,
    payoutTruthRule: NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE,
    sourceEvidence: [SOURCE_EVIDENCE],
    modelStatus: 'skeleton_not_calculated',
    ...overrides,
  };
}

function createConcepts(overridesByConcept = {}) {
  return Object.fromEntries(REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS.map((conceptKey) => [
    conceptKey,
    createConcept(conceptKey, overridesByConcept[conceptKey] || {}),
  ]));
}

function createGlobalExclusions(overrides = {}) {
  return {
    ...Object.fromEntries(REQUIRED_GLOBAL_EXCLUSION_KEYS.map((key) => [key, true])),
    ...overrides,
  };
}

function createRulePack(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    rulePackId: NEW_PROFESSIONAL_RULE_PACK_ID,
    sourceDocument: NEW_PROFESSIONAL_SOURCE_DOCUMENT,
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    currency: 'MXN',
    participantType: NEW_PROFESSIONAL_PARTICIPANT_TYPE,
    payoutTruth: false,
    payoutTruthRule: NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE,
    sourceEvidence: [SOURCE_EVIDENCE],
    globalExclusions: createGlobalExclusions(),
    concepts: createConcepts(),
    ...overrides,
  };
}

function testValidRulePackPasses() {
  const result = validateNewProfessionalRulePack(createRulePack());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);

  console.log('PASS valid New Professional skeleton rule pack passes');
}

function testMissingIdentityFieldsFails() {
  const rulePack = createRulePack();
  delete rulePack.rulePackId;
  delete rulePack.sourceDocument;
  delete rulePack.effectiveFrom;
  delete rulePack.effectiveTo;
  delete rulePack.currency;
  delete rulePack.participantType;

  const result = validateNewProfessionalRulePack(rulePack);

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'invalid_rule_pack_id'));
  assert(result.errors.some((error) => error.code === 'invalid_source_document'));
  assert(result.errors.some((error) => error.code === 'missing_or_invalid_effective_from'));
  assert(result.errors.some((error) => error.code === 'missing_or_invalid_effective_to'));
  assert(result.errors.some((error) => error.code === 'invalid_currency'));
  assert(result.errors.some((error) => error.code === 'invalid_participant_type'));

  console.log('PASS validator rejects missing identity fields');
}

function testRejectsPartnerAndAdvisorDevelopmentRulePackIds() {
  for (const rulePackId of ['smnyl-partner-compensation-2026', 'smnyl-advisor-development-2026']) {
    const result = validateNewProfessionalRulePack(createRulePack({ rulePackId }));

    assert.equal(result.valid, false);
    assert(result.errors.some((error) => error.code === 'wrong_compensation_domain_rule_pack_id'));
    assert(result.errors.some((error) => error.code === 'invalid_rule_pack_id'));
  }

  console.log('PASS validator rejects partner/advisor-development rulePackIds');
}

function testRequiresPayoutTruthFalse() {
  const result = validateNewProfessionalRulePack(createRulePack({
    payoutTruth: true,
  }));

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'invalid_payout_truth'));

  console.log('PASS validator requires payoutTruth false');
}

function testRequiresParticipantType() {
  const result = validateNewProfessionalRulePack(createRulePack({
    participantType: 'partner',
  }));

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'invalid_participant_type'));

  console.log('PASS validator validates participantType');
}

function testRequiresAllTenConcepts() {
  const concepts = createConcepts();
  delete concepts['death-benefit'];

  const result = validateNewProfessionalRulePack(createRulePack({ concepts }));

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'missing_required_concept'));

  console.log('PASS validator requires all 10 concepts');
}

function testRejectsUnexpectedConcepts() {
  const concepts = createConcepts();
  concepts['unexpected-bonus'] = createConcept('unexpected-bonus');

  const result = validateNewProfessionalRulePack(createRulePack({ concepts }));

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'unexpected_concept'));

  console.log('PASS validator rejects unexpected concepts');
}

function testRequiresConceptLevelPayoutTruthFalse() {
  const result = validateNewProfessionalRulePack(createRulePack({
    concepts: createConcepts({
      'life-initial-bonus': {
        payoutTruth: true,
      },
    }),
  }));

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'invalid_concept_payout_truth'));

  console.log('PASS validator requires concept-level payoutTruth false');
}

function testRequiresConceptLevelSourceEvidence() {
  const result = validateNewProfessionalRulePack(createRulePack({
    concepts: createConcepts({
      'life-initial-bonus': {
        sourceEvidence: [],
      },
    }),
  }));

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'missing_concept_source_evidence'));

  console.log('PASS validator requires concept-level sourceEvidence');
}

function testRequiresGlobalExclusions() {
  const result = validateNewProfessionalRulePack(createRulePack({
    globalExclusions: createGlobalExclusions({
      aveExcluded: false,
    }),
  }));

  assert.equal(result.valid, false);
  assert(result.errors.some((error) => error.code === 'missing_global_exclusion'));

  console.log('PASS validator requires global exclusions');
}

function testValidatorDoesNotMutateInput() {
  const rulePack = createRulePack();
  const before = JSON.stringify(rulePack);

  validateNewProfessionalRulePack(rulePack);

  assert.equal(JSON.stringify(rulePack), before);

  console.log('PASS validator does not mutate input');
}

testValidRulePackPasses();
testMissingIdentityFieldsFails();
testRejectsPartnerAndAdvisorDevelopmentRulePackIds();
testRequiresPayoutTruthFalse();
testRequiresParticipantType();
testRequiresAllTenConcepts();
testRejectsUnexpectedConcepts();
testRequiresConceptLevelPayoutTruthFalse();
testRequiresConceptLevelSourceEvidence();
testRequiresGlobalExclusions();
testValidatorDoesNotMutateInput();

console.log('PASS new-professional-rule-pack-validator-test');
