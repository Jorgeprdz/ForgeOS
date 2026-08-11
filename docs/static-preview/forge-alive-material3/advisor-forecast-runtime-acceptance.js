const SOURCE_LAYOUT = import.meta.url.includes("/docs/static-preview/");
const SMART_WIDGET_BASE = new URL(
  SOURCE_LAYOUT
    ? "../../../advisor-os/forge-alive/smart-widgets/"
    : "../../advisor-os/forge-alive/smart-widgets/",
  import.meta.url,
);
const ACTIVITY_BASE = new URL(
  SOURCE_LAYOUT
    ? "../../../advisor-os/forge-alive/activity/"
    : "../../advisor-os/forge-alive/activity/",
  import.meta.url,
);
const NAVIGATION_BASE = new URL(
  SOURCE_LAYOUT
    ? "../../../advisor-os/forge-alive/navigation/"
    : "../../advisor-os/forge-alive/navigation/",
  import.meta.url,
);
const SESSION_KEY = "forge.advisorForecast.runtimeAcceptance.v1";
const SNAPSHOT_KEY = "forge.advisorForecast.issuedSnapshot.v1";
const ACTIVITY_DRAFT_KEY = "forge.advisorForecast.activityDraftInbox.v1";
const RUNTIME_VERSION = "AF-RUNTIME-ACCEPTANCE-001";

const STAGE_PRIORS = Object.freeze({
  NEW: 10,
  CONTACTED: 18,
  APPOINTMENT_SCHEDULED: 25,
  DISCOVERY: 32,
  PRESENTATION: 45,
  QUOTE_PRESENTED: 55,
  APPLICATION: 78,
  UNDERWRITING: 84,
  APPROVED: 92,
});
const SIGNAL_WEIGHTS = Object.freeze({
  APPOINTMENT_COMPLETED: 8,
  PRESENTATION_COMPLETED: 12,
  QUOTE_PRESENTED: 8,
  BUDGET_CONFIRMED: 10,
  DECISION_DATE_SET: 12,
  DECISION_MAKER_INVOLVED: 8,
  DOCUMENTS_REQUESTED: 8,
  EXPLICIT_BUYING_INTENT: 16,
  FOLLOW_UP_COMPLETED_ON_TIME: 4,
  OBJECTION_RESOLVED: 5,
  OBJECTION_OPEN: -8,
  FOLLOW_UP_OVERDUE: -10,
  DECISION_DELAYED: -8,
  NO_RESPONSE_7D: -12,
  NO_NEXT_ACTION: -10,
  STALE_14D: -14,
  CLIENT_DECLINED: -40,
  COMPETITOR_SELECTED: -30,
});
const CLOSED_STATES = new Set(["CLOSED_WON", "WON", "ISSUED", "SOLD", "CLOSED_LOST", "LOST", "DECLINED"]);

const runtimeState = {
  generation: 0,
  advisorId: null,
  readModel: null,
  issuedSnapshot: null,
  routeSurface: null,
};

