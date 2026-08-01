const SIGNAL_STATES = Object.freeze([
  'KNOWN',
  'ZERO',
  'UNKNOWN',
  'MISSING',
  'STALE',
  'INCOMPLETE',
  'CONFLICTING',
]);

const CATEGORIES = Object.freeze([
  'WORK_REDUCTION',
  'INCOME_PROTECTION',
  'GROWTH',
  'PRODUCTIVITY',
  'LEARNING',
]);

const METRICS = Object.freeze({
  POLICIES_IMPORTED_AUTOMATICALLY: ['WORK_REDUCTION', 'COUNT', 'Pólizas importadas automáticamente'],
  FIELDS_EXTRACTED: ['WORK_REDUCTION', 'COUNT', 'Campos extraídos'],
  WORK_MINUTES_AVOIDED: ['WORK_REDUCTION', 'MINUTES', 'Minutos de captura evitados'],
  IDENTITY_DUPLICATES_PREVENTED: ['WORK_REDUCTION', 'COUNT', 'Duplicados de identidad prevenidos'],
  PAYMENT_EMAILS_DETECTED: ['WORK_REDUCTION', 'COUNT', 'Correos de pago detectados'],
  ADMIN_TASKS_ELIMINATED: ['WORK_REDUCTION', 'COUNT', 'Tareas administrativas eliminadas'],
  POLICY_REVIEW_MINUTES_TOTAL: ['WORK_REDUCTION', 'MINUTES', 'Minutos de revisión de pólizas'],
  IMPORTED_POLICY_REVIEW_COUNT: ['WORK_REDUCTION', 'COUNT', 'Pólizas importadas revisadas'],

  PAYMENTS_CONFIRMED_BEFORE_RISK: ['INCOME_PROTECTION', 'COUNT', 'Pagos confirmados antes de riesgo'],
  RENEWALS_ATTENDED: ['INCOME_PROTECTION', 'COUNT', 'Renovaciones atendidas'],
  POSSIBLE_LAPSES_SURFACED: ['INCOME_PROTECTION', 'COUNT', 'Posibles caídas visibles'],
  COMMISSION_DISCREPANCIES_DETECTED: ['INCOME_PROTECTION', 'COUNT', 'Discrepancias de comisión detectadas'],
  CONSERVATION_ACTIONS_COMPLETED: ['INCOME_PROTECTION', 'COUNT', 'Acciones de conservación completadas'],
  PROTECTED_EXPECTED_VALUE: ['INCOME_PROTECTION', 'CURRENCY', 'Valor esperado protegido'],

  SECOND_POLICY_REVIEWS: ['GROWTH', 'COUNT', 'Revisiones de segunda póliza'],
  RELATIONSHIP_REVIEWS_COMPLETED: ['GROWTH', 'COUNT', 'Revisiones de relación completadas'],
  WARM_OPPORTUNITIES_CREATED: ['GROWTH', 'COUNT', 'Oportunidades cálidas creadas'],
  CONSENTED_REFERRALS_OBTAINED: ['GROWTH', 'COUNT', 'Referidos consentidos obtenidos'],
  CENTERS_OF_INFLUENCE_STRENGTHENED: ['GROWTH', 'COUNT', 'Centros de influencia fortalecidos'],
  OPPORTUNITIES_RETURNED_TO_PIPELINE: ['GROWTH', 'COUNT', 'Oportunidades devueltas a Pipeline'],

  ADVISOR_WORK_MINUTES: ['PRODUCTIVITY', 'MINUTES', 'Minutos de trabajo registrados'],
  CONFIRMED_PRODUCTION_COUNT: ['PRODUCTIVITY', 'COUNT', 'Producción confirmada'],
  ACCEPTED_RECOMMENDATIONS: ['PRODUCTIVITY', 'COUNT', 'Recomendaciones aceptadas'],
  COMPLETED_MINIMUM_USEFUL_ACTIONS: ['PRODUCTIVITY', 'COUNT', 'Acciones mínimas útiles completadas'],
  RESPONSE_ATTEMPTS: ['PRODUCTIVITY', 'COUNT', 'Intentos con respuesta medible'],
  RESPONSES_RECEIVED: ['PRODUCTIVITY', 'COUNT', 'Respuestas recibidas'],
  CONVERSION_STARTS: ['PRODUCTIVITY', 'COUNT', 'Inicios de conversión'],
  CONVERSION_SUCCESSES: ['PRODUCTIVITY', 'COUNT', 'Conversiones confirmadas'],
  SIGNAL_TO_ACTION_SECONDS_TOTAL: ['PRODUCTIVITY', 'SECONDS', 'Segundos acumulados de señal a acción'],
  SIGNAL_TO_ACTION_COUNT: ['PRODUCTIVITY', 'COUNT', 'Acciones con tiempo de respuesta medido'],

  USEFUL_RECOMMENDATION_FEEDBACK: ['LEARNING', 'COUNT', 'Recomendaciones reportadas como útiles'],
  NOT_USEFUL_RECOMMENDATION_FEEDBACK: ['LEARNING', 'COUNT', 'Recomendaciones reportadas como no útiles'],
  INDEPENDENT_OUTCOME_FEEDBACK: ['LEARNING', 'COUNT', 'Resultados reportados como independientes'],
});

