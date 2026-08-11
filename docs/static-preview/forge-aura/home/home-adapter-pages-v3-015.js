import { createHomePagesAdapter as createPreviousAdapter } from './home-adapter-pages-v2.js?v=forge-commercial-compass-015-base';
import { createIncomeAdapter } from '../income/income-adapter-pages-v1.js?v=forge-commercial-compass-015';
import { projectIncomeReadModel } from '../income/income-core.js?v=forge-commercial-compass-015';
import { createAdvisorMonthlyPolicyGoalRepository } from '../../forge-alive/home-authorities/repo/advisor-os/forge-alive/smart-widgets/advisor-monthly-policy-goal-repository.mjs';

const TIME_ZONE = 'America/Mexico_City';
const GOAL_REASON_PREFIX = 'HOME_MONTHLY_GOALS_V2:';
const HANDOFF = Symbol.for('forge.aura.commercial-compass.015');
const PHASE = 'FORGE_COMMERCIAL_COMPASS_015';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function dateParts(value, timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value instanceof Date ? value : new Date(value));
  return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
}

function monthKey(value, timeZone = TIME_ZONE) {
  const parts = dateParts(value, timeZone);
  return `${parts.year}-${parts.month}`;
}

function currentYear(value, timeZone = TIME_ZONE) {
  return Number(dateParts(value, timeZone).year);
}

