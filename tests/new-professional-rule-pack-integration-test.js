import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  NEW_PROFESSIONAL_2026_RULE_PACK_PATH,
  loadNewProfessional2026RulePack,
} from '../compensation/new-professional/new-professional-rule-pack-loader.js';

import {
  REQUIRED_GLOBAL_EXCLUSION_KEYS,
  REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS,
} from '../compensation/new-professional/new-professional-rule-pack-validator.js';

function testPhysicalJsonIsValid() {
  const raw = readFileSync(NEW_PROFESSIONAL_2026_RULE_PACK_PATH, 'utf8');
  const parsed = JSON.parse(raw);

  assert.equal(parsed.rulePackId, 'smnyl-new-professional-2026');
  assert.equal(parsed.sourceDocument, 'CC 2026 Asesores Nuevos Profesionales');
  assert.equal(parsed.effectiveFrom, '2026-01-01');
  assert.equal(parsed.effectiveTo, '2026-12-31');
  assert.equal(parsed.currency, 'MXN');
  assert.equal(parsed.participantType, 'new_professional_advisor');
  assert.equal(parsed.payoutTruth, false);
  assert.equal(parsed.payoutTruthRule, 'commission_statement_required');

  console.log('PASS physical New Professional JSON is valid');
}

function testPhysicalRulePackLoadsAndValidates() {
  const result = loadNewProfessional2026RulePack();

  assert.equal(result.validation.valid, true);
  assert.deepEqual(result.validation.errors, []);
  assert.deepEqual(result.validation.warnings, []);
  assert.equal(result.rulePack.rulePackId, 'smnyl-new-professional-2026');

  console.log('PASS loader validates physical New Professional rule pack');
}

function testConceptShapeFromPhysicalRulePack() {
  const { rulePack } = loadNewProfessional2026RulePack();
  const conceptKeys = Object.keys(rulePack.concepts).sort();

  assert.deepEqual(conceptKeys, [...REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS].sort());

  for (const conceptKey of REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS) {
    const concept = rulePack.concepts[conceptKey];

    assert.equal(typeof concept.displayName, 'string');
    assert.equal(typeof concept.category, 'string');
    assert.equal(typeof concept.cadence, 'string');
    assert.equal(concept.payoutTruth, false);
    assert.equal(concept.payoutTruthRule, 'commission_statement_required');
    assert.equal(concept.modelStatus, 'skeleton_not_calculated');
    assert.equal(Array.isArray(concept.sourceEvidence), true);
    assert(concept.sourceEvidence.includes('CC 2026 Asesores Nuevos Profesionales.pdf'));
  }

  console.log('PASS physical New Professional concepts are skeleton-only and payoutTruth false');
}

function testGlobalExclusionsFromPhysicalRulePack() {
  const { rulePack } = loadNewProfessional2026RulePack();

  for (const key of REQUIRED_GLOBAL_EXCLUSION_KEYS) {
    assert.equal(rulePack.globalExclusions[key], true, `${key} must be represented as true`);
  }

  console.log('PASS physical New Professional global exclusions are represented as data');
}

testPhysicalJsonIsValid();
testPhysicalRulePackLoadsAndValidates();
testConceptShapeFromPhysicalRulePack();
testGlobalExclusionsFromPhysicalRulePack();

console.log('PASS new-professional-rule-pack-integration-test');
