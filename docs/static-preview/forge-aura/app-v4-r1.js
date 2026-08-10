import { createAuraRouter } from "./aura-router-v4.js";
import { createAuraShell } from "./aura-shell.js";
import { createAuraAuth, renderAuraLogin } from "./aura-auth-v4.js";

const root = document.querySelector("[data-aura-app]");
const auth = createAuraAuth();
let shell = null;
let router = null;
let activeModule = null;
let activeRoute = null;
let activeAdvisorId = null;
let bootRevision = 0;
let alfredRuntime = null;
let alfredRuntimePromise = null;
let alfredStyleMarker = null;

function ensureStylesheet(href, key = "module") {
  const absolute = new URL(href, import.meta.url).href;
  if (document.querySelector(`link[data-aura-module-style="${CSS.escape(absolute)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = absolute;
  link.dataset.auraModuleStyle = absolute;
  link.dataset.auraModuleStyleKey = key;
  document.head.append(link);
}
function renderBoot(message) {
  root.setAttribute("aria-busy", "true");
  root.innerHTML = `<section class="aura-login" data-aura-auth-state="AUTH_LOADING"><div class="aura-loading"><div aria-hidden="true"></div><h1>${message}</h1><p>Forge verifica tu acceso seguro.</p></div></section>`;
}
async function destroyActiveModule() {
  const current = activeModule;
  activeModule = null;
  activeRoute = null;
  if (!current) return;
  await current.unmount?.();
  await current.scrub?.();
  await current.destroy?.();
}
async function destroyAlfredRuntime() {
  const current = alfredRuntime;
  alfredRuntime = null;
  alfredRuntimePromise = null;
  current?.destroy?.();
}
async function scrub({ destroyShell = false, clearAdvisor = false } = {}) {
  bootRevision += 1;
  await destroyActiveModule();
  if (clearAdvisor) activeAdvisorId = null;
  if (destroyShell) {
    await destroyAlfredRuntime();
    shell?.destroy?.();
    shell = null;
    root.replaceChildren();
  }
  document.querySelectorAll('input[type="password"]').forEach(input => { input.value = ""; });
}
function showLogin(message = "") {
  void scrub({ destroyShell: true, clearAdvisor: true }).then(() => {
    renderAuraLogin({ root, auth, onAuthenticated: () => router.restoreAfterAuth() });
    if (message) {
      const node = root.querySelector("[data-aura-auth-error]");
      if (node) { node.hidden = false; node.textContent = message; }
    }
  });
}
async function ensureAlfredRuntime(currentShell) {
  if (alfredRuntime) return alfredRuntime;
  if (alfredRuntimePromise) return alfredRuntimePromise;
  if (!alfredStyleMarker) {
    alfredStyleMarker = document.createElement("meta");
    alfredStyleMarker.dataset.alfredCommandRuntimeStyles = "AURA_LIGHT_2026_CANONICAL_STYLES";
    document.head.append(alfredStyleMarker);
  }
  alfredRuntimePromise = import("../forge-alive-material3/alfred-command-runtime.js?v=aura-home-command-os-reuse-001")
    .then(module => {
      if (typeof module.createAlfredCommandRuntime !== "function") throw new Error("AURA_ALFRED_COMMAND_OS_AUTHORITY_INVALID");
      const runtime = module.createAlfredCommandRuntime({ root: currentShell.root, shell: currentShell });
      runtime.initialize();
      alfredRuntime = runtime;
      currentShell.setAlfredAvailability(true);
      return runtime;
    })
    .catch(error => {
      alfredRuntimePromise = null;
      currentShell.setAlfredAvailability(false, "Alfred Command OS no pudo cargarse; el resto de Forge sigue disponible.");
      console.error("AURA_ALFRED_COMMAND_OS_LOAD_FAILED", error);
      return null;
    });
  return alfredRuntimePromise;
}
function wireQuotesEntry(currentShell) {
  const link = root.querySelector('[data-aura-productive-link="cotizaciones"]');
  if (!link || link.dataset.auraQuotesNativeBound === "true") return;
  link.dataset.auraQuotesNativeBound = "true";
  link.href = "?route=cotizaciones";
  const detail = link.querySelector("small");
  if (detail) detail.textContent = "Propuestas, PDF y presentación";
  link.addEventListener("click", event => {
    event.preventDefault();
    currentShell.setMore(false);
    router.navigate("cotizaciones");
  });
}
function ensureShell(snapshot) {
  if (!shell) {
    shell = createAuraShell({
      root,
      onNavigate: route => router.navigate(route),
      onLogout: async () => {
        shell.setGlobalState("Cerrando sesión…");
        try { await scrub({ clearAdvisor: true }); await auth.signOut(); }
        finally { router.navigate("login", { replace: true }); showLogin(); }
      },
    });
    ensureStylesheet("./aura-recomposition-008.css?v=forge-global-aura-recomposition-008", "aura-recomposition-008");
    wireQuotesEntry(shell);
  }
  activeAdvisorId = snapshot.user?.id || null;
  shell.setUser(snapshot.user);
  void ensureAlfredRuntime(shell);
  return shell;
}
async function loadRouteFactory(route) {
  if (route === "inicio") {
    const module = await import("./home/home-module-008.js?v=forge-global-aura-recomposition-008");
    return module.createHomeModule;
  }
  if (route === "actividad") {
    const module = await import("./activity/activity-module.js?v=activity-reports-ux-001-corrected");
    return module.createActivityModule;
  }
  if (route === "cartera") {
    const module = await import("./cartera/cartera-module-v4.js?v=cartera-pdf-semantic-reconciliation-012");
    return module.createCarteraModule;
  }
  if (route === "comisiones") {
    const module = await import("./income/income-module.js?v=income-aura-ux-reconciliation-001");
    return module.createIncomeModule;
  }
  if (route === "cotizaciones") {
    const module = await import("./quotes/quotes-module.js?v=aura-quotes-product-intelligence-001");
    return module.createQuotesModule;
  }
  const module = await import("./recomposition/pipeline-consumer-bridge-008.js?v=forge-global-aura-recomposition-008");
  return module.createPipelineModule;
}
async function createRouteModule(route, currentShell, client, snapshot) {
  const factory = await loadRouteFactory(route);
  if (typeof factory !== "function") throw Object.assign(new Error("AURA_ROUTE_FACTORY_INVALID"), { route });
  if (route === "inicio") return factory({
    root: currentShell.main,
    client,
    user: snapshot.user,
    globalState: currentShell.setGlobalState,
    onNavigate: (target, context = null) => router.navigate(target, { context }),
  });
  if (route === "actividad") return factory({ root: currentShell.main, client, user: snapshot.user, globalState: currentShell.setGlobalState });
  if (route === "cartera") return factory({ root: currentShell.main, client, globalState: currentShell.setGlobalState });
  if (route === "comisiones") return factory({ root: currentShell.main, client, user: snapshot.user, globalState: currentShell.setGlobalState });
  if (route === "cotizaciones") return factory({ root: currentShell.main, client, globalState: currentShell.setGlobalState });
  return factory({ root: currentShell.main, client, globalState: currentShell.setGlobalState });
}
function renderRouteLoadFailure(currentShell, route) {
  const labels = { inicio: "Inicio", actividad: "Actividad", cartera: "Cartera", comisiones: "Ingresos", cotizaciones: "Cotizaciones", pipeline: "Pipeline" };
  const label = labels[route] || "este módulo";
  root.setAttribute("aria-busy", "false");
  currentShell.main.innerHTML = `<section class="aura-login" data-aura-route-state="LOAD_ERROR"><div class="aura-loading"><h1>No pudimos cargar ${label}</h1><p>El resto de Forge sigue protegido. Recarga para obtener el runtime más reciente.</p><button type="button" data-aura-route-retry>Reintentar</button></div></section>`;
  currentShell.main.querySelector("[data-aura-route-retry]")?.addEventListener("click", () => router.navigate(route, { replace: true }));
  currentShell.setGlobalState(`No pudimos cargar ${label}.`, "error");
}
function renderRouteContext(shellRoot, main, route, context = {}) {
  shellRoot?.querySelector("[data-aura-route-context]")?.remove();
  if (!shellRoot || !main || !context || !Object.keys(context).length) return;

  const section = document.createElement("section");
  section.className = "aura-route-context";
  section.dataset.auraRouteContext = "true";
  section.dataset.auraContextRoute = route;
  section.setAttribute("aria-label", "Continuidad de decisión");

  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "aura-route-context__eyebrow";
  eyebrow.textContent = "CONTINUIDAD DE DECISIÓN";
  const title = document.createElement("strong");
  title.textContent = "Llegaste desde una señal gobernada";
  const detail = document.createElement("span");
  const source = context.contract || context.source || "Origen conservado";
  const reference = context.decisionReference || context.sourceReference || "sin referencia adicional";
  detail.textContent = `${source} · ${reference}. Este módulo conserva el origen; no recalcula ni sustituye a la autoridad fuente.`;
  copy.append(eyebrow, title, detail);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "aura-route-context__close";
  close.textContent = "Cerrar contexto";
  close.addEventListener("click", () => {
    router.clearContext();
    section.remove();
  });

  section.append(copy, close);
  main.before(section);
}
async function mountRoute(route, snapshot) {
  const revision = ++bootRevision;
  if (activeRoute === route && activeModule && activeAdvisorId === snapshot.user?.id) {
    renderRouteContext(shell?.root, shell?.main, route, router?.context?.());
    return;
  }
  await destroyActiveModule();
  const currentShell = ensureShell(snapshot);
  currentShell.setActiveRoute(route);
  currentShell.main.replaceChildren();
  const client = await auth.getClient();
  if (route === "pipeline") ensureStylesheet("./pipeline/pipeline.css?v=aura-pipeline-ux-reconciliation-001", "pipeline");
  if (route === "actividad") ensureStylesheet("./activity/activity.css?v=activity-reports-ux-001-corrected", "actividad");
  if (route === "cartera") {
    ensureStylesheet("./cartera/cartera.css?v=aura-cartera-pdf-auth-002", "cartera");
    ensureStylesheet("./cartera/cartera-semantic-012.css?v=cartera-pdf-semantic-reconciliation-012", "cartera-semantic-012");
  }
  if (route === "comisiones") ensureStylesheet("./income/income.css?v=income-aura-ux-reconciliation-001", "comisiones");
  if (route === "cotizaciones") ensureStylesheet("./quotes/quotes.css?v=aura-quotes-product-intelligence-001", "cotizaciones");
  if (revision !== bootRevision) return;
  try {
    activeModule = await createRouteModule(route, currentShell, client, snapshot);
    if (revision !== bootRevision) { await activeModule?.destroy?.(); activeModule = null; return; }
    activeRoute = route;
    await activeModule.mount();
    if (revision !== bootRevision) { await destroyActiveModule(); return; }
    renderRouteContext(currentShell.root, currentShell.main, route, router.context());
    root.setAttribute("aria-busy", "false");
    currentShell.main.focus({ preventScroll: true });
  } catch (error) {
    activeModule = null;
    activeRoute = null;
    if (revision !== bootRevision) return;
    renderRouteLoadFailure(currentShell, route);
    console.error("AURA_ROUTE_LOAD_FAILED", { route, error });
  }
}
async function renderRoute(route) {
  const snapshot = auth.snapshot();
  if (!snapshot.user?.id) { showLogin(); return; }
  if (route === "login") { router.restoreAfterAuth(); return; }
  await mountRoute(route, snapshot);
}
async function handleAdvisorSwitch(snapshot) {
  const nextAdvisorId = snapshot.user?.id || null;
  if (!nextAdvisorId || !activeAdvisorId || nextAdvisorId === activeAdvisorId) return;
  const previousAdvisorId = activeAdvisorId;
  const route = router.current();
  await scrub({ clearAdvisor: true });
  alfredRuntime?.resetForSessionBoundary?.("authenticated");
  globalThis.dispatchEvent(new CustomEvent("aura:advisor-switch-scrub", { detail: { previousAdvisorId, nextAdvisorId, route } }));
  if (auth.snapshot().user?.id === nextAdvisorId) router.navigate(route, { replace: true });
}
async function boot() {
  renderBoot("Recuperando tu sesión");
  router = createAuraRouter({ onChange: route => void renderRoute(route) });
  auth.subscribe(snapshot => {
    if (snapshot.event === "SIGNED_OUT") {
      activeAdvisorId = null;
      alfredRuntime?.resetForSessionBoundary?.("anonymous");
      router.navigate("login", { replace: true });
      showLogin();
      return;
    }
    void handleAdvisorSwitch(snapshot);
  });
  try {
    const snapshot = await auth.restore();
    if (snapshot.user?.id) router.restoreAfterAuth();
    else { router.navigate("login", { replace: true }); showLogin(); }
  } catch (error) {
    console.error("AURA_AUTH_RESTORE_FAILED", String(error?.code || error?.name || "AUTH_RESTORE_FAILED"));
    showLogin("No pudimos recuperar tu sesión. Vuelve a intentarlo.");
  }
}

globalThis.addEventListener("forge:alfred-navigation", event => {
  const route = String(event.detail?.route || "").toLowerCase();
  if (route !== "quotes" && route !== "cotizaciones") return;
  event.stopImmediatePropagation();
  shell?.setAlfred(false);
  router?.navigate("cotizaciones");
}, { capture: true });

void boot();
