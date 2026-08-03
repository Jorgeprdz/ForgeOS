const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};
const text = value => String(value ?? '').trim();
const finite = value => Number.isFinite(Number(value)) ? Number(value) : null;
const array = value => Array.isArray(value) ? value : [];

export class ManagementTruthError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'ManagementTruthError';
    this.code = code;
    this.details = details;
  }
}
const fail = (code, message, details = null) => {
  throw new ManagementTruthError(code, message, details);
};

function periodKey(value) {
  const normalized = text(value);
  if (/^\d{4}-\d{2}$/.test(normalized)) return normalized;
  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) return normalized.slice(0, 7);
  return null;
}

function resolveManagementPeriod(activityReport = {}) {
  return periodKey(activityReport?.production?.yearMonth)
    || periodKey(activityReport?.period?.current?.from)
    || periodKey(activityReport?.generatedAt)
    || null;
}

function sourcePeriod(value = {}) {
  return periodKey(value?.yearMonth)
    || periodKey(value?.period?.yearMonth)
    || periodKey(value?.period?.from)
    || periodKey(value?.generatedAt)
    || null;
}

function assertAdvisor(value, advisorId, sourceId) {
  const observed = text(value?.advisorId || value?.advisorReference) || null;
  if (observed && advisorId && observed !== advisorId) {
    fail('CROSS_ADVISOR_SOURCE_REJECTED', `${sourceId} pertenece a otro asesor.`, {
      sourceId,
      expectedAdvisorId: advisorId,
      observedAdvisorId: observed,
    });
  }
}

function assertPeriod(value, expectedPeriod, sourceId) {
  const observed = sourcePeriod(value);
  if (observed && expectedPeriod && observed !== expectedPeriod) {
    fail('SOURCE_PERIOD_MISMATCH', `${sourceId} pertenece a otro periodo.`, {
      sourceId,
      expectedPeriod,
      observedPeriod: observed,
    });
  }
}

async function safeSource(sourceId, loader) {
  try {
    return freeze({ sourceId, state: 'READY', value: await loader(), error: null });
  } catch (error) {
    return freeze({
      sourceId,
      state: error?.code === 'SOURCE_PERIOD_MISMATCH' ? 'PERIOD_MISMATCH' : 'UNAVAILABLE',
      value: null,
      error: freeze({
        code: error?.code || error?.name || 'SOURCE_UNAVAILABLE',
        message: error?.message || `${sourceId} no está disponible.`,
        details: error?.details || null,
      }),
    });
  }
}

function readForecastExpected(value = {}) {
  return finite(
    value?.expectedPolicyCount
    ?? value?.expectedPolicies
    ?? value?.summary?.expectedPolicyCount
    ?? value?.summary?.expectedPolicies
    ?? value?.readModel?.expectedPolicyCount
    ?? value?.readModel?.expectedPolicies
    ?? value?.snapshot?.expectedPolicyCount
    ?? value?.snapshot?.expectedPolicies,
  );
}

function readForecastClassification(value = {}) {
  return text(
    value?.classification
    || value?.summary?.classification
    || value?.readModel?.classification
    || value?.snapshot?.classification,
  ) || null;
}

function readEvidence(value = {}) {
  return [...new Set([
    ...array(value?.evidence),
    ...array(value?.evidenceRefs),
    ...array(value?.sourceEvidenceIds),
    ...array(value?.readModel?.evidenceRefs),
    ...array(value?.snapshot?.evidenceRefs),
  ].map(text).filter(Boolean))];
}

function assertCompensationBasis(value = {}) {
  const basis = text(value?.basis || value?.sourceBasis || value?.truthBasis).toUpperCase();
  if (/QUOTE|PREMIUM|ISSUED_PREMIUM|POLICY_PREMIUM/.test(basis)) {
    fail('COMPENSATION_SOURCE_BASIS_FORBIDDEN', 'Cotizaciones o primas no pueden convertirse en ingreso.', { basis });
  }
}

