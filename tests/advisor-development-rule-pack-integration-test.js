import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  loadAdvisorDevelopmentRulePack,
} from '../compensation/advisor-development/advisor-development-rule-pack-loader.js';

import {
  DECISION_STATUS,
  evaluateAdvisorDevelopmentPolicies,
} from '../compensation/advisor-development/advisor-development-counting-weighting-engine.js';

const RULE_PACK_PATH = 'compensation/advisor-development/rule-data/smnyl-advisor-development-2026.rule-pack.json';

function readRulePackRaw() {
  return readFileSync(RULE_PACK_PATH, 'utf8');
}

function getTrainingAllowance(rulePack) {
  return rulePack.concepts['training-allowance'];
}

function testPhysicalJsonIsValid() {
  const raw = readRulePackRaw();
  const parsed = JSON.parse(raw);

  assert.equal(parsed.rulePackId, 'smnyl-advisor-development-2026');
  assert.equal(parsed.metadata.rulePackHash, 'draft:not-sealed');
  assert.equal(parsed.globalRules.payoutTruth, false);
  assert.equal(getTrainingAllowance(parsed).calculationRules.excessMultiplierRate, 0.35);
  assert.equal(getTrainingAllowance(parsed).table.length, 12);

  console.log('PASS physical advisor development rule pack JSON is valid');
}

function testLoaderLoadsPhysicalDraftRulePack() {
  const before = readRulePackRaw();
  const result = loadAdvisorDevelopmentRulePack();
  const after = readRulePackRaw();

  assert.equal(result.isValid, true);
  assert.equal(result.validationErrors.length, 0);
  assert.equal(result.validationWarnings.length, 0);
  assert.equal(result.rulePack.rulePackId, 'smnyl-advisor-development-2026');
  assert.equal(result.rulePack.metadata.rulePackVersion, '1.0.0-draft');
  assert.equal(result.rulePack.metadata.rulePackHash, 'draft:not-sealed');
  assert.equal(result.rulePack.metadata.governanceStatus, 'draft');
  assert.equal(result.rulePack.globalRules.payoutTruth, false);
  assert.equal(before, after, 'loader must not mutate the physical JSON file');

  console.log('PASS loader loads physical advisor development draft rule pack');
}

function testTrainingAllowanceTableFromPhysicalRulePack() {
  const loaded = loadAdvisorDevelopmentRulePack();
  const trainingAllowance = getTrainingAllowance(loaded.rulePack);

  assert.equal(trainingAllowance.displayName, 'Training Allowance');
  assert.equal(trainingAllowance.calculationFrequency, 'monthly');
  assert.equal(trainingAllowance.paymentFrequency, 'semiannual_with_monthly_advances');
  assert.equal(trainingAllowance.payoutTruth, false);
  assert.equal(trainingAllowance.policyAccumulationRule.vidaPlusGmmiCountsAs, 0.5);
  assert.equal(trainingAllowance.calculationRules.baseBonusStrategy, 'min_between_calculated_and_max_award');
  assert.equal(trainingAllowance.calculationRules.excessBonusStrategy, 'apply_rate_to_excess_above_max_award');
  assert.equal(trainingAllowance.calculationRules.excessMultiplierRate, 0.35);
  assert.equal(trainingAllowance.calculationRules.paymentDeductionStrategy, 'subtract_prior_paid_bonuses_in_current_semester');
  assert.equal(trainingAllowance.table.length, 12);

  const month1 = trainingAllowance.table.find((row) => row.advisorMonth === 1);
  const month6 = trainingAllowance.table.find((row) => row.advisorMonth === 6);
  const month7 = trainingAllowance.table.find((row) => row.advisorMonth === 7);
  const month12 = trainingAllowance.table.find((row) => row.advisorMonth === 12);

  assert.deepEqual(month1, {
    advisorMonth: 1,
    semester: 1,
    accumulatedCommissionGoal: 9000,
    accumulatedPolicyGoal: 3,
    minimumLifePolicyGoal: 1,
    bonusPercentage: 1,
    minimumAward: 9000,
    maximumAward: 33000,
  });

  assert.equal(month6.semester, 1);
  assert.equal(month6.accumulatedCommissionGoal, 51000);
  assert.equal(month6.maximumAward, 167000);

  assert.equal(month7.semester, 2);
  assert.equal(month7.accumulatedCommissionGoal, 13000);
  assert.equal(month7.maximumAward, 38000);

  assert.deepEqual(month12, {
    advisorMonth: 12,
    semester: 2,
    accumulatedCommissionGoal: 70000,
    accumulatedPolicyGoal: 18,
    minimumLifePolicyGoal: 6,
    bonusPercentage: 1,
    minimumAward: 70000,
    maximumAward: 210000,
  });

  console.log('PASS Training Allowance table loads from physical rule pack');
}