const FORBIDDEN_KEYS = new Set([
  'advisorScore',
  'productivityScore',
  'humanScore',
  'humanWorth',
  'advisorWorth',
  'advisorRanking',
  'disciplineScore',
  'motivationScore',
  'coachabilityScore',
  'employmentRecommendation',
  'contactVolumeTarget',
]);

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  throw error;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function assertSafe(value, path = 'payload') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.entries(value).forEach(([key, nested]) => {
    if (FORBIDDEN_KEYS.has(key)) {
      fail('CARTERA100_HUMAN_SCORE_OR_ENFORCEMENT_FIELD_FORBIDDEN', { path: `${path}.${key}` });
    }
    assertSafe(nested, `${path}.${key}`);
  });
}

function text(value, fallback = '', maxLength = 500) {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized ? normalized.slice(0, maxLength) : fallback;
}

function finite(value, code) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) fail(code);
  return number;
}

function isoDate(value, code) {
  const normalized = text(value, '', 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) fail(code);
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) fail(code);
  return normalized;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(value, max = 40) {
  return Object.freeze([...new Set(list(value)
    .map(item => text(item, '', 240))
    .filter(Boolean))].slice(0, max));
}

function metricDefinition(metricKey) {
  const definition = METRICS[metricKey];
  if (!definition) fail('CARTERA100_METRIC_KEY_INVALID');
  return definition;
}

function normalizeMetric(raw = {}) {
  const metricKey = text(raw.metricKey, '', 100).toUpperCase();
  const [category, expectedUnit, label] = metricDefinition(metricKey);
  const state = text(raw.state || raw.metricState, 'UNKNOWN', 30).toUpperCase();
  if (!SIGNAL_STATES.includes(state)) fail('CARTERA100_SIGNAL_STATE_INVALID');
  const unit = text(raw.unit, expectedUnit, 30).toUpperCase();
  if (unit !== expectedUnit) fail('CARTERA100_METRIC_UNIT_MISMATCH');
  const evidenceReferences = uniqueStrings(raw.evidenceReferences);
  const sourceAuthority = text(raw.sourceAuthority, '', 120).toUpperCase();
  if (!sourceAuthority) fail('CARTERA100_SOURCE_AUTHORITY_REQUIRED');

  const valueAllowed = ['KNOWN', 'ZERO', 'STALE', 'INCOMPLETE', 'CONFLICTING'].includes(state);
  const value = valueAllowed ? finite(raw.value ?? raw.quantity ?? 0, 'CARTERA100_METRIC_VALUE_INVALID') : null;

  if (state === 'ZERO' && (value !== 0 || evidenceReferences.length === 0)) {
    fail('CARTERA100_EXPLICIT_ZERO_REQUIRES_DIRECT_EVIDENCE');
  }
  if (state === 'KNOWN' && value === 0) {
    fail('CARTERA100_KNOWN_ZERO_MUST_USE_ZERO_STATE');
  }
  if (['UNKNOWN', 'MISSING'].includes(state) && raw.value !== undefined && raw.value !== null) {
    fail('CARTERA100_UNKNOWN_OR_MISSING_CANNOT_CARRY_VALUE');
  }
  if (['KNOWN', 'STALE', 'INCOMPLETE', 'CONFLICTING'].includes(state) && evidenceReferences.length === 0) {
    fail('CARTERA100_EVIDENCE_REQUIRED');
  }

  return Object.freeze({
    metricKey,
    category,
    label,
    state,
    value,
    unit,
    currency: unit === 'CURRENCY' ? text(raw.currency, '', 10).toUpperCase() || null : null,
    sourceAuthority,
    sourceOwner: text(raw.sourceOwner, sourceAuthority, 120).toUpperCase(),
    evidenceReferences,
    observedAt: raw.observedAt || raw.occurredAt || null,
    freshness: text(raw.freshness, state === 'STALE' ? 'STALE' : 'CURRENT', 30).toUpperCase(),
    limitation: text(raw.limitation, '', 500) || null,
    confidence: text(raw.confidence, 'EVIDENCE_BOUND', 40).toUpperCase(),
  });
}

