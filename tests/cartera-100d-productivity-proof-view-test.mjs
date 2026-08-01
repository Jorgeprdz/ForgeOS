import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderCartera100ProductivityProof,
} from '../platform/productivity/cartera-100d-productivity-proof-view.js';

function metric(metricKey, label, state = 'KNOWN', value = 1, unit = 'COUNT', overrides = {}) {
  return {
    metricKey,
    label,
    state,
    value,
    unit,
    currency: null,
    sourceAuthority: 'TEST_AUTHORITY',
    limitation: null,
    ...overrides,
  };
}

function proof(overrides = {}) {
  const metrics = {
    POLICIES_IMPORTED_AUTOMATICALLY: metric('POLICIES_IMPORTED_AUTOMATICALLY', 'Pólizas importadas automáticamente'),
    WORK_MINUTES_AVOIDED: metric('WORK_MINUTES_AVOIDED', 'Minutos de captura evitados', 'KNOWN', 120, 'MINUTES'),
    IDENTITY_DUPLICATES_PREVENTED: metric('IDENTITY_DUPLICATES_PREVENTED', 'Duplicados prevenidos', 'ZERO', 0),
    PAYMENT_EMAILS_DETECTED: metric('PAYMENT_EMAILS_DETECTED', 'Correos detectados', 'MISSING', null),
    PAYMENTS_CONFIRMED_BEFORE_RISK: metric('PAYMENTS_CONFIRMED_BEFORE_RISK', 'Pagos confirmados antes de riesgo'),
    RENEWALS_ATTENDED: metric('RENEWALS_ATTENDED', 'Renovaciones atendidas', 'MISSING', null),
    POSSIBLE_LAPSES_SURFACED: metric('POSSIBLE_LAPSES_SURFACED', 'Posibles caídas visibles', 'MISSING', null),
    COMMISSION_DISCREPANCIES_DETECTED: metric('COMMISSION_DISCREPANCIES_DETECTED', 'Discrepancias detectadas', 'MISSING', null),
    SECOND_POLICY_REVIEWS: metric('SECOND_POLICY_REVIEWS', 'Revisiones de segunda póliza'),
    RELATIONSHIP_REVIEWS_COMPLETED: metric('RELATIONSHIP_REVIEWS_COMPLETED', 'Revisiones de relación completadas'),
    CONSENTED_REFERRALS_OBTAINED: metric('CONSENTED_REFERRALS_OBTAINED', 'Referidos consentidos obtenidos'),
    OPPORTUNITIES_RETURNED_TO_PIPELINE: metric('OPPORTUNITIES_RETURNED_TO_PIPELINE', 'Oportunidades a Pipeline', 'MISSING', null),
    ACCEPTED_RECOMMENDATIONS: metric('ACCEPTED_RECOMMENDATIONS', 'Recomendaciones aceptadas', 'INCOMPLETE', 2, 'COUNT', {
      limitation: 'Periodo anterior a instrumentación.',
    }),
    COMPLETED_MINIMUM_USEFUL_ACTIONS: metric('COMPLETED_MINIMUM_USEFUL_ACTIONS', 'Acciones útiles completadas'),
    CONFIRMED_PRODUCTION_COUNT: metric('CONFIRMED_PRODUCTION_COUNT', 'Producción confirmada', 'MISSING', null),
    ADVISOR_WORK_MINUTES: metric('ADVISOR_WORK_MINUTES', 'Minutos de trabajo', 'MISSING', null, 'MINUTES'),
  };
  const derived = {
    averagePolicyReviewMinutes: { label: 'Promedio de revisión', state: 'KNOWN', value: 15, unit: 'MINUTES_PER_POLICY' },
    productionPerAdvisorHour: { label: 'Producción por hora', state: 'MISSING', value: null, unit: 'COUNT_PER_HOUR' },
    responseRate: { label: 'Tasa de respuesta', state: 'KNOWN', value: 0.6, unit: 'RATIO' },
    conversionRate: { label: 'Conversión', state: 'UNKNOWN', value: null, unit: 'RATIO' },
    averageSignalToActionSeconds: { label: 'Señal a acción', state: 'KNOWN', value: 120, unit: 'SECONDS_PER_ACTION' },
  };
  return {
    period: { startDate: '2026-08-01', endDate: '2026-08-31', timeZone: 'America/Mexico_City' },
    statement: {
      state: 'EVIDENCE_AVAILABLE',
      text: 'En este periodo Forge tiene evidencia de 2.0 h administrativas evitadas.',
      causalClaimMade: false,
    },
    metrics,
    derived,
    recommendations: [{
      recommendationReference: 'recommendation-1',
      recommendationClass: 'CONFIRM_PAYMENT',
      sourceAuthority: 'CARTERA070_RELATIONAL_ACTIVATION',
      feedback: 'UNSET',
    }],
    sourceState: {
      productivityObservationLedger: 'COMPLETE',
      activityHours: 'NOT_CONNECTED',
    },
    ...overrides,
  };
}

