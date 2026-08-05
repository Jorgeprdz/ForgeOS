import { createAuraRouter } from "./aura-router-v4.js";
import { createAuraShell } from "./aura-shell.js";
import { createAuraAuth, renderAuraLogin } from "./aura-auth-v4.js";
import { createPipelineModule } from "./pipeline/pipeline-module.js?v=state-fix-c7d3c02a";

const root = document.querySelector("[data-aura-app]");
const auth = createAuraAuth();
let shell = null;
let pipeline = null;
let router = null;
let bootRevision = 0;

function renderBoot(message) {
  root.setAttribute("aria-busy", "true");
  root.innerHTML = `<section class="aura-login" data-aura-auth-state="AUTH_LOADING"><div class="aura-loading"><div aria-hidden="true"></div><h1>${message}</h1><p>Forge verifica la sesión productiva.</p></div></section>`;
}

function scrub() {
  pipeline?.destroy();
  pipeline = null;
  shell = null;
  root.replaceChildren();
  document.querySelectorAll('input[type="password"]').forEach(input => { input.value = ""; });
}

function showLogin(message = "") {
  scrub();
  renderAuraLogin({ root, auth, onAuthenticated: () => router.navigate("pipeline", { replace: true }) });
  if (message) {
    const node = root.querySelector("[data-aura-auth-error]");
    if (node) {
      node.hidden = false;
      node.textContent = message;
    }
  }
}

async function showPipeline(snapshot) {
  const revision = ++bootRevision;
  scrub();
  shell = createAuraShell({
    root,
    onLogout: async () => {
      shell.setGlobalState("Cerrando sesión…");
      try { await auth.signOut(); }
      finally {
        router.navigate("login", { replace: true });
        showLogin();
      }
    },
  });
  shell.setUser(snapshot.user);
  const client = await auth.getClient();
  if (revision !== bootRevision) return;
  pipeline = createPipelineModule({ root: shell.main, client, globalState: shell.setGlobalState });
  await pipeline.mount();
  root.setAttribute("aria-busy", "false");
}

async function renderRoute(route) {
  const snapshot = auth.snapshot();
  if (!snapshot.user?.id) {
    showLogin();
    return;
  }
  if (route === "pipeline") await showPipeline(snapshot);
}

async function boot() {
  renderBoot("Recuperando tu sesión");
  router = createAuraRouter({ onChange: route => void renderRoute(route) });
  auth.subscribe(snapshot => {
    if (snapshot.event === "SIGNED_OUT") {
      router.navigate("login", { replace: true });
      showLogin();
    }
  });
  try {
    const snapshot = await auth.restore();
    if (snapshot.user?.id) {
      router.restoreAfterAuth();
      await showPipeline(snapshot);
    } else {
      router.navigate("login", { replace: true });
      showLogin();
    }
  } catch (error) {
    const diagnostic = [error?.name, error?.message, error?.stack].filter(Boolean).join(" · ");
    showLogin(`Error de sesión v4: ${diagnostic || "desconocido"}`);
  }
}

void boot();