function compensationAmounts(value = {}) {
  assertCompensationBasis(value);
  return freeze({
    earned: finite(value?.earned ?? value?.summary?.earned ?? value?.current?.earned),
    paid: finite(value?.paid ?? value?.summary?.paid ?? value?.current?.paid),
    currency: text(value?.currency || value?.summary?.currency || value?.current?.currency) || null,
    basis: text(value?.basis || value?.sourceBasis || value?.truthBasis) || 'CONFIRMED_COMPENSATION_EVENTS',
  });
}

function card({ id, label, value, truthType, authority, unit = null, sourceState = 'READY', evidence = [] }) {
  return freeze({
    id,
    label,
    value,
    truthType,
    authority,
    unit,
    sourceState,
    evidence: freeze([...evidence]),
    unknown: value === null,
  });
}

function buildCards({ activityReport, forecast, compensation }) {
  const activityCurrent = finite(activityReport?.activity?.comparison?.current);
  const sold = finite(activityReport?.production?.sold);
  const target = finite(activityReport?.production?.target);
  const goalGap = sold === null || target === null ? null : Math.max(0, target - sold);
  const forecastExpected = readForecastExpected(forecast);
  const forecastEvidence = readEvidence(forecast);
  const pay = compensation ? compensationAmounts(compensation) : freeze({ earned: null, paid: null, currency: null });

  return freeze([
    card({ id: 'ACTIVITY_COUNT', label: 'Actividad registrada', value: activityCurrent, truthType: 'FACT', authority: 'FES_REP_ACTIVITY', unit: 'ACTIVITIES' }),
    card({ id: 'POLICIES_SOLD', label: 'Pólizas confirmadas', value: sold, truthType: 'FACT', authority: 'CANONICAL_POLICY_CONFIRMED_VERSION', unit: 'POLICIES' }),
    card({ id: 'POLICY_TARGET', label: 'Meta mensual', value: target, truthType: 'TARGET', authority: 'ADVISOR_MONTHLY_POLICY_GOAL', unit: 'POLICIES' }),
    card({ id: 'GOAL_GAP', label: 'Brecha contra meta', value: goalGap, truthType: 'DERIVED', authority: 'SPRINT_10_MANAGEMENT_PROJECTION', unit: 'POLICIES' }),
    card({ id: 'FORECAST_EXPECTED_POLICIES', label: 'Pólizas esperadas', value: forecastExpected, truthType: 'FORECAST', authority: 'ADVISOR_FORECAST_ISSUED_SNAPSHOT', unit: 'EXPECTED_POLICIES', evidence: forecastEvidence }),
    card({ id: 'COMPENSATION_EARNED', label: 'Compensación devengada', value: pay.earned, truthType: 'EARNED', authority: 'ADVISOR_COMPENSATION_AUTHORITY', unit: pay.currency }),
    card({ id: 'COMPENSATION_PAID', label: 'Compensación pagada', value: pay.paid, truthType: 'PAID', authority: 'ADVISOR_COMPENSATION_AUTHORITY', unit: pay.currency }),
  ]);
}

function buildFunnel(forecast = {}) {
  const opportunities = array(
    forecast?.opportunities
    || forecast?.readModel?.opportunities
    || forecast?.snapshot?.opportunities,
  );
  const byClassification = {};
  for (const item of opportunities) {
    const classification = text(item?.classification).toUpperCase() || 'UNKNOWN';
    byClassification[classification] = (byClassification[classification] || 0) + 1;
  }
  return freeze({
    opportunityCount: opportunities.length,
    byClassification: freeze(byClassification),
    classificationSource: 'ADVISOR_FORECAST_ISSUED_SNAPSHOT',
    probabilitiesRecalculated: false,
  });
}

