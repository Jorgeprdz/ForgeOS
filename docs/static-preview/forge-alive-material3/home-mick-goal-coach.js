import {
  installAdvisorCompensationSupabaseProvider100,
} from "../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js";
import {
  createAdvisorCompensationIncomeWidgetLoader080,
} from "../../advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.js";
import {
  composeMickGoalGapCoach,
  MICK_GOAL_GAP_COACH_BOUNDARIES,
  MICK_GOAL_GAP_COACH_VERSION,
} from "../../advisor-os/forge-alive/forecast/mick-goal-gap-coach.js";

const COACH_STATE = Symbol.for("forge.home.mick-goal-gap-coach.v1");
const GOAL_REASON_PREFIX = "HOME_MONTHLY_GOALS_V2:";
const TIME_ZONE = "America/Mexico_City";

function finite(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function integer(value) {
  const number = finite(value);
  return Number.isInteger(number) ? number : null;
}

function clampGap(target, current) {
  return target === null || current === null ? null : Math.max(0, target - current);
}

function monthKey(value, timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) throw new Error("MICK_GOAL_COACH_MONTH_UNAVAILABLE");
  return `${year}-${month}`;
}

function parseEconomicTarget(reason) {
  if (typeof reason !== "string" || !reason.startsWith(GOAL_REASON_PREFIX)) return null;
  try {
    const payload = JSON.parse(reason.slice(GOAL_REASON_PREFIX.length));
    const target = finite(payload?.targetMonthlyIncomeMxn);
    return target !== null && target > 0 ? target : null;
  } catch {
    return null;
  }
}

function inventoryWidget(stack, family) {
  return Array.isArray(stack?.inventory)
    ? stack.inventory.find((widget) => widget?.widgetFamily === family) || null
    : null;
}

function policyContext(stack, goalRow) {
  const forecast = inventoryWidget(stack, "ADVISOR_FORECAST_WIDGET");
  const goalWidget = inventoryWidget(stack, "MONTHLY_POLICY_GOAL_WIDGET");
  const target = integer(goalWidget?.payload?.target ?? goalRow?.target_policy_count);
  const confirmed = integer(goalWidget?.payload?.sold);
  const confirmedGap = finite(forecast?.payload?.goalGap?.confirmedGap)
    ?? clampGap(target, confirmed);
  const weightedResidual = finite(forecast?.payload?.goalGap?.remainingAfterWeightedPipeline);
  return Object.freeze({
    target,
    confirmed,
    confirmedGap,
    weightedResidual,
    forecastAvailable: Boolean(forecast),
    evidenceRefs: Array.isArray(forecast?.evidence) ? forecast.evidence : [],
  });
}

function ensureStyles() {
  if (document.querySelector("[data-mick-goal-coach-styles]")) return;
  const style = document.createElement("style");
  style.dataset.mickGoalCoachStyles = "true";
  style.textContent = `
    .mick-goal-coach-card { margin: 0 0 14px; border-style: solid; }
    .mick-goal-coach-card .mick-goal-coach-detail { margin: 10px 0 0; opacity: .78; line-height: 1.45; }
    .mick-goal-coach-card .productive-smart-widget-footer { margin-top: 16px; }
  `;
  document.head.appendChild(style);
}

function renderCoach(root, coach, onNavigate) {
  const signature = JSON.stringify([
    coach.status,
    coach.priority,
    coach.message,
    coach.detail,
    coach.actionLabel,
    coach.actionRoute,
  ]);
  let card = root.querySelector("[data-mick-goal-gap-coach]");
  if (!card) {
    card = document.createElement("article");
    card.className = "productive-smart-widget is-primary mick-goal-coach-card";
    card.dataset.mickGoalGapCoach = MICK_GOAL_GAP_COACH_VERSION;
    card.dataset.widgetFamily = "MICK_GOAL_GAP_COACH";
    const cards = root.querySelector(".productive-smart-widget-cards");
    if (cards) cards.before(card);
    else root.appendChild(card);
  }
  if (card.dataset.mickGoalCoachSignature === signature) return;
  card.dataset.mickGoalCoachSignature = signature;
  card.dataset.widgetState = coach.status;
  card.innerHTML = `
    <p class="productive-smart-widget-eyebrow">MICK · FORECAST</p>
    <h3 class="productive-smart-widget-title">${coach.message}</h3>
    <p class="mick-goal-coach-detail">${coach.detail}</p>
    <div class="productive-smart-widget-footer">
      <span class="productive-smart-widget-confidence">Lectura basada en evidencia</span>
      <button type="button" class="productive-smart-widget-action" data-mick-goal-coach-action>${coach.actionLabel}</button>
    </div>
  `;
  card.querySelector("[data-mick-goal-coach-action]")?.addEventListener("click", () => {
    onNavigate?.(coach.actionRoute);
  }, { once: true });
}

