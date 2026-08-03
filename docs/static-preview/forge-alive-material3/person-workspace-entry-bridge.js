const BRIDGE_VERSION = "CRS-09-PERSON-WORKSPACE-ENTRY-BRIDGE-002";
const INTELLIGENCE_VERSION = "CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001";
const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const repositoryBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const SELECTORS = Object.freeze({
  pipelineCard: "[data-productive-prospect-card]",
  pipelineActions: "[data-productive-card-actions]",
  personDirectoryCard: '[data-directory-kind="COMMERCIAL_PERSON"][data-directory-reference]',
  contextualHeaders: Object.freeze([
    ["quotes", ".quotes-module__header"],
    ["actividad", ".activity-hero"],
    ["cartera", "#cartera-root > .glass-widget:first-child"],
  ]),
});
const COMMAND_ROUTE_ALIASES = Object.freeze({
  dashboard: "inicio",
  "advisor-sales-pipeline": "pipeline",
  prospeccion: "pipeline",
  referidos: "pipeline",
});

let intelligenceModulePromise;
let commandNavigationBridgePromise;

function ensureStylesheet() {
  if (document.querySelector("[data-person-workspace-entry-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("person-workspace-entry-bridge.css?v=crs-09-001", import.meta.url).href;
  link.dataset.personWorkspaceEntryStyles = "true";
  document.head.append(link);
}

function button({ personReference = null, sourceType = null, sourceReference = null, compact = false } = {}) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `person-workspace-launcher${compact ? " person-workspace-launcher--compact" : ""}`;
  element.textContent = compact ? "Persona" : "Abrir persona";
  element.dataset.personWorkspaceLauncher = "true";
  if (personReference) element.dataset.openPersonWorkspacePerson = personReference;
  if (sourceType && sourceReference) {
    element.dataset.openPersonWorkspaceSource = sourceType;
    element.dataset.openPersonWorkspaceReference = sourceReference;
  }
  return element;
}

function injectPipeline() {
  document.querySelectorAll(SELECTORS.pipelineCard).forEach((card) => {
    const actions = card.querySelector(SELECTORS.pipelineActions);
    const reference = card.dataset.productiveProspectCard;
    if (!actions || !reference || actions.querySelector("[data-person-workspace-launcher]")) return;
    actions.prepend(button({ sourceType: "PROSPECT", sourceReference: reference, compact: true }));
  });
}

function injectCartera() {
  document.querySelectorAll(SELECTORS.personDirectoryCard).forEach((card) => {
    const reference = card.dataset.directoryReference;
    if (!reference || card.querySelector("[data-person-workspace-launcher]")) return;
    card.append(button({ personReference: reference }));
  });
}

function injectContextualHeaders() {
  const url = new URL(window.location.href);
  const personReference = url.searchParams.get("person")?.trim();
  const route = document.querySelector("[data-forge-application]")?.dataset.forgeRoute;
  if (!personReference || route === "persona") return;
  const entry = SELECTORS.contextualHeaders.find(([routeId]) => routeId === route);
  if (!entry) return;
  const header = document.querySelector(entry[1]);
  if (!header || header.querySelector("[data-person-workspace-launcher]")) return;
  header.append(button({ personReference, compact: true }));
}

function reconcileEntries() {
  ensureStylesheet();
  injectPipeline();
  injectCartera();
  injectContextualHeaders();
  document.documentElement.dataset.personWorkspaceEntryBridge = BRIDGE_VERSION;
}

function openPersonWorkspace(detail = {}) {
  globalThis.dispatchEvent(new CustomEvent("forge:open-person-workspace", {
    detail: Object.freeze({ ...detail }),
  }));
}

function openFromTrigger(trigger) {
  const personReference = trigger.dataset.openPersonWorkspacePerson;
  const sourceType = trigger.dataset.openPersonWorkspaceSource;
  const sourceReference = trigger.dataset.openPersonWorkspaceReference;
  const origin = document.querySelector("[data-forge-application]")?.dataset.forgeRoute || "inicio";
  const detail = personReference
    ? { personReference, origin }
    : { sourceIdentity: { type: sourceType, reference: sourceReference }, origin };
  openPersonWorkspace(detail);
}

function normalizeCommandRoute(route) {
  const value = String(route || "").trim();
  return COMMAND_ROUTE_ALIASES[value] || value;
}

function navigateShellRoute(route, params = {}) {
  const normalizedRoute = normalizeCommandRoute(route);
  if (normalizedRoute === "persona") {
    openPersonWorkspace({
      personReference: params.personReference || null,
      sourceIdentity: params.sourceIdentity || null,
      section: params.section || null,
      event: params.event || null,
      record: params.record || null,
      origin: params.origin || document.querySelector("[data-forge-application]")?.dataset.forgeRoute || "inicio",
    });
    return true;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("nav", normalizedRoute);
  window.history.pushState({ forgeRoute: normalizedRoute }, "", url);
  globalThis.dispatchEvent(new PopStateEvent("popstate", {
    state: { forgeRoute: normalizedRoute },
  }));
  return true;
}

function bindCommandNavigationBridge() {
  commandNavigationBridgePromise ||= import(
    new URL("platform/navigation-runtime.js", repositoryBase)
  ).then(({ Navigation }) => {
    Navigation.setNavigator((route, params = {}) => navigateShellRoute(route, params));
    document.documentElement.dataset.commandOsMaterial3NavigationBridge = "ready";
    return Navigation;
  }).catch((error) => {
    commandNavigationBridgePromise = null;
    document.documentElement.dataset.commandOsMaterial3NavigationBridge = "failed";
    console.error("[COMMAND OS MATERIAL3 NAVIGATION BRIDGE]", error);
    throw error;
  });
  return commandNavigationBridgePromise;
}

function loadIntelligenceModule() {
  intelligenceModulePromise ||= import(
    "./person-intelligence-module.js?v=crs-10-001"
  ).catch((error) => {
    intelligenceModulePromise = null;
    throw error;
  });
  return intelligenceModulePromise;
}

async function mountIntelligence(event) {
  const personReference = event?.detail?.personReference;
  const root = document.querySelector("[data-forge-person-workspace-module]");
  if (!personReference || !root) return;
  document.documentElement.dataset.personIntelligenceRuntime = "preparing";
  try {
    const module = await loadIntelligenceModule();
    await module.mountPersonIntelligence({ root, personReference });
  } catch (error) {
    document.documentElement.dataset.personIntelligenceRuntime = "failed";
    console.error("[CRS10 PERSON INTELLIGENCE BRIDGE]", error);
  }
}

async function scrubIntelligence(reason = "route-unmounted") {
  if (!intelligenceModulePromise) {
    document.documentElement.dataset.personIntelligenceRuntime = reason;
    return;
  }
  try {
    const module = await intelligenceModulePromise;
    module.scrubPersonIntelligence(reason);
  } catch {
    document.documentElement.dataset.personIntelligenceRuntime = reason;
  }
}

function reconcileIntelligenceRoute() {
  const route = document.querySelector("[data-forge-application]")?.dataset.forgeRoute;
  if (route !== "persona") void scrubIntelligence("route-unmounted");
}

ensureStylesheet();
void bindCommandNavigationBridge();

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-person-workspace-launcher]");
  if (trigger) {
    event.preventDefault();
    openFromTrigger(trigger);
    return;
  }
  if (event.target.closest("[data-route-id]")) {
    window.setTimeout(() => {
      reconcileEntries();
      reconcileIntelligenceRoute();
    }, 0);
  }
}, true);

