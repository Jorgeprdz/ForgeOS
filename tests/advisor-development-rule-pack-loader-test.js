import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import {
  AdvisorDevelopmentRulePackLoadError,
  loadAdvisorDevelopmentRulePack,
} from '../compensation/advisor-development/advisor-development-rule-pack-loader.js';

import {
  EXPECTED_RULE_PACK_ID,
  EXPECTED_SOURCE_EVIDENCE_REF,
} from '../compensation/advisor-development/advisor-development-rule-pack-validator.js';

function createRuntimeDir() {
  mkdirSync('.forge-backups', { recursive: true });

  return mkdtempSync(join(process.cwd(), '.forge-backups/advisor-development-loader-test-'));
}

function createValidDraft() {
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
  };
}

function testLoaderLoadsValidDraftFromFile() {
  const dir = createRuntimeDir();

  try {
    const filePath = join(dir, 'valid-advisor-development-rule-pack.json');
    const draft = createValidDraft();

    writeFileSync(filePath, JSON.stringify(draft, null, 2));

    const result = loadAdvisorDevelopmentRulePack({ filePath });

    assert.equal(result.isValid, true);
    assert.equal(result.rulePack.rulePackId, EXPECTED_RULE_PACK_ID);
    assert.equal(result.filePath, filePath);
    assert.equal(result.validationErrors.length, 0);
    assert(result.validationWarnings.some((warning) => warning.code === 'qualification_rules_allowed_missing_in_draft'));

    console.log('PASS loader loads valid advisor development draft');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function testLoaderMissingFileThrowsClearError() {
  assert.throws(
    () => loadAdvisorDevelopmentRulePack({ filePath: 'missing/advisor-development-rule-pack.json' }),
    (error) => {
      assert(error instanceof AdvisorDevelopmentRulePackLoadError);
      assert.equal(error.code, 'ADVISOR_DEVELOPMENT_RULE_PACK_NOT_FOUND');
      return true;
    },
  );

  console.log('PASS loader missing file throws clear error');
}

function testLoaderInvalidJsonThrowsClearError() {
  const dir = createRuntimeDir();

  try {
    const filePath = join(dir, 'invalid-json.rule-pack.json');

    writeFileSync(filePath, '{ invalid json');

    assert.throws(
      () => loadAdvisorDevelopmentRulePack({ filePath }),
      (error) => {
        assert(error instanceof AdvisorDevelopmentRulePackLoadError);
        assert.equal(error.code, 'ADVISOR_DEVELOPMENT_RULE_PACK_INVALID_JSON');
        return true;
      },
    );

    console.log('PASS loader invalid JSON throws clear error');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function testLoaderReturnsValidationFailureWithoutPatchingJson() {
  const dir = createRuntimeDir();

  try {
    const filePath = join(dir, 'invalid-advisor-development-rule-pack.json');
    const draft = createValidDraft();

    draft.rulePackId = 'smnyl_partner_compensation_2026';
    draft.metadata.rulePackId = 'smnyl_partner_compensation_2026';

    const before = JSON.stringify(draft);

    writeFileSync(filePath, JSON.stringify(draft, null, 2));

    const result = loadAdvisorDevelopmentRulePack({ filePath });

    assert.equal(result.isValid, false);
    assert(result.validationErrors.some((error) => error.code === 'invalid_rule_pack_id'));
    assert.equal(JSON.stringify(result.rulePack), before);

    console.log('PASS loader returns validation failure without patching JSON');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

testLoaderLoadsValidDraftFromFile();
testLoaderMissingFileThrowsClearError();
testLoaderInvalidJsonThrowsClearError();
testLoaderReturnsValidationFailureWithoutPatchingJson();

console.log('PASS advisor-development-rule-pack-loader-test');
