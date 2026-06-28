import assert from 'node:assert/strict';
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  NEW_PROFESSIONAL_2026_RULE_PACK_PATH,
  NewProfessionalRulePackLoadError,
  loadNewProfessional2026RulePack,
} from '../compensation/new-professional/new-professional-rule-pack-loader.js';

function createRuntimeDir() {
  return mkdtempSync(join(tmpdir(), 'forge-new-professional-loader-test-'));
}

function testLoaderLoadsPhysicalRulePack() {
  const result = loadNewProfessional2026RulePack();

  assert.equal(result.filePath, NEW_PROFESSIONAL_2026_RULE_PACK_PATH);
  assert.equal(result.rulePack.rulePackId, 'smnyl-new-professional-2026');
  assert.equal(result.rulePack.payoutTruth, false);
  assert.equal(result.validation.valid, true);
  assert.equal(result.validation.errors.length, 0);
  assert.equal(Object.keys(result.rulePack.concepts).length, 10);

  console.log('PASS loader loads physical New Professional rule pack');
}

function testMissingFileThrowsClearError() {
  assert.throws(
    () => loadNewProfessional2026RulePack({ filePath: 'missing/new-professional.rule-pack.json' }),
    (error) => {
      assert(error instanceof NewProfessionalRulePackLoadError);
      assert.equal(error.code, 'NEW_PROFESSIONAL_RULE_PACK_NOT_FOUND');
      return true;
    },
  );

  console.log('PASS loader missing file throws clear error');
}

function testInvalidJsonThrowsClearError() {
  const dir = createRuntimeDir();

  try {
    const filePath = join(dir, 'invalid-new-professional.rule-pack.json');
    writeFileSync(filePath, '{ invalid json');

    assert.throws(
      () => loadNewProfessional2026RulePack({ filePath }),
      (error) => {
        assert(error instanceof NewProfessionalRulePackLoadError);
        assert.equal(error.code, 'NEW_PROFESSIONAL_RULE_PACK_INVALID_JSON');
        return true;
      },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log('PASS loader invalid JSON throws clear error');
}

function testLoaderDoesNotMutateRulePack() {
  const first = loadNewProfessional2026RulePack();
  const before = JSON.stringify(first.rulePack);
  const second = loadNewProfessional2026RulePack();

  assert.equal(JSON.stringify(first.rulePack), before);
  assert.equal(JSON.stringify(second.rulePack), before);

  console.log('PASS loader does not mutate rule pack');
}

testLoaderLoadsPhysicalRulePack();
testMissingFileThrowsClearError();
testInvalidJsonThrowsClearError();
testLoaderDoesNotMutateRulePack();

console.log('PASS new-professional-rule-pack-loader-test');