function missingMetric(metricKey) {
  const [category, unit, label] = metricDefinition(metricKey);
  return Object.freeze({
    metricKey,
    category,
    label,
    state: 'MISSING',
    value: null,
    unit,
    currency: null,
    sourceAuthority: 'NOT_CONNECTED',
    sourceOwner: 'NOT_CONNECTED',
    evidenceReferences: Object.freeze([]),
    observedAt: null,
    freshness: 'UNKNOWN',
    limitation: 'No existe evidencia suficiente para este periodo.',
    confidence: 'UNKNOWN',
  });
}

function mergeMetricGroup(metricKey, metrics) {
  if (!metrics.length) return missingMetric(metricKey);
  const [category, unit, label] = metricDefinition(metricKey);
  const currencies = [...new Set(metrics.map(item => item.currency).filter(Boolean))];
  const authorities = [...new Set(metrics.map(item => item.sourceAuthority))];
  const states = new Set(metrics.map(item => item.state));
  const evidenceReferences = uniqueStrings(metrics.flatMap(item => item.evidenceReferences));

  if (unit === 'CURRENCY' && currencies.length > 1) {
    return Object.freeze({
      metricKey,
      category,
      label,
      state: 'CONFLICTING',
      value: metrics.reduce((total, item) => total + (item.value || 0), 0),
      unit,
      currency: null,
      sourceAuthority: authorities.join('+'),
      sourceOwner: authorities.join('+'),
      evidenceReferences,
      observedAt: null,
      freshness: 'CONFLICTING',
      limitation: 'Existen monedas incompatibles; no se sumó un valor financiero interpretable.',
      confidence: 'CONFLICTING',
    });
  }

  const priority = ['CONFLICTING', 'INCOMPLETE', 'STALE', 'UNKNOWN', 'MISSING', 'KNOWN', 'ZERO'];
  let state = priority.find(candidate => states.has(candidate)) || 'UNKNOWN';
  const value = metrics.reduce((total, item) => total + (item.value || 0), 0);
  if (!['CONFLICTING', 'INCOMPLETE', 'STALE', 'UNKNOWN', 'MISSING'].includes(state)) {
    state = value === 0 ? 'ZERO' : 'KNOWN';
  }

  return Object.freeze({
    metricKey,
    category,
    label,
    state,
    value: ['UNKNOWN', 'MISSING'].includes(state) ? null : value,
    unit,
    currency: currencies[0] || null,
    sourceAuthority: authorities.join('+'),
    sourceOwner: authorities.join('+'),
    evidenceReferences,
    observedAt: metrics.map(item => item.observedAt).filter(Boolean).sort().at(-1) || null,
    freshness: states.has('STALE') ? 'STALE' : states.has('INCOMPLETE') ? 'INCOMPLETE' : 'CURRENT',
    limitation: metrics.map(item => item.limitation).filter(Boolean).join(' ') || null,
    confidence: state === 'KNOWN' || state === 'ZERO' ? 'EVIDENCE_BOUND' : state,
  });
}