let modulesPromise = null;
async function loadRuntimeModules() {
  if (modulesPromise) return modulesPromise;
  modulesPromise = Promise.all([
    import(new URL("advisor-forecast-smart-widget.mjs", SMART_WIDGET_BASE)),
    import(new URL("productive-smart-widget-orchestrator.mjs", SMART_WIDGET_BASE)),
    import(new URL("productive-smart-widget-contract.mjs", SMART_WIDGET_BASE)),
    import(new URL("advisor-forecast-navigation.mjs", NAVIGATION_BASE)),
    import(new URL("advisor-forecast-activity-handoff.mjs", ACTIVITY_BASE)),
    import("./pipeline-productive-intelligence-adapter.js?v=af-runtime-acceptance-001"),
    import("./advisor-forecast-detail-screen.js?v=af-runtime-acceptance-001"),
  ]).then(([forecastWidget, orchestrator, contract, navigation, activityHandoff, pipeline, detail]) => Object.freeze({
    createAdvisorForecastSmartWidget: forecastWidget.createAdvisorForecastSmartWidget,
    rankProductiveSmartWidgets: orchestrator.rankProductiveSmartWidgets,
    createProductiveSmartWidgetStack: contract.createProductiveSmartWidgetStack,
    resolveAdvisorForecastNavigationAction: navigation.resolveAdvisorForecastNavigationAction,
    createAdvisorForecastActivityHandoff: activityHandoff.createAdvisorForecastActivityHandoff,
    submitAdvisorForecastActivityHandoff: activityHandoff.submitAdvisorForecastActivityHandoff,
    createProductiveIntelligenceAdapter: pipeline.createProductiveIntelligenceAdapter,
    mountAdvisorForecastDetailScreen: detail.mountAdvisorForecastDetailScreen,
    renderAdvisorForecastDetailMarkup: detail.renderAdvisorForecastDetailMarkup,
  }));
  return modulesPromise;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
function safeArray(value) {
  return Array.isArray(value) ? value : [];
}
function unique(values) {
  return [...new Set(values.flat(Infinity).filter((value) => value !== undefined && value !== null && value !== ""))];
}
function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
function upper(value) {
  return value === undefined || value === null || value === "" ? null : String(value).trim().toUpperCase();
}
function abortError(message = "Advisor Forecast runtime request aborted") {
  return new DOMException(message, "AbortError");
}
function guardRuntime(context, signal = context.signal) {
  if (signal?.aborted) throw abortError();
  if (context.generation !== runtimeState.generation || context.advisorId !== runtimeState.advisorId) {
    throw abortError("Advisor Forecast runtime generation changed");
  }
}
function dateParts(value, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}
function yearMonth(value, timeZone) {
  const parts = dateParts(value, timeZone);
  return `${parts.year}-${parts.month}`;
}
function dateOnly(value, timeZone) {
  const parts = dateParts(value, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function periodBounds(monthKey, timeZone) {
  if (!/^\d{4}-\d{2}$/.test(String(monthKey || ""))) {
    return { yearMonth: null, start: null, end: null, timeZone };
  }
  const [year, month] = monthKey.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    yearMonth: monthKey,
    start: `${monthKey}-01`,
    end: `${monthKey}-${String(last).padStart(2, "0")}`,
    timeZone,
  };
}
function monthDay(value, timeZone) {
  return Number(dateParts(value, timeZone).day);
}
function daysInMonth(monthKey) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  return Number.isInteger(year) && Number.isInteger(month)
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : null;
}
function timestamp(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : null;
}
function evidenceRefForEvent(event, fallback) {
  return event?.evidenceRef
    || safeArray(event?.evidenceReferences)[0]
    || (event?.id ? `TIMELINE:${event.id}` : fallback);
}

function stageForCard(card) {
  return ({
    referred_new: "NEW",
    contacted: "CONTACTED",
    appointment_scheduled: "APPOINTMENT_SCHEDULED",
    proposal: "QUOTE_PRESENTED",
    decision: "QUOTE_PRESENTED",
    client: "CLOSED_WON",
  })[card?.status] || "NEW";
}
function signalForTimelineEvent(event) {
  const code = upper(event?.eventType);
  if (["APPOINTMENT_COMPLETED", "APPOINTMENT_HELD", "INITIAL_APPOINTMENT_COMPLETED"].includes(code)) return "APPOINTMENT_COMPLETED";
  if (["PROPOSAL_PRESENTED", "QUOTE_PRESENTED"].includes(code)) return "QUOTE_PRESENTED";
  if (code === "FOLLOW_UP_COMPLETED") return "FOLLOW_UP_COMPLETED_ON_TIME";
  if (code === "OBJECTION_RECORDED") {
    return upper(event?.payload?.resolutionStatus) === "RESOLVED" ? "OBJECTION_RESOLVED" : "OBJECTION_OPEN";
  }
  if (["DOCUMENTS_REQUESTED", "APPLICATION_SUBMITTED"].includes(code)) return "DOCUMENTS_REQUESTED";
  return null;
}
function cardToOpportunity(card, advisorId, now, timeZone) {
  const prospectRef = `PROSPECT:${card.id}`;
  const signals = [];
  for (const event of safeArray(card.timeline)) {
    const code = signalForTimelineEvent(event);
    if (!code) continue;
    signals.push({
      code,
      occurredAt: event.occurredAt || event.recordedAt || null,
      evidenceRef: evidenceRefForEvent(event, prospectRef),
    });
  }
  const latestAt = safeArray(card.timeline)
    .map((event) => timestamp(event.occurredAt || event.recordedAt))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0] || null;
  const nowTime = timestamp(now);
  if (latestAt && nowTime && nowTime - latestAt >= 14 * 86400000) {
    signals.push({ code: "STALE_14D", occurredAt: new Date(latestAt).toISOString(), evidenceRef: prospectRef });
  }
  const dueAt = card.nextCommitment?.dueAt || null;
  const dueTime = timestamp(dueAt);
  if (!dueAt && card.status !== "client") {
    signals.push({ code: "NO_NEXT_ACTION", evidenceRef: prospectRef, occurredAt: now });
  } else if (dueTime && nowTime && dueTime < nowTime) {
    signals.push({ code: "FOLLOW_UP_OVERDUE", evidenceRef: prospectRef, occurredAt: dueAt });
  }
  return Object.freeze({
    advisorId,
    opportunityId: card.id,
    personName: card.fullName,
    stage: stageForCard(card),
    status: card.status === "client" ? "CLOSED_WON" : "OPEN",
    sourceStatus: card.status,
    evidenceRef: prospectRef,
    evidenceRefs: unique([prospectRef, ...signals.map((signal) => signal.evidenceRef)]),
    sourceEvidenceIds: unique([prospectRef, ...signals.map((signal) => signal.evidenceRef)]),
    signals,
    decisionDueToday: dueAt ? dateOnly(dueAt, timeZone) === dateOnly(now, timeZone) : false,
    deepLink: `?nav=pipeline&opportunity=${encodeURIComponent(card.id)}`,
  });
}

function capturedSource(context, key, source) {
  if (!source || typeof source !== "object") return source;
  if (typeof source.load !== "function") {
    context.snapshots[key] = clone(source);
    return source;
  }
  return Object.freeze({
    ...source,
    async load(sourceContext) {
      try {
        const loaded = await source.load(sourceContext);
        guardRuntime(context, sourceContext.signal || context.signal);
        context.snapshots[key] = clone(loaded);
        return loaded;
      } catch (error) {
        context.snapshots[key] = Object.freeze({
          sourceConnected: source.sourceConnected !== false,
          sourceComplete: false,
          sourceUnavailable: true,
          sourceError: { name: error?.name || "Error", message: error?.message || "Source unavailable" },
        });
        throw error;
      }
    },
  });
}

export async function prepareAdvisorForecastRuntimeSources({
  session,
  sources = {},
  now = new Date().toISOString(),
  timeZone = "America/Mexico_City",
  signal = null,
} = {}) {
  if (session?.status !== "AUTHENTICATED" || !session.advisorId) {
    return Object.freeze({ sources, disabled: true, generation: runtimeState.generation, advisorId: null });
  }
  if (runtimeState.advisorId && runtimeState.advisorId !== session.advisorId) {
    scrubAdvisorForecastRuntime("advisor-switch");
  }
  runtimeState.advisorId = session.advisorId;
  const generation = ++runtimeState.generation;
  const context = {
    generation,
    advisorId: session.advisorId,
    now,
    timeZone,
    signal,
    snapshots: {},
  };
  const { createProductiveIntelligenceAdapter } = await loadRuntimeModules();
  guardRuntime(context, signal);

  const opportunitySource = Object.freeze({
    sourceConnected: true,
    async load(sourceContext) {
      guardRuntime(context, sourceContext.signal || signal);
      const runtime = await createProductiveIntelligenceAdapter();
      const cards = await runtime.reload();
      guardRuntime(context, sourceContext.signal || signal);
      const opportunities = cards.map((card) => cardToOpportunity(
        card,
        session.advisorId,
        sourceContext.now || now,
        sourceContext.timeZone || timeZone,
      ));
      const snapshot = Object.freeze({
        sourceConnected: true,
        sourceComplete: cards.every((card) => card.timelineState === "CONNECTED"),
        opportunities,
        freshness: { asOf: sourceContext.now || now, authority: "PIPELINE_AND_BITACORA" },
        evidence: opportunities.flatMap((opportunity) => opportunity.evidenceRefs),
      });
      context.snapshots.opportunities = clone(snapshot);
      return snapshot;
    },
  });

  context.sources = Object.freeze({
    ...sources,
    activity: capturedSource(context, "activity", sources.activity),
    monthlyGoal: capturedSource(context, "monthlyGoal", sources.monthlyGoal),
    policyService: capturedSource(context, "policyService", sources.policyService),
    opportunities: opportunitySource,
    income: capturedSource(context, "income", sources.income),
  });
  return Object.freeze(context);
}

