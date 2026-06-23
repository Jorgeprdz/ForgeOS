import assert from 'node:assert/strict';

import {
  EXPECTED_RULE_PACK_ID,
  EXPECTED_SOURCE_EVIDENCE_REF,
  validateAdvisorDevelopmentRulePack,
} from '../compensation/advisor-development/advisor-development-rule-pack-validator.js';

function createValidDraft(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    rulePackId: EXPECTED_RULE_PACK_ID,
    metadata: {
      rulePackId: EXPECTED_RULE_PACK_ID,
      rulePackVersion: '1.0.0-draft',
      rulePackHash: 'draft:not-sealed',
      rulePackEffectiveDate: '2026-01-01',
      governanceStatus: 'draft',
      sourceEvidenceRefs: [EXPECTED_SOURCE_EVIDENCE_REF],
    },
    source: {
      sourceEvidenceRefs: [EXPECTED_SOURCE_EVIDENCE_REF],
    },
    globalRules: {
      payoutTruth: false,
    },
    countingAndWeightingRules: {
      excludedProducts: ['tempo_vida_1', 'star_temporal_1'],
      excludedComponents: ['ave', 'avecp', 'cvd'],
      vidaIndividual: {
        commissionFactor: 0.9,
      },
      gmmi: {
        commissionFactor: 1,
        ageExclusion: {
          minAgeExcluded: 60,
        },
      },
    },
    ...overrides,
  };
}

function testValidDraftPassesWithWarningsForIncrementalNodes() {
  const result = validateAdvisorDevelopmentRulePack(createValidDraft());

  assert.equal(result.isValid, true);
  assert.equal(result.validationErrors.length, 0);
  assert(result.validationWarnings.some((warning) => warning.code === 'qualification_rules_allowed_missing_in_draft'));
  assert(result.validationWarnings.some((warning) => warning.code === 'concepts_allowed_missing_in_draft'));

  console.log('PASS valid advisor development draft shell passes with draft warnings');
}

function testMissingIdentityFails() {
  const draft = createValidDraft({
    metadata: {
      rulePackId: EXPECTED_RULE_PACK_ID,
      rulePackEffectiveDate: '2026-01-01',
      governanceStatus: 'draft',
      sourceEvidenceRefs: [EXPECTED_SOURCE_EVIDENCE_REF],
    },
  });

  const result = validateAdvisorDevelopmentRulePack(draft);

  assert.equal(result.isValid, false);
  assert(result.validationErrors.some((error) => error.code === 'missing_rule_pack_version'));
  assert(result.validationErrors.some((error) => error.code === 'missing_rule_pack_hash'));

  console.log('PASS missing identity fields fail validation');
}

function testInvalidRulePackIdFails() {
  const draft = createValidDraft({
    metadata: {
      rulePackId: 'smnyl_partner_compensation_2026',
      rulePackVersion: '1.0.0-draft',
      rulePackHash: 'draft:not-sealed',
      rulePackEffectiveDate: '2026-01-01',
      governanceStatus: 'draft',
      sourceEvidenceRefs: [EXPECTED_SOURCE_EVIDENCE_REF],
    },
    rulePackId: 'smnyl_partner_compensation_2026',
  });

  const result = validateAdvisorDevelopmentRulePack(draft);

  assert.equal(result.isValid, false);
  assert(result.validationErrors.some((error) => error.code === 'invalid_rule_pack_id'));

  console.log('PASS partner rulePackId is rejected');
}

function testMissingCountingAndWeightingRulesFails() {
  const draft = createValidDraft({
    countingAndWeightingRules: undefined,
  });

  delete draft.countingAndWeightingRules;

  const result = validateAdvisorDevelopmentRulePack(draft);

  assert.equal(result.isValid, false);
  assert(result.validationErrors.some((error) => error.code === 'missing_counting_and_weighting_rules'));

  console.log('PASS missing countingAndWeightingRules fails validation');
}

function testInvalidPayoutTruthFails() {
  const draft = createValidDraft({
    globalRules: {
      payoutTruth: true,
    },
  });

  const result = validateAdvisorDevelopmentRulePack(draft);

  assert.equal(result.isValid, false);
  assert(result.validationErrors.some((error) => error.code === 'invalid_payout_truth_default'));

  console.log('PASS payoutTruth must be explicitly false');
}

function testMissingOfficialSourceFails() {
  const draft = createValidDraft({
    metadata: {
      rulePackId: EXPECTED_RULE_PACK_ID,
      rulePackVersion: '1.0.0-draft',
      rulePackHash: 'draft:not-sealed',
      rulePackEffectiveDate: '2026-01-01',
      governanceStatus: 'draft',
      sourceEvidenceRefs: ['PCV 2026 Partners.pdf'],
    },
    source: {
      sourceEvidenceRefs: ['PCV 2026 Partners.pdf'],
    },
  });

  const result = validateAdvisorDevelopmentRulePack(draft);

  assert.equal(result.isValid, false);
  assert(result.validationErrors.some((error) => error.code === 'missing_official_source_evidence_ref'));

  console.log('PASS official advisor development source evidence is required');
}

function testValidatorDoesNotMutateInput() {
  const draft = createValidDraft();
  const before = JSON.stringify(draft);

  validateAdvisorDevelopmentRulePack(draft);

  assert.equal(JSON.stringify(draft), before);

  console.log('PASS validator does not mutate input');
}

testValidDraftPassesWithWarningsForIncrementalNodes();
testMissingIdentityFails();
testInvalidRulePackIdFails();
testMissingCountingAndWeightingRulesFails();
testInvalidPayoutTruthFails();
testMissingOfficialSourceFails();
testValidatorDoesNotMutateInput();

console.log('PASS advisor-development-rule-pack-validator-test');
