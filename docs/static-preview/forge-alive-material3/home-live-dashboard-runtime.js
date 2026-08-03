const CONTRACT_ID = "FORGE_HOME_LIVE_DASHBOARD_V2";
const TIME_ZONE = "America/Mexico_City";
const ROOT_SELECTOR = "[data-forge-home-module]";
const STATE = Symbol.for("forge.home.live-dashboard.v2");
const AUTHORITY_EVENT = "forge:home-opportunity-authority-ready";
const PRODUCTIVE_FACTORY_KEY = "__FORGE_HOME_PRODUCTIVE_OPPORTUNITY_ADAPTER_FACTORY__";
const STAGE_RANK = Object.freeze({
  decision: 20,
  proposal: 30,
  appointment_scheduled: 40,
  contacted: 50,
  referred_new: 60,
});

const validDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const now = () => {
  const clock = globalThis.__FORGE_HOME_DASHBOARD_CLOCK__;
  return typeof clock === "function" ? validDate(clock()) || new Date() : new Date();
};

function greeting(value = now()) {
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value).find((part) => part.type === "hour")?.value || 0);
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function firstName(user) {
  const metadata = user?.user_metadata || {};
  const source = metadata.given_name
    || metadata.full_name
    || metadata.name
    || user?.email?.split("@")[0]
    || "Usuario";
  return String(source).trim().replace(/[._-]+/g, " ").split(/\s+/).filter(Boolean)[0] || "Usuario";
}