function evidenceOf(value = {}) {
  return unique([
    ...safeArray(value.evidence),
    ...safeArray(value.evidenceRefs),
    ...(value.evidenceRef ? [value.evidenceRef] : []),
    ...safeArray(value.sourceEvidenceIds),
  ]);
}
function weightOpportunity(opportunity) {
  const stage = upper(opportunity.stage || opportunity.status);
  const status = upper(opportunity.status);
  const closed = opportunity.archived === true || opportunity.deleted === true || CLOSED_STATES.has(stage) || CLOSED_STATES.has(status);
  const signals = safeArray(opportunity.signals).map((signal) => ({
    code: upper(signal.code),
    weight: finite(signal.weight) ?? SIGNAL_WEIGHTS[upper(signal.code)] ?? 0,
    occurredAt: signal.occurredAt || null,
    evidenceRef: signal.evidenceRef || null,
  }));
  const evidenceRefs = unique([...evidenceOf(opportunity), ...signals.map((signal) => signal.evidenceRef)]);
  if (closed) {
    return { opportunityId: opportunity.opportunityId, stage, status, included: false, expectedPolicyContribution: 0, classification: "UNKNOWN", evidenceRefs, signalTrace: [] };
  }
  const backedSignals = signals.filter((signal) => signal.evidenceRef);
  if (!evidenceRefs.length && !backedSignals.length) {
    return { opportunityId: opportunity.opportunityId, stage, status, included: true, probability: null, expectedPolicyContribution: null, classification: "UNKNOWN", evidenceRefs: [], signalTrace: [] };
  }
  const probability = Math.max(5, Math.min(95, Math.round((STAGE_PRIORS[stage] ?? 20) + backedSignals.reduce((sum, signal) => sum + signal.weight, 0))));
  const codes = new Set(backedSignals.map((signal) => signal.code));
  const classification = codes.has("CLIENT_DECLINED") || codes.has("COMPETITOR_SELECTED") || probability < 25
    ? "AT_RISK"
    : probability >= 80
      ? "COMMITTED"
      : probability >= 55
        ? "PROBABLE"
        : "POTENTIAL";
  return {
    opportunityId: opportunity.opportunityId,
    stage,
    status,
    included: true,
    probability,
    expectedPolicyContribution: round(probability / 100, 2),
    classification,
    evidenceRefs,
    signalTrace: backedSignals.map((signal) => ({ code: signal.code, weight: signal.weight, occurredAt: signal.occurredAt })),
    amountWeightingApplied: false,
  };
}
function weightOpportunities(opportunities) {
  if (!Array.isArray(opportunities)) {
    return { status: "MISSING_DATA", activeOpportunityCount: null, weightedPolicyContribution: null, topContributors: [], atRiskCount: null, unknownCount: null, classificationCounts: null };
  }
  const weighted = opportunities.map(weightOpportunity);
  const included = weighted.filter((entry) => entry.included);
  const known = included.filter((entry) => finite(entry.expectedPolicyContribution) !== null);
  const classificationCounts = Object.fromEntries(["COMMITTED", "PROBABLE", "POTENTIAL", "AT_RISK", "UNKNOWN"].map((key) => [key, 0]));
  included.forEach((entry) => { classificationCounts[entry.classification] += 1; });
  const unknownCount = classificationCounts.UNKNOWN;
  return {
    status: included.length === 0 ? "EMPTY" : unknownCount === included.length ? "MISSING_EVIDENCE" : unknownCount > 0 ? "PARTIAL" : "READY",
    activeOpportunityCount: included.length,
    weightedPolicyContribution: round(known.reduce((sum, entry) => sum + entry.expectedPolicyContribution, 0), 2),
    topContributors: known.slice().sort((a, b) => b.expectedPolicyContribution - a.expectedPolicyContribution).slice(0, 5),
    atRiskCount: classificationCounts.AT_RISK,
    unknownCount,
    classificationCounts,
    opportunities: weighted,
  };
}
function calculateGoalGap({ target, current, pace, weighting, activityCount }) {
  if (target === null || current === null || target <= 0) {
    return {
      state: "DATA_INSUFFICIENT",
      confirmedGap: null,
      paceGap: null,
      weightedPipelineContribution: weighting.weightedPolicyContribution,
      remainingAfterWeightedPipeline: null,
      currentCoverage: null,
      paceCoverage: null,
      weightedPipelineCoverage: null,
      needsActivityRequirementModel: false,
      primaryExplanation: "No hay datos suficientes para calcular una brecha confiable.",
    };
  }
  const confirmedGap = round(Math.max(0, target - current), 2);
  const weighted = finite(weighting.weightedPolicyContribution);
  const remaining = weighted === null ? confirmedGap : round(Math.max(0, confirmedGap - weighted), 2);
  const expectedClose = weighted === null ? null : round(current + weighted, 2);
  let state;
  if (confirmedGap === 0) state = "GOAL_COVERED";
  else if (pace !== null && pace >= target) state = "PACE_SUFFICIENT";
  else if (weighted !== null && weighted >= confirmedGap) state = "PIPELINE_SUFFICIENT";
  else if (activityCount === 0 || (pace !== null && pace < target * 0.5 && remaining > 0)) state = "ACTIVITY_INSUFFICIENT";
  else state = "PIPELINE_INSUFFICIENT";
  const explanation = ({
    GOAL_COVERED: `La meta está cubierta con ${current} pólizas confirmadas.`,
    PACE_SUFFICIENT: `El ritmo confirmado apunta a ${pace} pólizas, suficiente para la meta vigente.`,
    PIPELINE_SUFFICIENT: `La contribución ponderada del Pipeline puede cubrir la brecha actual de ${confirmedGap} pólizas, pero sigue siendo contexto probabilístico.`,
    ACTIVITY_INSUFFICIENT: `El ritmo actual y la cobertura ponderada no sostienen la meta; la brecha residual es de ${remaining} pólizas.`,
    PIPELINE_INSUFFICIENT: `El Pipeline ponderado no cubre la brecha actual; faltan ${remaining} pólizas por sostener con nueva conversión o actividad.`,
  })[state];
  const coverage = (value) => value === null ? null : round((value / target) * 100, 1);
  return {
    state,
    confirmedGap,
    paceGap: pace === null ? null : round(Math.max(0, target - pace), 2),
    weightedPipelineContribution: weighted,
    remainingAfterWeightedPipeline: remaining,
    currentCoverage: coverage(current),
    paceCoverage: coverage(pace),
    weightedPipelineCoverage: coverage(expectedClose),
    pipelineSufficiencyRatio: confirmedGap > 0 && weighted !== null ? round(weighted / confirmedGap, 2) : null,
    needsActivityRequirementModel: remaining > 0,
    primaryExplanation: explanation,
  };
}
function rateEntry(value) {
  const rate = finite(value?.rate ?? value?.value);
  const refs = evidenceOf(value || {});
  return rate !== null && rate > 0 && rate <= 1 && refs.length
    ? { rate, evidenceRefs: refs, source: value.source || "GOVERNED_RUNTIME_SOURCE" }
    : null;
}
function calculateActivityRequirement(goalGap, conversionContext = null) {
  const gap = finite(goalGap.remainingAfterWeightedPipeline);
  if (gap === null || gap <= 0) {
    return {
      status: gap === 0 ? "GOAL_COVERED" : "INSUFFICIENT_DATA",
      residualPolicyGap: gap,
      policiesRequired: gap === 0 ? 0 : null,
      applicationsRequired: gap === 0 ? 0 : null,
      presentationsRequired: gap === 0 ? 0 : null,
      appointmentsRequired: gap === 0 ? 0 : null,
      contactsRequired: gap === 0 ? 0 : null,
      confidence: gap === 0 ? "HIGH" : "INSUFFICIENT_DATA",
      missingRates: gap === 0 ? [] : ["applicationToPolicy", "presentationToApplication", "appointmentToPresentation", "contactToAppointment"],
      recommendedActions: [],
    };
  }
  const rates = {
    applicationToPolicy: rateEntry(conversionContext?.applicationToPolicy),
    presentationToApplication: rateEntry(conversionContext?.presentationToApplication),
    appointmentToPresentation: rateEntry(conversionContext?.appointmentToPresentation),
    contactToAppointment: rateEntry(conversionContext?.contactToAppointment),
  };
  const missingRates = Object.entries(rates).filter(([, value]) => !value).map(([key]) => key);
  if (missingRates.length) {
    return {
      status: "INSUFFICIENT_DATA",
      residualPolicyGap: gap,
      policiesRequired: Math.ceil(gap),
      applicationsRequired: null,
      presentationsRequired: null,
      appointmentsRequired: null,
      contactsRequired: null,
      confidence: "INSUFFICIENT_DATA",
      selectedRates: rates,
      missingRates,
      recommendedActions: [],
      precisionPolicy: "WHOLE_MINIMUMS_ROUNDED_UP",
    };
  }
  const policiesRequired = Math.ceil(gap);
  const applicationsRequired = Math.ceil(policiesRequired / rates.applicationToPolicy.rate);
  const presentationsRequired = Math.ceil(applicationsRequired / rates.presentationToApplication.rate);
  const appointmentsRequired = Math.ceil(presentationsRequired / rates.appointmentToPresentation.rate);
  const contactsRequired = Math.ceil(appointmentsRequired / rates.contactToAppointment.rate);
  return {
    status: "READY",
    residualPolicyGap: gap,
    policiesRequired,
    applicationsRequired,
    presentationsRequired,
    appointmentsRequired,
    contactsRequired,
    confidence: "MEDIUM",
    selectedRates: rates,
    missingRates: [],
    recommendedActions: [
      { actionType: "PROSPECTING_CONTACTS", requiredCount: contactsRequired },
      { actionType: "APPOINTMENTS", requiredCount: appointmentsRequired },
      { actionType: "PRESENTATIONS", requiredCount: presentationsRequired },
      { actionType: "APPLICATIONS", requiredCount: applicationsRequired },
    ],
    precisionPolicy: "WHOLE_MINIMUMS_ROUNDED_UP",
  };
}

