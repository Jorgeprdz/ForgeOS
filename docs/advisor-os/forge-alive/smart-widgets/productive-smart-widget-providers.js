import {
  SMART_WIDGET_STATES,
  PRODUCTIVE_SMART_WIDGET_FAMILIES,
  SMART_WIDGET_RENDER_VARIANTS,
  createMetric,
  createProductiveSmartWidget,
  asFiniteNumber,
  cloneJson,
} from "./productive-smart-widget-contract.js";

function monthKey(value, timeZone = "America/Mexico_City") {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return year && month ? `${year}-${month}` : null;
}

function median(values) {
  const finite = values.filter((value) => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
  if (!finite.length) return null;
  const middle = Math.floor(finite.length / 2);
  return finite.length % 2 ? finite[middle] : (finite[middle - 1] + finite[middle]) / 2;
}

function confidenceFromEvidence(count, missingCount = 0) {
  if (count >= 6 && missingCount === 0) return "HIGH";
  if (count >= 3 && missingCount <= 2) return "MEDIUM";
  return "LOW";
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function readyState({ connected = true, sourceComplete = false, hasData = false, stale = false, blocked = false, unavailable = false }) {
  if (unavailable) return SMART_WIDGET_STATES.SOURCE_UNAVAILABLE;
  if (!connected) return SMART_WIDGET_STATES.NOT_CONNECTED;
  if (blocked) return SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE;
  if (stale) return SMART_WIDGET_STATES.STALE;
  if (hasData && sourceComplete) return SMART_WIDGET_STATES.READY;
  if (hasData) return SMART_WIDGET_STATES.PARTIAL;
  return sourceComplete ? SMART_WIDGET_STATES.EMPTY : SMART_WIDGET_STATES.PARTIAL;
}

export function createActivityProgressWidget(input = {}) {
  const reportResult = input.reportResult || null;
  const report = reportResult?.report || input.report || null;
  const chartReady = reportResult?.chartReady || input.chartReady || null;
  const activityCount = asFiniteNumber(report?.totals?.activityCount ?? input.activityCount);
  const pointsEarned = asFiniteNumber(input.scoringSnapshot?.pointsEarned ?? input.pointsEarned);
  const dailyTarget = asFiniteNumber(input.scoringSnapshot?.dailyTarget ?? input.dailyTarget);
  const sourceConnected = input.sourceConnected !== false;
  const sourceComplete = input.sourceComplete === true || Boolean(reportResult);
  const scoringConnected = pointsEarned !== null && dailyTarget !== null;
  const hasData = activityCount !== null || pointsEarned !== null || Boolean(chartReady);
  const state = readyState({
    connected: sourceConnected,
    sourceComplete: sourceComplete && scoringConnected,
    hasData,
    stale: input.stale === true,
    unavailable: input.sourceUnavailable === true,
  });
  const remaining = pointsEarned !== null && dailyTarget !== null ? Math.max(0, dailyTarget - pointsEarned) : null;
  const display = pointsEarned !== null && dailyTarget !== null
    ? `${pointsEarned} / ${dailyTarget}`
    : activityCount !== null
      ? String(activityCount)
      : null;

  return createProductiveSmartWidget({
    widgetFamily: PRODUCTIVE_SMART_WIDGET_FAMILIES.ACTIVITY_PROGRESS_WIDGET,
    widgetId: "forge-activity-progress",
    state,
    rankScore: input.rankScore ?? 62,
    hardPriority: input.afterFourPm && remaining > 0 ? "DAILY_ACTIVITY_RECOVERY" : null,
    title: "Actividad",
    subtitle: remaining === null
      ? "Actividad confirmada; puntuación diaria pendiente de conectar."
      : remaining === 0
        ? "Meta diaria completada."
        : `Faltan ${remaining} puntos hoy.`,
    primaryMetric: createMetric({ value: pointsEarned ?? activityCount, unit: pointsEarned !== null ? "points" : "events", display }),
    secondaryMetric: createMetric({ value: remaining, unit: "points", label: "remaining", display: remaining === null ? null : `${remaining} pendientes` }),
    comparison: input.comparison || null,
    trend: input.trend || null,
    chartReady,
    whyNow: input.afterFourPm && remaining > 0
      ? "La jornada está avanzada y todavía existe una brecha de actividad accionable."
      : "La actividad confirmada ayuda a decidir el siguiente movimiento del día.",
    evidence: [
      ...(report?.evidenceRefs || []),
      ...(input.evidence || []),
    ],
    uncertainty: [
      ...(!scoringConnected ? ["activity_scoring_snapshot_not_connected"] : []),
      ...(input.uncertainty || []),
    ],
    missingContext: !scoringConnected ? ["Mick activity scoring snapshot"] : [],
    confidence: sourceComplete ? (scoringConnected ? "HIGH" : "MEDIUM") : "LOW",
    freshness: input.freshness || null,
    sourceAuthorities: ["FES", "REP", ...(scoringConnected ? ["MICK_ACTIVITY_SCORING"] : [])],
    deepLink: input.deepLink || "?nav=actividad",
    reviewAction: { type: "NAVIGATE", label: "Abrir Actividad" },
    blockedReason: sourceConnected ? null : "ACTIVITY_SOURCE_NOT_CONNECTED",
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.PROGRESS,
    payload: { activityCount, pointsEarned, dailyTarget, remaining },
  });
}

export function createMonthlyPolicyGoalWidget(input = {}) {
  const goal = input.goalSnapshot || null;
  const timeZone = input.timeZone || "America/Mexico_City";
  const asOf = input.asOf || new Date().toISOString();
  const currentMonth = goal?.yearMonth || monthKey(asOf, timeZone);
  const facts = safeArray(input.policyFacts).filter((fact) => fact?.eventType === "POLICY_SOLD_CONFIRMED" && fact.policyId);
  const uniquePolicies = new Map();
  for (const fact of facts) {
    const factMonth = fact.yearMonth || monthKey(fact.soldAt || fact.occurredAt, timeZone);
    if (!factMonth) continue;
    uniquePolicies.set(`${factMonth}:${fact.policyId}`, { ...fact, yearMonth: factMonth });
  }
  const countsByMonth = {};
  for (const fact of uniquePolicies.values()) {
    countsByMonth[fact.yearMonth] = (countsByMonth[fact.yearMonth] || 0) + 1;
  }
  const sold = currentMonth ? (countsByMonth[currentMonth] || 0) : 0;
  const target = asFiniteNumber(goal?.targetPolicyCount);
  const historicalMonths = Object.keys(countsByMonth).filter((key) => key !== currentMonth).sort().slice(-12);
  const historicalCounts = historicalMonths.map((key) => countsByMonth[key]);
  const lastThree = historicalCounts.slice(-3);
  const lastSix = historicalCounts.slice(-6);
  const best12 = historicalCounts.length ? Math.max(...historicalCounts) : null;
  const median6 = median(lastSix);
  const average3 = lastThree.length ? lastThree.reduce((sum, value) => sum + value, 0) / lastThree.length : null;
  const progress = target && target > 0 ? Math.min(1, sold / target) : null;
  const gap = target === null ? null : Math.max(0, target - sold);
  const connected = input.sourceConnected !== false;
  const blocked = !goal || target === null || !currentMonth;
  const state = readyState({
    connected,
    sourceComplete: input.sourceComplete === true,
    hasData: Boolean(goal) || facts.length > 0,
    stale: input.stale === true,
    blocked,
    unavailable: input.sourceUnavailable === true,
  });

  return createProductiveSmartWidget({
    widgetFamily: PRODUCTIVE_SMART_WIDGET_FAMILIES.MONTHLY_POLICY_GOAL_WIDGET,
    widgetId: `forge-monthly-policy-goal-${currentMonth || "unknown"}`,
    state,
    rankScore: input.rankScore ?? 58,
    hardPriority: input.monthEndRisk === true && gap > 0 ? "MONTH_END_GOAL_RISK" : null,
    title: "Cumplimiento mensual",
    subtitle: target === null
      ? "Define tu meta mensual para comparar ambición, ritmo e histórico."
      : `${sold} de ${target} familias protegidas.`,
    primaryMetric: createMetric({
      value: progress === null ? null : Math.round(progress * 100),
      unit: "percent",
      display: progress === null ? null : `${Math.round(progress * 100)}%`,
    }),
    secondaryMetric: createMetric({ value: sold, unit: "policies", label: "families_protected", display: target === null ? `${sold}` : `${sold} / ${target}` }),
    comparison: {
      currentMonth,
      target,
      sold,
      gap,
      medianLast6CompletedMonths: median6,
      averageLast3CompletedMonths: average3,
      bestLast12CompletedMonths: best12,
      historicalCounts: historicalMonths.map((key) => ({ yearMonth: key, policyCount: countsByMonth[key] })),
    },
    trend: input.trend || null,
    chartReady: {
      kind: "MONTHLY_POLICY_HISTORY",
      series: historicalMonths.map((key) => ({ x: key, y: countsByMonth[key] })),
      target,
      current: sold,
    },
    whyNow: input.monthEndRisk === true && gap > 0
      ? "El cierre de mes se acerca y la meta exige una decisión de actividad, no una barra motivacional."
      : "La meta mensual debe leerse contra el ritmo real y el histórico del asesor.",
    evidence: [goal?.evidenceRef, ...facts.map((fact) => fact.evidenceRef), ...(input.evidence || [])].filter(Boolean),
    uncertainty: [
      ...(input.sourceComplete === true ? [] : ["policy_history_may_be_partial"]),
      ...(input.uncertainty || []),
    ],
    missingContext: blocked ? ["AdvisorMonthlyPolicyGoal"] : [],
    confidence: blocked ? "LOW" : input.sourceComplete === true ? "HIGH" : "MEDIUM",
    freshness: input.freshness || null,
    sourceAuthorities: ["PRODUCTION_EVENTS", "ADVISOR_MONTHLY_POLICY_GOAL", "REP"],
    deepLink: input.deepLink || "?nav=actividad&view=monthly-goal",
    reviewAction: blocked
      ? { type: "OPEN_GOAL_EDITOR", label: "Definir meta mensual" }
      : { type: "NAVIGATE", label: "Ver plan de meta" },
    blockedReason: blocked ? "MONTHLY_GOAL_NOT_DEFINED" : null,
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.TREND,
    payload: { currentMonth, target, sold, gap, familyProtectedDefinition: "ONE_CONFIRMED_SOLD_POLICY" },
  });
}

const POLICY_SIGNAL_TYPES = Object.freeze({
  OVERDUE_CONFIRMED: "OVERDUE_CONFIRMED",
  DUE_SOON: "DUE_SOON",
  PAYMENT_CONFIRMATION_REQUIRED: "PAYMENT_CONFIRMATION_REQUIRED",
  POSSIBLE_LATE_PAYMENT: "POSSIBLE_LATE_PAYMENT",
  POLICY_RENEWAL_DUE: "POLICY_RENEWAL_DUE",
});

export function createPolicyServiceRiskWidget(input = {}) {
  const connected = input.sourceConnected === true;
  const signals = safeArray(input.radarSnapshot?.signals || input.signals);
  const counts = Object.fromEntries(Object.values(POLICY_SIGNAL_TYPES).map((type) => [type, 0]));
  for (const signal of signals) {
    if (counts[signal.signalType] !== undefined) counts[signal.signalType] += 1;
  }
  const actionable = counts.OVERDUE_CONFIRMED + counts.DUE_SOON + counts.PAYMENT_CONFIRMATION_REQUIRED + counts.POLICY_RENEWAL_DUE;
  const state = readyState({
    connected,
    sourceComplete: input.sourceComplete === true,
    hasData: signals.length > 0,
    stale: input.stale === true,
    unavailable: input.sourceUnavailable === true,
  });
  const hardPriority = counts.OVERDUE_CONFIRMED > 0
    ? "CONFIRMED_OVERDUE_POLICY"
    : counts.PAYMENT_CONFIRMATION_REQUIRED > 0
      ? "PAYMENT_CONFIRMATION_REQUIRED"
      : counts.POLICY_RENEWAL_DUE > 0
        ? "POLICY_RENEWAL_DUE"
        : null;

  return createProductiveSmartWidget({
    widgetFamily: PRODUCTIVE_SMART_WIDGET_FAMILIES.POLICY_SERVICE_RISK_WIDGET,
    widgetId: "forge-policy-service-risk",
    state,
    rankScore: input.rankScore ?? 76,
    hardPriority,
    title: "Pólizas que requieren atención",
    subtitle: !connected
      ? "Esperando la autoridad productiva de Cartera Future Radar."
      : actionable === 0 && counts.POSSIBLE_LATE_PAYMENT === 0
        ? "No hay señales operativas pendientes en el horizonte disponible."
        : `${actionable} pólizas requieren revisión humana.`,
    primaryMetric: createMetric({ value: actionable, unit: "policies", display: connected ? String(actionable) : null }),
    secondaryMetric: createMetric({ value: counts.OVERDUE_CONFIRMED, unit: "policies", label: "overdue_confirmed", display: connected ? `${counts.OVERDUE_CONFIRMED} vencidas` : null }),
    comparison: counts,
    trend: input.trend || null,
    chartReady: {
      kind: "POLICY_SERVICE_RISK_DISTRIBUTION",
      segments: Object.entries(counts).map(([key, value]) => ({ key, value })),
    },
    whyNow: counts.OVERDUE_CONFIRMED > 0
      ? "Existe al menos un impago confirmado que requiere atención antes que una métrica informativa."
      : counts.PAYMENT_CONFIRMATION_REQUIRED > 0
        ? "Falta confirmar evidencia de pago y esa incertidumbre bloquea la verdad operativa."
        : "Cartera detectó señales próximas de servicio, pago o renovación.",
    evidence: signals.flatMap((signal) => safeArray(signal.evidenceRefs || signal.evidenceRef)).filter(Boolean),
    uncertainty: [
      ...(counts.POSSIBLE_LATE_PAYMENT > 0 ? ["possible_late_payment_is_inference_not_confirmed_nonpayment"] : []),
      ...(input.uncertainty || []),
    ],
    missingContext: connected ? [] : ["CARTERA_050_PRODUCTIVE_FUTURE_RADAR"],
    confidence: !connected ? "LOW" : input.sourceComplete === true ? "HIGH" : "MEDIUM",
    freshness: input.freshness || null,
    sourceAuthorities: ["CARTERA_FUTURE_RADAR", "CONSERVATION_INTELLIGENCE", "COMPENSATION_INTELLIGENCE"],
    deepLink: input.deepLink || "?nav=clientes&view=future-radar",
    reviewAction: { type: "NAVIGATE", label: "Revisar pólizas" },
    blockedReason: connected ? null : "WAITING_FOR_CARTERA_050_MAIN_PROMOTION",
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.POLICY,
    payload: { counts, signals: cloneJson(signals) },
  });
}

const OPPORTUNITY_SIGNAL_WEIGHTS = Object.freeze({
  APPOINTMENT_COMPLETED: 12,
  PRESENTATION_COMPLETED: 14,
  QUOTE_PRESENTED: 10,
  BUDGET_CONFIRMED: 12,
  DECISION_DATE_SET: 12,
  DECISION_MAKER_INVOLVED: 8,
  DOCUMENTS_REQUESTED: 8,
  EXPLICIT_BUYING_INTENT: 16,
  FOLLOW_UP_COMPLETED_ON_TIME: 5,
  OBJECTION_RESOLVED: 6,
  OBJECTION_OPEN: -8,
  FOLLOW_UP_OVERDUE: -10,
  DECISION_DELAYED: -8,
  NO_RESPONSE_7D: -12,
  MISSING_DECISION_MAKER: -6,
  PRICE_REJECTION: -12,
});

function normalizeOpportunitySignals(opportunity = {}) {
  const explicit = safeArray(opportunity.signals).map((signal) => typeof signal === "string" ? { code: signal } : signal).filter((signal) => signal?.code);
  return explicit.map((signal) => ({
    code: signal.code,
    weight: asFiniteNumber(signal.weight) ?? OPPORTUNITY_SIGNAL_WEIGHTS[signal.code] ?? 0,
    evidenceRef: signal.evidenceRef || null,
    occurredAt: signal.occurredAt || null,
  }));
}

export function scoreOpportunityLikelihood(opportunity = {}) {
  const signals = normalizeOpportunitySignals(opportunity);
  const baseScore = asFiniteNumber(opportunity.baseScore) ?? 20;
  const raw = signals.reduce((sum, signal) => sum + signal.weight, baseScore);
  const likelihood = Math.max(0, Math.min(95, Math.round(raw)));
  const positiveSignals = signals.filter((signal) => signal.weight > 0);
  const negativeSignals = signals.filter((signal) => signal.weight < 0);
  const requiredCodes = ["APPOINTMENT_COMPLETED", "QUOTE_PRESENTED", "BUDGET_CONFIRMED", "DECISION_DATE_SET"];
  const knownCodes = new Set(signals.map((signal) => signal.code));
  const missingSignals = requiredCodes.filter((code) => !knownCodes.has(code));
  const confidence = confidenceFromEvidence(signals.length, missingSignals.length);
  return {
    likelihood,
    confidence,
    positiveSignals,
    negativeSignals,
    missingSignals,
    modelVersion: "opportunity-likelihood.v1",
  };
}

export function createOpportunityCloseLikelihoodWidget(input = {}) {
  const opportunities = safeArray(input.opportunities).map((opportunity) => ({
    ...opportunity,
    scoring: scoreOpportunityLikelihood(opportunity),
  }));
  opportunities.sort((left, right) => {
    const leftDue = left.decisionDueToday ? 1 : 0;
    const rightDue = right.decisionDueToday ? 1 : 0;
    return rightDue - leftDue || right.scoring.likelihood - left.scoring.likelihood || String(left.opportunityId).localeCompare(String(right.opportunityId));
  });
  const top = opportunities[0] || null;
  const connected = input.sourceConnected !== false;
  const hasData = Boolean(top);
  const state = readyState({
    connected,
    sourceComplete: input.sourceComplete === true,
    hasData,
    stale: input.stale === true,
    blocked: Boolean(top && top.scoring.confidence === "LOW" && input.requireMinimumConfidence === true),
    unavailable: input.sourceUnavailable === true,
  });
  const scoring = top?.scoring || null;

  return createProductiveSmartWidget({
    widgetFamily: PRODUCTIVE_SMART_WIDGET_FAMILIES.OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET,
    widgetId: top ? `forge-opportunity-likelihood-${top.opportunityId}` : "forge-opportunity-likelihood",
    state,
    rankScore: input.rankScore ?? 70,
    hardPriority: top?.decisionDueToday ? "OPPORTUNITY_DECISION_DUE_TODAY" : null,
    title: top ? `${top.personName || "Oportunidad"} · posibilidad de cierre` : "Posibilidad de cierre",
    subtitle: !top
      ? "No hay oportunidades con señales suficientes en la bitácora."
      : `${scoring.likelihood}% · confianza ${scoring.confidence.toLowerCase()}.`,
    primaryMetric: createMetric({ value: scoring?.likelihood ?? null, unit: "percent", display: scoring ? `${scoring.likelihood}%` : null }),
    secondaryMetric: createMetric({ value: scoring?.positiveSignals.length ?? null, unit: "signals", label: "positive_signals", display: scoring ? `${scoring.positiveSignals.length} señales a favor` : null }),
    comparison: top ? {
      positiveSignals: scoring.positiveSignals,
      negativeSignals: scoring.negativeSignals,
      missingSignals: scoring.missingSignals,
      modelVersion: scoring.modelVersion,
    } : null,
    trend: input.trend || null,
    chartReady: top ? {
      kind: "OPPORTUNITY_LIKELIHOOD_GAUGE",
      value: scoring.likelihood,
      confidence: scoring.confidence,
    } : null,
    whyNow: top?.decisionDueToday
      ? "La fecha de decisión es hoy y la bitácora contiene señales que ameritan revisión inmediata."
      : top
        ? "La bitácora contiene una combinación explicable de señales positivas, negativas y faltantes."
        : "No existe una oportunidad elegible para priorizar.",
    evidence: top ? normalizeOpportunitySignals(top).map((signal) => signal.evidenceRef).filter(Boolean) : [],
    uncertainty: scoring?.confidence === "LOW" ? ["low_confidence_opportunity_estimate"] : [],
    missingContext: scoring?.missingSignals || [],
    confidence: scoring?.confidence || "UNKNOWN",
    freshness: input.freshness || null,
    sourceAuthorities: ["PIPELINE", "BITACORA", "OPPORTUNITY_LIKELIHOOD_MODEL_V1", "NASH_EXPLANATION_ONLY"],
    deepLink: top ? (top.deepLink || `?nav=pipeline&opportunity=${encodeURIComponent(top.opportunityId)}`) : "?nav=pipeline",
    reviewAction: { type: "NAVIGATE", label: top ? "Abrir bitácora" : "Abrir Pipeline" },
    blockedReason: state === SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE ? "INSUFFICIENT_SIGNAL_CONFIDENCE" : null,
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.PERSON,
    payload: { topOpportunity: cloneJson(top), candidates: cloneJson(opportunities.slice(0, 5)) },
  });
}

export function createIncomeProgressWidget(input = {}) {
  const snapshot = input.compensationSnapshot || null;
  const authorityConnected = input.sourceConnected === true;
  const connected = authorityConnected && Boolean(snapshot);
  const real = asFiniteNumber(snapshot?.incomeReal);
  const earned = asFiniteNumber(snapshot?.incomeEarned);
  const paid = asFiniteNumber(snapshot?.incomePaid);
  const potential = asFiniteNumber(snapshot?.incomePotential);
  const atRisk = asFiniteNumber(snapshot?.incomeAtRisk);
  const target = asFiniteNumber(input.incomeTarget ?? snapshot?.incomeTarget);
  const actual = paid ?? earned ?? real;
  const gap = actual !== null && target !== null ? Math.max(0, target - actual) : null;
  const hasData = [real, earned, paid, potential, atRisk].some((value) => value !== null);
  const state = readyState({
    connected: authorityConnected,
    sourceComplete: input.sourceComplete === true,
    hasData,
    stale: input.stale === true,
    unavailable: input.sourceUnavailable === true,
  });

  return createProductiveSmartWidget({
    widgetFamily: PRODUCTIVE_SMART_WIDGET_FAMILIES.INCOME_PROGRESS_WIDGET,
    widgetId: "forge-income-progress",
    state,
    rankScore: input.rankScore ?? 55,
    hardPriority: atRisk !== null && atRisk > 0 ? "CONFIRMED_INCOME_AT_RISK" : null,
    title: "Ingresos",
    subtitle: !connected
      ? "Compensation Intelligence todavía no entrega una verdad productiva de ingresos."
      : gap === null
        ? "Ingreso confirmado disponible; meta de ingresos no definida."
        : `Brecha contra meta: ${gap}.`,
    primaryMetric: createMetric({ value: actual, unit: input.currency || "MXN", label: paid !== null ? "paid" : earned !== null ? "earned" : "real", display: actual === null ? null : String(actual) }),
    secondaryMetric: createMetric({ value: potential, unit: input.currency || "MXN", label: "potential", display: potential === null ? null : String(potential) }),
    comparison: { incomeReal: real, incomeEarned: earned, incomePaid: paid, incomePotential: potential, incomeAtRisk: atRisk, target, gap },
    trend: input.trend || null,
    chartReady: snapshot?.history ? { kind: "INCOME_HISTORY", series: cloneJson(snapshot.history) } : null,
    whyNow: atRisk !== null && atRisk > 0
      ? "Existe ingreso confirmado en riesgo y debe distinguirse de una proyección."
      : connected
        ? "La evolución de ingresos cambia la lectura de la meta comercial."
        : "El widget está desarrollado, pero permanece bloqueado hasta recibir una autoridad de Compensation.",
    evidence: safeArray(snapshot?.evidenceRefs),
    uncertainty: !connected ? ["income_must_not_be_derived_from_quotes_or_premium"] : [],
    missingContext: connected ? [] : ["COMPENSATION_INCOME_TRUTH_MINIMUM"],
    confidence: connected && input.sourceComplete === true ? "HIGH" : connected ? "MEDIUM" : "LOW",
    freshness: input.freshness || null,
    sourceAuthorities: ["COMPENSATION_INTELLIGENCE", "ECONOMIC_MOTIVATION_CONTEXT_ONLY"],
    deepLink: input.deepLink || "?nav=ingresos",
    reviewAction: { type: "NAVIGATE", label: "Ver ingresos" },
    blockedReason: connected ? null : "WAITING_FOR_COMPENSATION_INCOME_TRUTH_MINIMUM",
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.METRIC,
    payload: { actual, real, earned, paid, potential, atRisk, target, gap },
  });
}

export const PRODUCTIVE_SMART_WIDGET_PENDING_DEPENDENCIES = Object.freeze([
  {
    dependencyId: "CARTERA_050_MAIN_PROMOTION",
    unlocks: [PRODUCTIVE_SMART_WIDGET_FAMILIES.POLICY_SERVICE_RISK_WIDGET],
    requiredAuthority: "CARTERA_FUTURE_RADAR",
    requiredContract: "Today/7/30/90 signals with evidence, uncertainty and confirmed-vs-inferred status",
  },
  {
    dependencyId: "COMPENSATION_INCOME_TRUTH_MINIMUM",
    unlocks: [PRODUCTIVE_SMART_WIDGET_FAMILIES.INCOME_PROGRESS_WIDGET],
    requiredAuthority: "COMPENSATION_INTELLIGENCE",
    requiredContract: "incomeReal/incomeEarned/incomePaid/incomePotential/incomeAtRisk snapshots",
  },
  {
    dependencyId: "MICK_ACTIVITY_SCORING_SNAPSHOT",
    unlocks: [PRODUCTIVE_SMART_WIDGET_FAMILIES.ACTIVITY_PROGRESS_WIDGET],
    requiredAuthority: "MICK_ACTIVITY_SCORING",
    requiredContract: "pointsEarned, dailyTarget and scoring rule version",
  },
  {
    dependencyId: "ADVISOR_MONTHLY_POLICY_GOAL_PERSISTENCE",
    unlocks: [PRODUCTIVE_SMART_WIDGET_FAMILIES.MONTHLY_POLICY_GOAL_WIDGET],
    requiredAuthority: "ADVISOR_MONTHLY_POLICY_GOAL",
    requiredContract: "advisorId, yearMonth, targetPolicyCount, revision and evidence",
  },
]);
