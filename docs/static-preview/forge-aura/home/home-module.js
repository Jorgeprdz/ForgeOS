import {
  firstNameFor,
  formatLocalDay,
  formatLocalTime,
  greetingFor,
  mickHonestState,
  resolveBrowserTimeZone,
  rhythmFromStack,
  sectionOf,
  selectCarteraAttention,
} from "./home-core.js";
import { createHomePagesAdapter } from "./home-adapter-pages-v1.js";
import { createAuraDecisionControl } from "./home-decision-control-017c.js?v=forge-commercial-leverage-017c";

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
  if (family.includes("OPPORTUNITY") || family.includes("FOLLOW_UP") || family.includes("AGENDA")) return "pipeline";
  return "inicio";
}

function widgetForAttention(snapshot, attention) {
  const sourceReference = attention?.sourceReference;
  const candidates = [
    ...(Array.isArray(snapshot?.priority?.value?.visible) ? snapshot.priority.value.visible : []),
    ...(Array.isArray(snapshot?.priority?.value?.inventory) ? snapshot.priority.value.inventory : []),
  ];
  return candidates.find(widget => widget?.widgetId === sourceReference) || null;
}

function routeForAttention(snapshot, attention) {
  return routeForWidget(widgetForAttention(snapshot, attention));
}