function inventoryWidget(stack, family) {
  return safeArray(stack?.inventory).find((widget) => widget.widgetFamily === family) || null;
}
function buildReadModel({ stack, context }) {
  const goalWidget = inventoryWidget(stack, "MONTHLY_POLICY_GOAL_WIDGET");
  const activityWidget = inventoryWidget(stack, "ACTIVITY_PROGRESS_WIDGET");
  const goalPayload = goalWidget?.payload || {};
  const currentMonth = goalPayload.currentMonth || yearMonth(context.now, context.timeZone);
  const period = periodBounds(currentMonth, context.timeZone);
  const target = finite(goalPayload.target);
  const currentProduction = finite(goalPayload.sold);
  const elapsedDay = monthDay(context.now, context.timeZone);
  const totalDays = daysInMonth(currentMonth);
  const paceProjection = currentProduction === null || !elapsedDay || !totalDays
    ? null
    : round((currentProduction / Math.max(1, elapsedDay)) * totalDays, 1);
  const opportunities = context.snapshots.opportunities?.opportunities;
  const weighting = weightOpportunities(opportunities);
  const activityCount = finite(activityWidget?.payload?.activityCount);
  const goalGap = calculateGoalGap({ target, current: currentProduction, pace: paceProjection, weighting, activityCount });
  const conversionContext = globalThis.ForgeAdvisorForecastGovernedConversions || null;
  const activityRequirement = calculateActivityRequirement(goalGap, conversionContext);
  const requirementNeeded = goalGap.needsActivityRequirementModel === true;
  const sourceMissing = [target, currentProduction].some((value) => value === null);
  const sourcePartial = context.snapshots.opportunities?.sourceComplete !== true
    || activityCount === null
    || (requirementNeeded && activityRequirement.status === "INSUFFICIENT_DATA");
  const state = sourceMissing ? "MISSING_DATA" : sourcePartial ? "PARTIAL" : "READY";
  const confidence = sourceMissing
    ? "INSUFFICIENT_DATA"
    : sourcePartial
      ? "MEDIUM"
      : "HIGH";
  const healthStatus = target === null || currentProduction === null
    ? "UNKNOWN"
    : currentProduction >= target || (paceProjection !== null && paceProjection >= target)
      ? "ON_TRACK"
      : paceProjection === null
        ? "NEEDS_UPDATE"
        : paceProjection >= target * 0.75
          ? "AT_RISK"
          : "BEHIND";
  const missingInformation = [
    ...(target === null ? [{ signal: "target" }] : []),
    ...(currentProduction === null ? [{ signal: "production" }] : []),
    ...(!Array.isArray(opportunities) ? [{ signal: "pipeline" }] : []),
    ...(activityCount === null ? [{ signal: "activity" }] : []),
  ];
  const actions = [{ type: "NAVIGATE", label: "Abrir Forecast", destination: "ADVISOR_FORECAST_DETAIL" }];
  if (activityRequirement.status === "READY") {
    actions.push({ type: "NAVIGATE", label: "Planificar actividad", destination: "ACTIVITY_FORECAST_PLAN" });
  }
  if ((weighting.atRiskCount || 0) > 0) {
    actions.push({ type: "NAVIGATE", label: "Revisar casos en riesgo", destination: "PIPELINE_AT_RISK" });
  } else if ((weighting.activeOpportunityCount || 0) > 0) {
    actions.push({ type: "NAVIGATE", label: "Ver oportunidades", destination: "PIPELINE_FORECAST_CONTEXT" });
  } else if (missingInformation.length) {
    actions.push({ type: "REVIEW_SOURCE_CONTEXT", label: "Actualizar datos", destination: "FORECAST_SOURCE_REVIEW" });
  }
  const evidenceRefs = unique([
    ...safeArray(goalWidget?.evidence),
    ...safeArray(activityWidget?.evidence),
    ...safeArray(context.snapshots.opportunities?.evidence),
    ...safeArray(weighting.topContributors).flatMap((entry) => entry.evidenceRefs),
  ]);
  return Object.freeze({
    schema: "ADVISOR_FORECAST_READ_MODEL_V3",
    runtimeVersion: RUNTIME_VERSION,
    advisorId: context.advisorId,
    period,
    periodLabel: currentMonth,
    generatedAt: context.now,
    state,
    target,
    targetUnit: "policies",
    currentProduction,
    productionUnit: "policies",
    paceProjection,
    projectedCoverage: goalGap.currentCoverage,
    confidence,
    healthStatus,
    scenarios: { conservative: null, baseline: null, stretch: null },
    primaryExplanation: goalGap.primaryExplanation,
    supportingSignals: [],
    riskSignals: safeArray(weighting.opportunities).filter((entry) => entry.classification === "AT_RISK"),
    missingInformation,
    staleInformation: [],
    activeOpportunityCount: weighting.activeOpportunityCount,
    atRiskCount: weighting.atRiskCount,
    staleSignalCount: 0,
    missingDataCount: missingInformation.length,
    evidenceRefs,
    goalGap,
    opportunityForecast: {
      status: weighting.status,
      activeOpportunityCount: weighting.activeOpportunityCount,
      weightedPolicyContribution: weighting.weightedPolicyContribution,
      classificationCounts: weighting.classificationCounts,
      atRiskCount: weighting.atRiskCount,
      unknownCount: weighting.unknownCount,
      topContributors: weighting.topContributors,
    },
    activityRequirement: {
      status: activityRequirement.status,
      residualPolicyGap: activityRequirement.residualPolicyGap,
      policiesRequired: activityRequirement.policiesRequired,
      applicationsRequired: activityRequirement.applicationsRequired,
      presentationsRequired: activityRequirement.presentationsRequired,
      appointmentsRequired: activityRequirement.appointmentsRequired,
      contactsRequired: activityRequirement.contactsRequired,
      confidence: activityRequirement.confidence,
      cadence: null,
      selectedRates: clone(activityRequirement.selectedRates || {}),
      missingRates: clone(activityRequirement.missingRates || []),
      recommendedActions: clone(activityRequirement.recommendedActions || []),
      precisionPolicy: activityRequirement.precisionPolicy || null,
      humanConfirmationRequired: true,
    },
    activityHandoff: {
      available: activityRequirement.status === "READY",
      destination: "ACTIVITY_FORECAST_PLAN",
      requiresHumanConfirmation: true,
      automaticSubmissionAllowed: false,
      createsTask: false,
      createsCalendarEvent: false,
    },
    decisionSummary: {
      state: goalGap.state,
      headline: goalGap.primaryExplanation,
      confirmedGap: goalGap.confirmedGap,
      remainingAfterWeightedPipeline: goalGap.remainingAfterWeightedPipeline,
      topContributorIds: weighting.topContributors.map((entry) => entry.opportunityId),
      activityRequirementStatus: activityRequirement.status,
      humanReviewRequired: true,
    },
    actions: actions.slice(0, 3),
    warnings: unique([
      "La proyección por ritmo no es una garantía.",
      "El Pipeline ponderado es contexto de decisión y no crea producción ni ingreso.",
      ...(activityRequirement.status === "INSUFFICIENT_DATA" ? ["No se inventaron tasas de conversión para el plan de actividad."] : []),
    ]),
    amountWeightingApplied: false,
    calculationPerformedByReadModel: false,
    automaticDecisionAllowed: false,
    automaticTaskCreationAllowed: false,
    automaticCalendarCreationAllowed: false,
    createsActivityTruth: false,
    createsRevenueTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false,
    uiMutationPerformed: false,
    sourceDiagnostics: clone(context.snapshots),
  });
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}
async function sha256(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(stableValue(value)));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function issueSnapshot(readModel) {
  const body = Object.freeze({
    schema: "ADVISOR_FORECAST_ISSUED_SNAPSHOT_V1",
    advisorId: readModel.advisorId,
    period: clone(readModel.period),
    issuedAt: readModel.generatedAt,
    currentProduction: readModel.currentProduction,
    paceProjection: readModel.paceProjection,
    weightedPipelineContribution: readModel.goalGap?.weightedPipelineContribution ?? null,
    pipelineExpectedClose: readModel.goalGap?.weightedPipelineContribution == null
      ? null
      : round(readModel.currentProduction + readModel.goalGap.weightedPipelineContribution, 2),
    target: readModel.target,
    activityRequirement: clone(readModel.activityRequirement),
  });
  const snapshot = Object.freeze({ ...body, digestAlgorithm: "SHA-256", digest: await sha256(body), immutable: true });
  runtimeState.issuedSnapshot = snapshot;
  try { sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot)); } catch {}
  return snapshot;
}
function persistReadModel(readModel) {
  runtimeState.readModel = readModel;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      runtimeVersion: RUNTIME_VERSION,
      advisorId: readModel.advisorId,
      readModel,
    }));
  } catch {}
}

