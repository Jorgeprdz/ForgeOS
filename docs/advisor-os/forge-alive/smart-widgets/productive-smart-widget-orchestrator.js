import {
  SMART_WIDGET_STATES,
  PRODUCTIVE_SMART_WIDGET_FAMILIES,
  SMART_WIDGET_RENDER_VARIANTS,
  createMetric,
  createProductiveSmartWidget,
  createProductiveSmartWidgetStack,
  isVisibleWidgetState,
  cloneJson,
} from "./productive-smart-widget-contract.js";

import {
  createActivityProgressWidget,
  createMonthlyPolicyGoalWidget,
  createPolicyServiceRiskWidget,
  createOpportunityCloseLikelihoodWidget,
  PRODUCTIVE_SMART_WIDGET_PENDING_DEPENDENCIES,
} from "./productive-smart-widget-providers.js";

import {
  createIncomeCompensationSourceAdapter,
} from "./productive-smart-widget-source-adapters.js";

import {
  createIncomeProgressWidget080,
} from "./advisor-compensation-income-widget-provider-080.js";

const HARD_PRIORITY_SCORES = Object.freeze({
  CONFIRMED_OVERDUE_POLICY: 1000,
  PAYMENT_CONFIRMATION_REQUIRED: 960,
  CONFIRMED_INCOME_AT_RISK: 930,
  POLICY_RENEWAL_DUE: 900,
  OPPORTUNITY_DECISION_DUE_TODAY: 860,
  DAILY_ACTIVITY_RECOVERY: 760,
  MONTH_END_GOAL_RISK: 720,
});

const ALL_PENDING_DEPENDENCIES = Object.freeze([
  ...PRODUCTIVE_SMART_WIDGET_PENDING_DEPENDENCIES,
  {
    dependencyId: "PIPELINE_BITACORA_SIGNAL_MAPPING",
    unlocks: [PRODUCTIVE_SMART_WIDGET_FAMILIES.OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET],
    requiredAuthority: "PIPELINE_AND_BITACORA",
    requiredContract: "Canonical dated evidence-backed signals mapped to opportunity-likelihood.v1 vocabulary",
  },
]);

const DEFAULT_LIMITS = Object.freeze({ primary: 1, supporting: 2, visible: 3 });
const DEFAULT_STICKY_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_CHALLENGER_MARGIN = 8;
const AUTHORITY_UNAVAILABLE_STATES = Object.freeze(new Set([
  SMART_WIDGET_STATES.LOADING,
  SMART_WIDGET_STATES.SOURCE_UNAVAILABLE,
  SMART_WIDGET_STATES.NOT_CONNECTED,
  SMART_WIDGET_STATES.SESSION_REQUIRED,
  SMART_WIDGET_STATES.HIDDEN_BY_SCOPE,
]));

const LEGACY_INCOME_PLACEHOLDER_REASONS = Object.freeze(new Set([
  "COMPENSATION_INCOME_TRUTH_NOT_CONNECTED",
  "WAITING_FOR_COMPENSATION_INCOME_TRUTH_MINIMUM",
]));

function parseTime(value) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function currentHour(now, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(now));
  return Number(parts.find((part) => part.type === "hour")?.value ?? 0);
}

function dayOfMonth(now, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    day: "2-digit",
  }).formatToParts(new Date(now));
  return Number(parts.find((part) => part.type === "day")?.value ?? 1);
}

