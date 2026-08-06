import { createAuraRouter } from "./aura-router-v4.js";
import { createAuraShell } from "./aura-shell.js";
import { createAuraAuth, renderAuraLogin } from "./aura-auth-v4.js";
import { createPipelineModule } from "./pipeline/pipeline-module.js?v=pages-adapter-c5a90d95";
import { createActivityModule } from "./activity/activity-module.js?v=activity-productive-ui-001";

const root = document.querySelector("[data-aura-app]");
const auth = createAuraAuth();
let shell = null;
let router = null;
let activeModule = null;
let activeRoute = null;
let bootRevision = 0;

function renderBoot(message) {
  root.setAttribute("aria-busy", "true");
  root.innerHTML = `<section class="aura-login" data-aura-auth-state="AUTH_LOADING"><div class="aura-loading"><div aria-hidden="true"></div><h1>${message}</h1><p>Forge verifica la sesión productiva.</p></div></section>`;
}

async function destroyActiveModule() {
  const current = activeModule;
  activeModule = null; activeRoute = null;
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
    if (message) { const node = root.querySelector("[data-aura-auth-error]"); if (node) { node.hidden = false; node.textContent = message; } }
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
  auth.subscribe((snapshot) => { if (snapshot.event === "SIGNED_OUT") { router.navigate("login", { replace: true }); showLogin(); } });
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
