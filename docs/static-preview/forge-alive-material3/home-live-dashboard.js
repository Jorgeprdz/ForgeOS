const CONTRACT_ID = "FORGE_HOME_LIVE_DASHBOARD_V1";
const TIME_ZONE = "America/Mexico_City";
const HOME_SELECTOR = "[data-forge-home-module]";
const ROOT_STATE = Symbol.for("forge.home.live-dashboard.v1");
const STAGE_ORDER = Object.freeze({
  decision: 20,
  proposal: 30,
  appointment_scheduled: 40,
  contacted: 50,
  referred_new: 60,
});

let productiveOpportunityFactoryPromise = null;

function validDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function zonedHour(value, timeZone = TIME_ZONE) {
  const date = validDate(value) || new Date();
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).find((item) => item.type === "hour");
  return Number(part?.value || 0);
}

export function greetingFor(value, timeZone = TIME_ZONE) {
  const hour = zonedHour(value, timeZone);
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function firstNameFor(user) {
  const metadata = user?.user_metadata || {};
  const candidate = metadata.given_name
    || metadata.full_name
    || metadata.name
    || user?.email?.split("@")[0]
    || "Usuario";
  const cleaned = String(candidate).trim().replace(/[._-]+/g, " ");
  return cleaned.split(/\s+/).filter(Boolean)[0] || "Usuario";
}

function avatarUrlFor(user) {
  const metadata = user?.user_metadata || {};
  return typeof metadata.avatar_url === "string" && metadata.avatar_url
    ? metadata.avatar_url
    : typeof metadata.picture === "string"
      ? metadata.picture
      : "";
}

function initialsFor(user) {
  const metadata = user?.user_metadata || {};
  const raw = metadata.full_name || metadata.name || user?.email || "Usuario";
  const parts = String(raw).trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function timestamp(value) {
  const date = validDate(value);
  return date ? date.getTime() : null;
}

function dayDistance(target, now) {
  return Math.ceil((target - now) / 86_400_000);
}

function opportunityReason(card, nowMs) {
  const dueAt = timestamp(card?.nextCommitment?.dueAt);
  if (dueAt !== null) {
    const days = dayDistance(dueAt, nowMs);
    if (dueAt < nowMs) {
      return Object.freeze({
        rank: 0,
        label: "Seguimiento vencido",
        badge: `${Math.max(1, Math.abs(days))} d vencido`,
      });
    }
    if (days <= 0) return Object.freeze({ rank: 8, label: "Compromiso para hoy", badge: "Hoy" });
    if (days <= 3) return Object.freeze({ rank: 12 + days, label: "Compromiso próximo", badge: `En ${days} d` });
  }

  const stage = card?.status || "referred_new";
  const stageLabels = Object.freeze({
    decision: "Decisión pendiente",
    proposal: "Propuesta en seguimiento",
    appointment_scheduled: "Cita agendada",
    contacted: "Conversación abierta",
    referred_new: "Nuevo prospecto",
  });
  return Object.freeze({
    rank: STAGE_ORDER[stage] ?? 90,
    label: stageLabels[stage] || card?.stageLabel || "Revisión pendiente",
    badge: card?.stageLabel || "Pipeline",
  });
}

export function rankOpportunityCards(cards = [], { now = new Date() } = {}) {
  const nowDate = validDate(now) || new Date();
  const nowMs = nowDate.getTime();
  return cards
    .filter((card) => card?.id && card?.status !== "client")
    .map((card) => {
      const reason = opportunityReason(card, nowMs);
      const activityAt = timestamp(card?.latestActivity?.occurredAt);
      return Object.freeze({ card, reason, activityAt: activityAt ?? 0 });
    })
    .sort((left, right) => (
      left.reason.rank - right.reason.rank
      || left.activityAt - right.activityAt
      || String(left.card.fullName).localeCompare(String(right.card.fullName), "es")
    ))
    .slice(0, 5);
}

function liveClock() {
  const injected = globalThis.__FORGE_HOME_DASHBOARD_CLOCK__;
  return typeof injected === "function" ? validDate(injected()) || new Date() : new Date();
}

async function resolveOpportunityAdapterFactory() {
  const injected = globalThis.__FORGE_HOME_OPPORTUNITY_ADAPTER_FACTORY__;
  if (typeof injected === "function") return injected;

  const authorityUrl = new URL(
    "./pipeline-productive-intelligence-adapter.js?v=home-live-dashboard-002",
    import.meta.url,
  ).href;
  productiveOpportunityFactoryPromise ||= import(/* @vite-ignore */ authorityUrl).then((module) => {
    if (typeof module.createProductiveIntelligenceAdapter !== "function") {
      throw new Error("HOME_PRODUCTIVE_OPPORTUNITY_AUTHORITY_INVALID");
    }
    return module.createProductiveIntelligenceAdapter;
  });
  return productiveOpportunityFactoryPromise;
}

function injectStyles() {
  if (document.querySelector("[data-home-live-dashboard-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("./home-live-dashboard.css?v=home-live-dashboard-002", import.meta.url).href;
  link.dataset.homeLiveDashboardStyles = CONTRACT_ID;
  document.head.append(link);
}

function ensureOpportunitySurface(root) {
  let section = root.querySelector(".opportunities");
  if (!section) {
    section = document.createElement("section");
    section.className = "opportunities organic-card";
    root.append(section);
  }
  section.dataset.homeLiveOpportunities = "true";
  section.setAttribute("aria-labelledby", "opportunities-title");
  section.innerHTML = `
    <div class="section-heading">
      <p class="section-kicker accent" id="opportunities-title">✦ MIS OPORTUNIDADES</p>
      <button type="button" data-home-open-pipeline>Ver Pipeline ›</button>
    </div>
    <div class="opportunity-list" data-home-opportunity-list aria-live="polite"></div>
  `;
  return section;
}

function renderOpportunityState(section, message, state) {
  section.dataset.homeOpportunityState = state;
  const list = section.querySelector("[data-home-opportunity-list]");
  if (!list) return;
  list.replaceChildren();
  const status = document.createElement("div");
  status.className = "home-opportunity-state";
  status.dataset.state = state;
  status.textContent = message;
  list.append(status);
}

function navigateToPipeline(card = null) {
  const url = new URL(globalThis.location.href);
  url.searchParams.set("nav", "pipeline");
  url.searchParams.set("from", "home-opportunities");
  if (card?.id) url.searchParams.set("person", `PROSPECT:${card.id}`);
  else url.searchParams.delete("person");
  globalThis.location.assign(url.href);
}

function renderOpportunities(section, cards) {
  const list = section.querySelector("[data-home-opportunity-list]");
  if (!list) return;
  const rows = rankOpportunityCards(cards, { now: liveClock() });
  list.replaceChildren();
  section.dataset.homeOpportunityState = rows.length ? "READY" : "EMPTY";

  if (!rows.length) {
    renderOpportunityState(section, "No hay prospectos activos que requieran atención ahora.", "EMPTY");
    return;
  }

  for (const { card, reason } of rows) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "opportunity home-live-opportunity";
    button.dataset.prospectId = card.id;

    const avatar = document.createElement("span");
    avatar.className = "avatar home-live-opportunity__avatar";
    avatar.textContent = String(card.fullName || "?").trim()[0]?.toUpperCase() || "?";

    const copy = document.createElement("span");
    copy.className = "opportunity-copy";
    const name = document.createElement("strong");
    name.textContent = card.fullName || "Nombre no disponible";
    const context = document.createElement("small");
    const activity = card.latestActivity?.label || "Sin actividad verificada";
    context.textContent = `${reason.label} · ${activity}`;
    copy.append(name, context);

    const badge = document.createElement("span");
    badge.className = "home-live-opportunity__badge";
    badge.textContent = reason.badge;

    button.append(avatar, copy, badge);
    button.addEventListener("click", () => navigateToPipeline(card));
    list.append(button);
  }
}

async function waitForBootstrap() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (typeof bootstrap?.getSession === "function") return bootstrap;
    await new Promise((resolve) => globalThis.setTimeout(resolve, 50));
  }
  return globalThis.ForgeProductiveProspectBootstrap067G17B || null;
}

function updateProfile(root, user) {
  const profile = root.querySelector(".profile");
  if (!profile) return;
  profile.dataset.forgeAuthAvatar = "true";
  profile.dataset.forgeAuthState = user?.id ? "authenticated" : "anonymous";
  profile.setAttribute("aria-label", user?.id ? `Abrir perfil de ${firstNameFor(user)}` : "Abrir perfil");

  const status = document.createElement("i");
  status.setAttribute("aria-hidden", "true");
  const source = avatarUrlFor(user);
  if (source) {
    const image = document.createElement("img");
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.src = source;
    image.addEventListener("error", () => {
      const initials = document.createElement("span");
      initials.textContent = initialsFor(user);
      profile.replaceChildren(initials, status);
    }, { once: true });
    profile.replaceChildren(image, status);
    return;
  }

  const initials = document.createElement("span");
  initials.textContent = initialsFor(user);
  profile.replaceChildren(initials, status);
}

function updateGreeting(root, user) {
  const name = firstNameFor(user);
  const heading = root.querySelector(".hero h1");
  if (heading) heading.textContent = `${greetingFor(liveClock(), TIME_ZONE)}, ${name}`;
  updateProfile(root, user);
}

function productiveState(root) {
  const productiveRoot = root.querySelector("[data-forge-productive-smart-widget-root]");
  return productiveRoot?.dataset.productiveHomeState
    || productiveRoot?.dataset.smartWidgetStackState
    || null;
}

function syncMiDiaStatus(root, authenticated) {
  const subtitle = root.querySelector(".hero .subtitle");
  if (!subtitle) return;
  if (!authenticated) {
    subtitle.textContent = "Mi día · inicia sesión para conectar tus señales";
    subtitle.dataset.homeMiDiaState = "SESSION_REQUIRED";
    return;
  }

  const state = productiveState(root);
  const labels = Object.freeze({
    ready: "Mi día · actividad, cartera y meta conectadas",
    READY: "Mi día · actividad, cartera y meta conectadas",
    loading: "Mi día · conectando señales reales…",
    LOADING: "Mi día · conectando señales reales…",
    "source-unavailable": "Mi día · algunas fuentes no están disponibles",
    SOURCE_UNAVAILABLE: "Mi día · algunas fuentes no están disponibles",
    PARTIAL: "Mi día · conexión parcial; revisa las fuentes",
    EMPTY: "Mi día · sin prioridades confiables por ahora",
  });
  subtitle.textContent = labels[state] || "Mi día · conectando señales productivas…";
  subtitle.dataset.homeMiDiaState = state || "CONNECTING";
}

function retireStaticMocks(root) {
  root.dataset.homeLiveDashboard = CONTRACT_ID;
  for (const node of root.querySelectorAll(":scope > .plan-card, :scope > .next-card")) {
    node.hidden = true;
    node.dataset.homeStaticMockRetired = "true";
    node.setAttribute("aria-hidden", "true");
  }
  const safePill = root.querySelector(".safe-pill");
  if (safePill) {
    safePill.innerHTML = "<span>Sesión protegida</span><span aria-hidden=\"true\">•</span><span>Datos productivos</span>";
  }
}

function ensureHonestMiDiaFallback(root) {
  globalThis.setTimeout(() => {
    if (root.querySelector("[data-forge-productive-smart-widget-root]")) return;
    const summary = root.querySelector(".summary-section");
    if (!summary) return;
    summary.className = "summary-section productive-home-section";
    summary.dataset.homeMiDiaFallback = "true";
    summary.innerHTML = `
      <article class="productive-smart-widget productive-smart-widget-status" data-widget-state="SOURCE_UNAVAILABLE">
        <p class="productive-smart-widget-eyebrow">MI DÍA</p>
        <h3 class="productive-smart-widget-title">No pudimos conectar las señales productivas</h3>
        <p class="productive-smart-widget-subtitle">Forge no mostrará fechas, métricas ni recomendaciones de ejemplo.</p>
      </article>`;
    syncMiDiaStatus(root, true);
  }, 2200);
}

function install(root) {
  if (!root || root[ROOT_STATE]) return root?.[ROOT_STATE] || null;
  injectStyles();
  retireStaticMocks(root);

  const opportunities = ensureOpportunitySurface(root);
  renderOpportunityState(opportunities, "Leyendo prospectos y Timeline…", "LOADING");
  opportunities.querySelector("[data-home-open-pipeline]")?.addEventListener("click", () => navigateToPipeline());

  let generation = 0;
  let adapter = null;
  let advisorId = null;
  let authenticated = false;
  let currentUser = globalThis.__FORGE_HOME_CURRENT_USER__ || null;

  const observer = new MutationObserver(() => syncMiDiaStatus(root, authenticated));
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-productive-home-state", "data-smart-widget-stack-state"],
  });

  async function refresh(reason = "refresh") {
    const revision = ++generation;
    root.dataset.homeLiveDashboardState = "loading";
    renderOpportunityState(opportunities, "Leyendo prospectos y Timeline…", "LOADING");
    try {
      const bootstrap = await waitForBootstrap();
      const sessionResult = await bootstrap?.getSession?.();
      const session = sessionResult?.data?.session || null;
      const user = session?.user || null;
      if (revision !== generation) return;

      authenticated = Boolean(user?.id);
      currentUser = user;
      globalThis.__FORGE_HOME_CURRENT_USER__ = user;
      updateGreeting(root, user);
      syncMiDiaStatus(root, authenticated);

      if (!authenticated) {
        advisorId = null;
        adapter = null;
        renderOpportunityState(opportunities, "Inicia sesión para ver tus oportunidades reales.", "SESSION_REQUIRED");
        root.dataset.homeLiveDashboardState = "session-required";
        return;
      }

      if (advisorId && advisorId !== user.id) adapter = null;
      advisorId = user.id;
      const factory = await resolveOpportunityAdapterFactory();
      if (revision !== generation || advisorId !== user.id) return;
      adapter ||= await factory();
      const cards = await adapter.reload();
      if (revision !== generation || advisorId !== user.id) return;

      renderOpportunities(opportunities, Array.isArray(cards) ? cards : []);
      root.dataset.homeLiveDashboardState = "ready";
      root.dataset.homeOpportunityAuthority = "PRODUCTIVE_PIPELINE_AND_TIMELINE";
      root.dataset.homeRefreshReason = reason;
    } catch (error) {
      if (revision !== generation) return;
      console.error("Forge Home live dashboard failed", error);
      renderOpportunityState(
        opportunities,
        "Pipeline no disponible. No se mostrarán oportunidades de ejemplo.",
        "SOURCE_UNAVAILABLE",
      );
      root.dataset.homeLiveDashboardState = "source-unavailable";
      syncMiDiaStatus(root, authenticated);
    }
  }

  function handleAuth(event) {
    const detail = event?.detail || {};
    if (detail.status !== "authenticated") {
      generation += 1;
      authenticated = false;
      advisorId = null;
      adapter = null;
      currentUser = null;
      globalThis.__FORGE_HOME_CURRENT_USER__ = null;
      updateGreeting(root, null);
      syncMiDiaStatus(root, false);
      renderOpportunityState(opportunities, "Inicia sesión para ver tus oportunidades reales.", "SESSION_REQUIRED");
      root.dataset.homeLiveDashboardState = "session-required";
      return;
    }
    void refresh(`auth:${detail.event || "authenticated"}`);
  }

  const handleFocus = () => {
    updateGreeting(root, currentUser);
    void refresh("window-focus");
  };

  globalThis.addEventListener("forge:auth-state-changed", handleAuth);
  globalThis.addEventListener("focus", handleFocus);
  const greetingTimer = globalThis.setInterval(() => updateGreeting(root, currentUser), 60_000);
  globalThis.addEventListener("pagehide", () => {
    generation += 1;
    observer.disconnect();
    globalThis.clearInterval(greetingTimer);
    globalThis.removeEventListener("forge:auth-state-changed", handleAuth);
    globalThis.removeEventListener("focus", handleFocus);
  }, { once: true });

  ensureHonestMiDiaFallback(root);
  void refresh("mount");

  const api = Object.freeze({ refresh, contractId: CONTRACT_ID });
  root[ROOT_STATE] = api;
  return api;
}

function boot() {
  const root = document.querySelector(HOME_SELECTOR);
  if (root) install(root);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}

export const HOME_LIVE_DASHBOARD_CONTRACT = CONTRACT_ID;
