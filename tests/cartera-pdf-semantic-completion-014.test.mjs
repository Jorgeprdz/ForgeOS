import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  coverageExtractionState as edgeCoverageExtractionState,
  mergeSemanticCandidateLists,
  mergeSemanticCandidates,
  semanticRecoveryReasons,
} from '../supabase/functions/cartera-pdf-intake/semantic-recovery.js';
import {
  enrichSemanticFields,
  semanticReviewCandidate,
  semanticReviewCompleteness,
} from '../docs/static-preview/forge-aura/cartera/cartera-semantic-v1.js';

function coverages(count = 10) {
  return Array.from({ length: count }, (_, index) => ({
    candidateReference: `PDF_COVERAGE_CANDIDATE:${index + 1}`,
    coverageLabel: `Cobertura sintética ${index + 1}`,
    coverageCode: `COV-${String(index + 1).padStart(2, '0')}`,
    annexReference: `ANEXO-${String(index + 1).padStart(2, '0')}`,
    sumInsured: 100000 + index * 10000,
    currency: 'UDI',
    effectiveFrom: '2026-08-05',
    coveragePeriod: { value: 27, unit: 'YEAR' },
    paymentPeriod: { value: 15, unit: 'YEAR' },
    premiumAmount: 100 + index * 10,
    evidenceReference: `page:1:coverage:${index + 1}`,
    confidence: .95,
    createsTruth: false,
    requiresHumanReview: true,
  }));
}

function productionPartial() {
  return {
    policyNumber: 'VI0003006169',
    product: 'IMAGINA SER 65 - 15 PAGOS UDI',
    policyType: 'NORMAL',
    status: null,
    issueDate: null,
    effectiveDate: '2026-08-05',
    expirationDate: '2053-08-05',
    currency: null,
    paymentFrequency: null,
    basicPremiumTotal: null,
    plannedPremium: null,
    annualTotal: null,
    coverageSectionDetected: true,
    coverageCandidates: [],
    confidence: .99,
    createsTruth: false,
    requiresHumanReview: true,
  };
}

function focusedRecovery() {
  return {
    policyNumber: 'VI0003006169',
    product: 'IMAGINA SER 65 - 15 PAGOS UDI',
    policyType: 'NORMAL',
    status: null,
    issueDate: '2026-08-05',
    effectiveDate: '2026-08-05',
    expirationDate: '2053-08-05',
    currency: 'UDI',
    paymentFrequency: 'MONTHLY',
    basicPremiumTotal: 3976.96,
    plannedPremium: 2840,
    annualTotal: 6816.96,
    coverageSectionDetected: true,
    coverageCandidates: coverages(),
    confidence: .97,
    createsTruth: false,
    requiresHumanReview: true,
  };
}

test('production partial candidate triggers focused semantic recovery even though candidate exists', () => {
  const reasons = semanticRecoveryReasons(productionPartial());
  assert.deepEqual(new Set(reasons), new Set([
    'issueDate', 'currency', 'paymentFrequency',
    'basicPremiumTotal', 'plannedPremium', 'annualTotal', 'coverageCandidates',
  ]));
  assert.ok(reasons.length > 0);
});

test('focused recovery fills missing semantics without overwriting primary facts', () => {
  const primary = productionPartial();
  const recovery = focusedRecovery();
  recovery.product = 'SHOULD NOT OVERWRITE PRIMARY PRODUCT';
  recovery.effectiveDate = '2026-08-06';
  const merged = mergeSemanticCandidates(primary, recovery);

  assert.equal(merged.product, 'IMAGINA SER 65 - 15 PAGOS UDI');
  assert.equal(merged.policyNumber, 'VI0003006169');
  assert.equal(merged.policyType, 'NORMAL');
  assert.equal(merged.status, null);
  assert.equal(merged.issueDate, '2026-08-05');
  assert.equal(merged.effectiveDate, '2026-08-05');
  assert.equal(merged.expirationDate, '2053-08-05');
  assert.equal(merged.currency, 'UDI');
  assert.equal(merged.paymentFrequency, 'MONTHLY');
  assert.equal(merged.basicPremiumTotal, 3976.96);
  assert.equal(merged.plannedPremium, 2840);
  assert.equal(merged.annualTotal, 6816.96);
  assert.equal(merged.coverageCandidates.length, 10);
  assert.equal(merged.coverageExtractionState, 'CANDIDATES_REVIEW_REQUIRED');
  assert.deepEqual(merged.reviewCompleteness.gaps, []);
  assert.equal(merged.semanticProvenance.issueDate, 'FOCUSED_RECOVERY_PASS');
  assert.equal(merged.semanticProvenance.product, 'PRIMARY_MODEL_PASS');
});

test('NORMAL remains policy type and recovery never invents policy status', () => {
  const [merged] = mergeSemanticCandidateLists([productionPartial()], [focusedRecovery()]);
  assert.equal(merged.policyType, 'NORMAL');
  assert.equal(merged.status, null);
  assert.notEqual(merged.status, 'ACTIVE');
  assert.notEqual(merged.status, 'NORMAL');
});

