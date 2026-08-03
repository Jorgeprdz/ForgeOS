const SHELL_STATE = Symbol.for("forge.ui-m04.shell.state");
const BOOT_STATE = Symbol.for("forge.advisor-compensation.route-bootstrap.100b");
const sourceTree = import.meta.url.includes("/docs/static-preview/");
let recoveryPromise = null;
let recoveryController = null;
let recoveryGeneration = 0;

function applicationRoot() {
  return document.querySelector("[data-forge-application]");
}

function moduleViewport() {
  return document.querySelector("[data-forge-module-viewport]");
}

async function loadCompensationModule() {
  return sourceTree
    ? import("./compensation-module.js?v=advisor-compensation-120-false-zero-safe-area-001")
    : import("./compensation-module-distribution-100.js?v=advisor-compensation-120-false-zero-safe-area-001");
}

async function loadProviderModule() {
  if (!sourceTree) {
    return import("./compensation-runtime-distribution-100.js?v=advisor-compensation-120-false-zero-safe-area-001");
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
  style.dataset.advisorCompensationMobileGuard = "120-false-zero-safe-area-001";
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
      --text: var(--forge-sys-color-on-surface, var(--ink));
      --muted: var(--forge-sys-color-on-surface-variant, var(--muted));
      --card-bg: var(--forge-sys-color-surface-container, var(--surface));
      --separator: var(--forge-sys-color-outline-variant, var(--outline));
      --accent: var(--forge-sys-color-primary, var(--aqua));
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

function activeCompensationRoute() {
  return new URL(globalThis.location.href).searchParams.get("nav") === "comisiones";
}

function cancelRecovery(reason = "compensation-recovery-cancelled") {
  recoveryGeneration += 1;
  if (recoveryController && !recoveryController.signal.aborted) {
    recoveryController.abort(reason);
  }
  recoveryController = null;
  recoveryPromise = null;
  document.documentElement.dataset.advisorCompensationAuthRecovery = "cancelled";
  document.documentElement.dataset.advisorCompensationAuthRecoveryReason = reason;
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

async function installProvider(shell, {
  bootstrap = null,
  signal = null,
  isCurrent = () => true,
} = {}) {
  if (document.documentElement.dataset.forgeAuthRuntime !== "ready") return false;
  try {
    const provider = await loadProviderModule();
    const installation = await provider.installAdvisorCompensationSupabaseProvider100({
      bootstrap,
      signal,
    });
    if (signal?.aborted || !isCurrent()) return false;
    document.documentElement.dataset.advisorCompensationAuthority = installation.installed
      ? "ready"
      : "disconnected";
    document.documentElement.dataset.advisorCompensationAuthorityReason =
      installation.probe?.reason || "none";
    shell.reconcile();
    return installation.installed;
  } catch (error) {
    if (signal?.aborted || !isCurrent()) return false;
    document.documentElement.dataset.advisorCompensationAuthority = "failed";
    document.documentElement.dataset.advisorCompensationAuthorityReason =
      error?.code || error?.message || "provider-install-failed";
    console.error("[Forge] Advisor compensation authority failed", error);
    shell.reconcile();
    return false;
  }
}

async function recoverCompensation(shell, module, reason = "auth-runtime-late-ready") {
  if (
    !activeCompensationRoute()
    || document.documentElement.dataset.forgeAuthBoundary !== "authenticated"
  ) return false;
  if (recoveryPromise) return recoveryPromise;
  const generation = ++recoveryGeneration;
  const controller = new AbortController();
  recoveryController = controller;
  const html = document.documentElement;
  recoveryPromise = (async () => {
    html.dataset.advisorCompensationAuthRecovery = "waiting";
    html.dataset.advisorCompensationAuthRecoveryReason = reason;
    const isCurrent = () => (
      !controller.signal.aborted
      && generation === recoveryGeneration
      && activeCompensationRoute()
      && html.dataset.forgeAuthBoundary === "authenticated"
    );
    if (!isCurrent()) return false;
    html.dataset.advisorCompensationAuthRecoveryAttempt = "1";
    const bootstrap = document.documentElement.dataset.forgeAuthRuntime === "ready"
      ? await authenticatedBootstrap()
      : null;
    if (!isCurrent()) return false;
    if (!bootstrap) {
      html.dataset.advisorCompensationAuthRecovery = "blocked";
      html.dataset.advisorCompensationAuthRecoveryReason = "verified-session-required";
      html.removeAttribute("data-advisor-compensation-auth-recovery-attempt");
      return false;
    }
    const installed = await installProvider(shell, {
      bootstrap,
      signal: controller.signal,
      isCurrent,
    });
    if (!installed || !isCurrent()) return false;
    shell.reconcile();
    await module.refresh();
    if (!isCurrent()) return false;
    html.dataset.advisorCompensationAuthRecovery = "recovered";
    html.dataset.advisorCompensationAuthRecoveryReason = reason;
    return true;
  })().finally(() => {
    if (generation === recoveryGeneration) {
      recoveryPromise = null;
      recoveryController = null;
    }
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
  if (document.documentElement.dataset.forgeAuthBoundary === "authenticated") {
    void recoverCompensation(shell, module, "boot");
  }

  const authObserver = new MutationObserver(() => {
    if (
      document.documentElement.dataset.forgeAuthRuntime === "ready"
      && document.documentElement.dataset.forgeAuthBoundary === "authenticated"
    ) {
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
    } else {
      cancelRecovery("auth-state-not-authenticated");
    }
  });
  globalThis.addEventListener("popstate", () => {
    if (new URL(location.href).searchParams.get("nav") === "comisiones") {
      void recoverCompensation(shell, module, "route-reentry");
    } else {
      cancelRecovery("compensation-route-left");
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

  const unmountPrivateCompensation = () => {
    cancelRecovery("private-runtime-scrub");
    module.unmount();
  };
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
