import assert from 'node:assert/strict';

import {
  PARTNER_COMPENSATION_CONCEPT_KEYS,
  PARTNER_CONCEPT_CALCULATION_MODES,
  getPartnerCompensationConceptEntry,
  isPartnerConceptCandidateCalculable,
  isPartnerConceptExampleOnly,
  isPartnerConceptFullCalculable,
  isPartnerConceptKnown,
  isPartnerConceptPartial,
  listPartnerCompensationConceptEntries,
  normalizePartnerConceptKey,
  requiresOfficialStatementForPartnerPayout,
} from '../compensation/partner-manager/partner-compensation-concept-registry.js';

assert.equal(normalizePartnerConceptKey(null), PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN);
assert.equal(normalizePartnerConceptKey(''), PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN);
assert.equal(normalizePartnerConceptKey('   '), PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN);

assert.equal(isPartnerConceptCandidateCalculable('unknown'), false);
assert.equal(getPartnerCompensationConceptEntry('unknown').supportsPayoutTruthGate, false);
assert.equal(isPartnerConceptKnown('unknown'), false);

const productivityBase = getPartnerCompensationConceptEntry('productivity-base');
assert.equal(productivityBase.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.FULL_CANDIDATE);
assert.equal(productivityBase.requiresOfficialStatementForPayout, true);
assert.equal(productivityBase.supportsFullCalculation, true);
assert.deepEqual(productivityBase.sourcePages, [6]);

const multiplier = getPartnerCompensationConceptEntry('productivity-multiplier');
assert.equal(multiplier.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.FULL_CANDIDATE);
assert.ok(multiplier.evidenceRequirement.includes('qualified_advisor_count'));
assert.ok(multiplier.evidenceRequirement.includes('productivity_base_candidate'));
assert.ok(multiplier.evidenceRequirement.includes('partner_career_month_or_multiplier_minimum_requirement_config'));
assert.ok(multiplier.evidenceRequirement.includes('training_winner_or_signed_precontract_evidence_for_pay_factor'));
assert.ok(multiplier.evidenceRequirement.includes('official_partner_compensation_statement_line_for_payout'));
assert.equal(multiplier.metadata.requiresPartnerCareerMonthSupportGate, true);
assert.equal(multiplier.metadata.requiresAccumulatedCommissionGoal, false);
assert.equal(multiplier.metadata.requiresQualifiedAdvisorRequirementByCareerMonth, true);
assert.equal(multiplier.metadata.sourceTruthLevel, 'user_confirmed_pending_document_pinpoint');
assert.equal(multiplier.metadata.requiresTrainingWinnerEvidenceForPayFactor, true);
assert.equal(multiplier.metadata.officialStatementRequiredForPayoutTruth, true);
assert.ok(multiplier.constitutionalRules.some((rule) => rule.includes('not confirmed payout')));

const production = getPartnerCompensationConceptEntry('production-bonus');
assert.ok(production.economicInputRequirement.includes('non_qualified_advisor_economic_output'));

const activity = getPartnerCompensationConceptEntry('activity-bonus');
assert.equal(activity.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION);

const fixedSupport = getPartnerCompensationConceptEntry('fixed-support');
assert.equal(fixedSupport.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION);
assert.equal(fixedSupport.supportsFullCalculation, false);
assert.ok(fixedSupport.evidenceRequirement.includes('support_table_evidence_for_full_modeling'));
assert.equal(fixedSupport.metadata.requiresPartnerCareerMonthSupportGate, true);
assert.equal(fixedSupport.metadata.requiresAccumulatedCommissionGoal, true);
assert.equal(fixedSupport.metadata.requiresQualifiedAdvisorRequirementByCareerMonth, false);
assert.equal(fixedSupport.metadata.requiresSupportTableEvidence, true);

const transition = getPartnerCompensationConceptEntry('transition-bonus');
assert.equal(transition.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.PARTIAL_BLOCKED);
assert.equal(isPartnerConceptPartial('transition-bonus'), true);

const connection = getPartnerCompensationConceptEntry('connection-bonus');
assert.equal(connection.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION);
assert.equal(connection.supportsSemanticAmount, true);
assert.equal(connection.supportsCandidateCalculation, true);
assert.equal(connection.supportsFullCalculation, false);
assert.equal(connection.metadata.semanticAmounts.activation, 7500);

const development = getPartnerCompensationConceptEntry('development-bonus');
assert.equal(development.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION);
assert.equal(isPartnerConceptExampleOnly('development-bonus'), false);
assert.equal(isPartnerConceptFullCalculable('development-bonus'), true);
assert.equal(isPartnerConceptCandidateCalculable('development-bonus'), true);

const promotion = getPartnerCompensationConceptEntry('partner-promotion-bonus');
assert.equal(promotion.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.SEMANTIC_ONLY);
assert.equal(promotion.supportsSemanticAmount, true);
assert.equal(promotion.supportsFullCalculation, false);
assert.equal(promotion.metadata.semanticAmounts.total, 300000);
assert.equal(promotion.metadata.semanticAmounts.initial, 60000);
assert.equal(promotion.metadata.semanticAmounts.monthly, 20000);
assert.equal(promotion.metadata.semanticAmounts.payments, 12);

const mutableCopy = getPartnerCompensationConceptEntry('productivity-base');
mutableCopy.displayName = 'mutated';
mutableCopy.warnings.push('mutated_warning');
const freshCopy = getPartnerCompensationConceptEntry('productivity-base');
assert.equal(freshCopy.displayName, 'Productividad Base');
assert.equal(freshCopy.warnings.includes('mutated_warning'), false);

assert.equal(normalizePartnerConceptKey('bonus'), PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN);
assert.equal(normalizePartnerConceptKey('activity'), PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN);

for (const conceptKey of [
  'productivity-base',
  'productivity-multiplier',
  'production-bonus',
  'activity-bonus',
  'fixed-support',
  'transition-bonus',
  'connection-bonus',
  'development-bonus',
  'partner-promotion-bonus',
]) {
  assert.equal(requiresOfficialStatementForPartnerPayout(conceptKey), true);
}

assert.equal(isPartnerConceptFullCalculable('transition-bonus'), false);
assert.equal(isPartnerConceptFullCalculable('connection-bonus'), false);
assert.equal(isPartnerConceptFullCalculable('partner-promotion-bonus'), false);

const listedKeys = listPartnerCompensationConceptEntries().map((entry) => entry.conceptKey).sort();
assert.deepEqual(listedKeys, Object.values(PARTNER_COMPENSATION_CONCEPT_KEYS).sort());

console.log('PASS partner-compensation-concept-registry-test');