function testCountingEngineConsumesPhysicalRulePack() {
  const loaded = loadAdvisorDevelopmentRulePack();

  const result = evaluateAdvisorDevelopmentPolicies({
    rulePack: loaded.rulePack,
    policies: [
      {
        id: 'life-001',
        lineOfBusiness: 'vida individual',
        productCode: 'orvi_99',
        commissionAmount: 10000,
      },
      {
        id: 'gmmi-001',
        lineOfBusiness: 'GMMI',
        productCode: 'gmmi_individual',
        insuredAge: 42,
        commissionAmount: 10000,
      },
      {
        id: 'gmmi-age-60',
        lineOfBusiness: 'GMMI',
        productCode: 'gmmi_individual',
        insuredAge: 60,
        commissionAmount: 10000,
      },
      {
        id: 'gmmi-missing-age',
        lineOfBusiness: 'GMMI',
        productCode: 'gmmi_individual',
        insuredAge: null,
        commissionAmount: 10000,
      },
      {
        id: 'tempo-vida-1',
        lineOfBusiness: 'vida individual',
        productCode: 'Tempo Vida 1',
        commissionAmount: 10000,
      },
      {
        id: 'ave-component',
        lineOfBusiness: 'vida individual',
        productCode: 'orvi_99',
        componentCode: 'AVE',
        commissionAmount: 10000,
      },
    ],
  });

  const lifePolicy = result.policies.find((policy) => policy.policy.id === 'life-001');
  const gmmiPolicy = result.policies.find((policy) => policy.policy.id === 'gmmi-001');
  const gmmiAge60Policy = result.policies.find((policy) => policy.policy.id === 'gmmi-age-60');
  const gmmiMissingAgePolicy = result.policies.find((policy) => policy.policy.id === 'gmmi-missing-age');
  const tempoPolicy = result.policies.find((policy) => policy.policy.id === 'tempo-vida-1');
  const avePolicy = result.policies.find((policy) => policy.policy.id === 'ave-component');

  assert.equal(result.payoutTruth, false);

  assert.equal(lifePolicy.status, DECISION_STATUS.INCLUDED);
  assert.equal(lifePolicy.rawAmount, 10000);
  assert.equal(lifePolicy.factor, 0.9);
  assert.equal(lifePolicy.evaluatedAmount, 9000);

  assert.equal(gmmiPolicy.status, DECISION_STATUS.INCLUDED);
  assert.equal(gmmiPolicy.factor, 1);
  assert.equal(gmmiPolicy.evaluatedAmount, 10000);

  assert.equal(gmmiAge60Policy.status, DECISION_STATUS.EXCLUDED);
  assert.equal(gmmiAge60Policy.reason, 'excluded_by_insured_age');
  assert.equal(gmmiAge60Policy.evaluatedAmount, null);

  assert.equal(gmmiMissingAgePolicy.status, DECISION_STATUS.BLOCKED);
  assert.equal(gmmiMissingAgePolicy.reason, 'missing_insured_age');
  assert.equal(gmmiMissingAgePolicy.evaluatedAmount, null);

  assert.equal(tempoPolicy.status, DECISION_STATUS.EXCLUDED);
  assert.equal(tempoPolicy.reason, 'excluded_product');
  assert.equal(tempoPolicy.evaluatedAmount, null);

  assert.equal(avePolicy.status, DECISION_STATUS.EXCLUDED);
  assert.equal(avePolicy.reason, 'excluded_product_component');
  assert.equal(avePolicy.evaluatedAmount, null);

  assert.equal(result.summary.includedCount, 2);
  assert.equal(result.summary.excludedCount, 3);
  assert.equal(result.summary.blockedCount, 1);
  assert.equal(result.summary.evaluatedAmount, 19000);

  console.log('PASS counting engine consumes physical advisor development rule pack');
}

testPhysicalJsonIsValid();
testLoaderLoadsPhysicalDraftRulePack();
testTrainingAllowanceTableFromPhysicalRulePack();
testCountingEngineConsumesPhysicalRulePack();

console.log('PASS advisor-development-rule-pack-integration-test');