test('100D presents proof categories, derived metrics and evidence limitations', () => {
  const html = renderCartera100ProductivityProof({ status: 'READY', proof: proof() });
  assert.match(html, /PRODUCTIVITY PROOF/);
  assert.match(html, /Trabajo administrativo/);
  assert.match(html, /Protección de ingreso/);
  assert.match(html, /Crecimiento responsable/);
  assert.match(html, /Productividad observable/);
  assert.match(html, /Ratios sólo cuando los denominadores existen/);
  assert.match(html, /Periodo incompleto/);
  assert.match(html, /No se convirtieron en cero/);
});

test('100D exposes explicit learning controls and rejects silence as permission in copy', () => {
  const html = renderCartera100ProductivityProof({ status: 'READY', proof: proof() });
  assert.match(html, /Me ayudó/);
  assert.match(html, /No me ayudó/);
  assert.match(html, /Pasó por otra razón/);
  assert.match(html, /El silencio no es permiso/);
  assert.match(html, /una acción cercana no prueba causalidad/);
});

test('100D states that the surface is not a score, ranking or pressure mechanism', () => {
  const html = renderCartera100ProductivityProof({ status: 'READY', proof: proof() });
  assert.match(html, /no es un score, ranking, evaluación humana ni mecanismo de presión/i);
  assert.match(html, /Actividad no equivale automáticamente a progreso, calidad, valor o causalidad/i);
  assert.doesNotMatch(html, /advisor score|productivity score|ranking #|debe ser sancionado/i);
});

test('100D escapes untrusted statement, labels and recommendation references', () => {
  const fixture = proof();
  fixture.statement.text = '<script>alert(1)</script>';
  fixture.metrics.WORK_MINUTES_AVOIDED.label = '<img src=x>';
  fixture.recommendations[0].recommendationReference = 'rec"><svg/onload=alert(1)>';
  const html = renderCartera100ProductivityProof({ status: 'READY', proof: fixture });
  assert.doesNotMatch(html, /<script>|<img src=x>|<svg\/onload/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img src=x&gt;/);
});

test('100D shows loading, error and evidence-insufficient states honestly', () => {
  assert.match(
    renderCartera100ProductivityProof({ status: 'LOADING' }),
    /Reconstruyendo evidencia de productividad/
  );
  assert.match(
    renderCartera100ProductivityProof({ status: 'ERROR', errorCode: 'SOURCE_OFFLINE' }),
    /SOURCE_OFFLINE/
  );
  const fixture = proof({
    statement: {
      state: 'INSUFFICIENT_EVIDENCE',
      text: 'Aún no hay evidencia suficiente para afirmar resultados.',
      causalClaimMade: false,
    },
    recommendations: [],
  });
  const html = renderCartera100ProductivityProof({ status: 'READY', proof: fixture });
  assert.match(html, /Aún no hay evidencia suficiente/);
  assert.match(html, /Todavía no hay recomendaciones aceptadas instrumentadas/);
});