function stateBlock(title, detail, state = "UNKNOWN") {
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

function confidenceLabel(attention) {
  return attention?.confidence?.value || "No informada";
}

function decisionControls(attention, decisionEvent = null) {
  if (!attention?.humanDecisionRequired || !attention?.decisionReference) return "";
  const current = decisionEvent?.payload?.decision || null;
  return `<div class="home-decision-control" data-home-decision-control data-current-decision="${esc(current || "NONE")}" aria-label="Tu decisión sobre esta recomendación">
    <span>${current ? `Decisión guardada: ${esc({ ACCEPTED: "Aceptada", MODIFIED: "Modificada", DEFERRED: "Pospuesta", DISMISSED: "Descartada" }[current] || current)}` : "Tú decides qué hacer con esta recomendación"}</span>
    <div role="group" aria-label="Responder a la recomendación">
      <button type="button" data-home-decision="ACCEPT" aria-pressed="${String(current === "ACCEPTED")}">Aceptar</button>
      <button type="button" data-home-decision="MODIFY" aria-pressed="${String(current === "MODIFIED")}">Modificar</button>
      <button type="button" data-home-decision="DEFER" aria-pressed="${String(current === "DEFERRED")}">Posponer</button>
      <button type="button" data-home-decision="DISMISS" aria-pressed="${String(current === "DISMISSED")}">Descartar</button>
    </div>
    <small data-home-decision-status aria-live="polite"></small>
  </div>`;
}

function renderBriefing(snapshot, decisions = new Map()) {
  const orchestration = snapshot.attention?.value || null;
  const attention = orchestration?.items?.[0] || null;
  if (!attention) {
    const state = snapshot.attention?.state || "UNKNOWN";
    const empty = state === "EMPTY";
    return `<article class="home-alfred-card" data-home-briefing-source="FORGE_HOME_ATTENTION_ORCHESTRATION_007" data-state="${esc(state)}">
      <div class="home-alfred-mark" aria-hidden="true">✦</div>
      <div class="home-alfred-copy">
        <p class="home-mini-label">ALFRED</p>
        <h2>${empty ? "No hay una señal gobernada que exija atención" : "No hay una siguiente acción confiable todavía"}</h2>
        <p>${empty ? "Decision Projection no entregó elementos activos en la composición actual." : "Forge conservará la incertidumbre visible; no fabricará una prioridad, recomendación ni acción para llenar Inicio."}</p>
        <div class="home-alfred-actions"><details><summary>Ver por qué</summary><p>Estado de atención: ${esc(state)}.</p>${snapshot.attention?.error ? `<p>${esc(snapshot.attention.error.code)}</p>` : ""}</details></div>
      </div>
    </article>`;
  }

  const route = routeForAttention(snapshot, attention);
  const action = attention.recommendedHumanAction;
  return `<article class="home-alfred-card" data-home-briefing-source="FORGE_HOME_ATTENTION_ORCHESTRATION_007" data-decision-reference="${esc(attention.decisionReference)}" data-state="${esc(orchestration.state)}">
    <div class="home-alfred-mark" aria-hidden="true">✦</div>
    <div class="home-alfred-copy">
      <p class="home-mini-label">ALFRED</p>
      <h2>${esc(attention.title)}</h2>
      <p>${esc(attention.whyNow || attention.reason)}</p>
      <div class="home-alfred-actions">
        ${action ? `<button type="button" class="aura-primary" data-home-route="${esc(route)}">${esc(action.label)}</button>` : ""}
        <details><summary>Ver por qué</summary>
          <p>${esc(attention.reason)}</p>
          <p><b>Verdad:</b> ${esc(attention.truthState)} · <b>Fuente:</b> ${esc(attention.sourceAuthority || "No informada")}</p>
          <p><b>Confianza:</b> ${esc(confidenceLabel(attention))}</p>
          ${attention.limitations?.length ? `<p><b>Limitaciones:</b> ${esc(attention.limitations.join(" · "))}</p>` : ""}
          ${attention.asOf ? `<p><b>As of:</b> ${esc(attention.asOf)}</p>` : ""}
        </details>
      </div>
      ${decisionControls(attention, decisions.get(attention.decisionReference))}
    </div>
  </article>`;
}

function renderSupportingAttention(snapshot, decisions = new Map()) {
  const items = Array.isArray(snapshot.attention?.value?.items)
    ? snapshot.attention.value.items.slice(1, 3)
    : [];
  if (!items.length) return "";
  return `<section class="home-supporting" aria-labelledby="home-supporting-title">
    <div class="home-supporting-heading"><p class="home-mini-label">TAMBIÉN VALE LA PENA REVISAR</p><h2 id="home-supporting-title">Dos cosas más</h2></div>
    <div class="home-supporting-list">${items.map(attention => {
      const action = attention.recommendedHumanAction;
      const route = routeForAttention(snapshot, attention);
      return `<article class="home-supporting-item" data-decision-reference="${esc(attention.decisionReference)}" data-state="${esc(attention.state)}">
        <div><h3>${esc(attention.title)}</h3><p>${esc(attention.whyNow || attention.reason)}</p></div>
        <div class="home-supporting-actions">
          ${action ? `<button type="button" class="home-link-button" data-home-route="${esc(route)}">${esc(action.label)}</button>` : ""}
          <details><summary>Ver por qué</summary><p>${esc(attention.reason)}</p>${attention.limitations?.length ? `<p><b>Qué falta confirmar:</b> ${esc(attention.limitations.join(" · "))}</p>` : ""}</details>
        </div>
        ${decisionControls(attention, decisions.get(attention.decisionReference))}
      </article>`;
    }).join("")}</div>
  </section>`;
}

function renderDetailNavigation() {
  return `<nav class="home-detail-navigation" aria-label="Explorar detalle comercial">
    <span>Profundiza sólo cuando lo necesites:</span>
    <button type="button" class="home-link-button" data-home-route="pipeline">Pipeline</button>
    <button type="button" class="home-link-button" data-home-route="actividad">Actividad</button>
    <button type="button" class="home-link-button" data-home-route="cartera">Cartera</button>
    <button type="button" class="home-link-button" data-home-route="comisiones">Ingresos</button>
  </nav>`;
}

function attentionSummary(snapshot) {
  const orchestration = snapshot.attention?.value;
  const state = snapshot.attention?.state || "UNKNOWN";
  if (!orchestration || state === "UNKNOWN" || state === "ERROR") {
    return "Forge no puede confirmar cuántas señales requieren atención con la evidencia disponible.";
  }
  const count = orchestration.items?.length || 0;
  if (state === "EMPTY" && count === 0) return "Decision Projection confirmó que no hay señales activas en la composición actual.";
  return `${count} ${count === 1 ? "señal gobernada requiere" : "señales gobernadas requieren"} tu revisión.`;
}

function renderReady(root, snapshot, user, timeZone, now, decisions = new Map()) {
  const state = snapshot.attention?.state || "UNKNOWN";
  root.innerHTML = `<section class="home-aura" data-home-state="${esc(state)}" data-home-timezone="${esc(timeZone)}" data-home-attention-contract="FHAO-007-001">
    <header class="home-header">
      <div>
        <p class="home-context-line">${esc(greetingFor(now, timeZone))}, ${esc(firstNameFor(user))}</p>
        <h1>Mi día</h1>
        <p class="home-date">${esc(formatLocalDay(now, timeZone))}</p>
        <p class="home-attention-summary">${esc(attentionSummary(snapshot))}</p>
      </div>
      <button type="button" class="home-refresh" data-home-refresh aria-label="Actualizar Mi Día">Actualizar</button>
    </header>

    ${renderBriefing(snapshot, decisions)}
    ${renderSupportingAttention(snapshot, decisions)}
    ${renderDetailNavigation()}
  </section>`;
}

export function createHomeModule({ root, client, user, globalState, onNavigate, homeAdapterFactory = createHomePagesAdapter } = {}) {
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
  const decisionControl = createAuraDecisionControl({ client, user, globalState });
  let decisions = new Map();
  const events = new AbortController();

  function navigate(route) {
    const target = ALLOWED_ROUTES.has(route) ? route : "inicio";
    onNavigate?.(target);
  }

  function renderLoading(reason = "Conectando tu operación") {
    root.innerHTML = `<section class="home-aura" data-home-state="LOADING" aria-busy="true">
      <header class="home-header"><div><p class="home-context-line">${esc(greetingFor(new Date(), timeZone))}, ${esc(firstNameFor(user))}</p><h1>Mi día</h1><p class="home-date">${esc(formatLocalDay(new Date(), timeZone))}</p></div></header>
      ${stateBlock(reason, "Forge está consultando autoridades productivas y Decision Projection; no mostrará datos de ejemplo.", "LOADING")}
    </section>`;
  }

  function renderFailure(error) {
    const session = String(error?.code || error?.message || "").includes("SESSION");
    root.innerHTML = `<section class="home-aura" data-home-state="ERROR">
      <header class="home-header"><div><p class="home-context-line">${esc(greetingFor(new Date(), timeZone))}, ${esc(firstNameFor(user))}</p><h1>Mi día</h1><p class="home-date">${esc(formatLocalDay(new Date(), timeZone))}</p></div></header>
      ${stateBlock(session ? "Tu sesión cambió" : "No pudimos preparar Mi Día", session ? "Vuelve a autenticarte antes de consultar datos privados." : "El fallo quedó contenido. No mostraremos ceros, prioridades ni recomendaciones inventadas.", "ERROR")}
      <button type="button" class="aura-secondary home-retry" data-home-refresh>Reintentar</button>
    </section>`;
  }

  async function ensureAdapter() {
    if (!adapter) adapter = await homeAdapterFactory({ client, user });
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
      try {
        decisions = await decisionControl.read();
      } catch (error) {
        decisions = new Map();
        globalState?.("Las recomendaciones están disponibles, pero no pudimos consultar tus decisiones guardadas.", "error");
      }
      if (!mounted || selected !== revision || currentController.signal.aborted) return;
      renderReady(root, snapshot, user, timeZone, now, decisions);
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
      const decisionButton = event.target.closest("[data-home-decision]");
      if (decisionButton) {
        const card = decisionButton.closest("[data-decision-reference]");
        const item = lastSnapshot?.attention?.value?.items?.find(candidate => candidate.decisionReference === card?.dataset.decisionReference);
        const status = decisionButton.closest("[data-home-decision-control]")?.querySelector("[data-home-decision-status]");
        if (!item) { if (status) status.textContent = "No pudimos identificar esta recomendación."; return; }
        decisionButton.closest("[data-home-decision-control]")?.querySelectorAll("button").forEach(button => { button.disabled = true; });
        if (status) status.textContent = "Guardando tu decisión…";
        void decisionControl.decide(item, decisionButton.dataset.homeDecision).then(() => refresh("decision-write")).catch(error => {
          decisionButton.closest("[data-home-decision-control]")?.querySelectorAll("button").forEach(button => { button.disabled = false; });
          if (status) status.textContent = "No pudimos guardar tu decisión. Inténtalo nuevamente.";
          globalState?.("No pudimos guardar tu decisión.", "error");
          console.warn("AURA_DECISION_WRITE_FAILED", error?.code || error?.message);
        });
      }
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
      void decisionControl.close();
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
        attentionState: lastSnapshot?.attention?.state || null,
        attentionContract: lastSnapshot?.attention?.value?.contractVersion || null,
        productWrites: 0,
        homeDomainWrites: 0,
      });
    },
  });
  root[STATE] = api;
  return api;
}
