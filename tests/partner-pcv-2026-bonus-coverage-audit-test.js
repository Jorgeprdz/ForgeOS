import assert from 'node:assert/strict';

import {
  PARTNER_CONCEPT_CALCULATION_MODES,
  getPartnerCompensationConceptEntry,
  isPartnerConceptCandidateCalculable,
  isPartnerConceptFullCalculable,
  isPartnerConceptKnown,
  isPartnerConceptPartial,
  requiresOfficialStatementForPartnerPayout,
} from '../compensation/partner-manager/partner-compensation-concept-registry.js';

const pcvConcepts = Object.freeze([
  ['transition-bonus', 'Bono de Transicion', 'IMPLEMENTED_CANDIDATE'],
  ['productivity-base', 'Bono de Productividad Base', 'IMPLEMENTED_CANDIDATE'],
  ['productivity-multiplier', 'Multiplicador de Productividad', 'IMPLEMENTED_CANDIDATE'],
  ['productivity-annual-additional-bonus', 'Bono Adicional Anual de Productividad', 'IMPLEMENTED_CANDIDATE'],
  ['production-bonus', 'Bono de Produccion', 'IMPLEMENTED_CANDIDATE'],
  ['activity-bonus', 'Bono de Actividad', 'IMPLEMENTED_CANDIDATE'],
  ['partner-promotion-bonus', 'Bono de Alta Partner', 'IMPLEMENTED_CANDIDATE'],
  ['connection-bonus', 'Bono de Conexion', 'IMPLEMENTED_CANDIDATE'],
  ['development-bonus', 'Bono de Desarrollo', 'IMPLEMENTED_CANDIDATE'],
  ['fixed-support', 'Apoyos', 'IMPLEMENTED_CANDIDATE'],
]);

const counts = pcvConcepts.reduce(
  (accumulator, [, , status]) => ({
    ...accumulator,
    [status]: (accumulator[status] || 0) + 1,
  }),
  {}
);

const blockedForPayoutTruth = pcvConcepts.filter(([conceptKey]) =>
  requiresOfficialStatementForPartnerPayout(conceptKey)
);

const coverageCounts = Object.freeze({
  implemented_candidate: counts.IMPLEMENTED_CANDIDATE || 0,
  partial: counts.PARTIAL || 0,
  missing: counts.MISSING || 0,
  blocked_for_payoutTruth: blockedForPayoutTruth.length,
});

assert.equal(pcvConcepts.length, 10);
assert.equal(counts.IMPLEMENTED_CANDIDATE, 10);
assert.equal(counts.PARTIAL || 0, 0);
assert.equal(counts.MISSING || 0, 0);
assert.equal(coverageCounts.implemented_candidate, 10);
assert.equal(coverageCounts.partial, 0);
assert.equal(coverageCounts.missing, 0);
assert.equal(coverageCounts.blocked_for_payoutTruth, 10);

for (const [conceptKey] of pcvConcepts) {
  assert.equal(isPartnerConceptKnown(conceptKey), true, `${conceptKey} must be registry-known`);
  assert.equal(
    requiresOfficialStatementForPartnerPayout(conceptKey),
    true,
    `${conceptKey} must remain blocked for payoutTruth until official statement evidence`
  );
}

for (const [conceptKey, , status] of pcvConcepts) {
  if (status === 'IMPLEMENTED_CANDIDATE') {
    assert.equal(
      isPartnerConceptCandidateCalculable(conceptKey),
      true,
      `${conceptKey} must be candidate-calculable`
    );
  }
}

const altaPartner = getPartnerCompensationConceptEntry('partner-promotion-bonus');
assert.equal(altaPartner.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION);
assert.equal(altaPartner.supportsCandidateCalculation, true);
assert.equal(altaPartner.supportsFullCalculation, false);
assert.equal(altaPartner.supportsPayoutTruthGate, true);
assert.equal(altaPartner.requiresOfficialStatementForPayout, true);
assert.equal(altaPartner.metadata.totalScheduleAmount, 300000);
assert.equal(altaPartner.metadata.paymentCount, 13);
assert.equal(altaPartner.metadata.firstPaymentAmount, 60000);
assert.equal(altaPartner.metadata.recurringPaymentAmount, 20000);
assert.equal(altaPartner.metadata.maxRecoveryMonths, 3);
assert.equal(altaPartner.metadata.supportCalculatorTouched, false);
assert.equal(altaPartner.metadata.productionPayoutOperationsTouched, false);
assert.equal(isPartnerConceptCandidateCalculable('partner-promotion-bonus'), true);
assert.equal(isPartnerConceptFullCalculable('partner-promotion-bonus'), false);
assert.equal(isPartnerConceptPartial('partner-promotion-bonus'), false);

const fixedSupport = getPartnerCompensationConceptEntry('fixed-support');
assert.equal(fixedSupport.calculationMode, PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION);
assert.equal(fixedSupport.supportsCandidateCalculation, true);
assert.equal(fixedSupport.supportsFullCalculation, false);
assert.equal(fixedSupport.supportsPayoutTruthGate, true);
assert.equal(fixedSupport.requiresOfficialStatementForPayout, true);
assert.equal(isPartnerConceptCandidateCalculable('fixed-support'), true);
assert.equal(isPartnerConceptFullCalculable('fixed-support'), false);
assert.equal(isPartnerConceptPartial('fixed-support'), false);
assert.equal(requiresOfficialStatementForPartnerPayout('fixed-support'), true);

assert.equal(blockedForPayoutTruth.length, 10);

console.log('PASS partner-pcv-2026-bonus-coverage-audit-test');