const observer = new MutationObserver(() => {
  window.clearTimeout(observer.reconcileTimer);
  observer.reconcileTimer = window.setTimeout(() => {
    reconcileEntries();
    reconcileIntelligenceRoute();
  }, 20);
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["hidden", "data-forge-route", "data-person-reference"],
});

globalThis.addEventListener("popstate", () => {
  reconcileEntries();
  reconcileIntelligenceRoute();
});
globalThis.addEventListener("forge:person-workspace-mounted", (event) => {
  reconcileEntries();
  void mountIntelligence(event);
});
globalThis.addEventListener("forge:auth-state-changed", (event) => {
  const status = String(event.detail?.status || "").toLowerCase();
  if (["anonymous", "auth_error"].includes(status)) void scrubIntelligence("signed-out");
});
queueMicrotask(reconcileEntries);

globalThis.ForgeCrs09PersonWorkspaceEntryBridge = Object.freeze({
  version: BRIDGE_VERSION,
  intelligenceVersion: INTELLIGENCE_VERSION,
  reconcile: reconcileEntries,
  mountIntelligence,
  scrubIntelligence,
  bindCommandNavigationBridge,
  navigateShellRoute,
});

export {
  BRIDGE_VERSION,
  INTELLIGENCE_VERSION,
  reconcileEntries,
  mountIntelligence,
  scrubIntelligence,
  bindCommandNavigationBridge,
  navigateShellRoute,
};