function initials(user) {
  const metadata = user?.user_metadata || {};
  const source = metadata.full_name || metadata.name || user?.email || "Usuario";
  return String(source).trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function avatarUrl(user) {
  const metadata = user?.user_metadata || {};
  return metadata.avatar_url || metadata.picture || "";
}

function updateIdentity(root, user) {
  const heading = root.querySelector(".hero h1");
  if (heading) heading.textContent = `${greeting()}, ${firstName(user)}`;

  const profile = root.querySelector(".profile");
  if (!profile) return;
  profile.dataset.forgeAuthState = user?.id ? "authenticated" : "anonymous";
  profile.setAttribute("aria-label", user?.id ? `Abrir perfil de ${firstName(user)}` : "Abrir perfil");
  const status = document.createElement("i");
  status.setAttribute("aria-hidden", "true");
  const url = avatarUrl(user);
  if (!url) {
    const fallback = document.createElement("span");
    fallback.textContent = initials(user);
    profile.replaceChildren(fallback, status);
    return;
  }
  const image = document.createElement("img");
  image.alt = "";
  image.referrerPolicy = "no-referrer";
  image.src = url;
  image.addEventListener("error", () => {
    const fallback = document.createElement("span");
    fallback.textContent = initials(user);
    profile.replaceChildren(fallback, status);
  }, { once: true });
  profile.replaceChildren(image, status);
}

function productiveState(root) {
  const node = root.querySelector("[data-forge-productive-smart-widget-root]");
  return node?.dataset.productiveHomeState || node?.dataset.smartWidgetStackState || "CONNECTING";
}

function syncMiDia(root, authenticated) {
  const subtitle = root.querySelector(".hero .subtitle");
  if (!subtitle) return;
  if (!authenticated) {
    subtitle.textContent = "Mi día · inicia sesión para conectar tus señales";
    subtitle.dataset.homeMiDiaState = "SESSION_REQUIRED";
    return;
  }
  const state = productiveState(root);
  const copy = {
    ready: "Mi día · actividad, cartera y meta conectadas",
    READY: "Mi día · actividad, cartera y meta conectadas",
    loading: "Mi día · conectando señales reales…",
    LOADING: "Mi día · conectando señales reales…",
    PARTIAL: "Mi día · conexión parcial; revisa las fuentes",
    EMPTY: "Mi día · sin prioridades confiables por ahora",
    SOURCE_UNAVAILABLE: "Mi día · algunas fuentes no están disponibles",
    "source-unavailable": "Mi día · algunas fuentes no están disponibles",
  };
  subtitle.textContent = copy[state] || "Mi día · conectando señales productivas…";
  subtitle.dataset.homeMiDiaState = state;
}

function prepareRoot(root) {
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
  if (!document.querySelector("[data-home-live-dashboard-styles]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("./home-live-dashboard.css?v=home-live-dashboard-003", import.meta.url).href;
    link.dataset.homeLiveDashboardStyles = CONTRACT_ID;
    document.head.append(link);
  }
}

function opportunitiesSurface(root) {
  let section = root.querySelector(".opportunities");
  if (!section) {
    section = document.createElement("section");
    section.className = "opportunities organic-card";
    root.append(section);
  }
  section.dataset.homeLiveOpportunities = "true";
  section.innerHTML = `
    <div class="section-heading">
      <p class="section-kicker accent" id="opportunities-title">✦ MIS OPORTUNIDADES</p>
      <button type="button" data-home-open-pipeline>Ver Pipeline ›</button>
    </div>
    <div class="opportunity-list" data-home-opportunity-list aria-live="polite"></div>`;
  section.querySelector("[data-home-open-pipeline]")?.addEventListener("click", () => navigate());
  return section;
}

function showState(section, message, state) {
  section.dataset.homeOpportunityState = state;
  const list = section.querySelector("[data-home-opportunity-list]");
  list?.replaceChildren();
  if (!list) return;
  const node = document.createElement("div");
  node.className = "home-opportunity-state";
  node.dataset.state = state;
  node.textContent = message;
  list.append(node);
}

function timestamp(value) {
  const date = validDate(value);
  return date ? date.getTime() : null;
}

function reasonFor(card, current) {
  const due = timestamp(card?.nextCommitment?.dueAt);
  if (due !== null) {
    const days = Math.ceil((due - current) / 86_400_000);
    if (due < current) return { rank: 0, label: "Seguimiento vencido", badge: `${Math.max(1, Math.abs(days))} d vencido` };
    if (days <= 0) return { rank: 8, label: "Compromiso para hoy", badge: "Hoy" };
    if (days <= 3) return { rank: 12 + days, label: "Compromiso próximo", badge: `En ${days} d` };
  }
  const labels = {
    decision: "Decisión pendiente",
    proposal: "Propuesta en seguimiento",
    appointment_scheduled: "Cita agendada",
    contacted: "Conversación abierta",
    referred_new: "Nuevo prospecto",
  };
  return {
    rank: STAGE_RANK[card?.status] ?? 90,
    label: labels[card?.status] || card?.stageLabel || "Revisión pendiente",
    badge: card?.stageLabel || "Pipeline",
  };
}

function rank(cards) {
  const current = now().getTime();
  return (Array.isArray(cards) ? cards : [])
    .filter((card) => card?.id && card.status !== "client")
    .map((card) => ({ card, reason: reasonFor(card, current), activity: timestamp(card.latestActivity?.occurredAt) ?? 0 }))
    .sort((a, b) => a.reason.rank - b.reason.rank || a.activity - b.activity || String(a.card.fullName).localeCompare(String(b.card.fullName), "es"))
    .slice(0, 5);
}

function navigate(card = null) {
  const url = new URL(globalThis.location.href);
  url.searchParams.set("nav", "pipeline");
  url.searchParams.set("from", "home-opportunities");
  if (card?.id) url.searchParams.set("person", `PROSPECT:${card.id}`);
  globalThis.location.assign(url.href);
}

function render(section, cards) {
  const rows = rank(cards);
  if (!rows.length) {
    showState(section, "No hay prospectos activos que requieran atención ahora.", "EMPTY");
    return;
  }
  const list = section.querySelector("[data-home-opportunity-list]");
  list.replaceChildren();
  section.dataset.homeOpportunityState = "READY";
  for (const { card, reason } of rows) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "opportunity home-live-opportunity";
    button.dataset.prospectId = card.id;
    const letter = String(card.fullName || "?").trim()[0]?.toUpperCase() || "?";
    const activity = card.latestActivity?.label || "Sin actividad verificada";
    button.innerHTML = `
      <span class="avatar home-live-opportunity__avatar">${letter}</span>
      <span class="opportunity-copy"><strong></strong><small></small></span>
      <span class="home-live-opportunity__badge"></span>`;
    button.querySelector("strong").textContent = card.fullName || "Nombre no disponible";
    button.querySelector("small").textContent = `${reason.label} · ${activity}`;
    button.querySelector(".home-live-opportunity__badge").textContent = reason.badge;
    button.addEventListener("click", () => navigate(card));
    list.append(button);
  }
}

async function bootstrap() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidate = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (typeof candidate?.getSession === "function") return candidate;
    await new Promise((resolve) => globalThis.setTimeout(resolve, 50));
  }
  return null;
}

