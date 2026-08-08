import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichSemanticFields,
  formatCivilDateEs,
  normalizeCivilDate,
  normalizeCoverageCandidates,
  normalizeCurrency,
  normalizeMoneyValue,
  normalizePaymentFrequency,
  normalizePolicyStatus,
  normalizeSemanticCandidate,
  paymentFrequencyLabel,
} from '../docs/static-preview/forge-aura/cartera/cartera-semantic-v1.js';

test('civil dates preserve calendar day in multiple timezone contexts', () => {
  const cases = [
    ['2025-04-17', '17 abr 2025'],
    ['2026-04-17', '17 abr 2026'],
    ['1983-07-14', '14 jul 1983'],
    ['05/AGO/2026', '05 ago 2026'],
    ['05/AGO/2053', '05 ago 2053'],
  ];
  for (const timezone of ['America/Mexico_City', 'UTC', 'America/Los_Angeles']) {
    process.env.TZ = timezone;
    for (const [input, label] of cases) {
      const normalized = normalizeCivilDate(input);
      assert.ok(normalized, `${timezone}: ${input} should normalize`);
      assert.equal(formatCivilDateEs(normalized), label, `${timezone}: ${input}`);
    }
  }
});

test('payment frequency is normalized without invented defaults', () => {
  assert.equal(normalizePaymentFrequency('MENSUAL'), 'MONTHLY');
  assert.equal(normalizePaymentFrequency('TRIMESTRAL'), 'QUARTERLY');
  assert.equal(normalizePaymentFrequency('SEMESTRAL'), 'SEMIANNUAL');
  assert.equal(normalizePaymentFrequency('ANUAL'), 'ANNUAL');
  assert.equal(normalizePaymentFrequency('desconocida'), null);
  assert.equal(paymentFrequencyLabel(null), 'Por confirmar');
});

test('UDI remains first-class currency', () => {
  assert.equal(normalizeCurrency('udi'), 'UDI');
  assert.notEqual(normalizeCurrency('UDI'), 'MXN');
});

test('NORMAL is policyType and never policy status', () => {
  const candidate = normalizeSemanticCandidate({ policyType: 'NORMAL', status: '' });
  assert.equal(candidate.policyType, 'NORMAL');
  assert.equal(candidate.status, null);
  assert.equal(normalizePolicyStatus('NORMAL'), null);
});

test('document premiums remain distinct normalized numeric facts', () => {
  const candidate = normalizeSemanticCandidate({
    basicPremiumTotal: '3,976.96',
    plannedPremium: '2,840.00',
    annualTotal: '6,816.96',
  });
  assert.equal(candidate.basicPremiumTotal, 3976.96);
  assert.equal(candidate.plannedPremium, 2840);
  assert.equal(candidate.annualTotal, 6816.96);
  assert.equal(normalizeMoneyValue('6,816.96'), 6816.96);
});

test('coverage candidates never create truth and always require human review', () => {
  const rows = normalizeCoverageCandidates([{
    coverageLabel: 'Beneficio sintético',
    sumInsured: '100,000',
    currency: 'UDI',
    effectiveFrom: '05/AGO/2026',
    premiumAmount: '123.45',
    confidence: .96,
  }]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].createsTruth, false);
  assert.equal(rows[0].requiresHumanReview, true);
  assert.equal(rows[0].effectiveFrom, '2026-08-05');
  assert.equal(rows[0].sumInsured, 100000);
});

test('semantic fields carry provenance and confirmation state', () => {
  const fields = enrichSemanticFields({}, {
    policyType: 'NORMAL',
    currency: 'UDI',
    paymentFrequency: 'MENSUAL',
    issueDate: '05/AGO/2026',
    effectiveDate: '05/AGO/2026',
    expirationDate: '05/AGO/2053',
    basicPremiumTotal: '3976.96',
    plannedPremium: '2840',
    annualTotal: '6816.96',
    confidence: .98,
  });
  for (const name of ['policyType','currency','paymentFrequency','issueDate','effectiveFrom','effectiveTo','basicPremiumTotal','plannedPremium','annualTotal']) {
    assert.equal(fields[name].createsTruth, false, name);
    assert.equal(fields[name].confirmationStatus, 'PENDING_CONFIRMATION', name);
    assert.equal(fields[name].interpretation, 'DOCUMENT_FACT_CANDIDATE', name);
    assert.ok(Object.hasOwn(fields[name], 'sourceFact'), name);
    assert.ok(Object.hasOwn(fields[name], 'normalizedValue'), name);
  }
});
