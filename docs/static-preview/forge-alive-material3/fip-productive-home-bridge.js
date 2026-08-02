const FIP_HOME_STATE = Symbol.for("forge.fip.productive-home.v1");

const CANONICAL_ACTION_WIDGET_IDS = Object.freeze(new Set([
  "home-daily-priority",
]));

const WIDGET_PRESENTATION = Object.freeze({
  "home-nash": Object.freeze({ variant: "small", icon: "◈", empty: "Nash necesita más conversaciones para recomendar." }),
  "person-context": Object.freeze({ variant: "small", icon: "◎", empty: "Aún no hay suficiente contexto de relación." }),
  "activity-mick": Object.freeze({ variant: "small", icon: "↗", empty: "Mick está esperando patrones de actividad." }),
  "reports-business": Object.freeze({ variant: "small", icon: "▥", empty: "El negocio aún no tiene señales suficientes." }),
  "alfred-brief": Object.freeze({ variant: "wide", icon: "⌁", empty: "Alfred seguirá aprendiendo sin inventar datos." }),
});

let composerPromise = null;
async function loadComposer() {
  if (!composerPromise) {
    composerPromise = import("./fip-pack-07-productive-experience-service-distribution.js?v=fip-pages-runtime-001");
  }
  return composerPromise;
}

function sessionAdvisorId(session) {
  return session?.user?.id || null;
}

function render(root, experience) {
  const sourceStatus = new Map(experience.sources.map((source) => [source.id, source.status]));
  const supportingWidgets = experience.widgets.filter((widget) => !CANONICAL_ACTION_WIDGET_IDS.has(widget.id));
  const cards = supportingWidgets.map((widget) => {
    const presentation = WIDGET_PRESENTATION[widget.id] || { variant: "small", icon: "•", empty: "Sin señales suficientes todavía." };
    const insights = widget.insightIds
      .map((id) => experience.insights.find((item) => item.id === id))
      .filter(Boolean);
    const primary = insights[0] || null;
    const body = primary
      ? `<strong>${primary.title}</strong><span>${primary.summary}</span>`
      : `<span class="fip-empty">${presentation.empty}</span>`;
    const count = insights.length > 1 ? `<span class="fip-count">+${insights.length - 1}</span>` : "";
    return `<article class="fip-widget" data-fip-widget="${widget.id}" data-state="${widget.state}" data-variant="${presentation.variant}" tabindex="0">
      <header><span class="fip-widget-icon" aria-hidden="true">${presentation.icon}</span><span class="fip-widget-surface">${widget.surface}</span>${count}</header>
      <h3>${widget.title}</h3>
      <div class="fip-widget-body">${body}</div>
      <span class="fip-widget-chevron" aria-hidden="true">›</span>
    </article>`;
  }).join("");

  root.innerHTML = `<div class="fip-productive-heading">
    <div><p>ADVISOR INTELLIGENCE</p><h2>Alfred y tu sistema de venta</h2></div>
    <span class="fip-role">ORQUESTADOR · NO AUTORIDAD</span>
  </div>
  <div class="fip-source-strip" aria-label="Estado de fuentes">
    ${["relationship", "advisor", "mick", "nash", "operation", "business"].map((id) => `<span data-source="${id}" data-status="${sourceStatus.get(id) || "UNAVAILABLE"}">${id}</span>`).join("")}
  </div>
  <div class="fip-widget-grid" aria-label="Inteligencia complementaria">${cards}</div>`;
  root.hidden = false;
  root.dataset.fipProductiveState = "ready";
}

export function createFipProductiveHomeBridge({
  root,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  getPacks = async () => ({}),
  clock = () => new Date(),
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("FIP productive root is required");
  if (root[FIP_HOME_STATE]) return root[FIP_HOME_STATE];

  let mounted = false;
  let generation = 0;
  let activeAdvisorId = null;
  let controller = null;

  function abortCurrent(reason) {
    generation += 1;
    if (!controller?.signal.aborted) controller?.abort(reason);
    controller = null;
  }

  function scrub(reason = "session-scrub") {
    abortCurrent(reason);
    activeAdvisorId = null;
    root.replaceChildren();
    root.hidden = true;
    root.dataset.fipProductiveState = "scrubbed";
  }

  async function sessionSnapshot() {
    const selectedBootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap;
    if (typeof selectedBootstrap?.getSession !== "function") return null;
    const result = await selectedBootstrap.getSession();
    if (result?.error) throw result.error;
    return result?.data?.session || null;
  }

  async function reconcile() {
    const requestGeneration = ++generation;
    controller?.abort("superseded");
    controller = new AbortController();
    const { signal } = controller;
    root.dataset.fipProductiveState = "loading";

    const session = await sessionSnapshot();
    const advisorId = sessionAdvisorId(session);
    if (!advisorId) {
      scrub("anonymous-session");
      return;
    }
    activeAdvisorId = advisorId;

    const [{ composeAlfredProductiveExperience }, packs] = await Promise.all([
      loadComposer(),
      getPacks({ advisorId, signal, now: clock().toISOString() }),
    ]);

    if (signal.aborted || requestGeneration !== generation || activeAdvisorId !== advisorId) return;
    const currentSession = await sessionSnapshot();
    if (signal.aborted || requestGeneration !== generation || sessionAdvisorId(currentSession) !== advisorId) return;

    const experience = composeAlfredProductiveExperience({
      advisorReference: `advisor:${advisorId}`,
      generatedAt: clock().toISOString(),
      packs: packs || {},
    });
    if (signal.aborted || requestGeneration !== generation) return;
    render(root, experience);
  }

  function onAuthStateChanged() {
    reconcile().catch(() => scrub("auth-reconcile-failed"));
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    document.addEventListener("forge:auth-state-changed", onAuthStateChanged);
  }

  const api = Object.freeze({
    mount,
    reconcile,
    scrub,
    diagnostics() {
      return Object.freeze({
        mounted,
        generation,
        activeAdvisorId,
        state: root.dataset.fipProductiveState || "idle",
      });
    },
  });
  root[FIP_HOME_STATE] = api;
  return api;
}