export function createManagementTruthRuntime({
  activityReportsAuthority,
  forecastAuthority = null,
  compensationAuthority = null,
} = {}) {
  if (!activityReportsAuthority?.load) {
    fail('ACTIVITY_REPORTS_AUTHORITY_REQUIRED', 'Activity Reports es obligatorio.');
  }

  async function loadManagementStory({ periodKind = 'MONTH_TO_DATE' } = {}) {
    const activitySource = await safeSource('ACTIVITY_REPORTS', () => activityReportsAuthority.load({ periodKind }));
    if (activitySource.state !== 'READY' || !activitySource.value) {
      return freeze({
        status: 'SOURCE_UNAVAILABLE',
        periodKind,
        period: null,
        advisorId: null,
        sources: freeze([activitySource]),
        cards: freeze([]),
        report: null,
        unknownAsZero: false,
      });
    }

    const activityReport = activitySource.value;
    const advisorId = text(activityReport?.advisorId) || null;
    const period = resolveManagementPeriod(activityReport);

    const embeddedForecast = activityReport?.forecast?.readModel
      || activityReport?.forecast?.snapshot
      || activityReport?.forecast
      || null;
    const forecastSource = await safeSource('FORECAST', async () => {
      const value = forecastAuthority?.loadForecast
        ? await forecastAuthority.loadForecast({ advisorId, period, periodKind })
        : embeddedForecast;
      if (!value) fail('FORECAST_NOT_ISSUED', 'Forecast todavía no tiene un snapshot emitido.');
      assertAdvisor(value, advisorId, 'FORECAST');
      assertPeriod(value, period, 'FORECAST');
      return value;
    });

    const compensationSource = await safeSource('COMPENSATION', async () => {
      if (!compensationAuthority?.readProduct) {
        fail('COMPENSATION_AUTHORITY_UNAVAILABLE', 'Compensation no está conectada.');
      }
      const value = await compensationAuthority.readProduct({ advisorId, period, periodKind });
      assertAdvisor(value, advisorId, 'COMPENSATION');
      assertPeriod(value, period, 'COMPENSATION');
      assertCompensationBasis(value);
      return value;
    });

    const sources = freeze([activitySource, forecastSource, compensationSource]);
    const status = sources.every(source => source.state === 'READY') ? 'READY' : 'PARTIAL';
    const cards = buildCards({
      activityReport,
      forecast: forecastSource.value,
      compensation: compensationSource.value,
    });
    const funnel = buildFunnel(forecastSource.value);
    const report = freeze({
      status,
      period,
      activity: freeze({
        current: cards.find(item => item.id === 'ACTIVITY_COUNT'),
        comparison: activityReport?.activity?.comparison || null,
      }),
      funnel,
      production: freeze({
        sold: cards.find(item => item.id === 'POLICIES_SOLD'),
        goal: cards.find(item => item.id === 'POLICY_TARGET'),
        gap: cards.find(item => item.id === 'GOAL_GAP'),
      }),
      forecast: freeze({
        expected: cards.find(item => item.id === 'FORECAST_EXPECTED_POLICIES'),
        classification: readForecastClassification(forecastSource.value),
      }),
      compensation: freeze({
        earned: cards.find(item => item.id === 'COMPENSATION_EARNED'),
        paid: cards.find(item => item.id === 'COMPENSATION_PAID'),
        combinedTotal: null,
      }),
      truthLabelsPreserved: true,
      sourceTrace: freeze(sources.map(source => freeze({
        sourceId: source.sourceId,
        state: source.state,
        errorCode: source.error?.code || null,
      }))),
    });

    return freeze({
      status,
      periodKind,
      period,
      advisorId,
      sources,
      cards,
      report,
      unknownAsZero: false,
      directDatabaseWrite: false,
      automaticDecision: false,
    });
  }

  return freeze({
    loadManagementStory,
    diagnostics: () => freeze({
      activityAuthority: 'FES_REP_ACTIVITY',
      productionAuthority: 'CANONICAL_POLICY_CONFIRMED_VERSION',
      goalAuthority: 'ADVISOR_MONTHLY_POLICY_GOAL',
      forecastAuthority: 'ADVISOR_FORECAST_ISSUED_SNAPSHOT',
      compensationAuthority: 'ADVISOR_COMPENSATION_AUTHORITY',
      reportsAuthority: 'SPRINT_10_MANAGEMENT_PROJECTION',
      forecastRecalculation: false,
      compensationRecalculation: false,
      paidEqualsEarned: false,
      quoteAsIncome: false,
      premiumAsPaidIncome: false,
      unknownAsZero: false,
      directDatabaseWrite: false,
      automaticDecision: false,
    }),
  });
}
