const CONTRACT_ID = "CRS_10_EXISTING_RELATIONSHIP_INTELLIGENCE_MATERIAL3_V1";
const STATE = Symbol.for("forge.crs10.person-intelligence.material3.state");
const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const repositoryBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const moduleUrl = path => new URL(path, repositoryBase);

const DOMAIN_ORDER = Object.freeze([
  "FUTURE_RADAR",
  "RELATIONSHIP_GROWTH",
  "RELATIONAL_ACTIVATION",
  "ECONOMIC_CONNECTION",
  "RELATIONSHIP_CAPITAL",
  "PRODUCTIVITY_PROOF",
]);

const DOMAIN_LABELS = Object.freeze({
  FUTURE_RADAR: "Radar futuro",
  RELATIONSHIP_GROWTH: "Crecimiento responsable",
  RELATIONAL_ACTIVATION: "Activación relacional",
  ECONOMIC_CONNECTION: "Conexión económica",
  RELATIONSHIP_CAPITAL: "Capital relacional",
  PRODUCTIVITY_PROOF: "Evidencia de productividad",
});

const STATUS_LABELS = Object.freeze({
  AVAILABLE: "Conectada",
  EMPTY: "Sin señales",
  DEGRADED: "Degradada",
  UNAVAILABLE: "No disponible",
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureStylesheet() {
  if (document.querySelector("[data-person-intelligence-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("person-intelligence-module.css?v=crs-10-001", import.meta.url).href;
  link.dataset.personIntelligenceStyles = "true";
  document.head.append(link);
}

async function waitForProductiveBootstrap() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (typeof bootstrap?.getClient === "function" && typeof bootstrap?.getUser === "function") {
      return bootstrap;
    }
    await new Promise(resolve => window.setTimeout(resolve, 50));
  }
  throw Object.assign(new Error("CRS10_PRODUCTIVE_BOOTSTRAP_UNAVAILABLE"), {
    code: "CRS10_PRODUCTIVE_BOOTSTRAP_UNAVAILABLE",
  });
}

let authoritiesPromise;
async function loadAuthorities() {
  authoritiesPromise ||= Promise.all([
    import(moduleUrl("state-manager.js")),
    import(moduleUrl("advisor-os/person-workspace/crs-10-existing-relationship-intelligence-service.js")),
  ]).then(([stateModule, serviceModule]) => Object.freeze({
    AppState: stateModule.AppState,
    createService: serviceModule.createCrs10ExistingRelationshipIntelligenceService,
  })).catch(error => {
    authoritiesPromise = null;
    throw error;
  });
  return authoritiesPromise;
}

function ensureHost(root) {
  const workspace = root.querySelector("[data-person-workspace-ready]");
  if (!workspace) return null;
  let host = workspace.querySelector("[data-person-intelligence-host]");
  if (host) return host;
  host = document.createElement("section");
  host.id = "person-intelligence";
  host.className = "person-intelligence-shell";
  host.dataset.personIntelligenceHost = "true";
  host.setAttribute("aria-live", "polite");
  const grid = workspace.querySelector(".person-workspace-grid");
  workspace.insertBefore(host, grid || workspace.querySelector(".person-workspace-boundary"));
  const nav = workspace.querySelector(".person-workspace-section-nav");
  if (nav && !nav.querySelector('[href="#person-intelligence"]')) {
    const link = document.createElement("a");
    link.href = "#person-intelligence";
    link.textContent = "Inteligencia";
    link.dataset.personIntelligenceNav = "true";
    nav.append(link);
  }
  return host;
}

function renderLoading(host) {
  host.dataset.personIntelligenceState = "loading";
  host.innerHTML = `
    <header class="person-intelligence-header">
      <div>
        <p class="section-kicker accent">CRS 10 · COMPOSICIÓN EXISTENTE</p>
        <h2>Inteligencia relacional</h2>
        <p>Conectando las autoridades aceptadas de Cartera 050–100.</p>
      </div>
      <span class="person-intelligence-spinner" aria-hidden="true"></span>
    </header>
  `;
}

function renderItem(item) {
  return `
    <article class="person-intelligence-item" data-person-intelligence-item="${escapeHtml(item.reference)}">
      <div>
        <div class="person-intelligence-item-title">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.state)}</span>
        </div>
        ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
        ${item.uncertainty ? `<small><b>Límite:</b> ${escapeHtml(item.uncertainty)}</small>` : ""}
        ${item.smallestUsefulAction ? `<small><b>Siguiente revisión:</b> ${escapeHtml(item.smallestUsefulAction)}</small>` : ""}
      </div>
      <footer>
        <span>${escapeHtml(item.evidenceCount)} evidencia(s)</span>
        <a href="${escapeHtml(item.deepLink)}" data-person-workspace-deep-link>Abrir en Cartera</a>
      </footer>
    </article>
  `;
}

function renderDomain(domain) {
  const unavailable = ["DEGRADED", "UNAVAILABLE"].includes(domain.status);
  const content = domain.items.length
    ? domain.items.slice(0, 3).map(renderItem).join("")
    : `<div class="person-intelligence-empty">
        <strong>${unavailable ? "Fuente no disponible" : "Sin señales para este alcance"}</strong>
        <p>${unavailable
          ? `La fuente permanece visible y no se sustituye con inferencias.${domain.reason ? ` ${escapeHtml(domain.reason)}` : ""}`
          : domain.scope === "ADVISOR"
            ? "No hay evidencia suficiente del asesor para este periodo."
            : "No hay señales autoritativas asociadas a esta persona."}</p>
      </div>`;
  return `
    <section class="person-intelligence-domain" data-person-intelligence-domain="${escapeHtml(domain.id)}" data-source-status="${escapeHtml(domain.status)}">
      <header>
        <div>
          <p>${escapeHtml(domain.authority)}</p>
          <h3>${escapeHtml(DOMAIN_LABELS[domain.id] || domain.id)}</h3>
        </div>
        <div class="person-intelligence-domain-meta">
          <span>${escapeHtml(domain.scope === "ADVISOR" ? "Asesor" : "Persona")}</span>
          <strong>${escapeHtml(STATUS_LABELS[domain.status] || domain.status)}</strong>
        </div>
      </header>
      <div class="person-intelligence-items">${content}</div>
    </section>
  `;
}

function renderReady(host, composition) {
  host.dataset.personIntelligenceState = "ready";
  host.innerHTML = `
    <header class="person-intelligence-header">
      <div>
        <p class="section-kicker accent">CRS 10 · CARTERA 050–100</p>
        <h2>Inteligencia relacional existente</h2>
        <p>Señales explicables para revisión. Productividad se muestra como contexto del asesor y nunca como atributo de la persona.</p>
      </div>
      <div class="person-intelligence-summary">
        <strong>${escapeHtml(composition.itemCount)}</strong>
        <span>señales visibles</span>
        <small>${escapeHtml(composition.reviewCount)} requieren revisión</small>
      </div>
    </header>
    <div class="person-intelligence-scope-note">
      <strong>Sin score oculto ni acción automática.</strong>
      <span>Cada dominio conserva su autoridad, alcance, evidencia, incertidumbre y control humano.</span>
    </div>
    <div class="person-intelligence-grid">
      ${DOMAIN_ORDER.map(id => renderDomain(composition.domains[id])).join("")}
    </div>
  `;
}

function renderFailure(host, error) {
  const code = String(error?.code || error?.message || "CRS10_RELATIONSHIP_INTELLIGENCE_FAILED");
  host.dataset.personIntelligenceState = "error";
  host.innerHTML = `
    <header class="person-intelligence-header person-intelligence-header--error">
      <div>
        <p class="section-kicker accent">CRS 10 · LECTURA DEGRADADA</p>
        <h2>La inteligencia relacional no está disponible</h2>
        <p>El workspace de persona permanece operativo. No sustituiremos estas fuentes con scores o recomendaciones inventadas.</p>
        <small>${escapeHtml(code)}</small>
      </div>
    </header>
  `;
}

function runtimeState() {
  if (!document.documentElement[STATE]) {
    document.documentElement[STATE] = {
      generation: 0,
      personReference: null,
      root: null,
      lateResultRejectCount: 0,
      composition: null,
    };
  }
  return document.documentElement[STATE];
}

export async function mountPersonIntelligence({ root, personReference } = {}) {
  if (!root) throw new Error("CRS10_PERSON_WORKSPACE_ROOT_REQUIRED");
  const state = runtimeState();
  const generation = ++state.generation;
  state.root = root;
  state.personReference = personReference;
  state.composition = null;
  ensureStylesheet();
  const host = ensureHost(root);
  if (!host) throw new Error("CRS10_PERSON_WORKSPACE_READY_HOST_REQUIRED");
  renderLoading(host);
  document.documentElement.dataset.personIntelligenceRuntime = "loading";

  try {
    const bootstrap = await waitForProductiveBootstrap();
    const userResult = await bootstrap.getUser();
    if (generation !== state.generation) {
      state.lateResultRejectCount += 1;
      return null;
    }
    if (!userResult?.data?.user?.id) throw Object.assign(new Error("CRS10_AUTH_REQUIRED"), { code: "CRS10_AUTH_REQUIRED" });
    const [client, authorities] = await Promise.all([
      bootstrap.getClient(),
      loadAuthorities(),
    ]);
    if (generation !== state.generation) {
      state.lateResultRejectCount += 1;
      return null;
    }
    const service = authorities.createService({
      client,
      economicConnectionReader: async () => authorities.AppState.get("cartera:economicConnection") || [],
    });
    const composition = await service.loadRelationshipIntelligence({ personReference });
    if (generation !== state.generation) {
      state.lateResultRejectCount += 1;
      return null;
    }
    state.composition = composition;
    renderReady(host, composition);
    document.documentElement.dataset.personIntelligenceRuntime = "ready";
    globalThis.dispatchEvent(new CustomEvent("forge:person-intelligence-mounted", {
      detail: Object.freeze({
        contractId: CONTRACT_ID,
        personReference,
        itemCount: composition.itemCount,
        reviewCount: composition.reviewCount,
        readOnly: true,
        localMutationControls: false,
      }),
    }));
    return composition;
  } catch (error) {
    if (generation !== state.generation) {
      state.lateResultRejectCount += 1;
      return null;
    }
    console.error("[CRS10 PERSON INTELLIGENCE]", error);
    renderFailure(host, error);
    document.documentElement.dataset.personIntelligenceRuntime = "error";
    return null;
  }
}

export function scrubPersonIntelligence(reason = "scrubbed") {
  const state = runtimeState();
  state.generation += 1;
  state.personReference = null;
  state.composition = null;
  state.root?.querySelector("[data-person-intelligence-host]")?.remove();
  state.root?.querySelector("[data-person-intelligence-nav]")?.remove();
  document.documentElement.dataset.personIntelligenceRuntime = reason;
}

export function personIntelligenceDiagnostics() {
  const state = runtimeState();
  return Object.freeze({
    contractId: CONTRACT_ID,
    personReference: state.personReference,
    state: document.documentElement.dataset.personIntelligenceRuntime || "idle",
    itemCount: state.composition?.itemCount || 0,
    reviewCount: state.composition?.reviewCount || 0,
    lateResultRejectCount: state.lateResultRejectCount,
    existingCarteraIntelligenceReused: true,
    secondScoreEngine: false,
    localMutationControls: false,
  });
}

if (!globalThis.ForgeCrs10PersonIntelligenceMaterial3) {
  globalThis.addEventListener("forge:auth-state-changed", event => {
    const status = String(event.detail?.status || "").toLowerCase();
    if (["anonymous", "auth_error"].includes(status)) scrubPersonIntelligence("signed-out");
  });
  globalThis.ForgeCrs10PersonIntelligenceMaterial3 = Object.freeze({
    contractId: CONTRACT_ID,
    mount: mountPersonIntelligence,
    scrub: scrubPersonIntelligence,
    diagnostics: personIntelligenceDiagnostics,
  });
}

export { CONTRACT_ID, DOMAIN_ORDER, DOMAIN_LABELS, STATUS_LABELS };