export async function enrichProductiveStackWithAdvisorForecast({
  stack,
  runtimeContext,
  previousSelection = null,
  now = null,
  timeZone = "America/Mexico_City",
} = {}) {
  if (!runtimeContext || runtimeContext.disabled || !stack) return stack;
  guardRuntime(runtimeContext);
  const modules = await loadRuntimeModules();
  guardRuntime(runtimeContext);
  const readModel = buildReadModel({ stack, context: runtimeContext });
  const day = monthDay(now || runtimeContext.now, timeZone);
  const monthEndWindow = daysInMonth(readModel.period.yearMonth) - day <= 5;
  const forecastWidget = modules.createAdvisorForecastSmartWidget({ readModel, monthEndWindow });
  const inventory = safeArray(stack.inventory)
    .filter((widget) => widget.widgetFamily !== "ADVISOR_FORECAST_WIDGET" && widget.widgetFamily !== "JUDGMENT_PROMPT_WIDGET")
    .concat(forecastWidget);
  const ranking = modules.rankProductiveSmartWidgets({
    widgets: inventory,
    now: now || runtimeContext.now,
    timeZone,
    previousSelection,
    limits: stack.limits || { primary: 1, supporting: 2, visible: 3 },
  });
  const stackStatus = ranking.primary
    ? ranking.visible.some((widget) => ["PARTIAL", "STALE"].includes(widget.state)) ? "PARTIAL" : "READY"
    : "EMPTY";
  const enriched = modules.createProductiveSmartWidgetStack({
    stackStatus,
    advisorId: stack.advisorId,
    generatedAt: stack.generatedAt,
    primary: ranking.primary,
    supporting: ranking.supporting,
    visible: ranking.visible,
    inventory,
    pendingDependencies: stack.pendingDependencies,
    selectionTrace: [
      { reason: "ADVISOR_FORECAST_RUNTIME_ACCEPTANCE", runtimeVersion: RUNTIME_VERSION },
      { reason: ranking.selectionReason, context: ranking.context },
      ...ranking.ranked,
    ],
    limits: stack.limits,
  });
  persistReadModel(readModel);
  await issueSnapshot(readModel);
  globalThis.dispatchEvent?.(new CustomEvent("forge:advisor-forecast-read-model-ready", {
    detail: Object.freeze({ advisorId: readModel.advisorId, period: readModel.period, readModel }),
  }));
  document.documentElement.dataset.advisorForecastRuntime = RUNTIME_VERSION;
  document.documentElement.dataset.advisorForecastState = readModel.state;
  return enriched;
}