function ytdPeriods(value, timeZone = TIME_ZONE) {
  const parts = dateParts(value, timeZone);
  const year = Number(parts.year);
  const month = Number(parts.month);
  return Array.from({ length: month }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`);
}

function daysInMonth(yearMonth) {
  const [year, month] = String(yearMonth || '').split('-').map(Number);
  return Number.isInteger(year) && Number.isInteger(month) ? new Date(Date.UTC(year, month, 0)).getUTCDate() : null;
}

function dayOfYear(value, timeZone = TIME_ZONE) {
  const parts = dateParts(value, timeZone);
  const start = Date.UTC(Number(parts.year), 0, 1);
  const current = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  return Math.floor((current - start) / 86400000) + 1;
}

function daysInYear(year) {
  return new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1 ? 366 : 365;
}

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function integerPositive(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function parseGoalPayload(reason) {
  if (typeof reason !== 'string' || !reason.startsWith(GOAL_REASON_PREFIX)) return {};
  try {
    const parsed = JSON.parse(reason.slice(GOAL_REASON_PREFIX.length));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeGoals(goalSnapshot) {
  if (!goalSnapshot) {
    return freeze({ state: 'MISSING', targetMonthlyIncomeMxn: null, targetMonthlyPolicyCount: null, targetAnnualIncomeMxn: null, targetAnnualPolicyCount: null, annualPolicyCountDerived: false, revision: null });
  }
  const payload = parseGoalPayload(goalSnapshot.reason);
  const monthlyPolicies = integerPositive(goalSnapshot.targetPolicyCount);
  const annualPoliciesExplicit = integerPositive(payload.targetAnnualPolicyCount);
  const annualPolicies = annualPoliciesExplicit || (monthlyPolicies ? monthlyPolicies * 12 : null);
  const monthlyIncome = finitePositive(payload.targetMonthlyIncomeMxn);
  const annualIncome = finitePositive(payload.targetAnnualIncomeMxn);
  const complete = Boolean(monthlyPolicies && monthlyIncome && annualIncome && annualPolicies);
  return freeze({
    state: complete ? 'READY' : 'PARTIAL',
    targetMonthlyIncomeMxn: monthlyIncome,
    targetMonthlyPolicyCount: monthlyPolicies,
    targetAnnualIncomeMxn: annualIncome,
    targetAnnualPolicyCount: annualPolicies,
    annualPolicyCountDerived: annualPoliciesExplicit ? payload.annualPolicyCountDerived === true : Boolean(monthlyPolicies),
    currency: payload.currency || 'MXN',
    revision: goalSnapshot.revision || null,
    source: 'ADVISOR_MONTHLY_POLICY_GOAL',
    yearMonth: goalSnapshot.yearMonth || null,
  });
}

function progress(actual, target) {
  if (!Number.isFinite(Number(actual)) || !Number.isFinite(Number(target)) || Number(target) <= 0) {
    return freeze({ actual: Number.isFinite(Number(actual)) ? Number(actual) : null, target: Number.isFinite(Number(target)) ? Number(target) : null, gap: null, ratio: null, percent: null });
  }
  const a = Number(actual);
  const t = Number(target);
  const ratio = a / t;
  return freeze({ actual: a, target: t, gap: Math.max(0, t - a), ratio, percent: Math.round(ratio * 100) });
}

function rhythm(progressRatio, expectedRatio) {
  if (!Number.isFinite(progressRatio) || !Number.isFinite(expectedRatio)) return 'UNKNOWN';
  const delta = progressRatio - expectedRatio;
  if (delta >= 0.05) return 'AHEAD';
  if (delta <= -0.05) return 'BEHIND';
  return 'ON_TRACK';
}

async function authenticatedAdvisorId(client, expectedId) {
  const result = await client.auth.getUser();
  const advisorId = result?.data?.user?.id || null;
  if (result?.error || !advisorId) throw new Error('COMMERCIAL_COMPASS_SESSION_REQUIRED');
  if (expectedId && expectedId !== advisorId) throw new Error('COMMERCIAL_COMPASS_CROSS_ADVISOR_BLOCKED');
  return advisorId;
}

function isoFromDate(value) {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T12:00:00.000Z`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function loadConfirmedPolicyFacts({ client, advisorId, signal }) {
  if (signal?.aborted) throw new DOMException('Commercial Compass request aborted', 'AbortError');
  await authenticatedAdvisorId(client, advisorId);
  let policyQuery = client.from('canonical_policies').select('id,policy_reference,issue_date,archived_at');
  if (typeof policyQuery.is === 'function') policyQuery = policyQuery.is('archived_at', null);
  if (signal && typeof policyQuery.abortSignal === 'function') policyQuery = policyQuery.abortSignal(signal);
  const policyResult = await policyQuery;
  if (policyResult?.error) throw Object.assign(new Error('COMMERCIAL_COMPASS_POLICY_READ_FAILED'), { cause: policyResult.error });
  const policies = (policyResult?.data || []).filter(policy => !policy.archived_at && policy.id && policy.policy_reference);
  if (!policies.length) return freeze({ policyFacts: [], sourceComplete: true });

  let versionQuery = client
    .from('policy_versions')
    .select('policy_id,policy_version_reference,version_number,confirmed_at')
    .in('policy_id', policies.map(policy => policy.id))
    .order('version_number', { ascending: true });
  if (signal && typeof versionQuery.abortSignal === 'function') versionQuery = versionQuery.abortSignal(signal);
  const versionResult = await versionQuery;
  if (versionResult?.error) throw Object.assign(new Error('COMMERCIAL_COMPASS_POLICY_VERSION_READ_FAILED'), { cause: versionResult.error });
  const firstConfirmedByPolicy = new Map();
  for (const version of versionResult?.data || []) {
    if (!version?.policy_id || !version.confirmed_at || firstConfirmedByPolicy.has(version.policy_id)) continue;
    firstConfirmedByPolicy.set(version.policy_id, version);
  }
  const policyFacts = policies.flatMap(policy => {
    const confirmed = firstConfirmedByPolicy.get(policy.id);
    if (!confirmed) return [];
    const soldAt = isoFromDate(policy.issue_date) || isoFromDate(confirmed.confirmed_at);
    if (!soldAt) return [];
    return [freeze({
      advisorId,
      eventType: 'POLICY_SOLD_CONFIRMED',
      policyId: policy.policy_reference,
      soldAt,
      occurredAt: isoFromDate(confirmed.confirmed_at),
      evidenceRef: confirmed.policy_version_reference || policy.policy_reference,
      sourceOwner: 'PRODUCTION_EVENTS',
      authority: 'CANONICAL_POLICY_CONFIRMED_VERSION',
      dateAuthority: policy.issue_date ? 'POLICY_ISSUE_DATE' : 'CONFIRMED_AT_FALLBACK',
    })];
  });
  return freeze({ policyFacts, sourceComplete: policyFacts.length === firstConfirmedByPolicy.size });
}

function productionSnapshot(facts, asOf) {
  const currentMonth = monthKey(asOf);
  const year = currentYear(asOf);
  const unique = new Map();
  for (const fact of Array.isArray(facts) ? facts : []) {
    if (fact?.eventType !== 'POLICY_SOLD_CONFIRMED' || !fact.policyId || !fact.soldAt) continue;
    unique.set(fact.policyId, fact);
  }
  const all = [...unique.values()];
  const monthly = all.filter(fact => monthKey(fact.soldAt) === currentMonth);
  const annual = all.filter(fact => currentYear(fact.soldAt) === year);
  return freeze({
    monthlyCount: monthly.length,
    annualCount: annual.length,
    currentMonth,
    year,
    familyProtectedDefinition: 'ONE_CONFIRMED_SOLD_POLICY',
    source: 'PRODUCTION_EVENTS',
    evidenceRefs: all.map(fact => fact.evidenceRef).filter(Boolean),
  });
}

function incomeSnapshot(projected) {
  const generated = projected?.generated || {};
  const pipeline = projected?.pipelineScenario || {};
  const combined = projected?.combinedScenario || {};
  const annual = projected?.annual || {};
  return freeze({
    state: String(projected?.state || 'UNKNOWN').toUpperCase(),
    monthlyEstimatedIncomeMxn: Number.isFinite(Number(generated.value)) ? Number(generated.value) : null,
    monthlyPipelineScenarioMxn: Number.isFinite(Number(pipeline.value)) ? Number(pipeline.value) : null,
    monthlyCombinedScenarioMxn: Number.isFinite(Number(combined.value)) ? Number(combined.value) : null,
    annualEstimatedIncomeMxn: Number.isFinite(Number(annual.generatedYtd)) ? Number(annual.generatedYtd) : null,
    annualState: annual.state || 'UNKNOWN',
    generatedBreakdown: generated.evidenceState === 'EARNED' ? freeze({ initial: generated.initial, renewal: generated.renewal, bonus: generated.bonus }) : null,
    pipelineOpportunityCount: Number.isFinite(Number(pipeline.count)) ? Number(pipeline.count) : null,
    source: 'COMPENSATION_INTELLIGENCE',
    safeguards: freeze({ confirmedIncomeIncludesPipeline: false, paidTruthCreated: false, scenarioIsGuarantee: false }),
  });
}

function buildCompass({ goals, production, income, asOf, sourceStates }) {
  const month = monthKey(asOf);
  const parts = dateParts(asOf);
  const expectedMonth = Number(parts.day) / daysInMonth(month);
  const year = Number(parts.year);
  const expectedYear = dayOfYear(asOf) / daysInYear(year);
  const monthlyIncome = progress(income.monthlyEstimatedIncomeMxn, goals.targetMonthlyIncomeMxn);
  const monthlyPolicies = progress(production.monthlyCount, goals.targetMonthlyPolicyCount);
  const annualIncome = progress(income.annualEstimatedIncomeMxn, goals.targetAnnualIncomeMxn);
  const annualPolicies = progress(production.annualCount, goals.targetAnnualPolicyCount);
  const scenario = progress(income.monthlyCombinedScenarioMxn, goals.targetMonthlyIncomeMxn);

  return freeze({
    phase: PHASE,
    asOf: new Date(asOf).toISOString(),
    goalState: goals.state,
    goals,
    current: freeze({ monthlyIncome, monthlyPolicies, annualIncome, annualPolicies }),
    rhythm: freeze({
      monthlyIncome: rhythm(monthlyIncome.ratio, expectedMonth),
      monthlyPolicies: rhythm(monthlyPolicies.ratio, expectedMonth),
      annualIncome: rhythm(annualIncome.ratio, expectedYear),
      annualPolicies: rhythm(annualPolicies.ratio, expectedYear),
      expectedMonthPercent: Math.round(expectedMonth * 100),
      expectedYearPercent: Math.round(expectedYear * 100),
    }),
    opportunity: freeze({
      pipelineIncomeMxn: income.monthlyPipelineScenarioMxn,
      withPipelineIncomeMxn: income.monthlyCombinedScenarioMxn,
      withPipelineProgress: scenario,
      pipelineOpportunityCount: income.pipelineOpportunityCount,
      confirmed: false,
      label: 'Escenario con Pipeline',
    }),
    action: freeze(goals.state === 'MISSING'
      ? { kind: 'DEFINE_GOALS', label: 'Definir mis metas', nav: null }
      : monthlyIncome.ratio === null && monthlyPolicies.ratio === null
        ? { kind: 'REVIEW_SOURCES', label: 'Revisar datos disponibles', nav: 'comisiones' }
        : (monthlyIncome.gap || 0) > 0 || (monthlyPolicies.gap || 0) > 0
          ? { kind: 'OPEN_PIPELINE', label: 'Ver oportunidades para cerrar la brecha', nav: 'pipeline' }
          : { kind: 'KEEP_PACE', label: 'Revisar mi avance', nav: null }),
    sourceStates: freeze(sourceStates),
    boundaries: freeze({
      homeOwnsGoalTruth: false,
      homeOwnsProductionTruth: false,
      homeOwnsCompensationTruth: false,
      pipelineIsConfirmedIncome: false,
      quotesCountAsProduction: false,
      applicationsCountAsProduction: false,
      automaticExecutionAllowed: false,
    }),
  });
}

export async function createHomePagesAdapter(options = {}) {
  const { client, user } = options;
  if (!client || !user?.id) throw new Error('COMMERCIAL_COMPASS_CLIENT_AND_USER_REQUIRED');
  const previous = await createPreviousAdapter(options);
  const incomeAdapter = createIncomeAdapter({ client, user });
  const goalRepository = createAdvisorMonthlyPolicyGoalRepository({
    client,
    getSessionAdvisorId: () => authenticatedAdvisorId(client, user.id),
  });

  async function readGoals(asOf, signal) {
    const goal = await goalRepository.readCurrent({ advisorId: user.id, yearMonth: monthKey(asOf), signal });
    return normalizeGoals(goal);
  }

  async function saveCommercialGoals(input = {}) {
    const monthlyIncome = finitePositive(input.targetMonthlyIncomeMxn);
    const monthlyPolicies = integerPositive(input.targetMonthlyPolicyCount);
    const annualIncome = finitePositive(input.targetAnnualIncomeMxn);
    const annualPolicies = integerPositive(input.targetAnnualPolicyCount) || (monthlyPolicies ? monthlyPolicies * 12 : null);
    if (!monthlyIncome || monthlyIncome > 100000000) throw new TypeError('La meta mensual de ingreso debe estar entre $1 y $100,000,000 MXN.');
    if (!monthlyPolicies || monthlyPolicies > 1000) throw new TypeError('La meta mensual de pólizas debe estar entre 1 y 1000.');
    if (!annualIncome || annualIncome > 1200000000) throw new TypeError('La meta anual de ingreso debe estar entre $1 y $1,200,000,000 MXN.');
    if (!annualPolicies || annualPolicies > 12000) throw new TypeError('La meta anual de pólizas debe estar entre 1 y 12000.');
    const asOf = input.asOf ? new Date(input.asOf) : new Date();
    const reason = `${GOAL_REASON_PREFIX}${JSON.stringify({
      targetMonthlyIncomeMxn: Math.round(monthlyIncome * 100) / 100,
      targetAnnualIncomeMxn: Math.round(annualIncome * 100) / 100,
      targetAnnualPolicyCount: annualPolicies,
      annualPolicyCountDerived: input.annualPolicyCountDerived === true,
      currency: 'MXN',
      goalModel: 'FORGE_COMMERCIAL_COMPASS_015',
    })}`;
    if (reason.length > 500) throw new Error('COMMERCIAL_COMPASS_GOAL_PAYLOAD_TOO_LARGE');
    const row = await goalRepository.append({
      advisorId: user.id,
      yearMonth: monthKey(asOf),
      targetPolicyCount: monthlyPolicies,
      reason,
      evidenceReference: `FORGE_COMMERCIAL_COMPASS_015:${monthKey(asOf)}`,
    });
    return normalizeGoals(row);
  }

  return Object.freeze({
    ...previous,
    async load(input = {}) {
      const asOf = input.now || new Date().toISOString();
      const signal = input.signal;
      const periodKey = monthKey(asOf);
      const sourceStates = { goals: 'LOADING', production: 'LOADING', income: 'LOADING' };
      const [baseSnapshot, goalResult, policyResult, incomeResult] = await Promise.all([
        previous.load(input),
        readGoals(asOf, signal).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
        loadConfirmedPolicyFacts({ client, advisorId: user.id, signal }).then(value => ({ ok: true, value })).catch(error => ({ ok: false, error })),
        incomeAdapter.load({ periodKey, periodKeys: ytdPeriods(asOf), signal })
          .then(value => ({ ok: true, value: projectIncomeReadModel(value) }))
          .catch(error => ({ ok: false, error })),
      ]);

      const goals = goalResult.ok ? goalResult.value : normalizeGoals(null);
      sourceStates.goals = goalResult.ok ? goals.state : 'UNAVAILABLE';
      const production = policyResult.ok
        ? productionSnapshot(policyResult.value.policyFacts, asOf)
        : freeze({ monthlyCount: null, annualCount: null, source: 'PRODUCTION_EVENTS', evidenceRefs: [] });
      sourceStates.production = policyResult.ok ? (policyResult.value.sourceComplete ? 'READY' : 'PARTIAL') : 'UNAVAILABLE';
      const income = incomeResult.ok
        ? incomeSnapshot(incomeResult.value)
        : freeze({ state: 'UNAVAILABLE', monthlyEstimatedIncomeMxn: null, monthlyPipelineScenarioMxn: null, monthlyCombinedScenarioMxn: null, annualEstimatedIncomeMxn: null, annualState: 'UNAVAILABLE', generatedBreakdown: null, pipelineOpportunityCount: null, source: 'COMPENSATION_INTELLIGENCE', safeguards: freeze({ confirmedIncomeIncludesPipeline: false }) });
      sourceStates.income = incomeResult.ok ? income.state : 'UNAVAILABLE';

      const commercialCompass = buildCompass({ goals, production, income, asOf, sourceStates });
      globalThis[HANDOFF] = Object.freeze({
        phase: PHASE,
        snapshot: commercialCompass,
        saveGoals: saveCommercialGoals,
        sourceAuthorities: Object.freeze(['ADVISOR_MONTHLY_POLICY_GOAL', 'PRODUCTION_EVENTS', 'COMPENSATION_INTELLIGENCE']),
      });
      return freeze({ ...baseSnapshot, commercialCompass });
    },
    saveCommercialGoals,
    diagnostics() {
      return freeze({
        ...(previous.diagnostics?.() || {}),
        phase: PHASE,
        commercialCompassConnected: true,
        goalAuthority: 'ADVISOR_MONTHLY_POLICY_GOAL_APPEND_ONLY',
        productionAuthority: 'PRODUCTION_EVENTS:POLICY_SOLD_CONFIRMED',
        incomeAuthority: 'COMPENSATION_INTELLIGENCE',
        duplicateGoalAuthority: false,
        commissionCalculationInHome: false,
        homeDomainWrites: 0,
      });
    },
  });
}

export { HANDOFF, PHASE, buildCompass, normalizeGoals, productionSnapshot };