function authorityFactory() {
  const injected = globalThis.__FORGE_HOME_OPPORTUNITY_ADAPTER_FACTORY__;
  if (typeof injected === "function") return Promise.resolve(injected);
  const ready = globalThis[PRODUCTIVE_FACTORY_KEY];
  if (typeof ready === "function") return Promise.resolve(ready);

  return new Promise((resolve, reject) => {
    let script = document.querySelector("[data-home-opportunity-authority-entry]");
    const timeout = globalThis.setTimeout(() => finish(new Error("HOME_OPPORTUNITY_AUTHORITY_TIMEOUT")), 20_000);
    const onReady = () => finish();
    const onError = () => finish(new Error("HOME_OPPORTUNITY_AUTHORITY_LOAD_FAILED"));
    const finish = (error = null) => {
      globalThis.clearTimeout(timeout);
      globalThis.removeEventListener(AUTHORITY_EVENT, onReady);
      script?.removeEventListener("error", onError);
      const factory = globalThis[PRODUCTIVE_FACTORY_KEY];
      if (error) reject(error);
      else if (typeof factory === "function") resolve(factory);
      else reject(new Error("HOME_OPPORTUNITY_AUTHORITY_INVALID"));
    };
    globalThis.addEventListener(AUTHORITY_EVENT, onReady, { once: true });
    if (!script) {
      script = document.createElement("script");
      script.type = "module";
      script.src = new URL("./home-opportunity-authority-entry.js?v=home-live-dashboard-003", import.meta.url).href;
      script.dataset.homeOpportunityAuthorityEntry = "true";
      script.addEventListener("error", onError, { once: true });
      document.head.append(script);
    }
  });
}

function install(root) {
  if (root[STATE]) return root[STATE];
  prepareRoot(root);
  const section = opportunitiesSurface(root);
  let generation = 0;
  let currentUser = null;
  let advisorId = null;
  let adapter = null;
  let authenticated = false;

  const observer = new MutationObserver(() => syncMiDia(root, authenticated));
  observer.observe(root, { subtree: true, childList: true, attributes: true });

  async function refresh(reason = "refresh") {
    const revision = ++generation;
    root.dataset.homeLiveDashboardState = "loading";
    showState(section, "Leyendo prospectos y Timeline…", "LOADING");
    try {
      const auth = await bootstrap();
      const result = await auth?.getSession?.();
      const user = result?.data?.session?.user || null;
      if (revision !== generation) return;
      authenticated = Boolean(user?.id);
      currentUser = user;
      updateIdentity(root, user);
      syncMiDia(root, authenticated);
      if (!authenticated) {
        advisorId = null;
        adapter = null;
        root.dataset.homeLiveDashboardState = "session-required";
        showState(section, "Inicia sesión para ver tus oportunidades reales.", "SESSION_REQUIRED");
        return;
      }
      if (advisorId && advisorId !== user.id) adapter = null;
      advisorId = user.id;
      const factory = await authorityFactory();
      if (revision !== generation || advisorId !== user.id) return;
      adapter ||= await factory();
      const cards = await adapter.reload();
      if (revision !== generation || advisorId !== user.id) return;
      render(section, cards);
      root.dataset.homeLiveDashboardState = "ready";
      root.dataset.homeOpportunityAuthority = "PRODUCTIVE_PIPELINE_AND_TIMELINE";
      root.dataset.homeRefreshReason = reason;
    } catch (error) {
      if (revision !== generation) return;
      console.error("Forge Home live dashboard failed", error);
      root.dataset.homeLiveDashboardState = "source-unavailable";
      showState(section, "Pipeline no disponible. No se mostrarán oportunidades de ejemplo.", "SOURCE_UNAVAILABLE");
    }
  }

  const onFocus = () => {
    updateIdentity(root, currentUser);
    void refresh("window-focus");
  };
  const onAuth = (event) => {
    if (event?.detail?.status === "authenticated") void refresh(`auth:${event.detail.event || "authenticated"}`);
    else {
      generation += 1;
      authenticated = false;
      currentUser = null;
      advisorId = null;
      adapter = null;
      updateIdentity(root, null);
      syncMiDia(root, false);
      root.dataset.homeLiveDashboardState = "session-required";
      showState(section, "Inicia sesión para ver tus oportunidades reales.", "SESSION_REQUIRED");
    }
  };

  globalThis.addEventListener("focus", onFocus);
  globalThis.addEventListener("forge:auth-state-changed", onAuth);
  const timer = globalThis.setInterval(() => updateIdentity(root, currentUser), 60_000);
  globalThis.addEventListener("pagehide", () => {
    generation += 1;
    observer.disconnect();
    globalThis.clearInterval(timer);
    globalThis.removeEventListener("focus", onFocus);
    globalThis.removeEventListener("forge:auth-state-changed", onAuth);
  }, { once: true });

  const api = Object.freeze({ refresh, contractId: CONTRACT_ID });
  root[STATE] = api;
  void refresh("mount");
  return api;
}

function boot() {
  const root = document.querySelector(ROOT_SELECTOR);
  if (root) install(root);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
