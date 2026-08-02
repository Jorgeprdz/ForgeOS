const SHELL_STATE = Symbol.for("forge.ui-m04.shell.state");
const BOOT_STATE = Symbol.for("forge.advisor-compensation.route-bootstrap.100b");
const sourceTree = import.meta.url.includes("/docs/static-preview/");

function applicationRoot() {
  return document.querySelector("[data-forge-application]");
}

function moduleViewport() {
  return document.querySelector("[data-forge-module-viewport]");
}

async function loadCompensationModule() {
  return sourceTree
    ? import("./compensation-module.js?v=advisor-compensation-100")
    : import("./compensation-module-distribution-100.js?v=advisor-compensation-100");
}

async function loadProviderModule() {
  if (!sourceTree) {
    return import("./compensation-runtime-distribution-100.js?v=advisor-compensation-100");
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

async function installProvider(shell) {
  if (document.documentElement.dataset.forgeAuthRuntime !== "ready") return false;
  try {
    const provider = await loadProviderModule();
    const installation = await provider.installAdvisorCompensationSupabaseProvider100();
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

async function boot() {
  const application = applicationRoot();
  const viewport = moduleViewport();
  const shell = application?.[SHELL_STATE]?.api;
  if (!application || !viewport || !shell) return false;
  if (application[BOOT_STATE]) return true;

  const { createCompensationModule } = await loadCompensationModule();
  const root = ensureRoot(viewport);
  const module = createCompensationModule({ root, shell });
  shell.registerRouteModule("comisiones", module);
  application[BOOT_STATE] = Object.freeze({ module, root });
  document.documentElement.dataset.advisorCompensationRoute = "registered";
  shell.reconcile();
  void installProvider(shell);

  const authObserver = new MutationObserver(() => {
    if (document.documentElement.dataset.forgeAuthRuntime === "ready") {
      void installProvider(shell);
    }
  });
  authObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-forge-auth-runtime"],
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
