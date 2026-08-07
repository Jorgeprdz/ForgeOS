import { createAuraRouter } from "./aura-router-v4.js";
import { createAuraShell } from "./aura-shell.js";
import { createAuraAuth, renderAuraLogin } from "./aura-auth-v4.js";
import { createPipelineModule } from "./pipeline/pipeline-module.js?v=pages-adapter-c5a90d95";
import { createActivityModule } from "./activity/activity-module.js?v=activity-reports-ux-001";

const root = document.querySelector("[data-aura-app]");
const auth = createAuraAuth();
let shell = null;
let router = null;
let activeModule = null;
let activeRoute = null;
let bootRevision = 0;
let activityAssetsPromise = null;

const ACTIVITY_AUTHORITY_SCRIPTS = Object.freeze([
  "../../../platform/event-evidence/canonical-activity-event-contract.js",
  "../../../platform/event-evidence/activity-ledger-contract.js",
  "../../../platform/event-evidence/activity-ledger-local-store.js",
  "../../../platform/event-evidence/activity-ledger-sync-service.js",
  "../../../platform/event-evidence/activity-ledger-supabase-gateway.js",
  "../../../platform/event-evidence/activity-ledger-browser-runtime.js",
  "../../../platform/operational-calendar/operational-calendar-contract.js",
  "../../../platform/operational-calendar/eligible-date-evaluator.js",
  "../../../platform/operational-calendar/operational-calendar-repository.js",
  "../../../platform/productivity/activity-conversion-read-model.js",
  "../../../platform/productivity/activity-coaching-policy.js",
  "../../../platform/productivity/activity-coaching-intelligence.js",
]);

function ensureStylesheet(href) {
  const absolute = new URL(href, import.meta.url).href;
  if (document.querySelector(`link[data-aura-activity-style="${CSS.escape(absolute)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = absolute;
  link.dataset.auraActivityStyle = absolute;
  document.head.append(link);
}

function loadScript(src) {
  const absolute = new URL(src, import.meta.url).href;
  const existing = document.querySelector(`script[data-aura-activity-authority="${CSS.escape(absolute)}"]`);
  if (existing?.dataset.loaded === "true") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = existing || document.createElement("script");
    const onLoad = () => { script.dataset.loaded = "true"; resolve(); };
    const onError = () => reject(new Error(`ACTIVITY_AUTHORITY_LOAD_FAILED:${src}`));
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existing) {
      script.src = absolute;
      script.dataset.auraActivityAuthority = absolute;
      document.head.append(script);
    }
  });
}

async function ensureActivityAssets() {
  if (activityAssetsPromise) return activityAssetsPromise;
  activityAssetsPromise = (async () => {
    ensureStylesheet("./activity/activity.css?v=activity-reports-ux-001");
    for (const script of ACTIVITY_AUTHORITY_SCRIPTS) await loadScript(script);
  })().catch((error) => { activityAssetsPromise = null; throw error; });
  return activityAssetsPromise;
}

function renderBoot(message) {
  root.setAttribute("aria-busy", "true");
  root.innerHTML = `<section class="aura-login" data-aura-auth-state="AUTH_LOADING"><div class="aura-loading"><div aria-hidden="true"></div><h1>${message}</h1><p>Forge verifica la sesión productiva.</p></div></section>`;
}

async function destroyActiveModule() {
  const current = activeModule;
  activeModule = null;
  activeRoute = null;
  if (!current) return;
  await current.unmount?.();
  current.scrub?.();
  await current.destroy?.();
}

async function scrub({ destroyShell = false } = {}) {
  bootRevision += 1;
  await destroyActiveModule();
  if (destroyShell) { shell?.destroy?.(); shell = null; root.replaceChildren(); }
  document.querySelectorAll('input[type="password"]').forEach((input) => { input.value = ""; });
}

function showLogin(message = "") {
  void scrub({ destroyShell: true }).then(() => {
    renderAuraLogin({ root, auth, onAuthenticated: () => router.restoreAfterAuth() });
    if (message) {
      const node = root.querySelector("[data-aura-auth-error]");
      if (node) { node.hidden = false; node.textContent = message; }
    }
  });
}

function ensureShell(snapshot) {
  if (!shell) {
    shell = createAuraShell({
      root,
      onNavigate: (route) => router.navigate(route),
      onLogout: async () => {
        shell.setGlobalState("Cerrando sesión…");
        try { await scrub(); await auth.signOut(); }
        finally { router.navigate("login", { replace: true }); showLogin(); }
      },
    });
  }
  shell.setUser(snapshot.user);
  return shell;
}

async function mountRoute(route, snapshot) {
  const revision = ++bootRevision;
  if (activeRoute === route && activeModule) return;
  await destroyActiveModule();
  const currentShell = ensureShell(snapshot);
  currentShell.setActiveRoute(route);
  currentShell.main.replaceChildren();
  const client = await auth.getClient();
  if (route === "actividad") await ensureActivityAssets();
  if (revision !== bootRevision) return;
  activeModule = route === "actividad"
    ? createActivityModule({ root: currentShell.main, client, user: snapshot.user, globalState: currentShell.setGlobalState })
    : createPipelineModule({ root: currentShell.main, client, globalState: currentShell.setGlobalState });
  activeRoute = route;
  await activeModule.mount();
  if (revision !== bootRevision) { await destroyActiveModule(); return; }
  root.setAttribute("aria-busy", "false");
  currentShell.main.focus({ preventScroll: true });
}

async function renderRoute(route) {
  const snapshot = auth.snapshot();
  if (!snapshot.user?.id) { showLogin(); return; }
  if (route === "login") { router.restoreAfterAuth(); return; }
  await mountRoute(route, snapshot);
}

async function boot() {
  renderBoot("Recuperando tu sesión");
  router = createAuraRouter({ onChange: (route) => void renderRoute(route) });
  auth.subscribe((snapshot) => {
    if (snapshot.event === "SIGNED_OUT") { router.navigate("login", { replace: true }); showLogin(); }
  });
  try {
    const snapshot = await auth.restore();
    if (snapshot.user?.id) router.restoreAfterAuth();
    else { router.navigate("login", { replace: true }); showLogin(); }
  } catch (error) {
    const diagnostic = [error?.name, error?.message].filter(Boolean).join(" · ");
    showLogin(`Error de sesión v4: ${diagnostic || "desconocido"}`);
  }
}

void boot();
