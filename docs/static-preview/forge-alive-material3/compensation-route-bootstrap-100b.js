const SHELL_STATE = Symbol.for("forge.ui-m04.shell.state");
const BOOT_STATE = Symbol.for("forge.advisor-compensation.route-bootstrap.100b");
const sourceTree = import.meta.url.includes("/docs/static-preview/");
const AUTH_RECOVERY_RETRY_LIMIT = 120;
const AUTH_RECOVERY_RETRY_MS = 250;
let recoveryPromise = null;

function applicationRoot() {
  return document.querySelector("[data-forge-application]");
}

function moduleViewport() {
  return document.querySelector("[data-forge-module-viewport]");
}

async function loadCompensationModule() {
  return sourceTree
    ? import("./compensation-module.js?v=advisor-compensation-100-auth-retry-001")
    : import("./compensation-module-distribution-100.js?v=advisor-compensation-100-auth-retry-001");
}

async function loadProviderModule() {
  if (!sourceTree) {
    return import("./compensation-runtime-distribution-100.js?v=advisor-compensation-100-auth-retry-001");
  }
  return import(new URL(
    "../../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
    import.meta.url,
  ));
}

function ensureRoot(viewport) {
  let root = viewport.querySelector("[data-forge-compensation-module]");
  if (root) return root;
  root = document.createElement("section");
  root.className = "compensation-module";
  root.dataset.forgeCompensationModule = "true";
  root.dataset.routeModule = "comisiones";
  root.dataset.forgePrivateSurface = "advisor-compensation";
  root.hidden = true;
  root.setAttribute("aria-label", "Comisiones");
  viewport.append(root);
  return root;
}

function ensureMobileLayoutGuard() {
  if (document.querySelector("[data-advisor-compensation-mobile-guard]")) return;
  const style = document.createElement("style");
  style.dataset.advisorCompensationMobileGuard = "100-auth-retry-001";
  style.textContent = `
    [data-forge-compensation-module],
    [data-forge-compensation-module] .comp-shell,
    [data-forge-compensation-module] .comp-state,
    [data-forge-compensation-module] .comp-state > div {
      box-sizing: border-box;
      min-width: 0;
      max-width: 100%;
    }
    [data-forge-compensation-module] .comp-shell {
      width: 100%;
    }
    [data-forge-compensation-module] .comp-state h2,
    [data-forge-compensation-module] .comp-state p,
    [data-forge-compensation-module] .comp-state code {
      max-width: 100%;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  `;
  document.head.append(style);
}

function delay(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

function sessionUserId(result) {
  if (result?.error) throw result.error;
  return result?.data?.session?.user?.id || null;
}

async function authenticatedBootstrap() {
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  if (
    typeof bootstrap?.getClient !== "function"
    || typeof bootstrap?.getSession !== "function"
  ) {
    return null;
  }
  try {
    const userId = sessionUserId(await bootstrap.getSession());
    return userId ? bootstrap : null;
  } catch {
    return null;
  }
}

async function installProvider(shell, { bootstrap = null } = {}) {
  if (document.documentElement.dataset.forgeAuthRuntime !== "ready") return false;
  try {
    const provider = await loadProviderModule();
    const installation = await provider.installAdvisorCompensationSupabaseProvider100({
      bootstrap,
    });
    document.documentElement.dataset.advisorCompensationAuthority = installation.installed
      ? "ready"
      : "disconnected";
    document.documentElement.dataset.advisorCompensationAuthorityReason =
      installation.probe?.reason || "none";
    shell.reconcile();
    return installation.installed;
  } catch (error) {
    document.documentElement.dataset.advisorCompensationAuthority = "failed";
    document.documentElement.dataset.advisorCompensationAuthorityReason =
      error?.code || error?.message || "provider-install-failed";
    console.error("[Forge] Advisor compensation authority failed", error);
    shell.reconcile();
    return false;
  }
}

async function recoverCompensation(shell, module, reason = "auth-runtime-late-ready") {
  if (recoveryPromise) return recoveryPromise;
  const html = document.documentElement;
  recoveryPromise = (async () => {
    html.dataset.advisorCompensationAuthRecovery = "waiting";
    html.dataset.advisorCompensationAuthRecoveryReason = reason;
    for (let attempt = 1; attempt <= AUTH_RECOVERY_RETRY_LIMIT; attempt += 1) {
      html.dataset.advisorCompensationAuthRecoveryAttempt = String(attempt);
      const bootstrap = document.documentElement.dataset.forgeAuthRuntime === "ready"
        ? await authenticatedBootstrap()
        : null;
      if (bootstrap) {
        await installProvider(shell, { bootstrap });
        shell.reconcile();
        await module.refresh();
        html.dataset.advisorCompensationAuthRecovery = "recovered";
        html.dataset.advisorCompensationAuthRecoveryReason = reason;
        return true;
      }
      await delay(AUTH_RECOVERY_RETRY_MS);
    }
    html.dataset.advisorCompensationAuthRecovery = "timed-out";
    return false;
  })().finally(() => {
    recoveryPromise = null;
  });
  return recoveryPromise;
}

async function boot() {
  const application = applicationRoot();
  const viewport = moduleViewport();
  const shell = application?.[SHELL_STATE]?.api;
  if (!application || !viewport || !shell) return false;
  if (application[BOOT_STATE]) return true;

  ensureMobileLayoutGuard();
  const { createCompensationModule } = await loadCompensationModule();
  const root = ensureRoot(viewport);
  const module = createCompensationModule({ root, shell });
  shell.registerRouteModule("comisiones", module);
  application[BOOT_STATE] = Object.freeze({ module, root });
  document.documentElement.dataset.advisorCompensationRoute = "registered";
  shell.reconcile();
  void recoverCompensation(shell, module, "boot");

  const authObserver = new MutationObserver(() => {
    if (document.documentElement.dataset.forgeAuthRuntime === "ready") {
      void recoverCompensation(shell, module, "auth-runtime-ready");
    }
  });
  authObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-forge-auth-runtime"],
  });

  globalThis.addEventListener("forge:auth-state-changed", (event) => {
    if (String(event?.detail?.status || "").toLowerCase() === "authenticated") {
      void recoverCompensation(shell, module, "authenticated-event");
    }
  });
  globalThis.addEventListener("popstate", () => {
    if (new URL(location.href).searchParams.get("nav") === "comisiones") {
      void recoverCompensation(shell, module, "route-reentry");
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "visible"
      && new URL(location.href).searchParams.get("nav") === "comisiones"
    ) {
      void recoverCompensation(shell, module, "android-tab-resume");
    }
  });

  const unmountPrivateCompensation = () => module.unmount();
  globalThis.addEventListener("forge:private-runtime-scrub", unmountPrivateCompensation);
  globalThis.addEventListener("forge:session-required", unmountPrivateCompensation);
  globalThis.addEventListener("forge:logout", unmountPrivateCompensation);
  return true;
}

void (async () => {
  if (await boot()) return;
  const observer = new MutationObserver(async () => {
    if (await boot()) observer.disconnect();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    childList: true,
    attributeFilter: ["data-forge-shell-ready"],
  });
  globalThis.addEventListener("DOMContentLoaded", () => void boot(), { once: true });
})();
