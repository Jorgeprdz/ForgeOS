import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

import {
  PARTNER_CONCEPT_CALCULATION_MODES,
  getPartnerCompensationConceptEntry,
  isPartnerConceptCandidateCalculable,
  isPartnerConceptKnown,
  requiresOfficialStatementForPartnerPayout,
} from '../compensation/partner-manager/partner-compensation-concept-registry.js';

const rulePack = loadPartner2026RulePack();
const coverageDoc = readFileSync(
  new URL('../docs/02-build-tree/PARTNER_COMP_BONUS_COVERAGE_001.md', import.meta.url),
  'utf8'
);

const pcvConcepts = Object.freeze([
  ['transition-bonus', 'Bono de Transicion', 'IMPLEMENTED_CANDIDATE'],
  ['productivity-base', 'Bono de Productividad Base', 'IMPLEMENTED_CANDIDATE'],
  ['productivity-multiplier', 'Multiplicador de Productividad', 'IMPLEMENTED_CANDIDATE'],
  ['productivity-annual-additional-bonus', 'Bono Adicional Anual de Productividad', 'PARTIAL'],
  ['production-bonus', 'Bono de Produccion', 'IMPLEMENTED_CANDIDATE'],
  ['activity-bonus', 'Bono de Actividad', 'IMPLEMENTED_CANDIDATE'],
  ['partner-promotion-bonus', 'Bono de Alta Partner', 'PARTIAL'],
  ['connection-bonus', 'Bono de Conexion', 'IMPLEMENTED_CANDIDATE'],
  ['development-bonus', 'Bono de Desarrollo', 'IMPLEMENTED_CANDIDATE'],
  ['fixed-support', 'Apoyos', 'PARTIAL'],
]);

const implementedCandidateConcepts = pcvConcepts
  .filter(([, , status]) => status === 'IMPLEMENTED_CANDIDATE')
  .map(([conceptKey]) => conceptKey);

const partialConcepts = pcvConcepts
  .filter(([, , status]) => status === 'PARTIAL')
  .map(([conceptKey]) => conceptKey);

assert.equal(pcvConcepts.length, 10);
assert.deepEqual(Object.keys(rulePack.concepts).sort(), pcvConcepts.map(([conceptKey]) => conceptKey).sort());

assert.equal(rulePack.globalRules.payoutTruthRule.candidateCalculationIsPayoutTruth, false);
assert.equal(rulePack.globalRules.payoutTruthRule.requiresOfficialStatementLine, true);
assert.equal(rulePack.globalRules.payoutTruthRule.officialEvidenceRequiredForPaidConfirmed, true);

for (const [conceptKey, displayName, status] of pcvConcepts) {
  const concept = rulePack.concepts[conceptKey];
  assert.ok(concept, `${conceptKey} must remain represented in PCV 2026 rule-data`);
  assert.ok(concept.displayName, `${conceptKey} must keep displayName`);
  assert.ok(
    String(concept.payoutGateMode || '').includes('official_statement'),
    `${conceptKey} must require official statement/account evidence for payout truth`
  );
  assert.ok(coverageDoc.includes(displayName), `${displayName} must remain documented in coverage lock`);
  assert.ok(coverageDoc.includes(status), `${displayName} must keep repo-real status ${status}`);
}

for (const conceptKey of implementedCandidateConcepts) {
  assert.equal(
    isPartnerConceptCandidateCalculable(conceptKey),
    true,
    `${conceptKey} must remain candidate-calculable, not payout truth`
  );
  assert.equal(
    requiresOfficialStatementForPartnerPayout(conceptKey),
    true,
    `${conceptKey} must still require official statement evidence for payout`
  );
}

assert.equal(getPartnerCompensationConceptEntry('transition-bonus').calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION);
assert.equal(isPartnerConceptKnown('productivity-annual-additional-bonus'), false);
assert.equal(getPartnerCompensationConceptEntry('partner-promotion-bonus').calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.SEMANTIC_ONLY);
assert.equal(getPartnerCompensationConceptEntry('fixed-support').supportsFullCalculation, false);

for (const conceptKey of partialConcepts) {
  assert.equal(
    implementedCandidateConcepts.includes(conceptKey),
    false,
    `${conceptKey} must not be listed as implemented candidate while coverage status is PARTIAL`
  );
}

assert.ok(coverageDoc.includes('candidateAmount` is not `payoutTruth'));
assert.ok(coverageDoc.includes('payoutTruth=true` requires official confirmed evidence and statement/account line match'));
assert.ok(coverageDoc.includes('Unknown is not zero'));
assert.ok(coverageDoc.includes('Semantic amount is not full `candidateAmount`'));
assert.ok(coverageDoc.includes('Raw activity logs are insufficient without paid-applied evidence'));
assert.ok(coverageDoc.includes('Ownership source truth gate remains protected'));

assert.equal(JSON.stringify(rulePack).includes('"candidateCalculationIsPayoutTruth":true'), false);

console.log('PASS partner-pcv-2026-bonus-coverage-audit-test');