export function scrubAdvisorForecastRuntime(reason = "session-scrub") {
  runtimeState.generation += 1;
  runtimeState.advisorId = null;
  runtimeState.readModel = null;
  runtimeState.issuedSnapshot = null;
  runtimeState.routeSurface?.remove?.();
  runtimeState.routeSurface = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SNAPSHOT_KEY);
    sessionStorage.removeItem(ACTIVITY_DRAFT_KEY);
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.dataset.advisorForecastState = "scrubbed";
    document.documentElement.dataset.advisorForecastScrubReason = reason;
  }
}

export function getCurrentAdvisorForecastReadModel() {
  if (runtimeState.readModel) return runtimeState.readModel;
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (stored?.runtimeVersion === RUNTIME_VERSION && stored?.readModel?.advisorId) {
      runtimeState.advisorId = stored.advisorId;
      runtimeState.readModel = Object.freeze(stored.readModel);
      return runtimeState.readModel;
    }
  } catch {}
  return null;
}
export function getIssuedAdvisorForecastSnapshot() {
  if (runtimeState.issuedSnapshot) return runtimeState.issuedSnapshot;
  try {
    const stored = JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) || "null");
    if (stored?.schema === "ADVISOR_FORECAST_ISSUED_SNAPSHOT_V1") {
      runtimeState.issuedSnapshot = Object.freeze(stored);
      return runtimeState.issuedSnapshot;
    }
  } catch {}
  return null;
}

export function getConfirmedAdvisorForecastActivityDraft() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(ACTIVITY_DRAFT_KEY) || "null");
    return stored?.schema === "forge.advisor-forecast-activity-draft.v1" ? Object.freeze(stored) : null;
  } catch {
    return null;
  }
}

