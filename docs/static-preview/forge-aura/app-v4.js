import { createAuraRouter } from "./aura-router-v4.js";
import { createAuraShell } from "./aura-shell.js";
import { createAuraAuth, renderAuraLogin } from "./aura-auth-v4.js";
import { createPipelineModule } from "./pipeline/pipeline-module.js?v=pages-adapter-c5a90d95";
import { createActivityModule } from "./activity/activity-module.js?v=activity-reports-ux-001-corrected";
import { createCarteraModule } from "./cartera/cartera-module-v3.js?v=aura-cartera-pdf-already-admitted-reopen-011";
import { createIncomeModule } from "./income/income-module.js?v=income-aura-ux-reconciliation-001";

const root = document.querySelector("[data-aura-app]");
const auth = createAuraAuth();
let shell = null;
let router = null;
let activeModule = null;
let activeRoute = null;
let activeAdvisorId = null;
let bootRevision = 0;

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
  root.innerHTML = `<section class="aura-login" data-aura-auth-state="AUTH_LOADING"><div class="aura-loading"><div aria-hidden="true"></div><h1>${message}</h1><p>Forge verifica la sesión productiva.</p></div></section>`;
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

async function scrub({ destroyShell = false, clearAdvisor = false } = {}) {
  bootRevision += 1;
  await destroyActiveModule();
  if (clearAdvisor) activeAdvisorId = null;
  if (destroyShell) {
    shell = null;
    root.replaceChildren();
  }
  document.querySelectorAll('input[type="password"]').forEach(input => {
    input.value = "";
  });
}

function showLogin(message = "") {
  void scrub({ destroyShell: true, clearAdvisor: true }).then(() => {
    renderAuraLogin({ root, auth, onAuthenticated: () => router.restoreAfterAuth() });
    if (message) {
      const node = root.querySelector("[data-aura-auth-error]");
      if (node) {
        node.hidden = false;
        node.textContent = message;
      }
    }
  });
}

function ensureShell(snapshot) {
  if (!shell) {
    shell = createAuraShell({
      root,
      onNavigate: route => router.navigate(route),
      onLogout: async () => {
        shell.setGlobalState("Cerrando sesión…");
        try {
          await scrub({ clearAdvisor: true });
          await auth.signOut();
        } finally {
          router.navigate("login", { replace: true });
          showLogin();
        }
      },
    });
  }
  activeAdvisorId = snapshot.user?.id || null;
  shell.setUser(snapshot.user);
  return shell;
}

function createRouteModule(route, currentShell, client, snapshot) {
  if (route === "actividad") {
    return createActivityModule({
      root: currentShell.main,
      client,
      user: snapshot.user,
      globalState: currentShell.setGlobalState,
    });
  }
  if (route === "cartera") {
    return createCarteraModule({
      root: currentShell.main,
      client,
      globalState: currentShell.setGlobalState,
    });
  }
  if (route === "comisiones") {
    return createIncomeModule({
      root: currentShell.main,
      client,
      user: snapshot.user,
      globalState: currentShell.setGlobalState,
    });
  }
  return createPipelineModule({
    root: currentShell.main,
    client,
    globalState: currentShell.setGlobalState,
  });
}

async function mountRoute(route, snapshot) {
  const revision = ++bootRevision;
  if (activeRoute === route && activeModule && activeAdvisorId === snapshot.user?.id) return;
  await destroyActiveModule();
  const currentShell = ensureShell(snapshot);
  currentShell.setActiveRoute(route);
  currentShell.main.replaceChildren();
  const client = await auth.getClient();
  if (route === "actividad") ensureStylesheet("./activity/activity.css?v=activity-reports-ux-001-corrected", "actividad");
  if (route === "cartera") ensureStylesheet("./cartera/cartera.css?v=aura-cartera-pdf-auth-002", "cartera");
  if (route === "comisiones") ensureStylesheet("./income/income.css?v=income-aura-ux-reconciliation-001", "comisiones");
  if (revision !== bootRevision) return;
  activeModule = createRouteModule(route, currentShell, client, snapshot);
  activeRoute = route;
  await activeModule.mount();
  if (revision !== bootRevision) {
    await destroyActiveModule();
    return;
  }
  root.setAttribute("aria-busy", "false");
  currentShell.main.focus({ preventScroll: true });
}

async function renderRoute(route) {
  const snapshot = auth.snapshot();
  if (!snapshot.user?.id) {
    showLogin();
    return;
  }
  if (route === "login") {
    router.restoreAfterAuth();
    return;
  }
  await mountRoute(route, snapshot);
}

async function handleAdvisorSwitch(snapshot) {
  const nextAdvisorId = snapshot.user?.id || null;
  if (!nextAdvisorId || !activeAdvisorId || nextAdvisorId === activeAdvisorId) return;
  const previousAdvisorId = activeAdvisorId;
  const route = router.current();
  await scrub({ clearAdvisor: true });
  globalThis.dispatchEvent(new CustomEvent("aura:advisor-switch-scrub", {
    detail: { previousAdvisorId, nextAdvisorId, route },
  }));
  if (auth.snapshot().user?.id === nextAdvisorId) {
    router.navigate(route, { replace: true });
  }
}

async function boot() {
  renderBoot("Recuperando tu sesión");
  router = createAuraRouter({ onChange: route => void renderRoute(route) });
  auth.subscribe(snapshot => {
    if (snapshot.event === "SIGNED_OUT") {
      activeAdvisorId = null;
      router.navigate("login", { replace: true });
      showLogin();
      return;
    }
    void handleAdvisorSwitch(snapshot);
  });
  try {
    const snapshot = await auth.restore();
    if (snapshot.user?.id) router.restoreAfterAuth();
    else {
      router.navigate("login", { replace: true });
      showLogin();
    }
  } catch (error) {
    const diagnostic = [error?.name, error?.message].filter(Boolean).join(" · ");
    showLogin(`Error de sesión v4: ${diagnostic || "desconocido"}`);
  }
}

void boot();
