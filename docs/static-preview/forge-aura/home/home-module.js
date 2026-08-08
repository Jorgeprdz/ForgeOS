import {
  briefingFromStack,
  firstNameFor,
  formatLocalDay,
  formatLocalTime,
  greetingFor,
  homeAttentionCount,
  mickHonestState,
  resolveBrowserTimeZone,
  rhythmFromStack,
  sectionOf,
  selectCarteraAttention,
} from "./home-core.js";
import { createHomePagesAdapter } from "./home-adapter-pages-v1.js";

const STATE = Symbol.for("forge.aura.home.module.001");
const ALLOWED_ROUTES = new Set(["inicio", "pipeline", "actividad", "cartera", "comisiones"]);

const esc = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function injectStyles() {
  const href = new URL("./home.css?v=aura-home-command-center-001", import.meta.url).href;
  if (document.querySelector(`link[data-aura-home-style="${CSS.escape(href)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.auraHomeStyle = href;
  document.head.append(link);
}

function routeForWidget(widget) {
  const family = widget?.widgetFamily || "";
  if (family.includes("POLICY")) return "cartera";
  if (family.includes("ACTIVITY") || family.includes("MONTHLY_POLICY_GOAL")) return "actividad";
  if (family.includes("INCOME")) return "comisiones";
  if (family.includes("OPPORTUNITY")) return "pipeline";
  return "inicio";
}

function stateBlock(title, detail, state = "SOURCE_UNAVAILABLE") {
  return `<div class="home-state" data-state="${esc(state)}"><strong>${esc(title)}</strong><span>${esc(detail)}</span></div>`;
}

function agendaRow(item, timeZone, overdue = false) {
  const name = item.personDisplayName || "Persona por identificar";
  const action = item.nextActionType || "Seguimiento";
  const when = item.nextActionAt ? formatLocalTime(item.nextActionAt, timeZone) : "Sin hora confirmada";
  return `<article class="home-agenda-row" data-agenda-authority="AGENDA_READ_MODEL">
    <span class="home-signal-dot" data-tone="${overdue ? "risk" : "attention"}" aria-hidden="true"></span>
    <div><strong>${esc(action)} · ${esc(name)}</strong><span>${overdue ? "Vencido" : "Hoy"} · ${esc(when)}</span></div>
    <button type="button" class="home-link-button" data-home-route="pipeline">Abrir</button>
  </article>`;
}

function renderAgenda(snapshot, timeZone) {
  if (snapshot.agenda.state !== "READY" || !snapshot.agenda.value) {
    return stateBlock("No pudimos consultar tu agenda", "Forge no mostrará cero pendientes mientras la proyección canónica no responda.", snapshot.agenda.state);
  }
  const overdue = sectionOf(snapshot.agenda.value, "OVERDUE");
  const today = sectionOf(snapshot.agenda.value, "TODAY");
  if (!overdue.count && !today.count) {
    return stateBlock("No hay acciones vencidas ni para hoy", "La Agenda canónica confirmó ausencia de compromisos en estas dos categorías.", "EMPTY");
  }
  return `<div class="home-agenda-groups">
    ${overdue.count ? `<div class="home-agenda-group"><p class="home-mini-label">AHORA</p>${overdue.items.slice(0, 3).map(item => agendaRow(item, timeZone, true)).join("")}</div>` : ""}
    ${today.count ? `<div class="home-agenda-group"><p class="home-mini-label">HOY</p>${today.items.slice(0, 4).map(item => agendaRow(item, timeZone, false)).join("")}</div>` : ""}
  </div>`;
}

function radarTone(item) {
  if (item.horizon === "OVERDUE" || item.truthClass === "CONFIRMED_FACT") return "risk";
  if (item.horizon === "CONFIRMATION_REQUIRED" || item.horizon === "TODAY") return "attention";
  return "info";
}

function renderCartera(snapshot) {
  if (snapshot.radar.state !== "READY" || !snapshot.radar.value) {
    return stateBlock("No pudimos consultar Cartera", "La fuente no respondió; no inferiremos pagos, renovaciones ni riesgos.", snapshot.radar.state);
  }
  const items = selectCarteraAttention(snapshot.radar.value, 3);
  if (!items.length) {
    return stateBlock("Sin señales de Cartera en el horizonte", "Future Radar confirmó que no hay elementos de atención en la respuesta actual.", "EMPTY");
  }
  return `<div class="home-cartera-list">${items.map(item => `<article class="home-cartera-row">
    <span class="home-signal-dot" data-tone="${radarTone(item)}" aria-hidden="true"></span>
    <div class="home-cartera-copy">
      <strong>${esc(item.personDisplayName)}</strong>
      <span>${esc(item.smallestUsefulAction)}</span>
      <details><summary>Ver por qué</summary><p>${esc(item.whyNow)}</p><p><b>Verdad:</b> ${esc(item.truthClass || "No informada")} · <b>Fuente:</b> ${esc(item.sourceAuthority || "No informada")}</p><p><b>Incertidumbre:</b> ${esc(item.uncertainty)}</p></details>
    </div>
    <button type="button" class="home-link-button" data-home-route="cartera">Revisar</button>
  </article>`).join("")}</div>`;
}

function metricCopy(widget) {
  const primary = widget?.primaryMetric?.display;
  if (primary) return primary;
  const payload = widget?.payload || {};
  if (Number.isFinite(payload.pointsEarned) && Number.isFinite(payload.dailyTarget)) return `${payload.pointsEarned} / ${payload.dailyTarget}`;
  if (Number.isFinite(payload.sold) && Number.isFinite(payload.target)) return `${payload.sold} / ${payload.target}`;
  return widget?.title || "Señal disponible";
}

function renderRhythm(snapshot) {
  if (!snapshot.priority.value) {
    return stateBlock("Tu ritmo no está disponible", "Inicio no recalculará puntos, metas ni ingresos fuera de sus owners productivos.", snapshot.priority.state);
  }
  const rhythm = rhythmFromStack(snapshot.priority.value);
  if (!rhythm.primary) {
    return stateBlock("Tu ritmo todavía no tiene una métrica verificable", "Forge conserva lo desconocido como desconocido; abre Actividad para revisar sus fuentes.", rhythm.state);
  }
  const primary = rhythm.primary;
  const route = routeForWidget(primary);
  return `<div class="home-rhythm">
    <button type="button" class="home-rhythm-primary" data-home-route="${esc(route)}">
      <span>${esc(primary.title || "Tu ritmo")}</span>
      <strong>${esc(metricCopy(primary))}</strong>
      <small>${esc(primary.subtitle || primary.whyNow || "Lectura productiva")}</small>
    </button>
    ${rhythm.supporting.length ? `<div class="home-rhythm-supporting">${rhythm.supporting.map(widget => `<button type="button" data-home-route="${esc(routeForWidget(widget))}"><span>${esc(widget.title)}</span><strong>${esc(metricCopy(widget))}</strong></button>`).join("")}</div>` : ""}
  </div>`;
}

function renderMick(snapshot) {
  const observation = mickHonestState(snapshot.mick.value);
  return `<div class="home-mick" data-mick-state="${esc(observation.state)}">
    <div><strong>${esc(observation.message)}</strong><p>${esc(observation.detail)}</p></div>
    <button type="button" class="home-link-button" data-home-route="${esc(observation.actionRoute)}">${esc(observation.actionLabel)}</button>
  </div>`;
}

function renderBriefing(snapshot) {
  const briefing = briefingFromStack(snapshot.priority.value, snapshot.agenda.value);
  const widget = snapshot.priority.value?.primary || null;
  const route = widget ? routeForWidget(widget) : "pipeline";
  return `<article class="home-alfred-card" data-home-briefing-source="${esc(briefing.source)}" data-state="${esc(briefing.state)}">
    <div class="home-alfred-mark" aria-hidden="true">✦</div>
    <div class="home-alfred-copy">
      <p class="home-mini-label">ALFRED</p>
      <h2>${esc(briefing.title)}</h2>
      <p>${esc(briefing.detail)}</p>
      <div class="home-alfred-actions">
        <button type="button" class="aura-primary" data-home-route="${esc(route)}">${esc(briefing.actionLabel)}</button>
        <details><summary>Ver por qué</summary><p>Fuente de prioridad: ${esc(briefing.source)}.</p>${briefing.sourceAuthorities.length ? `<p>Authorities: ${esc(briefing.sourceAuthorities.join(" · "))}</p>` : ""}${briefing.uncertainty.length ? `<p>Incertidumbre: ${esc(briefing.uncertainty.join(" · "))}</p>` : ""}</details>
      </div>
    </div>
  </article>`;
}

function renderReady(root, snapshot, user, timeZone, now) {
  const count = homeAttentionCount({ agenda: snapshot.agenda.value, radar: snapshot.radar.value });
  root.innerHTML = `<section class="home-aura" data-home-state="READY" data-home-timezone="${esc(timeZone)}">
    <header class="home-header">
      <div>
        <p class="home-context-line">${esc(greetingFor(now, timeZone))}, ${esc(firstNameFor(user))}</p>
        <h1>Mi día</h1>
        <p class="home-date">${esc(formatLocalDay(now, timeZone))}</p>
        <p class="home-attention-summary">${count === null ? "Conectando señales para saber qué requiere atención." : count === 0 ? "No hay señales urgentes confirmadas en las fuentes conectadas." : `${esc(count)} ${count === 1 ? "cosa requiere" : "cosas requieren"} atención en las fuentes conectadas.`}</p>
      </div>
      <button type="button" class="home-refresh" data-home-refresh aria-label="Actualizar Mi Día">Actualizar</button>
    </header>

    ${renderBriefing(snapshot)}

    <section class="home-section" aria-labelledby="home-agenda-title">
      <div class="home-section-heading"><div><p class="home-mini-label">OPERACIÓN</p><h2 id="home-agenda-title">Ahora / Hoy</h2></div><button type="button" class="home-link-button" data-home-route="pipeline">Ver Pipeline</button></div>
      ${renderAgenda(snapshot, timeZone)}
    </section>

    <section class="home-section" aria-labelledby="home-cartera-title">
      <div class="home-section-heading"><div><p class="home-mini-label">CARTERA</p><h2 id="home-cartera-title">Requiere atención</h2></div><button type="button" class="home-link-button" data-home-route="cartera">Abrir Cartera</button></div>
      ${renderCartera(snapshot)}
    </section>

    <section class="home-section home-section--compact" aria-labelledby="home-rhythm-title">
      <div class="home-section-heading"><div><p class="home-mini-label">TU RITMO</p><h2 id="home-rhythm-title">Cómo vas hoy</h2></div></div>
      ${renderRhythm(snapshot)}
    </section>

    <section class="home-section home-section--compact" aria-labelledby="home-mick-title">
      <div class="home-section-heading"><div><p class="home-mini-label">MICK OBSERVÓ</p><h2 id="home-mick-title">Patrón contextual</h2></div></div>
      ${renderMick(snapshot)}
    </section>

    <p class="home-truth-note">Inicio es una proyección. No crea tareas, no confirma pagos, no recalcula métricas y no ejecuta acciones sensibles sin tu revisión.</p>
  </section>`;
}

export function createHomeModule({ root, client, user, globalState, onNavigate } = {}) {
  if (!root) throw new Error("AURA_HOME_ROOT_REQUIRED");
  if (!client) throw new Error("AURA_HOME_CLIENT_REQUIRED");
  if (root[STATE]) return root[STATE];
  injectStyles();

  let mounted = false;
  let adapter = null;
  let revision = 0;
  let controller = null;
  let timeZone = resolveBrowserTimeZone();
  let lastSnapshot = null;
  const events = new AbortController();

  function navigate(route) {
    const target = ALLOWED_ROUTES.has(route) ? route : "inicio";
    onNavigate?.(target);
  }

  function renderLoading(reason = "Conectando tu operación") {
    root.innerHTML = `<section class="home-aura" data-home-state="LOADING" aria-busy="true">
      <header class="home-header"><div><p class="home-context-line">${esc(greetingFor(new Date(), timeZone))}, ${esc(firstNameFor(user))}</p><h1>Mi día</h1><p class="home-date">${esc(formatLocalDay(new Date(), timeZone))}</p></div></header>
      ${stateBlock(reason, "Forge está consultando autoridades productivas; no mostrará datos de ejemplo.", "LOADING")}
    </section>`;
  }

  function renderFailure(error) {
    const session = String(error?.code || error?.message || "").includes("SESSION");
    root.innerHTML = `<section class="home-aura" data-home-state="${session ? "SESSION_REQUIRED" : "SOURCE_UNAVAILABLE"}">
      <header class="home-header"><div><p class="home-context-line">${esc(greetingFor(new Date(), timeZone))}, ${esc(firstNameFor(user))}</p><h1>Mi día</h1><p class="home-date">${esc(formatLocalDay(new Date(), timeZone))}</p></div></header>
      ${stateBlock(session ? "Tu sesión cambió" : "No pudimos preparar Mi Día", session ? "Vuelve a autenticarte antes de consultar datos privados." : "El fallo quedó contenido. No mostraremos ceros, prioridades ni recomendaciones inventadas.", session ? "SESSION_REQUIRED" : "SOURCE_UNAVAILABLE")}
      <button type="button" class="aura-secondary home-retry" data-home-refresh>Reintentar</button>
    </section>`;
  }

  async function ensureAdapter() {
    if (!adapter) adapter = await createHomePagesAdapter({ client, user });
    return adapter;
  }

  async function refresh(reason = "refresh") {
    if (!mounted) return;
    const selected = ++revision;
    controller?.abort();
    controller = new AbortController();
    const currentController = controller;
    renderLoading(reason === "timezone-change" ? "Actualizando tu zona horaria" : "Conectando tu operación");
    try {
      const current = resolveBrowserTimeZone();
      timeZone = current;
      const now = new Date();
      const snapshot = await (await ensureAdapter()).load({
        timeZone,
        now,
        signal: currentController.signal,
      });
      if (!mounted || selected !== revision || currentController.signal.aborted) return;
      lastSnapshot = snapshot;
      renderReady(root, snapshot, user, timeZone, now);
      root.setAttribute("aria-busy", "false");
      globalState?.(reason === "timezone-change" ? `Mi Día actualizado para ${timeZone}.` : "");
    } catch (error) {
      if (!mounted || selected !== revision || error?.name === "AbortError") return;
      renderFailure(error);
      globalState?.("No pudimos actualizar Mi Día.", "error");
    }
  }

  function reconcileTimeZone(reason) {
    const next = resolveBrowserTimeZone();
    if (next !== timeZone) {
      timeZone = next;
      void refresh("timezone-change");
      return;
    }
    if (reason === "pageshow") void refresh("visibility-return");
  }

  function bind() {
    root.addEventListener("click", event => {
      const route = event.target.closest("[data-home-route]")?.dataset.homeRoute;
      if (route) {
        navigate(route);
        return;
      }
      if (event.target.closest("[data-home-refresh]")) void refresh("manual-refresh");
    }, { signal: events.signal });
    globalThis.addEventListener("pageshow", () => reconcileTimeZone("pageshow"), { signal: events.signal });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") reconcileTimeZone("visibilitychange");
    }, { signal: events.signal });
  }

  const api = Object.freeze({
    async mount() {
      if (mounted) return;
      mounted = true;
      bind();
      await refresh("mount");
    },
    async unmount() {
      if (!mounted) return;
      mounted = false;
      revision += 1;
      controller?.abort();
      controller = null;
      root.replaceChildren();
    },
    async scrub(reason = "session-scrub") {
      revision += 1;
      controller?.abort();
      controller = null;
      lastSnapshot = null;
      adapter?.scrub?.(reason);
      adapter = null;
      root.replaceChildren();
      root.dataset.homeScrubbed = "true";
    },
    async destroy() {
      mounted = false;
      revision += 1;
      controller?.abort();
      events.abort();
      adapter?.destroy?.();
      adapter = null;
      lastSnapshot = null;
      delete root[STATE];
    },
    diagnostics() {
      return Object.freeze({
        mounted,
        timeZone,
        generatedAt: lastSnapshot?.generatedAt || null,
        advisorId: lastSnapshot?.advisorId || null,
        productWrites: 0,
      });
    },
  });
  root[STATE] = api;
  return api;
}