export function createHomeMickGoalGapCoach({
  root,
  productiveHome,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  clock = () => new Date(),
  timeZone = TIME_ZONE,
  onNavigate = null,
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("Mick goal coach root is required");
  if (root[COACH_STATE]) return root[COACH_STATE];

  let mounted = false;
  let observer = null;
  let scheduled = null;
  let generation = 0;
  let current = null;
  let paused = false;

  function selectedBootstrap() {
    const selected = globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap;
    if (typeof selected?.getClient !== "function" || typeof selected?.getSession !== "function") {
      throw new Error("MICK_GOAL_COACH_BOOTSTRAP_UNAVAILABLE");
    }
    return selected;
  }

  async function readGoal(client, advisorId, month) {
    const { data, error } = await client
      .from("advisor_monthly_policy_goals")
      .select("target_policy_count,reason,revision")
      .eq("advisor_id", advisorId)
      .eq("year_month", `${month}-01`)
      .order("revision", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function loadIncome(advisorId, now, signal) {
    const installation = await installAdvisorCompensationSupabaseProvider100({
      bootstrap: selectedBootstrap(),
      signal,
    });
    if (!installation.installed || !installation.provider) {
      return Object.freeze({
        sourceConnected: false,
        sourceComplete: false,
        compensationSnapshot: null,
        blockedReason: installation.probe?.reason || "COMPENSATION_PROVIDER_UNAVAILABLE",
      });
    }
    const loader = createAdvisorCompensationIncomeWidgetLoader080({ provider: installation.provider });
    return loader.load({ advisorId, now, timeZone, signal });
  }

  async function reconcile(reason = "mick-goal-coach") {
    if (!mounted) return null;
    const run = ++generation;
    const controller = new AbortController();
    try {
      const selected = selectedBootstrap();
      const [client, sessionResult] = await Promise.all([
        selected.getClient(),
        selected.getSession(),
      ]);
      const advisorId = sessionResult?.data?.session?.user?.id || null;
      if (!advisorId) throw new Error("SESSION_REQUIRED");
      const now = clock();
      const month = monthKey(now, timeZone);
      const [goalRow, incomeSource] = await Promise.all([
        readGoal(client, advisorId, month),
        loadIncome(advisorId, now.toISOString(), controller.signal),
      ]);
      if (run !== generation || !mounted) return null;
      const stack = productiveHome?.diagnostics?.().stack || null;
      const policy = policyContext(stack, goalRow);
      const coach = composeMickGoalGapCoach({
        policy,
        economicTarget: parseEconomicTarget(goalRow?.reason),
        incomeSource,
      });
      current = Object.freeze({
        ...coach,
        reason,
        advisorId,
        periodKey: month,
        sourceContracts: Object.freeze({
          forecast: policy.forecastAvailable ? "ADVISOR_FORECAST_WIDGET" : null,
          compensation: incomeSource?.compensationSnapshot?.contractVersion || null,
          monthlyGoal: goalRow ? "ADVISOR_MONTHLY_POLICY_GOALS_APPEND_ONLY" : null,
        }),
      });
      renderCoach(root, current, onNavigate);
      root.dataset.mickGoalCoachState = current.status;
      return current;
    } catch (error) {
      if (run !== generation || !mounted || error?.name === "AbortError") return null;
      current = Object.freeze({
        status: "SOURCE_UNAVAILABLE",
        priority: "SOURCE_REVIEW",
        message: "Mick no pudo actualizar la lectura de tus metas.",
        detail: "Las metas anteriores no se convierten en cero y no se reutilizan como si fueran actuales.",
        actionLabel: "Revisar fuentes",
        actionRoute: "actividad",
        errorCode: error?.code || error?.message || "MICK_GOAL_COACH_FAILED",
      });
      renderCoach(root, current, onNavigate);
      root.dataset.mickGoalCoachState = "SOURCE_UNAVAILABLE";
      return current;
    }
  }

  function schedule(reason = "dom-update") {
    if (!mounted || paused) return;
    if (scheduled !== null) window.clearTimeout(scheduled);
    scheduled = window.setTimeout(() => {
      scheduled = null;
      void reconcile(reason);
    }, 180);
  }

  function handleAuth(event) {
    const detail = event?.detail || {};
    if (detail.status !== "authenticated") {
      scrub(`auth:${detail.status || detail.event || "unknown"}`);
      return;
    }
    resume(`auth:${detail.event || "authenticated"}`);
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    paused = false;
    ensureStyles();
    observer = new MutationObserver(() => schedule("home-stack-updated"));
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener("forge:auth-state-changed", handleAuth);
    schedule("mount");
  }

  function scrub(reason = "session-scrub") {
    paused = true;
    generation += 1;
    current = null;
    root.querySelector("[data-mick-goal-gap-coach]")?.remove();
    root.dataset.mickGoalCoachState = "SCRUBBED";
    root.dataset.mickGoalCoachScrub = reason;
  }

  function resume(reason = "resume") {
    paused = false;
    schedule(reason);
  }

  function unmount() {
    if (!mounted) return;
    mounted = false;
    if (scheduled !== null) window.clearTimeout(scheduled);
    scheduled = null;
    observer?.disconnect();
    observer = null;
    window.removeEventListener("forge:auth-state-changed", handleAuth);
    scrub("home-unmount");
  }

  const api = Object.freeze({
    mount,
    unmount,
    scrub,
    resume,
    reconcile,
    schedule,
    diagnostics: () => current,
  });
  root[COACH_STATE] = api;
  return api;
}

export {
  MICK_GOAL_GAP_COACH_VERSION,
  MICK_GOAL_GAP_COACH_BOUNDARIES,
};