export async function reconcileAdvisorForecastIssuedSnapshot({
  snapshot = getIssuedAdvisorForecastSnapshot(),
  policyFacts = null,
  sourceEvidence = null,
  asOf = new Date().toISOString(),
} = {}) {
  if (!snapshot || snapshot.schema !== "ADVISOR_FORECAST_ISSUED_SNAPSHOT_V1") {
    throw new TypeError("A valid issued Advisor Forecast snapshot is required");
  }
  const body = Object.fromEntries(Object.entries(snapshot).filter(([key]) => !["digest", "digestAlgorithm", "immutable"].includes(key)));
  if (await sha256(body) !== snapshot.digest) throw new Error("ADVISOR_FORECAST_ISSUED_SNAPSHOT_DIGEST_MISMATCH");
  const periodEnd = new Date(`${snapshot.period?.end || ""}T23:59:59.999Z`);
  if (Number.isNaN(periodEnd.getTime()) || new Date(asOf) <= periodEnd) {
    return Object.freeze({ status: "PERIOD_OPEN", reconciled: false, retroactiveMutationPerformed: false });
  }
  if (!Array.isArray(policyFacts)) {
    return Object.freeze({ status: "INSUFFICIENT_DATA", reconciled: false, missingContext: ["policyFacts"], retroactiveMutationPerformed: false });
  }
  const scoped = policyFacts.filter((fact) => {
    if (fact?.advisorId && fact.advisorId !== snapshot.advisorId) throw new Error("ADVISOR_FORECAST_RECONCILIATION_CROSS_ADVISOR_DATA");
    const factMonth = fact?.yearMonth || yearMonth(fact?.soldAt || fact?.occurredAt || fact?.createdAt, snapshot.period.timeZone);
    return fact?.eventType === "POLICY_SOLD_CONFIRMED" && fact?.policyId && factMonth === snapshot.period.yearMonth;
  });
  const actual = new Set(scoped.map((fact) => fact.policyId)).size;
  const directEvidence = evidenceOf(sourceEvidence || {}).length > 0 || scoped.some((fact) => evidenceOf(fact).length > 0);
  if (actual === 0 && !directEvidence) {
    return Object.freeze({ status: "INSUFFICIENT_DATA", reconciled: false, missingContext: ["explicit_zero_evidence"], retroactiveMutationPerformed: false });
  }
  const compare = (projected) => {
    const value = finite(projected);
    if (value === null) return null;
    const signedError = round(value - actual, 2);
    return Object.freeze({
      projected: value,
      actual,
      signedError,
      absoluteError: Math.abs(signedError),
      bias: signedError > 0 ? "OPTIMISTIC" : signedError < 0 ? "CONSERVATIVE" : "EXACT",
    });
  };
  return Object.freeze({
    status: "RECONCILED",
    reconciled: true,
    advisorId: snapshot.advisorId,
    period: clone(snapshot.period),
    actualConfirmedPolicies: actual,
    paceComparison: compare(snapshot.paceProjection),
    weightedPipelineComparison: compare(snapshot.pipelineExpectedClose),
    monetaryAccuracyCalculated: false,
    retroactiveMutationPerformed: false,
    createsProductionTruth: false,
    sourceAuthority: "POLICY_SOLD_CONFIRMED",
  });
}