function ratioSignal(numerator, denominator, metricKey, label, unit) {
  const evidenceReferences = uniqueStrings([
    ...numerator.evidenceReferences,
    ...denominator.evidenceReferences,
  ]);
  const blockedState = ['CONFLICTING', 'INCOMPLETE', 'STALE', 'UNKNOWN', 'MISSING']
    .find(state => numerator.state === state || denominator.state === state);
  if (blockedState) {
    return Object.freeze({ metricKey, label, state: blockedState, value: null, unit, evidenceReferences });
  }
  if (denominator.value === 0) {
    return Object.freeze({ metricKey, label, state: 'UNKNOWN', value: null, unit, evidenceReferences });
  }
  return Object.freeze({
    metricKey,
    label,
    state: numerator.value === 0 ? 'ZERO' : 'KNOWN',
    value: numerator.value / denominator.value,
    unit,
    evidenceReferences,
  });
}

function createDerived(metricsByKey) {
  const get = key => metricsByKey[key];
  return deepFreeze({
    averagePolicyReviewMinutes: ratioSignal(
      get('POLICY_REVIEW_MINUTES_TOTAL'),
      get('IMPORTED_POLICY_REVIEW_COUNT'),
      'AVERAGE_POLICY_REVIEW_MINUTES',
      'Promedio de revisión por póliza importada',
      'MINUTES_PER_POLICY'
    ),
    productionPerAdvisorHour: ratioSignal(
      get('CONFIRMED_PRODUCTION_COUNT'),
      {
        ...get('ADVISOR_WORK_MINUTES'),
        value: get('ADVISOR_WORK_MINUTES').value == null
          ? null
          : get('ADVISOR_WORK_MINUTES').value / 60,
      },
      'PRODUCTION_PER_ADVISOR_HOUR',
      'Producción confirmada por hora registrada',
      'COUNT_PER_HOUR'
    ),
    responseRate: ratioSignal(
      get('RESPONSES_RECEIVED'),
      get('RESPONSE_ATTEMPTS'),
      'RESPONSE_RATE',
      'Tasa de respuesta observable',
      'RATIO'
    ),
    conversionRate: ratioSignal(
      get('CONVERSION_SUCCESSES'),
      get('CONVERSION_STARTS'),
      'CONVERSION_RATE',
      'Conversión observable',
      'RATIO'
    ),
    averageSignalToActionSeconds: ratioSignal(
      get('SIGNAL_TO_ACTION_SECONDS_TOTAL'),
      get('SIGNAL_TO_ACTION_COUNT'),
      'AVERAGE_SIGNAL_TO_ACTION_SECONDS',
      'Tiempo promedio de señal a acción',
      'SECONDS_PER_ACTION'
    ),
  });
}

function statementMetric(metric, formatter) {
  if (!metric || !['KNOWN', 'ZERO'].includes(metric.state)) return null;
  return formatter(metric.value, metric);
}

function createStatement(metricsByKey) {
  const parts = [];
  const work = statementMetric(metricsByKey.WORK_MINUTES_AVOIDED, value => `${(value / 60).toFixed(1)} h administrativas evitadas`);
  const protectedValue = statementMetric(metricsByKey.PROTECTED_EXPECTED_VALUE, (value, metric) => (
    metric.currency ? `${value.toLocaleString('es-MX')} ${metric.currency} de valor esperado protegido` : null
  ));
  const growth = statementMetric(metricsByKey.SECOND_POLICY_REVIEWS, value => `${value} revisiones responsables de crecimiento`);
  const actions = statementMetric(metricsByKey.COMPLETED_MINIMUM_USEFUL_ACTIONS, value => `${value} acciones mínimas útiles completadas`);
  [work, protectedValue, growth, actions].filter(Boolean).forEach(value => parts.push(value));
  if (!parts.length) {
    return Object.freeze({
      state: 'INSUFFICIENT_EVIDENCE',
      text: 'Aún no hay evidencia suficiente para afirmar cuánto trabajo, valor o crecimiento produjo Forge en este periodo.',
      causalClaimMade: false,
    });
  }
  return Object.freeze({
    state: 'EVIDENCE_AVAILABLE',
    text: `En este periodo Forge tiene evidencia de ${parts.join(', ')}.`,
    causalClaimMade: false,
  });
}

function latestFeedbackByRecommendation(observations) {
  const latest = new Map();
  observations
    .filter(item => item.recommendationReference && item.usefulnessFeedback && item.usefulnessFeedback !== 'UNSET')
    .sort((left, right) => String(left.recordedAt || left.occurredAt || '').localeCompare(String(right.recordedAt || right.occurredAt || '')))
    .forEach(item => latest.set(item.recommendationReference, item));
  return latest;
}