test('three premium concepts remain independent evidence values', () => {
  const [merged] = mergeSemanticCandidateLists([productionPartial()], [focusedRecovery()]);
  assert.equal(merged.basicPremiumTotal, 3976.96);
  assert.equal(merged.plannedPremium, 2840);
  assert.equal(merged.annualTotal, 6816.96);
  assert.notEqual(merged.basicPremiumTotal, merged.annualTotal);
  assert.notEqual(merged.plannedPremium, merged.annualTotal);
  assert.equal(Object.hasOwn(merged, 'premiumAmount'), false);
});

test('coverage candidates remain non-truth human-reviewed evidence', () => {
  const [merged] = mergeSemanticCandidateLists([productionPartial()], [focusedRecovery()]);
  assert.ok(merged.coverageCandidates.length >= 10);
  for (const coverage of merged.coverageCandidates) {
    assert.equal(coverage.createsTruth, false);
    assert.equal(coverage.requiresHumanReview, true);
    assert.equal(coverage.currency, 'UDI');
    assert.ok(coverage.evidenceReference);
  }
});

test('coverage section with zero structured rows is incomplete, never confirmed zero coverage', () => {
  const incomplete = { coverageSectionDetected: true, coverageCandidates: [] };
  assert.equal(edgeCoverageExtractionState(incomplete), 'INCOMPLETE_REVIEW_REQUIRED');
  const completeness = semanticReviewCompleteness({
    ...focusedRecovery(),
    coverageCandidates: [],
    coverageSectionDetected: true,
  });
  assert.ok(completeness.gaps.includes('coverageCandidates'));
});

test('020B semantic fields and reopen projection preserve recovered meaning', () => {
  const [merged] = mergeSemanticCandidateLists([productionPartial()], [focusedRecovery()]);
  const fields = enrichSemanticFields({}, { ...merged, modelVersion: 'fixture-014' });
  assert.equal(fields.issueDate.value, '2026-08-05');
  assert.equal(fields.currency.value, 'UDI');
  assert.equal(fields.paymentFrequency.value, 'MONTHLY');
  assert.equal(fields.basicPremiumTotal.value, 3976.96);
  assert.equal(fields.plannedPremium.value, 2840);
  assert.equal(fields.annualTotal.value, 6816.96);
  assert.equal(fields.coverageSectionDetected.value, true);
  assert.equal(fields.coverageCandidates.value.length, 10);
  assert.equal(fields.issueDate.createsTruth, false);

  const reopened = semanticReviewCandidate(fields, {});
  assert.equal(reopened.policyType, 'NORMAL');
  assert.equal(reopened.status, null);
  assert.equal(reopened.issueDate, '2026-08-05');
  assert.equal(reopened.currency, 'UDI');
  assert.equal(reopened.paymentFrequency, 'MONTHLY');
  assert.equal(reopened.basicPremiumTotal, 3976.96);
  assert.equal(reopened.plannedPremium, 2840);
  assert.equal(reopened.annualTotal, 6816.96);
  assert.equal(reopened.coverageCandidates.length, 10);
  assert.equal(reopened.coverageExtractionState, 'CANDIDATES_REVIEW_REQUIRED');
  assert.deepEqual(reopened.reviewCompleteness.gaps, []);
});

test('Edge source uses semantic-gap recovery rather than candidates-length-only recovery', () => {
  const source = fs.readFileSync(new URL('../supabase/functions/cartera-pdf-intake/index.ts', import.meta.url), 'utf8');
  assert.match(source, /cartera-pdf-intake-v4-semantic-completion-014/);
  assert.match(source, /semanticRecoveryReasons\(primaryCandidates\[0\] \|\| \{\}\)/);
  assert.match(source, /if \(recoveryReasons\.length > 0\)/);
  assert.match(source, /mergeSemanticCandidateLists\(primaryCandidates, recoveryCandidates\)/);
  assert.match(source, /coverageSectionDetected/);
  assert.match(source, /MONEDA UDI/);
  assert.match(source, /FORMA DE PAGO/);
  assert.match(source, /PRIMA BÁSICA TOTAL/);
  assert.match(source, /recorre TODAS las filas/);
  assert.doesNotMatch(source, /if \(candidates\.length === 0\) \{\s*recoveryUsed = true;\s*candidates = await extractCandidates/m);
});

test('review UI separates extraction quality from completeness and never prints confirmed zero coverage', () => {
  const source = fs.readFileSync(new URL('../docs/static-preview/forge-aura/cartera/cartera-module-v4.js', import.meta.url), 'utf8');
  assert.match(source, /data-semantic-review="014"/);
  assert.match(source, /Coberturas requieren revisión/);
  assert.match(source, /Lectura del documento: alta/);
  assert.match(source, /Revisión: \$\{completeness\.criticalGapCount\} datos críticos pendientes/);
  assert.doesNotMatch(source, />\$\{coverages\.length\} coberturas</);
  assert.doesNotMatch(source, /Confianza alta/);
}
);