function daysInMonth(now, timeZone) {
  const date = new Date(now);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function stateAdjustment(state) {
  switch (state) {
    case SMART_WIDGET_STATES.READY: return 20;
    case SMART_WIDGET_STATES.PARTIAL: return 5;
    case SMART_WIDGET_STATES.STALE: return -15;
    case SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE: return 35;
    default: return -1000;
  }
}

function confidenceAdjustment(confidence) {
  switch (confidence) {
    case "HIGH": return 12;
    case "MEDIUM": return 4;
    case "LOW": return -8;
    default: return -3;
  }
}

function contextualAdjustment(widget, context) {
  let score = 0;
  if (widget.widgetFamily === PRODUCTIVE_SMART_WIDGET_FAMILIES.ACTIVITY_PROGRESS_WIDGET && context.hour >= 15) score += 12;
  if (widget.widgetFamily === PRODUCTIVE_SMART_WIDGET_FAMILIES.MONTHLY_POLICY_GOAL_WIDGET && context.monthEndWindow) score += 14;
  if (widget.widgetFamily === PRODUCTIVE_SMART_WIDGET_FAMILIES.OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET && context.hour >= 9 && context.hour <= 18) score += 6;
  if (widget.widgetFamily === PRODUCTIVE_SMART_WIDGET_FAMILIES.INCOME_PROGRESS_WIDGET && context.monthEndWindow) score += 6;
  return score;
}

function calculateRank(widget, context) {
  const hard = widget.hardPriority ? HARD_PRIORITY_SCORES[widget.hardPriority] : null;
  if (hard !== null && hard !== undefined) return hard;
  return widget.rankScore + stateAdjustment(widget.state) + confidenceAdjustment(widget.confidence) + contextualAdjustment(widget, context);
}

function compareRanked(left, right) {
  return right.effectiveRank - left.effectiveRank
    || String(left.widget.widgetFamily).localeCompare(String(right.widget.widgetFamily))
    || String(left.widget.widgetId).localeCompare(String(right.widget.widgetId));
}

function selectStablePrimary(ranked, previousSelection, now, options) {
  if (!ranked.length) return { selected: null, reason: "NO_VISIBLE_CANDIDATE" };
  const challenger = ranked[0];
  if (!previousSelection?.primaryWidgetId) {
    return { selected: challenger, reason: "HIGHEST_RANKED_CANDIDATE" };
  }
  const incumbent = ranked.find((entry) => entry.widget.widgetId === previousSelection.primaryWidgetId);
  if (!incumbent) return { selected: challenger, reason: "PREVIOUS_PRIMARY_NOT_ELIGIBLE" };
  if (challenger.widget.widgetId === incumbent.widget.widgetId) {
    return { selected: incumbent, reason: "PRIMARY_REMAINS_HIGHEST" };
  }
  if (challenger.widget.hardPriority && challenger.effectiveRank > incumbent.effectiveRank) {
    return { selected: challenger, reason: "HARD_PRIORITY_PREEMPTION" };
  }
  const selectedAt = parseTime(previousSelection.selectedAt);
  const nowTime = parseTime(now);
  const withinStickyWindow = selectedAt !== null && nowTime !== null && nowTime - selectedAt < options.stickyWindowMs;
  const margin = challenger.effectiveRank - incumbent.effectiveRank;
  if (withinStickyWindow && margin < options.challengerMargin) {
    return { selected: incumbent, reason: "ANTI_FLAPPING_STICKY_PRIMARY" };
  }
  return { selected: challenger, reason: margin >= options.challengerMargin ? "CHALLENGER_EXCEEDED_MARGIN" : "STICKY_WINDOW_EXPIRED" };
}

function createJudgmentPromptWidget(reason, pendingDependencies = []) {
  return createProductiveSmartWidget({
    widgetFamily: PRODUCTIVE_SMART_WIDGET_FAMILIES.JUDGMENT_PROMPT_WIDGET,
    widgetId: "forge-judgment-prompt",
    state: SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE,
    rankScore: 95,
    title: "Falta contexto",
    subtitle: "Forge no convertirá un desconocido en cero ni una inferencia en hecho.",
    primaryMetric: createMetric(),
    secondaryMetric: createMetric(),
    whyNow: reason,
    evidence: [],
    uncertainty: ["missing_context_blocks_reliable_widget_selection"],
    missingContext: pendingDependencies.map((item) => item.dependencyId),
    confidence: "LOW",
    sourceAuthorities: ["SMART_WIDGET_ORCHESTRATOR"],
    reviewAction: { type: "REVIEW_DEPENDENCIES", label: "Revisar dependencias" },
    blockedReason: "MISSING_REQUIRED_CONTEXT",
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.JUDGMENT,
    payload: { pendingDependencies: cloneJson(pendingDependencies) },
  });
}

async function materializeSource(source, context) {
  if (!source || typeof source !== "object") {
    return { sourceConnected: false, sourceComplete: false };
  }
  if (typeof source.load !== "function") return source;
  try {
    const loaded = await source.load(context);
    return { ...source, ...(loaded && typeof loaded === "object" ? loaded : {}) };
  } catch (error) {
    if (error?.name === "AbortError" || context.signal?.aborted) throw error;
    return {
      ...source,
      sourceConnected: source.sourceConnected !== false,
      sourceComplete: false,
      sourceUnavailable: true,
      sourceError: {
        name: error?.name || "Error",
        message: error?.message || "Source unavailable",
      },
    };
  }
}

function authorityAvailable(widget) {
  return !AUTHORITY_UNAVAILABLE_STATES.has(widget.state);
}

function dependencyUnlocked(dependency, related) {
  const widget = related[0];
  if (!widget) return false;

  switch (dependency.dependencyId) {
    case "MICK_ACTIVITY_SCORING_SNAPSHOT":
      return Number.isFinite(widget.payload?.pointsEarned)
        && Number.isFinite(widget.payload?.dailyTarget);
    case "ADVISOR_MONTHLY_POLICY_GOAL_PERSISTENCE":
      return Number.isFinite(widget.payload?.target);
    case "COMPENSATION_INCOME_TRUTH_MINIMUM":
      return authorityAvailable(widget) && (
        widget.payload?.sourceContract ===
          "ADVISOR_COMPENSATION_INCOME_WIDGET_SNAPSHOT_001" ||
        (
          widget.payload?.sourceContract == null &&
          widget.sourceAuthorities?.includes("COMPENSATION_INTELLIGENCE")
        )
      );
    default:
      return related.some(authorityAvailable);
  }
}

function dependencyStatus(inventory) {
  return ALL_PENDING_DEPENDENCIES.map((dependency) => {
    const related = inventory.filter((widget) => dependency.unlocks.includes(widget.widgetFamily));
    const unlocked = dependencyUnlocked(dependency, related);
    return {
      ...dependency,
      status: unlocked ? "UNLOCKED_OR_PARTIAL" : "PENDING",
      widgetStates: related.map((widget) => ({
        widgetId: widget.widgetId,
        state: widget.state,
        blockedReason: widget.blockedReason,
      })),
    };
  });
}

function shouldActivateProductiveIncomeSource(source) {
  if (!source || typeof source !== "object") return true;
  return source.sourceConnected === false
    && LEGACY_INCOME_PLACEHOLDER_REASONS.has(source.blockedReason);
}

export function rankProductiveSmartWidgets({ widgets = [], now, timeZone = "America/Mexico_City", previousSelection = null, limits = DEFAULT_LIMITS, stickyWindowMs = DEFAULT_STICKY_WINDOW_MS, challengerMargin = DEFAULT_CHALLENGER_MARGIN } = {}) {
  const context = {
    hour: currentHour(now, timeZone),
    dayOfMonth: dayOfMonth(now, timeZone),
    daysInMonth: daysInMonth(now, timeZone),
  };
  context.monthEndWindow = context.daysInMonth - context.dayOfMonth <= 5;

  const eligible = widgets.filter((widget) => isVisibleWidgetState(widget.state));
  const ranked = eligible.map((widget) => ({ widget, effectiveRank: calculateRank(widget, context) })).sort(compareRanked);
  const selection = selectStablePrimary(ranked, previousSelection, now, { stickyWindowMs, challengerMargin });
  const ordered = selection.selected
    ? [selection.selected, ...ranked.filter((entry) => entry.widget.widgetId !== selection.selected.widget.widgetId)]
    : ranked;
  const visibleEntries = ordered.slice(0, limits.visible);
  const visible = visibleEntries.map((entry) => ({ ...cloneJson(entry.widget), effectiveRank: entry.effectiveRank }));
  const primary = visible[0] || null;
  const supporting = visible.slice(1, 1 + limits.supporting);

  return {
    primary,
    supporting,
    visible,
    ranked: ranked.map((entry) => ({ widgetId: entry.widget.widgetId, widgetFamily: entry.widget.widgetFamily, effectiveRank: entry.effectiveRank, hardPriority: entry.widget.hardPriority })),
    selectionReason: selection.reason,
    context,
  };
}

export async function buildProductiveSmartWidgetStack(input = {}) {
  const before = JSON.stringify(input);
  const now = input.now || new Date().toISOString();
  const timeZone = input.timeZone || "America/Mexico_City";
  const session = input.session || {};

  if (session.status !== "AUTHENTICATED" || !session.advisorId) {
    const stack = createProductiveSmartWidgetStack({
      stackStatus: SMART_WIDGET_STATES.SESSION_REQUIRED,
      generatedAt: now,
      advisorId: null,
      primary: null,
      supporting: [],
      visible: [],
      inventory: [],
      pendingDependencies: ALL_PENDING_DEPENDENCIES,
      selectionTrace: [{ reason: "SESSION_REQUIRED", privateDataRendered: false }],
    });
    if (JSON.stringify(input) !== before) throw new Error("Productive Smart Widget orchestrator mutated input");
    return stack;
  }

  const hour = currentHour(now, timeZone);
  const monthEndWindow = daysInMonth(now, timeZone) - dayOfMonth(now, timeZone) <= 5;
  const sources = input.sources || {};
  const sourceContext = { advisorId: session.advisorId, now, timeZone, signal: input.signal };
  const incomeCandidate = shouldActivateProductiveIncomeSource(sources.income)
    ? createIncomeCompensationSourceAdapter()
    : sources.income;
  const [activitySource, monthlyGoalSource, policyServiceSource, opportunitySource, incomeSource] = await Promise.all([
    materializeSource(sources.activity, sourceContext),
    materializeSource(sources.monthlyGoal, sourceContext),
    materializeSource(sources.policyService, sourceContext),
    materializeSource(sources.opportunities, sourceContext),
    materializeSource(incomeCandidate, sourceContext),
  ]);

  const activityReportResult = typeof activitySource.loadReportResult === "function"
    ? await activitySource.loadReportResult(sourceContext)
    : activitySource.reportResult;

  const widgets = [
    createActivityProgressWidget({
      ...activitySource,
      reportResult: activityReportResult,
      afterFourPm: hour >= 16,
    }),
    createMonthlyPolicyGoalWidget({
      ...monthlyGoalSource,
      asOf: now,
      timeZone,
      monthEndRisk: monthEndWindow,
    }),
    createPolicyServiceRiskWidget(policyServiceSource),
    createOpportunityCloseLikelihoodWidget(opportunitySource),
    createIncomeProgressWidget080(incomeSource),
  ];

  for (const supplied of Array.isArray(input.additionalWidgets) ? input.additionalWidgets : []) {
    widgets.push(supplied);
  }

  const pendingDependencies = dependencyStatus(widgets);
  let ranking = rankProductiveSmartWidgets({
    widgets,
    now,
    timeZone,
    previousSelection: input.previousSelection || null,
    limits: input.limits || DEFAULT_LIMITS,
    stickyWindowMs: input.stickyWindowMs ?? DEFAULT_STICKY_WINDOW_MS,
    challengerMargin: input.challengerMargin ?? DEFAULT_CHALLENGER_MARGIN,
  });

  if (!ranking.primary && input.showJudgmentWhenBlocked !== false) {
    const prompt = createJudgmentPromptWidget(
      "No hay una señal suficientemente conectada y confiable para ocupar la tarjeta principal.",
      pendingDependencies.filter((item) => item.status === "PENDING"),
    );
    widgets.push(prompt);
    ranking = rankProductiveSmartWidgets({
      widgets,
      now,
      timeZone,
      previousSelection: null,
      limits: input.limits || DEFAULT_LIMITS,
    });
  }

  const stackState = ranking.primary
    ? (ranking.visible.some((widget) => widget.state === SMART_WIDGET_STATES.PARTIAL || widget.state === SMART_WIDGET_STATES.STALE)
      ? SMART_WIDGET_STATES.PARTIAL
      : SMART_WIDGET_STATES.READY)
    : SMART_WIDGET_STATES.EMPTY;

  const stack = createProductiveSmartWidgetStack({
    stackStatus: stackState,
    advisorId: session.advisorId,
    generatedAt: now,
    primary: ranking.primary,
    supporting: ranking.supporting,
    visible: ranking.visible,
    inventory: widgets,
    pendingDependencies,
    selectionTrace: [
      { reason: ranking.selectionReason, context: ranking.context },
      ...ranking.ranked,
    ],
    limits: input.limits || DEFAULT_LIMITS,
  });

  if (JSON.stringify(input) !== before) throw new Error("Productive Smart Widget orchestrator mutated input");
  return stack;
}

export const PRODUCTIVE_SMART_WIDGET_RANKING_POLICY = Object.freeze({
  hardPriorityScores: HARD_PRIORITY_SCORES,
  defaultLimits: DEFAULT_LIMITS,
  stickyWindowMs: DEFAULT_STICKY_WINDOW_MS,
  challengerMargin: DEFAULT_CHALLENGER_MARGIN,
  rules: [
    "Confirmed overdue policy outranks informational metrics.",
    "Payment confirmation required outranks activity and goal context.",
    "Confirmed income-at-risk evidence outranks informational metrics.",
    "Unknown is never normalized to zero.",
    "Only one primary and at most two supporting widgets are visible.",
    "The previous primary remains sticky unless a hard priority preempts it or a challenger clears the margin.",
  ],
});

export {
  shouldActivateProductiveIncomeSource,
};