function normalizeRecommendation(raw, latestFeedback) {
  const recommendationReference = text(raw.recommendationReference, '', 240);
  if (!recommendationReference) return null;
  const feedback = latestFeedback.get(recommendationReference);
  return Object.freeze({
    recommendationReference,
    recommendationClass: text(raw.recommendationClass || raw.metadata?.recommendationClass, 'UNCLASSIFIED', 120).toUpperCase(),
    sourceAuthority: text(raw.sourceAuthority, 'UNKNOWN', 120).toUpperCase(),
    occurredAt: raw.occurredAt || null,
    evidenceReferences: uniqueStrings(raw.evidenceReferences),
    feedback: feedback?.usefulnessFeedback || 'UNSET',
    attributionState: feedback?.attributionState || raw.attributionState || 'UNKNOWN',
    causalCreditClaimed: false,
  });
}

export function createCartera100ProductivityProof(raw = {}) {
  const { boundaries: suppliedBoundaries, ...safeRaw } = raw || {};
  assertSafe(safeRaw);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('CARTERA100_PROOF_INPUT_INVALID');
  const period = raw.period || {};
  const startDate = isoDate(period.startDate, 'CARTERA100_PERIOD_START_INVALID');
  const endDate = isoDate(period.endDate, 'CARTERA100_PERIOD_END_INVALID');
  if (startDate > endDate) fail('CARTERA100_PERIOD_RANGE_INVALID');

  const normalized = [
    ...list(raw.authoritativeMetrics),
    ...list(raw.observations).map(item => ({
      ...item,
      state: item.metricState || item.state || 'KNOWN',
      value: item.quantity ?? item.value,
    })),
  ].map(normalizeMetric);

  const groups = new Map(Object.keys(METRICS).map(key => [key, []]));
  normalized.forEach(metric => groups.get(metric.metricKey).push(metric));
  const metricsByKey = Object.fromEntries(
    [...groups.entries()].map(([metricKey, metrics]) => [metricKey, mergeMetricGroup(metricKey, metrics)])
  );

  const latestFeedback = latestFeedbackByRecommendation(list(raw.observations));
  const recommendations = list(raw.recentRecommendations)
    .map(item => normalizeRecommendation(item, latestFeedback))
    .filter(Boolean);

  const proof = {
    period: Object.freeze({
      startDate,
      endDate,
      timeZone: text(period.timeZone, 'America/Mexico_City', 80),
    }),
    metrics: deepFreeze(metricsByKey),
    categories: deepFreeze(Object.fromEntries(CATEGORIES.map(category => [
      category,
      Object.values(metricsByKey).filter(metric => metric.category === category),
    ]))),
    derived: createDerived(metricsByKey),
    statement: createStatement(metricsByKey),
    recommendations: Object.freeze(recommendations),
    sourceState: deepFreeze(raw.sourceState || {}),
    instrumentation: deepFreeze(raw.instrumentation || {}),
    boundaries: deepFreeze({
      humanPerformanceScore: false,
      advisorRanking: false,
      humanWorthInference: false,
      motivationInference: false,
      disciplineInference: false,
      enforcementRecommendation: false,
      silentConsentInference: false,
      contactVolumeOptimization: false,
      causalityClaimWithoutEvidence: false,
      automaticContactExecution: false,
      automaticMessageGeneration: false,
      automaticTaskCreation: false,
      automaticCalendarCreation: false,
      automaticOpportunityCreation: false,
      advisorFeedbackRequiredForLearning: true,
      ...suppliedBoundaries,
    }),
    projectionAuthority: 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL',
    readOnly: true,
  };

  if (Object.values(proof.boundaries).some((value, index) => {
    const key = Object.keys(proof.boundaries)[index];
    return key === 'advisorFeedbackRequiredForLearning' ? value !== true : value !== false;
  })) {
    fail('CARTERA100_BOUNDARY_INVALID');
  }
  return deepFreeze(proof);
}

export const CARTERA_100_SIGNAL_STATES = SIGNAL_STATES;
export const CARTERA_100_METRIC_DEFINITIONS = METRICS;
export const CARTERA_100_CATEGORIES = CATEGORIES;