function ensureRouteStyles() {
  if (!document.querySelector("[data-advisor-forecast-detail-styles]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("./advisor-forecast-detail-screen.css?v=af-runtime-acceptance-001", import.meta.url);
    link.dataset.advisorForecastDetailStyles = "true";
    document.head.appendChild(link);
  }
  if (!document.querySelector("[data-advisor-forecast-runtime-styles]")) {
    const runtimeLink = document.createElement("link");
    runtimeLink.rel = "stylesheet";
    runtimeLink.href = new URL("./advisor-forecast-runtime-acceptance.css?v=af-runtime-acceptance-001", import.meta.url);
    runtimeLink.dataset.advisorForecastRuntimeStyles = "true";
    document.head.appendChild(runtimeLink);
  }
}
function renderUnavailable(root) {
  root.innerHTML = `
    <section class="advisor-forecast-detail" data-advisor-forecast-route-surface="unavailable">
      <header class="advisor-forecast-detail-header">
        <div><p class="advisor-forecast-eyebrow">FORECAST</p><h2>Abre Forecast desde Inicio</h2><p>No existe una lectura autenticada vigente en esta pestaña. Forge no mostrará datos inventados.</p></div>
      </header>
      <footer class="advisor-forecast-detail-actions"><a class="advisor-forecast-action" href="?nav=inicio">Volver a Inicio</a></footer>
    </section>`;
}
function routeDeepLink(destination, modules) {
  try {
    return modules.resolveAdvisorForecastNavigationAction({ destination }).deepLink;
  } catch {
    return "?nav=inicio";
  }
}
function mountForecastRoute() {
  if (typeof document === "undefined") return;
  const url = new URL(window.location.href);
  const nav = url.searchParams.get("nav");
  const view = url.searchParams.get("view");
  if (nav !== "actividad" || !["advisor-forecast", "forecast-plan", "forecast-sources"].includes(view)) return;
  const activityRoot = document.querySelector("[data-forge-activity-module]");
  if (!activityRoot) return;
  ensureRouteStyles();
  const existing = activityRoot.querySelector("[data-advisor-forecast-route-surface]");
  existing?.remove();
  activityRoot.querySelector("[data-activity-surface]")?.setAttribute("hidden", "");
  const routeRoot = document.createElement("div");
  routeRoot.dataset.advisorForecastRouteSurface = view;
  routeRoot.className = "advisor-forecast-route-surface";
  activityRoot.appendChild(routeRoot);
  runtimeState.routeSurface = routeRoot;
  const readModel = getCurrentAdvisorForecastReadModel();
  if (!readModel) {
    renderUnavailable(routeRoot);
    return;
  }
  loadRuntimeModules().then((modules) => {
    if (!routeRoot.isConnected) return;
    modules.mountAdvisorForecastDetailScreen({
      root: routeRoot,
      readModel,
      navigate(action) {
        window.location.href = routeDeepLink(action.destination, modules);
      },
    });
    if (view === "forecast-plan") {
      const section = document.createElement("section");
      section.className = "advisor-forecast-section advisor-forecast-boundary";
      section.dataset.advisorForecastPlan = "true";
      const requirement = readModel.activityRequirement || {};
      const existingDraft = getConfirmedAdvisorForecastActivityDraft();
      if (requirement.status !== "READY") {
        section.innerHTML = `<h3>Plan de actividad</h3><p>Faltan tasas de conversión respaldadas por evidencia. No se creó un plan automático.</p>`;
      } else {
        const labels = { PROSPECTING_CONTACTS: "Contactos", APPOINTMENTS: "Citas", PRESENTATIONS: "Presentaciones", APPLICATIONS: "Solicitudes" };
        const rows = safeArray(requirement.recommendedActions).map((action, index) => `
          <label class="advisor-forecast-plan-row">
            <input type="checkbox" checked data-forecast-plan-select="${index}">
            <span>${labels[action.actionType] || action.actionType}: <strong>${action.requiredCount}</strong></span>
            <input type="date" required data-forecast-plan-date="${index}">
          </label>`).join("");
        section.innerHTML = `
          <h3>Plan de actividad</h3>
          <p>Mínimos sugeridos; revisa, agenda y confirma antes de entregar a Actividad.</p>
          ${existingDraft ? '<p class="advisor-forecast-plan-status">Existe un borrador confirmado pendiente de aceptación FES.</p>' : ""}
          <form data-advisor-forecast-plan-form>${rows}<button class="advisor-forecast-action" type="submit">Confirmar plan</button><p data-advisor-forecast-plan-result aria-live="polite"></p></form>`;
        section.querySelector("form")?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const result = section.querySelector("[data-advisor-forecast-plan-result]");
          try {
            const handoff = modules.createAdvisorForecastActivityHandoff({
              advisorId: readModel.advisorId,
              period: readModel.period,
              activityRequirement: {
                ...requirement,
                requirementStatus: requirement.status,
                recommendedActions: safeArray(requirement.recommendedActions).map((action) => ({ ...action, unit: "minimum" })),
                evidenceRefs: readModel.evidenceRefs,
              },
              generatedAt: new Date().toISOString(),
              sourceForecastId: getIssuedAdvisorForecastSnapshot()?.digest || null,
            });
            const selectedItems = handoff.recommendations.flatMap((recommendation, index) => {
              const selected = section.querySelector(`[data-forecast-plan-select="${index}"]`);
              const due = section.querySelector(`[data-forecast-plan-date="${index}"]`);
              return selected?.checked ? [{ recommendationId: recommendation.recommendationId, requiredCount: recommendation.requiredCount, dueAt: due?.value }] : [];
            });
            const submission = await modules.submitAdvisorForecastActivityHandoff({
              handoff,
              confirmation: { confirmedByAdvisor: true, advisorId: readModel.advisorId, confirmedAt: new Date().toISOString() },
              selectedItems,
              async submitDraft(draft) {
                sessionStorage.setItem(ACTIVITY_DRAFT_KEY, JSON.stringify(draft));
                globalThis.dispatchEvent?.(new CustomEvent("forge:advisor-forecast-activity-draft-confirmed", { detail: { draft } }));
                return { accepted: true, authority: "ACTIVITY_RUNTIME_REVIEW_INBOX", fesEventCreated: false };
              },
            });
            result.textContent = submission.status === "SUBMITTED_AFTER_HUMAN_CONFIRMATION"
              ? "Plan entregado a Actividad para revisión. Aún no se crearon tareas ni eventos."
              : "El plan no pudo entregarse.";
          } catch (error) {
            result.textContent = error?.message || "Revisa las actividades y fechas antes de confirmar.";
          }
        });
      }
      routeRoot.querySelector(".advisor-forecast-detail")?.appendChild(section);
    }
    if (view === "forecast-sources") {
      const section = document.createElement("section");
      section.className = "advisor-forecast-section advisor-forecast-boundary";
      section.dataset.advisorForecastSources = "true";
      section.innerHTML = `<h3>Fuentes</h3><pre>${JSON.stringify(readModel.sourceDiagnostics || {}, null, 2).replaceAll("<", "&lt;")}</pre>`;
      routeRoot.querySelector(".advisor-forecast-detail")?.appendChild(section);
    }
  }).catch(() => renderUnavailable(routeRoot));
}
function mountPipelineForecastContext() {
  if (typeof document === "undefined") return;
  const url = new URL(window.location.href);
  if (url.searchParams.get("nav") !== "pipeline" || url.searchParams.get("view") !== "forecast-context") return;
  const root = document.querySelector("[data-forge-pipeline-module]");
  if (!root || root.querySelector("[data-advisor-forecast-pipeline-context]")) return;
  const readModel = getCurrentAdvisorForecastReadModel();
  const banner = document.createElement("section");
  banner.className = "organic-card";
  banner.dataset.advisorForecastPipelineContext = "true";
  if (readModel) {
    const filter = url.searchParams.get("filter");
    const candidates = filter === "at-risk"
      ? safeArray(readModel.riskSignals)
      : safeArray(readModel.opportunityForecast?.topContributors);
    const rows = candidates.map((entry) => `<li><strong>${String(entry.opportunityId || "Sin identificador").replaceAll("<", "&lt;")}</strong> · ${entry.classification || "UNKNOWN"} · ${entry.probability ?? "?"}%</li>`).join("");
    banner.innerHTML = `<p class="section-kicker accent">FORECAST</p><h2>${filter === "at-risk" ? "Casos en riesgo" : "Oportunidades que sostienen el Forecast"}</h2><p>${readModel.primaryExplanation}</p>${rows ? `<ul>${rows}</ul>` : "<p>No hay casos elegibles con evidencia suficiente.</p>"}`;
  } else {
    banner.innerHTML = `<p class="section-kicker accent">FORECAST</p><h2>Contexto no disponible</h2><p>Abre Forecast desde Inicio para crear una lectura autenticada.</p>`;
  }
  root.prepend(banner);
}
function mountRuntimeRoutes() {
  mountForecastRoute();
  mountPipelineForecastContext();
}

if (typeof window !== "undefined") {
  window.addEventListener("pageshow", mountRuntimeRoutes);
  window.addEventListener("popstate", mountRuntimeRoutes);
  window.addEventListener("forge:auth-state-changed", (event) => {
    const detail = event?.detail || {};
    if (detail.status !== "authenticated" || !detail.advisorId) scrubAdvisorForecastRuntime(`auth:${detail.event || detail.status || "unknown"}`);
  });
  queueMicrotask(() => {
    window.setTimeout(mountRuntimeRoutes, 0);
  });
}

globalThis.ForgeAdvisorForecastRuntimeAcceptance = Object.freeze({
  version: RUNTIME_VERSION,
  getReadModel: getCurrentAdvisorForecastReadModel,
  getIssuedSnapshot: getIssuedAdvisorForecastSnapshot,
  getConfirmedActivityDraft: getConfirmedAdvisorForecastActivityDraft,
  reconcileIssuedSnapshot: reconcileAdvisorForecastIssuedSnapshot,
  scrub: scrubAdvisorForecastRuntime,
  mountRoutes: mountRuntimeRoutes,
});

export {
  RUNTIME_VERSION,
  buildReadModel as buildAdvisorForecastRuntimeReadModel,
  cardToOpportunity as mapPipelineCardToForecastOpportunity,
  weightOpportunity as weightAdvisorForecastRuntimeOpportunity,
  weightOpportunities as weightAdvisorForecastRuntimeOpportunities,
  calculateGoalGap as calculateAdvisorForecastRuntimeGoalGap,
  calculateActivityRequirement as calculateAdvisorForecastRuntimeActivityRequirement,
  issueSnapshot as issueAdvisorForecastRuntimeSnapshot,
};
